#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
"""Find US products that used to exist on giantmicrobes.com but are delisted today
(404), using the Internet Archive's CDX API as the historical record Magento itself
doesn't keep. For each candidate, fetch the archive.org snapshot closest to when it
was last seen live and try the same structured-data parse used for live pages.

"release date" and "retired" here are best-effort proxies, not facts:
  - first_seen  = earliest Wayback capture timestamp of the product URL
  - last_seen   = latest Wayback capture timestamp with HTTP 200
Both are bounded by Wayback's own crawl coverage, not the product's real lifecycle,
and are stored as approximate. See AGENTS.md.

Writes retired_candidates.json: list of {slug, first_seen, last_seen, snapshot_url,
parsed (record or null), raw_snippet (fallback text if parsing failed)}.
"""
import json
import re
import subprocess
from concurrent.futures import ThreadPoolExecutor, as_completed

CDX_URL = (
    "https://web.archive.org/cdx/search/cdx"
    "?url=giantmicrobes.com/us/products/&matchType=prefix"
    "&output=json&fl=original,timestamp,statuscode&filter=statuscode:200&limit=20000"
)
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    )
}
SLUG_RE = re.compile(r"/us/products/([a-zA-Z0-9_-]+)\.html", re.I)
JSONLD_RE = re.compile(
    r'<script type="application/ld\+json">\s*(\{.*?"@type":\s*"Product".*?\})\s*</script>',
    re.S,
)
META_DESC_RE = re.compile(r'<meta name="description" content="([^"]*)"')
OG_TITLE_RE = re.compile(r'<meta property="og:title" content="([^"]*)"')
TITLE_TAG_RE = re.compile(r"<title>([^<]*)</title>")
FIRST_IMG_RE = re.compile(r'src="(https?://[^"]*giantmicrobes\.com/(?:us/)?media/catalog/product/[^"]*)"')


def fetch(url, retries=3, hard_timeout=20):
    """GET with a real wall-clock deadline via curl --max-time.

    archive.org occasionally trickles bytes slowly enough that urllib's own
    per-read inactivity timeout never fires, hanging a request far past its
    nominal timeout (observed: a handful of stragglers blocking
    ThreadPoolExecutor shutdown for 20+ minutes, even with a daemon-thread
    workaround, since the underlying socket read itself never returns). curl's
    --max-time is an actual deadline on the whole transfer, not just gaps
    between reads, so a stalled connection dies on schedule every time.
    """
    for attempt in range(retries):
        try:
            result = subprocess.run(
                ["curl", "-s", "--max-time", str(hard_timeout), "-A", HEADERS["User-Agent"], url],
                capture_output=True,
                timeout=hard_timeout + 5,
            )
            if result.returncode == 0 and result.stdout:
                return result.stdout.decode("utf-8", errors="replace")
        except subprocess.TimeoutExpired:
            pass
        if attempt < retries - 1:
            continue
    return None


def load_cdx():
    print("Querying Internet Archive CDX API for historical /us/products/ URLs...")
    raw = fetch(CDX_URL)
    data = json.loads(raw)
    rows = data[1:] if data else []
    by_slug = {}
    for original, ts, _code in rows:
        m = SLUG_RE.search(original)
        if not m:
            continue
        slug = m.group(1).lower()
        by_slug.setdefault(slug, []).append(ts)
    return by_slug


def parse_jsonld(html):
    m = JSONLD_RE.search(html)
    if not m:
        return None
    try:
        data = json.loads(m.group(1))
    except json.JSONDecodeError:
        return None
    offers = data.get("offers", {}) or {}
    return {
        "name": data.get("name", ""),
        "sku": data.get("sku", ""),
        "price": offers.get("price"),
        "currency": offers.get("priceCurrency", "USD"),
        "image_url": data.get("image", ""),
        "parse_method": "jsonld",
    }


def parse_fallback(html):
    title = OG_TITLE_RE.search(html) or TITLE_TAG_RE.search(html)
    desc = META_DESC_RE.search(html)
    img = FIRST_IMG_RE.search(html)
    if not title:
        return None
    name = re.sub(r"\s*[|–-]\s*(GIANTmicrobes|GiantMicrobes).*$", "", title.group(1)).strip()
    return {
        "name": name,
        "sku": "",
        "price": None,
        "currency": "USD",
        "image_url": img.group(1) if img else "",
        "description": desc.group(1) if desc else "",
        "parse_method": "fallback_meta",
    }


def strip_tags(html, limit=4000):
    text = re.sub(r"<script.*?</script>|<style.*?</style>", " ", html, flags=re.S)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text[:limit]


def process_slug(slug, timestamps):
    first_seen, last_seen = min(timestamps), max(timestamps)
    original_url = f"https://www.giantmicrobes.com/us/products/{slug}.html"
    snapshot_url = f"https://web.archive.org/web/{last_seen}id_/{original_url}"
    html = fetch(snapshot_url)
    record = {
        "slug": slug,
        "first_seen": first_seen,
        "last_seen": last_seen,
        "snapshot_url": snapshot_url,
        "date_confidence": "approximate",
    }
    if not html:
        record["parsed"] = None
        record["raw_snippet"] = None
        return record

    parsed = parse_jsonld(html) or parse_fallback(html)
    record["parsed"] = parsed
    desc_m = META_DESC_RE.search(html)
    if parsed and "description" not in parsed and desc_m:
        parsed["description"] = desc_m.group(1)
    record["raw_snippet"] = None if parsed else strip_tags(html)
    return record


def main():
    with open("us_products_raw.json") as f:
        live_slugs = set(json.load(f).keys())

    by_slug = load_cdx()
    print(f"CDX returned {len(by_slug)} distinct historical product slugs")

    retired_slugs = sorted(set(by_slug) - live_slugs)
    print(f"Candidate retired slugs (historical minus currently-live): {len(retired_slugs)}")

    records = []
    with ThreadPoolExecutor(max_workers=4) as pool:
        futures = {
            pool.submit(process_slug, slug, by_slug[slug]): slug for slug in retired_slugs
        }
        done = 0
        for fut in as_completed(futures):
            records.append(fut.result())
            done += 1
            if done % 50 == 0:
                print(f"  {done}/{len(retired_slugs)} snapshots processed")

    records.sort(key=lambda r: r["slug"])
    with open("retired_candidates.json", "w") as f:
        json.dump(records, f, indent=2)

    parsed_ok = sum(1 for r in records if r["parsed"])
    needs_agent = sum(1 for r in records if r["raw_snippet"])
    dead = sum(1 for r in records if r["parsed"] is None and r["raw_snippet"] is None)
    print(f"\nTotal candidates: {len(records)}")
    print(f"  Parsed deterministically: {parsed_ok}")
    print(f"  Needs fallback extraction (has raw_snippet): {needs_agent}")
    print(f"  Unrecoverable (snapshot fetch failed): {dead}")


if __name__ == "__main__":
    main()
