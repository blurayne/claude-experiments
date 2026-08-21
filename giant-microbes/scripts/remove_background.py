#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = ["rembg", "pillow", "onnxruntime"]
# ///
"""Strip the white/plain studio background from every downloaded product photo,
writing a transparent PNG in place (source replaced). Unlike ty.com's beanie-babies
photos (already pre-cut transparent PNGs), giantmicrobes.com/riesenmikroben.de
product shots are plain studio photography, so this is a real background-removal
pass (rembg / u2net), not just a format hop.
"""
import glob
import json
import os
from concurrent.futures import ThreadPoolExecutor, as_completed

from PIL import Image
from rembg import new_session, remove

IMAGES_DIR = "images"
SESSION = new_session("u2net")


def process_one(path):
    root, ext = os.path.splitext(path)
    if ext.lower() == ".png" and is_already_transparent(path):
        return os.path.basename(path), os.path.basename(path)
    out_path = root + ".png"
    with open(path, "rb") as f:
        input_bytes = f.read()
    output_bytes = remove(input_bytes, session=SESSION)
    with open(out_path, "wb") as f:
        f.write(output_bytes)
    if out_path != path:
        os.remove(path)
    return os.path.basename(path), os.path.basename(out_path)


def is_already_transparent(path):
    try:
        img = Image.open(path)
        return img.mode == "RGBA" and img.getchannel("A").getextrema()[0] < 255
    except Exception:
        return False


def main():
    sources = [
        f for f in glob.glob(os.path.join(IMAGES_DIR, "*"))
        # .avif is always this pipeline's final output format -- never a fresh
        # download -- so it must never be fed back into rembg. (Bug history: an
        # earlier run globbed everything including already-finished .avif files,
        # ran them through background removal *again*, silently degrading 548
        # already-correct images. Redownloaded from source and reprocessed once.)
        if not f.lower().endswith(".avif")
    ]
    print(f"Removing background from {len(sources)} images...")

    done_count = 0
    failures = []
    filename_map = {}  # old basename -> new basename
    with ThreadPoolExecutor(max_workers=4) as pool:
        futures = {pool.submit(process_one, path): path for path in sources}
        for fut in as_completed(futures):
            path = futures[fut]
            try:
                old_name, new_name = fut.result()
                filename_map[old_name] = new_name
            except Exception as e:
                failures.append(os.path.basename(path))
                print(f"  FAILED {os.path.basename(path)}: {e}")
            done_count += 1
            if done_count % 50 == 0:
                print(f"  {done_count}/{len(sources)} done")

    print(f"\nDone. {len(sources) - len(failures)} succeeded, {len(failures)} failed.")
    if failures:
        print("Failed:", failures)

    with open("merged_catalog.json") as f:
        items = json.load(f)
    for item in items:
        if not item.get("image_file"):
            continue
        old_basename = os.path.basename(item["image_file"])
        if old_basename in filename_map:
            item["image_file"] = f"images/{filename_map[old_basename]}"
    with open("merged_catalog.json", "w") as f:
        json.dump(items, f, indent=2, ensure_ascii=False)
    print("merged_catalog.json updated with .png filenames.")


if __name__ == "__main__":
    main()
