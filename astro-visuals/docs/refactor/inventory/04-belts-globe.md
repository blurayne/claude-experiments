# Slice 04 — belts, rings, globe, plates, bodies buffers, trails

Source: `galactic-transit.html`, lines **2453–2935** (inclusive). Everything below is declared inside that range unless marked as an external read.

Legend for **Touches**: `DOM` / `gl` (WebGL2 context) / `rand` (Math.random, directly or via `gauss()`) / `LS` (localStorage) / `audio` (Web Audio) / `evt` (window/document event registration). `—` means none of those.

Legend for **Purity**: `pure` = pure function; `reads` = reads mutable module state; `mutates` = mutates mutable module state; `eval` = performs a side effect at module-evaluation time.

---

## 1. Belt and cloud geometry (asteroid belt, Kuiper belt, Oort cloud)

| # | Name | Kind | Lines | What it is | Target module | External deps (not declared in range) | Touches | Purity |
|---|------|------|-------|------------|---------------|----------------------------------------|---------|--------|
| 1 | `AB_N` | `const` (number, 1500) | 2456 | Asteroid-belt particle count | `scene/belts` | — | — | pure const |
| 2 | `abRT` | `var` Float32Array(AB_N*2) | 2457 | Real-scale asteroid (radius AU, initial angle) pairs | `scene/belts` | — | — | eval-alloc |
| 3 | `abRTd` | `var` Float32Array(AB_N*2) | 2457 | Display-scale remapped (radius, angle) pairs, Mars(14)…Jupiter(20) | `scene/belts` | — | — | eval-alloc |
| 4 | `abH` | `var` Float32Array(AB_N) | 2458 | Real-scale height offsets along the ecliptic normal | `scene/belts` | — | — | eval-alloc |
| 5 | `abHd` | `var` Float32Array(AB_N) | 2458 | Display-scale height offsets | `scene/belts` | — | — | eval-alloc |
| 6 | `abSz` | `var` Float32Array(AB_N) | 2459 | Per-asteroid sprite size | `scene/belts` | — | — | eval-alloc |
| 7 | `abP` | `var` Float32Array(AB_N) | 2459 | Per-asteroid true Kepler period in years (r^1.5) | `scene/belts` | — | — | eval-alloc |
| 8 | *(anonymous block)* | bare block statement `{ … }` | 2460–2475 | Fills 1–7. Rejection sampling against three Kirkwood gaps `GAPS=[2.502,2.825,2.958]` (block-local `const GAPS`, 2461), then angle, display radius, gaussian heights, size, period | `scene/belts` | `gauss` (1649), `Math.random` | **rand** | **eval, RNG-ORDER-CRITICAL** |
| 9 | `KB_N` | `const` (1600) | 2476 | Kuiper-belt particle count | `scene/belts` | — | — | pure const |
| 10 | `kbRT` | `var` Float32Array(KB_N*2) | 2477 | Kuiper (radius, angle) pairs | `scene/belts` | — | — | eval-alloc |
| 11 | `kbH` | `var` Float32Array(KB_N) | 2477 | Kuiper height offsets | `scene/belts` | — | — | eval-alloc |
| 12 | `kbSz` | `var` Float32Array(KB_N) | 2477 | Kuiper sprite sizes | `scene/belts` | — | — | eval-alloc |
| 13 | *(anonymous loop)* | top-level `for` statement | 2478–2483 | Fills 10–12: 70% classical belt (42–50 AU), 30% scattered disk | `scene/belts` | `gauss` (1649), `Math.random` | **rand** | **eval, RNG-ORDER-CRITICAL** |
| 14 | `OO_N` | `const` (2400) | 2484 | Oort-cloud particle count | `scene/belts` | — | — | pure const |
| 15 | `ooOff` | `var` Float32Array(OO_N*3) | 2485 | Oort offsets from the Sun (xyz, scene units) | `scene/belts` | — | — | eval-alloc |
| 16 | `ooSz` | `var` Float32Array(OO_N) | 2485 | Oort sprite sizes | `scene/belts` | — | — | eval-alloc |
| 17 | *(anonymous loop)* | top-level `for` statement | 2486–2491 | Fills 15–16: spherical shell r=90…175, uniform on the sphere via `acos(2u−1)` | `scene/belts` | `Math.random` | **rand** | **eval, RNG-ORDER-CRITICAL** |

## 2. Belt shaders and belt GPU objects

