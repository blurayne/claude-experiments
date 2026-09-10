#!/usr/bin/env python3
"""
compare_versions.py — what changed when the modelled terrain was replaced by
real terrain.

The first version of this experiment had no network access, so its elevation
profile was 16 researched town heights interpolated along the track. This
script diffs that old bundle against the current one so the effect of the real
EU-DEM data is visible and auditable rather than asserted.

The old bundle is archived in the repo as data/eco_data_modelled_v1.json, so
this comparison stays reproducible however far git history moves on.

Usage
-----
    python3 compare_versions.py
    python3 compare_versions.py --old <path>
    python3 compare_versions.py --markdown        # emit the docs table
"""
import argparse
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "data")
ARCHIVED_V1 = os.path.join(DATA, "eco_data_modelled_v1.json")

# Routes that exist in both versions and can therefore be compared.
COMPARABLE = ["arnbruck", "koetzting"]
LABEL = {"arnbruck": "Route A · Arnbruck", "koetzting": "Route B · Kötzting"}

# v1's fuel prices. Cost comparisons are made at these prices for BOTH
# versions, so the diff isolates the model change (terrain, stops) from the
# fuel-price development since.
V1_PRICE = {"petrol": 1.79, "diesel": 1.69, "electric": 0.40}


def load_old(path=None):
    path = path or ARCHIVED_V1
    if not os.path.exists(path):
        sys.exit(f"no archived v1 bundle at {path}; pass --old <path>")
    with open(path) as f:
        return json.load(f)


def pct(new, old):
    if not old:
        return "—"
    return f"{100.0 * (new - old) / abs(old):+.0f}%"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--old", help="path to the previous eco_data.json")
    ap.add_argument("--markdown", action="store_true",
                    help="print Markdown tables for the docs")
    args = ap.parse_args()

    old = load_old(args.old)
    with open(os.path.join(DATA, "eco_data.json")) as f:
        new = json.load(f)

    rows_terrain, rows_cost = [], []
    for k in COMPARABLE:
        o, n = old["routes"][k], new["routes"][k]
        oe, ne = o["elev_stats"], n["elev_stats"]
        rows_terrain.append({
            "route": LABEL[k],
            "km": (o["total_km"], n["total_km"]),
            "peak": (oe["max_m"], ne["max_m"]),
            "ascent": (oe["ascent_m"], ne["ascent_m"]),
            "descent": (oe["descent_m"], ne["descent_m"]),
            "maxgrade": (oe["max_grade_pct"], ne["max_grade_pct"]),
            "curv": (o["curviness"]["deg_per_km"], n["curviness"]["deg_per_km"]),
        })
        for car in new["cars"]:
            cid = car["id"]
            ores, nres = old["results"][k][cid], new["results"][k][cid]
            rows_cost.append({
                "route": LABEL[k], "car": car["name"].split(" (")[0],
                "per100": (ores["per100"], nres["per100"]),
                # new cost re-priced at v1 prices -> pure model change
                "cost": (ores["cost_eur"],
                         round(nres["amount"] * V1_PRICE[car["fuel"]], 2)),
                "time": (ores["time_min"], nres["time_min"]),
                "unit": nres["unit100"],
            })

    if args.markdown:
        print("| Route | Metric | Modelled (old) | Real (new) | Change |")
        print("|---|---|---|---|---|")
        for r in rows_terrain:
            for key, lbl, unit in (("peak", "Highest point", " m"),
                                   ("ascent", "Total ascent", " m"),
                                   ("descent", "Total descent", " m"),
                                   ("maxgrade", "Steepest grade", " %"),
                                   ("curv", "Curviness", " °/km")):
                o, n = r[key]
                print(f"| {r['route']} | {lbl} | {o}{unit} | {n}{unit} "
                      f"| {pct(n, o)} |")
        print()
        print("| Route | Car | Consumption old → new | Cost old → new | Change |")
        print("|---|---|---|---|---|")
        for r in rows_cost:
            print(f"| {r['route']} | {r['car']} | {r['per100'][0]} → "
                  f"{r['per100'][1]} {r['unit']} | €{r['cost'][0]:.2f} → "
                  f"€{r['cost'][1]:.2f} | {pct(r['cost'][1], r['cost'][0])} |")
        return

    print("=" * 78)
    print("TERRAIN — modelled town anchors  vs  real EU-DEM 25 m")
    print("=" * 78)
    hdr = f"{'route':26s}{'metric':17s}{'old':>10s}{'new':>10s}{'change':>10s}"
    print(hdr)
    print("-" * len(hdr))
    for r in rows_terrain:
        for key, lbl in (("peak", "highest point m"), ("ascent", "total ascent m"),
                         ("descent", "total descent m"), ("maxgrade", "max grade %"),
                         ("curv", "curviness °/km")):
            o, n = r[key]
            print(f"{r['route']:26s}{lbl:17s}{o:10.1f}{n:10.1f}{pct(n, o):>10s}")
        print()

    print("=" * 78)
    print("CONSUMPTION & COST — same cars, same routes, real terrain")
    print("(costs on both sides at v1 fuel prices, isolating the model change)")
    print("=" * 78)
    hdr = (f"{'route':26s}{'car':22s}{'old':>9s}{'new':>9s}{'Δcost':>10s}")
    print(hdr)
    print("-" * len(hdr))
    for r in rows_cost:
        print(f"{r['route']:26s}{r['car']:22s}"
              f"{r['cost'][0]:9.2f}{r['cost'][1]:9.2f}"
              f"{pct(r['cost'][1], r['cost'][0]):>10s}")

    print()
    print("=" * 78)
    print("DOES THE VERDICT CHANGE?")
    print("=" * 78)
    for label, bundle in (("old (modelled terrain)", old), ("new (real terrain)", new)):
        keys = [k for k in bundle["routes"]]
        best = {}
        for car in bundle["cars"]:
            cid = car["id"]
            win = min(keys, key=lambda k: bundle["results"][k][cid]["cost_eur"])
            best[car["name"].split(" (")[0]] = win
        winners = set(best.values())
        print(f"  {label}: cheapest route per car -> "
              f"{', '.join(sorted(winners))}"
              f"  ({len(keys)} routes compared)")
    print()
    a_old = old["results"]["arnbruck"]["auris"]["cost_eur"]
    b_old = old["results"]["koetzting"]["auris"]["cost_eur"]
    a_new = new["results"]["arnbruck"]["auris"]["amount"] * V1_PRICE["petrol"]
    b_new = new["results"]["koetzting"]["auris"]["amount"] * V1_PRICE["petrol"]
    print(f"  Auris A vs B gap (at v1 prices): €{b_old - a_old:.2f} (old) -> "
          f"€{b_new - a_new:.2f} (new)")


if __name__ == "__main__":
    main()
