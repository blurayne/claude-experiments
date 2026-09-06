# Slice 07 — settings persistence, tooltips, fullscreen, first-run tour, hazard colour, resize, highlight rolloff

Source: `galactic-transit.html`, lines **4187–5022** (inclusive). 138 top-level declarations / side-effecting statements.

Conventions used below:

- **Touches** is one or more of `DOM`, `gl`, `Math.random`, `localStorage`, `WebAudio`, `events` (window/document/media-query/element listener registration or dispatch), `timers`, `net`.
- **Purity**: `pure` (no free mutable reads, no side effects), `reads` (reads mutable module state), `mutates` (writes mutable module state), `eval-side-effect` (does something observable while the module body is evaluating).
- **External deps** lists only symbols read that are **not** declared in 4187–5022. Line numbers of their declarations are given in the cross-slice table at the end.

---

## 1. Symbol inventory

### 1.1 Settings persistence (4187–4266)

| # | name | kind | lines | what it is | target module | external deps | touches | purity |
|---|------|------|-------|------------|---------------|---------------|---------|--------|
| 1 | `SKEY` | `const` (string) | 4191 | localStorage key `galactic-transit.settings.v1` | `ui/settings.ts` | — | — | pure |
| 2 | `S_TOG` | `const` (string[]) | 4192–4194 | ids of the 21 persisted toggle controls | `ui/settings.ts` | — | — | pure |
| 3 | `S_SLD` | `const` (string[]) | 4195 | ids of the 10 persisted sliders | `ui/settings.ts` | — | — | pure |
| 4 | `S_CHK` | `const` (string[]) | 4196 | ids of the 7 persisted checkboxes | `ui/settings.ts` | — | — | pure |
| 5 | `qrPos` | `let` (object) | 4201 | QR overlay position as fractions of free space; **hoisted here deliberately** to dodge a TDZ against the QR block at 6274+ | `ui/qr.ts` (state), read by `ui/settings.ts` | — | — | mutable state |
| 6 | `qrHeld` | `let` (bool) | 4201 | true while the QR canvas is being dragged | `ui/qr.ts` | — | — | mutable state |
| 7 | `saveSettingsNow` | `function` | 4202–4215 | serialises toggles/sliders/checkboxes + calendar, speed multiplier, density, dpr cap, units, focus, section-open map, panel state, gamebar-slid, `qrPos` into localStorage; swallows all errors | `ui/settings.ts` | `$`, `isOn`, `speedMult`, `curD`, `PANELS`, `pState`, `secOpen` | DOM, localStorage | reads (snapshots much of the app) |
| 8 | `saveTimer` | `let` (number) | 4216 | debounce handle | `ui/settings.ts` | — | timers | mutable state |
| 9 | `saveSettings` | `const` (arrow) | 4217 | 250 ms debounced wrapper around `saveSettingsNow` | `ui/settings.ts` | — | timers | mutates |
| 10 | `restoreSettings` | `function(register)` | 4221–4266 | replays saved state **through the live handlers** (`dispatchEvent`, `.click()`), applies the v1→v2 speed-slider migration, forces the settings dialog shut, calls `layoutPanels()`/`applySecs()`, then registers the save listeners unless `register === false`. Deliberately deferred to line 6156. | `ui/settings.ts` | `$`, `isOn`, `speedRungOf`, `WEEK_YR`, `speedMult`, `setMultExp`, `dprCap`(own slice, 4898), `resize`(own slice), `DETAIL_D`/`DETAIL_NAMES`(own slice, 4510/4511), `curD`, `setSegUnits`(own slice, 4278), `PANELS`, `pState`, `openSeq`, `SECS`, `secOpen`, `layoutPanels`, `applySecs`, `qrPos` | DOM, localStorage, events | mutates (drives the entire UI) |

### 1.2 Status-bar toggles, calendar, units (4267–4292)

| # | name | kind | lines | what it is | target module | external deps | touches | purity |
|---|------|------|-------|------------|---------------|---------------|---------|--------|
| 11 | *(bare)* `toggle($('tOort'), …)` | statement | 4267 | wires the Oort-cloud switch to `showOort` | `main.ts` (uses `ui/panels` `toggle`) | `toggle`, `$`, `showOort` | DOM, events | eval-side-effect |
| 12 | `updateBar` | `function` | 4268–4272 | recomputes `showStats` from the five stat cells, shows/hides `#gamebar`, calls `fitPanels()` | `ui/hud.ts` | `$`, `showStats` | DOM | mutates |
| 13 | `statToggle` | `function(btn, statId)` | 4273 | binds a stat button to show/hide one bar cell and refresh the bar | `ui/hud.ts` | `toggle`, `$` | DOM, events | mutates |
| 14 | *(bare)* `statToggle($('tStatAge'),'sAge')` | statement | 4274 | wiring | `main.ts` | `$` | DOM, events | eval-side-effect |
| 15 | *(bare)* `statToggle($('tStatGyr'),'sGyr')` | statement | 4275 | wiring | `main.ts` | `$` | DOM, events | eval-side-effect |
| 16 | *(bare)* `statToggle($('tStatSn'),'cDeath')` | statement | 4276 | wiring | `main.ts` | `$` | DOM, events | eval-side-effect |
| 17 | *(bare)* `statToggle($('tStatBirth'),'cBirth')` | statement | 4277 | wiring | `main.ts` | `$` | DOM, events | eval-side-effect |
| 18 | `setSegUnits` | `const` (setter returned by `seg`) | 4278 | segmented control for the unit notation; the callback assigns `unitMode` | `ui/sections.ts` (control) + `ui/hud.ts` (consumer) | `seg` | DOM, events | eval-side-effect (registers listeners; **does not** call the callback — see hazard H2) |
| 19 | `liveCount` | `let` (bool) | 4279 | retired control flag, still read by the HUD at 6019 | `render/state.ts` | — | — | mutable state (dead write) |
| 20 | `calMode` | `let` (string `'ad'`) | 4280 | selected calendar | `ui/hud.ts` | — | — | mutable state |
| 21 | `unitMode` | `let` (string `'words'`) | 4280 | number notation: `words` / `sup` / `e` | `ui/hud.ts` | — | — | mutable state |
| 22 | `syncCal` | `function` | 4281–4287 | reads `#cal`, hides `#sCal` on `none`, relabels `#lCal`, calls `updateBar()` | `ui/hud.ts` | `$` | DOM | mutates |
| 23 | *(bare)* `$('cal').addEventListener('change', syncCal)` | statement | 4288 | wiring | `main.ts` | `$` | DOM, events | eval-side-effect |
| 24 | `keepSaved` | `let` (bool) | 4292 | true only while the opening scenario stages itself; set from `hadSaved` at 6166/6169 | `ui/scenarios.ts` | — | — | mutable state |

