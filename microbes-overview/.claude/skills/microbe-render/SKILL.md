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
- **The name is load-bearing.** `build_viewer.py` matches a render to its catalogue
  entry on `meta.name == name_en`, **byte-exactly** (a slug fallback catches some
  misses). Get it wrong and the subject silently vanishes from the site — no error,
  no warning, it is simply not there. Copy the name from `cells_data.py`, never
  retype it, and check `render.meta.json` before declaring a subject done.
- **Science first, always.** Never prompt an image before a research subagent has
  produced an accurate morphology + label reference (with sources). The reference is
  the yardstick every render is verified against.
- **Flag, don't smooth.** A compromise recorded in `verdicts.json` and the render log
  is worth more than a clean-looking claim. Say when a reference is upscaled and by
  how much, when it is a structural model rather than a photograph, when a labelled
  feature is not actually resolvable, when a count in the text is not countable in
  the picture, and when a style was capped by quota rather than by judgement. Half
  the value of this pipeline is the audit trail.
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
- **Clean a real reference only if it needs cleaning.** `edit_image.py` strips
  text/scale bars/borders and can apply a natural false-colour to a greyscale plate —
  but if the source has nothing to remove, skip it entirely. When you do run it, diff
  the result against the original: it sometimes re-illustrates or reshapes instead of
  cleaning (see the prompt lessons). Keep the original download for provenance.
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

## Prompt lessons that cost real money to learn
Each of these came out of a failure that burned renders. Apply them from the
first attempt rather than rediscovering them.

