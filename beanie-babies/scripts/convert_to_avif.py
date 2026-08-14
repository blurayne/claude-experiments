#!/usr/bin/env python3
"""Convert every downloaded product image (PNG/GIF) to AVIF, keeping transparency.

Uses ImageMagick's `convert`, which has native AVIF read/write support. Replaces
the original file with a same-named .avif, and updates calendar_data.json.gz's
image_file field to match.
"""
import glob
import gzip
import json
import os
import subprocess
from concurrent.futures import ThreadPoolExecutor, as_completed

IMAGES_DIR = "images"
QUALITY = "65"


def convert_one(path):
    root, ext = os.path.splitext(path)
    avif_path = root + ".avif"
    subprocess.run(
        ["convert", path, "-define", f"avif:quality={QUALITY}", avif_path],
        check=True,
        capture_output=True,
    )
    os.remove(path)
    return os.path.basename(path), os.path.basename(avif_path)


def main():
    sources = [
        f for f in glob.glob(os.path.join(IMAGES_DIR, "*"))
        if not f.endswith(".avif")
    ]
    print(f"Converting {len(sources)} images to AVIF...")

    filename_map = {}  # old basename -> new basename
    failures = []
    with ThreadPoolExecutor(max_workers=8) as pool:
        futures = {pool.submit(convert_one, path): path for path in sources}
        done = 0
        for fut in as_completed(futures):
            path = futures[fut]
            old_name = os.path.basename(path)
            try:
                old_name, new_name = fut.result()
                filename_map[old_name] = new_name
            except subprocess.CalledProcessError as e:
                failures.append(old_name)
                print(f"  FAILED: {old_name}: {e.stderr.decode(errors='replace')[:200]}")
            done += 1
            if done % 200 == 0:
                print(f"  {done}/{len(sources)} converted")

    print(f"Done. {len(filename_map)} converted, {len(failures)} failed.")

    with gzip.open("calendar_data.json.gz", "rt") as f:
        items = json.load(f)

    for item in items:
        if not item["image_file"]:
            continue
        old_basename = os.path.basename(item["image_file"])
        if old_basename in filename_map:
            item["image_file"] = f"images/{filename_map[old_basename]}"

    with gzip.open("calendar_data.json.gz", "wt") as f:
        json.dump(items, f, indent=2)

    print("calendar_data.json.gz updated with .avif filenames.")


if __name__ == "__main__":
    main()
