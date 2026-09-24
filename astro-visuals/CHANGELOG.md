# Changelog

Generated from the git history by `.github/scripts/build_changelog.py`;
each entry is filed under the version the page carried once it landed.
Hand-written release notes come from `CHANGELOG.notes.md`, never from here.

## Galactic Transit

### 3.27.0 — 2026-09-24

**Flight clears the screen, and landing puts it back.** Taking off now minimises every open dialog — the simulation, settings, Earth and debug panels — as well as sliding the status bar away. Landing reopens exactly those, in the order they were last opened (so on a phone the one that was showing shows again), and brings the status bar back if it was up. A panel opened by hand during the flight is left as it is, and a settings save made mid-flight records the layout from before the flight.

- V3.27.0 — flight clears the screen, and landing puts it back (`fd8d0d8`)

### 3.26.0 — 2026-09-24

**Flight, fourth cut: streaks, an ion drive, a better lever.** Moving ships leave streaks now: lines of light rushing past, like a star field at warp, stronger the faster the ship goes — switchable under Visuals ("flight streaks"), on by default. The ship sounds like an ion drive rather than a rocket: an electric vehicle's whine that climbs from about 240 Hz at rest to 1,300 Hz at full, pulsed faster as it goes, over a soft motor hum; the burst adds a thump, a rising charge and a brighter second voice. No noise any more. The throttle lever's zero sits a quarter of the way up, so most of its travel is forward, on a curve that gives little speed in the middle (18% halfway) and the rest near the top; below the zero is reverse, which holds only while the finger does and springs back to zero when let go. The speed the ship is actually making is shown bottom centre in its own readout, with the lever's setting under it (it used to ride in the scale note, which the "scale text" setting hides). And flying slides the status bar away, the way the swipe-down does; landing brings it back if it was up.

- V3.26.0 — flight, fourth cut: streaks, an ion drive, a better lever (`b651271`)

### 3.25.0 — 2026-09-24

**Roll the ship.** In flight, twisting two fingers rolls the ship left or right about its line of sight, the scene turning with the fingers the way a map does; a pinch still zooms. On a desktop a right-drag rolls it the same way. Out of flight nothing changes: two fingers and the right button still pan, and the camera stays level.

- V3.25.0 — roll the ship (`a2a1220`)

### 3.24.0 — 2026-09-24

**A thumb stick for the flight.** On a touch screen in flight a thumb stick now sits above the burst button: push it sideways and the ship strafes left or right, up or down and it rises or sinks; let go and it springs back to the centre and the ship stops sliding. The burst button is a rounded rectangle now. The dock and the Settings panel keep clear of the taller stack in the corner.

- V3.24.0 — a thumb stick for the flight (`0df75a5`)

### 3.23.0 — 2026-09-24

**Flight, third cut: turn anywhere.** In flight the view now turns freely: a drag carries it over the top and upside down, with no stop short of the poles, so any direction can be chosen to fly in. Out of flight the camera stays level exactly as before, and landing levels it, looking where the ship looked. The flight's top speed is thirty percent higher. The + and − buttons keep their zoom in flight and out of it, and on a touch screen in flight the dock now stays above the lever and the burst button, which could cover them. Pressing the lever or the burst button no longer flashes the phone browser's square tap highlight or a focus box.

- V3.23.0 — flight, third cut: turn anywhere (`d5fb4e1`)

### 3.22.1 — 2026-09-24

**The zoom buttons are back, and the dock never hides a button again.** With the Settings panel open on a phone, the right-hand dock was stacked below the panels and every button past the foot of the screen was hidden: the zoom and flight buttons on a 411-wide phone, the whole dock on a small phone or in landscape. Now the Settings panel stops one button-row short of the foot (its content scrolls as before), the dock lays itself out as a row when a column does not fit, and it pins to the foot of the screen rather than disappear.

- V3.22.1 — the zoom buttons are back; the dock never hides a button (`2fb23cd`)

### 3.22.0 — 2026-09-24

**The ship has a sound.** Free flight is heard now, synthesised live with no files: an engine hum that climbs in pitch and opens up as the throttle rises, a rush of air that grows with the speed, and on a burst a low thump and a whoosh, then a roar for as long as the button is held. The hum sits where phone and laptop speakers can play it. It has its own "flight" slider under Audio, on at 40%, so it is heard whether or not the effects are on; at zero it is off, like the other sliders. Landing fades it out.

- V3.22.0 — the ship has a sound (`dae0eb9`)

### 3.21.1 — 2026-09-24

The QR overlay is the topmost layer again, always: above the flight's lever and burst button, which v3.19.0 had stacked over it, and above the tooltips too.

- V3.21.1 — the QR overlay is the topmost layer, always (`678d1d5`)

### 3.21.0 — 2026-09-24

**Flight, second cut: the ship is the eye.** A drag in flight now turns the view round the ship itself, the way a pilot looks round, instead of swinging the ship round a point ahead — and it no longer holds the clock, so the world goes on while you look. A zoom keeps the point ahead and moves the eye along the line of sight: travel toward or away from it. On a touch screen the left pad is a throttle lever now, which stays where it is put (a detent at the middle, a tap sets it), and the right pad is a burst button: full ahead at boost while held. The readout beside the scale bar adds the lever's setting or "burst". The keys are unchanged.

- V3.21.0 — flight, second cut: the ship is the eye, a throttle and a burst (`b024d04`)