| # | Name | Kind | Lines | What it is | Target module | External deps | Touches | Purity |
|---|------|------|-------|------------|---------------|---------------|---------|--------|
| 18 | `KB_VS` | `const` template string | 2492–2503 | Kuiper vertex shader; Kepler-scaled period vs Neptune | `shaders/kuiper.vert` | — | — | pure const |
| 19 | `AB_VS` | `const` template string | 2504–2516 | Asteroid vertex shader; per-particle period attribute `aP` (location 3) | `shaders/asteroid.vert` | — | — | pure const |
| 20 | `OO_VS` | `const` template string | 2517–2524 | Oort vertex shader; static offsets, no orbital motion | `shaders/oort.vert` | — | — | pure const |
| 21 | `BELT_FS` | `const` template string | 2525–2528 | Shared round-sprite fragment shader for all three belts | `shaders/belt.frag` | — | — | pure const |
| 22 | `pKB`, `pOO`, `pAB` | `const` (WebGLProgram ×3) | 2529 | The three compiled belt programs | `render/passes/belts` | `prog` (1197), `gl` (1189) | **gl** | **eval** |
| 23 | `UA` | `const` object | 2530 | Uniform-location map for `pAB` (11 names) | `render/passes/belts` | `gl` | **gl** | **eval** |
| 24 | `UK` | `const` object | 2531 | Uniform-location map for `pKB` (11 names) | `render/passes/belts` | `gl` | **gl** | **eval** |
| 25 | `UO` | `const` object | 2532 | Uniform-location map for `pOO` (7 names) | `render/passes/belts` | `gl` | **gl** | **eval** |
| 26 | `vaoKB` | `const` (WebGLVertexArrayObject) | 2533 | Kuiper VAO | `render/passes/belts` | `gl` | **gl** | **eval** |
| 27 | *(anonymous statements)* | bare statements | 2534–2540 | Creates 3 buffers, uploads `kbRT`/`kbH`/`kbSz`, binds attribs 0/1/2 into `vaoKB`, unbinds | `render/passes/belts` | `gl` | **gl** | **eval** |
| 28 | `bufAbSz` | `const` (WebGLBuffer) | 2541 | Asteroid size buffer, shared by both asteroid VAOs | `render/passes/belts` | `gl` | **gl** | **eval** |
| 29 | `bufAbP` | `const` (WebGLBuffer) | 2542 | Asteroid period buffer, shared by both asteroid VAOs | `render/passes/belts` | `gl` | **gl** | **eval** |
| 30 | `beltVAO` | `function(rt,h)` | 2543–2552 | Builds an asteroid VAO from a (radius,angle) and a height array, reusing `bufAbSz`/`bufAbP` | `render/passes/belts` | `gl` | **gl** | reads (`bufAbSz`,`bufAbP`), gl side effects |
| 31 | `vaoABr`, `vaoABd` | `const` ×2 | 2553 | Asteroid VAOs for real scale and display scale | `render/passes/belts` | `gl` | **gl** | **eval** |
| 32 | `vaoOO` | `const` | 2554 | Oort VAO | `render/passes/belts` | `gl` | **gl** | **eval** |
| 33 | *(anonymous statements)* | bare statements | 2555–2559 | Creates 2 buffers, uploads `ooOff`/`ooSz`, binds attribs 0/1 into `vaoOO`, unbinds | `render/passes/belts` | `gl` | **gl** | **eval** |

## 3. Great-circle ring geometry (Oort shell boundary, reused for the Moon's orbit)

| # | Name | Kind | Lines | What it is | Target module | External deps | Touches | Purity |
|---|------|------|-------|------------|---------------|---------------|---------|--------|
| 34 | `RING_SEGS` | `const` (160) | 2562 | Segments in one great circle | `scene/belts` | — | — | pure const |
| 35 | `ringCS` | `var` Float32Array(RING_SEGS*2) | 2563 | Unit-circle cos/sin table | `scene/belts` | — | — | eval-alloc |
| 36 | *(anonymous loop)* | top-level `for` statement | 2564 | Fills `ringCS` | `scene/belts` | — | — | eval (deterministic, no RNG) |
| 37 | `RING_VS` | `const` template string | 2565–2568 | Ring vertex shader: circle in the plane spanned by `uA`,`uB` about `uSun`, radius `uR` | `shaders/ring.vert` | — | — | pure const |
| 38 | `RING_FS` | `const` template string | 2569–2571 | Flat-colour ring fragment shader | `shaders/ring.frag` | — | — | pure const |
| 39 | `pRing` | `const` (WebGLProgram) | 2572 | Compiled ring program | `render/passes/rings` | `prog` (1197), `gl` | **gl** | **eval** |

