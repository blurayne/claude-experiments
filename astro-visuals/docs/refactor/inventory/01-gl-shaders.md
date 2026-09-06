# Slice 01 — error log, build stamp, mat4, GL setup, point/trail shaders, supernova, remnant

Source: `/home/markusg/Private/claude-experiments.ts-refactor/astro-visuals/galactic-transit.html`
Range: **lines 1095–1535** (line 1095 is the opening `<script>`; the whole page is one classic, non-module script that ends at line 6429).

Scope note: this slice is the very top of the script. Everything in it is evaluated before every other slice. 33 top-level entries: 30 declarations + 2 bare side-effecting statements + 1 directive.

---

## 1. Symbol inventory

Legend for **touches**: DOM | gl | rand (`Math.random`) | LS (`localStorage`) | audio (Web Audio) | evt (`window`/`document` event registration or global object patching) | — (none).
Legend for **purity**: `pure` | `reads-mut` (reads mutable state) | `mutates` (mutates mutable state) | `eval-fx` (side effect at evaluation time).

| # | name | kind | lines | what it is | target module | external deps (not declared in this range) | touches | purity |
|---|------|------|-------|------------|---------------|--------------------------------------------|---------|--------|
| 0 | `"use strict"` | directive | 1096 | Strict-mode directive for the whole script body. | `main.ts` (implicit: ESM is always strict) | — | — | eval-fx |
| 1 | `TOUCH_DEV` | const | 1104–1105 | True on a coarse-pointer/touch device with no fine pointer; gates the whole error-log collector. | `core/errorlog.ts` | `matchMedia`, `navigator.maxTouchPoints` | evt (reads media queries at eval time) | eval-fx (reads environment once, then immutable) |
| 2 | `errLog` | const (mutable array) | 1106 | Ring-ish buffer of collected error records, newest first, max `ERR_MAX`. | `core/errorlog.ts` | — | — | mutates (mutated here and at 6357) |
| 3 | `ERR_MAX` | const | 1106 | Cap of 120 entries on `errLog`. | `core/errorlog.ts` | — | — | pure constant |
| 4 | `logErr` | function decl | 1107–1114 | Pushes/dedupes one `{kind,msg,where,t,n}` record into `errLog`, then pokes the UI renderer if it exists. | `core/errorlog.ts` | `renderLog` (declared line 6339), `Date` | — | mutates (`errLog`); calls out to UI |
| 5 | *(error-log boot block)* | bare `if(TOUCH_DEV){…}` statement | 1115–1132 | Registers a capturing `error` listener (1116–1120), an `unhandledrejection` listener (1121–1123), and monkey-patches `console.error`/`console.warn` (1124–1131) so everything the page can see reaches `logErr`. | `core/errorlog.ts` | `addEventListener`, `window`, `console`, `JSON`, `Error` | evt (global listeners + `console` patch) | eval-fx (mutates the global `console` object) |
| 6 | `BUILD` | const object | 1133 | `{version:'2.78.0', date, time, sha}` — date/time/sha are `__BUILD_*__` placeholders rewritten by `.github/scripts/build_site.py`. | `core/build.ts` | — | — | pure constant (build-time substituted literal) |
| 7 | `VERSION` | const | 1134 | `'v' + BUILD.version`. | `core/build.ts` | — | — | pure |
| 8 | `localBuildStamp` | function decl | 1137–1158 | Renders the UTC build stamp in the browser's own zone, preferring the zone abbreviation, else a numeric `UTC±hh:mm`. | `core/build.ts` | `Date`, `Intl.DateTimeFormat`, `Math`, `String.padStart` | — | reads-mut (reads host timezone/locale) |
| 9 | `BUILD_LINE` | const | 1159–1161 | `'dev build'` when the placeholder survived, otherwise `localBuildStamp() + ' · ' + BUILD.sha`. **Calls `localBuildStamp()` at evaluation time.** | `core/build.ts` | — | — | eval-fx (environment-dependent value frozen at boot) |
| 10 | `perspective` | function decl | 1163–1167 | Column-major perspective matrix into a fresh `Float32Array(16)`. | `core/mat4.ts` | `Math.tan`, `Float32Array` | — | pure |
| 11 | `lookAt` | function decl | 1168–1179 | Column-major view matrix from eye/at/up. | `core/mat4.ts` | `Math.hypot`, `Float32Array` | — | pure |
| 12 | `mul` | function decl | 1180–1185 | 4×4 column-major matrix product. | `core/mat4.ts` | `Float32Array` | — | pure |
| 13 | `canvas` | const | 1188 | `document.getElementById('gl')` — the main render canvas (`<canvas id="gl">`, line 389). | `gpu/context.ts` | `document`, element id `gl` | DOM | eval-fx (DOM query at eval time); the object it holds is mutated elsewhere |
| 14 | `gl` | const | 1189 | `canvas.getContext('webgl2', {antialias:true, alpha:false})` — the one WebGL2 context for the page. | `gpu/context.ts` | — | gl, DOM | eval-fx; the context is the file's central mutable object |
| 15 | *(no-WebGL2 guard)* | bare `if(!gl){…}` statement | 1190 | Replaces `document.body.innerHTML` with a message and `throw`s, aborting the rest of the script. | `gpu/context.ts` | `document.body`, `Error` | DOM | eval-fx (mutates the DOM, throws) |
| 16 | `sh` | function decl | 1192–1196 | Compiles one shader, throws `getShaderInfoLog()` on failure. | `gpu/program.ts` | `gl`, `Error` | gl | mutates (creates GL objects) |
| 17 | `prog` | function decl | 1197–1203 | Compiles vs+fs via `sh`, links, throws `getProgramInfoLog()` on failure. | `gpu/program.ts` | `gl`, `Error` | gl | mutates (creates GL objects) |
| 18 | `PT_VS` | const template string | 1206–1322 | GLSL ES 300 vertex shader for glowing point sprites: velocity advance, differential vs. pattern-speed rotation, Gaia warp, solar-system clearance bubble, whole-galaxy placement (`uGRot`/`uGOff`), tidal pull, merger scramble, size clamp + flux compensation, variability (stars/nebulae), brightness floor. | `shaders/pt.vert.glsl` | — | — | pure data (string) |
| 19 | `PT_FS` | const template string | 1326–1339 | Point fragment shader: soft corona + tight core, white-core lift (Gaia Sky-style profile, reimplemented). | `shaders/pt.frag.glsl` | — | — | pure data |
| 20 | `TR_VS` | const template string | 1342–1351 | Trail vertex shader; fades by `gl_VertexID/uLen`. | `shaders/trail.vert.glsl` | — | — | pure data |
| 21 | `TR_FS` | const template string | 1352–1355 | Trail fragment shader; `mix(pow(vF,1.7),1.0,uFlat)*uAlpha`. | `shaders/trail.frag.glsl` | — | — | pure data |
| 22 | `pPt` | const | 1357 | Linked point-sprite program (`PT_VS`+`PT_FS`). Used by at least 6 draw passes (5217, 5394, 5532, 5629, 5781, 5914) and read top-level at 2362. | `render/passes/points.ts` | — | gl | eval-fx (creates + links a GL program) |
| 23 | `pTr` | const | 1357 | Linked trail program (`TR_VS`+`TR_FS`); used at 5670. | `render/passes/points.ts` | — | gl | eval-fx |
| 24 | `U` | const object | 1358–1373 | 26 uniform locations for `pPt` and `pTr`, captured immediately after link. | `render/passes/points.ts` | — | gl | eval-fx (27 `getUniformLocation` calls) |
| 25 | `SN_VS` | const template string | 1382–1409 | Supernova vertex shader: the wave-riding branch of `PT_VS`, copied deliberately so the flash sits exactly where the progenitor stood; emits `vPhase` and a per-star `vSeed`. | `shaders/supernova.vert.glsl` | — | — | pure data |
| 26 | `SN_FS` | const template string | 1415–1457 | Supernova fragment shader: photosphere core, glow, diffraction spikes leading the flash, clumpy shock ring, hot→cool tint. | `shaders/supernova.frag.glsl` | — | — | pure data |
| 27 | `pSN` | const | 1458 | Linked supernova program; used at 5615. | `render/passes/supernova.ts` | — | gl | eval-fx |
| 28 | `USN` | const object | 1459–1464 | 8 uniform locations for `pSN`. | `render/passes/supernova.ts` | — | gl | eval-fx |
| 29 | `REM_VS` | const template string | 1474–1502 | Remnant vertex shader: both rotation branches, unpacks `aPack = wave*2 + phase`, emits `vPhase`/`vSeed`. | `shaders/remnant.vert.glsl` | — | — | pure data |
| 30 | `REM_FS` | const template string | 1503–1527 | Remnant fragment shader: `h21`/`vnoise` helpers, limb-brightened hollow shell with filaments, interior fill, warmer rim. | `shaders/remnant.frag.glsl` | — | — | pure data |
| 31 | `pRem` | const | 1528 | Linked remnant program; used at 5645. | `render/passes/remnant.ts` | — | gl | eval-fx |
| 32 | `UREM` | const object | 1529–1534 | 8 uniform locations for `pRem`. | `render/passes/remnant.ts` | — | gl | eval-fx |

