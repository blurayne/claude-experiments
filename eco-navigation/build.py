#!/usr/bin/env python3
"""
Eco-Navigation — build route + energy data for the Deggendorf -> Engelshütt
comparison (two variants: via Arnbruck vs. via Viechtach & Bad Kötzting).

Pipeline
--------
1. Parse the two user-supplied CoMaps GPX tracks (real geometry, ~1800 pts each).
2. Resample each track to a uniform 100 m step.
3. Compute curvature (heading change per 100 m) from the *real* geometry.
4. Build an elevation profile by interpolating researched town elevations
   (anchors) snapped onto the real track, then derive road grade.   [MODELLED]
5. Classify each point as village (50) or rural (100) from proximity to town
   centres, then derive a physically plausible effective driving speed that is
   also limited by curvature (lateral-acceleration cap) and acceleration.
6. Run a longitudinal energy model for five car profiles -> energy, fuel/kWh,
   cost (EUR), CO2, time.
7. Emit JSON + CSV data files and an embeddable data.js for the HTML viewer.

Data provenance
---------------
- Geometry, distance, curviness, village/rural zones : REAL (from your GPX).
- Elevation / grade                                  : MODELLED (anchored to
  researched town elevations; replace via fetch_real_data.py when an elevation
  API is reachable, or by supplying a GPX that already carries <ele> tags).
- Speed limits                                       : RULE-BASED (German StVO
  defaults by zone) + curvature cap. Not scraped per-sign.
- Car / energy / price / CO2 parameters              : published spec + typical
  real-world figures (see CARS below); model estimates, not telemetry.

Run:  python3 build.py  (pure standard library, no network needed)
"""
import xml.etree.ElementTree as ET
import math, json, csv, os

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "data")
os.makedirs(DATA, exist_ok=True)

# GPX sources: prefer copies committed into the repo (data/gpx), else the
# original upload location.
def find_gpx(name_repo, name_upload):
    p1 = os.path.join(DATA, "gpx", name_repo)
    if os.path.exists(p1):
        return p1
    return name_upload

UP = "/root/.claude/uploads/b7ce1f56-df1d-5f3a-b1ec-555c1a3b5fb6/"
GPX = {
    "arnbruck":  find_gpx("route_arnbruck.gpx",        UP + "c75affa0-Deggendorf__Engelsh_tt.gpx"),
    "koetzting": find_gpx("route_viechtach_koetzting.gpx", UP + "048d0451-Deggendorf__Engelsh_tt_1.gpx"),
}

# ---------------------------------------------------------------- geo helpers
R_EARTH = 6371000.0
def hav(a, b):
    la1, lo1, la2, lo2 = map(math.radians, [a[0], a[1], b[0], b[1]])
    h = math.sin((la2-la1)/2)**2 + math.cos(la1)*math.cos(la2)*math.sin((lo2-lo1)/2)**2
    return 2*R_EARTH*math.asin(math.sqrt(h))

def bearing(a, b):
    la1, la2 = math.radians(a[0]), math.radians(b[0])
    dlo = math.radians(b[1]-a[1])
    x = math.sin(dlo)*math.cos(la2)
    y = math.cos(la1)*math.sin(la2)-math.sin(la1)*math.cos(la2)*math.cos(dlo)
    return math.degrees(math.atan2(x, y)) % 360

def angdiff(a, b):
    d = (b-a+180) % 360 - 180
    return d

def parse_gpx(path):
    root = ET.parse(path).getroot()
    pts = [(float(p.get("lat")), float(p.get("lon")))
           for p in root.iter("{http://www.topografix.com/GPX/1/1}trkpt")]
    return pts

# ----------------------------------------------------------- resample to step
def resample(pts, step=100.0):
    """Return list of (lat,lon,cum_dist_m) every `step` metres along the track."""
    out = [(pts[0][0], pts[0][1], 0.0)]
    cum = 0.0
    target = step
    seg_start = pts[0]
    acc = 0.0  # distance accumulated from track start to seg_start
    for i in range(1, len(pts)):
        a, b = pts[i-1], pts[i]
        seg = hav(a, b)
        if seg == 0:
            continue
        while acc + seg >= target:
            f = (target - acc) / seg
            lat = a[0] + (b[0]-a[0])*f
            lon = a[1] + (b[1]-a[1])*f
            out.append((lat, lon, target))
            target += step
        acc += seg
    # ensure final point
    total = sum(hav(pts[i-1], pts[i]) for i in range(1, len(pts)))
    if out[-1][2] < total - 1:
        out.append((pts[-1][0], pts[-1][1], total))
    return out, total

