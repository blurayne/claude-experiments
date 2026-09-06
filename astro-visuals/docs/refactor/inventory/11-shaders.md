# Slice 11 — GLSL shader sources, programs, and uniform-location tables

Source of record: `galactic-transit.html` (6431 lines, single inline `<script>` starting at line 1095). All line numbers below are 1-indexed against that file as it stands today.

23 GLSL template literals, 14 linked programs, 13 JS-side uniform-location objects. Every shader is a **plain, un-interpolated** template literal — verified mechanically: no `${` occurs inside any of the 23 literals, and no shader string is built by `+`, `.join`, `.replace`, or a preprocessor step. There are **no `#define` directives anywhere** in any shader. That means the extraction to `.glsl` files can be a byte-for-byte copy with no build-time string machinery.

---

## 1. The compile/link helpers

| symbol | lines | notes |
| --- | --- | --- |
| `sh(type, src)` | 1192–1196 | `createShader` / `shaderSource` / `compileShader`; **throws** on `!COMPILE_STATUS` |
| `prog(vs, fs)` | 1197–1203 | `createProgram`, attaches a freshly compiled VS and FS, links; **throws** on `!LINK_STATUS` |

`prog()` compiles a **new** shader object on every call. `PT_VS` is therefore compiled three times, `BELT_FS` three times, `SUN_VS` twice. Introducing a compile cache would be a behaviour-neutral optimisation on paper, but it changes the GL object graph and the order of `createShader` ids; for a pure structural move, keep the naive re-compile.

`gl` is created at 1188–1190 and the module aborts with `throw new Error('no webgl2')` if WebGL2 is missing. Everything in this slice runs at module-evaluation time strictly after that point.

---

## 2. Shader inventory

Proposed layout: one file per literal under `src/shaders/`, named `<subject>.vert.glsl` / `<subject>.frag.glsl`. Loader: a `?raw`-style import (Vite `import x from './x.vert.glsl?raw'`) so the string reaching `sh()` is byte-identical to today's literal. **Do not** run the `.glsl` files through a formatter, a minifier, or a `#include` expander — several shaders contain duplicated helper bodies (see §5) whose float literals must not be reformatted.

### 2.1 `PT_VS` — vertex — lines 1206–1322 → `src/shaders/points.vert.glsl`

The workhorse. Star/galaxy/body point sprites, plus (by reuse) the nebula and dust passes.

- attributes: `0 vec3 aPos`, `1 float aSize`, `2 vec3 aColor`, `3 float aWave`, `4 vec3 aVel`
- uniforms (22): `float uVelT`; `mat4 uProj, uView`; `float uPx`; `float uSpin`; `float uWarp`; `vec3 uSunPos`; `float uCap`; `float uWaveAll`; `float uTime`; `float uVarMode`; `vec3 uAnd`; `float uTide`; `float uWarpAmp`; `float uMinB`; `float uMinSz`; `float uFadeOut`; `vec3 uOrg`; `float uGal`; `mat3 uGRot`; `vec3 uGOff`; `float uMerge`
- varyings out: `vec3 vColor`
- no precision qualifier (vertex stage defaults to `highp`); no `#define`
- paired by: `prog(PT_VS, PT_FS)` @1357 → `pPt`; `prog(PT_VS, NEB_FS)` @2081 → `pNeb`; `prog(PT_VS, DUST_FS)` @2116 → `pDust`

### 2.2 `PT_FS` — fragment — lines 1326–1339 → `src/shaders/points.frag.glsl`

- `precision mediump float;`
- in `vec3 vColor`; out `vec4 o`; no uniforms, no attributes
- paired by: `prog(PT_VS, PT_FS)` @1357 → `pPt`

### 2.3 `TR_VS` — vertex — lines 1342–1351 → `src/shaders/trail.vert.glsl`

