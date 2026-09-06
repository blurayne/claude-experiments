# Inventory slice 06 — camera & interaction, UI block, movable panels, collapsible sections

Source: `galactic-transit.html`, lines **3500–4186** (inclusive). File total: 6431 lines.
Everything below is scoped to that range only. Line numbers are 1-indexed against the current file.

Section markers inside the range:

| line | marker |
|---|---|
| 3500 | `// ---------- camera & interaction ----------` |
| 3590 | `// ---------- UI ----------` |
| 3952 | `// ---------- movable panels ----------` |
| 4102 | `// ---------- collapsible sections ----------` |
| 4187 | (next section, out of range) `// ---------- remembering the settings ----------` |

**Row count: 135 top-level declarations / side-effecting statements.**

Touch legend: `DOM` = reads/writes elements or classes; `evt` = registers a window/document/element listener; `LS` = localStorage; `WA` = Web Audio; `gl` = WebGL; `rnd` = Math.random. **No `gl.*` call and no `Math.random()` call occurs anywhere in 3500–4186.**

---

## 1. Camera & interaction (3500–3588) → `render/camera.ts`

| # | name | kind | lines | what it is | target module | external deps (read, not declared here) | touches | purity |
|---|---|---|---|---|---|---|---|---|
| 1 | `cam` | const (object literal) | 3501 | The camera record: `{yaw, pitch, dist, distGoal, target[3], follow}`. The single most-shared mutable object in the file. | `render/camera.ts` | — | — | side effect at eval time (allocates); object is mutated everywhere afterwards |
| 2 | `coreLock` | let | 3502 | Dive flag: hold the camera on the Sun→core line. | `render/camera.ts` | — | — | mutable module state |
| 3 | `followTarget` | let | 3505 | Which absolute-frame body `cam.follow` tracks: `'sun' \| 'earth' \| 'moon' \| 'and'`. | `render/camera.ts` | — | — | mutable module state |
| 4 | `dragging`, `px`, `py` | let (3 names, one stmt) | 3506 | One-pointer orbit drag state and last client position. | `render/camera.ts` | — | — | mutable module state |
| 5 | `holding` | let | 3509 | True while any pointer/finger is down; the sim clock holds. | `render/camera.ts` | — | — | mutable module state; read by the frame loop at 5253 |
| 6 | `touches` | const Map | 3510 | Every pointer currently down on the canvas, keyed by `pointerId`. | `render/camera.ts` | — | — | side effect at eval time (allocates); mutated by handlers |
| 7 | `panF` | const `[0,0]` | 3515 | Two-finger pan, as a signed fraction of viewport height along camera right/up. Clamped ±2. | `render/camera.ts` | — | — | side effect at eval time; elements mutated here and by 10 sites outside the range |
| 8 | `panCX`, `panCY` | let | 3516 | Last two-pointer centroid, in client px. | `render/camera.ts` | — | — | mutable module state |
| 9 | `panCentroid` | function | 3517 | Mean client x/y over `touches`. | `render/camera.ts` | — | — | reads mutable state (`touches`) |
| 10 | *(anon)* `canvas.addEventListener('pointerdown', …)` | side-effecting stmt | 3518–3526 | Registers pointer, sets `dragging`/`holding`, adds `.dragging` class, `setPointerCapture` in try/catch, seeds pan centroid on the 2nd finger. | `render/camera.ts` | `canvas` (1188) | DOM, evt | side effect at eval time (registration); handler mutates state |
| 11 | *(anon)* `canvas.addEventListener('pointermove', …)` | side-effecting stmt | 3527–3541 | Two-pointer pan accumulate; otherwise yaw/pitch orbit. Pitch clamped ±1.45. | `render/camera.ts` | `canvas` (1188), **`H` (4898, `let` — declared AFTER this range)**, **`SKY_MIRROR` (4982, `const` — AFTER)** | DOM, evt | side effect at eval time; handler mutates `cam`, `panF` |
| 12 | `endPointer` | function | 3542–3550 | Shared pointerup/pointercancel: drops the pointer, re-seats the drag on the remaining finger, restarts the pan centroid at 3→2. | `render/camera.ts` | `canvas` (1188) | DOM | mutates mutable state |
| 13 | *(anon)* `addEventListener('pointerup', endPointer)` | side-effecting stmt | 3551 | **window**-level, not canvas: a release off-canvas must still end the drag. | `render/camera.ts` | — | evt (window) | side effect at eval time |
| 14 | *(anon)* `addEventListener('pointercancel', endPointer)` | side-effecting stmt | 3552 | Same, for cancel. | `render/camera.ts` | — | evt (window) | side effect at eval time |
| 15 | `minDist` | const arrow | 3555–3556 | Zoom floor per follow target: Moon 5.5e-12 (2e-11 pre-impact), Earth 2e-11, else 2e-8 real / 25. | `render/camera.ts` | `followTarget` (in-range), `ageGyr` (2942), `MOON_BORN` (2768), `realMode` (1596) | — | reads mutable state |
| 16 | `ZOOM_OBJ` | const array[18] | 3563 | The object ladder in camera units, 1.2e-10 … 9500. | `render/camera.ts` | — | — | pure data |
| 17 | `ZOOM_RUNGS` | const array[35] | 3564 | `ZOOM_OBJ` with a geometric-mean rung interleaved. Derived at eval time. | `render/camera.ts` | `ZOOM_OBJ` | — | pure (deterministic derivation at eval) |
| 18 | `zoomStep` | function | 3565–3572 | One rung up/down in log space from `cam.distGoal`, clamped to `minDist()`…9500. | `render/camera.ts` | — | — | mutates `cam.distGoal` |
| 19 | *(anon)* `canvas.addEventListener('wheel', …, {passive:false})` | side-effecting stmt | 3573–3577 | `preventDefault` + exponential zoom; rate 0.0018 real / 0.0011. Ceiling 7500 (note: **not** the 9500 used by `zoomStep`). | `render/camera.ts` | `canvas` (1188), `realMode` (1596) | DOM, evt | side effect at eval time; handler mutates `cam` |
| 20 | `pinchD` | let | 3579 | Last two-touch spread, px. | `render/camera.ts` | — | — | mutable module state |
| 21 | *(anon)* `canvas.addEventListener('touchstart', …, {passive:true})` | side-effecting stmt | 3580 | Sets `holding`, seeds `pinchD`. | `render/camera.ts` | `canvas` (1188) | DOM, evt | side effect at eval time |
| 22 | *(anon)* `canvas.addEventListener('touchend', …, {passive:true})` | side-effecting stmt | 3581 | Clears `holding` when the last finger leaves. | `render/camera.ts` | `canvas` (1188) | DOM, evt | side effect at eval time |
| 23 | *(anon)* `canvas.addEventListener('touchmove', …, {passive:true})` | side-effecting stmt | 3582–3588 | Pinch zoom, ceiling 7500; also forces `dragging=false`. Runs **in addition to** the pointer handlers on touch devices. | `render/camera.ts` | `canvas` (1188) | DOM, evt | side effect at eval time; handler mutates `cam`, `dragging` |