# ------------------------------------------------------------- village centres
# (lat, lon) of town/village centres -> used to assign 50 km/h zones.
VILLAGES = {
    "Deggendorf": (48.8345, 12.9580), "Ruhmannsfelden": (48.9800, 12.9710),
    "Patersdorf": (49.0010, 12.9690), "Teisnach": (49.0167, 12.9833),
    "Geiersthal": (49.0450, 12.9950), "Böbrach": (49.0600, 13.0500),
    "Drachselsried": (49.0970, 13.0060), "Arnbruck": (49.1230, 13.0180),
    "Engelshütt": (49.2067, 13.0319), "Arrach": (49.1930, 13.0070),
    "Viechtach": (49.0786, 12.8856), "Bad Kötzting": (49.1786, 12.8556),
    "Gotteszell": (48.9670, 13.0120), "Hohenwarth": (49.2070, 12.9130),
    "Blossersberg": (49.05, 12.92),
}
def in_village(lat, lon):
    p = (lat, lon)
    for name, c in VILLAGES.items():
        if hav(p, c) < 800:        # built-up extent incl. approaches
            return name
    return None

# Typical number of stop-causing features (traffic lights, give-way junctions,
# pedestrian crossings) a through-driver actually stops at, per built-up area.
# Bigger towns have signals; small hamlets usually none. Used to add realistic
# standing time + stop-and-go energy that a continuous speed profile misses.
MAJOR_STOPS = {
    "Deggendorf": 3, "Viechtach": 2, "Bad Kötzting": 2, "Teisnach": 1,
    "Drachselsried": 1, "Arnbruck": 1, "Ruhmannsfelden": 1, "Bodenmais": 1,
    "Patersdorf": 1,
}
STOP_IDLE_S = 22.0     # avg standing + manoeuvre overhead per stop event (s)

# --------------------------------------------------------- elevation anchors
# Researched town elevations (m a.s.l.) snapped to their km position on each
# track (km positions came from the GPX nearest-approach analysis).  MODELLED.
ANCHORS = {
    "arnbruck": [   # Deggendorf -> Teisnach -> Drachselsried -> Arnbruck -> Engelshütt
        (0.0, 312), (0.74, 318), (5.0, 345), (9.0, 430), (13.0, 470),
        (16.5, 490), (18.2, 470), (20.5, 500), (22.2, 467), (26.0, 485),
        (30.0, 510), (34.8, 533), (39.0, 590), (44.0, 630), (49.0, 665),
        (55.07, 710),
    ],
    "koetzting": [  # shared to Teisnach(22.2), then Viechtach -> Bad Kötzting -> Engelshütt
        (0.0, 312), (0.74, 318), (5.0, 345), (9.0, 430), (13.0, 470),
        (16.5, 490), (18.2, 470), (20.5, 500), (22.2, 467), (28.0, 455),
        (35.1, 451), (41.0, 430), (47.7, 408), (52.0, 480), (57.0, 580),
        (61.5, 660), (65.76, 710),
    ],
}
def interp_anchor(anchors, km):
    if km <= anchors[0][0]:
        return anchors[0][1]
    for i in range(1, len(anchors)):
        x0, y0 = anchors[i-1]; x1, y1 = anchors[i]
        if km <= x1:
            f = (km - x0) / (x1 - x0)
            return y0 + (y1 - y0) * f
    return anchors[-1][1]

def smooth(seq, win):
    n = len(seq); out = [0.0]*n
    h = win // 2
    for i in range(n):
        lo = max(0, i-h); hi = min(n, i+h+1)
        out[i] = sum(seq[lo:hi]) / (hi-lo)
    return out

# ---------------------------------------------------------------- build route
# The simulation runs on a fine 25 m grid (so tight curves are resolved and the
# curvature speed-cap engages realistically); display arrays are downsampled.
STEP = 25.0
A_LAT = 2.2     # m/s^2 lateral accel a careful (eco) driver accepts in a bend
A_MAX = 1.2     # m/s^2 longitudinal accel/decel for smooth eco driving
V_FREE = 88/3.6 # realistic sustained free-flow speed on these single-lane St/B roads

