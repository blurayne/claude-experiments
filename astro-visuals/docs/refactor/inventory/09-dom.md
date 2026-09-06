# 09 — DOM inventory

Source: `galactic-transit.html` @ `v2.78.0` (BUILD line 1133). Markup body lines **388–1094**; script lines **1095–6429**; stylesheet lines **17–386**.

Counts: **167** ids declared in the markup · **159** of them addressed by the script · **8** markup/CSS only · **0** addressed but missing. Plus **1** id created at runtime (`#tip`, line 4521).

The DOM access helper is a single one-liner:

```js
const $ = id => document.getElementById(id);   // line 3591
```

Everything below is keyed off it. There is no `querySelectorAll('[id]')`-style dynamic addressing anywhere; every id is reachable as a string literal, which is why the boot list at the bottom is complete rather than best-effort.

---

## 1. Ids

`declared at` is the markup line. `referenced from` lists every script line where the id appears as a string literal (this catches `$('x')`, the `S_TOG`/`S_SLD`/`S_CHK`/`SEC_BODY`/`PANELS`/`CROWDABLE`/`TOUR` tables, and `seg('segUnits', …)` — a plain `$('…')` grep misses the last four).

| id | declared at | referenced from | target module |
|---|---|---|---|
| `#gl` | 389 | 1188 | `gpu/context` |
| `#hud` | 391 | 3644, 3962, 4006, 4106, 4595, 4609, 4907 | `ui/panels` |
| `#collapse` | 392 | 4261, 4595 | `ui/panels` |
| `#hudTabs` | 394 | 6369 | `ui/debug` |
| `#logCount` | 395 | 6341 | `ui/debug` |
| `#hudBody` | 398 | 6351 | `ui/panels` |
| `#secAudio` | 400 | 4107 | `ui/sections` |
| `#musicVol` | 401 | 4155, 4159, 4195 | `audio/music` |
| `#musicVolv` | 401 | 4148 | `audio/music` |
| `#trackName` | 402 | 3234, 3235 | `audio/music` |
| `#tNext` | 402 | 4156 | `audio/music` |
| `#sfxVol` | 403 | 4182, 4195 | `audio/sfx` |
| `#sfxVolv` | 403 | 4173 | `audio/sfx` |
| `#fxBirth` | 405 | 4161, 4196 | `audio/sfx` |
| `#fxSn` | 406 | 4161, 4196 | `audio/sfx` |
| `#fxPn` | 407 | 4161, 4196 | `audio/sfx` |
| `#fxDrone` | 408 | 4161, 4196 | `audio/sfx` |
| `#secGfx` | 412 | 4107 | `ui/sections` |
| `#detail` | 413 | 4236, 4237, 4264, 4512, 5238, 6161 | `ui/settings` |
| `#detailv` | 413 | 4236, 4518 | `ui/settings` |
| `#rowGain` | 414 | 6367 | `ui/settings` |
| `#minB` | 414 | 3731, 4195 | `ui/settings` |
| `#minBv` | 414 | 3735 | `ui/settings` |
| `#coreB` | 415 | 3742, 4195 | `ui/settings` |
| `#coreBv` | 415 | 3744 | `ui/settings` |
| `#orbitA` | 416 | 3751, 4195, 4312 | `ui/settings` |
| `#orbitAv` | 416 | 3753 | `ui/settings` |
| `#trailA` | 417 | 3748, 4195, 4311 | `ui/settings` |
| `#trailAv` | 417 | 3750 | `ui/settings` |
| `#trailL` | 418 | 3768, 4195, 4313 | `ui/settings` |
| `#trailLv` | 418 | 3762 | `ui/settings` |
| `#tArms` | 420 | 3784, 3792, 3794, 3798, 4192 | `ui/settings` |
| `#tLabels` | 421 | 3783, 3792, 3793, 3797, 4192 | `ui/settings` |
| `#tEvSN` | 423 | 3818, 4193 | `ui/settings` |
| `#tEvBirth` | 424 | 3819, 4193 | `ui/settings` |
| `#tDust` | 426 | 3822, 4192 | `ui/settings` |
| `#tBelt` | 427 | 3805, 4192 | `ui/settings` |
| `#tKuiper` | 428 | 3806, 4192 | `ui/settings` |
| `#tOort` | 429 | 4192, 4267 | `ui/settings` |
| `#tDwarfs` | 430 | 3804, 4192 | `ui/settings` |
| `#tP9` | 431 | 3803, 4192 | `ui/settings` |
| `#tGaia` | 432 | 3943, 4194 | `ui/settings` |
| `#tVar` | 433 | 3820, 4193 | `ui/settings` |
| `#tZoomBtns` | 434 | 3824, 3843, 4192 | `ui/settings` |
| `#tSpinLock2` | 435 | 3838, 3840, 3841 | `ui/settings` |
| `#secHud` | 439 | 4107 | `ui/sections` |
| `#cal` | 440 | 4204, 4232, 4260, 4282, 4288 | `ui/settings` |
| `#segUnits` | 461 | 4278 | `ui/settings` |
| `#tStatAge` | 463 | 4194, 4274 | `ui/settings` |
| `#tStatGyr` | 464 | 4194, 4275 | `ui/settings` |
| `#tStatSn` | 466 | 4194, 4276 | `ui/settings` |
| `#tStatBirth` | 467 | 4194, 4277 | `ui/settings` |
| `#tFps` | 468 | 3944, 4194 | `ui/settings` |
| `#rowHudHz` | 470 | 6366 | `ui/settings` |
| `#hudHz` | 470 | 3726, 4195 | `ui/settings` |
| `#hudHzv` | 470 | 3728 | `ui/settings` |
| `#secOther` | 473 | 4107 | `ui/sections` |
| `#secSolo` | 475 | 4121, 4125, 4126, 4196 | `ui/sections` |
| `#closeOnGo` | 476 | 4196, 4414 | `ui/settings` |
| `#tLabelSteady` | 477 | 3788, 4192 | `ui/settings` |
| `#secDebugHead` | 480 | 6368 | `ui/sections` |
| `#secDebug` | 481 | 4107 | `ui/sections` |
| `#qrOn` | 483 | 4196, 6279, 6294, 6318, 6375 | `ui/qr` |
| `#qrScale` | 485 | 4195, 6285, 6323 | `ui/qr` |
| `#qrScalev` | 485 | 6323 | `ui/qr` |
| `#tView` | 487 | 3860, 3866, 3873, 3884, 3894, 3900, 4309, 4331, 4343, 4355, 4369, 4381, 4476, 4501 | `ui/scenarios` |
| `#tDive` | 488 | 3861, 3867, 3874, 3885, 3893, 3899, 4315, 4332, 4344, 4356, 4370, 4382, 4498, 6386, 6403 | `ui/scenarios` |
| `#logBody` | 490 | 6342, 6352 | `ui/debug` |
| `#logNote` | 492 | 6343 | `ui/debug` |
| `#logCopy` | 493 | 6358, 6361 | `ui/debug` |
| `#logClear` | 493 | 6357 | `ui/debug` |
| `#logList` | 495 | 6344 | `ui/debug` |
| `#tFull` | 498 | 4548, 4549 | `ui/fullscreen` |
| `#tRotate` | 499 | 4574, 4577 | `ui/fullscreen` |
| `#dbgBtn` | 501 | 3627, 6365, 6408 | `ui/debug` |
| `#tReload` | 502 | 3610, 3621 | `ui/settings` |
| `#tour` | 506 | 4701, 4709, 4716 | `ui/tour` |
| `#tourSvg` | 507 | 4624 | `ui/tour` |
| `#tourHints` | 508 | 4624 | `ui/tour` |
| `#tourCard` | 509 | 4625 | `ui/tour` |
| `#tourLogo` | 510 | **never** | `ui/tour` |
| `#tourGo` | 522 | 4708 | `ui/tour` |
| `#tourBuild` | 523 | 3594 | `ui/tour` |
| `#infoModal` | 526 | 4715, 4718, 4719, 4720 | `ui/dialogs` |
| `#infoClose` | 528 | 4719 | `ui/dialogs` |
| `#verInfo` | 529 | 3592 | `ui/dialogs` |
| `#buildInfo` | 530 | 3596 | `ui/dialogs` |
| `#buildStamp` | 530 | 3593, 5240 | `ui/dialogs` |
| `#changelogLink` | 530 | **never** | `ui/dialogs` |
| `#tourAgain` | 541 | 4715 | `ui/dialogs` |
| `#yrs` | 543 | 6117 | `ui/dialogs` |
| `#pct` | 543 | 6118 | `ui/dialogs` |
| `#evoBand` | 802 | **never** | `ui/dialogs` |
| `#evoClip` | 806 | **never** | `ui/dialogs` |
| `#gamebar` | 1003 | 3909, 4208, 4246, 4270, 4613, 4905, 5039, 6091 | `ui/hud` |
| `#barGrip` | 1004 | 3909 | `ui/hud` |
| `#cDeath` | 1005 | 4269, 4276 | `ui/hud` |
| `#lDeath` | 1005 | **never** | `ui/hud` |
| `#nDeath` | 1005 | 6027, 6033 | `ui/hud` |
| `#sCal` | 1006 | 4269, 4284 | `ui/hud` |
| `#lCal` | 1006 | 4286 | `ui/hud` |
| `#gCal` | 1006 | 6133 | `ui/hud` |
| `#sAge` | 1007 | 4269, 4274 | `ui/hud` |
| `#gAge` | 1007 | 6136 | `ui/hud` |
| `#sGyr` | 1008 | 4269, 4275 | `ui/hud` |
| `#lGyr` | 1008 | 6141, 6144 | `ui/hud` |
| `#gGyr` | 1008 | 6142, 6145 | `ui/hud` |
| `#cBirth` | 1009 | 4269, 4277 | `ui/hud` |
| `#lBirth` | 1009 | **never** | `ui/hud` |
| `#nBirth` | 1009 | 6028, 6034 | `ui/hud` |
| `#reopen` | 1012 | 3962, 4262 | `ui/panels` |
| `#tPause` | 1013 | 3780, 3781, 3782, 4014, 4322, 4337, 4349, 4363, 4375, 4402, 4705, 4711, 4721, 5010, 5016, 6397 | `render/camera` |
| `#tInfo` | 1014 | 4014, 4611, 4718 | `ui/dialogs` |
| `#envPlus` | 1015 | 3961 | `ui/panels` |
| `#zoomIn` | 1016 | 3823, 3844, 4014, 4612 | `render/camera` |
| `#zoomOut` | 1017 | 3823, 3845, 4014 | `render/camera` |
| `#tLabelsAll` | 1018 | 3792, 3796, 4014, 4610 | `ui/hud` |
| `#simPanel` | 1019 | 3960, 4414, 4608 | `ui/panels` |
| `#speed` | 1022 | 3721, 4195, 4304 | `render/camera` |
| `#speedv` | 1022 | 3688 | `render/camera` |
| `#multExp` | 1023 | 3693, 3697, 4263 | `render/camera` |
| `#multExpv` | 1023 | 3694 | `render/camera` |
| `#shuttle` | 1024 | 3709, 3712 | `render/camera` |
| `#shuttlev` | 1024 | 3710 | `render/camera` |
| `#shuttleReset` | 1024 | 3713 | `render/camera` |
| `#jump` | 1025 | 4295, 4409, 6167, 6168 | `ui/scenarios` |
| `#jumpGo` | 1043 | 4410 | `ui/scenarios` |
| `#simPlus` | 1045 | 3960 | `ui/panels` |
| `#fpsBox` | 1046 | 3944, 4026, 4905 | `ui/hud` |
| `#fpsVal` | 1046 | 6121 | `ui/hud` |
| `#iceBox` | 1047 | 6101 | `ui/hud` |
| `#g710Box` | 1048 | 6101 | `ui/hud` |
| `#eG710d` | 1048 | 6112 | `ui/hud` |
| `#dbgCard` | 1049 | 6409, 6414 | `ui/debug` |
| `#dbgClose` | 1054 | 6414 | `ui/debug` |
| `#dbgText` | 1057 | 6411, 6416, 6418, 6421, 6425 | `ui/debug` |
| `#dbgExport` | 1061 | 6415 | `ui/debug` |
| `#dbgImport` | 1062 | 6417 | `ui/debug` |
| `#dbgCopy` | 1063 | 6420 | `ui/debug` |
| `#dbgPaste` | 1064 | 6423 | `ui/debug` |
| `#dbgMsg` | 1066 | 6407 | `ui/debug` |
| `#scaleNote` | 1069 | 4905 | `ui/hud` |
| `#sScale` | 1069 | 6126 | `ui/hud` |
| `#env` | 1070 | 3961, 4607, 4704, 4710, 6054 | `ui/panels` |
| `#envMin` | 1071 | **never** | `ui/panels` |
| `#eSunPhaseRow` | 1073 | 6052 | `ui/hud (env readout)` |
| `#eSunPhase` | 1073 | 6065 | `ui/hud (env readout)` |
| `#eSunSizeRow` | 1074 | 6052 | `ui/hud (env readout)` |
| `#eSunSize` | 1074 | 6067 | `ui/hud (env readout)` |
| `#eMeanRow` | 1075 | 6069, 6070 | `ui/hud (env readout)` |
| `#eMean` | 1075 | 6072, 6077 | `ui/hud (env readout)` |
| `#eRangeRow` | 1076 | 6053 | `ui/hud (env readout)` |
| `#eMin` | 1076 | 6073, 6078 | `ui/hud (env readout)` |
| `#eMax` | 1076 | 6074, 6079 | `ui/hud (env readout)` |
| `#eCRRow` | 1077 | 6053 | `ui/hud (env readout)` |
| `#eCR` | 1077 | 6080 | `ui/hud (env readout)` |
| `#eSLRow` | 1078 | 6053 | `ui/hud (env readout)` |
| `#eSL` | 1078 | 6081 | `ui/hud (env readout)` |
| `#eSunRow` | 1079 | **never** | `ui/hud (env readout)` |
| `#eSun` | 1079 | 6056, 6058 | `ui/hud (env readout)` |
| `#eLifeRow` | 1080 | 6053 | `ui/hud (env readout)` |
| `#eLife` | 1080 | 6083 | `ui/hud (env readout)` |
| `#focusSel` | 1085 | 3846, 3857, 3905, 4206, 4239, 4265, 4396 | `render/camera` |
| `#focusGo` | 1086 | 3906 | `render/camera` |
| `#tSpinLock` | 1088 | 3831, 3841, 4192, 4399 | `render/camera` |
| `#labels` | 1092 | 4724 | `render/labels **(new)**` |
| `#qrOverlay` | 1093 | 6272, 6278, 6298 | `ui/qr` |

