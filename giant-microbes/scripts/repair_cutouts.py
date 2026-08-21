#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = ["pillow", "numpy"]
# ///
"""Repair cut-outs that `remove_background.py` ate.

rembg/u2net is trained to find *a subject*, and it is very good at plush toys on
a studio backdrop. It fails on one recurring product family here: anything sold
in a white or pale box. The gift boxes, the Einstein paper puzzle, the Germs
Deluxe 10-pack -- their packaging is the same value as the backdrop, so the model
either drops it or leaves it half-transparent, and the catalog ends up showing a
plush toy floating next to a ghost.

The fallback for exactly that case is dumber and better: flood-fill the backdrop
inwards from the frame edge. It cannot separate a subject from a busy scene (a
hand, a kitchen, a dark table), but on a plain studio backdrop it keeps every
white pixel that is not connected to the border -- which is precisely the box.

Detection, comparing the shipped cut-out against a flood-fill mask of the
original download:

  subject_share   how much of the frame the flood-fill considers subject. Near
                  1.0 means the backdrop is not plain (lifestyle shot, dark
                  table) and flood-fill has nothing to offer -- skip.
  kept            mean alpha the shipped cut-out has inside that subject area.
                  1.0 = intact, 0.18 = the puzzle box was erased.
  ghost           share of pixels left semi-transparent. High = the washed-out
                  half-there look.

Usage:
  uv run scripts/repair_cutouts.py --sources handoff/upgrades handoff/found-images
  uv run scripts/repair_cutouts.py --sources … --dry-run
"""

import argparse
import glob
import json
import os
import subprocess
import sys
import tempfile

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMAGES = os.path.join(HERE, "images")
CATALOG = os.path.join(HERE, "merged_catalog.json")

KEPT_MIN = 0.90         # below this the cut-out lost part of the product
GHOST_MAX = 0.10        # above this it is half-transparent
SUBJECT_MAX = 0.90      # above this the backdrop is not plain; leave it alone
FLOOD_THRESH = 40


def load_rgba(path):
    if path.lower().endswith(".avif"):
        tmp = tempfile.mktemp(suffix=".png")
        try:
            subprocess.run(["convert", path, tmp], check=True, capture_output=True)
            return Image.open(tmp).convert("RGBA")
        finally:
            if os.path.exists(tmp):
                os.unlink(tmp)
    return Image.open(path).convert("RGBA")


def flood_mask(img):
    """True where the pixel is *not* edge-connected backdrop."""
    rgb = img.convert("RGB")
    w, h = rgb.size
    work = rgb.copy()
    mark = (255, 0, 255)
    seeds = [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1),
             (w // 2, 0), (w // 2, h - 1), (0, h // 2), (w - 1, h // 2)]
    for seed in seeds:
        ImageDraw.floodfill(work, seed, mark, thresh=FLOOD_THRESH)
    a = np.asarray(work)
    return ~((a[:, :, 0] == 255) & (a[:, :, 1] == 0) & (a[:, :, 2] == 255))


def cut_with_flood(img):
    mask = flood_mask(img)
    alpha = Image.fromarray((mask * 255).astype("uint8")).filter(
        ImageFilter.GaussianBlur(0.6))
    out = img.convert("RGB")
    out.putalpha(alpha)
    return out


def score(current, source):
    mask = flood_mask(source)
    alpha = np.asarray(current.getchannel("A"), dtype=np.float64) / 255.0
    if mask.shape != alpha.shape:
        resized = Image.fromarray((mask * 255).astype("uint8")).resize(
            (alpha.shape[1], alpha.shape[0]))
        mask = np.asarray(resized) > 127
    return {
        "subject_share": float(mask.mean()),
        "kept": float(alpha[mask].mean()) if mask.any() else 0.0,
        "ghost": float(((alpha > 0.05) & (alpha < 0.9)).mean()),
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--sources", nargs="+", required=True,
                    help="directories holding the original downloads")
    ap.add_argument("--only", help="comma-separated slugs to repair regardless of score; "
                                   "the scores triage, a reviewer decides")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--report", default=os.path.join(HERE, "cutout_repair_report.json"))
    args = ap.parse_args()

    only = ({s.strip() for s in args.only.split(",") if s.strip()}
            if args.only else None)
    sources = {}
    for d in args.sources:
        for path in glob.glob(os.path.join(d, "*")):
            if os.path.isfile(path):
                sources.setdefault(os.path.splitext(os.path.basename(path))[0], path)

    catalog = json.load(open(CATALOG))
    by_slug = {i.get("slug_us"): i for i in catalog}

    report, repaired = [], 0
    for n, (slug, src_path) in enumerate(sorted(sources.items()), 1):
        item = by_slug.get(slug)
        if not item or not item.get("image_file"):
            continue
        current_path = os.path.join(HERE, item["image_file"])
        if not os.path.exists(current_path):
            continue
        try:
            current = load_rgba(current_path)
            source = load_rgba(src_path)
            s = score(current, source)
        except Exception as exc:                        # noqa: BLE001
            print(f"  !! {slug}: {exc}", file=sys.stderr)
            continue

        if only is not None:
            damaged = slug in only
        else:
            damaged = (s["subject_share"] < SUBJECT_MAX
                       and (s["kept"] < KEPT_MIN or s["ghost"] > GHOST_MAX))
        rec = {"slug": slug, **{k: round(v, 3) for k, v in s.items()},
               "action": "repair" if damaged else "keep"}
        if damaged and not args.dry_run:
            fixed = cut_with_flood(source)
            png = os.path.join(IMAGES, f"{slug}.png")
            fixed.save(png)
            subprocess.run(["convert", png, "-define", "avif:quality=65",
                            os.path.join(IMAGES, f"{slug}.avif")],
                           check=True, capture_output=True)
            os.unlink(png)
            item["image_file"] = f"images/{slug}.avif"
            item["cutout_method"] = "floodfill"
            rec["written"] = f"images/{slug}.avif"
        if damaged:
            repaired += 1
            print(f"  repair {slug:28s} kept={s['kept']:.2f} ghost={s['ghost']:.2f}")
        report.append(rec)
        if n % 50 == 0:
            print(f"  ... {n}/{len(sources)}", file=sys.stderr)

    if not args.dry_run:
        json.dump(catalog, open(CATALOG, "w"), indent=2, ensure_ascii=False)
    json.dump(report, open(args.report, "w"), indent=1, ensure_ascii=False)
    print(f"\n{repaired} of {len(report)} cut-outs {'would be ' if args.dry_run else ''}"
          f"redone with flood-fill")
    print(f"wrote {args.report}")


if __name__ == "__main__":
    main()