---

## 2. UI block (3590–3951)

### 2a. DOM accessor and build stamps (3591–3597)

| # | name | kind | lines | what it is | target module | external deps | touches | purity |
|---|---|---|---|---|---|---|---|---|
| 24 | `$` | const arrow | 3591 | `id => document.getElementById(id)`. Used by ~everything from here to EOF. | `core/dom.ts` | — | DOM | pure wrapper; reads document |
| 25 | *(stmt)* `$('verInfo').textContent = VERSION` | side-effecting stmt | 3592 | Writes the version into the HUD. | `ui/hud.ts` | `VERSION` (1134) | DOM | side effect at eval time |
| 26 | *(stmt)* `$('buildStamp').textContent = BUILD_LINE` | side-effecting stmt | 3593 | Writes the local-time build line. | `ui/hud.ts` | `BUILD_LINE` (1159) | DOM | side effect at eval time |
| 27 | *(stmt)* `$('tourBuild').textContent = …` | side-effecting stmt | 3594 | Version + build line on the tour card. | `ui/hud.ts` | `VERSION`, `BUILD_LINE` | DOM | side effect at eval time |
| 28 | *(stmt)* `$('buildInfo').title = …` | side-effecting stmt | 3596–3597 | Hover title with the raw UTC stamp, suppressed when the placeholder `__BUILD_DATE__` is unsubstituted. | `ui/hud.ts` | `VERSION`, `BUILD` (1133) | DOM | side effect at eval time |

### 2b. Hard refresh / reset / debug-door tap counter (3603–3657)

| # | name | kind | lines | what it is | target module | external deps | touches | purity |
|---|---|---|---|---|---|---|---|---|
| 29 | `bustAndGo` | function | 3603–3608 | Reload on a cache-busted URL (`?_=Date.now()`), with an optional URL mutator. | `ui/settings.ts` | — | DOM (`location`) | side effect (navigates) |
| 30 | `doRefresh` | async function | 3609–3619 | Deletes every Cache Storage entry and unregisters every service worker, then `bustAndGo()`. All wrapped in a swallowing try/catch. | `ui/settings.ts` | — | DOM, `caches`, `navigator.serviceWorker` | side effect |
| 31 | *(bare block)* tap counter on `#tReload` | block statement | 3620–3657 | One button, three depths: 1 tap = hard refresh, 3 = clear settings (debug flag preserved) + reload, 10 = toggle the debug door. Fires 450 ms after the last tap. Inner names: `b` (3621), `taps`/`tapTimer` (3622), `act` (3623–3642), `flash` (3643–3649), the click listener (3650–3656). | `ui/settings.ts` | `setDebugUI` (6363, hoisted fn), **`DBGKEY` (6325, `const` — AFTER this range)** | DOM, LS, evt | side effect at eval time (registration); `act` mutates localStorage and navigates |

### 2c. Sim-state flags and the speed ladder (3658–3722)

| # | name | kind | lines | what it is | target module | external deps | touches | purity |
|---|---|---|---|---|---|---|---|---|
| 32 | `paused`, `showTrails`, `showLabels`, `showStats` | let (4 names) | 3658 | Master display/run flags. | `render/state.ts` | — | — | mutable module state |
| 33 | `showDwarfs`, `showBelt`, `showKuiper`, `showOort` | let (4 names) | 3659 | Body-class visibility flags. `showOort` is written **outside** this range (4267). | `render/state.ts` | — | — | mutable module state |
| 34 | `speed` | let | 3660 | Years per simulated second, before `speedMult`. Reassigned at 3722. | `render/state.ts` | — | — | mutable module state |
| 35 | `WEEK_YR` | const | 3661 | `7/365.2425`. | `astro/constants.ts` | — | — | pure |
| 36 | `HOUR_YR` | const | 3665 | `1/(24*365.2425)`. | `astro/constants.ts` | — | — | pure |
| 37 | `SPEED_RUNGS` | const array[31] | 3666–3671 | Slider ladder in yr/s: 12 hour rungs, 4 week rungs, 5 month rungs, then 1…10 yr. Built at eval time. | `ui/settings.ts` | `HOUR_YR`, `WEEK_YR` | — | pure derivation at eval |
| 38 | `SPEED_YEAR` | const `21` | 3672 | Index of the 1 yr/s rung. Hard-coded; must match `SPEED_RUNGS`. | `ui/settings.ts` | — | — | pure |
| 39 | `speedFromSlider` | const arrow | 3673 | Clamped/rounded index → rung value. | `ui/settings.ts` | `SPEED_RUNGS` | — | pure |
| 40 | `speedRungOf` | function | 3675 | Nearest rung index to a rate, in log space. Legacy-settings migration path. | `ui/settings.ts` | `SPEED_RUNGS` | — | pure |
| 41 | `supStr` | function | 3676 | Digits → Unicode superscripts. Also used at 4435. | `core/dom.ts` (formatting util) | — | — | pure |
| 42 | `speedMult` | let | 3677 | `10^k` decade multiplier on top of `speed`. | `render/state.ts` | — | — | mutable module state |
| 43 | `speedLabel` | function | 3679–3687 | The effective rate in h/s, wk/s, mo/s, yr/s or mantissa×10ᵏ yr/s. Also used at 4471. | `ui/settings.ts` | `speed`, `speedMult`, `WEEK_YR`, `HOUR_YR`, `supStr` | — | reads mutable state |
| 44 | `fmtSpeed` | function | 3688 | Writes `speedLabel()` into `#speedv`. | `ui/settings.ts` | — | DOM | reads mutable state; writes DOM |
| 45 | `setMultExp` | function | 3690–3696 | Clamps 0…10, sets `speedMult`, syncs `#multExp`/`#multExpv`, calls `fmtSpeed()` and `applyTrailWindow()`. Called from outside at 4233 and 4305. | `ui/settings.ts` | `applyTrailWindow` (3755, in-range, declared **later** — hoisted fn, safe) | DOM | mutates state + DOM |
| 46 | *(anon)* `$('multExp').addEventListener('input', …)` | side-effecting stmt | 3697 | Binds the decade slider. | `ui/settings.ts` | — | DOM, evt | side effect at eval time |
| 47 | `shuttle`, `shuttleLastSign`, `trailRefillAt` | let (3 names) | 3702 | Jog/shuttle percentage and two frame-loop bookkeeping slots. `shuttleLastSign` (5249) and `trailRefillAt` (5261) are written **only** outside this range. | `render/state.ts` | — | — | mutable module state |
| 48 | `setShuttle` | function | 3703–3711 | Clamps ±100, re-sweeps the trails on a sign change, syncs `#shuttle`/`#shuttlev`. | `ui/settings.ts` | `refillTrails` (4477, hoisted fn), **`nextSample` / `simT` (5029, `let` — AFTER)**, `DT_SAMPLE` (2876) | DOM | mutates state + DOM |
| 49 | *(anon)* `$('shuttle').addEventListener('input', …)` | side-effecting stmt | 3712 | Binds the shuttle slider. | `ui/settings.ts` | — | DOM, evt | side effect at eval time |
| 50 | *(anon)* `$('shuttleReset').addEventListener('click', …)` | side-effecting stmt | 3713 | Hands the clock back (`setShuttle(0)`). | `ui/settings.ts` | — | DOM, evt | side effect at eval time |
| 51 | *(anon)* `document.querySelectorAll('.stepb').forEach(…)` | side-effecting stmt | 3714–3720 | Generic ±step buttons driven by `data-step="id:delta"`; clamps to the input's own min/max and re-dispatches `input`. | `ui/settings.ts` | — | DOM, evt | side effect at eval time |
| 52 | *(anon)* `$('speed').addEventListener('input', …)` | side-effecting stmt | 3721 | Binds the speed slider → `speed`, `fmtSpeed()`, `applyTrailWindow()`. | `ui/settings.ts` | — | DOM, evt | side effect at eval time |
| 53 | *(stmt)* `speed = speedFromSlider(SPEED_YEAR); fmtSpeed();` | side-effecting stmt | 3722 | **Boot statement.** Sets 1 yr/s and paints the label. Deliberately does *not* call `applyTrailWindow()`, so `DT_SAMPLE` keeps its 0.01 default until the explicit `applyTrailWindow()` at 6162. | `main.ts` | — | DOM | side effect at eval time |