### Ids addressed only through a table, not through a literal `$('…')` call

These are the ones a naive grep loses, and they are exactly the shape that killed v2.60.0 — the id lives in a data structure far from the element that consumes it.

| table | line | ids |
|---|---|---|
| `PANELS` (`.id` / `.dot`) | 3959–3963 | `simPanel`/`simPlus`, `env`/`envPlus`, `hud`/`reopen` |
| `SEC_BODY` | 4107 | `secAudio`, `secGfx`, `secHud`, `secOther`, `secDebug` |
| `S_TOG` | 4192–4194 | `tLabels`, `tArms`, `tLabelSteady`, `tZoomBtns`, `tSpinLock`, `tDwarfs`, `tP9`, `tBelt`, `tKuiper`, `tOort`, `tDust`, `tEvSN`, `tEvBirth`, `tVar`, `tStatAge`, `tStatGyr`, `tStatSn`, `tStatBirth`, `tGaia`, `tFps` |
| `S_SLD` | 4195 | `speed`, `trailA`, `orbitA`, `trailL`, `musicVol`, `sfxVol`, `minB`, `hudHz`, `coreB`, `qrScale` |
| `S_CHK` | 4196 | `fxBirth`, `fxSn`, `fxPn`, `fxDrone`, `secSolo`, `closeOnGo`, `qrOn` |
| stat toggles (inline array) | 4269 | `sCal`, `sAge`, `sGyr`, `cDeath`, `cBirth` |
| `statToggle` second argument | 4274–4277 | `sAge`, `sGyr`, `cDeath`, `cBirth` |
| fx pair list | 4161 | `fxBirth`, `fxSn`, `fxPn`, `fxDrone` |
| `CROWDABLE` | 4905 | `fpsBox`, `scaleNote`, `gamebar` |
| tour steps (`t:`) | 4607–4613 | `env`, `simPanel`, `hud`, `tLabelsAll`, `tInfo`, `zoomIn`, `gamebar` |
| `syncZoomBtns` inline array | 3823 | `zoomIn`, `zoomOut` |
| Sun-vs-Earth row swap | 6052–6053 | `eSunPhaseRow`, `eSunSizeRow` / `eRangeRow`, `eCRRow`, `eSLRow`, `eLifeRow` |
| alert stacking | 6101 | `iceBox`, `g710Box` |
| `seg(id, …)` | 4278 | `segUnits` |

