#!/usr/bin/env python3
"""
model.py — the route + vehicle model behind the eco-navigation comparison.

Split out of build.py so that build.py (which emits the published data) and
screen_routes.py (which scores candidate third routes) run *identical* physics.

Contents
--------
1. Terrain     : real DEM elevation -> de-spiked, smoothed, grade, ascent.
2. Geometry    : curvature on a uniform grid, curve radii, curviness index.
3. Speed       : OSM maxspeed -> lateral-acceleration cap -> accel/decel limits.
4. Energy      : longitudinal vehicle physics for five cars.
5. Counterfactuals: the same trip on a flat road and on a straight road, which
   is what turns "mountains" and "curves" into euros and litres.

Everything is standard library.
"""
import math
import os

from geo import angdiff, bearing, hav, median, resample, smooth

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "data")

# ------------------------------------------------------------ model constants
STEP = 25.0        # simulation grid (m) — matches the EU-DEM 25 m raster
A_LAT = 2.2        # m/s^2 lateral acceleration a relaxed (eco) driver accepts
A_ACC = 1.1        # m/s^2 comfortable acceleration
A_DEC = 1.6        # m/s^2 comfortable deceleration (braking is stronger)
V_FREE = 88 / 3.6  # realistic sustained free-flow speed on these St/B roads
V_MIN = 2.8        # m/s floor so the time integral cannot blow up

# Elevation post-processing. EU-DEM's vertical RMSE is a few metres, which over
# a 25 m step is a large apparent grade, so the raw raster must be conditioned
# before it can be differentiated.
#
# The parameters below were tuned against a stretch of the B11 in the Danube
# valley that is known to be gently graded: at a 100 m baseline the DEM put 25 %
# of that road above 5 % and produced 14 % spikes, which no B-road has. Widening
# the baseline to 300 m removes those artefacts while still resolving the real
# Eck pass climb (summit 843 m of the raw 847 m, a sustained ~6 %).
MEDIAN_WIN = 7     # 175 m median filter — removes single-cell spikes/voids
SMOOTH_WIN = 21    # 525 m moving average — removes residual raster noise
GRADE_HALFWIN = 6  # central difference over +/-150 m (300 m baseline)
GRADE_CLAMP = 0.12 # +/-12 %: steeper than any public road in this corridor
ASCENT_HYST = 4.0  # m — only count a climb once it exceeds this, so DEM noise
                   #     does not inflate total ascent (standard GPS practice)

G = 9.81
RHO = 1.20         # kg/m^3 air density


# ------------------------------------------------------------------- terrain
def median_filter(seq, win):
    n = len(seq)
    h = win // 2
    return [median(seq[max(0, i - h):min(n, i + h + 1)]) for i in range(n)]


def condition_elevation(ele_raw):
    """De-spike then smooth the raw DEM samples.

    Returns (smoothed, despiked). The smoothed series is what gets
    differentiated into grade and integrated for ascent; the de-spiked series
    is used for point values such as the elevation of the start and the
    destination, where a 525 m average over the approach road would otherwise
    report a different height for the same place depending on which direction
    the route arrives from.
    """
    despiked = median_filter(ele_raw, MEDIAN_WIN)
    return smooth(despiked, SMOOTH_WIN), despiked


def grade_from(ele, step=STEP):
    """Road grade (fraction) by central difference over a 100 m baseline."""
    n = len(ele)
    h = GRADE_HALFWIN
    out = []
    for i in range(n):
        lo, hi = max(0, i - h), min(n - 1, i + h)
        ds = (hi - lo) * step
        g = (ele[hi] - ele[lo]) / ds if ds > 0 else 0.0
        out.append(max(-GRADE_CLAMP, min(GRADE_CLAMP, g)))
    return out


