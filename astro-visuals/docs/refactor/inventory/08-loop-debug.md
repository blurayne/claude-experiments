# Slice 08 — main loop, Sun/PN passes, performance probe, boot tail, debug door, settings/log tabs

Source: `astro-visuals/galactic-transit.html`, lines **5023–6429** (end of `<script>`).
Rows below: **82** (57 named bindings + 25 bare/side-effect top-level statements).

Legend for the "touches" column: `DOM`, `gl`, `rnd` (Math.random, directly or through a dispatched handler), `LS` (localStorage), `audio` (Web Audio), `evt` (window/document/element event registration or dispatch), `net` (clipboard/navigator).

Purity vocabulary: `pure` | `reads` (reads mutable module state) | `mutates` (mutates mutable module state) | `eval-side-effect` (does work at module-evaluation time).

---

## 1. Symbol inventory

### 1.1 GL global state preamble

| # | name | kind | lines | what it is | target module | external deps | touches | purity |
|---|---|---|---|---|---|---|---|---|
| 1 | *(anonymous)* | bare statements ×4 | 5024–5027 | `gl.disable(DEPTH_TEST)`, `gl.enable(BLEND)`, `gl.blendFunc(ONE,ONE)`, `gl.clearColor(0.010,0.015,0.040,1)` — the additive blend regime every draw pass assumes | `gpu/context` (called from `main.ts`) | `gl` (1189) | gl | eval-side-effect |

### 1.2 Loop clocks and HUD pacing

| # | name | kind | lines | what it is | target module | external deps | touches | purity |
|---|---|---|---|---|---|---|---|---|
| 2 | `simT` | `let` | 5029 | the simulation clock in Earth years; **the single most widely read mutable in the file** | `render/state` | `DT_SAMPLE` (2876) | — | mutates |
| 3 | `nextSample` | `let` | 5029 | next trail-sample time on the sim clock | `render/state` | `DT_SAMPLE` (2876) | — | mutates |
| 4 | `last` | `let` | 5029 | wall-clock timestamp of the previous frame | `render/state` | `performance` | — | eval-side-effect (initialiser calls `performance.now()`) |
| 5 | `showFps` | `let` | 5030 | FPS readout enabled | `render/state` | — | — | mutates |
| 6 | `fpsFrames` | `let` | 5030 | frames counted since the last FPS print | `render/state` | — | — | mutates |
| 7 | `fpsSince` | `let` | 5030 | wall time of the last FPS print | `render/state` | `performance` | — | eval-side-effect (initialiser) |
| 8 | `hudHz` | `let` | 5031 | HUD refresh rate in Hz (debug slider `#hudHz`) | `render/state` | — | — | mutates |
| 9 | `lastHud` | `let` | 5031 | wall time of the last HUD update | `render/state` | — | — | mutates |
| 10 | `barHeld` | `let` | 5037 | the widest status-bar width currently held | `ui/hud` | — | — | mutates |
| 11 | `barNarrowSince` | `let` | 5037 | when the bar first measured narrower than `barHeld` | `ui/hud` | — | — | mutates |
| 12 | `holdBarWidth` | `function` | 5038–5048 | ratchets `#gamebar`'s `min-width`: grows at once, shrinks after 1 s narrow; forces one layout per HUD tick | `ui/hud` | `$` (3591), `#gamebar` | DOM | mutates |

### 1.3 Camera smoothing / rendering origin

| # | name | kind | lines | what it is | target module | external deps | touches | purity |
|---|---|---|---|---|---|---|---|---|
| 13 | `smoothTarget` | `const` (array, mutated) | 5049 | the camera's smoothed look-at target, world coords | `render/camera` | — | — | mutates |
| 14 | `firstFrame` | `let` | 5049 | first-frame flag: snaps the smoothing instead of easing | `render/camera` | — | — | mutates |
| 15 | `smoothOfs` | `const` (array, mutated) | 5054 | the decaying transition offset (never regrows from target motion) | `render/camera` | — | — | mutates |
| 16 | `reseedFollow` | `let` | 5054 | request to re-seed the follow offset on the next frame | `render/camera` | — | — | mutates |
| 17 | `org` | `const Float64Array(3)` | 5055 | the rendering origin — the Sun's world position in doubles, rewritten every frame | `render/state` | — | — | mutates |
| 18 | `sunSizeTmp` | `const Float32Array(1)` | 5056 | scratch upload buffer for the Sun's sprite size | `render/state` | — | — | mutates |
| 19 | `eatSizeTmp` | `const Float32Array(1)` | 5056 | scratch upload buffer for an inner planet's sprite size | `render/state` | — | — | mutates |
| 20 | `lastAgeSeen` | `let` | 5057 | previous frame's `ageGyr()`, to tell a running clock from a jump | `render/state` | `AGE0` (1541) | — | mutates |
| 21 | `pnShown` | `let` | 5058 | the planetary nebula was drawn this frame (the Sun label follows it) | `render/state` | — | — | mutates |

### 1.4 The Sun's procedural disc