### 3.20.0 — 2026-09-24

**Three more tracks.** *Galactic Year — Dreamtime Kids Mix*, *Cosmic Synth Ritual* and *Zero-Beat Orbit*, all by barbedgreenroom399, join the playlist ahead of the three that were there; the Dreamtime Kids Mix is what a new visitor hears first. Six tracks, an hour and ten minutes before it loops.

- V3.20.0 — three more tracks, the Dreamtime Kids Mix first (`c27cdc9`)

### 3.19.0 — 2026-09-24

**Free flight.** A button on the dock (the arrowhead) makes the eye a ship. The camera stays what it was — an eye a zoom's distance behind a target, turned by a drag — and the flight moves the target, so the zoom becomes the scale of the flight: at full throttle the ship crosses nine tenths of the view's height a second, a crawl among the planets and a leap across the supercluster with the same thumb on the same stick. The clock joins in: when it runs faster than a year a second the flight runs faster by the square root of that ratio, up to tenfold, and a paused clock is the walking pace. Keys on a desktop (W A S D or the arrows, R and F up and down, shift to boost fourfold, escape to land), two thumb pads on a touch screen (the left moves, the right rises, sinks and turns), a readout of the pace in real units beside the scale bar, and the state export carries the ship. Switching flight off leaves the ship where it stopped; a view, a scenario or the dive hands the camera back.

- V3.19.0 — free flight (`82492e5`)

### 3.18.2 — 2026-09-21

**Galaxies sliced by the far plane.** From a phone at the Local Group's range (the state read off the screenshot's QR code: 411×882 at 2.625, 838,000 units out) galaxies showed cut in half by a straight edge, one side dark, and the cut jumped about with the slightest turn of the view. The far clip plane sat at the eye's distance plus the sky sphere, so every galaxy on the far side of the target lay beyond it and was clipped by it, and which ones straddled it changed as the eye turned; the same plane had been quietly clipping the back half of the supercluster and of the deep field. It now reaches the whole of every layer that is showing. The galaxy quads fade to nothing before their margin, so no quad's rim can show as a plateau with a straight edge; the belt names hide with the labels off instead of staying where they were placed; the exported state (and the QR) carries the follow target and the GPU's name, so a screenshot pins the camera and the device; and an imported state lands at once instead of creeping toward its target for the next second.

- V3.18.2 — the far plane reaches every showing layer (`ac41898`)

### 3.18.1 — 2026-09-21

The deep field's first real run: the runner fetched 43,507 galaxies and confirmed all twelve named clusters against the survey (Coma with 119 neighbours, Perseus 130, Norma 122); an apostrophe in a source string broke the generated table's syntax, so the tool quotes its strings now.

- The deep field's first real run — the tool quotes its strings (`85877d4`)

### 3.18.0 — 2026-09-21

**Further out: the deep field.** The zoom now runs to 1.5e8 units — five billion light years across — and past the 3,500 km/s groups there is something to see: the 2MASS Redshift Survey (Huchra et al. 2012), some 43,000 galaxies to 15,000 km/s, fetched by the data workflow from VizieR into a separate binary the page loads only when the eye goes that far, each placed at its heliocentric cz over H0 = 74.6 (a model of distance, and said to be). The great clusters — Coma, Perseus, Norma at the Great Attractor's core, Hydra, Centaurus, Antlia, Leo, Hercules, the Shapley Concentration — are named from NED's positions, each checked by the tool against the survey's own concentration round it. A "The deep field (2MRS)" view and a last rung on the ladder; the zone of avoidance disclosed in the article.

- Zoom out further — the deep field, 2MRS to 15,000 km/s (`b66b07e`)

### 3.17.1 — 2026-09-21

**Visual glitches, from a sweep of the whole zoom range.** Between the Galaxy and the Local Group the Group's galaxies no longer appear as a ring of blobs at no real depth mid-slide (the merger model's Andromeda and the far sphere leave in the first half of the fade, the Group's own galaxies arrive in the second); the arm names hide once the Galaxy is a speck under the Group's; labels claim the screen by their width, so long names no longer overprint; the Group's markers and the Milky Way's are dimmer; the nearby galaxies' points beyond the Group are smaller; Cloud-9's dashed outline carries its name.

- Rebuild galactic-transit.html from src/ (`2035a60`)
- Visual glitches from a sweep of the zoom range (`e0b0527`)

### 3.17.0 — 2026-09-20

**The merger's tails.** The tide has memory now: each passage launches a stretch of the outer disk along the axis the companion had at pericentre, rising over a third of a gigayear and persisting through apocentre, winding with the disk's rotation — Toomre & Toomre's tails and bridges, which the first cut lost by scaling the stretch with the separation of the moment. An integral-sign warp lifts the outer disk toward the companion at each pass. Both disks are prograde to the drawn orbit (checked in the right-handed frame the orientation test uses), so both carry tails; the orbit itself stays the Gaia-era one — the research comparing it with NASA's 2012 visualisation found the piece the more current of the two.

- Rebuild galactic-transit.html from src/ (`6d3314b`)
- The merger's tails — the tide has memory (`9ea78c5`)

### 3.16.0 — 2026-09-20