### 1.3 Epoch jump / scenarios (4293–4415)

| # | name | kind | lines | what it is | target module | external deps | touches | purity |
|---|------|------|-------|------------|---------------|---------------|---------|--------|
| 25 | `jumpToEpoch` | `function` | 4293–4408 | the whole scenario table: reads `#jump`, applies `data-rate`/`data-mult`, then per-value staging for `helix`, `11.3586`, `12.35`, `8.36149`, `11.25`, `4.5692567`, the three Earth epochs and `EARTH_AIM`; sets `simT`, camera, dive/view toggles, unpauses unless reduced-motion; clears `events`/`puffs`/accumulators and refills trails. `EARTH_AIM` (4394) is a function-local const, not top level. | `ui/scenarios.ts` | `followTarget`, `$`, `AGE0`, `speedRungOf`, `setMultExp`, `trailPct`, `cam`, `simT`, `nextSample`, `DT_SAMPLE`, `paused`, `coreLock`, `reseedFollow`, `panF`, `YR_PER_SIM`, `applyFocusView`, `events`, `puffs`, `accB`, `accSN`, `accPN`, `keepSaved`(own), `refillTrails`(own) | DOM, events, `Date.now()` | mutates (very wide) |
| 26 | *(bare)* `$('jump').addEventListener('change', …)` | statement | 4409 | resets follow smoothing then jumps | `main.ts` | `$`, `reseedFollow`, `panF` | DOM, events | eval-side-effect |
| 27 | *(bare)* `$('jumpGo').addEventListener('click', …)` | statement | 4410–4415 | GO button; optionally closes the sim panel | `main.ts` | `$`, `pState`, `setPanelOpen` | DOM, events | eval-side-effect |

### 1.4 Number / date formatting (4416–4475)

| # | name | kind | lines | what it is | target module | external deps | touches | purity |
|---|------|------|-------|------------|---------------|---------------|---------|--------|
| 28 | `sup` | `const` (arrow) | 4416 | integer → Unicode superscript digits (a **duplicate of `supStr`** at 3676) | `ui/hud.ts` | — | — | pure |
| 29 | `fmtYears` | `function(y)` | 4417–4433 | duration in years → `Gyr/Myr/kyr/yr`, or `×10^x` / `e` notation per `unitMode`; recurses for negatives | `ui/hud.ts` | `unitMode`(own, 4280) | — | reads |
| 30 | `fmtCount` | `function(n)` | 4434–4441 | count → `T/B/M/k` or `×10^x` | `ui/hud.ts` | `supStr` | — | pure |
| 31 | `humanYear` | `function` | 4442–4475 | the calendar readout: 7 civil calendars off `2026 + simT`, 12 deep-time eras off `simT*YR_PER_SIM`, plus `rate` which returns `speedLabel()` | `ui/hud.ts` | `simT`, `YR_PER_SIM`, `calMode`(own), `speedLabel` | — | reads |

### 1.5 View / dive toggles, trails, detail slider (4476–4519)

| # | name | kind | lines | what it is | target module | external deps | touches | purity |
|---|------|------|-------|------------|---------------|---------------|---------|--------|
| 32 | *(bare)* `toggle($('tView'), …)` | statement | 4476 | galaxy-overview switch: unfollows, sets `distGoal` 4300/150 | `main.ts` | `toggle`, `$`, `followTarget`, `cam`, `reseedFollow`, `panF` | DOM, events | eval-side-effect |
| 33 | `refillTrails` | `function` | 4477–4495 | rebuilds all `NB` trail buffers around `simT`, reversing sample order when `shuttle < 0`; re-anchors `trailAnchor` from the Sun | `render/trails.ts` | `bodyPos`, `simT`, `tmpSun`, `trailAnchor`, `shuttle`, `NB`, `trails`, `TRAIL_N`, `trailPos`, `DT_SAMPLE`, `tmp`, `gl`, `trailBufs` | gl | mutates |
| 34 | `setBodySizes` | `function` | 4496 | uploads `realSizes`/`dispSizes` into `bufBodySize` | `render/passes/bodies.ts` (or `gpu/buffers.ts`) | `gl`, `bufBodySize`, `realMode`, `realSizes`, `dispSizes` | gl | mutates |
| 35 | *(bare)* `setBodySizes()` | statement | 4497 | eval-time GPU upload so the first frame has real proportions | `main.ts` | — | gl | eval-side-effect |
| 36 | *(bare)* `toggle($('tDive'), …)` | statement | 4498–4506 | dive switch: forces follow + core lock, `distGoal` 3.5e-5 / 150 | `main.ts` | `toggle`, `$`, `panF`, `reseedFollow`, `followTarget`, `cam`, `coreLock` | DOM, events | eval-side-effect |
| 37 | `DETAIL_D` | `const` (number[]) | 4510 | the six galaxy density multipliers `[1,5,20,40,80,160]` | `astro/constants.ts` or `scene/galaxy.ts` | — | — | pure |
| 38 | `DETAIL_NAMES` | `const` (string[]) | 4511 | their labels `lowest…ultra` | `astro/constants.ts` or `scene/galaxy.ts` | — | — | pure |
| 39 | *(bare)* `$('detail').addEventListener('input', …)` | statement | 4512–4519 | rebuilds the galaxy at the chosen tier, **rolls back to the previous tier on allocation failure**, updates the label | `main.ts` | `$`, `curD`, `setGalaxy` | DOM, gl (via `setGalaxy`), events | eval-side-effect |

### 1.6 Tooltips (4520–4539)