| # | name | kind | lines | what it is | target module | external deps | touches | purity |
|---|---|---|---|---|---|---|---|---|
| 22 | `SUN_VS` | `const` (GLSL string) | 5064–5066 | one-point vertex shader: a single point at the origin at `uSz` pixels — shared with the PN pass | `shaders/sun.vert` | — | — | pure |
| 23 | `SUN_FS` | `const` (GLSL string) | 5067–5110 | photosphere fragment shader: limb-darkened fbm granulation, prominence arcs on a magnetic cycle, streaked corona | `shaders/sun.frag` | — | — | pure |
| 24 | `pSunP` | `const` (WebGLProgram) | 5111 | the compiled Sun-disc program | `render/passes/sun` | `prog` (1197), `gl` | gl | eval-side-effect |
| 25 | `USn` | `const` (object) | 5112–5117 | uniform locations for `pSunP` (`proj,view,time,sz,disc,colD,colB`) | `render/passes/sun` | `gl`, `pSunP` | gl | eval-side-effect |

### 1.5 What is left of the Sun (planetary nebula)

| # | name | kind | lines | what it is | target module | external deps | touches | purity |
|---|---|---|---|---|---|---|---|---|
| 26 | `PN_FS` | `const` (GLSL string) | 5124–5178 | planetary-nebula fragment shader: interacting-winds stages over `uAge`, [O III]/Hα shell, cometary knots, casting burst | `shaders/pn.frag` | — | — | pure |
| 27 | `pPN` | `const` (WebGLProgram) | 5179 | the compiled PN program (reuses `SUN_VS`) | `render/passes/pn` | `prog`, `gl`, `SUN_VS`, `PN_FS` | gl | eval-side-effect |
| 28 | `UPN` | `const` (object) | 5180–5184 | uniform locations for `pPN` (`proj,view,sz,time,age,alpha,burst`) | `render/passes/pn` | `gl`, `pPN` | gl | eval-side-effect |

### 1.6 Engulfment flares + the shared one-point VAO

| # | name | kind | lines | what it is | target module | external deps | touches | purity |
|---|---|---|---|---|---|---|---|---|
| 29 | `eatGL` | `const` (VAO bundle) | 5186 | dynamic 4-point VAO/buffers for the engulfment flares | `render/passes/eatflash` | `dynVAO` (3370), `gl` | gl | eval-side-effect |
| 30 | `eatPos` | `const Float32Array(12)` | 5187 | flare positions, Sun-relative | `render/passes/eatflash` | — | — | mutates |
| 31 | `eatSize` | `const Float32Array(4)` | 5187 | flare sprite sizes | `render/passes/eatflash` | — | — | mutates |
| 32 | `eatCol` | `const Float32Array(12)` | 5187 | flare colours | `render/passes/eatflash` | — | — | mutates |
| 33 | `eatW` | `const Float32Array(4)` | 5187 | flare wave attribute (always 0) | `render/passes/eatflash` | — | — | mutates |
| 34 | `vaoSunPt` | `const` (IIFE → VAO) | 5188–5192 | a one-vertex VAO used by both the Sun disc and the PN pass; **creates a buffer and leaves `bindVertexArray(null)`** | `gpu/buffers` (built in `render/passes/sun`) | `gl` | gl | eval-side-effect |
| 35 | `plasmaSunPx` | `let` | 5193 | the Sun's true disc diameter in device pixels this frame; the hand-over threshold between dot and disc | `render/state` | — | — | mutates |

### 1.7 First-launch performance probe

| # | name | kind | lines | what it is | target module | external deps | touches | purity |
|---|---|---|---|---|---|---|---|---|
| 36 | `probeFrames` | `let` | 5203 | frames since boot; `-1` once the probe has run or been skipped | `render/probe` | — | — | mutates |
| 37 | `probeInfo` | `let` | 5203 | the last probe's result object (debug reporting only) | `render/probe` | — | — | mutates |
| 38 | `perfProbe` | `function` | 5204–5228 | draws the galaxy point pass repeatedly into a hidden FBO of canvas size for ~30 ms, `gl.finish()` + 1-px `readPixels` per pass, returns `{ms,passes,points,px}` | `render/probe` | `gl`, `canvas` (1188), `pPt` (1357), `vaoGxy` (1881), `N_GXY` (1683), `performance` | gl | reads (and mutates GL state: viewport, clearColor, blend, program, VAO) |
| 39 | `pickDetail` | `const` (arrow) | 5231 | ms/pass → detail tier index (0/1/2) against an 11 ms budget | `render/probe` | — | — | pure |
| 40 | `runFirstLaunchProbe` | `function` | 5232–5241 | normalises the probe to the lowest tier's point count, sets `#detail` and **dispatches `input`** (→ `setGalaxy`, which consumes `Math.random`), caps `dprCap` and resizes on a slow fill, saves settings immediately, appends the result to `#buildStamp` | `render/probe` (wired from `main.ts`) | `dprCap` (4898), `resize` (4985), `DETAIL_NAMES` (4511), `DPR` (4898), `saveSettingsNow` (4202), `$`, `#detail`, `#buildStamp` | DOM, gl, rnd, evt, LS | mutates |

### 1.8 The frame

