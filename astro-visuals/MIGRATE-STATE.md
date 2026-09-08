# MIGRATE-STATE — where the TypeScript refactor has got to

Working notes for picking this up cold, in a later session or on another machine. The plan being executed is `docs/refactor/inventory/00-PLAN.md`; this file records how far along it is, what has been learned since it was written, and the things that will waste a day if you do not know them.

**Status: `main.ts` is down from 5,347 lines to 3,371 — 37% of it moved into 29 modules. `main` is untouched and still ships v2.78.0.**

Of the plan's 24 steps, twelve are complete (0–9, 11, 14), two are part-done (12, the draw passes: four of eleven; and 15, the `ui/` leaves: one of five), and ten have not started.

This file is the live status; the chat is not. Regenerate the numbers with `wc -l src/main.ts`,
`npx vitest run`, and `git log --oneline main..HEAD`.

## The shape of it

`galactic-transit.html` used to be the source. It is now the artifact: Vite builds `src/` back into exactly that one self-contained file, in place, so `sw.js` still caches it by name, `build_site.py` still substitutes the build stamp into it, and every bookmark still works. Nothing about the deployed page's shape has changed.

The refactor is structural only. Nothing may move a pixel. Visual and scientific changes are three separate projects that come after, and they are already recorded as checkboxes in `TODO.md`: the Milky Way's and Andromeda's rotation, the merger against the current simulations, and the Sun's expansion with the planetary nebula.

## Corrections are allowed — deliberately, and one at a time

The rule was "nothing may move a pixel". The owner has widened it: where the new version can
be **more precise or more correct** than the old, that is welcome — but it has to be reasoned
and verified, not assumed and not smuggled in.

The discipline that keeps this from destroying the gate:

1. **A correction never rides along with a move.** Extraction commits stay null-change, so
   that a difference in the gate always means a mistake. A correction is its own commit, with
   its own reasoning and its own parity run.
2. **Say why it is more correct**, against a source or an argument, not against taste. "The
   old number looks wrong" is not a reason; "the branches do not meet, and here is the
   arithmetic" is.
3. **Say what it changes on screen**, before running the gate. If the prediction and the
   pixels disagree, the change is not understood well enough to make.
4. **Verify it independently of the gate.** A unit test that pins the new behaviour, and where
   the change is visual, a before/after pair looked at by eye.

### Candidates already found and left alone

Each was discovered while extracting and testing, each is pre-existing, each is pinned by a
test so it cannot drift further, and each is recorded in `TODO.md` against the project that
should decide it:

| what | where | why it is a candidate |
| --- | --- | --- |
| `sunState` steps L 2.2424 → 2.2000 and R 1.7801 → 1.6000 at 10.9 Gyr | `astro/sun` | The main-sequence and red-giant branches do not meet. The radius step is a tenth of the drawn disc, gone in one frame. |
| `sunState` steps L 0.5 → 0.1 at 12.44 Gyr | `astro/sun` | A five-fold dimming in a single frame, because the white-dwarf branch starts from "a tenth of today's Sun" without meeting what the previous branch was leaving. |
| `earthPrime` calibrates against whatever origin the first call happens to see | `astro/earth` | Which way the planet faces depends on *when* the globe pass first ran. A scenario that jumps the clock before the globe is drawn calibrates against a Sun in the wrong place. |
| `sepScene` steps 0.02% at the 82.8 kpc compression handover | `astro/merger` | Invisible, but the two branches genuinely do not meet. |
| Corotation at r = 640 rather than the measured ~8.5 kpc | `astro/constants` | Deliberate, and load-bearing: the measured value ends the glacial epochs. A decision about what the piece claims, not a bug. |

The first four are arguably wrong. The fifth is arguably right, and is the one that needs a
conversation rather than a fix.

## Where the work is

| | |
| --- | --- |
| worktree | `/home/markusg/Private/claude-experiments.ts-refactor` |
| branch | `refactor/ts-modules` |
| baseline pin | `fd0f980` — v2.78.0, the last commit to touch the page before any of this |
| node | 26.x, npm 11.x |

The pin lives in `tests/harness/pin.ts`. Playwright's `globalSetup` materialises it as `baseline-page.html` next to the live page, so the build under test and the build it is compared against fetch byte-identical data files over identical relative paths.

## Getting to a working state from a cold checkout

```bash
cd astro-visuals
npm install
npx playwright install chromium     # no --with-deps; it wants sudo and does not need it
npm run verify                      # check + unit tests + build + boot + parity
```

There is no baseline step and nothing to pre-generate. That is a deliberate change, made after stored reference images caused three separate phantom failures — see below.

