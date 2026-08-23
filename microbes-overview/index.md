# Microbes & Cells Overview

A bilingual (DE/EN) teaching atlas of body cells and pathogens — cell types, pathogens, antibodies and the microbes that work for us — each rendered in several scientific styles with labelled diagrams, audience-specific descriptions and a printable kids' coloring page.

## → [Open the interactive atlas](viewer.html)

**[`viewer.html`](viewer.html)** is a single-page, mobile-and-desktop viewer for the AI-rendered image library: browse every set, switch the **audience** (Kids / Adult / Scientist), **language** (EN / DE) and **picture layout**, search across names and descriptions, and open any figure fullscreen. The labelled diagrams relabel themselves by language, and show the Latin scientific terms in Scientist mode. Rebuild it with `uv run build_viewer.py` (see [`AGENTS.md`](AGENTS.md)).

## Page structure

**21 sets and 4 prose chapters, 118 subjects live** (123 catalogued — the difference is subjects written up but not yet rendered, which stay hidden). Every live subject carries five picture styles, three labelled diagrams, a printable A4 coloring page, kids' narration in English and German, and size/weight data. `build_viewer.py` prints the current totals on every build, and [`OVERVIEW.md`](OVERVIEW.md) lists each subject with what it has.

The order runs from the parts inside a cell outward to the things that attack it, and finally to the things people have built. Italicised rows are **prose chapters** — explainers with no subjects of their own, which sit between the sets they introduce:

| # | Deutsch | English | live |
| --- | --- | --- | ---: |
| — | *Wie eine Zelle funktioniert* | *How the cell works* | chapter |
| 1 | Zellorganellen | Cell organelles | 8 |
| — | *Zelltypen des menschlichen Körpers* | *Cell types of the human body* | chapter |
| 2 | Stammzellen | Stem cells | 6 |
| 3 | Epithelzellen | Epithelial cells | 7 |
| 4 | Nervenzellen | Nerve cells | 6 |
| 5 | Herzzellen | Heart cells | 5 |
| — | *Wie Muskeln arbeiten* | *How muscle works* | chapter |
| 6 | Muskelzellen | Muscle cells | 4 |
| 7 | Fortpflanzungszellen | Reproductive cells | 6 |
| 8 | Knochenzellen | Bone cells | 6 |
| 9 | Fettzellen | Fat cells | 6 |
| 10 | Rote Blutkörperchen | Red blood cells | 6 |
| 11 | Immunzellen | Immune cells | 7 |
| 12 | Antikörper — Immunglobuline | Antibodies — Immunoglobulins | 5 |
| 13 | Erbgut — DNS, RNS, Chromosomen | The genetic material — DNA, RNA, chromosomes | 3 |
| 14 | Krebszellen | Cancer cells | 1 |
| 15 | Erreger — Pathogene | Pathogens | 9 |
| 16 | Bekannte Bakterien | Well-known bacteria | 10 |
| 17 | Bekannte Viren & andere Erreger | Well-known viruses & other pathogens | 13 |
| 18 | Nützliche Mikroben | Helpful microbes | 3 |
| 19 | Bakteriophagen | Bacteriophages | 1 of 3 |
| 20 | Erreger bei Hund und Katze | Pathogens of cats and dogs | 5 |
| — | *Wie der Mensch Leben umbaut* | *How humans engineer life* | chapter |
| 21 | Umgebautes Leben | Engineered life | 1 of 4 |

Four placements are deliberate rather than obvious. **Cancer cells** sit last among the body's own cells and immediately before the pathogens: everything up to that point is the body working as intended, everything after arrives from outside, and a cancer cell belongs to neither. **The genetic material** comes directly before it, because cancer is what happens when that molecule accumulates damage. **Engineered life** closes the atlas, after everything natural: it is the one chapter about things that do not occur anywhere on their own. **Bacteriophages** follow the helpful microbes rather than the viruses, because the story they belong to is the one about bacteria — they are viruses that attack them, not us.

## Sources

- [`cells_data.py`](cells_data.py) — the catalogue: bilingual names, function and "depends on / targets" descriptions, tier. A render only reaches the site if its `meta.name` matches a `name_en` here exactly, so this file is the source of truth for what exists.
- [`build_viewer.py`](build_viewer.py) — scans `cells_data.py` + `renders/set/**` and emits `viewer-data.json`, then injects it into `viewer.template.html` to produce `viewer.html`.
- [`microbe_scale.py`](microbe_scale.py) — per-microbe size and weight, drives the scale meter under each title.
- [`microbe_giant.py`](microbe_giant.py) — exact-match links to GIANTmicrobes plush toys (see [`OVERVIEW.md`](OVERVIEW.md)).

## Rebuilding

```bash
cd microbes-overview
uv run build_viewer.py      # or: python3 build_viewer.py   (stdlib only)
```

## AI-rendered teaching images (`microbe-render` skill)

A separate workflow renders scientifically-verified microbe images with Google's
image models (Nano Banana / Gemini / Imagen) in four styles, wraps each in a
labelled SVG with switchable Latin/English/German layers, and logs everything.

- Skill: [`.claude/skills/microbe-render/`](.claude/skills/microbe-render/) (`SKILL.md`, `SPEC.md`, `reference/`, `scripts/`).
- Per-microbe logs + images: [`renders/`](renders/) (e.g. [`rod-bacterium`](renders/set/pathogens-generic/rod-bacterium.render.md)).
- Overview table with tokens/costs: [`RENDER-STATUS.md`](RENDER-STATUS.md).
- Running checklist of open work and the compromises we chose not to fix: [`PLAN.md`](PLAN.md).
- Complete inventory — every catalogued microbe with what it has and what it still lacks, plus which GIANTmicrobes products we link and which we deliberately do not: [`OVERVIEW.md`](OVERVIEW.md), regenerated by `uv run build_overview.py`.

PNG masters and HEIC archival copies stay local (git-ignored); committed images are
the web-safe AVIF plus the SVG/HTML overlays.
