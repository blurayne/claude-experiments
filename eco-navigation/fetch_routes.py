#!/usr/bin/env python3
"""
fetch_routes.py — search for a genuinely different third way from Deggendorf
to Engelshütt, and save the best candidate as a GPX track.

Why a search and not a guess
----------------------------
The two routes already in this experiment are real CoMaps tracks the user
drove/planned. To add a third we ask a routing engine (OSRM, on the public
OSM car profile) for the road network's opinion: route the same origin and
destination through a list of plausible intermediate towns, then keep the
candidates that are actually *different* roads rather than the same valley
with a detour tacked on.

Distinctness is measured by snapping each candidate to a ~275 m grid and
computing the fraction of its cells shared with route A and route B. A
candidate that overlaps either existing route by more than OVERLAP_MAX is a
variation, not an alternative, and is dropped.

The surviving candidates are written to data/route_candidates.json with their
geometry, so build.py can score every one of them through the full energy
model — distance alone does not decide which route is "better", and neither
does the routing engine's own duration estimate.

Usage
-----
    python3 fetch_routes.py                 # search, report, save candidates
    python3 fetch_routes.py --adopt regen   # write data/gpx/route_regen.gpx
"""
import argparse
import json
import os
import time
import urllib.parse
import urllib.request

from geo import path_length, read_gpx, write_gpx

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "data")
GPXDIR = os.path.join(DATA, "gpx")

START = (48.833358, 12.962045)      # Deggendorf — first point of both GPX tracks
END = (49.206675, 13.031865)        # Engelshütt — last point of both GPX tracks

OSRM = "https://router.project-osrm.org/route/v1/driving/"

# Intermediate towns worth forcing a route through. Each entry is a label and
# the via points to thread the route through, in order.
CANDIDATES = {
    "direct":          [],
    "regen":           [(48.9744, 13.1281)],                        # B11 up the Regen valley
    "bodenmais":       [(49.0714, 13.1000)],
    "regen_bodenmais": [(48.9744, 13.1281), (49.0714, 13.1000)],
    "bodenmais_lam":   [(49.0714, 13.1000), (49.1975, 13.0553)],
    "lam":             [(49.1975, 13.0553)],
    "viechtach":       [(49.0786, 12.8856)],
    "koetzting":       [(49.1786, 12.8556)],
    "miltach":         [(49.1550, 12.8000)],
    "kirchberg":       [(48.9422, 13.1856)],
    "zwiesel":         [(49.0175, 13.2367)],
    "ruhmannsfelden":  [(48.9800, 12.9710)],
    "cham":            [(49.2233, 12.6614)],
}

OVERLAP_MAX = 65.0        # % of grid cells shared with an existing route
KM_MAX = 90.0             # anything longer is a sightseeing trip, not a route
CELL = 0.0025             # ~275 m grid cell for the overlap measure


def osrm_route(vias, timeout=45):
    pts = [START] + list(vias) + [END]
    coords = ";".join(f"{p[1]:.6f},{p[0]:.6f}" for p in pts)
    url = (OSRM + coords
           + "?overview=full&geometries=geojson&continue_straight=false&annotations=false")
    req = urllib.request.Request(url, headers={"User-Agent": "eco-navigation/2.0"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        js = json.load(r)
    if js.get("code") != "Ok" or not js.get("routes"):
        return None
    rt = js["routes"][0]
    return {
        "geom": [(c[1], c[0]) for c in rt["geometry"]["coordinates"]],
        "osrm_km": rt["distance"] / 1000.0,
        "osrm_min": rt["duration"] / 60.0,
    }


def cells(pts):
    return {(int(round(p[0] / CELL)), int(round(p[1] / CELL))) for p in pts}


def overlap_pct(a_cells, b_cells):
    return 100.0 * len(a_cells & b_cells) / max(len(a_cells), 1)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--adopt", help="write data/gpx/route_<key>.gpx for this candidate")
    ap.add_argument("--overlap-max", type=float, default=OVERLAP_MAX)
    args = ap.parse_args()

    existing = {}
    for fn, key in (("route_arnbruck.gpx", "arnbruck"),
                    ("route_viechtach_koetzting.gpx", "koetzting")):
        p = os.path.join(GPXDIR, fn)
        if os.path.exists(p):
            pts = read_gpx(p)
            existing[key] = {"cells": cells(pts), "km": path_length(pts) / 1000.0}

    print(f"Existing routes: " + ", ".join(
        f"{k} {v['km']:.2f} km" for k, v in existing.items()))
    print(f"\n{'candidate':18s}{'km':>8s}{'min':>7s}"
          + "".join(f"{'ovl ' + k:>13s}" for k in existing) + "   verdict")

    results = []
    for label, vias in CANDIDATES.items():
        try:
            r = osrm_route(vias)
        except Exception as exc:                # noqa: BLE001
            print(f"{label:18s}  query failed: {exc}")
            continue
        time.sleep(0.3)
        if r is None:
            print(f"{label:18s}  no route")
            continue
        c = cells(r["geom"])
        ovl = {k: overlap_pct(c, v["cells"]) for k, v in existing.items()}
        worst = max(ovl.values()) if ovl else 0.0
        if r["osrm_km"] > KM_MAX:
            verdict = "too long"
        elif worst > args.overlap_max:
            verdict = f"duplicate of {max(ovl, key=ovl.get)}"
        else:
            verdict = "DISTINCT"
            results.append({
                "key": label, "vias": vias, "geom": r["geom"],
                "osrm_km": round(r["osrm_km"], 2),
                "osrm_min": round(r["osrm_min"], 1),
                "overlap_pct": {k: round(v, 1) for k, v in ovl.items()},
            })
        print(f"{label:18s}{r['osrm_km']:8.2f}{r['osrm_min']:7.1f}"
              + "".join(f"{ovl[k]:12.1f}%" for k in existing)
              + f"   {verdict}")

    results.sort(key=lambda r: r["osrm_km"])
    os.makedirs(DATA, exist_ok=True)
    out = os.path.join(DATA, "route_candidates.json")
    with open(out, "w") as f:
        json.dump({
            "source": "OSRM demo server (public OSM car profile)",
            "start": START, "end": END,
            "overlap_max_pct": args.overlap_max,
            "candidates": results,
        }, f)
    print(f"\n{len(results)} distinct candidate(s) -> {os.path.relpath(out, HERE)}")

    if args.adopt:
        match = next((r for r in results if r["key"] == args.adopt), None)
        if not match:
            raise SystemExit(f"'{args.adopt}' is not among the distinct candidates")
        path = os.path.join(GPXDIR, f"route_{args.adopt}.gpx")
        write_gpx(path, match["geom"], name=f"Deggendorf → Engelshütt via {args.adopt}")
        print(f"wrote {os.path.relpath(path, HERE)} "
              f"({len(match['geom'])} points, {match['osrm_km']} km)")


if __name__ == "__main__":
    main()
