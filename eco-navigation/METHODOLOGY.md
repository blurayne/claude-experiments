# Methodology — how the routes and the energy model were built

This document describes **exactly** how every number in the Eco-Navigation
visualization was produced: the algorithms, the equations, the parameters, and
where each input came from. The guiding principle is **honest provenance** —
some inputs are *measured* (your GPS tracks), some are *rule-based* (German
traffic law), and some are *modelled* (elevation and energy). Each is labelled
as such here and in the app.

> **TL;DR of provenance**
>
> | Quantity | Source | Confidence |
> |---|---|---|
> | Route geometry, distance, shape | **Measured** — your CoMaps GPX | High |
> | Curviness (heading change / 100 m) | **Measured** — from GPX geometry | High |
> | Which towns each route passes | **Measured** — GPX nearest-approach | High |
> | Village vs. rural speed zones | **Rule-based** — German StVO defaults | Medium |
> | Speed limits per segment | **Rule-based** — 50 town / 100 rural + curve cap | Medium |
> | Traffic-light / junction stops | **Modelled** — per-town stop count | Low–Medium |
> | Elevation & road grade | **Modelled** — researched town heights, interpolated | Medium |
> | Energy, fuel/kWh, cost, CO₂ | **Modelled** — vehicle physics, calibrated | Medium |

---

## 0. The two routes

Both tracks were exported from **CoMaps** (an OpenStreetMap-based navigation
app) as GPX and supplied by the user. Analysis of the raw points shows:

| | Route A (`route_arnbruck.gpx`) | Route B (`route_viechtach_koetzting.gpx`) |
|---|---|---|
| Track points | 1 802 | 1 876 |
| Total distance | **55.07 km** | **65.76 km** |
| Path | Deggendorf → Teisnach → Drachselsried → **Arnbruck** → Engelshütt | Deggendorf → Teisnach → **Viechtach** → **Bad Kötzting** → Engelshütt |

Both share the first **22.2 km** (Deggendorf → Teisnach) and the final climb
into Engelshütt; they differ only in the middle. The GPX files contained **no
`<ele>` elevation tags** (verified: zero `<ele>` elements), which is why
elevation had to be modelled rather than read.

The original start is Deggendorf (not Teisnach as first described) because that
is what the exported tracks contain; the Teisnach→Engelshütt portion is simply
the tail of each track, and it is where the two routes actually diverge.

---

## 1. Data sources

### 1.1 Measured (from the GPX)
- **Geometry**: latitude/longitude of every track point.
- **Distance**: sum of haversine distances between consecutive points.
- **Curvature**: change of compass bearing between consecutive segments.
- **Town pass-through**: nearest-approach of the track to each town centre.

### 1.2 Researched (web search, no API access)
Routing/elevation APIs (OSRM, Open-Meteo, Overpass, OpenTopoData, Mapbox,
GraphHopper, even Wikipedia) were **all blocked** by the build environment's
egress policy, and the `WebFetch` tool returned HTTP 403 globally. Only text
**web search** was available. From it the following anchor facts were gathered:

| Town | Elevation used (m a.s.l.) | Notes / source |
|---|---|---|
| Deggendorf | 313 | Danube valley, ~312–320 m (elevation databases via search) |
| Ruhmannsfelden | 470 | Bavarian-Forest plateau |
| Patersdorf | 500 | ridge before Teisnach |
| Teisnach | 467 | Schwarzer Regen valley |
| Drachselsried | 533 | Zellertal |
| Arnbruck | 590 | “~600 m, range 550–1080 m” (zellertal-online, arnbruck.de via search) |
| Viechtach | 451 | Schwarzer Regen |
| Bad Kötzting | 408 | lowest point on Route B (B85 valley) |
| Engelshütt | 709 | hamlet above Arnbruck/Arrach, upper Zellertal (estimated) |