- attributes: `0 vec3 aPos`
- uniforms: `mat4 uProj, uView`; `float uLen`; `vec3 uOrg`
- out `float vF` (uses `gl_VertexID`)
- paired by: `prog(TR_VS, TR_FS)` @1357 → `pTr`

### 2.4 `TR_FS` — fragment — lines 1352–1355 → `src/shaders/trail.frag.glsl`

- `precision mediump float;`
- in `float vF`; uniforms `vec3 uColor`, `float uAlpha`, `float uFlat`; out `vec4 o`
- paired by: `prog(TR_VS, TR_FS)` @1357 → `pTr`

### 2.5 `SN_VS` — vertex — lines 1382–1409 → `src/shaders/supernova.vert.glsl`

Deliberate copy of `PT_VS`'s wave-riding branch (see the comment at 1376–1381: copied, not shared, on purpose). Do not "deduplicate" it with `PT_VS`.

- attributes: `0 vec3 aPos`, `1 float aSize`, `2 vec3 aColor`, `3 float aPhase`
- uniforms: `mat4 uProj, uView`; `float uPx, uSpin, uWarp, uCap`; `vec3 uSunPos, uOrg`
- out: `vec3 vColor`, `float vPhase`, `float vSeed`
- paired by: `prog(SN_VS, SN_FS)` @1458 → `pSN`

### 2.6 `SN_FS` — fragment — lines 1415–1457 → `src/shaders/supernova.frag.glsl`

- `precision mediump float;`
- in `vec3 vColor`, `float vPhase`, `float vSeed`; out `vec4 o`; no uniforms
- paired by: `prog(SN_VS, SN_FS)` @1458 → `pSN`

### 2.7 `REM_VS` — vertex — lines 1474–1502 → `src/shaders/remnant.vert.glsl`

- attributes: `0 vec3 aPos`, `1 float aSize`, `2 vec3 aColor`, `3 float aPack` (packed `wave*2 + phase`)
- uniforms: `mat4 uProj, uView`; `float uPx, uSpin, uWarp, uCap`; `vec3 uSunPos, uOrg` (identical signature to `SN_VS`)
- out: `vec3 vColor`, `float vPhase`, `float vSeed`
- paired by: `prog(REM_VS, REM_FS)` @1528 → `pRem`

### 2.8 `REM_FS` — fragment — lines 1503–1527 → `src/shaders/remnant.frag.glsl`

- `precision highp float;`
- in `vec3 vColor`, `float vPhase`, `float vSeed`; out `vec4 o`; no uniforms
- private helpers `h21(vec2)`, `vnoise(vec2)` — byte-identical to the pair in `SUN_FS` and `PN_FS` (§5)
- paired by: `prog(REM_VS, REM_FS)` @1528 → `pRem`

### 2.9 `NEB_FS` — fragment — lines 2070–2080 → `src/shaders/nebula.frag.glsl`

- `precision mediump float;`
- uniform `float uGFade`; in `vec3 vColor`; out `vec4 o`
- paired by: `prog(PT_VS, NEB_FS)` @2081 → `pNeb`

### 2.10 `DUST_FS` — fragment — lines 2102–2115 → `src/shaders/dust.frag.glsl`

- `precision mediump float;`
- in `vec3 vColor`; out `vec4 o`; **no uniforms**
- paired by: `prog(PT_VS, DUST_FS)` @2116 → `pDust`

### 2.11 `KB_VS` — vertex — lines 2492–2503 → `src/shaders/kuiper.vert.glsl`

- attributes: `0 vec2 aRT`, `1 float aH`, `2 float aSz`
- uniforms: `mat4 uProj, uView`; `float uPx, uT, uS`; `vec3 uSun, uE1, uE2, uEN`
- paired by: `prog(KB_VS, BELT_FS)` @2529 → `pKB`

### 2.12 `AB_VS` — vertex — lines 2504–2516 → `src/shaders/asteroid.vert.glsl`