---

## 2. Classes

`declared at` is the markup line, `runtime` means the class is only ever put on by JS, `CSS only` means it appears in the stylesheet and nowhere else.

| class | declared at | referenced from | target module |
|---|---|---|---|
| `.act` | 1013, 1014, 1016, 1017, 1018 | 3823 | `styles/panels + ui/panels` |
| `.actsep` | CSS only | **never** | `styles/panels + ui/sections` |
| `.alertbox` | 1047, 1048 | **never** | `styles/hud + ui/hud` |
| `.armlbl` | runtime | 4755, 4766, 4771 | `styles/base + render/labels (new)` |
| `.arw` | 399, 411, 438, 472, 480 | **never** | `styles/panels + ui/sections` |
| `.birth` | 1009 | **never** | `styles/hud + ui/hud` |
| `.body` | 398, 490 | **never** | `styles/panels + ui/panels` |
| `.brk` | 1010 | **never** | `styles/hud + ui/hud` |
| `.chk` | 405, 406, 407, 408, 420, 421… | **never** | `styles/panels + ui/sections` |
| `.chks` | 404, 425, 465, 474, 482 | **never** | `styles/panels + ui/sections` |
| `.closed` | 481 | 4113, 4114 | `styles/panels + ui/sections` |
| `.cnt` | 1005, 1009 | **never** | `styles/hud + ui/hud` |
| `.crowded` | runtime | 4909, 4918 | `styles/hud + ui/hud` |
| `.dbg-b` | 1061, 1062, 1063, 1064 | **never** | `styles/panels + ui/debug` |
| `.death` | 1005 | **never** | `styles/hud + ui/hud` |
| `.drag` | runtime | 4071, 4079 | `styles/panels + ui/panels` |
| `.dragging` | runtime | 3521, 3544 | `styles/panels + ui/panels` |
| `.env` | 1019, 1070 | **never** | `styles/panels + ui/panels` |
| `.envsep` | 1081 | **never** | `styles/hud + ui/hud` |
| `.er` | 1073, 1074, 1075, 1076, 1077, 1078… | **never** | `styles/hud + ui/hud` |
| `.error` | CSS only | **never** | `styles/panels + ui/debug` |
| `.evo-age` | 768, 769, 770, 771, 772, 773… | **never** | `styles/dialogs + ui/dialogs` |
| `.evo-avg` | 836, 877 | **never** | `styles/dialogs + ui/dialogs` |
| `.evo-axis` | 810, 812, 814, 816, 818, 820… | **never** | `styles/dialogs + ui/dialogs` |
| `.evo-band` | 833 | **never** | `styles/dialogs + ui/dialogs` |
| `.evo-chart` | 800 | **never** | `styles/dialogs + ui/dialogs` |
| `.evo-chart-wrap` | 800 | **never** | `styles/dialogs + ui/dialogs` |
| `.evo-frame` | 831 | **never** | `styles/dialogs + ui/dialogs` |
| `.evo-grid` | 809, 811, 813, 815, 817, 819… | **never** | `styles/dialogs + ui/dialogs` |
| `.evo-lbl` | 846, 849, 852, 855, 858, 861… | **never** | `styles/dialogs + ui/dialogs` |
| `.evo-lead` | 844, 847, 850, 853, 856, 859… | **never** | `styles/dialogs + ui/dialogs` |
| `.evo-legend` | 874 | **never** | `styles/dialogs + ui/dialogs` |
| `.evo-max` | 834, 876 | **never** | `styles/dialogs + ui/dialogs` |
| `.evo-min` | 835, 878 | **never** | `styles/dialogs + ui/dialogs` |
| `.evo-mk` | 845, 848, 851, 854, 857, 860… | **never** | `styles/dialogs + ui/dialogs` |
| `.evo-table` | 764 | **never** | `styles/dialogs + ui/dialogs` |
| `.evo-title` | 808 | **never** | `styles/dialogs + ui/dialogs` |
| `.evo-today` | 838 | **never** | `styles/dialogs + ui/dialogs` |
| `.evo-today-lbl` | 839 | **never** | `styles/dialogs + ui/dialogs` |
| `.evo-whisker` | 840, 841, 842 | **never** | `styles/dialogs + ui/dialogs` |
| `.evo-whisker-lbl` | 843 | **never** | `styles/dialogs + ui/dialogs` |
| `.evo-wrap` | 764 | **never** | `styles/dialogs + ui/dialogs` |
| `.flash10` | CSS only | **never** | `styles/panels + ui/debug` |
| `.flash3` | runtime | 3645 | `styles/panels + ui/debug` |
| `.g710` | runtime | 6087 | `styles/hud + ui/hud` |
| `.gamebar` | 1003 | **never** | `styles/hud + ui/hud` |
| `.hint` | runtime | 4637 | `styles/dialogs + ui/tour` |
| `.hud` | 391 | **never** | `styles/panels + ui/panels` |
| `.hudfoot` | 497 | **never** | `styles/panels + ui/sections` |
| `.hudlink` | 530 | **never** | `styles/dialogs + ui/dialogs` |
| `.ice` | runtime | 6085 | `styles/hud + ui/hud` |
| `.ico` | 1012, 1013, 1018, 1045 | 3777, 3778 | `styles/panels + ui/panels` |
| `.indent` | 404, 425, 465 | **never** | `styles/panels + ui/sections` |
| `.info` | 413, 414, 415, 416, 417, 418… | 4535 | `styles/base + ui/tooltips` |
| `.info-body` | 533 | **never** | `styles/dialogs + ui/dialogs` |
| `.info-card` | 527 | **never** | `styles/dialogs + ui/dialogs` |
| `.info-sub` | 530 | **never** | `styles/dialogs + ui/dialogs` |
| `.intro` | 512, 515, 520, 534, 539 | **never** | `styles/dialogs + ui/dialogs` |
| `.lbl` | runtime | 4726, 4729, 4739, 4814 | `styles/base + render/labels (new)` |
| `.load` | CSS only | **never** | `styles/panels + ui/debug` |
| `.logempty` | runtime | 6347 | `styles/panels + ui/debug` |
| `.logrow` | runtime | 6345 | `styles/panels + ui/debug` |
| `.long` | 515, 520 | **never** | `styles/dialogs + ui/dialogs` |
| `.meta` | runtime | 6345 | `styles/panels + ui/debug` |
| `.mults` | CSS only | **never** | `styles/panels + ui/sections` |
| `.note` | 1069 | **never** | `styles/hud + ui/hud` |
| `.on` | 396, 1013, 1018 | 3772, 3775, 3792, 3860, 3861, 3866, 3867, 3873… | `styles/panels + ui/panels` |
| `.pclose` | 392, 1020, 1071 | 4596 | `styles/panels + ui/panels` |
| `.pdot` | 1012, 1013, 1014, 1015, 1016, 1017… | 4099 | `styles/panels + ui/panels` |
| `.plain` | 1088 | **never** | `styles/panels + ui/sections` |
| `.pnl` | 1019 | **never** | `styles/panels + ui/panels` |
| `.pop` | runtime | 3979, 3980 | `styles/panels + ui/panels` |
| `.row` | 401, 402, 403, 413, 414, 415… | **never** | `styles/panels + ui/sections` |
| `.rowbtn` | 402, 493, 493, 541, 1043, 1086 | **never** | `styles/panels + ui/sections` |
| `.sbody` | 400, 412, 439, 473, 481 | **never** | `styles/panels + ui/sections` |
| `.sect` | 399, 411, 438, 472, 480 | 4114, 4118 | `styles/panels + ui/sections` |
| `.seg` | 461 | **never** | `styles/panels + ui/sections` |
| `.short` | 512 | **never** | `styles/dialogs + ui/dialogs` |
| `.simPanelWide` | 1019 | **never** | `styles/panels + ui/panels` |
| `.slid` | runtime | 3922, 3939, 3941, 4208, 4246, 6092 | `styles/hud + ui/hud` |
| `.stat` | 1006, 1007, 1008 | **never** | `styles/hud + ui/hud` |
| `.stats` | 542 | **never** | `styles/dialogs + ui/dialogs` |
| `.stepb` | 401, 401, 403, 403, 413, 413… | 3714 | `styles/panels + ui/sections` |
| `.sub` | CSS only | **never** | `styles/panels + ui/sections` |
| `.tab` | 395, 396 | 6353, 6356 (via `#hudTabs .tab`) | `styles/panels + ui/panels` |
| `.tabs` | 394 | **never** | `styles/panels + ui/debug` |
| `.tg` | 498, 499 | **never** | `styles/panels + ui/sections` |
| `.toggles` | CSS only | **never** | `styles/panels + ui/sections` |
| `.ver` | 529 | **never** | `styles/dialogs + ui/dialogs` |
| `.warn` | CSS only | **never** | `styles/panels + ui/debug` |

