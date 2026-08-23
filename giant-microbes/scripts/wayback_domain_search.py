#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = ["pillow", "numpy"]
# ///
"""Recover product photos for retired items via a domain-wide Wayback CDX search.

For the 51 items that survived every earlier pass (US thumbnail rescue, DuckDuckGo/
Bing image search, the licensee Shopify feeds) with no photo at all, the one
technique that hadn't been tried directly in this script set is the one that
actually worked in an earlier parallel run: query the Internet Archive's CDX API
for the *whole domain*, filtered by a regex on the URL key, instead of guessing
exact paths one at a time.

  https://web.archive.org/cdx/search/cdx?url=giantmicrobes.com&matchType=domain
    &filter=urlkey:.*<stem>.*&output=json&fl=original,timestamp,statuscode,length

One request surfaces every historical capture across every storefront locale
(`/us/`, `/uk/`, `/es/`, `/ca/`...) and every Magento rendition (`cache/<hash>/`,
`small_image/`, `thumbnail/`), which is far more than sequential exact-path guesses
turn up. Sorting by `length` and trying the largest captures first finds the
gallery image rather than a 2KB category thumbnail.

Every candidate still goes through the same placeholder filter as a live fetch --
archive.org has the shop's own not-found group-shot archived too, under at least
one slug, so provenance from Wayback is not a substitute for the check.

This only proposes. `download_candidates.py`-style staging happens inline here
(candidates are small in number), a contact sheet is for a human to look at next,
and `adopt_images.py` is the only step that writes into `images/` and the catalog.

Usage:
  uv run scripts/wayback_domain_search.py --out wayback_recovery.json
  uv run scripts/wayback_domain_search.py --slugs brain-necklace,heart-mug
"""

import argparse
import gzip
import hashlib
import json
import os
import re
import subprocess
import sys
import tempfile
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gm_imgutil import PlaceholderFilter, measure     # noqa: E402

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CATALOG = os.path.join(HERE, "merged_catalog.json")
STAGE = os.path.join(HERE, "images_candidates", "wayback")

CDX_URL = "https://web.archive.org/cdx/search/cdx"
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36")
IMAGE_EXT = re.compile(r"\.(jpe?g|png|gif|webp)(?:$|\?)", re.I)
# Wayback rewrites bare captures through a redirect chain; `id_` asks for the
# unmodified original bytes, same as discover_retired_products.py's page fetches.
MIN_BYTES = 3000
MIN_EDGE = 200
PER_ITEM = 6


def curl(url, dest=None, timeout=25, retries=2):
    """curl with a real wall-clock deadline -- see AGENTS.md: urllib's
    inactivity timeout never fires against archive.org's occasional trickle."""
    args = ["curl", "-s", "-L", "--max-time", str(timeout), "-A", UA]
    args += (["-o", dest] if dest else []) + [url]
    for attempt in range(retries):
        r = subprocess.run(args, capture_output=True)   # always bytes -- see below
        if dest:
            if r.returncode == 0 and os.path.exists(dest) and os.path.getsize(dest) > 0:
                return True
        elif r.returncode == 0 and r.stdout:
            # archive.org occasionally serves a page gzip-encoded without
            # actually decoding it first (AGENTS.md); `curl` doesn't
            # transparently gunzip on its own the way a browser would, so a
            # raw utf-8 decode of that response blows up on the gzip magic
            # bytes. Text mode would have masked this as mojibake instead of
            # a crash; decode explicitly so a gzip body can be caught first.
            body = r.stdout
            if body[:2] == b"\x1f\x8b":
                try:
                    body = gzip.decompress(body)
                except OSError:
                    pass
            return body.decode("utf-8", errors="replace")
        time.sleep(1.5)
    return False if dest else None