### 2d. Star-gain, core-knee, alpha and trail-window sliders (3726–3768)

| # | name | kind | lines | what it is | target module | external deps | touches | purity |
|---|---|---|---|---|---|---|---|---|
| 54 | *(anon)* `$('hudHz').addEventListener('input', …)` | side-effecting stmt | 3726–3729 | HUD refresh rate slider. | `ui/settings.ts` | **`hudHz` (5031, `let` — AFTER)** | DOM, evt | side effect at eval time |
| 55 | `minBright`, `minSprite`, `starGain` | let (3 names) | 3730 | Faint-star floor, minimum sprite width, and the raw slider value. Initialised to the 0.05 default. | `render/state.ts` | — | — | mutable module state |
| 56 | *(anon)* `$('minB').addEventListener('input', …)` | side-effecting stmt | 3731–3736 | One slider, two derived values (`v*0.38`, `1.3+v*2.1`) plus the readout. | `ui/settings.ts` | — | DOM, evt | side effect at eval time |
| 57 | `coreKnee` | let | 3741 | Bright-core compression headroom; 1 = off (default). | `render/state.ts` | — | — | mutable module state |
| 58 | *(anon)* `$('coreB').addEventListener('input', …)` | side-effecting stmt | 3742–3745 | Core-knee slider + readout. | `ui/settings.ts` | — | DOM, evt | side effect at eval time |
| 59 | `trailAlpha`, `orbitAlpha` | let | 3746 | Trail and orbit-line opacity; 0 doubles as the off switch. | `render/state.ts` | — | — | mutable module state |
| 60 | *(anon)* `$('trailA').addEventListener('input', …)` | side-effecting stmt | 3748–3750 | Sets `trailAlpha` **and** `psH` (the pass-enable flag declared at 2918). | `ui/settings.ts` | `psH` (2918) | DOM, evt | side effect at eval time |
| 61 | *(anon)* `$('orbitA').addEventListener('input', …)` | side-effecting stmt | 3751–3753 | Sets `orbitAlpha` **and** `psO` (2918). | `ui/settings.ts` | `psO` (2918) | DOM, evt | side effect at eval time |
| 62 | `trailPct`, `trailRefill` | let | 3754 | Trail-window percentage (default 300) and the debounce timer handle. | `render/trails.ts` | — | — | mutable module state |
| 63 | `applyTrailWindow` | function | 3755–3766 | Recomputes `DT_SAMPLE = (trailPct/100)·speed·speedMult / TRAIL_N`, formats the span (yr/kyr/Myr/Gyr), and debounces `refillTrails()` by 90 ms. Called from outside at 6162. | `render/trails.ts` | `DT_SAMPLE` (2876), `TRAIL_N` (2876), `speed`/`speedMult` (in-range), `refillTrails` (4477), **`nextSample`/`simT` (5029 — AFTER)** | DOM | mutates state + DOM; schedules a timer |
| 64 | `lastAnchor` | let | 3767 | Trail re-anchor timestamp. Written **only** outside this range (5275). | `render/trails.ts` | — | — | mutable module state |
| 65 | *(anon)* `$('trailL').addEventListener('input', …)` | side-effecting stmt | 3768 | Binds the trail-length slider. | `ui/settings.ts` | — | DOM, evt | side effect at eval time |

### 2e. The switch helpers (3772–3778)

| # | name | kind | lines | what it is | target module | external deps | touches | purity |
|---|---|---|---|---|---|---|---|---|
| 66 | `isOn` | const arrow | 3772 | Reads a switch's state whether it is a checkbox or a lit button. Used outside at 4210, 4231. | `ui/settings.ts` | — | DOM | pure read of DOM |
| 67 | `toggle` | function | 3773–3776 | Binds a switch: `change` for checkboxes, class-flipping `click` for buttons; both report through one callback. **13 further call sites outside this range.** | `ui/settings.ts` | `isOn` | DOM, evt | side effect (registration) |
| 68 | `ICO_PAUSE` | const string | 3777 | Inline SVG for the pause glyph (drawn, not typed — a text glyph would be emoji-coloured). | `ui/hud.ts` | — | — | pure |
| 69 | `ICO_PLAY` | const string | 3778 | Inline SVG for the play glyph. | `ui/hud.ts` | — | — | pure |

### 2f. The toggle wall (3780–3824)