### Classes whose name is data, not a literal

`renderLog` (6345) builds `class="logrow <e.kind>"`, where `e.kind` comes from `logErr` (1107) and is one of `load` (1118), `error` (1119), `promise` (1122), `warn`/`error` (1124). The stylesheet colours three of them at line 351 (`.logrow.error`, `.logrow.warn`, `.logrow.load`). There is no `.logrow.promise` rule — a promise rejection renders with the default border. Grepping for `'error'` as a class name finds nothing; this pairing has to be preserved by hand when `styles/panels` and `ui/debug` are split apart.

`flash3` / `flash10` (3645) are applied through a variable `cls`, from the call sites at 3636 / 3639.

### Dead CSS (safe to note, do NOT delete during the structural move)

`.hud .sub` (53), `.toggles` (61), `.actsep` (91), `.mults` (118–122, 192). Four rule groups with no element in the markup and no `classList` call. Deleting them is a behaviour-neutral cleanup but it is *not* this refactor — it would change the emitted stylesheet bytes, and the screenshot gate cannot prove a negative. Move them verbatim into `styles/panels` and delete in a follow-up.

### Data attributes (the other half of the DOM contract)

| attribute | markup lines | read at | notes |
|---|---|---|---|
| `data-tab` | 395, 396 | 6353, 6356 | `log` \| `set` |
| `data-sec` | 399, 411, 438, 472, 480 | 4114, 4118 | keys must match `SEC_BODY` (4107) |
| `data-step` | 22 sites | 3714–3719 | `"<sliderId>:<delta>"` — **embeds slider ids in a string**; `musicVol`, `sfxVol`, `detail`, `minB`, `coreB`, `orbitA`, `trailA`, `trailL`, `hudHz`, `speed`, `multExp` |
| `data-tip` | 21 sites | 4529 | `ui/tooltips` |
| `data-v` | 461 | 4136, 4138 | `words` \| `sup` \| `e` |
| `data-open` | 1012, 1015, 1045 | 4099–4100 | values are panel ids |
| `data-close` | 1020, 1071 | 4596–4597 | values are panel ids |
| `data-rate`, `data-mult` | 10 `<option>`s each, 1026–1042 | scenario jump | `ui/scenarios` |

