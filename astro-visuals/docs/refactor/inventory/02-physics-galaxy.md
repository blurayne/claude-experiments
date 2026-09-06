# Inventory 02 — physics, starfield, procedural galaxy

Source: `galactic-transit.html`, lines **1536–1882** (inclusive). Slice boundary is exactly the range given; nothing outside it is inventoried, but symbols read from outside are listed as cross-slice reads.

Scope summary: 86 named top-level bindings + 2 anonymous eval-time statements = **88 inventory rows**.

Legend for the "touches" column: `-` = none of DOM / gl / Math.random / localStorage / Web Audio / window|document events.

Legend for purity:
- `pure` = pure function (no reads of mutable module state, no side effects)
- `pure-const` = immutable data literal, no side effect beyond its own initialization
- `reads` = reads mutable module state
- `mutates` = mutates mutable module state
- `eval-side-effect` = performs work at module-evaluation time

---

## A. Physics constants and body table (1536–1640)

| # | name | kind | lines | what it is | target module | external deps (not declared in 1536–1882) | touches | purity |
|---|------|------|-------|------------|---------------|--------------------------------------------|---------|--------|
| 1 | `R_GAL` | const | 1537 | Sun's galactocentric distance in scene units (900) | `astro/constants` | – | - | pure-const |
| 2 | `V_GAL` | const | 1538 | orbital speed, scene units per Earth year; note it hardcodes `900` instead of referencing `R_GAL` | `astro/constants` | – | - | pure-const |
| 3 | `GAL_PERIOD` | const | 1539 | derived galactic-year length in sim years | `astro/constants` | – | - | pure-const |
| 4 | `YR_PER_SIM` | const | 1540 | real years per simulated year (~1.19e6) | `astro/constants` | – | - | pure-const |
| 5 | `AGE0` | const | 1541 | solar-system age in Gyr at `simT = 0` (4.568) | `astro/constants` | – | - | pure-const |
| 6 | `AND_AGE` | const | 1542 | Gyr of Andromeda's first passage (9.07) — **dead binding: zero other references in the file** | `astro/constants` | – | - | pure-const |
| 7 | `SCATTER_AGE` | const | 1547 | Gyr of the second passage, where the merger scatter begins (11.45) | `astro/merger` | – | - | pure-const |
| 8 | `SR_A`, `SR_B`, `SR_K` | const (3 bindings, one stmt) | 1548 | coefficients of the sunR scatter curve | `astro/merger` | – | - | pure-const |
| 9 | `sunR` | function | 1549–1553 | Sun's galactocentric radius at sim time `ts` | `astro/sun` | – | - | pure |
| 10 | `sunPhase` | function | 1560–1566 | integrated galactic anomaly of the Sun at `ts` (flat rotation curve, so the laps lengthen) | `astro/sun` | – | - | pure |
| 11 | `TILT` | const | 1568 | ecliptic/galactic-plane tilt, 60.2° in radians | `astro/constants` | – | - | pure-const |
| 12 | `E1` | const | 1569 | ecliptic basis vector 1, `[1,0,0]` | `astro/constants` | – | - | pure-const |
| 13 | `E2` | const | 1570 | ecliptic basis vector 2, depends on `TILT` | `astro/constants` | – | - | pure-const |
| 14 | `BODIES` | const | 1573–1592 | 15-row body table: name, period yr, display radius, sprite size, RGB, semi-major axis AU, real radius km | `astro/bodies` | – | - | pure-const |
| 15 | `AU2U` | const | 1594 | scene units per AU at real scale, `1/(63241*30)` | `astro/constants` | – | - | pure-const |
| 16 | `OO_REAL` | const | 1595 | real-mode Oort-shell scale factor (3.0e-4) | `astro/constants` | – | - | pure-const |
| 17 | `realMode` | let | 1596 | global true-proportions flag; initialised `true` and, as shipped, **never reassigned anywhere** | `render/state` | – | - | mutable module state (read-only in practice) |
| 18 | `curD` | let | 1597 | currently active galaxy density multiplier | `render/state` | – | - | mutable module state |
| 19 | `NB` | const | 1598 | `BODIES.length` | `astro/bodies` | – | - | pure-const |
| 20 | `N_PLANETS` | const | 1599 | 9 = Sun + 8 planets; dwarfs follow | `astro/bodies` | – | - | pure-const |
| 21 | `I_P9` | const | 1600 | index of the hypothetical Planet 9 (`NB-1`) | `astro/bodies` | – | - | pure-const |
| 22 | `showP9` | let | 1601 | UI toggle: draw Planet 9 or not | `render/state` | – | - | mutable module state |
| 23 | `PHASE` | const | 1602 | per-body golden-angle starting phase, `BODIES.map` | `astro/bodies` | – | - | pure-const (derived at eval time, deterministic) |
| 24 | `EN` | const | 1605 | ecliptic normal vector | `astro/constants` | – | - | pure-const |
| 25 | `DTILT` | const | 1606–1608 | per-dwarf `[inclination°, node°]` map keyed by body name | `astro/bodies` | – | - | pure-const |
| 26 | `BU`, `BV` | const | 1609 | empty arrays, filled by row 27 — per-body orbital-plane basis vectors | `astro/bodies` | – | - | pure-const container, mutated at eval time by row 27 |
| 27 | *(anonymous)* `BODIES.forEach(...)` | bare statement | 1610–1618 | fills `BU`/`BV`: planets get `E1`/`E2`, dwarfs get a rotated+inclined basis from `DTILT` | `astro/bodies` | – | - | **eval-side-effect** (deterministic, no randomness) |
| 28 | `WOB_A`, `WOB_T` | const | 1622 | Sun's vertical bob amplitude (24 scene units) and period (90 Myr) | `astro/constants` | – | - | pure-const |
| 29 | `tmp`, `tmpSun`, `earthW` | const | 1624 | three shared `Float64Array(3)` scratch vectors, **reused across the whole file** | `astro/bodies` (or `render/state` — they are shared mutable scratch) | – | - | mutable module state (aliasing hazard) |
| 30 | `bodyPos` | function | 1625–1640 | writes body `i`'s world position at time `t` into `out`; Sun at `i===0` | `astro/bodies` | – | - | **reads** `realMode`; mutates its `out` argument |