**The Virgo Supercluster, and the web beyond.** The 8,826 galaxy groups of Kourkchi & Tully 2017 out to 3,500 km/s — Cosmicflows-3 distances where measured, Local-Sheet velocity over H0 = 74.6 where not, flagged and drawn bluer — and the 869 galaxies of the Updated Nearby Galaxy Catalog, placed through the supergalactic frame (derived from the pole and the zero point, tested against M87 and M81). Thirty groups and clusters named with their distances (sixteen position-checked against the nearby catalogue, the rest marked for the runner), the clusters with glows the size of their turnaround radii, Cloud-9 beside M94 as a dashed outline. Two views: "Virgo Supercluster" with the chart's cylinder on the supergalactic plane, and "The cosmic web", the whole measured volume from above; the zoom ceiling and ladder extended; an article on what is measured and what is velocity.

- The Virgo Supercluster and the web beyond — 8,826 measured groups, the clusters by name (`7d3c00c`)

### 3.15.1 — 2026-09-20

The view-width readout writes megalight-years past a million: "11.43 Mly across" at the Local Group, not "11434.5 kly".

- The view readout counts in megalight-years past a million (`311fb23`)

### 3.15.0 — 2026-09-20

**The Local Group, to scale.** Every galaxy within 1.25 Mpc from the Local Volume Database (Pace 2024) — 130 of them: the Milky Way's and Andromeda's satellites, the field dwarfs, Triangulum, Andromeda herself, and the dark-galaxy candidate AC G185.0−11.5 (Xu et al. 2025) — placed in their true directions and, once the Group is in view, at their true distances. The merger model's Andromeda (which the piece draws at a compressed depth so she fits the sky) stands down as the Group fades in, so nothing is drawn twice. With the labels on, the classic chart: the cylinder box on the Galaxy's axis, a drop-line from every galaxy to the plane, and each luminous member's name with its distance in a small box (the ultra-faint ones grey, without); a "distances" switch in the settings. A "Local Group" view, the zoom ladder extended to it, an article, and the table regenerated by the data workflow.

- The Local Group, to scale — 130 galaxies, the box, the names with their distances (`71bdaa5`)

### 3.14.0 — 2026-09-20

**The Galactic Centre in radio.** The objects of the wide-field 90-cm VLA map (LaRosa et al. 2000) — Sgr A to Sgr E along the plane, the supernova remnants G0.9+0.1, G0.3+0.0, G359.1−0.5, G359.0−0.9, Sgr D's and the Tornado, the Radio Arc, the Snake, the threads, the Ripple, the Pelican, the Cane, the Mouse — drawn where their designations put them, at the sizes Green's catalogue gives, on the sky at Sagittarius A*'s distance, in the map's own heat palette. A "Galactic Centre, radio" view with celestial north up as the map is printed, a scenario, labels, and an article that says which parts are catalogue and which are a model; the data workflow checks the table against VizieR on the runner.

- The Galactic Centre in radio — the VLA map's objects, placed by catalogue (`45571e5`)

### 3.13.0 — 2026-09-20

**The Galactic Centre, and the nearest black hole.** Sagittarius A* is drawn at its true size — a 0.44 AU shadow at 8.3 kpc — by a ray-marched Schwarzschild shader (the shadow, the lensed disc, the photon ring all fall out of the geodesic equation), with fourteen S-stars on their published orbits (Gillessen et al. 2017; S2 from GRAVITY 2020) and a scenario that lands in 2011 to watch S2's 2018 pericentre at a year a second. Gaia BH1, the nearest black hole known (El-Badry et al. 2023), joins the sky 1,575 light years out with its Sun-like companion on its 186-day orbit, and its own scenario. Both live in frames of their own for precision; both have a view entry, labels, and an article. The orbital table is regenerated from VizieR by the data workflow on GitHub's runner, since the sandbox cannot reach the astronomy hosts.

- Take the runner's verified table into the page and the prose (`33fcc01`)
- The Galactic Centre, the S-stars, a black-hole shader, Gaia BH1 (v3.13.0) (`96f2c8b`)

### 3.12.0 — 2026-09-11

- Fix second-round review findings (`b671d27`)
- Fix final-review findings on the debug-hold/touch branch (`88d8c5e`)
- V3.12.0 — a plain 3s hold for debug mode, button-only on touch (`c62a255`)

### 3.11.0 — 2026-09-11

- Debug mode opens as a button only on touch, every door (`e48de9e`)
- A plain 3-second hold opens the debug door (`ed1b65c`)
- V3.11.0 — debug mode becomes a switch under Other (`47f9a8f`)

### 3.10.0 — 2026-09-10

- V3.10.0 — hold to open the door, and the instructions catch up (`6a20e9c`)

### 3.9.0 — 2026-09-10

- V3.9.0 — the debug panel gathers its own, and the scale becomes optional (`d8e865b`)

### 3.8.0 — 2026-09-09

- V3.8.0 — the Moon's own frame, and the doors relabelled (`34d268d`)

### 3.7.0 — 2026-09-09

- V3.7.0 — the hot Galaxy, and every merger we know of (`b30c780`)

### 3.6.0 — 2026-09-09

- The debug door opens a panel, not a modal (`c400dd9`)
- Panels dock to the foot of their column (`c1e3ce8`)
- A scale bar, three times the zoom, and nothing before there was anything (`1a81221`)
- The view row moves last, and the articles catch up with the UI (`a48c1ef`)
- V3.6.0 — how the Milky Way grew (`d2cb533`)

### 3.5.0 — 2026-09-09

- V3.5.0 — the About dialog becomes a title page with a bibliography (`4222358`)

### 3.4.2 — 2026-09-09