`KB_VS` plus a real-period attribute; the two are near-twins but differ in the angle formula and the `gl_PointSize` ceiling (9.0 vs 6.0). Keep separate.

- attributes: `0 vec2 aRT`, `1 float aH`, `2 float aSz`, `3 float aP`
- uniforms: `mat4 uProj, uView`; `float uPx, uT, uS`; `vec3 uSun, uE1, uE2, uEN`
- paired by: `prog(AB_VS, BELT_FS)` @2529 → `pAB`

### 2.13 `OO_VS` — vertex — lines 2517–2524 → `src/shaders/oort.vert.glsl`

- attributes: `0 vec3 aOff`, `1 float aSz`
- uniforms: `mat4 uProj, uView`; `float uPx, uS`; `vec3 uSun` (note: **no** `uT`, `uE1`, `uE2`, `uEN`)
- paired by: `prog(OO_VS, BELT_FS)` @2529 → `pOO`

### 2.14 `BELT_FS` — fragment — lines 2525–2528 → `src/shaders/belt.frag.glsl`

- `precision mediump float;`
- uniforms `vec3 uColor`, `float uAlpha`; out `vec4 o`
- paired by all three of `prog(KB_VS, BELT_FS)`, `prog(OO_VS, BELT_FS)`, `prog(AB_VS, BELT_FS)` @2529 → `pKB`, `pOO`, `pAB`

### 2.15 `RING_VS` — vertex — lines 2565–2568 → `src/shaders/ring.vert.glsl`

- attributes: `0 vec2 aCS`
- uniforms: `mat4 uProj, uView`; `vec3 uSun, uA, uB`; `float uR`
- paired by: `prog(RING_VS, RING_FS)` @2572 → `pRing`

### 2.16 `RING_FS` — fragment — lines 2569–2571 → `src/shaders/ring.frag.glsl`

- `precision mediump float;`
- uniform `vec3 uColor`; out `vec4 o`
- paired by: `prog(RING_VS, RING_FS)` @2572 → `pRing`

### 2.17 `GLOBE_VS` — vertex — lines 2580–2582 → `src/shaders/globe.vert.glsl`

- **no attributes** — position comes wholly from `uPos`; the bound VAO's attribute 0 is ignored
- uniforms: `mat4 uProj, uView`; `vec3 uPos`; `float uSz`
- paired by: `prog(GLOBE_VS, GLOBE_FS)` @2707 → `pGlobe`

### 2.18 `GLOBE_FS` — fragment — lines 2583–2706 (the largest, 124 lines) → `src/shaders/globe.frag.glsl`

- `precision highp float;`
- uniforms: `vec3 uSunV, uAxisV, uPrimeV`; `float uAvg`; `float uMirror, uDisc, uTime, uMoon`; `float uMolten, uOcean, uSea, uHaze, uVeg, uIceLat, uCloud, uLights, uDrift`; `sampler2D uMap`; `float uHasMap, uDry, uSeaLevel`; **`mat3 uPlate[7]`** (the only array uniform in the file)
- out `vec4 o`
- private helpers `mapAt(vec3)`, `h31(vec3)`, `vn3(vec3)`, `fbm3(vec3)`
- paired by: `prog(GLOBE_VS, GLOBE_FS)` @2707 → `pGlobe`

### 2.19 `TONE_VS` — vertex — lines 4929–4935 → `src/shaders/tone.vert.glsl`

- **no attributes, no uniforms**; full-screen triangle synthesised from `gl_VertexID`; drawn with `emptyVAO` (4952)
- out `vec2 vUV`
- paired by: `prog(TONE_VS, TONE_FS)` @4950 → `pTone`

### 2.20 `TONE_FS` — fragment — lines 4936–4949 → `src/shaders/tone.frag.glsl`

- `precision highp float;`
- uniforms `sampler2D uTex`, `float uKnee`; in `vec2 vUV`; out `vec4 o`
- paired by: `prog(TONE_VS, TONE_FS)` @4950 → `pTone`