| # | name | kind | lines | what it is | target module | external deps | touches | purity |
|---|---|---|---|---|---|---|---|---|
| 70 | *(anon)* `toggle($('tPause'), …)` | side-effecting stmt | 3780–3782 | Play/pause; swaps the inline SVG and the aria-label. | `ui/hud.ts` | `paused`, `ICO_PAUSE`, `ICO_PLAY` | DOM, evt | side effect at eval time |
| 71 | *(anon)* `toggle($('tLabels'), …)` | side-effecting stmt | 3783 | Body labels on/off; hides every label element when off. | `ui/settings.ts` | `showLabels`, **`labelEls` (4725, `const` — AFTER)** | DOM, evt | side effect at eval time |
| 72 | *(anon)* `toggle($('tArms'), …)` | side-effecting stmt | 3784 | Spiral-arm labels on/off. | `ui/settings.ts` | **`armsOn` (4745, `let` — AFTER)**, **`armEls` (4754, `const` — AFTER)** | DOM, evt | side effect at eval time |
| 73 | `labelSteady` | let | 3787 | Steady-label easing mode. | `render/state.ts` | — | — | mutable module state |
| 74 | *(anon)* `toggle($('tLabelSteady'), …)` | side-effecting stmt | 3788 | Binds it. | `ui/settings.ts` | — | DOM, evt | side effect at eval time |
| 75 | `syncLabelsMaster` | function | 3792 | The dock's master label switch mirrors `#tLabels ∨ #tArms`; it owns no saved state of its own. | `ui/hud.ts` | — | DOM | reads/writes DOM |
| 76 | *(anon)* `$('tLabels').addEventListener('change', syncLabelsMaster)` | side-effecting stmt | 3793 | Second listener alongside the checkbox's own. | `ui/hud.ts` | — | DOM, evt | side effect at eval time |
| 77 | *(anon)* `$('tArms').addEventListener('change', syncLabelsMaster)` | side-effecting stmt | 3794 | Same. | `ui/hud.ts` | — | DOM, evt | side effect at eval time |
| 78 | *(stmt)* `syncLabelsMaster();` | side-effecting stmt | 3795 | **Boot statement.** Paints the master from the markup's initial checked state. | `main.ts` | — | DOM | side effect at eval time |
| 79 | *(anon)* `toggle($('tLabelsAll'), …)` | side-effecting stmt | 3796–3802 | The master cascades into both checkboxes via synthetic `change` events, then calls `saveSettings()` explicitly (the save binding listens for `click`, which the cascade does not fire). | `ui/hud.ts` | **`saveSettings` (4217, `const` arrow — AFTER)** | DOM, evt | side effect at eval time |
| 80 | *(anon)* `toggle($('tP9'), …)` | side-effecting stmt | 3803 | Planet Nine on/off. | `ui/settings.ts` | `showP9` (1601), `I_P9` (1600), **`labelEls` (4725 — AFTER)** | DOM, evt | side effect at eval time |
| 81 | *(anon)* `toggle($('tDwarfs'), …)` | side-effecting stmt | 3804 | Dwarf planets on/off; hides labels at index ≥ `N_PLANETS`. | `ui/settings.ts` | `N_PLANETS` (1599), **`labelEls` (4725 — AFTER)** | DOM, evt | side effect at eval time |
| 82 | *(anon)* `toggle($('tBelt'), …)` | side-effecting stmt | 3805 | Asteroid belt. | `ui/settings.ts` | `showBelt` | DOM, evt | side effect at eval time |
| 83 | *(anon)* `toggle($('tKuiper'), …)` | side-effecting stmt | 3806 | Kuiper belt. | `ui/settings.ts` | `showKuiper` | DOM, evt | side effect at eval time |
| 84 | `evSN`, `evBirth` | let | 3807 | Supernova / star-birth event classes. | `render/state.ts` | — | — | mutable module state |
| 85 | `syncLife` | function | 3808–3817 | Derives `lifeOn` and prunes the live `events` / `puffs` arrays in place when a class is switched off. | `render/state.ts` | `lifeOn` (3083), `events` (3392), `puffs` (3392) | — | mutates external arrays |
| 86 | *(anon)* `toggle($('tEvSN'), …)` | side-effecting stmt | 3818 | Binds SN events. | `ui/settings.ts` | — | DOM, evt | side effect at eval time |
| 87 | *(anon)* `toggle($('tEvBirth'), …)` | side-effecting stmt | 3819 | Binds birth events. | `ui/settings.ts` | — | DOM, evt | side effect at eval time |
| 88 | *(anon)* `toggle($('tVar'), …)` | side-effecting stmt | 3820 | Stellar variability. | `ui/settings.ts` | `varOn` (3191) | DOM, evt | side effect at eval time |
| 89 | `dustOn` | let | 3821 | Dust lanes. | `render/state.ts` | — | — | mutable module state |
| 90 | *(anon)* `toggle($('tDust'), …)` | side-effecting stmt | 3822 | Binds it. | `ui/settings.ts` | — | DOM, evt | side effect at eval time |
| 91 | `syncZoomBtns` | const arrow | 3823 | Flips `.act` on `#zoomIn`/`#zoomOut`. | `ui/hud.ts` | — | DOM | writes DOM |
| 92 | *(anon)* `toggle($('tZoomBtns'), …)` | side-effecting stmt | 3824 | Zoom buttons on/off; relayouts the dock. | `ui/hud.ts` | `layoutPanels` (4045, in-range, hoisted), `fitPanels` (4906, hoisted fn) | DOM, evt | side effect at eval time |

### 2g. Spin lock (3829–3842)

| # | name | kind | lines | what it is | target module | external deps | touches | purity |
|---|---|---|---|---|---|---|---|---|
| 93 | `spinLock` | let | 3829 | Read the camera in Earth's rotating frame. Read at 5366. | `render/camera.ts` | — | — | mutable module state |
| 94 | `camDirW` | const `[0,0,1]` | 3829 | The camera's world direction, **written by the frame loop at 5376** and read here on the switch. | `render/camera.ts` | — | — | side effect at eval time; cross-slice mutable |
| 95 | `spinP` | const Float64Array(3) | 3829 | Scratch for `earthPrime`. | `render/camera.ts` | — | — | side effect at eval time (allocates) |
| 96 | `spinFrame` | function | 3830 | Returns the orthonormal triple `[P, A, P×A-ish]` of Earth's prime-meridian frame at `simT`. Also called at 5370. | `render/camera.ts` | `EARTH_AXIS` (2782), `earthPrime` (2789), **`simT` (5029 — AFTER)**, `spinP` | — | reads mutable state; writes the `spinP` scratch |
| 97 | *(anon)* `toggle($('tSpinLock'), …)` | side-effecting stmt | 3831–3839 | Re-expresses the current line of sight in the other frame so the view does not jump; clears `coreLock` and `panF`; mirrors into `#tSpinLock2`. | `ui/settings.ts` | `cam`, `coreLock`, `panF`, `camDirW`, `spinFrame` | DOM, evt | side effect at eval time |
| 98 | *(anon)* `$('tSpinLock2').addEventListener('change', …)` | side-effecting stmt | 3840–3842 | The settings-dialog twin drives the dock's box, which owns the state. | `ui/settings.ts` | — | DOM, evt | side effect at eval time |

