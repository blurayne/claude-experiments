#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = ["pillow", "numpy"]   # only for --probe, via gm_imgutil
# ///
"""Propose licensee-store photos for catalog items whose own photo is too small.

`fetch_licensee_catalogs.py` captures the Canadian and Australian Shopify stores.
They stock a lot of the same products the US shop sells, and Shopify hands out the
*original upload* at the bare image src -- typically 1200-2048px where our record
holds a 375px archived rendition.

The whole difficulty is that a title match is not a product match. GIANTmicrobes
sells the same character in eight formats, and "Blood Cell Mug" is 0.76 similar to
"Blood Cells Gift Box" while being an entirely different SKU. So a proposal needs
*both*:

  * a fuzzy title match on the character/subject, and
  * an exact format match, derived on both sides from a fixed vocabulary
    (petri dish, keychain, XL, mug, tie, earrings, box, ornament, putty, ...).

Where our record says "Plush" and the licensee title carries no format word
either, that counts as a match -- plain plush is the unmarked case on both sides.

Output is `licensee_image_proposals.json`. It proposes only; download_candidates.py
stages, a contact sheet gets looked at, adopt_images.py writes.

Usage:
  uv run scripts/match_licensee_images.py --max-edge 800
  uv run scripts/match_licensee_images.py --all      # every item, not just small
"""

import argparse
import json
import os
import re
import subprocess
import sys
import tempfile
from difflib import SequenceMatcher

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CATALOG = os.path.join(HERE, "merged_catalog.json")
LICENSEE = os.path.join(HERE, "licensee_catalogs.json")
OUT = os.path.join(HERE, "licensee_image_proposals.json")

# Format vocabulary. Order matters: the first pattern that hits wins, so the
# specific formats have to precede the generic keychain rule -- the same
# ordering bug that once filed every petri dish as a plush toy.
FORMATS = [
    ("petri",     r"petri|petri dish"),
    ("xl",        r"\bxl\b|gigantic|jumbo"),
    ("pack",      r"\bpack\b|\b\d+\s*pack\b|multi-pack"),
    ("box",       r"gift box|deluxe|box set|\bbox\b"),
    ("ornament",  r"ornament"),
    ("earrings",  r"earring"),
    ("necklace",  r"necklace|pendant"),
    ("mug",       r"\bmug\b"),
    ("glass",     r"pint glass|glass|tumbler"),
    ("tie",       r"\btie\b"),
    ("putty",     r"putty"),
    ("soap",      r"\bsoap\b"),
    ("magnet",    r"magnet"),
    ("sticker",   r"sticker"),
    ("puzzle",    r"puzzle"),
    ("skull",     r"skull"),
    ("keychain",  r"key ?chain|keyring|key ring|\bkc\b|clip-on"),
    ("plush",     r""),        # the unmarked case
]

# Our own product_type vocabulary mapped onto the same keys.
TYPE_TO_FORMAT = {
    "Petri Dish": "petri", "XL/Gigantic Plush": "xl", "Keychain": "keychain",
    "Mini Plush": "keychain", "Plush": "plush", "Gift/Deluxe Box Set": "box",
    "Ornament": "ornament", "Earrings": "earrings", "Necklace": "necklace",
    "Mug": "mug", "Glassware": "glass", "Tie": "tie", "Putty": "putty",
    "Soap": "soap", "Magnet": "magnet", "Sticker": "sticker", "Puzzle": "puzzle",
    "Skull Model": "skull", "Vinyl Figure": "plush", "Coaster": None,
    "Phone/Tech Case": None, "Tube": None, "Apparel": None, "Gift Card": None,
}

STOP = {"giantmicrobes", "giant", "microbes", "microbe", "plush", "toy", "doll",
        "stuffed", "the", "a", "gift", "mini", "size", "new"}


def fmt_of(text):
    t = (text or "").lower()
    for key, pattern in FORMATS:
        if pattern and re.search(pattern, t):
            return key
    return "plush"


def norm(s):
    s = (s or "").lower()
    s = re.sub(r"\(.*?\)", " ", s)                      # drop the species aside
    s = re.sub(r"[^a-z0-9 ]", " ", s)
    tokens = [t for t in s.split() if t not in STOP]
    # Format words carry no identity; they are compared separately.
    tokens = [t for t in tokens
              if not any(re.fullmatch(p.replace("\\b", ""), t)
                         for _, p in FORMATS if p and "|" not in p)]
    return " ".join(tokens)


