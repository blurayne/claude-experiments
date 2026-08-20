# organelles — overview

Final image per microbe × style (last attempt), the labelled SVG, and the real-microscopy reference. Status table at the bottom.

## Golgi apparatus (`golgi-apparatus`)
The cell's packing and dispatch station: a polarised stack of four to eight smooth, flattened membrane sacs that takes freshly built proteins in on its convex cis face, tags them with sugar chains, sorts them, and pinches them off the concave trans face in vesicles addressed to the cell surface, to lysosomes or to export.

| textbook | sem | 3d | watercolor | reference |
| --- | --- | --- | --- | --- |
| ![textbook](finals/golgi-apparatus__textbook.avif) | ![sem](finals/golgi-apparatus__sem.avif) | ![3d](finals/golgi-apparatus__3d.avif) | ![watercolor](finals/golgi-apparatus__watercolor.avif) | ![reference](finals/golgi-apparatus__reference.avif) |

**textbook — labelled** (English default, La/De toggle): [SVG](theme/textbook/golgi-apparatus.textbook.svg) · [HTML](theme/textbook/golgi-apparatus.textbook.html)
![textbook labelled](theme/textbook/golgi-apparatus.textbook.svg)

**3d — labelled** (English default, La/De toggle): [SVG](theme/3d/golgi-apparatus.3d.svg) · [HTML](theme/3d/golgi-apparatus.3d.html)
![3d labelled](theme/3d/golgi-apparatus.3d.svg)

**watercolor — labelled** (English default, La/De toggle): [SVG](theme/watercolor/golgi-apparatus.watercolor.svg) · [HTML](theme/watercolor/golgi-apparatus.watercolor.html)
![watercolor labelled](theme/watercolor/golgi-apparatus.watercolor.svg)

Full log: [`golgi-apparatus.render.md`](golgi-apparatus.render.md)

## Mitochondrion (`mitochondrion`)
The power plant: a smooth outer membrane and a deeply folded inner one whose folds (cristae) multiply the working surface. There sits the respiratory chain, which turns nutrients and oxygen into ATP, the cell's energy currency.

| textbook | sem | 3d | watercolor | reference |
| --- | --- | --- | --- | --- |
| ![textbook](finals/mitochondrion__textbook.avif) | ![sem](finals/mitochondrion__sem.avif) | ![3d](finals/mitochondrion__3d.avif) | ![watercolor](finals/mitochondrion__watercolor.avif) | ![reference](finals/mitochondrion__reference.avif) |

**textbook — labelled** (English default, La/De toggle): [SVG](theme/textbook/mitochondrion.textbook.svg) · [HTML](theme/textbook/mitochondrion.textbook.html)
![textbook labelled](theme/textbook/mitochondrion.textbook.svg)

**3d — labelled** (English default, La/De toggle): [SVG](theme/3d/mitochondrion.3d.svg) · [HTML](theme/3d/mitochondrion.3d.html)
![3d labelled](theme/3d/mitochondrion.3d.svg)

**watercolor — labelled** (English default, La/De toggle): [SVG](theme/watercolor/mitochondrion.watercolor.svg) · [HTML](theme/watercolor/mitochondrion.watercolor.html)
![watercolor labelled](theme/watercolor/mitochondrion.watercolor.svg)

Full log: [`mitochondrion.render.md`](mitochondrion.render.md)

## Nucleus (`nucleus`)
The cell's archive and control room: a spherical organelle bounded by a DOUBLE membrane (two lipid bilayers with a perinuclear space between them, continuous with the rough ER), pierced by thousands of octagonal nuclear pore complexes, holding the genome as peripheral heterochromatin and central euchromatin around a membrane-less nucleolus that builds ribosomes.

| textbook | sem | 3d | watercolor | reference |
| --- | --- | --- | --- | --- |
| ![textbook](finals/nucleus__textbook.avif) | ![sem](finals/nucleus__sem.avif) | ![3d](finals/nucleus__3d.avif) | ![watercolor](finals/nucleus__watercolor.avif) | ![reference](finals/nucleus__reference.avif) |

**textbook — labelled** (English default, La/De toggle): [SVG](theme/textbook/nucleus.textbook.svg) · [HTML](theme/textbook/nucleus.textbook.html)
![textbook labelled](theme/textbook/nucleus.textbook.svg)

**3d — labelled** (English default, La/De toggle): [SVG](theme/3d/nucleus.3d.svg) · [HTML](theme/3d/nucleus.3d.html)
![3d labelled](theme/3d/nucleus.3d.svg)

**watercolor — labelled** (English default, La/De toggle): [SVG](theme/watercolor/nucleus.watercolor.svg) · [HTML](theme/watercolor/nucleus.watercolor.html)
![watercolor labelled](theme/watercolor/nucleus.watercolor.svg)

Full log: [`nucleus.render.md`](nucleus.render.md)

## Status

| name | styles | model | render count | pass | svg status | time taken | tokens used | costs |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Golgi apparatus | Textbook illustration | gemini-3-pro-image | 3 | ✅ | built | 42s | 8705 | $0.131 |
| Golgi apparatus | SEM micrograph | gemini-2.5-flash-image | 1 | ✅ | pending (same pipeline) | 8s | 1848 | $0.039 |
| Golgi apparatus | 3D medical render | gemini-3-pro-image | 3 | ✅ | built | 41s | 7754 | $0.121 |
| Golgi apparatus | Watercolor plate | gemini-3-pro-image | 4 | ✅ | built | 1.3m | 11871 | $0.192 |
| Golgi apparatus | TEM · Public domain | — (edit) | 3 | ✅ | n/a | 9s | 1850 | $0.039 |
| Mitochondrion | Textbook illustration | gemini-2.5-flash-image | 1 | ✅ | built | 6s | 1903 | $0.039 |
| Mitochondrion | SEM micrograph | gemini-2.5-flash-image | 2 | ✅ | pending (same pipeline) | 13s | 3397 | $0.077 |
| Mitochondrion | 3D medical render | gemini-2.5-flash-image | 2 | ✅ | built | 15s | 3597 | $0.077 |
| Mitochondrion | Watercolor plate | gemini-2.5-flash-image | 1 | ✅ | built | 6s | 1772 | $0.039 |
| Mitochondrion | TEM · Public domain | — (download) | 1 | ✅ | n/a | 0s | 0 | $0.000 |
| Nucleus | Textbook illustration | gemini-2.5-flash-image | 2 | ✅ | built | 14s | 4193 | $0.077 |
| Nucleus | SEM micrograph | gemini-2.5-flash-image | 2 | ✅ | pending (same pipeline) | 13s | 3781 | $0.077 |
| Nucleus | 3D medical render | gemini-2.5-flash-image | 1 | ✅ | built | 8s | 1894 | $0.039 |
| Nucleus | Watercolor plate | gemini-2.5-flash-image | 1 | ✅ | built | 7s | 1930 | $0.039 |
| Nucleus | TEM · Public domain | — (download) | 2 | ✅ | n/a | 0s | 0 | $0.000 |

**Set total: 54,495 tokens · $0.986**

_Updated 2026-08-20 21:43 local._
