#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
"""Pull the full product feed of the GIANTmicrobes licensee storefronts.

The US shop deletes a retired product's page outright and riesenmikroben.de only
keeps a name in its Archiv, which is why 119 items ended up with no photo. The
licensee stores are the workaround: they run on Shopify, they keep selling stock
long after the US shop drops a line, and Shopify exposes the entire catalog --
titles, SKUs, and full-resolution image URLs -- at `/products.json`, no scraping
and no API key.

Two stores answer today (a .co.uk / .eu / .co.nz do not exist or are not Shopify):

  giantmicrobes.ca            Canadian licensee, the deeper archive of the two;
                              image filenames carry the GMUS-xx-nnnn article code
  giantmicrobes.com.au        Australian licensee, smaller and more current

Output is `licensee_catalogs.json`, consumed by match_licensee_images.py. This is
raw capture only -- no matching, no judgement about which product is which.
"""

import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.request

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(HERE, "licensee_catalogs.json")

STORES = [
    ("giantmicrobes.ca", "https://giantmicrobes.ca"),
    ("giantmicrobes.com.au", "https://www.giantmicrobes.com.au"),
]
UA = ("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) "
      "Chrome/122.0.0.0 Safari/537.36")


def fetch_json(url, retries=3):
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=30) as resp:
                return json.loads(resp.read().decode("utf-8", "replace"))
        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError) as exc:
            if attempt == retries - 1:
                print(f"  !! {url}: {exc}", file=sys.stderr)
                return None
            time.sleep(2 * (attempt + 1))
    return None


def fetch_store(name, base):
    products, page = [], 1
    while True:
        data = fetch_json(f"{base}/products.json?limit=250&page={page}")
        batch = (data or {}).get("products") or []
        if not batch:
            break
        for p in batch:
            variants = p.get("variants") or []
            products.append({
                "store": name,
                "handle": p.get("handle"),
                "title": p.get("title"),
                "product_type": p.get("product_type"),
                "tags": p.get("tags") or [],
                "skus": [v.get("sku") for v in variants if v.get("sku")],
                "url": f"{base}/products/{p.get('handle')}",
                # Shopify serves the original upload at the bare src; the
                # ?v= cache-buster is kept because some CDNs 404 without it.
                "images": [i.get("src") for i in (p.get("images") or []) if i.get("src")],
            })
        print(f"  {name} page {page}: {len(batch)} products", flush=True)
        page += 1
        time.sleep(0.5)
    return products


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=OUT)
    args = ap.parse_args()

    all_products = []
    for name, base in STORES:
        print(f"fetching {name} ...")
        all_products.extend(fetch_store(name, base))

    json.dump(all_products, open(args.out, "w"), indent=1, ensure_ascii=False)
    with_img = sum(1 for p in all_products if p["images"])
    print(f"\n{len(all_products)} products ({with_img} with at least one image)")
    print(f"wrote {args.out}")


if __name__ == "__main__":
    main()
