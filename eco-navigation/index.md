# Eco-Navigation — Deggendorf → Engelshütt

Two ways through the Bavarian Forest, compared for **distance, elevation,
curviness, speed** and — for five very different cars — **energy use, cost and
CO₂**.

> The published page at `/eco-navigation/` serves the interactive
> [`index.html`](index.html). This `index.md` is documentation; the full method
> is in [`METHODOLOGY.md`](METHODOLOGY.md).

- **Route A — via Arnbruck** (Zellertal direct): **55.1 km**, ~49 min, +396 m net.
- **Route B — via Viechtach & Bad Kötzting**: **65.8 km**, ~58 min, +396 m net
  but more total climbing (drops to Bad Kötzting, then climbs back).

Both start at Deggendorf and share the first 22 km to Teisnach, then diverge.

## Key findings

- **Route A wins on every metric** — shorter, less total ascent, fewer
  traffic-light stops (~6 vs ~9), and cheaper per trip for **all five cars**.
- Route B has marginally **better per-100 km efficiency** (more steady B85
  running) but its extra 10.7 km and deeper drop-and-climb more than cancel it.
- **All five cars are fully capable** of both routes — grades are gentle; the
  difference is efficiency and comfort, not capability.
- Hybrid (Auris) and EV (ID.3) benefit most from the curvy, stop-and-go terrain
  thanks to **regenerative braking**.

Example (per one-way trip, Route A → B):

| Car | Route A | Route B | A saves |
|---|---|---|---|
| Toyota Auris Hybrid | €4.55 / 5.9 kg | €5.28 / 6.8 kg | €0.73 |
| VW ID.3 | €4.38 / 3.8 kg | €5.06 / 4.4 kg | €0.68 |
| Fiat Panda 1.2 | €5.53 / 7.2 kg | €6.48 / 8.4 kg | €0.95 |
| Opel (2005) | €6.78 / 8.8 kg | €7.95 / 10.3 kg | €1.17 |
| Mercedes C-diesel | €4.83 / 7.6 kg | €5.61 / 8.8 kg | €0.78 |

(Full table and an annual-cost slider are in the interactive page.)

## Data provenance at a glance

| Quantity | Source |
|---|---|
| Geometry, distance, curviness | **Measured** — your CoMaps GPX tracks |
| Village/rural speed zones, limits | **Rule-based** — German StVO defaults |
| Traffic-light / junction stops | **Modelled** — per-town stop estimate |
| Elevation & grade | **Modelled** — researched town heights, interpolated |
| Energy, cost, CO₂ | **Modelled** — vehicle physics, calibrated |

The GPX files carried **no elevation data**, and routing/elevation APIs were
unreachable from the build sandbox, so elevation and energy are a transparent
physics model — see [`METHODOLOGY.md`](METHODOLOGY.md) for every equation and
assumption.

## Files

- [`index.html`](index.html) — interactive comparison (React + Recharts,
  no build step, no external CDN; libs vendored in [`vendor/`](vendor/)).
- [`EcoNavigation.jsx`](EcoNavigation.jsx) — UI source; precompiled to
  [`app.js`](app.js) with esbuild (no in-browser transform).
- [`build.py`](build.py) — parses the GPX and generates all data (pure stdlib).
- [`fetch_real_data.py`](fetch_real_data.py) — optional: pulls **real**
  elevation + speed limits where APIs are reachable, to replace the modelled
  profile.
- [`METHODOLOGY.md`](METHODOLOGY.md) — full algorithm, equations and sources.
- `data/`
  - [`gpx/`](data/gpx/) — the two original tracks.
  - [`eco_data.json`](data/eco_data.json) — full data bundle.
  - [`results.csv`](data/results.csv) — per-car/route consumption, cost, CO₂, time.
  - `profile_arnbruck.csv`, `profile_koetzting.csv` — per-25 m profiles
    (km, elevation, grade, curvature, speed, legal limit, lat/lon).
- [`data.js`](data.js) — the bundle as `window.ECO_DATA` for the page.

## Running locally

No build step and no internet needed — React/Recharts are vendored and the JSX
is precompiled. Just open it:

```bash
xdg-open index.html   # Linux
open index.html       # macOS
```

To regenerate the data or rebuild the UI:

```bash
python3 build.py
npx esbuild EcoNavigation.jsx --jsx=transform --format=iife --outfile=app.js
```
