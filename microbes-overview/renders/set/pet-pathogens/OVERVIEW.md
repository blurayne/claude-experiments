# pet-pathogens — overview

Final image per microbe × style (last attempt), the labelled SVG, and the real-microscopy reference. Status table at the bottom.

## Heartworm (Dirofilaria immitis) (`heartworm`)
The largest subject in the atlas: an adult female Dirofilaria immitis nematode reaches 25-30 cm, lives coiled in the right ventricle and pulmonary arteries of dogs (and less often cats), and is transmitted only via mosquitoes carrying its ~300 µm first-stage larvae (microfilariae). NOT segmented like an earthworm; NOT a tapeworm/fluke (no suckers, hooks or scolex).

| textbook | sem | 3d | watercolor | reference |
| --- | --- | --- | --- | --- |
| ![textbook](finals/heartworm__textbook.avif) | ![sem](finals/heartworm__sem.avif) | ![3d](finals/heartworm__3d.avif) | ![watercolor](finals/heartworm__watercolor.avif) | ![reference](finals/heartworm__reference.avif) |

**textbook — labelled** (English default, La/De toggle): [SVG](theme/textbook/heartworm.textbook.svg) · [HTML](theme/textbook/heartworm.textbook.html)
![textbook labelled](theme/textbook/heartworm.textbook.svg)

**3d — labelled** (English default, La/De toggle): [SVG](theme/3d/heartworm.3d.svg) · [HTML](theme/3d/heartworm.3d.html)
![3d labelled](theme/3d/heartworm.3d.svg)

**watercolor — labelled** (English default, La/De toggle): [SVG](theme/watercolor/heartworm.watercolor.svg) · [HTML](theme/watercolor/heartworm.watercolor.html)
![watercolor labelled](theme/watercolor/heartworm.watercolor.svg)

Full log: [`heartworm.render.md`](heartworm.render.md)

## Status

| name | styles | model | render count | pass | svg status | time taken | tokens used | costs |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Heartworm (Dirofilaria immitis) | Textbook illustration | gemini-3-pro-image | 3 | ✅ | built | 36s | 5757 | $0.120 |
| Heartworm (Dirofilaria immitis) | SEM micrograph | gemini-2.5-flash-image | 1 | ✅ | pending (same pipeline) | 8s | 1581 | $0.039 |
| Heartworm (Dirofilaria immitis) | 3D medical render | gemini-2.5-flash-image | 2 | ✅ | built | 13s | 3320 | $0.077 |
| Heartworm (Dirofilaria immitis) | Watercolor plate | gemini-2.5-flash-image | 2 | ✅ | built | 15s | 3481 | $0.077 |
| Heartworm (Dirofilaria immitis) | blood-smear-micrograph · CC BY-SA 3.0 / GFDL 1.2+ | — (download) | 1 | ✅ | n/a | 2s | 0 | $0.000 |

**Set total: 14,139 tokens · $0.313**

_Updated 2026-08-21 11:57 local._
