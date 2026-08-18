---
name: microbe-render
description: Render scientifically-verified teaching images of microbes with Google's image models (Nano Banana / Gemini image / Imagen), in four styles, and assemble them into labelled multi-language SVG overlays. Use when asked to generate, render, or illustrate microbe/cell pictures for teaching from microbes-overview.
---

# microbe-render

Turn a microbe from `cells_data.py` into a set of scientifically-accurate teaching
images (four styles) plus a real-microscopy reference, each wrapped in an SVG with
switchable **Latin / English / German** label layers. Working folder:
`microbes-overview/`. Reasoning steps use Claude **subagents**; deterministic work
uses the helper **scripts**.

## Golden rules
- **Science first, always.** Never prompt an image before a research subagent has
  produced an accurate morphology + label reference (with sources). The reference is
  the yardstick every render is verified against.
- **Subagents do judgment; scripts do mechanics.** Research, prompt-writing,
  verification, image annotation and audience descriptions are subagents. API calls,
  SVG assembly and the status table are scripts. Batch verification MUST use
  subagents so the main context stays clean.
- **Always surface the burn.** After every render batch, run `status.py` and report
  the running `[BURN] N renders · tokens · $` line to the user. `RENDER-STATUS.md`
  carries a TOTAL footer.
- **No baked-in text in images.** Labels are SVG layers, never generated pixels.
- **No borders/frames.** Every prompt says fill the square edge-to-edge (no black
  border, frame, vignette or letterbox). The **3d** style is colorized in natural
  biological tones (not near-monochrome, not neon); **sem** is false-color.
- **Real references are cleaned** with `edit_image.py` before use: strip text/scale
  bars/borders, emphasize the microbe, and keep the existing colorization (apply a
  natural false-color if the source is greyscale). Keep the original download for
  provenance; the cleaned image is the display/final.
- **English label layer visible by default**, Latin + German hidden/toggleable. The
  labelled SVG is built self-contained (`--embed`) and **embedded** into the
  per-microbe markdown and the set `OVERVIEW.md`.
- **After each set**, `status.py` prints per-set + total **tokens & cost** on
  lila-background / white-text lines. Figures come from the token usage the Google
  API reports per call (there is no live billing endpoint); cost = tokens × price.

## Model ladder (see reference/models.md)
1. `gemini-2.5-flash-image` (Nano Banana) — start here.
2. `gemini-3-pro-image` (Nano Banana Pro) — escalate after ~2 hard fails / verify
   rejections on a style.
3. Imagen 4 (`imagen-4.0-ultra-generate-001` …) — **ASK THE USER before any Imagen tier.**
Distinguish a *transient* failure (DNS/HTTP 5xx → just retry) from a *bad result*
(escalate). Record the model on every image (filename + sidecar + status column).

## Pipeline per microbe
1. **Research subagent** → `renders/set/<SET>/<microbe>.render.md` §1: morphology,
   the parts to label with **la/en/de** terms + sources, and a "do NOT draw" list of
   commonly-misleading structures. It also proposes freely-licensed real micrographs.
2. **Real reference** → `fetch_reference.py` downloads the best licensed micrograph
   into the **own set `reference-microscopy`**, recording source/license/attribution.
   **Prefer a single isolated specimen; a group is acceptable only if the microbe's
   features are clearly readable** (no dense clumps). A **verify subagent** confirms it
   actually shows the microbe (AI visual check).
3. **Descriptions subagent** → six audience blocks, EN+DE, into the markdown:
   - **kids** (playful, GiantMicrobes-style; assumes basic microbe + immune knowledge;
     role in the body, friend-or-foe). When a pathogen causes trouble, just say **how
     it's dealt with** — and **vary it** (washing/hygiene, rest, drinking water, a
     medicine from the doctor, the body clearing it). Don't reflexively end every
     microbe with "your immune system sends its cells to eat the invaders"; that
     framing is fine occasionally, not as a formula,
   - **adults** (popular-science, health-focused, less good/bad moralising),
   - **scientific** (precise mechanism/role).
   Use proper German umlauts (ä ö ü ß).
