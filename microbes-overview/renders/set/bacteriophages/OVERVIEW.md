# bacteriophages — overview

Final image per microbe × style (last attempt), the labelled SVG, and the real-microscopy reference. Status table at the bottom.

## T4 bacteriophage (`t4-bacteriophage`)
The classic docking-apparatus phage: a prolate icosahedral head (~120x86 nm) packed with DNA sits on a neck attached to a contractile tail with a hexagonal baseplate, six kinked long tail fibres gripping Escherichia coli like landing legs, and six short fibres folded up beneath. Naked protein, no envelope.

| textbook | sem | 3d | watercolor | reference |
| --- | --- | --- | --- | --- |
| ![textbook](finals/t4-bacteriophage__textbook.avif) | ![sem](finals/t4-bacteriophage__sem.avif) | ![3d](finals/t4-bacteriophage__3d.avif) | ![watercolor](finals/t4-bacteriophage__watercolor.avif) | ![reference](finals/t4-bacteriophage__reference.avif) |

**textbook — labelled** (English default, La/De toggle): [SVG](theme/textbook/t4-bacteriophage.textbook.svg) · [HTML](theme/textbook/t4-bacteriophage.textbook.html)
![textbook labelled](theme/textbook/t4-bacteriophage.textbook.svg)

**3d — labelled** (English default, La/De toggle): [SVG](theme/3d/t4-bacteriophage.3d.svg) · [HTML](theme/3d/t4-bacteriophage.3d.html)
![3d labelled](theme/3d/t4-bacteriophage.3d.svg)

**watercolor — labelled** (English default, La/De toggle): [SVG](theme/watercolor/t4-bacteriophage.watercolor.svg) · [HTML](theme/watercolor/t4-bacteriophage.watercolor.html)
![watercolor labelled](theme/watercolor/t4-bacteriophage.watercolor.svg)

Full log: [`t4-bacteriophage.render.md`](t4-bacteriophage.render.md)

## Status

| name | styles | model | render count | pass | svg status | time taken | tokens used | costs |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| T4 bacteriophage | Textbook illustration | gemini-3-pro-image | 2 | ✅ | built | 40s | 4673 | $0.091 |
| T4 bacteriophage | SEM micrograph | gemini-3-pro-image | 2 | ✅ | pending (same pipeline) | 35s | 4081 | $0.084 |
| T4 bacteriophage | 3D medical render | gemini-3-pro-image | 2 | ✅ | built | 42s | 4389 | $0.090 |
| T4 bacteriophage | Watercolor plate | gemini-3-pro-image | 2 | ✅ | built | 37s | 4388 | $0.089 |
| T4 bacteriophage | negative-stain TEM · CC BY 4.0 | — (download) | 1 | ✅ | n/a | 1s | 0 | $0.000 |

**Set total: 17,531 tokens · $0.354**

_Updated 2026-08-23 19:03 local._