def build_route(key, color):
    pts = parse_gpx(GPX[key])
    rs, total = resample(pts, STEP)
    n = len(rs)
    lat = [p[0] for p in rs]; lon = [p[1] for p in rs]
    dist_km = [p[2]/1000.0 for p in rs]

    # --- curvature from real geometry, expressed as deg of heading change
    #     per 100 m so the number is comparable regardless of grid step ---
    curv25 = [0.0]*n          # raw heading change per 25 m segment (deg)
    for i in range(1, n-1):
        b1 = bearing(rs[i-1][:2], rs[i][:2])
        b2 = bearing(rs[i][:2], rs[i+1][:2])
        curv25[i] = abs(angdiff(b1, b2))
    curv25 = smooth(curv25, 5)                 # ~125 m window
    curv100 = [c*(100.0/STEP) for c in curv25] # normalise to deg / 100 m

    # --- elevation (modelled) + grade ---
    ele_raw = [interp_anchor(ANCHORS[key], km) for km in dist_km]
    ele = smooth(ele_raw, 21)                  # ~525 m window, gentle
    grade = [0.0]*n
    for i in range(1, n):
        dh = ele[i]-ele[i-1]
        ds = (dist_km[i]-dist_km[i-1])*1000 or 1e-6
        grade[i] = max(-0.10, min(0.10, dh/ds))
    grade = smooth(grade, 9)

    # --- speed zones ---
    legal = []; village = []
    for i in range(n):
        v = in_village(lat[i], lon[i])
        village.append(v)
        legal.append(50 if v else 100)

    # --- curvature-limited target speed (lateral-accel cap) ---
    vmax = []
    for i in range(n):
        c = curv25[i]                          # deg over this 25 m
        if c < 0.25:
            vc = V_FREE
        else:
            rad = STEP / math.radians(c)       # local turn radius (m)
            vc = math.sqrt(A_LAT * rad)
        vmax.append(min(vc, legal[i]/3.6, V_FREE))

    # --- longitudinal acceleration limit (forward & backward pass) ---
    v = vmax[:]
    for i in range(1, n):
        ds = (dist_km[i]-dist_km[i-1])*1000
        v[i] = min(v[i], math.sqrt(max(0.0, v[i-1]**2 + 2*A_MAX*ds)))
    for i in range(n-2, -1, -1):
        ds = (dist_km[i+1]-dist_km[i])*1000
        v[i] = min(v[i], math.sqrt(max(0.0, v[i+1]**2 + 2*A_MAX*ds)))
    v = [max(vi, 2.8) for vi in v]
    speed_kmh = [vi*3.6 for vi in v]

    # --- discrete stop estimate (traffic lights / junctions) ---
    villages_passed = sorted({x for x in village if x})
    stops_est = sum(MAJOR_STOPS.get(x, 0) for x in villages_passed)

    return {
        "key": key, "color": color, "n": n, "pts_raw": pts,
        "villages_passed": villages_passed, "stops_est": stops_est,
        "name": {"arnbruck": "Route A — via Arnbruck (Zellertal direct)",
                 "koetzting": "Route B — via Viechtach & Bad Kötzting"}[key],
        "total_km": round(total/1000.0, 2),
        "dist_km": dist_km, "lat": lat, "lon": lon,
        "elevation": [round(e, 1) for e in ele],
        "grade_pct": [round(g*100, 2) for g in grade],
        "curvature": [round(c, 2) for c in curv100],
        "speed_kmh": [round(s, 1) for s in speed_kmh],
        "legal_kmh": legal,
        "village": village,
        "v_ms": v,
    }

