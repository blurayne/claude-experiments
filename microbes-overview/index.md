# Microbes Overview

Print-ready, bilingual A4-landscape posters that introduce common microbes. The data lives in a single Python file and is rendered into HTML and PDF posters.

## Generated outputs

- English HTML: [`microbes_en.html`](microbes_en.html)
- German HTML: [`microbes_de.html`](microbes_de.html)
- English PDF: [`microbes_en.pdf`](microbes_en.pdf)
- German PDF: [`microbes_de.pdf`](microbes_de.pdf)

## Sources

- [`build.py`](build.py) — assembles the HTML pages and triggers PDF rendering.
- [`cells_data.py`](cells_data.py) — the catalogue of microbes (names, descriptions, attributes) used to populate the posters.
- [`svg_shapes.py`](svg_shapes.py) — reusable SVG illustrations for each microbe.

## Rebuilding

```bash
python3 build.py
```

This regenerates `microbes_de.html`, `microbes_en.html`, and the matching PDFs in this folder.