def ascent_descent(ele, hyst=ASCENT_HYST):
    """Total ascent/descent with hysteresis, so raster noise is not counted.

    Tracks the running extremum and only commits a leg once the profile has
    turned back by `hyst` metres — the same trick GPS watches use. A climb is
    therefore measured valley-to-summit, not in whatever chunks the sampling
    happened to fall into, and metre-scale DEM noise contributes nothing.
    """
    asc = desc = 0.0
    ref = ext = ele[0]      # last confirmed turning point / running extremum
    direction = 0           # +1 climbing, -1 descending, 0 not yet established

    for e in ele[1:]:
        if direction == 0:
            if e - ref >= hyst:
                direction, ext = 1, e
            elif ref - e >= hyst:
                direction, ext = -1, e
            else:
                ext = e
                ref = e if abs(e - ref) < 1e-9 else ref
        elif direction > 0:
            if e > ext:
                ext = e
            elif ext - e >= hyst:           # confirmed turn downward
                asc += ext - ref
                ref, direction, ext = ext, -1, e
        else:
            if e < ext:
                ext = e
            elif e - ext >= hyst:           # confirmed turn upward
                desc += ref - ext
                ref, direction, ext = ext, 1, e

    if direction > 0:                       # commit the unfinished final leg
        asc += ext - ref
    elif direction < 0:
        desc += ref - ext
    return asc, desc


# ------------------------------------------------------------------ geometry
def curvature_series(rs, step=STEP):
    """Heading change per 100 m on the uniform grid.

    Computed on the *resampled* polyline, not the raw track points: the two
    CoMaps tracks and an OSRM-generated track have different vertex densities,
    and heading change per vertex is not comparable between them. Per 100 m of
    road it is.
    """
    n = len(rs)
    raw = [0.0] * n
    for i in range(1, n - 1):
        b1 = bearing(rs[i - 1][:2], rs[i][:2])
        b2 = bearing(rs[i][:2], rs[i + 1][:2])
        raw[i] = abs(angdiff(b1, b2))
    sm = smooth(raw, 5)                                  # ~125 m window
    return sm, [c * (100.0 / step) for c in sm]


def curve_radius(turn_deg, step=STEP):
    """Local radius of curvature (m) implied by a heading change over `step`."""
    if turn_deg < 1e-6:
        return float("inf")
    return step / math.radians(turn_deg)


def curviness_stats(rs, curv_raw, curv100, total_km, step=STEP):
    """Curviness measured per kilometre of road, plus a 0-100 index.

    Bands follow the radii at which a driver must actually slow down:
      < 80 m   hairpin / tight bend      (comfortable ~45 km/h at 2.2 m/s^2)
      80-200 m moderate bend             (~65-90 km/h)
      200-500 m gentle bend              (~95 km/h)
      > 500 m  effectively straight
    """
    total_turn = sum(curv_raw)
    deg_per_km = total_turn / total_km if total_km else 0.0

    bands = {"hairpin": 0, "tight": 0, "moderate": 0, "gentle": 0, "straight": 0}
    radii = []
    for c in curv_raw:
        R = curve_radius(c, step)
        if R < 80:
            bands["hairpin" if R < 45 else "tight"] += 1
        elif R < 200:
            bands["moderate"] += 1
        elif R < 500:
            bands["gentle"] += 1
        else:
            bands["straight"] += 1
        if R < 2000:
            radii.append(R)
    n = max(len(curv_raw), 1)
    pct = {k: round(100.0 * v / n, 1) for k, v in bands.items()}

    # A 0-100 index. 0 deg/km is a ruler; 300 deg/km is a genuinely serpentine
    # mountain road. Clipped so the scale stays readable rather than unbounded.
    index = max(0.0, min(100.0, 100.0 * deg_per_km / 300.0))

    return {
        "total_heading_deg": round(total_turn),
        "deg_per_km": round(deg_per_km, 1),
        "curviness_index": round(index, 1),
        "median_curve_radius_m": round(median(radii)) if radii else None,
        "min_curve_radius_m": round(min(radii)) if radii else None,
        "pct_distance": pct,
        "pct_curvy": round(pct["hairpin"] + pct["tight"] + pct["moderate"], 1),
        "bends_per_km": round(
            sum(1 for c in curv_raw if curve_radius(c, step) < 200) / total_km, 1)
        if total_km else 0.0,
    }


