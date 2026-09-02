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
  buttons. The tour card carries the version, build stamp and hash, and the emblem floated
  to its right — `logo-mark.svg`, which is `icon.svg` with the "Galactic Year" wordmark and
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
