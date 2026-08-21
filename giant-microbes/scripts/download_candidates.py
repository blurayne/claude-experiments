#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = ["pillow", "numpy"]
# ///
"""Stage the image-search candidates locally so they can be looked at.

Reads `image_search_candidates.json` ({slug: [{url, width, height, ...}]}) from
search_image_candidates.py, downloads each candidate into
`images_candidates/<slug>/NN.<ext>`, and drops anything that cannot be a usable
product photo before a human ever sees it:

  * the GIANTmicrobes not-found group shot (the shop serves it with HTTP 200),
  * files under ~4 kB or under 300px on the long edge,
  * anything that will not decode.

It also writes a `manifest.json` per batch for make_contact_sheet.py, because the
only reliable way to tell "Blood Cell Mug" from "some other mug with a cell on
it" is to look at the pictures side by side.

Nothing here writes to images/ or the catalog -- adopting a candidate is a
separate, deliberate step.
"""

import argparse
import json
import os
import shutil
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gm_imgutil import PlaceholderFilter, fetch, measure   # noqa: E402

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CANDIDATES = os.path.join(HERE, "image_search_candidates.json")
STAGE = os.path.join(HERE, "images_candidates")
CATALOG = os.path.join(HERE, "merged_catalog.json")

MIN_BYTES = 4000
MIN_EDGE = 300


def ext_of(url):
    tail = url.split("?")[0].rsplit(".", 1)
    ext = ("." + tail[-1].lower()) if len(tail) == 2 and len(tail[-1]) <= 5 else ".jpg"
    return ext if ext in (".jpg", ".jpeg", ".png", ".webp", ".avif") else ".jpg"


def grab(slug, idx, cand, placeholder):
    dest_dir = os.path.join(STAGE, slug)
    os.makedirs(dest_dir, exist_ok=True)
    dest = os.path.join(dest_dir, f"{idx:02d}{ext_of(cand['url'])}")
    if os.path.exists(dest):
        return {"slug": slug, "idx": idx, "path": dest, "status": "cached", **cand}
    status = fetch(cand["url"], dest, timeout=20)
    if status != "200" or not os.path.exists(dest):
        return {"slug": slug, "idx": idx, "status": f"http {status}", **cand}
    if os.path.getsize(dest) < MIN_BYTES:
        os.unlink(dest)
        return {"slug": slug, "idx": idx, "status": "too small", **cand}
    bad, why = placeholder.is_placeholder(dest)
    if bad:
        os.unlink(dest)
        return {"slug": slug, "idx": idx, "status": f"rejected: {why}", **cand}
    try:
        m = measure(dest)
    except Exception as exc:                            # noqa: BLE001
        os.unlink(dest)
        return {"slug": slug, "idx": idx, "status": f"unreadable: {exc}", **cand}
    if max(m["w"], m["h"]) < MIN_EDGE:
        os.unlink(dest)
        return {"slug": slug, "idx": idx, "status": "under min edge", **cand}
    return {"slug": slug, "idx": idx, "path": dest, "status": "ok",
            "measured": m, **cand}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--candidates", default=CANDIDATES)
    ap.add_argument("--per-item", type=int, default=6)
    ap.add_argument("--workers", type=int, default=6)
    ap.add_argument("--slugs", help="comma-separated subset")
    ap.add_argument("--clean", action="store_true", help="wipe the staging dir first")
    ap.add_argument("--report", default=os.path.join(HERE, "image_candidate_downloads.json"))
    args = ap.parse_args()

    if args.clean and os.path.isdir(STAGE):
        shutil.rmtree(STAGE)

    data = json.load(open(args.candidates))
    if args.slugs:
        want = {s.strip() for s in args.slugs.split(",")}
        data = {k: v for k, v in data.items() if k in want}

    placeholder = PlaceholderFilter()
    jobs = [(slug, i, c) for slug, cands in data.items()
            for i, c in enumerate(cands[:args.per_item])]
    print(f"downloading {len(jobs)} candidates for {len(data)} items ...", file=sys.stderr)

    results = []
    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        futs = [pool.submit(grab, s, i, c, placeholder) for s, i, c in jobs]
        for n, fut in enumerate(as_completed(futs), 1):
            results.append(fut.result())
            if n % 50 == 0:
                print(f"  ... {n}/{len(jobs)}", file=sys.stderr)

    json.dump(results, open(args.report, "w"), indent=1, ensure_ascii=False)
    ok = [r for r in results if r["status"] in ("ok", "cached")]
    by_slug = {}
    for r in ok:
        by_slug.setdefault(r["slug"], []).append(r)
    print(f"\n{len(ok)} usable files for {len(by_slug)} of {len(data)} items")
    empty = sorted(set(data) - set(by_slug))
    if empty:
        print(f"  no usable candidate: {len(empty)}")
        print("   " + ", ".join(empty[:25]) + (" ..." if len(empty) > 25 else ""))
    print(f"staged under {STAGE}/ -> report: {args.report}")


if __name__ == "__main__":
    main()
