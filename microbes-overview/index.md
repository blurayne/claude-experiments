# Microbes Overview

Print-ready, bilingual A4-landscape posters that introduce common microbes and human cells side by side. The data lives in a single Python file and is rendered into HTML and PDF posters.

Each entry shows up to three (or four) views of the same thing:

- **Microscope photo** — a real micrograph from open sources (Wikimedia Commons, CDC PHIL, NIAID), shown when available.
- **Microscope-style sketch (SVG)** — a stylised drawing used as a fallback when no photo is present.
- **Infographic-style SVG** — the "Kurzgesagt" look.
- **Kids-style SVG** — friendlier, hand-drawn shapes.

## Variants

Each variant is generated for both English and German.

| Variant | Scope | English | German |
| --- | --- | --- | --- |
| Basics (~30 entries) | The most iconic immune cells, pathogens and body cells. | [`microbes_basic_en.html`](microbes_basic_en.html) · [PDF](microbes_basic_en.pdf) | [`microbes_basic_de.html`](microbes_basic_de.html) · [PDF](microbes_basic_de.pdf) |
| Standard (~60 entries) | The default set covering all eleven topic pages. | [`microbes_en.html`](microbes_en.html) · [PDF](microbes_en.pdf) | [`microbes_de.html`](microbes_de.html) · [PDF](microbes_de.pdf) |
| Extended (~100 entries) | Adds many less-common pathogens, immune subtypes and specialised cell types. | _generated once entries are tagged `ext100`_ | _idem_ |
| Complete | Everything in the catalogue. | _generated once entries are tagged `complete`_ | _idem_ |

Variant tagging lives in `cells_data.py` via the per-entry `tier` field; `build.py` only emits a variant once at least one entry is tagged for it.

## Image layout modes

`build.py` supports two layout modes:

- `--mode auto` (default): each cell shows **three** images in a 3×1 row — the real photograph if present, otherwise the microscope-style SVG, followed by the infographic and kids SVGs.
- `--mode all`: each cell shows **four** images in a 2×2 grid — the real photograph (or a placeholder), the microscope-style SVG, the infographic and the kids SVG.

CSS classes are emitted on every cell (`.tier-basic`, `.tier-ext30`, etc.; `.kind-<page-id>`) and every image cell (`.img-microscope-real`, `.img-microscope-svg`, `.img-infographic`, `.img-kids`), so different document themes can be styled on top of the same HTML.

## Image sourcing

Real microscope photographs are not committed by Claude — the sandbox cannot reach Wikimedia/PHIL. Instead, `fetch_images.sh` downloads them on demand from Wikimedia Commons via the `Special:FilePath` redirect.

```bash
cd microbes-overview
./fetch_images.sh
# images land in ./images/, images.tar.gz is produced for easy transfer.
```

Filenames are stable (`<page-id>__<slug>.jpg`) and referenced from `cells_data.py` via the per-entry `image_filename` field. Each entry also records `image_url`, `image_credit` and `image_license`, which feed the credits page at the end of every PDF/HTML output.

The build is tolerant of missing files — any entry whose photograph hasn't been fetched simply falls back to its microscope-style SVG.

## Sources

- [`build.py`](build.py) — assembles the HTML pages, runs the tier filter, triggers PDF rendering, builds the credits page.
- [`cells_data.py`](cells_data.py) — the catalogue (names, descriptions, attributes, tier, image metadata).
- [`svg_shapes.py`](svg_shapes.py) — reusable SVG illustrations for each microbe.
- [`fetch_images.sh`](fetch_images.sh) — downloads microscope photos from Wikimedia into `images/`.

## Rebuilding

```bash
python3 build.py            # all tiers × both languages → HTML + PDF
python3 build.py --no-pdf   # HTML only
python3 build.py --mode all # 2×2 image grid variant
```