| # | name | kind | lines | what it is | target module | external deps | touches | purity |
|---|------|------|-------|------------|---------------|---------------|---------|--------|
| 40 | `tipEl` | `const` (HTMLDivElement) | 4521 | the single floating tooltip box; **created and appended to `document.body` at eval time** | `ui/tooltips.ts` | — | DOM | eval-side-effect |
| 41 | `tipFor` | `let` (Element\|null) | 4522 | which `.info` button owns the visible tip | `ui/tooltips.ts` | — | — | mutable state |
| 42 | `tipTimer` | `let` (number) | 4522 | 8 s auto-hide handle | `ui/tooltips.ts` | — | timers | mutable state |
| 43 | `hideTip` | `function` | 4523 | hides the box, un-lights the button, clears the timer | `ui/tooltips.ts` | — | DOM, timers | mutates |
| 44 | `showTip` | `function(btn)` | 4524–4533 | toggles-off if same button; otherwise fills from `data-tip`, clamps to the viewport, flips above when it would overflow the bottom, arms the 8 s timer | `ui/tooltips.ts` | — | DOM, timers | mutates |
| 45 | *(bare)* `document.addEventListener('click', …, true)` | statement | 4534–4537 | **capture-phase** delegate for `.info`; stops propagation so a tip tap never reaches the canvas | `main.ts` (from `ui/tooltips.ts`) | — | DOM, events | eval-side-effect |
| 46 | *(bare)* `addEventListener('scroll', …, true)` | statement | 4538 | hides the tip on any scroll | `main.ts` | — | events | eval-side-effect |
| 47 | *(bare)* `addEventListener('resize', …)` | statement | 4539 | hides the tip on resize — **resize listener #1 of 3 in this slice** (see H7) | `main.ts` | — | events | eval-side-effect |

### 1.7 Fullscreen and orientation (4540–4594)

| # | name | kind | lines | what it is | target module | external deps | touches | purity |
|---|------|------|-------|------------|---------------|---------------|---------|--------|
| 48 | `isFs` | `const` (arrow) | 4541 | `fullscreenElement \|\| webkitFullscreenElement` | `ui/fullscreen.ts` | — | DOM | reads (DOM) |
| 49 | `reqFs` | `function` | 4542–4545 | requests fullscreen on `documentElement`, prefixed fallback; returns a Promise that resolves-with-catch or rejects when unsupported | `ui/fullscreen.ts` | — | DOM | side effect |
| 50 | `exitFs` | `function` | 4546 | leaves fullscreen, prefixed fallback | `ui/fullscreen.ts` | — | DOM | side effect |
| 51 | `toggleFs` | `const` (arrow) | 4547 | `isFs() ? exitFs() : reqFs()` | `ui/fullscreen.ts` | — | DOM | side effect |
| 52 | *(bare)* `$('tFull').addEventListener('click', toggleFs)` | statement | 4548 | wiring | `main.ts` | `$` | DOM, events | eval-side-effect |
| 53 | *(bare)* `document.addEventListener('fullscreenchange', …)` | statement | 4549 | mirrors state onto the button class — **fullscreenchange listener #1** | `main.ts` | `$` | DOM, events | eval-side-effect |
| 54 | `autoFsArmed` | `let` (bool) | 4554 | a rotation has armed the deferred fullscreen request | `ui/fullscreen.ts` | — | — | mutable state |
| 55 | `leftFsInLandscape` | `let` (bool) | 4554 | the visitor deliberately left fullscreen while landscape; suppresses re-entry | `ui/fullscreen.ts` | — | — | mutable state |
| 56 | `landscape` | `const` (arrow) | 4555 | `matchMedia('(orientation: landscape)').matches` | `ui/fullscreen.ts` | — | DOM | reads (DOM) |
| 57 | *(bare)* `document.addEventListener('fullscreenchange', …)` | statement | 4556 | sets `leftFsInLandscape` — **fullscreenchange listener #2, order-dependent with #1** | `main.ts` | — | DOM, events | eval-side-effect |
| 58 | `armAutoFs` | `function` | 4557–4566 | arms one-shot `pointerup`/`touchend` handlers that request fullscreen inside a real gesture | `ui/fullscreen.ts` | — | events | mutates |
| 59 | *(bare)* `matchMedia('(orientation: landscape)').addEventListener('change', …)` | statement | 4567–4569 | on rotate-to-landscape: clears the suppression, tries fullscreen, arms the gesture fallback | `main.ts` | — | DOM, events | eval-side-effect |
| 60 | `ROT` | `const` (string[]) | 4572 | `['auto','landscape','portrait']` | `ui/fullscreen.ts` | — | — | pure |
| 61 | `rotIx` | `let` (number) | 4573 | current rotation-lock index | `ui/fullscreen.ts` | — | — | mutable state |
| 62 | *(bare)* `$('tRotate').addEventListener('click', async …)` | statement | 4574–4584 | cycles the lock, enters fullscreen first, falls back to `auto` when the API refuses | `main.ts` | `$` | DOM, events | eval-side-effect |
| 63 | *(bare)* `if(display-mode standalone/fullscreen \|\| navigator.standalone) …` | statement | 4588–4591 | installed-app path: one-shot `pointerdown`/`keydown` to enter fullscreen | `main.ts` | — | DOM, events | eval-side-effect (conditional) |
| 64 | *(bare)* `if(location.protocol.startsWith('http') && 'serviceWorker' in navigator) …` | statement | 4592–4594 | registers `sw.js` on `load` | `main.ts` | — | events, net | eval-side-effect (conditional) |

### 1.8 Panel close wiring (4595–4597)

| # | name | kind | lines | what it is | target module | external deps | touches | purity |
|---|------|------|-------|------------|---------------|---------------|---------|--------|
| 65 | *(bare)* `$('collapse').addEventListener('click', …)` | statement | 4595 | collapses the settings panel | `main.ts` | `$`, `setPanelOpen` | DOM, events | eval-side-effect |
| 66 | *(bare)* `document.querySelectorAll('.pclose[data-close]').forEach(…)` | statement | 4596–4597 | binds every panel × button via its `data-close` id — **queries the DOM at eval time; a renamed id silently yields a dead button** | `main.ts` | `setPanelOpen` | DOM, events | eval-side-effect |

### 1.9 First-run tour (4598–4721)

