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

## 3. Shading algorithms (switchable)

Rendering is split into a **Backend** switch and a **Shading** switch:

- **Backend** — *Canvas 2D*, *WebGL2*, or *WebGPU*. Canvas 2D is the analytic
  fallback that works everywhere; WebGL2 and WebGPU draw the same SDF capsule
  impostors (GLSL vs WGSL) and share the four lighting models below. WebGPU
  requires a WebGPU-capable browser; if unavailable the app falls back to WebGL2
  automatically.
- **Shading** (GPU backends) — *Lit tubes* (Blinn–Phong), *Subsurface*, *Toon* or
  *X-ray*.

Research starting points are linked below.

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

On top of that SDF normal, four lighting models are selectable:

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

### 3f. X-ray — additive angiograph

Vessels are drawn with **additive blending** on a near-black field, brightest
along the lumen core — mimicking a contrast **angiogram**. The procedural tissue
is suppressed so only the vasculature glows.

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
evaluated per-pixel in world space so it pans and zooms with the camera.

### 3h. Blood-cell impostors

Cells are instanced quads too; the fragment shader draws a **biconcave disc**
(bright torus + dim central dimple + dark rim + a specular glint) for red cells,
a pale lobed body for leukocytes, and a small fragment for platelets, all tinted
by the carried oxygenation value (and made to glow in X-ray mode).

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
  are culled.
- **Instancing** — one draw call each for all vessels and all cells in WebGL;
  the vessel instance buffer is uploaded once per generated bed, the cell buffer
  is streamed each frame.
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