def stems_for(item):
    """A slug and, where it differs meaningfully, a second guess from the name."""
    out = [item["slug_us"]]
    name = re.sub(r"[^a-z0-9]+", "-", (item.get("name") or "").lower()).strip("-")
    # Long/short variants both help: "brain-necklace" and, say, "necklace" alone
    # would be too broad, so only add the name-derived stem if it shares a
    # meaningful prefix with the slug (guards against name/slug drift).
    if name and name != item["slug_us"] and (name.startswith(out[0][:6]) or out[0].startswith(name[:6])):
        out.append(name)
    return out


def cdx_query(stem):
    url = (f"{CDX_URL}?url=giantmicrobes.com&matchType=domain"
           f"&filter=urlkey:.*{re.escape(stem)}.*"
           f"&output=json&fl=original,timestamp,statuscode,length&limit=300")
    raw = curl(url)
    if not raw:
        return []
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        return []
    return data[1:] if data else []


def image_candidates(rows):
    seen, out = set(), []
    for original, ts, status, length in rows:
        if status != "200" or not IMAGE_EXT.search(original):
            continue
        if original in seen:
            continue
        seen.add(original)
        out.append((original, ts, int(length or 0)))
    out.sort(key=lambda r: -r[2])
    return out


PAGE_JSONLD_IMG = re.compile(r'"image":\s*"([^"]+)"')
PAGE_OG_IMG = re.compile(r'<meta property="og:image"\s*\n?\s*content="([^"]+)"')
PAGE_GALLERY_IMG = re.compile(r'<img id="image-\d+"\s*\n?\s*src="([^"]+)"')


def page_candidates(product_url):
    """Fetch the best-preserved archived product page and pull its own image
    URLs out of the markup, rather than guessing filenames from the slug.

    This exists because of a naming mismatch the domain-regex search cannot
    see past: a bundle/box SKU's product page is `covid-ornaments-pack.html`,
    but its actual gallery images are `covid-gold-tree_2.jpg` and
    `vaccine-tree_2.jpg` -- filenames that share no substring with the slug at
    all. og:image, the JSON-LD `image` field, and the `id="image-N"` gallery
    tags are the page's own account of which files are its product photos,
    which sidesteps the naming problem entirely.
    """
    rows = cdx_query_url(product_url)
    pages = [(ts, int(length or 0)) for orig, ts, status, length in rows
             if status == "200" and orig.rstrip("/").endswith(".html")]
    if not pages:
        return []
    pages.sort(key=lambda p: -p[1])
    ts = pages[0][0]
    html = curl(f"https://web.archive.org/web/{ts}id_/{product_url}", timeout=25)
    if not html:
        return []
    urls = []
    for pattern in (PAGE_JSONLD_IMG, PAGE_OG_IMG, PAGE_GALLERY_IMG):
        urls += pattern.findall(html)
    urls = [u.replace("\\/", "/") for u in urls]
    seen = set()
    stems = set()
    for u in urls:
        if not IMAGE_EXT.search(u):
            continue
        # A page's own asset URLs are rarely captured at exactly the page's own
        # timestamp -- id_ needs an exact (url, timestamp) hit, no fuzzy
        # matching -- so this looks up each *original filename's* own capture
        # history instead of reusing the page's timestamp. Decache first: the
        # embedded URL is usually a `cache/<hash>/` rendition, and the bare
        # sharded filename is both more likely archived on its own and more
        # likely to be the larger original.
        base = os.path.basename(u.split("?")[0])
        if len(base) < 2 or base in seen:
            continue
        seen.add(base)
        stems.add(base)

    out = []
    for base in stems:
        rows = cdx_query(base)
        time.sleep(0.4)
        for original, cts, status, length in rows:
            if status == "200" and IMAGE_EXT.search(original) and base in original:
                out.append((original, cts, int(length or 0)))
    seen_url = set()
    deduped = []
    for original, cts, length in sorted(out, key=lambda r: -r[2]):
        if original in seen_url:
            continue
        seen_url.add(original)
        deduped.append((original, cts))
    return deduped


