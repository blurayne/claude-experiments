# Inventory slice 05 — star-formation history, environment, real-sky loaders, Gliese 710, life support, stellar life cycle, Web Audio

Source: `galactic-transit.html`, lines **2936–3499** (inclusive). Line numbers are absolute in the current `main` version of the file (6431 lines total).

Slice boundaries: line 2935 is the closing `}` of `pushTrail` (slice 04). Line 3499 is blank; line 3500 opens `// ---------- camera & interaction ----------` (slice 06).

Counts: **97 named top-level declarations** + **7 bare side-effecting statements** = **104 rows**.

Legend for the *Touches* column: `DOM` = document/element access, `gl` = WebGL2 context, `rnd` = `Math.random`, `LS` = localStorage, `WA` = Web Audio / media element, `EV` = window/document/element event registration, `net` = `fetch`/network, `—` = none.

Purity codes: **P** = pure function, **R** = reads mutable module state, **M** = mutates mutable module state, **E** = side effect at evaluation time.

---

## 1. Star-formation history (2936–2954)

| # | Name | Kind | Lines | What it is | Target module | External deps (not declared in this range) | Touches | Purity |
|---|---|---|---|---|---|---|---|---|
| 1 | `ageGyr` | `const` arrow | 2942 | Current epoch in Gyr: `AGE0 + simT*YR_PER_SIM/1e9`. The clock every astro model in this slice reads. | `astro/calendar` | `AGE0` (1541), `YR_PER_SIM` (1540), **`simT` (5029 — declared LATER in the file)** | — | R |
| 2 | `sfrFactor` | `function` | 2943–2949 | Galactic star-formation rate factor vs age: exponential gas rundown + two merger starburst gaussians + quench sigmoid, floored at 0.02, normalised to 1 today. | `astro/environment` | `AGE0` (1541) | — | P |
| 3 | `ratesIntegral` | `function` | 2950–2954 | 360-step midpoint integral of `sfrFactor` from `AGE0` to `a`, returned in years — the SFR-weighted elapsed time shown in the info panel. | `astro/environment` | `AGE0` (1541) | — | P |

## 2. Earth's galactic environment (2956–2996)

| # | Name | Kind | Lines | What it is | Target module | External deps | Touches | Purity |
|---|---|---|---|---|---|---|---|---|
| 4 | `rawCR` | `function` | 2963–2974 | Un-normalised cosmic-ray proxy at sim-time `ts`: nearest-spiral-arm proximity (gaussian in angle) plus mid-plane proximity from the vertical wobble. Returns `{cr, armProx}`. | `astro/environment` | `V_GAL` (1538), `R_GAL` (1537), `ARMS` (1676), `armAngle` (1675), `WOB_T` (1622) | — | P |
| 5 | `CR0` | `const` | 2975 | `rawCR(0).cr` — the normalisation constant that makes today read exactly 1.00x. **Computed by calling a function at module-evaluation time.** | `astro/environment` | `rawCR` (in range, 2963) → transitively `V_GAL`, `R_GAL`, `ARMS`, `armAngle`, `WOB_T` | — | **E** (pure math, no randomness) |
| 6 | `environment` | `function` | 2976–2996 | The full galactic-environment readout: cosmic-ray ratio with the spiral term faded out by `mergeAt`, contested cloud-coupling ΔT, then rescaled by `sunState(...).L^0.25`; returns `{cr, mean, min, max, star, ice}`. | `astro/environment` | **`simT` (5029 — LATER)**, `mergeAt` (2428); in-range: `rawCR`, `CR0`, `ageGyr`, `sunState` | — | R |

## 3. The real sky — Gaia/AT-HYG loaders (2998–3052)