`data-step` deserves a call-out: it is a *third* place slider ids are written down (markup string, `S_SLD` array, `$('…')` call). A slider renamed or moved without updating all three fails silently — the ± buttons stop working and nothing throws.

---

## 3. THE LIST — boot assertion array

Every id the script addresses by name, grouped by the module that should own it. Paste into a boot test that asserts each one resolves *after* `main.ts` has run.

```ts
// 159 ids, every one the script addresses by name. Grouped by target module.
export const BOOT_IDS = [
  // audio/music
  'musicVol', 'musicVolv', 'tNext', 'trackName',
  // audio/sfx
  'fxBirth', 'fxDrone', 'fxPn', 'fxSn', 'sfxVol', 'sfxVolv',
  // gpu/context
  'gl',
  // render/camera
  'focusGo', 'focusSel', 'multExp', 'multExpv', 'shuttle', 'shuttleReset', 'shuttlev', 'speed',
  'speedv', 'tPause', 'tSpinLock', 'zoomIn', 'zoomOut',
  // render/labels **(new)**
  'labels',
  // ui/debug
  'dbgBtn', 'dbgCard', 'dbgClose', 'dbgCopy', 'dbgExport', 'dbgImport', 'dbgMsg', 'dbgPaste',
  'dbgText', 'hudTabs', 'logBody', 'logClear', 'logCopy', 'logCount', 'logList', 'logNote',
  // ui/dialogs
  'buildInfo', 'buildStamp', 'infoClose', 'infoModal', 'pct', 'tInfo', 'tourAgain', 'verInfo',
  'yrs',
  // ui/fullscreen
  'tFull', 'tRotate',
  // ui/hud
  'barGrip', 'cBirth', 'cDeath', 'eG710d', 'fpsBox', 'fpsVal', 'g710Box', 'gAge', 'gCal',
  'gGyr', 'gamebar', 'iceBox', 'lCal', 'lGyr', 'nBirth', 'nDeath', 'sAge', 'sCal', 'sGyr',
  'sScale', 'scaleNote', 'tLabelsAll',
  // ui/hud (env readout)
  'eCR', 'eCRRow', 'eLife', 'eLifeRow', 'eMax', 'eMean', 'eMeanRow', 'eMin', 'eRangeRow', 'eSL',
  'eSLRow', 'eSun', 'eSunPhase', 'eSunPhaseRow', 'eSunSize', 'eSunSizeRow',
  // ui/panels
  'collapse', 'env', 'envPlus', 'hud', 'hudBody', 'reopen', 'simPanel', 'simPlus',
  // ui/qr
  'qrOn', 'qrOverlay', 'qrScale', 'qrScalev',
  // ui/scenarios
  'jump', 'jumpGo', 'tDive', 'tView',
  // ui/sections
  'secAudio', 'secDebug', 'secDebugHead', 'secGfx', 'secHud', 'secOther', 'secSolo',
  // ui/settings
  'cal', 'closeOnGo', 'coreB', 'coreBv', 'detail', 'detailv', 'hudHz', 'hudHzv', 'minB',
  'minBv', 'orbitA', 'orbitAv', 'rowGain', 'rowHudHz', 'segUnits', 'tArms', 'tBelt', 'tDust',
  'tDwarfs', 'tEvBirth', 'tEvSN', 'tFps', 'tGaia', 'tKuiper', 'tLabelSteady', 'tLabels',
  'tOort', 'tP9', 'tReload', 'tSpinLock2', 'tStatAge', 'tStatBirth', 'tStatGyr', 'tStatSn',
  'tVar', 'tZoomBtns', 'trailA', 'trailAv', 'trailL', 'trailLv',
  // ui/tour
  'tour', 'tourBuild', 'tourCard', 'tourGo', 'tourHints', 'tourSvg',
];

// declared in the markup, never addressed by the script (8) — CSS / markup-driven only
export const MARKUP_ONLY_IDS = [
  'changelogLink', 'eSunRow', 'envMin', 'evoBand', 'evoClip', 'lBirth', 'lDeath', 'tourLogo',
];
```

