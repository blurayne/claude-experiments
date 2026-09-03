# AGENTS.md — Galactic Transit

Standing instructions from the project owner for anyone (human or agent) working on
`galactic-transit.html`. The repo root's `CLAUDE.md` and `AGENTS.md` still apply; this
file adds the rules specific to this experiment, collected from the sessions that
built it.

## Release discipline

- **`TODO.md` first.** Every request from the owner goes into `TODO.md` as a checkbox
  *before* any work on it starts, and that edit is committed on its own. Tick the box when
  the item ships, naming the version that carried it. No request is worked on unrecorded.
- Semver, bumped per feature set or fix. Every release updates `BUILD.version` in the
  page **and** the cache name in `sw.js`.
- Regenerate `CHANGELOG.md` with `python3 ../.github/scripts/build_changelog.py`
  **after** the commit it describes, as its own commit — entries cite commit hashes,
  and a hash amended into its own commit never reaches `main`.
- Work on the pinned branch, fast-forward `main`, wait for the Pages run, and report
  the deploy status and live URL.
- **Parse `sw.js` and the page before every push, and let the chain stop on it.** Two
  releases (v2.57.1, v2.58.0) shipped a service worker with two `const V` lines — a
  rebase's keep-both resolution of the version line, which the page's own parse check
  never sees because the worker is a separate file. A syntax error there fails the
  install silently: the page runs, offline and caching do not. `node -e "new
  Function(fs.readFileSync('astro-visuals/sw.js','utf8'))"` is the check; run the ship
  chain under `set -e` so a failed check is a stopped chain, not a line in a log.
- Test headlessly before shipping (playwright-core + the system Chromium with
  SwiftShader flags). Report honest, measured numbers; SwiftShader runs ~6 fps and
  stretches CSS transitions, so slow measurements there are artefacts, not bugs.

## The emblem and the icons

- The emblem is **Galactic Transit** — the wordmark on `icon.svg`'s arc, the manifest's
  `name`/`short_name`, and the iOS home-screen title all say so. The *galactic year* is
  the unit the piece counts, never the name of the piece; the counter, the deep-time
  copy and barbedgreenroom3's track titles keep it and must not be renamed along with
  the branding.
- Every PNG icon (`favicon-16x16`, `favicon-32x32`, `icon-180`, `icon-192`, `icon-512`,
  `icon-maskable-512`) is **derived from `icon.svg`** by `tools/render_icons.js` — never
  edit one by hand. Change the SVG, run the script, commit both. It renders through
  Chromium so the embedded Orbitron face lands exactly as the browser draws it; the five
  plain sizes keep the SVG's own alpha, and the maskable one is drawn at 388 of 512 on an
  opaque `#1c273b` plate so Android's mask cannot crop the emblem.
- The wordmark rides a fixed 597-unit semicircle (`#titleArc`). A longer name has to be
  refitted, not just retyped: measure with `getComputedTextLength()` and keep the arc
  coverage (~88%) and the letter-spacing-to-size ratio (~0.058) the old one had —
  "GALACTIC TRANSIT" at 43/2.5 matches "GALACTIC YEAR" at 52/3. Text that overruns the
  path is silently clipped.

## Scientific honesty (the project's core rule)

- Be accurate to current science; disclose every compression, sampling and model
  choice in the info panel.
- **One clock.** Every readout counts the same elapsed Earth years. The speed
  multiplier carries the range; nothing runs on a hidden compressed clock.
- **Real scale, always.** There is no magnified display mode.
- **Never draw what is inaccurate.** Trails are gated by resolvability (at least a
  dozen samples per orbit); the orbit ring stands in where a swept path cannot be
  drawn; the stylized galaxy-scale planet corkscrew was retired for this reason and
  must not return. Zoomed out, planets collapse into the Sun's point and only the
  Sun's trail draws.
- No fabricated data under a real catalog's name. Data sources and licences live in
  the table in `index.md`; extend it with every new source. Real data preferred over
  models wherever it is reachable (AT-HYG / Gaia DR3 for the local sky, the density
  map for the galaxy's layout, StarHorse pending a user-supplied download).
- When a data file is built from a catalog, verify completeness — a directional
  count once caught half the sky silently missing.

## UI conventions

- The dialog is five collapsible sections — Simulation (speed, multiplier, scenario),
  Audio, Visuals, Hud, Other — each folding from its heading's arrow, with the open
  state persisted. "One section at a time" in Other is on by default and Simulation is
  the section that opens. Each section gathers its switches under a "features" row. A rule separates the
  sections from the action row, which pause leads.
- Every control persists in localStorage and is replayed on boot; new controls join
  `S_TOG` / `S_SLD` / `S_CHK` or the settings object explicitly.
- A returning visitor's saved settings outrank the opening scenario, with one
  exception: at boot it stages the camera and the clock always (a scenario's pace is
  part of its view — the helix is illegible at anything but a year a second), and the
  look sliders only when nothing was saved.
- The piece boots on the **"The helix"** scenario: dive at ~31 AU, 1 yr/s, helix and
  orbit trails together (trails 100%, orbits 50%), yaw 0.7014 / pitch 0.2757 — the
  owner's exported preset. Never unpause a visitor whose system asks for reduced
  motion.
- Settings is a panel, not a dialog: its title is "Settings" at `.env h2`'s size (8.5px,
  7.5px on a phone), matching Simulation and Earth, which share its columns. Its footer
  carries the full/auto toggles on the left and refresh on the right, one line. The build
  stamp and changelog link live in the **info dialog's** second line (`.info-sub`) — and
  that div keeps the id `buildInfo`, because the UTC-stamp tooltip is set on it. Moving
  markup that JS addresses by id is how v2.60.0 briefly died at boot with "Cannot set
  properties of null": the page parses fine, and the failure is only visible at runtime.
  Load the page and read `pageerror` after any markup move, never just the parse check.
- Formerly the settings footer: build stamp in the viewer's own time zone (named, `UTC±0` when
  zero) + short sha + changelog link on one line; version only in the tooltip; no
  reset button. The reload button: 1 tap refreshes past caches, 3 taps also resets
  settings, 10 taps toggles debug mode; feedback is a panel flash at each threshold,
  never a visible counter.
- Debug mode (via `?debug` or ten taps, persisted) reveals the debug dialog button
  and the tuning rows (`hud rate`, `Gaia brght`); everything else stays user-facing.
- Three panels — Simulation, Earth (which carries the view control), Settings — live
  in two columns and are movable: dragging one inward switches its column, dragging it toward its own screen
  edge closes it, and both gestures read one pointer stream so mouse and finger behave
  alike. Each column stacks its open panels first, then the dots that reopen the
  closed ones: down the screen in portrait, across it in landscape. Sides and open
  states persist. Add a new panel to PANELS/pState, never to a bespoke layout block.
  Panels keep two states: `o` is the visitor's choice and is saved; `auto` is the
  layout hiding one to make room and is never saved. When they cannot all fit, the
  newest opened wins — z-index follows open order — and the oldest yields, coming back
  by itself once the crowding lifts. A panel the visitor closed stays closed.
  Pause and help (?) stand at the end of the right column's dock, icon only.
- Panels close with a "−" and leave a "−" button behind; only Settings is marked, by a
  gear. The piece opens with Earth showing and Simulation and Settings folded to their
  buttons. The tour card carries the version, build stamp and hash, and the emblem floated
  to its right — `logo-mark.svg`, which is `icon.svg` with the "Galactic Transit" wordmark and
  the three circles of the frame (the r=246 plate, the r=225 ring, the r=244.5 rim) taken
  off, because the card is a framed panel already. Both are referenced, never inlined. The
  artwork lives in `icon.svg`; edit it there and re-derive the mark, never diverge them.
- A 3-tap reset clears the saved settings but keeps the debug flag: debug is a mode you
  are in, not a setting you tuned.
- Dialogs keep their title and close control fixed while their body scrolls.
- A first visit is met by a guided overlay: a card in the middle and a hint box pinned
  beside each thing it names, joined by a short line, over an unblurred sky. It holds
  the clock while it is up and starts it on the way out, closable only by its button and shown once (the About dialog can
  replay it). The "Sun orbits…" intro lives in the overlay and the About dialog; the
  settings dialog carries only its title and version.
- The left column stacks Focus, Earth and the frames-per-second box in that order,
  each closing up when one above is hidden, and all yielding to the settings panel
  when they would collide.
- Panels get out of the way: the Earth panel minimises to a corner `+`, the status
  bar slides down to a grip (grip visible only while hidden), counters pair on one
  row when the bar wraps on mobile.
- Calendars: era as suffix (`2,026 AD`, `475 BC`); every calendar option names its
  tradition.
- Prefer sliders with − / + steppers (on the right) over button rows; segmented
  buttons (`[on|off]`, `[Gy|10ⁿ|eⁿ]`) where exactly one option is ever lit; label the
  multiplier `× exp` with the real multiplication sign. Galaxy density is the
  **detail** slider (lowest…ultra). The scenario button says **GO** and closes the
  panel. Camera focus lives in the **Focus panel** (top left, above the Earth panel):
  Sun dives to the system, Milky Way pulls out (its button says **GO** too) — there
  are no view toggle buttons. It yields to the settings panel when they would
  collide, exactly as the Earth panel does.
  Trails are governed by the **orbit** and **helix** transparency sliders, which are
  their own switches (0% reads "off"); there is no master trails toggle and no
  separate on/off buttons. Same rule for music and effects volume. The calendar is a
  plain label whose selector carries a `— none —` entry as its off position. Pause
  draws its glyph as inline SVG, since a character can be recoloured as emoji. Events are split into
  **supernovae** and **star birth** switches (planetary nebulae ride with the
  deaths); a new star opens with a brief white pling. Pause uses the monochrome
  text-presentation glyphs (⏸︎/▶︎), never emoji.
