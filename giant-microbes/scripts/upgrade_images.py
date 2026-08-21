#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.10"
# dependencies = ["pillow", "numpy"]
# ///
"""Re-source catalog images at their real resolution.

The problem this fixes
----------------------
Many `image_url_us` values recorded during the first crawl point at a Magento
file whose name ends in `-tmb`. Those are the shop's *thumbnails, enlarged back
up to gallery size* — they carry gallery pixel dimensions but thumbnail detail.
Measured on `adhd`:

    a/d/adhd-tmb.jpg   1200x960   56 KB   Laplacian variance   2.3
    a/d/adhd.jpg       1200x902  138 KB   Laplacian variance  61.6

Same nominal size, 25x the edge energy. The un-suffixed file is the real photo,
and for most products it is simply sitting there at the sibling path. Nothing
about this is visible from pixel dimensions alone, which is why the first pass
did not notice.

What it does
------------
For every catalog item, derive candidate URLs from the recorded one (drop
`-tmb`, try the usual GIANTmicrobes filename variants), download each, measure
it, and keep the best. Downloads land in `images_upgrade/` — this script never
touches `images/` or the catalog. Run `remove_background.py` + `convert_to_avif.py`
over the staged files afterwards to fold them in.

Usage:
  uv run scripts/upgrade_images.py                 # all items with a source URL
  uv run scripts/upgrade_images.py --limit 20      # smoke test
  uv run scripts/upgrade_images.py --only adhd,alcohol
"""

import argparse
import json
import os
import re
import sys
import tempfile
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gm_imgutil import (MEDIA_ROOT, PlaceholderFilter,   # noqa: E402
                        fetch as http_fetch, measure)

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CATALOG = os.path.join(HERE, "merged_catalog.json")
IMAGES_DIR = os.path.join(HERE, "images")
STAGE_DIR = os.path.join(HERE, "images_upgrade")
REPORT = os.path.join(HERE, "image_upgrade_report.json")

# A candidate has to beat the incumbent by more than measurement noise before
# we bother re-downloading and reprocessing it.
MIN_DETAIL_GAIN = 1.35      # candidate detail_ratio / current, must exceed this
MIN_ABS_DETAIL = 1.2        # ... and the candidate must clear this on its own
MAX_SHRINK = 0.85           # never accept a candidate much smaller than current

PLACEHOLDER_MAX_BYTES = 3000
REQUEST_SLEEP = 0.25


# --- candidate URLs ---------------------------------------------------------

def candidates_for(item):
    """Ordered, de-duplicated candidate URLs, best guess first."""
    out = []

    def add(u):
        if u and u not in out:
            out.append(u)

    url = item.get("image_url_us") or ""
    if url:
        base, ext = os.path.splitext(url)
        # The whole point: the un-thumbnailed sibling.
        if base.endswith("-tmb"):
            add(base[:-4] + ext)
        # Some listings use `-front-tmb`, whose real file may be either
        # `-front` or the bare name.
        m = re.match(r"^(.*?)(?:-front)?-tmb$", base)
        if m:
            add(m.group(1) + ext)
        add(url)

    # Derive straight from the slug when no URL was ever recorded, or as extra
    # tries. Magento shards on the first two characters of the *filename*.
    slug = item.get("slug_us") or ""
    if slug:
        for stem in (slug, slug.replace("-", "")):
            for suffix in ("", "-doll", "-front", "1", "-1"):
                fn = f"{stem}{suffix}.jpg"
                if len(fn) >= 2:
                    add(f"{MEDIA_ROOT}/{fn[0]}/{fn[1]}/{fn}")
    return out


def fetch(url, dest):
    """Download, and treat the shop's not-found placeholder as a failure.

    The media path answers 200 for everything, so HTTP status proves nothing —
    PLACEHOLDER is the only real 'file does not exist' signal available.
    """
    status = http_fetch(url, dest, timeout=25)
    time.sleep(REQUEST_SLEEP)
    if status != "200":
        return "http"
    if not os.path.exists(dest) or os.path.getsize(dest) < PLACEHOLDER_MAX_BYTES:
        return "tiny"
    bad, _ = PLACEHOLDER.is_placeholder(dest)
    return "placeholder" if bad else "ok"