Suggested test:

```ts
import { BOOT_IDS, MARKUP_ONLY_IDS } from './boot-ids';

test('every id the script addresses exists in the DOM', () => {
  const missing = [...BOOT_IDS, ...MARKUP_ONLY_IDS].filter(id => !document.getElementById(id));
  expect(missing).toEqual([]);
});

test('no id is declared twice', () => {
  const seen = new Set<string>(), dupes: string[] = [];
  for (const el of document.querySelectorAll('[id]'))
    seen.has(el.id) ? dupes.push(el.id) : seen.add(el.id);
  expect(dupes).toEqual([]);
});

// the inverse guard: markup grew an id nobody owns
test('the markup declares nothing outside the inventory', () => {
  const known = new Set([...BOOT_IDS, ...MARKUP_ONLY_IDS, 'tip']);   // #tip is created at 4521
  const extra = [...document.querySelectorAll('[id]')].map(e => e.id).filter(id => !known.has(id));
  expect(extra).toEqual([]);
});
```

`#tip` is excluded from `BOOT_IDS` because `ui/tooltips` creates it at line 4521 (`document.createElement('div'); tipEl.id = 'tip'`) — it does not exist until that module has been evaluated. If the boot test runs after `main.ts`, add it; if it runs against raw markup, do not.

Elements created at runtime with no id, only a class: `.hint` (4636, `ui/tour`), `.lbl` (4726, 4729, 4739, 4814) and `.armlbl` (4755, 4766, 4771) — the label pool, which has no home in the proposed layout (see hazards).

---

## 4. Referenced-but-absent / declared-but-unreferenced

**Referenced by JS, absent from the markup: none.** The current file is internally consistent; every string literal that looks like an id resolves.

**Declared in the markup, never addressed by the script (8):**

| id | line | why it exists | risk if moved |
|---|---|---|---|
| `#changelogLink` | 530 | a plain `<a href>` in the About card | none — pure markup |
| `#tourLogo` | 510 | styled by `#tourLogo` at CSS 221, 239, 243 | **breaks silently** — id is a CSS hook, not a JS hook |
| `#envMin` | 1071 | styled at CSS 291; behaviour comes from `data-close="env"` via `.pclose[data-close]` (4596) | **breaks silently** — CSS hook |
| `#eSunRow` | 1079 | the one Earth row that is never hidden — it has no entry in either list at 6052/6053 | none, but it is the odd one out; keep it out of both arrays |
| `#lDeath` | 1005 | static label text inside `#cDeath` | none |
| `#lBirth` | 1009 | static label text inside `#cBirth` | none |
| `#evoBand` | 802 | SVG `<linearGradient>`, referenced as `fill="url(#evoBand)"` at 833 | **breaks silently** — intra-SVG reference, and it is document-global: two copies of the chart would collide |
| `#evoClip` | 806 | SVG `<clipPath>`, referenced as `clip-path="url(#evoClip)"` at 832 | same |

`#lCal` and `#lGyr` sit in the same position as `#lDeath`/`#lBirth` but *are* written to (4286, 6141–6145), so do not assume the `l*` prefix means "static".

---

## 5. Hazards

### 5.1 The error-log collector must not acquire an import

Line **1113**:

```js
if(typeof renderLog === 'function') try{ renderLog(); }catch(e){}
```

This works today only because `renderLog` is a *hoisted function declaration* at line **6339**, 5 226 lines below. `typeof` on an undeclared name is safe; `typeof` on a `let`/`const`/`class` in its TDZ, or on an **uninitialised ES module import binding, throws `ReferenceError`**. So:

- `core/errorlog` must **not** `import { renderLog } from '../ui/debug'`. If it does, the very first error logged before `ui/debug` finishes evaluating throws inside the error handler — the exact failure mode this guard was written to prevent, restored by the refactor.
- Keep it as a mutable registration: `let logRenderer = null; export const setLogRenderer = f => logRenderer = f;` and have `ui/debug` call `setLogRenderer(renderLog)` at its own evaluation time. `if (logRenderer) try { logRenderer(); } catch {}` reproduces the current semantics exactly, including the swallow.
- `core/errorlog` must also be the **first** import in `main.ts`, and must import nothing but itself. `TOUCH_DEV` (1104), `errLog` (1106), `logErr` (1107) and the three `addEventListener` registrations (1116, 1121, 1124) all have to be live before `gpu/context` runs, because line 1190 can `throw new Error('no webgl2')` and the log has to catch it.
- The `console.error`/`console.warn` monkey-patch at 1123–1131 wraps the global console. If a module evaluated earlier caches `console.error`, it bypasses the log. Nothing does today; keep it that way.

### 5.2 TDZ: `$` is declared 2 400 lines after its first use site is *registered*

| line | what | risk |
|---|---|---|
| **3591** | `const $ = id => document.getElementById(id)` — the declaration | — |
| **3234** | `player.addEventListener('error', () => { $('trackName')… })` | the listener is registered 357 lines **above** `const $`. Today the `Audio` element never errors that fast. Once `audio/music` and `core/dom` are separate modules, a `preload`/`src` error firing before `core/dom` is evaluated is a `ReferenceError` on a TDZ binding. Make `audio/music` `import { $ } from '../core/dom'` and put `core/dom` above it in `main.ts`'s import order. |
| **1188** | `document.getElementById('gl')` — written out longhand, *before* `$` exists | this is the one place the helper is not used. It is not a bug; it is evidence someone already hit this. `gpu/context` must not be rewritten to use `$` unless `core/dom` is imported first. |
| **3844–3845** | ```$('zoomIn').addEventListener('click', () => zoomStep(-1));   // here, after $ exists: zoomStep is hoisted, the listeners are not``` | the comment is a scar from a previous boot death. Preserve the *position* of these two registrations relative to `zoomStep`'s declaration, or convert to an explicit `initCamera()` call from `main.ts`. |

