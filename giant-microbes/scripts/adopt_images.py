#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = ["pillow", "numpy"]
# ///
"""Fold reviewed image finds into `images/` and record where they came from.

This is the deliberate step between "an agent proposed a photo" and "the catalog
ships it". Everything upstream (Wayback hunts, image search, the licensee stores,
upgrade_images.py) only ever writes to a staging directory; nothing reaches
`images/` without passing through here.

What it does per record:

  1. If the recorded source URL is a Magento *rendition* (`cache/<hash>/…`, often
     only 375px wide because that is what the archived listing page embedded),
     try the un-cached original path first and keep it when it is genuinely
     bigger. Many retired products still have their full-size file sitting on the
     media path even though the product page itself 404s.
  2. Re-run the placeholder filter. The shop's not-found group shot is archived
     inside the Wayback Machine too, so provenance is not a substitute for the
     check -- and the check is cheap.
  3. Copy into `images/<slug>.<ext>` and write the provenance onto the catalog
     record: `image_source_url`, `image_source_page`, `image_recovered_via`,
     `image_is_researched`. The catalog convention is that anything not taken
     straight from the vendor's live listing says so on the record.

It does not remove backgrounds or convert to AVIF -- run `remove_background.py`
and `convert_to_avif.py` afterwards, in that order.

Usage:
  uv run scripts/adopt_images.py --found handoff/found_images.json \\
                                 --found-dir handoff/found-images
  uv run scripts/adopt_images.py --upgrades handoff/upgrades \\
                                 --report handoff/image_upgrade_report.mine.json
"""

import argparse
import json
import os
import re
import shutil
import sys
import tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gm_imgutil import PlaceholderFilter, fetch, measure    # noqa: E402

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CATALOG = os.path.join(HERE, "merged_catalog.json")
IMAGES = os.path.join(HERE, "images")
CACHE_SEG = re.compile(r"/cache/(?:\d+/)?(?:image|small_image|thumbnail)?/?"
                       r"(?:\d+x\d*(?:\.\d+)?/)?[0-9a-f]{16,}/", re.I)


def decached(url):
    """Rewrite a Magento rendition URL to the original upload path."""
    if not CACHE_SEG.search(url):
        return None
    original = CACHE_SEG.sub("/", url)
    # Archived renditions sometimes carry a `products/` segment the live media
    # path does not use.
    original = original.replace("/product/products/", "/product/")
    return original if original != url else None