- **Describe what a thing IS, never what it must not be.** Repeating a negative
  reinforces it: "must NOT have a hole" made Giardia's adhesive disc render as a
  mouth three times running, while "a scallop-shell fan, uniformly lit" fixed it
  at once — on the cheap model. Same for cristae ("wide wavy ribbons folding
  inward like a rippled curtain") and nuclear pores ("flat portholes").
- **Baked-in text is the dominant failure on molecular subjects.** The ribosome
  lost two model escalations to the model lettering its own A/P/E sites. The
  cure is not a stronger prohibition but removing the surface that invites it:
  RNA's bases stopped attracting letters once they became tick-dashes instead of
  circular beads. Always check magnified crops, not the whole frame.
- **Coloring page borders: crop, don't re-roll.** If the model still draws a
  frame after ~3 attempts it will keep drawing one. Measure the border rows/cols
  exactly, crop them off, and re-trace through `coloring.py`'s own
  `to_bitmap`/`trace_paths`. No extra API call, no re-illustration. Three agents
  arrived at this independently. Composing zoomed-in, so the subject runs past
  every edge, usually prevents the border in the first place; a single large
  character on a diagonal beats corridor and spiral concepts.
- **Anything radiating from a hub is one careless word from a starburst**, which
  is unrecoverable (its outline fuses with the artwork). Compose fibres, flagella
  and spokes as diagonal cables or trailing ribbons crossing the frame instead.
- **Helices: verify handedness, don't eyeball it.** Real DNA is right-handed and
  flash renders came back left-handed on 3 of 4 styles. Test: at a crossing in
  side view, the strand in front runs lower-left to upper-right. Check a
  magnified crossing on every accepted render and record how you checked.
- **`edit_image.py` sometimes re-illustrates instead of cleaning** — stylised
  shapes replacing micrograph texture, or a subject subtly reshaped. Always diff
  the result against the original; if it re-drew anything, discard it and use a
  plain deterministic crop/resize. If the plate has no text or scale bar, skip
  the step entirely. A truthful soft image beats a sharp invented one.
- **Licences: prefer PD / CC0 / CC BY / CC BY-SA.** Avoid NonCommercial — one NC
  image constrains reuse of the whole collection. An unresolved or disputed
  status (Photo 51) is not a licence.
- **Say what kind of image a reference is.** A structural model from PDB, an
  X-ray diffraction pattern and an AFM trace are not photographs; a freeze
  fracture shows the membrane's interior face, not the railroad-track profile.
  Record upscales explicitly with the factor.

## Verification techniques that actually work
"I looked at it and it seemed fine" is not verification. These are the checks that
caught real errors, and each is cheap:

- **Overlay a grid and count.** The tick's eight legs were confirmed with a 100px
  grid overlay on every accepted render — which caught a six-legged coloring page
  that had already passed a glance.
- **Sample the pixel at the anchor.** After `build_svg.py`, rasterise with cairosvg
  and read the RGB at each leader-line anchor. That caught a trans-Golgi label
  sitting on a budding vesicle's neck rather than on the network.
- **Zoom before accepting.** Baked-in text, inverted capsid layers and a spore on
  the wrong pole are all invisible at full-frame scale. Inspect magnified crops.
- **Build a known-good reference and test your test.** For DNA handedness the agent
  generated a synthetic helix with correct parametrization, confirmed its rule
  against that, and only then applied it to the renders. Do this whenever the
  property is one you could plausibly talk yourself into either way.
- **Measure instead of judging.** Border presence → scan edge rows/cols for a
  continuous dark line. Photo softness → Laplacian edge variance, not file size (a
  background-removed AVIF compresses small no matter how sharp it is). Groove
  asymmetry → measure the envelope-width period.
- **Check the count you claim.** If the label says eleven RNA segments or eight
  flagella, either the picture shows that many or the log says it does not.

## Adapting to non-microbe subjects
The pipeline works unchanged for anything in `cells_data.py`, but §1 has to be
re-based each time:
- **Body cells** — real organelles, no bacterial wall/nucleoid/flagellum; drop the
  inapplicable "do NOT draw" items and add the confusions that do apply.
- **Organelles** — the confusions are with each other: smooth Golgi vs ribosome-
  studded rough ER, connected ER cisternae vs the Golgi's separate stack, single
  membrane (lysosome) vs double (nucleus, mitochondrion), mitochondrial cristae vs
  chloroplast thylakoids.
- **Molecules** (DNA, RNA, ribosome) — there is often no photograph to be had at
  all; a structural model is the honest option, labelled as such. Handedness, strand
  count and subunit inequality are the checkable properties.
- **Umbrella entries** — a generic subject whose specific members are already in the
  atlas (e.g. "white blood cell" alongside six named leukocytes) must be rendered as
  a **group** showing the variety, or it just becomes a seventh near-duplicate.
- **Animals / vectors** — the tick is not a pathogen and the text should say so.
- **Sensitive subjects** — cancer gets no war metaphors, no monster, no fear imagery;
  chickenpox is something many children have actually had; Zika's risk in pregnancy
  belongs in the adult and scientific registers, not the kids' text. State the tone
  constraint in the brief, because the default drift is toward drama.

## Scale data conventions (`microbe_scale.py`)
- Structures that are **networks rather than bodies** (ER, cytoskeleton, plasma
  membrane) use the extent they span inside a typical cell, not a diameter — a 5 nm
  membrane thickness would otherwise rank as the smallest object in the atlas. The
  real thickness goes in the description.
- For **molecules** the mass is the meaningful figure (DNA: ~6.6 pg per diploid
  genome); `kDa` exists as a unit for the ribosome and RNA.
- Subjects far above the ~120 µm bar ceiling (Amoeba proteus, the tick) pin the bar
  to full; the printed figure carries the truth. Add a unit to `_UNIT_TO_PG` before
  using it — `mg` was missing and would have raised a KeyError on first use.

## Environment gotchas
- `/tmp` is a 2 GB tmpfs that fills up. Under zsh, `TMPDIR` alone is NOT enough —
  heredocs resolve through `TMPPREFIX`, and a full `/tmp` silently TRUNCATES them,
  which once sent two API calls with empty prompts. Export both.
- `rsvg-convert` is absent and `inkscape` fails under seccomp. Rasterise with
  `uv run --with cairosvg`.
- `gemini-3-pro-image` has a 250 requests/day/project quota, shared across
  concurrent agents. When it returns 429 RESOURCE_EXHAUSTED, flash still works —
  finish on flash and say plainly that a style was capped by quota rather than
  by judgement.

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
- **Cap concurrency explicitly. Two is the working default; four dies.** A
  whole-pipeline agent (research + web fetches + several image renders + multiple
  image views for verification) is expensive. A batch of four full-pipeline agents was
  killed outright by the account session limit within minutes of starting — all four,
  plus their own helper subagents, with almost nothing on disk. Two ran to completion
  reliably for the rest of the run. Only go higher for cheap, narrowly-scoped agents.
  If a batch dies from a session-limit retry storm (check the journal — many `started`
  events per key, almost no `result` events — before assuming slow progress means it
  is stuck), **stop the task and drop concurrency further** rather than let it keep
  retrying unsupervised for hours.
- **Tell each agent to run at most one helper subagent at a time.** A render agent
  that spawns a research subagent and then starts rendering can end up racing its own
  helper on the same files: one agent had to reconcile a stale `prompts.json` and two
  malformed `verdicts.json` written underneath it. It caught the collision, but the
  cheaper fix is not to allow it.
- **Give every agent the environment traps up front** (TMPDIR *and* TMPPREFIX,
  cairosvg not inkscape, the pro-model quota) and the current prompt lessons. Agents
  do not share what they learn; the brief is the only channel. Passing one agent's
  discovery into the next brief measurably reduced attempts — Giardia's positive-
  phrasing fix went into the Zika brief, and no Zika render came back with a spike.
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
- Agents write **different files** (keyed by microbe) so parallel writes don't collide;
  the shared `reference-microscopy` set only gets per-microbe attempt files. No worktrees
  needed (no shared-file mutation). Tell each agent explicitly which sibling keys exist
  in its folder and to leave them alone.

## The barrier step (the orchestrator's job, and easy to get wrong)
Agents must not run these; one owner runs them after each subject or batch finishes.

1. `status.py` → `overview.py` → `build_viewer.py` — **in that order**. `overview.py`
   is what copies finals into `<SET>/finals/`, and `build_viewer.py` reads those.
2. **Then** `tts.py --microbe <key>` for the narration. It reads `viewer-data.json`,
   so a subject that has not been through `build_viewer.py` yet reports "0 clips" and
   silently does nothing.
3. `build_viewer.py` again (to pick up the new audio), then `build_overview.py`.
4. Verify before committing: every live subject should show `img 5/5, svg 3/3`,
   a coloring page, `audio [de, en]` and scale data, and `OVERVIEW.md` should report
   **0 unrendered and 0 "rendered but not reaching the viewer"** — the second number
   is the name-mismatch detector.

Two traps worth naming:

- **Timing.** Running `overview.py` seconds before an agent writes its last file
  yields a subject with `img 0/5` — the meta exists but the finals were not copied.
  If a count looks wrong, re-run the barrier rather than debugging the data.
- **Staging.** `git add -A -- renders/` will sweep up whatever a *still-running*
  sibling agent has written so far, so a commit labelled for one subject quietly
  carries another's half-finished work. Stage per key:
  `git add -- 'renders/set/<SET>/<key>.*' '…/audio/<key>.*' '…/coloring/<key>.*'
  '…/finals/<key>__*' '…/theme/*/<key>.*'` plus the regenerated aggregates, then
  grep the staged list for the other agents' keys and confirm it is empty.

Set-level `OVERVIEW.md` files change only their timestamp when nothing else moved —
that churn is not worth committing on its own.
- **Body-cell** microbes (non-pathogen sets) reuse the same pipeline; adapt §1 labels to
  the cell's real organelles (no bacterial wall/nucleoid) and skip inapplicable "do NOT
  draw" items.
- Keep quality gates strict: science-first research with sources, and the style/border
  checks above are the top re-render triggers.

## Coloring pages (`coloring.py`)
A4 portrait, not square: the artwork occupies the top ~⅔ and the bottom band is left
empty **on purpose** — the viewer injects the subject's title there at runtime, so a
blank band in the raw SVG is correct, not a bug. The speech bubble sits above the
artwork and deliberately overlaps it, with its tail leaning inward.

- Two speech lines per page, EN + DE, carried as SVG `<text>` layers. The viewer
  shows the one matching the page language; coloring pages never offer "no labels".
- Use a real em dash, not `--`. Two pages shipped with ASCII double hyphens before
  anyone noticed; patching the text layer directly beats paying for a re-render.
- German umlauts can likewise be patched into the text layer rather than re-rendered.
- The two unrecoverable failures are the **starburst** and the **frame** — see the
  prompt lessons for why, and for the crop-and-re-trace escape hatch.
- Tone: playful and reassuring. For a pathogen, show *how it is dealt with* rather
  than the harm — a tick being lifted off, soap and water, vaccination drops. No
  blood, no wounds, no distressed characters.

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
- `scripts/coloring.py` — render an A4 kids' coloring page, vectorise it with potrace
  and wrap it with a speech bubble. Defaults to `gemini-2.5-flash-image`.
- `scripts/tts.py` — ElevenLabs narration of the kids' text, EN + DE, with word-level
  timestamps. Separate service, so a Gemini spend cap does not block it. `--balance`
  prints remaining characters, `--dry-run` prints the planned spend.
- `scripts/status.py` — regenerate `RENDER-STATUS.md` (with links) + print the burn.
- `scripts/overview.py` — per-set + per-theme `OVERVIEW.md` galleries (labelled SVG
  embedded), gather finals into `<SET>/finals/`, and write the rich top-level
  `renders/OVERVIEW.md` (sets → alphabetical microbes; per microbe a latest-render row,
  a real-micrograph + labelled-figures row, and an all-language descriptions table).

## After the renders: what else a new subject needs
Rendering is not the whole job. When a subject is added, check these too:

- **`microbe_scale.py`** — size and weight, or the scale meter is simply absent.
- **`microbe_giant.py`** — a plush link, but **only on an exact species/cell match**,
  judged against the catalogue's `species` field. Two traps, both of which produced
  real misses: matching on the parenthetical of `name_en` fails whenever that is a
  common name ("Rhinovirus (common cold)", "C. diff"), and the audit only walks
  *live* subjects, so a plush for something rendered later is never found unless you
  re-run it. Re-audit the whole set after each batch, matching on species **and**
  both names. Vendor photos are used as-is; do not AI-upscale one whose silhouette
  changes under the attempt — a plush toy's outline is the product.
- **Narration** via `tts.py`, after `build_viewer.py` (see the barrier step).
- **`index.md`** — set list and counts, which go stale silently.

## Auth
Env `GOOGLE_API_KEY`, else the first `GOOGLE_API_KEY=` found in a `.env` walking up
from cwd (repo-root `.env` works). Confirm the key + list reachable image models
before the first render; stop and tell the user if either is unusable. Distinguish
the two 429s: a **monthly spend cap** ("exceeded its monthly spending cap") blocks
every Gemini model until the user raises it — save your prompt beside the subject and
stop — while a **daily per-model quota** leaves the other tier working.
Never commit `.env`; the repo root ignores it.

See `reference/` for the model ladder, style templates, verification rubric and SVG
overlay spec — the long-form detail belongs there, and new material should go there
rather than here unless it changes how the pipeline is run.

Everything in the "prompt lessons", "verification techniques", "barrier step" and
"environment gotchas" sections was learned by failing, mostly expensively. If a rule
here looks fussy, it is because something was rendered wrong, shipped, or silently
lost the first time round. Add to them when you find the next one.
