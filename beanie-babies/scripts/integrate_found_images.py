#!/usr/bin/env python3
"""Integrate manually-verified replacement photos for items whose ty.com
images are permanently dead. Source photos are third-party product shots on
a solid-color background (not pre-cut PNGs), so each is chroma-keyed to add
transparency before converting to AVIF, matching the rest of images/.
"""
import gzip
import json
import subprocess
from PIL import Image

FOUND_DIR = "/tmp/beanie_found_images"

# item_no -> source filename, verified by visual inspection against
# web_display_name (see conversation for per-item confidence notes).
VERIFIED = {
    "47139": "47139.jpg",   # FIN - whale (orca-style plush, black/white)
    "40886": "40886.jpg",   # AMORE - dog w/heart
    "47158": "47158.jpg",   # HEARTS - dog (heart print)
    "36199": "36199.png",   # FANTASIA - unicorn (Walgreens)
    "36722": "36722.jpg",   # OPAL - owl (Beanie Boo)
    "41033": "41033.jpg",   # GRACIE - swan for cubs
    "47045": "47045.jpg",   # CHEF ROBUCHON - bear (confirmed by embroidery)
    "47136": "47136.jpg",   # BENTLY - cat
    "47098": "47098.jpg",   # SWINGER - monkey
    "47019": "47019.jpg",   # SWEETIEKINS - dog ("Be Mine" heart)
}


def corner_bg_color(path):
    im = Image.open(path).convert("RGB")
    w, h = im.size
    corners = [im.getpixel((0, 0)), im.getpixel((w - 1, 0)), im.getpixel((0, h - 1)), im.getpixel((w - 1, h - 1))]
    r = sum(c[0] for c in corners) // 4
    g = sum(c[1] for c in corners) // 4
    b = sum(c[2] for c in corners) // 4
    return r, g, b


def main():
    with gzip.open("calendar_data.json.gz", "rt") as f:
        items = json.load(f)
    by_item_no = {i["item_no"]: i for i in items}

    updated = []
    for item_no, filename in VERIFIED.items():
        src = f"{FOUND_DIR}/{filename}"
        r, g, b = corner_bg_color(src)
        out_path = f"images/{item_no}.avif"
        subprocess.run(
            [
                "convert", src,
                "-fuzz", "12%", "-transparent", f"rgb({r},{g},{b})",
                "-resize", "750x750>",
                "-define", "avif:quality=70",
                out_path,
            ],
            check=True,
            capture_output=True,
        )
        by_item_no[item_no]["image_file"] = out_path
        by_item_no[item_no]["image_source"] = "manually verified web search (ty.com CDN was dead)"
        updated.append(item_no)
        print(f"{item_no}: bg=({r},{g},{b}) -> {out_path}")

    with gzip.open("calendar_data.json.gz", "wt") as f:
        json.dump(items, f, indent=2)

    print(f"\nUpdated {len(updated)} items: {updated}")
    still_missing = [i["item_no"] for i in items if not i["image_file"]]
    print(f"Still missing images: {len(still_missing)} -> {still_missing}")


if __name__ == "__main__":
    main()
