# Blood Vessels — a microvascular network you can play inside

An interactive, zoomable visualisation of a **microvascular bed** — arteries
branching down to capillaries and back up into veins — with pulsatile blood flow,
rendered on an HTML canvas with switchable shading algorithms. The same bed
doubles as a **playfield**: in *Immune Patrol* you steer a white blood cell
through the vessels and hunt the pathogens drifting in the flow.

> The published page at `/blood-vessels/` serves the hand-written
> [`index.html`](index.html), so the app loads as the landing page. This
> `index.md` is documentation; see [`techniques.md`](techniques.md) for the
> algorithms in depth.

## Game mode — “Immune Patrol”

Hit **🦠 Play “Immune Patrol”** in the control panel and the bed becomes a game
board. The whole game runs on the simulation that is already there — same
network, same flow, same renderer.

- **You are a neutrophil.** You swim the vessel graph itself, so you can only
  move *along* a vessel: steer with the **mouse** (the cell heads toward the
  cursor), **WASD / arrow keys**, or by dragging on touch. **Space** (or the
  on-screen **BOOST** button) sprints.
- **The flow is the level design.** Every segment carries you with its own
  pulsatile bulk flow, so arteries are fast one-way highways you can barely swim
  back up, capillary beds are a slow squeeze where you can actually corner
  something, and the cell visibly deforms to the calibre it is passing through.
  Reach the venous root and you are recirculated through the heart back into an
  artery.
- **Hunt bacteria and viruses.** Touch a pathogen to engulf it (10 / 25 points,
  with a combo multiplier for quick chains). They drift with the blood and
  **divide** on a timer.
- **Infection is the clock.** Every division, and every pathogen that drains out
  through the vein, raises the infection meter; it decays slowly on its own, and
  at 100 % the run ends. Waves step the pressure up every ~40 s.
- **Oxygen is the resource.** It refills in bright, oxygen-rich arterial blood
  and drains in the veins — so the arteries are both the fastest route and the
  only refuelling stop. Boosting burns it fast.
- **Three difficulties** (Calm / Normal / Fever) and a best score kept in
  `localStorage`.
- The overlay adds dashed reticles on visible pathogens, **bearing arrows on the
  screen border** for off-screen ones, capture bursts and score pops — and it
  works on every rendering backend, including the outline filter.

## What it does

- **Procedurally grown vasculature** — every *New bed* grows a fresh arterial and
  venous tree and bridges them with capillaries. **Seven generators** are
  switchable: *space-colonisation*, *recursive (Sapling-style)* tree,
  *DLA* (diffusion-limited aggregation), *CCO* (constrained constructive
  optimization), *CCO+* — the faithful CCO that splices each new terminal at the
  **volume-minimizing bifurcation point**, avoids vessel crossings, and produces
  a textbook arterial arbor with realistic branch angles and taper; *Angiogenesis*,
  a **demand-field (VEGF-style)** model where vessel tips chase under-served tissue,
  branch, and stop where the bed is already fed, radiating from a hub the way a real
  organ does; and *Loops (adaptive)* — a **Hu–Cai / Ronellenfitsch–Katifori** flow
  network: a resistive mesh whose tube conductances are optimized under fluctuating
  load, which (unlike every other generator) keeps hierarchical **loops** rather
  than collapsing to a tree.
- **Anatomically scaled calibre** — everything is anchored to the red cell: a
  true capillary is exactly one cell wide, a terminal arteriole carries ~4
  abreast, and Murray's law widens the trunks until a mid-tree vessel holds
  10–15 cells across. The field, the branch spacing and the segment lengths are
  scaled to match, so the vessels have room to breathe.
- **Continuous tubes, not sausage links** — the whole tree is resolved as one
  implicit surface (below), and the cross-section frame is interpolated between
  shared node tangents, so a vessel reads as one smooth tube instead of a row of
  capsules.
