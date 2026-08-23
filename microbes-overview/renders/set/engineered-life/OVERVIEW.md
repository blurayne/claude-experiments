# engineered-life — overview

Final image per microbe × style (last attempt), the labelled SVG, and the real-microscopy reference. Status table at the bottom.

## CAR-T cell (`car-t-cell`)
One of the patient's own cytotoxic T cells, engineered in the lab to carry a chimeric antigen receptor (CAR): an antibody-derived recognition head on the outside fused to T-cell-receptor activation domains on the inside, letting the cell recognize a chosen surface marker directly, bypassing MHC presentation. Usually made using a lentiviral vector that writes the CAR gene into the patient's own T cells, expanded in the lab and infused back.

| textbook | sem | 3d | watercolor | reference |
| --- | --- | --- | --- | --- |
| ![textbook](finals/car-t-cell__textbook.avif) | ![sem](finals/car-t-cell__sem.avif) | ![3d](finals/car-t-cell__3d.avif) | ![watercolor](finals/car-t-cell__watercolor.avif) | ![reference](finals/car-t-cell__reference.avif) |

**textbook — labelled** (English default, La/De toggle): [SVG](theme/textbook/car-t-cell.textbook.svg) · [HTML](theme/textbook/car-t-cell.textbook.html)
![textbook labelled](theme/textbook/car-t-cell.textbook.svg)

**3d — labelled** (English default, La/De toggle): [SVG](theme/3d/car-t-cell.3d.svg) · [HTML](theme/3d/car-t-cell.3d.html)
![3d labelled](theme/3d/car-t-cell.3d.svg)

**watercolor — labelled** (English default, La/De toggle): [SVG](theme/watercolor/car-t-cell.watercolor.svg) · [HTML](theme/watercolor/car-t-cell.watercolor.html)
![watercolor labelled](theme/watercolor/car-t-cell.watercolor.svg)

Full log: [`car-t-cell.render.md`](car-t-cell.render.md)

## Lentiviral vector (HIV-1-derived) (`lentiviral-vector`)
HIV-1 rebuilt as a gene-delivery shuttle — almost the entire viral genome removed, the packaging genes split across separate producer-cell plasmids, leaving a VSV-G-pseudotyped envelope and the conical Gag capsid to deliver a therapeutic cargo gene (flanked by self-inactivating LTRs) that reverse transcriptase and integrase write into the target cell's genome. Replication-incompetent: it cannot make more of itself.

| textbook | sem | 3d | watercolor | reference |
| --- | --- | --- | --- | --- |
| ![textbook](finals/lentiviral-vector__textbook.avif) | ![sem](finals/lentiviral-vector__sem.avif) | ![3d](finals/lentiviral-vector__3d.avif) | ![watercolor](finals/lentiviral-vector__watercolor.avif) | ![reference](finals/lentiviral-vector__reference.avif) |

**textbook — labelled** (English default, La/De toggle): [SVG](theme/textbook/lentiviral-vector.textbook.svg) · [HTML](theme/textbook/lentiviral-vector.textbook.html)
![textbook labelled](theme/textbook/lentiviral-vector.textbook.svg)

**3d — labelled** (English default, La/De toggle): [SVG](theme/3d/lentiviral-vector.3d.svg) · [HTML](theme/3d/lentiviral-vector.3d.html)
![3d labelled](theme/3d/lentiviral-vector.3d.svg)

**watercolor — labelled** (English default, La/De toggle): [SVG](theme/watercolor/lentiviral-vector.watercolor.svg) · [HTML](theme/watercolor/lentiviral-vector.watercolor.html)
![watercolor labelled](theme/watercolor/lentiviral-vector.watercolor.svg)

Full log: [`lentiviral-vector.render.md`](lentiviral-vector.render.md)

## Spider-silk cell (`spider-silk-cell`)
A cell — a goat mammary cell, a bacterium or a silkworm cell, depending on the route taken — carrying one or more spider genes so that it manufactures spidroin, the fibre-forming protein spiders spin their thread from. The best-known version is a goat that secretes the protein into its milk; engineered bacteria and silkworms that replace or supplement their usual silk protein with spidroin are the other two routes in active use.

