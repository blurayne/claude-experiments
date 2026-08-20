# heart-cells — overview

Final image per microbe × style (last attempt), the labelled SVG, and the real-microscopy reference. Status table at the bottom.

## Cardiac macrophage (`cardiac-macrophage`)
Resident scavenger cell of the heart with a rare second job: an elongated, spindled macrophage wedged between cardiomyocytes that not only clears debris but couples to the muscle cells through connexin-43 gap junctions and helps carry the electrical impulse through the atrioventricular node.

| textbook | sem | 3d | watercolor | reference |
| --- | --- | --- | --- | --- |
| ![textbook](finals/cardiac-macrophage__textbook.avif) | ![sem](finals/cardiac-macrophage__sem.avif) | ![3d](finals/cardiac-macrophage__3d.avif) | ![watercolor](finals/cardiac-macrophage__watercolor.avif) | ![reference](finals/cardiac-macrophage__reference.avif) |

**textbook — labelled** (English default, La/De toggle): [SVG](theme/textbook/cardiac-macrophage.textbook.svg) · [HTML](theme/textbook/cardiac-macrophage.textbook.html)
![textbook labelled](theme/textbook/cardiac-macrophage.textbook.svg)

**3d — labelled** (English default, La/De toggle): [SVG](theme/3d/cardiac-macrophage.3d.svg) · [HTML](theme/3d/cardiac-macrophage.3d.html)
![3d labelled](theme/3d/cardiac-macrophage.3d.svg)

**watercolor — labelled** (English default, La/De toggle): [SVG](theme/watercolor/cardiac-macrophage.watercolor.svg) · [HTML](theme/watercolor/cardiac-macrophage.watercolor.html)
![watercolor labelled](theme/watercolor/cardiac-macrophage.watercolor.svg)

Full log: [`cardiac-macrophage.render.md`](cardiac-macrophage.render.md)

## Pacemaker cell (sinoatrial node) (`pacemaker-cell`)
Small spindle-shaped nodal myocyte of the sinoatrial node that generates its own electrical impulse: its membrane potential never rests but drifts steadily upward until the cell fires — the body's built-in metronome.

| textbook | sem | 3d | watercolor | reference |
| --- | --- | --- | --- | --- |
| ![textbook](finals/pacemaker-cell__textbook.avif) | ![sem](finals/pacemaker-cell__sem.avif) | ![3d](finals/pacemaker-cell__3d.avif) | ![watercolor](finals/pacemaker-cell__watercolor.avif) | ![reference](finals/pacemaker-cell__reference.avif) |

**textbook — labelled** (English default, La/De toggle): [SVG](theme/textbook/pacemaker-cell.textbook.svg) · [HTML](theme/textbook/pacemaker-cell.textbook.html)
![textbook labelled](theme/textbook/pacemaker-cell.textbook.svg)

**3d — labelled** (English default, La/De toggle): [SVG](theme/3d/pacemaker-cell.3d.svg) · [HTML](theme/3d/pacemaker-cell.3d.html)
![3d labelled](theme/3d/pacemaker-cell.3d.svg)

**watercolor — labelled** (English default, La/De toggle): [SVG](theme/watercolor/pacemaker-cell.watercolor.svg) · [HTML](theme/watercolor/pacemaker-cell.watercolor.html)
![watercolor labelled](theme/watercolor/pacemaker-cell.watercolor.svg)

Full log: [`pacemaker-cell.render.md`](pacemaker-cell.render.md)

## Purkinje fibre (conducting cell) (`purkinje-fibre`)
Heavily rebuilt cardiomyocyte of the ventricular conduction system: a fat, pale, glycogen-stuffed muscle cell that traded most of its contractile machinery for connexin-40 gap junctions, making it the fastest-conducting cell in the heart (~2-4 m/s) so both ventricles contract as one.

| textbook | sem | 3d | watercolor | reference |
| --- | --- | --- | --- | --- |
| ![textbook](finals/purkinje-fibre__textbook.avif) | ![sem](finals/purkinje-fibre__sem.avif) | ![3d](finals/purkinje-fibre__3d.avif) | ![watercolor](finals/purkinje-fibre__watercolor.avif) | ![reference](finals/purkinje-fibre__reference.avif) |

**textbook — labelled** (English default, La/De toggle): [SVG](theme/textbook/purkinje-fibre.textbook.svg) · [HTML](theme/textbook/purkinje-fibre.textbook.html)
![textbook labelled](theme/textbook/purkinje-fibre.textbook.svg)

**3d — labelled** (English default, La/De toggle): [SVG](theme/3d/purkinje-fibre.3d.svg) · [HTML](theme/3d/purkinje-fibre.3d.html)
![3d labelled](theme/3d/purkinje-fibre.3d.svg)

**watercolor — labelled** (English default, La/De toggle): [SVG](theme/watercolor/purkinje-fibre.watercolor.svg) · [HTML](theme/watercolor/purkinje-fibre.watercolor.html)
![watercolor labelled](theme/watercolor/purkinje-fibre.watercolor.svg)

Full log: [`purkinje-fibre.render.md`](purkinje-fibre.render.md)

## Status

| name | styles | model | render count | pass | svg status | time taken | tokens used | costs |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Cardiac macrophage | Textbook illustration | gemini-3-pro-image | 1 | ✅ | built | 22s | 2523 | $0.051 |
| Cardiac macrophage | SEM micrograph | gemini-3-pro-image | 1 | ✅ | pending (same pipeline) | 18s | 2116 | $0.047 |
| Cardiac macrophage | 3D medical render | gemini-3-pro-image | 1 | ✅ | built | 18s | 2190 | $0.043 |
| Cardiac macrophage | Watercolor plate | gemini-3-pro-image | 1 | ✅ | built | 21s | 2298 | $0.046 |
| Cardiac macrophage | TEM · Public domain | — (edit) | 4 | ✅ | n/a | 20s | 2024 | $0.039 |
| Pacemaker cell (sinoatrial node) | Textbook illustration | gemini-3-pro-image | 2 | ✅ | built | 41s | 5311 | $0.099 |
| Pacemaker cell (sinoatrial node) | SEM micrograph | gemini-3-pro-image | 1 | ✅ | pending (same pipeline) | 18s | 2007 | $0.042 |
| Pacemaker cell (sinoatrial node) | 3D medical render | gemini-3-pro-image | 1 | ✅ | built | 20s | 2273 | $0.045 |
| Pacemaker cell (sinoatrial node) | Watercolor plate | gemini-3-pro-image | 1 | ✅ | built | 19s | 2409 | $0.049 |
| Pacemaker cell (sinoatrial node) | light-he · CC BY-SA 3.0 | — (edit) | 3 | ✅ | n/a | 13s | 1770 | $0.039 |
| Purkinje fibre (conducting cell) | Textbook illustration | gemini-3-pro-image | 2 | ✅ | built | 43s | 5150 | $0.092 |
| Purkinje fibre (conducting cell) | SEM micrograph | gemini-3-pro-image | 1 | ✅ | pending (same pipeline) | 19s | 2018 | $0.040 |
| Purkinje fibre (conducting cell) | 3D medical render | gemini-3-pro-image | 1 | ✅ | built | 21s | 2441 | $0.047 |
| Purkinje fibre (conducting cell) | Watercolor plate | gemini-3-pro-image | 2 | ✅ | built | 41s | 4967 | $0.094 |
| Purkinje fibre (conducting cell) | light-he · CC BY-SA 4.0 | — (edit) | 2 | ✅ | n/a | 11s | 1791 | $0.039 |

**Set total: 41,288 tokens · $0.809**

_Updated 2026-08-20 12:16 local._