4. **Prompt subagent** → one prompt per style from reference + `reference/styles.md`.
5. **`render.py`** → render each of the four themes (`sem, textbook, 3d, watercolor`)
   at 1080×1080: PNG master + AVIF (web-safe) + HEIC (archival if libheif present).
6. **Verify subagent(s)** → view each render, score against the reference checklist,
   write pass/fail + a concrete fix-prompt; re-render up to **5×/style**. Then decide
   teaching-readiness per style.
7. **Annotate subagent** → view the chosen render, return `labels.json` (anchor + text
   coords + la/en/de) → `build_svg.py` → `<microbe>.<theme>.svg` + `.html`.
8. **`status.py`** → regenerate `RENDER-STATUS.md`; report the burn line. Each row
   links: name → the microbe log, set name → the set overview, style → the per-theme
   gallery.
9. **`overview.py`** → per-set `OVERVIEW.md` (final image per microbe × style + the
   reference + status), per-theme galleries, and the rich top-level `renders/OVERVIEW.md`.
   Copies the finals into `<SET>/finals/` so the set folder holds a flat gallery.
   **`renders/OVERVIEW.md` layout (keep this shape):** `# Renders overview`, then one
   `## Set: <set>` section per set; within it the microbes in **alphabetical order**, each
   a `### <Name> (\`key\`)` block containing (a) a 4-column image table whose header is the
   styles — **row 1** = the latest render of every style, **row 2** = the real micrograph
   then the labelled figures (English layer shown, La/De toggle in the SVG/HTML) — and
   (b) an all-language **descriptions table** (Kids / Adults / Scientific × English /
   Deutsch), then the full-log link and a `---` divider.

First run: do **one microbe end-to-end**, show the user, then continue the set.

## Swarm rendering (batch many microbes at once)
For a whole set / many microbes, fan out with a **workflow** (opt-in only) instead of
doing them serially. Design:
- **One agent per microbe.** Give each agent: the microbe `name_en`/`name_de`/`key`, the
  target `set`, the poster `func`/`deps` context from `cells_data.py`, and an instruction
  to **follow this SKILL.md + `reference/*.md` end-to-end**: research (write `render.md`
  §1–2 + `research.json` + `prompts.json`), fetch+verify+clean the real reference,
  write `descriptions.json` (six blocks, varied kids ending — no "immune system"
  formula), render the four styles with `render.py`, **view every render and re-render
  outliers up to 5×** against the style exemplars (textbook → `rod-bacterium`/`parasite`;
  watercolor → full-bleed `cocci`/`rod-bacterium`; 3d natural tints; sem false-colour
  surface; no baked text; no border/sheet-on-surface), annotate textbook/3d/watercolor
  (`labels.json` → `build_svg.py`, watercolor uses black-on-paper), write `verdicts.json`,
  then `assemble_md.py`. Each agent returns `{key, chosen attempts, notes, burn}`.
