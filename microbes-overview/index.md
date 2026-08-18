# Microbes & Cells Overview

Print-ready, bilingual A4-landscape posters that introduce body cells and pathogens side by side. The data lives in a single Python file and is rendered into HTML and PDF posters.

Each entry shows a single illustration above a short function description and a "depends on / targets" line. All illustrations come from the public-domain [NIH BioArt](https://bioart.niaid.nih.gov) collection.

## → [Open the interactive atlas](viewer.html)

**[`viewer.html`](viewer.html)** is a single-page, mobile-and-desktop viewer for the AI-rendered image library: browse all 12 sets, switch the **audience** (Kids / Adult / Scientist), **language** (EN / DE) and **picture layout**, search across names and descriptions, and open any figure fullscreen. The labelled diagrams relabel themselves by language, and show the Latin scientific terms in Scientist mode. Three science themes (Dark lab / Blueprint / Petri), each with a light and dark mode. Rebuild it with `uv run build_viewer.py` (see [`AGENTS.md`](AGENTS.md)).

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

## Output

| Variant | English | German |
| --- | --- | --- |
| Basics (66 entries, default) | [`microbes_en.html`](microbes_en.html) · [PDF](microbes_en.pdf) | [`microbes_de.html`](microbes_de.html) · [PDF](microbes_de.pdf) |
| Extended | _generated once entries are tagged `ext30` / `ext100` / `complete`_ | _idem_ |

Variant tagging lives in `cells_data.py` via the per-entry `tier` field; `build.py` only emits a variant once at least one entry is tagged for it.

## Image sourcing

Illustrations are not committed to this repository — they get downloaded on demand from NIH BioArt by `fetch_images.sh`:

```bash
cd microbes-overview
./fetch_images.sh
# images land in ./images/, images.tar.gz is produced for easy transfer.
```

Filenames are stable (`<page-id>__<slug>.png`) and referenced from `cells_data.py` via the per-entry `image_filename` field. Each entry also records `image_url`, `image_credit` and `image_license`, which feed the credits page at the end of every PDF/HTML output.

If an entry's `image_url` is empty in `fetch_images.sh`, the script logs it as `MISSING URL` — locate the asset on https://bioart.niaid.nih.gov, paste its direct PNG download URL into the script, and re-run.

The build is tolerant of missing files — any entry whose illustration hasn't been fetched falls back to a hatched placeholder.

## Sources

- [`build.py`](build.py) — assembles the HTML pages, runs the tier filter, triggers PDF rendering, builds the credits page.
- [`cells_data.py`](cells_data.py) — the catalogue (names, descriptions, tier, image metadata).
- [`fetch_images.sh`](fetch_images.sh) — downloads illustrations from NIH BioArt into `images/`.

## Rebuilding

```bash
python3 build.py            # all populated tiers × both languages → HTML + PDF
python3 build.py --no-pdf   # HTML only
```

## AI-rendered teaching images (`microbe-render` skill)

A separate workflow renders scientifically-verified microbe images with Google's
image models (Nano Banana / Gemini / Imagen) in four styles, wraps each in a
labelled SVG with switchable Latin/English/German layers, and logs everything.

- Skill: [`.claude/skills/microbe-render/`](.claude/skills/microbe-render/) (`SKILL.md`, `SPEC.md`, `reference/`, `scripts/`).
- Per-microbe logs + images: [`renders/`](renders/) (e.g. [`rod-bacterium`](renders/set/pathogens-generic/rod-bacterium.render.md)).
- Overview table with tokens/costs: [`RENDER-STATUS.md`](RENDER-STATUS.md).

PNG masters and HEIC archival copies stay local (git-ignored); committed images are
the web-safe AVIF plus the SVG/HTML overlays.
