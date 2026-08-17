#!/usr/bin/env python3
"""Fetch the real marketing description for every CURRENT item from its
ty.com product page (retired items have no live page to fetch from -- their
product_url is already null, confirmed earlier in this project).

ty.com embeds a schema.org Product JSON-LD block per page, e.g.:
  {"@context":"http://schema.org/","@type":"Product","name":"Sammy",
   "description":"Meet Sammy, the most purrfect Siamese Beanie Bouncer! ..."}

This is a far richer, hand-written description than anything derivable from
the terse "NAME - description" the birthday-calendar API gives us (e.g.
"Sammy - Bouncer"), and often mentions the animal/species explicitly even
when the calendar API text didn't.

Adds `product_description` (string or null) to every item. Re-run
scripts/classify_animal_types.py afterward to fold this richer text into
animal_types.
"""
import gzip
import json
import re
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

LD_JSON_RE = re.compile(
    r'<script type="application/ld\+json">\s*(\{.*?"@type"\s*:\s*"Product".*?\})\s*</script>',
    re.DOTALL,
)


def fetch_description(url, retries=4):
    req = urllib.request.Request(url, headers=HEADERS)
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=25) as resp:
                html = resp.read().decode("utf-8", errors="replace")
            m = LD_JSON_RE.search(html)
            if not m:
                return None
            data = json.loads(m.group(1))
            desc = data.get("description")
            return desc.strip() if desc else None
        except (urllib.error.URLError, TimeoutError, ConnectionError):
            if attempt == retries - 1:
                return "__FAILED__"
            time.sleep(2 + attempt)
        except (json.JSONDecodeError, AttributeError):
            return None
    return "__FAILED__"


def main():
    with gzip.open("calendar_data.json.gz", "rt") as f:
        items = json.load(f)

    current_items = [i for i in items if i["is_current"] and i["product_url"]]
    print(f"Fetching descriptions for {len(current_items)} current items...")

    results = {}
    with ThreadPoolExecutor(max_workers=8) as pool:
        futures = {pool.submit(fetch_description, i["product_url"]): i["item_no"] for i in current_items}
        done = 0
        for fut in as_completed(futures):
            item_no = futures[fut]
            results[item_no] = fut.result()
            done += 1
            if done % 50 == 0:
                print(f"  {done}/{len(current_items)} done")

    failed = [no for no, v in results.items() if v == "__FAILED__"]
    none_found = [no for no, v in results.items() if v is None]
    got = {no: v for no, v in results.items() if v and v != "__FAILED__"}

    for item in items:
        item["product_description"] = results.get(item["item_no"]) or None
        if item["product_description"] == "__FAILED__":
            item["product_description"] = None

    with gzip.open("calendar_data.json.gz", "wt") as f:
        json.dump(items, f, indent=2)

    print(f"\nGot descriptions: {len(got)}")
    print(f"No description found in page: {len(none_found)}")
    print(f"Failed to fetch: {len(failed)} -> {failed}")


if __name__ == "__main__":
    main()