## B. GL buffer helpers + starfield (1642–1666)

| # | name | kind | lines | what it is | target module | external deps | touches | purity |
|---|------|------|-------|------------|---------------|---------------|---------|--------|
| 31 | `makeBuf` | function | 1643–1648 | creates+fills a STATIC_DRAW array buffer. **Dead: never called anywhere in the file.** Its `loc`/`comps` params are unused | `gpu/buffers` | `gl` (1189) | gl | side effect when called (never is) |
| 32 | `gauss` | function | 1649–1650 | Box–Muller standard normal | `core/rng` | – | **Math.random** | reads global RNG; consumes **2** `Math.random()` draws per call (more if a draw returns exactly 0) |
| 33 | `expR` | function | 1651–1654 | inverse-CDF sample of an exponential disk radius in `[a,b]` with scale `Rd` | `core/rng` (or `scene/galaxy`) | – | **Math.random** | consumes **1** draw per call |
| 34 | `N_STAR` | const | 1657 | 3200 distant background stars | `scene/starfield` | – | - | pure-const |
| 35 | `starPos`, `starSize`, `starCol` | **var**, declared inside a bare block | 1658 | the three starfield attribute arrays | `scene/starfield` | – | - | mutable; see hazard H1 |
| 36 | *(anonymous)* bare block `{ … }` | bare statement | 1658–1666 | generates the 3200-star sphere at r=7500: direction, size, and colour | `scene/starfield` | – | **Math.random** | **eval-side-effect + randomness at eval time** — see R1 |

## C. Galaxy shape constants (1667–1697)

