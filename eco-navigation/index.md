# Eco-Navigation — Deggendorf → Engelshütt

Four ways through the Bavarian Forest, compared for **distance, elevation, curviness, speed** and — for five very different cars — **energy use, cost and CO₂**.

> The published page at `/eco-navigation/` serves the interactive [`index.html`](index.html). This `index.md` is documentation; the full method is in [`METHODOLOGY.md`](METHODOLOGY.md).

**Version 2** replaced the guessed terrain with real measurements. Elevation is now **10 064 EU-DEM 25 m samples** (one every 25 m along every track) instead of 16 interpolated town heights, speed limits come from OpenStreetMap, the stop model is built on a **measured OSM inventory** of every traffic signal, stop/give-way sign, roundabout and level crossing along each route, and two additional routes were found by searching the road network and scoring every candidate through the full energy model.

## The routes

| | Distance | Time | Peak | Ascent | Curviness | Expected stops | Cost (Auris) |
|---|---|---|---|---|---|---|---|
| **A — via Arnbruck** (Zellertal & Eck pass) | **55.1 km** | 52 min | 843 m | 957 m | 163.7 °/km | 8.4 | **€4.60** |
| **B — via Viechtach & Bad Kötzting** | 65.8 km | 62 min | 593 m | 1 050 m | 155.8 °/km | 9.0 | €5.19 |
| **C — via Bodenmais** *(new)* | 64.2 km | 61 min | 843 m | 1 060 m | 145.3 °/km | 9.1 | €4.97 |
| **D — via Regen** *(new)* | 66.5 km | 59 min | 859 m | 1 299 m | 143.8 °/km | 6.9 | €5.27 |

Routes A and B are the original CoMaps tracks; C and D are OSRM routes over the OpenStreetMap network, picked from eight distinct candidates.

## Which route, when?

| Route | Character | Choose it if … |
|---|---|---|
| **A — Arnbruck** | The default | the weather is clear — cheapest and fastest for every car; its 10.7 km advantage beats the 843 m Eck saddle. Think twice in snow: highest bends and grades, six Waldbahn level crossings. |
| **B — Viechtach/Kötzting** | The all-weather route | it is winter or the saddle needs chains — the **only route below 600 m**. Never the cheapest; always open. |
| **C — Bodenmais** | The relaxed alternative | you want the calmest geometry (least curvy, gentlest bends) in good weather, or an errand in Bodenmais — cheaper and faster than B for every car. Crosses the same 843 m saddle as A; stoppiest route (9.1 expected stops). |
| **D — Regen** | The steady cruiser | you hate stop-and-go (fewest expected stops, 6.9; one level crossing) or have an errand in Regen — but the most climbing (1 299 m) makes it the dearest. |

## Key findings

- **Route A still wins** — for all five cars, on real terrain, real speed limits, and against both newly-found alternatives. It is the shortest, and here distance beats altitude: it is also the *hilliest by peak*, crossing the **Eck saddle at 843 m**, ~250 m higher than route B ever goes.
- **The new route C is genuinely better than route B** — cheaper for all five cars, faster, shorter and less curvy (though level on expected stops: 9.1 vs 9.0) — but it does not beat A, which stays €0.37 cheaper for the hybrid. **No route beats A.**
- **The mountains cost an eighth to a fifth of the fuel.** On route A the hybrid spends €0.83 of its €4.60 purely on gaining height; the old diesel spends €1.09.
- **Corners cost far less than hills, but they cost time.** €0.13 for the hybrid on route A against €0.58 for the old Opel — and about 3 minutes for everyone, since the time penalty depends on the road, not the drivetrain.
- **Regenerative braking is what separates the cars.** The hybrid and the EV win back 1.8–3.8 kWh on the descents; the three cars without regen win back nothing and turn every metre of descent into brake heat.

## What the real elevation data changed

The old modelled profile was badly wrong in three ways — see [`METHODOLOGY.md` §11](METHODOLOGY.md) for the full comparison, or run `python3 compare_versions.py`.

| Route | Metric | Modelled (v1) | Real DEM | Change |
|---|---|---|---|---|
| A | Highest point | 709 m | **843 m** | +19 % |
| A | Total ascent | 444 m | **957 m** | +116 % |
| A | Steepest grade | 2.1 % | **8.9 %** | +324 % |
| B | Highest point | 709 m | **593 m** | −16 % |
| B | Total ascent | 502 m | **1 050 m** | +109 % |

1. It **missed an entire mountain pass** — route A's 843 m Eck saddle was flattened to a 709 m plateau in the wrong place.
2. It **understated climbing by more than half**, because interpolating between town centres smooths away every hill in between.
3. Its **steepest grade anywhere was 2.1 %**, which made a mountain-energy metric meaningless.