| # | name | kind | lines | what it is | target module | external deps | touches | purity |
|---|---|---|---|---|---|---|---|---|
| 41 | `frame` | `function` | 5243–6152 | **the whole render loop**: clock advance, trail sampling, body positions, Sun state/engulfment, camera build, every draw pass in order, tone-map resolve, DOM labels, HUD/panel updates, probe trigger, `requestAnimationFrame(frame)` | `render/frame` (composing `render/passes/*`) | see §1.8.1 | DOM, gl, evt (rAF) | mutates |

#### 1.8.1 `frame()`'s external reads (grouped; all declared outside this range unless noted)

- **clock / drive**: `shimT` 3191, `shuttle` 3702, `shuttleLastSign` 3702, `paused` 3658, `holding` 3509, `speed` 3660, `speedMult` 3677, `avgLight` 2848, `DT_SAMPLE` 2876, `refillTrails` 4477, `trailRefillAt` 3702, `lastAnchor` 3767, `trailAnchor`, `pushTrail` 2929, `trails`/`trailBufs` 2877, `NB` 1598, `lifeOn` 3083, `lifeStep` 3413.
- **bodies / astro**: `bodyPos` 1625, `tmp` 1624, `bodyPosArr` 2856, `bodyCol` 2859, `realSizes` 2858, `sunState` 3096, `sunTint` 3153, `ageGyr` 2942, `EAT_AGES` 3139, `wasEaten`/`eatFlash` 3140, `earthW` 1624, `moonPos` 2772, `moonW`/`moonRel` 2771, `MOON_BORN` 2768, `MOON_DIA` 2769, `moonDist` 2770, `MOON_M1`/`MOON_M2` 2767, `EARTH_AXIS` 2782, `earthPrime` 2789, `earthEra` 2805, `environment` 2976, `pnState` 3164, `g710` 3070, `updateAnd` 2442, `diskSpin` 2436, `mergeAt` 2428, `sunR` 1549, `sunPhase` 1560, `spinFrame` 3830, `fillPlateMats` 2747, `plateMats` 2741, `AGE0` 1541, `AU2U` 1594, `OO_REAL` 1595, `GAL_PERIOD` 1539, `V_GAL` 1538, `E1/E2/EN` 1569/1570/1605, `EARTH_ORBIT_RSUN` 3091, `BODIES` 1573, `I_P9`/`N_PLANETS` 1600/1599.
- **camera / view**: `cam` 3501, `coreLock` 3502, `spinLock` 3829, `camDirW` 3829, `followTarget` 3505, `panF` 3515, `andPos` 2441, `SKY_MIRROR`, `lookAt` 1168, `skyProjection` 4983ff, `projMat` 4898, `camSunDist`/`globePx`/`moonPx`/`earthDbg` 2848, `H`/`DPR`/`W` 4898, `mul` 1180, `vecV`/`norm3` 2846/2847.
- **gl objects**: `pPt`/`U` 1357/1358, `pTr` 1357, `pNeb`/`UN` 2081/2082, `pDust`/`UD` 2116/2123, `pSN`/`USN` 1458/1459, `pRem`/`UREM` 1528/1529, `pAB`/`UA`, `pKB`/`UK`, `pOO`/`UO` 2529–2532, `pRing`/`UR` 2572/2849, `pGlobe`/`UG` 2707/2708, `pTone`/`UT` 4950/4951, `hdrOK`/`hdrFB`/`hdrTex` 4954, `emptyVAO` 4952, `vaoStars` 1880, `vaoGxy`/`vaoNeb`/`vaoDust` 1881, `vaoAnd`/`vaoAndNeb`/`vaoAndDust` 1684/1685, `vaoGaia`/`vaoGaiaDeep` 3006/3042, `vaoBodies` 2861, `bufBodyPos/Size/Col` 2862–2870, `vaoGlobe` 2762, `vaoRing` 2850, `vaoKB`/`vaoOO`/`vaoABr`/`vaoABd`, `ringVaos` 2898, `trailVaos` 2877, `evGL`/`pfGL`/`snGL` 3383/3390, `g710GL` 4812, `earthTex` 2713, `M31_ROT` 2378, `MAT3_ID` 2361.
- **counts / tiers**: `N_STAR` 1657, `N_GXY`/`NEB_N`/`DUST_N` 1683, `NEB_PINK`/`NEB_GLOW`/`AND_PINK`/`AND_GLOW` 1690, `N_AND`/`N_ANDN`/`N_ANDD` 1684/1685, `N_GAIA`/`N_GAIA_DEEP` 3006/3042, `NUC0`/`NUC1`/`hideNucleus` 1696, `curD` 1597, `AB_N`/`KB_N`/`OO_N`/`RING_N`/`RING_SEGS`/`TRAIL_N`, `DUST_DEEP_CAP` 2122, `EV_CAP`-family arrays `evPos/evSize/evCol/evWave/evN`, `snPos/…/snN`, `pfPos/…`, `events`/`puffs` 3392, `fillEvents` 3446, `fillPuffs` 3488, `m31Map` 1685.
- **toggles**: `realMode` 1596, `gaiaOn` 3006, `varOn` 3191, `dustOn` 3821, `armsOn` 4745, `showTrails`/`showLabels`/`showStats` 3658, `showDwarfs`/`showBelt`/`showKuiper`/`showOort` 3659, `showP9` 1601, `psH`/`psO` 2918, `trailPct` 3754, `trailAlpha`/`orbitAlpha` 3746, `minBright`/`minSprite`/`starGain` 3730, `coreKnee` 3741, `liveCount` 4279, `lifeSupOn` 3945.
- **labels / HUD DOM**: `labelEls` 4725, `moonEl` 4729, `structEls` 4738, `STRUCTS` 4733, `armEls` 4754, `ARM_LBLS` 4746, `m31Els` 4765, `M31_LBLS` 4759, `mergedEl` 4771, `g710Lbl` 4814, `g710Pos/Size/Col` 4813, `placeLabel` 4782, `frameDt` 4781, `focusSunOpt` 3846, `layoutPanels` 4045, `setStateColour` 4847, `tempColour` 4829, `fmtYears` 4417, `fmtCount` 4434, `humanYear` 4442, `ratesIntegral` 2950, `lifeState` 3173, `$` 3591.
- **element ids read by `frame()`**: `gamebar`, `nDeath`, `nBirth`, `eSunPhaseRow`, `eSunSizeRow`, `eRangeRow`, `eCRRow`, `eSLRow`, `eLifeRow`, `env` (+ its `h2`), `eSun`, `eSunPhase`, `eSunSize`, `eMeanRow`, `eMean`, `eMin`, `eMax`, `eCR`, `eSL`, `eLife`, `iceBox`, `g710Box`, `eG710d`, `yrs`, `pct`, `fpsVal`, `sScale`, `gCal`, `gAge`, `lGyr`, `gGyr`. Plus `document.body.classList` toggles `ice` and `g710`.
- **forward reach inside `frame`**: `hadSaved` (line 6155, **after** `frame`'s body) at line 6150; `runFirstLaunchProbe` (5232) at 6150.

#### 1.8.2 Notable closures inside `frame` (not top-level, but each is a target module)

| name | lines | what it is | target module |
|---|---|---|---|
| `nebulaPass` | 5433–5478 | the nebula/haze/HII/core point pass, MW and/or M31, front-to-back selectable | `render/passes/nebula` |
| `dustPass` | 5479–5524 | the multiply-blended dust-lane pass, MW and/or M31 | `render/passes/dust` |
| `seg` | 5456–5460 | segment chooser inside `nebulaPass` (haze vs pink vs core ranges) | `render/passes/nebula` |
| `beltFade` | 5721 | fade a belt out while its ring is sub-resolution | `render/passes/belts` |
| `proj` | 5945–5946 | world → screen projection used by the label pass | `render/passes/labels` |

Draw order inside `frame` (the parity contract; do not reorder):
tone FBO bind (5390) → clear → points program (5394) → `updateAnd` (5397) → `g710()` (5398) → per-galaxy `nebulaPass(haze)`/`nebulaPass(core)`/`dustPass` front-to-back (5531) → stars (5533) → Gaia (5543) → galaxy (5569) → Andromeda (5579) → life events + supernovae (5599) → outside-disk core nebula (5639) → remnant puffs (5643) → trails/rings (5669) → asteroid belt (5725) → Kuiper (5741) → Oort + shell rings (5754) → bodies (5788) → Earth globe + Moon + Moon ring (5796) → Gliese 710 (5846) → planetary nebula (5865) → Sun disc (5883) → engulfment flares (5902) → tone resolve (5926) → labels (5943) → HUD block (6016) → probe trigger (6150) → `requestAnimationFrame` (6151).

### 1.9 Boot tail (execution order is load-bearing)

| # | name | kind | lines | what it is | target module | external deps | touches | purity |
|---|---|---|---|---|---|---|---|---|
| 42 | `hadSaved` | `const` (IIFE) | 6155 | whether this visitor has stored settings — decides how much the opening scenario may touch | `main.ts` | `SKEY` (4191), `localStorage` | LS | eval-side-effect |
| 43 | *(anon)* | bare call | 6156 | `restoreSettings()` — replays saved settings; its handlers reach for bindings declared all over the file, which is why it is called here | `main.ts` | `restoreSettings` (4221) | DOM, gl, rnd, LS, evt | eval-side-effect |
| 44 | *(anon)* | bare `if` | 6161 | first visit: `#detail = 1` and dispatch `input` → `setGalaxy(5)` → **regenerates the galaxy, consuming `Math.random`** | `main.ts` | `$`, `#detail` | DOM, gl, rnd, evt | eval-side-effect |
| 45 | *(anon)* | bare call | 6162 | `applyTrailWindow()` — sets `DT_SAMPLE` from the length slider and refills | `main.ts` | `applyTrailWindow` (3755) | gl | eval-side-effect |
| 46 | *(anon)* | assignment | 6166 | `keepSaved = hadSaved` — external `let` at 4292 | `main.ts` | `keepSaved` (4292) | — | eval-side-effect |
| 47 | *(anon)* | assignment | 6167 | `$('jump').value = 'helix'` | `main.ts` | `$`, `#jump` | DOM | eval-side-effect |
| 48 | *(anon)* | bare call | 6168 | `$('jump').dispatchEvent(new Event('change'))` → `jumpToEpoch` (4293ff): sets `simT`, `nextSample`, camera, `refillTrails()` | `main.ts` | handler at 4409 | DOM, gl, evt | eval-side-effect |
| 49 | *(anon)* | assignment | 6169 | `keepSaved = false` | `main.ts` | `keepSaved` (4292) | — | eval-side-effect |
| 50 | *(anon)* | bare `try` | 6170 | first visit and no tour key → `setTimeout(showTour, 400)` | `main.ts` / `ui/tour` | `showTour` (4700), `TOURKEY` (4602), `localStorage` | LS, DOM | eval-side-effect |

### 1.10 QR encoder and overlay

| # | name | kind | lines | what it is | target module | external deps | touches | purity |
|---|---|---|---|---|---|---|---|---|
| 51 | `qrEncode` | `function` | 6175–6264 | self-contained QR: byte mode, EC level L, versions 1–40, GF(256) Reed–Solomon, matrix build, 8 masks scored by penalty; returns `{n, m, version, mask}` | `ui/qr` | `TextEncoder` | — | pure (its inner `mul` at 6202 shadows the global `mul` at 1180 — keep it local) |
| 52 | `QR_SCALES` | `const` | 6270 | `[1,2,4]` device pixels per module | `ui/qr` | — | — | pure |
| 53 | `qrLast` | `let` | 6270 | last payload drawn, so the code only redraws on a change | `ui/qr` | — | — | mutates |
| 54 | `qrPlace` | `function` | 6271–6276 | positions `#qrOverlay` from the stored free-space fractions `qrPos` | `ui/qr` | `$`, `qrPos` (4201), `innerWidth/innerHeight` | DOM | reads |
| 55 | `qrRedraw` | `function` | 6277–6293 | encodes `exportState()` minus `exported` and paints it to the 2D canvas; hides when debug is off | `ui/qr` | `debugMode` (6335, below), `exportState` (6379, below), `$`, `DPR` (4898), `qrHeld` (4201), `#qrOverlay`, `#qrOn`, `#qrScale` | DOM, LS (via `exportState`) | mutates |
| 56 | *(anon)* | listener | 6294 | `$('qrOn').change → qrRedraw(true)` | `ui/qr` | `#qrOn` | DOM, evt | eval-side-effect |
| 57 | *(anon)* | block statement | 6298–6322 | the QR drag block: block-scoped `cv, dx, dy, sx, sy, held, moved, lastTap`, an inner `record()` (6299–6305) and `drop` (6313–6320); pointerdown/move/up/cancel + a window `resize` listener; a double tap unchecks `#qrOn` | `ui/qr` | `$`, `qrPos`/`qrHeld` (4201), `saveSettings` (4217), `performance`, `innerWidth/innerHeight` | DOM, evt, LS | eval-side-effect |
| 58 | *(anon)* | listener | 6323 | `$('qrScale').input` → updates `#qrScalev`, `qrRedraw(true)` | `ui/qr` | `$`, `QR_SCALES` | DOM, evt | eval-side-effect |
| 59 | *(anon)* | timer | 6324 | `setInterval(()=> qrRedraw(false), 1000)` — the once-a-second refresh | `ui/qr` (started from `main.ts`) | `qrRedraw` | DOM, evt | eval-side-effect |

### 1.11 The debug door

| # | name | kind | lines | what it is | target module | external deps | touches | purity |
|---|---|---|---|---|---|---|---|---|
| 60 | `DBGKEY` | `const` | 6325 | `'galactic-transit.debug'` — the localStorage key; **already read/written at 3628–3637** | `ui/debug` | — | — | pure |
| 61 | `DEBUG` | `const` (IIFE) | 6326–6334 | resolves debug mode from `?debug=` (persisting it) or the stored flag | `ui/debug` | `location.search`, `localStorage`, `DBGKEY` | LS | eval-side-effect |
| 62 | `debugMode` | `let` | 6335 | is debug mode on now; **read by `qrRedraw` (6279) which is defined above it** | `ui/debug` | — | — | mutates |

### 1.12 Settings / log tabs

| # | name | kind | lines | what it is | target module | external deps | touches | purity |
|---|---|---|---|---|---|---|---|---|
| 63 | `esc` | `const` (arrow) | 6337 | HTML-escapes `&<>` | `core/errorlog` (or `core/dom`) | — | — | pure |
| 64 | `clock` | `const` (arrow) | 6338 | epoch ms → `HH:MM:SS` | `core/errorlog` | `Date` | — | pure |
| 65 | `renderLog` | `function` | 6339–6349 | counts and (when the tab is open) renders `errLog` into `#logList`; **the collector at 1113 calls it through a `typeof` guard** | `core/errorlog` + `ui/panels` | `errLog` (1106), `TOUCH_DEV` (1104), `BUILD` (1133), `$`, `#logCount`, `#logBody`, `#logNote`, `#logList` | DOM | reads |
| 66 | `setHudTab` | `function` | 6350–6355 | switches `#hudBody` / `#logBody`, marks the active `#hudTabs .tab`, re-renders and refits | `ui/panels` | `$`, `document.querySelectorAll`, `fitPanels` (4906) | DOM | mutates |
| 67 | *(anon)* | listener loop | 6356 | binds `click` on every `#hudTabs .tab` to `setHudTab(b.dataset.tab)` | `ui/panels` | `setHudTab` | DOM, evt | eval-side-effect |
| 68 | *(anon)* | listener | 6357 | `#logClear` → empties `errLog` in place, re-renders | `ui/panels` | `errLog` (1106) | DOM, evt | eval-side-effect |
| 69 | *(anon)* | listener | 6358–6362 | `#logCopy` → clipboard dump of build + UA + log, with a 1.2 s "copied" label | `ui/panels` | `errLog`, `BUILD`, `navigator` | DOM, evt, net | eval-side-effect |
| 70 | `setDebugUI` | `function` | 6363–6377 | shows/hides `#dbgBtn`, `#rowHudHz`, `#rowGain`, `#secDebugHead`, `#hudTabs`; picks the tab; folds the debug section on exit; auto-enables the QR on entry; **called from the ten-tap handler at 3628** | `ui/debug` | `debugMode` (6335), `$`, `secOpen` (4110), `applySecs` (4111), `setHudTab`, `qrRedraw`, `#qrOn` | DOM, evt | mutates |
| 71 | *(anon)* | bare `if` | 6378 | `if(DEBUG) setDebugUI(true, ?debug present)` — the boot-time debug entry | `main.ts` | `DEBUG`, `setDebugUI`, `location.search` | DOM, evt, LS | eval-side-effect |
| 72 | `exportState` | `function` | 6379–6390 | flushes settings to storage and returns `{app, version, exported, time{simT,paused}, camera{…,coreLock,dive}, viewport, settings}` | `ui/debug` | `saveSettingsNow` (4202), `SKEY` (4191), `BUILD` (1133), `simT` (5029), `paused` (3658), `cam` (3501), `coreLock` (3502), `#tDive` | DOM, LS | reads |
| 73 | `applyState` | `function` | 6391–6406 | imports a state object: writes `SKEY`, `restoreSettings(false)`, sets `simT`/`nextSample`, clears `events`/`puffs`, refills trails, clicks `#tPause`, restores the camera and re-seeds the follow | `ui/debug` | `SKEY`, `restoreSettings` (4221), `simT`/`nextSample` (5029), `DT_SAMPLE`, `events`/`puffs` (3392), `refillTrails` (4477), `paused`, `cam`, `coreLock`, `reseedFollow` (5054), `panF` (3515), `#tPause`, `#tDive` | DOM, LS, gl, rnd (via `restoreSettings`→`setGalaxy`) | mutates |
| 74 | `dbgSay` | `const` (arrow) | 6407 | writes a status line into `#dbgMsg` | `ui/dialogs` | `$` | DOM | side effect when called |
| 75 | *(anon)* | listener | 6408–6413 | `#dbgBtn` → open `#dbgCard` pre-filled with the current state | `ui/dialogs` | `exportState`, `dbgSay` | DOM, evt, LS | eval-side-effect |
| 76 | *(anon)* | listener | 6414 | `#dbgClose` → hide `#dbgCard` | `ui/dialogs` | `$` | DOM, evt | eval-side-effect |
| 77 | *(anon)* | listener | 6415–6416 | `#dbgExport` → re-serialise into `#dbgText` | `ui/dialogs` | `exportState`, `dbgSay` | DOM, evt, LS | eval-side-effect |
| 78 | *(anon)* | listener | 6417–6419 | `#dbgImport` → `applyState(JSON.parse(#dbgText))` | `ui/dialogs` | `applyState`, `dbgSay` | DOM, evt, LS, gl, rnd | eval-side-effect |
| 79 | *(anon)* | listener | 6420–6422 | `#dbgCopy` → `navigator.clipboard.writeText` | `ui/dialogs` | `dbgSay`, `navigator` | DOM, evt, net | eval-side-effect |
| 80 | *(anon)* | listener | 6423–6426 | `#dbgPaste` → `navigator.clipboard.readText` into `#dbgText` | `ui/dialogs` | `dbgSay`, `navigator` | DOM, evt, net | eval-side-effect |
| 81 | *(anon)* | bare call | 6427 | `fitPanels()` — the last layout before the first frame | `main.ts` | `fitPanels` (4906) | DOM | eval-side-effect |
| 82 | *(anon)* | bare call | 6428 | `requestAnimationFrame(frame)` — **the only place the loop is started** | `main.ts` | `frame` (5243) | evt | eval-side-effect |

---

## 2. Mutable module-level state declared here that OTHER parts of the file mutate

| symbol | line | who else writes it |
|---|---|---|
| `simT` | 5029 | 4319 (`jumpToEpoch`, "now"), 4325 (`jumpToEpoch`, an age), 6395 (`applyState`, in-range). Read at 2942 (`ageGyr`), 2950, 2977, 3071, 3830, 4404, 4450–4451, 4478, 4489. |
| `nextSample` | 5029 | 3708 (shuttle sign flip), 3765 (trail-length debounce), 4320, 4404 (`jumpToEpoch`), 6395 (`applyState`) |
| `showFps` | 5030 | 3944 (`toggle($('tFps'))`) |
| `hudHz` | 5031 | 3727 (`#hudHz` input handler) |
| `reseedFollow` | 5054 | 3862, 3869, 3878, 3886, 3896, 3901, 4336, 4348, 4362, 4374, 4409, 4476, 4499 — every camera scenario/toggle; and 6404 in-range |
| `debugMode` | 6335 | only `setDebugUI` (6364), which is itself called from 3628 (the ten-tap door) |
| `qrLast` | 6270 | in-range only (6279, 6283) |
| `probeFrames` / `probeInfo` | 5203 | in-range only |
| `org`, `smoothTarget`, `smoothOfs`, `firstFrame`, `lastAgeSeen`, `pnShown`, `plasmaSunPx`, `barHeld`, `barNarrowSince`, `last`, `fpsFrames`, `fpsSince`, `lastHud`, `sunSizeTmp`, `eatSizeTmp`, `eatPos/eatSize/eatCol/eatW` | 5037–5193 | in-range only (`frame`, `holdBarWidth`), but `org` is **read** outside at 2794 (`earthPrime`) — so it must stay a live shared binding, not a copy |

Conversely, this slice writes external mutable state: `keepSaved` (4292) at 6166/6169, `dprCap` (4898) at 5236, `curD` indirectly via `setGalaxy`, `camSunDist`/`globePx`/`moonPx`/`earthDbg`/`avgLight` (2848) throughout `frame`, `camDirW` (3829) at 5376, `projMat` (4898) at 5385, `frameDt` (4781) at 5942, `wasEaten`/`eatFlash` (3140) at 5313–5316, `moonRel` (2771) at 5821, `bodyPosArr`/`bodyCol` (2856/2859), `cam.dist` (3501) at 5346, `coreLock` (3502) at 6402, `panF` (3515) at 6404, `qrPos`/`qrHeld` (4201) at 6302/6306/6315, `errLog` (1106) truncated at 6357, `events`/`puffs` (3392) emptied at 6396.

---

## 3. Randomness consumed at evaluation time

There is **no direct `Math.random()` call anywhere in 5023–6429**. But three top-level statements reach code that does, so their relative order is part of the screenshot-parity contract:

1. **line 6156 — `restoreSettings()`**: replays saved toggles; at 4237 it may `$('detail').dispatchEvent(new Event('input'))`, whose handler (4512) calls `setGalaxy(DETAIL_D[i])` → `genGalaxy`/`genNebula`/`genDust`/`genAndromeda`, all heavy `Math.random` consumers (e.g. 1797, 1841). **Eval-time, conditional on stored settings.**
2. **line 6161 — `$('detail').value = 1; dispatchEvent('input')`** for a first-time visitor: unconditional `setGalaxy(5)` → the same generators. **Eval-time, unconditional on a fresh profile — this is the draw the parity screenshots see.**
3. **line 6168 — `$('jump').dispatchEvent(new Event('change'))`**: `jumpToEpoch` (4293ff) sets the clock and calls `refillTrails()`; scenario branches also touch density/toggles that can re-enter `setGalaxy`.

Additionally, **line 5238 inside `runFirstLaunchProbe`** dispatches `input` on `#detail`, re-generating the galaxy — but that runs on the **third rendered frame** (6150), i.e. after evaluation, and only when `hadSaved` is false. It is still a randomness consumer whose position in the global sequence is fixed by "frame 3", not by module order.

Non-random but equally order-sensitive eval-time work: `prog()` compiles at 5111 and 5179 (GL program ids), `dynVAO(4)` at 5186 and the VAO IIFE at 5188 allocate GL objects — GL object creation order changes nothing visually, but the **`gl.getUniformLocation` calls at 5112–5117 and 5180–5184 require their programs to exist first**, and `setGalaxy(1)` already ran at 2365, before this slice.

Also eval-time-but-not-random: `performance.now()` at 5029 and 5030, `localStorage.getItem` at 6155 and 6333, `location.search` at 6327, `new Date()` inside `exportState` (only at call time).

---

## 4. Boot-order / TDZ hazards

Ordered by how likely a bundler reorder is to kill the page.

1. **`frame` reaches forward to `hadSaved` (line 6150 → `const` at 6155).** `frame` is a hoisted function declaration; `hadSaved` is a TDZ `const`. Safe today only because `requestAnimationFrame(frame)` is at 6428. If `render/frame` is imported and started before `main.ts` evaluates the boot tail, line 6150 throws `ReferenceError: Cannot access 'hadSaved' before initialization` on frame 3 — a *delayed* boot death, invisible to a parse check. **Pass `hadSaved` in explicitly.**
2. **`qrRedraw` (6277) reads `debugMode` (`let`, 6335) and calls `exportState` (function, 6379) — both declared below it.** Safe today because the first call comes from the listener at 6294 / interval at 6324 / `setDebugUI` at 6378. Split `ui/qr` and `ui/debug` into modules with a cycle and the `let` becomes a live TDZ read.
3. **`DBGKEY` (`const`, 6325) is already used at 3628–3637** inside the ten-tap debug-door handler, and `setDebugUI` (6363) is called from 3628 too. Deferred by the handler today; a module split that evaluates the door handler eagerly, or that hoists the tap handler above `ui/debug`, is a TDZ death.
4. **`renderLog` (6339) is called from the error-log collector at line 1113**, guarded by `typeof renderLog === 'function'`. The guard is what keeps the collector alive before this slice evaluates. **`core/errorlog` must not import `ui/panels`;** invert it — let `ui/panels` register `renderLog` as a callback on the collector, and keep the `typeof`/null guard. The collector must still be the first thing that runs.
5. **`simT`, `nextSample`, `showFps`, `hudHz` are `let`s declared at 5029–5031 but referenced from ~2900–4500.** All those references are inside function bodies or listeners (`ageGyr` 2942, the shuttle handler 3708, the trail debounce 3765, `#hudHz` 3727, `toggle($('tFps'))` 3944, `jumpToEpoch` 4319–4325/4404, `refillTrails` 4478–4489), so nothing reads them at eval time today. Moving them to `render/state` and importing is the right fix, but **any eager call of those helpers during module evaluation becomes a TDZ error.** In particular `restoreSettings()` at 6156 replays toggles: it must stay *after* `render/state` is initialised.
6. **`restoreSettings()` at 6156 is documented (4219–4220) as depending on "state declared further down the file".** It is the single hardest ordering constraint in the file: it must run after every label element, the sim clock, and the galaxy builders exist, and before 6161/6168. Preserve 6155→6156→6161→6162→6166→6167→6168→6169→6170 verbatim in `main.ts`.
7. **`setGalaxy(1)` at 2365 is deliberately the "lowest" tier**, with the real tier applied at 6161/6156 (comment at 6157–6160): `setGalaxy(D>=5)` reaches `loadGaiaDeep()`, which touches a `let` declared later. This is an existing, acknowledged TDZ trap — the two-phase build must be kept as two phases.
8. **`setDebugUI` at 6378 runs before `exportState`/`applyState` are used but calls `qrRedraw` → `exportState` (6379, hoisted function).** Fine as a function declaration; **breaks if `exportState` is converted to a `const` arrow** during extraction.
9. **`vaoSunPt`'s IIFE (5188–5192) leaves the ARRAY_BUFFER binding non-null and unbinds the VAO.** Any pass extracted between it and the first `frame()` that assumes a clean binding will silently draw from the wrong buffer. Same shape for `dynVAO(4)` at 5186.
10. **`perfProbe` (5204) mutates global GL state** — viewport, clearColor, blend func, current program, bound VAO — and only restores viewport and the framebuffer/VAO binding. It relies on running *between* frames (frame 3, line 6150) so the next `frame()` re-sets everything. Extracting it to `render/probe` must keep that "called from inside the loop, after a full frame" position.
11. **`runFirstLaunchProbe` (5232) calls `resize()` (4985) and `saveSettingsNow()` (4202)** and dispatches a DOM `input` — a three-way dependency between `render/probe`, `gpu/context` and `ui/settings`. Do not let this become an import cycle that pulls `ui/settings` above `core/errorlog`.
12. **Element-id coupling.** All 61 ids this slice touches were verified present in the document today: `gamebar, detail, buildStamp, nDeath, nBirth, eSunPhaseRow, eSunSizeRow, eRangeRow, eCRRow, eSLRow, eLifeRow, env, eSun, eSunPhase, eSunSize, eMeanRow, eMean, eMin, eMax, eCR, eSL, eLife, iceBox, g710Box, eG710d, yrs, pct, fpsVal, sScale, gCal, gAge, lGyr, gGyr, jump, qrOverlay, qrOn, qrScale, qrScalev, hudBody, logBody, hudTabs, logCount, logNote, logList, logClear, logCopy, dbgBtn, rowHudHz, rowGain, secDebugHead, dbgCard, dbgText, dbgMsg, dbgClose, dbgExport, dbgImport, dbgCopy, dbgPaste, tDive, tPause`, plus the selector `#hudTabs .tab` (6353, 6356) and `#env h2` (6054). Every one of these is a bare `$()` with **no null check**; `$('detail')` and `$('jump')` in the boot tail run at evaluation time, so a renamed or moved id there kills the page before the first frame.
13. **`focusSunOpt` (3846) is captured as `$('focusSel').options[0]`** and written at 6051. If the `<select>`'s option order or the panel markup moves, this writes the wrong option — a silent, non-throwing regression.
14. **`qrEncode`'s inner `const mul` (6202) shadows the global `mul` (1180, the 4×4 matrix multiply).** Extracting `ui/qr` must keep `mul` local; a stray import of the matrix `mul` at module scope would be shadowed correctly, but hoisting the GF(256) `mul` out would break the label pass at 5944.
15. **`setInterval(qrRedraw, 1000)` at 6324 starts before `debugMode` (6335) exists.** Harmless today (the first tick is 1 s away), but if a module split makes the interval fire synchronously in a test harness it reads a TDZ binding.
16. **The `restoreSettings()`/`#detail` dispatch chain reallocates every galaxy VAO.** `frame` captures nothing (it re-reads `vaoGxy` etc. each call), so this is safe — but any extraction that caches a VAO in a module-level `const` at import time would freeze a stale, pre-`setGalaxy` handle.