def best_candidate(item, tmpdir):
    results = []
    for n, url in enumerate(candidates_for(item)[:8]):
        dest = os.path.join(tmpdir, f"cand{n}{os.path.splitext(url)[1] or '.jpg'}")
        if fetch(url, dest) != "ok":
            continue
        try:
            m = measure(dest)
        except Exception:                              # noqa: BLE001
            continue
        m["url"] = url
        m["path"] = dest
        results.append(m)
        # An un-thumbnailed hit with real detail is as good as it gets; stop.
        if m["detail_ratio"] >= 2.0 and max(m["w"], m["h"]) >= 800:
            break
    if not results:
        return None
    # Prefer real detail first, then size. A big flat upscale is worth less
    # than a smaller sharp original.
    results.sort(key=lambda m: (round(m["detail_ratio"], 1), max(m["w"], m["h"])),
                 reverse=True)
    return results[0]


def process(item, current):
    slug = item.get("slug_us") or ""
    with tempfile.TemporaryDirectory() as tmpdir:
        best = best_candidate(item, tmpdir)
        if not best:
            return {"slug": slug, "action": "no-candidate"}
        rec = {"slug": slug, "url": best["url"],
               "cand": {k: round(best[k], 3) if isinstance(best[k], float) else best[k]
                        for k in ("w", "h", "lap_var", "detail_ratio", "bytes")},
               "current": current}
        if not current:
            rec["action"] = "adopt-new"
        else:
            gain = best["detail_ratio"] / max(current["detail_ratio"], 0.01)
            shrink = max(best["w"], best["h"]) / max(max(current["w"], current["h"]), 1)
            rec["gain"] = round(gain, 2)
            rec["size_ratio"] = round(shrink, 2)
            if (gain > MIN_DETAIL_GAIN and best["detail_ratio"] >= MIN_ABS_DETAIL
                    and shrink >= MAX_SHRINK):
                rec["action"] = "upgrade"
            else:
                rec["action"] = "keep-current"
        if rec["action"] in ("upgrade", "adopt-new"):
            os.makedirs(STAGE_DIR, exist_ok=True)
            ext = os.path.splitext(best["url"])[1] or ".jpg"
            out = os.path.join(STAGE_DIR, f"{slug}{ext}")
            with open(best["path"], "rb") as fh, open(out, "wb") as oh:
                oh.write(fh.read())
            rec["staged"] = os.path.relpath(out, HERE)
        return rec


PLACEHOLDER = None


def main():
    global PLACEHOLDER
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int)
    ap.add_argument("--only", help="comma-separated slugs")
    ap.add_argument("--workers", type=int, default=4)
    args = ap.parse_args()

    PLACEHOLDER = PlaceholderFilter()
    if PLACEHOLDER.reference:
        print(f"placeholder learned: md5={PLACEHOLDER.reference['md5']}", file=sys.stderr)

    items = json.load(open(CATALOG))
    if args.only:
        want = {s.strip() for s in args.only.split(",")}
        items = [i for i in items if i.get("slug_us") in want]
    else:
        # Only items that have somewhere to fetch from.
        items = [i for i in items if i.get("image_url_us") or i.get("slug_us")]
    if args.limit:
        items = items[:args.limit]

    # Measure what we currently hold, once.
    current_by_slug = {}
    for i in items:
        f = i.get("image_file")
        p = os.path.join(HERE, f) if f else None
        if p and os.path.exists(p):
            try:
                m = measure(p)
                current_by_slug[i.get("slug_us")] = {
                    "file": os.path.basename(p), "w": m["w"], "h": m["h"],
                    "lap_var": round(m["lap_var"], 2),
                    "detail_ratio": round(m["detail_ratio"], 3)}
            except Exception:                          # noqa: BLE001
                pass

    print(f"probing {len(items)} items with {args.workers} workers...", file=sys.stderr)
    report = []
    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        futs = {pool.submit(process, i, current_by_slug.get(i.get("slug_us"))): i
                for i in items}
        for n, fut in enumerate(as_completed(futs), 1):
            try:
                report.append(fut.result())
            except Exception as exc:                   # noqa: BLE001
                report.append({"slug": futs[fut].get("slug_us"),
                               "action": "error", "error": str(exc)})
            if n % 25 == 0:
                print(f"  ... {n}/{len(items)}", file=sys.stderr)

    json.dump(report, open(REPORT, "w"), indent=1, ensure_ascii=False)
    counts = {}
    for r in report:
        counts[r["action"]] = counts.get(r["action"], 0) + 1
    print("\n" + "\n".join(f"  {k:14s} {v}" for k, v in sorted(counts.items())))
    print(f"\nstaged downloads in {STAGE_DIR}/  ->  report: {REPORT}")
    print("next: remove_background.py + convert_to_avif.py over the staged files")


if __name__ == "__main__":
    main()