Nested / non-top-level side-effecting entities inside entry #5 (listed for completeness, they must move as one unit with it):

| lines | what |
|-------|------|
| 1116–1120 | capturing `error` listener; distinguishes resource-load failures (`t.src \|\| t.href`) from script errors |
| 1121–1123 | `unhandledrejection` listener |
| 1124–1131 | `for(const k of ['error','warn'])` — binds `console[k]`, replaces it with a wrapper that calls `logErr` then the original |

---

## 2. Mutable module-level state declared here that OTHER parts of the file mutate

| symbol | declared | mutated outside this range | notes |
|--------|----------|----------------------------|-------|
| `errLog` | 1106 | 6357 `errLog.length = 0` (log-clear button). Read at 6340, 6344, 6360. | `const` binding, mutable array. The UI slice both truncates it and re-renders. Must stay a single shared instance — duplicate module instances would split the log. |
| `gl` (the context object) | 1189 | Everywhere: `useProgram` 5217/5394/5532/5629/5670/5781/5914, uniforms 5395+/5544+/5616+/5646+, `viewport` 4989/5226, `texImage2D` 4961, framebuffers 5205+. | The single largest piece of shared mutable state in the file. Comments at 5217 (“the uniforms as the last frame left them”) and 5532 (“their uniforms persist on the program”) make the *cross-pass* persistence of GL state load-bearing: any reordering of draw passes changes pixels. |
| `canvas` (the element) | 1188 | `canvas.width/height` 4988; `classList.add/remove('dragging')` 3521, 3544; `setPointerCapture` 3524; listeners 3518, 3527, 3573, 3580–3582. Read at 4961, 5205, 5226, 5494. | Both the render slice and the input slice own parts of it. |
| `pPt` (program *state*) | 1357 | Uniform values on the program object are set by many passes and deliberately relied on afterwards. Also read top-level at 2362 in `for(const [pr,gr] of [[pPt,U.ptGRot],…])`. | The program object is not reassigned; its GL-side uniform state is shared mutable state. |
| `pTr`, `pSN`, `pRem` | 1357, 1458, 1528 | Uniform state set at 5646–5653 (`pRem`), 5616–5623 (`pSN`), 5670+ (`pTr`). | Same shape as above. |
| `console` (global) | patched 1126 | Every `console.warn`/`console.error` in the file goes through the wrapper. | Global object mutation. Double evaluation of the errorlog module double-wraps and duplicates entries. |
| `U`, `USN`, `UREM` | 1358, 1459, 1529 | Object contents never reassigned; only read. | Safe to freeze. |
| `TOUCH_DEV`, `ERR_MAX`, `BUILD`, `VERSION`, `BUILD_LINE` | 1104–1161 | Read-only after eval. Read at 3592–3597, 6343, 6347, 6359, 6383. | Immutable, but `BUILD_LINE` is environment-derived (see §3). |