# ------------------------------------------------------------------- car set
G = 9.81
RHO = 1.20
CARS = [
    {   "id": "auris", "name": "Toyota Auris Hybrid 1.8 (2016)",
        "type": "Full hybrid (petrol)", "fuel": "petrol",
        "mass": 1500, "CdA": 0.30*2.20, "Crr": 0.0095,
        "eff": 0.34, "regen": 0.62, "aux_kw": 0.30, "charge_eff": 1.0,
        "power_kw": 100, "note": "Atkinson + eCVT, strong regen. ~4.7 L/100km typical." },
    {   "id": "id3", "name": "VW ID.3 (58 kWh)",
        "type": "Battery-electric", "fuel": "electric",
        "mass": 1900, "CdA": 0.267*2.36, "Crr": 0.0095,
        "eff": 0.90, "regen": 0.70, "aux_kw": 0.45, "charge_eff": 0.88,
        "power_kw": 150, "note": "Strong regen, heavy battery. ~16–18 kWh/100km." },
    {   "id": "panda", "name": "Fiat Panda 1.2 (2016)",
        "type": "Petrol (no hybrid)", "fuel": "petrol",
        "mass": 1010, "CdA": 0.33*2.10, "Crr": 0.011,
        "eff": 0.27, "regen": 0.0, "aux_kw": 0.30, "charge_eff": 1.0,
        "power_kw": 51, "note": "Very light, small 8v engine. ~6 L/100km." },
    {   "id": "opel", "name": "Opel (2005, Kadett-class small petrol)",
        "type": "Petrol (older tech)", "fuel": "petrol",
        "mass": 1080, "CdA": 0.34*2.05, "Crr": 0.0125,
        "eff": 0.235, "regen": 0.0, "aux_kw": 0.25, "charge_eff": 1.0,
        "power_kw": 55, "note": "Older port-injection, no regen. ~7.5 L/100km. "
                                 "NOTE: 'Opel Cadet/Kadett' + 2005 is ambiguous — "
                                 "modelled as a 2005-era small Opel." },
    {   "id": "merc", "name": "Mercedes C-Class diesel (typical)",
        "type": "Diesel (mid-size)", "fuel": "diesel",
        "mass": 1620, "CdA": 0.27*2.20, "Crr": 0.010,
        "eff": 0.34, "regen": 0.0, "aux_kw": 0.35, "charge_eff": 1.0,
        "power_kw": 125, "note": "Efficient diesel, heavier. ~5.5 L/100km." },
]

# energy content & market data (Germany, 2026 estimate)
PETROL_J_L = 8.9 * 3.6e6      # 32.04 MJ/L
DIESEL_J_L = 9.9 * 3.6e6      # 35.64 MJ/L
PRICE = {"petrol": 1.79, "diesel": 1.69, "electric": 0.40}   # EUR per L / per kWh
CO2 = {"petrol": 2.32, "diesel": 2.65, "electric": 0.35}     # kg per L / per kWh

def simulate(route, car):
    n = route["n"]
    v = route["v_ms"]; dk = route["dist_km"]; grade = route["grade_pct"]
    m, CdA, Crr = car["mass"], car["CdA"], car["Crr"]
    E_prop = 0.0; E_brake = 0.0; t = 0.0
    for i in range(1, n):
        ds = (dk[i]-dk[i-1])*1000.0
        if ds <= 0:
            continue
        va = (v[i]+v[i-1])/2.0
        a = (v[i]**2 - v[i-1]**2)/(2*ds)
        g = grade[i]/100.0
        F_roll = m*G*Crr
        F_aero = 0.5*RHO*CdA*va*va
        F_grade = m*G*g
        F_acc = m*a
        F = F_roll+F_aero+F_grade+F_acc
        E = F*ds                      # J at the wheel for this step
        if E >= 0:
            E_prop += E
        else:
            E_brake += -E
        t += ds/max(va, 0.5)
    # discrete stops (traffic lights / give-way junctions): each stop is a
    # decelerate-to-0 then accelerate-back cycle. The braking energy is regen-
    # eligible; the re-acceleration is fresh propulsion. v_stop ~ post-stop
    # village speed (50 km/h).
    n_stops = route["stops_est"]
    v_stop = 50/3.6
    stop_kin = 0.5*m*v_stop*v_stop
    E_prop += n_stops*stop_kin
    E_brake += n_stops*stop_kin
    t += n_stops*STOP_IDLE_S
    # regen / drivetrain
    regen_recovered = car["regen"]*E_brake
    net_prop = max(E_prop - regen_recovered, 0.0)
    aux_J = car["aux_kw"]*1000.0*t
    if car["fuel"] == "electric":
        batt_J = net_prop/car["eff"] + aux_J
        wall_J = batt_J/car["charge_eff"]
        kwh = wall_J/3.6e6
        cost = kwh*PRICE["electric"]
        co2 = kwh*CO2["electric"]
        amount = kwh; unit = "kWh"
        per100 = kwh/route["total_km"]*100
        unit100 = "kWh/100km"
    else:
        fuel_J = net_prop/car["eff"] + aux_J/(car["eff"])
        dens = PETROL_J_L if car["fuel"] == "petrol" else DIESEL_J_L
        liters = fuel_J/dens
        cost = liters*PRICE[car["fuel"]]
        co2 = liters*CO2[car["fuel"]]
        amount = liters; unit = "L"
        per100 = liters/route["total_km"]*100
        unit100 = "L/100km"
    return {
        "car_id": car["id"], "route": route["key"],
        "E_prop_kWh": round(E_prop/3.6e6, 2),
        "E_brake_kWh": round(E_brake/3.6e6, 2),
        "regen_kWh": round(regen_recovered/3.6e6, 2),
        "amount": round(amount, 2), "unit": unit,
        "per100": round(per100, 2), "unit100": unit100,
        "cost_eur": round(cost, 2),
        "co2_kg": round(co2, 2),
        "time_min": round(t/60.0, 1),
        "avg_kmh": round(route["total_km"]/(t/3600.0), 1),
    }