def cdx_query_url(url):
    q = (f"{CDX_URL}?url={url}&output=json&fl=original,timestamp,statuscode,length&limit=50")
    raw = curl(q)
    if not raw:
        return []
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        return []
    return data[1:] if data else []


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=os.path.join(HERE, "wayback_recovery.json"))
    ap.add_argument("--slugs", help="comma-separated subset; default = every item with no photo")
    ap.add_argument("--per-item", type=int, default=PER_ITEM)
    ap.add_argument("--sleep", type=float, default=0.8)
    args = ap.parse_args()

    catalog = json.load(open(CATALOG))
    if args.slugs:
        want = {s.strip() for s in args.slugs.split(",")}
        items = [i for i in catalog if i.get("slug_us") in want]
    else:
        items = [i for i in catalog if i.get("slug_us") and not i.get("image_file")]

    os.makedirs(STAGE, exist_ok=True)
    placeholder = PlaceholderFilter()
    results = {}

    for n, item in enumerate(items, 1):
        slug = item["slug_us"]
        rows = []
        for stem in stems_for(item):
            rows.extend(cdx_query(stem))
            time.sleep(args.sleep)
        cands = image_candidates(rows)
        via_page = False

        # The stem regex only finds images whose filename shares text with the
        # slug. Bundle/gift-set SKUs routinely don't -- their gallery images
        # are named after the characters inside the box, not the box's own
        # slug -- so fall back to reading the archived page's own og:image /
        # JSON-LD / gallery tags.
        if not cands and item.get("product_url_us"):
            page_urls = page_candidates(item["product_url_us"])
            time.sleep(args.sleep)
            cands = [(u, ts, 0) for u, ts in page_urls]
            via_page = True

        found = []
        for original, ts, length in cands[: args.per_item * 2]:
            wb_url = f"https://web.archive.org/web/{ts}id_/{original}"
            # Distinct source URLs sharing one Wayback crawl often share a
            # timestamp too (three cache renditions captured in the same
            # pass), so `slug__ts` alone collides -- a later candidate at the
            # same dest, rejected and unlinked, could delete the file an
            # earlier *accepted* candidate is still pointing to. A short hash
            # of the source URL keeps every candidate's file distinct.
            url_tag = hashlib.md5(original.encode()).hexdigest()[:8]
            dest = os.path.join(STAGE, f"{slug}__{ts}_{url_tag}{os.path.splitext(original)[1] or '.jpg'}")
            if not curl(wb_url, dest, timeout=25):
                continue
            time.sleep(args.sleep)
            if os.path.getsize(dest) < MIN_BYTES:
                os.unlink(dest)
                continue
            bad, why = placeholder.is_placeholder(dest)
            if bad:
                os.unlink(dest)
                continue
            try:
                m = measure(dest)
            except Exception:                           # noqa: BLE001
                os.unlink(dest)
                continue
            if max(m["w"], m["h"]) < MIN_EDGE:
                os.unlink(dest)
                continue
            found.append({"slug": slug, "path": dest, "source_url": original,
                          "source_page": f"https://web.archive.org/web/{ts}/{original}",
                          "timestamp": ts, "via_page": via_page, **m})
            if len(found) >= args.per_item:
                break

        results[slug] = found
        status = f"{len(found)} candidate(s)" if found else "nothing usable"
        src_note = " (via archived page)" if via_page else ""
        print(f"[{n}/{len(items)}] {slug}: {len(cands)} image URLs seen{src_note}, {status}", flush=True)
        json.dump(results, open(args.out, "w"), indent=1, ensure_ascii=False)

    total = sum(len(v) for v in results.values())
    hit = sum(1 for v in results.values() if v)
    print(f"\n{total} candidates across {hit}/{len(items)} items")
    print(f"staged under {STAGE}/ -> wrote {args.out}")


if __name__ == "__main__":
    main()
