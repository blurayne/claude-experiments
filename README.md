# Claude Experiments

A collection of small, self-contained experiments. Each subfolder is one experiment with its own `index.md` (or hand-written `index.html`).

**Live site:** [https://blurayne.github.io/claude-experiments/](https://blurayne.github.io/claude-experiments/)

## Experiments

- [microbes-overview](microbes-overview/) — Bilingual (DE/EN) print-ready posters that visualise common microbes, generated from a Python data file into HTML and PDF.
- [solar-system](solar-system/) — Interactive 3D viewer of the solar system rendered in the browser.
- [slothy-hutty](slothy-hutty/) — Procedural 3D "Slothy" character rendered by hand-written WebGL2 and WebGPU engines, with a face-changer, cel/smooth shading, and 3D-print exports (STL / 3MF / OBJ).
- [steampipe-lightning-talk](steampipe-lightning-talk/) — A 3–5 minute reveal.js slide deck about Steampipe, with Kubernetes / AWS / aggregator / JSON examples and a DuckDB end note.
- [jq-lightning-talk](jq-lightning-talk/) — A reveal.js slide deck about jq, its Turing-completeness, and the family of alternative implementations (gojq, jaq, fq, faq).
- [esp32-iot-lightning-talk](esp32-iot-lightning-talk/) — A 5-minute reveal.js slide deck on using an ESP32 as an IoT sensor, shipping data to InfluxDB, and shipping firmware with OTA updates.

## How the site is built

GitHub Pages is built by [`.github/workflows/pages.yml`](.github/workflows/pages.yml):

1. The workflow runs `.github/scripts/build_site.py`.
2. Each subfolder is copied verbatim into `_site/`.
3. If a subfolder ships its own `index.html`, that file is kept untouched.
4. Otherwise, `index.md` is rendered into `index.html`.
5. The top-level `README.md` you are reading becomes the site root.

The Pages source must be set to **GitHub Actions** in repository settings.