| # | name | kind | lines | what it is | target module | external deps | touches | purity |
|---|------|------|-------|------------|---------------|---------------|---------|--------|
| 67 | `TOURKEY` | `const` (string) | 4602 | localStorage key `galactic-transit.tour` | `ui/tour.ts` | — | — | pure |
| 68 | `TOUR_HINTS` | `const` (object[]) | 4606–4614 | the seven hints; `t` is a **hard-coded element id** (`env`, `simPanel`, `hud`, `tLabelsAll`, `tInfo`, `zoomIn`, `gamebar`) | `ui/tour.ts` | — | — | pure |
| 69 | `tourTarget` | `function(id)` | 4616–4622 | resolves a hint id to a visible element, falling back to the panel's dot; **returns `null` silently when the id is gone** | `ui/tour.ts` | `$`, `PANELS` | DOM | reads (DOM) |
| 70 | `drawTourLines` | `function` | 4623–4698 | full layout pass: builds a `.hint` box per target, places it with a clash-avoiding nearest-slot search (8 px column scan, both flanks), clamps to 14 px margins, then emits an SVG cubic connector + dot per hint into `#tourSvg` | `ui/tour.ts` | `$` | DOM | mutates (DOM) |
| 71 | `tourHeldClock` | `let` (bool) | 4699 | the tour, not the visitor, paused the clock | `ui/tour.ts` | — | — | mutable state |
| 72 | `showTour` | `function` | 4700–4707 | shows `#tour`, closes the `env` panel on narrow/portrait, pauses via `$('tPause').click()`, draws lines after **two** rAFs | `ui/tour.ts` | `$`, `setPanelOpen`, `paused` | DOM, events | mutates |
| 73 | *(bare)* `$('tourGo').addEventListener('click', …)` | statement | 4708–4714 | dismisses the tour, opens `env`, restores the clock, writes `TOURKEY` | `main.ts` | `$`, `setPanelOpen`, `paused` | DOM, localStorage, events | eval-side-effect |
| 74 | *(bare)* `$('tourAgain').addEventListener('click', …)` | statement | 4715 | re-runs the tour from the About dialog | `main.ts` | `$` | DOM, events | eval-side-effect |
| 75 | *(bare)* `addEventListener('resize', …)` | statement | 4716 | re-lays the tour lines — **resize listener #2 of 3** | `main.ts` | `$` | DOM, events | eval-side-effect |
| 76 | *(bare)* `$('tInfo').addEventListener('click', …)` | statement | 4718 | opens the About modal | `main.ts` (from `ui/dialogs.ts`) | `$` | DOM, events | eval-side-effect |
| 77 | *(bare)* `$('infoClose').addEventListener('click', …)` | statement | 4719 | closes it | `main.ts` (from `ui/dialogs.ts`) | `$` | DOM, events | eval-side-effect |
| 78 | *(bare)* `$('infoModal').addEventListener('click', …)` | statement | 4720 | backdrop click closes it | `main.ts` (from `ui/dialogs.ts`) | `$` | DOM, events | eval-side-effect |
| 79 | *(bare)* `if(matchMedia('(prefers-reduced-motion: reduce)').matches){ $('tPause').click(); }` | statement | 4721 | **synthesises a click at eval time**, flipping `paused` before `restoreSettings()` ever runs | `main.ts` | `$` | DOM, events | eval-side-effect (conditional, environment-dependent) |

### 1.10 Label elements (4723–4815)

| # | name | kind | lines | what it is | target module | external deps | touches | purity |
|---|------|------|-------|------------|---------------|---------------|---------|--------|
| 80 | `labelWrap` | `const` (Element) | 4724 | `#labels` host for every floating label | `ui/hud.ts` (labels) | `$` | DOM | eval-side-effect (DOM read) |
| 81 | `labelEls` | `const` (HTMLDivElement[]) | 4725–4728 | one `.lbl` per body, created and appended at eval time | `ui/hud.ts` | `BODIES` | DOM | eval-side-effect |
| 82 | `moonEl` | `const` (IIFE → div) | 4729 | the Moon's label, hidden by default | `ui/hud.ts` | — | DOM | eval-side-effect |
| 83 | `STRUCTS` | `const` (tuple[]) | 4733–4737 | `[name, ring radius AU, visibility thunk]` for the asteroid belt (2.7), Kuiper (44), Oort (63241); the thunks close over `showBelt`/`showKuiper`/`showOort` | `astro/constants.ts` (data) + `ui/hud.ts` (thunks) | `showBelt`, `showKuiper`, `showOort` | — | reads (through thunks) |
| 84 | `structEls` | `const` (div[]) | 4738–4741 | their label elements | `ui/hud.ts` | — | DOM | eval-side-effect |
| 85 | `armsOn` | `let` (bool) | 4745 | spiral-arm names on/off | `render/state.ts` | — | — | mutable state |
| 86 | `ARM_LBLS` | `const` (tuple[]) | 4746–4753 | six arm names with galactic-plane x/z positions | `astro/constants.ts` | — | — | pure |
| 87 | `armEls` | `const` (div[]) | 4754–4757 | their `.armlbl` elements | `ui/hud.ts` | — | DOM | eval-side-effect |
| 88 | `M31_LBLS` | `const` (tuple[]) | 4759–4764 | Andromeda, M32, M110 and the Giant Southern Stream in M31's disk frame | `astro/constants.ts` | — | — | pure |
| 89 | `m31Els` | `const` (div[]) | 4765–4768 | their elements | `ui/hud.ts` | — | DOM | eval-side-effect |
| 90 | `mergedEl` | `const` (IIFE → div) | 4771–4772 | the "Milkomeda" remnant label | `ui/hud.ts` | — | DOM | eval-side-effect |
| 91 | `frameDt` | `let` (number, `1/60`) | 4781 | last frame's delta, used only by the label easing; written by the frame loop at 5942 | `render/state.ts` | — | — | mutable state |
| 92 | `placeLabel` | `function(el,x,y,show)` | 4782–4810 | steady-label placement: direct when `labelSteady` is off; otherwise eases with a 0.06 s time constant, lands (never flies) on a single >90 px leap, steps aside after 4 leaps and returns after 12 calm frames, and debounces hiding by 0.18 s. **State is stashed on the element as `el._lb`.** | `ui/hud.ts` (labels) | `labelSteady`, `frameDt`(own) | DOM | mutates (element-attached state) |
| 93 | `g710GL` | `const` (VAO bundle) | 4812 | Gliese 710's dynamic point VAO — **`dynVAO(1)` runs at eval time** | `render/passes/g710.ts` | `dynVAO` | gl | eval-side-effect |
| 94 | `g710Pos` | `const` Float32Array(3) | 4813 | its position staging buffer | `render/passes/g710.ts` | — | — | pure alloc |
| 95 | `g710Size` | `const` Float32Array(1) | 4813 | its size staging buffer | `render/passes/g710.ts` | — | — | pure alloc |
| 96 | `g710Col` | `const` Float32Array(3) | 4813 | its colour staging buffer | `render/passes/g710.ts` | — | — | pure alloc |
| 97 | `g710Lbl` | `const` (IIFE → div) | 4814–4815 | its label, warm-tinted | `ui/hud.ts` | — | DOM | eval-side-effect |