- V3.4.2 — the neighbours shed their cutouts (`d1b3067`)

### 3.4.1 — 2026-09-09

- V3.4.1 — the nearest galaxies, named (`38fd907`)

### 3.4.0 — 2026-09-09

- V3.4.0 — the far sky, and a fistful of asks (`ae17dd4`)

### 3.3.0 — 2026-09-09

- Hovered buttons breathe (`fa8fa5d`)
- V3.3.0 — the About panel becomes a library (`41fa14e`)

### 3.2.0 — 2026-09-09

- V3.2.0 — ride the pattern, and the arms finally trail (`0143a88`)

### 3.1.1 — 2026-09-09

- V3.1.1 — Andromeda's limbs unswapped, and the sky now checks itself (`69cf663`)

### 3.1.0 — 2026-09-09

- V3.1.0 — how the galaxies turn (`824a297`)

### 3.0.0 — 2026-09-09

**The migration, in numbers** (measured from the git history, 10 Sep 2026):

- **How long it took:** just over 50 hours wall clock from the toolchain-and-inventory commit (6 Sep, 19:54) to v3.0.0 (8 Sep, 21:53), across 50 commits of migration work — with sessions running through the nights: commits land at 01:36, 03:40 and 08:15.
- **How big the diff was:** 136 files, +27,388/−5,424 lines against v2.78.0 (`fd0f980`). Of that: +12,532 lines across 114 new source, test and config files; +5,025 lines of refactor documentation (the 14-file inventory and `MIGRATE-STATE.md`); the rebuilt page artifact (+6,824/−5,422); and a lockfile. `main.ts` ended at 553 lines, down from 5,347; 55 modules, the 23 shaders as files, 83 files under `src/` and 22 under `tests/`. Shipped with **180 unit tests, 10 boot tests and 23 parity states**; 22 of the 24 planned steps.
- **Real runtime:** the full parity gate costs 34 minutes to 2 hours per run — 23 states, both builds photographed back to back under SwiftShader at ~6 fps, every capture in its own browser process. It started near double that and dropped to ~34 minutes mid-migration when the two builds began being photographed at once (`6e43bf4`). The unit suite runs in about a second; the boot suite in ~3 minutes.
- **The hard parts:** making the gate trustworthy enough to trust — stored baseline PNGs turned out to be the flakiest thing in the project (three times a state differed by tens of thousands of pixels and three times the stored reference was the odd one out), so they were abolished for same-run photographs plus a two-sided control on every mismatch, with tolerance on area rather than amplitude. SwiftShader differing from *itself* by 16% when one process accumulated two dozen WebGL contexts. The seeded RNG stream, whose seven boot-time consumers may not be reordered because the asteroid belt's rejection loop makes its draw count data-dependent. The settings replay (R1), which dispatches synthetic events and — if any listener registers late — boots clean, throws nothing, and silently renders a default page. And mechanical renames, wrong in five distinct contexts (ids inside strings, element ids, property shorthand, local shadows, English prose) before each context got its own guard.
- **Left to do, on purpose:** the two unshipped steps are "cleanup" (ruled out of scope by R28) and `ui/dialogs` (it would hold four lines about one modal). `astro/` and `scene/` are pure — the boundary a WASM port would need — but no port is built. The science work the refactor existed to enable (the measured rotation, the merger's spread of outcomes, the Sun's end) went to `TODO.md` and started landing with v3.1.0.

- Two measured pattern speeds — the bar drives the arms, the spur keeps the Sun (`ddb87bd`)
- V3.0.0 — the page is built from src/ (`972590a`)

### 2.78.0 — 2026-09-08

- Scene/cache — the maps, the generators' results, and the density tiers (`4d629b1`)
- Step 18 — ui/hud takes the controls, and R1 survives it (`82a1ec7`)
- Ui/scenarios — the staged views and the epoch jumps (`b059793`)
- Step 21 — frame() leaves main.ts, and the readouts go with the settings (`0024312`)
- Render/camera, the hud state object, and the guard the rename needed (`bbe2dec`)
- Ui/persist with the registry, plus sections, the QR overlay and the debug door (`f84ac9b`)
- The interface starts moving — theme, fullscreen, tour, panels, probe (`b6588ac`)
- Step 13 — trails, labels and the life cycle, with the life cycle covered first (`e43604c`)
- Bodies, g710 and the flares — the first passes to share the U table (`9a5e9d2`)
- The clouds come out, and main.ts stops importing GLSL altogether (`569e61b`)
- Render/passes/globe and step 10's three programs (`a2c8f5f`)
- Render/passes/rings, and belts gets the other half of its shell back (`db915dc`)
- Render/passes/sun — the star's own two programs, and a name the HUD still needed (`1e2ecc4`)
- A rename reached into an English sentence, and nothing could see it (`7a7d506`)
- Render/passes/tone — the highlight rolloff, and the rule about being last (`e14f20d`)
- Render/passes/belts — the first draw pass leaves frame() (`204e43e`)
- Ui/tooltips, a control that checks both sides, and a gate relaxed on area (`e0abaaf`)
- Core/format — the most-read text in the piece, now tested (`ff065df`)
- Audio/ — the drone, the tracks and the sample banks come out (`7bf6539`)
- Scene/sky — the star catalogue parser stops needing a GL context (`68dd011`)
- Astro/g710 — Gliese 710's passage, checked against Bailer-Jones 2018 (`0c6ae6a`)
- Scene/belts — the asteroids, the Kuiper belt and the Oort cloud (`9220ba9`)
- Scene/andromeda, and a gate that runs its own control (`b37f5d3`)
- Scene/galaxy — the Milky Way's generators return their buffers (`28e0c59`)
- Scene/starfield, and the var-hoisting trap it was built on (`da28433`)
- Step 7d — the drawing surface, the frame's readouts, and the life counters (`9d2f692`)
- Step 7c — the GPU's contents join render/state (`5cff82c`)
- Step 7b — the camera joins render/state (`468616b`)
- Step 7a — the clock becomes render/state's first singleton (`227a397`)
- Step 9c — astro/earth, and a check for the mistake it made (`58f7eef`)
- Step 9b — the Sun's life and Earth's climate become pure functions (`6c6e33e`)
- Step 9a — astro/bodies, and Kepler as a test (`45a70ae`)
- Step 8 — gpu/, and the gate stops keeping baselines (`b644d8f`)
- Step 7 — the Andromeda encounter becomes astro/merger, with 21 tests (`740c645`)
- Step 6 — the physics constants and the Sun's orbit become astro/ (`bacb3a0`)
- Steps 4–5 — core/ comes out, and the first real unit tests with it (`d64b15f`)
- Step 3 — 23 shaders become files, byte for byte (`7a3de48`)
- Step 2 — the stylesheet becomes four files, and the cascade is asserted (`7a60435`)
- Step 1 — the page is built from src/, and it is still one file (`0ff1a82`)
- Feat(astro-visuals): v2.78.0 — the Moon joins the views (`fd0f980`)