- Object and stat switches are checkboxes; the lit-button style is for actions and
  paired choices (labels, events, orbit/helix, pause). `toggle()` handles both kinds,
  so call sites never care which. Volume sliders are their own on/off: 0% reads "off"
  and stops the audio, and raising one from zero builds the graph.
- Defaults: music on at 40% with the remix first; sound effects at 0% (off); supernova and
  star-birth events **off** (the user switches the life cycle on); the supernova and
  star-birth counters **off**; the settings dialog **hidden** (a saved open state
  reopens it). A 3-tap reset clears the saved settings, keeping the debug flag.

## Language notes

- The owner writes in English and German; replies may mirror either. UI copy is
  English.
- Landing pages (`index.md`) stay short, per the root `AGENTS.md`; the info panel
  inside the page is where explanations live.

## The Sun's own life (v2.41.0)

`sunState(ageGyr())` is the single source for the Sun's luminosity, radius and phase, and three
things read it: the drawn disc (so a red giant is rendered at the size the model gives it, not as a
fixed dot), the climate in `environment()` (absolute temperature scaled by L^0.25, which keeps today
exact at L = 1), and the Earth panel. Engulfment is latched against `SUN_EAT_AGE`, never against the
current radius — the Sun contracts after the red-giant tip but the Earth does not come back. Once
`eaten || gone` the panel retitles itself to "The Sun" and hides the Earth rows, because readings for
a planet that no longer exists are not readings.

## Andromeda (v2.42.0)

M31 is drawn by the same probability-map machinery as the Milky Way. `m31-map.webp` is the
Hubble PHAT+PHAST panorama (heic2501a, CC BY 4.0 — credit in the info panel) deprojected to
face-on by `tools/build_m31_map.py`; the `astro-visuals` workflow rebuilds it on GitHub's
runners because the session's egress proxy blocks the astronomy hosts, and commits both the
map and the downloaded source (`tools/m31-src.jpg`) so it can be rebuilt offline. The builder
reads the bulge from the unstretched major axis and rebuilds it round (a raw 1/cos(77°)
stretch cigars it, and no radius-blended remap is monotonic at that inclination), fills what
the footprint misses azimuthally, blots saturated foreground stars, and flips the result so
the arms trail — calibrated against galaxy-map.webp's known-good winding.

`genAndromedaMap()` samples it in M31's own flat disk frame (stars from luminance, dust from
dark lanes, HII from blue excess, drawn Hα pink) plus modelled halo, Giant Southern Stream,
M32 and M110. The shader places whole galaxies via `uGal/uGRot/uGOff`: positions stay in the
local frame, the measured orientation (spin pole galactic 242°,−30°) and the orbit are applied
per draw — never bake an inclination into generated positions. The encounter follows Gaia-era
control points in `M31_ORBIT` (first pass +4.5 Gyr at ~95 kpc, coalescence +8.8 Gyr), true
scale inside ~83 kpc, log-compressed beyond; `uMerge` relaxes both disks into one spheroid,
and spins are damped by (1−merge) but never to exactly 0.0 — that is the shader's "not a
galaxy" gate. Sawala et al. 2025's ~even odds of no merger within 10 Gyr is disclosed; what
is drawn is the median merging branch.

The two map loaders race: cache flushes must go through `flushGxyCache()` (never throw
mid-flush — the loser would leave the scene pointing at deleted VAOs, which draw as a single
collapsed dot at the galaxy's centre).

## After the merger, readouts stop pretending (v2.43.0)

Anything that assumes "the Sun laps a spiral galaxy every 225 Myr" has to end when the disks do.
`sunPhase(ts)` is the Sun's galactic anomaly and the single source for both its drawn position and the
galactic-year counter: the curve is flat, so the angular rate is v/R and the closed-form integral of it
makes the laps lengthen to 3.75x as `sunR` widens. Never advance the anomaly at a fixed rate while the
radius grows — that carried the Sun at 860 km/s, above escape speed at 31 kpc. Past `mergeAt(a) > 0.9`
the HUD stat swaps label and value to the Sun's distance from the centre; the spiral-arm term in
`environment()` fades with `1 - mergeAt(a)`; and the glacial banner follows the Earth panel's rule —
no frost once there is no Earth. `mergeAt(a)` is the shared pure function for all of it.

## Highlight rolloff (v2.44.0)

The scene renders into an RGBA16F framebuffer and resolves through `pTone`, a fullscreen pass with a
soft-knee curve: identity below `coreKnee`, asymptotic above, the ratio applied to all three channels
so hues survive. Without it, additive stacking clips galaxy cores to flat white — 0.59% of the frame
was pure white at the merger, and that is where all the structure went. The `coreB` slider (Visuals,
default 0.72) is the knee; at 1.0 it reads "off" and the direct-to-screen path is used unchanged, which
is also the fallback when `EXT_color_buffer_float` is missing. `makeHDR()` must be called from
`resize()` — the target has to track the drawing buffer. Any new draw call belongs before the resolve;
anything added after it lands on the tone-mapped image instead of inside it.

## Background handling and the deep-time table (v2.45.0)

`document.addEventListener('visibilitychange', ...)` is the only backgrounding signal used —
never blur/focus, which also fire for a `<select>` or devtools losing focus and would
false-pause constantly. It only undoes what it itself did: `hiddenPausedSim` /
`hiddenPausedMusic` / `hiddenSuspendedAudio` track that, so a visitor who paused by hand
before switching away comes back to a paused scene, not a resumed one. This matters most on
Android, which otherwise keeps a backgrounded tab's rAF and Web Audio graph running.

`lifeState()` gained a fourth tier, 'excellent', for hazard below 0.05 — below where
'habitable' already started. The colour ramp in `setStateColour` is continuous in `h` and
needed no change; only the label boundary moved.

The "Earth across deep time" table in the About dialog (`.evo-table`, wrapped in `.evo-wrap`
for horizontal scroll on narrow screens) is a discrete, independently sourced reference —
23 named milestones with their own temperature/pressure/atmosphere estimates. It is
deliberately not wired into `environment()`: the live model is a simplified continuous
function of solar luminosity and cosmic-ray proximity, and reconciling it against 23
discrete points would mean fabricating an interpolation neither source actually supports.
The intro paragraph says so, so the two are never presented as the same claim.

## The deep-time SVG chart (v2.46.0)

`.evo-chart` in the About dialog is a hand-generated inline SVG (built by a one-off Python
script, not checked in as a build tool since it never needs to run again) plotting the exact
same 23-row dataset as the "Earth across deep time" table right above it — chart and table
must never show two different numbers for the same milestone. Curves are centripetal
Catmull-Rom splines (uniform-parameterization Catmull-Rom loops/overshoots badly given how
non-uniformly spaced these points are, from 0.35 Gyr gaps in the deep past to 0.001 Gyr gaps
near "today") converted to cubic Beziers.

Today's row uses actual recorded planetary extremes (-89/57, Antarctica/Death Valley) while
every other row is a modelled global-mean range — spliced into the same spline that produces
a 146-degree single-point spike, which reads as a chart bug. It is drawn as a separate
whisker instead; only the average, a comparable quantity either way, stays in the spline.
Points whose value exceeds the chart's temperature domain are left unclamped in the path data
and cut cleanly by an SVG clipPath on the plot rect, rather than manually clamped — simpler
and exactly the visual "runs off the top" convention this kind of chart typically uses.

The SVG's font-size is in user units, so on its own it shrinks to illegible sub-4px text once
squeezed into a ~300px-wide phone screen. It carries a fixed intrinsic width (680px) and rides
in `.evo-chart-wrap` (overflow-x:auto), the exact pattern already established for the wide
table — never let an information-dense inline SVG's `width` go to `100%` without checking
what that does to its own internal font-size at real mobile widths.

## Andromeda in the view select, and a load-order trap in the default detail (v2.47.0)

`focusSel` ("Sun"/"Milky Way"/"Andromeda") now jumps on `change`, no GO button — its former
click handler moved there verbatim, split into three branches. `followTarget` ('sun'|'and')
says which absolute-frame position `cam.follow` tracks; the Andromeda branch must set it
*after* the `tDive`/`tView` `.click()` calls, not before — `tView`'s own toggle handler
unconditionally resets `followTarget = 'sun'` as a side effect of turning itself on, so
setting it first gets silently clobbered. `updateAnd()`'s `andPos` treats Earth's sky
direction to M31 as if it were seen from the galactic core, not the Sun — a few percent of
parallax error given M31 sits 765 kpc out against the disk's ~30 kpc width, small enough to
use directly as an absolute-frame camera target the same way `org` and `[0,0,0]` already are.
Framing is 9500 (M31's disk alone is R_A=2245, but its halo reaches ~4200 and the Giant
Southern Stream past 5700 — found by looking at a screenshot that showed close-up haze
instead of the whole galaxy, not by reasoning about the radius alone).

Default detail moved from "lowest" (D=1) to "low" (D=5) — but the *initial* synchronous
`setGalaxy()` call at the top of the script still passes 1, not 5. `setGalaxy(D>=5)` reaches
for `loadGaiaDeep()`, which touches `deepAsked`, a `let` declared later in the file; calling
it during top-level script evaluation throws a TDZ ReferenceError that aborts the entire
script before `$` even exists. The real "low" default is applied by the same mechanism
`restoreSettings()` already uses for a returning visitor's saved density — set the slider's
`.value` and dispatch `input` — but gated on `!hadSaved`, run only after the full script (and
`restoreSettings()` itself) has finished evaluating. Never call `setGalaxy()` synchronously
at parse time with anything beyond the deep-Gaia threshold.

## The view GO button, and a master labels toggle (v2.48.0)

`applyFocusView()` is the view select's jump logic, factored out of the `change` listener so
`focusGo`'s click can call the same function — re-applying the current selection (useful after
the camera has drifted off it) rather than doing nothing new.