| # | name | kind | lines | what it is | target module | external deps | touches | purity |
|---|------|------|-------|------------|---------------|---------------|---------|--------|
| 37 | `PITCH` | const | 1671 | `tan(12.5°)`, Milky Way arm pitch | `scene/galaxy` | – | - | pure-const |
| 38 | `BAR_L` | const | 1672 | bar half-length, 500 scene units | `scene/galaxy` | – | - | pure-const |
| 39 | `BAR_A` | const | 1673 | bar angle to the Sun–centre line, 28° | `scene/galaxy` | – | - | pure-const |
| 40 | `armAngle` | const (arrow fn) | 1675 | trailing log-spiral angle at radius `r` for arm offset `off` | `scene/galaxy` | – | - | pure |
| 41 | `ARMS` | const | 1676–1681 | four `[angleOffset, weight]` arm descriptors | `scene/galaxy` | – | - | pure-const |
| 42 | `sA`, `cA` | const | 1682 | `sin(BAR_A)`, `cos(BAR_A)` | `scene/galaxy` | – | - | pure-const |
| 43 | `N_GXY`, `NEB_N`, `DUST_N` | let (uninitialised) | 1683 | current point counts for galaxy stars / nebulae / dust | `render/state` | – | - | mutable module state; `undefined` until first `genGalaxy`/`genGalaxyMap` |
| 44 | `N_AND`, `vaoAnd` | let | 1684 | Andromeda star count and VAO — declared here on purpose because `setGalaxy` builds Andromeda too | `render/state` | – | - | mutable module state |
| 45 | `N_ANDN`, `N_ANDD`, `vaoAndNeb`, `vaoAndDust`, `m31Map` | let | 1685 | Andromeda nebula/dust counts, their VAOs, and the loaded M31 photographic map | `render/state` (`m31Map` → `scene/andromeda`) | – | - | mutable module state |
| 46 | `NEB_PINK`, `NEB_GLOW`, `AND_PINK`, `AND_GLOW` | let | 1690 | run lengths inside the nebula buffers, so the frame can draw haze before dust and HII+core after | `render/state` | – | - | mutable module state |
| 47 | `NUC0`, `NUC1`, `hideNucleus` | let | 1696 | index range of the nuclear-star run in the galaxy buffer, plus the flag that suppresses it from inside the disk | `render/state` | – | - | mutable module state |
| 48 | `gxyPos`, `gxySize`, `gxyCol`, `gxyWave`, `nebPos`, `nebSize`, `nebCol`, `dustPos`, `dustSize`, `dustStr` | let (10 bindings, one stmt) | 1697 | the CPU-side attribute arrays handed from a generator to `pointVAO`, then nulled to free memory | `scene/galaxy` (transfer buffers) | – | - | mutable module state; nulled at line 2048 |

## D. The procedural galaxy generator (1698–1849)

| # | name | kind | lines | what it is | target module | external deps | touches | purity |
|---|------|------|-------|------------|---------------|---------------|---------|--------|
| 49 | `genGalaxy` | function | 1698–1849 | builds the whole schematic Milky Way for density `D`: stars, nebulae, dust lanes. Fallback when `galaxy-map.webp` did not load | `scene/galaxy` | – | **Math.random** | **mutates** `N_GXY`, `NUC0`, `NUC1`, `gxy*`, `NEB_N`, `NEB_PINK`, `NEB_GLOW`, `neb*`, `DUST_N`, `dust*`. Reads `sA`, `cA`, `BAR_L`, `PITCH`, `ARMS`, `armAngle`, `gauss`, `expR` |

Internal structure of `genGalaxy`, for the extraction (all locals, none top-level):

| lines | sub-population | notes |
|-------|----------------|-------|
| 1699–1704 | sizing: `N_GXY = round(92000*D)`, `BS`, `SS`, `NBS`, `DS`; allocates the four star arrays | `NUC0 = NUC1 = 0` — this generator never produces a nuclear run |
| 1705–1766 | star loop, 8 exclusive branches by index threshold | thresholds `3200*D`, `12000*D`, `20500*D`, `22000*D`, `24600*D`, `28600*D`, `28600*D+80`, `42000*D`, else arms |
| 1707–1711 | nuclear bulge | `gauss()`×2, `Math.random()`×3 per star |
| 1712–1718 | boxy/peanut bar | `Math.random()`×3 + `gauss()`×2 + 2 more randoms |
| 1719–1723 | inter-arm thin disk | `expR(360,1780,283)` |
| 1724–1728 | thick disk | `expR(300,1600,220)` |
| 1729–1736 | Local (Orion) Spur | branch on `roll` with three outcomes; **variable draw count per branch** |
| 1737–1741 | old stellar halo | |
| 1742–1746 | ~80 globular clusters (fixed count, not `D`-scaled) | |
| 1747–1751 | faint extended outer disk | |
| 1752–1763 | the four arms | `ARMS[i%2]` / `ARMS[2+(i%2)]`, roll-dependent draw count |
| 1768–1807 | nebula pass: `NEB_N = round(2600*D)`, `NEB_PINK=0`, `NEB_GLOW=NEB_N` | inner `while(p<NEB_N)` emits puff clusters of `5 + (rand*4|0)` points, so the draw count per iteration is data-dependent |
| 1809–1848 | dust pass: `XD` (hi-fi extra dark clouds), `DUST_N`, `LANE_N`; three `while` loops — bar lanes, arm-edge streaks, Dunkelwolken | same variable-length puff pattern |

