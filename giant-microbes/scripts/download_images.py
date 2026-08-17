#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
"""Download one primary image per item in merged_catalog.json into images/.

Prefers the US image (image_url_us) over the DE one (image_url_de) -- per the US
site's own precedence (a product exists there first, if it exists in the US at
all), falling back to DE-only images for DE-exclusive items. Full photo galleries
are skipped by design (see AGENTS.md) -- one image per item keeps the AVIF/
background-removal pass tractable.
"""
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
}

IMAGES_DIR = "images"


def pick_image(item):
    url = item.get("image_url_us") or item.get("image_url_de")
    source = "us" if item.get("image_url_us") else ("de" if item.get("image_url_de") else None)
    return url, source


def item_key(item):
    return item.get("slug_us") or item.get("slug_de")


def download(item, retries=5):
    url, source = pick_image(item)
    key = item_key(item)
    if not url:
        return key, None, False
    ext = url.rsplit(".", 1)[-1].split("?")[0]
    if ext.lower() not in ("jpg", "jpeg", "png", "gif", "webp"):
        ext = "jpg"
    filename = f"{key}.{ext}"
    path = os.path.join(IMAGES_DIR, filename)

    if os.path.exists(path) and os.path.getsize(path) > 0:
        return key, filename, True

    req = urllib.request.Request(url, headers=HEADERS)
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=25) as resp:
                data = resp.read()
            with open(path, "wb") as f:
                f.write(data)
            return key, filename, True
        except (urllib.error.URLError, TimeoutError, ConnectionError):
            if attempt == retries - 1:
                return key, filename, False
            time.sleep(2 + attempt)
    return key, filename, False


def main():
    os.makedirs(IMAGES_DIR, exist_ok=True)
    with open("merged_catalog.json") as f:
        items = json.load(f)

    print(f"Downloading images for {len(items)} items...")
    filenames = {}
    no_image = []
    failures = []
    with ThreadPoolExecutor(max_workers=8) as pool:
        futures = {pool.submit(download, item): item_key(item) for item in items}
        done = 0
        for fut in as_completed(futures):
            key, filename, ok = fut.result()
            if filename is None:
                no_image.append(key)
            elif not ok:
                failures.append(key)
            else:
                filenames[key] = filename
            done += 1
            if done % 100 == 0:
                print(f"  {done}/{len(items)} done ({len(failures)} failures so far)")

    for item in items:
        key = item_key(item)
        item["image_file"] = f"images/{filenames[key]}" if key in filenames else None

    with open("merged_catalog.json", "w") as f:
        json.dump(items, f, indent=2, ensure_ascii=False)

    print(f"\nDone. {len(filenames)} succeeded, {len(failures)} failed, {len(no_image)} had no image URL at all.")
    if failures:
        print("Failed:", failures)
    if no_image:
        print("No image URL:", no_image)


if __name__ == "__main__":
    main()
