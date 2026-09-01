# AGENTS.md — Galactic Transit

Standing instructions from the project owner for anyone (human or agent) working on
`galactic-transit.html`. The repo root's `CLAUDE.md` and `AGENTS.md` still apply; this
file adds the rules specific to this experiment, collected from the sessions that
built it.

## Release discipline

- Semver, bumped per feature set or fix. Every release updates `BUILD.version` in the
  page **and** the cache name in `sw.js`.
- Regenerate `CHANGELOG.md` with `python3 ../.github/scripts/build_changelog.py`
  **after** the commit it describes, as its own commit — entries cite commit hashes,
  and a hash amended into its own commit never reaches `main`.
- Work on the pinned branch, fast-forward `main`, wait for the Pages run, and report
  the deploy status and live URL.
- Test headlessly before shipping (playwright-core + the system Chromium with
  SwiftShader flags). Report honest, measured numbers; SwiftShader runs ~6 fps and
  stretches CSS transitions, so slow measurements there are artefacts, not bugs.

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
- Settings footer: build stamp in the viewer's own time zone (named, `UTC±0` when
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
  buttons. The tour card carries the version, build stamp and hash.
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
