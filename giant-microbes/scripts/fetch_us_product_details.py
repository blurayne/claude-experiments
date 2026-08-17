#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
"""Fetch every US product page listed in us_products_raw.json and extract its
structured details from the page's schema.org Product JSON-LD block plus the
`<meta name="description">` marketing blurb.

About a third of slugs (mostly keychains/stickers/ornaments/gift-boxes/deluxe-packs
-- accessory-line templates, not the core plush template) don't emit the JSON-LD
block or a scrapeable full-size gallery image at all -- discovered by diffing a
successful page (ecoli.html, small, has JSON-LD) against a failing one
(chocolate.html, 800KB+ of unrelated cross-sell markup, no JSON-LD, no gallery image
markup of any kind). For those, fall back to <title>/meta description for
name/description, "Out of stock" text presence for availability, and the small
listing-page thumbnail (thumb_image_url, captured by fetch_us_catalog_list.py) for
an image -- lower resolution than the JSON-LD path's image, but present.

Writes us_products_detailed.json: list of records with slug, name, sku, price,
currency, availability (in_stock/out_of_stock), description, image_url,
image_is_fallback_thumb, categories (carried over from us_products_raw.json).
"""
import json
import re
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

BASE = "https://www.giantmicrobes.com/us"
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    ),
    "Referer": "https://www.giantmicrobes.com/us/",
}

JSONLD_RE = re.compile(
    r'<script type="application/ld\+json">\s*(\{.*?"@type":\s*"Product".*?\})\s*</script>',
    re.S,
)
META_DESC_RE = re.compile(r'<meta name="description" content="([^"]*)"')
TITLE_RE = re.compile(r"<title>([^<]*)</title>")
OUT_OF_STOCK_RE = re.compile(r"Out of stock", re.I)
CACHE_PATH_RE = re.compile(r"/media/catalog/product/cache/[^/]+/")


def unescape(s):
    return (
        s.replace("&amp;", "&")
        .replace("&#039;", "'")
        .replace("&quot;", '"')
        .replace("&#x20;", " ")
    )


def fetch(url, retries=5, delay=2):
    req = urllib.request.Request(url, headers=HEADERS)
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=25) as resp:
                return resp.read().decode("utf-8", errors="replace")
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return None
            if attempt == retries - 1:
                raise
            time.sleep(delay)
        except (urllib.error.URLError, TimeoutError, ConnectionError):
            if attempt == retries - 1:
                raise
            time.sleep(delay)


def parse_jsonld(html):
    m = JSONLD_RE.search(html)
    if not m:
        return None
    try:
        data = json.loads(m.group(1))
    except json.JSONDecodeError:
        return None

    offers = data.get("offers", {}) or {}
    availability_url = offers.get("availability", "")
    availability = "in_stock" if availability_url.endswith("InStock") else (
        "out_of_stock" if availability_url.endswith("OutOfStock") else "unknown"
    )

    return {
        "name": unescape(data.get("name", "")),
        "sku": data.get("sku", ""),
        "price": offers.get("price"),
        "currency": offers.get("priceCurrency", "USD"),
        "availability": availability,
        "image_url": data.get("image", ""),
        "image_is_fallback_thumb": False,
    }


def parse_fallback(html, thumb_image_url):
    title_m = TITLE_RE.search(html)
    if not title_m:
        return None
    name = unescape(re.sub(r"\s*[-|]\s*GIANTmicrobes.*$", "", title_m.group(1)).strip())
    availability = "out_of_stock" if OUT_OF_STOCK_RE.search(html) else "in_stock"
    image_url = CACHE_PATH_RE.sub("/media/catalog/product/", thumb_image_url) if thumb_image_url else ""
    return {
        "name": name,
        "sku": "",
        "price": None,
        "currency": "USD",
        "availability": availability,
        "image_url": image_url,
        "image_is_fallback_thumb": True,
    }


def parse_product(slug, categories, thumb_image_url, html):
    core = parse_jsonld(html) or parse_fallback(html, thumb_image_url)
    if core is None:
        return None

    desc_m = META_DESC_RE.search(html)
    description = unescape(desc_m.group(1)) if desc_m else ""

    return {
        "slug": slug,
        "description": description,
        "categories": categories,
        "product_url": f"{BASE}/products/{slug}.html",
        **core,
    }


def fetch_one(slug, categories, thumb_image_url):
    html = fetch(f"{BASE}/products/{slug}.html")
    if html is None:
        return slug, None  # 404 -> disappeared between list & detail fetch
    record = parse_product(slug, categories, thumb_image_url, html)
    return slug, record


def main():
    with open("us_products_raw.json") as f:
        raw = json.load(f)

    print(f"Fetching details for {len(raw)} product pages...")
    records = []
    failures = []
    with ThreadPoolExecutor(max_workers=8) as pool:
        futures = {
            pool.submit(fetch_one, slug, info["categories"], info.get("thumb_image_url")): slug
            for slug, info in raw.items()
        }
        done = 0
        for fut in as_completed(futures):
            slug = futures[fut]
            try:
                _, record = fut.result()
                if record is None:
                    failures.append(slug)
                else:
                    records.append(record)
            except Exception as e:
                failures.append(slug)
                print(f"  FAILED {slug}: {e}")
            done += 1
            if done % 50 == 0:
                print(f"  {done}/{len(raw)} done ({len(failures)} failures so far)")

    records.sort(key=lambda r: r["slug"])
    with open("us_products_detailed.json", "w") as f:
        json.dump(records, f, indent=2)

    in_stock = sum(1 for r in records if r["availability"] == "in_stock")
    oos = sum(1 for r in records if r["availability"] == "out_of_stock")
    fallback = sum(1 for r in records if r["image_is_fallback_thumb"])
    no_image = sum(1 for r in records if not r["image_url"])
    print(f"\nTotal parsed: {len(records)} (in_stock={in_stock}, out_of_stock={oos})")
    print(f"Used fallback (title/meta) parsing: {fallback}, still missing an image: {no_image}")
    if failures:
        print(f"Failed/404 slugs ({len(failures)}): {failures}")


if __name__ == "__main__":
    main()