`#tLabelsAll` (dock icon "L") does not own any saved state of its own — it is a pure mirror of
the two existing checkboxes (`tLabels`, `tArms`), on whenever either is checked, off only when
both are. `syncLabelsMaster()` is a second, independent `change` listener added alongside their
existing `toggle()` registrations — never touch what those already do. Because the master's own
click cascades by setting `.checked` and dispatching a synthetic `change` (not a real `click`),
it does not fire the checkboxes' `click`-bound save listener, so the cascade calls `saveSettings()`
explicitly — forget that and a choice made through the master silently fails to survive a reload.

## The Galactic Centre is invisible from inside the disk (v2.60.3)

v2.60.1 put the core glow beneath the dust from inside the disk and called it done; the owner's
screenshot showed the core punching through the Rift. Of course it did: the dust multiplies by
(1 − α) per soft sprite, and a handful of overlaps cannot take a core glow to nothing. From Earth
the centre is behind ~30 magnitudes of extinction — it is simply not there in light. So the
Milky Way's core run now rides `coreVis`: zero while the eye is within ~25 units of the plane
AND inside the disk's edge (`dMW < 1200`), ramping in over the next 100 units of height or 400 of
radius. Both terms matter: a height rule alone erased the bulge from the edge-on outside view,
where a real galaxy keeps its bulge glowing above and below the lane (NGC 891). Andromeda's core
is untouched — it sits at b = −21°, above our dust. The bulge's stars still draw; the Sagittarius
star clouds are real. Disclosed in the info panel.

Also here: a request for "a setting to turn off dark clouds" — the switch already existed
(Visuals → features → dark clouds, persisted). Verify that an asked-for control is absent before
adding it; a duplicate switch is worse than none. And the settings title is "Settings" alone now,
the version living in the info dialog and the tour card.

## The Moon as a view (v2.78.0)

- **A follow target is four things.** `followTarget = 'moon'` needs: the option, a branch
  in `applyFocusView` (same order as Earth's — the view and dive toggles reset the target
  to the Sun as a side effect of turning themselves on, so set it after them), the
  position in the frame's `followPos`, and its own floor in `minDist`. Miss the floor and
  the camera stops light-seconds short of a body 3,474 km across.
- **`moonPos` must run before the camera, not with the draw.** The Moon's world position
  was computed inside the globe pass, well after the view matrix is built; following her
  needs it first. It is now called at the top of the camera block when she is the target.
- **The globe pass is gated on Earth's size**, so following the Moon has to open it too,
  or she is never drawn at all. The `a` in that condition does not exist yet — `const a =
  ageGyr()` is the block's own first line — so gate on `followTarget` alone.
- **Before the Theia impact there is no Moon.** The view then holds on Earth, at Earth's
  distance and Earth's floor, and takes the Moon up when she forms. The first attempt fell
  through to the Sun and parked the camera inside it; the second kept the Moon's own floor
  and left Earth two pixels wide. Both were caught by testing the age *before* choosing
  the view, which is the order a visitor uses.
- `MOON_DIA` now names the diameter both the view distance and `moonPx` were computing
  inline.

## An error log for the device that has no console (v2.77.0)

- **Collected only where it is needed.** `TOUCH_DEV` is `(pointer: coarse)` or more than
  one touch point, *and not* `(pointer: fine)` — a laptop with a touchscreen keeps its
  console and collects nothing. On a desktop the log tab says so rather than pretending
  to be empty.
- **Installed before anything else can throw.** The collector sits immediately above
  `BUILD`, at the top of the script, so a boot failure is caught. It hooks `error`
  (in the capture phase, since a failed `<script>` or `<img>` does not bubble),
  `unhandledrejection`, and wraps `console.error`/`console.warn` while still calling
  through. `logErr` folds an identical repeat into a count (`×2`) instead of filling the
  list, and keeps the newest 120.
- **`renderLog` is called from `logErr` through a `typeof` guard**: errors can arrive
  before the function exists, and a collector that throws while reporting a throw is
  worse than no collector.
- **The tabs** live between the dialog's title and its body, shown only in debug mode.
  The log is first and is selected when debug mode is *entered*; turning debug off puts
  the settings back, because without the strip there is no way back to them. The count
  on the tab updates whether or not the pane is open; the pane only re-renders when
  visible.
- **Test on both viewports**: a touch context (`hasTouch`, `isMobile`) and a desktop one,
  and provoke all three kinds — `console.error`, a rejected promise, a throw from a
  timer — plus a repeat, then switch tabs and clear.

## "More realistic colouring" — the one change that is physics (v2.76.0)

- **Asked for realism, look for the physics first.** The Milky Way's base colours come
  from the NASA/JPL illustration the map is built from, so there was no palette to
  "correct". What was wrong was the dust: `DUST_FS` darkened neutrally (`ZERO,
  ONE_MINUS_SRC_ALPHA`), and a neutral darkening over pink haze reads grey-violet.
  Interstellar dust reddens — A_R : A_V : A_B ≈ 0.82 : 1 : 1.32 for R_V = 3.1 — so the
  pass now blends `ZERO, ONE_MINUS_SRC_COLOR` with `rgb = a·(0.62, 0.76, 1.0)`. Lanes
  brown, the Rift red-brown, nothing else touched but the HII knots (toward Hα red).
  Andromeda's dust goes through the same pass and gets the same law.
- **What was not done, and why:** the white-blown core is additive stacking, and a real
  fix is a tone-mapping pass over a framebuffer — a rendering-architecture change, not
  a colour tweak; the `core glare` slider is the owner's knob for it. A palette change
  to the stars would have been taste against an illustration already used as data.
- **Judge before/after on two views:** the face-on Milky Way from outside (dist 4300)
  and the opening view from inside the disk, where the same pass carves the band.

## "I don't see Pangaea" — the record outranks the model (v2.75.0)

- **The report was right for a reason other than the one it named.** The Plate
  tectonics scenario aimed correctly (verified in the real flow, camera flying in on
  its own: Pangaea from four seconds in). What hid the continent was the ice: the
  arm-crossing climate model calls 250 Myr ago a glacial epoch and the globe wore a cap
  down to 47°, over a Permian–Triassic world that was in truth a hothouse. When a viewer
  cannot see the thing, check what is drawn on top of it before checking the camera.
- **Ice from the rock record up to today.** Inside `earthEra`, for 4.03 < a ≤ now, the
  caps come from the record — Ordovician–Silurian (445–430 Ma), Karoo (360–255 Ma),
  Cenozoic from 34 Ma, hothouse (`iceLat` 88) between — and the model only beyond today,
  where there is no record. The HUD's glacial badge stays the model's own statement
  about arm crossings; the info panel says so. Two honest sources may disagree on
  screen as long as each is labelled.
- **Events as staged views.** `Pangaea` (4.318p), `Pangaea Proxima` (4.818x) and `The
  oceans boil away` (5.6v) are options whose value is the age plus a letter: the letter
  makes the value unique for the scenario switch while `parseFloat` still reads the age
  (the handler used `+sel.value`, which would have made NaN of them). `EARTH_AIM` maps
  each to a planet-frame yaw/pitch, from lon/lat as `atan2(cos lat cos lon, −cos lat sin
  lon)`, `lat`. The portraits run at a year a second, which is past the averaged-light
  threshold, so the face is lit; the oceans event runs at ten million.
- **Test each event in the real flow**, not with the camera placed by hand: pick the
  option, wait six seconds, then read age, rate, lock, yaw/pitch, `earthDbg.era` and the
  frame.

## (i) tooltips, and the spin lock under the view box (v2.74.0)

- **One tooltip element, tap to show, tap to hide.** `<button type="button"
  class="info" data-tip="…">i</button>` after a label; a capture-phase click handler
  shows the single `#tip` box under (or above, near the bottom) the icon, clamped to
  the viewport, and hides it on the next click anywhere, on scroll, on resize, or after
  eight seconds. `type="button"` matters inside a `<label>`: an interactive child does
  not forward the click to the input, so the checkbox is not toggled by asking about it.
  `title` attributes stay for mouse users; the icon is the touch path.
- **Keep the tips tl;dr.** One or two sentences, what it does and what it is for, no
  numbers unless they are the point ("100% is one second of the clock at the set
  speed"). Twenty-one icons: the sliders whose units are not obvious (detail, Gaia
  brightness, core glare, orbit, helix, length, hud rate, qr pixels, speed, × exp,
  shuttle, calendar, units) and the toggles that name a feature rather than a thing
  (gaia sky, variables, zoom buttons, spin lock, galaxy years, steady labels, QR
  overlay). Do not put one on "asteroids".
