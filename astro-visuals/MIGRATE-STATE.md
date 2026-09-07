# MIGRATE-STATE — where the TypeScript refactor has got to

Working notes for picking this up cold, in a later session or on another machine. The plan being executed is `docs/refactor/00-PLAN.md`; this file records how far along it is, what has been learned since it was written, and the things that will waste a day if you do not know them.

**Status: 8 of 23 steps done. `main` is untouched and still ships v2.78.0.**

## The shape of it

`galactic-transit.html` used to be the source. It is now the artifact: Vite builds `src/` back into exactly that one self-contained file, in place, so `sw.js` still caches it by name, `build_site.py` still substitutes the build stamp into it, and every bookmark still works. Nothing about the deployed page's shape has changed.

The refactor is structural only. Nothing may move a pixel. Visual and scientific changes are three separate projects that come after, and they are already recorded as checkboxes in `TODO.md`: the Milky Way's and Andromeda's rotation, the merger against the current simulations, and the Sun's expansion with the planetary nebula.

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
| `npm run e2e` | boot tests + all 23 parity states | ~1.4 h |
| `PARITY_SCOPE=fast npm run e2e` | boot tests + the 5-state subset, for per-step checking | ~20 min |

## The gate, and how to read it

24 states in `tests/harness/states.ts`. Fifteen are the page's own `#jump` scenarios, driven through the selector and its GO button — the flow a visitor uses. The other nine exist because `00-PLAN.md` §5.2 lists things a desktop screenshot cannot see: four viewport bands, a phone layout, a fresh profile, a reduced-motion-allowed boot, a second timezone, and an open tooltip.

**There are no stored baselines.** Each test photographs the pinned pre-refactor page and the built page back to back, moments apart, on the same machine under the same load, and compares those two. Storing reference PNGs looked obviously right and was the source of every unexplained failure in this project: three times a state came back differing by tens of thousands of pixels, and three times the stored reference was the odd one out — perfectly reproducible in the mode it was captured in, different in the mode it was compared in. A reference photographed as one of twenty-four in a batch is not the same measurement as one photographed alone, and no amount of pinning inside the page fixes an asymmetry that lives outside it.

**`PARITY_SCOPE=fast` runs five states instead of twenty-three.** It is for keeping a twenty-step migration moving, not a replacement for the full set — run everything at a phase boundary and before any merge. The subset reaches the galaxy from inside and outside, both globes, the merger, the belts, both trail kinds and the tone-map knee.

**Tolerance is measured, not assumed.** No pixel may differ by more than 1, and no more than 1% of them may differ at all. That is not a fudge factor: every real difference caught during this refactor came in at max Δ174–252 over 5–20% of the frame, and the rasteriser's own noise floor comes in at max Δ1 over 0.3%. The threshold sits in a gap of two orders of magnitude. The numbers print on every state, pass or fail, so drift toward the limit is visible rather than silent. **If a state starts sitting near the limit, that is a finding, not a flake.**

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

| step | what | commit |
| --- | --- | --- |
| 0 | toolchain, 13-agent inventory (`docs/refactor/`, 404 KB) | `91b8533` |
| 0 | parity harness proved byte-exact | `fc5be09` |
| 1 | page built from `src/`; classic `<script>` → deferred ES module | `0ff1a82` |
| — | harness made trustworthy; 30/30 on step 1 | `52381d0` |
| 2 | stylesheet → `src/styles/` ×4, cascade asserted on source and artifact | `7a60435` |
| 3 | 23 shaders → `src/shaders/`, byte-exact, `?raw` | `7a3de48` |
| 4–5 | `core/` — errorlog, build, mat4, rng, dom | `d64b15f` |
| 6 | `astro/constants`, `astro/sun` | `bacb3a0` |
| 7 | `astro/merger` | `740c645` |
| 8 | `gpu/` — context, program, buffers; the gate stops storing baselines | (this commit) |

`main.ts` is down from 5,347 lines to 4,595. Unit tests: 91. Boot assertions: 7.

## Next

Steps 9–23 of `docs/refactor/00-PLAN.md` §4, in order. Step 9 is the remaining `astro/` leaves: `bodies`, `earth`, `environment`, `calendar`.

Two of the remaining steps are the ones to be careful with:

- **Step 11**, the `scene/` generators. The seven eval-time RNG consumers become seven explicit calls from `main.ts` in source order: starfield → `setGalaxy(1)` → asteroid belt → Kuiper → Oort → the trail pre-fill → the orbit rings. The asteroid belt's Kirkwood rejection loop makes its draw count data-dependent, so any upstream shift is unrecoverable. It fails on every state at once, which at least makes it impossible to miss.
- **Step 18**, `ui/hud`. `restoreSettings()` replays saved state through synthetic `input`/`change`/`click` events, so every listener must already be registered. Get the order wrong and the page boots clean, throws nothing, logs nothing, and renders with **default** settings. `00-PLAN.md` ranks it the highest-risk failure mode in the file. Every parity screenshot boots from the settings fixture partly so this shows up as pixels; `tests/e2e/boot.spec.ts` also asserts it directly.

## Decisions made along the way

- **Types are erased, not transpiled.** esbuild's TypeScript loader discards every comment, minified or not — the first build came out 66 kB smaller and all of it was the reasoning. `ts-blank-space` overwrites type syntax with spaces and leaves every comment, line and column where it was.
- **`noUncheckedIndexedAccess` is off**; `strict` stays on. It types every `Float32Array` read as `number | undefined`, which in a renderer where every index is in bounds by construction buys no safety and costs a non-null assertion on nearly every line.
- **`main.ts` carries `@ts-nocheck`** and shrinks with every extraction. Extracted modules are typed properly. The directive goes when the file is small enough to type in one sitting.
- **Verbatim means verbatim.** `V_GAL` still writes `900` rather than `R_GAL`; `zoomStep` still clamps to 9500 where the wheel clamps to 7500; `sepScene` still has its 0.02% step at the compression handover. Where two constants ought to agree and do not, that is a question for the science work, not licence for the move to answer it. Dead code is carried across too — cleanup is step 23, separately, with its own parity runs.

## Outstanding before this can merge to `main`

- Steps 8–23.
- Version → **3.0.0**: `BUILD.version` in the page *and* the cache name in `sw.js`. `check-build.mjs` asserts they agree.
- `AGENTS.md` — a section on the new layout, the gate, and the reproducibility pins.
- `TODO.md` — tick the refactor checkbox, naming the version.
- `index.md` — it links the page's files and has not been touched yet; the whole `src/` tree is new.
- `CHANGELOG.md` — regenerated with `python3 ../.github/scripts/build_changelog.py` **after** the commit it describes, as its own commit.
- A CI workflow rebuilding `galactic-transit.html` on pushes touching `astro-visuals/src/**`, following the repository's auto-rebuild convention: `permissions: contents: write`, and a `paths:` filter naming only the sources so the bot's own commit does not retrigger it.
- Merge is `main` fast-forwarded to this branch, per the repo's git workflow. No pull request.