### 1.11 Hazard colour (4817–4895)

| # | name | kind | lines | what it is | target module | external deps | touches | purity |
|---|------|------|-------|------------|---------------|---------------|---------|--------|
| 98 | `T_STOPS` | `const` (tuple[]) | 4824–4828 | eight temperature→RGB stops from −60 °C to +90 °C | `ui/theme.ts` | — | — | pure |
| 99 | `tempColour` | `function(c)` | 4829–4840 | linear interpolation over `T_STOPS`, clamped at both ends, returns `rgb(...)` | `ui/theme.ts` | — | — | pure |
| 100 | `C_SAFE` | `const` `[95,216,255]` | 4841 | interface cyan | `ui/theme.ts` | — | — | pure |
| 101 | `C_WARN` | `const` `[255,207,92]` | 4841 | amber | `ui/theme.ts` | — | — | pure |
| 102 | `C_DEAD` | `const` `[255,110,110]` | 4841 | red | `ui/theme.ts` | — | — | pure |
| 103 | `C_ICE` | `const` `[176,232,255]` | 4841 | glacial pale blue | `ui/theme.ts` | — | — | pure |
| 104 | `C_LIFE` | `const` `[74,214,126]` | 4842 | habitable green | `ui/theme.ts` | — | — | pure |
| 105 | `mix3` | `const` (arrow) | 4843 | 3-channel lerp | `ui/theme.ts` | — | — | pure |
| 106 | `INK_WARM` | `const` `[220,232,245]` | 4844 | unfrozen body text colour | `ui/theme.ts` | — | — | pure |
| 107 | `DIM_WARM` | `const` `[132,146,172]` | 4844 | unfrozen dim text colour | `ui/theme.ts` | — | — | pure |
| 108 | `rgbStr` | `const` (arrow) | 4845 | rounds an RGB triple to `rgb(...)` | `ui/theme.ts` | — | — | pure |
| 109 | `lastRGB` | `let` (string) | 4846 | last written `--stateRGB`, for change gating | `ui/theme.ts` | — | — | mutable state |
| 110 | `lastA` | `let` (number `-1`) | 4846 | last written `--stateA` | `ui/theme.ts` | — | — | mutable state |
| 111 | `lastIce` | `let` (number `-1`) | 4846 | last written `--iceA` | `ui/theme.ts` | — | — | mutable state |
| 112 | `lastWhite` | `let` (number `-1`) | 4846 | last written whitening amount | `ui/theme.ts` | — | — | mutable state |
| 113 | `iceShown` | `let` (number `0`) | 4846 | the eased cold value | `ui/theme.ts` | — | — | mutable state |
| 114 | `iceLast` | `let` (number) | 4846 | **`performance.now()` captured at module-evaluation time** — the ice easing clock's origin | `ui/theme.ts` | — | — | eval-side-effect (reads the wall clock at eval) |
| 115 | `setStateColour` | `function(h, meanC)` | 4847–4895 | maps hazard `h` and mean temperature to `--stateRGB`, `--stateA`, `--iceA`, `--lifeRGB`, `--ink`, `--dim` on `document.documentElement`; eases `iceShown` frame-rate-independently and gates the whitening from `h = 0.30`; early-returns when neither RGB nor alpha moved | `ui/theme.ts` | — | DOM | mutates |

### 1.12 Resize and panel crowding (4897–4920)

| # | name | kind | lines | what it is | target module | external deps | touches | purity |
|---|------|------|-------|------------|---------------|---------------|---------|--------|
| 116 | `W` | `let` (number `0`) | 4898 | CSS viewport width; read all through `frame()` | `render/state.ts` | — | — | mutable state |
| 117 | `H` | `let` (number `0`) | 4898 | CSS viewport height | `render/state.ts` | — | — | mutable state |
| 118 | `DPR` | `let` (number `1`) | 4898 | effective device pixel ratio | `render/state.ts` | — | — | mutable state |
| 119 | `projMat` | `let` (undefined until `resize()`) | 4898 | the projection matrix; **starts `undefined`** and is rebuilt every frame at 5385 | `render/state.ts` | — | — | mutable state |
| 120 | `dprCap` | `let` (number `2`) | 4898 | pixel-ratio cap, lowered to 1 by the first-launch probe at 5236 | `render/state.ts` | — | — | mutable state |
| 121 | `CROWDABLE` | `const` (string[]) | 4905 | `['fpsBox','scaleNote','gamebar']` — the pieces that yield to the settings panel | `ui/panels.ts` | — | — | pure |
| 122 | `fitPanels` | `function` | 4906–4920 | measures `#hud` against each crowdable element and toggles `.crowded`; early-returns when the panel is collapsed | `ui/panels.ts` | `$` | DOM | mutates (DOM) |

### 1.13 Highlight rolloff / HDR (4921–4993)