| # | Name | Kind | Lines | What it is | Target module | External deps | Touches | Purity |
|---|---|---|---|---|---|---|---|---|
| 7 | `vaoGaia` | `let` | 3006 | VAO handle for the 100k-star bright catalogue; `null` until the fetch lands. | `scene/sky` | — | gl (indirectly) | M (mutated at 3039) |
| 8 | `N_GAIA` | `let` | 3006 | Star count for `vaoGaia`. | `scene/sky` | — | — | M (3039) |
| 9 | `gaiaOn` | `let` | 3006 | User toggle for the real sky. Default `true`. | `scene/sky` (state read by `render/passes`) | — | — | M — **written from OUTSIDE this range at 3943** (`toggle($('tGaia'), on=> gaiaOn=on)`) |
| 10 | `parseStarBin` | `function` | 3007–3036 | Decodes the `GSK2` 20-byte (or legacy 16-byte) star record binary into pos/size/colour/velocity Float32Arrays and uploads them via `pointVAO`. Returns `{n, vao}`. | `scene/sky` | `pointVAO` (1869) | gl (via `pointVAO`) | E-at-call; mutates GL state, no module state |
| 11 | `loadGaiaStars` | `function` | 3037–3041 | `fetch('stars-gaia.bin')` → `parseStarBin` → assigns `vaoGaia`/`N_GAIA`. Swallows failure (file:// has fetch blocked). | `scene/sky` | `fetch` | gl, net | M (async) |
| 12 | `vaoGaiaDeep` | `let` | 3042 | VAO handle for the optional 400k-star deep catalogue. | `scene/sky` | — | gl | M (3047) |
| 13 | `N_GAIA_DEEP` | `let` | 3042 | Star count for `vaoGaiaDeep`. | `scene/sky` | — | — | M (3047) |
| 14 | `deepAsked` | `let` | 3042 | One-shot latch so the 8 MB deep fetch is issued at most once (reset on failure). | `scene/sky` | — | — | M (3045, 3048) |
| 15 | `loadGaiaDeep` | `function` | 3043–3049 | Guarded fetch of `stars-gaia-deep.bin`, triggered the first time a heavy quality is selected. | `scene/sky` | `fetch` | gl, net | M |
| 16 | *(bare)* `loadGaiaStars();` | statement | 3050 | Kicks off the bright-sky fetch at boot. | `main.ts` | in-range `loadGaiaStars` | net | **E** |
| 17 | *(bare)* `loadGalaxyMap();` | statement | 3051 | Kicks off the galaxy-map fetch at boot. Its success callback calls `setGalaxy(curD)` (1930). | `main.ts` | `loadGalaxyMap` (1891) | net, gl | **E** |
| 18 | *(bare)* `loadM31Map();` | statement | 3052 | Kicks off the Andromeda-map fetch at boot. Its success callback calls `setGalaxy(curD)` (2357). | `main.ts` | `loadM31Map` (2293) | net, gl | **E** |

## 4. Gliese 710 (3054–3076)

| # | Name | Kind | Lines | What it is | Target module | External deps | Touches | Purity |
|---|---|---|---|---|---|---|---|---|
| 19 | `G710_AT` | `const` | 3060 | 1.29e6 — years from now to perihelion. | `astro/bodies` | — | — | P/const |
| 20 | `G710_PERI` | `const` | 3061 | 0.2204 — perihelion distance in light years. | `astro/bodies` | — | — | P/const |
| 21 | `G710_V` | `const` | 3062 | 4.804e-5 — ly/yr, from 14.4 km/s. | `astro/bodies` | — | — | P/const |
| 22 | `G710_DIR` | `const` **IIFE** | 3063 | Normalised travel direction `[0.62,-0.34,0.71]`. Evaluated eagerly by an IIFE. | `astro/bodies` | — | — | **E** (pure math) |
| 23 | `G710_OFF` | `const` **IIFE** | 3064–3069 | Perihelion offset unit vector: `[0,1,0]` Gram-Schmidt-orthogonalised against `G710_DIR`, normalised. Evaluated eagerly. | `astro/bodies` | in-range `G710_DIR` (3063) — **strict declaration-order dependency** | — | **E** (pure math) |
| 24 | `g710` | `function` | 3070–3076 | Gliese 710's Sun-relative position and distance at the current `simT`. | `astro/bodies` | **`simT` (5029 — LATER)**; in-range `G710_AT/_V/_OFF/_PERI/_DIR` | — | R |

## 5. Life support and the Sun's own life (3077–3183)

| # | Name | Kind | Lines | What it is | Target module | External deps | Touches | Purity |
|---|---|---|---|---|---|---|---|---|
| 25 | `lifeOn` | `let` | 3083 | Master flag: are stellar births/deaths simulated at all. Default `false`. | `render/state` | — | — | M — **written from OUTSIDE at 3809** (`syncLife`), read at 5283, 5599, 5643 |
| 26 | `SUN_MS_END` | `const` | 3090 | 10.9 Gyr — main-sequence turn-off. | `astro/sun` | — | — | P/const |
| 27 | `SUN_RGB_TIP` | `const` | 3090 | 12.17 Gyr — red-giant-branch tip. | `astro/sun` | — | — | P/const |
| 28 | `SUN_HB` | `const` | 3090 | 12.30 Gyr — horizontal branch after the helium flash. | `astro/sun` | — | — | P/const |
| 29 | `SUN_AGB` | `const` | 3090 | 12.37 Gyr — asymptotic-giant end / envelope ejection. | `astro/sun` | — | — | P/const |
| 30 | `SUN_WD` | `const` | 3090 | 12.44 Gyr — white dwarf. | `astro/sun` | — | — | P/const |
| 31 | `EARTH_ORBIT_RSUN` | `const` | 3091 | 215.0 — 1 AU in solar radii. | `astro/sun` | — | — | P/const |
| 32 | `SUN_EAT_AGE` | `const` | 3095 | Age at which the swelling photosphere first reaches Earth's orbit, from the log-radius interpolation on the first climb. **Computed at eval time.** | `astro/sun` | in-range `SUN_MS_END`, `EARTH_ORBIT_RSUN`, `SUN_RGB_TIP` | — | **E** (pure math) |
| 33 | `sunState` | `function` | 3096–3133 | The Sun's L, R, effective T, phase name, `eaten`, `gone` for any age, across the six phases (MS, RGB, He flash, AGB, PN, WD). | `astro/sun` | in-range `SUN_MS_END/_RGB_TIP/_HB/_AGB/_WD`, `SUN_EAT_AGE` | — | P |
| 34 | `eatAge` | `const` arrow | 3136 | The rule behind `SUN_EAT_AGE`, generalised to any radius in solar radii. | `astro/sun` | in-range `SUN_MS_END`, `SUN_RGB_TIP` | — | P |
| 35 | `EAT_AGES` | `const` | 3139 | `[0, eatAge(Mercury), eatAge(Venus), eatAge(Earth)]` — indexed by body index 1..3. **Computed at eval time by calling `eatAge`.** | `astro/sun` | in-range `eatAge` (3136 — **a `const` arrow, so a real TDZ edge if reordered**), `EARTH_ORBIT_RSUN` | — | **E** (pure math) |
| 36 | `wasEaten` | `const` array | 3140 | 4-slot latch: has body *i* been engulfed. Element-mutated. | `render/state` | — | — | M — **mutated from OUTSIDE at 5315** (frame loop); read at 5313, 5331, 5335, 5366, 5682, 5796, 5951 |
| 37 | `eatFlash` | `const` array | 3140 | 4-slot engulfment-flare timers; `-1` means no flare running. | `render/state` | — | — | M — **mutated from OUTSIDE at 5313, 5314, 5316**; read at 5905 |
| 38 | `SUN_ANCHORS` | `const` | 3144–3152 | 7 temperature anchors → (dark, bright, dot) RGB triples for the photosphere palette. The 5772 K row pins today's look exactly. | `astro/sun` | — | — | P/const |
| 39 | `sunTint` | `function` | 3153–3159 | Interpolates `SUN_ANCHORS` in log T, clamped to 2400–60000 K; returns `{d, b, dot}`. | `astro/sun` | in-range `SUN_ANCHORS` | — | P |
| 40 | `pnState` | `function` | 3164–3172 | Planetary-nebula shell state after `SUN_AGB`: radius in AU, alpha, age fraction; `null` outside the window. | `astro/sun` | in-range `SUN_AGB`, `SUN_WD` | — | P |
| 41 | `lifeState` | `function` | 3173–3183 | Habitability hazard: max of the Hadean magma-ocean term, the solar-brightening term and the SFR×CR radiation term; returns `{h, why, label}`. | `astro/environment` | in-range `ageGyr`, `environment`, `sfrFactor` | — | R (via `environment` → `simT`) |

## 6. Stellar life cycle — variability clock (3185–3191)

| # | Name | Kind | Lines | What it is | Target module | External deps | Touches | Purity |
|---|---|---|---|---|---|---|---|---|
| 42 | `varOn` | `let` | 3191 | Toggle: do variable stars shimmer. Default `true`. | `render/state` | — | — | M — **written from OUTSIDE at 3820**; read at 5420, 5444, 5594, 5634 |
| 43 | `shimT` | `let` | 3191 | Wall-clock shimmer phase; keeps advancing while the sim is paused. | `render/state` | — | — | M — **incremented from OUTSIDE at 5245**; read at 5417, 5443, 5806, 5874, 5890, and in-range at 3470 |

## 7. Web Audio — engine (3193–3220)

| # | Name | Kind | Lines | What it is | Target module | External deps | Touches | Purity |
|---|---|---|---|---|---|---|---|---|
| 44 | `soundOn` | `let` | 3194 | Effects master on/off; silence is the off position. Default `false`. | `audio/engine` | — | — | M — **written from OUTSIDE at 4175, 4179** (`setSfxVol`); read at 3950 and in-range at 3199, 3331 |
| 45 | `sfxVol` | `let` | 3194 | Effects volume 0..1. Default `0`. | `audio/engine` | — | — | M — **written from OUTSIDE at 4172**; read at 3950, 4182, 4195 and in-range at 3199, 3324 |
| 46 | `audio` | `let` | 3194 | The built audio graph `{ctx, master, comp, droneG}`, or `null` before the first volume raise. | `audio/engine` | — | WA | M — **written from OUTSIDE at 4176**; read at 3947–3950, 4106–4110, 4144, 4164–4167, 4177, 4609, 5000, 5009, 5012, 5017 |
| 47 | `sfxLast` | `const` object | 3195 | Per-kind last-play timestamps used for the retrigger gap. Element-mutated in `sfx`. | `audio/sfx` | — | — | M (3336) |
| 48 | `initAudio` | `function` | 3196–3220 | Builds the whole graph: compressor → master gain → drone gain → pad gain, six sine partials, a 4 s filtered noise loop, and a 0.05 Hz LFO on the pad gain. Returns the handles. | `audio/engine` | `window.AudioContext` / `window.webkitAudioContext`; in-range `soundOn`, `sfxVol` | WA, **rnd (line 3211)**, window | R + side effects at call time (**not** at eval time) |

## 8. Web Audio — background music (3221–3248)

| # | Name | Kind | Lines | What it is | Target module | External deps | Touches | Purity |
|---|---|---|---|---|---|---|---|---|
| 49 | `TRACKS` | `const` | 3224–3228 | The three shipped ambient mp3s: `{src, name}`. | `audio/music` | — | — | P/const |
| 50 | `musicOn` | `let` | 3229 | Music on/off. Default `true`. | `audio/music` | — | — | M — **written from OUTSIDE at 4151**; read at 4150, 4159, 5002, 5009, 5019 |
| 51 | `musicVol` | `let` | 3229 | Music volume. Default `0.40`. | `audio/music` | — | — | M — **written from OUTSIDE at 4147**; read at 4155, 4159, 4195 |
| 52 | `trackIx` | `let` | 3229 | Index of the current track. | `audio/music` | — | — | M — **read from OUTSIDE at 4152**; mutated in-range at 3243 |
| 53 | `player` | `const` | 3230 | `new Audio()` — the media element that plays the mp3s. **Constructed at eval time.** | `audio/music` | `Audio` (global) | WA/DOM | **E** |
| 54 | *(bare)* `player.preload = 'none'` | statement | 3231 | Nothing is fetched until music is actually started. | `audio/music` | in-range `player` | WA | **E** |
| 55 | *(bare)* `player.volume = musicVol` | statement | 3232 | Seeds the element volume from the default. | `audio/music` | in-range `player`, `musicVol` | WA | **E** |
| 56 | *(bare)* `player.addEventListener('ended', …)` | statement | 3233 | Advance to the next track on end. Handler body calls `nextTrack` (hoisted `function`, 3248 — safe). | `audio/music` | in-range `player`, `nextTrack` | WA, **EV** | **E** |
| 57 | *(bare)* `player.addEventListener('error', …)` | statement | 3234 | Writes `'track unavailable'` into `#trackName`. **Handler body reads `$`, a `const` declared at 3591 — 357 lines below this registration.** | `audio/music` | **`$` (3591 — LATER)**, `#trackName` element (HTML line 402) | DOM, WA, **EV** | **E** (registration) |
| 58 | `showTrack` | `function` | 3235 | Writes `"n/N · name"` into `#trackName`. | `audio/music` | **`$` (3591 — LATER)**, `#trackName` (HTML 402); in-range `trackIx`, `TRACKS` | DOM | R |
| 59 | `playTrack` | `function` | 3236–3241 | `player.play()`, arming the gesture unlock on rejection; hands the promise back. | `audio/music` | in-range `musicOn`, `player`, `armUnlock` | WA | R |
| 60 | `loadTrack` | `function` | 3242–3247 | Wraps the index, sets `player.src`, updates the label, plays. | `audio/music` | in-range `TRACKS`, `trackIx`, `player`, `showTrack`, `playTrack` | DOM, WA | M |
| 61 | `nextTrack` | `function` | 3248 | `loadTrack(trackIx + 1)`. | `audio/music` | in-range `loadTrack`, `trackIx` | DOM, WA | M |

## 9. Web Audio — autoplay gesture unlock (3249–3275)

| # | Name | Kind | Lines | What it is | Target module | External deps | Touches | Purity |
|---|---|---|---|---|---|---|---|---|
| 62 | `UNLOCK_EVENTS` | `const` | 3256 | `['pointerdown','pointerup','touchend','click','keydown']`. | `audio/engine` | — | — | P/const |
| 63 | `unlockArmed` | `let` | 3257 | Is the unlock listener set currently installed. | `audio/engine` | — | — | M (3259, 3260, 3263) |
| 64 | `armUnlock` | `function` | 3258–3275 | Installs `go` on all five gesture events; `go` resumes the context, loads the sample banks, and retries playback, disarming only once playback genuinely resolved. | `audio/engine` | `addEventListener`/`removeEventListener` (window); in-range `unlockArmed`, `UNLOCK_EVENTS`, `audio`, `loadBanks`, `musicOn`, `player`, `playTrack`, `loadTrack`, `trackIx` | WA, **EV (window)** | M |

## 10. Web Audio — sample banks and sfx (3276–3366)

| # | Name | Kind | Lines | What it is | Target module | External deps | Touches | Purity |
|---|---|---|---|---|---|---|---|---|
| 65 | `BANKS` | `const` | 3281–3284 | Two banks — 5 supernova blasts, 4 ignitions — each with `src`, `gain`, `max`, `bufs`, `els`, `voices`. Deeply mutated. | `audio/sfx` | — | — | M (3303, 3293, 3319) |
| 66 | `banksLoading` | `let` | 3291 | Latch held only while a decode attempt is in flight, so a hung decode cannot kill the samples for the visit. | `audio/sfx` | — | — | M (3298, 3300, 3306) |
| 67 | `banksDone` | `const` arrow | 3292 | `b => !!(b.bufs || b.els)`. | `audio/sfx` | — | — | P |
| 68 | `elFallback` | `function` | 3293 | Installs plain `<audio>` elements as the fallback when decode is impossible (file://). | `audio/sfx` | `Audio` (global); in-range `banksDone` | WA | M |
| 69 | `loadBanks` | `function` | 3294–3307 | Fetches + `decodeAudioData`s every not-yet-loaded bank, with a 6 s `setTimeout` that force-installs the element fallback. | `audio/sfx` | `fetch`, `setTimeout`; in-range `banksLoading`, `audio`, `BANKS`, `banksDone`, `elFallback` | WA, net | M |
| 70 | `playBank` | `function` | 3308–3328 | Plays a randomly chosen sample from bank `k` with random detune, voice-capped; falls back to a cloned `<audio>` element. Returns whether anything played. | `audio/sfx` | in-range `BANKS`, `audio`, `sfxVol` | WA, **rnd (3315, 3316, 3323)** | R |
| 71 | `fxOn` | `const` object | 3329 | Per-effect enable flags `{birth, sn, pn, drone}`. | `audio/sfx` | — | — | M — **mutated from OUTSIDE at 4163** |
| 72 | `sfx` | `function` | 3330–3366 | The effect entry point: gap-limits per kind, plays the bank for `birth`, bank-or-synth for `sn`, and a synthesised airy exhale for `pn`. | `audio/sfx` | in-range `soundOn`, `audio`, `fxOn`, `BANKS`, `banksDone`, `loadBanks`, `sfxLast`, `playBank` | WA, **rnd (3349, 3358)** | M |

## 11. Event and puff buffers (3367–3392)

| # | Name | Kind | Lines | What it is | Target module | External deps | Touches | Purity |
|---|---|---|---|---|---|---|---|---|
| 73 | `EV_CAP` | `const` | 3367 | 1024 — max concurrent life-cycle events. | `render/state` | — | — | P/const |
| 74 | `PUFF_CAP` | `const` | 3367 | 512 — max concurrent remnant puffs. | `render/state` | — | — | P/const |
| 75 | `evPos` | `const` Float32Array | 3368 | Event sprite positions, `EV_CAP*3`. | `render/state` | — | — | **E** (allocation); M at 3484 |
| 76 | `evSize` | `const` Float32Array | 3368 | Event sprite sizes. | `render/state` | — | — | **E**; M at 3485 |
| 77 | `evCol` | `const` Float32Array | 3368 | Event sprite colours. | `render/state` | — | — | **E**; M at 3485 |
| 78 | `evWave` | `const` Float32Array | 3368 | Event wave flags. | `render/state` | — | — | **E**; M at 3485 |
| 79 | `pfPos` | `const` Float32Array | 3369 | Puff positions, `PUFF_CAP*3`. | `render/state` | — | — | **E**; M at 3491 |
| 80 | `pfSize` | `const` Float32Array | 3369 | Puff sizes. | `render/state` | — | — | **E**; M at 3492 |
| 81 | `pfCol` | `const` Float32Array | 3369 | Puff colours. | `render/state` | — | — | **E**; M at 3493 |
| 82 | `pfWave` | `const` Float32Array | 3369 | Packed wave flag + shell phase. | `render/state` | — | — | **E**; M at 3496 |
| 83 | `dynVAO` | `function` | 3370–3382 | Creates a 4-attribute `DYNAMIC_DRAW` point VAO of capacity `cap` and leaves `bindVertexArray(null)`. **Also used outside this range at 4811 and 5186.** | `gpu/buffers` | `gl` (1189) | **gl** | side effect at call time |
| 84 | `evGL` | `const` | 3383 | `dynVAO(EV_CAP)` — **GL objects created at module-evaluation time.** | `render/state` (buffers) | `gl` (1189); in-range `dynVAO`, `EV_CAP` | **gl** | **E** |
| 85 | `pfGL` | `const` | 3383 | `dynVAO(PUFF_CAP)` — **GL objects created at eval time.** | `render/state` | `gl` (1189); in-range `dynVAO`, `PUFF_CAP` | **gl** | **E** |
| 86 | `SN_CAP` | `const` | 3387 | 96 — max simultaneous supernova blasts. | `render/state` | — | — | P/const |
| 87 | `snPos` | `const` Float32Array | 3388 | Blast positions. | `render/state` | — | — | **E**; M at 3458 |
| 88 | `snSize` | `const` Float32Array | 3388 | Blast sizes. | `render/state` | — | — | **E**; M at 3459 |
| 89 | `snCol` | `const` Float32Array | 3389 | Blast colours. | `render/state` | — | — | **E**; M at 3460 |
| 90 | `snPh` | `const` Float32Array | 3389 | Blast phase (how far the shell has run). | `render/state` | — | — | **E**; M at 3461 |
| 91 | `snGL` | `const` | 3390 | `dynVAO(SN_CAP)` — **GL objects created at eval time.** | `render/state` | `gl` (1189); in-range `dynVAO`, `SN_CAP` | **gl** | **E** |
| 92 | `evN` | `let` | 3391 | How many event sprites the last `fillEvents()` wrote. | `render/state` | — | — | M (3447, 3483); **read from OUTSIDE at 5606–5611** |
| 93 | `snN` | `let` | 3391 | How many blasts the last `fillEvents()` wrote. | `render/state` | — | — | M (3447, 3457); **read from OUTSIDE at 5614, 5624–5628** |
| 94 | `events` | `const` array | 3392 | The live life-cycle event list. | `render/state` | — | — | M — **mutated from OUTSIDE at 3811, 3812, 3815, 3816 (`syncLife`) and 4405 (epoch jump)**; read at 5598–5604, 6020, 6023 |
| 95 | `puffs` | `const` array | 3392 | The live remnant-puff list. | `render/state` | — | — | M — **mutated from OUTSIDE at 3813, 3816, 4405**; read at 5643, 5654–5658 |

## 12. Stellar life cycle — stepping and filling (3393–3498)

| # | Name | Kind | Lines | What it is | Target module | External deps | Touches | Purity |
|---|---|---|---|---|---|---|---|---|
| 96 | `armSite` | `function` | 3393–3401 | Draws a massive-star birth site: 12% bar tip, 18% the local spur, 70% one of the four arms' inner edges, all gaussian-scattered in θ and z. | `scene/galaxy` | `BAR_A` (1673), `BAR_L` (1672), `PITCH` (1671), `ARMS` (1676), `armAngle` (1675), `gauss` (1649) | **rnd (3396, 3396, 3396, 3397, 3398 ×4, 3399)** | consumes randomness |
| 97 | `diskSite` | `function` | 3402–3405 | Draws an old-star death site from the exponential disk profile. | `scene/galaxy` | `expR` (1651), `gauss` (1649) | **rnd (3403)** | consumes randomness |
| 98 | `addPuff` | `function` | 3406–3409 | Appends a remnant puff, capped at `PUFF_CAP`. | `render/state` | in-range `puffs`, `PUFF_CAP` | — | M |
| 99 | `accB` | `let` | 3410 | Fractional accumulator for births. | `render/state` | — | — | M (3417, 3423, 3426); **reset from OUTSIDE at 4406** |
| 100 | `accSN` | `let` | 3410 | Fractional accumulator for supernovae. | `render/state` | — | — | M (3419, 3421, 3427, 3429); **reset from OUTSIDE at 4406** |
| 101 | `accPN` | `let` | 3410 | Fractional accumulator for low-mass deaths. | `render/state` | — | — | M (3420, 3421, 3430, 3432); **reset from OUTSIDE at 4406** |
| 102 | `lifeStep` | `function` | 3413–3445 | Per-frame simulation of the whole life cycle: accumulates rates by SFR and density, spawns up to 40 of each kind per step, advances every event through its phase machine (`k` 1→2→3→5, 4→6), fires `sfx`, retires expired puffs. | `render/frame` | `evBirth` (**3807 — LATER**), `evSN` (**3807 — LATER**), `curD` (1597); in-range `sfrFactor`, `ageGyr`, `EV_CAP`, `events`, `armSite`, `diskSite`, `sfx`, `addPuff`, `puffs`, `acc*` | **rnd (3424 ×2, 3425)**, WA (via `sfx`) | M; consumes randomness |
| 103 | `fillEvents` | `function` | 3446–3487 | Walks `events`, writing blasts (`k===3`) into the `sn*` arrays and everything else compacted into the `ev*` arrays with per-kind size/colour curves. Sets `evN`, `snN`. | `render/frame` (feeds `render/passes`) | in-range `events`, `SN_CAP`, `sn*`, `ev*`, `evN`, `snN`, `shimT` | — | R + M (typed arrays) |
| 104 | `fillPuffs` | `function` | 3488–3498 | Writes every puff's expanded radius, faded colour and packed wave/phase into the `pf*` arrays. | `render/frame` | in-range `puffs`, `pf*` | — | R + M |

---

## Mutable module-level state declared here that OTHER parts of the file mutate

| Symbol | Line | Mutated from | Notes |
|---|---|---|---|
| `gaiaOn` | 3006 | 3943 (`toggle($('tGaia'), on=> gaiaOn=on)`) | Read in the draw at 5543. Pure UI→render channel. |
| `lifeOn` | 3083 | 3809 (`syncLife`) | Read at 5283 (gates `lifeStep`), 5599, 5643. |
| `wasEaten` | 3140 | 5315 (frame loop, element write) | Also read at 5313, 5331, 5335, 5366, 5682, 5796, 5951. Array identity is `const`, contents are not. |
| `eatFlash` | 3140 | 5313, 5314, 5316 (frame loop) | Read at 5905. |
| `varOn` | 3191 | 3820 (`toggle($('tVar'), …)`) | Read at 5420, 5444, 5594, 5634. |
| `shimT` | 3191 | 5245 (`shimT += dt`) | Read at 5417, 5443, 5806, 5874, 5890 and in-range at 3470. Wall clock, runs while paused. |
| `soundOn` | 3194 | 4175, 4179 (`setSfxVol`) | Read at 3950 and in-range at 3199, 3331. |
| `sfxVol` | 3194 | 4172 (`setSfxVol`) | Read at 3950, 4182, 4195 and in-range at 3199, 3324. |
| `audio` | 3194 | 4176 (`audio = initAudio()`) | The single most widely read symbol in this slice: 20 external read sites (3947–3950, 4106–4110, 4144, 4164–4167, 4177, 4609, 5000, 5009, 5012, 5017). |
| `musicOn` | 3229 | 4151 (`setMusicVol`) | Read at 4150, 4159, 5002, 5009, 5019. |
| `musicVol` | 3229 | 4147 (`setMusicVol`) | Read at 4155, 4159, 4195. |
| `trackIx` | 3229 | in-range only (3243) | Read externally at 4152. |
| `fxOn` | 3329 | 4163 (checkbox handler, element write) | Read in-range at 3331. |
| `events` | 3392 | 3811, 3812, 3815, 3816 (`syncLife` splices/clears), 4405 (`events.length = 0` on epoch jump) | Read at 5598–5604, 6020, 6023. |
| `puffs` | 3392 | 3813, 3816 (`syncLife`), 4405 | Read at 5643, 5654–5658. |
| `accB`, `accSN`, `accPN` | 3410 | 4406 (`accB = accSN = accPN = 0` on epoch jump) | Otherwise in-range only. |
| `evN`, `snN` | 3391 | in-range only (`fillEvents`) | Read externally at 5606–5611 and 5614, 5624–5628. One-way: the frame writes them, the draw reads them. |
| `vaoGaia`, `N_GAIA` | 3006 | in-range only (async, 3039) | Read at 5543, 5556. |
| `vaoGaiaDeep`, `N_GAIA_DEEP` | 3042 | in-range only (async, 3047) | Read at 5557. |
| `deepAsked` | 3042 | in-range only (3045, 3048) | **Reached from outside via `loadGaiaDeep()` called at 2066 inside `setGalaxy` — see hazard H1.** |
| `BANKS.*.bufs / .els / .voices` | 3281–3284 | in-range only | Deep mutation of a `const` object. |
| `sfxLast` | 3195 | in-range only | Deep mutation of a `const` object. |
| `player.src / .volume` | 3230 | 4147 (`player.volume = v`), 4152–4153, 5001, 5009, 5011, 5019 | The media element's own state is module state in practice. |

## Randomness consumed at evaluation time

**None in this range.** Every `Math.random` call sits inside a function body:

| Line | Site | Enclosing function |
|---|---|---|
| 3211 | noise-buffer fill for the ambient drone | `initAudio` (3196) |
| 3315, 3316 | sample pick + detune | `playBank` (3308) |
| 3323 | element-fallback sample pick | `playBank` (3308) |
| 3349 | supernova synth noise fill | `sfx` (3330) |
| 3358 | planetary-nebula synth noise fill | `sfx` (3330) |
| 3396 (×3), 3397, 3398 (×4), 3399 | birth-site draw | `armSite` (3393) |
| 3403 | death-site angle | `diskSite` (3402) |
| 3424 (×2), 3425 | cluster lifetime, SN flag, sound coin-flip | `lifeStep` (3413) |

Consequently **this slice adds nothing to the boot-time PRNG stream**, and moving it relative to other modules cannot shift the seeded sequence — *provided* the eval-time statements it does have (16–18, 53–57, 84, 85, 91) keep their relative position, since 17/18 (`loadGalaxyMap`/`loadM31Map`) resolve into `setGalaxy(curD)` callbacks that *do* consume randomness when they rebuild the galaxy. Those are async and therefore already after the whole script, but their *issue order* (Gaia, then galaxy map, then M31) determines callback arrival order on a warm cache and must be preserved verbatim.

Non-random eval-time computation in this range (safe for parity, but order-sensitive for TDZ): 3063 `G710_DIR`, 3064–3069 `G710_OFF`, 2975 `CR0`, 3095 `SUN_EAT_AGE`, 3139 `EAT_AGES`.

Eval-time GL object creation: 3383 (`evGL`, `pfGL`), 3390 (`snGL`) — three `dynVAO` calls that create VAOs and buffers and leave the VAO binding at `null`.

Eval-time DOM/media construction: 3230 `new Audio()`, 3231–3232 property writes, 3233–3234 listener registrations.

Eval-time network: 3050, 3051, 3052.

## Boot-order hazards

**H1 — `deepAsked` TDZ, already documented in the file, still live.**
`setGalaxy` (2040) contains `if(D >= 5) loadGaiaDeep();` at line **2066**. `loadGaiaDeep` is a hoisted `function` (3043) but its first statement reads `deepAsked`, a `let` at **3042**. `setGalaxy(1)` is invoked at **eval time at line 2365** — 677 lines above the declaration. It survives only because the argument is hardcoded to `1`. The comment at 6155–6159 says so explicitly: *"the initial synchronous build above is deliberately 'lowest' (D=1) to dodge a load-order trap"*. Any refactor that makes the initial density configurable, or that hoists a saved-settings density read above line 3042, is an instant `ReferenceError` at boot. In the module world this becomes a genuine import cycle: `scene/galaxy` (setGalaxy) → `scene/sky` (loadGaiaDeep) with `scene/sky`'s module body not yet evaluated.

**H2 — `$` is used 357 lines before it is declared.**
`$` is `const $=id=>document.getElementById(id)` at **3591**. It is referenced at **3234** (inside the `player` `'error'` listener) and **3235** (`showTrack`). Line 3234 *registers* the listener at eval time; if a media `error` event were to fire between 3234 and 3591 the handler would throw a TDZ `ReferenceError`. Today `player.preload='none'` and `player.src` is unset until `loadTrack(0)` at **4187**, so the window is empty in practice — but it is empty by accident, not by construction. `audio/music` must import `core/dom`'s `$`, and the listener registration must not be hoisted above the point where music actually starts.

**H3 — `simT` is declared at 5029, 2000+ lines below three functions in this slice that read it.**
`ageGyr` (2942), `environment` (2976) and `g710` (3070) all close over `simT` (`let simT=0` at 5029). None of them is called at eval time in this range — `CR0` at 2975 deliberately calls `rawCR(0)` with an explicit zero rather than `rawCR(simT)`, which is what keeps it safe. Every external caller (`updateAnd` 2443 called only from 5397; `minDist` 3555; 3879; 5296–5331; 5797; 5863; 6032–6087) fires after the script has finished evaluating. This is the single largest forward reference in the slice: in the module split, `astro/calendar` must not evaluate anything that calls `ageGyr`, and `render/state`'s `simT` must be initialised before the first frame — but `astro/*` importing `render/state` inverts the intended dependency direction and would reintroduce the cycle.

**H4 — `evSN` / `evBirth` are declared at 3807, read by `lifeStep` at 3417–3424.**
`let evSN = false, evBirth = false;` sits **414 lines below** `lifeStep` (3413). Safe only because `lifeStep` is gated behind `if(lifeOn)` at 5283, and `lifeOn` is itself only ever set true by `syncLife` (3808) which lives *after* the declarations. Any change that calls `lifeStep` earlier — a warm-up frame, a preroll, a screenshot harness that ticks the sim before the UI section runs — is a TDZ throw.

**H5 — `EAT_AGES` (3139) is built at eval time by calling `eatAge` (3136), a `const` arrow.**
Unlike `sunState`/`sfrFactor` (hoisted `function` declarations, immune to reordering), `eatAge` is a `const` arrow and `EAT_AGES` calls it three lines later. The pair must stay in this order in `astro/sun`. Same shape at 3064: `G710_OFF`'s IIFE reads `G710_DIR` declared one line above.

**H6 — `CR0` (2975) calls `rawCR` at eval time, which reads five constants from three other slices.**
`ARMS` (1676), `armAngle` (1675), `R_GAL` (1537), `V_GAL` (1538), `WOB_T` (1622). If `astro/environment` is evaluated before `astro/constants`, `CR0` throws at import time and the page dies before the first frame. The error-log collector at the top of the file must therefore be evaluated strictly before any `astro/*` module — this is an import-order constraint on `main.ts`, not something the bundler will get right by accident.

**H7 — `evGL`/`pfGL`/`snGL` (3383, 3390) call `dynVAO`, which touches `gl` (1189), at eval time.**
Three eval-time WebGL allocations. `gpu/context` must be fully evaluated before `render/state`. They also leave global GL state modified (`bindVertexArray(null)`, four `enableVertexAttribArray` calls against each new VAO), so their position relative to other eval-time GL setup — `vaoSunPt` (5188), `g710GL` (4811), `eatGL` (5186) — is observable if any of those depends on the current binding.

**H8 — element ids this slice reaches for by string.**
Only one: `#trackName` (HTML line 402), read at 3234 and 3235. Renaming it silently breaks the track label with no parse error. `#tGaia` (3943), `#tVar` (3820), `#tEvSN`/`#tEvBirth` (3818–3819), `#sfxVol`/`#musicVol`/`#tNext` (4182, 4155, 4156) and `#fxBirth`/`#fxSn`/`#fxPn`/`#fxDrone` (4162) write into this slice's state from outside it and belong to the same id contract.

**H9 — `dynVAO` (3370) is consumed by three later slices.**
Call sites at 4811 (`g710GL`) and 5186 (`eatGL`) are outside this range and are themselves eval-time. Extracting `dynVAO` into `gpu/buffers` is right, but it means `gpu/buffers` must be evaluated before *three separate* eval-time consumers spread across the file.

**H10 — `armUnlock` registers listeners on the bare global scope.**
Line 3274 uses `addEventListener(t, go)` with no receiver (implicitly `window`), and 3264 the matching `removeEventListener`. Under a bundler that emits ESM in strict mode with a module scope this still resolves to `window`, but any wrapper that introduces a local named `addEventListener` (or a `this`-rebinding IIFE) changes the target silently. `armUnlock` is called from 4177, 5018, 5019 and in-range from 3239 and 3267.
