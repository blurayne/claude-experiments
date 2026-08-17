#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
"""Fetch and parse the DE catalog from riesenmikroben.de.

Discovery note (see AGENTS.md for the full story): riesenmikroben.de looks like a
client-rendered SPA at a glance (curl on `/` or `/products` without a session looked
like an empty app shell), but it's actually server-rendered — the *entire* catalog
(current + archived) is embedded as plain HTML in the homepage in one request, with
CSS classes doing client-side show/hide filtering instead of separate API calls per
category. The sidebar's `data-filter='<code>' data-id='<n>'` links give the code ->
label mapping used below, discovered straight from that markup:

  s=Bestseller, n=Neue Artikel, c1=Health, c2=Maladies, c3=Probiotics, c4=Venereals,
  c5=Humanities, c6=Little Creatures, c7=Little Critters, ff=Fuzzy Fossils,
  b=Geschenkboxen & Andere, r=RIESENmikroben (standard line), x=XL-Mikroben,
  k=Schluesselanhaenger (keychains), ar=Archiv (retired/discontinued -- DE's own
  archive section, so no Wayback guesswork needed for DE retirements).

Per-item price is only present for currently orderable items (blank for `ar` items).
This script also does a lightweight per-product detail fetch for the short
description + confirmed "Sofort lieferbar" stock line, mirroring the US pipeline.

Writes de_products_raw.json (from the homepage) and de_products_detailed.json
(with description/stock added).
"""
import json
import re
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

BASE = "https://www.riesenmikroben.de"
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    ),
    "Referer": f"{BASE}/",
}

FILTER_LABELS = {
    "s": "Bestseller",
    "n": "Neue Artikel",
    "c1": "Health",
    "c2": "Maladies",
    "c3": "Probiotics",
    "c4": "Venereals",
    "c5": "Humanities",
    "c6": "Little Creatures",
    "c7": "Little Critters",
    "ff": "Fuzzy Fossils",
    "b": "Geschenkboxen & Andere",
    "r": "RIESENmikroben",
    "x": "XL-Mikroben",
    "k": "Schluesselanhaenger",
}

ITEM_SPLIT_RE = re.compile(r"(?=<div class='item [^']*' id='var\d+')")
HEADER_RE = re.compile(r"<div class='item ([^']*)' id='var(\d+)' style='display: (\w+)'>")
HREF_RE = re.compile(r"href='(/products/[a-z0-9_-]+)\?locale=de'")
IMG_RE = re.compile(r"data-src='([^']*)'")
NAME_RE = re.compile(r"<div class='name'>\s*<a[^>]*>\s*([^<]+?)\s*</a>")
SUB_RE = re.compile(r"<div class='sub'>\(([^)]*)\)</div>")
PRICE_RE = re.compile(r"<span class='amount'>\s*([^<]*?)\s*</span>")

DESC_RE = re.compile(
    r"<div class='item-description'>\s*<p>\s*(.*?)\s*</p>", re.S
)
STOCK_RE = re.compile(r"(Sofort lieferbar|Derzeit nicht verfügbar|Ausverkauft)")
SIZE_RE = re.compile(r"Länge:\s*ca\.\s*([0-9.,]+\s*cm)")


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


def parse_homepage(html):
    chunks = [c for c in ITEM_SPLIT_RE.split(html) if c.startswith("<div class='item ")]
    records = []
    for chunk in chunks:
        h = HEADER_RE.match(chunk)
        if not h:
            continue
        classes = h.group(1).split()
        href = HREF_RE.search(chunk)
        name = NAME_RE.search(chunk)
        if not (href and name):
            continue
        sub = SUB_RE.search(chunk)
        img = IMG_RE.search(chunk)
        price = PRICE_RE.search(chunk)
        records.append({
            "slug": href.group(1).rsplit("/", 1)[-1],
            "var_id": h.group(2),
            "name_de": name.group(1).strip(),
            "species": sub.group(1).strip() if sub else "",
            "image_url": img.group(1) if img else "",
            "price": price.group(1).strip() if price else None,
            "currency": "EUR",
            "categories": sorted({FILTER_LABELS[c] for c in classes if c in FILTER_LABELS}),
            "status": "retired" if "ar" in classes else (
                "in_stock" if price and price.group(1).strip() else "out_of_stock"
            ),
            "product_url": f"{BASE}/products/{href.group(1).rsplit('/', 1)[-1]}?locale=de",
        })
    return records


def fetch_detail(record):
    html = fetch(record["product_url"])
    if html is None:
        return record
    desc_m = DESC_RE.search(html)
    if desc_m:
        record["description_de"] = re.sub(r"<[^>]+>", " ", desc_m.group(1)).strip()
    size_m = SIZE_RE.search(html)
    if size_m:
        record["size"] = size_m.group(1)
    stock_m = STOCK_RE.search(html)
    if stock_m and record["status"] != "retired":
        record["status"] = "in_stock" if stock_m.group(1) == "Sofort lieferbar" else "out_of_stock"
    return record


def main():
    print("Fetching riesenmikroben.de homepage (full catalog embedded server-side)...")
    html = fetch(f"{BASE}/")
    records = parse_homepage(html)
    print(f"Parsed {len(records)} DE items "
          f"(retired={sum(1 for r in records if r['status'] == 'retired')})")

    with open("de_products_raw.json", "w") as f:
        json.dump(records, f, indent=2, ensure_ascii=False)

    print("Fetching per-item detail pages for description/size/stock...")
    detailed = []
    with ThreadPoolExecutor(max_workers=8) as pool:
        futures = {pool.submit(fetch_detail, r): r["slug"] for r in records}
        done = 0
        for fut in as_completed(futures):
            detailed.append(fut.result())
            done += 1
            if done % 50 == 0:
                print(f"  {done}/{len(records)} done")

    detailed.sort(key=lambda r: r["slug"])
    with open("de_products_detailed.json", "w") as f:
        json.dump(detailed, f, indent=2, ensure_ascii=False)

    in_stock = sum(1 for r in detailed if r["status"] == "in_stock")
    oos = sum(1 for r in detailed if r["status"] == "out_of_stock")
    retired = sum(1 for r in detailed if r["status"] == "retired")
    print(f"\nTotal DE items: {len(detailed)} (in_stock={in_stock}, out_of_stock={oos}, retired={retired})")


if __name__ == "__main__":
    main()
