# 12 — Mutable shared state

Slice: `galactic-transit.html`, script only, lines 1095–6429. Every top-level `let` and `var` binding in the single script, what writes it, what reads it, and where it must land in `src/`.

**168 mutable bindings**: 153 `let`, 15 `var`. Line numbers are the numbers in `galactic-transit.html` as it stands today.

Method: the script body (lines 1096–6428) was tokenised with a scanner that skips comments, strings, template literals (including `${}` nesting) and regex literals, and tracks bracket depth, so "top level" means brace depth 0 in the script — plus the one bare block at 1658 whose `var`s hoist out of it. Write/read sites were counted from the same token stream, then each surprising site was read by hand. Where the scanner's classification was ambiguous (prefix `++`, shadowed names) the file was checked directly; those cases are called out.

---

## 0. The one-paragraph version

The script has three genuinely shared mutable clusters and a long tail of module-private scratch:

- **The clock** (`simT`, `nextSample`, `DT_SAMPLE`, `speed`, `speedMult`, `shuttle`, `paused`) is written by the frame loop, the settings sliders, the scenario jumper and the debug importer. Four sections.
- **The camera** (`coreLock`, `followTarget`, `reseedFollow`, `spinLock`) is written by pointer handlers, focus presets, zoom presets, the dive toggle, the view toggle, scenarios, the frame loop and the debug importer. Eight sections; `reseedFollow` alone has 16 write sites.
- **The active galaxy record** (`N_GXY`, `NEB_N`, `DUST_N`, `N_AND`, `N_ANDN`, `N_ANDD`, `NEB_PINK`, `NEB_GLOW`, `AND_PINK`, `AND_GLOW`, `NUC0`, `NUC1`, `vaoGxy`, `vaoNeb`, `vaoDust`, `vaoAnd`, `vaoAndNeb`, `vaoAndDust`, `curD`) is written by four generators and by `setGalaxy`, and read by six draw passes.

Everything else is (b) one owner / many readers, or (d) a GPU/audio/timer handle, or dead.

Legend for the class column:

| class | meaning |
|---|---|
| **a** | write-once at boot (or never written); effectively `const` |
| **b** | one owning section writes it, many read it — accessor or owning module |
| **c** | written from several sections — must move into a shared state object |
| **d** | cache/handle for a GPU, audio or timer resource |

`R≈n` is the number of distinct source lines that read the binding (not occurrences).

---

## 1. Scene / galaxy generation and upload

| # | name | line | type | init | meaning | writes | R≈ | class |
|---|---|---|---|---|---|---|---|---|
| 1 | `realMode` | 1596 | boolean | `true` | true astronomical proportions; the magnified mode is gone | **decl only** | 21 | **a** |
| 2 | `curD` | 1597 | number | `1` | active galaxy density multiplier | 1597, 2064 | 11 | **b** (`setGalaxy` owns) |
| 3 | `showP9` | 1601 | boolean | `true` | draw the hypothetical Planet Nine | 1601, 3803 | 4 | **b** |
| 4 | `N_GXY` | 1683 | number | *undefined* | Milky Way star count of the live buffer | 1683, 1699, 1946, 2060 | 13 | **c** |
| 5 | `NEB_N` | 1683 | number | *undefined* | nebula sprite count | 1769, 1991, 2060 | 9 | **c** |
| 6 | `DUST_N` | 1683 | number | *undefined* | dust sprite count | 1812, 2029, 2060 | 9 | **c** |
| 7 | `N_AND` | 1684 | number | `0` | Andromeda star count | 1684, 2063, 2163, 2196 | 13 | **c** |
| 8 | `vaoAnd` | 1684 | WebGLVertexArrayObject \| null | `null` | Andromeda star VAO | 1684, 2065 | 2 | **d** |
| 9 | `N_ANDN` | 1685 | number | `0` | Andromeda nebula count | 1685, 2063, 2163, 2242 | 4 | **c** |
| 10 | `N_ANDD` | 1685 | number | `0` | Andromeda dust count | 1685, 2063, 2163, 2273 | 4 | **c** |
| 11 | `vaoAndNeb` | 1685 | VAO \| null | `null` | Andromeda nebula VAO | 1685, 2065 | 2 | **d** |
| 12 | `vaoAndDust` | 1685 | VAO \| null | `null` | Andromeda dust VAO | 1685, 2065 | 2 | **d** |
| 13 | `m31Map` | 1685 | object \| null | `null` | M31 luminance probability map, fetched | 1685, 2355 | 5 | **d** |
| 14 | `NEB_PINK` | 1690 | number | `0` | run length: HII pink nebulae in the buffer | 1690, 1770, 1992 | 3 | **c** |
| 15 | `NEB_GLOW` | 1690 | number | `0` | run length: diffuse haze | 1690, 1770, 1992 | 3 | **c** |
| 16 | `AND_PINK` | 1690 | number | `0` | same, Andromeda | 1690, 2163, 2243 | 3 | **c** |
| 17 | `AND_GLOW` | 1690 | number | `0` | same, Andromeda | 1690, 2163, 2243 | 3 | **c** |
| 18 | `NUC0` | 1696 | number | `0` | first index of the nuclear star run | 1696, 1700, 1958 | 4 | **c** |
| 19 | `NUC1` | 1696 | number | `0` | end index of the nuclear star run | 1696, 1700, 1958 | 4 | **c** |
| 20 | `hideNucleus` | 1696 | boolean | `true` | hide the Sgr A* run when inside the disk | **decl only** | 1 | **a** (dead switch) |
| 21 | `gxyPos` | 1697 | Float32Array \| null | *undefined* | generator→uploader handoff, nulled after upload | 1697, 1704, 1949, 2048 | 3 | **b** (scratch) |
| 22 | `gxySize` | 1697 | Float32Array \| null | *undefined* | ” | 1704, 1949, 2048 | 3 | **b** (scratch) |
| 23 | `gxyCol` | 1697 | Float32Array \| null | *undefined* | ” | 1704, 1950, 2048 | 3 | **b** (scratch) |
| 24 | `gxyWave` | 1697 | Float32Array \| null | *undefined* | ” | 1704, 1950, 2048 | 3 | **b** (scratch) |
| 25 | `nebPos` | 1697 | Float32Array \| null | *undefined* | ” | 1771, 1993, 2048 | 10 | **b** (scratch) |
| 26 | `nebSize` | 1697 | Float32Array \| null | *undefined* | ” | 1771, 1993, 2048 | 5 | **b** (scratch) |
| 27 | `nebCol` | 1697 | Float32Array \| null | *undefined* | ” | 1771, 1993, 2048 | 5 | **b** (scratch) |
| 28 | `dustPos` | 1697 | Float32Array \| null | *undefined* | ” | 1814, 2030, 2048 | 6 | **b** (scratch) |
| 29 | `dustSize` | 1697 | Float32Array \| null | *undefined* | ” | 1814, 2030, 2048 | 5 | **b** (scratch) |
| 30 | `dustStr` | 1697 | Float32Array \| null | *undefined* | ” | 1814, 2030, 2048 | 5 | **b** (scratch) |
| 31 | `vaoGxy` | 1881 | VAO | *undefined* | live Milky Way star VAO | 1881, 2064 | 2 | **d** |
| 32 | `vaoNeb` | 1881 | VAO | *undefined* | live nebula VAO | 2064 | 2 | **d** |
| 33 | `vaoDust` | 1881 | VAO | *undefined* | live dust VAO | 2064 | 2 | **d** |
| 34 | `galaxyMap` | 1889 | object \| null | `null` | Milky Way luminance probability map, fetched | 1889, 1927 | 4 | **d** |
| 35 | `DUST_DEEP_CAP` | 2122 | number | `40.0` | sprite ceiling for dust at close range | **decl only** | 1 | **a** |
| 36 | `starPos` | 1658 | **var** Float32Array | `new Float32Array(N_STAR*3)` | 3,200 backdrop stars, positions | **decl only** (filled in place) | 1 | **a** |
| 37 | `starSize` | 1658 | **var** Float32Array | `new Float32Array(N_STAR)` | ” sizes | **decl only** | 1 | **a** |
| 38 | `starCol` | 1658 | **var** Float32Array | `new Float32Array(N_STAR*3)` | ” colours | **decl only** | 1 | **a** |

