#!/usr/bin/env python3
"""Download the _lg product image for every item in calendar_data.json into images/."""
import gzip
import json
import os
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

IMAGES_DIR = "images"


def download(item, retries=5):
    url = item["image_url_lg"]
    ext = url.rsplit(".", 1)[-1]
    filename = f"{item['item_no']}.{ext}"
    path = os.path.join(IMAGES_DIR, filename)

    if os.path.exists(path) and os.path.getsize(path) > 0:
        return item["item_no"], filename, True

    req = urllib.request.Request(url, headers=HEADERS)
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=25) as resp:
                data = resp.read()
            with open(path, "wb") as f:
                f.write(data)
            return item["item_no"], filename, True
        except (urllib.error.URLError, TimeoutError, ConnectionError):
            if attempt == retries - 1:
                return item["item_no"], filename, False
            time.sleep(2 + attempt)
    return item["item_no"], filename, False


def main():
    os.makedirs(IMAGES_DIR, exist_ok=True)
    with gzip.open("calendar_data.json.gz", "rt") as f:
        items = json.load(f)

    print(f"Downloading {len(items)} images...")

    filenames = {}
    failures = []
    with ThreadPoolExecutor(max_workers=6) as pool:
        futures = {pool.submit(download, item): item["item_no"] for item in items}
        done = 0
        for fut in as_completed(futures):
            item_no, filename, ok = fut.result()
            filenames[item_no] = filename
            if not ok:
                failures.append(item_no)
            done += 1
            if done % 100 == 0:
                print(f"  {done}/{len(items)} done ({len(failures)} failures so far)")

    for item in items:
        item["image_file"] = f"images/{filenames[item['item_no']]}"

    with gzip.open("calendar_data.json.gz", "wt") as f:
        json.dump(items, f, indent=2)

    print(f"\nDone. {len(items) - len(failures)} succeeded, {len(failures)} failed.")
    if failures:
        print("Failed item_nos:", failures)


if __name__ == "__main__":
    main()
