# Claude Experiments

A collection of small, self-contained experiments. Each subfolder is one experiment with its own `index.md` (or hand-written `index.html`).

## Experiments

- [microbes-overview](microbes-overview/) — Bilingual (DE/EN) print-ready posters that visualise common microbes, generated from a Python data file into HTML and PDF.
- [solar-system](solar-system/) — Interactive 3D viewer of the solar system rendered in the browser.

## How the site is built

GitHub Pages is built by [`.github/workflows/pages.yml`](.github/workflows/pages.yml):

1. The workflow runs `.github/scripts/build_site.py`.
2. Each subfolder is copied verbatim into `_site/`.
3. If a subfolder ships its own `index.html`, that file is kept untouched.
4. Otherwise, `index.md` is rendered into `index.html`.
5. The top-level `README.md` you are reading becomes the site root.

The Pages source must be set to **GitHub Actions** in repository settings.
