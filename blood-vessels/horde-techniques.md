# Immune Horde — techniques

How [`horde.html`](horde.html) works: a game-scale vessel network you can play
inside, where you direct hordes of white blood cells through arteries and veins.
The page is plain JavaScript split over a few classic scripts in
[`horde/`](horde/) (no build step, no libraries, works from `file://`):

| file | job |
|---|---|
| [`horde/gen.js`](horde/gen.js) + `horde/gen-*.js` | the map-style generators (`BV.generate`) |
| [`horde/net.js`](horde/net.js) | flow solve, render chains, Bézier field, bin grid, physics tiles |
| [`horde/render.js`](horde/render.js) | WebGL2 renderer |
| [`horde/sim.js`](horde/sim.js) | red cells, the horde, pathogens, navigation, game rules |
| [`horde/main.js`](horde/main.js) | loop, camera, mouse / touch input, HUD, minimap, settings |

The microvascular sandbox ([`index.html`](index.html), [`techniques.md`](techniques.md))
is a separate, anatomically scaled app; this page trades its one-red-cell
capillaries for corridors wide enough to hold an army.

---

## 1. Scale

Everything is in micrometres and anchored to the white blood cell.

| thing | size |
|---|---|
| neutrophil (the player's unit) | r = 6 µm |
| red cell | r = 3.75 µm |
| max zoom | a white cell is ~64 css px across, so a 1920 px screen shows ~360 µm |
| arterial trunk | r ≈ 700 µm: about **4 screen widths** across at max zoom |
| venous trunk | r ≈ 700–800 µm |
| terminal arteries / veins | r ≈ 180–250 µm: about **1 screen width** at max zoom |
| AV connectors | pinched to r ≈ 105–135 µm: the chokepoints |
| map | 22 × 14 mm; min zoom fits the whole map on screen |

A horde of 300 cells packs into a blob ~250 µm across, so it fits every
corridor and has to string out through a connector. Radii follow Murray's law
(r_parent^γ = Σ r_child^γ, γ ≈ 2.7–3) between those anchors, which fixes the
number of terminals per tree at roughly (r_trunk / r_terminal)^γ ≈ 20–35: a
level, not a capillary bed.

Flow runs in game time: the inlet trunk carries a mean 260 µm/s, a white cell
swims ~170 µm/s. So the arteries are one-way highways, the terminal vessels and
connectors are where you can fight the current, and hugging the wall (where
Poiseuille flow is slowest) is how you go upstream.

---

## 2. Generating the level

### 2a. The constraint that shapes everything

The level is **planar**: a horde has to know which vessel it is in, so vessels
may only meet at junctions, never cross. It also has to be **closed**: the
request was vessels that "end in each other", so every arterial tip flows
through an AV connector into the venous tree and nothing dead-ends. Planar,
closed, with both roots on the map boundary, turns out to be the hard part:

- two trees rooted next to each other on the boundary cannot both fan out
  around the same hilum and interleave; alternating angular sectors always
  force a crossing (the cyclic order of the six vessel ends at any shared fork
  interleaves arterial and venous ends);
- every connector closes a loop (artery → connector → vein → back through the
  heart), and near the map edge those loops wall off pockets only one tree can
  reach.

So every workable design commits to a macro topology first (one tree owns a
boundary band, or the two interlock as combs, or one lives on the dual graph of
the other) and grows the detail inside it.

### 2b. The competition

Four generators were prototyped in parallel against one shared contract and
measured by the same checker (planarity, a tissue gap of max(150 µm, 0.6·r)
between unconnected vessels, no dead ends, curvature ≥ 1.5 r, junctions
≥ 2.5 r apart, Murray radii, generation < 1.5 s). Three judges scored them from
rendered images: one for anatomy, one for game design, one for visual quality
and robustness. They split, so all four ship as **map styles** (Settings →
map style), each then hardened until it passed extra quality gates on 40
seeds: largest tissue void ≤ 3.3 mm, ≥ 16 connectors, ≥ 14 independent loops,
connectors ≤ 2.2 mm long and leaving terminal-calibre vessels only, no 4-way
knots.

| style | idea |
|---|---|
| **Organ lobe** (`primaldual`, default) | Delaunay mesh: arteries on the primal edges, veins on the dual edges (a primal edge and its dual cross, so only one of each pair may exist: planar by construction). The arterial tree is a branched-transport tree (iterated shortest paths with marginal cost L·((F+1)^0.55 − F^0.55)) with every junction a bifurcation; veins slide in between its branches and a marginal vein collects the rim. A relaxation pass steers junctions to Murray angles under r² tension with a planarity guard. |
| **Cortical surface** (`anatomic`) | A pial-surface layout: the arterial tree splits the tissue into angular territories recursively; veins are routed on a clearance grid along the ridges between arteries, join with the flow as Y's, and open up to three exits where that is cheaper. |
| **Hub and arcade** (`colonize`) | Two-species space colonization (Runions et al.) inside territories: an arterial star from a hub, a venous arcade round the map that reaches in between its fingers; long connectors become arteriole + capillary + venule. |
| **Interlocking combs** (`dualcco`) | Coupled constrained constructive optimization: arterial and venous fingers interlock from opposite sides; capillary units (arterial tip + connector + venous tip) are spliced in at the weighted Fermat–Weber point of the three limbs (Weiszfeld iterations: the local minimum of Σ r²·ℓ). |

Every style ends with the same safety net: a self-check that mirrors the
contract, local repairs (push apart, straighten, drop a connector), and a
deterministic retry from a derived seed if a map misses the quality bar.

---

## 3. The runtime network (`net.js`)

The generator hands over a graph of smooth polylines with radii. `BV.buildNet`
turns it into what the renderer and the simulation share.

1. **Flow.** Poiseuille conductance g = 1 / Σ ℓ/r⁴ per edge, pressure 1 at the
   inlet and 0 at the outlets, solved with Jacobi-preconditioned conjugate
   gradient. Edges are re-oriented along the solved flow; mean speed is
   Q / πr², scaled so the inlet trunk runs at 260 µm/s. Every point also keeps
   its pressure, which the pulse wave rides on (§4c).
2. **Render chains.** At each junction the straightest in → out pair continues
   as one chain and the remaining vessel starts (or ends) there as a side
   branch. Joining the continuation matters: a smooth union bulges wherever two
   surfaces run tangent, and a vessel that simply continues through a junction
   would otherwise be two tangent tubes. The kink at the joint is rounded and a
   radius step is ramped over ~1.5 r.
3. **Béziers.** Each chain is resampled adaptively (~0.9 r spacing, ≤ 20° of
   turning per span) and becomes a C¹ quadratic B-spline, one quadratic Bézier
   per control vertex, so walls are exactly smooth at any zoom.
4. **Bin grid.** A 256 µm grid lists, per cell, every Bézier whose shading
   reach (0.6 r + 160 µm) can touch it, sorted by chain. The GPU and the CPU
   evaluate the same lists with the same maths, so what you see is what the
   cells bump into.
5. **The field.** Per chain, the normalised distance
   n_c = (|p − B(t*)| − r(t*)) / r(t*) with the closest point from the
   analytic cubic solve of the quadratic Bézier; across chains the
   exponential smooth union N = −k·log₂ Σ 2^(−n_c/k) (k = 0.22), the only smooth
   minimum that is associative and a plain sum, so a 3-, 4- or 5-way junction
   merges without ordering. Normalising by the radius makes every fillet
   proportional to the vessels it joins. N = −1 on the axis, 0 on the wall;
   the wall band is N ∈ [−wall, 0] and the lumen, where cells live, is
   N < −wall.
6. **Physics tiles.** Thousands of cells query the field every frame, so
   `sample()` reads it bilinearly from lazily built 16 µm tiles (~0.1 µs a
   query), with an allocation-free variant for the hot loops.

---

## 4. Rendering (`render.js`)

### 4a. One full-screen world pass

There is no vessel geometry. For each pixel: world position → bin cell → that
cell's Bézier list → per-chain distance → smooth union → shading. A second list
texture stores each entry's bounding circle, so most entries are rejected with
one fetch and a typical pixel does one or two full Bézier evaluations (six at a
junction). The two heaviest chains keep their own arc length and lateral
offset: arc-based textures are evaluated per chain and cross-faded, never
blended as coordinates, which is what keeps junctions free of smeared stripes.
The pass can run at reduced resolution and be upsampled (automatic quality).

### 4b. Looks

- **Tissue**: wet, domain-warped flesh with lobules, fibres wrapping along the
  nearest vessels, raised lit berms beside them, contact shadows and deep dark
  pockets between them.
- **Cut-open vessels** (zoomed in): a thick, glossy, muscular rim (wavy muscle
  layers, bright lining, dark cut edge, adventitia coat) around a half-pipe
  lumen seen through luminous plasma: a folded fibrous far wall lit from the
  top-left, deepest along the axis, advected plasma streaks with a parabolic
  profile that surge on the beat, drifting blood clouds and a red-cell haze
  when the cells themselves are too small to draw. Arteries scarlet, veins deep
  burgundy, connectors blend by oxygenation.
- **Glossy tubes** (zoomed out): below a few dozen pixels a vessel turns into a
  raised glossy tube with a specular streak, the medical-illustration look.
- Every texture fades by pixel footprint, so the overview never shimmers.

### 4c. Wobble

Everything alive jiggles.

- **Vessels**: the merged field is offset before shading, so wall, lining,
  shadow and tissue berm move together. A slow undulation travels along every
  vessel (its own phase per chain and per side), and the **arterial pulse**
  dilates arteries by ~5 % of r on every beat, delayed by the pressure drop
  from the inlet so the wave visibly runs down the tree; veins barely move.
  The rendered lumen edge only ever moves outward of the physics wall (inward
  by at most a tenth of the wall thickness), so a cell never appears to sit in
  the wall.
- **White cells** are soft bodies: rippling outline, volume-preserving squash &
  stretch along the heading, and a damped jiggle whose amplitude the simulation
  raises on bumps, engulfing, orders and stops. The nucleus sloshes behind the
  membrane; the face stays rigid and cute.
- Virus spikes waggle on their own beats, bacteria flex along their length,
  lesions breathe, red cells flex like soft discs.

### 4d. Cells and units

Instanced impostors, drawn world → far red cells → units → a few big
out-of-focus red cells in front.

- **Red cells**: glossy biconcave discs (dimple, bright rim torus, subsurface
  edge glow) that tumble, with depth of field across the tube: far cells are
  smaller, softer and sink toward the plasma colour.
- **White cells**: translucent milky-glass jelly with a Fresnel rim, a lobed
  nucleus, granules, speculars and a face whose eyes follow the heading, blink,
  smile, and chomp when eating (the prey shows inside, shrinking as it is
  digested). **Viruses** are orange spiky balls with angry brows,
  **bacteria** green rods with flagella and a grumpy face, **infection sites**
  pulsing pus-filled lesions in the wall with an HP ring.
- Below ~9 px everything becomes a clean icon (white dots for the horde, cyan
  when selected, orange / green for pathogens, a ring for sites), so a horde
  still reads at overview zoom. Selection rings are drawn under all bodies, so
  a packed selected horde is outlined as one shape.

---

## 5. Simulation (`sim.js`)

- **Red cells** live only around the viewport: a pool held at ~18 % of the
  lumen area by a bin controller that tops up the rim where the flow enters the
  view and fills newly revealed area with a short fade. They ride the
  Poiseuille profile across the tube and in depth, so deep and shallow cells
  move slower than the axis.
- **White cells** (SoA arrays): carried by the flow, swim thrust toward their
  order, soft separation through a spatial hash, mild cohesion, and wall
  contact that projects them back into the lumen. Idle cells **marginate**:
  they drift to the wall and adhere, as real leukocytes roll and arrest on the
  endothelium, so an idle horde is not washed away. A cell never swims
  straight into a current it cannot beat; it first slides into the slow lane
  along the wall.
- **Navigation**: a 40 µm lumen grid and an anisotropic Dijkstra from the
  target, where cost = length / ground speed (downstream at the mean speed,
  upstream against the local wall-lane speed). The venous outlet links back to
  the arterial inlet: going round through the heart is a legal route.
- **Game**: infection sites bloom in vessel walls and shed viruses and
  bacteria into the flow; bacteria colonise and divide; a white cell touching a
  pathogen engulfs it, and cells crowding a lesion destroy it. Escapes into the
  veins and every living pathogen raise the infection level; reinforcements
  arrive at the arterial inlet; waves escalate.
- Deterministic per seed: game logic never depends on the camera, and hot loops
  allocate nothing.

---

## 6. App shell (`main.js`)

- Fixed 1/120 s simulation steps under a frame accumulator (a slow frame means
  slow motion, never a spiral).
- Camera: zoom at the cursor from whole-map to max zoom with exponential
  easing, inertial panning, and smooth zoom-and-pan flights (van Wijk–Nuij)
  for long jumps (minimap, home).
- Input: box select, click a horde, right-click to order, wheel and pinch
  zoom, tap to select or order on touch, long-press for a box.
- HUD in the style of a sci-fi lab console (status, statistics, bio-control
  panel), minimap, off-screen threat indicators, settings (map style, seed,
  difficulty, quality, red cells, depth of field) and help.
- Automatic quality lowers the world pass resolution when frames run long.