### 2.21 `SUN_VS` — vertex — lines 5064–5066 → `src/shaders/sun.vert.glsl`

- **no attributes**; position hard-coded to `vec4(0,0,0,1)` (the render origin is the Sun)
- uniforms: `mat4 uProj, uView`; `float uSz`
- paired by: `prog(SUN_VS, SUN_FS)` @5111 → `pSunP`; `prog(SUN_VS, PN_FS)` @5179 → `pPN`

### 2.22 `SUN_FS` — fragment — lines 5067–5110 → `src/shaders/sun.frag.glsl`

- `precision highp float;`
- uniforms `float uTime, uDisc`; `vec3 uColD, uColB`; out `vec4 o`
- private helpers `h21`, `vnoise`, `fbm`
- paired by: `prog(SUN_VS, SUN_FS)` @5111 → `pSunP`

### 2.23 `PN_FS` — fragment — lines 5124–5178 → `src/shaders/planetary-nebula.frag.glsl`

- `precision highp float;`
- uniforms `float uTime, uAge, uAlpha, uBurst`; out `vec4 o`; no `in`
- private helpers `h21`, `vnoise`, `fbm` (identical text to `SUN_FS`)
- paired by: `prog(SUN_VS, PN_FS)` @5179 → `pPN`

---

## 3. Program table

| program const | line | vertex | fragment | bound at (draw sites) |
| --- | --- | --- | --- | --- |
| `pPt` | 1357 | `PT_VS` | `PT_FS` | 5217, 5394, 5532, 5629, 5781, 5914 |
| `pTr` | 1357 | `TR_VS` | `TR_FS` | 5670 |
| `pSN` | 1458 | `SN_VS` | `SN_FS` | 5615 |
| `pRem` | 1528 | `REM_VS` | `REM_FS` | 5645 |
| `pNeb` | 2081 | **`PT_VS`** | `NEB_FS` | 5434, 5435; also 2363 |
| `pDust` | 2116 | **`PT_VS`** | `DUST_FS` | 5484; also 2363 |
| `pKB` | 2529 | `KB_VS` | **`BELT_FS`** | 5742 |
| `pOO` | 2529 | `OO_VS` | **`BELT_FS`** | 5755 |
| `pAB` | 2529 | `AB_VS` | **`BELT_FS`** | 5726 |
| `pRing` | 2572 | `RING_VS` | `RING_FS` | 5767, 5835 |
| `pGlobe` | 2707 | `GLOBE_VS` | `GLOBE_FS` | 5804 |
| `pTone` | 4950 | `TONE_VS` | `TONE_FS` | 5929 |
| `pSunP` | 5111 | **`SUN_VS`** | `SUN_FS` | 5887 |
| `pPN` | 5179 | **`SUN_VS`** | `PN_FS` | 5871 |

### Shared sources — reuse that must survive

- `PT_VS` → `pPt`, `pNeb`, `pDust` (3 programs, one source)
- `BELT_FS` → `pKB`, `pOO`, `pAB` (3 programs, one source)
- `SUN_VS` → `pSunP`, `pPN` (2 programs, one source)

A shared-program helper must take `(vsSource, fsSource)` — **not** a shader name — or these three groups silently fork into six/nine distinct sources the first time someone edits one.

Two more sharing constraints:

- `pKB`, `pOO`, `pAB` are three separate programs with three separate uniform tables (`UK`, `UO`, `UA`), even though `UK` and `UA` harvest the *same* key list. `pOO` uses a shorter list because `OO_VS` has fewer uniforms.
- `pNeb`/`pDust` reuse `PT_VS` but harvest **fewer** uniforms than `pPt` does. See §4.

---

## 4. JS-side uniform-location objects — exact key lists

