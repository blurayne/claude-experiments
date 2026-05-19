# Microbes & Cells Overview

Print-ready, bilingual A4-landscape posters that introduce body cells and pathogens side by side. The data lives in a single Python file and is rendered into HTML and PDF posters.

Each entry shows a single illustration above a short function description and a "depends on / targets" line. All illustrations come from the public-domain [NIH BioArt](https://bioart.niaid.nih.gov) collection.

## Page structure

Eleven pages — eight body-cell categories taken from the "Arten von Zellen" reference image, plus three pathogen pages:

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
| 9 | Pathogene | Pathogens (overview) |
| 10 | Bekannte Bakterien | Well-known bacteria |
| 11 | Bekannte Viren & andere Erreger | Well-known viruses & other pathogens |

Each page has exactly 6 entries.

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
