#!/usr/bin/env python3
"""
Eco-Navigation — build route + energy data for the Deggendorf → Engelshütt
comparison.

Pipeline
--------
1. Parse each route's GPX track (real geometry).
2. Resample to a uniform 25 m grid — the same resolution as the elevation
   raster, so terrain and geometry line up cell for cell.
3. Attach REAL elevation from data/elevation_<route>.json (EU-DEM 25 m,
   downloaded by fetch_real_data.py), de-spike it, smooth it, differentiate it
   into road grade.
4. Attach REAL speed limits from data/speedlimits_<route>.json (OpenStreetMap
   `maxspeed` via Overpass), falling back to German StVO defaults where a way
   carries no tag.
5. Derive curvature on the uniform grid, cap speed by bend radius and by
   comfortable acceleration, and estimate stops in built-up areas.
6. Run the longitudinal energy model for five cars, plus two counterfactuals
   per car — the same trip on a flat road, and on a straight one — which is
   what produces the mountain-energy and curve-energy metrics.
7. Emit JSON + CSV data files and an embeddable data.js for the HTML viewer.

Data provenance
---------------
- Geometry, distance, curviness : REAL (GPX; routes A and B are CoMaps tracks,
  route C is an OSRM route over the OSM road network).
- Elevation and grade           : REAL (EU-DEM 25 m, ~2 200–2 700 samples per
  route, conditioned and smoothed — see model.py).
- Speed limits                  : REAL where OSM tags one, StVO default else.
- Stops at lights / junctions   : MODELLED (per built-up area).
- Car / energy / price / CO2    : MODELLED (published spec + typical real-world
  figures; model estimates, not telemetry).

Run:  python3 build.py            (pure standard library, no network)
      python3 fetch_real_data.py  first, to download the terrain and OSM data.
"""
import csv
import json
import os
import sys

from geo import read_gpx
from model import CARS, build_route, simulate

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "data")
GPXDIR = os.path.join(DATA, "gpx")
os.makedirs(DATA, exist_ok=True)

GENERATED = "2026-09-10"

# key -> (track stem, display name, colour). The stem names the GPX file
# (data/gpx/route_<stem>.gpx) and the elevation_/speedlimits_<stem>.json
# caches that fetch_real_data.py writes.
ROUTES = [
    ("arnbruck", "arnbruck",
     "Route A — via Arnbruck (Zellertal & Eck pass)", "#E0A800"),
    ("koetzting", "viechtach_koetzting",
     "Route B — via Viechtach & Bad Kötzting", "#E51B23"),
    ("bodenmais", "bodenmais",
     "Route C — via Bodenmais", "#4FA6E0"),
    ("regen", "regen",
     "Route D — via Regen (B11 valley)", "#A78BFA"),
]

# Short labels for charts and tables.
SHORT = {"arnbruck": "A · Arnbruck", "koetzting": "B · Viechtach/Kötzting",
         "bodenmais": "C · Bodenmais", "regen": "D · Regen"}

# Per-route TL;DR: what the route is, and the IF — the conditions under which
# it is the right choice. Grounded in the measured data; see METHODOLOGY.
TLDR = {
    "arnbruck": {
        "label": "The default",
        "choose_if": "the weather is clear. Cheapest and fastest for every "
                     "car, despite crossing the highest point of any route "
                     "except D — its 10.7 km distance advantage beats the "
                     "843 m Eck saddle.",
        "avoid_if": "there is snow or ice: the saddle, its 9 % ramps and the "
                    "tightest bends of all four routes (median radius 478 m, "
                    "hairpins down to 25 m) make it the first to become "
                    "unpleasant. Also has six Waldbahn level crossings.",
    },
    "koetzting": {
        "label": "The all-weather route",
        "choose_if": "it is winter, the Eck saddle is snowed in, chains are "
                     "required, or you tow a heavy load in bad conditions — "
                     "this is the only route that stays below 600 m. Never "
                     "the cheapest, but always open.",
        "avoid_if": "conditions are good — you pay ~€0.6–0.9 extra per trip "
                    "and 10 minutes for altitude insurance you don't need. "
                    "Most traffic lights of any route (12 signals).",
    },
    "bodenmais": {
        "label": "The relaxed alternative",
        "choose_if": "you want a calmer drive in good weather or have an "
                     "errand in Bodenmais: the least curvy route per km with "
                     "the gentlest bends (median radius 529 m), and cheaper "
                     "and faster than B for every car.",
        "avoid_if": "you are in a hurry or it is snowing — it crosses the "
                    "same 843 m saddle as A, and its six roundabouts plus "
                    "five level crossings make it the stoppiest route "
                    "(9.1 expected stops).",
    },
    "regen": {
        "label": "The steady cruiser",
        "choose_if": "you dislike stop-and-go above all (fewest expected "
                     "stops, 6.9, and only one level crossing) or have an "
                     "errand in Regen or Bodenmais — long uninterrupted B11 "
                     "running with the fewest built-up areas.",
        "avoid_if": "you care about cost or carry weight: the most climbing "
                    "of any route (1 299 m ascent, 859 m peak) makes it the "
                    "dearest for four of the five cars, and it crosses the "
                    "ridge even higher than A does.",
    },
}