Leg distances were cross-checked against ViaMichelin/route-planner snippets
(Teisnach–Viechtach ≈ 12 km, Viechtach–Bad Kötzting ≈ 13 km on the B85,
Bad Kötzting–Arnbruck ≈ 14 km on St 2132).

> ⚠️ Elevation anchors are **researched point values**, not a measured profile.
> The shape *between* anchors is interpolated. Net climb is reliable; the
> fine-grain wiggle is not. Run `fetch_real_data.py` where an elevation API is
> reachable to replace this with a true DEM profile.

### 1.3 Rule-based (German traffic law)
- Default speed limits under the **StVO**: **50 km/h** inside built-up areas,
  **100 km/h** on rural roads outside built-up areas. (No per-sign scraping —
  these are the legal defaults, which dominate on Staatsstraßen / B-roads.)

### 1.4 Vehicle & market parameters
Published specs + typical real-world figures (see §6). German 2026 price/CO₂
assumptions: petrol **1.79 €/L**, diesel **1.69 €/L**, electricity
**0.40 €/kWh** (home-charging blend); grid carbon **0.35 kg CO₂/kWh**; petrol
**2.32 kg CO₂/L**, diesel **2.65 kg CO₂/L**.

---

## 2. Geometry, distance & resampling

The track is parsed and **resampled to a uniform 25 m step** along its length
(linear interpolation between GPX points). A fine step is used so that tight
bends are resolved and the curvature speed-cap behaves realistically; the
display arrays are later down-sampled to ~100 m.

Distance between two points uses the **haversine** formula on a sphere
(R = 6 371 000 m):

```
a = sin²(Δφ/2) + cos φ₁ · cos φ₂ · sin²(Δλ/2)
d = 2R · asin(√a)
```

## 3. Curvature (the “curviness” metric)

At each interior point the compass **bearing** of the incoming and outgoing
segment is computed:

```
θ = atan2( sin Δλ · cos φ₂ ,  cos φ₁ · sin φ₂ − sin φ₁ · cos φ₂ · cos Δλ )
```

The **heading change** `Δθ = |wrap180(θ_out − θ_in)|` (degrees) is the local
turning. Normalised to **degrees of heading change per 100 m**, it is the
curviness series plotted in the app (smoothed over a ~125 m window).

Summary statistics (computed on the *raw* polyline, so they don't depend on the
resampling step):
- **Total heading change** Σ|Δθ| over the whole route (deg).
- **deg/km** = total ÷ distance.
- **Local radius** at a vertex: `R = segment_length / radians(Δθ)`.
  Counted as a **tight bend** if `R < 80 m`, **moderate** if `80 ≤ R < 200 m`.
- **Median curve radius** across all vertices that actually turn (> 0.5°).

## 4. Elevation & grade  *(modelled)*

Researched town elevations (§1.2) are placed as **anchors at their measured
km-position** on each track (the km-position comes from the GPX nearest-approach
analysis). Elevation at every 25 m sample is then **piecewise-linearly
interpolated** between anchors and **smoothed** (≈525 m moving average) to avoid
artificial kinks.

Road **grade** is the smoothed derivative, clamped to ±10 %:

```
grade_i = clamp( (ele_i − ele_{i−1}) / ds ,  −0.10, +0.10 )
```

Because anchors follow river valleys, modelled grades are gentle (max ≈ 2 %);
the **net** climb (A: +396 m over 444 m of ascent; B: +396 m over 502 m of
ascent, because it drops to Bad Kötzting first) is the energetically important
quantity and is robust to the interpolation.

## 5. Speed model  *(rule-based + physics)*

For each 25 m sample the **driven speed** is the minimum of three limits:

1. **Legal limit** — 50 km/h if the point is within 800 m of a town centre
   (built-up area), else 100 km/h.
2. **Curve limit** — lateral-acceleration cap. For local turn radius `R`,
   `v_curve = √(a_lat · R)` with `a_lat = 2.2 m/s²` (a careful/eco driver).
