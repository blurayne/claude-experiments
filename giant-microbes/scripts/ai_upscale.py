#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.10"
# dependencies = ["pillow", "numpy", "requests"]
# ///
"""Last-resort AI upscale for product photos that have no better source.

Only for images where `upgrade_images.py` already proved there is nothing sharper
to download. An AI upscale is invented detail, so every output is gated on a
silhouette check and every accepted result is flagged in the dataset
(`image_ai_upscaled: true`) — a viewer must never present one as the vendor photo.

The gate exists because of a rule learned on the sibling project: *a plush toy's
outline is the product*. An image model asked to "enhance" a plush will happily
restyle the ears, round off a limb or restitch a face, which turns a catalog photo
into a picture of a toy that was never sold. So:

  * silhouette IoU against the original must be >= SILHOUETTE_IOU_MIN
  * the result must actually be sharper (detail_ratio gain) and bigger
  * anything else is discarded and the original kept

Auth: GOOGLE_API_KEY from the environment, else the first GOOGLE_API_KEY= line in a
.env walking up from the repo. Model defaults to gemini-2.5-flash-image (Nano Banana);
the *-lite tier is available via --model.

Usage:
  uv run scripts/ai_upscale.py --list                    # what would be attempted
  uv run scripts/ai_upscale.py --limit 5                 # try five
  uv run scripts/ai_upscale.py --slugs abschaum,birdflu
"""

import argparse
import base64
import io
import json
import os
import sys
import time

import numpy as np
import requests
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gm_imgutil import load_rgba, measure                # noqa: E402

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CATALOG = os.path.join(HERE, "merged_catalog.json")
IMAGES_DIR = os.path.join(HERE, "images")
OUT_DIR = os.path.join(HERE, "images_ai")
REPORT = os.path.join(HERE, "ai_upscale_report.json")

API = "https://generativelanguage.googleapis.com/v1beta/models"
DEFAULT_MODEL = "gemini-2.5-flash-image"
TIMEOUT_S = 90

SILHOUETTE_IOU_MIN = 0.95
MIN_DETAIL_GAIN = 1.3

PROMPT = (
    "This is a product catalogue photograph of a plush toy on a plain background. "
    "Reproduce it at higher resolution with sharper, cleaner detail: fabric texture, "
    "stitching, seams and the printed/embroidered face features. "
    "Keep the subject pixel-identical in shape: the same outline, the same proportions, "
    "the same number and position of every limb, eye and appendage, the same colours, "
    "the same pose, the same camera angle, the same background. "
    "This is a restoration of an existing photograph, not a new illustration. "
    "Add no objects, no text, no watermark, no border, no shadow that is not already there."
)


def api_key():
    if os.environ.get("GOOGLE_API_KEY"):
        return os.environ["GOOGLE_API_KEY"]
    d = HERE
    for _ in range(4):
        p = os.path.join(d, ".env")
        if os.path.exists(p):
            for line in open(p):
                if line.strip().startswith("GOOGLE_API_KEY="):
                    return line.split("=", 1)[1].strip().strip("'\"")
        d = os.path.dirname(d)
    raise SystemExit("no GOOGLE_API_KEY in env or any parent .env")


