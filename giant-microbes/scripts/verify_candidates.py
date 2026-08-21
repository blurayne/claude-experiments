#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.10"
# dependencies = ["pillow", "numpy"]
# ///
"""Filter researched image candidates down to the ones that are actually real.

Research agents reported a 100% hit rate on retired products, every hit "verified"
by looking at it. They were looking at the shop's not-found placeholder: a group
shot of assorted plush microbes that giantmicrobes.com returns with HTTP 200 for
any nonexistent media path. It passes a glance because it genuinely is a photo of
plush microbes — just not of the requested one.

So candidate acceptance is mechanical here, never a judgement call:
  * reject anything matching the placeholder (exact digest, perceptual hash, or
    its exact 483x272 geometry)
  * reject duplicates — two different slugs resolving to the same bytes means at
    least one is wrong
  * reject anything too small or unreadable
Whatever survives is worth a human/vision look; nothing else is.

Usage:
  uv run scripts/verify_candidates.py                       # /tmp/gm_out/missing_batch*.json
  uv run scripts/verify_candidates.py --glob '/tmp/gm_out/*.json' --out verified.json
"""

import argparse
import collections
import glob as globmod
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gm_imgutil import PlaceholderFilter, measure, md5   # noqa: E402

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MIN_LONG_EDGE = 300
MIN_BYTES = 3000


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--glob", default="/tmp/gm_out/missing_batch*.json")
    ap.add_argument("--out", default=os.path.join(HERE, "image_candidates_verified.json"))
    args = ap.parse_args()

    print("learning the placeholder from a deliberately bad path...", file=sys.stderr)
    pf = PlaceholderFilter()
    if pf.reference:
        print(f"  placeholder md5={pf.reference['md5']}", file=sys.stderr)
    else:
        print("  WARNING: could not fetch it; falling back to known digests",
              file=sys.stderr)

    records = []
    for path in sorted(globmod.glob(args.glob)):
        try:
            records.extend(json.load(open(path)))
        except Exception as exc:                        # noqa: BLE001
            print(f"  skipped {path}: {exc}", file=sys.stderr)
    print(f"{len(records)} candidate records", file=sys.stderr)

    by_digest = collections.defaultdict(list)
    out = []
    for rec in records:
        slug = rec.get("slug")
        saved = rec.get("saved")
        r = {"slug": slug, "claimed_found": bool(rec.get("found")),
             "url": rec.get("url"), "via": rec.get("via"),
             "source_page": rec.get("source_page")}
        if not rec.get("found") or not saved or not os.path.exists(saved):
            r.update(verdict="rejected", reason="no file on disk")
            out.append(r)
            continue
        bad, why = pf.is_placeholder(saved)
        if bad:
            r.update(verdict="rejected", reason=why)
            out.append(r)
            continue
        try:
            m = measure(saved)
        except Exception as exc:                        # noqa: BLE001
            r.update(verdict="rejected", reason=f"unreadable ({exc})")
            out.append(r)
            continue
        r["measured"] = m
        if m["bytes"] < MIN_BYTES:
            r.update(verdict="rejected", reason=f"{m['bytes']} bytes")
        elif max(m["w"], m["h"]) < MIN_LONG_EDGE:
            r.update(verdict="rejected", reason=f"too small {m['w']}x{m['h']}")
        else:
            r.update(verdict="accepted", reason="", digest=md5(saved), saved=saved)
            by_digest[r["digest"]].append(slug)
        out.append(r)

    # Two slugs, one file -> at most one can be right, so drop both.
    for digest, slugs in by_digest.items():
        if len(slugs) > 1:
            for r in out:
                if r.get("digest") == digest:
                    r.update(verdict="rejected",
                             reason=f"duplicate bytes shared with {len(slugs)-1} other slug(s): "
                                    + ", ".join(s for s in slugs if s != r['slug']))

    json.dump(out, open(args.out, "w"), indent=1, ensure_ascii=False)
    counts = collections.Counter(r["verdict"] for r in out)
    reasons = collections.Counter(r["reason"] for r in out if r["verdict"] == "rejected")
    claimed = sum(1 for r in out if r["claimed_found"])
    print(f"\nagents claimed found: {claimed}/{len(out)}")
    print(f"actually accepted:    {counts['accepted']}")
    print(f"rejected:             {counts['rejected']}")
    print("\ntop rejection reasons:")
    for reason, n in reasons.most_common(8):
        print(f"  {n:4d}  {reason[:90]}")
    print(f"\nwrote {args.out}")


if __name__ == "__main__":
    main()