## E. VAO lifecycle helpers and eval-time construction (1851–1882)

| # | name | kind | lines | what it is | target module | external deps | touches | purity |
|---|------|------|-------|------------|---------------|---------------|---------|--------|
| 50 | `vaoBufs` | const | 1854 | `WeakMap<VAO, WebGLBuffer[]>`, so a density can actually be released | `gpu/buffers` | – | - | mutable module state (also written from line 2914, outside this slice) |
| 51 | `flushGxyCache` | function | 1858–1863 | drops every cached galaxy build, including the `{a, an, ad}` Andromeda bundle; must never throw mid-flush | `scene/cache` | `gxyCache` (declared at 1882, **below** this function) | gl (indirectly via `deleteVAO`) | **mutates** `gxyCache` |
| 52 | `deleteVAO` | function | 1864–1868 | deletes a VAO and every buffer registered for it in `vaoBufs` | `gpu/buffers` | `gl` (1189) | **gl** | mutates GL state |
| 53 | `pointVAO` | function | 1869–1879 | builds a point VAO from pos/size/col (+optional wave, vel) and registers its buffers in `vaoBufs`; leaves attribute locations 0..4 fixed | `gpu/buffers` | `gl` (1189) | **gl** | mutates GL state + `vaoBufs` |
| 54 | `vaoStars` | const | 1880 | the starfield VAO, **built by a top-level call at module-evaluation time** | `scene/starfield` | `gl` (1189) | **gl** | **eval-side-effect** — see H1, H2 |
| 55 | `vaoGxy`, `vaoNeb`, `vaoDust` | let | 1881 | the currently bound galaxy VAOs | `render/state` | – | - | mutable module state |
| 56 | `gxyCache` | const | 1882 | keyed cache of built galaxy densities, so toggling back is instant | `scene/cache` | – | - | mutable module state |

---

## F. Cross-slice reads (symbols this range reads but does not declare)

Only two symbols in the whole range come from outside it:

| symbol | declared at | read at | why |
|--------|-------------|---------|-----|
| `gl` | 1189 (`canvas.getContext('webgl2', …)`) | 1644–1646, 1866–1867, 1870–1878 | every buffer/VAO helper |
| `gxyCache` | 1882 — **inside this range but textually after its reader** | 1859, 1862 | `flushGxyCache` reaches forward; see H3 |

Everything else (`R_GAL`, `BODIES`, `gauss`, `ARMS`, …) resolves within the range. The `Math`, `Float32Array`, `Float64Array`, `WeakMap`, `Object` globals are the only other free names.

## G. Mutable module-level state declared here that OTHER parts of the file mutate

| symbol | declared | mutated outside this range at | reader sites of note |
|--------|----------|-------------------------------|----------------------|
| `curD` | 1597 | 2064 (`setGalaxy`) | 1930, 2357, and the life-cycle rates |
| `showP9` | 1601 | 3803 (`toggle($('tP9'), …)`) | label/draw code |
| `N_GXY` | 1683 | 1946 (`genGalaxyMap`), 2060 (`setGalaxy` cache restore) | frame draw |
| `NEB_N` | 1683 | 1991, 2060 | frame draw |
| `DUST_N` | 1683 | 2029, 2060 | frame draw |
| `N_AND` | 1684 | 2063, 2163, 2196 | frame draw |
| `vaoAnd` | 1684 | 2065 | frame draw |
| `N_ANDN`, `N_ANDD` | 1685 | 2063, 2163, 2242, 2273 | frame draw |
| `vaoAndNeb`, `vaoAndDust` | 1685 | 2065 | frame draw |
| `m31Map` | 1685 | 2355 (M31 map loader) | `genAndromedaMap` |
| `NEB_PINK`, `NEB_GLOW` | 1690 | 1992 (`genGalaxyMap`), 2047/2060-range cache restore | two-halves nebula draw |
| `AND_PINK`, `AND_GLOW` | 1690 | 2163, 2243 | two-halves nebula draw |
| `NUC0`, `NUC1` | 1696 | 1958 (`genGalaxyMap`) | 5570, gated by `hideNucleus` |
| `gxyPos`…`dustStr` (10) | 1697 | 1949–1950, 1993, 2030 (`genGalaxyMap` fills), **2048 (all ten set to `null`)** | 2044–2045 (`pointVAO` upload) |
| `vaoGxy`, `vaoNeb`, `vaoDust` | 1881 | 2064 | frame draw |
| `gxyCache` | 1882 | 2042–2059 (`setGalaxy` insert + LRU evict) | 1859 (`flushGxyCache`) |
| `vaoBufs` | 1854 | 2914 (`ringVaos` path calls `vaoBufs.set(vao,[b])` directly, bypassing `pointVAO`) | 1865 |
| `tmp`, `tmpSun`, `earthW` | 1624 | 2881, 2932, 4478, 4489, 5290, 5330, 5801 all write through them | shared scratch — aliasing across trails, frame, and label code |

