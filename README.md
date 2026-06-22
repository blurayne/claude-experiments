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
- [climate-report](climate-report/) — Interactive climate-trend dashboard for Munich (warming trend with extrapolation to 2036, extremes, monthly heatmap, precipitation/sun/UV), built from real LMU and DWD data.
- [gebrauchtwagen-kompass](gebrauchtwagen-kompass/) — Interactive used-car comparison dashboard (German) in a marine-compass theme: speed-dependent fuel curves, total cost of ownership, reliability dots and scale silhouettes.
- [palestine-my-ass](palestine-my-ass/) — Interactive German fact-check page examining six accusations against journalist Sophie von der Tann, weighing each claim against counterpoints with verdict labels (light/dark theme).
- [immune-heroes](immune-heroes/) — **Immune Heroes**: a kids' (DE/EN) browser voice app. Talk out loud to a cast of immune-system friends (Senua, Rubina, Theo, Kilian, Denni, Makro), each with its own voice and character, powered by the OpenAI Realtime API (speech↔speech over WebRTC) with an animated SVG character, audio-reactive visuals, idle story-telling, a token counter and a private on-device memory.

## How the site is built

GitHub Pages is built by [`.github/workflows/pages.yml`](.github/workflows/pages.yml):

1. The workflow runs `.github/scripts/build_site.py`.
2. Each subfolder is copied verbatim into `_site/`.
3. If a subfolder ships its own `index.html`, that file is kept untouched.
4. Otherwise, `index.md` is rendered into `index.html`.
5. The top-level `README.md` you are reading becomes the site root.

The Pages source must be set to **GitHub Actions** in repository settings.
