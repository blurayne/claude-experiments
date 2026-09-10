#!/usr/bin/env python3
"""
fetch_real_data.py — download REAL terrain and road data for every route.

This used to be a stub: the sandbox that produced the first version of this
experiment had no outbound HTTPS, so build.py fell back to interpolating a
handful of researched town elevations. The APIs are reachable now, so this
script does the real thing and build.py consumes its output.

What it produces (all cached under data/, all committed):

  data/elevation_<route>.json    per-point elevation along the track, sampled
                                 at the DEM's native resolution (25 m), from
                                 EU-DEM 25 m via opentopodata, cross-checked
                                 against Copernicus GLO-90 via open-meteo.
  data/speedlimits_<route>.json  OSM `maxspeed` / `highway` for every way the
                                 track runs along, matched per track point.

Sampling density
----------------
EU-DEM is a 25 m raster, so we sample the track every 25 m: denser sampling
returns interpolated values and buys no new information. A 55 km route is
~2 200 points; the two original routes plus the new third route come to about
7 500 real elevation readings, versus the 16 hand-guessed town anchors the
first version used.

Rate limits
-----------
opentopodata's free tier allows 100 locations per call and 1 call/s
(1 000 calls/day). open-meteo allows 100 coordinates per call. Both are
batched and throttled below. A full refresh of all three routes costs about
75 calls to each service and takes ~2 minutes.

Usage
-----
    python3 fetch_real_data.py                 # elevation for every GPX
    python3 fetch_real_data.py --speed         # + OSM speed limits
    python3 fetch_real_data.py --force         # ignore the cache, refetch
    python3 fetch_real_data.py --provider open-meteo
"""
import argparse
import json
import os
import sys
import time
import urllib.parse
import urllib.request

from geo import hav, read_gpx, resample

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "data")
GPXDIR = os.path.join(DATA, "gpx")

STEP_M = 25.0          # matches EU-DEM's native 25 m raster
BATCH = 100            # both providers cap at 100 locations per request

USER_AGENT = "eco-navigation/2.0 (github pages experiment; contact via repo)"


def http_get(url, timeout=60, retries=4):
    last = None
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return json.load(r)
        except Exception as exc:               # noqa: BLE001 - retry anything
            last = exc
            time.sleep(1.5 * (attempt + 1))
    raise RuntimeError(f"GET failed after {retries} tries: {url[:110]}… ({last})")


# --------------------------------------------------------------- providers
def ele_opentopodata(chunk, dataset="eudem25m"):
    locs = "|".join(f"{p[0]:.6f},{p[1]:.6f}" for p in chunk)
    url = ("https://api.opentopodata.org/v1/%s?locations=%s"
           % (dataset, urllib.parse.quote(locs)))
    js = http_get(url)
    if js.get("status") != "OK":
        raise RuntimeError(f"opentopodata: {js.get('error', js.get('status'))}")
    time.sleep(1.05)                            # free tier: 1 call/s
    return [r["elevation"] for r in js["results"]]


def ele_open_meteo(chunk, dataset=None):
    lats = ",".join(f"{p[0]:.6f}" for p in chunk)
    lons = ",".join(f"{p[1]:.6f}" for p in chunk)
    js = http_get("https://api.open-meteo.com/v1/elevation"
                  f"?latitude={lats}&longitude={lons}")
    return list(js["elevation"])


PROVIDERS = {
    "opentopodata": (ele_opentopodata, "EU-DEM 25 m (Copernicus/EEA) via opentopodata"),
    "open-meteo": (ele_open_meteo, "Copernicus DEM GLO-90 via open-meteo"),
}


def fetch_elevations(points, provider, dataset="eudem25m", label=""):
    fn, _desc = PROVIDERS[provider]
    out = []
    for i in range(0, len(points), BATCH):
        out.extend(fn(points[i:i + BATCH], dataset))
        done = min(i + BATCH, len(points))
        print(f"    {label}{provider}: {done}/{len(points)}", end="\r", flush=True)
    print(" " * 70, end="\r")
    if len(out) != len(points):
        raise RuntimeError(f"{provider} returned {len(out)} of {len(points)}")
    return out


