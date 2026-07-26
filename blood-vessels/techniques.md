# Blood Vessels — techniques

This document outlines the algorithms behind the
[`index.html`](index.html) visualisation: how the vascular **geometry** is grown,
how the blood **flow** is simulated, and the different **shading algorithms** you
can switch between. Where relevant it also maps each idea to how the same thing is
usually done in 3D DCC tools (Blender), since that was a starting reference.

---

## 1. Modelling the vascular network (geometry)

The picture you see is not hand-drawn — a directed graph of vessel segments is
**grown procedurally** every time you press *New bed*. **Four** generators are
switchable in the UI (**Vessel generator**), each a different real algorithm for
growing branching networks.

### 1a. Space colonisation (default)

The organic, space-filling look comes from the **space-colonisation algorithm**,
the same attractor-driven method used to model real vascular trees and botanical
growth (Runions et al., *Modeling Trees with a Space Colonization Algorithm*).

1. Scatter hundreds of **attractor points** through the tissue region (with a few
   soft "voids" so some areas stay denser than others, like real tissue).
2. Each step, every attractor pulls on the **nearest vessel node** within an
   *influence radius*. Nodes that are pulled grow a new child node a fixed
   *segment length* toward the averaged attractor direction.
3. Attractors within a *kill radius* of the growing front are consumed.
4. Repeat until the attractors are used up.

A **spatial hash grid** accelerates the nearest-node queries, and a small
"reach"/tropism step lets the trunk march from the edge of the field into the
attractor cloud before normal growth takes over.

### 1b. Recursive dichotomous branching ("Sapling" / skin-modifier style)

The second preset is a classic **recursive bifurcation tree**: from each node,
grow a slightly curved limb, then split into 2–3 thinner branches at controlled
angles with random jitter, recursing until a minimum length. This is the family
of approaches used by Blender's **Sapling Tree Gen** add-on and by L-systems —
more tree-like and less space-filling than colonisation, which is exactly why
it's offered as a contrast.

### 1b-ii. Diffusion-limited aggregation (DLA)

Random walkers are released near the structure and **stick** on contact, building a
fractal, frost-like arbor — the classic *diffusion-limited aggregation* model
(Witten & Sander). To keep it fast it uses the standard trick of spawning each
walker just off a random existing node and abandoning walkers that stray too far,
rather than launching them from infinity.

### 1b-iii. Constrained Constructive Optimization (CCO)

The method most associated with realistic vascular trees in the literature
(Schreiner & Buxbaum): terminals are added one at a time, each connected to the
**nearest existing segment**, stepping toward the new site. The implementation
here is a simplified CCO (nearest-node attachment without the full geometric
volume optimisation), which still yields dense, naturally space-filling arbors.

### 1c. Vessel calibre — Murray's law

Whatever grows the skeleton, segment **radii** are assigned bottom-up with
**Murray's law**: a parent's cube radius equals the sum of its childrens' cube
radii (`r_parent³ = Σ r_child³`). Trunks thicken toward the root exactly as real
arteries do, and capillaries end at roughly one red-cell width.

### 1c-ii. Spline segments (Catmull–Rom resample)

The raw skeletons that come out of the growth algorithms are chains of short
straight segments — organic in aggregate, but faceted up close, and unevenly
sampled (space-colonisation over-tessellates, recursive limbs under-sample).
Before radii are assigned, each **chain** (a maximal run of degree-2 nodes
between branch points and leaves) is re-fitted with a **Catmull–Rom spline** and
resampled at an even world-space spacing, keeping the branch points and leaves
fixed so the tree contract — radii, capillary bridging and the flow graph — is
untouched. The payoff is two-for-one: vessels read as smooth natural curves, and
the resample *normalises the segment count* — dense beds shed redundant segments
(fewer capsule impostors to draw) while sparse limbs gain enough to curve nicely.
Smoothness and speed from the same pass.

### 1d. The capillary transition (arteriole → capillary → venule)

Real microcirculation is *arteriole → true capillary → venule*; blood doesn't
jump from artery to vein. Each arteriolar tip is bridged to its nearest venular
tip by a **capillary chain** whose radius eases **down** to a true-capillary
calibre (~ one red cell wide) in the middle and **back up** to the venular
calibre, meandering slightly. Along that run the blood **deoxygenates** (a 0→1
parameter), which the shaders read to shift the colour from bright arterial red
to dark venous maroon.

### 1e. How this maps to Blender techniques

