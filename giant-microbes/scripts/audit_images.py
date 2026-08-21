#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.10"
# dependencies = ["pillow", "numpy"]
# ///
"""Audit every catalog image for real (not nominal) picture quality.

Nominal pixel dimensions lie here, for two reasons specific to this dataset:

  * Several images were sourced from listing-page *thumbnails* and then
    enlarged somewhere upstream, so a file can report 1200px while carrying
    detail worth only 300px.
  * `remove_background.py` cuts the product out of a white studio backdrop,
    so a large canvas can hold a small subject. What matters for display is
    the *subject* size, not the canvas.

So this reports four things per image:

  w/h            nominal canvas size
  content_w/h    bounding box of non-transparent pixels (the actual product)
  lap_var        variance of the Laplacian over the content box -- the classic
                 focus measure. Low = soft/blurry. Resolution-dependent, so it
                 is only comparable between images of similar content size.
  detail_ratio   RMS difference between the image and a half-scale round trip
                 (downscale 2x, upscale back). An image with genuine detail at
                 full resolution changes measurably; an upscaled thumbnail is
                 nearly identical to its own round trip and scores near zero.
                 This is the resolution-independent "is it really this big?"
                 signal.

AVIF is read by shelling out to ImageMagick (`convert`), because Pillow has no
AVIF support in this environment and pillow-avif-plugin is not installed.

Usage:  uv run scripts/audit_images.py [--json out.json]
"""

import argparse
import json
import os
import subprocess
import sys
import tempfile

import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMAGES_DIR = os.path.join(HERE, "images")
CATALOG = os.path.join(HERE, "merged_catalog.json")

# Thresholds are calibrated against this catalog in particular (see the
# printed summary); they are triage aids, not verdicts.
SMALL_LONG_EDGE = 800       # below this, worth trying to re-source
TINY_LONG_EDGE = 300        # thumbnail-grade
SOFT_LAP_VAR = 60.0         # below this, visibly soft at display size
UPSCALED_DETAIL_RATIO = 1.5  # below this, no real detail beyond half-res


def load_rgba(path):
    """Return an RGBA numpy array, going through ImageMagick for AVIF."""
    if path.lower().endswith(".avif"):
        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
            tmp_path = tmp.name
        try:
            subprocess.run(["convert", path, tmp_path], check=True,
                           capture_output=True)
            im = Image.open(tmp_path).convert("RGBA")
            return np.asarray(im, dtype=np.float64)
        finally:
            os.unlink(tmp_path)
    im = Image.open(path).convert("RGBA")
    return np.asarray(im, dtype=np.float64)


def content_box(rgba):
    """Bounding box of non-transparent pixels, or the whole frame if opaque."""
    alpha = rgba[:, :, 3]
    if alpha.min() >= 250:          # no meaningful transparency
        return 0, 0, rgba.shape[1], rgba.shape[0]
    ys, xs = np.nonzero(alpha > 16)
    if len(xs) == 0:
        return 0, 0, rgba.shape[1], rgba.shape[0]
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1


def to_gray_on_white(rgba):
    """Composite over white, then luminance. Keeps cut-out edges from reading
    as huge fake gradients the way compositing over black would."""
    a = rgba[:, :, 3:4] / 255.0
    rgb = rgba[:, :, :3] * a + 255.0 * (1.0 - a)
    return rgb @ np.array([0.299, 0.587, 0.114])


def laplacian_var(gray):
    if gray.shape[0] < 5 or gray.shape[1] < 5:
        return 0.0
    lap = (-4.0 * gray[1:-1, 1:-1]
           + gray[:-2, 1:-1] + gray[2:, 1:-1]
           + gray[1:-1, :-2] + gray[1:-1, 2:])
    return float(lap.var())


def detail_ratio(gray):
    """RMS difference between the image and its own half-scale round trip."""
    h, w = gray.shape
    if h < 8 or w < 8:
        return 0.0
    im = Image.fromarray(gray.astype(np.uint8))
    small = im.resize((max(1, w // 2), max(1, h // 2)), Image.LANCZOS)
    back = small.resize((w, h), Image.LANCZOS)
    diff = gray - np.asarray(back, dtype=np.float64)
    return float(np.sqrt((diff ** 2).mean()))


def audit_one(path):
    rgba = load_rgba(path)
    h, w = rgba.shape[0], rgba.shape[1]
    x0, y0, x1, y1 = content_box(rgba)
    gray = to_gray_on_white(rgba)[y0:y1, x0:x1]
    return {
        "w": w, "h": h,
        "content_w": x1 - x0, "content_h": y1 - y0,
        "lap_var": round(laplacian_var(gray), 2),
        "detail_ratio": round(detail_ratio(gray), 3),
        "bytes": os.path.getsize(path),
    }


def flags(r):
    out = []
    long_edge = max(r["w"], r["h"])
    content_edge = max(r["content_w"], r["content_h"])
    if long_edge < TINY_LONG_EDGE:
        out.append("tiny")
    elif long_edge < SMALL_LONG_EDGE:
        out.append("small")
    if content_edge < SMALL_LONG_EDGE:
        out.append("small-subject")
    if r["detail_ratio"] < UPSCALED_DETAIL_RATIO:
        out.append("upscaled")
    if r["lap_var"] < SOFT_LAP_VAR:
        out.append("soft")
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--json", default=os.path.join(HERE, "image_audit.json"))
    args = ap.parse_args()

    catalog = json.load(open(CATALOG))
    by_file = {}
    for item in catalog:
        f = item.get("image_file")
        if f:
            by_file.setdefault(os.path.basename(f), []).append(item)

    results = []
    names = sorted(os.listdir(IMAGES_DIR))
    for n, name in enumerate(names, 1):
        path = os.path.join(IMAGES_DIR, name)
        if not os.path.isfile(path):
            continue
        try:
            r = audit_one(path)
        except Exception as exc:                      # noqa: BLE001
            print(f"  !! {name}: {exc}", file=sys.stderr)
            continue
        items = by_file.get(name, [])
        r["file"] = name
        r["referenced"] = bool(items)
        r["slugs"] = [i.get("slug_us") or i.get("name") for i in items]
        r["names"] = [i.get("name") for i in items]
        r["flags"] = flags(r)
        results.append(r)
        if n % 100 == 0:
            print(f"  ... {n}/{len(names)}", file=sys.stderr)

    json.dump(results, open(args.json, "w"), indent=1, ensure_ascii=False)

    referenced = [r for r in results if r["referenced"]]
    print(f"\naudited {len(results)} files ({len(referenced)} referenced by the catalog)")
    counts = {}
    for r in referenced:
        for f in r["flags"]:
            counts[f] = counts.get(f, 0) + 1
    for k in ("tiny", "small", "small-subject", "upscaled", "soft"):
        print(f"  {k:14s} {counts.get(k, 0)}")
    bad = [r for r in referenced if r["flags"]]
    print(f"  {'ANY FLAG':14s} {len(bad)}")
    print(f"\nwrote {args.json}")


if __name__ == "__main__":
    main()
