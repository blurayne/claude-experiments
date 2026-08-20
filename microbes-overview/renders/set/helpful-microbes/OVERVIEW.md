# helpful-microbes — overview

Final image per microbe × style (last attempt), the labelled SVG, and the real-microscopy reference. Status table at the bottom.

## Penicillin mould (Penicillium chrysogenum) (`penicillium-chrysogenum`)
Filamentous green mould built from septate hyaline hyphae. Erect conidiophores branch into metulae and flask-shaped phialides that pinch off unbranched chains of green conidia - the little brush (penicillus) that names the genus. It secretes penicillin to keep competing bacteria at a distance, and Alexander Fleming's accidental sighting of that bacteria-free zone in 1928 became the first antibiotic.

| textbook | sem | 3d | watercolor | reference |
| --- | --- | --- | --- | --- |
| ![textbook](finals/penicillium-chrysogenum__textbook.avif) | ![sem](finals/penicillium-chrysogenum__sem.avif) | ![3d](finals/penicillium-chrysogenum__3d.avif) | ![watercolor](finals/penicillium-chrysogenum__watercolor.avif) | ![reference](finals/penicillium-chrysogenum__reference.avif) |

**textbook — labelled** (English default, La/De toggle): [SVG](theme/textbook/penicillium-chrysogenum.textbook.svg) · [HTML](theme/textbook/penicillium-chrysogenum.textbook.html)
![textbook labelled](theme/textbook/penicillium-chrysogenum.textbook.svg)

**3d — labelled** (English default, La/De toggle): [SVG](theme/3d/penicillium-chrysogenum.3d.svg) · [HTML](theme/3d/penicillium-chrysogenum.3d.html)
![3d labelled](theme/3d/penicillium-chrysogenum.3d.svg)

**watercolor — labelled** (English default, La/De toggle): [SVG](theme/watercolor/penicillium-chrysogenum.watercolor.svg) · [HTML](theme/watercolor/penicillium-chrysogenum.watercolor.html)
![watercolor labelled](theme/watercolor/penicillium-chrysogenum.watercolor.svg)

Full log: [`penicillium-chrysogenum.render.md`](penicillium-chrysogenum.render.md)

## Baker's yeast (Saccharomyces cerevisiae) (`saccharomyces-cerevisiae`)
Single-celled ovoid fungus (~5-10 um) that multiplies by budding and leaves chitin bud scars on its mother cell. Its fermentation turns sugar into carbon dioxide and ethanol - the gas that raises bread dough and the alcohol in beer and wine - and it is one of biology's most important model organisms, the first eukaryote to have its genome fully sequenced.

| textbook | sem | 3d | watercolor | reference |
| --- | --- | --- | --- | --- |
| ![textbook](finals/saccharomyces-cerevisiae__textbook.avif) | ![sem](finals/saccharomyces-cerevisiae__sem.avif) | ![3d](finals/saccharomyces-cerevisiae__3d.avif) | ![watercolor](finals/saccharomyces-cerevisiae__watercolor.avif) | ![reference](finals/saccharomyces-cerevisiae__reference.avif) |

**textbook — labelled** (English default, La/De toggle): [SVG](theme/textbook/saccharomyces-cerevisiae.textbook.svg) · [HTML](theme/textbook/saccharomyces-cerevisiae.textbook.html)
![textbook labelled](theme/textbook/saccharomyces-cerevisiae.textbook.svg)

**3d — labelled** (English default, La/De toggle): [SVG](theme/3d/saccharomyces-cerevisiae.3d.svg) · [HTML](theme/3d/saccharomyces-cerevisiae.3d.html)
![3d labelled](theme/3d/saccharomyces-cerevisiae.3d.svg)

**watercolor — labelled** (English default, La/De toggle): [SVG](theme/watercolor/saccharomyces-cerevisiae.watercolor.svg) · [HTML](theme/watercolor/saccharomyces-cerevisiae.watercolor.html)
![watercolor labelled](theme/watercolor/saccharomyces-cerevisiae.watercolor.svg)

Full log: [`saccharomyces-cerevisiae.render.md`](saccharomyces-cerevisiae.render.md)

## Status

| name | styles | model | render count | pass | svg status | time taken | tokens used | costs |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Penicillin mould (Penicillium chrysogenum) | Textbook illustration | gemini-3-pro-image | 1 | ✅ | built | 24s | 2639 | $0.050 |
| Penicillin mould (Penicillium chrysogenum) | SEM micrograph | gemini-3-pro-image | 1 | ✅ | pending (same pipeline) | 18s | 2030 | $0.043 |
| Penicillin mould (Penicillium chrysogenum) | 3D medical render | gemini-3-pro-image | 1 | ✅ | built | 20s | 2105 | $0.042 |
| Penicillin mould (Penicillium chrysogenum) | Watercolor plate | gemini-3-pro-image | 1 | ✅ | built | 20s | 2312 | $0.046 |
| Penicillin mould (Penicillium chrysogenum) | LM (lactophenol cotton blue) · CC BY-SA 4.0 | — (edit) | 2 | ✅ | n/a | 10s | 1815 | $0.039 |
| Baker's yeast (Saccharomyces cerevisiae) | Textbook illustration | gemini-3-pro-image | 1 | ✅ | built | 22s | 2220 | $0.045 |
| Baker's yeast (Saccharomyces cerevisiae) | SEM micrograph | gemini-3-pro-image | 1 | ✅ | pending (same pipeline) | 18s | 1852 | $0.041 |
| Baker's yeast (Saccharomyces cerevisiae) | 3D medical render | gemini-3-pro-image | 1 | ✅ | built | 20s | 1912 | $0.041 |
| Baker's yeast (Saccharomyces cerevisiae) | Watercolor plate | gemini-3-pro-image | 2 | ✅ | built | 40s | 3991 | $0.083 |
| Baker's yeast (Saccharomyces cerevisiae) | SEM · CC BY 3.0 | — (edit) | 2 | ✅ | n/a | 9s | 1752 | $0.039 |

**Set total: 22,628 tokens · $0.467**

_Updated 2026-08-20 13:35 local._