3. **Free-flow cap** — `V_free = 88 km/h`, the speed actually sustainable on
   these single-lane St/B roads (drivers rarely hold the 100 legal max).

A **forward + backward acceleration-limiting pass** (`a_max = 1.2 m/s²`) then
smooths the profile so the car cannot change speed faster than is physical:

```
v_i ← min( v_i, √(v_{i−1}² + 2·a_max·ds) )      # forward (accel)
v_i ← min( v_i, √(v_{i+1}² + 2·a_max·ds) )      # backward (braking)
```

### 5.1 Traffic-light / junction stops *(modelled)*

The continuous speed profile above never reaches a full stop. Real driving does
— at traffic lights, give-way junctions and pedestrian crossings. Each built-up
area is assigned a **typical number of stop events** a through-driver actually
faces:

| Town | Stops | Town | Stops |
|---|---|---|---|
| Deggendorf | 3 | Drachselsried | 1 |
| Viechtach | 2 | Arnbruck | 1 |
| Bad Kötzting | 2 | Ruhmannsfelden | 1 |
| Teisnach | 1 | Patersdorf | 1 |

A stop only counts when the track actually enters that town's 800 m built-up
radius — e.g. Route A bypasses Arnbruck's centre (it stays ~1.4 km out), so
Arnbruck contributes no stop on either route. The resulting estimate is
**Route A ≈ 6 stops** (Deggendorf 3, Ruhmannsfelden 1, Teisnach 1,
Drachselsried 1) and **Route B ≈ 9 stops** (Deggendorf 3, Ruhmannsfelden 1,
Teisnach 1, Viechtach 2, Bad Kötzting 2). Each stop adds:
- **standing/manoeuvre time** of 22 s (idle), and
- a **stop-and-go energy** cycle: brake from 50 km/h to 0 (regen-eligible) and
  re-accelerate 0 → 50 km/h, i.e. `½·m·v_stop²` of fresh propulsion with
  `v_stop = 50 km/h`.

This is why Route A’s drive time is ≈49 min and Route B’s ≈58 min — close to
what a commercial navigator would quote. (Commercial apps fold *historical*
signal/junction delay into their ETA from fleet data; here it is a transparent
per-town estimate. It does **not** model live traffic or queueing.)

## 6. Energy model  *(modelled vehicle physics)*

A standard **longitudinal road-load** model is integrated over every 25 m step.
The tractive force at the wheels is the sum of four terms:

```
F = F_roll + F_aero + F_grade + F_inertia
  = m·g·Crr  +  ½·ρ·CdA·v²  +  m·g·sin(atan(grade))  +  m·a
```

with air density `ρ = 1.20 kg/m³`, `g = 9.81 m/s²`, and `a` the acceleration
implied by the speed profile (`a = (v_i² − v_{i−1}²)/2ds`). Energy for the step
is `E = F·ds`.

- Steps with `E > 0` accumulate **propulsion energy** `E_prop`.
- Steps with `E < 0` accumulate **braking energy** `E_brake`.
- Stops (§5.1) add their kinetic cycle to both.

**Regenerative braking** recovers a fraction of `E_brake` for the hybrid and EV
(charge-sustaining assumption for the hybrid):

```
net_prop = max( E_prop − regen · E_brake , 0 )
```

**Drivetrain conversion** to fuel or electricity:

```
ICE   :  fuel_energy   = net_prop / η_drive  +  aux_energy / η_drive
EV    :  battery_energy = net_prop / η_drive  +  aux_energy
         wall_energy     = battery_energy / η_charge
```

where `aux_energy = P_aux · t` (constant electrical load for lights/HVAC/
electronics). Fuel volume / electricity:

```
litres = fuel_energy / E_density        (petrol 32.04 MJ/L, diesel 35.64 MJ/L)
kWh    = wall_energy / 3.6e6
```

Cost = amount × price; CO₂ = amount × emission factor (§1.4); and
`per-100 km = amount / distance × 100`.

