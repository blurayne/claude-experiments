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

## T7 bacteriophage (`t7-bacteriophage`)
A smaller, simpler cousin of T4: the same icosahedral DNA-filled head, but a short, non-contractile tail stub with tiny fibres instead of an extendable injection apparatus. T7 is famous not for its shape but for one enzyme it carries: T7 RNA polymerase, one of the most widely used tools in molecular biology.

| textbook | sem | 3d | watercolor | reference |
| --- | --- | --- | --- | --- |
| ![textbook](finals/t7-bacteriophage__textbook.avif) | ![sem](finals/t7-bacteriophage__sem.avif) | ![3d](finals/t7-bacteriophage__3d.avif) | ![watercolor](finals/t7-bacteriophage__watercolor.avif) | ![reference](finals/t7-bacteriophage__reference.avif) |

**textbook — labelled** (English default, La/De toggle): [SVG](theme/textbook/t7-bacteriophage.textbook.svg) · [HTML](theme/textbook/t7-bacteriophage.textbook.html)
![textbook labelled](theme/textbook/t7-bacteriophage.textbook.svg)

**3d — labelled** (English default, La/De toggle): [SVG](theme/3d/t7-bacteriophage.3d.svg) · [HTML](theme/3d/t7-bacteriophage.3d.html)
![3d labelled](theme/3d/t7-bacteriophage.3d.svg)

**watercolor — labelled** (English default, La/De toggle): [SVG](theme/watercolor/t7-bacteriophage.watercolor.svg) · [HTML](theme/watercolor/t7-bacteriophage.watercolor.html)
![watercolor labelled](theme/watercolor/t7-bacteriophage.watercolor.svg)

Full log: [`t7-bacteriophage.render.md`](t7-bacteriophage.render.md)

## Status

| name | styles | model | render count | pass | svg status | time taken | tokens used | costs |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| T4 bacteriophage | Textbook illustration | gemini-3-pro-image | 2 | ✅ | built | 40s | 4673 | $0.091 |
| T4 bacteriophage | SEM micrograph | gemini-3-pro-image | 2 | ✅ | pending (same pipeline) | 35s | 4081 | $0.084 |
| T4 bacteriophage | 3D medical render | gemini-3-pro-image | 2 | ✅ | built | 42s | 4389 | $0.090 |
| T4 bacteriophage | Watercolor plate | gemini-3-pro-image | 2 | ✅ | built | 37s | 4388 | $0.089 |
| T4 bacteriophage | negative-stain TEM · CC BY 4.0 | — (download) | 1 | ✅ | n/a | 1s | 0 | $0.000 |
| T7 bacteriophage | Textbook illustration | gemini-3-pro-image | 1 | ✅ | built | 19s | 2491 | $0.051 |
| T7 bacteriophage | SEM micrograph | gemini-3-pro-image | 1 | ✅ | pending (same pipeline) | 18s | 1979 | $0.039 |
| T7 bacteriophage | 3D medical render | gemini-3-pro-image | 1 | ✅ | built | 16s | 2078 | $0.041 |
| T7 bacteriophage | Watercolor plate | gemini-3-pro-image | 1 | ✅ | built | 20s | 2400 | $0.050 |
| T7 bacteriophage | negative-stain TEM (single virion) · CC BY-SA 4.0 | — (download) | 1 | ✅ | n/a | 1s | 0 | $0.000 |

**Set total: 26,479 tokens · $0.535**

_Updated 2026-08-23 20:59 local._
