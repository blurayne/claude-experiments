# genetics — overview

Final image per microbe × style (last attempt), the labelled SVG, and the real-microscopy reference. Status table at the bottom.

## Chromosome (`chromosome`)
The genome in transport mode: two identical sister chromatids joined at a pinched centromere, capped by telomeres at all four arm tips, built by winding a 2 nm DNA double helix around histone spools into nucleosomes and on up into a ~700 nm metaphase chromatid. The X shape exists ONLY while a cell is dividing — the rest of the time the same DNA lies unwound as chromatin.

| textbook | sem | 3d | watercolor | reference |
| --- | --- | --- | --- | --- |
| ![textbook](finals/chromosome__textbook.avif) | ![sem](finals/chromosome__sem.avif) | ![3d](finals/chromosome__3d.avif) | ![watercolor](finals/chromosome__watercolor.avif) | ![reference](finals/chromosome__reference.avif) |

**textbook — labelled** (English default, La/De toggle): [SVG](theme/textbook/chromosome.textbook.svg) · [HTML](theme/textbook/chromosome.textbook.html)
![textbook labelled](theme/textbook/chromosome.textbook.svg)

**3d — labelled** (English default, La/De toggle): [SVG](theme/3d/chromosome.3d.svg) · [HTML](theme/3d/chromosome.3d.html)
![3d labelled](theme/3d/chromosome.3d.svg)

**watercolor — labelled** (English default, La/De toggle): [SVG](theme/watercolor/chromosome.watercolor.svg) · [HTML](theme/watercolor/chromosome.watercolor.html)
![watercolor labelled](theme/watercolor/chromosome.watercolor.svg)

Full log: [`chromosome.render.md`](chromosome.render.md)

## DNA (deoxyribonucleic acid) (`dna`)
The double helix: two antiparallel sugar-phosphate backbones on the OUTSIDE, paired bases (A–T, G–C) stacked on the inside, twisted into a RIGHT-HANDED spiral with a wide major groove and a narrow minor groove alternating along its length — 2 nm across, about two metres long in a single human cell.

| textbook | sem | 3d | watercolor | reference |
| --- | --- | --- | --- | --- |
| ![textbook](finals/dna__textbook.avif) | ![sem](finals/dna__sem.avif) | ![3d](finals/dna__3d.avif) | ![watercolor](finals/dna__watercolor.avif) | ![reference](finals/dna__reference.avif) |

**textbook — labelled** (English default, La/De toggle): [SVG](theme/textbook/dna.textbook.svg) · [HTML](theme/textbook/dna.textbook.html)
![textbook labelled](theme/textbook/dna.textbook.svg)

**3d — labelled** (English default, La/De toggle): [SVG](theme/3d/dna.3d.svg) · [HTML](theme/3d/dna.3d.html)
![3d labelled](theme/3d/dna.3d.svg)

**watercolor — labelled** (English default, La/De toggle): [SVG](theme/watercolor/dna.watercolor.svg) · [HTML](theme/watercolor/dna.watercolor.html)
![watercolor labelled](theme/watercolor/dna.watercolor.svg)

Full log: [`dna.render.md`](dna.render.md)

## RNA (ribonucleic acid) (`rna`)
The working copy — usually single-stranded, folding back on itself into hairpins and stem-loops rather than pairing with a second strand along its whole length. Ribose stands in for deoxyribose (an extra -OH on the 2' carbon), and uracil stands in for thymine. Three working forms do the job: mRNA carries a gene's transcript from the nucleus to the ribosome, tRNA folds into an unmistakable cloverleaf/L-shape to ferry the matching amino acid, and rRNA folds into the bulk of the ribosome itself.

| textbook | sem | 3d | watercolor | reference |
| --- | --- | --- | --- | --- |
| ![textbook](finals/rna__textbook.avif) | ![sem](finals/rna__sem.avif) | ![3d](finals/rna__3d.avif) | ![watercolor](finals/rna__watercolor.avif) | ![reference](finals/rna__reference.avif) |

**textbook — labelled** (English default, La/De toggle): [SVG](theme/textbook/rna.textbook.svg) · [HTML](theme/textbook/rna.textbook.html)
![textbook labelled](theme/textbook/rna.textbook.svg)

**3d — labelled** (English default, La/De toggle): [SVG](theme/3d/rna.3d.svg) · [HTML](theme/3d/rna.3d.html)
![3d labelled](theme/3d/rna.3d.svg)

**watercolor — labelled** (English default, La/De toggle): [SVG](theme/watercolor/rna.watercolor.svg) · [HTML](theme/watercolor/rna.watercolor.html)
![watercolor labelled](theme/watercolor/rna.watercolor.svg)

Full log: [`rna.render.md`](rna.render.md)

## Status

| name | styles | model | render count | pass | svg status | time taken | tokens used | costs |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Chromosome | Textbook illustration | gemini-2.5-flash-image | 4 | ✅ | built | 27s | 9375 | $0.155 |
| Chromosome | SEM micrograph | gemini-2.5-flash-image | 5 | ✅ | pending (same pipeline) | 34s | 8809 | $0.194 |
| Chromosome | 3D medical render | gemini-2.5-flash-image | 5 | ✅ | built | 36s | 11735 | $0.194 |
| Chromosome | Watercolor plate | gemini-2.5-flash-image | 5 | ✅ | built | 36s | 10911 | $0.194 |
| Chromosome | karyotype-LM (Giemsa-banded light micrograph of a complete human male metaphase spread, 46,XY, cut out and sorted into the standard karyogram) — a real light-microscope image, not a model or illustration · Public domain (work of the U.S. National Institutes of Health / NHGRI) | — (download) | 1 | ✅ | n/a | 1s | 0 | $0.000 |
| DNA (deoxyribonucleic acid) | Textbook illustration | gemini-3-pro-image | 3 | ✅ | built | 37s | 7319 | $0.135 |
| DNA (deoxyribonucleic acid) | SEM micrograph | gemini-3-pro-image | 3 | ✅ | pending (same pipeline) | 31s | 6127 | $0.125 |
| DNA (deoxyribonucleic acid) | 3D medical render | gemini-3-pro-image | 3 | ✅ | built | 37s | 7291 | $0.131 |
| DNA (deoxyribonucleic acid) | Watercolor plate | gemini-3-pro-image | 3 | ✅ | built | 48s | 6940 | $0.131 |
| DNA (deoxyribonucleic acid) | structural-model (B-form DNA atomic coordinates, ball-and-stick, CPK colouring) — NOT a photograph · GFDL 1.2+ / CC BY-SA 3.0 | — (download) | 1 | ✅ | n/a | 0s | 0 | $0.000 |
| RNA (ribonucleic acid) | Textbook illustration | gemini-3-pro-image | 5 | ✅ | built | 1.8m | 14091 | $0.260 |
| RNA (ribonucleic acid) | SEM micrograph | gemini-2.5-flash-image | 1 | ✅ | pending (same pipeline) | 7s | 1721 | $0.039 |
| RNA (ribonucleic acid) | 3D medical render | gemini-2.5-flash-image | 4 | ✅ | built | 30s | 8023 | $0.155 |
| RNA (ribonucleic acid) | Watercolor plate | gemini-2.5-flash-image | 3 | ✅ | built | 24s | 6040 | $0.116 |
| RNA (ribonucleic acid) | structural-model · CC BY-SA 3.0 / GFDL 1.2+ | — (download) | 1 | ✅ | n/a | 1s | 0 | $0.000 |

**Set total: 98,382 tokens · $1.827**

_Updated 2026-08-23 13:41 local._
