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
  venous tree and bridges them with capillaries. **Four generators** are
  switchable: *space-colonisation*, *recursive (Sapling-style)* tree,
  *DLA* (diffusion-limited aggregation) and *CCO* (constrained constructive
  optimization).
- **Spline vessel segments** — the raw grown skeleton is re-fitted with
  **Catmull–Rom splines** and resampled at an even spacing, so every vessel reads
  as a smooth natural curve instead of a chain of straight sticks. The resample
  also *evens out* the segment count (dense beds get lighter, sparse limbs get
  smoother), which feeds straight into rendering speed.
- **Realistic arteriole → capillary → venule transition** — vessel calibre tapers
  down to roughly one red-cell width through the capillaries and back up to the
  venule, and the blood **deoxygenates** along the way (bright red → dark maroon).
- **Pulsatile blood flow** — biconcave red cells (plus leukocytes, platelets and,
  for the game framing, the occasional **bacterium** and **virus**) flow through
  the network, faster in big vessels and single-file in capillaries, pulsing with
  an adjustable heartbeat.
- **Switchable rendering backend** — *Canvas 2D* (analytic, works everywhere),
  *WebGL2*, or *WebGPU* (with automatic fallback if WebGPU isn't supported). The
  GPU backends draw SDF capsule impostors (GLSL / WGSL).
- **Switchable shading** (GPU backends): **Cutaway** (the default — vessels sliced
  open lengthwise so you see the endothelial wall, the concave lumen and the cells
  moving through it, game-ready), **Lit tubes** (Blinn–Phong), **Subsurface**
  (thickness glow + Fresnel), **Toon** (cel + outline), **X-ray** (additive
  angiograph). On Canvas 2D the cutaway is drawn in layered passes so the tubes
  stay clean and continuous.
- **Outline filter** — a contour mode that draws *only* the vessel outlines as
  clean line art. The vessels are reconstructed into connected polylines,
  smoothed with a **Catmull–Rom spline**, then rendered through a fill→erode
  mask so the whole network silhouette (including junctions) keeps a gap-free
  contour. Runs on Canvas 2D, so it works on **any** backend.
- **Tweak sliders** — tree shape (branching density, vessel length, curviness,
  Murray taper) and appearance (calibre, wall thickness, gloss).
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

A single self-contained HTML file. The default renderer is **WebGL2** in
**Cutaway** shading (instanced SDF capsule impostors for vessels, instanced
biconcave / rod / capsid impostors for cells, a procedural domain-warped fBm
tissue field with a depth vignette); a **Canvas 2D** renderer is the fallback.
Vessel networks are grown with space-colonisation or recursive branching, spline
-smoothed, and sized with Murray's law. Performance touches: the spline resample
evens out the segment count, and when paused the render loop skips the cell
update and reuses the last streamed GPU buffer. No network access, no
dependencies — it runs fully offline.