| # | name | kind | lines | what it is | target module | external deps | touches | purity |
|---|------|------|-------|------------|---------------|---------------|---------|--------|
| 123 | `TONE_VS` | `const` (GLSL string) | 4929–4935 | full-screen-triangle vertex shader built from `gl_VertexID` | `shaders/tone.vert` | — | — | pure |
| 124 | `TONE_FS` | `const` (GLSL string) | 4936–4949 | knee + asymptotic rolloff applied as one ratio to all three channels, so hue survives | `shaders/tone.frag` | — | — | pure |
| 125 | `pTone` | `const` (WebGLProgram) | 4950 | **compiled and linked at eval time** | `render/passes/tone.ts` | `prog` | gl | eval-side-effect |
| 126 | `UT` | `const` (uniform map) | 4951 | `{tex, knee}` locations | `render/passes/tone.ts` | `gl` | gl | eval-side-effect |
| 127 | `emptyVAO` | `const` (WebGLVertexArrayObject) | 4952 | attribute-less VAO for the full-screen pass | `render/passes/tone.ts` | `gl` | gl | eval-side-effect |
| 128 | `hdrExt` | `const` (extension\|null) | 4953 | `EXT_color_buffer_float` or `…half_float`; **extension probe at eval time** | `gpu/framebuffer.ts` | `gl` | gl | eval-side-effect |
| 129 | `hdrFB` | `let` (framebuffer\|null) | 4954 | the half-float FBO | `gpu/framebuffer.ts` | — | gl | mutable state |
| 130 | `hdrTex` | `let` (texture\|null) | 4954 | its colour attachment | `gpu/framebuffer.ts` | — | gl | mutable state |
| 131 | `hdrOK` | `let` (bool) | 4954 | completeness flag consulted by `frame()` at 5389 | `gpu/framebuffer.ts` | — | — | mutable state |
| 132 | `makeHDR` | `function` | 4955–4971 | (re)allocates the RGBA16F texture + FBO at canvas size, NEAREST/CLAMP, checks completeness, unbinds; no-ops without `hdrExt` | `gpu/framebuffer.ts` | `gl`, `canvas` | gl | mutates |
| 133 | `SKY_MIRROR` | `const` `-1` | 4982 | the single x-reflection that converts the left-handed data frame to a right-handed drawn one | `astro/constants.ts` | — | — | pure |
| 134 | `skyProjection` | `function(near, far)` | 4984 | `perspective(π/3, W/H, near, far)` with `m[0] *= SKY_MIRROR` | `render/camera.ts` | `perspective`, `W`(own), `H`(own) | — | reads |
| 135 | `resize` | `function` | 4985–4992 | recomputes `DPR`/`W`/`H`, sizes the canvas, sets the viewport, rebuilds `projMat` and the HDR target | `render/frame.ts` or `gpu/context.ts` | `canvas`, `gl` | DOM, gl | mutates |
| 136 | *(bare)* `addEventListener('resize', …); resize();` | statement | 4993 | registers **resize listener #3 of 3** and runs `resize()` immediately at eval | `main.ts` | — | DOM, gl, events | eval-side-effect |

### 1.14 Page visibility (4995–5021)

| # | name | kind | lines | what it is | target module | external deps | touches | purity |
|---|------|------|-------|------------|---------------|---------------|---------|--------|
| 137 | `hiddenState` | `let` (object\|null) | 5005 | what was running when the tab went away: `{sim, music, audio}` | `main.ts` (or `audio/engine.ts`) | — | — | mutable state |
| 138 | *(bare)* `document.addEventListener('visibilitychange', …)` | statement | 5006–5021 | records intent (never element state), pauses the sim/`player`, suspends the `AudioContext`; on return restores only what was running and retries `play()` through `armUnlock()` | `main.ts` | `paused`, `musicOn`, `player`, `audio`, `$`, `armUnlock` | DOM, WebAudio, events | eval-side-effect |

---

## 2. Mutable module-level state declared here that OTHER parts of the file mutate

| symbol | declared | mutated outside this range | note |
|--------|----------|----------------------------|------|
| `qrPos` | 4201 | **6302** (drag end recomputes it) | also read at 6274–6275; the declaration was moved here precisely because the QR block at 6250+ is evaluated after `saveSettingsNow` is defined. Any module split must keep `qrPos` owned by one module and imported by both `ui/settings` and `ui/qr`, not duplicated. |
| `qrHeld` | 4201 | **6306, 6315** | read at 6292. |
| `keepSaved` | 4292 | **6166, 6169** | the opening-scenario gate; false everywhere else. |
| `armsOn` | 4745 | **3784** — a `toggle()` callback registered *384 lines above the declaration* | read at 5978. See hazard H3. |
| `frameDt` | 4781 | **5942** (frame loop) | only consumer is `placeLabel` (4807). |
| `dprCap` | 4898 | **5236** (first-launch probe drops it to 1) | read at 4204, 4234, 5240. |
| `projMat` | 4898 | **5385** (rebuilt every frame) | read at 5395, 5436, 5485, 5616, 5646, 5671, 5727, 5743, 5756, 5768, 5805. |
| `W`, `H`, `DPR` | 4898 | written only by `resize()` (4986–4987) | read pervasively in `frame()` and by `skyProjection`. `DPR` is read at 5237. |
| `hdrFB`, `hdrTex`, `hdrOK` | 4954 | written only by `makeHDR()` | read at 5389, 5390, 5931. |
| `liveCount` | 4279 | never written after 4279 | read at 6019 — a permanently-false branch; do not "simplify" it away, it changes nothing but the refactor must not delete it either. |
| `unitMode` | 4280 | written by the `setSegUnits` callback (4278) | read at 4421, 4425. |
| `calMode` | 4280 | written by `syncCal` (4282) | read at 4453. |
| `simT`, `nextSample`, `reseedFollow`, `paused`, `cam`, `coreLock`, `panF`, `followTarget`, `events`, `puffs`, `accB/accSN/accPN`, `curD`, `speedMult` | **outside** this range | mutated from inside this range (`jumpToEpoch`, `refillTrails`, the toggles) | the reverse direction: this slice is a heavy writer of state it does not own. |

State declared here and mutated only here: `saveTimer`, `tipFor`, `tipTimer`, `autoFsArmed`, `leftFsInLandscape`, `rotIx`, `tourHeldClock`, `lastRGB`, `lastA`, `lastIce`, `lastWhite`, `iceShown`, `iceLast`, `hiddenState`.

---

## 3. Randomness consumed at evaluation time

**None.** There is no `Math.random`, `crypto.getRandomValues` or any other entropy source anywhere in 4187–5022, inside a function or at eval time. This slice is safe to reorder with respect to the seeded-PRNG screenshot gate *on the randomness axis alone*.

Two non-random but still evaluation-time environment reads exist and must keep their position for other reasons:

| line | expression | why it matters |
|------|------------|----------------|
| 4846 | `iceLast = performance.now()` | captures the wall clock at module-eval time. Harmless for parity (the first `setStateColour` call clamps `dt` to 0.1 s), but it is an eval-time clock read and belongs in the same "do not hoist" bucket. |
| 4319 | `Date.now()` inside `jumpToEpoch`'s `helix` branch | **not** eval-time, but it *is* reached during boot at 6167 (`$('jump').dispatchEvent(new Event('change'))`), which makes `simT` wall-clock dependent on the very first frame. Screenshot parity across runs already depends on whatever the harness does about this; the refactor must not change *when* that dispatch happens relative to `restoreSettings()` (6156) or the value of `keepSaved` (6166) around it. |

Also environment-dependent at eval time, and therefore capable of changing which code path the boot takes:

- 4588 `matchMedia('(display-mode: …)')` / `navigator.standalone`
- 4592 `location.protocol` / `'serviceWorker' in navigator`
- 4721 `matchMedia('(prefers-reduced-motion: reduce)')` → `$('tPause').click()`
- 4953 `gl.getExtension('EXT_color_buffer_float' | '…half_float')` → decides whether the whole tone-mapping pass runs at all

---

## 4. Boot-order hazards

**H1 — `restoreSettings` (4221) reaches forward across ~700 lines into `let` bindings.**
It reads `dprCap` (4898), calls `resize` (4985), and reads `DETAIL_D`/`DETAIL_NAMES` (4510/4511) and `setSegUnits` (4278). It is only safe because it is *called* at line **6156**, after the whole script body has evaluated. The comment at 4218–4220 says exactly this. If a bundler or a module split ever causes `restoreSettings()` to be invoked during module init — e.g. by moving it into a `ui/settings` module that self-initialises on import — every one of those bindings is in TDZ. `restoreSettings` must remain an exported function that `main.ts` calls at the same point in the sequence.

**H2 — `setSegUnits` (4278) is declared two lines *before* `unitMode` (4280), and its callback writes `unitMode`.**
This does not throw only because `seg()` (4134–4143) ends with `set(initial, false)` — the `false` suppresses the callback. The source comment at 4139–4140 records that calling `fn` this early "would touch bindings not yet initialised". If the `seg` helper is refactored into `ui/sections.ts` and anyone drops the `apply === false` guard, or reorders `set(initial, …)`, this is an immediate boot-time TDZ on `unitMode`. Treat the `false` argument as load-bearing.

**H3 — listeners registered above their state/elements.**
- `toggle($('tArms'), on=>{ armsOn=on; … armEls…})` at **3784** captures `armsOn` (**4745**) and `armEls` (**4754**).
- `toggle($('tLabels'), …)` at **3783**, `toggle($('tP9'), …)` at **3803**, `toggle($('tDwarfs'), …)` at **3804** all capture `labelEls` (**4725**).
Synchronous evaluation makes these safe today: no click can be dispatched before the body finishes. They stop being safe the moment (a) a module boundary makes 3783–3804 evaluate in a separate tick, or (b) `restoreSettings()`'s replay (`$(id).click()` at 4231) is moved earlier — it fires precisely these handlers. Any split must keep the label-element construction (4724–4815) evaluated **before** the first replayed click.

**H4 — `jumpToEpoch` (4293), `refillTrails` (4477) and `humanYear` (4442) read `simT`/`nextSample` (declared 5029) and `reseedFollow` (declared 5054).**
Both are ~600–750 lines below their readers. `$('jump')`'s change listener is registered at **4409** and `jumpToEpoch` is first executed at **6167** — after 5029/5054 — so it works. `refillTrails` is also reachable from 3708 and 3765 (`setTimeout`), which are likewise deferred. Any restructuring that runs a jump, a shuttle change or a trail refill during init throws on `simT`.

**H5 — eval-time GL work in a fixed order.**
`setBodySizes()` at **4497** (needs `bufBodySize` 2865, `realSizes` 2858, `dispSizes` 2857), `dynVAO(1)` at **4812**, `prog(TONE_VS, TONE_FS)` at **4950**, `gl.getUniformLocation` at **4951**, `gl.createVertexArray()` at **4952**, `gl.getExtension` at **4953**, and `resize()` at **4993** (which calls `makeHDR()` → allocates the HDR texture at the current canvas size). All of these require `gl`/`canvas` (1188–1189) already created and the buffers of the earlier slices already built. They must stay after those and in this relative order; `resize()` in particular must run **after** `hdrExt`/`hdrFB`/`hdrTex`/`hdrOK` (4953–4954) are declared, or `makeHDR` hits TDZ on `hdrTex`.

**H6 — `resize()` at 4993 is the only initialiser of `W`, `H`, `DPR`, `projMat` and the HDR FBO.**
`projMat` is `undefined` between line 4898 and line 4993. `skyProjection` (4984) divides by `H`, which is `0` until then. Nothing may call `skyProjection`, `frame()` or anything reading `projMat` in that window.

**H7 — three separate `resize` listeners and two `fullscreenchange` listeners are registered in this slice, in a specific order.**
resize: 4539 (hide tooltip) → 4716 (redraw tour lines) → 4993 (`resize(); fitPanels()`). Note the tour redraw at 4716 runs **before** `resize()` recomputes `W`/`H`, so `drawTourLines` measures the *new* `innerWidth`/`innerHeight` directly rather than the module's `W`/`H`; that is why it uses `innerWidth`/`innerHeight` (4627) and not `W`/`H`. Reordering these listeners changes what the tour measures.
fullscreenchange: 4549 (button class) → 4556 (`leftFsInLandscape`). Both are `document`-level; order is currently observable only through side effects but must be preserved as a rule.

**H8 — hard-coded element ids that fail silently.**
`TOUR_HINTS` (4606–4614) names `env`, `simPanel`, `hud`, `tLabelsAll`, `tInfo`, `zoomIn`, `gamebar`; `tourTarget` (4616–4622) returns `null` for a missing id and `drawTourLines` `continue`s — a renamed id silently drops a hint with no error. `CROWDABLE` (4905) names `fpsBox`, `scaleNote`, `gamebar`; `fitPanels` would throw on `el.classList` if one of those ids moved, since `$()` returns `null`. `updateBar` (4269) hard-codes `sCal`, `sAge`, `sGyr`, `cDeath`, `cBirth` and dereferences `.style` — same failure. `document.querySelectorAll('.pclose[data-close]')` at 4596 binds by attribute at eval time. `S_TOG`/`S_SLD`/`S_CHK` (4192–4196) are 38 ids dereferenced unguarded in `saveSettingsNow` — but that one is inside `try/catch`, so a moved id there fails **invisibly** rather than loudly.

