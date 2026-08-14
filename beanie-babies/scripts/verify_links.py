#!/usr/bin/env python3
"""Verify product_url for every current item actually resolves (HTTP 200).

Items whose link doesn't verify get product_url set to null so the calendar
doesn't link to a dead page.
"""
import gzip
import json
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    ),
    "Referer": "https://www.ty.com/",
}


def check(url, retries=3):
    req = urllib.request.Request(url, headers=HEADERS, method="HEAD")
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=20) as resp:
                return resp.status == 200
        except urllib.error.HTTPError as e:
            return e.code == 200
        except (urllib.error.URLError, TimeoutError, ConnectionError):
            if attempt == retries - 1:
                return False
            time.sleep(2)
    return False


def main():
    with gzip.open("calendar_data.json.gz", "rt") as f:
        items = json.load(f)

    current_items = [i for i in items if i["is_current"]]
    print(f"Verifying {len(current_items)} product links...")

    results = {}
    with ThreadPoolExecutor(max_workers=8) as pool:
        futures = {
            pool.submit(check, item["product_url"]): item["item_no"]
            for item in current_items
        }
        done = 0
        for fut in as_completed(futures):
            item_no = futures[fut]
            results[item_no] = fut.result()
            done += 1
            if done % 50 == 0:
                print(f"  {done}/{len(current_items)} checked")

    ok = sum(1 for v in results.values() if v)
    bad = sum(1 for v in results.values() if not v)
    print(f"OK: {ok}, broken: {bad}")

    for item in items:
        if item["is_current"] and not results.get(item["item_no"], False):
            print(f"  broken link: {item['item_no']} {item['display_name']} -> {item['product_url']}")
            item["product_url"] = None

    with gzip.open("calendar_data.json.gz", "wt") as f:
        json.dump(items, f, indent=2)


if __name__ == "__main__":
    main()