---

## 3. Evaluation-time randomness / environment reads

**No `Math.random` call appears anywhere in lines 1095–1535** — neither at eval time nor inside a function. This slice consumes zero host randomness and therefore contributes no ordering constraint to the seeded-PRNG screenshot gate *by itself*.

Non-random but evaluation-time environment reads, which have the same “frozen at boot, order-sensitive” shape and must not move:

| line | site | what is captured at eval time |
|------|------|------------------------------|
| 1104–1105 | `TOUCH_DEV` | Two `matchMedia` queries + `navigator.maxTouchPoints`. Read once; the whole error-collector and the log-tab copy at 6343/6347 depend on it. |
| 1159–1161 | `BUILD_LINE` | Calls `localBuildStamp()`, which reads `Intl.DateTimeFormat` (host locale) and `Date.prototype.getTimezoneOffset` (host zone). The string it produces is rendered into `#buildStamp` (3593) and `#tourBuild` (3594) — so **screenshot parity of the settings dialog depends on TZ/locale, not on the RNG**. Pin TZ and locale in the screenshot harness, or exclude that text region. |
| 1188–1189 | `canvas` / `gl` | DOM lookup + WebGL2 context creation with `{antialias:true, alpha:false}`. |
| 1357, 1458, 1528 | `prog(...)` × 4 | Shader compilation and program linking happen at module-evaluation time, not lazily. |
| 1358, 1459, 1529 | `U`, `USN`, `UREM` | 43 `getUniformLocation` calls at eval time. |