A shared helper must reproduce each table **key-for-key**. Where a table omits a uniform the shader declares, the code never sets it, and the GL default (0 / null-location no-op) is load-bearing. Harvesting the union and then writing the union would move pixels.

### `U` @1358–1373 — **spans two programs** (`pPt` and `pTr`), 29 keys

From `pPt` (22 keys — the complete `PT_VS` set):

| JS key | GLSL name |
| --- | --- |
| `ptProj` | `uProj` |
| `ptView` | `uView` |
| `ptPx` | `uPx` |
| `ptSpin` | `uSpin` |
| `ptWarp` | `uWarp` |
| `ptSun` | `uSunPos` |
| `ptOrg` | `uOrg` |
| `velT` | `uVelT` |
| `ptCap` | `uCap` |
| `ptWA` | `uWaveAll` |
| `ptTime` | `uTime` |
| `ptVM` | `uVarMode` |
| `ptAnd` | `uAnd` |
| `ptTide` | `uTide` |
| `ptWarpAmp` | `uWarpAmp` |
| `ptMinB` | `uMinB` |
| `ptMinSz` | `uMinSz` |
| `ptFade` | `uFadeOut` |
| `ptGal` | `uGal` |
| `ptGRot` | `uGRot` |
| `ptGOff` | `uGOff` |
| `ptMerge` | `uMerge` |

From `pTr` (7 keys): `trOrg`→`uOrg`, `trProj`→`uProj`, `trView`→`uView`, `trLen`→`uLen`, `trCol`→`uColor`, `trA`→`uAlpha`, `trFlat`→`uFlat`.

`U` is the one table a naive per-program helper cannot produce: it is the **merge of two programs' harvests under prefixed keys**. Either keep `U` as a hand-written merge of two helper results, or keep the literal as-is.

### `USN` @1459–1464 — `pSN`, 8 keys

`proj`→`uProj`, `view`→`uView`, `px`→`uPx`, `spin`→`uSpin`, `warp`→`uWarp`, `cap`→`uCap`, `sun`→`uSunPos`, `org`→`uOrg`. (Complete for `SN_VS`; `SN_FS` has no uniforms.)

### `UREM` @1529–1534 — `pRem`, 8 keys

Same eight keys, same GLSL names, harvested from `pRem`: `proj`, `view`, `px`, `spin`, `warp`, `cap`, `sun`, `org`.

### `UN` @2082–2099 — `pNeb`, 20 keys

`minSz`→`uMinSz`, `gal`→`uGal`, `grot`→`uGRot`, `goff`→`uGOff`, `merge`→`uMerge`, `and`→`uAnd`, `tide`→`uTide`, `warpAmp`→`uWarpAmp`, `time`→`uTime`, `vm`→`uVarMode`, `wa`→`uWaveAll`, `cap`→`uCap`, `org`→`uOrg`, `proj`→`uProj`, `view`→`uView`, `px`→`uPx`, `spin`→`uSpin`, `warp`→`uWarp`, `sun`→`uSunPos`, `gf`→`uGFade`.

Deliberately **absent** although `PT_VS` declares them: `uVelT`, `uMinB`, `uFadeOut`. They stay at their GL defaults (0) for the whole run.

### `UD` @2123–2138 — `pDust`, 17 keys

`minSz`, `gal`, `grot`, `goff`, `merge`, `and`, `tide`, `warpAmp`, `wa`, `cap`, `org`, `proj`, `view`, `px`, `spin`, `warp`, `sun` — same GLSL mapping as `UN`.

Deliberately **absent**: `uVelT`, `uMinB`, `uFadeOut`, **and additionally `uTime` and `uVarMode`** (no `time`/`vm` keys — dust never animates its variability, `uVarMode` stays 0). There is no `gf` key because `DUST_FS` has no `uGFade`.

### `UA` @2530 — `pAB`, loop-harvested, 11 keys (keys are the GLSL names)