# --------------------------------------------------------------------- speed
VILLAGES = {
    "Deggendorf": (48.8345, 12.9580), "Ruhmannsfelden": (48.9800, 12.9710),
    "Patersdorf": (49.0010, 12.9690), "Teisnach": (49.0167, 12.9833),
    "Geiersthal": (49.0450, 12.9950), "Böbrach": (49.0600, 13.0500),
    "Drachselsried": (49.0970, 13.0060), "Arnbruck": (49.1230, 13.0180),
    "Engelshütt": (49.2067, 13.0319), "Arrach": (49.1930, 13.0070),
    "Viechtach": (49.0786, 12.8856), "Bad Kötzting": (49.1786, 12.8556),
    "Gotteszell": (48.9670, 13.0120), "Hohenwarth": (49.2070, 12.9130),
    "Blossersberg": (49.05, 12.92), "Regen": (48.9744, 13.1281),
    "Bodenmais": (49.0714, 13.1000), "Lam": (49.1975, 13.0553),
    "Zwiesel": (49.0175, 13.2367), "Bayerisch Eisenstein": (49.1214, 13.2036),
    "Kirchberg im Wald": (48.9422, 13.1856), "Prackenbach": (49.0442, 12.8250),
    "Miltach": (49.1550, 12.8000), "Blaibach": (49.1594, 12.8408),
}

# FALLBACK ONLY (used when no measured stop inventory is available, e.g. when
# screening OSRM candidates that have no data/stops_*.json yet): stop-causing
# features a through driver actually stops at, guessed per built-up area.
MAJOR_STOPS = {
    "Deggendorf": 3, "Viechtach": 2, "Bad Kötzting": 2, "Regen": 2,
    "Zwiesel": 2, "Teisnach": 1, "Drachselsried": 1, "Arnbruck": 1,
    "Ruhmannsfelden": 1, "Bodenmais": 1, "Patersdorf": 1, "Lam": 1,
    "Miltach": 1, "Blaibach": 1, "Kirchberg im Wald": 1,
}
STOP_IDLE_S = 22.0

# Behaviour at a MEASURED stop feature (from data/stops_<route>.json, fetched
# by fetch_real_data.py --stops). The inventory is real OSM data; these
# per-class assumptions are what turn an inventory into expected stops:
#   p       probability the driver actually has to slow/stop there
#   v_after speed after the event (0 = full stop), km/h
#   idle    expected standing time when the event fires, seconds
# Sources for the assumptions: a through driver on the priority road hits a
# red on roughly 40-50% of signals; a stop sign legally requires a halt; a
# give-way on the priority road rarely fires; a roundabout always forces a
# slow-through; level-crossing barriers on the Waldbahn (hourly service) are
# closed only a small fraction of the time but cost a long wait when they are.
STOP_BEHAVIOUR = {
    "traffic_signals": {"p": 0.45, "v_after": 0.0, "idle": 25.0},
    "stop":            {"p": 0.90, "v_after": 0.0, "idle": 3.0},
    "give_way":        {"p": 0.20, "v_after": 0.0, "idle": 3.0},
    "roundabout":      {"p": 1.00, "v_after": 25.0, "idle": 0.0},
    "mini_roundabout": {"p": 1.00, "v_after": 20.0, "idle": 0.0},
    "level_crossing":  {"p": 0.10, "v_after": 0.0, "idle": 45.0},
}


def in_village(lat, lon):
    for name, c in VILLAGES.items():
        if hav((lat, lon), c) < 800:
            return name
    return None


def parse_maxspeed(v):
    """OSM maxspeed tag -> km/h, or None when it carries no usable number."""
    if not v:
        return None
    v = v.strip().lower()
    if v in ("none", "signals", "variable"):
        return None
    if v == "walk":
        return 7
    if v.startswith("de:"):
        v = v[3:]
    if v in ("urban", "zone30", "zone:30"):
        return 50 if v == "urban" else 30
    if v == "rural":
        return 100
    if v == "living_street":
        return 7
    if v.endswith("mph"):
        try:
            return round(float(v.replace("mph", "").strip()) * 1.609)
        except ValueError:
            return None
    try:
        return int(float(v))
    except ValueError:
        return None