GPU-side pseudo-randomness (deterministic, **not** host RNG, no parity risk from this slice — but the literals must survive the move byte-exactly):

| line | expression |
|------|-----------|
| 1275–1276 | `fract(sin(dot(aPos.xy, vec2(127.1,311.7)))*43758.5453)` and `…dot(aPos.yz, vec2(269.5,183.3))…` — merger scramble targets |
| 1295 | `fract(sin(dot(aPos.xz, vec2(12.9898,78.233)))*43758.5453)` — variability selector (`h > 0.955` ≈ 4.5% of stars pulse) |
| 1408 | `fract(sin(dot(aPos.xz, vec2(41.7,289.3)))*43758.5453)` — supernova `vSeed` |
| 1501 | `fract(sin(dot(aPos.xz, vec2(73.1,157.9)))*43758.5453)` — remnant `vSeed` |
| 1506–1508 | `h21`/`vnoise` in `REM_FS` — remnant filament noise |

These hash the *positions* produced by the scene generators, so their output is a downstream function of the host RNG order in `scene/*`. Change a scene generator's draw order from the RNG and these visuals change too, even though this slice is untouched.

---

## 4. Boot-order hazards

**H1 — `logErr` forward-references `renderLog` (declared 5 200 lines later).**
Line 1113: `if(typeof renderLog === 'function') try{ renderLog(); }catch(e){}`; `renderLog` is a hoisted `function` declaration at line 6339. In a single classic script this is safe (function declarations are initialized before any statement runs) and the `typeof` guard is redundant. In ES modules it becomes dangerous in two ways: (a) if `renderLog` is converted to `const renderLog = …`, `typeof` on a TDZ binding throws `ReferenceError` — *inside the global error handler*, which is the worst possible place; (b) under a cyclic import, the imported binding can still be uninitialized when `logErr` first fires. Keep `renderLog` a hoisted `function` declaration, or replace the lookup with a registration hook (`setLogRenderer(fn)`) owned by `core/errorlog.ts`.

**H2 — the error collector must evaluate before everything else.**
Lines 1104–1132 exist so that any later throw is captured on a device with no console. ESM evaluates a module's dependencies before its own body, so `core/errorlog.ts` must be (a) a leaf module with **zero imports**, and (b) the first import in `main.ts`. If any other module ends up evaluated before it — bundler hoisting, a side-effectful import in `core/build.ts`, a shared chunk — a boot-time throw in that module is invisible on a phone, which is exactly the failure mode this code was written for. Also: the `console` patch at 1124–1131 must precede the first `console.warn`/`error` of any other module.

**H3 — the `throw` at line 1190 aborts the whole script.**
`if(!gl){ document.body.innerHTML = …; throw new Error('no webgl2'); }` currently stops the single classic script dead: nothing below line 1190 ever runs, no listener is registered, no panel is built. Split into modules, a throw during `gpu/context.ts` evaluation aborts only the modules that transitively depend on it; already-evaluated module bodies (and, depending on the bundler, sibling modules) keep their side effects. The no-WebGL2 path must be re-verified explicitly — a parse check will never see it.

**H4 — `document.getElementById('gl')` depends on markup that is 800 lines away.**
The element is `<canvas id="gl">` at line 389 and the script sits at the end of `<body>`, so the lookup succeeds today. `id="gl"` is load-bearing and is also referenced by CSS at lines 35–36 (`canvas#gl{…}`, `canvas#gl.dragging{…}`). If the extracted bundle is loaded as `<script type="module">` in `<head>` it still works (module scripts are deferred), but a `defer`-less classic `<script src>` in `<head>` yields `null` and then a `TypeError` on `.getContext`. Add a null check or assert on the element, and never rename the id.

