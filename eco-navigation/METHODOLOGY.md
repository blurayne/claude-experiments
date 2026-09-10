# Methodology — how the routes and the energy model were built

This document describes **exactly** how every number in the Eco-Navigation visualization was produced: the algorithms, the equations, the parameters, and where each input came from. The guiding principle is **honest provenance** — some inputs are *measured*, some are *rule-based* (German traffic law), and some are *modelled* (the energy physics). Each is labelled as such here and in the app.

> **This is version 2.** The first version of this experiment ran in a sandbox with no outbound network, so its terrain was sixteen researched town elevations interpolated along the track. Elevation, speed limits and the routing engine are now all real. [Section 10](#10-what-changed-when-the-terrain-became-real) documents exactly what that changed, and the old bundle is archived at `data/eco_data_modelled_v1.json` so the comparison stays reproducible.

> **TL;DR of provenance**
>
> | Quantity | Source | Confidence |
> |---|---|---|
> | Route geometry, distance, shape | **Measured** — CoMaps GPX (A, B), OSRM (C, D) | High |
> | Curviness (heading change / 100 m) | **Measured** — from track geometry | High |
> | Elevation & road grade | **Measured** — EU-DEM 25 m, 10 064 samples | Medium–High |
> | Speed limits per segment | **Measured** — OSM `maxspeed`, StVO fallback | Medium–High |
> | Which towns each route passes | **Measured** — nearest-approach | High |
> | Village vs. rural zones | **Rule-based** — German StVO defaults | Medium |
> | Traffic-light / junction stops | **Modelled** — per-town stop count | Low–Medium |
> | Energy, fuel/kWh, cost, CO₂ | **Modelled** — vehicle physics, calibrated | Medium |
> | Mountain & curve taxes | **Modelled** — counterfactual re-runs | Medium |

---

## 0. The four routes

Routes **A** and **B** were exported from **CoMaps** (an OpenStreetMap-based navigation app) as GPX and supplied by the user. Routes **C** and **D** were *found* — see [section 1.4](#14-searching-for-a-better-third-route) — by routing the same origin and destination over the OSM road network and scoring every candidate through the full energy model.

| | A · Arnbruck | B · Viechtach/Kötzting | C · Bodenmais | D · Regen |
|---|---|---|---|---|
| File | `route_arnbruck.gpx` | `route_viechtach_koetzting.gpx` | `route_bodenmais.gpx` | `route_regen.gpx` |
| Origin | CoMaps | CoMaps | OSRM | OSRM |
| Distance | **55.07 km** | **65.76 km** | **64.15 km** | **66.50 km** |
| Elevation samples | 2 204 | 2 632 | 2 567 | 2 661 |
| Path | Deggendorf → Teisnach → Drachselsried → **Arnbruck** → Eck saddle → Engelshütt | Deggendorf → Teisnach → **Viechtach** → **Bad Kötzting** → Engelshütt | Deggendorf → Teisnach → **Bodenmais** → Engelshütt | Deggendorf → **Regen** → **Bodenmais** → Engelshütt |

All four share the first **22.2 km** (Deggendorf → Teisnach) apart from D, which branches earlier up the B11 Regen valley. All four start at `48.833358, 12.962045` and end at `49.206675, 13.031865`.

The supplied GPX files contain **no `<ele>` elevation tags** (verified: zero `<ele>` elements), which is why elevation is sampled from a terrain raster rather than read from the track.

---

## 1. Data sources

### 1.1 Measured — geometry

- **Geometry**: latitude/longitude of every track point.
- **Distance**: sum of haversine distances between consecutive points.
- **Curvature**: change of compass bearing along a uniformly resampled polyline.
- **Town pass-through**: nearest-approach of the track to each town centre.

### 1.2 Measured — elevation

Downloaded by `fetch_real_data.py` and cached in `data/elevation_<route>.json`.

- **Primary source**: **EU-DEM 25 m** (Copernicus / European Environment Agency) via the [opentopodata](https://www.opentopodata.org/) API.
- **Sampling**: one reading every **25 m** along each track — the DEM's native raster resolution. Sampling more densely returns interpolated values and adds no information. That is **10 064 real elevation readings** across the four routes, against the 16 hand-guessed town anchors of version 1.
- **Voids**: zero encountered. The loader rejects anything outside 200–1500 m (impossible in this corridor: the Danube at Deggendorf is ~312 m, the Bavarian Forest tops out at 1456 m) and linearly interpolates across any gap.
- **Cross-check**: the script can re-query the same points against Copernicus **GLO-90** via open-meteo and report the RMS difference. Spot checks at five town centres agreed within **3 m**.

EU-DEM's stated vertical RMSE is a few metres. Over a 25 m step that is a large *apparent* grade, so the raster is conditioned before it is differentiated — see [section 4](#4-elevation--grade-measured).

### 1.3 Measured — speed limits

Downloaded by `fetch_real_data.py --speed` and cached in `data/speedlimits_<route>.json`.

An Overpass query returns every `highway` way in a bounding box around the track. Each 25 m track point is then snapped to the nearest way geometry within **30 m** (via a spatial hash, so the match stays linear in the number of points) and inherits that way's `maxspeed`, `highway` class and `ref`/`name`.

| Route | Points matched to a way | With an explicit `maxspeed` | Roads used |
|---|---|---|---|
| A | 1 912 / 2 204 (87 %) | 1 334 | B 11, St 2326, St 2636, St 2136, St 2132 |
| B | 2 172 / 2 632 (83 %) | 1 543 | B 11, St 2139, St 2138, B 85, St 2326 |
| C | 2 164 / 2 567 (84 %) | 1 191 | B 11, St 2132, St 2136 … |
| D | 2 223 / 2 661 (84 %) | 1 541 | B 11, B 85, St 2132 … |

Between 46 % and 61 % of simulation points end up with a real OSM limit; the rest fall back to the StVO default for their zone (50 in a built-up area, 100 outside). `maxspeed` values such as `DE:urban`, `walk`, `zone30` and `mph` units are parsed; `none`/`signals`/`variable` are treated as untagged. A short median filter over the limit series stops a single mis-snapped point creating a 25 m speed island.

### 1.4 Searching for a better third route

`fetch_routes.py` asks the public **OSRM** demo server (standard OSM car profile) to route the same origin and destination through each of thirteen plausible intermediate towns. Each result is snapped to a ~275 m grid and compared with routes A and B by shared-cell fraction; anything sharing more than 65 % of its cells with an existing route is a variation rather than an alternative and is dropped, as is anything over 90 km.

Eight distinct candidates survived. `screen_routes.py` then gave each one real DEM elevation and ran it through the **same `model.py` physics** as the published routes — because distance alone does not decide which route is better, and neither does the routing engine's own duration estimate.

| Candidate | km | Ascent | °/km | Stops | Cost (Auris) |
|---|---|---|---|---|---|
| **A · Arnbruck** (published) | 55.07 | 1 045 m | 163.7 | 6 | **€4.54** |
| via Bodenmais → **route C** | 64.15 | 1 176 m | 145.3 | 6 | €5.07 |
| via Viechtach | 62.16 | 1 232 m | 150.9 | 7 | €5.10 |
| via Bodenmais + Lam | 66.21 | 1 216 m | 155.5 | 7 | €5.18 |
| **B · Viechtach/Kötzting** (published) | 65.76 | 1 166 m | 155.8 | 9 | €5.32 |
| via Regen → **route D** | 66.50 | 1 385 m | 143.8 | 5 | €5.42 |
| via Regen + Bodenmais | 69.12 | 1 420 m | 158.2 | 6 | €5.58 |
| via Miltach | 78.10 | 1 344 m | 111.7 | 9 | €6.09 |
| via Zwiesel | 75.87 | 1 480 m | 161.0 | 8 | €6.31 |
| via Kirchberg | 77.59 | 1 616 m | 147.2 | 6 | €6.32 |

(Screening samples the DEM every 100 m rather than 25 m — four times fewer API calls, and after the grade smoothing it ranks candidates identically. The two adopted routes were then re-fetched at the full 25 m, which is why the costs in this screening table differ by a couple of cents from the published figures elsewhere in this document.)

**No candidate beats route A.** Two were published anyway because they are interesting for different reasons.

**C · Bodenmais** is the best alternative. It beats the existing route B on cost for all five cars, and on time, distance, curviness and number of stops — though not on every metric: it climbs marginally more in total (1 060 m against 1 050 m) and crosses a 843 m summit where route B never exceeds 593 m.

**D · Regen** is the most genuinely separate corridor of the four — 25 % shared with A and only 4 % with B — and has the fewest stops of any route, but its 1 299 m of ascent make it the most expensive.

### 1.5 Modelled — vehicles, prices, stops

Vehicle parameters come from published specifications plus typical real-world consumption figures; see `model.py`. Fuel prices and grid carbon intensity are 2026 estimates for Germany. Stop counts per built-up area are an estimate, not a survey.

---

## 2. Geometry, distance & resampling

Distances use the haversine formula on a sphere of radius 6 371 000 m:

```
a   = sin²(Δφ/2) + cos φ₁ · cos φ₂ · sin²(Δλ/2)
d   = 2R · asin(√a)
```

Each track is then **resampled to a uniform 25 m step** by walking the polyline and linearly interpolating positions at every 25 m of accumulated distance. Two reasons:

1. It matches the EU-DEM raster, so terrain and geometry line up cell for cell.
2. It makes the four routes comparable. The CoMaps tracks carry ~1 800 vertices and the OSRM tracks ~1 900, but they are distributed differently — heading change *per vertex* would not be comparable between them, while heading change *per 100 m of road* is.

Display arrays are downsampled to ~100 m for the charts; the simulation always runs on the 25 m grid.

---

## 3. Curvature — the curviness metric

At every interior grid point the bearing change between the incoming and outgoing 25 m segment is measured:

```
turn_i = |angdiff(bearing(p_{i-1}, p_i), bearing(p_i, p_{i+1}))|      [degrees]
```

The series is smoothed over a 5-sample (~125 m) window to suppress GPS jitter, then normalised to **degrees of heading change per 100 m** so the figure is independent of the grid step.

### 3.1 Reported curviness statistics

- **`deg_per_km`** — total heading change divided by route length. The headline number.
- **`curviness_index`** — the same figure on a 0–100 scale, where 300 °/km (a genuinely serpentine mountain road) maps to 100. Clipped so the scale stays readable.
- **`bends_per_km`** — count of grid points whose implied radius is under 200 m, per kilometre.
- **`median_curve_radius_m`**, **`min_curve_radius_m`** — the distribution of how tight the corners actually are.
- **`pct_distance`** — the share of the route's length in each radius band.

The local radius implied by a heading change over a 25 m step is:

```
R_i = step / radians(turn_i)
```

Bands follow the radii at which a driver genuinely has to slow down, at a comfortable 2.2 m/s² of lateral acceleration:

| Band | Radius | Comfortable speed |
|---|---|---|
| Hairpin | < 45 m | ~35 km/h |
| Tight | 45–80 m | ~35–48 km/h |
| Moderate | 80–200 m | ~48–75 km/h |
| Gentle | 200–500 m | ~75–120 km/h |
| Straight | > 500 m | not limiting |

Results:

| Route | °/km | Index | Bends/km | Median R | Tightest |
|---|---|---|---|---|---|
| A · Arnbruck | 163.7 | 54.6 | 6.2 | 478 m | 25 m |
| B · Viechtach/Kötzting | 155.8 | 51.9 | 6.0 | 497 m | 23 m |
| C · Bodenmais | 145.3 | 48.4 | 5.1 | 529 m | 29 m |
| D · Regen | 143.8 | 47.9 | 5.1 | 537 m | 32 m |

---

## 4. Elevation & grade *(measured)*

The raw 25 m DEM samples are conditioned in three steps before being differentiated.

1. **Median filter, 7 samples (175 m)** — removes single-cell spikes and any residual void artefact without rounding off real summits.
2. **Moving average, 21 samples (525 m)** — suppresses the remaining raster noise. Averaging *N* independent samples reduces noise by √N, so a ~3 m DEM error becomes well under 1 m.
3. **Central difference over a 300 m baseline** for the grade itself:

```
grade_i = (ele_{i+6} − ele_{i−6}) / 300 m,   clamped to ±12 %
```

### 4.1 Why 300 m and not 25 m

This is the one place where the parameters were tuned rather than assumed, so it is worth being explicit. They were calibrated against a stretch of the **B11 in the Danube valley that is known to be gently graded**:

| Baseline | p50 grade | p90 | p99 | max | Eck pass climb |
|---|---|---|---|---|---|
| 100 m | 2.17 % | 6.67 % | 9.32 % | 11.21 % | 5.54 % |
| 200 m | 1.79 % | 6.04 % | 8.43 % | 8.96 % | 5.31 % |
| **300 m** | **1.45 %** | **5.88 %** | **7.91 %** | **8.01 %** | **5.24 %** |
| 400 m | 1.34 % | 5.77 % | 7.43 % | 7.53 % | 5.10 % |
| 600 m | 1.33 % | 5.12 % | 6.53 % | 6.55 % | 4.75 % |

At a 100 m baseline the DEM puts 25 % of that road above 5 % and produces 14 % spikes, which no B-road has. Widening to 300 m removes those artefacts while still resolving the real Eck pass climb as a sustained ~6 % and keeping its summit at 843 m of the raw 847 m. Beyond 300 m the gain flattens and real terrain starts being smoothed away.

**This is the largest remaining source of uncertainty in the model.** A DEM samples the *terrain*, not the *road surface*: where the road sits on an embankment, in a cutting, on a bridge, or simply where the recorded track drifts a few metres across a steep-sided valley floor, the raster reports the hillside rather than the tarmac. That error is spatially correlated, so averaging does not fully remove it. Per-point grades should be read as indicative; the integrated quantities (total ascent, climb work, the mountain tax) are much more robust.

### 4.2 Total ascent with hysteresis

Summing every positive 25 m step would count DEM noise as climbing and inflate the total badly (1 326 m for route A, against 957 m once conditioned). Instead the profile is walked while tracking the running extremum, and a leg is only committed once the profile has turned back by **4 m** — the same trick GPS watches use. A climb is therefore measured valley-to-summit rather than in whatever chunks the sampling happened to fall into.

The result is stable, which is the point: route A's ascent moves only from 1 059 m to 1 040 m as the threshold goes from 4 m to 8 m, and ascent − descent closes to the net height change exactly.

### 4.3 Results

| Route | Start | End | Peak | Ascent | Descent | Steepest | ≥5 % |
|---|---|---|---|---|---|---|---|
| A · Arnbruck | 322 m | 578 m | **843 m** | 957 m | 695 m | 8.9 % | 23.1 % |
| B · Viechtach/Kötzting | 322 m | 578 m | 593 m | 1 050 m | 788 m | 12.0 % | 18.4 % |
| C · Bodenmais | 322 m | 576 m | 843 m | 1 060 m | 813 m | — | 21.0 % |
| D · Regen | 322 m | 576 m | **859 m** | 1 299 m | 1 052 m | — | 26.9 % |

Route A's peak is the **Eck saddle**, the ridge between the Zellertal and the Lamer Winkel, which the road crosses at ~843 m before dropping into Arrach. Version 1 missed it entirely.

Start and end elevations are read from the *de-spiked* series rather than the smoothed one: a 525 m average over the approach road would otherwise report a different height for the same destination depending on which direction the route arrives from.

---

## 5. Speed model *(measured limits + physics)*

Three caps are applied in order, and the lowest wins.

**5.1 Legal limit.** The real OSM `maxspeed` where the point matched a tagged way, otherwise the StVO default: 50 km/h inside a built-up area, 100 km/h outside. A point counts as built-up if it lies within 800 m of a known town centre.

**5.2 Bend radius.** A car cannot corner faster than its lateral grip and the driver's comfort allow:

```
v_curve = √(a_lat · R),      a_lat = 2.2 m/s²
```

2.2 m/s² is a relaxed, eco-minded cornering effort — well below the ~8 m/s² a modern tyre can deliver, and roughly what an unhurried driver actually uses.

**5.3 Longitudinal acceleration.** A forward pass limits how fast speed can build, and a backward pass limits how late you can brake:

```
forward :  v_i ≤ √(v_{i−1}² + 2·a_acc·Δs),   a_acc = 1.1 m/s²
backward:  v_i ≤ √(v_{i+1}² + 2·a_dec·Δs),   a_dec = 1.6 m/s²
```

Braking is allowed to be firmer than acceleration, which is how people actually drive. A floor of 2.8 m/s keeps the time integral finite. A free-flow ceiling of 88 km/h reflects what these single-carriageway B- and St-roads sustain in practice, regardless of a 100 km/h sign.

**5.4 Discrete stops.** A continuous speed profile misses the fact that you actually stop at traffic lights. Each built-up area contributes an estimated number of stop events (3 for Deggendorf, 2 for Viechtach, Bad Kötzting, Regen and Zwiesel, 1 for smaller places). Each stop adds 22 s of standing time and a full decelerate-to-zero / accelerate-back-to-50 km/h cycle. This is the weakest input in the model and is labelled as modelled throughout.

---

## 6. Energy model *(modelled vehicle physics)*

At each 25 m step the longitudinal force balance is integrated:

```
F_roll  = m · g · Crr
F_aero  = ½ · ρ · CdA · v̄²                      ρ = 1.20 kg/m³
F_grade = m · g · grade
F_acc   = m · a                                 a = (v_i² − v_{i−1}²) / 2Δs
F_total = F_roll + F_aero + F_grade + F_acc
E_step  = F_total · Δs
```

Positive `E_step` is propulsion work at the wheel; negative `E_step` is energy the car must shed, and goes to `E_brake`. Each step's propulsive work is also attributed to its four force components, which is what the "where the energy goes" chart shows.

Then, per vehicle:

```
regen_recovered = regen_factor · E_brake
net_propulsion  = max(E_prop − regen_recovered, 0)
aux_energy      = aux_kW · t

electric :  battery = net_propulsion/η + aux ;  wall = battery/η_charge
combustion: fuel_J  = (net_propulsion + aux)/η
litres     = fuel_J / LHV        petrol 32.04 MJ/L, diesel 35.64 MJ/L
```

### 6.1 Vehicle parameters

| Car | Mass | CdA | Crr | η | Regen | Aux |
|---|---|---|---|---|---|---|
| Toyota Auris Hybrid 1.8 | 1 500 kg | 0.660 | 0.0095 | 0.34 | 0.62 | 0.30 kW |
| VW ID.3 (58 kWh) | 1 900 kg | 0.630 | 0.0095 | 0.90 | 0.70 | 0.45 kW |
| Fiat Panda 1.2 | 1 010 kg | 0.693 | 0.011 | 0.27 | 0 | 0.30 kW |
| Opel (2005, small petrol) | 1 080 kg | 0.697 | 0.0125 | 0.235 | 0 | 0.25 kW |
| Mercedes C-Class diesel | 1 620 kg | 0.594 | 0.010 | 0.34 | 0 | 0.35 kW |

`η` is a single average tank-to-wheel efficiency, not a speed/load map — the main simplification in the model. Prices: petrol 1.79 €/L, diesel 1.69 €/L, electricity 0.40 €/kWh. Carbon: 2.32 kg/L petrol, 2.65 kg/L diesel, 0.35 kg/kWh grid.

---

## 7. The mountain tax — what climbing costs

"How much fuel goes into getting over the mountains" has no single obvious definition, because some of the energy spent climbing comes back on the way down. Two complementary figures are reported.

### 7.1 Climb work (gross)

The raw potential energy gained, summed over every ascending step:

```
W_climb = Σ max(0, m · g · grade_i · Δs)
```

This is physically unambiguous but overstates the cost, because it ignores what the descents return. It is the orange bar in the app, and it scales purely with mass and total ascent. A terrain-only version, independent of any car, is also reported as `climb_work_kWh_per_tonne`.

### 7.2 The mountain tax (net) — a counterfactual

The honest answer to "what did the hills cost me" is the difference between the trip you drove and the same trip without hills. So every route is simulated **twice**:

- once over the real terrain, and
- once over the **identical road with the grade set to zero** — same distance, same bends, same speed profile, same stops.

```
mountain_tax = fuel(real terrain) − fuel(same road, flattened)
```

This automatically accounts for everything the descents give back — engine braking, coasting, and regenerative braking — without needing a separate correction term. It is reported in litres or kWh, in euros, in kg CO₂, and as a percentage of the trip.

Results for one one-way trip:

| Car | Route A | Route B | Route C | Route D | Share of trip |
|---|---|---|---|---|---|
| Toyota Auris Hybrid | €0.83 | €0.84 | €0.81 | €0.86 | 16.5–18.4 % |
| VW ID.3 | €0.87 | €0.89 | €0.86 | €0.91 | 18.2–20.2 % |
| Fiat Panda 1.2 | €0.89 | €0.88 | €0.85 | €0.90 | 13.3–15.1 % |
| Opel (2005) | €1.09 | €1.07 | €1.04 | €1.10 | 13.2–15.1 % |
| Mercedes C-diesel | €1.09 | €1.12 | €1.10 | €1.25 | 18.6–20.9 % |

**Between an eighth and a fifth of the fuel on every one of these routes is spent purely on gaining height.** The mountain tax barely differs between routes — they all climb from the same valley to the same destination — but it differs a lot between *cars*: the two with regenerative braking recover 1.8–3.8 kWh on the descents, while the three without recover nothing and turn every metre of descent into brake heat.

---

## 8. The curve tax — what corners cost

The same counterfactual trick, applied to geometry instead of terrain. Each route is simulated a **third** time with the bend-radius cap removed from [section 5.2](#5-speed-model-measured-limits--physics), so speed is limited only by the legal limit and by comfortable acceleration:

```
curve_tax      = fuel(real bends) − fuel(same hills, straightened)
curve_time_lost = t(real bends) − t(same hills, straightened)
```

| Route | Auris | ID.3 | Panda | Opel | Merc | Time lost |
|---|---|---|---|---|---|---|
| A · Arnbruck | €0.16 | €0.13 | €0.52 | €0.65 | €0.63 | +2.8 min |
| B · Viechtach/Kötzting | €0.11 | €0.09 | €0.35 | €0.43 | €0.45 | +2.3 min |
| C · Bodenmais | €0.08 | €0.07 | €0.30 | €0.37 | €0.36 | +2.4 min |
| D · Regen | €0.11 | €0.10 | €0.38 | €0.47 | €0.48 | +2.6 min |

Two things stand out. **Corners cost far less than hills** — a few cents against roughly a euro. And **the split by drivetrain is even sharper than for the mountain tax**: the hybrid pays €0.16 on route A where the old Opel pays €0.65, four times as much, because the energy shed entering a bend comes straight back out of the battery on the way out. Corners cost a regen car *time* much more than they cost it fuel — the time penalty is identical for all five cars, since it depends on the road, not the drivetrain.

---

## 9. Capability

All five cars are mechanically fine on all four routes. The steepest sustained grades are around 6 % with short ramps reaching 9–12 %; at 50 km/h on an 8 % grade a 1 010 kg Panda needs roughly 15 kW at the wheel against its 51 kW, so even the least powerful car in the set has ample margin. The differences between these cars are efficiency and comfort, not capability.

---

## 10. What changed when the terrain became real

Version 1's elevation came from 16 researched town heights interpolated along the track. Comparing it against the measured EU-DEM profile (`python3 compare_versions.py`):

| Route | Metric | Modelled (v1) | Real DEM | Change |
|---|---|---|---|---|
| A · Arnbruck | Highest point | 709 m | **843 m** | +19 % |
| A · Arnbruck | Total ascent | 444 m | **957 m** | +116 % |
| A · Arnbruck | Total descent | 47 m | **695 m** | +1379 % |
| A · Arnbruck | Steepest grade | 2.1 % | **8.9 %** | +324 % |
| B · Kötzting | Highest point | 709 m | **593 m** | −16 % |
| B · Kötzting | Total ascent | 502 m | **1 050 m** | +109 % |
| B · Kötzting | Steepest grade | 2.1 % | **12.0 %** | +471 % |

Three things were badly wrong:

1. **It missed an entire mountain pass.** Route A crosses the Eck saddle at 843 m; the modelled profile topped out at 709 m and put its summit in the wrong place. It also assumed both routes ended at the same 709 m high point, when route B in fact never goes above 593 m.
2. **It understated climbing by more than half**, because interpolating between town centres smooths away every intermediate hill — and this corridor is full of them.
3. **Its steepest grade anywhere was 2.1 %**, which is what a route looks like when you draw straight lines between fifteen towns. The real roads reach 9–12 %. Without that, a mountain-energy metric would have been meaningless.

The effect on cost splits cleanly by drivetrain:

| Car | Route A | Route B |
|---|---|---|
| Toyota Auris Hybrid | €4.55 → **€4.52** (−1 %) | €5.28 → **€5.13** (−3 %) |
| VW ID.3 | €4.38 → **€4.31** (−2 %) | €5.06 → **€4.89** (−3 %) |
| Fiat Panda 1.2 | €5.53 → **€5.89** (+7 %) | €6.48 → **€6.62** (+2 %) |
| Opel (2005) | €6.78 → **€7.23** (+7 %) | €7.95 → **€8.12** (+2 %) |
| Mercedes C-diesel | €4.83 → **€5.43** (+12 %) | €5.61 → **€6.04** (+8 %) |

The hybrid and the EV got **cheaper**: real descents are long enough to hand meaningful energy back through regenerative braking, which the near-flat modelled profile never offered. The three cars without regen got **dearer**: they buy every metre of climb with fuel and throw it away again as brake heat.

**The verdict did not change.** Route A was the cheapest for all five cars before and is the cheapest for all five cars now — and it stays cheapest against the two newly-found alternatives as well. It wins despite being the *hilliest by peak*, because it is 9–11 km shorter and distance beats altitude here.

---

## 11. Outputs & how to regenerate

```bash
# 1. find candidate third routes (needs network: OSRM)
python3 fetch_routes.py
python3 fetch_routes.py --adopt bodenmais
python3 fetch_routes.py --adopt regen

# 2. download real terrain + OSM speed limits (needs network)
python3 fetch_real_data.py --speed

# 3. score candidates through the full model (needs network for new candidates)
python3 screen_routes.py

# 4. build all data products (pure stdlib, no network)
python3 build.py

# 5. compare against the archived v1 bundle
python3 compare_versions.py

# 6. rebuild the UI and this document
npx esbuild EcoNavigation.jsx --jsx=transform --format=iife --outfile=app.js
python3 render_docs.py
```

| File | Contents |
|---|---|
| `geo.py` | shared geodesy, resampling and GPX I/O |
| `model.py` | terrain conditioning, curvature, speed, energy, counterfactuals |
| `build.py` | orchestrates the build, emits all data products |
| `fetch_real_data.py` | downloads EU-DEM elevation and OSM speed limits |
| `fetch_routes.py` | OSRM candidate search and GPX adoption |
| `screen_routes.py` | scores candidates through the full model |
| `compare_versions.py` | diffs the current bundle against archived v1 |
| `data/eco_data.json` | the complete data bundle |
| `data/results.csv` | per car/route consumption, cost, CO₂, time, both taxes |
| `data/route_metrics.csv` | per-route terrain and curviness metrics |
| `data/profile_*.csv` | per-25 m profiles incl. limit provenance |
| `data/elevation_*.json` | raw DEM samples (cached) |
| `data/speedlimits_*.json` | raw OSM tags per point (cached) |
| `data/eco_data_modelled_v1.json` | archived v1 bundle for the comparison |

---

## 12. Known limitations

- **The DEM samples terrain, not tarmac.** Bridges, cuttings, embankments and a few metres of lateral track error all put the raster on the hillside instead of the road. This is the dominant uncertainty; see [section 4.1](#41-why-300-m-and-not-25-m). Integrated quantities are far more trustworthy than per-point grades.
- **Stops are estimated, not observed.** The per-town stop counts are the weakest input. They shift time noticeably and energy slightly.
- **Efficiency is a single constant per car**, not a speed/load map. Real engines are markedly worse at low load, so the absolute consumption figures are indicative; the *differences between routes* are more reliable than the absolute numbers.
- **No traffic, weather, wind, payload or temperature.** A cold engine on the first 10 km would add several percent; an EV in winter considerably more.
- **Routes C and D are routing-engine output**, not tracks anyone drove. OSRM's chosen line through a town may differ slightly from what a driver would take.
- **The curve tax counterfactual is a physical fiction** — you cannot straighten a road and keep its hills. It isolates the energy attributable to cornering, which is the useful quantity, but it is not a route you could drive.
- **Prices and grid carbon intensity are 2026 estimates** and will drift.