# ---------------------------------------------------------------- elevation
def clean(values, points):
    """Replace None / absurd DEM readings by linear interpolation.

    EU-DEM has occasional voids and the odd spike over water or steep cuts.
    Anything outside 200–1500 m is impossible in this corridor (the Bavarian
    Forest tops out at 1456 m and the Danube at Deggendorf sits at ~312 m).
    """
    n = len(values)
    ok = [v if (v is not None and 200.0 <= v <= 1500.0) else None for v in values]
    bad = sum(1 for v in ok if v is None)
    if all(v is None for v in ok):
        raise RuntimeError("every elevation sample was rejected")
    # forward/backward fill the ends, linear-interpolate interior gaps
    first = next(i for i, v in enumerate(ok) if v is not None)
    last = max(i for i, v in enumerate(ok) if v is not None)
    for i in range(first):
        ok[i] = ok[first]
    for i in range(last + 1, n):
        ok[i] = ok[last]
    i = first
    while i <= last:
        if ok[i] is not None:
            i += 1
            continue
        j = i
        while ok[j] is None:
            j += 1
        e0, e1 = ok[i - 1], ok[j]
        for k in range(i, j):
            ok[k] = e0 + (e1 - e0) * (k - i + 1) / (j - i + 1)
        i = j
    return ok, bad


def elevation_for_route(key, gpx_path, provider, dataset, cross_check=True):
    pts = read_gpx(gpx_path)
    rs, total = resample(pts, STEP_M)
    coords = [(p[0], p[1]) for p in rs]
    print(f"  {key}: {total/1000:.2f} km -> {len(coords)} samples @ {STEP_M:.0f} m")

    primary = fetch_elevations(coords, provider, dataset, label=f"{key} ")
    primary, voids = clean(primary, coords)

    check = None
    if cross_check and provider != "open-meteo":
        try:
            other = fetch_elevations(coords, "open-meteo", label=f"{key} check ")
            other, _ = clean(other, coords)
            diffs = [abs(a - b) for a, b in zip(primary, other)]
            rms = (sum(d * d for d in diffs) / len(diffs)) ** 0.5
            check = {
                "dataset": PROVIDERS["open-meteo"][1],
                "rms_diff_m": round(rms, 2),
                "max_diff_m": round(max(diffs), 1),
                "mean_diff_m": round(sum(diffs) / len(diffs), 2),
            }
            print(f"    cross-check vs GLO-90: RMS {rms:.1f} m, max {max(diffs):.0f} m")
        except Exception as exc:                # noqa: BLE001
            print(f"    cross-check skipped ({exc})")

    return {
        "route": key,
        "source": PROVIDERS[provider][1],
        "provider": provider,
        "dataset": dataset if provider == "opentopodata" else None,
        "step_m": STEP_M,
        "n": len(coords),
        "total_km": round(total / 1000.0, 3),
        "voids_interpolated": voids,
        "cross_check": check,
        "dist_m": [round(p[2], 1) for p in rs],
        "lat": [round(p[0], 6) for p in rs],
        "lon": [round(p[1], 6) for p in rs],
        "ele_m": [round(e, 2) for e in primary],
    }