def legal_limits(rs, osm=None):
    """Legal speed per point: real OSM maxspeed where tagged, StVO default else.

    Returns (limits_kmh, villages_per_point, source_per_point).
    """
    limits, villages, source = [], [], []
    tags = (osm or {}).get("maxspeed") or []
    for i, p in enumerate(rs):
        v = in_village(p[0], p[1])
        villages.append(v)
        ms = parse_maxspeed(tags[i]) if i < len(tags) else None
        if ms:
            limits.append(ms)
            source.append("osm")
        else:
            limits.append(50 if v else 100)
            source.append("stvo")
    # A single mis-snapped point should not create a 25 m speed island; take a
    # short median over the limit series to keep the profile piecewise sane.
    limits = [int(median(limits[max(0, i - 2):i + 3])) for i in range(len(limits))]
    return limits, villages, source


def speed_profile(curv_raw, legal, n, straight=False):
    """Target speed, capped by law, by bend radius, then by accel/decel."""
    v = []
    for i in range(n):
        cap = V_FREE
        if not straight:
            R = curve_radius(curv_raw[i])
            if R != float("inf"):
                cap = min(cap, math.sqrt(A_LAT * R))
        v.append(min(cap, legal[i] / 3.6, V_FREE))
    # forward pass: cannot accelerate harder than A_ACC
    for i in range(1, n):
        v[i] = min(v[i], math.sqrt(max(0.0, v[i - 1] ** 2 + 2 * A_ACC * STEP)))
    # backward pass: cannot brake harder than A_DEC
    for i in range(n - 2, -1, -1):
        v[i] = min(v[i], math.sqrt(max(0.0, v[i + 1] ** 2 + 2 * A_DEC * STEP)))
    return [max(x, V_MIN) for x in v]


# ---------------------------------------------------------------- vehicles
CARS = [
    {"id": "auris", "name": "Toyota Auris Hybrid 1.8 (2016)",
     "type": "Full hybrid (petrol)", "fuel": "petrol",
     "mass": 1500, "CdA": 0.30 * 2.20, "Crr": 0.0095,
     "eff": 0.34, "regen": 0.62, "aux_kw": 0.30, "charge_eff": 1.0,
     "power_kw": 100,
     "note": "Atkinson + eCVT, strong regen. ~4.7 L/100km typical."},
    {"id": "id3", "name": "VW ID.3 (58 kWh)",
     "type": "Battery-electric", "fuel": "electric",
     "mass": 1900, "CdA": 0.267 * 2.36, "Crr": 0.0095,
     "eff": 0.90, "regen": 0.70, "aux_kw": 0.45, "charge_eff": 0.88,
     "power_kw": 150,
     "note": "Strong regen, heavy battery. ~16–18 kWh/100km."},
    {"id": "panda", "name": "Fiat Panda 1.2 (2016)",
     "type": "Petrol (no hybrid)", "fuel": "petrol",
     "mass": 1010, "CdA": 0.33 * 2.10, "Crr": 0.011,
     "eff": 0.27, "regen": 0.0, "aux_kw": 0.30, "charge_eff": 1.0,
     "power_kw": 51, "note": "Very light, small 8v engine. ~6 L/100km."},
    {"id": "opel", "name": "Opel (2005, Kadett-class small petrol)",
     "type": "Petrol (older tech)", "fuel": "petrol",
     "mass": 1080, "CdA": 0.34 * 2.05, "Crr": 0.0125,
     "eff": 0.235, "regen": 0.0, "aux_kw": 0.25, "charge_eff": 1.0,
     "power_kw": 55,
     "note": "Older port-injection, no regen. ~7.5 L/100km. NOTE: 'Opel "
             "Cadet/Kadett' + 2005 is ambiguous — modelled as a 2005-era small Opel."},
    {"id": "merc", "name": "Mercedes C-Class diesel (typical)",
     "type": "Diesel (mid-size)", "fuel": "diesel",
     "mass": 1620, "CdA": 0.27 * 2.20, "Crr": 0.010,
     "eff": 0.34, "regen": 0.0, "aux_kw": 0.35, "charge_eff": 1.0,
     "power_kw": 125, "note": "Efficient diesel, heavier. ~5.5 L/100km."},
]

