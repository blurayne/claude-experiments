#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = ["pillow"]
# ///
"""Tile images into a labelled contact sheet for a fast visual pass.

Every automated step in this pipeline can be fooled: the shop's media path serves
a plausible-looking group shot for filenames that do not exist, image search
returns the right *subject* attached to the wrong *product*, and a sharpness score
says nothing about whether the photo shows a keychain or the plush it was cut
down from. The cheap fix is to look, and looking at 120 files one by one is the
expensive part -- so tile them.

Cells are numbered so a reviewer can name rejects by index. AVIF is read through
ImageMagick (Pillow has no AVIF here); a cell whose file will not decode is drawn
as a red X rather than aborting the sheet.

Usage:
  uv run scripts/make_contact_sheet.py --out sheet.png images/*.avif
  uv run scripts/make_contact_sheet.py --manifest pairs.json --out sheet.png

`--manifest` takes [{"path": ..., "label": ...}, ...] so callers can caption cells
with slugs, sizes or before/after markers instead of bare filenames.
"""

import argparse
import json
import os
import subprocess
import sys
import tempfile

from PIL import Image, ImageDraw, ImageFont

CELL = 240
LABEL_H = 30
PAD = 6
BG = (255, 255, 255)
CHECKER = (238, 238, 238)   # so a transparent cut-out is visibly transparent


def load(path):
    if path.lower().endswith(".avif"):
        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
            tmp_path = tmp.name
        try:
            subprocess.run(["convert", path, tmp_path], check=True, capture_output=True)
            return Image.open(tmp_path).convert("RGBA")
        finally:
            os.unlink(tmp_path)
    return Image.open(path).convert("RGBA")


def font(size):
    for candidate in ("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
                      "/usr/share/fonts/TTF/DejaVuSans.ttf"):
        if os.path.exists(candidate):
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default()


def checkerboard(size):
    tile = Image.new("RGB", (size, size), BG)
    d = ImageDraw.Draw(tile)
    step = 12
    for y in range(0, size, step):
        for x in range(0, size, step):
            if (x // step + y // step) % 2:
                d.rectangle([x, y, x + step - 1, y + step - 1], fill=CHECKER)
    return tile


def cell_image(entry, base):
    canvas = checkerboard(CELL)
    path = entry["path"]
    if not os.path.isabs(path):
        path = os.path.join(base, path)
    try:
        img = load(path)
        img.thumbnail((CELL - 2 * PAD, CELL - 2 * PAD), Image.LANCZOS)
        canvas.paste(img, ((CELL - img.width) // 2, (CELL - img.height) // 2), img)
    except Exception:                                   # noqa: BLE001
        d = ImageDraw.Draw(canvas)
        d.line([20, 20, CELL - 20, CELL - 20], fill=(200, 0, 0), width=5)
        d.line([CELL - 20, 20, 20, CELL - 20], fill=(200, 0, 0), width=5)
    return canvas


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("paths", nargs="*")
    ap.add_argument("--manifest", help='JSON [{"path","label"}]')
    ap.add_argument("--out", required=True)
    ap.add_argument("--cols", type=int, default=6)
    ap.add_argument("--base", default=os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    ap.add_argument("--start", type=int, default=1, help="first cell number")
    args = ap.parse_args()

    if args.manifest:
        entries = json.load(open(args.manifest))
    else:
        entries = [{"path": p, "label": os.path.basename(p)} for p in args.paths]
    if not entries:
        sys.exit("nothing to tile")

    cols = args.cols
    rows = (len(entries) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * CELL, rows * (CELL + LABEL_H)), BG)
    draw = ImageDraw.Draw(sheet)
    small = font(12)
    bold = font(13)

    for n, entry in enumerate(entries):
        cx, cy = (n % cols) * CELL, (n // cols) * (CELL + LABEL_H)
        sheet.paste(cell_image(entry, args.base), (cx, cy))
        draw.rectangle([cx, cy, cx + CELL - 1, cy + CELL + LABEL_H - 1],
                       outline=(210, 210, 210))
        num = str(n + args.start)
        draw.rectangle([cx + 2, cy + 2, cx + 2 + 9 * len(num) + 8, cy + 20],
                       fill=(20, 20, 20))
        draw.text((cx + 7, cy + 4), num, fill=(255, 255, 255), font=bold)
        label = entry.get("label", "")
        for line_no, line in enumerate(str(label).split("\n")[:2]):
            draw.text((cx + 5, cy + CELL + 2 + line_no * 13), line[:38],
                      fill=(40, 40, 40), font=small)

    sheet.save(args.out)
    print(f"wrote {args.out} ({len(entries)} cells, {sheet.width}x{sheet.height})")


if __name__ == "__main__":
    main()