def try_original(record, tmpdir, placeholder):
    """Fetch the un-cached original; return its path when it beats what we have."""
    url = decached(record.get("source_url") or "")
    if not url:
        return None
    dest = os.path.join(tmpdir, "orig" + os.path.splitext(url)[1].split("?")[0])
    if fetch(url, dest, timeout=25) != "200" or not os.path.exists(dest):
        return None
    if os.path.getsize(dest) < 3000:
        return None
    bad, _ = placeholder.is_placeholder(dest)
    if bad:
        return None
    try:
        m = measure(dest)
    except Exception:                                   # noqa: BLE001
        return None
    if max(m["w"], m["h"]) <= max(record.get("width", 0), record.get("height", 0)):
        return None
    return {"path": dest, "url": url, **m}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--found", help="found_images.json ([{slug, file, source_url, ...}])")
    ap.add_argument("--found-dir", help="directory holding those files")
    ap.add_argument("--upgrades", help="directory of <slug>.<ext> replacements")
    ap.add_argument("--report", help="upgrade report, for the source URL of each")
    ap.add_argument("--skip", default="", help="comma-separated slugs to leave out")
    ap.add_argument("--no-original-probe", action="store_true",
                    help="do not try to replace renditions with the original")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    skip = {s.strip() for s in args.skip.split(",") if s.strip()}
    catalog = json.load(open(CATALOG))
    # 37 records are DE-only and carry no `slug_us`. Keyed naively they all
    # collapse onto one None entry, and an adoption meant for one of them lands
    # on whichever came last -- writing `images/None.avif` in the process.
    by_slug = {i["slug_us"]: i for i in catalog if i.get("slug_us")}
    placeholder = PlaceholderFilter()

    jobs = []
    if args.found:
        for rec in json.load(open(args.found)):
            if rec["slug"] in skip:
                continue
            jobs.append({"slug": rec["slug"],
                         "src": os.path.join(args.found_dir or "", rec["file"]),
                         "source_url": rec.get("source_url"),
                         "source_page": rec.get("source_page"),
                         "via": rec.get("via"),
                         "width": rec.get("width", 0), "height": rec.get("height", 0),
                         "kind": "found"})
    if args.upgrades:
        urls = {}
        if args.report:
            for r in json.load(open(args.report)):
                if r.get("url"):
                    urls[r["slug"]] = r["url"]
        for fn in sorted(os.listdir(args.upgrades)):
            slug = os.path.splitext(fn)[0]
            if slug in skip:
                continue
            jobs.append({"slug": slug, "src": os.path.join(args.upgrades, fn),
                         "source_url": urls.get(slug), "source_page": None,
                         "via": "vendor", "width": 0, "height": 0, "kind": "upgrade"})

    stats = {"adopted": 0, "upgraded-to-original": 0, "placeholder": 0,
             "unknown-slug": 0, "unreadable": 0, "missing-file": 0}
    adopted = []
    for n, job in enumerate(jobs, 1):
        slug = job["slug"]
        item = by_slug.get(slug)
        if item is None:
            stats["unknown-slug"] += 1
            print(f"  !! {slug}: not in catalog", file=sys.stderr)
            continue
        src = job["src"]
        if not os.path.exists(src):
            stats["missing-file"] += 1
            continue

        with tempfile.TemporaryDirectory() as tmpdir:
            bad, why = placeholder.is_placeholder(src)
            if bad:
                stats["placeholder"] += 1
                print(f"  !! {slug}: rejected, {why}", file=sys.stderr)
                continue
            try:
                m = measure(src)
            except Exception as exc:                    # noqa: BLE001
                stats["unreadable"] += 1
                print(f"  !! {slug}: {exc}", file=sys.stderr)
                continue

            source_url = job["source_url"]
            better = None
            if not args.no_original_probe and job["kind"] == "found":
                job["width"], job["height"] = m["w"], m["h"]
                better = try_original(job, tmpdir, placeholder)
            if better:
                src, m, source_url = better["path"], better, better["url"]
                stats["upgraded-to-original"] += 1

            ext = os.path.splitext(src)[1].lower() or ".jpg"
            dest = os.path.join(IMAGES, f"{slug}{ext}")
            if not args.dry_run:
                shutil.copyfile(src, dest)
                item["image_file"] = f"images/{slug}{ext}"
                if source_url:
                    item["image_source_url"] = source_url
                if job["source_page"]:
                    item["image_source_page"] = job["source_page"]
                if job["kind"] == "found":
                    item["image_recovered_via"] = job["via"]
                    # A licensee storefront is still the vendor's own photography,
                    # just not the storefront this catalog was crawled from, so it
                    # is recorded as a different source rather than as research.
                    if (job["via"] or "").startswith("licensee:"):
                        item["image_source_store"] = job["via"].split(":", 1)[1]
                    else:
                        item["image_is_researched"] = True
            adopted.append({"slug": slug, "kind": job["kind"], "w": m["w"], "h": m["h"],
                            "detail_ratio": m["detail_ratio"], "url": source_url})
            stats["adopted"] += 1
        if n % 25 == 0:
            print(f"  ... {n}/{len(jobs)}", file=sys.stderr)

    if not args.dry_run:
        json.dump(catalog, open(CATALOG, "w"), indent=2, ensure_ascii=False)
    json.dump(adopted, open(os.path.join(HERE, "image_adoption_report.json"), "w"),
              indent=1, ensure_ascii=False)

    print("\n" + "\n".join(f"  {k:22s} {v}" for k, v in stats.items()))
    print(f"\n{'(dry run) ' if args.dry_run else ''}wrote image_adoption_report.json")
    print("next: remove_background.py, then convert_to_avif.py")


if __name__ == "__main__":
    main()