### 5.3 Forward references that survive today only because of function hoisting

All of these are called from a line above their `function` declaration. Within one classic script that is fine. Across ES modules, a *function declaration* export is still hoisted within its own module, but the **binding is only initialised when the exporting module is evaluated** — so if `main.ts`'s import graph puts the caller's module first, the call throws.

| callee | declared | called from (earlier line) | note |
|---|---|---|---|
| `fitPanels` | 4906 | 3824, 3944, 3982, 4088 | `ui/panels` ← `ui/settings`, `ui/hud` |
| `layoutPanels` | 4045 | 3824, 3982 | same |
| `saveSettings` | **4217, `const`** | 3801, 3903, 3926, 3982, 4088, 4123, 4130, 4138, 4159 | **arrow function in a `const` — a genuine TDZ binding, not hoisted.** Every one of the nine call sites is inside a callback today, so nothing fires before 4217. If any of them becomes a module-evaluation-time call, this throws. |
| `applySecs` | 4111 | 3801, 4123, 4130, 6373 | 6373 is reached from the top-level `if(DEBUG) setDebugUI(…)` at 6378 |
| `updateBar` | 4268 | 4273, 4285 | |
| `setDebugUI` | 6363 | 3628 (inside a click handler), **6378 (top level)** | |
| `renderLog` | 6339 | **1113** | see 5.1 |
| `setStateColour` | 4847 | 6114 | |
| `qrRedraw` | ~6270 | 6294, 6323, 6324 | |
| `zoomStep` | — | 3844, 3845 | already annotated in-source |
| `DBGKEY` | **6325, `const`** | 3630, 3634 | inside a callback; TDZ if hoisted into a top-level path |
| `DEBUG` | **6326, `const`** | 6378 | top-level, but declared 52 lines earlier — safe as long as `ui/debug` stays one module |
| `labelEls` / `armEls` | **4725 / 4754, `const`** | 3783, 3784, 3803, 3804 | four `toggle()` callbacks close over label arrays declared 940 lines later. Fine today; a TDZ error the moment any of those toggles is fired during boot — and `restoreSettings` (6156) **does** dispatch `change` on them. It currently works only because 6156 > 4754. |

The `labelEls` case is the sharpest: `restoreSettings()` at **6156** calls `$(id).click()` / `.dispatchEvent(new Event('change'))` on saved toggles (4227, 4229, 4231), which runs the 3783/3784/3803/3804 callbacks, which read `labelEls`/`armEls`. The whole thing is a load-bearing line-ordering coincidence.

### 5.4 Boot order — the top-level DOM sequence that must not be permuted

`main.ts` has to reproduce this literal order. Each of these executes at module-evaluation time and touches the DOM or mutates state that later steps read.

| # | line | statement | why the position matters |
|---|---|---|---|
| 1 | 1104–1131 | error-log collector + listeners | must precede everything that can throw |
| 2 | 1188–1190 | `getElementById('gl')`, WebGL2 probe, `document.body.innerHTML = …` on failure | **rewrites the whole body** on failure, destroying every id below; the `throw` is caught by step 1 |
| 3 | 3592–3596 | version / build stamps into `#verInfo`, `#buildStamp`, `#tourBuild`, `#buildInfo` | first use of `$` |
| 4 | 3620–3660 | `#tReload` tap counter block | |
| 5 | 3688–3768 | slider `input` listeners (`speed`, `multExp`, `shuttle`, `hudHz`, `minB`, `coreB`, `trailA`, `orbitA`, `trailL`) | **must be registered before step 20** |
| 6 | 3714 | `document.querySelectorAll('.stepb')` ± buttons | reads `data-step` |
| 7 | 3722 | `speed = speedFromSlider(SPEED_YEAR); fmtSpeed()` | seeds the speed *before* any restore |
| 8 | 3780–3824 | `toggle()` bindings for every visual switch | **must be registered before step 20** |
| 9 | 3795 | `syncLabelsMaster()` | reads `#tLabels`/`#tArms` `checked` **defaults from the markup** |
| 10 | 3843 | `syncZoomBtns($('tZoomBtns').checked)` | same — markup `checked` is the source of truth |
| 11 | 3844–3845 | zoom button listeners | |
| 12 | 3905–3943 | `#focusSel`/`#focusGo`, `#gamebar`/`#barGrip` slide block, `tGaia`, `tFps` | |
| 13 | 4054, 4099, 4118 | panel drag wiring, `.pdot[data-open]`, `.sect[data-sec]` | |
| 14 | 4155–4185 | audio listeners + `loadTrack(0)` | |
| 15 | 4254 | `applySecs()` | opens the default section |
| 16 | 4267–4288 | `tOort`, four `statToggle`s, `updateBar()`, `#cal` listener | `updateBar` reads the five stat rows' inline `display` |
| 17 | 4497 | `setBodySizes()` | |
| 18 | 4721 | `if(prefers-reduced-motion) $('tPause').click()` | synthesises a click, running the 3780 callback |
| 19 | 4993 | `addEventListener('resize', …); resize()` | |
| 20 | **6156** | `restoreSettings()` | replays saved values by **dispatching synthetic `input`/`change` events** (4227/4229/4231) and `.click()` — every listener from steps 5, 8, 12, 14, 16 must already exist or the setting is silently dropped |
| 21 | 6161 | `if(!hadSaved){ $('detail').value = 1; dispatchEvent('input') }` | first-run detail default → **decides the star count**, so it decides the screenshot |
| 22 | 6162 | `applyTrailWindow()` | |
| 23 | 6166–6169 | `keepSaved = true; $('jump').value='helix'; dispatchEvent('change'); keepSaved = false` | the `keepSaved` flag brackets the dispatch — if the handler becomes async this breaks |
| 24 | 6170 | `setTimeout(showTour, 400)` on first run | |
| 25 | 6294–6324 | QR listeners + `setInterval(qrRedraw, 1000)` | |
| 26 | 6356–6358 | log tab listeners | |
| 27 | **6378** | `if(DEBUG) setDebugUI(true, …)` | calls `applySecs()` (6373) |
| 28 | **6427** | `fitPanels()` | final layout pass |
| 29 | **6428** | `requestAnimationFrame(frame)` | |