### 2.77.0 — 2026-09-03

- Feat(astro-visuals): v2.77.0 — an error log in debug mode, collected on touch devices (`b369b0a`)

### 2.76.0 — 2026-09-03

- Feat(astro-visuals): v2.76.0 — the dust reddens by the extinction law; HII toward Hα (`a9ec71f`)

### 2.75.0 — 2026-09-03

- Feat(astro-visuals): v2.75.0 — Pangaea, Pangaea Proxima and the oceans' end as events; ice from the rock record (`a67b2af`)

### 2.74.4 — 2026-09-03

- Style(astro-visuals): v2.74.4 — the (i) border is a circle again (`ea740fe`)

### 2.74.3 — 2026-09-03

- Style(astro-visuals): v2.74.3 — smaller (i) icon, tighter to its label (`1ffaaf7`)

### 2.74.2 — 2026-09-03

- Style(astro-visuals): v2.74.2 — half-transparent (i) frame; transparent checkboxes (`8ade8fa`)

### 2.74.1 — 2026-09-03

- Fix(astro-visuals): v2.74.1 — the (i) icon is a square, not a circle (`dd22048`)

### 2.74.0 — 2026-09-03

- Feat(astro-visuals): v2.74.0 — (i) tooltips on the unclear settings; spin lock under the view box in plain text (`9143040`)

### 2.73.0 — 2026-09-03

- Feat(astro-visuals): v2.73.0 — a first-launch performance probe sets the quality (`dab1862`)

### 2.72.0 — 2026-09-03

- Feat(astro-visuals): v2.72.0 — Plate tectonics scenario, daily-mean light at high rates, land wins over a moved plate's ocean (`17d9753`)

### 2.71.0 — 2026-09-03

- Feat(astro-visuals): v2.71.0 — spin lock row and setting, Earth view sized to the viewport, Earth epochs focus Earth (`a2e746b`)

### 2.70.0 — 2026-09-03

- Feat(astro-visuals): v2.70.0 — speed ladder down to hours, spin-locked camera (`489ddf6`)

### 2.69.0 — 2026-09-03

- Feat(astro-visuals): v2.69.0 — Earth from the real map, plates from Pangaea to Proxima (`5f95c54`)

### 2.68.0 — 2026-09-03

- Earth as a globe through its eras, the Moon and its orbit, an Earth view (v2.68.0) (`8bb9ac8`)

### 2.67.0 — 2026-09-03

- The Sun's shell casting drawn as the event it is (v2.67.0) (`4a57091`)

### 2.66.0 — 2026-09-03

- The QR overlay sits bottom right, remembers where it is put, and a double tap dismisses it (v2.66.0) (`ef77f3a`)

### 2.65.1 — 2026-09-03

- The QR overlay defaults to 1x (v2.65.1) (`ca1d951`)

### 2.65.0 — 2026-09-03

- The Anthropic Nebula as scenario and view; the state as a QR; the helix at the real date (v2.65.0) (`8e26d74`)

### 2.64.1 — 2026-09-03

- Zoom buttons under play, and following their switch at boot (v2.64.1) (`8e3f303`)

### 2.64.0 — 2026-09-03

- Zoom + and − under help, stepping object to object (v2.64.0) (`b8dd6ad`)

### 2.63.1 — 2026-09-02

- Andromeda's arms drawn from the map's ridges (v2.63.1) (`9490a85`)

### 2.63.0 — 2026-09-02

- Two-finger pan; the shuttle says "off"; the frost lighter again (v2.63.0) (`924d5b6`)

### 2.62.1 — 2026-09-02

- The status bar holds its width for a second before shrinking (v2.62.1) (`83359b4`)

### 2.62.0 — 2026-09-02

- The docs v2.62.0 shipped without — panel sentence, TODO, notes (`1053420`)
- The shuttle — drive the clock by hand, forward or backward (v2.62.0) (`cedb01c`)