# -------------------------------------------------------------- speedlimits
def speedlimits_for_route(key, gpx_path):
    """Fetch OSM maxspeed for ways near the track and match them per point.

    Overpass returns candidate ways in a corridor around the track; we then
    snap every 25 m track point to the nearest way geometry within 25 m and
    inherit that way's tags. Points with no match keep a null and build.py
    falls back to the StVO default for the zone.
    """
    pts = read_gpx(gpx_path)
    rs, _total = resample(pts, STEP_M)
    lats = [p[0] for p in rs]
    lons = [p[1] for p in rs]
    pad = 0.004                                  # ~450 m of slack around the track
    bbox = (min(lats) - pad, min(lons) - pad, max(lats) + pad, max(lons) + pad)
    q = ("[out:json][timeout:120];"
         "way(%f,%f,%f,%f)[highway~'^(motorway|trunk|primary|secondary|tertiary|"
         "unclassified|residential|living_street|motorway_link|trunk_link|"
         "primary_link|secondary_link|tertiary_link)$'];out tags geom;" % bbox)
    url = "https://overpass-api.de/api/interpreter?data=" + urllib.parse.quote(q)
    print(f"  {key}: querying Overpass ({bbox[2]-bbox[0]:.3f}° x {bbox[3]-bbox[1]:.3f}° bbox)")
    js = http_get(url, timeout=180)
    ways = js.get("elements", [])
    print(f"    {len(ways)} ways returned; snapping {len(rs)} track points")

    # spatial hash of way vertices -> way index, so snapping stays O(n)
    CELL = 0.0025                                # ~275 m lat / ~180 m lon here
    grid = {}
    for wi, w in enumerate(ways):
        for nd in w.get("geometry") or []:
            grid.setdefault((int(nd["lat"] / CELL), int(nd["lon"] / CELL)), set()).add(wi)

    maxspeed, highway, names, matched = [], [], [], 0
    for p in rs:
        cx, cy = int(p[0] / CELL), int(p[1] / CELL)
        cand = set()
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                cand |= grid.get((cx + dx, cy + dy), set())
        best, best_d = None, 30.0                # accept a match within 30 m
        for wi in cand:
            for nd in ways[wi].get("geometry") or []:
                d = hav((p[0], p[1]), (nd["lat"], nd["lon"]))
                if d < best_d:
                    best, best_d = wi, d
        if best is None:
            maxspeed.append(None)
            highway.append(None)
            names.append(None)
            continue
        matched += 1
        tags = ways[best].get("tags", {})
        maxspeed.append(tags.get("maxspeed"))
        highway.append(tags.get("highway"))
        names.append(tags.get("ref") or tags.get("name"))
    print(f"    matched {matched}/{len(rs)} points "
          f"({100*matched/len(rs):.1f}%), "
          f"{sum(1 for m in maxspeed if m)} with an explicit maxspeed")

    return {
        "route": key,
        "source": "OpenStreetMap via Overpass API",
        "step_m": STEP_M,
        "n": len(rs),
        "matched": matched,
        "maxspeed": maxspeed,
        "highway": highway,
        "road": names,
    }


# --------------------------------------------------------------------- main
def route_key(fn):
    return fn[len("route_"):-len(".gpx")] if fn.startswith("route_") else fn[:-4]


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[1])
    ap.add_argument("--provider", default="opentopodata", choices=list(PROVIDERS))
    ap.add_argument("--dataset", default="eudem25m",
                    help="opentopodata dataset (eudem25m, srtm30m, mapzen…)")
    ap.add_argument("--speed", action="store_true",
                    help="also fetch OSM maxspeed via Overpass")
    ap.add_argument("--force", action="store_true",
                    help="refetch even if a cache file already exists")
    ap.add_argument("--no-cross-check", action="store_true")
    ap.add_argument("--only", help="limit to one route key (e.g. arnbruck)")
    args = ap.parse_args()

    if not os.path.isdir(GPXDIR):
        sys.exit(f"no GPX directory at {GPXDIR}")
    tracks = sorted(f for f in os.listdir(GPXDIR) if f.endswith(".gpx"))
    if not tracks:
        sys.exit(f"no .gpx files in {GPXDIR}")

    print(f"Elevation source: {PROVIDERS[args.provider][1]}")
    for fn in tracks:
        key = route_key(fn)
        if args.only and key != args.only:
            continue
        path = os.path.join(GPXDIR, fn)

        out = os.path.join(DATA, f"elevation_{key}.json")
        if args.force or not os.path.exists(out):
            data = elevation_for_route(key, path, args.provider, args.dataset,
                                       cross_check=not args.no_cross_check)
            with open(out, "w") as f:
                json.dump(data, f)
            print(f"    wrote {os.path.relpath(out, HERE)} "
                  f"({data['n']} points, {data['voids_interpolated']} voids filled)")
        else:
            print(f"  {key}: elevation cached — use --force to refetch")

        if args.speed:
            outs = os.path.join(DATA, f"speedlimits_{key}.json")
            if args.force or not os.path.exists(outs):
                data = speedlimits_for_route(key, path)
                with open(outs, "w") as f:
                    json.dump(data, f)
                print(f"    wrote {os.path.relpath(outs, HERE)}")
            else:
                print(f"  {key}: speed limits cached — use --force to refetch")

    print("\nDone. Run `python3 build.py` to rebuild the model on the real data.")


if __name__ == "__main__":
    main()