The linked reference
([Blender SE: techniques for modeling a network of blood vessels](https://blender.stackexchange.com/questions/61261/techniques-for-modeling-a-network-of-blood-vessels))
collects the common 3D approaches. Their 2D analogues here:

| Blender technique | Idea | Analogue in this project |
|---|---|---|
| **Skin Modifier** on a vertex tree | wrap a skin of varying radius around an edge skeleton | our node/edge skeleton + per-node Murray radius, stroked/extruded as tubes |
| **Sapling Tree Gen** add-on | recursive branching tree | the *Recursive tree* generator preset |
| **Metaballs** | blobby implicit surfaces that merge at junctions | round line-joins / capsule SDF union → smooth junctions |
| **Curves + bevel** | bevel a profile along a path | capsule impostors swept between segment endpoints |
| **Particle / hair systems** | scatter many strands | the space-colonisation front behaves like a guided particle system |

---

## 2. Blood flow simulation

Blood cells are **particles** travelling the *directed* graph (arterial root →
arterioles → capillary → venule → venous root, then recycled):

- **Velocity ∝ calibre** — fast in big vessels, slow single-file in capillaries
  (a stand-in for Poiseuille flow).
- **Pulsatile** — a synthetic heartbeat waveform (systolic spike + dicrotic
  notch) modulates arterial speed strongly and venous speed weakly; the heart
  rate is adjustable.
- **Three cell types** — biconcave red cells (majority), occasional pale
  leukocytes, and small platelets — with a lateral offset so they fill the lumen.
- **Oxygenation** carried per-cell drops across the capillary, so a cell visibly
  darkens as it crosses from the arterial to the venous side.

---

## 2b. The bed as a playfield — "Immune Patrol"

The same graph that carries the particles is also a **game board**: you steer a
neutrophil through the lumen and engulf pathogens before the infection meter
fills. Everything below rides on the simulation that is already there, so the
game and the sandbox share one network, one flow model and one renderer.

### 2b-i. Swimming a graph instead of a plane

A cell inside a vessel cannot move freely in 2D — it can only push **along the
tube axis**. So the player is a point `(edge, s)` on the directed graph, exactly
like a blood cell, with three additions:

1. **Signed velocity.** `v = 0.9·flow(e) + SWIM·dir·mag·power·squeeze(e)`, where
   `flow(e)` is the same pulsatile bulk-flow term the particles use. `v` may be
   negative, i.e. you can swim *upstream* — but only if your thrust beats the
   flow, which it does in arterioles and capillaries and barely does in a trunk
   artery. That single sign is the whole difficulty curve: arteries are fast
   one-way highways, capillary beds are where you can actually corner something.
2. **Heading, not thrust.** Naïvely projecting the steering vector onto the
   vessel axis (`v += SWIM·(d·û)`) makes the controls feel dead: push sideways
   in a horizontal vessel and the projection is ~0, so you sit still. Instead
   the steering picks a **heading** — sign from `d·û` with a dead zone that
   keeps the previous heading, magnitude `max(|d·û|, 0.72)`. You always make
   progress toward *a* junction; the steering decides which one.
3. **Squeeze.** Thrust scales with `clamp(r/8, 0.45, 1.25)`, and the drawn cell
   radius is clamped to the local lumen, so the leukocyte visibly deforms and
   slows as it works through a capillary.

### 2b-ii. Junctions

Blood cells only ever need `outgoing[]` (the directed flow graph). A swimmer can
go either way, so the network also exports an **undirected incidence list**,
`incident[nodeId] = [{edge, d}]` with `d = ±1` for the direction that *leaves*
the node. On reaching a node the candidates are:

- **filtered by physics** — a candidate is only enterable if the velocity the
  player would have on it actually points away from the node. Without this
  filter a swimmer fighting a strong artery rattles between two branches every
  frame and appears pinned;
- **ranked by heading** — the branch whose outward direction best matches
  `0.6·(current travel) + (steering)`, with a small penalty for the branch you
  arrived on so junctions prefer a fresh vessel.

The **venous root** is a portal rather than a dead end: reaching it recirculates
you through the heart back into an arterial root — which is also exactly what
happens to a pathogen you failed to catch, except that counts as a spread.

### 2b-iii. Pathogens, oxygen and the loss condition

- **Pathogens** are ordinary flow particles (`kind: 'bac' | 'vir'`) with a
  division timer. They drift the network with the blood; they cannot be steered.
  Division adds infection, so a pathogen left alone is an exponential problem.
- **Escape.** The recycle branch in `updateCells` — the point where a particle
  leaving the venous root is put back into an artery — doubles as the escape
  detector: a pathogen through that gate raises infection sharply.
- **Oxygen** is drawn from the local blood: it refills in bright arterial blood
  (`oxy ≈ 1`) and drains in the veins, so the arteries are both the fastest and
  the only place to refuel. Boosting burns it at ~30 %/s.
- **Infection** rises with divisions and escapes, decays slowly on its own, and
  ends the run at 100 %.

### 2b-iv. Rendering the actors on every backend

The player and the pathogens are packed into the **same instance buffer** as the
blood cells (`packCell`), so they pick up whichever backend and shading model is
active — no separate game renderer. Two details make that safe and readable:

- game actors are packed **first**, so the visible-cell budget (`MAX_CELLS`) can
  never drop the thing you are chasing;
- a fourth, always-visible **2D overlay canvas** carries what the shaders cannot:
  the amoeboid membrane outline, the capture-reach ring, dashed reticles on
  pathogens, bearing arrows for off-screen ones projected onto the screen
  border, capture bursts, score pops and the infection / recirculation vignettes.

---

## 3. Shading algorithms (switchable)

Rendering is split into a **Backend** switch and a **Shading** switch:

- **Backend** — *Canvas 2D*, *WebGL2*, or *WebGPU*. Canvas 2D is the analytic
  fallback that works everywhere; WebGL2 and WebGPU draw the same SDF capsule
  impostors (GLSL vs WGSL) and share the shading models below. WebGPU
  requires a WebGPU-capable browser; if unavailable the app falls back to WebGL2
  automatically.
- **Shading** (GPU backends) — *Cutaway* (default), *Lit tubes* (Blinn–Phong),
  *Subsurface*, *Toon* or *X-ray*.

Research starting points are linked below.

### 3a-0. Cutaway — the vessel sliced open (default)

The default look, built for a game where cells, bacteria and viruses swim through
the vessels: each tube is rendered as if **cut open lengthwise**, so you read the
cross-section directly. Off the same SDF capsule normal, the shader splits the
cross-section into an **endothelial wall band** near the silhouette (warm, lighter
at the inner lining, darker toward a crisp dark "cut edge") and a **concave
lumen** inside — bright down the centre and shading into the walls, which reads as
looking down into an open half-pipe. Blood colour still follows the oxygenation
parameter, and the flowing cells are drawn on top, single-file in the capillaries.
On **Canvas 2D** the same look is faked in **layered passes** over the whole
visible set (cut outline → wall → lumen → concave core → sheen) rather than
segment-by-segment, so overlapping round line-caps never carve rings into their
neighbours and the tubes stay clean and continuous.

### 3a-i. Mitred capsules — making a chain of segments into one tube

Each vessel segment is an SDF capsule impostor (§3b). Drawn naively, a chain of
them reads as a row of sausages: every joint shows the round end cap of one
capsule bulging into its neighbour, and each capsule shades its cross-section
from *its own* chord direction, so the highlight and the cutaway banding jump at
every joint. Three things fix it, all fed by per-instance data:

1. **Shared node tangents.** Summing the (consistently downstream-oriented)
   chords of every edge meeting at a node gives one tangent per node. The
   fragment shader interpolates the cross-section frame between the two endpoint
   tangents, so lighting and banding run continuously through a joint.
2. **Mitre clipping.** Where exactly two segments meet at a gentle angle
   (< ~44°), both are clipped against the shared bisector plane through the node
   instead of drawing their caps, and the tube is extended along its axis rather
   than capped. Consecutive segments then tile exactly — no bulge, no dark ring.
3. **No spherical caps at all.** Every segment is the slab around its own
   (extended) axis. Hemispherical caps used to union into a visible ball at
   every bifurcation — and in the additive x-ray those balls piled up into
   white discs. Instead:
   - a **branch node** gets a short stub (0.6·r) from each incident segment,
     faded out over its length: where the neighbouring branches cover it the
     fade is invisible, where they don't it dissolves instead of ending in a
     cut-off rectangle;
   - an **open tip** gets nothing past the end and fades to transparent over
     the last ~1.6·r, so a terminal vessel dissolves into the tissue.
4. **A frame-continuous silhouette.** The lateral offset is measured in the
   *smoothed* frame — the perpendicular of `mix(tA, tB, t)` — against the point
   `A + ax·t`. At a shared node both neighbours therefore measure from the same
   origin with the same frame, so the outline matches exactly across the joint.
   Measuring each segment against its own chord instead left a visible wedge
   sticking out of every bend.

The flags are packed into the instance attribute's unused `type` slot
(`clip + 4·tips + 16·type`), so the whole thing costs no extra bandwidth.

### 3a-ii. A living lumen — what makes the inside look real

The cutaway needs the vessel interior to read as *flowing blood in a living
tube*, not a red-painted pipe. Every layer below is a function of two
coordinates the network exports per instance: **arc length** `s` (µm from the
root, continuous through every chain, computed by a breadth-first walk) and the
signed position **across** the open lumen.

- **Advected plasma shear** — two crossed sine waves scrolled along `s` at the
  vessel's own flow speed, with a **parabolic velocity profile** (the middle of
  the lumen visibly outruns the sides) and a surge on each heartbeat.
- **Cell haze** — two layers of jittered, cell-sized blobs advected with the
  same flow. Below the zoom where individual red cells are drawn, this is what
  makes the lumen read as a dense *suspension*; it fades out exactly as the real
  cell sprites become resolvable, so the two never fight.
- **Cell-free plasma sleeve** — the Fåhræus–Lindqvist layer: red cells crowd to
  the axis and leave a paler, thinner film of plasma sliding along the lining.
- **Endothelial mosaic** — the far inner wall is a staggered grid of flat,
  flow-aligned cells with bulging nuclei, blended in by how thin the blood
  column is. It shows toward the edges of the cut, which is what gives the open
  tube its depth.
- **Banded media** — the wall carries circumferential smooth-muscle striations,
  strong in arteries, faint in veins, absent in capillaries (which are a bare
  endothelial tube).
- **Pulsatile dilation** — the radius is scaled by the live pulse in the vertex
  *and* fragment shader: ~8.5 % in arteries, ~3 % in capillaries, ~2 % in veins.

All of it is mirrored in GLSL and WGSL, so WebGL2 and WebGPU render identically.

### 3a. Stylized — Canvas 2D analytic tubes

No shaders at all: each segment is stroked several times with decreasing width —
shadow → wall → lumen → bright core → glossy sheen — to **fake** a lit cylinder
cheaply. The static layer (tissue + vessels) is cached to an offscreen canvas and
only redrawn when the view changes; cells are drawn on top each frame. This is the
fallback when WebGL2 is unavailable.

### 3b. SDF capsule impostors (the WebGL foundation)

Every vessel segment is drawn as a single **instanced quad** that bounds the
segment. In the fragment shader a **capsule signed-distance function** decides
which pixels are inside the tube (`discard` the rest), and the tube's
**cross-section normal** is reconstructed analytically (`height = √(1 − n²)`).
This "lies and impostors" idea — render simple quads, do the real shape/lighting
per-pixel — is the standard way to draw lit tubes/spheres without dense geometry.
*Refs:* [gltut — Lies and Impostors](https://paroj.github.io/gltut/Illumination/Tutorial%2013.html),
[hg_sdf distance-function library](https://mercury.sexy/hg_sdf/),
[The Book of Shaders — Shapes](https://thebookofshaders.com/07/).

On top of that SDF normal, several shading models are selectable (the *Cutaway*
default is described in §3a-0):

### 3c. Lit tubes — Blinn–Phong

Classic real-time lighting on the reconstructed normal: ambient + diffuse
(`N·L`) + a Blinn–Phong specular highlight + a soft rim. Reads as wet, glossy
arteries.

### 3d. Subsurface — translucent blood

An approximation of **subsurface scattering**: thin parts of the tube let light
bleed through (a thickness/`height` term), a **Fresnel** term brightens grazing
edges, and a back-lighting term (`-N·L`) adds the characteristic translucent
glow of blood held to the light. Full SSS is too expensive in real time, so this
is the usual faked single-scatter + diffusion look.
*Refs:* [GPU Gems 3, Ch.16 — Real-Time Approximations to Subsurface Scattering](https://developer.nvidia.com/gpugems/gpugems/part-iii-materials/chapter-16-real-time-approximations-subsurface-scattering),
[MJP — An Introduction to Real-Time Subsurface Scattering](https://therealmjp.github.io/posts/sss-intro/).

### 3e. Toon — cel shading

The diffuse term is **quantised** into a few bands, the specular becomes a hard
spot, and a dark **outline** is drawn near the silhouette (where the SDF height
goes to zero). A stylised, illustrative look.

### 3e-ii. Anatomy — the medical-illustration look

A deliberately non-microscopic mode, aimed at how vessels are *drawn* rather
than how they look down a lens:

- **Warm, lit tissue** — a domain-warped fBm field remapped to flesh tones with
  a soft radial falloff, instead of the near-black histology field.
- **Glossy tubes** — a saturated body shaded by the reconstructed tube normal,
  a Gaussian specular streak offset to one side, a translucent rim bleed and a
  darkened edge. Arterial and venous hues are kept clearly apart.
- **Contact shadows** — the vessel instances are drawn twice: a first pass
  expands each capsule by `0.55·r + 6 µm` and writes a soft black alpha, so the
  vessels sit *on* the tissue instead of floating over it. On WebGPU the two
  passes need two bind groups (the pass flag lives in the uniform block, and a
  uniform buffer cannot be rewritten inside a render pass).
- The blood traffic is hidden here — the tubes are opaque, so cells inside them
  would read as cells crawling on the outside. Only the game's actors stay.

### 3f. X-ray — MAX-composited angiograph

Vessels are drawn on a near-black field, brightest along the lumen core —
mimicking a contrast **angiogram**. The procedural tissue is suppressed so only
the vasculature glows.

The compositing is **`MAX`, not a sum** (`blendEquation(gl.MAX)` / WGSL
`operation:'max'`). Summing made every overlap blow out to white: junction
stubs, crossing vessels, and above all the old spherical caps, which turned
every bifurcation into a saturated disc. Taking the brightest fragment keeps the
glow, never saturates, and makes a branch read as a branch. It also means a
faded stub is simply invisible wherever a neighbour covers it — the fade and the
blend mode do the junction work together.

### 3f-ii. Outline — spline-smoothed contour filter

A line-art mode that draws **only the vessel outlines**. It runs on the Canvas 2D
layer (so it overrides whatever backend is selected and works everywhere) in three
steps:

1. **Polyline reconstruction.** The flat list of straight sub-segment edges is
   walked into connected **polylines**, splitting wherever a node's degree ≠ 2
   (i.e. at leaves and bifurcations). Each chain carries its per-node radius and a
   dominant vessel type (artery / capillary / vein).
2. **Catmull–Rom smoothing.** Every chain is resampled with a centripetal-style
   **Catmull–Rom spline** (6 samples per span), interpolating the radius along the
   way, so the angular sub-segments become smooth curves.
3. **Fill→erode contour mask.** Per vessel class, the smoothed tubes are stroked
   at full (tapered) width into an offscreen mask, then the same tubes are stroked
   again with `destination-out` at a slightly smaller width. What survives is a
   thin **ring** — the outline of the *union* of all vessels, so junctions merge
   into a single gap-free contour with no internal seams. The ring is tinted by
   type (`source-in`) and composited back. Flowing cells are drawn as matching
   light outlines.

### 3g. Procedural tissue (WebGL background)

The tissue behind the vessels is a **domain-warped fBm noise** field (5-octave
value noise, warped by another noise lookup) with faint thresholded "nuclei",
fine capillary-bed mottling and a soft **depth vignette**, evaluated per-pixel in
world space so it pans and zooms with the camera.

### 3g-i. Red cells that tumble

A red cell is a **biconcave disc**, and it rolls as it flows — which is why real
blood shows round faces, foreshortened ellipses and edge-on peanuts all at once.
The impostor reproduces that from a single tumble angle per cell (phase + rate,
advanced from the clock at pack time, so it costs no per-frame state):

- The silhouette is the projection of the solid of revolution: the outer rim
  (which carries no thickness) against the **rim torus** at r ≈ 0.8 swung toward
  the viewer, `max(cosθ·√(1−x²), cosθ·√(0.64−x²) + sinθ·t(x))`. Face-on this
  collapses to an exact circle; edge-on to the peanut.
- `t(r)` is the Evans–Fung half-thickness, softened: the true 0.31 dimple-to-rim
  ratio reads as a bowtie at this scale, and a `^0.35` falloff keeps the ends of
  the edge-on silhouette rounded instead of pointed.
- A uniformly spun disc spends most of its time near edge-on, so the angle is
  biased toward the face (`cosθ^0.45`) — otherwise the traffic looks like a
  drawer of coins.
- Shading reconstructs an approximate in-plane radius from the silhouette and
  lights it as a solid: diffuse + specular off a rounded normal, the rim torus
  catching the light, the central dimple darkening only as the cell turns
  face-on.

### 3g-ii. Depth of field — making a flat lumen read as a volume

The lumen is a tube, but this is a flat view of one, so every cell carries a
**depth** `z ∈ [−1, 1]` across the thickness we cannot see. In the cell shader
that depth drives four things at once, which together read as an out-of-focus
layer rather than four separate tricks:

- the **edge softens** (the antialias width grows with distance), which for a
  round blob *is* a blur;
- the **internal detail washes out** — the biconcave ring, the specular glint,
  the granular nucleus all fade;
- the colour **sinks toward the blood behind it**, as if seen through plasma;
- the alpha drops, and the vertex shader shrinks far cells slightly.

The particle list is sorted by depth once at seeding, so the instanced draw is
naturally back-to-front; the game's actors are packed into reserved slots at the
*end* of the buffer, which both protects them from the visible-cell budget and
keeps them in front of the traffic. Canvas 2D approximates the same effect with
alpha alone.

### 3h. Blood-cell impostors

Cells are instanced quads too; the fragment shader draws a **biconcave disc**
(bright torus + dim central dimple + dark rim + a specular glint) for red cells,
a pale lobed body for leukocytes, and a small fragment for platelets — plus, for
the game framing, a **teal rod** (a capsule SDF) for bacteria and a **spiky
yellow capsid** (a wavy radius + dark core) for viruses. All are tinted by the
carried oxygenation value where relevant (and made to glow in X-ray mode).

---

## 4. Tweakable parameters

The panel exposes live controls. **Tree-shape** sliders rebuild the bed:

- **Branching density** — attractor / node budget and branch spacing.
- **Vessel length** — segment / limb length.
- **Curviness** — how much each limb wanders.
- **Taper (Murray exp)** — the exponent in Murray's law (lower = downstream
  vessels stay relatively thick; higher = trunks dominate).

**Appearance** sliders apply instantly (no rebuild) via shader/draw uniforms:

- **Calibre** — overall vessel thickness multiplier.
- **Wall thickness** — darkened wall band near the silhouette.
- **Gloss** — specular intensity.

Plus **Flow** (heart rate, flow speed, cell density) and **Show** toggles
(walls, tissue, cells, anatomy labels).

## 5. Interaction & performance

- **Zoom / pan** via a single world→screen transform (wheel, drag, pinch,
  buttons, double-click), with a live microscope **scale bar** and magnification.
- **Level of detail** — red cells fall back from a detailed sprite/impostor to a
  simple ellipse to a single pixel as you zoom out; off-screen cells and segments
  are culled. Two coarser levels sit above that, because the bed spans
  millimetres and carries tens of thousands of particles: below ~1 px per red
  cell the whole particle system is skipped (the shader's cell haze covers the
  look), and above it only the cells in vessels near the viewport are advanced —
  the rest simply freeze where nobody can see them.
- **Instancing** — one draw call each for all vessels and all cells in WebGL;
  the vessel instance buffer is uploaded once per generated bed, the cell buffer
  is streamed only when the visible set changes.
- **Spline resample** — normalising the segment count (see §1c-ii) is also a
  performance lever: fewer capsule impostors for the same visual density.
- **Idle skip** — when the simulation is **paused**, the loop skips the cell
  update entirely, the GPU paths reuse the last streamed cell buffer, and the
  Canvas 2D path stops repainting until the view changes.
- **Static caching** in the Canvas 2D path so only moving cells repaint at 60 fps.

---

## References

- Runions, Lane, Prusinkiewicz — *Modeling Trees with a Space Colonization Algorithm*
- Witten & Sander (1981) — *Diffusion-Limited Aggregation*
- Schreiner & Buxbaum (1993) — *Computer-optimization of vascular trees* (Constrained Constructive Optimization)
- [WebGPU / WGSL specification](https://www.w3.org/TR/webgpu/)
- [Blender SE — techniques for modeling a network of blood vessels](https://blender.stackexchange.com/questions/61261/techniques-for-modeling-a-network-of-blood-vessels)
- [gltut — Lies and Impostors](https://paroj.github.io/gltut/Illumination/Tutorial%2013.html)
- [hg_sdf — signed distance function library](https://mercury.sexy/hg_sdf/)
- [The Book of Shaders](https://thebookofshaders.com/)
- [GPU Gems 3 — Real-Time Approximations to Subsurface Scattering](https://developer.nvidia.com/gpugems/gpugems/part-iii-materials/chapter-16-real-time-approximations-subsurface-scattering)
- [MJP — An Introduction to Real-Time Subsurface Scattering](https://therealmjp.github.io/posts/sss-intro/)
- Murray, C.D. (1926) — *The Physiological Principle of Minimum Work* (Murray's law)