| command | what it does | cost |
| --- | --- | --- |
| `npm run check` | `tsc --noEmit` | seconds |
| `npm test` | 91 unit tests | under a second |
| `npm run build` | Vite → `galactic-transit.html` + `check-build.mjs` | seconds |
| `npm run e2e` | boot tests + all 23 parity states | 35 min to 2 h |
| `PARITY_SCOPE=fast npm run e2e` | boot tests + the 5-state subset, for per-step checking | 15–40 min |
| `npx playwright test --project=boot --project=parity --grep '<ids>'` | the states a change actually touches | ~4 min each |

**The gate's cost is not a fixed number, and planning around one wastes an afternoon.** Both builds are photographed concurrently, each driving its own software rasteriser, so a run wants roughly twice the machine and gets what is left of it. The same state — `opening-helix` — took 2.4 minutes in the morning and 6.8 in the afternoon of the same day, and `theia-impact` took 9.3. Watch the first two states and re-plan from what they actually cost rather than from the numbers above. When the machine is slow, `--grep` the states that exercise what the commit touched: `states.ts` gives every one of them a `covers:` line saying what it is for, and that is what it is for.

## The gate, and how to read it

24 states in `tests/harness/states.ts`. Fifteen are the page's own `#jump` scenarios, driven through the selector and its GO button — the flow a visitor uses. The other nine exist because `00-PLAN.md` §5.2 lists things a desktop screenshot cannot see: four viewport bands, a phone layout, a fresh profile, a reduced-motion-allowed boot, a second timezone, and an open tooltip.

**On a mismatch the gate runs its own control**, photographing BOTH builds a second time and requiring each to reproduce itself. If either cannot, the state reports as inconclusive rather than as a rendering change. The first version of this re-shot only the reference, which catches an unstable reference and quietly certifies an unstable candidate — and on the run that exposed it, the built page was the wobbly side and two harness flakes were reported as real differences.

**There are no stored baselines.** Each test photographs the pinned pre-refactor page and the built page back to back, moments apart, on the same machine under the same load, and compares those two. Storing reference PNGs looked obviously right and was the source of every unexplained failure in this project: three times a state came back differing by tens of thousands of pixels, and three times the stored reference was the odd one out — perfectly reproducible in the mode it was captured in, different in the mode it was compared in. A reference photographed as one of twenty-four in a batch is not the same measurement as one photographed alone, and no amount of pinning inside the page fixes an asymmetry that lives outside it.

**`PARITY_SCOPE=fast` runs five states instead of twenty-three.** It is for keeping a twenty-step migration moving, not a replacement for the full set — run everything at a phase boundary and before any merge. The subset reaches the galaxy from inside and outside, both globes, the merger, the belts, both trail kinds and the tone-map knee.

**Tolerance is measured, not assumed — and it is on AREA, not amplitude.** Four populations have been measured over this refactor:

| | amplitude | area |
| --- | --- | --- |
| structural mistakes | max Δ174–252 | 5–22% |
| harness instability | max Δ238 | 20–22% |
| rasteriser rounding | max Δ1 | ~0.3% |
| a handful of pixels | max Δ33 | 0.014% |

Amplitude does not separate them: a real mistake and a harness wobble both reach Δ238. Area does, by two orders of magnitude — everything that has ever been a genuine error covered at least 5% of the frame, because moving a star or shifting the sky moves thousands of pixels at once.

So a difference passes if EITHER it touches at most 0.05% of the frame at any amplitude (a few hundred pixels cannot be a moved galaxy), OR no pixel differs by more than 1 and it stays under 1% (the rounding floor, faint but everywhere). The numbers print on every state, pass or fail. **If a state starts sitting near either limit, that is a finding, not a flake.**

**The first visit is not photographed at all.** The performance probe measures the machine, so photographing that path twice runs the benchmark twice and can honestly get two answers — it came back 35% of the frame different at max Δ254, which is a different number of stars rather than a different rendering. It is asserted in `tests/e2e/boot.spec.ts` instead: that it runs, picks a tier no heavier than medium, saves it, and stages the opening without throwing.

## What makes the page reproducible — do not undo any of these

Each of these cost a run or several to find. They live in `tests/harness/session.ts`.