**H9 — the error-log collector (1109–1125) must stay first.**
Everything in this slice that runs at eval time (H5, 4721, 4993) can throw on a hostile device — no WebGL2 extension, a refused fullscreen, a missing element. `main.ts` must import/execute the errorlog module before any of the modules in this slice, and the import must not be tree-shaken or hoisted below them. `renderLog` (6339) is referenced defensively from 1113 (`typeof renderLog === 'function'`), which is the existing guard for the reverse direction.

**H10 — `$('tPause').click()` at 4721 fires before `restoreSettings()`.**
On a reduced-motion device the sim is paused at eval time; `restoreSettings` (6156) deliberately does **not** persist `paused`, and `jumpToEpoch` re-checks the media query before unpausing (4322, 4337, 4349, 4363, 4375, 4402). This three-way interaction (eval-time click → restore → scenario staging at 6167) is the exact ordering that must be preserved in `main.ts`.

---

## 5. Cross-slice reads (symbols read here, declared elsewhere)

| symbol | declared at | slice / proposed module |
|--------|-------------|-------------------------|
| `$` | 3591 | `core/dom.ts` |
| `canvas` | 1188 | `gpu/context.ts` |
| `gl` | 1189 | `gpu/context.ts` |
| `prog` | 1197 | `gpu/program.ts` |
| `perspective` | 1163 | `core/mat4.ts` |
| `YR_PER_SIM` | 1540 | `astro/constants.ts` |
| `AGE0` | 1541 | `astro/constants.ts` |
| `BODIES` | 1573 | `astro/bodies.ts` |
| `realMode` | 1596 | `render/state.ts` |
| `curD` | 1597 | `scene/galaxy.ts` |
| `NB` | 1598 | `astro/bodies.ts` |
| `tmp`, `tmpSun` | 1624 | `astro/bodies.ts` scratch |
| `bodyPos` | 1625 | `astro/bodies.ts` |
| `setGalaxy` | 2040 | `scene/galaxy.ts` |
| `dispSizes` | 2857 | `render/passes/bodies.ts` |
| `realSizes` | 2858 | `render/passes/bodies.ts` |
| `bufBodySize` | 2865 | `gpu/buffers.ts` |
| `TRAIL_N`, `DT_SAMPLE` | 2876 | `render/trails.ts` |
| `trails`, `trailBufs` | 2877 | `render/trails.ts` |
| `trailAnchor` | 2923 | `render/trails.ts` |
| `trailPos` | 2924 | `render/trails.ts` |
| `soundOn`, `sfxVol`, `audio` | 3194 | `audio/engine.ts` |
| `musicOn`, `musicVol`, `trackIx` | 3229 | `audio/music.ts` |
| `player` | 3230 | `audio/music.ts` |
| `armUnlock` | 3258 | `audio/engine.ts` |
| `dynVAO` | 3370 | `gpu/buffers.ts` |
| `events`, `puffs` | 3392 | `render/state.ts` |
| `accB`, `accSN`, `accPN` | 3410 | `render/state.ts` |
| `cam` | 3501 | `render/camera.ts` |
| `coreLock` | 3502 | `render/camera.ts` |
| `followTarget` | 3505 | `render/camera.ts` |
| `panF` | 3515 | `render/camera.ts` |
| `paused`, `showTrails`, `showLabels`, `showStats` | 3658 | `render/state.ts` |
| `showDwarfs`, `showBelt`, `showKuiper`, `showOort` | 3659 | `render/state.ts` |
| `WEEK_YR` | 3661 | `astro/constants.ts` |
| `speedRungOf` | 3675 | `ui/hud.ts` (speed rungs) |
| `supStr` | 3676 | `ui/hud.ts` |
| `speedMult` | 3677 | `render/state.ts` |
| `speedLabel` | 3679 | `ui/hud.ts` |
| `setMultExp` | 3690 | `ui/hud.ts` |
| `shuttle` | 3702 | `render/state.ts` |
| `trailPct` | 3754 | `render/trails.ts` |
| `isOn` | 3772 | `ui/panels.ts` |
| `toggle` | 3773 | `ui/panels.ts` |
| `labelSteady` | 3787 | `render/state.ts` |
| `applyFocusView` | 3856 | `render/camera.ts` |
| `PANELS` | 3959 | `ui/panels.ts` |
| `openSeq` | 3969 | `ui/panels.ts` |
| `pState` | 3970 | `ui/panels.ts` |
| `setPanelOpen` | 3976 | `ui/panels.ts` |
| `layoutPanels` | 4045 | `ui/panels.ts` |
| `SECS` | 4106 | `ui/sections.ts` |
| `secOpen` | 4110 | `ui/sections.ts` |
| `applySecs` | 4111 | `ui/sections.ts` |
| `seg` | 4134 | `ui/sections.ts` |
| `simT`, `nextSample` | **5029** (below) | `render/state.ts` |
| `reseedFollow` | **5054** (below) | `render/camera.ts` |
| `renderLog` | **6339** (below) | `core/errorlog.ts` |
| `hadSaved` | **6155** (below) | `main.ts` |

---

## 6. Target-module fan-out for this slice

`ui/settings.ts` · `ui/qr.ts` · `ui/hud.ts` · `ui/sections.ts` · `ui/panels.ts` · `ui/scenarios.ts` · `ui/tooltips.ts` · `ui/fullscreen.ts` · `ui/tour.ts` · `ui/dialogs.ts` · `ui/theme.ts` · `render/state.ts` · `render/camera.ts` · `render/trails.ts` · `render/frame.ts` · `render/passes/tone.ts` · `render/passes/bodies.ts` · `render/passes/g710.ts` · `gpu/context.ts` · `gpu/buffers.ts` · `gpu/framebuffer.ts` · `shaders/tone.vert` · `shaders/tone.frag` · `astro/constants.ts` · `core/dom.ts` · `core/mat4.ts` · `main.ts`
