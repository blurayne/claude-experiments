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
- Four panels — Simulation, Focus, Earth, Settings — live in two columns and are
  movable: dragging one inward switches its column, dragging it toward its own screen
  edge closes it, and both gestures read one pointer stream so mouse and finger behave
  alike. Each column stacks its open panels first, then the dots that reopen the
  closed ones: down the screen in portrait, across it in landscape. Sides and open
  states persist. Add a new panel to PANELS/pState, never to a bespoke layout block.
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
  reopens it). A 3-tap reset clears **all** of localStorage, debug flag included.

## Language notes

- The owner writes in English and German; replies may mirror either. UI copy is
  English.
- Landing pages (`index.md`) stay short, per the root `AGENTS.md`; the info panel
  inside the page is where explanations live.