`['uProj','uView','uPx','uT','uS','uSun','uE1','uE2','uEN','uColor','uAlpha']`

### `UK` @2531 — `pKB`, identical 11-key list

`['uProj','uView','uPx','uT','uS','uSun','uE1','uE2','uEN','uColor','uAlpha']`

### `UO` @2532 — `pOO`, 7 keys

`['uProj','uView','uPx','uS','uSun','uColor','uAlpha']` — no `uT`, `uE1`, `uE2`, `uEN`.

### `UG` @2708–2710 — `pGlobe`, 25 loop keys + 1 hand-written

Loop list, in source order:
`['uProj','uView','uPos','uSz','uSunV','uAxisV','uPrimeV','uAvg','uMirror','uDisc','uTime','uMoon','uMolten','uOcean','uSea','uHaze','uVeg','uIceLat','uCloud','uLights','uDrift','uMap','uHasMap','uDry','uSeaLevel']`

Then, separately, line 2710:

```js
UG.uPlate = gl.getUniformLocation(pGlobe,'uPlate[0]');
```

The key is `uPlate` but the **queried name is `uPlate[0]`** — an array uniform must be looked up by its first element. A generic helper that queries `k` for every key would return `null` here and the plate matrices would silently stop being uploaded (line 5814), flattening plate tectonics to the identity. This is the single most fragile line in the slice.

### `UR` @2849 — `pRing`, 7 keys

`['uProj','uView','uSun','uA','uB','uR','uColor']`

Note the distance: `pRing` is created at 2572, but `UR` is harvested 277 lines later at 2849, in the middle of the Earth/Moon section. Any split must keep `pRing`'s creation before `UR`'s harvest.

### `UT` @4951 — `pTone`, 2 keys

`tex`→`uTex`, `knee`→`uKnee`.

### `USn` @5112–5117 — `pSunP`, 7 keys

`proj`→`uProj`, `view`→`uView`, `time`→`uTime`, `sz`→`uSz`, `disc`→`uDisc`, `colD`→`uColD`, `colB`→`uColB`.

### `UPN` @5180–5184 — `pPN`, 7 keys

`proj`→`uProj`, `view`→`uView`, `sz`→`uSz`, `time`→`uTime`, `age`→`uAge`, `alpha`→`uAlpha`, `burst`→`uBurst`.

### Naming trap