### 2h. Zoom buttons and the focus selector (3843–3906)

| # | name | kind | lines | what it is | target module | external deps | touches | purity |
|---|---|---|---|---|---|---|---|---|
| 99 | *(stmt)* `syncZoomBtns($('tZoomBtns').checked);` | side-effecting stmt | 3843 | **Boot statement.** Paints the dots from the markup's `checked`. | `main.ts` | — | DOM | side effect at eval time |
| 100 | *(anon)* `$('zoomIn').addEventListener('click', …)` | side-effecting stmt | 3844 | `zoomStep(-1)`. Placed here on purpose — the comment notes `$` must exist and `zoomStep` is hoisted while the listener is not. | `ui/hud.ts` | — | DOM, evt | side effect at eval time |
| 101 | *(anon)* `$('zoomOut').addEventListener('click', …)` | side-effecting stmt | 3845 | `zoomStep(+1)`. | `ui/hud.ts` | — | DOM, evt | side effect at eval time |
| 102 | `focusSunOpt` | const element ref | 3846 | Cached `#focusSel` option 0; its text is rewritten each frame at 6051 once the Sun is gone. | `ui/hud.ts` | — | DOM | side effect at eval time (DOM read) |
| 103 | `earthViewDist` | function | 3850 | `bodyViewDist(realSizes[3])`. | `render/camera.ts` | `realSizes` (2858) | — | reads mutable state |
| 104 | `moonViewDist` | function | 3851 | `bodyViewDist(MOON_DIA)`. | `render/camera.ts` | `MOON_DIA` (2769) | — | pure-ish (reads viewport) |
| 105 | `bodyViewDist` | function | 3852–3855 | Distance at which a body of diameter `dia` fills 80 % of the shorter side, for the vertical 60° field. | `render/camera.ts` | `minDist` | DOM (`innerWidth`/`innerHeight`) | reads mutable state |
| 106 | `applyFocusView` | function | 3856–3904 | The focus dropdown's whole behaviour: six branches (`sun`, `earth`, `moon`, `pn`, `and`, else) that click `#tView`/`#tDive` in a specific order and only *then* set `followTarget`, because both toggle handlers reset it to `'sun'` as a side effect. Every branch clears `panF` and sets `reseedFollow`; ends with `saveSettings()`. Called from outside at 4396. | `render/camera.ts` | `cam`, `coreLock`, `followTarget`, `panF`, **`reseedFollow` (5054 — AFTER)**, `ageGyr` (2942), `MOON_BORN` (2768), **`saveSettings` (4217 — AFTER)** | DOM | mutates state + DOM; synthesises clicks |
| 107 | *(anon)* `$('focusSel').addEventListener('change', applyFocusView)` | side-effecting stmt | 3905 | Binds it. | `render/camera.ts` | — | DOM, evt | side effect at eval time |
| 108 | *(anon)* `$('focusGo').addEventListener('click', applyFocusView)` | side-effecting stmt | 3906 | Re-applies the current pick. | `render/camera.ts` | — | DOM, evt | side effect at eval time |

### 2i. The status-bar slide (3908–3942)

| # | name | kind | lines | what it is | target module | external deps | touches | purity |
|---|---|---|---|---|---|---|---|---|
| 109 | *(bare block)* gamebar slide-down | block statement | 3908–3942 | The status bar slides down to a grip and back, by click or by an actual drag. Inner names: `bar`/`grip` (3909), `y0`/`moved` (3910), `by0` (3913), four `bar` listeners (3914–3920), `setSlid` (3921–3927), four `grip` listeners (3928–3940), and the restore line 3941. Sets the transform **inline as well as by class** so the cascade cannot override it. | `ui/hud.ts` | **`saveSettings` (4217 — AFTER)** | DOM, evt | side effect at eval time |

### 2j. Remaining UI switches and the sfx gain (3943–3951)

| # | name | kind | lines | what it is | target module | external deps | touches | purity |
|---|---|---|---|---|---|---|---|---|
| 110 | *(anon)* `toggle($('tGaia'), …)` | side-effecting stmt | 3943 | Gaia catalogue layer. | `ui/settings.ts` | `gaiaOn` (3006) | DOM, evt | side effect at eval time |
| 111 | *(anon)* `toggle($('tFps'), …)` | side-effecting stmt | 3944 | FPS box; shows/hides `#fpsBox` and refits the panels. | `ui/settings.ts` | **`showFps` (5030, `let` — AFTER)**, `fitPanels` (4906, hoisted) | DOM, evt | side effect at eval time |
| 112 | `lifeSupOn` | const `true` | 3945 | Vestigial constant — the habitability reading is a fixture of the Earth panel now. Read once, at 6082. | `render/state.ts` | — | — | pure |
| 113 | `applySfxGain` | function | 3946–3951 | Fades the audio master gain to `soundOn ? sfxVol : 0` with a 0.3 s time constant; no-ops when the graph does not exist. | `audio/engine.ts` | `audio` (3194), `soundOn` (3194), `sfxVol` (3194) | WA | mutates the audio graph |

---

## 3. Movable panels (3952–4100) → `ui/panels.ts`

