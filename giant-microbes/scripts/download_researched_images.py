#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
"""Download the candidate image URLs the gm-recover-missing Workflow's research
pass found (pending_research_images.json: [{slug, url}]) into images/, and wire
each into merged_catalog.json's image_file field. Sources are a mix of Wayback
Machine snapshots and other web finds, so failures (dead links, non-image
content-type) are expected and just skipped -- rerun remove_background.py /
convert_to_avif.py afterward as usual.
"""
import json
import mimetypes
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


def fetch(entry, retries=3):
    slug, url = entry["slug"], entry["url"]
    req = urllib.request.Request(url, headers=HEADERS)
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=25) as resp:
                ctype = resp.headers.get("Content-Type", "")
                if "image" not in ctype:
                    return slug, None, f"non-image content-type: {ctype}"
                data = resp.read()
                if len(data) < 500:
                    return slug, None, "suspiciously small response"
                ext = mimetypes.guess_extension(ctype.split(";")[0].strip()) or ".jpg"
                if ext == ".jpe":
                    ext = ".jpg"
                path = os.path.join(IMAGES_DIR, f"{slug}{ext}")
                with open(path, "wb") as f:
                    f.write(data)
                return slug, path, None
        except (urllib.error.URLError, TimeoutError, ConnectionError, urllib.error.HTTPError) as e:
            if attempt == retries - 1:
                return slug, None, str(e)
            time.sleep(2)


def main():
    with open("pending_research_images.json") as f:
        entries = json.load(f)

    print(f"Downloading {len(entries)} researched images...")
    ok, failed = [], []
    with ThreadPoolExecutor(max_workers=6) as pool:
        futures = {pool.submit(fetch, e): e["slug"] for e in entries}
        for fut in as_completed(futures):
            slug, path, err = fut.result()
            if path:
                ok.append(slug)
            else:
                failed.append((slug, err))

    print(f"Downloaded {len(ok)}, failed {len(failed)}")
    for slug, err in failed:
        print(f"  FAILED {slug}: {err}")

    with open("merged_catalog.json") as f:
        items = json.load(f)
    by_us_slug = {i.get("slug_us"): i for i in items if i.get("slug_us")}
    linked = 0
    for slug in ok:
        item = by_us_slug.get(slug)
        if item is None:
            continue
        matches = [f for f in os.listdir(IMAGES_DIR) if os.path.splitext(f)[0] == slug]
        if matches:
            item["image_file"] = f"images/{matches[0]}"
            item["image_is_fallback_thumb"] = False
            linked += 1
    with open("merged_catalog.json", "w") as f:
        json.dump(items, f, indent=2, ensure_ascii=False)
    print(f"Linked {linked} images into merged_catalog.json")


if __name__ == "__main__":
    main()