### 2.61.0 — 2026-09-02

- The drawn universe was a mirror image; the projection now reflects it (v2.61.0) (`96e6b4c`)

### 2.60.4 — 2026-09-02

- Revert the core hiding; the spot at the centre was the nuclear stars (v2.60.4) (`b596904`)

### 2.60.3 — 2026-09-02

- The Galactic Centre is hidden from inside the disk; settings title bare (v2.60.3) (`efe1120`)

### 2.60.2 — 2026-09-02

- The glacial frost texture 20% more transparent (v2.60.2) (`d945351`)

### 2.60.1 — 2026-09-02

- The Great Rift — dust over the band from inside the disk (v2.60.1) (`1c0e3b4`)

### 2.60.0 — 2026-09-02

- Settings reads as a panel; the build stamp moves to the info dialog (v2.60.0) (`59ec350`)

### 2.59.2 — 2026-09-02

- The audio may never give up permanently (v2.59.2) (`14dde2d`)

### 2.59.1 — 2026-09-02

- Give the play state back, and let a swipe finish (v2.59.1) (`e8bca2d`)

### 2.59.0 — 2026-09-02

- Steady labels, and one name for the merged galaxy (v2.59.0) (`4156f1f`)

### 2.58.1 — 2026-09-02

- One const V in sw.js again; the ship chain stops on a bad parse (v2.58.1) (`4269272`)

### 2.58.0 — 2026-09-02

- Andromeda's map, completed by human and AI (v2.58.0) (`7865813`)

### 2.57.2 — 2026-09-02

- Drop the clock line from the tour; one const V in sw.js (v2.57.2) (`7353feb`)

### 2.57.1 — 2026-09-02

- One galaxy's clouds no longer darken the other (v2.57.1) (`607728f`)

### 2.57.0 — 2026-09-02

- The emblem and the app are Galactic Transit (v2.57.0) (`45049fc`)

### 2.56.1 — 2026-09-02

- Dark clouds within the star field, not on top of it (v2.56.1) (`1ba964a`)

### 2.56.0 — 2026-09-02

- Andromeda's map from four pictures, one per channel (v2.56.0) (`84b8172`)

### 2.55.0 — 2026-09-02

- A wordless, unframed emblem on the tutorial card (v2.55.0) (`00f5856`)

### 2.54.0 — 2026-09-02

- Logo on the tutorial start screen (v2.54.0) (`32aa0b6`)

### 2.53.4 — 2026-09-02

- Fix the view selector flashing/lockup (v2.53.4) (`ae6e6b5`)

### 2.53.3 — 2026-09-02

- Rename the view option once the Sun is a nebula (v2.53.3) (`891b7ce`)

### 2.53.2 — 2026-09-02

- The phase label follows the nebula, not the clock (v2.53.2) (`c1a3a25`)

### 2.53.1 — 2026-09-02

- The disk does not run backwards; renames (v2.53.1) (`e017729`)

### 2.53.0 — 2026-09-02

- The Sun's death, drawn (v2.53.0) (`85fa081`)

### 2.52.0 — 2026-09-01

- A shader of its own for the supernova blast (v2.52.0) (`4252b3b`)

### 2.51.1 — 2026-09-01

- Stop naming the merged remnant "Andromeda" (v2.51.1) (`ef0b91e`)

### 2.51.0 — 2026-09-01

- An intro-tour hint for the labels toggle (v2.51.0) (`6270333`)

### 2.50.0 — 2026-09-01

- Drop the About dialog's fullscreen button, real icons for L/S (v2.50.0) (`39632d9`)

### 2.49.0 — 2026-09-01

- Core glare off by default (v2.49.0) (`6685a2f`)

### 2.48.0 — 2026-09-01

- View GO button back, a master label toggle in the dock (v2.48.0) (`90e5330`)

### 2.47.0 — 2026-09-01

- Andromeda in the view select, low as the default detail (v2.47.0) (`ce678ce`)

### 2.46.0 — 2026-09-01

- A deep-time temperature chart, converted from the owner's reference image (v2.46.0) (`ff1297c`)

### 2.45.0 — 2026-09-01

- Background handling, an "excellent" life-support tier, and a deep-time reference table (v2.45.0) (`36e52a5`)

### 2.44.0 — 2026-09-01

- Half-float rendering and a core-glare control (v2.44.0) (`3d27fa8`)

### 2.43.0 — 2026-09-01

- The post-merger readouts stop counting laps (v2.43.0) (`07529b5`)

### 2.42.0 — 2026-09-01

- Andromeda from the Hubble panorama, and the real encounter (v2.42.0) (`02190c8`)

### 2.41.0 — 2026-09-01

- Bulge from the photo's major-axis profile; keep the source (`2d4b98b`)
- The Sun's life, Planet 9, and dock/intro polish (v2.41.0) (`61861af`)

### 2.40.0 — 2026-09-01

- The intro says what the piece is, and dialogs keep their heads (`ea59e34`)

### 2.39.0 — 2026-09-01

- The tour names its build, and a reset keeps debug mode (`d80d59f`)

### 2.38.0 — 2026-09-01

- The tour points at things, and the panels agree on a glyph (`9056a40`)

### 2.37.0 — 2026-09-01

- One Earth panel, and panels that make room for each other (`e859c14`)

### 2.36.0 — 2026-09-01

- A guided first run, and two standing buttons in the dock (`76a1545`)

