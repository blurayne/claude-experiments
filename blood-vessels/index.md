# Blood Vessels — a microvascular network

An interactive, zoomable visualisation of a **microvascular bed** — arteries
branching down to capillaries and back up into veins — with pulsatile blood flow,
rendered on an HTML canvas with switchable shading algorithms.

> The published page at `/blood-vessels/` serves the hand-written
> [`index.html`](index.html), so the app loads as the landing page. This
> `index.md` is documentation; see [`techniques.md`](techniques.md) for the
> algorithms in depth.

## What it does

- **Procedurally grown vasculature** — every *New bed* grows a fresh arterial and
  venous tree and bridges them with capillaries. Two **generators** are
  switchable: organic *space-colonisation* and a *recursive (Sapling-style)* tree.
- **Realistic arteriole → capillary → venule transition** — vessel calibre tapers
  down to roughly one red-cell width through the capillaries and back up to the
  venule, and the blood **deoxygenates** along the way (bright red → dark maroon).
- **Pulsatile blood flow** — biconcave red cells (plus leukocytes and platelets)
  flow through the network, faster in big vessels and single-file in capillaries,
  pulsing with an adjustable heartbeat.
- **Switchable shading algorithms**:
  - **Stylized** — Canvas 2D analytic banded-cylinder shading (the no-WebGL fallback).
  - **Lit tubes** — WebGL2 SDF capsule impostors with Blinn–Phong lighting.
  - **Subsurface** — translucent-blood approximation (thickness glow + Fresnel).
  - **Toon** — quantised cel shading with outlines.
  - **X-ray** — additive angiograph glow.
- **Zoom & pan** — scroll / pinch / buttons / double-click to zoom, drag to pan,
  with a live microscope **scale bar** and magnification readout. Zoom in until
  single red cells squeeze through a capillary.
- **Controls** — heart rate, flow speed, cell density, and toggles for vessel
  walls, tissue, blood cells and anatomy labels.

## Files

- [`index.html`](index.html) — the standalone app (no build step, no libraries).
- [`techniques.md`](techniques.md) — the geometry, flow and shader algorithms,
  with references (and how they map to Blender modelling techniques).

## Tech

A single self-contained HTML file. The default renderer is **WebGL2** (instanced
SDF capsule impostors for vessels, instanced biconcave impostors for cells, a
procedural domain-warped fBm tissue field); a **Canvas 2D** renderer is the
fallback and the "Stylized" mode. Vessel networks are grown with
space-colonisation or recursive branching and sized with Murray's law. No
network access, no dependencies — it runs fully offline.