- **`Math.random` is seeded.** The galaxy, both nebula fields, the dust and the belts are all sampled. This is also why the generators may not be reorganised: the parity gate compares a seeded stream, so the order and count of draws is part of the picture.
- **`Date` is frozen.** The opening `simT` is the elapsed fraction of a year since 2026-01-01.
- **A settings fixture is written before boot.** A fresh profile runs the first-launch performance probe, which *measures the machine* and picks a detail tier from the result — so an unpinned profile draws a different number of stars on a fast run than on a slow one.
- **The five data fetches are serialised.** `loadGalaxyMap()` and `loadM31Map()` each call `setGalaxy()` from their `.then()`, so whichever wins the race decides where the seeded PRNG stands when the galaxy is generated.
- **The frame clock is virtual, ticks once per REAL FRAME, and starts stopped.** `shimT` accumulates real elapsed time and drives the star variability phase — "runs even when paused", says the line that does it. Counting `requestAnimationFrame` *calls* rather than frames made the clock run at a rate that depended on how much the tour had redrawn; the page registers rAF from three places and Playwright registers more.
- **Every capture gets its own browser process.** The same state photographed as one test of twenty-four differed from the same state photographed alone by 16% of pixels — reproducible within each mode, different between them. A software rasteriser accumulating state across two dozen WebGL contexts in one process will do that.
- **One worker.** Three workers still broke the symmetry between the two shots, even taken back to back — 5% of the frame at max Δ155. Wall clock is close to a wash anyway; the workers were only splitting a fixed amount of CPU.
- **`__arm` forgets the last counted frame.** The page registers two rAF callbacks inside one real frame in places, and a pair straddling the arm left the budget one frame short — a discrete difference, which is why one state produced *exactly* the same differing-pixel count across runs made days and two harness designs apart.

Two page-specific traps worth knowing: `#tPause` carries class `on` while the piece is **running**, not while it is paused; and dismissing the first-run tour **starts** the clock, so pausing has to come after.

## Done

Every entry gated. "Gate" means the parity suite green — see above for what that now means.

| what | commit |
| --- | --- |
| toolchain, 13-agent inventory (`docs/refactor/`, 404 KB) | `91b8533` |
| the parity harness, proved byte-exact | `fc5be09` |
| **step 1** — page built from `src/`; classic `<script>` → deferred ES module | `0ff1a82` |
| harness made trustworthy; 30/30 | `52381d0` |
| **step 2** — stylesheet → 4 files, cascade asserted on source *and* artifact | `7a60435` |
| **step 3** — 23 shaders → `.glsl`, byte-exact, `?raw` | `7a3de48` |
| **steps 4–5** — `core/` errorlog, build, mat4, rng, dom | `d64b15f` |
| **step 6** — `astro/constants`, `astro/sun` | `bacb3a0` |
| `astro/merger` + 21 tests | `740c645` |
| **step 8** — `gpu/`; the gate stops storing baselines | `b644d8f` |
| MIGRATE-STATE.md | `cba8acd` |
| `astro/bodies` + Kepler's third law as a test | `45a70ae` |
| `astro/sun` life cycle, `astro/environment` — three findings | `6c6e33e` |
| `astro/earth` + `scripts/check-names.mjs` | `58f7eef` |
| **step 7a** — `simClock` | `227a397` |
| both builds photographed concurrently; full gate 1.4 h → 34 min | `6e43bf4` |
| **step 7b** — `cam` | `468616b` |
| **step 7c** — `gfx` | `5cff82c` |
| **step 7d** — `view`, `readout`, `lifeAcc` | `9d2f692` |
| `scene/starfield` | `da28433` |
| `scene/galaxy` | `28e0c59` |
| `scene/andromeda`; the gate runs its own control | `b37f5d3` |
| `scene/belts` | `9220ba9` |
| `astro/g710`, checked against Bailer-Jones 2018 | `0c6ae6a` |
| `scene/sky` | `68dd011` |
| sound covered *before* being moved | `173dea8` |
| `audio/` | `7bf6539` |
| `core/format` + 10 tests | `ff065df` |
| `ui/tooltips`; two-sided control; gate relaxed on area | `e0abaaf` |
| `render/passes/belts` — the first draw pass | `204e43e` |
| `render/passes/tone`, and the rule about being last | `e14f20d` |
| check-build rejects a rename that reached into prose | `7a7d506` |
| `render/passes/sun` — the disc and the shed envelope | `1e2ecc4` |
| `render/passes/rings`; `belts` takes back the Oort shell | `db915dc` |

### Where the code lives now

```
core/     errorlog build mat4 rng dom format
astro/    constants sun merger bodies environment earth g710    complete, pure
scene/    starfield galaxy andromeda belts sky                  complete, pure
gpu/      context program buffers
render/   state  passes/belts passes/tone passes/sun passes/rings
audio/    index
ui/       tooltips
```

`astro/` and `scene/` are finished and contain no DOM or GL reference at all — the boundary a
WASM port would need, and the code the science projects rewrite.

Tests: **173 unit, 8 boot, 23 parity.**

## Next

Roughly half the file remains, in three pieces:

1. **The draw passes** — `frame()` is 819 lines (2256–3075). `render/passes/belts` is the
   template: programs, uniform tables, vertex arrays and the draw together; geometry
   uploaded by an explicit `init*()` from main.ts so the RNG sequence does not move; inputs
   passed as an argument rather than reached for. The per-frame context is being discovered
   from what each pass actually needs rather than designed up front.

   Four have moved — `belts`, `tone`, `sun`, `rings`. What is left falls into two kinds,
   and the easy kind is down to one:

   - **Own program, own draw:** `globe`, and it is the one to take next. It carries the
     Moon and the era terms, it is the largest uniform table in the piece, and it already
     calls `passes/rings` for the Moon's orbit, so the seam is drawn.
   - **On the points program:** `nebula`, `dust`, `bodies`, `g710`, `eatflash`, and step
     10's `points`/`supernova`/`remnant`. These all write through the one `U` uniform
     table, set a value and set it back, and read a dozen frame-locals apiece — `and`,
     `spin`, `warp`, `deep`, `insideDisk`, the Sun's position, the bubble. `nebula` and
     `dust` are closures called four times each in a distance-sorted loop. They need the
     per-frame context object to exist first, so they should go last rather than first.
2. **The interface** — about 1,500 lines: panels, sections, settings persistence, the HUD, the
   scenarios, the tour, the debug door, the QR overlay.
3. **main.ts as boot only**, then the cleanup step.

Two of the plan's steps are deliberately still open: `ui/persist` (the settings replay, ranked
the highest-risk failure in the file — the boot suite already covers it) and the `show`
toggles, which belong with `ui/` rather than with `render/state`.

**Step 11 is behind us**, and the rule it left behind still binds. The seven eval-time RNG consumers are seven explicit calls from `main.ts` in source order — `buildStarfield()` → `setGalaxy(1)` → asteroid belt → Kuiper → Oort → the trail pre-fill → the orbit rings — and the asteroid belt's Kirkwood rejection loop makes its draw count data-dependent, so anything that shifts the stream above it is unrecoverable. Any later step that adds a generator or moves one has to keep its place in that list. It fails on every state at once, which at least makes it impossible to miss.

The step still to be careful with:

- **Step 18**, `ui/hud`. `restoreSettings()` replays saved state through synthetic `input`/`change`/`click` events, so every listener must already be registered. Get the order wrong and the page boots clean, throws nothing, logs nothing, and renders with **default** settings. `00-PLAN.md` ranks it the highest-risk failure mode in the file. Every parity screenshot boots from the settings fixture partly so this shows up as pixels; `tests/e2e/boot.spec.ts` also asserts it directly.

## Decisions made along the way

- **Types are erased, not transpiled.** esbuild's TypeScript loader discards every comment, minified or not — the first build came out 66 kB smaller and all of it was the reasoning. `ts-blank-space` overwrites type syntax with spaces and leaves every comment, line and column where it was.
- **`noUncheckedIndexedAccess` is off**; `strict` stays on. It types every `Float32Array` read as `number | undefined`, which in a renderer where every index is in bounds by construction buys no safety and costs a non-null assertion on nearly every line.
- **`main.ts` carries `@ts-nocheck`** and shrinks with every extraction. Extracted modules are typed properly. The directive goes when the file is small enough to type in one sitting.
- **A mechanical rename has now been wrong in five distinct contexts**, and each one got its guard only after it had already shipped into the build: identifiers inside strings, element ids, property shorthand, local shadows, and — last — the word inside an English sentence, where `audio` became `sound.graph` in the tour's own description of the settings panel. `check-names` covers the identifier cases; `check-build` now rejects an article followed by a state singleton and a property, because that shape is prose rather than code. Assume the sixth context exists and write the guard when you find it.
- **Verbatim means verbatim.** `V_GAL` still writes `900` rather than `R_GAL`; `zoomStep` still clamps to 9500 where the wheel clamps to 7500; `sepScene` still has its 0.02% step at the compression handover. Where two constants ought to agree and do not, that is a question for the science work, not licence for the move to answer it. Dead code is carried across too — cleanup is step 23, separately, with its own parity runs.

## Outstanding before this can merge to `main`

- Steps 10, the rest of 12, 13, the rest of 15, and 16–23.
- Version → **3.0.0**: `BUILD.version` in the page *and* the cache name in `sw.js`. `check-build.mjs` asserts they agree.
- `AGENTS.md` — a section on the new layout, the gate, and the reproducibility pins.
- `TODO.md` — tick the refactor checkbox, naming the version.
- `index.md` — it links the page's files and has not been touched yet; the whole `src/` tree is new.
- `CHANGELOG.md` — regenerated with `python3 ../.github/scripts/build_changelog.py` **after** the commit it describes, as its own commit.
- A CI workflow rebuilding `galactic-transit.html` on pushes touching `astro-visuals/src/**`, following the repository's auto-rebuild convention: `permissions: contents: write`, and a `paths:` filter naming only the sources so the bot's own commit does not retrigger it.
- Merge is `main` fast-forwarded to this branch, per the repo's git workflow. No pull request.