- **The env panel's spin lock** lives in the view row's right-hand column, a flex
  column under the select and the GO button, so it is left-aligned to the box it
  belongs to; `.chk.plain` sets the system text face for it. The settings twin
  (`tSpinLock2`) is unchanged.
- **Headless check:** on a 420×800 touch viewport open both panels, click every
  `.info` that has an `offsetParent`, assert the tip is displayed with the icon's own
  text and lies inside the viewport, then click the body and assert it is gone. Icons
  in hidden rows (hud rate without fps on) have no layout and are skipped, not failed.

## The first launch measures the machine (v2.73.0)

- **Off-screen, two frames in, thirty milliseconds.** `perfProbe()` draws the galaxy's
  star pass (`pPt` + `vaoGxy`, uniforms as the last frame left them) into a hidden
  framebuffer of the canvas's size, repeating until 30 ms have passed; `gl.finish()`
  and a one-pixel `readPixels` after every pass make the GPU account for the work,
  otherwise the draws only queue and the clock measures JavaScript. It runs on frame
  three (`probeFrames`), when the programs are compiled and the opening camera is set,
  and only when there are no saved settings (`hadSaved`).
- **Normalise before you judge.** The first-launch default is the "low" tier, so the
  probe draws 460,000 points, not the 95,000 the budget was written for; `msLow`
  rescales the pass to the lowest tier's point count before `pickDetail`. The model:
  a pass at density D costs about msLow·D/2 (denser tiers draw smaller sprites), plus
  three milliseconds for the rest of the frame, inside an eleven-millisecond budget.
  Never picks above medium — medium is already two million points and the heavy tiers
  fetch and build for seconds; those are a choice, not a default. Past 8 ms per pass the
  pixel ratio is capped at 1 (`dprCap`, used by `resize()`), and both the tier (`dens`)
  and the cap (`dprc`) are saved, so the probe never runs twice.
- **The result is on the info dialog's build line** ("probe 1.2 ms/pass → medium"),
  so a report of "it's slow" or "it looks sparse" can be read against what the machine
  measured.
- **Found on the way:** a saved tier equal to the boot tier left the quality slider
  and its label at the markup default ("low" shown while lowest drew). The restore now
  sets slider and label whenever a tier is saved and dispatches the rebuild only when
  the tier differs.
- SwiftShader measures ~100 ms a pass and picks lowest at 1× — which is the right
  answer for SwiftShader.

## "I don't see the plates move" (v2.72.0)

- **A feature nobody can reach is a bug report.** The plates were moving from v2.69.0 —
  a degree in ten million years — which at the hour-to-year rungs is nothing, and at
  a million years a second is a minute for a fingernail's width. The owner's "can you
  fix" was right: the fix is a staged way in. The **Plate tectonics** scenario lands at
  250 Myr ago, sets ten million years a second, focuses Earth with the spin lock on and
  the eye over the Atlantic (`cam.yaw = 1.047, cam.pitch = 0.35` in the planet frame),
  so 500 Myr play out in fifty seconds under a still camera. Add the scenario for any
  slow phenomenon; do not wait for the visitor to find the rate.
- **Past a few weeks a second the globe has no days.** A frame then spans days, the
  terminator lands somewhere new each time, and the globe strobes. `avgLight` (eased,
  from the clock's years per second: 0 at 2.5 weeks/s, 1 at half a year/s) feeds `uAvg`,
  and the shader blends the Sun term toward the daily mean by latitude, drops the glint
  and the cloud-shadow offset. Disclosed in the info panel. The Moon shares the shader,
  so it is covered too.
- **Land wins over a moved plate's ocean.** Each plate polygon carries ocean as well as
  land, and the first-match lookup let a moved polygon's water punch a straight-edged
  hole into another plate's land (a rectangle of deep sea inside Pangaea). The lookup
  now asks all seven plates and takes land over water, and the highest continentality
  among water claims. Seven texture reads per fragment, on one sprite: nothing.
- **Screenshots in the harness: dismiss the tour first.** A fresh profile shows the
  first-visit tour over everything; `$('tourGo').click()` before the shot, or the
  strip is four copies of the welcome card.

## One state, two boxes; a view sized from the screen (v2.71.0)

- **A toggle shown in two places has one owner.** The spin lock now sits on its own dock
  row and again in the settings' visuals. The dock's checkbox owns the state (it is the
  one in `S_TOG`, so it is what settings restore clicks); the settings twin only forwards
  its change to the dock box and is set from the dock's handler. Never give the twin its
  own listener on the state — two owners drift apart on restore.
- **The Earth view is computed, not a constant.** `earthViewDist()` puts the globe's
  diameter at 80% of the shorter viewport side from the planet's true diameter and the
  vertical field, so a phone and a wide monitor both get a full globe. It reads
  `innerWidth`/`innerHeight` directly rather than the draw's `W`/`H`, which are declared
  later in the file — a view function that runs at boot must not depend on `let`s below it.
- **Earth's epochs are watched from Earth.** The Theia impact, first life and the Great
  Oxidation scenarios set the view selector to Earth and apply it, after the epoch is set
  and before the trails refill. The Sun-swallows-Earth scenario keeps its own Sun-scale
  frame: that one is about the Sun's disc.
- **The settings dialog reads in the text face.** `.chk` is the display font everywhere it
  appears in the dock; a `#hud .chk` rule gives the dialog's checkbox labels the body
  font, no caps, normal tracking — the dialog is read, the dock is glanced at.

## A speed ladder and a spin-locked camera (v2.70.0)

- **The speed slider is a ladder now, not a curve.** `SPEED_RUNGS` holds the rates in
  years per second — 1…32 hours, 1…4 weeks, 1…8 months, then 1…10 years — and the
  slider's value is the rung index (`SPEED_YEAR` = 21 is one year per second, the
  default). The ×10^k slider still multiplies, so the readout is one digit and an
  exponent: n × 10^k. `speedLabel()` picks the unit (h, wk, mo, yr) from the
  effective rate and is the one source for the settings readout and the HUD's rate line.
- **Saved settings carry a schema mark.** The old slider was continuous 0…1 (a week to
  a year); a saved `speed` of "1" meant a year per second and would now mean two hours.
  `saveSettings` writes `sv: 2`; `restoreSettings` converts a save without it through the
  old curve to the nearest rung in log space. Any future change to a persisted slider's
  meaning needs the same: bump the mark, convert on load.
- **Spin lock = the camera in the planet's frame.** With `tSpinLock` on and Earth
  followed, the eye direction, right and up are built from (P, A, −Q) — prime meridian,
  axis, and −(A×P), which keeps the world's handedness — instead of (x, y, z), and the
  view's up is the axis. Yaw is then longitude and pitch latitude, and because P turns
  with `earthPrime(simT)` the same face stays in view at any clock rate; nothing has to
  be a multiple of a day. Switching the lock re-expresses the current line of sight
  (`camDirW`, written every frame) in the other frame so the view does not jump. It
  clears `coreLock`, whose base yaw would otherwise add on top.

## The Earth's map is real, its plates a disclosed schematic (v2.69.0)

- **Coastlines from data, motion from keyframes.** `earth-map.webp` (2048×1024, built by
  `tools/build_earth_map.py` from the GSHHG shorelines bundled with `basemap`) carries
  today's land in R, a plate id in G (seven hand-drawn polygons: Antarctica, India,
  Australia, the two Americas, Africa, Eurasia) and a blurred "continentality" in B. The
  globe shader looks each fragment up through the inverse rotation of every plate and
  takes the first plate whose id the map returns there, so a plate carries its own
  land and nothing else. Without the texture the shader falls back to the old noise.
- **Poles are derived, not guessed.** Each plate's pole is the great circle from its
  seat today to its seat in Pangaea (Africa held still); the keyframes are fractions of
  that one angle, and Pangaea Proxima runs the same arcs back. The first hand-picked
  poles swung the Americas north-west and Australia away from Antarctica; the fix was
  to render the model *offline* (a 30-line NumPy port of the shader lookup) as flat maps
  at eight epochs and read them, rather than hunt for the mistake on the globe, where the
  lit face hides half the planet. Keep that habit: check any plate change on the flat
  strip first.
- **The info panel says what this is.** A schematic of the published reconstructions,
  not a plate model — the words are in the panel because a viewer with a geology
  textbook would otherwise be right to call it wrong.
- **Sea level and dryness ride the map.** `uSeaLevel` retreats the oceans toward the
  regions farthest from any coast (the continentality channel) as they evaporate;
  `uDry` widens the desert belts. `earthEra` now carries the Ordovician and Karoo ice
  caps, the Cretaceous hothouse, the Permian and Proxima interiors as dry periods.
- **Headless renders of the globe must aim at the sub-solar point.** The test camera's
  first pass pointed at a fixed longitude and photographed the night side at every
  other epoch. Take the Sun direction from the same body array the draw call uses.
- **Structure labels hide at once on the globe.** The debounced hide needed two frames
  and left a "Kuiper belt" over the Earth in every headless shot; they now drop the
  moment the globe is bigger than 40 px.

## Earth as a globe, and what it took (v2.68.0)