### 2.35.0 — 2026-09-01

- Panels you can move, and Simulation in one of its own (`e564588`)

### 2.34.0 — 2026-09-01

- The frame rate is a numeral, and the sections tidy up (`4fd6ef5`)

### 2.33.1 — 2026-09-01

- A scenario sets its own pace, even at boot (`212fd9b`)

### 2.33.0 — 2026-08-31

- Temperatures carry their own colour, and the panels move (`128bcb9`)

### 2.32.0 — 2026-08-31

- Visuals, and the last button rows become checkboxes (`e33968c`)

### 2.31.1 — 2026-08-31

- Simulation opens, and pause leads the action row (`1f863bb`)

### 2.31.0 — 2026-08-31

- An Other section, and one section open at a time (`fe11d10`)

### 2.30.0 — 2026-08-31

- The settings dialog folds into four sections (`571230a`)

### 2.29.0 — 2026-08-31

- The Andromeda scenario is staged from the owner's export (`54ad033`)

### 2.28.0 — 2026-08-31

- The frame rate gets its own panel (`5210fee`)

### 2.27.0 — 2026-08-31

- A drawn pause glyph, and two more controls that stop being buttons (`9c7d85a`)

### 2.26.0 — 2026-08-31

- Checkbox grids, and volume as its own switch (`1125f0b`)

### 2.25.2 — 2026-08-31

- The Earth panel and its life-support reading are fixtures (`a740cce`)

### 2.25.1 — 2026-08-31

- The focus panel says GO, and yields when crowded (`4ef1c1f`)

### 2.25.0 — 2026-08-31

- The settings dialog relaid out, and the belt healed (`f31a07d`)

### 2.24.0 — 2026-08-31

- The alert boxes ride the status bar (`7a25971`)

### 2.23.1 — 2026-08-31

- The photosphere is opaque (`068b72c`)

### 2.23.0 — 2026-08-31

- The Sun becomes a living star up close (`b7e5a65`)

### 2.22.1 — 2026-08-31

- Minimised, the alert boxes step aside to the + button's right (`c5a098f`)

### 2.22.0 — 2026-08-31

- Alert boxes, a set that closes, and the structures named (`266189f`)

### 2.21.0 — 2026-08-31

- The Gliese 710 scenario frames the Oort cloud for a 35-second pass (`4690433`)

### 2.20.2 — 2026-08-31

- The icon loses its button plate (`683e6ff`)

### 2.20.1 — 2026-08-31

- The trail scene adopts the owner's third exported camera (`90f93ae`)

### 2.20.0 — 2026-08-31

- A quieter start, and a reset that means it (`81e9341`)

### 2.19.3 — 2026-08-31

- The helix scenario adopts the owner's second exported preset (`7924cfd`)

### 2.19.2 — 2026-08-31

- The debug dialog opens on the current state (`7eb70d1`)

### 2.19.1 — 2026-08-31

- AGENTS.md carries the owner's standing instructions; the life cycle is opt-in (`de84809`)

### 2.19.0 — 2026-08-31

- Threshold flashes, a hand-picked opening angle, split alphas, steppers (`2aac999`)

### 2.18.2 — 2026-08-31

- The other half of the sky (`406643f`)

### 2.18.1 — 2026-08-31

- The panel keeps its tuning knobs behind the debug door (`02c5b58`)

### 2.18.0 — 2026-08-31

- Helix and orbit combine, and the multiplier becomes a slider (`3181d82`)

### 2.17.0 — 2026-08-31

- Taps instead of holds on the reload button (`9e0e057`)

### 2.16.0 — 2026-08-31

- The true helix replaces the emblem (`69ae7dd`)

### 2.15.0 — 2026-08-31

- Orbit rings where trails cannot go, and the dive explained (`7782fc2`)

### 2.14.1 — 2026-08-31

- The debug dialog closes from a corner ×, not a row button (`84569d9`)

### 2.14.0 — 2026-08-31

- One reload button, three depths (`36be4ec`)

### 2.13.0 — 2026-08-31

- The piece opens on the helix, and epochs become scenarios (`f8a856e`)

### 2.12.0 — 2026-08-31

- A rate calendar, AD/BC as suffixes, and a debug door (`1510312`)

### 2.11.1 — 2026-08-31

- The remix opens the playlist, at 40% volume (`b3fd79d`)

### 2.11.0 — 2026-08-31

- "The helix" joins the events menu as a staged view (`7bbcbed`)

### 2.10.3 — 2026-08-31

- A corkscrew needs an axle (`7f8cd95`)

### 2.10.2 — 2026-08-31

- The grip appears only when needed, the helix stays out of the dive (`50d1082`)

### 2.10.1 — 2026-08-31

- The Sun no longer jumps when rotating in the dive (`d23480a`)

### 2.10.0 — 2026-08-31

- Dark clouds back and switchable, helix trails, arm names (`6fd4d7d`)

### 2.9.0 — 2026-08-31

- True proportions always, and panels that get out of the way (`7af3e03`)

### 2.8.0 — 2026-08-31

- The 2.8.0 version stamp, info text and licence credit that the previous commit claimed (`caa0b15`)

### 2.7.0 — 2026-08-31

- The Sun verified in its place, and stars shaded the Gaia Sky way (`f0ca00c`)
- Half a million DR3 stars that actually move (`d74e9e1`)

### 2.6.0 — 2026-08-31

