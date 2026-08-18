# microbe-render — design spec (agreed 2026-08-13)

Purpose: from a microbe in `cells_data.py`, produce scientifically-verified teaching
images in four styles + a real-microscopy reference, each wrapped in a labelled,
multi-language SVG. Working folder `microbes-overview/`.

## Decisions
- **Model:** Google Gemini API. Ladder `gemini-2.5-flash-image` (Nano Banana) →
  `gemini-3-pro-image` (Nano Banana Pro, on repeated bad results) → **ask user** →
  Imagen 4. Record the model per image. Auth: `GOOGLE_API_KEY` env, else `.env`.
- **Scope:** generic `pathogens-generic` set (cocci, rod, virus, fungus, parasite,
  prion). Prototype rod-bacterium first, then the rest.
- **Styles (themes):** `sem, textbook, 3d, watercolor` — render every microbe in all.
- **Science first:** research subagent produces the morphology + label reference
  (la/en/de + sources + "do NOT draw" list) BEFORE prompting.
- **Subagents do judgment** (research, prompt-writing, verification, annotation,
  descriptions); **scripts do mechanics** (render, fetch_reference, build_svg, status).
- **Verify** each render against the reference, ≤5 iterations/style; distinguish
  transient failures (retry) from bad results (escalate).
- **Real reference** micrograph in its own `reference-microscopy` set, freely-licensed,
  AI-verified.
- **SVG:** base image + three toggle layers (la/en/de); **English on by default**.
- **Descriptions:** per microbe, kids / adults / scientific, each EN + DE.
- **Formats:** PNG master + AVIF (web) + HEIC (archival, local only). 1080×1080.
- **Markdown per microbe** embeds every picture (all attempts + reference) with
  verdicts; a `*.render.meta.json` sidecar feeds `RENDER-STATUS.md`.
- **RENDER-STATUS.md** columns: name, short description, set name, styles, model,
  render count, pass, svg status, time taken, tokens used, costs + TOTAL. Burn line
  printed to console after each batch.

## Directory
`renders/set/<SET>/theme/<THEME>/<microbe>.attempts/gen-NN__<model>.{png,avif,heic}` +
sidecars; `<microbe>.<theme>.svg`/`.html`; `renders/set/<SET>/<microbe>.render.md` +
`.render.meta.json`; `renders/set/reference-microscopy/...`.

Full operational detail lives in `SKILL.md` and `reference/`.