`USN` (supernova, 1459) and `USn` (the Sun's photosphere, 5112) differ **only in the case of the final letter**. On a case-insensitive filesystem, or after any rename/auto-import round trip, these two collapse. Rename them (`USUPERNOVA` / `USUN`, or `uSN` / `uSunDisc`) as an explicit, reviewed step — or leave both alone and add a lint rule. Do not let an editor "fix" one of them.

---

## 5. Duplicated GLSL helper bodies (do not factor out)

Three fragment shaders carry byte-identical copies of the same noise helpers:

- `h21(vec2)` + `vnoise(vec2)`: `REM_FS` (1506–1508), `SUN_FS` (5072–5074), `PN_FS` (5128–5130)
- `fbm(vec2)`: `SUN_FS` (5075), `PN_FS` (5131) — identical
- `GLOBE_FS` has the 3-D cousins `h31`/`vn3`/`fbm3` (2594–2598), which are *not* the same functions

The temptation during the move will be a `noise.glsl` include. Resist it for this refactor: an include pass changes line numbering inside the shader (which changes nothing visually) but also risks whitespace/format normalisation, and these are numeric kernels where `.5` vs `0.5` is safe but reordering a `mix` is not. Screenshot parity is the gate; a shared include buys nothing measurable and risks everything. If it is done later, do it as its own commit with its own screenshot run.

---

## 6. String concatenation / interpolation

**None.** All 23 shaders are single, self-contained, un-interpolated template literals. No shader source is assembled at runtime, no `#define` is injected, no precision qualifier is patched in, no feature flag varies the source. Extraction to `.glsl` is a byte-for-byte copy.

The one place a value crosses from JS into GLSL-adjacent territory is `mat3 uPlate[7]` (GLOBE_FS 2589): the `7` is hard-coded in the shader and the JS side must upload exactly 7 mat3s (`fillPlateMats`, used at 5814). Keep the two in the same module or leave a comment pinning them together.

---

## 7. Hazards

### H1 — the error-log collector must evaluate first (lines 1106–1122 vs 1194/1201)

`sh()` throws on a compile failure and `prog()` throws on a link failure, **at module-evaluation time**, from 14 top-level call sites. The `addEventListener('error', …)` collector lives at 1106–1122, i.e. 90 lines earlier in the single script. If the shader/program module is bundled or imported such that it evaluates before the error-log module, a shader compile failure becomes an unreported white page. The error-log module must be a hard, first dependency of the GL module — import it for side effects at the top of the entry file, and do not let tree-shaking or `sideEffects: false` drop it.

### H2 — `gl` creation aborts the module (lines 1188–1190)

`throw new Error('no webgl2')` at 1190 aborts evaluation. Every `const` below it — all 23 shader sources, all 14 programs, all 13 uniform tables — is then permanently in TDZ, and any later module that imports one gets a TDZ `ReferenceError` rather than the intended "WebGL2 is not available" message. Today that is harmless because it is one script; after the split it becomes a cascade of confusing secondary errors. Keep the GL-context module a single import that either succeeds or replaces `document.body` and stops.

### H3 — `document.getElementById('gl')` at line 1188

The canvas is fetched by id at module-evaluation time, with no null check before `canvas.getContext(...)`. A moved or renamed element id here dies at boot with a `TypeError` that a parse check cannot see. This is exactly the failure shape that has already bitten this page three times. Freeze the id in a shared constants module and reference it, so a rename is a compile error rather than a runtime one.

### H4 — top-level `useProgram` loop at 2362–2364 reads three separate uniform tables

```js
for(const [pr, gr] of [[pPt,U.ptGRot],[pNeb,UN.grot],[pDust,UD.grot]]) { gl.useProgram(pr); gl.uniformMatrix3fv(gr, false, MAT3_ID); }
```

This is a top-level side effect that reaches back into `U` (1358), `UN` (2082) and `UD` (2123). If any of those three tables moves into a module that evaluates later, this line reads `undefined` and throws — or worse, silently uploads to a `null` location and the Milky Way's disk frame is left uninitialised. It also **leaves `pDust` as the current program** when it finishes; nothing depends on that today (every draw site calls `useProgram`), but a later "cleanup" that reorders the array would still be a GL-state change.

### H5 — `setGalaxy(1)` at 2365 is a forward-reaching top-level call, already relocated once

The comment at 2139–2140 records that this call was deliberately moved down past the Andromeda constants block (`R_A` at 2151) because the generator reads those `const` bindings live. `setGalaxy` itself is a hoisted `function` declaration (2040), so the call *parses* fine — the hazard is entirely in the `const`s it reaches. The mirror comment at 6157–6160 records a second instance of the same trap (`setGalaxy(D>=5)` reaching `loadGaiaDeep`, which touches a `let` declared later, safe only because the whole script has finished evaluating by then). **Two documented TDZ near-misses on the same function.** When this slice moves, line 2365 must stay after `R_A` (2151) and after `U`/`UN`/`UD`, and the loader must not become async-imported ahead of the constants.

### H6 — randomness consumed at module-evaluation time, interleaved with this slice

Screenshot parity is tested with a seeded `Math.random`, so the **global order of consumption** is the invariant. These top-level generators sit *between* the shader consts of this slice and must not be reordered relative to one another, nor relative to any other module-eval randomness:

- 1658–1665 — distant star field (`N_STAR = 3200`), 5 `Math.random()` per star, in a bare top-level block. Sits **between** `PT_VS`/`PT_FS`/`TR_*`/`SN_*`/`REM_*` (1206–1534) and the belt shaders (2492+).
- 2460–2475 — asteroid belt (`AB_N = 1500`), a rejection loop over the Kirkwood gaps: the number of draws per particle is data-dependent, so any change in call order is unrecoverable.
- 2478–2483 — Kuiper belt (`KB_N = 1600`).
- 2486–2491 — Oort cloud (`OO_N = 2400`).
- Blocks 2460–2491 sit immediately **above** `KB_VS`/`AB_VS`/`OO_VS`/`BELT_FS` (2492–2528) in the same region.
- `gauss()` (1649) and `expR()` (1651) each consume a *variable* number of draws (`gauss` loops until non-zero), so they cannot be replaced by a "same count" equivalent.
- `setGalaxy(1)` at 2365 runs the whole galaxy generator (thousands of draws, 1700–2038) **in the middle of this slice's line range**, after the dust program is built and before the belt shaders.

The shader literals themselves consume no randomness, so moving *them* is safe. What is not safe is letting the extraction drag the generator blocks with them, or letting a bundler decide the evaluation order of the modules that contain them. Recommendation: keep every module-eval-time random consumer in **one** module, in today's source order, and have the shader/program module be a pure, randomness-free leaf that it imports.

### H7 — attribute location 4 (`aVel`) is never enabled by any VAO

`grep` for `enableVertexAttribArray(4)` / `vertexAttribPointer(4` returns nothing. `PT_VS` declares `layout(location=4) in vec3 aVel` and multiplies it by `uVelT`, so every draw relies on the default generic vertex attribute `(0,0,0,1)`. On `pPt`, `uVelT` is explicitly zeroed at 5427/5558 and set for real at 5549. On `pNeb`/`pDust` there is **no `uVelT` location at all** (§4), so it stays 0 and the term vanishes. A shared helper that harvests the union of `PT_VS`'s uniforms and a shared setter that writes them all would give the nebulae and the dust a proper-motion shear they have never had.

### H8 — `UG.uPlate` is queried as `'uPlate[0]'` (line 2710)

Called out again here because it is the one key a generic `for(const k of keys)` helper gets wrong. It must remain a special case.

### H9 — `USN` vs `USn`

See §4. Case-only distinction between two live uniform tables.

### H10 — uniform-table declarations sit far from their programs

`UR` (2849) is 277 lines below `pRing` (2572); `U` (1358) merges `pPt` and `pTr`; the 2362 loop reads three tables declared across 800 lines. None of these is a TDZ error today because everything is one linear script, but each becomes an import-order constraint the moment the file is split. The safe shape: **one module** that owns `sh`, `prog`, all 14 `prog()` calls and all 13 uniform tables, evaluated in exactly today's relative order, exporting them as plain consts.

---

## 8. Proposed module targets

- `src/shaders/*.glsl` — the 23 sources, byte-identical, imported `?raw`
- `src/gl/context.ts` — `canvas`, `gl`, the no-WebGL2 bailout (must import the error-log module for side effects)
- `src/gl/programs.ts` — `sh`, `prog`, the 14 program consts, the 13 uniform tables, in today's order
- consumers this slice feeds: `render/points.ts` (`pPt`/`pTr`/`U`), `render/supernova.ts` (`pSN`/`USN`), `render/remnant.ts` (`pRem`/`UREM`), `render/nebula.ts` (`pNeb`/`UN`), `render/dust.ts` (`pDust`/`UD`), `render/belts.ts` (`pAB`/`pKB`/`pOO`/`UA`/`UK`/`UO`), `render/rings.ts` (`pRing`/`UR`), `render/globe.ts` (`pGlobe`/`UG`), `render/tonemap.ts` (`pTone`/`UT`), `astro/sun.ts` (`pSunP`/`USn`, `pPN`/`UPN`)