Read-only from outside (declared mutable here but never reassigned outside): `realMode` (1596 — never reassigned anywhere; read at 3556, 3575, 4496, 5293, 5399, 5414, 5542, 5722–5771, 5847, 5849, 5957, 6008 and internally at 1629/1633), `hideNucleus` (1696 — read only at 5570).

## H. Boot-order / TDZ hazards

- **H1 — `var` inside a bare block (line 1658).** `starPos`, `starSize`, `starCol` are declared with `var` inside `{ … }` at 1658–1666. The block is cosmetic: `var` is script-scoped, so the bindings are hoisted out and are still live at line 1880 where `pointVAO(starPos, starSize, starCol)` reads them. Any mechanical conversion of the block to `const`/`let` — or moving the block into a module without also moving line 1880 — silently makes line 1880 read `undefined` and produces an empty starfield. This is exactly the class of failure a parse check does not catch.
- **H2 — top-level GL call at line 1880.** `const vaoStars = pointVAO(...)` executes at module-evaluation time and needs (a) `gl` from line 1189 already created, (b) the starfield block at 1658–1666 already run, (c) `vaoBufs` (1854) and `pointVAO` (1869) already initialised. `vaoBufs` is a `const` read from inside `pointVAO`'s body at line 1878 — if the buffers module ends up evaluated after the starfield module, this is a TDZ `ReferenceError` at boot, not a lazy failure.
- **H3 — forward reach from `flushGxyCache` (1858) to `gxyCache` (1882).** The function body references `gxyCache` 23 lines before its `const` declaration. Safe today only because the first call is at 1929/2356, well after evaluation. If `flushGxyCache` and `gxyCache` land in different modules and the cache module is evaluated later, the first flush throws a TDZ error inside a `.then()` — the exact place the comment at 1855–1857 says "must never throw mid-flush".
- **H4 — `deleteVAO` (1864) called from `flushGxyCache` (1860) before its declaration.** Currently a hoisted `function` declaration, so this works. Converting either to `const … = () =>` during extraction turns it into a TDZ error.
- **H5 — `N_GXY`, `NEB_N`, `DUST_N` are declared without initialisers (1683).** They stay `undefined` until the first `genGalaxy`/`genGalaxyMap`/`setGalaxy` runs at line 2365. Any code that reads them during evaluation — e.g. a frame started early, or a debug panel that formats them — reads `undefined`, not `0`.
- **H6 — `curD` is initialised to `1` at 1597 but `setGalaxy(1)` only runs at 2365.** Between 1597 and 2365 `curD` claims a density that has not been built. The map loader's `setGalaxy(curD)` at 1930 depends on that window having closed; the loader is async so it does, but only by timing.
- **H7 — cross-slice forward dependency of `genGalaxy` on nothing, but of `setGalaxy` on `genGalaxyMap`/`genGalaxy` (2043) and on `loadGaiaDeep` (see the load-order trap comment at 6158).** `genGalaxy` itself is self-contained inside this slice; the ordering trap is entirely in the caller. Keep `setGalaxy` in `main.ts` wiring, not in `scene/galaxy`.
- **H8 — `makeBuf` (1643) is dead.** It is never called; it also shadows nothing but duplicates the buffer path inside `pointVAO`. Deleting it would change no behaviour, but under the "no behaviour change" rule it should be carried across as-is (or noted for a separate cleanup commit) rather than silently dropped.
- **H9 — `AND_AGE` (1542) is dead.** Single occurrence in the file. Same treatment as H8.
- **H10 — shared scratch aliasing (1624).** `tmp` is written by `trailPos`/`bodyPos` at 2881, 2932, 4489, 5290, 5801. If the astro module gets its own copy of `tmp` while the render module keeps another, nothing throws — but any code that relied on reading `tmp` after a call in a different module now reads stale data. These three arrays must remain single instances.
- **H11 — `V_GAL` hardcodes `900` (1538) rather than referencing `R_GAL` (1537).** Splitting the two into different constant modules is safe today because the numbers agree, but the coupling is invisible.

