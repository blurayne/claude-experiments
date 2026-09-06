# 00 — THE PLAN

The single document the migration is executed from. Everything below is derived from inventories 01–12 and re-checked against `galactic-transit.html` (6431 lines; the script is lines 1095–6429).

Reading order for an executor: §4 (the sequence) is the script. §1 tells you what goes where. §2 tells you what may import what. §3 is the one design decision that has to be made before any state moves. §5 is what to watch while doing it.

**Three invariants govern every step.** They are the gate, not aspirations.

1. **Pixels.** `npm run e2e` — 14 parity states × a seeded `Math.random` × a frozen clock (`tests/harness/drive.ts`, `tests/harness/states.ts`). A step that changes one pixel is wrong unless the change was the point.
2. **The random stream.** The order and count of `Math.random()` draws consumed at module-evaluation time is part of the golden image. There are exactly seven eval-time consumers (§5 R2); their relative order is a hard contract.
3. **Boot order.** The 29-step DOM boot sequence (09-dom §5.4) is reproduced by explicit `initX()` calls from `main.ts`, never by import-graph evaluation order.

---

## 1. THE MODULE MANIFEST

### 1.0 Coverage statement

Lines **1095–6429** are the `<script>` element. Lines **1096–6428** are the JavaScript body and are partitioned below into exactly one owner each. Three lines are *not* owned by any `src/` module and this is deliberate:

| line | content | disposition |
|---|---|---|
| **1095** | `<script>` | Becomes `<script type="module" src="./main.ts"></script>` in `src/galactic-transit.html`. Belongs to the HTML shell, not to a module. |
| **1096** | `"use strict";` | **Deleted.** ES modules are implicitly strict; the directive is a no-op in every target module. No behaviour change. |
| **6429** | `</script>` | HTML shell, as 1095. |

Every other line — 1096 excepted, 1097 through 6428 inclusive — appears exactly once in §1.2. Blank lines and comment lines travel with the declaration they document; where a blank line sits on a module boundary it goes to the module *above* it. That is stated per-run so the partition is checkable by `awk`.

Outside the script: CSS lines **17–386** become four files (§1.3); markup lines **388–1094** become `src/galactic-transit.html`'s body verbatim.

### 1.1 The module list

**91 files.** 63 TypeScript modules (7 core + 4 gpu + 8 astro + 7 scene + 7 render + 14 render/passes + 3 audio + 12 ui + `main.ts`), 23 `.glsl` files, 4 `.css` files, one HTML shell.

```
src/
  galactic-transit.html          markup 388–1094 verbatim + 4 <link> + 1 <script type=module>
  main.ts                        the boot sequence, and nothing else

  core/     errorlog.ts  build.ts  mat4.ts  dom.ts  rng.ts  format.ts  keys.ts        (7)
  gpu/      context.ts  program.ts  buffers.ts  framebuffer.ts                        (4)
  astro/    constants.ts  bodies.ts  sun.ts  earth.ts  calendar.ts
            environment.ts  merger.ts  g710.ts                                        (8)
  scene/    starfield.ts  galaxy.ts  galaxymap.ts  andromeda.ts  belts.ts
            cache.ts  sky.ts                                                          (7)
  render/   state.ts  camera.ts  trails.ts  labels.ts  lifecycle.ts  probe.ts  frame.ts (7)
  render/passes/  points.ts  supernova.ts  remnant.ts  nebula.ts  dust.ts  belts.ts
            rings.ts  globe.ts  bodies.ts  tone.ts  sun.ts  pn.ts  g710.ts  eatflash.ts (14)
  audio/    engine.ts  music.ts  sfx.ts                                               (3)
  ui/       persist.ts  panels.ts  sections.ts  hud.ts  scenarios.ts  tour.ts
            tooltips.ts  fullscreen.ts  dialogs.ts  theme.ts  qr.ts  debug.ts        (12)
  shaders/  23 × .glsl
  styles/   base.css  panels.css  dialogs.css  hud.css
```

Two names differ from the inventories on purpose:

- `ui/persist.ts` is what 07 calls `ui/settings.ts`. Renamed because it owns `SKEY`/`S_TOG`/`S_SLD`/`S_CHK`/`saveSettingsNow`/`saveSettings`/`restoreSettings` and **must not** import `ui/panels` or `ui/sections` (§2 C6). The *listeners* for individual controls do not live there; they live with the thing they control.
- `render/labels.ts` is new (09-dom §6): `#labels`, the `.lbl`/`.armlbl` pools, `placeLabel`, and the label pass at 5943–6015. ~120 lines with no home in the agreed layout.

### 1.2 The coverage ledger

Ordered walk of 1097 → 6428. Every run names its owner. Ranges are inclusive.

*Verified mechanically: the ranges below sort into a contiguous cover of 1097–6428 with **zero gaps and zero overlaps**. Re-run that check after any edit to this section.*

#### Slice 01 — 1097–1535

| lines | owner | what |
|---|---|---|
| 1097–1099 | `core/build.ts` | version-policy comment |
| 1100–1132 | `core/errorlog.ts` | `TOUCH_DEV`, `errLog`, `ERR_MAX`, `logErr`, the `if(TOUCH_DEV)` boot block (listeners 1116–1123, console patch 1124–1131) |
| 1133–1161 | `core/build.ts` | `BUILD`, `VERSION`, `localBuildStamp`, `BUILD_LINE` |
| 1162–1185 | `core/mat4.ts` | `perspective`, `lookAt`, `mul` |
| 1186–1190 | `gpu/context.ts` | `canvas`, `gl`, the no-WebGL2 bailout |
| 1191–1203 | `gpu/program.ts` | `sh`, `prog` |
| 1204–1322 | `shaders/points.vert.glsl` | `PT_VS` |
| 1323–1339 | `shaders/points.frag.glsl` | `PT_FS` (1323–1325 = the Gaia Sky attribution comment; it moves into the `.glsl` file as a GLSL comment) |
| 1340–1351 | `shaders/trail.vert.glsl` | `TR_VS` |
| 1352–1356 | `shaders/trail.frag.glsl` | `TR_FS` |
| 1357–1373 | `render/passes/points.ts` | `pPt`, `pTr`, `U` |
| 1374–1409 | `shaders/supernova.vert.glsl` | `SN_VS` + the "copied rather than shared" comment |
| 1410–1457 | `shaders/supernova.frag.glsl` | `SN_FS` |
| 1458–1464 | `render/passes/supernova.ts` | `pSN`, `USN` |
| 1465–1502 | `shaders/remnant.vert.glsl` | `REM_VS` |
| 1503–1527 | `shaders/remnant.frag.glsl` | `REM_FS` |
| 1528–1535 | `render/passes/remnant.ts` | `pRem`, `UREM` |

#### Slice 02 — 1536–1882

| lines | owner | what |
|---|---|---|
| 1536–1542 | `astro/constants.ts` | `R_GAL`, `V_GAL`, `GAL_PERIOD`, `YR_PER_SIM`, `AGE0`, `AND_AGE` (dead — carried) |
| 1543–1548 | `astro/merger.ts` | `SCATTER_AGE`, `SR_A`, `SR_B`, `SR_K` |
| 1549–1566 | `astro/sun.ts` | `sunR`, `sunPhase` |
| 1567–1570 | `astro/constants.ts` | `TILT`, `E1`, `E2` |
| 1571–1592 | `astro/bodies.ts` | `BODIES` |
| 1593–1595 | `astro/constants.ts` | `AU2U`, `OO_REAL` |
| 1596–1597 | `render/state.ts` | `realMode` → **`astro/constants.REAL_MODE`** (see §3.4), `curD` → `gfx.curD` |
| 1598–1600 | `astro/bodies.ts` | `NB`, `N_PLANETS`, `I_P9` |
| 1601 | `render/state.ts` | `showP9` → `show.p9` |
| 1602–1604 | `astro/bodies.ts` | `PHASE` + comment |
| 1605 | `astro/constants.ts` | `EN` |
| 1606–1618 | `astro/bodies.ts` | `DTILT`, `BU`, `BV`, the `BODIES.forEach` basis builder |
| 1619–1622 | `astro/constants.ts` | `WOB_A`, `WOB_T` |
| 1623–1640 | `astro/bodies.ts` | `tmp`, `tmpSun`, `earthW` (the three shared scratch vectors), `bodyPos` |
| 1641–1648 | `gpu/buffers.ts` | `makeBuf` (dead — carried verbatim) |
| 1649–1656 | `core/rng.ts` | `gauss`, `expR` |
| 1657–1666 | `scene/starfield.ts` | `N_STAR`, the `{ var starPos … }` block → `buildStarfield()` |
| 1667–1682 | `astro/constants.ts` | `PITCH`, `BAR_L`, `BAR_A`, `armAngle`, `ARMS`, `sA`, `cA` — **moved down out of `scene/galaxy` to break astro→scene** (§2 C4) |
| 1683–1697 | `render/state.ts` | the live-galaxy record: `N_GXY`…`dustStr` → `gfx.*` |
| 1698–1849 | `scene/galaxy.ts` | `genGalaxy` |
| 1850–1854 | `gpu/buffers.ts` | `vaoBufs` + its comment |
| 1855–1863 | `scene/cache.ts` | `flushGxyCache` |
| 1864–1879 | `gpu/buffers.ts` | `deleteVAO`, `pointVAO` |
| 1880 | `scene/starfield.ts` | `vaoStars` — becomes the return of `buildStarfield()`; **called from `main.ts`** |
| 1881 | `render/state.ts` | `vaoGxy`, `vaoNeb`, `vaoDust` → `gfx.*.vao` |
| 1882 | `scene/cache.ts` | `gxyCache` |

#### Slice 03 — 1883–2452

| lines | owner | what |
|---|---|---|
| 1883–1890 | `scene/galaxymap.ts` | `galaxyMap`, `MAP_SCALE` |
| 1891–1933 | `scene/galaxymap.ts` | `loadGalaxyMap` — **signature changes to `loadGalaxyMap(onReady)`** (§2 C3); 1929–1930 become `onReady()` |
| 1934–1944 | `scene/galaxymap.ts` | `mapPick`, `mapXZ` |
| 1945–2039 | `scene/galaxy.ts` | `genGalaxyMap` |
| 2040–2067 | `scene/cache.ts` | `setGalaxy` |
| 2068–2080 | `shaders/nebula.frag.glsl` | `NEB_FS` |
| 2081–2099 | `render/passes/nebula.ts` | `pNeb`, `UN` |
| 2100–2115 | `shaders/dust.frag.glsl` | `DUST_FS` |
| 2116–2138 | `render/passes/dust.ts` | `pDust`, `DUST_DEEP_CAP` (2122, frozen to `const`), `UD` |
| 2139–2141 | `main.ts` | the load-order-contract comment; it documents `main.ts`'s call order and belongs there |
| 2142–2150 | `scene/andromeda.ts` | section comment |
| 2151 | `astro/constants.ts` | `R_A` |
| 2152–2157 | `scene/galaxymap.ts` | `M31_MAP_SCALE`, `mapXZ31` |
| 2158–2161 | `astro/constants.ts` | `M32_C`, `M110_C`, `GSS_DIR` |
| 2162–2285 | `scene/andromeda.ts` | `genAndromeda`, `genAndromedaMap` |
| 2286–2292 | `scene/galaxymap.ts` | `M31_ARM_K` |
| 2293–2360 | `scene/galaxymap.ts` | `loadM31Map` — same `onReady` change; 2356–2357 become `onReady()` |
| 2361 | `core/mat4.ts` | `MAT3_ID` |
| 2362–2364 | `main.ts` | the `uGRot` identity seeding loop |
| 2365 | `main.ts` | `setGalaxy(1)` — **the literal 1 is load-bearing**, R16 |
| 2366–2416 | `astro/merger.ts` | `M31_DIR`, `M31_E2`, `M31_ROT`, `KPC2U`, `M31_ORBIT`, `orbitUV` |
| 2417–2451 | `astro/merger.ts` | `sepScene`, `MERGE_A0/A1`, `mergeAt`, `MERGE_T0/T1`, `diskSpin`, `andPos`, `updateAnd` — **`updateAnd(ageGyr)` becomes `updateAnd(a: number)`** (§2 C5) |
| 2452 | `astro/merger.ts` | blank |