`gxyPos … dustStr` (#21–30) are a ten-binding handoff channel between a generator and `pointVAO`, deliberately nulled at 2049 to free the JS copies. They should not survive the refactor at all — see §7.

---

## 2. Belts and rings (all `var`, all filled in place)

| # | name | line | type | meaning | writes | R≈ | class |
|---|---|---|---|---|---|---|---|
| 39 | `abRT` | 2457 | **var** Float32Array | asteroid belt: real radius + phase | decl only | 2 | **a** |
| 40 | `abRTd` | 2457 | **var** Float32Array | asteroid belt: display-remapped radius + phase | decl only | 3 | **a** |
| 41 | `abH` | 2458 | **var** Float32Array | height off the ecliptic, real | decl only | 2 | **a** |
| 42 | `abHd` | 2458 | **var** Float32Array | height off the ecliptic, display | decl only | 2 | **a** |
| 43 | `abSz` | 2459 | **var** Float32Array | sprite size | decl only | 2 | **a** |
| 44 | `abP` | 2459 | **var** Float32Array | true Kepler period, years | decl only | 2 | **a** |
| 45 | `kbRT` | 2477 | **var** Float32Array | Kuiper belt radius + phase | decl only | 2 | **a** |
| 46 | `kbH` | 2477 | **var** Float32Array | Kuiper belt height | decl only | 2 | **a** |
| 47 | `kbSz` | 2477 | **var** Float32Array | Kuiper belt sprite size | decl only | 2 | **a** |
| 48 | `ooOff` | 2485 | **var** Float32Array | Oort shell offsets | decl only | 2 | **a** |
| 49 | `ooSz` | 2485 | **var** Float32Array | Oort sprite size | decl only | 2 | **a** |
| 50 | `ringCS` | 2563 | **var** Float32Array | 160 cos/sin pairs for the Oort boundary circles | decl only | 2 | **a** |

---

## 3. Earth, globe and per-frame readouts

| # | name | line | type | init | meaning | writes | R≈ | class |
|---|---|---|---|---|---|---|---|---|
| 51 | `earthTex` | 2713 | WebGLTexture \| null | `null` | GSHHG land map texture, fetched | 2713, 2722 | 2 | **d** |
| 52 | `earthPhi0` | 2788 | number \| null | `null` | spin phase putting the Sun over Greenwich at 2026-01-01 noon | 2788, **2796 (lazy, first frame)** | 2 | **a** (write-once, but *not* at boot — see H15) |
| 53 | `globePx` | 2848 | number | `0` | Earth's apparent diameter in device pixels | 2848, 5298 | 7 | **b** (frame writes) |
| 54 | `moonPx` | 2848 | number | `0` | Moon's apparent diameter in device pixels | 2848, 5794, 5822 | 3 | **b** |
| 55 | `earthDbg` | 2848 | object \| null | `null` | globe vectors, "read by the debug tooling" (devtools only) | 2848, 5802 | **0 in file** | **b** (write-only — see §8) |
| 56 | `camSunDist` | 2848 | number | `150` | camera→Sun distance, scene units | 2848, 5382 | 4 | **b** |
| 57 | `avgLight` | 2848 | number | `0` | 0..1 crossfade to daily-mean insolation as the clock outruns the day | 2848, 5257 | 2 | **b** |
| 58 | `DT_SAMPLE` | 2876 | number | `0.01` | trail sample spacing, sim years | 2876, 3757 | 14 | **b** (`applyTrailWindow` owns) |
| 59 | `psH` | 2918 | boolean | `true` | trails visible (trail-alpha slider is its switch) | 2918, 3749 | 4 | **b** |
| 60 | `psO` | 2918 | boolean | `true` | orbit rings visible | 2918, 3752 | 2 | **b** |

---

## 4. Star catalogues (Gaia)

| # | name | line | type | init | meaning | writes | R≈ | class |
|---|---|---|---|---|---|---|---|---|
| 61 | `vaoGaia` | 3006 | VAO \| null | `null` | real-sky star VAO | 3006, 3039 | 2 | **d** |
| 62 | `N_GAIA` | 3006 | number | `0` | its point count | 3006, 3039 | 1 | **d** |
| 63 | `gaiaOn` | 3006 | boolean | `true` | draw the real sky | 3006, 3943 | 1 | **b** |
| 64 | `vaoGaiaDeep` | 3042 | VAO \| null | `null` | 400k deep-catalogue VAO | 3042, 3047 | 2 | **d** |
| 65 | `N_GAIA_DEEP` | 3042 | number | `0` | its point count | 3042, 3047 | 1 | **d** |
| 66 | `deepAsked` | 3042 | boolean | `false` | the 8 MB fetch has been started | 3042, 3045, 3048 | 1 | **b** (private; **TDZ trap H3**) |

---

## 5. Life cycle, variability, audio

| # | name | line | type | init | meaning | writes | R≈ | class |
|---|---|---|---|---|---|---|---|---|
| 67 | `lifeOn` | 3083 | boolean | `false` | supernovae/births simulated | 3083, 3809 | 5 | **b** |
| 68 | `varOn` | 3191 | boolean | `true` | stellar variability shimmer | 3191, 3820 | 4 | **b** |
| 69 | `shimT` | 3191 | number | `0` | wall-clock variability clock; runs while paused | 3191, 5245 | 6 | **b** (frame owns) |
| 70 | `soundOn` | 3194 | boolean | `false` | sfx enabled | 3194, 4175, 4179 | 4 | **b** |
| 71 | `sfxVol` | 3194 | number | `0` | sfx volume; 0 is the off position | 3194, 4172 | 3 | **b** |
| 72 | `audio` | 3194 | object \| null | `null` | lazily built AudioContext graph | 3194, 4176 | 21 | **d** |
| 73 | `musicOn` | 3229 | boolean | `true` | music enabled | 3229, 4151 | 6 | **b** |
| 74 | `musicVol` | 3229 | number | `0.40` | music volume | 3229, 4147 | 1 | **b** |
| 75 | `trackIx` | 3229 | number | `0` | current track index | 3229, 3243 | 5 | **b** |
| 76 | `unlockArmed` | 3257 | boolean | `false` | a retry-on-next-gesture listener is registered | 3257, 3260, 3263 | 2 | **b** (private) |
| 77 | `banksLoading` | 3291 | boolean | `false` | the sfx sample banks are being decoded | 3291, 3298, 3300, 3306 | 1 | **b** (private) |
| 78 | `evN` | 3391 | number | `0` | events written by the last `fillEvents()` | 3391, 3447, 3483 | 6 | **b** |
| 79 | `snN` | 3391 | number | `0` | supernova flashes written by the last `fillEvents()` | 3391, 3447, 3457 | 7 | **b** |
| 80 | `accB` | 3410 | number | `0` | fractional accumulator: star births owed | 3410, 3417 ×2, 3423, 3426, **4406** | 2 | **c** |
| 81 | `accSN` | 3410 | number | `0` | ” supernovae owed | 3410, 3419, 3421, 3427, 3429, **4406** | 2 | **c** |
| 82 | `accPN` | 3410 | number | `0` | ” planetary nebulae owed | 3410, 3420, 3421, 3430, 3432, **4406** | 2 | **c** |

`accB/accSN/accPN` are (c) only because of the single reset at 4406 inside `jumpToEpoch` (ui/scenarios). Everything else is `lifeStep`.

---

## 6. Camera, pointer and view controls

| # | name | line | type | init | meaning | writes | R≈ | class |
|---|---|---|---|---|---|---|---|---|
| 83 | `coreLock` | 3502 | boolean | `false` | hold the camera on the Sun→core line | 3502, 3836, 3862, 3869, 3878, 3886, 3896, 4333, 4345, 4357, 4371, 4383, 4503, 4505, 6402 | 3 | **c** (15 sites, 6 sections) |
| 84 | `followTarget` | 3505 | `'sun'` \| string | `'sun'` | which absolute-frame body `cam.follow` tracks | 3505, 3859, 3868, 3875, 3883, 3895, 3898, 4294, 4476, 4502 | 7 | **c** |
| 85 | `dragging` | 3506 | boolean | `false` | an orbit drag is in progress | 3506, 3522, 3525, 3544, 3548, 3586 | 1 | **b** (private) |
| 86 | `px` | 3506 | number | `0` | last pointer x | 3506, 3522, 3540, 3548, 3853 | 3 | **b** (private; **shadowed** — H13) |
| 87 | `py` | 3506 | number | `0` | last pointer y | 3506, 3522, 3540, 3548 | 1 | **b** (private) |
| 88 | `holding` | 3509 | boolean | `false` | a pointer is down → the sim clock holds | 3509, 3520, 3544, 3580, 3581 | 1 (frame, 5253) | **b** (needs a getter) |
| 89 | `panCX` | 3516 | number | `0` | last two-pointer centroid x | 3516, 3534 | 3 | **b** (private) |
| 90 | `panCY` | 3516 | number | `0` | last two-pointer centroid y | 3516, 3534 | 3 | **b** (private) |
| 91 | `pinchD` | 3579 | number | `0` | last two-touch separation | 3579, 3580, 3586 | 1 | **b** (private) |
| 118 | `spinLock` | 3829 | boolean | `false` | lock the camera to the galaxy's rotating frame | 3829, 3837 | 1 | **b** |
| 161 | `reseedFollow` | 5054 | boolean | `false` | drop the follow easing and snap next frame | 3862, 3869, 3878, 3886, 3896, 3901, 4336, 4348, 4362, 4374, 4409, 4476, 4499, 5054, 5337, 6404 | 1 | **c** (16 sites, 8 sections) |
| 160 | `firstFrame` | 5049 | boolean | `true` | seed the smoothing on the very first frame | 5049, 5347 | 1 | **b** (private) |

---

## 7. Simulation controls (toggles and sliders)

| # | name | line | type | init | meaning | writes | R≈ | class |
|---|---|---|---|---|---|---|---|---|
| 92 | `paused` | 3658 | boolean | `false` | the sim clock is stopped | 3658, 3780 | 13 | **b**, but mutated indirectly from 5 sections via `$('tPause').click()` |
| 93 | `showTrails` | 3658 | boolean | `true` | draw trails | **decl only** | 1 | **a** (dead switch — `trailPct` is the live one) |
| 94 | `showLabels` | 3658 | boolean | `true` | draw body labels | 3658, 3783 | 1 | **b** |
| 95 | `showStats` | 3658 | boolean | `true` | draw the status bar | 3658, 4269 | 2 | **b** |
| 96 | `showDwarfs` | 3659 | boolean | `true` | draw dwarf planets | 3659, 3804 | 3 | **b** |
| 97 | `showBelt` | 3659 | boolean | `true` | draw the asteroid belt | 3659, 3805 | 2 | **b** |
| 98 | `showKuiper` | 3659 | boolean | `true` | draw the Kuiper belt | 3659, 3806 | 2 | **b** |
| 99 | `showOort` | 3659 | boolean | `true` | draw the Oort shell | 3659, 4267 | 2 | **b** |
| 100 | `speed` | 3660 | number | `1.5` | sim years per real second | 3660, 3721, **3722 (top level)** | 5 | **b** |
| 101 | `speedMult` | 3677 | number | `1` | exponential speed multiplier | 3677, 3692 | 7 | **b** |
| 102 | `shuttle` | 3702 | number | `0` | −100..+100 shuttle; outranks pause | 3702, 3705 | 6 | **b** |
| 103 | `shuttleLastSign` | 3702 | −1\|0\|1 | `0` | last drive sign, to detect reversal | 3702, 5249 | 1 | **b** (frame private) |
| 104 | `trailRefillAt` | 3702 | number | `0` | ms of the last backwards trail resweep | 3702, 5261 | 1 | **b** (frame private) |
| 105 | `minBright` | 3730 | number | `0.019` | faint-star brightness floor | 3730, 3733 | 2 | **b** |
| 106 | `minSprite` | 3730 | number | `1.405` | faint-star sprite floor, px | 3730, 3734 | 2 | **b** |
| 107 | `starGain` | 3730 | number | `0.05` | the slider value both floors derive from | 3730, 3732 | 3 | **b** |
| 108 | `coreKnee` | 3741 | number | `1` | highlight rolloff knee; 1 = off | 3741, 3743 | 3 | **b** |
| 109 | `trailAlpha` | 3746 | number | `1` | trail opacity | 3746, 3749 | 3 | **b** |
| 110 | `orbitAlpha` | 3746 | number | `1` | orbit-ring opacity | 3746, 3752 | 3 | **b** |
| 111 | `trailPct` | 3754 | number | `300` | trail length, % of a nominal window | 3754, 3768 | 4 | **b** |
| 112 | `trailRefill` | 3754 | timer id | `0` | debounce handle for `refillTrails()` | 3754, 3765 | 1 | **d** (timer) |
| 113 | `lastAnchor` | 3767 | number | `0` | ms of the last trail re-anchor | 3767, 5275 | 1 | **b** (frame private) |
| 114 | `labelSteady` | 3787 | boolean | `true` | eased label placement | 3787, 3788 | 1 | **b** |
| 115 | `evSN` | 3807 | boolean | `false` | supernova events enabled | 3807, 3818 | 4 | **b** |
| 116 | `evBirth` | 3807 | boolean | `false` | star-birth events enabled | 3807, 3819 | 3 | **b** |
| 117 | `dustOn` | 3821 | boolean | `true` | draw the dust lanes | 3821, 3822 | 1 | **b** |
| 133 | `armsOn` | 4745 | boolean | `true` | draw the spiral-arm labels | **3784** (before its own declaration), 4745 | 1 | **b** (**forward write — H7**) |

---

## 8. UI: panels, settings, calendar, tooltips, fullscreen, tour

| # | name | line | type | init | meaning | writes | R≈ | class |
|---|---|---|---|---|---|---|---|---|
| 119 | `openSeq` | 3969 | number | `0` | monotonically increasing panel-open counter | 3969, and **prefix `++openSeq`** at 3971, 3978, 4087, 4243 | 4 | **b** (private) |
| 120 | `qrPos` | 4201 | `{x,y}` | `{x:1,y:1}` | QR overlay position as fractions of free space | 4201, 4247, 6302 | 3 | **c** (ui/settings + ui/qr) |
| 121 | `qrHeld` | 4201 | boolean | `false` | the overlay is being dragged | 4201, 6306, 6315 | 1 | **b** (private) |
| 122 | `saveTimer` | 4216 | timer id | `0` | 250 ms settings-save debounce | 4216, 4217 | 1 | **d** (timer) |
| 123 | `liveCount` | 4279 | boolean | `false` | retired control | **decl only** | 1 | **a** (dead — the 6019 branch never runs) |
| 124 | `calMode` | 4280 | string | `'ad'` | calendar readout mode | 4280, 4282 | 3 | **b** |
| 125 | `unitMode` | 4280 | string | `'words'` | number formatting mode | 4280, **4278** (a callback two lines above the declaration) | 3 | **b** (**TDZ-adjacent — H6**) |
| 126 | `keepSaved` | 4292 | boolean | `false` | the opening scenario must not overwrite saved sliders | 4292, 6166, 6169 | 1 | **c** (main.ts writes, ui/scenarios reads) |
| 127 | `tipFor` | 4522 | Element \| null | `null` | which button owns the visible tooltip | 4522, 4523, 4526 | 5 | **b** (private) |
| 128 | `tipTimer` | 4522 | timer id | `0` | tooltip auto-hide handle | 4522, 4532 | 1 | **d** (timer) |
| 129 | `autoFsArmed` | 4554 | boolean | `false` | a rotate-to-fullscreen retry is armed | 4554, 4559, 4562 | 1 | **b** (private) |
| 130 | `leftFsInLandscape` | 4554 | boolean | `false` | the visitor deliberately left fullscreen | 4554, 4556, 4568 | 1 | **b** (private) |
| 131 | `rotIx` | 4573 | number | `0` | index into `ROT = ['auto','landscape','portrait']` | 4573, 4575, 4583 | 2 | **b** (private) |
| 132 | `tourHeldClock` | 4699 | boolean | `false` | the tour paused the clock and owes it back | 4699, 4705, 4712 | 1 | **b** (private) |

---

## 9. Labels, HUD colour easing

| # | name | line | type | init | meaning | writes | R≈ | class |
|---|---|---|---|---|---|---|---|---|
| 134 | `frameDt` | 4781 | number | `1/60` | last frame's dt, for the label easing | 4781, 5942 | 2 | **b** (frame writes, labels read) |
| 135 | `lastRGB` | 4846 | string | `''` | last CSS colour written, to skip redundant writes | 4846, 4888 | 1 | **b** (private) |
| 136 | `lastA` | 4846 | number | `-1` | ” alpha | 4846, 4888 | 1 | **b** (private) |
| 137 | `lastIce` | 4846 | number | `-1` | ” ice mix | 4846, 4877 | 1 | **b** (private) |
| 138 | `lastWhite` | 4846 | number | `-1` | ” white mix | 4846, 4882 | 1 | **b** (private) |
| 139 | `iceShown` | 4846 | number | `0` | eased cold fraction | 4846, 4855 | 2 | **b** (private) |
| 140 | `iceLast` | 4846 | number | `performance.now()` | timestamp for that easing | 4846, 4854 | 1 | **b** (private) |

---

## 10. Viewport / framebuffer

| # | name | line | type | init | meaning | writes | R≈ | class |
|---|---|---|---|---|---|---|---|---|
| 141 | `W` | 4898 | number | `0` | CSS viewport width | 4898, 4987 | 11 | **b** (`resize()` owns; **shadowed** — H12) |
| 142 | `H` | 4898 | number | `0` | CSS viewport height | 4898, 4987 | 13 | **b** (**shadowed** — H12) |
| 143 | `DPR` | 4898 | number | `1` | effective device pixel ratio | 4898, 4986 | 9 | **b** |
| 144 | `projMat` | 4898 | Float32Array | *undefined* | current projection matrix (x-mirrored) | 4990, 5385 | 16 | **c** (`resize()` and `frame()`) |
| 145 | `dprCap` | 4898 | number | `2` | pixel-ratio ceiling; the probe lowers it | 4898, **4234** (applySettings), **5236** (probe) | 4 | **c** |
| 146 | `hdrFB` | 4954 | WebGLFramebuffer \| null | `null` | half-float scene target | 4954, 4965 | 4 | **d** |
| 147 | `hdrTex` | 4954 | WebGLTexture \| null | `null` | its colour attachment | 4954, 4959 | 5 | **d** |
| 148 | `hdrOK` | 4954 | boolean | `false` | the FBO is complete and usable | 4954, 4968 | 1 | **d** |
| 149 | `hiddenState` | 5005 | object \| null | `null` | what was running when the tab was backgrounded | 5005, 5009, 5014 | 4 | **b** (private) |

---

## 11. The frame loop

| # | name | line | type | init | meaning | writes | R≈ | class |
|---|---|---|---|---|---|---|---|---|
| 150 | `simT` | 5029 | number | `0` | simulation clock, years from epoch | 5029, 5254 (frame), **4319, 4325** (jumpToEpoch), **6395** (applyState) | 36 | **c** |
| 151 | `nextSample` | 5029 | number | `DT_SAMPLE` | next sim time at which a trail sample is due | 5029, **3708** (setShuttle), **3765** (applyTrailWindow), **4320, 4404** (jumpToEpoch), 5250/5262/5266/5268/5275 (frame), **6395** (applyState) | 3 | **c** (11 sites, 5 sections) |
| 152 | `last` | 5029 | number | `performance.now()` | previous rAF timestamp | 5029, 5244 | 1 | **b** (private; **shadowed** — H13) |
| 153 | `showFps` | 5030 | boolean | `false` | draw the FPS box | **3944** (before its declaration), 5030 | 2 | **b** (**forward write — H8**) |
| 154 | `fpsFrames` | 5030 | number | `0` | frames since the last FPS sample | 5030, 6015, 6122 | 1 | **b** (private) |
| 155 | `fpsSince` | 5030 | number | `performance.now()` | timestamp of that sample | 5030, 6122 | 2 | **b** (private) |
| 156 | `hudHz` | 5031 | number | `8` | HUD refresh rate, Hz | **3727** (before its declaration), 5031 | 2 | **b** (**forward write — H8**) |
| 157 | `lastHud` | 5031 | number | `0` | timestamp of the last HUD update | 5031, 6017 | 1 | **b** (private) |
| 158 | `barHeld` | 5037 | number | `0` | status-bar min width being held | 5037, 5042, 5045 | 2 | **b** (private) |
| 159 | `barNarrowSince` | 5037 | number | `0` | when the bar first measured narrower | 5037, 5042, 5044, 5045 | 2 | **b** (private) |
| 162 | `lastAgeSeen` | 5057 | number | `AGE0` | previous frame's system age, in Gyr | 5057, 5322 | 1 | **b** (private) |
| 163 | `pnShown` | 5058 | boolean | `false` | the planetary nebula is on screen this frame | 5058, 5864, 5870 | 1 | **b** |
| 164 | `plasmaSunPx` | 5193 | number | `0` | Sun's apparent diameter in device pixels | 5193, 5297 | 4 | **b** |
| 165 | `probeFrames` | 5203 | number | `0` | frame counter arming the first-launch probe (−1 = done) | 5203, 6150 | 1 | **b** (private) |
| 166 | `probeInfo` | 5203 | object \| null | `null` | the probe's measurement | 5203, 5237 | **0 in file** | **b** (write-only — §8 below) |

---

## 12. Debug / QR

| # | name | line | type | init | meaning | writes | R≈ | class |
|---|---|---|---|---|---|---|---|---|
| 167 | `qrLast` | 6270 | string | `''` | last QR payload, to skip redraws | 6270, 6279, 6283 | 1 | **b** (private) |
| 168 | `debugMode` | 6335 | boolean | `false` | the debug door is open | 6335, 6364 | 1 | **b** (private, read by ui/qr at 6279) |

---

## 13. Every `var`, and whether the hoisting is load-bearing

There are 15 `var` bindings in six statements. Only one relies on function-scoped hoisting.

| line | bindings | scope as written | hoisting load-bearing? |
|---|---|---|---|
| **1658** | `starPos`, `starSize`, `starCol` | **inside a bare block `{ … }`** at 1658–1666 | **YES.** The block exists only to scope the `for` loop's locals; the three arrays are consumed at line 1880 (`const vaoStars = pointVAO(starPos, starSize, starCol)`), outside the block. Changing `var` to `const`/`let` here is an immediate `ReferenceError`. In the module split, extract the whole block as a pure `buildStarfield(rng)` returning `{pos, size, col}` — that removes the dependence rather than reproducing it. |
| 2457 | `abRT`, `abRTd` | script top level | no — already top level; the following block at 2460 only writes into the arrays. Safe as `const`. |
| 2458 | `abH`, `abHd` | script top level | no. Safe as `const`. |
| 2459 | `abSz`, `abP` | script top level | no. Safe as `const`. |
| 2477 | `kbRT`, `kbH`, `kbSz` | script top level | no. Safe as `const`. |
| 2485 | `ooOff`, `ooSz` | script top level | no. Safe as `const`. |
| 2563 | `ringCS` | script top level | no. Safe as `const`. |

None of the 15 bindings is ever reassigned; all are mutated in place. All 15 become `const` (or, better, disappear into the return value of a pure generator).

There is one further `var` occurrence at line 4890 — inside a comment about CSS `var()`. Not a declaration.

---

## 14. Proposal for `render/state.ts`

The rule applied below: a binding goes into a shared singleton **only** if two or more target modules write it, or if it is read by five or more modules that would otherwise need a circular import. Everything else stays module-private, exported through a named setter where a second module has to poke it.

### 14.1 The singletons

```ts
// render/state.ts — no imports from gpu/, ui/ or scene/. Plain data only.

/** The simulation clock. Written by render/frame, ui/settings, ui/scenarios, ui/debug. */
export const clock = {
  simT: 0,              // 150
  nextSample: 0.01,     // 151 — seeded from dtSample, see boot note
  dtSample: 0.01,       // 58  DT_SAMPLE
  speed: 1.5,           // 100
  speedMult: 1,         // 101
  shuttle: 0,           // 102
  shuttleLastSign: 0,   // 103
  trailRefillAt: 0,     // 104
  paused: false,        // 92
  last: 0,              // 152 (seeded with performance.now() in main.ts)
  frameDt: 1/60,        // 134
  shimT: 0,             // 69
  lastAnchor: 0,        // 113
  lastAgeSeen: AGE0,    // 162
};

/** The camera and its transitions. */
export const cam = {
  yaw: 0.9, pitch: 0.32, dist: 150, distGoal: 150,
  target: [0,0,0], follow: true,          // the existing `cam` const, 3501
  coreLock: false,       // 83
  followTarget: 'sun',   // 84
  spinLock: false,       // 118
  reseedFollow: false,   // 161
  firstFrame: true,      // 160
  panF: [0,0],           // existing const 3515
  smoothTarget: [0,0,0], // existing const 5049
  smoothOfs: [0,0,0],    // existing const 5054
  dirW: [0,0,1],         // existing camDirW 3829
  spinP: new Float64Array(3),
};

/** The drawing surface. Written by render/frame.resize() and render/probe. */
export const view = {
  W: 0, H: 0, DPR: 1,    // 141,142,143
  dprCap: 2,             // 145
  projMat: null,         // 144
};

/** Everything the visitor can switch on or off. One UI handler writes each; the passes read. */
export const show = {
  p9: true, dwarfs: true, belt: true, kuiper: true, oort: true,
  labels: true, labelSteady: true, arms: true, stats: true,
  dust: true, gaia: true, variability: true, life: false,
  evSN: false, evBirth: false, fps: false,
  hudHz: 8, trailPct: 300, trailAlpha: 1, orbitAlpha: 1,
  psH: true, psO: true,
  minBright: 0.05*0.38, minSprite: 1.3+0.05*2.1, starGain: 0.05,
  coreKnee: 1,
};

/** The live GPU-side galaxy. Written only by scene/cache.setGalaxy() and the loaders. */
export const gfx = {
  curD: 1,
  gxy: { vao: null, n: 0, nucleus: [0,0], nebPink: 0, nebGlow: 0 },  // 4,14,15,18,19,31
  neb: { vao: null, n: 0 },                                          // 5,32
  dust:{ vao: null, n: 0 },                                          // 6,33
  and: { vao: null, n: 0, neb: null, nNeb: 0, dust: null, nDust: 0,
         pink: 0, glow: 0 },                                         // 7-12,16,17
  gaia: { vao: null, n: 0 }, gaiaDeep: { vao: null, n: 0 },          // 61,62,64,65
  hdr: { fb: null, tex: null, ok: false },                           // 146,147,148
  maps: { galaxy: null, m31: null, earthTex: null },                 // 13,34,51
};

/** Values the frame computes and the HUD/labels read one tick later. */
export const readout = {
  globePx: 0, moonPx: 0, camSunDist: 150, avgLight: 0, plasmaSunPx: 0,
  pnShown: false, evN: 0, snN: 0,
  earthDbg: null, probeInfo: null,      // devtools only, see §14.4
};

/** The life-cycle fractional accumulators. */
export const life = { accB: 0, accSN: 0, accPN: 0 };

/** Frozen after boot, but historically `let`. */
export const REAL_MODE = true;          // 1
export const HIDE_NUCLEUS = true;       // 20
export const DUST_DEEP_CAP = 40.0;      // 35
export const SHOW_TRAILS = true;        // 93  (dead switch)
export const LIVE_COUNT = false;        // 123 (dead switch)
```

### 14.2 Justification for each (c) placement

| binding(s) | why it must be shared, not private |
|---|---|
| `simT` (150) | Written by `render/frame` (5254), `ui/scenarios.jumpToEpoch` (4319, 4325) and `ui/debug.applyState` (6395); read by 36 lines across `render/passes/*`, `ui/hud`, `astro/calendar`. Three writers in three target modules. → `clock.simT`. |
| `nextSample` (151) | Eleven writes in five target modules: `ui/settings.setShuttle` (3708), `ui/settings.applyTrailWindow` (3765), `ui/scenarios.jumpToEpoch` (4320, 4404), `render/frame` (5250–5275), `ui/debug.applyState` (6395). It is the trail sampler's cursor and every one of those sites resets it deliberately. → `clock.nextSample`. |
| `DT_SAMPLE` (58) | Only `applyTrailWindow` writes it (3757) but 14 lines in four modules read it, and three of those (`setShuttle`, `jumpToEpoch`, `applyState`) also write `nextSample` from it in the same statement. Splitting the pair across a module boundary would make every one of those a two-import round trip. → `clock.dtSample`, next to its partner. |
| `paused` (92) | Only one *direct* write (3780, the pause toggle), but five sections mutate it by synthesising `$('tPause').click()`: `ui/scenarios` (4402), `ui/tour` (4705, 4711), `main` visibility handler (5009, 5016), `ui/debug` (6384, 6397). The DOM click is the mutation channel and must stay so — do **not** replace it with a direct write, or the icon swap and `aria-label` at 3781–3782 stop happening. → `clock.paused` as the readable copy; the write path stays the click. |
| `coreLock` (83) | 15 write sites in `ui/sections` (spin-lock toggle, 3836), `ui/scenarios` (focus views 3862–3896), `ui/settings` (zoom presets 4333–4383), `render/camera` (dive 4503–4505) and `ui/debug` (6402). → `cam.coreLock`. |
| `followTarget` (84) | 10 write sites: the focus presets (3859–3898), `jumpToEpoch` (4294), the view toggle (4476), the dive toggle (4502). Read by `render/frame`'s follow solver. → `cam.followTarget`. |
| `reseedFollow` (161) | The worst offender: 16 writes across `ui/scenarios`, `ui/settings`, `render/camera`, `ui/debug`, and one read, in `render/frame` (5337). It is a one-shot flag raised by any section that moves the camera and lowered by the frame. An exported `let` cannot be raised from another module at all. → `cam.reseedFollow`. |
| `projMat` (144) | Written by `resize()` (4990) *and* rebuilt every frame for its near plane (5385); read by 16 draw-pass lines. Two writers in two modules once `resize` lives in `render/frame` and the passes live in `render/passes/*`. → `view.projMat`. |
| `dprCap` (145) | Written by `ui/settings.applySettings` (4234) and by `render/probe.runFirstLaunchProbe` (5236); read by `resize()` and by `saveSettingsNow`. Two writers, two modules. → `view.dprCap`. |
| `N_GXY, NEB_N, DUST_N, N_AND, N_ANDN, N_ANDD, NEB_PINK, NEB_GLOW, AND_PINK, AND_GLOW, NUC0, NUC1` (4–7, 9, 10, 14–19) | Each is written by a generator (`genGalaxy`/`genGalaxyMap`/`genAndromeda`/`genAndromedaMap`, destined for `scene/galaxy.ts` and `scene/andromeda.ts`) **and** re-written by `setGalaxy` when restoring from `gxyCache` (2060–2064, destined for `scene/cache.ts`), and read by six passes. The target layout says `scene/*` must be pure and return typed arrays — so the generators stop writing them at all and return a record instead; `setGalaxy` then publishes that record into `gfx`. That is the single change that makes twelve (c) bindings disappear. → fields of `gfx.gxy` / `gfx.and`. |
| `vaoGxy, vaoNeb, vaoDust, vaoAnd, vaoAndNeb, vaoAndDust` (31–33, 8, 11, 12) | Written by `setGalaxy` (2064–2065) and read by the passes; also deleted by the cache eviction loop (2054–2056). One writer, but they must sit beside their counts or the "which count belongs to which VAO" invariant is only in a reviewer's head. → `gfx.*.vao`. |
| `curD` (2) | Written by `setGalaxy` (2064), read by `ui/settings.saveSettingsNow` (4204), `ui/settings.applySettings` (4237), the detail slider (4514–4518), the life-cycle rates (3417–3420) and a pass (5557). One writer, five reading modules. → `gfx.curD`. |
| `accB, accSN, accPN` (80–82) | `astro/*` life stepping writes them every frame (3417–3432); `ui/scenarios.jumpToEpoch` zeroes all three at 4406 when the clock jumps. Two modules. → `life.*`. |
| `qrPos` (120) | Written by `ui/settings.applySettings` (4247) and by the overlay drag in `ui/qr` (6302); read by `saveSettingsNow` (4207). The declaration at 4201 already carries the comment *"Declared here, above the settings writer that reads it — inside the overlay's own block it was a TDZ error at boot."* Two modules write it. → keep it in `ui/settings`' saved-state object and export a `setQrPos()` from `ui/qr`; or, simpler and safer, hang it on the shared settings record. Do **not** re-privatise it into `ui/qr` — that is precisely the arrangement that crashed. |
| `keepSaved` (126) | Written only from `main.ts`'s boot tail (6166, 6169), read only by `ui/scenarios.jumpToEpoch` (4310). One writer, one reader, two modules. This is the one case where a **setter** is clearly better than a singleton field: `ui/scenarios` exports `setKeepSaved(b)` and `main.ts` brackets the staged jump with it. |

### 14.3 What must stay private behind a setter (not in `render/state.ts`)

| module | private bindings | exported accessor needed |
|---|---|---|
| `render/camera.ts` | `dragging` 85, `px` 86, `py` 87, `panCX` 89, `panCY` 90, `pinchD` 91, `holding` 88 | `isHolding()` — `render/frame` reads it once, at 5253 |
| `render/frame.ts` | `last` 152, `fpsFrames` 154, `fpsSince` 155, `lastHud` 157, `probeFrames` 165 | none |
| `render/probe.ts` | `probeInfo` 166 | none (see §14.4) |
| `scene/cache.ts` | `deepAsked` 66 | none |
| `astro/earth.ts` | `earthPhi0` 52 | none, but the lazy init must take `org` as a parameter — see H15 |
| `audio/engine.ts` | `audio` 72, `soundOn` 70, `sfxVol` 71, `unlockArmed` 76, `banksLoading` 77 | `hasAudio()`, `suspend()`, `resume()` for the visibility handler (5009–5019) |
| `audio/music.ts` | `musicOn` 73, `musicVol` 74, `trackIx` 75 | `isMusicOn()`, `pauseMusic()`, `resumeMusic()` for the same handler |
| `ui/panels.ts` | `openSeq` 119 | none |
| `ui/settings.ts` | `saveTimer` 122, `trailRefill` 112 | none |
| `ui/hud.ts` | `calMode` 124, `unitMode` 125, `barHeld` 158, `barNarrowSince` 159, `lastRGB` 135, `lastA` 136, `lastIce` 137, `lastWhite` 138, `iceShown` 139, `iceLast` 140 | `getUnitMode()` for `saveSettingsNow` (4205) |
| `ui/tooltips.ts` | `tipFor` 127, `tipTimer` 128 | `hideTip()` (already exists) |
| `ui/fullscreen.ts` | `autoFsArmed` 129, `leftFsInLandscape` 130, `rotIx` 131 | none |
| `ui/tour.ts` | `tourHeldClock` 132 | none |
| `ui/qr.ts` | `qrHeld` 121, `qrLast` 167 | none |
| `ui/debug.ts` | `debugMode` 168 | `isDebug()` for `ui/qr` (6279) |
| `main.ts` | `hiddenState` 149 | none |
| `scene/starfield.ts`, `scene/belts.ts` | 36–50 become locals of pure builders returning records | none |

### 14.4 Two write-only bindings

`earthDbg` (55, written 5802, comment: *"read by the debug tooling"*) and `probeInfo` (166, written 5237) have **zero readers in the file**. They exist to be inspected from a devtools console, which today works because a classic `<script>` puts them on the script's top-level scope. Module-scoped bindings are unreachable from the console. Behaviour-neutral for pixels, but it silently kills the debug workflow — put both on `readout` and expose `readout` on `globalThis` from `main.ts` if that workflow is to survive. Decide deliberately; do not let a bundler decide by tree-shaking them away.

---

## 15. Hazards

### Boot-order and TDZ

- **H1 — line 3591, `const $ = id => document.getElementById(id)`.** The single most load-bearing declaration in the file. `$` is a `const` arrow, not a hoisted `function`, so every one of the ~900 `$()` call sites above 3591 is a latent TDZ error and only survives because it sits inside a deferred callback. Line 3844 carries the comment: *"here, after `$` exists: `zoomStep` is hoisted, the listeners are not."* Only two `$()` textual uses appear before 3591 (3234, 3235) and both are inside callbacks. Moving `$` to `core/dom.ts` removes this constraint — which is fine, but it also removes the *signal*: after the split, code that currently could not run early will silently be able to. Re-verify boot order by execution, not by grep.
- **H2 — line 1113, `if(typeof renderLog === 'function') try{ renderLog(); }catch(e){}`.** The `try/catch` is load-bearing. `renderLog` is a hoisted function declaration (6339) and is therefore *already truthy* at line 1113, but its body calls `$` (3591). Any error logged during the first ~2,500 lines of evaluation throws a TDZ `ReferenceError` inside `renderLog` and is swallowed here. The error-log collector must keep this shape: `core/errorlog.ts` must be import-first, must not import `core/dom`, and must keep the guard **and** the `catch`.
- **H3 — line 2365, `setGalaxy(1)`.** Documented at 6157–6160: *"the initial synchronous build above is deliberately 'lowest' (D=1) to dodge a load-order trap: `setGalaxy(D>=5)` reaches for `loadGaiaDeep()`, which touches a `let` declared later in the file."* Concretely, 2066 `if(D >= 5) loadGaiaDeep()` → 3045 `if(deepAsked) return; deepAsked = true` where `deepAsked` is declared at 3042. If the boot density ever becomes ≥ 5, or if module ordering puts `scene/cache` before the Gaia loader's state, the page dies at boot. Encode this as an assertion, not a comment.
- **H4 — line 2365 again.** Documented at 2139–2140: *"`setGalaxy(1)` is called after the Andromeda section below: its constants (`R_A`, the satellite offsets) are `const` bindings the generator needs live."* `R_A` is at 2152, `M32_C`/`M110_C`/`GSS_DIR` at 2159–2161. `main.ts` must call `setGalaxy(1)` after `scene/andromeda` has evaluated.
- **H5 — line 4198–4201, `qrPos`.** *"Declared here, above the settings writer that reads it — inside the overlay's own block it was a TDZ error at boot."* One of the three deaths. Keep it out of `ui/qr`'s private scope.
- **H6 — line 4278, `seg('segUnits','words', v => { unitMode = v; })`.** The callback writes `unitMode`, declared two lines below at 4280. `seg` (4134) is safe only because of its explicit contract at 4139–4140: *"only the lit segment is set at build time: the state variables carry the same defaults, and calling `fn` this early would touch bindings not yet initialised"* — `set(initial, false)`. Any change to `seg`'s signature or to that `false` reintroduces the crash.
- **H7 — line 3784, `armsOn`.** `toggle($('tArms'), on => { armsOn = on; if(!on) armEls.forEach(...) })` writes `armsOn` (declared 4745) and reads `armEls` (declared 4754). Safe only because `toggle` (3773) *registers* rather than invokes. The same shape at 3783/3803/3804 reads `labelEls` (declared 4725).
- **H8 — other write-before-declaration sites, all inside deferred callbacks.** `hudHz` written at 3727, declared 5031. `showFps` written at 3944, declared 5030. `dprCap` written at 4234, declared 4898. `H` read at 3532/3533, declared 4898. `simT`/`nextSample` written at 3708, 3765, 4319, 4320, 4325, 4404, declared 5029. `reseedFollow` written at 3862–4499, declared 5054. `org` read at 2794, declared 5055. Every one of these becomes a legal cross-module read the moment the split happens — but each is also a place where a reviewer could wrongly conclude "this runs at boot".
- **H9 — line 6156, `restoreSettings()`.** Documented at 4218–4220: *"Deferred: replaying a saved toggle runs its handler, and some of those reach for state declared further down the file (the label elements, the simulation clock). This is called at the very end of the script, once every binding exists."* In `main.ts` this must remain in the boot tail, after every UI module has been wired.
- **H10 — line 4993, `addEventListener('resize', …); resize();`.** The top-level `resize()` is the only thing that initialises `W`, `H`, `DPR` and `projMat` and that builds the HDR framebuffer. It must run before `frame` (6428) and after `dprCap` exists.
- **H11 — the boot tail 6144–6428 is an ordered sequence.** `hadSaved` (6146) → `restoreSettings()` (6156) → the `!hadSaved` detail default (6161) → `applyTrailWindow()` (6162) → `keepSaved = hadSaved` (6166) → the staged `helix` jump (6167–6168) → `keepSaved = false` (6169) → the tour timer (6170) → `fitPanels()` (6427) → `requestAnimationFrame(frame)` (6428). No reordering is safe; several of these steps consume randomness (see below).

### Identifier shadowing that survives the move

- **H12 — `W` and `H` are shadowed** at 4627 inside `drawTourLines`: `const ns = '…', W = innerWidth, H = innerHeight, GAP = 18`. With `W`/`H` as module-level exports this shadow is legal and behaviour-identical, but a mechanical rename of `W` → `view.W` must **not** touch those two.
- **H13 — three more shadows.** `const last` at 5674 (`(showP9 ? NB : I_P9)-1`, inside the trail pass) shadows the frame timestamp `last` (5029). `const px` at 5211 (`new Uint8Array(4)`, inside `perfProbe`) shadows the pointer `px` (3506), as do `px` at 1899 and 2301. All harmless today; all traps for a rename.
- **H14 — the bare block at 1658.** See §13. The only load-bearing `var` hoisting in the file.
- **H15 — `earthPhi0`'s lazy init depends on frame state.** Lines 2790–2796 compute `earthPhi0` on the first call to `earthPrime`, reading `org` (declared 5055) with the comment *"org is the Sun now"*. The value is therefore a function of *when* `earthPrime` is first called — it is only correct because that first call happens inside `frame()` after `bodyPos(0, simT, org)` at 5288. `astro/earth.ts` is slated to be PURE (no DOM, no gl, no Math.random) — it can be, but only if `org` is passed in as a parameter and the first-call site stays exactly where it is. Do not hoist the initialisation to module evaluation; the answer would differ.

### Randomness consumed at module-evaluation time

Screenshot parity is tested with `Math.random` replaced by a seeded PRNG, so the **order and count of draws during evaluation is part of the golden image**. Every site below runs at evaluation time, not inside a deferred function. Bundler-driven reordering of module evaluation changes all of them.

| order | line(s) | what | draw count |
|---|---|---|---|
| 1 | **1658–1665** | backdrop starfield, `N_STAR = 3200` iterations | fixed, 6 draws/star (`th`, `ph`, size, `w`, `warm`, blue) |
| 2 | **2365** `setGalaxy(1)` → **1698–1877** `genGalaxy(1)` | 92,000 Milky Way stars, then nebulae (1769–1808), then dust (1812–1848) | large, fixed for a given `D`, but `gauss()` (1649) has a rejection loop (`while(!u) u = Math.random()`) and `expR` (1651) one draw — count is fixed in practice, not by construction |
| 3 | **2365** → **2163–2240** `genAndromeda(1)` | 52,000 M31 stars | fixed for a given `D` |
| 4 | **2460–2474** | asteroid belt, 1,500 bodies | **variable** — a rejection loop over the Kirkwood gaps (2464–2467) draws an unbounded number of times per body. Any upstream shift in the stream changes the whole belt, not just its start. |
| 5 | **2478–2483** | Kuiper belt, 1,600 bodies | branch-dependent (2480 vs 2481) |
| 6 | **2486–2491** | Oort shell, 2,400 bodies | fixed, 5 draws each |
| 7 | **6161** (`!hadSaved` only) | `$('detail').dispatchEvent(new Event('input'))` → 4515 `setGalaxy(DETAIL_D[1])` → a **second full** `genGalaxy` + `genAndromeda` run (cache miss on a new key) | large |

Two further sites consume randomness at a *non-deterministic* moment and are a pre-existing parity risk the refactor must not make worse:

- **1930 and 2357**, `setGalaxy(curD)` inside the `.then()` of `loadGalaxyMap()` (3051) and `loadM31Map()` (3052). When those fetches resolve, the map-based generators (`genGalaxyMap` 1941–2037, `genAndromedaMap` 2154–2281) regenerate everything with a fresh set of draws. Their position in the PRNG stream depends on network completion order. If the screenshot harness stubs or caches those fetches, that must not change; if it does not, the golden image already depends on fetch timing.

Everything else that touches `Math.random` is inside a function reached only after boot: `armSite`/`diskSite` (3394–3404, gated by `lifeOn = false`), the event/puff spawners (3424–3425), and the audio noise buffers and sample pickers (3211, 3315, 3316, 3323, 3349, 3358), all gated behind an explicit user action.

**Rule for the split:** every one of sites 1–6 must be reached from exactly one top-level statement in `main.ts`, in that order, and none of them may live at the top level of a `scene/*` module. The target layout already says `scene/*` should be pure builders taking an `Rng` — do that, and the ordering becomes an explicit argument list in `main.ts` instead of an emergent property of the import graph.

---

## 16. Cross-slice reads

Symbols this slice's read/write sites depend on but does not itself declare, grouped by the module that will own them. Any of these appearing in a `render/state.ts` import would be a layering violation — `render/state.ts` must import nothing but `astro/constants`.

`$`, `canvas`, `gl` · `errLog`, `TOUCH_DEV`, `logErr`, `renderLog`, `BUILD`, `VERSION`, `BUILD_LINE` · `perspective`, `lookAt`, `mul` · `BODIES`, `NB`, `I_P9`, `N_PLANETS`, `PHASE`, `BU`, `BV`, `AU2U`, `AGE0`, `GAL_PERIOD`, `YR_PER_SIM`, `E1`, `E2`, `EN`, `TILT`, `bodyPos`, `sunR`, `sunPhase`, `sunState`, `ageGyr`, `mergeAt`, `orbitUV`, `updateAnd`, `andPos`, `realSizes`, `dispSizes`, `EARTH_AXIS`, `EARTH_P0`, `SIDEREAL`, `earthPrime`, `humanYear`, `fmtYears` · `prog`, `sh`, `pointVAO`, `dynVAO`, `deleteVAO`, `makeBuf`, `vaoBufs`, `pPt`, `pTr`, `pSN`, `pRem`, `pDust`, `pGlobe`, `pRing`, `pTone`, `U`, `USN`, `UREM`, `UD`, `UG`, `UR`, `UT`, `emptyVAO`, `hdrExt`, `makeHDR`, `skyProjection`, `SKY_MIRROR` · `gauss`, `expR`, `N_STAR`, `AB_N`, `KB_N`, `OO_N`, `RING_SEGS`, `ARMS`, `BAR_L`, `BAR_A`, `PITCH`, `armAngle`, `R_A`, `M31_MAP_SCALE`, `M32_C`, `M110_C`, `GSS_DIR`, `genGalaxy`, `genGalaxyMap`, `genAndromeda`, `genAndromedaMap`, `setGalaxy`, `gxyCache`, `loadGaiaStars`, `loadGaiaDeep`, `loadGalaxyMap`, `loadM31Map`, `loadEarthMap`, `parseStarBin`, `vaoStars`, `vaoRing`, `DETAIL_D`, `DETAIL_NAMES` · `cam`, `panF`, `touches`, `camDirW`, `spinP`, `smoothTarget`, `smoothOfs`, `org`, `tmp`, `tmpSun`, `earthW`, `trails`, `trailBufs`, `trailVaos`, `trailAnchor`, `TRAIL_N`, `refillTrails`, `pushTrail`, `bodyPosArr`, `bodyCol`, `sunSizeTmp`, `eatSizeTmp`, `frame`, `resize`, `perfProbe`, `pickDetail`, `runFirstLaunchProbe`, `zoomStep`, `applyFocusView` · `events`, `puffs`, `SN_CAP`, `PUFF_CAP`, `snPos`, `snSize`, `snCol`, `snPh`, `snGL`, `fillEvents`, `lifeStep`, `syncLife`, `armSite`, `diskSite`, `addPuff` · `player`, `TRACKS`, `loadTrack`, `nextTrack`, `showTrack`, `setMusicVol`, `setSfxVol`, `sfx`, `armUnlock` · `PANELS`, `pState`, `panelShown`, `setPanelOpen`, `layoutPanels`, `fitPanels`, `updateBar`, `secOpen`, `S_TOG`, `S_SLD`, `S_CHK`, `SKEY`, `TOURKEY`, `hadSaved`, `saveSettings`, `saveSettingsNow`, `restoreSettings`, `applySettings`, `isOn`, `toggle`, `seg`, `statToggle`, `syncCal`, `syncLabelsMaster`, `syncZoomBtns`, `setMultExp`, `setShuttle`, `speedFromSlider`, `SPEED_YEAR`, `fmtSpeed`, `applyTrailWindow`, `jumpToEpoch`, `labelEls`, `armEls`, `placeLabel`, `setStateColour`, `tipEl`, `showTip`, `hideTip`, `isFs`, `reqFs`, `toggleFs`, `landscape`, `armAutoFs`, `ROT`, `showTour`, `drawTourLines`, `CROWDABLE`, `qrEncode`, `qrRedraw`, `qrPlace`, `QR_SCALES`, `exportState`, `applyState`, `dbgSay`, `esc`, `clock` (the `ui/errorlog` time formatter — **note the name collision with the proposed `clock` singleton; rename one of them**), `setHudTab`, `holdBarWidth`.

One concrete collision to resolve before writing `render/state.ts`: **`clock`** is already taken at line 6338 (`const clock = t => new Date(t).toTimeString().slice(0,8)`, the error-log timestamp formatter). Either name the singleton `simClock` or rename the formatter to `hhmmss`.