PETROL_J_L = 8.9 * 3.6e6       # 32.04 MJ/L
DIESEL_J_L = 9.9 * 3.6e6       # 35.64 MJ/L
PRICE = {"petrol": 1.79, "diesel": 1.69, "electric": 0.40}
CO2 = {"petrol": 2.32, "diesel": 2.65, "electric": 0.35}


def _to_fuel(car, net_prop, aux_J, total_km):
    """Convert net propulsion energy at the wheel into tank/wall units."""
    if car["fuel"] == "electric":
        batt_J = net_prop / car["eff"] + aux_J
        wall_J = batt_J / car["charge_eff"]
        amount = wall_J / 3.6e6
        unit, unit100 = "kWh", "kWh/100km"
    else:
        fuel_J = (net_prop + aux_J) / car["eff"]
        dens = PETROL_J_L if car["fuel"] == "petrol" else DIESEL_J_L
        amount = fuel_J / dens
        unit, unit100 = "L", "L/100km"
    return {
        "amount": amount, "unit": unit, "unit100": unit100,
        "per100": amount / total_km * 100 if total_km else 0.0,
        "cost_eur": amount * PRICE[car["fuel"]],
        "co2_kg": amount * CO2[car["fuel"]],
    }


def run(route, car, grade=None, v=None):
    """Integrate the longitudinal energy balance over the route.

    `grade`/`v` override the route's own profiles — that is how the flat and
    straight counterfactuals are produced. Returns raw energies in joules plus
    a per-force-component breakdown of the positive (propulsive) work.
    """
    n = route["n"]
    dist = route["dist_m"]
    grade = route["grade"] if grade is None else grade
    v = route["v_ms"] if v is None else v
    m, CdA, Crr = car["mass"], car["CdA"], car["Crr"]

    E_prop = E_brake = t = 0.0
    W = {"roll": 0.0, "aero": 0.0, "climb": 0.0, "accel": 0.0}
    W_descent = 0.0                    # potential energy released on descents

    for i in range(1, n):
        ds = dist[i] - dist[i - 1]
        if ds <= 0:
            continue
        va = (v[i] + v[i - 1]) / 2.0
        a = (v[i] ** 2 - v[i - 1] ** 2) / (2 * ds)
        g = grade[i]
        F_roll = m * G * Crr
        F_aero = 0.5 * RHO * CdA * va * va
        F_grade = m * G * g
        F_acc = m * a
        F = F_roll + F_aero + F_grade + F_acc
        E = F * ds
        if E >= 0:
            E_prop += E
            # attribute this step's propulsive work to its force components
            W["roll"] += F_roll * ds
            W["aero"] += F_aero * ds
            W["climb"] += max(0.0, F_grade * ds)
            W["accel"] += max(0.0, F_acc * ds)
        else:
            E_brake += -E
        if F_grade * ds < 0:
            W_descent += -F_grade * ds
        t += ds / max(va, 0.5)

    # discrete stop events: each is an expected decelerate-then-reaccelerate
    # cycle. With a measured inventory, the approach speed is the modelled
    # speed at the feature's actual position and the event fires with its
    # class probability; the fallback events approximate one full stop from
    # 50 km/h per guessed town feature.
    for ev in route["stop_events"]:
        v_app = v[ev["idx"]] if ev["idx"] is not None else 50 / 3.6
        v_to = ev["v_to"]
        if v_app <= v_to:
            t += ev["p"] * ev["idle"]
            continue
        dkin = 0.5 * m * (v_app * v_app - v_to * v_to)
        E_prop += ev["p"] * dkin
        W["accel"] += ev["p"] * dkin
        E_brake += ev["p"] * dkin
        t += ev["p"] * ev["idle"]

    regen = car["regen"] * E_brake
    net_prop = max(E_prop - regen, 0.0)
    aux_J = car["aux_kw"] * 1000.0 * t
    return {
        "E_prop": E_prop, "E_brake": E_brake, "regen": regen,
        "net_prop": net_prop, "aux_J": aux_J, "t": t,
        "W": W, "W_descent": W_descent,
    }


