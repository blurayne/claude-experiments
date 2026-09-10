#!/usr/bin/env python3
"""
screen_routes.py — score every candidate third route through the real model.

fetch_routes.py finds roads that are geometrically different. This decides
whether any of them is actually *better*, which distance alone cannot tell you:
a longer road with gentler grades, fewer villages and softer bends can beat a
short one over a pass.

Each candidate gets real DEM elevation from the same source as the published
routes (EU-DEM 25 m via opentopodata), but sampled every 100 m rather than
every 25 m: that is four times fewer API calls, and after the model's grade
smoothing it ranks candidates identically. Whichever route is adopted is then
re-fetched at the full 25 m by fetch_real_data.py.

Everything else — curvature, speed profile, stops, energy — is the same
model.py code that produces the published numbers.

Usage
-----
    python3 screen_routes.py                # rank candidates
    python3 screen_routes.py --car id3      # rank by a specific car
"""
import argparse
import json
import os
import time
import urllib.parse
import urllib.request

from geo import read_gpx, resample
from model import STEP, CARS, build_route, simulate

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "data")
GPXDIR = os.path.join(DATA, "gpx")
CACHE = os.path.join(DATA, "candidate_elevation.json")

SCREEN_STEP = 100.0     # DEM sampling for screening; the model grid stays 25 m


def opentopo(points, pause=1.05):
    """Batched EU-DEM 25 m elevation, throttled to the free tier's 1 call/s."""
    out = []
    for i in range(0, len(points), 100):
        chunk = points[i:i + 100]
        locs = "|".join(f"{p[0]:.6f},{p[1]:.6f}" for p in chunk)
        url = ("https://api.opentopodata.org/v1/eudem25m?locations="
               + urllib.parse.quote(locs))
        for attempt in range(5):
            try:
                req = urllib.request.Request(
                    url, headers={"User-Agent": "eco-navigation/2.0"})
                with urllib.request.urlopen(req, timeout=90) as r:
                    js = json.load(r)
                out.extend(x["elevation"] for x in js["results"])
                break
            except Exception:                      # noqa: BLE001
                time.sleep(3.0 * (attempt + 1))
        else:
            raise RuntimeError("opentopodata failed repeatedly")
        print(f"    {min(i+100, len(points))}/{len(points)}", end="\r", flush=True)
        time.sleep(pause)
    print(" " * 40, end="\r")
    return out


def load_cache():
    return json.load(open(CACHE)) if os.path.exists(CACHE) else {}


def elevation_for(key, pts, cache):
    """Coarse DEM samples, linearly interpolated onto the 25 m model grid."""
    coarse, _ = resample(pts, SCREEN_STEP)
    fine, _ = resample(pts, STEP)
    if key in cache and len(cache[key]) == len(coarse):
        ele = cache[key]
    else:
        print(f"  fetching {len(coarse)} elevations for {key}")
        ele = [e if e is not None else 400.0
               for e in opentopo([(p[0], p[1]) for p in coarse])]
        cache[key] = ele
        json.dump(cache, open(CACHE, "w"))

    # linear interpolation coarse -> fine, by distance along the track
    xs = [p[2] for p in coarse]
    out, j = [], 0
    for p in fine:
        d = p[2]
        while j + 1 < len(xs) - 1 and xs[j + 1] < d:
            j += 1
        x0, x1 = xs[j], xs[min(j + 1, len(xs) - 1)]
        e0, e1 = ele[j], ele[min(j + 1, len(ele) - 1)]
        f = (d - x0) / (x1 - x0) if x1 > x0 else 0.0
        out.append(e0 + (e1 - e0) * max(0.0, min(1.0, f)))
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--car", default="auris", help="car id to rank by")
    args = ap.parse_args()

    cands = json.load(open(os.path.join(DATA, "route_candidates.json")))
    car = next(c for c in CARS if c["id"] == args.car)
    cache = load_cache()

    entries = []
    # the two published routes, as the benchmark
    for key, fn, label in (("arnbruck", "route_arnbruck.gpx", "A · Arnbruck"),
                           ("koetzting", "route_viechtach_koetzting.gpx",
                            "B · Viechtach/Kötzting")):
        entries.append((key, label, read_gpx(os.path.join(GPXDIR, fn)), True))
    for c in cands["candidates"]:
        entries.append((c["key"], f"via {c['key']}", c["geom"], False))

    rows = []
    for key, label, pts, published in entries:
        ele = elevation_for(key, pts, cache)
        r = build_route(key, label, "#888", pts, ele_raw=ele)
        res = simulate(r, car)
        rows.append({
            "key": key, "label": label, "published": published,
            "km": r["total_km"],
            "ascent": r["elev_stats"]["ascent_m"],
            "max_m": r["elev_stats"]["max_m"],
            "curv": r["curviness"]["deg_per_km"],
            "idx": r["curviness"]["curviness_index"],
            "stops": r["stops_est"],
            "min": res["time_min"],
            "per100": res["per100"],
            "cost": res["cost_eur"],
            "co2": res["co2_kg"],
            "mtn": res["mountain"]["cost_eur"],
            "crv": res["curves"]["cost_eur"],
        })

    rows.sort(key=lambda r: r["cost"])
    print(f"\nRanked by cost for the {car['name']} "
          f"(all figures per one-way trip)\n")
    hdr = (f"{'route':22s}{'km':>7s}{'asc m':>7s}{'max m':>7s}{'°/km':>7s}"
           f"{'stops':>6s}{'min':>6s}{'/100km':>8s}{'cost':>8s}"
           f"{'mtn€':>7s}{'crv€':>7s}")
    print(hdr)
    print("-" * len(hdr))
    for r in rows:
        mark = " *" if r["published"] else "  "
        print(f"{r['label'][:20]:20s}{mark}{r['km']:7.2f}{r['ascent']:7.0f}"
              f"{r['max_m']:7.0f}{r['curv']:7.1f}{r['stops']:6d}{r['min']:6.0f}"
              f"{r['per100']:8.2f}{r['cost']:8.2f}{r['mtn']:7.2f}{r['crv']:7.2f}")
    print("\n* = already published in this experiment")

    best = rows[0]
    bestA = next(r for r in rows if r["key"] == "arnbruck")
    print(f"\nCheapest overall : {best['label']} (€{best['cost']:.2f})")
    print(f"Route A          : €{bestA['cost']:.2f}")
    newbest = next((r for r in rows if not r["published"]), None)
    if newbest:
        d = newbest["cost"] - bestA["cost"]
        print(f"Best new option  : {newbest['label']} — €{newbest['cost']:.2f} "
              f"({'+' if d > 0 else ''}{d:.2f} vs A)")
    json.dump(rows, open(os.path.join(DATA, "candidate_scores.json"), "w"), indent=1)
    print(f"\nwrote data/candidate_scores.json")


if __name__ == "__main__":
    main()