#### Slice 04 — 2453–2935

| lines | owner | what |
|---|---|---|
| 2453–2491 | `scene/belts.ts` | `AB_N`…`ooSz` and the three eval-time generator blocks → `buildAsteroids()`, `buildKuiper()`, `buildOort()`; **called from `main.ts` in this order** |
| 2492–2503 | `shaders/kuiper.vert.glsl` | `KB_VS` |
| 2504–2516 | `shaders/asteroid.vert.glsl` | `AB_VS` |
| 2517–2524 | `shaders/oort.vert.glsl` | `OO_VS` |
| 2525–2528 | `shaders/belt.frag.glsl` | `BELT_FS` |
| 2529–2559 | `render/passes/belts.ts` | `pKB/pOO/pAB`, `UA/UK/UO`, `vaoKB`, `bufAbSz`, `bufAbP`, `beltVAO`, `vaoABr/vaoABd`, `vaoOO` |
| 2560–2564 | `scene/belts.ts` | `RING_SEGS`, `ringCS` (deterministic — no RNG) |
| 2565–2568 | `shaders/ring.vert.glsl` | `RING_VS` |
| 2569–2571 | `shaders/ring.frag.glsl` | `RING_FS` |
| 2572–2573 | `render/passes/rings.ts` | `pRing` |
| 2574–2582 | `shaders/globe.vert.glsl` | `GLOBE_VS` + the Earth/Moon section comment |
| 2583–2706 | `shaders/globe.frag.glsl` | `GLOBE_FS` |
| 2707–2710 | `render/passes/globe.ts` | `pGlobe`, `UG`, `UG.uPlate = …'uPlate[0]'` — **special case, R11** |
| 2711–2724 | `render/passes/globe.ts` | `earthTex`, `loadEarthMap` |
| 2725 | `main.ts` | `loadEarthMap()` boot call |
| 2726–2761 | `astro/earth.ts` | `PLATE_MODEL`, `plateMats`, `plateAngle`, `fillPlateMats` |
| 2762 | `render/passes/globe.ts` | `vaoGlobe` |
| 2763–2770 | `astro/earth.ts` | `MOON_D0/INC/P0`, `MOON_M1/M2`, `MOON_BORN`, `MOON_DIA`, `moonDist` |
| 2771 | `render/state.ts` | `moonW`, `moonRel` |
| 2772–2778 | `astro/earth.ts` | `moonPos` |
| 2779–2801 | `astro/earth.ts` | `OBLIQ`, `EARTH_AXIS`, `EARTH_P0`, `SIDEREAL`, `earthPhi0`, `earthPrime` — **`earthPrime(t, out, org)`** (§2 C5) |
| 2802–2845 | `astro/earth.ts` | `clamp01`, `earthEra` |
| 2846–2847 | `core/mat4.ts` | `vecV`, `norm3` |
| 2848 | `render/state.ts` | `globePx`, `moonPx`, `earthDbg`, `camSunDist`, `avgLight` → `readout.*` |
| 2849–2853 | `render/passes/rings.ts` | `UR`, `vaoRing` |
| 2854–2873 | `render/passes/bodies.ts` | `bodyPosArr`, `dispSizes`, `realSizes`, `bodyCol`, `vaoBodies`, `bufBodyPos/Size/Col` |
| 2874–2891 | `render/trails.ts` | `TRAIL_N`, `DT_SAMPLE`, `trails/trailBufs/trailVaos`, the pre-fill loop |
| 2892–2916 | `render/trails.ts` | `RING_N`, `ringVaos`, the orbit-ring block |
| 2917–2918 | `render/state.ts` | `psH`, `psO` |
| 2919–2935 | `render/trails.ts` | `trailAnchor`, `trailPos`, `pushTrail` |

#### Slice 05 — 2936–3499

| lines | owner | what |
|---|---|---|
| 2936–2942 | `astro/calendar.ts` | `ageGyr` — **becomes `ageAt(t)`, pure** (§2 C5) |
| 2943–2954 | `astro/environment.ts` | `sfrFactor`, `ratesIntegral` |
| 2955–2996 | `astro/environment.ts` | `rawCR`, `CR0`, `environment` — **`environment(ts)`** |
| 2997–3049 | `scene/sky.ts` | `vaoGaia`, `N_GAIA`, `gaiaOn`, `parseStarBin`, `loadGaiaStars`, `vaoGaiaDeep`, `N_GAIA_DEEP`, `deepAsked`, `loadGaiaDeep` |
| 3050–3052 | `main.ts` | `loadGaiaStars(); loadGalaxyMap(); loadM31Map();` — **issue order is a parity contract** |
| 3053–3076 | `astro/g710.ts` | `G710_AT/PERI/V/DIR/OFF`, `g710` — **`g710(ts)`** |
| 3077–3083 | `render/state.ts` | `lifeOn` → `show.life` + section comment |
| 3084–3172 | `astro/sun.ts` | `SUN_MS_END`…`SUN_WD`, `EARTH_ORBIT_RSUN`, `SUN_EAT_AGE`, `sunState`, `eatAge`, `EAT_AGES`, `SUN_ANCHORS`, `sunTint`, `pnState`; `wasEaten`/`eatFlash` (3140) → `render/state.readout` |
| 3173–3183 | `astro/environment.ts` | `lifeState` — **`lifeState(a, env)`** |
| 3184–3191 | `render/state.ts` | `varOn`, `shimT` |
| 3192–3220 | `audio/engine.ts` | `soundOn`, `sfxVol`, `audio`, `sfxLast`, `initAudio` |
| 3221–3248 | `audio/music.ts` | `TRACKS`, `musicOn`, `musicVol`, `trackIx`, `player`, its three listeners, `showTrack`, `playTrack`, `loadTrack`, `nextTrack` |
| 3249–3275 | `audio/engine.ts` | `UNLOCK_EVENTS`, `unlockArmed`, `armUnlock` — **`armUnlock()` takes injected retry hooks** (§2 C8) |
| 3276–3366 | `audio/sfx.ts` | `BANKS`, `banksLoading`, `banksDone`, `elFallback`, `loadBanks`, `playBank`, `fxOn`, `sfx` |
| 3367–3369 | `render/state.ts` | `EV_CAP`, `PUFF_CAP`, `ev*`, `pf*` arrays |
| 3370–3382 | `gpu/buffers.ts` | `dynVAO` |
| 3383–3392 | `render/state.ts` | `evGL`, `pfGL`, `SN_CAP`, `sn*`, `snGL`, `evN`, `snN`, `events`, `puffs` |
| 3393–3405 | `scene/galaxy.ts` | `armSite`, `diskSite` |
| 3406–3410 | `render/lifecycle.ts` | `addPuff`; `accB/accSN/accPN` → `render/state.life` |
| 3411–3498 | `render/lifecycle.ts` | `lifeStep`, `fillEvents`, `fillPuffs` |
| 3499 | `render/lifecycle.ts` | blank |

#### Slice 06 — 3500–4186

| lines | owner | what |
|---|---|---|
| 3500–3588 | `render/camera.ts` | `cam`, `coreLock`, `followTarget`, pointer state, the eight canvas listeners, the two window listeners, `minDist`, `ZOOM_OBJ`, `ZOOM_RUNGS`, `zoomStep`, wheel/touch handlers → all inside `initCamera()` |
| 3589–3591 | `core/dom.ts` | `$` |
| 3592–3597 | `ui/dialogs.ts` | the four build-stamp writes → `initBuildStamps()` |
| 3598–3619 | `ui/persist.ts` | `bustAndGo`, `doRefresh` |
| 3620–3657 | `ui/persist.ts` | the `#tReload` tap-counter block → `initReloadButton()`; **`setDebugUI` reached through an injected hook** (§2 C7) |
| 3658–3660 | `render/state.ts` | `paused`, `showTrails`, `showLabels`, `showStats`, `showDwarfs`, `showBelt`, `showKuiper`, `showOort`, `speed` |
| 3661–3665 | `astro/constants.ts` | `WEEK_YR`, `HOUR_YR` |
| 3666–3701 | `ui/hud.ts` | `SPEED_RUNGS`, `SPEED_YEAR`, `speedFromSlider`, `speedRungOf`, `supStr` (→ `core/format`), `speedMult` (→ state), `speedLabel`, `fmtSpeed`, `setMultExp`, the `#multExp` listener |
| 3702 | `render/state.ts` | `shuttle`, `shuttleLastSign`, `trailRefillAt` |
| 3703–3721 | `ui/hud.ts` | `setShuttle`, `#shuttle`/`#shuttleReset`/`.stepb`/`#speed` listeners |
| 3722 | `main.ts` | `speed = speedFromSlider(SPEED_YEAR); fmtSpeed();` — boot statement |
| 3723–3729 | `ui/hud.ts` | `#hudHz` listener |
| 3730 | `render/state.ts` | `minBright`, `minSprite`, `starGain` |
| 3731–3740 | `ui/hud.ts` | `#minB` listener |
| 3741 | `render/state.ts` | `coreKnee` |
| 3742–3745 | `ui/hud.ts` | `#coreB` listener |
| 3746 | `render/state.ts` | `trailAlpha`, `orbitAlpha` |
| 3747–3753 | `ui/hud.ts` | `#trailA`, `#orbitA` listeners |
| 3754–3767 | `render/trails.ts` | `trailPct`, `trailRefill`, `applyTrailWindow`, `lastAnchor` |
| 3768–3771 | `ui/hud.ts` | `#trailL` listener |
| 3772–3776 | `core/dom.ts` | `isOn`, `toggle` |
| 3777–3782 | `ui/hud.ts` | `ICO_PAUSE`, `ICO_PLAY`, the `#tPause` toggle |
| 3783–3786 | `ui/hud.ts` | `#tLabels`, `#tArms` toggles |
| 3787 | `render/state.ts` | `labelSteady` |
| 3788–3791 | `ui/hud.ts` | `#tLabelSteady` |
| 3792–3794 | `ui/hud.ts` | `syncLabelsMaster` + its two listeners |
| 3795 | `main.ts` | `syncLabelsMaster()` boot call |
| 3796–3806 | `ui/hud.ts` | `#tLabelsAll`, `#tP9`, `#tDwarfs`, `#tBelt`, `#tKuiper` |
| 3807–3817 | `render/state.ts` | `evSN`, `evBirth`, `syncLife` |
| 3818–3820 | `ui/hud.ts` | `#tEvSN`, `#tEvBirth`, `#tVar` |
| 3821 | `render/state.ts` | `dustOn` |
| 3822–3828 | `ui/hud.ts` | `#tDust`, `syncZoomBtns`, `#tZoomBtns` |
| 3829–3830 | `render/camera.ts` | `spinLock`, `camDirW`, `spinP`, `spinFrame` |
| 3831–3842 | `ui/hud.ts` | `#tSpinLock`, `#tSpinLock2` |
| 3843 | `main.ts` | `syncZoomBtns($('tZoomBtns').checked)` boot call |
| 3844–3846 | `ui/hud.ts` | `#zoomIn`/`#zoomOut` listeners, `focusSunOpt` |
| 3847–3906 | `render/camera.ts` | `earthViewDist`, `moonViewDist`, `bodyViewDist`, `applyFocusView`, `#focusSel`/`#focusGo` listeners |
| 3907–3942 | `ui/hud.ts` | the gamebar slide-down block → `initGamebarSlide()` |
| 3943–3944 | `ui/hud.ts` | `#tGaia`, `#tFps` |
| 3945 | `render/state.ts` | `lifeSupOn` (dead — carried) |
| 3946–3951 | `audio/engine.ts` | `applySfxGain` |
| 3952–4100 | `ui/panels.ts` | `PANELS`, `openSeq`, `pState`, `panelShown`, `setPanelOpen`, `placePanels`, `findCrowded`, `layoutPanels`, the drag binding, `.pdot[data-open]` |
| 4101–4143 | `ui/sections.ts` | `SECS`, `SEC_BODY`, `secOpen`, `applySecs`, the `.sect[data-sec]` and `#secSolo` listeners, `seg` |
| 4144–4160 | `audio/music.ts` | `setMusicVol`, `#musicVol`, `#tNext` |
| 4161–4182 | `audio/sfx.ts` | the fx checkbox loop, `setSfxVol`, `#sfxVol` |
| 4183–4186 | `main.ts` | `loadTrack(0)` boot call |