def simulate(route, car):
    """Full result for one car on one route, including the two counterfactuals."""
    total_km = route["total_km"]
    base = run(route, car)
    out = _to_fuel(car, base["net_prop"], base["aux_J"], total_km)

    # --- counterfactual 1: the same road, flattened ---------------------
    # Identical geometry, speeds and stops, but zero grade. The difference is
    # exactly the fuel the terrain costs — net of everything the descents give
    # back through engine braking and regen.
    flat = run(route, car, grade=[0.0] * route["n"])
    flat_fuel = _to_fuel(car, flat["net_prop"], flat["aux_J"], total_km)

    # --- counterfactual 2: the same hills, straightened -----------------
    # Same grade, but the bend radius no longer caps the speed; only the legal
    # limit and comfortable accel/decel do. The difference is what the corners
    # cost in fuel and in time.
    v_straight = speed_profile(route["curv_raw"], route["legal"], route["n"],
                               straight=True)
    strt = run(route, car, v=v_straight)
    strt_fuel = _to_fuel(car, strt["net_prop"], strt["aux_J"], total_km)

    W = base["W"]
    prop = max(base["E_prop"], 1e-9)
    j2kwh = 1 / 3.6e6

    mountain_amount = out["amount"] - flat_fuel["amount"]
    curve_amount = out["amount"] - strt_fuel["amount"]

    return {
        "car_id": car["id"], "route": route["key"],
        # headline
        "amount": round(out["amount"], 2), "unit": out["unit"],
        "per100": round(out["per100"], 2), "unit100": out["unit100"],
        "cost_eur": round(out["cost_eur"], 2),
        "co2_kg": round(out["co2_kg"], 2),
        "time_min": round(base["t"] / 60.0, 1),
        "avg_kmh": round(total_km / (base["t"] / 3600.0), 1),
        # energy ledger
        "E_prop_kWh": round(base["E_prop"] * j2kwh, 2),
        "E_brake_kWh": round(base["E_brake"] * j2kwh, 2),
        "regen_kWh": round(base["regen"] * j2kwh, 2),
        # --- NEW: where the propulsion energy actually goes ---
        "work_kWh": {k: round(x * j2kwh, 2) for k, x in W.items()},
        "work_pct": {k: round(100.0 * x / prop, 1) for k, x in W.items()},
        # --- NEW: the mountain tax ---
        "mountain": {
            "amount": round(mountain_amount, 2),
            "unit": out["unit"],
            "cost_eur": round(out["cost_eur"] - flat_fuel["cost_eur"], 2),
            "co2_kg": round(out["co2_kg"] - flat_fuel["co2_kg"], 2),
            "pct_of_trip": round(100.0 * mountain_amount
                                 / max(out["amount"], 1e-9), 1),
            "flat_per100": round(flat_fuel["per100"], 2),
            "climb_work_kWh": round(W["climb"] * j2kwh, 2),
            "descent_energy_kWh": round(base["W_descent"] * j2kwh, 2),
            "descent_recovered_kWh": round(
                min(base["W_descent"], base["E_brake"]) * car["regen"] * j2kwh, 2),
        },
        # --- NEW: the curve tax ---
        "curves": {
            "amount": round(curve_amount, 2),
            "unit": out["unit"],
            "cost_eur": round(out["cost_eur"] - strt_fuel["cost_eur"], 2),
            "pct_of_trip": round(100.0 * curve_amount
                                 / max(out["amount"], 1e-9), 1),
            "straight_per100": round(strt_fuel["per100"], 2),
            "time_min_lost": round((base["t"] - strt["t"]) / 60.0, 1),
        },
    }