| textbook | sem | 3d | watercolor | reference |
| --- | --- | --- | --- | --- |
| ![textbook](finals/spider-silk-cell__textbook.avif) | ![sem](finals/spider-silk-cell__sem.avif) | ![3d](finals/spider-silk-cell__3d.avif) | ![watercolor](finals/spider-silk-cell__watercolor.avif) | ![reference](finals/spider-silk-cell__reference.avif) |

**textbook — labelled** (English default, La/De toggle): [SVG](theme/textbook/spider-silk-cell.textbook.svg) · [HTML](theme/textbook/spider-silk-cell.textbook.html)
![textbook labelled](theme/textbook/spider-silk-cell.textbook.svg)

**3d — labelled** (English default, La/De toggle): [SVG](theme/3d/spider-silk-cell.3d.svg) · [HTML](theme/3d/spider-silk-cell.3d.html)
![3d labelled](theme/3d/spider-silk-cell.3d.svg)

**watercolor — labelled** (English default, La/De toggle): [SVG](theme/watercolor/spider-silk-cell.watercolor.svg) · [HTML](theme/watercolor/spider-silk-cell.watercolor.html)
![watercolor labelled](theme/watercolor/spider-silk-cell.watercolor.svg)

Full log: [`spider-silk-cell.render.md`](spider-silk-cell.render.md)

## Status

| name | styles | model | render count | pass | svg status | time taken | tokens used | costs |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CAR-T cell | Textbook illustration | gemini-3-pro-image | 1 | ✅ | built | 24s | 3089 | $0.055 |
| CAR-T cell | SEM micrograph | gemini-3-pro-image | 1 | ✅ | pending (same pipeline) | 20s | 1936 | $0.042 |
| CAR-T cell | 3D medical render | gemini-3-pro-image | 1 | ✅ | built | 22s | 2532 | $0.047 |
| CAR-T cell | Watercolor plate | gemini-3-pro-image | 3 | ✅ | built | 1.1m | 8124 | $0.144 |
| CAR-T cell | SEM · Public Domain (U.S. federal government work) | — (download) | 1 | ✅ | n/a | 2s | 0 | $0.000 |
| Lentiviral vector (HIV-1-derived) | Textbook illustration | gemini-3-pro-image | 2 | ✅ | built | 37s | 4285 | $0.087 |
| Lentiviral vector (HIV-1-derived) | SEM micrograph | gemini-3-pro-image | 1 | ✅ | pending (same pipeline) | 17s | 1750 | $0.038 |
| Lentiviral vector (HIV-1-derived) | 3D medical render | gemini-3-pro-image | 1 | ✅ | built | 19s | 1948 | $0.041 |
| Lentiviral vector (HIV-1-derived) | Watercolor plate | gemini-3-pro-image | 3 | ✅ | built | 1.0m | 6419 | $0.134 |
| Lentiviral vector (HIV-1-derived) | TEM · Public Domain (CDC PHIL #10860) | — (download) | 1 | ✅ | n/a | 1s | 0 | $0.000 |
| Spider-silk cell | Textbook illustration | gemini-3-pro-image | 1 | ✅ | built | 19s | 2697 | $0.048 |
| Spider-silk cell | SEM micrograph | gemini-3-pro-image | 1 | ✅ | pending (same pipeline) | 19s | 2102 | $0.043 |
| Spider-silk cell | 3D medical render | gemini-3-pro-image | 2 | ✅ | built | 36s | 4693 | $0.086 |
| Spider-silk cell | Watercolor plate | gemini-3-pro-image | 1 | ✅ | built | 20s | 2436 | $0.047 |
| Spider-silk cell | TEM · Public domain | — (download) | 2 | ✅ | n/a | 0s | 0 | $0.000 |

**Set total: 42,011 tokens · $0.814**

_Updated 2026-08-23 22:39 local._
