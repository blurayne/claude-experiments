# Changelog notes

Hand-written notes merged into `CHANGELOG.md` by `.github/scripts/build_changelog.py`: one `## <semver>` heading per version, Markdown body below it, inserted under that version's heading in the Galactic Transit section on the next regeneration. The generated changelog itself must never be edited by hand — it is overwritten wholesale.

## 3.20.0

**Three more tracks.** *Galactic Year — Dreamtime Kids Mix*, *Cosmic Synth Ritual* and *Zero-Beat Orbit*, all by barbedgreenroom399, join the playlist ahead of the three that were there; the Dreamtime Kids Mix is what a new visitor hears first. Six tracks, an hour and ten minutes before it loops.

## 3.19.0

**Free flight.** A button on the dock (the arrowhead) makes the eye a ship. The camera stays what it was — an eye a zoom's distance behind a target, turned by a drag — and the flight moves the target, so the zoom becomes the scale of the flight: at full throttle the ship crosses nine tenths of the view's height a second, a crawl among the planets and a leap across the supercluster with the same thumb on the same stick. The clock joins in: when it runs faster than a year a second the flight runs faster by the square root of that ratio, up to tenfold, and a paused clock is the walking pace. Keys on a desktop (W A S D or the arrows, R and F up and down, shift to boost fourfold, escape to land), two thumb pads on a touch screen (the left moves, the right rises, sinks and turns), a readout of the pace in real units beside the scale bar, and the state export carries the ship. Switching flight off leaves the ship where it stopped; a view, a scenario or the dive hands the camera back.

## 3.18.2

**Galaxies sliced by the far plane.** From a phone at the Local Group's range (the state read off the screenshot's QR code: 411×882 at 2.625, 838,000 units out) galaxies showed cut in half by a straight edge, one side dark, and the cut jumped about with the slightest turn of the view. The far clip plane sat at the eye's distance plus the sky sphere, so every galaxy on the far side of the target lay beyond it and was clipped by it, and which ones straddled it changed as the eye turned; the same plane had been quietly clipping the back half of the supercluster and of the deep field. It now reaches the whole of every layer that is showing. The galaxy quads fade to nothing before their margin, so no quad's rim can show as a plateau with a straight edge; the belt names hide with the labels off instead of staying where they were placed; the exported state (and the QR) carries the follow target and the GPU's name, so a screenshot pins the camera and the device; and an imported state lands at once instead of creeping toward its target for the next second.

## 3.18.1

The deep field's first real run: the runner fetched 43,507 galaxies and confirmed all twelve named clusters against the survey (Coma with 119 neighbours, Perseus 130, Norma 122); an apostrophe in a source string broke the generated table's syntax, so the tool quotes its strings now.

## 3.18.0

**Further out: the deep field.** The zoom now runs to 1.5e8 units — five billion light years across — and past the 3,500 km/s groups there is something to see: the 2MASS Redshift Survey (Huchra et al. 2012), some 43,000 galaxies to 15,000 km/s, fetched by the data workflow from VizieR into a separate binary the page loads only when the eye goes that far, each placed at its heliocentric cz over H0 = 74.6 (a model of distance, and said to be). The great clusters — Coma, Perseus, Norma at the Great Attractor's core, Hydra, Centaurus, Antlia, Leo, Hercules, the Shapley Concentration — are named from NED's positions, each checked by the tool against the survey's own concentration round it. A "The deep field (2MRS)" view and a last rung on the ladder; the zone of avoidance disclosed in the article.

## 3.17.1

**Visual glitches, from a sweep of the whole zoom range.** Between the Galaxy and the Local Group the Group's galaxies no longer appear as a ring of blobs at no real depth mid-slide (the merger model's Andromeda and the far sphere leave in the first half of the fade, the Group's own galaxies arrive in the second); the arm names hide once the Galaxy is a speck under the Group's; labels claim the screen by their width, so long names no longer overprint; the Group's markers and the Milky Way's are dimmer; the nearby galaxies' points beyond the Group are smaller; Cloud-9's dashed outline carries its name.

## 3.17.0

**The merger's tails.** The tide has memory now: each passage launches a stretch of the outer disk along the axis the companion had at pericentre, rising over a third of a gigayear and persisting through apocentre, winding with the disk's rotation — Toomre & Toomre's tails and bridges, which the first cut lost by scaling the stretch with the separation of the moment. An integral-sign warp lifts the outer disk toward the companion at each pass. Both disks are prograde to the drawn orbit (checked in the right-handed frame the orientation test uses), so both carry tails; the orbit itself stays the Gaia-era one — the research comparing it with NASA's 2012 visualisation found the piece the more current of the two.

## 3.16.0

**The Virgo Supercluster, and the web beyond.** The 8,826 galaxy groups of Kourkchi & Tully 2017 out to 3,500 km/s — Cosmicflows-3 distances where measured, Local-Sheet velocity over H0 = 74.6 where not, flagged and drawn bluer — and the 869 galaxies of the Updated Nearby Galaxy Catalog, placed through the supergalactic frame (derived from the pole and the zero point, tested against M87 and M81). Thirty groups and clusters named with their distances (sixteen position-checked against the nearby catalogue, the rest marked for the runner), the clusters with glows the size of their turnaround radii, Cloud-9 beside M94 as a dashed outline. Two views: "Virgo Supercluster" with the chart's cylinder on the supergalactic plane, and "The cosmic web", the whole measured volume from above; the zoom ceiling and ladder extended; an article on what is measured and what is velocity.