- **Cap concurrency explicitly — chunk into batches (e.g. 8) and run each batch with
  `parallel()`, sequentially.** A whole-pipeline agent (research + web fetches + several
  image renders + multiple image views for verification) is expensive; firing 15+ at
  once can blow through the account's session budget before any of them finish and
  return — every agent in the batch then errors out with no result, even though most had
  already done real (file-persisted) work. Smaller batches finish and checkpoint more
  reliably. Default to **4 concurrent** for full-pipeline agents (research + multiple
  renders + multiple image views is genuinely heavy); only go higher for cheap,
  narrowly-scoped agents. If a batch dies from a session-limit retry storm (check the
  workflow journal — many `started` events per key, almost no `result` events — before
  assuming slow progress means it's stuck), **stop the task and drop concurrency
  further** rather than let it keep retrying unsupervised for hours.
- **Make every agent resume-aware / idempotent.** Before each pipeline step, tell the
  agent to check whether that step's output file(s) already exist and look complete —
  if so, skip straight to the next step; only redo a step whose output is missing or
  visibly broken. If `<key>.verdicts.json` AND `<key>.render.meta.json` both already
  exist, the microbe is fully done — return immediately. This matters because a
  session-budget interruption (see above) can kill a whole batch mid-flight after
  expensive research/render work already landed on disk; **re-running the same batch
  must not re-spend that budget redoing finished steps.** Always re-verify (view) any
  already-rendered images before deciding to keep vs. re-render them, but never
  blindly regenerate a step whose artifact is already present and good.
- **Model choice per batch:** default to `gemini-2.5-flash-image`, but the user may ask
  to run a whole batch on `gemini-3-pro-image` (Nano Banana Pro) directly instead of the
  usual escalate-after-2-fails rule — useful after a flash batch needed a lot of
  re-renders. Pass the chosen model explicitly into every agent's render/re-render step.
- **Barrier at the end:** a single agent runs `status.py` + `overview.py` once, and you
  report the aggregate `[BURN]` line.
- Agents write **different files** (keyed by microbe) so parallel writes don't collide;
  the shared `reference-microscopy` set only gets per-microbe attempt files. No worktrees
  needed (no shared-file mutation).
- **Body-cell** microbes (non-pathogen sets) reuse the same pipeline; adapt §1 labels to
  the cell's real organelles (no bacterial wall/nucleoid) and skip inapplicable "do NOT
  draw" items.
- Keep quality gates strict: science-first research with sources, and the style/border
  checks above are the top re-render triggers.

## The per-microbe markdown MUST contain
`renders/set/<SET>/<microbe>.render.md` with, in order: (1) scientific reference +
label table; (2) the real-microscopy reference + its AI-verification verdict;
(3) the six audience descriptions (EN+DE); (4) the per-style prompts; (5) **every
picture we created or downloaded** — all attempts, all styles, all iterations, plus
the reference image — embedded with each one's verify verdict + fix-prompt; (6) the
teaching-use decision per style. Keep a sidecar `<microbe>.render.meta.json` beside it
(the source of truth `status.py` aggregates).

## RENDER-STATUS.md columns
`name | short description | set name | styles | model | render count | pass | svg status | time taken | tokens used | costs` + a **TOTAL** footer. One row per microbe × style (+ the reference-microscopy row).

## Directory layout
```
renders/set/<SET>/theme/<THEME>/<microbe>.attempts/gen-NN__<model>.{png,avif,heic}
renders/set/<SET>/theme/<THEME>/<microbe>.attempts/gen-NN__<model>.json   # sidecar
renders/set/<SET>/theme/<THEME>/<microbe>.<theme>.svg + .html             # labelled
renders/set/<SET>/<microbe>.render.md  +  <microbe>.render.meta.json
renders/set/reference-microscopy/theme/<modality>/<microbe>.attempts/real-01__*.{png,avif,heic}
RENDER-STATUS.md
```
`<SET>` groups microbes (e.g. `pathogens-generic`); `<THEME>` is the style.

## Scripts (all `#!/usr/bin/env -S uv run --script`, self-contained deps)
- `scripts/render.py` — call the image API, normalise to 1080², emit formats, sidecar.
- `scripts/fetch_reference.py` — download + normalise a licensed real micrograph.
- `scripts/edit_image.py` — Nano-Banana image editing; clean a real micrograph
  (strip text/borders, emphasize the microbe, keep/apply colorization).
- `scripts/build_svg.py` — base image + `labels.json` → layered SVG + toggle HTML;
  `--embed` inlines the base as a data URI (self-contained SVG, embeddable in markdown).
- `scripts/assemble_md.py` — build a microbe's render.md (§3–6) + meta from its inputs
  (`<microbe>.verdicts.json` drives verdicts/decision); embeds the labelled SVG,
  prefers the cleaned reference, fixes German umlauts.
- `scripts/status.py` — regenerate `RENDER-STATUS.md` (with links) + print the burn.
- `scripts/overview.py` — per-set + per-theme `OVERVIEW.md` galleries (labelled SVG
  embedded), gather finals into `<SET>/finals/`, and write the rich top-level
  `renders/OVERVIEW.md` (sets → alphabetical microbes; per microbe a latest-render row,
  a real-micrograph + labelled-figures row, and an all-language descriptions table).

## Auth
Env `GOOGLE_API_KEY`, else the first `GOOGLE_API_KEY=` found in a `.env` walking up
from cwd (repo-root `.env` works). Confirm the key + list reachable image models
before the first render; stop and tell the user if either is unusable.

See `reference/` for the model ladder, style templates, verification rubric and SVG
overlay spec. Keep this file lean; put detail there.