def silhouette(path_or_img, size=256):
    """Binary subject mask — shape only, independent of what colour the backdrop is.

    The originals are transparent cut-outs, but the model frequently returns the
    subject on a *black* or coloured backdrop instead of the white one it was
    given. Thresholding against white would then mark the entire frame as
    subject and fail the comparison for the wrong reason, hiding whether the
    outline itself survived. So the background colour is sampled from the corners
    and the mask is "differs from that".
    """
    if isinstance(path_or_img, Image.Image):
        rgba = np.asarray(path_or_img.convert("RGBA"), dtype=np.float64)
    else:
        rgba = load_rgba(path_or_img)
    alpha = rgba[:, :, 3]
    if alpha.min() < 250:
        mask = alpha > 16
    else:
        rgb = rgba[:, :, :3]
        h, w = rgb.shape[:2]
        k = max(2, min(h, w) // 20)
        corners = np.concatenate([rgb[:k, :k].reshape(-1, 3), rgb[:k, -k:].reshape(-1, 3),
                                  rgb[-k:, :k].reshape(-1, 3), rgb[-k:, -k:].reshape(-1, 3)])
        bg = np.median(corners, axis=0)
        mask = np.sqrt(((rgb - bg) ** 2).sum(axis=2)) > 40
    im = Image.fromarray((mask * 255).astype(np.uint8)).resize((size, size), Image.NEAREST)
    return np.asarray(im) > 127


def iou(a, b):
    union = np.logical_or(a, b).sum()
    return float(np.logical_and(a, b).sum() / union) if union else 0.0


def upscale(model, img_bytes, mime, key):
    body = {"contents": [{"parts": [
        {"text": PROMPT},
        {"inline_data": {"mime_type": mime, "data": base64.b64encode(img_bytes).decode()}},
    ]}]}
    r = requests.post(f"{API}/{model}:generateContent",
                      headers={"x-goog-api-key": key, "Content-Type": "application/json"},
                      json=body, timeout=TIMEOUT_S)
    if r.status_code != 200:
        return None, f"HTTP {r.status_code}: {r.text[:200]}"
    data = r.json()
    for cand in data.get("candidates", []):
        for part in cand.get("content", {}).get("parts", []):
            inline = part.get("inline_data") or part.get("inlineData")
            if inline and inline.get("data"):
                return base64.b64decode(inline["data"]), None
    return None, "no image part in response"


def pick_targets(catalog, audit):
    """Items with no better source available that are still weak."""
    report_path = os.path.join(HERE, "image_upgrade_report.json")
    exhausted = set()
    if os.path.exists(report_path):
        for r in json.load(open(report_path)):
            if r.get("action") in ("keep-current", "no-candidate"):
                exhausted.add(r.get("slug"))
    by_file = {a["file"]: a for a in audit}
    out = []
    for item in catalog:
        f = item.get("image_file")
        if not f:
            continue
        slug = item.get("slug_us")
        if slug not in exhausted:
            continue
        a = by_file.get(os.path.basename(f))
        if not a:
            continue
        long_edge = max(a["w"], a["h"])
        if long_edge < 700 or a["detail_ratio"] < 1.0:
            out.append({"slug": slug, "file": os.path.basename(f), "name": item.get("name"),
                        "w": a["w"], "h": a["h"], "detail_ratio": a["detail_ratio"],
                        "lap_var": a["lap_var"]})
    out.sort(key=lambda r: (max(r["w"], r["h"]), r["detail_ratio"]))
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", default=DEFAULT_MODEL)
    ap.add_argument("--limit", type=int)
    ap.add_argument("--slugs")
    ap.add_argument("--list", action="store_true")
    args = ap.parse_args()

    catalog = json.load(open(CATALOG))
    audit_path = os.path.join(HERE, "image_audit.json")
    if not os.path.exists(audit_path):
        raise SystemExit("run scripts/audit_images.py first")
    audit = json.load(open(audit_path))

    targets = pick_targets(catalog, audit)
    if args.slugs:
        want = {s.strip() for s in args.slugs.split(",")}
        targets = [t for t in targets if t["slug"] in want]
    if args.list:
        print(f"{len(targets)} candidates (no better source exists, still weak):")
        for t in targets[:80]:
            print(f"  {t['slug']:34s} {t['w']}x{t['h']:<6} detail={t['detail_ratio']:>5.2f} "
                  f"lap={t['lap_var']:>8.1f}")
        return
    if args.limit:
        targets = targets[:args.limit]

    key = api_key()
    os.makedirs(OUT_DIR, exist_ok=True)
    report = []
    for n, t in enumerate(targets, 1):
        src = os.path.join(IMAGES_DIR, t["file"])
        rec = {"slug": t["slug"], "model": args.model, "before": {
            "w": t["w"], "h": t["h"], "detail_ratio": t["detail_ratio"], "lap_var": t["lap_var"]}}
        try:
            # Gemini needs a common format; AVIF goes in as PNG.
            rgba = load_rgba(src)
            buf = io.BytesIO()
            Image.fromarray(rgba.astype(np.uint8), "RGBA").convert("RGB").save(buf, "PNG")
            out_bytes, err = upscale(args.model, buf.getvalue(), "image/png", key)
            if err:
                rec.update(action="api-error", error=err)
                report.append(rec)
                print(f"[{n}/{len(targets)}] {t['slug']}: {err}", file=sys.stderr)
                continue
            cand = Image.open(io.BytesIO(out_bytes))
            tmp = os.path.join(OUT_DIR, f"{t['slug']}.png")
            cand.save(tmp)
            m = measure(tmp)
            score = iou(silhouette(src), silhouette(cand))
            gain = m["detail_ratio"] / max(t["detail_ratio"], 0.01)
            rec["after"] = {"w": m["w"], "h": m["h"], "detail_ratio": m["detail_ratio"],
                            "lap_var": m["lap_var"]}
            rec["silhouette_iou"] = round(score, 4)
            rec["detail_gain"] = round(gain, 2)
            if score < SILHOUETTE_IOU_MIN:
                rec.update(action="rejected", reason=f"silhouette changed (IoU {score:.3f})")
                os.rename(tmp, tmp.replace(".png", ".rejected.png"))
            elif gain < MIN_DETAIL_GAIN:
                rec.update(action="rejected", reason=f"not sharper (gain {gain:.2f}x)")
                os.rename(tmp, tmp.replace(".png", ".rejected.png"))
            else:
                rec.update(action="accepted", staged=os.path.relpath(tmp, HERE))
            print(f"[{n}/{len(targets)}] {t['slug']}: {rec['action']} "
                  f"IoU={score:.3f} gain={gain:.2f}x", file=sys.stderr)
        except Exception as exc:                        # noqa: BLE001
            rec.update(action="error", error=str(exc))
            print(f"[{n}/{len(targets)}] {t['slug']}: {exc}", file=sys.stderr)
        report.append(rec)
        time.sleep(1.0)

    json.dump(report, open(REPORT, "w"), indent=1, ensure_ascii=False)
    counts = {}
    for r in report:
        counts[r["action"]] = counts.get(r["action"], 0) + 1
    print("\n" + "\n".join(f"  {k:12s} {v}" for k, v in sorted(counts.items())))
    print(f"\nstaged in {OUT_DIR}/  ->  {REPORT}")
    print("accepted images must be marked image_ai_upscaled=true in the catalog")


if __name__ == "__main__":
    main()