# ---------------------------------------------------------------- assembly
def stop_events_from_inventory(stops, n):
    """Turn the measured OSM stop-feature inventory into simulation events."""
    events = []
    for f in stops.get("features", []):
        beh = STOP_BEHAVIOUR.get(f["kind"])
        if beh is None:
            continue
        events.append({
            "idx": min(n - 1, int(round(f["dist_m"] / STEP))),
            "kind": f["kind"], "p": beh["p"],
            "v_to": beh["v_after"] / 3.6, "idle": beh["idle"],
        })
    return events


def build_route(key, name, color, pts, ele_raw=None, osm=None, stops=None):
    """Assemble a full route object from geometry + real DEM + real OSM tags."""
    rs, total = resample(pts, STEP)
    n = len(rs)
    if ele_raw is not None and len(ele_raw) != n:
        raise ValueError(f"{key}: {len(ele_raw)} elevations for {n} grid points")

    ele, ele_pt = condition_elevation(ele_raw)
    grade = grade_from(ele)
    curv_raw, curv100 = curvature_series(rs)
    legal, villages, src = legal_limits(rs, osm)
    v_ms = speed_profile(curv_raw, legal, n)

    villages_passed = sorted({x for x in villages if x})
    asc, desc = ascent_descent(ele)

    # --- discrete stop events: measured OSM inventory when available, the
    #     per-town guess otherwise (candidates screened before any fetch) ---
    if stops is not None:
        stop_events = stop_events_from_inventory(stops, n)
        stops_measured = True
        stop_inventory = stops.get("counts", {})
        # headline number: expected *full* stops (v_after == 0), so it stays
        # comparable with the old per-town count
        stops_est = round(sum(e["p"] for e in stop_events if e["v_to"] == 0), 1)
    else:
        fallback = sum(MAJOR_STOPS.get(x, 0) for x in villages_passed)
        stop_events = [{"idx": None, "kind": "fallback", "p": 1.0,
                        "v_to": 0.0, "idle": STOP_IDLE_S}] * fallback
        stops_measured = False
        stop_inventory = None
        stops_est = fallback

    route = {
        "key": key, "name": name, "color": color, "n": n,
        "total_km": round(total / 1000.0, 2),
        "dist_m": [p[2] for p in rs],
        "dist_km": [p[2] / 1000.0 for p in rs],
        "lat": [p[0] for p in rs], "lon": [p[1] for p in rs],
        "elevation": [round(e, 1) for e in ele],
        "grade": grade,
        "grade_pct": [round(g * 100, 2) for g in grade],
        "curv_raw": curv_raw,
        "curvature": [round(c, 2) for c in curv100],
        "legal": legal,
        "legal_kmh": legal,
        "limit_source": src,
        "speed_kmh": [round(x * 3.6, 1) for x in v_ms],
        "v_ms": v_ms,
        "village": villages,
        "villages_passed": villages_passed,
        "stop_events": stop_events,
        "stops_est": stops_est,
        "stops_measured": stops_measured,
        "stop_inventory": stop_inventory,
        "osm_limit_pct": round(100.0 * sum(1 for s in src if s == "osm") / n, 1),
    }
    route["curviness"] = curviness_stats(rs, curv_raw, curv100, route["total_km"])
    route["elev_stats"] = {
        "min_m": round(min(ele)), "max_m": round(max(ele)),
        "start_m": round(ele_pt[0]), "end_m": round(ele_pt[-1]),
        "ascent_m": round(asc), "descent_m": round(desc),
        "net_m": round(ele_pt[-1] - ele_pt[0]),
        "max_grade_pct": round(max(route["grade_pct"]), 1),
        "min_grade_pct": round(min(route["grade_pct"]), 1),
        "climb_work_kWh_per_t": round(1000 * G * asc / 3.6e6, 2),
        "pct_steep": round(100.0 * sum(1 for g in route["grade_pct"]
                                       if abs(g) >= 5.0) / n, 1),
    }
    return route
