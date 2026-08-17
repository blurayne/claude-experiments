#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
"""Discover every live product slug on giantmicrobes.com/us and which category
pages (/us/main/<slug>) it's listed under.

Two-pass crawl:
  1. Walk the homepage's megamenu to find every /us/main/<category>(/<sub>)? URL.
  2. Paginate the site-wide `shopall/products/index` listing AND every category
     page found in pass 1, collecting the union of product slugs. Each product's
     `categories` field is every category page it appeared on.

Magento's own listing pagination (`?p=N`) is used throughout; a page is the last
one once it yields zero *new* product links two times in a row.

Writes us_products_raw.json: {slug: {categories: [...], listing_status_hint: str|null}}
"""
import json
import re
import time
import urllib.error
import urllib.request

BASE = "https://www.giantmicrobes.com/us"
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    ),
    "Referer": "https://www.giantmicrobes.com/us/",
}

PRODUCT_RE = re.compile(r'href="https://www\.giantmicrobes\.com/us/products/([a-zA-Z0-9_-]+)\.html"')
CATEGORY_RE = re.compile(r'href="https://www\.giantmicrobes\.com/us/main/([a-zA-Z0-9_/-]+)"')
# Some listing widgets use unquoted hrefs and carry a small thumbnail image right
# alongside the link -- captured as a fallback for the ~1/3 of product pages whose
# own template omits schema.org markup and a scrapeable full-size image (see
# fetch_us_product_details.py / AGENTS.md).
THUMB_RE = re.compile(
    r'href=https://www\.giantmicrobes\.com/us/products/([a-zA-Z0-9_-]+)\.html>'
    r'<img src="(https://www\.giantmicrobes\.com/us/media/catalog/product/[^"]+)"'
)


def fetch(url, retries=5, delay=2):
    req = urllib.request.Request(url, headers=HEADERS)
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=25) as resp:
                return resp.read().decode("utf-8", errors="replace")
        except (urllib.error.URLError, TimeoutError, ConnectionError) as e:
            if attempt == retries - 1:
                print(f"  FAILED {url}: {e}")
                return ""
            time.sleep(delay)


def discover_categories():
    html = fetch(f"{BASE}/")
    cats = sorted(set(CATEGORY_RE.findall(html)))
    print(f"Discovered {len(cats)} category paths from homepage nav")
    return cats


def paginate_listing(list_url, thumbs, max_pages=60):
    """Yield product slugs across a paginated listing URL, stopping once a page
    adds nothing new (checked twice to survive a transient empty page)."""
    seen = set()
    empty_streak = 0
    for page in range(1, max_pages + 1):
        sep = "&" if "?" in list_url else "?"
        url = list_url if page == 1 else f"{list_url}{sep}p={page}"
        html = fetch(url)
        slugs = set(PRODUCT_RE.findall(html))
        for slug, img in THUMB_RE.findall(html):
            thumbs.setdefault(slug, img)
        new = slugs - seen
        if not new:
            empty_streak += 1
            if empty_streak >= 2:
                break
        else:
            empty_streak = 0
            seen |= new
        time.sleep(0.2)
    return seen


def main():
    categories = discover_categories()
    products = {}  # slug -> {"categories": set()}
    thumbs = {}  # slug -> fallback thumbnail image URL

    print("Crawling site-wide shopall listing...")
    for slug in paginate_listing(f"{BASE}/shopall/products/index/", thumbs):
        products.setdefault(slug, {"categories": set()})
    print(f"  {len(products)} slugs from shopall")

    for i, cat in enumerate(categories, 1):
        cat_url = f"{BASE}/main/{cat}"
        slugs = paginate_listing(cat_url, thumbs)
        for slug in slugs:
            products.setdefault(slug, {"categories": set()})["categories"].add(cat)
        print(f"  [{i}/{len(categories)}] /main/{cat}: {len(slugs)} products")

    out = {
        slug: {
            "categories": sorted(info["categories"]),
            "thumb_image_url": thumbs.get(slug),
        }
        for slug, info in products.items()
    }

    with open("us_products_raw.json", "w") as f:
        json.dump(out, f, indent=2, sort_keys=True)

    uncategorized = sum(1 for v in out.values() if not v["categories"])
    has_thumb = sum(1 for v in out.values() if v["thumb_image_url"])
    print(f"\nTotal unique live product slugs: {len(out)}")
    print(f"Slugs with no category match (shopall-only): {uncategorized}")
    print(f"Slugs with a fallback thumbnail captured: {has_thumb}")


if __name__ == "__main__":
    main()