def probe(proposals, stage_dir):
    """Download each proposed image and measure it against the one we ship.

    A name+format match says the licensee sells the same SKU; it says nothing
    about whether their photo is better. That is what `detail_ratio` is for --
    and it is the honest comparison here, because both sides are full-size
    studio shots rather than a thumbnail against a photo.
    """
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from gm_imgutil import fetch, measure                # noqa: PLC0415

    os.makedirs(stage_dir, exist_ok=True)
    for n, p in enumerate(proposals, 1):
        dest = os.path.join(stage_dir, f"{p['slug']}.jpg")
        if not os.path.exists(dest):
            if fetch(p["url"], dest, timeout=25) != "200":
                p["probe"] = "download failed"
                continue
        try:
            m = measure(dest)
        except Exception as exc:                        # noqa: BLE001
            p["probe"] = f"unreadable: {exc}"
            continue
        p.update({"licensee_w": m["w"], "licensee_h": m["h"],
                  "licensee_detail": m["detail_ratio"], "staged": dest})
        cur = os.path.join(HERE, p.get("image_file") or "")
        if os.path.exists(cur):
            try:
                c = measure(cur)
                p["current_detail"] = c["detail_ratio"]
                p["current_w"], p["current_h"] = c["w"], c["h"]
                p["gain"] = round(m["detail_ratio"] / max(c["detail_ratio"], 0.01), 2)
            except Exception:                           # noqa: BLE001
                pass
        if n % 25 == 0:
            print(f"  ... probed {n}/{len(proposals)}", file=sys.stderr)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--max-edge", type=int, default=800,
                    help="only items whose current photo is smaller than this")
    ap.add_argument("--all", action="store_true", help="consider every item")
    ap.add_argument("--min-score", type=float, default=0.72)
    ap.add_argument("--audit", default=os.path.join(HERE, "image_audit.json"))
    ap.add_argument("--out", default=OUT)
    ap.add_argument("--probe", action="store_true",
                    help="download each proposal and measure it against ours")
    ap.add_argument("--stage", default=os.path.join(HERE, "images_candidates", "licensee"))
    args = ap.parse_args()

    catalog = json.load(open(CATALOG))
    licensee = json.load(open(LICENSEE))
    sizes = {}
    if os.path.exists(args.audit):
        for r in json.load(open(args.audit)):
            sizes[r["file"]] = max(r["w"], r["h"])

    lic = [(norm(p["title"]), fmt_of(p["title"] + " " + (p.get("product_type") or "")), p)
           for p in licensee if p.get("images")]

    wanted = []
    for item in catalog:
        f = item.get("image_file")
        edge = sizes.get(os.path.basename(f), 0) if f else 0
        if args.all or not f or edge < args.max_edge:
            wanted.append((item, edge))

    proposals = []
    for item, edge in wanted:
        our_fmt = TYPE_TO_FORMAT.get(item.get("product_type") or "", None)
        if our_fmt is None:
            continue
        key = norm(item.get("name"))
        if len(key) < 3:
            continue
        best = None
        for lic_key, lic_fmt, p in lic:
            if lic_fmt != our_fmt or not lic_key:
                continue
            score = SequenceMatcher(None, key, lic_key).ratio()
            if score >= args.min_score and (best is None or score > best[0]):
                best = (score, p)
        if best:
            score, p = best
            proposals.append({
                "slug": item.get("slug_us"), "name": item.get("name"),
                "product_type": item.get("product_type"), "current_edge": edge,
                "score": round(score, 3), "format": our_fmt,
                "licensee_title": p["title"], "store": p["store"],
                "page": p["url"], "url": p["images"][0],
                "image_file": item.get("image_file"),
            })

    if args.probe:
        probe(proposals, args.stage)

    json.dump(proposals, open(args.out, "w"), indent=1, ensure_ascii=False)
    print(f"{len(proposals)} proposals for {len(wanted)} candidate items")
    for p in proposals[:25]:
        print(f"  {p['score']:.2f} {p['format']:9s} {p['name'][:34]:34s} -> "
              f"{p['licensee_title'][:38]}")
    print(f"\nwrote {args.out}")


if __name__ == "__main__":
    main()