**H5 — `getContext('webgl2', {antialias:true, alpha:false})` must happen exactly once.**
A second `getContext` with different attributes returns the *existing* context and silently ignores the attributes. If `gpu/context.ts` is duplicated across chunks (mixed relative/alias import specifiers producing two module instances), the second instance's `gl` is the same object but the module-level bookkeeping diverges. Enforce a single instance; consider a dev-time guard.

**H6 — program creation order is interleaved with other slices.**
This slice links `pPt`/`pTr` (1357), `pSN` (1458), `pRem` (1528). Later slices link `pNeb` (2081) and `pDust` (2116), **both reusing `PT_VS` from this slice**, then `pKB`/`pOO`/`pAB` (2529), `pRing` (2572), `pGlobe` (2707), `pTone` (4950), `pSunP` (5111), `pPN` (5179). So `shaders/pt.vert.glsl` and `gpu/program.ts` are read by at least three slices, and `main.ts` must import the pass modules in exactly the source order so GL object creation and shader-compile diagnostics stay in the same sequence.

**H7 — `U` is read at top level by a later slice.**
Line 2362: `for(const [pr, gr] of [[pPt,U.ptGRot],[pNeb,UN.grot],[pDust,UD.grot]])` runs at evaluation time, not at frame time. `render/passes/points.ts` (which owns `pPt` and `U`) must therefore be fully evaluated before the nebula/dust slice's body — a real TDZ risk if the dependency edge is only implicit today.

**H8 — shader sources must not become async.**
`PT_VS`…`REM_FS` are consumed synchronously by `prog()` at lines 1357/1458/1528. Extracting them to real `.glsl` files is only safe with a *build-time* text import (`?raw` / inline loader). A runtime `fetch()` turns program creation asynchronous, which changes first-frame timing and therefore pixels.

**H9 — name collision: `mul`.**
`mul` at line 1180 is the 4×4 matrix product (`core/mat4.ts`, called at 5944). A different `mul` — GF(256) multiply for the QR encoder — is declared at line 6202 as a `const` arrow *inside a function*, shadowing the outer one at 6205/6207. It currently works by lexical shadowing. After extraction, if the QR module imports `mul` from `core/mat4.ts` (auto-import, IDE fixup) it will silently corrupt the QR error-correction bytes. Keep the QR-local `mul` local and name-check it during the move.

**H10 — the `errLog` and `renderLog` pair spans the two ends of the file.**
`errLog` (1106) is written by `logErr` (1107) at the top and cleared/exported by UI code at 6357/6360, while `renderLog` (6339) reads it. Three modules touch one array; boot order determines whether the log tab shows entries collected before the UI existed. The current design (collect early, render lazily via the `typeof` guard) is the correct one — preserve it.

**H11 — `"use strict"` at 1096.**
The whole page is strict today; ES modules are implicitly strict, so no behaviour change *for this slice*, but any later slice that quietly relies on sloppy-mode semantics would already be broken today, and any code extracted into a non-module `.js` shim would lose strictness.

---

## 5. Cross-slice reads (symbols read here, declared elsewhere)

- `renderLog` — declared at line 6339 (`ui/settings.ts` / log tab), read at 1113 through a `typeof` guard.
- Browser globals: `matchMedia`, `navigator`, `addEventListener`, `window`, `console`, `document`, `document.body`.
- Language builtins: `Date`, `Intl.DateTimeFormat`, `Math`, `String`, `JSON`, `Error`, `Float32Array`.

## 6. Symbols exported from this slice to later slices

`errLog`, `TOUCH_DEV`, `logErr` (implicitly, via the global handlers), `BUILD`, `VERSION`, `BUILD_LINE` (3592–3597, 6343, 6359, 6383) · `perspective` (4984), `lookAt` (5383), `mul` (5944) · `canvas` (3518–3582, 4961–4989, 5205–5226, 5494), `gl` (everywhere) · `sh` (via `prog`), `prog` (2081, 2116, 2529, 2572, 2707, 4950, 5111, 5179) · `PT_VS` (2081, 2116) · `pPt` (2362, 5217, 5394, 5532, 5629, 5781, 5914), `pTr` (5670), `U` (2362, 5395–5554 and beyond) · `pSN`/`USN` (5615–5623) · `pRem`/`UREM` (5645–5653).