def load_json(path):
    if not os.path.exists(path):
        return None
    with open(path) as f:
        return json.load(f)


def main():
    routes, results = {}, {}
    for key, stem, name, color in ROUTES:
        gpx = os.path.join(GPXDIR, f"route_{stem}.gpx")
        if not os.path.exists(gpx):
            sys.exit(f"missing {gpx} — run fetch_routes.py --adopt <key> first")
        elev = load_json(os.path.join(DATA, f"elevation_{stem}.json"))
        if elev is None:
            sys.exit(f"missing data/elevation_{stem}.json — run "
                     f"`python3 fetch_real_data.py` first (it needs network)")
        osm = load_json(os.path.join(DATA, f"speedlimits_{stem}.json"))
        stops = load_json(os.path.join(DATA, f"stops_{stem}.json"))

        r = build_route(key, name, color, read_gpx(gpx),
                        ele_raw=elev["ele_m"], osm=osm, stops=stops)
        r["elev_source"] = elev["source"]
        r["elev_samples"] = elev["n"]
        r["elev_cross_check"] = elev.get("cross_check")
        r["osm_source"] = (osm or {}).get("source")
        routes[key] = r
        results[key] = {c["id"]: simulate(r, c) for c in CARS}

    # ------------------------------------------------------------- outputs
    def profile_arrays(r, every=4):
        """Downsample the 25 m simulation grid to ~100 m for the charts."""
        idx = list(range(0, r["n"], every))
        if idx[-1] != r["n"] - 1:
            idx.append(r["n"] - 1)
        pick = lambda a: [a[i] for i in idx]                       # noqa: E731
        return {
            "dist_km": [round(r["dist_km"][i], 3) for i in idx],
            "elevation": pick(r["elevation"]),
            "grade_pct": pick(r["grade_pct"]),
            "curvature": pick(r["curvature"]),
            "speed_kmh": pick(r["speed_kmh"]),
            "legal_kmh": pick(r["legal_kmh"]),
            "lat": [round(r["lat"][i], 5) for i in idx],
            "lon": [round(r["lon"][i], 5) for i in idx],
        }

    cross = next((r["elev_cross_check"] for r in routes.values()
                  if r.get("elev_cross_check")), None)

    # --- what the real terrain changed, versus the first modelled version ---
    comparison = None
    try:
        from compare_versions import COMPARABLE, load_old
        old = load_old()
        comparison = {
            "old_generated": old["meta"]["generated"],
            "old_elevation": old["meta"]["provenance"]["elevation"],
            "routes": {}, "cars": {},
        }
        for k in COMPARABLE:
            oe = old["routes"][k]["elev_stats"]
            ne = routes[k]["elev_stats"]
            comparison["routes"][k] = {
                "peak_m": [oe["max_m"], ne["max_m"]],
                "ascent_m": [oe["ascent_m"], ne["ascent_m"]],
                "descent_m": [oe["descent_m"], ne["descent_m"]],
                "max_grade_pct": [oe["max_grade_pct"], ne["max_grade_pct"]],
                "curviness": [old["routes"][k]["curviness"]["deg_per_km"],
                              routes[k]["curviness"]["deg_per_km"]],
            }
            comparison["cars"][k] = {
                c["id"]: [old["results"][k][c["id"]]["cost_eur"],
                          results[k][c["id"]]["cost_eur"]] for c in CARS}
    except Exception as exc:                       # noqa: BLE001
        print(f"(comparison against the archived v1 bundle skipped: {exc})")
    bundle = {
        "meta": {
            "title": "Eco-Navigation — Deggendorf → Engelshütt (Bavarian Forest)",
            "generated": GENERATED,
            "elev_cross_check": cross,
            "provenance": {
                "geometry": "REAL — CoMaps GPX tracks (routes A, B) and an OSRM "
                            "route over the OSM road network (route C)",
                "distance": "REAL — from the track geometry",
                "curviness": "REAL — heading change per 100 m on a uniform 25 m grid",
                "village_zones": "RULE — proximity to town centres",
                "elevation": "REAL — EU-DEM 25 m (Copernicus/EEA) sampled every "
                             "25 m along each track, de-spiked and smoothed",
                "speed_limits": "REAL — OpenStreetMap maxspeed via Overpass, "
                                "with German StVO defaults where untagged",
                "stops": "MEASURED inventory — OSM traffic signals, stop/"
                         "give-way signs, roundabouts and level crossings "
                         "snapped to each track; the per-class probability of "
                         "actually stopping is a documented assumption "
                         "(e.g. 45% per signal)",
                "energy_model": "MODELLED — longitudinal vehicle physics, "
                                "calibrated to typical real-world consumption",
                "mountain_curve_metrics": "MODELLED — counterfactual re-runs of "
                                          "the same trip on a flat road, on a "
                                          "straight road, and on a green wave "
                                          "with no stops",
                "prices_co2": "Germany 2026 estimate: petrol 1.79 €/L, diesel "
                              "1.69 €/L, elec 0.40 €/kWh; grid 0.35 kg CO2/kWh",
            },
        },
        "cars": [{k: c[k] for k in ("id", "name", "type", "fuel", "mass",
                                    "CdA", "Crr", "power_kw", "note")}
                 for c in CARS],
        "routes": {k: {
            "key": k, "name": r["name"], "short": SHORT[k], "color": r["color"],
            "total_km": r["total_km"], "stops_est": r["stops_est"],
            "stops_measured": r["stops_measured"],
            "stop_inventory": r["stop_inventory"],
            "stops_by_kind": r["stops_by_kind"],
            "tldr": TLDR.get(k),
            "villages_passed": r["villages_passed"],
            "curviness": r["curviness"], "elev_stats": r["elev_stats"],
            "elev_source": r["elev_source"], "elev_samples": r["elev_samples"],
            "osm_limit_pct": r["osm_limit_pct"],
            "profile": profile_arrays(r),
        } for k, r in routes.items()},
        "route_order": [k for k, _s, _n, _c in ROUTES],
        "results": results,
        "comparison": comparison,
    }

    with open(os.path.join(DATA, "eco_data.json"), "w") as f:
        json.dump(bundle, f, ensure_ascii=False, indent=1)

    with open(os.path.join(HERE, "data.js"), "w") as f:
        f.write("// Auto-generated by build.py — do not edit by hand.\n")
        f.write("window.ECO_DATA = ")
        json.dump(bundle, f, ensure_ascii=False)
        f.write(";\n")

    with open(os.path.join(DATA, "results.csv"), "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["route", "route_name", "total_km", "car", "car_type",
                    "consumption", "unit_per_100km", "amount", "unit",
                    "cost_eur", "co2_kg", "time_min", "avg_kmh",
                    "mountain_amount", "mountain_cost_eur", "mountain_pct",
                    "curve_amount", "curve_cost_eur", "curve_time_min",
                    "stop_amount", "stop_cost_eur", "stop_time_min",
                    "work_climb_pct", "work_aero_pct", "work_roll_pct",
                    "work_accel_pct"])
        for k, r in routes.items():
            for c in CARS:
                res = results[k][c["id"]]
                w.writerow([k, r["name"], r["total_km"], c["name"], c["type"],
                            res["per100"], res["unit100"], res["amount"],
                            res["unit"], res["cost_eur"], res["co2_kg"],
                            res["time_min"], res["avg_kmh"],
                            res["mountain"]["amount"], res["mountain"]["cost_eur"],
                            res["mountain"]["pct_of_trip"],
                            res["curves"]["amount"], res["curves"]["cost_eur"],
                            res["curves"]["time_min_lost"],
                            res["stops"]["amount"], res["stops"]["cost_eur"],
                            res["stops"]["time_min_lost"],
                            res["work_pct"]["climb"], res["work_pct"]["aero"],
                            res["work_pct"]["roll"], res["work_pct"]["accel"]])

    with open(os.path.join(DATA, "route_metrics.csv"), "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["route", "route_name", "total_km", "ascent_m", "descent_m",
                    "net_m", "min_m", "max_m", "max_grade_pct", "min_grade_pct",
                    "pct_steep_ge5", "climb_work_kWh_per_tonne",
                    "curviness_deg_per_km", "curviness_index", "bends_per_km",
                    "median_curve_radius_m", "min_curve_radius_m", "pct_curvy",
                    "pct_hairpin", "pct_tight", "pct_moderate", "pct_gentle",
                    "pct_straight", "stops_expected", "signals", "roundabouts",
                    "stop_signs", "give_way_signs", "level_crossings",
                    "osm_limit_pct", "elevation_samples"])
        for k, r in routes.items():
            e, cv = r["elev_stats"], r["curviness"]
            p = cv["pct_distance"]
            inv = r["stop_inventory"] or {}
            w.writerow([k, r["name"], r["total_km"], e["ascent_m"],
                        e["descent_m"], e["net_m"], e["min_m"], e["max_m"],
                        e["max_grade_pct"], e["min_grade_pct"], e["pct_steep"],
                        e["climb_work_kWh_per_t"], cv["deg_per_km"],
                        cv["curviness_index"], cv["bends_per_km"],
                        cv["median_curve_radius_m"], cv["min_curve_radius_m"],
                        cv["pct_curvy"], p["hairpin"], p["tight"], p["moderate"],
                        p["gentle"], p["straight"], r["stops_est"],
                        inv.get("traffic_signals", 0),
                        inv.get("roundabout", 0) + inv.get("mini_roundabout", 0),
                        inv.get("stop", 0), inv.get("give_way", 0),
                        inv.get("level_crossing", 0),
                        r["osm_limit_pct"], r["elev_samples"]])

    for k, r in routes.items():
        with open(os.path.join(DATA, f"profile_{k}.csv"), "w", newline="") as f:
            w = csv.writer(f)
            w.writerow(["dist_km", "elevation_m", "grade_pct",
                        "curvature_deg_100m", "speed_kmh", "legal_kmh",
                        "limit_source", "lat", "lon"])
            for i in range(r["n"]):
                w.writerow([round(r["dist_km"][i], 3), r["elevation"][i],
                            r["grade_pct"][i], r["curvature"][i],
                            r["speed_kmh"][i], r["legal_kmh"][i],
                            r["limit_source"][i], round(r["lat"][i], 5),
                            round(r["lon"][i], 5)])

    # ------------------------------------------------------------ console log
    print("Built eco_data.json, data.js, results.csv, route_metrics.csv, "
          "profile_*.csv\n")
    for k, r in routes.items():
        e, cv = r["elev_stats"], r["curviness"]
        print(f"== {r['name']}  ({r['total_km']} km) ==")
        print(f"   elevation : {e['start_m']}→{e['end_m']} m, peak {e['max_m']} m, "
              f"ascent {e['ascent_m']} m / descent {e['descent_m']} m, "
              f"{e['pct_steep']}% of road at |grade| ≥ 5%  "
              f"[{r['elev_samples']} real samples]")
        print(f"   curviness : {cv['deg_per_km']}°/km (index {cv['curviness_index']}"
              f"/100), {cv['bends_per_km']} bends/km, median R "
              f"{cv['median_curve_radius_m']} m, tightest {cv['min_curve_radius_m']} m")
        if r["stops_measured"]:
            inv = ", ".join(f"{v} {k}" for k, v in sorted(r["stop_inventory"].items()))
            print(f"   limits    : {r['osm_limit_pct']}% of points from real OSM "
                  f"tags; {r['stops_est']} expected stops from measured "
                  f"inventory ({inv})")
        else:
            print(f"   limits    : {r['osm_limit_pct']}% of points from real OSM "
                  f"tags, {r['stops_est']} modelled stops (fallback guess)")
        for c in CARS:
            res = results[k][c["id"]]
            m, cu, st = res["mountain"], res["curves"], res["stops"]
            print(f"   {c['name']:42s} {res['per100']:5.2f} {res['unit100']:10s}"
                  f" €{res['cost_eur']:5.2f}  {res['co2_kg']:4.1f}kg  "
                  f"{res['time_min']:4.0f}min │ mtn €{m['cost_eur']:4.2f} "
                  f"({m['pct_of_trip']:4.1f}%)  crv €{cu['cost_eur']:4.2f} "
                  f"(+{cu['time_min_lost']:.0f}min)  stops €{st['cost_eur']:4.2f} "
                  f"(+{st['time_min_lost']:.1f}min)")
        print()


if __name__ == "__main__":
    main()