## I. Randomness consumed at evaluation time (parity-critical)

**One site, and it is the first randomness the whole program consumes.** There is no `Math.random()` call anywhere before line 1536.

| lines | what | draws |
|-------|------|-------|
| 1658–1666 | the starfield block | exactly **6 `Math.random()` calls per star × 3200 stars = 19 200 draws**, in this per-star order: `th` (1660), `2*Math.random()-1` for `ph` (1660), `starSize` (1662), `w` (1663), `warm` (1663), blue channel (1664) |

Consequences for the screenshot-parity gate:

- This block **must remain the first consumer of the seeded PRNG**, and its 19 200 draws must stay in the same order. Any module that is evaluated before `scene/starfield` and that touches `Math.random()` at eval time shifts the entire downstream sequence — every galaxy star, every nebula puff, every dust cloud moves.
- The block also has to run **before** line 1880, since `vaoStars` uploads its arrays.
- `gauss` (1649) and `expR` (1651) are the only two randomness primitives declared here and both are pure functions — they consume nothing at eval time. `gauss` draws 2 per call (with a rejection loop on exactly-zero draws, so in principle more); `expR` draws 1.
- `genGalaxy` (1698) consumes a large but *data-dependent* number of draws: the Local Spur branch (1733), the arm branch (1759), the nebula puff loop (1797) and all three dust loops (1820, 1825, 1841) each branch on a roll before deciding how many further draws to make. It cannot be reordered or partially extracted; the sequence of branch decisions is the sequence of draws.
- `genGalaxy` is nonetheless *only* reached when `galaxy-map.webp` fails to load (2043). The parity harness must pin which of the two generators runs, or the two paths consume different draw counts.

## J. Target-module assignment rollup

| target module | symbols from this slice |
|---------------|-------------------------|
| `astro/constants` | `R_GAL`, `V_GAL`, `GAL_PERIOD`, `YR_PER_SIM`, `AGE0`, `AND_AGE`, `TILT`, `E1`, `E2`, `EN`, `AU2U`, `OO_REAL`, `WOB_A`, `WOB_T` |
| `astro/merger` | `SCATTER_AGE`, `SR_A`, `SR_B`, `SR_K` |
| `astro/sun` | `sunR`, `sunPhase` |
| `astro/bodies` | `BODIES`, `NB`, `N_PLANETS`, `I_P9`, `PHASE`, `DTILT`, `BU`, `BV`, the `BODIES.forEach` at 1610–1618, `tmp`, `tmpSun`, `earthW`, `bodyPos` |
| `core/rng` | `gauss`, `expR` |
| `gpu/buffers` | `makeBuf`, `vaoBufs`, `deleteVAO`, `pointVAO` |
| `scene/starfield` | `N_STAR`, `starPos`, `starSize`, `starCol`, the block at 1658–1666, `vaoStars` |
| `scene/galaxy` | `PITCH`, `BAR_L`, `BAR_A`, `armAngle`, `ARMS`, `sA`, `cA`, `genGalaxy`, and the ten transfer arrays `gxyPos`…`dustStr` |
| `scene/cache` | `flushGxyCache`, `gxyCache` |
| `scene/andromeda` | `m31Map` |
| `render/state` | `realMode`, `curD`, `showP9`, `N_GXY`, `NEB_N`, `DUST_N`, `N_AND`, `vaoAnd`, `N_ANDN`, `N_ANDD`, `vaoAndNeb`, `vaoAndDust`, `NEB_PINK`, `NEB_GLOW`, `AND_PINK`, `AND_GLOW`, `NUC0`, `NUC1`, `hideNucleus`, `vaoGxy`, `vaoNeb`, `vaoDust` |

**Purity note against the agreed layout:** the `astro/*` modules assigned above are genuinely DOM-free, gl-free and `Math.random`-free — with one exception. `bodyPos` (1625) reads the mutable `realMode` flag, which the layout puts in `render/state`. Keeping `astro/bodies` pure requires `realMode` to be passed in or read through an injected accessor; taking the flag as an import from `render/state` creates an `astro → render` edge and a fresh evaluation-order dependency. Flagged, not resolved — this is an inventory.