### 6.1 Vehicle parameters

| Car | Drivetrain | Mass (kg) | Cd·A (m²) | Crr | η_drive | Regen | Fuel |
|---|---|---|---|---|---|---|---|
| Toyota Auris Hybrid 1.8 (2016) | Full hybrid | 1500 | 0.30·2.20 | 0.0095 | 0.34 | 0.62 | petrol |
| VW ID.3 (58 kWh) | Battery-electric | 1900 | 0.267·2.36 | 0.0095 | 0.90 | 0.70 | electric (η_charge 0.88) |
| Fiat Panda 1.2 (2016) | Petrol | 1010 | 0.33·2.10 | 0.011 | 0.27 | 0 | petrol |
| Opel 2005 (Kadett-class) | Petrol, older | 1080 | 0.34·2.05 | 0.0125 | 0.235 | 0 | petrol |
| Mercedes C-Class diesel | Diesel | 1620 | 0.27·2.20 | 0.010 | 0.34 | 0 | diesel |

Auxiliary load `P_aux`: 0.25–0.45 kW per car. The drivetrain efficiencies were
**calibrated** so combined consumption lands in each car's known real-world band
(Auris ≈ 4.5 L, ID.3 ≈ 19 kWh, Panda ≈ 5.5 L, old Opel ≈ 7 L, C-diesel ≈ 5 L
per 100 km). The model is therefore trustworthy for **comparing the two routes**
(its main purpose); absolute values are good estimates, not dyno measurements.

> **“2005 Opel Cadet” note:** the Opel *Kadett* ended production in 1991, so
> “2005 Opel Cadet” is ambiguous. It is modelled as a **2005-era small Opel**
> (Corsa/Kadett-class, older port-injection petrol, no regen). Tell me if you
> meant a specific model and I'll re-parameterise.

## 7. Capability

“Can each car do each route?” — **Yes, all five, comfortably.** Modelled grades
stay gentle (valley roads, max ≈ 2 %), so even the 51 kW Panda and the ~55 kW
old Opel have ample power; no route needs more than a few kW of sustained climb
power at these speeds. The differences between cars are **efficiency, cost and
comfort**, not capability. The hybrid and EV gain the most here because the
curvy, village-dotted, stop-and-go terrain rewards **regenerative braking**.

## 8. Outputs & how to regenerate

`build.py` (pure Python standard library, no network) produces:

- `data/eco_data.json` — full bundle (routes, profiles, cars, results, provenance)
- `data.js` — the same bundle as `window.ECO_DATA` for the HTML viewer
- `data/results.csv` — per-car, per-route consumption / cost / CO₂ / time
- `data/profile_arnbruck.csv`, `data/profile_koetzting.csv` — per-25 m profiles
- `data/gpx/*.gpx` — the original tracks (committed for reproducibility)

```bash
cd eco-navigation
python3 build.py                       # regenerate all data
npx esbuild EcoNavigation.jsx \        # recompile the UI (only if JSX changed)
  --jsx=transform --format=iife --outfile=app.js
```

To replace modelled elevation/speed-limits with **real** data, run
`fetch_real_data.py` in an environment where an elevation API
(Open-Meteo / OpenTopoData) and Overpass are reachable; it rewrites the elevation
anchors / per-point elevation and `maxspeed` tags, after which `build.py`
reproduces the profiles from real measurements.

## 9. Known limitations

- Elevation profile is **interpolated** between researched town heights, not a
  measured DEM (the GPX had no elevation; APIs were blocked).
- Speed limits are **legal defaults by zone**, not per-sign (no live 70/80
  zones, roadworks, or seasonal limits).
- Stops are a **static per-town estimate**; no live traffic, queueing, or
  time-of-day.
- Energy model ignores wind, temperature, payload beyond a nominal driver,
  tyre/road condition, and cold-start enrichment.
- Prices and grid carbon are **2026 assumptions** for Germany; edit the
  constants at the top of `build.py` to localise.