Steps 20–23 are the fragile core: **eight** synthetic events are dispatched at module-evaluation time, and every one is a no-op-with-no-error if its listener has not been registered yet. A bundler that hoists `ui/settings` above `ui/hud` produces a page that boots clean, throws nothing, logs nothing — and renders with default settings instead of saved ones. That is a screenshot diff with no stack trace.

**Mitigation:** do not let module evaluation order carry this. Give every ui module an explicit `initX()` and call them from `main.ts` in the numbered order above, so the ordering is data in one file rather than an emergent property of the import graph.

### 5.5 Structural coupling that a "move only" refactor can still break

- **6054** — `$('env').querySelector('h2').textContent = lost ? 'The Sun' : 'Earth'`. Positional: it takes the *first* `<h2>` inside `#env` (markup line 1072). Adding any heading above it, or wrapping the panel body, retargets the write. Give it an id (`#envTitle`) **after** the refactor lands, not during.
- **4136** — `seg()` iterates `$(id).children` and matches `b.dataset.v`. `#segUnits` (461) must keep exactly three direct-child buttons in order.
- **4269** — `showStats` is computed by reading `$(id).style.display !== 'none'` on the five gamebar rows. Their *inline* `style="display:none"` in the markup (1005, 1009) is the initial state. Moving those inline styles into `styles/hud` breaks the read — `getComputedStyle` is not consulted.
- **3939–3941, 4208, 4246, 6092** — the `.slid` class on `#gamebar` is both a CSS class and persisted state (`saveSettings` at 3926). The inline `transform` is set alongside the class deliberately (comment at 4082); do not "clean up" the duplication.
- **4909, 4918** — `.crowded` is toggled on `CROWDABLE` = `#fpsBox`, `#scaleNote`, `#gamebar` from measured rects. Any change to their box model changes when it fires.
- **1005 / 1009 / 1046 / 1049 / 1093 / 480 / 487 / 488 / 501** — nine elements ship `style="display:none"` in the markup. `#tView` (487) and `#tDive` (488) are *permanently* hidden buttons used purely as state holders (27 read sites each, lines 3860–6403). They are the highest-traffic ids in the file and they are invisible. Do not "tidy" them into variables — `toggle()`, `isOn()`, `restoreSettings` and the tour all address them as DOM.

### 5.6 Eval-time randomness in the same script body

Not DOM, but it interleaves with the boot sequence above and the screenshot gate is seeded, so it is listed here for the ordering constraint. All 134 `Math.random()` calls are reached from these **module-evaluation-time** blocks, in this order:

| line | block | consumers |
|---|---|---|
| 1610 | `BODIES.forEach` | body setup |
| **1658** | `{ var starPos = new Float32Array(N_STAR*3) … }` | ~90 `Math.random()` sites, 1649–2060 — starfield, bar, arms, halo, dust |
| **2460** | `{ … }` | belts |
| **2478** | `for(let i=0;i<KB_N;i++)` | Kuiper belt |
| **2486** | `for(let i=0;i<OO_N;i++)` | Oort cloud |
| 2564 | `for(let i=0;i<RING_SEGS;i++)` | deterministic (cos/sin) |
| **2878** | `for(let i=0;i<NB;i++)` | body jitter |
| **2899** | `{ … }` | |
| 3050–3052 | `loadGaiaStars()`, `loadGalaxyMap()`, `loadM31Map()` | async — resolve later, but the *call* order fixes the fetch order |

Every starred row consumes the shared `Math.random()` stream at evaluation time. Splitting them into `scene/starfield`, `scene/galaxy`, `scene/belts`, `scene/sky` and letting the bundler decide evaluation order **silently reorders the draw** even though nothing throws. The target layout already says `scene/*` should be PURE-ish and take an `Rng` — that is the fix, and it must land in the same commit as the split, not after. Until it does, `main.ts` must call the scene builders explicitly in the order 1658 → 2460 → 2478 → 2486 → 2878 → 2899.

---

## 6. Module assignment summary

| module | ids | notes |
|---|---|---|
| `gpu/context` | 1 | `#gl` only; keeps the longhand `getElementById` |
| `core/dom` | 0 | owns `$` (3591) and `isOn` (3772); imported by everything |
| `core/errorlog` | 0 | owns the collector (1104–1131) and a `setLogRenderer` hook; **no imports** |
| `ui/panels` | 8 | `hud`, `env`, `simPanel` + their dots and closers, `hudBody` |
| `ui/sections` | 7 | the five `sec*` bodies, `secDebugHead`, `secSolo` |
| `ui/settings` | 40 | `S_TOG` + `S_SLD` + `S_CHK` + their `*v` readouts + `cal`, `segUnits`, `detail`, `rowGain`, `rowHudHz`, `tReload` |
| `ui/hud` | 24 + 17 | gamebar readouts, alert boxes, fps, scale note; plus the 17 `#e*` Earth-panel rows |
| `ui/dialogs` | 12 | info modal, build stamps, the evolution SVG's two internal ids |
| `ui/tour` | 7 | |
| `ui/scenarios` | 4 | `jump`, `jumpGo`, and the two hidden state buttons `tView`/`tDive` |
| `ui/fullscreen` | 2 | |
| `ui/debug` | 16 | dbg card + the log tab; calls `setLogRenderer` |
| `ui/qr` | 4 | |
| `ui/tooltips` | 1 (runtime) | creates `#tip`; owns `.info` delegation (4534) |
| `ui/theme` | 0 | `setStateColour` (4847), `--stateRGB`, `.ice`, `.g710` |
| `audio/music` | 4 | |
| `audio/sfx` | 6 | |
| `render/camera` | 13 | |
| **`render/labels`** | 1 | **not in the agreed layout.** `#labels` (1092), the `.lbl` pool (4725–4745), the `.armlbl` pool (4754–4772), `#labels`-relative positioning in `placeLabel`, and `g710Lbl` (4814) form a coherent ~120-line unit with no home. It is DOM + per-frame maths, so it belongs under `render/`, not `scene/` (which is meant to be pure). Add `render/labels.ts`. |

`#qrOn` has two owners: `ui/qr` uses it, `ui/settings` persists it via `S_CHK`. Same for the ten `S_SLD` sliders, which are physically owned by `ui/settings`, `render/camera` and `audio/*`. Resolve by having `ui/settings` own only the *arrays and the persistence*, and address elements through `core/dom` — never by importing the owning module.
