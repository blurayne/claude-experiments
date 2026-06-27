#!/usr/bin/env python3
"""
fetch_real_data.py — replace MODELLED elevation (and optionally speed limits)
with REAL data, for use wherever an elevation API / Overpass is reachable.

In the sandbox that produced this experiment, every routing/elevation/OSM API
was blocked by the egress policy, so build.py falls back to researched town
elevations interpolated along the track. Run THIS script in an environment with
outbound HTTPS to upgrade the GPX tracks with true per-point elevation; then run
build.py again — it will detect the <ele> tags and use the measured profile.

What it does
------------
1. Reads each GPX in data/gpx/.
2. Samples track points (every ~Nth point to respect API limits).
3. Queries an elevation API (default: Open-Meteo, batched) for each sample.
4. Writes the elevation back into the GPX as <ele> tags (interpolating the
   skipped points), saving *_ele.gpx next to the originals.
5. (Optional, --speed) queries the Overpass API for maxspeed along the corridor
   and writes data/speedlimits_<route>.json.

Then point build.py at the *_ele.gpx files (or overwrite the originals) and add
a small reader so it prefers measured <ele> over the modelled anchors.

Usage
-----
    python3 fetch_real_data.py                 # elevation only
    python3 fetch_real_data.py --speed         # + Overpass speed limits
    python3 fetch_real_data.py --provider opentopodata --dataset eudem25m

This script is intentionally dependency-light (urllib only). It is a STUB in the
sense that it was never run here (no network); the logic is straightforward and
ready to run where APIs are allowed.
"""
import argparse, json, os, sys, time, urllib.request, urllib.parse
import xml.etree.ElementTree as ET

HERE = os.path.dirname(os.path.abspath(__file__))
GPXDIR = os.path.join(HERE, "data", "gpx")
NS = "http://www.topografix.com/GPX/1/1"

PROVIDERS = {
    # name: (url_template, builds locations param, parses response -> [elev])
    "open-meteo": "https://api.open-meteo.com/v1/elevation?latitude={lats}&longitude={lons}",
    "opentopodata": "https://api.opentopodata.org/v1/{dataset}?locations={locs}",
    "open-elevation": "https://api.open-elevation.com/api/v1/lookup?locations={locs}",
}

def http_get(url, timeout=30):
    req = urllib.request.Request(url, headers={"User-Agent": "eco-nav/1.0"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.load(r)

def elevations(provider, pts, dataset="eudem25m", batch=100):
    """Return one elevation per point in pts=[(lat,lon),...]."""
    out = []
    for i in range(0, len(pts), batch):
        chunk = pts[i:i+batch]
        if provider == "open-meteo":
            lats = ",".join(f"{p[0]:.6f}" for p in chunk)
            lons = ",".join(f"{p[1]:.6f}" for p in chunk)
            url = PROVIDERS[provider].format(lats=lats, lons=lons)
            js = http_get(url)
            out.extend(js["elevation"])
        elif provider == "opentopodata":
            locs = "|".join(f"{p[0]:.6f},{p[1]:.6f}" for p in chunk)
            url = PROVIDERS[provider].format(dataset=dataset,
                                             locs=urllib.parse.quote(locs))
            js = http_get(url)
            out.extend(r["elevation"] for r in js["results"])
            time.sleep(1.0)            # opentopodata free tier: 1 req/s
        elif provider == "open-elevation":
            locs = "|".join(f"{p[0]:.6f},{p[1]:.6f}" for p in chunk)
            url = PROVIDERS[provider].format(locs=urllib.parse.quote(locs))
            js = http_get(url)
            out.extend(r["elevation"] for r in js["results"])
        else:
            raise SystemExit(f"unknown provider {provider}")
        print(f"  ...{min(i+batch,len(pts))}/{len(pts)} points")
    return out

def enrich_gpx(path, provider, dataset, every):
    tree = ET.parse(path)
    root = tree.getroot()
    trkpts = list(root.iter("{%s}trkpt" % NS))
    coords = [(float(p.get("lat")), float(p.get("lon"))) for p in trkpts]
    sample_idx = list(range(0, len(coords), every))
    if sample_idx[-1] != len(coords) - 1:
        sample_idx.append(len(coords) - 1)
    sample_pts = [coords[i] for i in sample_idx]
    print(f"{os.path.basename(path)}: {len(coords)} pts, querying {len(sample_pts)}")
    sampled_ele = elevations(provider, sample_pts, dataset)

    # linear-interpolate elevation onto every track point
    full = [None] * len(coords)
    for k in range(len(sample_idx) - 1):
        i0, i1 = sample_idx[k], sample_idx[k + 1]
        e0, e1 = sampled_ele[k], sampled_ele[k + 1]
        for i in range(i0, i1 + 1):
            f = (i - i0) / (i1 - i0) if i1 != i0 else 0
            full[i] = e0 + (e1 - e0) * f
    for p, e in zip(trkpts, full):
        el = ET.SubElement(p, "{%s}ele" % NS)
        el.text = f"{e:.1f}"
    outpath = path.replace(".gpx", "_ele.gpx")
    tree.write(outpath, encoding="utf-8", xml_declaration=True)
    print(f"  wrote {outpath}")

def fetch_speedlimits(path):
    """Query Overpass for maxspeed in a bbox around the track; save raw JSON."""
    tree = ET.parse(path); root = tree.getroot()
    coords = [(float(p.get("lat")), float(p.get("lon")))
              for p in root.iter("{%s}trkpt" % NS)]
    lats = [c[0] for c in coords]; lons = [c[1] for c in coords]
    bbox = (min(lats), min(lons), max(lats), max(lons))
    q = ("[out:json][timeout:60];way(%f,%f,%f,%f)[highway][maxspeed];"
         "out tags geom;") % bbox
    url = "https://overpass-api.de/api/interpreter?data=" + urllib.parse.quote(q)
    js = http_get(url, timeout=90)
    name = os.path.basename(path).replace(".gpx", "")
    outp = os.path.join(HERE, "data", f"speedlimits_{name}.json")
    with open(outp, "w") as f:
        json.dump(js, f)
    print(f"  wrote {outp} ({len(js.get('elements', []))} ways)")

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--provider", default="open-meteo", choices=list(PROVIDERS))
    ap.add_argument("--dataset", default="eudem25m",
                    help="opentopodata dataset (e.g. eudem25m, srtm30m)")
    ap.add_argument("--every", type=int, default=4,
                    help="sample every Nth track point (default 4 ≈ every 100 m)")
    ap.add_argument("--speed", action="store_true",
                    help="also fetch Overpass maxspeed data")
    args = ap.parse_args()
    if not os.path.isdir(GPXDIR):
        sys.exit(f"no GPX dir at {GPXDIR}")
    for fn in sorted(os.listdir(GPXDIR)):
        if fn.endswith(".gpx") and not fn.endswith("_ele.gpx"):
            path = os.path.join(GPXDIR, fn)
            enrich_gpx(path, args.provider, args.dataset, args.every)
            if args.speed:
                fetch_speedlimits(path)
    print("\nDone. Point build.py at the *_ele.gpx tracks (or overwrite the "
          "originals) and prefer measured <ele> over the modelled anchors.")

if __name__ == "__main__":
    main()