- The real sky is Gaia DR3 now — 100,000 stars from AT-HYG 3.2 (`e3ecfa8`)

### 2.5.0 — 2026-08-30

- The galaxy is drawn from the face-on Milky Way picture (`f96f36f`)

### 2.4.2 — 2026-08-30

- Supernovae flare rather than flood the view (`6fc7dcb`)

### 2.4.1 — 2026-08-30

- Trails stop aliasing at speed, and the build stamp names its zone (`93075c5`)

### 2.4.0 — 2026-08-30

- A changelog, generated from the history and linked from the panel (`3b0c4fc`)

### 2.3.1 — 2026-08-30

- The build stamp is shown in the reader's own time zone (`d46020e`)

### 2.3.0 — 2026-08-30

- Trails follow the speed, pinching no longer turns the view (`a823792`)

### 2.2.1 — 2026-08-30

- E-notation on the speed multiplier buttons (`f091a6c`)

### 2.2.0 — 2026-08-30

- The dive holds the camera on the Sun-to-core line (`6e0904a`)

### 2.1.0 — 2026-08-30

- The speed slider spans a week to a year, and the snowflake moves onto the reading (`6dca8f0`)

### 2.0.0 — 2026-08-30

- One clock, so every date agrees (`5013130`)

### 1.33.0 — 2026-08-30

- The readouts update on their own clock, 1 to 16 times a second (`f2c8353`)

### 1.32.0 — 2026-08-30

- A.D. by default, at one Earth year a second (`2de91f3`)

### 1.31.0 — 2026-08-30

- The star counters survive a phone, and the build stamp names its clock (`d6b9c0c`)

### 1.30.0 — 2026-08-30

- Sharp frost combining both rime photographs (`25e120b`)

### 1.29.0 — 2026-08-30

- A real frost photograph behind the panels (`0ab69f7`)

### 1.28.0 — 2026-08-30

- The buttons beside the epoch list fit inside the panel (`9a07e8a`)

### 1.27.0 — 2026-08-30

- The Gaia sky steps back where the compressed view magnifies past it (`948fa5d`)

### 1.26.0 — 2026-08-30

- White text under ice, labelled epoch buttons, build time (`b640f20`)

### 1.25.0 — 2026-08-30

- Glacial epochs frost the panels over properly (`cdb40ca`)

### 1.24.0 — 2026-08-30

- Every panel steps aside for the settings panel, not just one (`1cd4d1d`)

### 1.23.0 — 2026-08-30

- Replay and present-day buttons beside the epoch list (`9723be2`)

### 1.22.0 — 2026-08-30

- Andromeda scales with the quality setting (`736d8ef`)

### 1.21.0 — 2026-08-30

- Planet trails in real scale, and panels that make room (`c1e08bb`)

### 1.20.0 — 2026-08-30

- The star gain slider also widens the smallest sprites (`9d30c79`)

### 1.19.0 — 2026-08-30

- Real Gaia stars, quality as a row, and an fps readout (`f938ff0`)

### 1.18.0 — 2026-08-30

- A brightness floor for the faint stars, and an ultra x2 density (`21845c3`)

### 1.17.0 — 2026-08-30

- Gliese 710 grazes the Oort cloud (`b8ae20e`)

### 1.16.0 — 2026-08-30

- Habitable reads green (`78c85b0`)
- The interface colour blends with the hazard instead of stepping (`833efc9`)
- Semantic versioning with a build stamp, a hard-refresh button, and the environment panel on mobile (`a428cc1`)

### Before versioning — 2026-08-30

- Remember settings, and show the version (`f11ebb2`)
- Decade speed multipliers (`67a1da3`)
- Life support, and the merger's grip on the solar system (`ca36be3`)
- Andromeda now rotates and visibly closes (`f9b8949`)
- Every calendar runs on the galactic clock (`26bca7c`)
- Star-formation history, Earth's galactic environment, epoch jumps and Andromeda (`c71e690`)
- Live event counters, and the clock holds while dragging (`cd3d99f`)
- Trails fade across the precision boundary instead of dropping out (`9eefafc`)
- Star-ignition samples and per-effect switches (`ee5b15e`)
- Installable PWA, fullscreen and rotation controls, deep-time calendars, rate counters (`bc66852`)
- Recorded supernova blasts, and an audible effects mix (`48ff711`)
- Sound effects off by default (`00ef5aa`)
- Real background music, plus volume and on/off for music and effects (`a17a04d`)
- Wider settings panel (430px) so the toggle rows fit (`e60735c`)
- Variable stars and breathing nebulae (`43e74d5`)
- Switchable sound effects and generative ambient music (`451e5c6`)
- Stellar life cycle and density-wave arms (`a28b482`)
- Trail length slider (2.4-240 yr window) (`943fdb1`)
- Ultra density mode, star-count factoid, Gaia-matched disk structure, trail opacity slider (`2120f45`)
- Switchable main asteroid belt, with Kirkwood gaps (`e6a1ac4`)
- The collapsed-panel button is a plus sign, not a burger (`6873c54`)
- Galactic Transit gets a real-scale dive, a hi-fi galaxy with Dunkelwolken, and an observatory-HUD restyle (`31823d9`)
- Fold the solar-system viewer and a new Galactic Transit page into one folder (`2de1bf5`)

## Solar System 3D

### Before versioning — 2026-08-30

- Fold the solar-system viewer and a new Galactic Transit page into one folder (`2de1bf5`)