Note: `UR` (the ring uniform map, #64) and `vaoRing` (#65) are declared far below at 2849–2853, **not** here — see §7. That split is a boot-order hazard, listed in the hazards section.

## 4. Earth / Moon globe shaders and program

| # | Name | Kind | Lines | What it is | Target module | External deps | Touches | Purity |
|---|------|------|-------|------------|---------------|---------------|---------|--------|
| 40 | `GLOBE_VS` | `const` template string | 2580–2582 | Globe vertex shader: one point sprite at `uPos` of size `uSz` | `shaders/globe.vert` | — | — | pure const |
| 41 | `GLOBE_FS` | `const` template string | 2583–2706 | Globe fragment shader: sphere normal from sprite coords, plate-mapped real land (`uPlate[7]`, `uMap`), noise fallback (`h31`/`vn3`/`fbm3`), ocean/ice/cloud/haze/lava/city-lights, atmosphere ring beyond the limb, Moon regolith branch | `shaders/globe.frag` | — | — | pure const |
| 42 | `pGlobe` | `const` (WebGLProgram) | 2707 | Compiled globe program | `render/passes/globe` | `prog` (1197), `gl` | **gl** | **eval** |
| 43 | `UG` | `const` object | 2708–2709 | Uniform-location map for `pGlobe` (25 names) | `render/passes/globe` | `gl` | **gl** | **eval** |
| 44 | *(anonymous statement)* | assignment `UG.uPlate = …` | 2710 | Adds the `uPlate[0]` array-uniform location to `UG` (the loop above cannot name it) | `render/passes/globe` | `gl` | **gl** | **eval, mutates `UG`** |

## 5. Earth map texture

| # | Name | Kind | Lines | What it is | Target module | External deps | Touches | Purity |
|---|------|------|-------|------------|---------------|---------------|---------|--------|
| 45 | `earthTex` | `let` (WebGLTexture \| null) | 2713 | The loaded `earth-map.webp` texture, or null until it arrives | `render/passes/globe` | — | **gl** (once set) | **mutable module state** |
| 46 | `loadEarthMap` | `function()` | 2714–2724 | Fetches `earth-map.webp`, decodes to an ImageBitmap, uploads as RGB/LINEAR/REPEAT-S, assigns `earthTex`; swallows all errors | `render/passes/globe` | `gl`, `fetch`, `createImageBitmap`, `Promise` | **gl**, network | **mutates `earthTex`, async** |
| 47 | *(anonymous call)* | top-level call `loadEarthMap();` | 2725 | Kicks the fetch off at boot | `main.ts` (wiring) | `loadEarthMap` | **gl**, network | **eval, async side effect** |

## 6. Plate model, Moon orbit, Earth spin, era model, small vector helpers

| # | Name | Kind | Lines | What it is | Target module | External deps | Touches | Purity |
|---|------|------|-------|------------|---------------|---------------|---------|--------|
| 48 | `PLATE_MODEL` | `const` array of 7 objects | 2732–2740 | Schematic plate reconstruction: name, Euler pole (lat,lon), keyframed angles in Myr. Order matches the map's G-channel ids | `astro/earth` | — | — | pure const data |
| 49 | `plateMats` | `const` Float32Array(63) | 2741 | Scratch buffer: 7 column-major mat3s handed to `UG.uPlate` | `astro/earth` (buffer) / consumed by `render/passes/globe` | — | — | **mutable module state (scratch)** |
| 50 | `plateAngle` | `function(keys,tMyr)` | 2742–2746 | Linear interpolation of a plate's rotation angle between keyframes, clamped at both ends | `astro/earth` | — | — | **pure** |
| 51 | `fillPlateMats` | `function(tMyr)` | 2747–2761 | Builds all 7 Rodrigues rotation matrices (inverse rotation: now → then) into `plateMats` | `astro/earth` | `PLATE_MODEL`, `plateAngle` (both in range) | — | **mutates `plateMats`** |
| 52 | `vaoGlobe` | `const`, IIFE `(()=>{…})()` | 2762 | An empty VAO used to draw the single globe point | `render/passes/globe` | `gl` | **gl** | **eval** |
| 53 | `MOON_D0` | `const` | 2766 | Moon's present distance in scene units | `astro/earth` | `AU2U` (1594) | — | pure const |
| 54 | `MOON_INC` | `const` | 2766 | Orbit inclination, 5.145° | `astro/earth` | — | — | pure const |
| 55 | `MOON_P0` | `const` | 2766 | Sidereal month in years | `astro/earth` | — | — | pure const |
| 56 | `MOON_M1` | `const` (alias of `E1`) | 2767 | First basis vector of the lunar orbit plane | `astro/earth` | `E1` (1569) | — | pure const (aliases the shared `E1` array — do not mutate) |
| 57 | `MOON_M2` | `const` array(3) | 2767 | Second basis vector, `E2` tilted by `MOON_INC` toward `EN` | `astro/earth` | `E2` (1570), `EN` (1605) | — | pure const |
| 58 | `MOON_BORN` | `const` (0.06 Gyr) | 2768 | The Theia impact epoch: before it, no Moon | `astro/earth` | — | — | pure const |
| 59 | `MOON_DIA` | `const` | 2769 | Moon's true diameter in scene units | `astro/earth` | `AU2U` | — | pure const |
| 60 | `moonDist` | `function(a)` | 2770 | Lunar recession power law vs age in Gyr, clamped to [0.02,3] of the fit range | `astro/earth` | `MOON_D0` | — | **pure** |
| 61 | `moonW` | `const` Float64Array(3) | 2771 | Scratch: Moon's world position | `render/state` | — | — | **mutable module state (scratch)** |
| 62 | `moonRel` | `const` Float32Array(3) | 2771 | Scratch: Moon's position relative to the render origin | `render/state` | — | — | **mutable module state (scratch)** |
| 63 | `moonPos` | `function(t,out)` | 2772–2778 | Moon's world position at sim time `t`: Earth's position plus the orbit, Kepler period from the distance | `astro/earth` | `AGE0` (1541), `YR_PER_SIM` (1540), `bodyPos` (1625) | — | writes into caller's `out`; otherwise **pure** |
| 64 | `OBLIQ` | `const` | 2781 | Earth's obliquity, 23.44° | `astro/earth` | — | — | pure const |
| 65 | `EARTH_AXIS` | `const` array(3), IIFE | 2782–2784 | Spin axis in world space, phased so northern summer lands on the calendar's June | `astro/earth` | `PHASE` (1602), `E1`, `E2`, `EN` | — | **eval (deterministic)** |
| 66 | `EARTH_P0` | `const` array(3), IIFE | 2785–2786 | Prime-meridian reference direction: `E1` orthogonalised against `EARTH_AXIS`, normalised | `astro/earth` | `E1` | — | **eval (deterministic)** |
| 67 | `SIDEREAL` | `const` (366.2422) | 2787 | Rotations per year | `astro/earth` | — | — | pure const |
| 68 | `earthPhi0` | `let` (number \| null) | 2788 | Lazily solved spin phase: Greenwich noon on 2026-01-01 | `astro/earth` | — | — | **mutable module state, lazily initialised** |
| 69 | `earthPrime` | `function(t,out)` | 2789–2801 | Prime meridian's direction on the equator at time `t`; on first call solves and caches `earthPhi0` | `astro/earth` | `bodyPos` (1625), **`org` (5055)** | — | **reads + mutates `earthPhi0`; first-call-order dependent** |
| 70 | `clamp01` | `const` arrow fn | 2804 | `x => max(0, min(1, x))` | `astro/earth` | — | — | **pure** |
| 71 | `earthEra` | `function(a, meanC)` | 2805–2845 | The whole era model: molten/ocean/sea/haze/veg/iceLat/cloud/lights/drift/dry/seaLevel for an age in Gyr and a mean temperature | `astro/earth` | `clamp01` (in range), `AGE0` (1541) | — | **pure** |
| 72 | `vecV` | `const` arrow fn | 2846 | mat4 (column-major) × vec3, rotation part only — world direction into view space | `core/mat4` | — | — | **pure** |
| 73 | `norm3` | `const` arrow fn | 2847 | Normalise a 3-vector, divide-by-zero guarded | `core/mat4` | — | — | **pure** |

## 7. Frame-level render state, and the ring pass's late GPU objects

| # | Name | Kind | Lines | What it is | Target module | External deps | Touches | Purity |
|---|------|------|-------|------------|---------------|---------------|---------|--------|
| 74 | `globePx` | `let` (0) | 2848 | Earth's on-screen diameter in device pixels, recomputed each frame | `render/state` | — | — | **mutable module state** |
| 75 | `moonPx` | `let` (0) | 2848 | Moon's on-screen diameter in device pixels | `render/state` | — | — | **mutable module state** |
| 76 | `earthDbg` | `let` (null) | 2848 | Last frame's globe inputs `{sunV, axV, prV, era}`, written for debug tooling | `render/state` | — | — | **mutable module state, write-only inside this file** |
| 77 | `camSunDist` | `let` (150) | 2848 | Camera-to-Sun distance in scene units | `render/state` | — | — | **mutable module state** |
| 78 | `avgLight` | `let` (0) | 2848 | 0…1 crossfade into daily-mean lighting when the clock outruns the day | `render/state` | — | — | **mutable module state** |
| 79 | `UR` | `const` object | 2849 | Uniform-location map for `pRing` (7 names) | `render/passes/rings` | `gl`, `pRing` (2572) | **gl** | **eval** |
| 80 | `vaoRing` | `const` | 2850 | Ring VAO | `render/passes/rings` | `gl` | **gl** | **eval** |
| 81 | *(anonymous statements)* | bare statements | 2851–2853 | Creates the buffer, uploads `ringCS`, binds attrib 0 into `vaoRing`, unbinds | `render/passes/rings` | `gl` | **gl** | **eval** |

## 8. Body point-sprite buffers

| # | Name | Kind | Lines | What it is | Target module | External deps | Touches | Purity |
|---|------|------|-------|------------|---------------|---------------|---------|--------|
| 82 | `bodyPosArr` | `const` Float32Array(NB*3) | 2856 | Per-frame body positions relative to the render origin | `render/passes/bodies` | `NB` (1598) | — | **mutable module state** |
| 83 | `dispSizes` | `const` Float32Array(NB) | 2857 | Display-scale sprite sizes from `BODIES[i][3]` | `render/passes/bodies` | `BODIES` (1573) | — | eval-alloc, then read-only |
| 84 | `realSizes` | `const` Float32Array(NB) | 2858 | True diameters in scene units from `BODIES[i][6]` | `render/passes/bodies` | `BODIES`, `AU2U` | — | eval-alloc, then read-only |
| 85 | `bodyCol` | `const` Float32Array(NB*3) | 2859 | Per-body colours; the Sun's (index 0) is rewritten each frame | `render/passes/bodies` | `NB` | — | **mutable module state** |
| 86 | *(anonymous statement)* | `BODIES.forEach(…)` | 2860 | Fills `bodyCol` from `BODIES[i][4]` | `render/passes/bodies` | `BODIES` | — | **eval (deterministic)** |
| 87 | `vaoBodies` | `const` | 2861 | Bodies VAO | `render/passes/bodies` | `gl` | **gl** | **eval** |
| 88 | `bufBodyPos` | `const` (WebGLBuffer) | 2862 | Dynamic position buffer (attrib 0) | `render/passes/bodies` | `gl` | **gl** | **eval** |
| 89 | *(anonymous statements)* | bare statements | 2863–2864 | Uploads `bodyPosArr` DYNAMIC_DRAW, binds attrib 0 | `render/passes/bodies` | `gl` | **gl** | **eval** |
| 90 | `bufBodySize` | `const` (WebGLBuffer) | 2865 | Size buffer (attrib 1); swapped between `dispSizes`/`realSizes` by `setBodySizes` (4496) | `render/passes/bodies` | `gl` | **gl** | **eval** |
| 91 | *(anonymous statements)* | bare statements | 2866–2867 | Uploads `dispSizes` STATIC_DRAW, binds attrib 1 | `render/passes/bodies` | `gl` | **gl** | **eval** |
| 92 | `bufBodyCol` | `const` (WebGLBuffer) | 2870 | Colour buffer (attrib 2), dynamic | `render/passes/bodies` | `gl` | **gl** | **eval** |
| 93 | *(anonymous statements)* | bare statements | 2871–2873 | Uploads `bodyCol` DYNAMIC_DRAW, binds attrib 2, unbinds the VAO | `render/passes/bodies` | `gl` | **gl** | **eval** |

Note: the body VAO's buffers are **not** registered in `vaoBufs` (1854); only the orbit rings at 2914 are. Whatever the VAO-disposal contract is, this slice half-honours it.

## 9. Trails and static orbit rings

| # | Name | Kind | Lines | What it is | Target module | External deps | Touches | Purity |
|---|------|------|-------|------------|---------------|---------------|---------|--------|
| 94 | `TRAIL_N` | `const` (2400) | 2876 | Samples in the sliding trail window | `render/trails` | — | — | pure const |
| 95 | `DT_SAMPLE` | `let` (0.01) | 2876 | Sample spacing in sim years, driven by the trail-length slider (3757) | `render/trails` | — | — | **mutable module state** |
| 96 | `trails` | `const` array of Float32Array | 2877 | One `TRAIL_N*3` position ring buffer per body | `render/trails` | — | — | **mutable module state** |
| 97 | `trailBufs` | `const` array of WebGLBuffer | 2877 | GPU buffer per body | `render/trails` | — | **gl** | **mutable module state** |
| 98 | `trailVaos` | `const` array of VAO | 2877 | VAO per body | `render/trails` | — | **gl** | **mutable module state** |
| 99 | *(anonymous loop)* | top-level `for` statement | 2878–2891 | Pre-samples every body's trail backwards from t=0 with `bodyPos`, allocates its buffer and VAO, pushes into 96–98 | `render/trails` | `NB` (1598), `bodyPos` (1625), `tmp` (1624), `gl` | **gl** | **eval, mutates `tmp`** |
| 100 | `RING_N` | `const` (96) | 2897 | Segments per closed heliocentric orbit ring | `render/trails` | — | — | pure const |
| 101 | `ringVaos` | `const` array | 2898 | One closed-orbit VAO per body; `null` at index 0 (the Sun) | `render/trails` | — | **gl** | **mutable module state** |
| 102 | *(anonymous block)* | bare block statement `{ … }` | 2899–2916 | Samples each body's orbit relative to the Sun over one period, uploads STATIC_DRAW, registers the buffer in `vaoBufs`, pushes the VAO | `render/trails` | `NB`, `BODIES` (1573), `bodyPos` (1625), `vaoBufs` (1854), `gl` | **gl** | **eval, mutates `vaoBufs`** |
| 103 | `psH` | `let` (true) | 2918 | "Helix/swept trails visible": derived from the trail-alpha slider (3749) | `render/state` | — | — | **mutable module state** |
| 104 | `psO` | `let` (true) | 2918 | "Orbit rings visible": derived from the orbit-alpha slider (3752) | `render/state` | — | — | **mutable module state** |
| 105 | `trailAnchor` | `const` Float64Array(3) | 2923 | Local origin the stored trail positions are relative to, so Float32 keeps precision | `render/trails` | — | — | **mutable module state** |
| 106 | `trailPos` | `function(i,ts,out)` | 2924–2928 | `bodyPos` minus `trailAnchor`, into `out` | `render/trails` | `bodyPos` (1625) | — | **reads `trailAnchor`**, writes caller's `out` |
| 107 | `pushTrail` | `function(i,ts)` | 2929–2934 | Shifts one body's trail buffer by one sample and appends the position at `ts` | `render/trails` | `tmp` (1624) | — | **mutates `trails[i]` and `tmp`** |

**Total top-level entries in the range: 107** (95 named declarations + 12 anonymous eval-time statement groups; `pKB`/`pOO`/`pAB`, `vaoABr`/`vaoABd`, the five `let`s on 2848, etc. counted individually).

---

## Mutable module-level state declared here that OTHER parts of the file mutate

| Symbol | Declared | Mutated at | Note |
|---|---|---|---|
| `earthTex` | 2713 | 2722 (inside `loadEarthMap`'s async callback) | Read at 5812–5813. Only mutated in-range, but **asynchronously**, after the first frames have already drawn. |
| `globePx` | 2848 | **5298** | Read at 5319, 5683, 5774, 5796, 5815, 5952, 5973. A frame-scope value with file-wide reach. |
| `moonPx` | 2848 | **5794, 5822** | Read at 5823, 5826, 5962. |
| `earthDbg` | 2848 | **5802** | Never read anywhere in the file — "read by the debug tooling" externally. In a module build it stops being reachable from outside unless deliberately exported/attached. |
| `camSunDist` | 2848 | **5382** | Read at 5297, 5300, 5866, 5867. |
| `avgLight` | 2848 | **5257** (`avgLight += (want-avgLight)*…`) | Read at 5808. It is an easing accumulator — its value depends on frame history, so its initialisation site must not move. |
| `psH` | 2918 | **3749** (trail-alpha slider handler) | Read at 5688, 5700, 5709. |
| `psO` | 2918 | **3752** (orbit-alpha slider handler) | Read at 5688. |
| `DT_SAMPLE` | 2876 | **3757** (trail-length slider handler) | Read at 3708, 3765, 4320, 4404, 4489, **5029** (`let simT=0, nextSample=DT_SAMPLE`), 5250, 5262, 5266, 5268, 5275, 5686, 6395. |
| `trailAnchor` | 2923 | **4479** (`refillTrails`) | Read at 5274, 5676, and by `trailPos` (2926). |
| `trails[i]` contents | 2877 | **4487–4492** (`refillTrails`), 5280 (upload) | Also mutated in-range by `pushTrail` (2931–2933). |
| `bodyPosArr` | 2856 | **5291** | Read at 5326, 5798, 5908, 5954, 5964. |
| `bodyCol` | 2859 | **5305** (the Sun's tint) | Uploaded at 5324. |
| `moonW` | 2771 | **5332, 5820** (via `moonPos`) | Read at 5334, 5821. |
| `moonRel` | 2771 | **5821** | Read at 5824, 5827, 5963. |
| `plateMats` | 2741 | **5814** (via `fillPlateMats`) | Uploaded in the same statement. |
| `vaoBufs` (external, 1854) | — | **2914**, from inside this range | This range writes into a WeakMap owned by an earlier slice. |
| `UG` (2708) | — | **2710**, in-range | The object is completed by a second statement; anything that reads `UG.uPlate` before 2710 gets `undefined`. |
| `tmp` (external, 1624) | — | 2881, 2932 in-range; and by many other slices | Shared scratch Float64Array — a classic aliasing trap if module splits reorder who writes it between reads. |

Additionally, `earthPhi0` (2788) is mutated only from `earthPrime` (2796), but it is a **lazy, first-call-wins cache** that reads `org` (5055) at the moment of that first call. Its value therefore depends on when it is first called, not just on its arguments.

---

## Randomness consumed at evaluation time (not inside a function)

Every RNG site in this range runs at module evaluation. There are **no** functions in this range that consume randomness. Ordering constraints, in the exact order the file consumes them:

1. **Lines 2460–2475** — asteroid belt, `AB_N = 1500` iterations. Per iteration the draw count is **variable**: the `for(;;)` rejection loop at 2464–2467 draws `Math.random()` for the radius, then up to 3 more `Math.random()` calls (one per Kirkwood gap, only when `|r−g| < 0.045`), and retries on rejection. Then 2468 one draw for the angle, 2471 two `gauss()` calls (each consuming **at least** 2 `Math.random()` calls, more when a draw is exactly 0), 2472 one draw for the size. **Any change to the number or order of draws anywhere before or inside this block moves every subsequent particle**, including the Kuiper belt and the Oort cloud.
2. **Lines 2478–2483** — Kuiper belt, `KB_N = 1600` iterations. Per iteration: one draw for the branch (2480), then 1 draw + 1 `gauss()` (classical) or 1 draw + 1 `gauss()` (scattered), then 1 draw for the angle and 1 for the size (2482). Branch-dependent draw counts again.
3. **Lines 2486–2491** — Oort cloud, `OO_N = 2400` iterations, 4 draws each (radius, theta, the `acos` argument, size).

Consequences for the refactor:

- These three blocks must remain **one evaluation unit, in this order**, and must keep their position in the global RNG stream relative to every other eval-time RNG consumer in the file (starfield, galaxy, andromeda in earlier slices; anything after 2935). Splitting them into three ES modules whose evaluation order the bundler decides would silently reorder the stream and break screenshot parity.
- The stated `scene/*` contract ("takes an Rng, returns typed arrays") is the right shape, but the **call order in `main.ts` is the actual load-bearing contract**, not the module boundaries.
- `gauss()` (1649) is a *rejection* generator: `while(!u) u = Math.random()`. Its consumption count is not fixed. Any wrapper that memoises, pre-draws, or batches it changes the stream.
- Line 2564 (`ringCS`) and lines 2878–2891 / 2899–2916 (trail and orbit-ring pre-sampling) are eval-time but **deterministic**; they consume no randomness and can move freely with respect to the RNG stream (they still have the `gl` and `bodyPos` ordering constraints below).

---

## Boot-order hazards

1. **`earthPrime` (2789) reads `org`, declared at 5055 as a `const`** — 2266 lines later, in a different slice. It is a genuine TDZ: any call to `earthPrime` before line 5055 has evaluated throws `ReferenceError: Cannot access 'org' before initialization`. Today it is reached only from `spinFrame` (3830) and the draw at 5801, and `spinFrame`'s only boot-adjacent caller is the `toggle($('tSpinLock'), …)` listener at 3831 — and `toggle` (3773) *only registers* a listener, it does not invoke. **If a refactor ever makes `toggle` fire its callback once with the restored state, or if the settings restore path calls `spinFrame` during boot, this dies at boot.** In a module world, `render/state`'s `org` must be initialised before any `astro/earth` call, which reverses the natural dependency direction (`astro/*` is supposed to be pure — `org` is the one leak).
2. **`earthPrime` also reads `simT`** indirectly via its callers, and `simT` is `let simT=0, nextSample=DT_SAMPLE` at **5029** — that initialiser reads `DT_SAMPLE` from **2876**. So `render/trails` must evaluate before the frame-loop state module. Reverse the two and `nextSample` is `undefined` (or TDZ), and the trail sampler never fires.
3. **The ring pass is split across 280 lines**: `RING_VS`/`RING_FS`/`pRing` at 2565–2572, but `UR` and `vaoRing` at 2849–2853, with the entire globe section wedged between. `UR` at 2849 reads `pRing` (2572); `vaoRing` at 2851 reads `ringCS` (2563). Merging these into one `render/passes/rings` module is safe for behaviour but changes *when* the `gl.createBuffer`/`bufferData` calls happen relative to the globe program's compilation. GL object creation order is not observable in the rendered image, but shader **compile/link order** affects first-frame timing on some drivers — worth a note, not a blocker.
4. **`UG` is incomplete between 2709 and 2710.** The loop at 2708–2709 cannot express `uPlate[0]`, so `UG.uPlate` is patched in as a separate statement. Any reordering that reads `UG` between those two lines (or a module that exports `UG` and is imported before 2710 runs) sees `uPlate === undefined`, and `gl.uniformMatrix3fv(undefined, …)` silently does nothing — the plates freeze at identity, an invisible-in-a-parse-check pixel change.
5. **`loadEarthMap()` at 2725 is a top-level async fetch.** `earthTex` is `null` for the first N frames, and the globe shader takes the `uHasMap = 0` noise branch until the texture lands (5813). **Screenshot parity depends on whether the map has loaded when the shot is taken.** This is a race the refactor must not perturb: keep the call at the same point in the boot sequence, and if the harness waits on anything, it must wait on this.
6. **Both eval-time GL setup blocks assume a bound-VAO discipline** (`bindVertexArray(vao)` … `bindVertexArray(null)`) and share `bufAbSz`/`bufAbP` across two VAOs (2549–2550). If `beltVAO` (2543) were hoisted into a module that evaluates before 2541–2542, `bufAbSz`/`bufAbP` are `const` and in TDZ → boot death. `beltVAO` is a hoisted `function` declaration, so it is *callable* before its dependencies exist; the two call sites at 2553 happen to be after. **Hoisted function declarations that close over later `const`s are the exact shape of the three boot deaths already suffered** — the same pattern also holds for `trailPos` (2924, closes over `trailAnchor` at 2923 — safe by one line) and `pushTrail` (2929, closes over `trails` at 2877 and `TRAIL_N` at 2876).
7. **The trail pre-fill at 2878–2891 stores absolute positions, but `pushTrail`/`trailPos` store anchor-relative ones.** It works only because `trailAnchor` (2923) is all zeros at boot and `refillTrails` (4477) rewrites everything before the anchor first moves. It also *cannot* call `trailPos` at 2881, because `trailAnchor` is declared 32 lines below it (TDZ). Anyone "cleaning this up" by calling `trailPos` in the pre-fill loop kills the page at boot.
8. **The orbit-ring block at 2899–2916 calls `bodyPos(0, ts, s0)` and `bodyPos(i, ts, q)`** at eval time; it depends on `BODIES` (1573) and `PHASE` (1602) being fully built. Any `astro/bodies` module that defers its own construction (e.g. lazily on first access) changes what is baked into these static VAOs.
9. **`gl` (1189) and `prog` (1197) must exist before this slice evaluates.** Lines 2529, 2530–2533, 2541–2559, 2572, 2707–2710, 2762, 2849–2853, 2861–2873, 2885–2890, 2910–2914 all touch `gl` at evaluation time. This whole slice is unusable in a non-DOM/non-GL context — the `scene/belts` and `astro/earth` extractions are exactly the parts that break that coupling and should be lifted out first.
10. **The error-log collector at the top of the file must still be the first thing evaluated.** Every eval-time GL call in this slice (program link failures in `prog`, `getUniformLocation` on a failed program) can throw or warn during boot; if a bundler hoists any of these modules above the collector's registration, a boot failure here becomes invisible.
11. **No DOM element ids are touched in this range** — no `$()`, `getElementById`, `addEventListener`, `localStorage`, or Web Audio. The `earth-map.webp` fetch (2715) is the only external resource. That makes this slice the *least* exposed to the moved-element-id class of failure, and the *most* exposed to the RNG-order class.
