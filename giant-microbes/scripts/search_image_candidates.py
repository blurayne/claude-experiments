#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
"""Search the open web for product photos of catalog items that have none.

Every remaining item without an image is retired: the US shop 404s it and the
Wayback Machine has no usable capture of its photo, which is where the earlier
recovery passes gave up. What *does* still carry these photos is the long tail of
resellers, marketplaces and museum shops -- Amazon, eBay/picclick, Shopify stores
like giantmicrobes.com.au, university bookstores. Image search finds them.

Two backends, queried in order and merged: DuckDuckGo's i.js (returns real pixel
dimensions, which is the cheapest useful quality filter) and Bing's async image
endpoint (no token dance, good coverage when DDG rate-limits). Neither is an API
with a contract, so both are treated as best-effort.

Nothing here decides what is *correct* -- it only proposes. Candidates go through
verify_candidates.py (placeholder detection) and a human/vision pass over contact
sheets before any of them reaches the catalog.

Usage:
  uv run scripts/search_image_candidates.py --out image_search_candidates.json
  uv run scripts/search_image_candidates.py --slugs angry-brain-cell,brain-necklace
"""

import argparse
import json
import os
import random
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CATALOG = os.path.join(HERE, "merged_catalog.json")

UA = ("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) "
      "Chrome/122.0.0.0 Safari/537.36")
MIN_EDGE = 400          # anything smaller is a thumbnail, not a re-source
PER_ITEM = 8            # candidates kept per item

# Hosts that never yield a usable product photo: search-engine caches (redirect
# blobs, not files), social embeds, and video sites.
HOST_DENY = re.compile(
    r"(tse\d?\.mm\.bing\.net|encrypted-tbn\d?\.gstatic\.com|lookaside\.fbsbx|"
    r"youtube\.com|ytimg\.com|pinimg\.com/\d+x/|tiktok)", re.I)


def get(url, extra=None, timeout=25):
    headers = {"User-Agent": UA, "Accept-Language": "en-US,en;q=0.9"}
    headers.update(extra or {})
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read()


class DuckDuckGo:
    """i.js image search. Needs a per-session `vqd` token scraped from the HTML."""

    name = "ddg"

    def __init__(self):
        self.vqd = {}

    def _token(self, query):
        if query in self.vqd:
            return self.vqd[query]
        html = get("https://duckduckgo.com/?" + urllib.parse.urlencode(
            {"q": query, "iax": "images", "ia": "images"})).decode("utf-8", "replace")
        m = re.search(r'vqd=["\']?([\d-]+)', html)
        self.vqd[query] = m.group(1) if m else None
        return self.vqd[query]

    def search(self, query):
        vqd = self._token(query)
        if not vqd:
            return []
        url = "https://duckduckgo.com/i.js?" + urllib.parse.urlencode(
            {"l": "us-en", "o": "json", "q": query, "vqd": vqd, "f": ",,,", "p": "1"})
        data = json.loads(get(url, {"Referer": "https://duckduckgo.com/"}).decode())
        out = []
        for r in data.get("results", []):
            out.append({
                "url": r.get("image", ""),
                "width": int(r.get("width") or 0),
                "height": int(r.get("height") or 0),
                "title": (r.get("title") or "")[:200],
                "page": r.get("url", ""),
                "source": "ddg",
            })
        return out


class Bing:
    """The async endpoint the image grid lazy-loads; `murl` is the full-size file."""

    name = "bing"

    def search(self, query):
        html = get("https://www.bing.com/images/async?" + urllib.parse.urlencode(
            {"q": query, "first": "1", "count": "35"})).decode("utf-8", "replace")
        out = []
        for blob in re.findall(r'm="({.*?})"', html):
            try:
                meta = json.loads(blob.replace("&quot;", '"'))
            except json.JSONDecodeError:
                continue
            if not meta.get("murl"):
                continue
            out.append({
                "url": meta["murl"],
                "width": 0, "height": 0,       # Bing doesn't give them here
                "title": (meta.get("t") or "")[:200],
                "page": meta.get("purl", ""),
                "source": "bing",
            })
        return out


def queries_for(item):
    """Two shots per item: the exact product name, then a looser variant.

    Names in this catalog carry SEO tails ("Angry Brain Cell - Vinyl Key Chain");
    the tail helps a search engine disambiguate keychain-vs-plush, so the first
    query keeps it and the second drops it in case it was never in any listing.
    """
    name = (item.get("name") or "").strip()
    base = re.split(r"\s+[-–—]\s+", name)[0].strip()
    ptype = (item.get("product_type") or "").strip()
    qs = [f'giantmicrobes "{name}"']
    if base and base.lower() != name.lower():
        qs.append(f'giant microbes {base} {ptype} plush')
    else:
        qs.append(f'giant microbes {name} plush toy')
    return qs


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=os.path.join(HERE, "image_search_candidates.json"))
    ap.add_argument("--slugs", help="comma-separated slugs; default = every item with no image")
    ap.add_argument("--limit", type=int, default=0, help="stop after N items (smoke test)")
    ap.add_argument("--sleep", type=float, default=1.2, help="pause between queries")
    args = ap.parse_args()

    catalog = json.load(open(CATALOG))
    if args.slugs:
        wanted = {s.strip() for s in args.slugs.split(",") if s.strip()}
        items = [i for i in catalog if (i.get("slug_us") or "") in wanted]
    else:
        items = [i for i in catalog if not i.get("image_file")]
    if args.limit:
        items = items[:args.limit]

    engines = [DuckDuckGo(), Bing()]
    results = {}
    # Resume: keep whatever a previous (possibly rate-limited) run already found.
    if os.path.exists(args.out):
        results = json.load(open(args.out))

    for n, item in enumerate(items, 1):
        slug = item.get("slug_us") or item.get("name")
        if results.get(slug):
            continue
        found, seen = [], set()
        for query in queries_for(item):
            for engine in engines:
                try:
                    hits = engine.search(query)
                except (urllib.error.URLError, urllib.error.HTTPError, ValueError, TimeoutError) as exc:
                    print(f"  !! {engine.name} {slug}: {exc}", file=sys.stderr)
                    continue
                for hit in hits:
                    url = hit["url"]
                    if not url.startswith("http") or url in seen or HOST_DENY.search(url):
                        continue
                    if hit["width"] and max(hit["width"], hit["height"]) < MIN_EDGE:
                        continue
                    seen.add(url)
                    hit["query"] = query
                    found.append(hit)
                time.sleep(args.sleep + random.uniform(0, 0.6))
            if len(found) >= PER_ITEM * 2:
                break
        # Bigger first: DDG-measured pixels win, unknown sizes sort after.
        found.sort(key=lambda h: -(h["width"] * h["height"]))
        results[slug] = found[:PER_ITEM]
        print(f"[{n}/{len(items)}] {slug}: {len(results[slug])} candidates", flush=True)
        json.dump(results, open(args.out, "w"), indent=1, ensure_ascii=False)

    total = sum(len(v) for v in results.values())
    empty = [k for k, v in results.items() if not v]
    print(f"\n{total} candidates for {len(results)} items; {len(empty)} came back empty")
    if empty:
        print("  empty: " + ", ".join(empty[:20]) + (" ..." if len(empty) > 20 else ""))
    print(f"wrote {args.out}")


if __name__ == "__main__":
    main()