#### Slice 07 — 4187–5022

| lines | owner | what |
|---|---|---|
| 4187–4196 | `ui/persist.ts` | `SKEY` (→ `core/keys`), `S_TOG`, `S_SLD`, `S_CHK` |
| 4197–4201 | `ui/persist.ts` | `qrPos`, `qrHeld` — **stay here; do not re-privatise into `ui/qr`** (R5) |
| 4202–4217 | `ui/persist.ts` | `saveSettingsNow`, `saveTimer`, `saveSettings` — **`saveSettings` becomes a hoisted `function`** (R6) |
| 4218–4266 | `ui/persist.ts` | `restoreSettings` |
| 4267 | `main.ts` | `toggle($('tOort'), …)` |
| 4268–4278 | `ui/hud.ts` | `updateBar`, `statToggle`, `setSegUnits` |
| 4279 | `render/state.ts` | `liveCount` (dead — carried) |
| 4280–4287 | `ui/hud.ts` | `calMode`, `unitMode`, `syncCal` |
| 4288–4292 | `main.ts` (4288) / `ui/scenarios.ts` (4289–4292) | `#cal` listener; `keepSaved` |
| 4293–4408 | `ui/scenarios.ts` | `jumpToEpoch` |
| 4409–4415 | `main.ts` | `#jump` change, `#jumpGo` click |
| 4416 | `core/format.ts` | `sup` |
| 4417–4441 | `ui/hud.ts` | `fmtYears`, `fmtCount` |
| 4442–4475 | `ui/hud.ts` | `humanYear` |
| 4476 | `main.ts` | `toggle($('tView'), …)` |
| 4477–4495 | `render/trails.ts` | `refillTrails` |
| 4496 | `render/passes/bodies.ts` | `setBodySizes` |
| 4497 | `main.ts` | `setBodySizes()` boot call |
| 4498–4506 | `main.ts` | `toggle($('tDive'), …)` |
| 4507–4511 | `scene/galaxy.ts` | `DETAIL_D`, `DETAIL_NAMES` |
| 4512–4519 | `main.ts` | the `#detail` input listener |
| 4520–4537 | `ui/tooltips.ts` | `tipEl`, `tipFor`, `tipTimer`, `hideTip`, `showTip`, the capture-phase delegate |
| 4538–4539 | `main.ts` | scroll + resize tip-hiding listeners (**resize #1 of 3**) |
| 4540–4547 | `ui/fullscreen.ts` | `isFs`, `reqFs`, `exitFs`, `toggleFs` |
| 4548–4549 | `main.ts` | `#tFull`, `fullscreenchange` #1 |
| 4550–4566 | `ui/fullscreen.ts` | `autoFsArmed`, `leftFsInLandscape`, `landscape`, `armAutoFs`; 4556 = `fullscreenchange` #2 |
| 4567–4573 | `main.ts` (4567–4569) / `ui/fullscreen.ts` (4570–4573) | orientation listener; `ROT`, `rotIx` |
| 4574–4597 | `main.ts` | `#tRotate`, standalone-app fullscreen, service worker, `#collapse`, `.pclose[data-close]` |
| 4598–4622 | `ui/tour.ts` | `TOURKEY` (→ `core/keys`), `TOUR_HINTS`, `tourTarget` |
| 4623–4707 | `ui/tour.ts` | `drawTourLines`, `tourHeldClock`, `showTour` |
| 4708–4716 | `main.ts` | `#tourGo`, `#tourAgain`, resize (**resize #2 of 3**) |
| 4717–4720 | `main.ts` | `#tInfo`, `#infoClose`, `#infoModal` (bodies live in `ui/dialogs.ts`) |
| 4721 | `main.ts` | `if(prefers-reduced-motion) $('tPause').click()` — **position is load-bearing**, R24 |
| 4722–4732 | `render/labels.ts` | `labelWrap`, `labelEls`, `moonEl` |
| 4733–4737 | `astro/constants.ts` | `STRUCTS` (the three visibility thunks are injected by `render/labels`) |
| 4738–4741 | `render/labels.ts` | `structEls` |
| 4742–4745 | `render/state.ts` | `armsOn` |
| 4746–4753 | `astro/constants.ts` | `ARM_LBLS` |
| 4754–4758 | `render/labels.ts` | `armEls` |
| 4759–4764 | `astro/constants.ts` | `M31_LBLS` |
| 4765–4772 | `render/labels.ts` | `m31Els`, `mergedEl` |
| 4773–4781 | `render/state.ts` | `frameDt` |
| 4782–4810 | `render/labels.ts` | `placeLabel` |
| 4811–4813 | `render/passes/g710.ts` | `g710GL`, `g710Pos`, `g710Size`, `g710Col` |
| 4814–4816 | `render/labels.ts` | `g710Lbl` |
| 4817–4895 | `ui/theme.ts` | `T_STOPS`…`setStateColour` |
| 4896–4898 | `render/state.ts` | `W`, `H`, `DPR`, `projMat`, `dprCap` → `view.*` |
| 4899–4920 | `ui/panels.ts` | `CROWDABLE`, `fitPanels` |
| 4921–4935 | `shaders/tone.vert.glsl` | `TONE_VS` + the highlight-rolloff comment |
| 4936–4949 | `shaders/tone.frag.glsl` | `TONE_FS` |
| 4950–4952 | `render/passes/tone.ts` | `pTone`, `UT`, `emptyVAO` |
| 4953–4971 | `gpu/framebuffer.ts` | `hdrExt`, `hdrFB`, `hdrTex`, `hdrOK`, `makeHDR` |
| 4972–4982 | `astro/constants.ts` | `SKY_MIRROR` + its handedness comment |
| 4983–4984 | `render/camera.ts` | `skyProjection` |
| 4985–4992 | `gpu/context.ts` | `resize` |
| 4993 | `main.ts` | `addEventListener('resize', …); resize();` (**resize #3 of 3**) |
| 4994–5005 | `main.ts` | `hiddenState` |
| 5006–5022 | `main.ts` | the `visibilitychange` handler |

#### Slice 08 — 5023–6428

| lines | owner | what |
|---|---|---|
| 5023–5027 | `gpu/context.ts` | the four global GL-state calls → `initGLState()`, called from `main.ts` |
| 5028–5031 | `render/state.ts` | `simT`, `nextSample`, `last`, `showFps`, `fpsFrames`, `fpsSince`, `hudHz`, `lastHud` |
| 5032–5048 | `ui/hud.ts` | `barHeld`, `barNarrowSince`, `holdBarWidth` |
| 5049–5054 | `render/camera.ts` | `smoothTarget`, `firstFrame`, `smoothOfs`, `reseedFollow` → `cam.*` |
| 5055–5058 | `render/state.ts` | `org`, `sunSizeTmp`, `eatSizeTmp`, `lastAgeSeen`, `pnShown` |
| 5059–5066 | `shaders/sun.vert.glsl` | `SUN_VS` + the hand-over comment |
| 5067–5110 | `shaders/sun.frag.glsl` | `SUN_FS` |
| 5111–5117 | `render/passes/sun.ts` | `pSunP`, `USn` — **rename to `USUN`**, R12 |
| 5118–5178 | `shaders/pn.frag.glsl` | `PN_FS` + the section comment |
| 5179–5184 | `render/passes/pn.ts` | `pPN`, `UPN` |
| 5185–5187 | `render/passes/eatflash.ts` | `eatGL`, `eatPos`, `eatSize`, `eatCol`, `eatW` |
| 5188–5192 | `render/passes/sun.ts` | `vaoSunPt` |
| 5193–5194 | `render/state.ts` | `plasmaSunPx` |
| 5195–5241 | `render/probe.ts` | `probeFrames`, `probeInfo`, `perfProbe`, `pickDetail`, `runFirstLaunchProbe` |
| 5242–5392 | `render/frame.ts` | `frame()` prologue: clock, shuttle, trail sampling, `lifeStep`, body positions, Sun state, engulfment, camera solve, `projMat` rebuild, HDR bind |
| 5393–5432 | `render/passes/points.ts` | `useProgram(pPt)` + the shared point-pass uniform block (the "as the last frame left them" contract, R10) |
| 5433–5478 | `render/passes/nebula.ts` | `nebulaPass` |
| 5479–5524 | `render/passes/dust.ts` | `dustPass` |
| 5525–5568 | `render/frame.ts` | front-to-back galaxy ordering, starfield draw (5533), Gaia draw (5543) |
| 5569–5598 | `render/passes/points.ts` | the Milky Way (5569) and Andromeda (5579) star draws |
| 5599–5644 | `render/passes/supernova.ts` | life events (5599), SN flashes (5615), outside-disk core nebula (5639) |
| 5645–5667 | `render/passes/remnant.ts` | remnant puffs |
| 5668–5720 | `render/passes/rings.ts` | trails and orbit rings (`pTr` at 5670) |
| 5721–5766 | `render/passes/belts.ts` | `beltFade`, asteroid (5726), Kuiper (5742), Oort (5755) |
| 5767–5787 | `render/passes/rings.ts` | the Oort shell great circles |
| 5788–5795 | `render/passes/bodies.ts` | the body point draw |
| 5796–5845 | `render/passes/globe.ts` | Earth globe, Moon, Moon ring |
| 5846–5864 | `render/passes/g710.ts` | Gliese 710 |
| 5865–5882 | `render/passes/pn.ts` | the planetary nebula |
| 5883–5901 | `render/passes/sun.ts` | the Sun disc |
| 5902–5925 | `render/passes/eatflash.ts` | engulfment flares |
| 5926–5942 | `render/passes/tone.ts` | the tone-map resolve |
| 5943–6015 | `render/labels.ts` | `proj` + the whole label pass |
| 6016–6148 | `ui/hud.ts` | the HUD/env-readout block |
| 6149–6152 | `render/frame.ts` | the probe trigger and `requestAnimationFrame(frame)` |
| 6153–6170 | `main.ts` | `hadSaved`, `restoreSettings()`, the first-visit detail default, `applyTrailWindow()`, the staged helix jump, the tour timer — **verbatim order**, R4 |
| 6171–6264 | `ui/qr.ts` | `qrEncode` (its inner `mul` stays local, R12) |
| 6265–6324 | `ui/qr.ts` | `QR_SCALES`, `qrLast`, `qrPlace`, `qrRedraw`, the drag block, `#qrScale`, `setInterval` |
| 6325–6335 | `ui/debug.ts` | `DBGKEY` (→ `core/keys`), `DEBUG`, `debugMode` |
| 6336–6338 | `core/format.ts` | `esc`, `clock` — **renamed `hhmmss`**, R12 |
| 6339–6349 | `ui/debug.ts` | `renderLog` — registered into `core/errorlog` via `setLogRenderer`, R3 |
| 6350–6356 | `ui/debug.ts` | `setHudTab` + its listener loop (**moved here from `ui/panels` to break C2**) |
| 6357–6362 | `ui/debug.ts` | `#logClear`, `#logCopy` |
| 6363–6377 | `ui/debug.ts` | `setDebugUI` |
| 6378 | `main.ts` | `if(DEBUG) setDebugUI(true, …)` |
| 6379–6406 | `ui/debug.ts` | `exportState` (**stays a hoisted `function`**, R6), `applyState` |
| 6407–6426 | `ui/dialogs.ts` | `dbgSay` and the six `#dbg*` listeners |
| 6427–6428 | `main.ts` | `fitPanels(); requestAnimationFrame(frame);` |

### 1.3 CSS and shaders

**CSS** — four files, concatenation order `base → panels → dialogs → hud`, contents exactly per 10-css §2. All four are `<link rel=stylesheet>` in `<head>`, render-blocking, above the error collector's script. The two `@font-face` base64 payloads (lines 21, 23) and the frost webp (line 188) move byte-for-byte. Lines 17 and 386 (`<style>`/`</style>`) disappear.

**Shaders** — 23 `.glsl` files, imported `?raw` through the existing `glsl-raw` plugin in `vite.config.ts`. Byte-for-byte copies. No `#include`, no formatter, no minifier (11-shaders §5).

### 1.4 Exports and imports

| module | exports | imports |
|---|---|---|
| `core/errorlog` | `TOUCH_DEV`, `errLog`, `logErr`, `setLogRenderer` | **nothing** |
| `core/dom` | `$`, `isOn`, `toggle` | — |
| `core/mat4` | `perspective`, `lookAt`, `mul`, `vecV`, `norm3`, `MAT3_ID` | — |
| `core/rng` | `gauss`, `expR` | — |
| `core/format` | `supStr`, `sup`, `esc`, `hhmmss` | — |
| `core/keys` | `SKEY`, `TOURKEY`, `DBGKEY` | — |
| `core/build` | `BUILD`, `VERSION`, `BUILD_LINE` | — |
| `astro/constants` | `R_GAL V_GAL GAL_PERIOD YR_PER_SIM AGE0 AND_AGE TILT E1 E2 EN AU2U OO_REAL WOB_A WOB_T PITCH BAR_L BAR_A armAngle ARMS sA cA R_A M32_C M110_C GSS_DIR WEEK_YR HOUR_YR SKY_MIRROR STRUCTS ARM_LBLS M31_LBLS REAL_MODE` | — |
| `astro/bodies` | `BODIES NB N_PLANETS I_P9 PHASE DTILT BU BV tmp tmpSun earthW bodyPos` | `astro/constants` |
| `astro/sun` | `sunR sunPhase SUN_* EARTH_ORBIT_RSUN SUN_EAT_AGE sunState eatAge EAT_AGES SUN_ANCHORS sunTint pnState` | `astro/constants` |
| `astro/earth` | `PLATE_MODEL plateMats plateAngle fillPlateMats MOON_* moonDist moonPos OBLIQ EARTH_AXIS EARTH_P0 SIDEREAL earthPrime earthEra clamp01` | `astro/constants`, `astro/bodies` |
| `astro/calendar` | `ageAt` | `astro/constants` |
| `astro/environment` | `sfrFactor ratesIntegral rawCR CR0 environment lifeState` | `astro/constants`, `astro/sun`, `astro/merger` (`mergeAt`) |
| `astro/merger` | `SCATTER_AGE SR_* M31_DIR M31_E2 M31_ROT KPC2U M31_ORBIT orbitUV sepScene MERGE_* mergeAt diskSpin andPos updateAnd` | `astro/constants` |
| `astro/g710` | `G710_* g710` | `astro/constants` |
| `gpu/context` | `canvas`, `gl`, `resize`, `initGLState` | `core/errorlog` (side effect), `render/state`, `gpu/framebuffer`, `render/camera` (`skyProjection`) |
| `gpu/program` | `sh`, `prog` | `gpu/context` |
| `gpu/buffers` | `makeBuf vaoBufs deleteVAO pointVAO dynVAO` | `gpu/context` |
| `gpu/framebuffer` | `hdrExt hdrFB hdrTex hdrOK makeHDR` | `gpu/context`, `render/state` |
| `render/state` | `simClock cam view show gfx readout life` + the frozen consts | `astro/constants` |
| `scene/starfield` | `N_STAR buildStarfield` | `core/rng`, `gpu/buffers` |
| `scene/galaxy` | `genGalaxy genGalaxyMap armSite diskSite DETAIL_D DETAIL_NAMES` | `core/rng`, `astro/constants`, `render/state`, `scene/galaxymap` |
| `scene/galaxymap` | `galaxyMap m31Map MAP_SCALE M31_MAP_SCALE M31_ARM_K mapPick mapXZ mapXZ31 loadGalaxyMap loadM31Map` | `core/rng`, `astro/constants` |
| `scene/andromeda` | `genAndromeda genAndromedaMap` | `core/rng`, `astro/constants`, `scene/galaxymap`, `gpu/buffers`, `render/state` |
| `scene/belts` | `AB_N KB_N OO_N RING_SEGS ringCS buildAsteroids buildKuiper buildOort` | `core/rng`, `astro/constants` |
| `scene/sky` | `parseStarBin loadGaiaStars loadGaiaDeep` (+ writes `gfx.gaia`) | `gpu/buffers`, `render/state` |
| `scene/cache` | `gxyCache flushGxyCache setGalaxy` | `gpu/buffers`, `scene/galaxy`, `scene/andromeda`, `scene/galaxymap`, `scene/sky`, `render/state` |
| `render/passes/*` | its program, uniform table, VAOs and a `draw*()` | `gpu/program`, `gpu/buffers`, `shaders/*`, `render/state` |
| `render/trails` | `TRAIL_N trails trailBufs trailVaos RING_N ringVaos trailAnchor trailPos pushTrail refillTrails applyTrailWindow trailPct` | `astro/bodies`, `gpu/context`, `gpu/buffers`, `render/state`, `core/dom` |
| `render/labels` | `labelEls armEls m31Els structEls moonEl mergedEl g710Lbl placeLabel drawLabels` | `core/dom`, `astro/constants`, `render/state` |
| `render/lifecycle` | `addPuff lifeStep fillEvents fillPuffs` | `render/state`, `scene/galaxy`, `astro/environment`, `astro/calendar`, `audio/sfx` |
| `render/camera` | `cam-facing helpers`, `zoomStep`, `minDist`, `spinFrame`, `applyFocusView`, `skyProjection`, `initCamera` | `core/dom`, `core/mat4`, `render/state`, `astro/*`, `ui/persist` (`saveSettings`) |
| `render/probe` | `runFirstLaunchProbe`, `probeFrames` | `gpu/context`, `gpu/framebuffer`, `render/passes/points`, `render/state`, `ui/persist` |
| `render/frame` | `frame` | everything under `render/`, `astro/`, plus `ui/hud.updateHud`, `ui/theme.setStateColour`, `render/labels.drawLabels` |
| `audio/engine` | `initAudio armUnlock applySfxGain soundOn sfxVol audio` + `setUnlockHooks` | `core/dom` |
| `audio/music` | `player TRACKS loadTrack nextTrack playTrack setMusicVol musicOn` | `core/dom`, `audio/engine` |
| `audio/sfx` | `BANKS loadBanks playBank sfx fxOn setSfxVol` | `core/dom`, `audio/engine` |
| `ui/persist` | `SKEY-family arrays`, `qrPos qrHeld saveSettingsNow saveSettings restoreSettings registerSnapshot registerApply setDebugHook` | `core/dom`, `core/keys`, `render/state` |
| `ui/panels` | `PANELS pState openSeq panelShown setPanelOpen layoutPanels fitPanels CROWDABLE` | `core/dom`, `ui/persist` |
| `ui/sections` | `SECS SEC_BODY secOpen applySecs seg` | `core/dom`, `ui/persist`, `ui/panels` |
| `ui/hud` | `updateHud` + every control initialiser + `humanYear fmtYears fmtCount speedLabel setMultExp setShuttle syncCal updateBar` | `core/dom`, `core/format`, `render/state`, `render/trails`, `ui/panels`, `ui/persist` |
| `ui/scenarios` | `jumpToEpoch setKeepSaved` | `core/dom`, `render/state`, `render/camera`, `render/trails`, `ui/hud` |
| `ui/tour` | `TOUR_HINTS showTour drawTourLines` | `core/dom`, `core/keys`, `ui/panels`, `render/state` |
| `ui/tooltips` | `showTip hideTip initTooltips` | `core/dom` |
| `ui/fullscreen` | `isFs reqFs exitFs toggleFs armAutoFs ROT` | `core/dom` |
| `ui/dialogs` | `initBuildStamps dbgSay initDebugCard` | `core/dom`, `core/build`, `ui/debug` |
| `ui/theme` | `tempColour setStateColour` | — (writes `documentElement.style` only) |
| `ui/qr` | `qrEncode qrRedraw qrPlace initQr` | `core/dom`, `ui/persist`, `ui/debug` |
| `ui/debug` | `DEBUG isDebug renderLog setHudTab setDebugUI exportState applyState setQrRedraw` | `core/dom`, `core/keys`, `core/errorlog`, `core/format`, `ui/panels`, `ui/sections`, `ui/persist`, `render/state` |
| `main.ts` | — | everything, in §2's order |

---

## 2. THE DEPENDENCY ORDER

### 2.1 Topological order — this is `main.ts`'s import order

Tier by tier. Within a tier, source order. `main.ts` imports in exactly this sequence and the first import is a bare side-effect import.

```
 0  core/errorlog                                    ← import for side effect, FIRST, zero imports
 1  core/dom · core/mat4 · core/rng · core/format · core/keys · core/build
 2  astro/constants
 3  render/state
 4  gpu/context  (→ errorlog, render/state)
 5  gpu/program · gpu/buffers · gpu/framebuffer
 6  shaders/*.glsl                                   ← leaves, no imports
 7  astro/bodies · astro/calendar · astro/merger · astro/sun · astro/g710
 8  astro/earth · astro/environment
 9  render/passes/points · supernova · remnant       ← source order 1357 → 1458 → 1528
10  scene/starfield · scene/galaxymap
11  scene/galaxy · scene/andromeda · scene/belts · scene/sky
12  scene/cache
13  render/passes/nebula · dust · belts · rings · globe · bodies
14  render/trails
15  audio/engine · audio/music · audio/sfx
16  render/lifecycle
17  ui/theme · ui/tooltips · ui/fullscreen
18  ui/persist
19  ui/panels · ui/sections
20  render/camera
21  render/labels · ui/hud
22  ui/scenarios · ui/tour · ui/qr · ui/debug · ui/dialogs
23  render/passes/tone · sun · pn · g710 · eatflash
24  render/probe
25  render/frame
26  main.ts
```

**Evaluation order ≠ initialisation order.** ESM evaluation order gets the *bindings* right; it does not get the 29-step DOM boot right. `main.ts` therefore calls explicit `initX()` functions in the order of 09-dom §5.4, and no `ui/*` module runs listener registration at module-evaluation time. This is the single design rule that defuses R1.

### 2.2 Cycles found, and how each is broken

Nine real cycles. Each is broken by moving the shared thing down, or by injecting a hook.

**C1 — `core/errorlog` ⇄ `ui/debug`.** `logErr` (1113) calls `renderLog` (6339); `renderLog` reads `errLog` (1106). Under ESM, `typeof` on an uninitialised imported binding **throws**, inside the global error handler.
*Break:* `core/errorlog` exports `setLogRenderer(fn)` and holds `let logRenderer = null`. Line 1113 becomes `if(logRenderer) try{ logRenderer(); }catch(e){}` — the guard **and** the `catch` both stay (12-state H2: `renderLog` calls `$`, and swallowing that is the current semantics). `ui/debug` calls `setLogRenderer(renderLog)` in its own `initDebug()`. `core/errorlog` imports nothing, ever.

**C2 — `ui/panels` ⇄ `ui/debug`.** `setHudTab` (6350) calls `renderLog` and `fitPanels`; `setDebugUI` (6363) calls `setHudTab`.
*Break:* `setHudTab` moves into `ui/debug` (it switches the settings/log tabs, which is the log's business). `ui/debug → ui/panels` for `fitPanels` becomes one-way.

**C3 — `scene/galaxymap` ⇄ `scene/cache`.** `loadGalaxyMap` (1930) and `loadM31Map` (2357) call `flushGxyCache(); setGalaxy(curD)`; `setGalaxy` (2043) calls `genGalaxyMap`, which reads `galaxyMap`.
*Break:* both loaders take an `onReady` callback. `main.ts` passes `() => { flushGxyCache(); setGalaxy(gfx.curD); }`. The two statements stay adjacent with no `await` between them (03 hazard 10). Dependency becomes `cache → galaxymap`, one-way.

**C4 — `astro/environment` → `scene/galaxy`.** `rawCR` (2963) reads `ARMS`, `armAngle` — declared at 1675–1681 inside the galaxy block. `astro/*` must not import `scene/*`.
*Break:* `PITCH`, `BAR_L`, `BAR_A`, `armAngle`, `ARMS`, `sA`, `cA` move **down** into `astro/constants.ts`. They are pure geometry and `scene/galaxy` already only reads them. This also removes `scene/galaxy` from `astro/environment`'s eval-time critical path (05 H6).

**C5 — `astro/*` → `render/state`, four times.** `bodyPos` reads `realMode` (1629/1633); `ageGyr` reads `simT`; `environment`/`g710` read `simT`; `updateAnd` calls `ageGyr`; `earthPrime` reads `org` (2794). Every one inverts the intended direction.
*Break, four ways:*
- `realMode` is *never reassigned anywhere in the file* (12-state #1). It becomes `astro/constants.REAL_MODE = true`. `bodyPos` stays pure.
- `ageGyr()` becomes `astro/calendar.ageAt(t)`, pure. `render/state` exports the thin `ageGyr()` = `ageAt(simClock.simT)`; `render/*` and `ui/*` call that.
- `environment()`, `g710()`, `lifeState()`, `updateAnd()` take their time/age as a parameter. Call sites are all inside `frame()` and `ui/hud`, which already have the value.
- `earthPrime(t, out)` becomes `earthPrime(t, out, org)`. **The first-call site does not move** (R15): it stays inside `frame()` after `bodyPos(0, simT, org)` at 5288, because `earthPhi0`'s lazy value depends on when it is first called.

**C6 — `ui/persist` ⇄ `ui/panels` ⇄ `ui/sections`.** `restoreSettings` calls `layoutPanels`/`applySecs`; `setPanelOpen`, the drag handler, the section headings and `seg` all call `saveSettings`.
*Break:* `ui/persist` becomes a leaf over `core/*` + `render/state`. It exports `registerSnapshot(fn)` and `registerApply(fn)`; `ui/panels` and `ui/sections` register their slice of the saved blob at init. `saveSettings` flows *down* (persist → nobody), the panel/section state flows *up* through the registry. Everything else keeps importing `saveSettings` from persist, one-way.
*Fallback if the registry proves too invasive:* keep the cycle but convert `const saveSettings = () => …` (4217) into a hoisted `function saveSettings(){ … }`. ESM cycles are safe when the only cross-edge is a hoisted function used after both bodies evaluate. Choose the registry; note the fallback.

**C7 — `ui/persist` → `ui/debug`.** The `#tReload` ten-tap handler (3628–3637) calls `setDebugUI` and reads `DBGKEY`.
*Break:* `DBGKEY` moves to `core/keys.ts` with `SKEY` and `TOURKEY`. `setDebugUI` is reached through `ui/persist.setDebugHook(fn)`, registered by `main.ts`. The handler is deferred anyway, so this is purely a graph fix.

**C8 — `audio/engine` ⇄ `audio/music` ⇄ `audio/sfx`.** `armUnlock` (3258) reads `musicOn`/`player` and calls `playTrack`/`loadTrack`/`loadBanks`; `setSfxVol` (4171) calls `initAudio`/`armUnlock`/`loadBanks`.
*Break:* `audio/engine.setUnlockHooks({ retryMusic, loadBanks })`, called from `main.ts` after all three modules evaluate. `armUnlock`'s bare `addEventListener` / `removeEventListener` (3264, 3274) stay bare — they resolve to `window` in a module too, and wrapping them is R-listed (05 H10).

**C9 — `ui/qr` ⇄ `ui/debug`.** `qrRedraw` (6279) reads `debugMode` and calls `exportState` (6379); `setDebugUI` (6374) calls `qrRedraw`.
*Break:* `ui/debug` exports `isDebug()` and `exportState` (staying a **hoisted function**, R6); `ui/qr` imports both. `ui/debug` gets `qrRedraw` through `setQrRedraw(fn)`, registered by `main.ts`.

**Two near-cycles that are not cycles but are order edges to assert:**

- `astro/merger` → `astro/constants` for `MERGE_T0/T1` (2435, computed at eval time from `AGE0`/`YR_PER_SIM`). A cycle here yields `NaN` with no throw — the worst shape for a screenshot gate. Add `if(!Number.isFinite(MERGE_T0)) throw new Error('astro/merger evaluated before astro/constants')` at 2435's new home.
- `scene/cache` → `scene/sky` for `loadGaiaDeep`/`deepAsked`. The classic-script TDZ trap (02 H7, 03 hazard 1, 05 H1) actually *disappears* under ESM, because `scene/sky`'s body is guaranteed to run first. Keep the literal `1` at 2365 anyway — for the **random stream**, not for TDZ (R2/R16).

### 2.3 Layering rules to enforce with a lint check

```
core/     imports nothing except other core/            (errorlog: nothing at all)
astro/    imports core/ and astro/ only                 — no gpu, no scene, no render, no ui, no DOM, no Math.random
scene/    imports core/, astro/, gpu/, render/state
gpu/      imports core/, render/state
render/   imports core/, astro/, gpu/, scene/, render/
ui/       imports core/, render/state, render/*, ui/    — never scene/, never gpu/ directly
audio/    imports core/, audio/
main.ts   imports everything
```

---

## 3. THE SHARED STATE DESIGN — final

Adopted from 12-state §14, with three decisions made.

**Decision 1 — the name.** `clock` is already taken at 6338 (the error-log time formatter). The singleton is **`simClock`**; the formatter is renamed **`hhmmss`** and moves to `core/format.ts`.

**Decision 2 — the rule.** A binding enters a singleton only if two or more target modules write it, or five or more modules read it and would otherwise need a circular import. Everything else stays module-private with a named accessor. 12-state §14.3's private list is adopted unchanged.

**Decision 3 — the devtools bindings.** `earthDbg` (5802) and `probeInfo` (5237) have zero readers in the file; they are inspected from a console, which only worked because a classic `<script>` exposes top-level scope. They go on `readout`, and `main.ts` ends with `globalThis.__gt = { simClock, cam, view, show, gfx, readout, life }` in a `if (__DEV__ || DEBUG)` guard. Decided deliberately, not left to tree-shaking.

### 3.1 `src/render/state.ts`

Imports **only** `astro/constants`. Plain data, no functions that touch `gl`, DOM, or `Math.random`.

```ts
export const simClock = {
  simT: 0, nextSample: 0.01, dtSample: 0.01,
  speed: 1.5, speedMult: 1, shuttle: 0, shuttleLastSign: 0,
  trailRefillAt: 0, paused: false, last: 0, frameDt: 1/60,
  shimT: 0, lastAnchor: 0, lastAgeSeen: AGE0,
};

export const cam = {
  yaw: 0.9, pitch: 0.32, dist: 150, distGoal: 150, target: [0,0,0], follow: true,
  coreLock: false, followTarget: 'sun', spinLock: false,
  reseedFollow: false, firstFrame: true,
  panF: [0,0], smoothTarget: [0,0,0], smoothOfs: [0,0,0],
  dirW: [0,0,1], spinP: new Float64Array(3),
};

export const view = { W: 0, H: 0, DPR: 1, dprCap: 2, projMat: null };

export const show = {
  p9: true, dwarfs: true, belt: true, kuiper: true, oort: true,
  labels: true, labelSteady: true, arms: true, stats: true,
  dust: true, gaia: true, variability: true, life: false,
  evSN: false, evBirth: false, fps: false,
  hudHz: 8, trailPct: 300, trailAlpha: 1, orbitAlpha: 1, psH: true, psO: true,
  minBright: 0.05*0.38, minSprite: 1.3+0.05*2.1, starGain: 0.05, coreKnee: 1,
};

export const gfx = {
  curD: 1,
  gxy:  { vao: null, n: 0, nucleus: [0,0], nebPink: 0, nebGlow: 0 },
  neb:  { vao: null, n: 0 },
  dust: { vao: null, n: 0 },
  and:  { vao: null, n: 0, neb: null, nNeb: 0, dust: null, nDust: 0, pink: 0, glow: 0 },
  gaia: { vao: null, n: 0 }, gaiaDeep: { vao: null, n: 0 },
  hdr:  { fb: null, tex: null, ok: false },
  maps: { galaxy: null, m31: null, earthTex: null },
};

export const readout = {
  globePx: 0, moonPx: 0, camSunDist: 150, avgLight: 0, plasmaSunPx: 0,
  pnShown: false, evN: 0, snN: 0,
  wasEaten: [0,0,0,0], eatFlash: [-1,-1,-1,-1],
  earthDbg: null, probeInfo: null,          // devtools only
};

export const life = { accB: 0, accSN: 0, accPN: 0 };

export const HIDE_NUCLEUS = true;   // was `let hideNucleus` @1696, never reassigned
export const DUST_DEEP_CAP = 40.0;  // was `let` @2122, never reassigned
export const SHOW_TRAILS = true;    // dead switch @3658
export const LIVE_COUNT = false;    // dead switch @4279
export const LIFE_SUP_ON = true;    // vestigial @3945
```

`REAL_MODE` is **not** here — it moved into `astro/constants` (C5) so `astro/bodies` stays pure.

### 3.2 Write ownership — one owner per field

| field(s) | sole writer | readers |
|---|---|---|
| `simClock.simT` | `render/frame` (5254). **Plus** `ui/scenarios.jumpToEpoch` (4319, 4325) and `ui/debug.applyState` (6395) — three writers, which is why it is shared. |  `astro/calendar`, `render/passes/*`, `ui/hud` (36 lines) |
| `simClock.nextSample` | `ui/hud.setShuttle` (3708), `render/trails.applyTrailWindow` (3765), `ui/scenarios` (4320, 4404), `render/frame` (5250–5275), `ui/debug` (6395) | `render/frame` |
| `simClock.dtSample` | `render/trails.applyTrailWindow` (3757) | 14 lines in 4 modules |
| `simClock.speed`, `.speedMult` | `ui/hud` (3721, 3692) | `render/frame`, `render/trails`, `ui/persist` |
| `simClock.shuttle`, `.shuttleLastSign`, `.trailRefillAt`, `.lastAnchor` | `ui/hud.setShuttle` (3705) / `render/frame` (5249, 5261, 5275) | `render/frame`, `render/trails` |
| `simClock.paused` | **the DOM click on `#tPause` only** — `ui/hud`'s toggle callback (3780) is the single direct writer. Five sections mutate it via `$('tPause').click()`; keep that channel or the icon swap and `aria-label` (3781–3782) stop happening. | 13 lines |
| `simClock.frameDt`, `.shimT`, `.lastAgeSeen`, `.last` | `render/frame` | `render/labels`, `render/passes/*` |
| `cam.*` geometry (`yaw`…`follow`) | `render/camera` pointer handlers + `render/frame` (5346) | `render/frame` |
| `cam.coreLock` | `ui/hud` (3836), `render/camera.applyFocusView` (3862–3896), `ui/scenarios` (4333–4383), `main.ts`'s dive toggle (4503–4505), `ui/debug` (6402) | `render/frame` |
| `cam.followTarget` | `render/camera.applyFocusView`, `ui/scenarios` (4294), the view/dive toggles in `main.ts` (4476, 4502) | `render/frame` |
| `cam.reseedFollow` | 16 sites in 5 modules; **lowered only by `render/frame` (5337)** | `render/frame` |
| `cam.panF` | `render/camera` (3515+), `ui/scenarios`, the toggles, `ui/debug` | `render/frame` (5377) |
| `cam.dirW` | **`render/frame` only** (5376) | `ui/hud`'s spin-lock toggle (3832). One-way; keep the direction. |
| `cam.smoothTarget`, `.smoothOfs`, `.firstFrame` | `render/frame` | — |
| `cam.spinLock`, `.spinP` | `ui/hud` (3837) / `render/camera.spinFrame` | `render/frame` (5366) |
| `view.W`, `.H`, `.DPR` | **`gpu/context.resize()` only** | pervasive |
| `view.projMat` | `gpu/context.resize()` (4990) **and** `render/frame` (5385) | 16 draw lines |
| `view.dprCap` | `ui/persist.restoreSettings` (4234), `render/probe` (5236) | `resize`, `saveSettingsNow` |
| `show.*` | exactly one `ui/hud` toggle callback each; `show.oort` from `main.ts`'s 4267 wiring; `show.life` from `render/state.syncLife` | `render/passes/*`, `render/frame` |
| `gfx.*` | **`scene/cache.setGalaxy` only** (2060–2065). The generators stop writing globals: `genGalaxy`/`genGalaxyMap`/`genAndromeda`/`genAndromedaMap` **return a record**, and `setGalaxy` publishes it. That single change removes twelve (c)-class bindings. | 6 draw passes, `ui/persist`, `ui/hud` |
| `gfx.gaia`, `.gaiaDeep` | `scene/sky` (async) | `render/passes/points` |
| `gfx.hdr` | `gpu/framebuffer.makeHDR` | `render/frame`, `render/passes/tone` |
| `gfx.maps.galaxy`, `.m31` | `scene/galaxymap` (async) | `scene/galaxy`, `scene/andromeda`, `scene/cache` |
| `gfx.maps.earthTex` | `render/passes/globe.loadEarthMap` (async) | `render/passes/globe` |
| `readout.*` | **`render/frame` only** | `ui/hud`, `render/labels`, `render/passes/*` |
| `life.accB/accSN/accPN` | `render/lifecycle.lifeStep` **and** `ui/scenarios.jumpToEpoch` (4406, the reset) | `render/lifecycle` |

### 3.3 Kept out of the singletons, behind a setter

`ui/scenarios.keepSaved` — one writer (`main.ts` 6166/6169), one reader (`jumpToEpoch` 4310). `ui/scenarios` exports `setKeepSaved(b)` and `main.ts` brackets the staged jump with it. A field would be worse: it hides that this is a two-statement bracket.

`ui/persist.qrPos` / `qrHeld` — written by `restoreSettings` (4247) *and* `ui/qr`'s drag (6302). The declaration comment at 4198–4201 records that privatising it into the QR block was one of the three boot deaths. It stays in `ui/persist`; `ui/qr` imports it.

Everything in 12-state §14.3's private table stays private: `dragging/px/py/panCX/panCY/pinchD/holding` (camera, with `isHolding()`), `deepAsked` (sky), `earthPhi0` (earth), `audio/soundOn/sfxVol/unlockArmed/banksLoading` (engine), `musicOn/musicVol/trackIx` (music), `openSeq` (panels), `saveTimer/trailRefill` (persist/trails), `calMode/unitMode/barHeld/barNarrowSince/lastRGB/lastA/lastIce/lastWhite/iceShown/iceLast` (hud/theme), `tipFor/tipTimer` (tooltips), `autoFsArmed/leftFsInLandscape/rotIx` (fullscreen), `tourHeldClock` (tour), `qrLast` (qr), `debugMode` (debug, with `isDebug()`), `hiddenState` (main).

### 3.4 What stops being mutable

`realMode` (1596) → `astro/constants.REAL_MODE` — a `const`, because it is written nowhere. This is what lets `astro/bodies.bodyPos` stay a pure function and removes the astro→render edge (C5).

The 15 `var` bindings (12-state §13) all become `const`, except the three at 1658 which disappear entirely into `buildStarfield()`'s return value — which is the correct fix for the one piece of load-bearing `var` hoisting in the file (R14).

---

## 4. THE MIGRATION SEQUENCE

Each step is one commit. After each: `npm run check && npm run test && npm run build && npm run e2e`. A step that reddens the parity gate is reverted, not patched forward.

**Step 0 — the gate itself.** Generate baseline PNGs from today's `galactic-transit.html` for all 14 states in `tests/harness/states.ts`. Add the four coverage viewports 10-css §5.5 demands: one glacial-epoch frame (`body.ice`, `--iceA` near 1), and viewports in the 601–620, 621–820 and ≥821 px bands plus one ≤620 wide **and** ≤790 tall. Add the `BOOT_IDS` assertion test from 09-dom §3. Add a `no console errors` assertion. **Nothing moves until this is green twice in a row.**

**Step 1 — the shell.** `src/galactic-transit.html` = markup 388–1094 verbatim + the `<style>` block still inline + `<script type="module" src="./main.ts">`. `src/main.ts` = lines 1096–6428 **verbatim**, one file, no modules. Add `globalThis.__gt` for `earthDbg`/`probeInfo`. Build, diff the emitted HTML against the original, run the gate.
*This is the largest single risk of the whole migration* (R25): classic script → deferred module script, and top-level scope stops being global. Do it alone.

**Step 2 — CSS.** Split lines 17–386 into the four files, exactly per 10-css §2, linked render-blocking in `<head>` in the order `base → panels → dialogs → hud`, above the collector. Gate — with the glacial frame and all four viewport bands (R7).

**Step 3 — shaders.** 23 `.glsl` files, `?raw`. Byte-compare each extracted file against the original literal before building. Gate (R17).

**Step 4 — `core/errorlog.ts`.** Lines 1100–1132. Zero imports. Introduce `setLogRenderer`; leave `renderLog` in `main.ts` and register it there for now. First import of `main.ts`, bare, side-effect. Gate (R3).

**Step 5 — the rest of `core/`.** `build`, `mat4`, `dom`, `rng`, `format`, `keys`. Six leaf modules. `mul` collision: `core/mat4.mul` is imported; the QR `mul` at 6202 stays a function-local `const` — grep for it explicitly (R12).

**Step 6 — `astro/constants.ts`.** Includes the C4 move (`PITCH`/`BAR_L`/`BAR_A`/`armAngle`/`ARMS`/`sA`/`cA` down from the galaxy block) and `REAL_MODE`. Pure data, zero risk to pixels; verify `V_GAL`'s hard-coded `900` (02 H11) is carried verbatim, not "fixed" to reference `R_GAL`.

**Step 7 — `render/state.ts`.** The §3 singletons. **Mechanical rename only** — every `simT` becomes `simClock.simT`, and nothing else changes. Largest diff of the migration, zero semantic content. Watch the shadows (R12): `const W/H` at 4627, `const last` at 5674, `const px` at 1899/2301/5211 must **not** be renamed.

**Step 8 — `gpu/`.** `context` (with `resize` and `initGLState`), `program`, `buffers`, `framebuffer`. `getElementById('gl')` stays longhand (09-dom §5.2). Explicitly re-test the no-WebGL2 path with a stubbed `getContext` (R9).

**Step 9 — `astro/` leaves.** `bodies`, `calendar` (`ageAt`), `merger` (`updateAnd(a)` + the `MERGE_T0` finiteness assert), `sun`, `g710` (`g710(ts)`), `earth` (`earthPrime(t,out,org)`), `environment` (`environment(ts)`, `lifeState(a,env)`). Six signature changes, all mechanical, all call sites already have the value. Gate after each.

**Step 10 — `render/passes/points|supernova|remnant`.** Programs and uniform tables only; the draw bodies stay in `main.ts`. Keep the three uniform tables literal — do **not** write a generic harvesting helper yet (R11).

**Step 11 — `scene/` as pure builders.** `starfield`, `galaxymap` (with the `onReady` inversion), `galaxy`, `andromeda`, `belts`, `sky`, `cache`. The generators return records; `setGalaxy` publishes into `gfx`. **The seven eval-time RNG consumers become seven explicit calls in `main.ts` in source order** (R2):
`buildStarfield()` → `setGalaxy(1)` [→ `genGalaxy(1)` → `genAndromeda(1)`] → `buildAsteroids()` → `buildKuiper()` → `buildOort()` → the body trail pre-fill → the orbit-ring block. Gate obsessively; a shifted stream shows up on every state at once, which makes it easy to spot and impossible to miss.

**Step 12 — the remaining `render/passes/*`.** `nebula`, `dust`, `belts`, `rings`, `globe`, `bodies`, `tone`, `sun`, `pn`, `g710`, `eatflash`. One per commit. Programs, uniform tables, VAOs and a `draw*()`. `main.ts` still imports them **in source order** so program creation and `getUniformLocation` sequence is unchanged (R10, 01 H6). `UG.uPlate = getUniformLocation(pGlobe,'uPlate[0]')` stays a hand-written special case (R11).

**Step 13 — `render/trails`, `render/labels`, `render/lifecycle`.**

**Step 14 — `audio/*`,** with the C8 hook injection. `armUnlock`'s bare `addEventListener` stays bare.

**Step 15 — `ui/` leaves:** `theme`, `tooltips`, `fullscreen`, `tour`, `dialogs`.

**Step 16 — `ui/persist`,** with the `registerSnapshot`/`registerApply` registry (C6) and `saveSettings` converted to a hoisted `function` (R6). `restoreSettings` is exported and **not** called at import time.

**Step 17 — `ui/panels`, `ui/sections`,** registering into the persist registry.

**Step 18 — `ui/hud`.** The biggest UI module: every slider and toggle initialiser, the speed ladder, the formatters, the gamebar slide, `updateHud` (6016–6148). All listener registration moves into `initHud()` called from `main.ts` — **this is where R1 is defused or lost.**

**Step 19 — `render/camera`, `ui/scenarios`.** `initCamera()` registers the ten pointer/touch/wheel listeners. `applyFocusView`'s synthetic-click order stays byte-identical (06 H5).

**Step 20 — `ui/qr`, `ui/debug`,** with C1/C2/C9 hooks. `exportState` stays a hoisted `function`.

**Step 21 — `render/probe`, `render/frame`.** `frame()` becomes a sequencer calling `draw*()` in the exact order of 08 §1.8.1's draw-order list. `hadSaved` is **passed in** to the probe trigger, not read from `main.ts` scope (08 hazard 1).

**Step 22 — `main.ts` is only boot.** What remains is: imports in §2.1's order; the `initX()` calls in 09-dom §5.4's numbered order; the seven RNG builder calls in §4-Step-11's order; the three fetch kicks (3050–3052) in issue order; and the boot tail 6153–6170 → 6427–6428 verbatim.

**Step 23 — cleanup, separately.** Only after everything is green: the dead bindings (`AND_AGE`, `makeBuf`, `showTrails`, `liveCount`, `.hud .sub`, `.toggles`, `.actsep`, `.mults`), the `USN`/`USUN` rename, and any shared-GLSL `noise.glsl` include. Each its own commit with its own parity run. **None of these is part of the migration** (R28).

---

## 5. THE RISK REGISTER

Ranked by how badly it bites: how likely, how silent, and how much of the page it takes with it. Everything above rank 12 fails **without an exception, a console line, or a stack trace**.

| # | risk | mitigation | the test that catches it |
|---|---|---|---|
| **R1** | **Settings replay silently drops.** `restoreSettings()` (6156) replays saved state through synthetic `input`/`change`/`click` (4227/4229/4231). Every listener from boot steps 5, 8, 12, 14, 16 must already be registered. A module-order change produces a page that boots clean, throws nothing, logs nothing, and renders with **default** settings. Highest-risk failure mode in the file. | No `ui/*` module registers listeners at evaluation time. Every one exports `initX()`; `main.ts` calls them in 09-dom §5.4's numbered order. `restoreSettings` is called only from `main.ts`, at position 20. | A parity state that boots from `tests/harness/settings.fixture.json` and asserts, after boot, that ~10 named controls hold the *saved* value not the markup default — plus every parity screenshot, since the fixture is what they all boot with. |
| **R2** | **Eval-time random stream reorders.** Seven consumers, in order: starfield 1658 (19,200 draws) → `setGalaxy(1)`→`genGalaxy` 1698 → `genAndromeda` 2163 → asteroid belt 2460 (**variable** draw count: the Kirkwood rejection loop) → Kuiper 2478 (branch-dependent) → Oort 2486 → the first-visit `#detail` dispatch at 6161 (a second full build). `gauss()` is a rejection sampler with no fixed count. Every star, nebula, dust cloud and belt particle moves; nothing throws. | Seven explicit calls from `main.ts` in that order. No `scene/*` module consumes randomness at its own top level. No memoising/batching wrapper around `gauss`/`expR`. `setGalaxy(1)` keeps the literal `1`. | Every parity screenshot, immediately and totally. Add a cheap unit test: with the mulberry32 seed, hash the first 1000 `Math.random()` values consumed during boot and compare. |
| **R3** | **The error collector stops being first,** or acquires an import. `typeof` on an uninitialised ESM binding **throws** — inside the global error handler. `gpu/context` line 1190 can throw at boot; the collector must already exist to catch it. Tree-shaking or `sideEffects:false` can drop it. | `core/errorlog.ts` imports nothing at all, exports `setLogRenderer`, and is `main.ts`'s first bare import. The `typeof`/null guard **and** the `catch` both stay (`renderLog` calls `$`, and swallowing that is current behaviour). `ui/debug` registers the renderer. | A test that boots with a deliberate throw injected into `astro/constants` and asserts `errLog.length > 0` and that the log tab renders. Plus: `grep -c import src/core/errorlog.ts` must be 0. |
| **R4** | **Boot tail resequenced.** `hadSaved` 6155 → `restoreSettings()` 6156 → the `!hadSaved` detail default 6161 → `applyTrailWindow()` 6162 → `keepSaved=hadSaved` 6166 → the staged helix jump 6167–6168 → `keepSaved=false` 6169 → the tour timer 6170 → `fitPanels()` 6427 → `rAF(frame)` 6428. Several steps consume randomness; 6161 decides the star count, i.e. it decides the screenshot. | Copied verbatim into `main.ts` with a comment naming each step's number. The `keepSaved` bracket around a **synchronous** dispatch: if `jumpToEpoch` ever becomes async the flag is wrong. | Parity on a fresh profile (`hadSaved === false`) *and* on the saved fixture — both paths, both photographed. |
| **R5** | **A shared mutable is duplicated or copied by value.** `errLog` (three touchers), `gl`, `tmp`/`tmpSun`/`earthW` (7 writers), `vaoBufs` (mutated from 2914, outside `pointVAO`), `org` (read by `earthPrime` two slices up), `qrPos` (two writers), `simClock.dtSample`/`nextSample`. Mixed import specifiers can produce two module instances. Nothing throws; readers get stale data. | Single instance per module, enforced by the layering lint. `tmp`/`tmpSun`/`earthW` exported from `astro/bodies` as the *same* `Float64Array` objects. `qrPos` stays in `ui/persist`. Never destructure a mutable singleton field into a local. | A unit test asserting object identity across import paths (`import {gl} from '../gpu/context'` twice, `Object.is`). Pixel-wise: any state showing trails, the globe and the Moon together (stale `tmp` scrambles positions). |
| **R6** | **TDZ from a declaration-style change.** `saveSettings` (const arrow @4217, called from 9 earlier lines), `mergeAt` (@2428), `eatAge`→`EAT_AGES` (@3136/3139), `G710_DIR`→`G710_OFF` (@3063/3064), `$` (@3591), `exportState` (@6379), `deleteVAO` (@1864, called from 1860), `zoomStep`, `setSlid` (@3921, called from 3915). Converting a hoisted `function` to a `const` arrow — or the reverse — resurrects a boot death. | Freeze the declaration style. `saveSettings` and `exportState` become hoisted `function`s **on purpose**. `qrEncode`'s inner `mul` stays a local `const`. Every `const`→`function` change is called out in its commit message. | `npm run check` catches some; a boot test that runs `main.ts` in jsdom and asserts no `ReferenceError` catches the rest. The QR one needs an explicit `qrEncode` unit test with a known payload → known matrix. |
| **R7** | **CSS file order.** Three silent cascade traps: (a) `.gamebar`@318–320 and `.info-card`@245–247 re-declare background/border/shadow **after** the state-colour block @165–175, so neither is tinted today — `panels.css` must load before `dialogs.css` and `hud.css`; (b) `.gamebar .stat b`@380 is unconditional and beats `@media(max-width:820px)`@368, so sorting media queries to the bottom shrinks the numerals; (c) `#tourLogo` is 96px not 88px on most phones purely because @243 follows @239. | The four files, in order, contents exactly per 10-css §2, blocks in ascending original line order within each file. Render-blocking `<link>`s in `<head>` where `<style>` sits today. Never JS-injected. | A parity frame **inside a glacial epoch** (`body.ice`, `--iceA`≈1) plus viewports in the 601–620, 621–820 and ≥821 px bands and one ≤620 wide **and** ≤790 tall. Without those four, the split passes the gate and is still wrong. |
| **R8** | **Element-id drift.** 159 ids addressed by bare `$()` with no null check. Three fail *loudly* (`$('detail')`, `$('jump')` at eval time; `fitPanels`/`updateBar` deref `.classList`/`.style`). Many fail *silently*: `TOUR_HINTS` drops a hint, `saveSettingsNow`'s 38 ids fail inside its own `try/catch`, `data-step` is a **third** copy of every slider id, `UG.uPlate` is queried as `'uPlate[0]'`, `#env h2` is positional, `$('focusSel').options[0]` is cached at eval time, `showStats` reads inline `style="display:none"` (not computed style). | Markup moves verbatim; no id renames during the migration. `UG.uPlate` stays a hand-written special case. `#tView`/`#tDive` stay hidden DOM buttons (27 read sites each), not variables. Inline `display:none` at markup 1005/1009 stays inline. | The `BOOT_IDS` + `MARKUP_ONLY_IDS` + no-duplicates + no-unknown-ids test suite from 09-dom §3, run after `main.ts` has executed. Plus a `data-step` test: for every `.stepb`, assert `$(dataset.step.split(':')[0])` resolves and is in `S_SLD`. |
| **R9** | **The no-WebGL2 abort path.** Line 1190 rewrites `document.body.innerHTML` — destroying every id — then throws. In one script that stops everything. Split, the throw aborts only `gpu/context`'s dependents; earlier modules keep their side effects, and every importer gets a cascade of TDZ errors instead of the message. A parse check cannot see this branch. | `gpu/context` is one import that either succeeds or replaces the body and stops. `main.ts` wraps its own body so nothing after the failure runs. | An e2e test that stubs `HTMLCanvasElement.prototype.getContext` to return `null` and asserts: the message is on screen, exactly one error is logged, and no secondary `ReferenceError` appears. |
| **R10** | **Pass reordering / GL state.** Cross-pass uniform persistence is intentional and documented (5217 "the uniforms as the last frame left them", 5532 "their uniforms persist on the program"). The eval-time loop at 2362 leaves `pDust` bound. `vaoSunPt`'s IIFE (5188) leaves `ARRAY_BUFFER` non-null. `perfProbe` (5204) trashes viewport/clearColor/blend/program/VAO and restores only three of them, relying on running between frames. | `render/frame` calls `draw*()` in the exact order of 08 §1.8.1. Passes never re-order the `useProgram`/uniform calls that touch `pPt`/`U`. `perfProbe` stays called from frame 3 inside the loop. Program creation order stays source order via `main.ts`'s import order. | Every parity screenshot. `perfProbe` specifically: a fresh-profile parity state, where frame 3 runs the probe. |
| **R11** | **A generic uniform helper unions the key lists.** `UN` omits `uVelT`/`uMinB`/`uFadeOut`; `UD` omits those **plus** `uTime`/`uVarMode`. The GL defaults (0) are load-bearing. Attribute location 4 (`aVel`) is never enabled by any VAO — nebulae and dust would gain a proper-motion shear they have never had. `U` merges two programs under prefixed keys and no per-program helper can produce it. `UG.uPlate` must be queried as `'uPlate[0]'`. | Keep all 13 uniform tables as hand-written literals in step 12. Do **not** write a harvesting helper during the migration. If one is written later, it takes `(program, keyList)` and is never given a union. | A unit test that snapshots each table's key list (`Object.keys(UN).sort()` etc.) against the values in 11-shaders §4. Plus a nebula/dust-heavy parity state. |
| **R12** | **Name collisions and shadows.** `mul` (mat4 @1180 vs GF(256) @6202 — an auto-import corrupts QR error-correction bytes). `USN` vs `USn` (case-only; collapse on a case-insensitive FS or after a rename round-trip). `clock` (@6338 formatter vs the proposed singleton). `W`/`H` shadowed at 4627 inside `drawTourLines`. `last` shadowed at 5674, `px` at 1899/2301/5211. | `hhmmss` replaces the formatter; `simClock` is the singleton. `USn` → `USUN` (step 23, separately). The QR `mul` stays function-local — grep it explicitly after every step touching `ui/qr`. Shadowed locals are never touched by a mechanical rename. | A `qrEncode` unit test (known payload → known module matrix) catches the `mul` one; the tour-overlay parity state catches the `W`/`H` one; `tsc --noEmit` catches nothing here, which is the point. |
| **R13** | **Async loader timing.** `loadEarthMap()` @2725 (the globe takes the `uHasMap=0` noise branch until it lands, 5813); `loadGaiaStars/loadGalaxyMap/loadM31Map` @3050–3052 — **issue order fixes resolve order on a warm cache**, and 3051/3052 resolve into `setGalaxy(curD)` callbacks that consume randomness. This is a *pre-existing* race the refactor must not worsen. | Keep all four calls at the same boot positions and in the same order. The `onReady` inversion (C3) must not insert an `await`/microtask between the flush and the rebuild. | The parity harness must block or stub all four fetches deterministically and wait for the frame to stop changing. If the current harness does not, that is a gate defect to fix in step 0 — not something to blame on the refactor. |
| **R14** | **The `var` block at 1658.** `starPos/starSize/starCol` are `var`s inside a bare block, consumed at 1880 outside it. Converting the block to `const`/`let`, or moving it without 1880, yields an **empty starfield**. Parse-check invisible. | The whole block becomes `buildStarfield(): {pos,size,col}` and 1880 consumes its return value. That removes the dependence rather than reproducing it. | A parity state with a clear sky (`galaxy-outside`, `andromeda`). Plus an assertion in the boot test that `gfx` and the star VAO have non-zero counts. |
| **R15** | **`earthPhi0`'s lazy init moves.** Computed on the first `earthPrime` call (2791–2796) from `org` — its value depends on *when* it is first called, not only on arguments. Correct only because that first call is inside `frame()` after `bodyPos(0, simT, org)` at 5288. | `earthPrime(t, out, org)` takes `org`; the first-call site does not move; **never** hoist the init to module evaluation. | Any Earth-globe parity state: a wrong `earthPhi0` rotates the continents. Add an assertion that `earthPhi0 === null` immediately after `main.ts` and non-null after frame 1. |
| **R16** | **The two-phase galaxy build collapses.** `setGalaxy(1)` @2365 then the real tier at 6156/6161. Under ESM the `deepAsked` TDZ trap disappears — but the *random stream* still depends on there being two builds, at those two points. | Keep both phases and the literal `1`. Comment says why: RNG stream, not TDZ, after the split. | Parity on a fresh profile. A single-phase build changes every star. |
| **R17** | **Shaders become async.** `PT_VS`…`REM_FS` are consumed synchronously by `prog()` at 1357/1458/1528. A runtime `fetch()` makes program creation async and changes first-frame timing. | `?raw` build-time text import via the existing `glsl-raw` plugin only. Byte-compare each `.glsl` against the original literal before building. | `npm run build` + a byte-diff script; then parity. A `fetch`-based loader would fail loudly on frame 1. |
| **R18** | **`getContext` called twice.** A second `getContext('webgl2', …)` with different attributes silently returns the existing context and **ignores the attributes** (`antialias:true, alpha:false`). Duplicate `gpu/context` instances from mixed import specifiers diverge. | One module, one call. A dev-time guard: `if (globalThis.__gtGL) throw new Error('gpu/context evaluated twice')`. Consistent import specifiers (relative only, no aliases). | The identity test from R5, plus a build-time check that `gpu/context` appears once in the emitted bundle. |
| **R19** | **`seg`'s `set(initial, false)`.** `setSegUnits` (4278) writes `unitMode`, declared two lines *below* at 4280. Safe only because the `false` suppresses the callback. The argument is load-bearing (comment at 4139–4140). | Do not change `seg`'s signature or drop the `false`. If `seg` moves to `ui/sections`, the argument moves with it. | A boot test asserting no `ReferenceError`; the units segment defaulting to `words` in a HUD-visible parity state. |
| **R20** | **Trail pre-fill vs anchor.** The pre-fill @2878–2891 stores **absolute** positions; `pushTrail`/`trailPos` @2924–2934 store **anchor-relative** ones. Correct only because `trailAnchor` is zero at boot; the pre-fill *cannot* call `trailPos` (TDZ, 32 lines below). "Cleaning this up" kills boot or scrambles the trails. | Carry both loops verbatim into `render/trails`, with the comment. | The `opening-helix` parity state — trails are its whole subject. |
| **R21** | **Devtools bindings become unreachable.** `earthDbg` (5802) and `probeInfo` (5237) have zero in-file readers; a classic `<script>` exposed them, a module does not. Tree-shaking will drop them. | Both go on `readout`; `main.ts` publishes `globalThis.__gt` under a debug guard. Decided, not defaulted. | A build assertion that `__gt` exists in the emitted file, and that `readout.earthDbg` is non-null after frame 1 with `?debug`. |
| **R22** | **`runFirstLaunchProbe` pulls `ui/persist` above `core/errorlog`.** It calls `resize()` (gpu/context), `saveSettingsNow()` (ui/persist) and dispatches a DOM `input` on `#detail` → `setGalaxy` → randomness, on rendered frame 3. Three-way coupling. | `render/probe` sits at tier 24, imported by `render/frame` only. `hadSaved` is passed into the trigger, not read from `main.ts` scope. `main.ts`'s first import stays `core/errorlog`. | The fresh-profile parity state (where the probe runs) plus the R3 test. |
| **R23** | **Screenshot text depends on the host.** `BUILD_LINE` (1159–1161) calls `localBuildStamp()` at eval time, reading `Intl.DateTimeFormat` locale and `getTimezoneOffset`; the string lands in `#buildStamp` (3593) and `#tourBuild` (3594). `TOUCH_DEV` freezes two `matchMedia` results at eval time. `iceLast = performance.now()` @4846. | Pin `TZ` and locale in the harness, or mask those two text regions in the comparison. Do not move any of the three eval-time environment reads. | A parity run under two different `TZ` values must produce identical PNGs. If it does not today, fix the harness in step 0. |
| **R24** | **The reduced-motion click at 4721.** `$('tPause').click()` at eval time flips `paused` **before** `restoreSettings()` (6156) and before the opening scenario (6167); `jumpToEpoch` re-checks the same media query at 4322/4337/4349/4363/4375/4402. A three-way ordering. | Preserved verbatim as boot step 18 in `main.ts`. `restoreSettings` deliberately does not persist `paused` — leave it that way. | The harness already runs `reducedMotion: 'reduce'` (`scripts/smoke.mjs`). Add one parity state with `reducedMotion: 'no-preference'` so both branches are photographed. |
| **R25** | **Module-script defer semantics.** The classic script runs at its parse position (end of `<body>`); a `type="module"` script is deferred to after parsing. Elements exist either way, but the *timing* relative to `<link>` stylesheet application, font loading and the async fetches shifts — and `layoutPanels`/`fitPanels`/`#tip` all measure boxes during boot. | Step 1 is a commit of its own, changing nothing else. Stylesheets stay render-blocking in `<head>` so measurement sees final metrics; the `@font-face` base64 payloads stay inline (10-css §5.3). | The full parity gate on step 1 alone. `#tip` specifically: a tooltip parity state (open an `.info` tip, screenshot). |
| **R26** | **Tree-shaking drops a side-effect module.** `core/errorlog`, `gpu/context`'s GL state block, the `uGRot` seed loop, `loadEarthMap()`, the three fetch kicks — all are side-effect-only. | No `"sideEffects": false` in `package.json`. Every side-effect module is reached through an explicit call from `main.ts`, not through a bare import, except `core/errorlog` which is a deliberate bare import. | `scripts/check-build.mjs` asserts that the emitted single file contains marker strings from every module (e.g. `'no webgl2'`, `'galaxy-map.webp'`, `'earth-map.webp'`). |
| **R27** | **Duplicated constants "unified".** `zoomStep` clamps `distGoal` to **9500** (3571) while the wheel (3576) and pinch (3585) clamp to **7500**. `V_GAL` hard-codes `900` instead of `R_GAL`. `--ink`/`--dim` are duplicated as `INK_WARM`/`DIM_WARM` @4844. `mat3 uPlate[7]`'s `7` is in both GLSL and JS. | Copy every number verbatim. Add a cross-reference comment at each pair; change nothing. | The camera-zoom parity states; a wheel-zoom-to-limit e2e assertion on `cam.distGoal`. |
| **R28** | **Dead code removed during the move.** `AND_AGE` (1542), `makeBuf` (1643), `showTrails` (3658), `liveCount` (4279), `lifeSupOn` (3945), `.hud .sub`, `.toggles`, `.actsep`, `.mults`, `#tourLogo`/`#envMin`/`#evoBand`/`#evoClip` (CSS/SVG hooks with no JS reader). Deleting is behaviour-neutral *on paper*; the gate cannot prove a negative. | Carry everything across unchanged. Cleanup is step 23, separate commits, separate parity runs. | Nothing catches this cheaply — which is why it is a rule, not a test. |
| **R29** | **`openSeq`'s first increment.** `pState.env.seq = ++openSeq` @3971 must remain the first increment so `env` keeps `seq === 1`; every later `setPanelOpen`/`restoreSettings` bump ranks above it. If `ui/panels` evaluates after something else that touches `openSeq`, panel z-order and crowd eviction change — a visible pixel diff. | `ui/panels`'s `pState` initialiser stays the first `openSeq` touch, inside `initPanels()`. | Any desktop parity state where two panels overlap; add one narrow-viewport state where crowd eviction actually fires. |
| **R30** | **`#tip` measured unstyled.** Created by JS at 4521 at eval time, `display:block` set at 4527 and `offsetWidth`/`offsetHeight` read at 4528. If `hud.css` (which holds `#tip` @354–356) is JS-injected or applied late, the tooltip lands in the wrong place. `#tip` is the only stylesheet id with no counterpart in the markup. | Four render-blocking `<link>`s in `<head>`. Never a JS-injected `<style>`. | A tooltip parity state. Plus a test asserting `getComputedStyle($('tip')).maxWidth === '250px'` right after boot. |

### 5.1 Hazards from the inventories that are *resolved by the move itself*

Recorded so nobody re-mitigates them:

- **`deepAsked` TDZ** (`setGalaxy(1)`@2365 → `loadGaiaDeep`@3043 → `deepAsked`@3042). ESM guarantees `scene/sky`'s body runs before `scene/cache`'s. Gone. The literal `1` is kept for R2/R16, not for this.
- **`M31_ARM_K`@2292 read by `genAndromedaMap`@2231**, and `R_A`/`M32_C`/`M110_C`/`GSS_DIR` read by generators declared above them. Same reason: the import edge forces the order.
- **`flushGxyCache`@1858 → `gxyCache`@1882** and **`flushGxyCache`@1860 → `deleteVAO`@1864**. Both intra- or cross-module edges the bundler now orders correctly.
- **`$` used at 3234/3235 before its 3591 declaration.** `audio/music` imports `core/dom`; `core/dom` is tier 1. Gone — but note 12-state H1: the *signal* is gone too. Code that could not previously run early now silently can. Re-verify boot order by execution, not by grep.
- **The ~40 write-before-declaration sites** (`hudHz`@3727, `showFps`@3944, `armsOn`@3784, `labelEls`/`armEls`, `simT`/`nextSample`, `reseedFollow`, `dprCap`, `H`, `org`). All become ordinary cross-module reads once §3's singletons exist. Their *runtime* ordering constraint (R1) survives; their TDZ risk does not.

### 5.2 Gate coverage this plan requires beyond today's harness

Add in step 0, before anything moves:

1. A glacial-epoch frame (`body.ice`, `--iceA` ≈ 1) — R7(a).
2. Viewports at 610, 700, 900 px wide, and one 600×760 — R7(b), R7(c).
3. One `reducedMotion: 'no-preference'` state — R24.
4. A fresh-profile state (`hadSaved === false`) alongside the saved-fixture states — R4, R16, R22.
5. A tooltip-open state — R25, R30.
6. Deterministic stubbing (or awaiting) of the four boot fetches — R13.
7. Two runs under different `TZ` — R23.
8. The `BOOT_IDS` suite and a `data-step` cross-check — R8.
9. A `no console errors, no page errors` assertion on every state — R3, R6, R9.