- **A living lumen** — the vessel interior is shaded with an advected plasma
  shear texture (parabolic velocity profile, surging with each heartbeat), a
  cell-free plasma sleeve at the wall, a cell-sized granular haze that stands in
  for the blood cells until you zoom close enough to resolve them, an
  endothelial mosaic on the far inner wall, and a banded smooth-muscle media.
  Arteries visibly **dilate on the pulse**.
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
- **Tumbling red cells** — a red cell is a biconcave disc, and it rolls as it
  flows. The impostor projects the actual solid of revolution for its current
  tumble angle, so the traffic shows round faces, foreshortened ellipses and
  edge-on peanuts all at once, exactly as blood does.
- **Depth-correct crossings** — every vessel carries a pseudo-depth, so where
  one passes over another the blood cells in the vessel behind disappear behind
  it instead of being painted on top. On the GPU the depth is blended through the
  same accumulator as everything else, so the resolve pass writes one merged
  depth per pixel; Canvas 2D approximates it in painter's order.
- **Seamless junctions (order-independent smooth union)** — the vessels are not
  composited segment by segment at all. Every segment *adds* its exponential
  weight `2^(−d/k)` and its weighted attributes into a floating-point buffer, and
  a full-screen resolve pass reconstructs the merged surface as `−k·log₂(ΣW)`.
  The exponential smooth minimum is the only one that is both associative and
  separable into a per-primitive sum, so the merge is exact, order-independent
  and valence-free: a bifurcation is no longer a joint but one continuous
  field with one iso-line, with **no sharp edges** anywhere. The lighting normal
  comes from the merged field's gradient and the cutaway's wall lines follow it
  through the junction, so a branch reads as flowing blood. Merging runs once per
  tree (arterial / venous) so vessels that merely *cross* still occlude instead of
  fusing.
- **Fading tips** — no spherical caps anywhere: an open end shrinks its field
  away instead of ending in a ball, so a terminal vessel dissolves into the
  tissue rather than stopping at a cut-off rim.
- **Depth of field in the lumen** — every cell carries a depth across the tube's
  unseen thickness. Cells at the back are seen *through* blood: soft-edged,
  washed out, sunk toward the blood colour; cells at the front stay crisp. That
  separation is what makes a flat vessel read as a volume you are inside of.
- **Switchable shading** (GPU backends): **Cutaway** (the default — vessels sliced
  open lengthwise so you see the endothelial wall, the concave lumen and the cells
  moving through it, game-ready), **Lit tubes** (Blinn–Phong), **Subsurface**
  (thickness glow + Fresnel), **Toon** (cel + outline), **X-ray** (additive
  angiograph), and **Anatomy** — a medical-illustration look: warm, softly lit
  tissue, saturated glossy vessels with a specular streak, and a contact-shadow
  pass so the vessels sit *on* the tissue instead of floating over it. On
  Canvas 2D the cutaway is drawn in layered passes so the tubes stay clean and
  continuous.
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
- **Playable** — the *Immune Patrol* game mode above turns the bed into an arena
  where you steer a leukocyte through the lumen against the flow.

## Files

- [`index.html`](index.html) — the standalone app, sandbox and game (no build
  step, no libraries).
- [`techniques.md`](techniques.md) — the geometry, flow, game and shader
  algorithms, with references (and how they map to Blender modelling techniques).
  §2b covers the game: swimming a graph, junction selection and the overlay.

## Tech

A single self-contained HTML file, no build step and no libraries — the game
mode included. The default renderer is **WebGL2** in
**Cutaway** shading (instanced SDF capsule impostors accumulated into a float
smooth-union buffer and resolved full-screen, instanced
biconcave / rod / capsid impostors for cells, a procedural domain-warped fBm
tissue field with a depth vignette); a **Canvas 2D** renderer is the fallback.
Vessel networks are grown with space-colonisation or recursive branching, spline
-smoothed, and sized with Murray's law. Performance touches: the spline resample
evens out the segment count, and when paused the render loop skips the cell
update and reuses the last streamed GPU buffer. The game's actors are packed
into the same instance buffer as the blood cells (first, so they are never
dropped by the visible-cell budget), with a fourth 2D canvas on top for the HUD
overlay. No network access, no dependencies — it runs fully offline.