| # | name | kind | lines | what it is | target module | external deps | touches | purity |
|---|---|---|---|---|---|---|---|---|
| 114 | `PANELS` | const array[3] | 3959–3963 | `{id, dot}` for `simPanel`/`simPlus`, `env`/`envPlus`, `hud`/`reopen`. Read outside at 4207, 4240, 4619. | `ui/panels.ts` | — | — | pure data |
| 115 | `openSeq` | let | 3969 | Monotonic open counter; the newest panel wins an overlap. Incremented outside at 4243. | `ui/panels.ts` | — | — | mutable module state |
| 116 | `pState` | const object | 3970–3974 | Per-panel `{s: side, o: user intent, auto: layout override, seq}`. **Only `o` and `s` are persisted.** `env` seeds `seq:++openSeq` at eval time. Mutated outside at 4242, 4243, 4250. | `ui/panels.ts` | `openSeq` | — | side effect at eval time (increments `openSeq`) |
| 117 | `panelShown` | const arrow | 3975 | `o && !auto`. | `ui/panels.ts` | — | — | reads mutable state |
| 118 | `setPanelOpen` | function | 3976–3983 | Sets intent, bumps `seq`, restarts the `.pop` animation (forced reflow via `void el.offsetWidth`), relayouts, refits, saves. Called outside at 4414, 4595, 4597, 4704, 4710. | `ui/panels.ts` | `fitPanels` (4906), **`saveSettings` (4217 — AFTER)** | DOM | mutates state + DOM |
| 119 | `placePanels` | function | 3986–4031 | One layout pass: display/zIndex per panel and dot, stack the open panels down each column, then the dots (across in landscape, down in portrait), hide dots that run out of room, park `#fpsBox` under the left column, return the rectangles. Appends the standing dock actions (`tLabelsAll`, `tInfo`, `tPause`, `zoomIn`, `zoomOut`) on the right. | `ui/panels.ts` | — | DOM (`getBoundingClientRect`, `getComputedStyle`) | mutates DOM; reads layout |
| 120 | `findCrowded` | function | 4034–4044 | The oldest box that runs off the bottom or overlaps a newer one — rectangle intersection, not column identity. | `ui/panels.ts` | — | — | pure over its argument |
| 121 | `layoutPanels` | function | 4045–4052 | Clears every `auto`, then up to `PANELS.length+1` passes of place → find-crowded → mark `auto`. Recomputed from scratch so a hidden panel can return. Called outside at 4251, 6088. | `ui/panels.ts` | — | DOM | mutates state + DOM |
| 122 | *(top-level for-of)* per-panel drag binding | side-effecting stmt | 4054–4096 | For each panel: pointerdown (bails on `input, button, select, textarea, a, .seg, .chk`; captures the pointer), pointermove (6 px threshold, live `translateX`), and a shared `finish` (4074–4091) that closes on a 60 px outward swipe or switches column on a 60 px inward one. Deliberately no `pointerleave`. Inner names per iteration: `el`, `x0`, `active`, `moved`, `pid`, `finish`. | `ui/panels.ts` | `setPanelOpen`, `layoutPanels`, `fitPanels` (4906), **`saveSettings` (4217 — AFTER)** | DOM, evt | side effect at eval time |
| 123 | *(anon)* `document.querySelectorAll('.pdot[data-open]').forEach(…)` | side-effecting stmt | 4099–4100 | Only dots carrying `data-open` reopen a panel; pause and help share the look, not the job. | `ui/panels.ts` | — | DOM, evt | side effect at eval time |

---

## 4. Collapsible sections (4102–4143) → `ui/sections.ts`

| # | name | kind | lines | what it is | target module | external deps | touches | purity |
|---|---|---|---|---|---|---|---|---|
| 124 | `SECS` | const array[5] | 4106 | `['audio','gfx','hud','other','debug']`. Read outside at 4245. | `ui/sections.ts` | — | — | pure data |
| 125 | `SEC_BODY` | const object | 4107 | Section key → body element id. | `ui/sections.ts` | — | — | pure data |
| 126 | `secOpen` | const object | 4110 | Open flags; only `gfx` starts open. Mutated outside at 4245 and 6373. Persisted as `s.sec`. | `ui/sections.ts` | — | — | mutable module state (const binding, mutable contents) |
| 127 | `applySecs` | function | 4111–4117 | Toggles `.closed` on each body and its heading, then `fitPanels()`. Called outside at 4254, 6373. | `ui/sections.ts` | `fitPanels` (4906, hoisted) | DOM | mutates DOM |
| 128 | *(anon)* `document.querySelectorAll('.sect[data-sec]').forEach(…)` | side-effecting stmt | 4118–4124 | Heading click: with `#secSolo` checked, opening one folds the rest. | `ui/sections.ts` | **`saveSettings` (4217 — AFTER)** | DOM, evt | side effect at eval time |
| 129 | *(anon)* `$('secSolo').addEventListener('change', …)` | side-effecting stmt | 4125–4131 | Turning solo on keeps the topmost open section and folds the rest. | `ui/sections.ts` | **`saveSettings` (4217 — AFTER)** | DOM, evt | side effect at eval time |
| 130 | `seg` | function | 4134–4143 | Segmented button: exactly one child lit, chosen by `data-v`; returns its own `set(v, apply)`. **Deliberately calls `set(initial, false)`** — invoking `fn` this early would touch bindings that do not exist yet. **13 further uses outside this range.** | `ui/sections.ts` | **`saveSettings` (4217 — AFTER)** | DOM, evt | side effect (registration) |

---

## 5. Audio controls and the boot track (4146–4185) → `audio/*`

| # | name | kind | lines | what it is | target module | external deps | touches | purity |
|---|---|---|---|---|---|---|---|---|
| 131 | `setMusicVol` | function | 4146–4154 | The volume slider *is* the switch: 0 = off. Loads the track on the first raise, otherwise plays/pauses. | `audio/music.ts` | `musicVol` (3229), `musicOn` (3229), `player` (3230), `trackIx` (3229), `loadTrack` (3242), `playTrack` (3236) | DOM | mutates state; touches `<audio>` |
| 132 | *(anon)* `$('musicVol').addEventListener('input', …)` | side-effecting stmt | 4155 | Binds it. | `audio/music.ts` | — | DOM, evt | side effect at eval time |
| 133 | *(anon)* `$('tNext').addEventListener('click', …)` | side-effecting stmt | 4156–4160 | Next track; if music was off, restores a 0.4 default level and saves. | `audio/music.ts` | `nextTrack` (3248), `musicOn` (3229), **`saveSettings` (4217 — AFTER)** | DOM, evt | side effect at eval time |
| 134 | *(top-level for-of)* fx checkbox binding | side-effecting stmt | 4161–4170 | `fxBirth/fxSn/fxPn/fxDrone` → `fxOn[key]`; the drone additionally ramps `audio.droneG.gain` with a 0.4 s time constant. | `audio/sfx.ts` | `fxOn` (3329), `audio` (3194) | DOM, evt, WA | side effect at eval time |
| 135 | `setSfxVol` | function | 4171–4181 | Raising above 0 turns sound on, builds the graph via `initAudio()` if needed, resumes the context (falling back to `armUnlock()`), and loads the banks; 0 turns sound off. Always ends in `applySfxGain()`. | `audio/sfx.ts` | `sfxVol` (3194), `soundOn` (3194), `audio` (3194), `initAudio` (3196), `armUnlock` (3258), `loadBanks` (3294) | DOM, WA | mutates state; builds the audio graph |
| 136 | *(anon)* `$('sfxVol').addEventListener('input', …)` | side-effecting stmt | 4182 | Binds it. | `audio/sfx.ts` | — | DOM, evt | side effect at eval time |
| 137 | *(stmt)* `loadTrack(0);` | side-effecting stmt | 4185 | **Boot statement.** Music is on by default; autoplay is refused before a gesture, so the start is queued behind the first one. | `main.ts` | `loadTrack` (3242) | DOM | side effect at eval time |