## 3.15.1

The view-width readout writes megalight-years past a million: "11.43 Mly across" at the Local Group, not "11434.5 kly".

## 3.15.0

**The Local Group, to scale.** Every galaxy within 1.25 Mpc from the Local Volume Database (Pace 2024) — 130 of them: the Milky Way's and Andromeda's satellites, the field dwarfs, Triangulum, Andromeda herself, and the dark-galaxy candidate AC G185.0−11.5 (Xu et al. 2025) — placed in their true directions and, once the Group is in view, at their true distances. The merger model's Andromeda (which the piece draws at a compressed depth so she fits the sky) stands down as the Group fades in, so nothing is drawn twice. With the labels on, the classic chart: the cylinder box on the Galaxy's axis, a drop-line from every galaxy to the plane, and each luminous member's name with its distance in a small box (the ultra-faint ones grey, without); a "distances" switch in the settings. A "Local Group" view, the zoom ladder extended to it, an article, and the table regenerated by the data workflow.

## 3.14.0

**The Galactic Centre in radio.** The objects of the wide-field 90-cm VLA map (LaRosa et al. 2000) — Sgr A to Sgr E along the plane, the supernova remnants G0.9+0.1, G0.3+0.0, G359.1−0.5, G359.0−0.9, Sgr D's and the Tornado, the Radio Arc, the Snake, the threads, the Ripple, the Pelican, the Cane, the Mouse — drawn where their designations put them, at the sizes Green's catalogue gives, on the sky at Sagittarius A*'s distance, in the map's own heat palette. A "Galactic Centre, radio" view with celestial north up as the map is printed, a scenario, labels, and an article that says which parts are catalogue and which are a model; the data workflow checks the table against VizieR on the runner.

## 3.13.0

**The Galactic Centre, and the nearest black hole.** Sagittarius A* is drawn at its true size — a 0.44 AU shadow at 8.3 kpc — by a ray-marched Schwarzschild shader (the shadow, the lensed disc, the photon ring all fall out of the geodesic equation), with fourteen S-stars on their published orbits (Gillessen et al. 2017; S2 from GRAVITY 2020) and a scenario that lands in 2011 to watch S2's 2018 pericentre at a year a second. Gaia BH1, the nearest black hole known (El-Badry et al. 2023), joins the sky 1,575 light years out with its Sun-like companion on its 186-day orbit, and its own scenario. Both live in frames of their own for precision; both have a view entry, labels, and an article. The orbital table is regenerated from VizieR by the data workflow on GitHub's runner, since the sandbox cannot reach the astronomy hosts.

## 3.0.0

**The migration, in numbers** (measured from the git history, 10 Sep 2026):

- **How long it took:** just over 50 hours wall clock from the toolchain-and-inventory commit (6 Sep, 19:54) to v3.0.0 (8 Sep, 21:53), across 50 commits of migration work — with sessions running through the nights: commits land at 01:36, 03:40 and 08:15.
- **How big the diff was:** 136 files, +27,388/−5,424 lines against v2.78.0 (`fd0f980`). Of that: +12,532 lines across 114 new source, test and config files; +5,025 lines of refactor documentation (the 14-file inventory and `MIGRATE-STATE.md`); the rebuilt page artifact (+6,824/−5,422); and a lockfile. `main.ts` ended at 553 lines, down from 5,347; 55 modules, the 23 shaders as files, 83 files under `src/` and 22 under `tests/`. Shipped with **180 unit tests, 10 boot tests and 23 parity states**; 22 of the 24 planned steps.
- **Real runtime:** the full parity gate costs 34 minutes to 2 hours per run — 23 states, both builds photographed back to back under SwiftShader at ~6 fps, every capture in its own browser process. It started near double that and dropped to ~34 minutes mid-migration when the two builds began being photographed at once (`6e43bf4`). The unit suite runs in about a second; the boot suite in ~3 minutes.
- **The hard parts:** making the gate trustworthy enough to trust — stored baseline PNGs turned out to be the flakiest thing in the project (three times a state differed by tens of thousands of pixels and three times the stored reference was the odd one out), so they were abolished for same-run photographs plus a two-sided control on every mismatch, with tolerance on area rather than amplitude. SwiftShader differing from *itself* by 16% when one process accumulated two dozen WebGL contexts. The seeded RNG stream, whose seven boot-time consumers may not be reordered because the asteroid belt's rejection loop makes its draw count data-dependent. The settings replay (R1), which dispatches synthetic events and — if any listener registers late — boots clean, throws nothing, and silently renders a default page. And mechanical renames, wrong in five distinct contexts (ids inside strings, element ids, property shorthand, local shadows, English prose) before each context got its own guard.
- **Left to do, on purpose:** the two unshipped steps are "cleanup" (ruled out of scope by R28) and `ui/dialogs` (it would hold four lines about one modal). `astro/` and `scene/` are pure — the boundary a WASM port would need — but no port is built. The science work the refactor existed to enable (the measured rotation, the merger's spread of outcomes, the Sun's end) went to `TODO.md` and started landing with v3.1.0.