The cost effect splits by drivetrain: the hybrid and EV are essentially **unchanged** (−2 to +1 %) because real descents hand energy back through regen, while the three cars without regen got **dearer** (+4 to +16 %). **The verdict did not change** — route A won before and wins now. A sensitivity analysis (reverse direction, stop-count error, winter on the pass, break-even efficiency — [`METHODOLOGY.md` §12](METHODOLOGY.md)) finds no plausible correction that lets route B win on cost; its real role is the **all-weather route**, being the only one of the four staying below 600 m.

## Data provenance at a glance

| Quantity | Source |
|---|---|
| Geometry, distance, curviness | **Measured** — CoMaps GPX (A, B), OSRM (C, D) |
| Elevation & grade | **Measured** — EU-DEM 25 m, 10 064 samples |
| Speed limits | **Measured** — OpenStreetMap `maxspeed`, StVO fallback |
| Village/rural zones | **Rule-based** — German StVO defaults |
| Stop-feature inventory | **Measured** — OSM signals, signs, roundabouts, crossings |
| Probability of stopping per feature | **Modelled** — documented per-class assumption |
| Energy, cost, CO₂ | **Modelled** — vehicle physics, calibrated |
| Mountain, curve & stop taxes | **Modelled** — counterfactual re-runs |

## The counterfactual metrics

**The mountain tax** — every trip is simulated twice: once over the real terrain, and once over the *identical road with the grade set to zero* (same distance, same bends, same speeds, same stops). The difference is exactly what the hills cost, net of everything the descents give back through engine braking and regen.

**The curve tax** — the same trick applied to geometry: a run with the bend-radius speed cap removed, so speed is limited only by the legal limit and comfortable acceleration. The difference is what the corners cost in fuel and in minutes.

**The stop tax** — the same trick applied to the measured stop inventory: a run on a *green wave* (every signal green, every barrier open, every roundabout rolled through). The difference is what red lights, signs, barriers and roundabouts cost — €0.10–0.42 per trip and ~2–3 minutes, always far less than the hills.

Curviness itself was already measured in v1 but is now reported properly: total heading change per km, a 0–100 index, bends per km, median and minimum corner radius, and the share of each route's length in five radius bands. It is computed on the uniform 25 m grid so the CoMaps and OSRM tracks compare fairly.

## Files

- [`index.html`](index.html) — interactive comparison (React + Recharts, no build step, no external CDN; libs vendored in [`vendor/`](vendor/)).
- [`EcoNavigation.jsx`](EcoNavigation.jsx) — UI source; precompiled to [`app.js`](app.js) with esbuild.
- [`geo.py`](geo.py) — shared geodesy, resampling and GPX I/O.
- [`model.py`](model.py) — terrain conditioning, curvature, speed, energy and the three counterfactual taxes.
- [`build.py`](build.py) — orchestrates the build, emits all data products (pure stdlib, no network).
- [`fetch_real_data.py`](fetch_real_data.py) — downloads EU-DEM elevation, OSM speed limits and the stop-feature inventory.
- [`fetch_routes.py`](fetch_routes.py) — OSRM candidate search; `--adopt <key>` writes a GPX.
- [`screen_routes.py`](screen_routes.py) — scores candidates through the full model.
- [`compare_versions.py`](compare_versions.py) — diffs the current bundle against archived v1.
- [`METHODOLOGY.md`](METHODOLOGY.md) — full algorithm, equations and sources (rendered as [`methodology.html`](methodology.html)).
- [`render_docs.py`](render_docs.py) — regenerates `methodology.html`.
- `data/`
  - [`gpx/`](data/gpx/) — the four tracks.
  - [`eco_data.json`](data/eco_data.json) — full data bundle.
  - [`results.csv`](data/results.csv) — per car/route consumption, cost, CO₂, time, plus all three taxes (mountain, curve, stop).
  - [`route_metrics.csv`](data/route_metrics.csv) — per-route terrain and curviness metrics.
  - `profile_*.csv` — per-25 m profiles (km, elevation, grade, curvature, speed, legal limit and its provenance, lat/lon).
  - `elevation_*.json`, `speedlimits_*.json`, `stops_*.json` — cached raw API responses (terrain, speed limits, stop-feature inventory).
  - [`eco_data_modelled_v1.json`](data/eco_data_modelled_v1.json) — archived v1 bundle, so the before/after stays reproducible.
- [`data.js`](data.js) — the bundle as `window.ECO_DATA` for the page.

## Running locally

No build step and no internet needed — React/Recharts are vendored and the JSX is precompiled:

```bash
xdg-open index.html   # Linux
open index.html       # macOS
```

To rebuild from the cached data (no network):

```bash
python3 build.py
npx esbuild EcoNavigation.jsx --jsx=transform --format=iife --outfile=app.js
python3 render_docs.py
```

To refresh the terrain and OSM data from the APIs (needs network, ~2 minutes):

```bash
python3 fetch_real_data.py --speed --stops --force
python3 build.py
```