# ----------------------------------------------------------- curviness stats
def curviness_stats(route):
    """Intrinsic curviness from the raw GPX polyline (sampling-stable)."""
    pts = route["pts_raw"]
    total_turn = 0.0
    radii = []
    sharp = moderate = 0
    for i in range(1, len(pts)-1):
        seg = (hav(pts[i-1], pts[i]) + hav(pts[i], pts[i+1])) / 2.0
        if seg < 1:
            continue
        b1 = bearing(pts[i-1], pts[i]); b2 = bearing(pts[i], pts[i+1])
        turn = abs(angdiff(b1, b2))
        total_turn += turn
        if turn > 0.5:
            rad = seg / math.radians(turn)
            radii.append(rad)
            if rad < 80:        sharp += 1       # tight bend
            elif rad < 200:     moderate += 1    # moderate bend
    per_km = total_turn / route["total_km"]
    radii_sorted = sorted(radii)
    median_R = radii_sorted[len(radii_sorted)//2] if radii_sorted else None
    return {
        "total_heading_deg": round(total_turn),
        "deg_per_km": round(per_km, 1),
        "sharp_curves": sharp, "moderate_curves": moderate,
        "median_curve_radius_m": round(median_R) if median_R else None,
        "pct_curvy": round(100*sum(1 for c in route["curvature"] if c > 12.0)
                           / len(route["curvature"]), 1),
    }

def elevation_stats(route):
    ele = route["elevation"]
    asc = sum(max(0, ele[i]-ele[i-1]) for i in range(1, len(ele)))
    desc = sum(max(0, ele[i-1]-ele[i]) for i in range(1, len(ele)))
    return {
        "min_m": round(min(ele)), "max_m": round(max(ele)),
        "start_m": round(ele[0]), "end_m": round(ele[-1]),
        "ascent_m": round(asc), "descent_m": round(desc),
        "net_m": round(ele[-1]-ele[0]),
        "max_grade_pct": round(max(route["grade_pct"]), 1),
        "min_grade_pct": round(min(route["grade_pct"]), 1),
    }

# --------------------------------------------------------------------- build
routes = {
    "arnbruck":  build_route("arnbruck", "#E0A800"),
    "koetzting": build_route("koetzting", "#E51B23"),
}
results = {}
for rk, route in routes.items():
    route["curviness"] = curviness_stats(route)
    route["elev_stats"] = elevation_stats(route)
    results[rk] = {car["id"]: simulate(route, car) for car in CARS}

# trim heavy per-point fields for the compact profile arrays we ship to the UI.
# The sim ran on a 25 m grid; downsample to ~100 m for the charts/map.
def profile_arrays(route, every=4):
    idx = list(range(0, route["n"], every))
    if idx[-1] != route["n"]-1:
        idx.append(route["n"]-1)
    pick = lambda arr: [arr[i] for i in idx]
    return {
        "dist_km": [round(route["dist_km"][i], 3) for i in idx],
        "elevation": pick(route["elevation"]),
        "grade_pct": pick(route["grade_pct"]),
        "curvature": pick(route["curvature"]),
        "speed_kmh": pick(route["speed_kmh"]),
        "legal_kmh": pick(route["legal_kmh"]),
        "lat": [round(route["lat"][i], 5) for i in idx],
        "lon": [round(route["lon"][i], 5) for i in idx],
    }

bundle = {
    "meta": {
        "title": "Eco-Navigation — Deggendorf → Engelshütt (Bavarian Forest)",
        "generated": "2026-06-27",
        "provenance": {
            "geometry": "REAL — user CoMaps GPX (1802 & 1876 trackpoints)",
            "distance": "REAL — from GPX",
            "curviness": "REAL — heading change per 100 m from GPX",
            "village_zones": "RULE — proximity to town centres",
            "elevation": "MODELLED — researched town elevations anchored to the real track (GPX had no <ele>)",
            "speed_limits": "RULE — German StVO defaults (50 village / 100 rural) + curvature cap",
            "energy_model": "MODELLED — longitudinal vehicle physics, calibrated to typical real-world consumption",
            "prices_co2": "Germany 2026 estimate: petrol 1.79 €/L, diesel 1.69 €/L, elec 0.40 €/kWh; grid 0.35 kg CO2/kWh",
        },
    },
    "cars": [{k: c[k] for k in ("id", "name", "type", "fuel", "mass", "CdA",
                                "Crr", "power_kw", "note")} for c in CARS],
    "routes": {rk: {
        "key": rk, "name": r["name"], "color": r["color"],
        "total_km": r["total_km"], "stops_est": r["stops_est"],
        "villages_passed": r["villages_passed"],
        "curviness": r["curviness"], "elev_stats": r["elev_stats"],
        "profile": profile_arrays(r),
    } for rk, r in routes.items()},
    "results": results,
}

# ------------------------------------------------------------------- outputs
with open(os.path.join(DATA, "eco_data.json"), "w") as f:
    json.dump(bundle, f, ensure_ascii=False, indent=1)

with open(os.path.join(HERE, "data.js"), "w") as f:
    f.write("// Auto-generated by build.py — do not edit by hand.\n")
    f.write("window.ECO_DATA = ")
    json.dump(bundle, f, ensure_ascii=False)
    f.write(";\n")

# results CSV
with open(os.path.join(DATA, "results.csv"), "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["route", "route_name", "total_km", "car", "car_type",
                "consumption", "unit_per_100km", "amount", "unit", "cost_eur",
                "co2_kg", "time_min", "avg_kmh"])
    for rk, r in routes.items():
        for car in CARS:
            res = results[rk][car["id"]]
            w.writerow([rk, r["name"], r["total_km"], car["name"], car["type"],
                        res["per100"], res["unit100"], res["amount"], res["unit"],
                        res["cost_eur"], res["co2_kg"], res["time_min"], res["avg_kmh"]])

