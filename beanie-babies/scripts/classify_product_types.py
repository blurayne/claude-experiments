#!/usr/bin/env python3
"""Add a `product_type` field to every item in calendar_data.json.gz.

Two-tier classification:
1. Ground truth: fetch ty.com's own catalog listing pages for known product
   lines (beanie-babies, beanie-boos, beanie-bellies, beanie-boos-clips,
   beanie-bouncers) and use their item_no listings directly -- these only
   cover current (in-stock/orderable) items, since ty.com doesn't expose any
   browsing surface for retired products.
2. Keyword fallback: for everything not covered by a catalog listing (all
   2,455 retired items, plus any current items outside those 5 catalogs),
   classify from web_display_name text patterns, defaulting to "Beanie Baby"
   (Ty's original and largest line) when nothing else matches.
"""
import gzip
import json
import re
import time
import urllib.error
import urllib.request

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    ),
    "Referer": "https://www.ty.com/",
}

# slug -> product_type label
CATALOG_CATEGORIES = {
    "beanie-babies": "Beanie Baby",
    "beanie-boos": "Beanie Boo",
    "beanie-bellies": "Beanie Belly",
    "beanie-boos-clips": "Beanie Boo Clip",
    "beanie-bouncers": "Beanie Bouncer",
}

# (compiled regex, category) in priority order -- first match wins.
KEYWORD_RULES = [
    (re.compile(r"\bslipper"), "Slipper"),
    (re.compile(r"\bslides\b"), "Slipper"),
    (re.compile(r"\bteenie beanie"), "Teenie Beanie"),
    (re.compile(r"\bteeny ty\b"), "Teeny Ty"),
    (re.compile(r"\battic treasure"), "Attic Treasure"),
    (re.compile(r"\bpeek-?a-?boo"), "Peek-A-Boo"),
    (re.compile(r"\bhalloweenie"), "Halloweenie Beanie"),
    (re.compile(r"\bbasket beanie"), "Basket Beanie"),
    (re.compile(r"\bpillow pal"), "Pillow Pal"),
    (re.compile(r"\bsquish"), "Squishy Beanie"),
    (re.compile(r"\bkeychain\b"), "Clip/Keychain"),
    (re.compile(r"\bkey clip\b"), "Clip/Keychain"),
    (re.compile(r"\bbackpack clip\b"), "Clip/Keychain"),
    (re.compile(r"\bclip\b"), "Clip/Keychain"),
    (re.compile(r"\bpurse\b"), "Bag/Accessory"),
    (re.compile(r"\bbackpack\b"), "Bag/Accessory"),
    (re.compile(r"\bwristlet\b"), "Bag/Accessory"),
    (re.compile(r"\btote\b"), "Bag/Accessory"),
    (re.compile(r"\bpuffie|\bpuffy\b"), "Puffy/Beanie Ball"),
    (re.compile(r"\breversible sequin|\bsequin"), "Sparkle/Sequin Beanie"),
    (re.compile(r"\bbellies\b|\bbelly\b"), "Beanie Belly"),
    (re.compile(r"\bbouncer"), "Beanie Bouncer"),
    (re.compile(r"\bbeanie boo"), "Beanie Boo"),
    (re.compile(r"\bboo\b"), "Beanie Boo"),
]
DEFAULT_CATEGORY = "Beanie Baby"


def fetch(url, retries=4):
    req = urllib.request.Request(url, headers=HEADERS)
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=25) as resp:
                return resp.read().decode("utf-8", errors="replace")
        except (urllib.error.URLError, TimeoutError, ConnectionError):
            if attempt == retries - 1:
                raise
            time.sleep(2 + attempt)


def fetch_catalog_ground_truth():
    """pid -> product_type, from ty.com's own current-catalog listings."""
    ground_truth = {}
    for slug, category in CATALOG_CATEGORIES.items():
        url = f"https://www.ty.com/catalog/{slug}/?lang=en&sz=300"
        html = fetch(url)
        pids = set(re.findall(r'data-pid="([^"]*)"', html))
        pids.discard("null")
        for pid in pids:
            ground_truth[pid] = category
        print(f"  {slug}: {len(pids)} items")
    return ground_truth


def classify_by_keyword(web_display_name):
    name = web_display_name.lower()
    for pattern, category in KEYWORD_RULES:
        if pattern.search(name):
            return category
    return DEFAULT_CATEGORY


def main():
    print("Fetching catalog ground truth from ty.com...")
    ground_truth = fetch_catalog_ground_truth()
    print(f"Total catalog-confirmed items: {len(ground_truth)}")

    with gzip.open("calendar_data.json.gz", "rt") as f:
        items = json.load(f)

    from_catalog = 0
    from_keyword = 0
    from_default = 0
    for item in items:
        if item["item_no"] in ground_truth:
            item["product_type"] = ground_truth[item["item_no"]]
            from_catalog += 1
        else:
            category = classify_by_keyword(item["web_display_name"])
            item["product_type"] = category
            if category == DEFAULT_CATEGORY:
                from_default += 1
            else:
                from_keyword += 1

    with gzip.open("calendar_data.json.gz", "wt") as f:
        json.dump(items, f, indent=2)

    print(f"\nClassified {len(items)} items:")
    print(f"  from ty.com catalog (ground truth): {from_catalog}")
    print(f"  from keyword rule: {from_keyword}")
    print(f"  fell through to default ({DEFAULT_CATEGORY}): {from_default}")

    from collections import Counter
    counts = Counter(i["product_type"] for i in items)
    print("\nBreakdown by product_type:")
    for cat, n in counts.most_common():
        print(f"  {cat}: {n}")


if __name__ == "__main__":
    main()