Earth and the Moon are point sprites whose fragment builds a sphere: the normal from the
sprite coordinate (`q.y` flipped, `q.x` times `SKY_MIRROR` — the projection is mirrored,
the sprite is not), lighting from the Sun's direction in view space, the surface from 3-D
value noise on the unit vector in the planet's own frame (`uAxisV`, `uPrimeV`), so the
planet turns under its map. `earthEra(age, meanC)` turns the clock and the climate into the
uniforms; `earthPrime` solves the spin phase once so the Sun stands over Greenwich at noon
on 2026-01-01. Decisions and lessons:

- **The origin stays at the Sun.** Earth is 1 AU out; float32 rounds positions there to
  ~9 km, under a pixel on a 6,371-km globe at any zoom the view uses, so no origin refactor.
  The near plane's floor went from 1e-9 to 1e-13 (no depth buffer, it costs nothing), the
  Earth-view floor is 2e-11, and the ladder has rungs at 1.2e-10 (the globe) and 3.2e-9
  (the Moon's orbit).
- **Everything sized around the Sun must use `camSunDist`**, the camera's distance to the
  Sun, not `cam.dist` (the distance to the followed body): the Sun's disc, its dot, the
  nebula. From Earth the Sun filled the sky until this was fixed.
- **Calibrate noise thresholds by porting the noise**, not by guessing its statistics: the
  shader's fbm averages 0.485 with spread 0.113, not 0.7; 29% land is at 0.547, 6% at
  0.660 (`qr`-style offline port in the scratch tests). The first guess gave 1% land.
- **The climate model's early Earth is wrong on purpose** (faint young Sun, no greenhouse):
  −12 °C at 0.05 Gyr. The globe's ice follows the rock record before the Phanerozoic.
- **From the globe's zoom every swept path, ring and structure label is a line across the
  sky.** Gated on `globePx > 40`; the Sun's and the Moon's labels stay, being sky positions.
- The globe shader is the heaviest fragment in the piece; SwiftShader manages ~1 fps on it,
  which also means **timing-based checks (label debounces) cannot be judged there**. It runs
  four noise octaves, shares one detail texture across rock, vegetation and ice, and skips
  the lava and city terms when their weights are zero.
- The blauwfilms "realistic Earth" article the owner pointed at is blocked by the egress
  proxy; what was adopted is the standard recipe — soft reddened terminator with a lights
  crossfade, cloud shadows, atmospheric Fresnel, restrained glint, forward-scattering snow.

## The planetary nebula is an event, staged over its age (v2.67.0)

`PN_FS` is driven by `uAge` (0..1, from `pnState`) and `uBurst` (a Gaussian in age around
0.07, set in the draw call). Stages: `eject` (envelope off, warm dust), `ion` (the front at
`rIon = mix(0, 1.08, ion)`; teal [OIII] inside, warm outside; the fast wind's `cavity`), `old`
(thinning). The onset needed its own trick: the flash fires while the shell is a few pixels
wide at any sane framing, so during the burst the sprite is drawn up to 3.5× the shell —
`gl_PointSize × (1 + 2.5·burst)` — and the shader measures everything that belongs to the
shell in `r = rg·grow` while the scattered-light halo and the star's glare use the raw `rg`.
It is a reflection halo, physically, not a shock: the owner asked for "something of an
explosion" and "scientifically correct", and that is where the two meet. Judge a staged
shader by a strip of ages (`test_pnseq.js`: set `simT` from the target age through
`pnState`'s mapping, one screenshot each), never by one frame.

## The state as a QR code, and how an encoder gets trusted (v2.65.0)

`qrEncode(text, forceMask)` is in the page: byte mode, EC level L, versions 1–40 chosen by
capacity, alignment and version tables inline, Reed–Solomon over GF(256), masks scored by the
four penalty rules. It was verified against Python's `qrcode` module for module — every size
from v1 to v33, fixed masks and auto-chosen ones — after two real bugs: alignment patterns
that sit on the timing lines were being skipped (the spec omits only the three that overlap
finders; that first bites at v7), and the copy inlined into the page had lost its bit cursor
(`let bi`) to a cleanup, which a `try/catch` around the call turned into a silent blank
canvas. Two rules from that: verify the *inlined* copy, not the standalone; and never let a
debug feature swallow its own exception. The overlay (`qrRedraw`) encodes `exportState()`
minus the timestamp, so the code holds still while nothing changes; it is drawn at 1, 2 or 4
DEVICE pixels a module (`cv.style.width = size/DPR`), redrawn once a second on change, and
its block must precede the debug initialiser that calls it, or the page dies at boot on a TDZ
error. The proof is a decode: OpenCV's `QRCodeDetector` failed on the page's v23 drawing while
reading a reference one — `zxing-cpp` reads the drawn overlay back to the exact payload. Use
zxing to judge, not OpenCV.

The overlay's position is stored as fractions of the FREE space (`qrPos`, `qrPlace()`), not
pixels: (1,1) is the bottom right corner whatever the screen size or module scale, so it holds
its corner when the scale changes and after a rotation. `qrPos` is declared beside
`saveSettingsNow`, above the code that reads it — inside the overlay's own block it was a TDZ
error at boot — and `qrHeld` stops the one-second redraw snapping a code back mid-drag.

**Timing-based gestures cannot be tested through this harness.** A double tap asked for at
150 ms took 2551 ms to arrive: the SwiftShader render loop starves both CDP round trips and
in-page `setTimeout`. Measure the gap that actually elapsed before believing a timing failure,
then test the branches deterministically — two taps dispatched back to back (gap 0) prove the
"within the window" path, a deliberately slow pair proves the other, and a pair with movement
proves a drag is never a tap.

The Debug section is a real section: `SECS`, `SEC_BODY`, `secOpen` all carry `debug`; its
heading is hidden outside debug mode and the body folded through `applySecs()`, never by an
inline `display` (which beats the fold's class). Entering debug — ten taps or `?debug` in the
URL, not a plain boot with the flag set — switches the QR on.

Trails in reverse: `refillTrails()` samples `simT − dirT·(N−1−k)·DT` with `dirT` the shuttle's
sign, so the sweep is what the viewer watched; it is re-run on every change of the shuttle's
sign in `setShuttle` (the drive-sign refill in `frame()` does not fire while paused).

## Zoom buttons step a ladder of objects (v2.64.0)

`ZOOM_OBJ` is the ladder — camera distances at which each object fills the view (1 AU across
= 4.67e-7, 1 ly = 0.0288 in `cam.dist` units), from the Sun's disc to the Local Group;
`ZOOM_RUNGS` adds the geometric midpoint between each pair, so two presses go object to
object. `zoomStep(dir)` moves `cam.distGoal` to the next rung more than 3% away in log space
and lets the frame's log-space easing do the motion; nothing else changes, so it composes with
the wheel, the pinch, the pan and the focus buttons. The dots ride the right dock under play
(`dock.push` order: labels, help, pause, +, −; v2.64.1 moved them from under help); `tZoomBtns` in Visuals toggles their `act` class and re-lays the
dock, and is in `S_TOG`. Two traps: any `$('…')` listener placed above the `const $` line is a
TDZ error that kills the page (register listeners with the toggles, not next to the helper);
and `realMode` is not the dive flag — the 25-unit floor belongs to the schematic mode, so an
"enter the dive at the floor" branch was dead code and is gone.

## Andromeda's arms: favour the map's ridges, and measure at screen scale (v2.63.1)

`loadM31Map` builds a `ridge` map — a pixel's excess over a wide (box 9 × 4, ~20 px) blur,
relative, clamped at 0.3 — and weights the star, HII and haze draws by (1 + K·ridge), K = 24
(`M31_ARM_K`), the haze at 60% of it; `genAndromedaMap` draws a ridge star brighter by a
quarter of that. The 5-px `blur` is untouched: the dust lanes and the wave flag read it.

Three things learned the slow way. (1) The map's ridges are small — mean 0.08 — so K must be
large; 3 was invisible, 12 barely measurable. (2) A per-pixel contrast sweep on the map
flattered every setting: at the screen's scale (a 6-px blur ≈ 4 map px) the base weight's
ring contrast is ~1.5, and K = 24 lifts it to ~2 — the picture holds no more, and a valley
cut buys nothing. Sweep the *blurred* weight. (3) The haze is ~40% of the disk's light on
the rings; keeping it smooth "to preserve the disk" was exactly what buried the arms. When
isolating layers in-page, mind the run lengths: the haze draw reads `AND_GLOW`, the core
`N_ANDN − AND_PINK − AND_GLOW` — zeroing `N_ANDN` alone removes only the core, which no ring
crosses, and the diagnostic reads "no change".

## Two-finger pan lives in screen space (v2.63.0)

`panF` is a fraction of the view's height along the camera's right and up vectors, applied to
the target at `tgx/tgy/tgz` after `yawE/pitchE` are known; screen-right is world-right times
`SKY_MIRROR`, and dragging the scene right moves the target left, hence the signs. Screen
space, not world units, on purpose: a pan is a composition, and it must survive a zoom (kept)
and never strand the Sun (a world offset made at galaxy scale would sit a thousand units off
after a dive). Clamped to ±2 view heights. Cleared at every `reseedFollow = true` and on the
dive toggle. The pointer bookkeeping (`touches`) drives it from the two-pointer centroid; the
pinch keeps reading the spread from the touch events, so the two gestures do not bleed into
each other — verified with real CDP touch: parallel fingers pan without zoom, a spread zooms
without pan. Test gestures with `Input.dispatchTouchEvent`, never with `page.mouse`.

## The status bar's width is held, never chased (v2.62.1)

`.gamebar` is flex-sized by its numbers, so as "2,026 AD" becomes "1,200,002,026 AD" and back
the bar twitched. `holdBarWidth(now)` runs on the HUD tick: lift the `min-width`, measure,
raise the floor at once if wider, lower it only after a full second of narrower content, then
set the floor. A floor never blocks widening, so growth needs no code. Measured with
`getBoundingClientRect()` after clearing the style — one forced layout per tick at 8 Hz, and
no paint between the clear and the set. The idea generalises: for anything content-sized that
must not jitter, hold the max and release on a timer; never animate the width.

## The shuttle: a hand on the clock, in either direction (v2.62.0)

Third slider in the Simulation panel, −100…+100, default 0, reset in place of the steppers.
The one design decision: **0 means "not engaged"**, not "stopped" — the literal spec (+50 is
half speed, so 0 would be zero speed) would have opened the piece frozen, since the default is
0. So at 0 the clock belongs to play/pause exactly as before; off 0, `drive = shuttle/100`
replaces the play state (it outranks pause, so a paused scene can be nudged), and reset hands
the clock back. Not in `S_SLD`: a shuttle rests at 0 when you pick the piece up. This was the
first time the clock ran backwards: the trail is not a history buffer but recomputed from any
time by `refillTrails()`, so reverse refills it at ~10 Hz (2,400 samples a body) and every
change of sign refills once, so a path is never extended from a stale end.

Two boot-killers caught by the page test, both invisible to the parse check: `let n` moved
inside an `else` while `if(n>0)` still read it below — a ReferenceError every frame, and the
clock simply never advanced; and a reset button with class `stepb` but no `data-step` threw in
the shared stepper handler. Any `.stepb` without `data-step` is now skipped.

**`set -e` does not stop a chain at this harness's top level.** The v2.62.0 release shipped
with its docs step failed: the script's first assertion threw, and the version bump, commit,
changelog and push all ran anyway — the commit message even claims a panel sentence that was
not there. In a fresh `bash -c` errexit works, so the harness must wrap the script in a
construct that suppresses it (an `&&`/`||` list or an `if`, where POSIX ignores errexit).
Never rely on `set -e` here: end every step that must not fail with an explicit
`|| { echo FAILED; exit 1; }`, and chain the release commands with `&&`. The Release
discipline bullet above that says "let the chain stop on it" is wrong on the mechanism.

## The scene frame is left-handed; the projection reflects it (v2.61.0)

`tools/build_athyg_stars.py` and `build_starhorse_density.py` place the sky with l=90° on +x,
galactic north on +y and the Galactic Centre on −z. That triple has determinant −1: it is the
mirror image of the real, right-handed galactic frame. Every data set shares it — the AT-HYG
sky, the StarHorse cube, the galaxy and M31 maps (their winding was chosen to trail *in this
frame*), `M31_DIR`, `M31_ROT` — so the piece was self-consistent and wrong the same way
everywhere: seen from galactic north it turned counter-clockwise, and the constellations were
flipped. The fix is `SKY_MIRROR` in `skyProjection()`, the only place a projection is built
(`frame()` rebuilds it every frame for its near plane — a mirror applied in `resize()` alone
was overwritten and did nothing). A reflection flips spin and winding together, so trailing
arms stay trailing; the drag multiplies by the same sign so the world still follows the hand.
The opening helix view is now the mirror image of the owner's exported composition — same
content, correct handedness.

Verify handedness against the sky, not against intuition: from the Sun with galactic north
up, Rigel (l=209°) must be LEFT of Betelgeuse (l=200°), because longitude grows to the left
on the sky; from +y looking down, a point at +z must move toward +x CLOCKWISE. Both are in
the scratch test `test_mirror.js`'s method — recompute the stars from (l, b, d) with the
builders' mapping and project them with the page's own matrices, old build against new.

On the rates, for the record (measured in-page over 100 Myr): the Sun turns 160°, the
flat-curve rate at R_GAL = 900; the wave pattern 225° (corotation r = 640, 19 kly). The 41%
is deliberate: it is the ~140 Myr arm-crossing cadence, and `environment()` only crosses the
11.2 °C ice threshold on an arm crossing (`dT = −5.5·(cr−1)/1.5`, arm term 2.2 vs plane
0.5). Move corotation to the measured ~8.5 kpc and the glacial epochs end; that is the
owner's decision, not a bug fix.

## The spot at the Galactic Centre was stars, not glow (v2.60.4, reverting v2.60.3)

The owner marked a hard bright point sitting in the dark lane at the centre, from inside the
disk. v2.60.3 answered by hiding the whole core *glow* run inside the dust layer — and the
point stayed, because it was never the glow: `genGalaxyMap` places a nuclear stellar disc
(~200 pc, 2.2% of the stars) and the nuclear star cluster around Sgr A* (4 pc, 0.4%) in the
**star** buffer, drawn after the dust and never darkened, and from 8 kpc they all land on one
pixel and add up. The owner asked for v2.60.3 reverted and only the marked thing fixed:
reverted in full, and the star buffer's nuclear range `[NUC0, NUC1)` is now skipped while
`insideDisk` (cached per density in `gxyCache.nuc`; the schematic galaxy has none). The core
glow and the bulge's star cloud draw as before, the lane through them.

Lessons: when a report comes with a mark, reproduce *that pixel* before theorising — aim the
camera at it (`coreLock = true; cam.yaw = 0`) and compare the frame with the suspect drawn
and hidden; and a "fix" that changes more than the mark is not what was asked for even when
it is physically defensible. Reverting a bundled release: keep the part the owner asked for
separately (the bare title) and say so.

## The frozen interface has two layers; the textured one is the frost (v2.60.2)

A glacial epoch dresses the panels twice, and they are easy to confuse. The `background`
on `.hud/.env/.gamebar/.note/.info-card` is a pale tint over a near-black wash — that is
the layer whose job is to *take transparency away*. The `::before` on the same selectors
is the **textured** one: two rime photographs, screen-blended, at `--iceA × .336`. When a
change is asked for on "the textured background", it is the `::before`.

Measure before choosing between them, and measure over the right backdrop. Reducing the
wash .72 → .576 moved a frozen panel's interior by 0.5/255, because that wash is nearly
black and the panel sat over empty sky; the frost alone lifts the same interior from 21 to
55. I picked the wash first on the comment's wording and the numbers refuted it.

## The Great Rift: the dust's place in the order depends on where the eye is (v2.60.1)

v2.56.1 settled the outside order — haze → dust → stars → HII and core — so the arms' HII
knots sit on the lanes and the clouds never read as black discs. From INSIDE the disk that
order is wrong: the band's light (haze, HII, the core) all lies behind the local clouds, and
drawing the pink after the dust left the helix view a smooth band with no Rift at all.
`insideDisk` (`cam.dist < 45`, the haze fade's own zone) now draws the whole backdrop first
and the dust over it; outside, the v2.56.1 order stands. Two measured facts to keep:

- **The deep dust ceiling is 40 px, and it must stay small.** With the backdrop beneath it,
  40 carves a dark lane along the band and across the core and leaves the glow standing above.
  120 and 220 were rendered and crush the band to a scatter of stars: the multiply compounds
  wherever discs overlap. The intuition "a cloud 300 pc off spans tens of degrees, so let it"
  is wrong here — coverage, not size, is what shows.
- **The ceiling is in device pixels, so scale it by canvas width** (`canvas.width/900`, the
  width it was judged at, clamped 0.45–1.5). At 40 on a 400 px canvas the band went black;
  the app caps DPR at 2, so a phone lands near 800 device px. Judge dust on a phone at DPR ≥ 2,
  never at DPR 1.

Judge the clouds by eye from a dust-on/dust-off pair; the pixel statistics mislead — a
uniform blackening and a carved lane give similar means, and a *falling* spread within the
band is the sign of the former. And a disclosure sentence belongs at the end of its own
`<li>`: searching for the next `</p>` from inside a list put one into the "no WebGL2" fallback
string and broke the script on an apostrophe. The parse check caught it; keep running it.

## Audio must never give up permanently (v2.59.2)

Two places latched "we tried" and then had nothing left that could try again — both fatal for a
whole visit, and both worst on a fresh state, which is why a reset showed it.

- **`armUnlock`** removed its listeners and cleared `unlockArmed` on the *first gesture*, whether
  or not the `play()` it attempted succeeded. A refusal is ordinary (a gesture the browser judges
  stale, an element still loading), and after one the music was gone with nothing listening. It
  now stands down only when the play promise resolves, and listens on `pointerdown`, `pointerup`,
  `touchend`, `click` and `keydown` — a phone may report only some of those, and a control that
  swallows `pointerdown` used to eat the one chance. `playTrack`/`loadTrack` return the promise so
  the unlock can wait on it.
- **`loadBanks`** set `banksTried = true` *before* the work, and its `<audio>` fallback lived only
  in a `.catch`. `decodeAudioData` on a context the browser has interrupted can never settle
  either way — neither branch runs, both `bufs` and `els` stay null, and `playBank` returns false
  for ever (supernovae fall back to the synth, ignitions are simply silent). The latch is now held
  only while an attempt is in flight, a 6 s timer installs the fallback if nothing arrived, and
  every `sfx()` may ask again.

Honest note on testing this one: the local harness could not reproduce the user's report, and
gave contradictory answers — a Playwright `page.route()` anywhere on the page stalls unrelated
response bodies, and a SwiftShader render loop starves body delivery, so `arrayBuffer()` hung in
some runs and not others with no code difference. A first A/B "proving" the service worker
innocent was itself invalid: blocking `sw.js` does not remove an already-registered worker, and
both arms ran controlled. Check `navigator.serviceWorker.controller` in the run, not the intent.
The fixes here are the two provable defects in the code, not a reproduction.

## Backgrounding, and why a swipe died at the panel's edge (v2.59.1)

**Record the intent, never the element's state.** The v2.45.0 visibility handler asked
`!player.paused` and `audio.ctx.state === 'running'` at hide time — but a backgrounded tab has
its `<audio>` paused and its `AudioContext` suspended *by the browser*, often before the handler
runs, so it recorded "nothing was playing" and gave nothing back. `hiddenState` now stores what
the visitor asked for (`!paused`, `musicOn && player.src`, `!!audio`) and restores exactly that;
it also guards against the repeated `visibilitychange` some browsers fire while hidden. Verified
across five paths, the important one being "the browser paused the media first". Note the clock
and the music are independent: pausing the simulation by hand does not stop the music, so a
hand-paused visitor comes back to a paused clock *and* playing music, and that is correct.
Still deliberately not blur/focus, which fire for a `<select>` or a devtools panel.

**A pointer drag needs `setPointerCapture`.** Swipe-to-close worked under a mouse and not under a
thumb, and the reason was geometry, not touch: the panel is 216 px wide on a desktop and
`min(178px, 50vw - 20px)` on a phone, so a 60 px swipe started near its middle crosses the
panel's own edge — `pointerleave` fired and `finish()` ran with `moved` under the threshold. My
desktop test started at 108 px and moved 80, staying just inside, which is why it passed. The
pointer is now captured on `pointerdown` and `pointerleave` is gone as a finisher; `.env` and
`.hud` also carry `touch-action:pan-y`, so the browser cannot claim the horizontal gesture for a
pan while vertical scrolling inside `.hud .body` still works. Test swipes with real touch
(`Input.dispatchTouchEvent` over CDP) at a phone viewport, never with `page.mouse` on a desktop
one — the desktop test is what hid this for three releases.

## Steady labels, and one name for the merged galaxy (v2.59.0)

Every on-screen label now goes through `placeLabel(el, x, y, show)`; nothing sets a label's
`left`/`top`/`display` directly any more. With **steady labels** (Other options, `tLabelSteady`,
in `S_TOG`, on by default) the label eases toward its target with a 60 ms time constant (never a
visible lag), **lands** rather than flies when the target leaps once (a scenario jump, a
reappearance — any move over 90 px in one frame), and **steps aside** when the target leaps frame
after frame: a planet sweeping round its orbit several times a second is motion no label can
follow, and one that tries just spins. It comes back after a dozen calm frames. Hiding is
debounced (0.18 s), so a target flickering across a visibility threshold does not blink its name.
State lives on the element (`el._lb`); `frameDt` is set from the frame's `dt` at the top of the
label block. Off, `placeLabel` is the old direct placement. Two testing notes: `dt` is clamped to
0.05 s, so at ×10⁴ the step is exactly 500 years — 16.97 Saturn orbits — and Saturn's label glides
11° a frame (stroboscopic, not a bug); test whirling at ×10⁵. And the engine is unit-testable in
the page: call `placeLabel` on a scratch element with `frameDt` fixed.

`mergedEl` is the single label "Milkomeda" (Cox & Loeb 2008) at the world origin, shown from
`and.merge >= 0.35` on — the same threshold at which the arm names and Andromeda's names step
down — gated by the arm-labels switch like every other galaxy name.

## The Andromeda map is hand-finished (v2.58.0)

`m31-map.webp` is no longer what `tools/build_m31_map.py` writes. The owner took the v2.56
composite, completed it face-on by hand and with AI (the bulge column and the seams the pipeline
could not close), and supplied it at 2048² — `tools/m31-map-hand.jpg`. The map is that picture
resized to the contract (448², R25 at 188.6 px — the frame is the composite's, so a plain resize
keeps the scale and the orientation) and saved **lossless**, 207 KB, at the size the sampler reads.
`m31-map.json` says `source: hand-finished…`, and `main()` in the builder returns early on that
unless `--force` is passed — the data workflow runs the builder on every push that touches it and
would otherwise put the seam straight back. To rebuild from the pictures on purpose, `--force`,
and expect the seam. The info panel says the bulge zone is a completion, not a measurement; the
sources table credits the completion and, through it, the four instruments beneath it. Winding
(arms trailing under positive spin) was checked against `galaxy-map.webp` before shipping — a
mirrored or rotated finish would have put M32 and the trailing sense on the wrong side.

## Dark clouds sit within the star field (v2.56.1)

The dust sprites multiply what is already drawn (`ZERO, ONE_MINUS_SRC_ALPHA`), so *when* they are
drawn is what they darken. They used to come after the stars and all three nebula runs, so they
multiplied the stars and the core glow down to black discs on top of the picture — invisible for a
long time only because the pass was nested inside the remnant pass (v2.53.0 un-nested it). The
frame now draws: the nebula buffers' **haze run** → **dust** → the star passes → the **HII and core
runs**. A dust lane is less haze, and that is now all the sprite does; the stars already carry
the lanes (they are sampled from the map's luminance, which is low there), so darkening them again
was double-counting. `NEB_PINK/NEB_GLOW` and `AND_PINK/AND_GLOW` are the run lengths (set by the
generators, cached in `gxyCache[key].seg`); `nebulaPass(haze)` draws one half or the other with
`drawArrays` offsets, `dustPass()` is the old block, and the spin/warp/sun constants were hoisted
above the first star draw because the passes need them. The sprite's alpha is also capped at 0.72
with a softer profile: a cloud thins the haze behind it; it does not punch a hole in it.

**Across galaxies (v2.57.1):** the same blend has no depth, so Andromeda's clouds darkened the
Milky Way's haze whenever Andromeda sat behind it on screen — the owner's phone screenshot, a
speckle band across the core with "Andromeda (M31)" labelled on it. `nebulaPass(haze, which)` and
`dustPass(which)` take `'mw' | 'and' | 'both'`, and the frame draws the *farther* galaxy whole
(haze, then its dust) before the nearer one, ordered each frame by the eye's distance to each
centre (`dMW`, `dAnd`, Sun-relative like everything drawn). A galaxy's clouds can only thin its
own light. The second half (HII and cores) is additive and stays `'both'`. Two galaxies sort;
if a third ever joins, sort the list.

## The Andromeda map, one instrument per channel (v2.56.0)

`tools/build_m31_map.py` composes `m31-map.webp` from four pictures, all committed under
`tools/`: the PHAT panorama (a strip — kept only where it has coverage, `photographic_map()` now
returns its mask), a wide-field optical (luminance and colour everywhere else), Herschel far-IR
(dust *emission*, turned into darkening for the lane sampler) and GALEX UV (turned into blue excess
for the HII sampler). Everything outside the strip used to be an azimuthal average with noise on it —
the "blurry parts". The map contract is unchanged: 448², R25 at 188.6 px, luminance → stars, blue
excess → HII, darkness against a 5-px blur → dust, RGB → point colours.

What was learned, the hard way, about registering pictures of an inclined galaxy:
- **Scale from the 10-kpc ring**, never from correlation: every band has it, and a scale search
  by NCC wanders. The reference ring lives in 0.40–0.75 R; a layer at its own provisional scale
  can have it anywhere, so its window is 0.20–0.85 R.
- **Rotation is only near 0 or 180**: every layer already has its major axis horizontal from the
  moments fit. The fine angle comes from NCC within ±12°; the END is not something texture can tell
  on a nearly symmetric ring system. Anchors that work: **M32's sky position** (the sim draws it at
  `M32_C`, above-left in map rows, and the panorama frame was laid out to match — that fixes the
  optical), and **the ring's azimuthal brightness fingerprint** (`ring_azimuth`: M31's ring is far
  brighter on one side, the same in every band — that fixes the UV). The IR's fingerprint vote came
  out flat; its UV correlation has been consistent (~170°) across clean runs, so it decides alone.
- **No mirrors.** Photographs of the same sky are not mirror images of each other. Allowing a mirror
  in the search only gave the noise a second way to win.
- **The blotter must not eat the galaxy.** A threshold over the whole frame took 70% of the optical.
  Only the brightest compact peaks, one at a time; M32 by name (compactness in an annulus round the
  centroid — the bulge's wing on the major axis is brighter but smooth); blobs only in the optical
  (in the far-IR the pass ate the nucleus, and the stretch turned the hole into grey ovals).
- **The far-IR picture is full of Milky Way cirrus**: the moments fit needs a threshold of 0.20, not
  0.06, or the position angle leans on the foreground.
- **The bulge cannot be deprojected.** A 1/cos(77°) stretch draws a spheroid as a column the height
  of the disk. Sky-plane subtraction with elliptical annuli over-subtracts the minor axis (annuli mix
  radii that differ 4× after deprojection — a dark column); an unconstrained bulge/disk fit degenerates
  into two exponentials. What ships: a constrained Sérsic+exponential fit on the major axis (n ≥ 1.5,
  r_e 2–9% of R) subtracted on the sky and added back round, then the panorama's cigar treatment
  (rb 11 px) with the fill's level taken from a band just *outside* the column, not the whole ring
  (whole-ring means include the arm crossings and stand the column out bright). A texture seam
  remains in that zone; the info panel says the bulge is modelled.
- **Dust darkening is tapered inside 0.28 R**: the stretched inner dust is not to be trusted, and it
  darkened the bulge's outskirts into a box.
- `--debug DIR` writes a tile panel of every registered layer; look at it before trusting any number.
  `--extra PATH` uses a local optical picture in place of the committed one (for one whose licence
  keeps it out of a public repo); `--phat-only` is the old behaviour.

## Never write a `<select>`'s options unconditionally per frame (v2.53.4)

v2.53.3's `focusSunOpt.textContent = ...` ran every rendered frame, unguarded — same string
or not, it replaced the `<option>`'s child text node ~60 times a second. A native `<select>`'s
open popup tracks its `<option>` nodes, and that constant churn made the dropdown flicker and
refuse to register a pick at all — reported as "flashing screen, can't select a view," and it
reproduced with or without the Sun ever having died, because the write happened regardless of
whether the string actually changed. Fixed with the obvious guard: compute the wanted string,
compare against the current `textContent`, write only on an actual difference. Confirmed with
a `MutationObserver` on the option node — zero writes across 1.5 s of idle frames, exactly one
at the real transition — and with `page.locator(...).selectOption()` picking each of the three
views in sequence. The lesson generalizes: anything written every frame that lives inside an
interactive native control (`<select>`, `<input>`, `<details>`) needs a change guard, not just
things that are visibly expensive — the DOM write itself is what a browser's native widget
reacts to, whether or not the value moved.

## The view option renames itself, permanently, once the Sun is gone (v2.53.3)

`focusSunOpt` is `$('focusSel').options[0]` (value `'sun'`, never renamed — only its
`textContent` changes), captured once near `applyFocusView()`. Every frame, the same env-panel
block that already computes `sunState(ageGyr())` for the Earth-panel text sets
`focusSunOpt.textContent = ss.gone ? 'Anthropic Nebula' : 'Solar System'` — `ss.gone` is
`a >= SUN_AGB`, the same age both `pnState()` and the "planetary nebula" phase turn on at, so
the dropdown, the 3D label and the Earth panel all agree.

This one is a pure function of age, not a one-way latch: scrub the clock backward (an earlier
scenario, a jump) and it correctly reverts to "Solar System", because nothing about it is
sticky state. "Onward" here means "for every later age," not "once set, forever" — those read
the same going forward through time, but only the age check gets backward scrubbing right.
Don't reach for a `let renamed = false` flag for anything like this; check whether the
condition is already a pure function of the simulated age before adding one.

## The phase label follows the nebula, not the clock (v2.53.2)

`sunState()` flips its `phase` string to `'white dwarf'` the instant `a >= SUN_WD`, but the
drawn nebula (`pnState`) keeps fading for another 0.3 Gyr after that — so the Earth panel
called the star a white dwarf while the shell was still on screen. The panel's phase text now
reads `pn ? 'planetary nebula' : ss.phase`, reusing the same `pn` the draw pass already
computed this frame (`pnState(ageGyr())`, called once near the top of `frame()`) rather than
calling it again or reading `pnShown` — `pnShown` is view-dependent (camera framing, `alpha`,
`px`), so it would make the panel's phase readout flicker with the camera. Physical state and
drawn state are two different questions; always read `pn`/`pnState()` for "does it still
exist," `pnShown` only for "is it on screen right now."

## The disk does not run backwards (v2.53.1)

`spinMW` used to be `simT*V_GAL * (1 − and.merge)`: the *accumulated* rotation scaled by the
merge fraction. With ~32 laps on the clock when relaxation begins at 11.7 Gyr, the scaling term
shrinks the total angle faster than the clock grows it, so the entire disk (and Andromeda's,
same formula) spun backwards at about four times its speed until it froze — 31.7 laps at 11.7,
18.7 by 12.5. That is the "sudden change of rotation at galactic year 51.7" the owner saw.
`diskSpin(ts)` is the integral of `V_GAL·(1 − mergeAt(a))` instead: linear before `MERGE_A0`,
a parabola through to `MERGE_A1`, constant after. Monotonic by construction; the rate never
exceeds the flat-curve rate and reaches zero smoothly. `mergeAt` now reads those two constants
too. Rule of thumb for anything like it: scale a *rate* and integrate, never scale an
accumulated angle — the arm labels (`spinMW/640`) and both galaxies read the same integral.

## The Sun's death, drawn (v2.53.0)

`sunState()` now returns `T`, derived rather than tabulated: L = 4πR²σT⁴, so T/T☉ = L^¼/√R.
Every colour in the death follows from that one line — `sunTint(T)` interpolates the disc's dark
and bright tones and the far dot's colour in log T between anchors, and the 5772 K anchor *is*
today's fixed palette, so the present look is unchanged to the bit. Prominences and corona keep
the same offsets from the surface they always had, now as multipliers on the tinted tones.

Engulfment is per planet: `EAT_AGES[1..3]` (Mercury, Venus, Earth) from `eatAge(r)`, the rule
`SUN_EAT_AGE` was, opened up. Mars survives at 327 R☉. Latched on age, like before. A planet the
clock runs across gets a 1.6 s white flare (`eatFlash`, `eatGL`), drawn *after* the opaque disc
on purpose — at that instant it is at the surface, and the disc would otherwise hide it. A jump
that lands past the moment (`|Δage| > 0.05 Gyr`) finds it already gone, no flare. Once eaten the
sprite size is zero, and the trail loop and label loop skip it — a planet that is gone has no
path. `bufBodyCol` is a named, dynamic buffer now; it used to be an anonymous static one.

The planetary nebula is `pPN` on the disc's one-point vertex shader, drawn additively *under*
the star, only from outside (`cam.dist/r > 1.15`; a billboard cannot be a shell you stand in) and
only while `pnState(a)` is non-null: it grows through the phase and fades out by 0.3 Gyr into the
white-dwarf era. `pnShown` is what the label reads to say "Anthropic Nebula" (the owner's name for it; it was
"Sun nebula" for one release). True size, stretched
time, both disclosed in the panel.

Remnants (`puffs`) have their own program, `pRem`, a limb-brightened filamentary shell. The
fourth attribute packs `wave*2 + phase` (phase capped at 0.999) and `REM_VS` unpacks it with
`floor(x*0.5 + 0.25)`. Two things to know: the dust pass used to be nested *inside* the puff
pass, so the dust switch only worked while a remnant was alive, and the puffs then drew under
`pDust` with `pNeb`'s uniform locations — both fixed by un-nesting; and `deep?60:560` is the
puff cap that `pNeb` used, kept.

## The blast has its own program (v2.52.0)

A supernova was drawn with the same sprite as a star, so it could only ever be a bigger, whiter
star. `pSN` (`SN_VS`/`SN_FS`) draws kind-3 events instead: photosphere, glow, an expanding
shock front and the spikes any bright point grows in an optical system, all keyed to a per-point
phase carried in the fourth attribute channel — the one the generic pass uses for the wave flag,
which every blast has set anyway. `SN_VS` is the wave-riding branch of `PT_VS` copied, not
shared: the flash must land exactly where its progenitor supergiant stood, so if you ever change
the spin or warp maths in `PT_VS`, change it here too. The rest of `PT_VS` (velocities,
variability, tides, the merge scramble) is deliberately absent — no supernova here is ever
outside the Milky Way's disk.

`fillEvents()` now writes two compacted lists and sets `evN` / `snN`; drawing anything with
`events.length` again would read stale slots left by the blasts that moved to the other list.
`evN + snN === events.length` is the invariant to test against. Two traps met on the way:
`patch` is a reserved word in GLSL ES (the compile error takes the whole script down with it,
surfacing later as `$ is not defined`), and bending a front's *radius* with harmonics in angle
turns a circle into a polygon — modulate its brightness instead, which reads as clumps.

The spikes are the one thing drawn here that a supernova does not have; the info panel says so
outright, next to the disclosure that the flash is stretched in time.

## The merged remnant isn't "Andromeda" (v2.51.1)

The spiral-arm names and the Andromeda-side names (`ARM_LBLS`, `M31_LBLS`) were gated on two
different `and.merge` thresholds — arms hidden past 0.35, Andromeda's own name past 0.6 — on the
theory that the small companions deserve to linger a bit longer. But by 0.35 the two disks already
render as one blob (that's the same threshold `environment()`'s spiral-arm term and the glacial
banner use to mean "no more distinct galaxy"), so for that whole gap the single merged
remnant — which by then holds the Sun too — was captioned only "Andromeda (M31)". A user reading
that sees their own home galaxy labeled as the other one. Both label sets now share the 0.35 cutoff;
past it, the remnant goes nameless, same as the HUD's own "distance from centre" swap in
`sunPhase()`'s section above. Reproduce anything like this by setting `simT` directly
(`simT = (targetAge - AGE0) * 1e9 / YR_PER_SIM`) rather than fast-forwarding through real time.
