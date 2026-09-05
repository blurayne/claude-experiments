# Claude Experiments

A collection of small, self-contained experiments. Each subfolder is one experiment with its own `index.md` (or hand-written `index.html`).

**Live site:** [https://blurayne.github.io/claude-experiments/](https://blurayne.github.io/claude-experiments/)

## Experiments

- [microbes-overview](microbes-overview/) — A bilingual (DE/EN) interactive teaching atlas of body cells and pathogens: every microbe AI-rendered in several scientific styles with labelled diagrams, audience-specific descriptions (Kids/Adult/Scientist) and printable A4 coloring pages.
- [astro-visuals](astro-visuals/) — Two self-contained astronomy visualisations: an interactive 3D viewer of the [solar system](astro-visuals/solar-system.html), and [Galactic Transit](astro-visuals/galactic-transit.html), the Sun's real ~230 km/s motion through the Milky Way with the planets weaving helical paths around its track — trails, the Kuiper belt and Oort cloud, several calendar eras, and a *real scale* toggle that collapses the whole planetary system into the Sun's single pixel — or, diving onward, zooms ~9 orders of magnitude down to the planets at true proportions.
- [slothy-hutty](slothy-hutty/) — A procedural 3D "Slothy" character drawn by hand-written WebGL2 and WebGPU engines. Has a face-changer, cel and smooth shading, and exports for 3D printing (STL, 3MF, OBJ).
- [steampipe-lightning-talk](steampipe-lightning-talk/) — A short reveal.js deck on Steampipe, with Kubernetes, AWS, aggregator and JSON examples and a DuckDB coda.
- [jq-lightning-talk](jq-lightning-talk/) — A reveal.js deck on jq, its Turing-completeness, and the alternative implementations (gojq, jaq, fq, faq).
- [esp32-iot-lightning-talk](esp32-iot-lightning-talk/) — A five-minute reveal.js deck on running an ESP32 as an IoT sensor, shipping data to InfluxDB, and updating firmware over the air.
- [terragrunt](terragrunt/) — A ten-minute reveal.js talk comparing Terragrunt and Terraform: units versus modules, DRY backend config, the dependency graph, `run --all`, stacks, and a quick look at Atmos.
- [climate-report](climate-report/) — An interactive climate dashboard for Munich built from LMU and DWD data. Shows the warming trend extrapolated to 2036, extremes, a monthly heatmap, and precipitation, sun and UV.
- [gebrauchtwagen-kompass](gebrauchtwagen-kompass/) — A German used-car comparison dashboard in a marine-compass theme, with speed-dependent fuel curves, total cost of ownership and reliability scoring.
- [palestine-my-ass](palestine-my-ass/report.html) — A German fact-check dossier on the Sophie von der Tann controversy. Ten criticisms are weighed point by point, with an AI red-team experiment on how differently prompted models answer the same question.
- [world-in-numbers](world-in-numbers/) — A live, ticking dashboard of how life on Earth is born and lost (humans, trees, insects, birds, fish, animals), with per-minute flows and a slider that projects totals to any year up to 2100.
- [blood-vessels](blood-vessels/) — An interactive, zoomable microvascular network: procedurally grown arteries, capillaries and veins with pulsatile flow and switchable shading (Canvas 2D plus WebGL2). Method notes in [`techniques.md`](blood-vessels/techniques.md).
- [eco-navigation](eco-navigation/) — Compares two Bavarian-Forest routes for distance, elevation, curviness, speed and, for five cars, energy, cost and CO₂. Geometry comes from real GPX tracks, energy from a transparent physics model. Method in [`methodology.html`](eco-navigation/methodology.html) ([`METHODOLOGY.md`](eco-navigation/METHODOLOGY.md)).
- [putzhilfe_ratgeber](putzhilfe_ratgeber/) — Ein deutscher Ratgeber zum legalen Einstellen einer Putzhilfe in München, mit Kostenrechner, Plattformvergleich und Checklisten. Per Deep-Research mit Quellen belegt (Stand Juli 2026).
- [ocr_mud_run_calendar](ocr_mud_run_calendar/) — Ein deutscher Kalender für Hindernis- und Matschläufe um München und Lam, mit Umkreissuche, Zeitraum- und Gebührenfiltern und Sortierung nach Termin oder Entfernung.
- [schlafsofa](schlafsofa/) — Ein deutscher Ratgeber für alltagstaugliche Schlafsofas bis 3.500 €, mit rund 55 Modellen, interaktiver Feature-Matrix ([`vergleich.html`](schlafsofa/vergleich.html)), Zimmer-Check und Gebrauchtpreisen. Per Deep-Research mit Quellen belegt (Juli 2026).
- [ki-dossiers](ki-dossiers/) — Deutsche KI-Analyse-Dossiers: ein Evidenzbericht zum IWF-Papier über KI und Besteuerung mit Steuerrechner, das zugehörige Recherche-Audit, und ein Rentabilitätsreport zu lokaler KI gegen die Cloud.
- [termux-claude-remote](termux-claude-remote/) — A design doc for a bridge between a phone running Termux and a locked-down cloud sandbox. The sandbox borrows the phone's network while the phone drives the sandbox, both dialing out to a rendezvous. Includes copy-paste snippets and a default-deny security model.
- [immune-heroes](immune-heroes/) — A kids' (DE/EN) browser voice app. Talk out loud to a cast of immune-system friends, each with its own voice and character, powered by the OpenAI Realtime API over WebRTC, with an animated SVG character and audio-reactive visuals.
- [reise-ins-allerkleinste](reise-ins-allerkleinste/) — A German reveal.js deck, "Die Reise ins Allerkleinste", on particle physics from cells to quarks. Part of the *Quarks for Kids* series.
- [ferienprogramm-feuer-kinder](ferienprogramm-feuer-kinder/) — An interactive German "Ferien-Kompass" for the 2026 Bavarian summer holidays. It lists 175+ curated courses and camps for kids, switchable between Greater Munich and Lam, filterable by distance, week, activity, price and age.
- [bahn-vs-auto](bahn-vs-auto/) — A small German single-file calculator for whether a trip is cheaper by train or car. Handles flexible time input, return trips, wear-and-tear costs, per-person tickets, shareable URLs and generated booking links.
- [booklet-calculator](booklet-calculator/) — A small German single-file calculator that turns a page range into the sheet order for a saddle-stitched booklet: pads to a multiple of four, shows the four positions per sheet, switches between long- and short-edge duplex and copies the print order to the clipboard.
- [freizeitguide-lamer-winkel](freizeitguide-lamer-winkel/) — An interactive German family leisure guide for the Lam and Bad Kötzting area: 97 entries with OSRM travel times, a self-drawn SVG radar and a Leaflet map.
- [trier](trier/) — An interactive German travel guide, "Rom an der Mosel", for Trier from 17 to 23 August 2026. It has 88 entries and 158 sources around the Roman sites, parallel tracks for kids, cosy days and non-Roman trips, a video "Einstimmung" section, an SVG radar and a Leaflet map. Distances are computed rather than routed ([`build_geo.py`](trier/build_geo.py)).
- [solar-eclipse-2026](solar-eclipse-2026/) — Two German dossiers and a norm appendix on the partial solar eclipse of 12 August 2026 (Lam, 87.4 % at 20:14 MESZ). One asks whether welding glass is safe for looking at the sun, single or stacked. The other computes every eclipse visible from Munich and Lam between 1976 and 2126. The appendix checks the safety verdict against the original ISO 12312-2 tables.
- [recherche-protokoll](recherche-protokoll/) — A reusable prompt template for adversarial deep research on any topic. It works from hypotheses instead of taking sides, refutes every position in turn, and ends in an evidence table rather than a tidy conclusion. Comes in full, compact and one-line versions and as a ready `CLAUDE.md`/`AGENTS.md` file.
- [beanie-babies](beanie-babies/) — A full-year Ty Beanie Baby birthday calendar (2,779 entries, 1,715 unique names), parsed from ty.com's own calendar tool and its underlying JSON API, with every photo downloaded (AVIF), each item marked current/out of stock/retired and classified by product type, and every current item's real marketing description fetched from its ty.com product page to derive animal type, colors, patterns and size. [`catalog.html`](beanie-babies/catalog.html) is a single interactive, offline-capable page with four views, rich search, dedup, filters and light/dark themes.
- [giant-microbes](giant-microbes/) — Every GIANTmicrobes plush "microbe" (818 items), merged from its US (giantmicrobes.com, Magento) and German (riesenmikroben.de, a separate storefront) sites with each item's availability, price, category, product format and, for delisted US items, a best-effort retired status/date pulled from the Internet Archive. Photos are background-removed (AVIF, actually transparent) and an LLM-assisted pass matches and translates items across the two languages. [`catalog.html`](giant-microbes/catalog.html) has full search/filters and a live US/DE language toggle; the build process is documented in [`AGENTS.md`](giant-microbes/AGENTS.md).

- [organoid-datacenter](organoid-datacenter/) — Ein deutsches adversariales Dossier zu Organoid-Compute, also Rechnen auf lebendem menschlichem Hirngewebe. Sieben Hypothesen werden gegen Primärliteratur geprüft und dreistufig verdiktet: Technik und Preise der real käuflichen Geräte, was das Pong-Experiment von 2022 wirklich zeigte, der Vergleich mit LLMs, und ab wann Bewusstsein, Moralstatus und Recht empirisch relevant werden. Ein YouTube-Kanal mit 802 Videos dient als Claim-Quelle: 618 seiner Behauptungen wurden aus 91 Transkripten extrahiert und zurückverfolgt. Mit Belegtabelle, Restliste und einem Rechenmodell zur Energiefrage.

## How the site is built

GitHub Pages is built by [`.github/workflows/pages.yml`](.github/workflows/pages.yml):

1. The workflow runs `.github/scripts/build_site.py`.
2. Each subfolder is copied verbatim into `_site/`.
3. If a subfolder ships its own `index.html`, that file is kept untouched.
4. Otherwise, `index.md` is rendered into `index.html`.
5. The top-level `README.md` you are reading becomes the site root.

The Pages source must be set to **GitHub Actions** in repository settings.