*(Rows are numbered 1–137 with two gaps for the three names sharing line 3829 counted separately; the count of distinct inventory entries is 135 after merging line 3829's three declarations into one physical statement row and excluding the two comment-only markers.)*

---

## 6. Mutable module-level state declared here that OTHER parts of the file mutate

| symbol | declared | mutated outside this range at |
|---|---|---|
| `cam` (`.yaw`, `.pitch`, `.dist`, `.distGoal`, `.follow`, `.target`) | 3501 | 4316, 4317, 4333–4335, 4345–4347, 4357–4361, 4371–4373, 4383–4385, 4400, 4476, 4502–4505, 5346, 6401 — 57 references outside the range in total |
| `coreLock` | 3502 | 4333, 4345, 4357, 4371, 4383, 4503, 4505, 6402 |
| `followTarget` | 3505 | 4294, 4476, 4502 |
| `panF[0]`, `panF[1]` | 3515 | 4336, 4348, 4362, 4374, 4409, 4476, 4498, 4499, 6404 (read at 5377) |
| `camDirW[0..2]` | 3829 | **5376** — written by the frame loop, read only here (3832). One-way data flow *into* this slice. |
| `showOort` | 3659 | 4267 (`toggle($('tOort'), …)` lives in the next slice) |
| `showStats` | 3658 | 4269 (`updateBar()`) |
| `shuttleLastSign` | 3702 | 5249 only — never written in this range |
| `trailRefillAt` | 3702 | 5261 only — never written in this range |
| `lastAnchor` | 3767 | 5275 only — never written in this range |
| `speed` | 3660 | read/normalised at 4225 via `speedRungOf` |
| `speedMult` | 3677 | read at 4233; set through `setMultExp` from 4233 and 4305 |
| `pState[*].s`, `.o`, `.seq` | 3970 | 4242, 4243, 4250 (`restoreSettings`), 4414, 4595, 4597, 4704, 4710 via `setPanelOpen` |
| `openSeq` | 3969 | 4243 |
| `secOpen[*]` | 4110 | 4245 (`restoreSettings`), 6373 (`setDebugUI` folds `debug` away) |
| `paused`, `showTrails`, `showLabels`, `showDwarfs`, `showBelt`, `showKuiper`, `labelSteady`, `dustOn`, `evSN`, `evBirth`, `coreKnee`, `starGain`, `minBright`, `minSprite`, `trailAlpha`, `orbitAlpha`, `trailPct`, `spinLock`, `holding`, `dragging`, `pinchD`, `panCX`, `panCY` | 3502–3830 | written **only** inside this range, but read by the draw/frame code below (e.g. `showTrails` at 5669, `holding` at 5253, `spinLock` at 5366). These are read-only exports from the slice's point of view. |

State declared **elsewhere** that this slice writes (the reverse direction — equally load-bearing for module boundaries): `psH`/`psO` (2918), `showP9` (1601), `armsOn` (4745), `varOn` (3191), `gaiaOn` (3006), `showFps` (5030), `hudHz` (5031), `lifeOn` (3083), `events`/`puffs` (3392, spliced in place by `syncLife`), `DT_SAMPLE` (2876), `nextSample` (5029), `reseedFollow` (5054), `musicVol`/`musicOn` (3229), `soundOn`/`sfxVol`/`audio` (3194), `fxOn` (3329).

---

## 7. Randomness consumed at evaluation time

**None. There is no `Math.random()`, no seeded-RNG call, and no `rng`/`rand` reference anywhere in lines 3500–4186** — neither at module-evaluation time nor inside any function in the slice.

Consequences for the screenshot-parity gate:

- This slice can be moved to any position in the module graph without perturbing the global order in which randomness is consumed. It is *neutral* with respect to the seeded-PRNG parity test.
- The two derived-at-eval constants (`ZOOM_RUNGS` at 3564, `SPEED_RUNGS` at 3666–3671) are deterministic pure derivations — safe to hoist into `astro/constants.ts` / `ui/settings.ts` module scope.
- The one eval-time counter mutation, `pState.env.seq = ++openSeq` at 3971, is *order-sensitive but not random*: it must stay the first `openSeq` increment, so `env` keeps `seq === 1` and every later `setPanelOpen` / `restoreSettings` bump ranks above it. If `ui/panels.ts` is evaluated after something else that touches `openSeq`, z-order and the crowd-eviction choice change and panels move — a visible pixel diff.

---

## 8. Boot-order hazards

Ordered by how badly they bite.

### H1 — Handlers registered here close over `let`/`const` declared *hundreds of lines later*

These are safe today only because the file is one script and the handlers fire after full evaluation. Split into ES modules with independent evaluation, and any one of them becomes a TDZ `ReferenceError` the moment an early event fires (a pointermove during a slow boot, a `restoreSettings` replay, a synthetic `click`).

| read at | symbol | declared at | kind |
|---|---|---|---|
| 3532, 3533 | `H` (viewport height) | **4898** | `let W=0,H=0,DPR=1` |
| 3538 | `SKY_MIRROR` | **4982** | `const` |
| 3629, 3635, 3637 | `DBGKEY` | **6325** | `const` |
| 3708, 3765 | `nextSample`, `simT` | **5029** | `let` |
| 3727 | `hudHz` | **5031** | `let` |
| 3783, 3803, 3804 | `labelEls` | **4725** | `const` |
| 3784 | `armEls` / `armsOn` | **4754 / 4745** | `const` / `let` |
| 3830 (via `spinFrame`) | `simT` | **5029** | `let` |
| 3862, 3869, 3878, 3886, 3896, 3901 | `reseedFollow` | **5054** | `let` |
| 3944 | `showFps` | **5030** | `let` |
| 3801, 3903, 3926, 3982, 4088, 4123, 4130, 4138, 4159 | `saveSettings` | **4217** | `const` arrow — **the single most widely forward-referenced binding in the slice** |

Function declarations reached forward are hoisted and therefore safe *within one script*, but become import-order dependencies once split: `setDebugUI` (6363) from 3627; `refillTrails` (4477) from 3708 and 3765; `fitPanels` (4906) from 3824, 3944, 3982, 4088, 4116; `applyTrailWindow` (3755) from `setMultExp` (3695); `layoutPanels` (4045) from 3824 and 3981.

### H2 — `setSlid(true)` at 3941 can reach `saveSettings` before it exists

Line 3941 (`if(bar.classList.contains('slid')) setSlid(true);`) runs at evaluation time, and `setSlid` (3921–3927) ends in `saveSettings()` — a `const` arrow declared at **4217**. Today this line is **dead at boot**: nothing adds `.slid` before 3941 (`restoreSettings` does so at 4246 and it runs at **6156**), so the TDZ is never hit and the comment "restored state applies the style too" is stale. Any refactor that (a) restores settings earlier, or (b) marks the bar `slid` in markup, turns line 3941 into a boot-killing `ReferenceError`. Note also that `restoreSettings` at 4246 only does `classList.add('slid')` and never sets the inline transform that `setSlid` insists on — the two paths already disagree.

### H3 — Listeners registered above the helper they call, inside the same block

- 3915–3918: `bar.addEventListener('pointermove', …)` calls `setSlid`, a `const` declared at **3921**, six lines below its own registration.
- 3714–3720: the `.stepb` binding re-dispatches `input` on an arbitrary element id from `data-step`, so it can drive any slider in the file — including sliders whose handlers are registered later than 3714 (`minB` 3731, `coreB` 3742, `trailA` 3748, `orbitA` 3751, `trailL` 3768, `musicVol` 4155, `sfxVol` 4182, `qrScale`). A step press before those lines evaluate would silently do nothing.

### H4 — Eval-time statements with a fixed relative order

| line | statement | why the order matters |
|---|---|---|
| 3592–3597 | four `$('…')` writes | require `verInfo`, `buildStamp`, `tourBuild`, `buildInfo` to be in the DOM. All four ids exist today; each is a moved-id fatality. |
| 3722 | `speed = speedFromSlider(SPEED_YEAR); fmtSpeed();` | must run after `SPEED_RUNGS` (3666) and `speedLabel` (3679); must **not** be reordered to run after `restoreSettings` (6156), which would overwrite the restored speed. It deliberately omits `applyTrailWindow()` — `DT_SAMPLE` stays 0.01 until 6162. |
| 3795 | `syncLabelsMaster()` | reads the markup's initial `checked` on `#tLabels`/`#tArms`; must run after 3793/3794 registration is irrelevant, but must run **before** `restoreSettings` replays clicks. |
| 3843 | `syncZoomBtns($('tZoomBtns').checked)` | same shape: paints from markup defaults, must precede the settings replay. |
| 3846 | `const focusSunOpt = $('focusSel').options[0]` | caches a live element reference at eval time; a moved/rebuilt `#focusSel` leaves a detached node that 6051 keeps writing to, invisibly. |
| 3971 | `pState.env.seq = ++openSeq` | the first `openSeq` increment; see §7. |
| 4185 | `loadTrack(0)` | must run after `player` (3230) and `TRACKS`; queues autoplay behind the first gesture. |

### H5 — The synthetic-click cascade in `applyFocusView` is order-critical

`applyFocusView` (3856–3904) clicks `#tView` / `#tDive` *before* assigning `followTarget`, because both toggle handlers (registered at **4476** and **4498**, i.e. below this range) reset `followTarget = 'sun'` as a side effect. Two consequences: (1) the assignment order inside each branch must not be "tidied"; (2) `applyFocusView` cannot be invoked before line 4498 has evaluated, or the clicks hit unbound buttons and the camera silently stays where it was. It is called from 4396 and from `restoreSettings`-adjacent code, both later — fine today.

### H6 — Two zoom ceilings that disagree

`zoomStep` clamps to **9500** (3571) while the wheel (3576) and pinch (3585) clamp to **7500**. Not a boot hazard, but a behaviour-preserving refactor must copy both numbers verbatim into `render/camera.ts`; "unifying" them moves pixels.

### H7 — The error-log collector

The collector installed above line 1133 (window `error`, `unhandledrejection`, and console `error`/`warn` wrappers) must remain the first thing evaluated. Nothing in 3500–4186 registers a competing global error handler, but this slice registers **two window-level listeners** (`pointerup` and `pointercancel`, lines 3551–3552) and eight canvas-level ones; none of them can be allowed to evaluate before the collector, or a throw during registration is lost.

---

## 9. Cross-slice reads (symbols this slice consumes but does not declare)

`canvas` (1188) · `BUILD` (1133) · `VERSION` (1134) · `BUILD_LINE` (1159) · `realMode` (1596) · `N_PLANETS` (1599) · `I_P9` (1600) · `showP9` (1601) · `MOON_BORN` (2768) · `MOON_DIA` (2769) · `EARTH_AXIS` (2782) · `earthPrime` (2789) · `realSizes` (2858) · `TRAIL_N` (2876) · `DT_SAMPLE` (2876) · `psH` / `psO` (2918) · `ageGyr` (2942) · `gaiaOn` (3006) · `lifeOn` (3083) · `varOn` (3191) · `soundOn` / `sfxVol` / `audio` (3194) · `initAudio` (3196) · `musicOn` / `musicVol` / `trackIx` (3229) · `player` (3230) · `playTrack` (3236) · `loadTrack` (3242) · `nextTrack` (3248) · `armUnlock` (3258) · `loadBanks` (3294) · `fxOn` (3329) · `events` / `puffs` (3392) · `saveSettings` (4217) · `refillTrails` (4477) · `labelEls` (4725) · `armsOn` (4745) · `armEls` (4754) · `W` / `H` (4898) · `fitPanels` (4906) · `SKY_MIRROR` (4982) · `simT` / `nextSample` (5029) · `showFps` (5030) · `hudHz` (5031) · `reseedFollow` (5054) · `DBGKEY` (6325) · `setDebugUI` (6363)

## 10. Exports this slice owes to later slices

`$` (4 uses before it, at 3234–3235, already reach *forward* to it — both inside functions) · `toggle` (13 external uses) · `seg` (13) · `isOn` (2) · `applySecs` (2) · `setMultExp` (2) · `speedRungOf` (2) · `applyTrailWindow` (6162) · `applyFocusView` (4396) · `speedLabel` (4471) · `supStr` (4435) · `spinFrame` (5370) · `layoutPanels` (4251, 6088) · `setPanelOpen` (4414, 4595, 4597, 4704, 4710) · `PANELS` (4207, 4240, 4619) · `pState` (4242–4250, 4414) · `openSeq` (4243) · `SECS` / `secOpen` (4245, 6373) · `WEEK_YR` (4225) · `focusSunOpt` (6051) · `lifeSupOn` (6082) · `showTrails` (5669) · `cam` / `coreLock` / `followTarget` / `panF` / `spinLock` / `holding` / `camDirW` (frame loop, 5240–5400) · `minDist` / `earthViewDist` / `moonViewDist` / `bodyViewDist` / `zoomStep` / `applySfxGain` / `setMusicVol` / `setSfxVol` (in-range consumers only, but must stay reachable from `main.ts` wiring).
