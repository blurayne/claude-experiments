# Microbes & Cells Overview

A bilingual (DE/EN) teaching atlas of body cells and pathogens: 72 microbes across 12 sets, each rendered in several scientific styles with labelled diagrams, audience-specific descriptions and a printable kids' coloring page.

## → [Open the interactive atlas](viewer.html)

**[`viewer.html`](viewer.html)** is a single-page, mobile-and-desktop viewer for the AI-rendered image library: browse all 12 sets, switch the **audience** (Kids / Adult / Scientist), **language** (EN / DE) and **picture layout**, search across names and descriptions, and open any figure fullscreen. The labelled diagrams relabel themselves by language, and show the Latin scientific terms in Scientist mode. Rebuild it with `uv run build_viewer.py` (see [`AGENTS.md`](AGENTS.md)).

## Page structure

Twelve pages — eight body-cell categories taken from the "Arten von Zellen" reference image, an antibodies page, plus three pathogen pages:

| # | Deutsch | English |
| --- | --- | --- |
| 1 | Stammzellen | Stem cells |
| 2 | Epithelzellen | Epithelial cells |
| 3 | Nervenzellen | Nerve cells |
| 4 | Fortpflanzungszellen | Reproductive cells |
| 5 | Knochenzellen | Bone cells |
| 6 | Fettzellen | Fat cells |
| 7 | Rote Blutkörperchen | Red blood cells |
| 8 | Immunzellen | Immune cells |
| 9 | Antikörper — Immunglobuline | Antibodies — Immunoglobulins |
| 10 | Pathogene | Pathogens (overview) |
| 11 | Bekannte Bakterien | Well-known bacteria |
| 12 | Bekannte Viren & andere Erreger | Well-known viruses & other pathogens |

Each page has 6 entries (the antibodies page has 5).

## Sources

- [`cells_data.py`](cells_data.py) — the catalogue: bilingual names, function and "depends on / targets" descriptions, tier.
- [`build_viewer.py`](build_viewer.py) — scans `cells_data.py` + `renders/set/**` and emits `viewer-data.json`, then injects it into `viewer.template.html` to produce `viewer.html`.
- [`microbe_scale.py`](microbe_scale.py) — per-microbe size and weight, drives the scale meter under each title.
- [`microbe_giant.py`](microbe_giant.py) — exact-match links to GIANTmicrobes plush toys (see [`GIANTMICROBES.md`](GIANTMICROBES.md)).

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
- GIANTmicrobes plush links — which of their microbes are the proven sellers, which of ours already match one, and which are worth adding next: [`GIANTMICROBES.md`](GIANTMICROBES.md).

PNG masters and HEIC archival copies stay local (git-ignored); committed images are
the web-safe AVIF plus the SVG/HTML overlays.