# profile CSV (per route)
for rk, r in routes.items():
    with open(os.path.join(DATA, f"profile_{rk}.csv"), "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["dist_km", "elevation_m", "grade_pct", "curvature_deg_100m",
                    "speed_kmh", "legal_kmh", "lat", "lon"])
        for i in range(r["n"]):
            w.writerow([round(r["dist_km"][i], 3), r["elevation"][i],
                        r["grade_pct"][i], r["curvature"][i], r["speed_kmh"][i],
                        r["legal_kmh"][i], round(r["lat"][i], 5), round(r["lon"][i], 5)])

# ---------------------------------------------------------------- console log
print("Built eco_data.json, data.js, results.csv, profile_*.csv\n")
for rk, r in routes.items():
    print(f"== {r['name']}  ({r['total_km']} km) ==")
    print(f"   curviness: {r['curviness']}")
    print(f"   elevation: {r['elev_stats']}")
    for car in CARS:
        res = results[rk][car["id"]]
        print(f"   {car['name']:42s} {res['per100']:5.2f} {res['unit100']:10s}"
              f" {res['amount']:5.2f}{res['unit']:>4s}  €{res['cost_eur']:5.2f}"
              f"  {res['co2_kg']:4.1f}kg CO2  {res['time_min']:4.0f}min  {res['avg_kmh']:.0f}km/h")
    print()
