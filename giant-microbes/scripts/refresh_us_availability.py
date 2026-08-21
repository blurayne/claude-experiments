#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.10"
# dependencies = []
# ///
"""Re-derive `status_us` from the live US storefront.

Two problems this fixes, found while verifying the merged catalog.

**A real bug.** 246 records carried `match_method: "llm"` *and* `status_us:
"not_offered"` — "never sold in the US" — while also carrying a US slug and a
working US product page. Spot-checking four of them (`amoeba`, `animal-cell`,
`mrsa`, `acid-reflux`) found all four live and `schema.org/InStock` right now.
The LLM merge pass evidently failed to carry the US status across when it folded
a matched pair into one record, and the field defaulted. `not_offered` is only
meaningful for a record with no US counterpart at all, so any record with a
`product_url_us` is re-derived here rather than trusted.

**Ordinary staleness.** In a 25-record sample, 6 records marked `not_offered`
were purchasable. Availability drifts; this makes refreshing it one command.

Status is read from the JSON-LD `availability` where the page carries it, falling
back to "Out of stock" text presence for the ~third of pages on the older Magento
template that has no JSON-LD block. A 404 means retired. A 403 is Cloudflare, not
an answer — those records are left exactly as they were and reported, never
silently downgraded.

Usage:
  uv run scripts/refresh_us_availability.py --dry-run
  uv run scripts/refresh_us_availability.py
"""

import argparse
import collections
import json
import os
import re
import subprocess
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import date

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CATALOG = os.path.join(HERE, "merged_catalog.json")

UA = ("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/124.0 Safari/537.36")
REFERER = "https://www.giantmicrobes.com/"
SLEEP = 0.25


def check(url):
    """-> (status_us | None, reason)  — None means 'do not change this record'."""
    dest = None
    try:
        r = subprocess.run(
            ["curl", "-s", "-L", "-w", "\n%{http_code}", "--max-time", "20",
             "-A", UA, "-H", f"Referer: {REFERER}", url],
            capture_output=True, text=True, errors="replace")
        body, _, code = r.stdout.rpartition("\n")
        code = code.strip()
        time.sleep(SLEEP)
        if code == "404":
            return "retired", "404"
        if code == "403":
            return None, "403 cloudflare"
        if code != "200":
            return None, f"http {code}"
        m = re.search(r'"availability"\s*:\s*"[^"]*?(InStock|OutOfStock|SoldOut|Discontinued)',
                      body)
        if m:
            token = m.group(1)
            return ("in_stock" if token == "InStock" else "out_of_stock"), f"json-ld {token}"
        # Older template: no JSON-LD. Fall back to the page's own wording.
        if re.search(r"out\s+of\s+stock", body, re.I):
            return "out_of_stock", "text fallback"
        if re.search(r"add\s+to\s+cart|addtocart", body, re.I):
            return "in_stock", "add-to-cart present"
        return None, "no signal"
    except Exception as exc:                            # noqa: BLE001
        return None, f"error {exc}"
    finally:
        if dest and os.path.exists(dest):
            os.unlink(dest)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--workers", type=int, default=4)
    ap.add_argument("--limit", type=int)
    args = ap.parse_args()

    catalog = json.load(open(CATALOG))
    targets = [i for i in catalog if i.get("product_url_us")]
    if args.limit:
        targets = targets[:args.limit]
    print(f"checking {len(targets)} US product pages with {args.workers} workers...")

    results = {}
    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        futs = {pool.submit(check, i["product_url_us"]): i for i in targets}
        for n, fut in enumerate(as_completed(futs), 1):
            item = futs[fut]
            results[id(item)] = fut.result()
            if n % 100 == 0:
                print(f"  ... {n}/{len(targets)}")

    changes = collections.Counter()
    reasons = collections.Counter()
    unchanged_403 = []
    fixed_not_offered = 0
    today = date.today().isoformat()

    for item in targets:
        new, reason = results[id(item)]
        reasons[reason] += 1
        if new is None:
            if reason.startswith("403"):
                unchanged_403.append(item.get("slug_us"))
            continue
        old = item.get("status_us")
        if old != new:
            changes[(old, new)] += 1
            if old == "not_offered":
                fixed_not_offered += 1
        if not args.dry_run:
            item["status_us"] = new
            item["status_us_checked"] = today
            item["status_us_source"] = reason

    print("\nhow each page answered:")
    for r, n in reasons.most_common():
        print(f"  {n:5d}  {r}")
    print("\nstatus changes:")
    for (old, new), n in changes.most_common(12):
        print(f"  {n:5d}  {old} -> {new}")
    print(f"\nrecords rescued from a wrong 'not_offered': {fixed_not_offered}")
    if unchanged_403:
        print(f"left untouched behind Cloudflare (403): {len(unchanged_403)}")
        print(f"  {', '.join(unchanged_403[:10])}")

    if args.dry_run:
        print("\n--dry-run: merged_catalog.json not written")
        return
    json.dump(catalog, open(CATALOG, "w"), indent=2, ensure_ascii=False)
    print("\nmerged_catalog.json updated")


if __name__ == "__main__":
    main()
