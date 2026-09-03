# Astro Visuals

Interactive astronomy visualisations, each a single self-contained page that runs
in the browser with no build step and no external CDN.

## The visualisations

- [`solar-system.html`](solar-system.html) — **Solar System 3D.** An interactive
  3D viewer of the solar system: orbit, zoom and inspect the planets.
- [`galactic-transit.html`](galactic-transit.html) — **Galactic Transit.** The
  Sun's real motion through the Milky Way at ~230 km/s, with the planets weaving
  helical paths around its track on an ecliptic tilted ~60° to the galactic
  plane. Has trails, labels, dwarf planets, the asteroid belt (with Kirkwood
  gaps), the Kuiper belt and the Oort cloud, a
  galaxy view, several calendar eras, true proportions always (the magnified
  display mode is gone), and one honest clock throughout — the civil year, the
  deep-time eras, the age of the solar system and the galactic year all count the
  same elapsed Earth years, with ×10³–×10¹² speed steps supplying the range — plus a
  **real scale** toggle that collapses the whole planetary system into the Sun's
  single pixel to show the true proportions, and from there a **☉ dive**: a
  continuous ~9-order-of-magnitude zoom from the galaxy down through the Oort
  shell (true ~1.6 ly edge) and Kuiper belt to the planets at their real
  diameters, with a live view-width readout. A **quality** row raises the modelled star
  count from base through hi-fi and ultra up to ×8 (a *star gain* slider lifts a
  floor under the faintest and widens the smallest sprites, roughly doubling
  the galaxy's brightness at maximum), and a **gaia sky** layer draws 20,000 real stars
  from Gaia DR3 astrometry at their true distances around the Sun,
  scatter discrete dark molecular clouds (Dunkelwolken) through the disk, and
  the disk itself follows Gaia-era structure: an exponential thin disk plus a
  thicker, older second disk. Trail opacity is adjustable and trail length runs from 0% to 1000% of what one
  second of viewing covers, so a trail keeps its length on screen at any speed, speed runs from the
  slider up through ×10³ to ×10¹² decade steps, and every setting is remembered
  in `localStorage`. The panel footer carries the semantic version, build date
  and commit, with a refresh button that clears every cache and the service
  worker before reloading. A **life cycle**
  mode animates stellar birth and death at measured rates — OB clusters igniting
  along the arms (their 3–30 Myr lives play out in a few simulated years), red
  supergiants collapsing into supernovae with expanding remnants, red giants
  puffing planetary nebulae — while the bar, arms and spur ride a rigid
  density-wave pattern that the disk stars stream through, so the arms never
  wind up. Installable as a **PWA** (manifest, service worker, offline shell) that opens
  fullscreen in whatever rotation the screen is already in, with fullscreen and
  screen-rotation buttons in the HUD. The status bar tallies supernovae and
  newly born stars at the measured real rates, or — with **live count** — the
  stars igniting and dying right now, stepping up and down as events begin and
  end. Star formation follows the Galaxy's real history — declining as the gas
  runs down, bursting when **Andromeda** arrives (~4.5 Gyr from now, drawn as an
  approaching companion whose tidal pull draws the outer disk into a bridge),
  then quenched. A **jump to** menu leaps between epochs, from the Theia impact
  and the first life to the collision and after — including **Gliese 710**, the
  closest stellar encounter known, grazing the Oort cloud at 13,944 AU in
  1.29 Myr. A panel tracks Earth's
  **galactic environment** — cosmic-ray flux and the contested ice-age link that
  follows from it, with the whole interface frosting over during a glacial
  epoch, turning amber when Earth is endangered and red once nothing can live
  there. The merger scatters the Sun outward, from 8 kpc to about 30. Calendar eras run from the
  present back through the first land life, first plants, first cell,
  prebiotic amino acids, the Theia impact and Earth's formation.
  **Effects** (five recorded supernova blasts
  and four soft star ignitions, picked at random, plus a deep space drone and
  planetary-nebula exhales synthesized live via Web Audio) are off by default,
  each switchable on its own; background **music** is on. Each has its own toggle and volume slider, and a *next*
  button cycles the tracks. A **variables** toggle makes a few percent of the
  star points pulse Cepheid/Mira-style — dimmer and redder at minimum light —
  and lets the HII nebulae breathe and drift in hue. Styled as a sci-fi observatory HUD
  with Orbitron/Exo 2, embedded in the file so it stays offline-capable. An
  info panel explains where the drawing is compressed and why the Oort cloud's
  outer edge is set by the galactic tide rather than by the Sun.

[`AGENTS.md`](AGENTS.md) collects the project owner's standing instructions for whoever works on this page next.

## Data sources & licences

| Source | Used for | Licence / credit |
|---|---|---|
| [Gaia DR3](https://www.cosmos.esa.int/web/gaia/dr3) (ESA/Gaia/DPAC) | astrometry, distances and 3D space velocities behind the real-sky layers | Gaia data: free use with credit "ESA/Gaia/DPAC"; ESA Gaia imagery: CC BY-SA 3.0 IGO |
| [AT-HYG 3.2](https://github.com/astronexus/ATHYG-Database) (David Nash, astronexus.com) | `stars-gaia.bin` and `stars-gaia-deep.bin` — 500,000 stars, Tycho-2 merged with Gaia DR3 | CC BY-SA 4.0 |
| Face-on Milky Way illustration (NASA/JPL-Caltech, R. Hurt, SSC/Caltech) | `galaxy-map.webp` — the density map the galaxy is drawn from | NASA imagery, credit required: "NASA/JPL-Caltech/R. Hurt (SSC/Caltech)" |
| [Hubble PHAT+PHAST panorama of M31](https://esahubble.org/images/heic2501a/) (heic2501a) | `m31-map.webp` — the resolved-star strip along Andromeda's major axis, kept where it has coverage; `tools/m31-src.jpg` | CC BY 4.0; credit "NASA, ESA, B. F. Williams, Z. Chen, L. C. Johnson, the PHAT and PHAST teams" |
| [Andromeda Galaxy, wide-field optical](https://commons.wikimedia.org/wiki/File:Andromeda_Galaxy_(with_h-alpha).jpg) (Adam Evans) | `m31-map.webp` — luminance and colour of the whole disk; `tools/m31-wide-optical.jpg` | CC BY 2.0 |
| [Herschel/Planck far-infrared view of M31](https://www.esa.int/ESA_Multimedia/Images/2013/01/Andromeda_s_dust) (ESA/NASA/JPL-Caltech) | `m31-map.webp` — cold-dust emission turned into the dust lanes; `tools/m31-wide-ir.jpg` | CC BY-SA 3.0 IGO (ESA) |
| `earth-map.webp` | Today's land from the GSHHG shoreline data bundled with `basemap` (public domain), cut into seven schematic plates with a continentality channel; built by `tools/build_earth_map.py` | GSHHG: public domain; the plate polygons are this project's own |
| [GALEX ultraviolet image of M31](https://www.nasa.gov/image-article/galex-andromeda/) (NASA/JPL-Caltech) | `m31-map.webp` — young stars and star-forming rings turned into the HII blue excess; `tools/m31-wide-uv.jpg` | NASA imagery, public domain, credit required |
| Face-on completion of the composite above (project owner, by hand and with AI) | `m31-map.webp` as shipped since v2.58 — the four-source composite finished face-on where the pipeline left seams; `tools/m31-map-hand.jpg` is the 2048² original, and `build_m31_map.py` will not overwrite it without `--force` | derivative of the four sources above, same credits; the completion itself by the project owner |
| [StarHorse](https://data.aip.de/projects/starhorse2019.html) (Anders et al. 2019, A&A 628, A94) | pending — `tools/build_starhorse_density.py` awaits a catalog sample | credit the paper and AIP; check the release page for the data licence |
| Nuclear disc & cluster | modelled after AIP's ["How central galactic structures grow together"](https://www.aip.de/en/news/galactic-structures-grow-together/) | scientific reference, no data used |
| [ejtaal/gaia-web](https://github.com/ejtaal/gaia-web) | inspected as a data source; its `gaia-web-data` sets (175–290 MB) are beyond a Pages site's budget | BSD-3 (code); data derived from Gaia DR3 (ESA/Gaia/DPAC) |
| [Gaia Sky datasets](https://gaiasky.space/resources/datasets/) (ZAH/ARI Heidelberg) | noted as a resource; host unreachable from the build sandbox | per-dataset, see their page |
| [Gaia Sky](https://codeberg.org/gaiasky/gaiasky) (ZAH/ARI Heidelberg) | star-sprite shading technique (corona + white-saturating core, flux-conserving sub-pixel stars), reimplemented from its shader library | MPL-2.0; technique credit, no code copied |
| [HYG 4.1](https://github.com/astronexus/HYG-Database) | the previous real-sky layer (superseded by AT-HYG) | CC BY-SA 4.0 |
| Orbitron & Exo 2 fonts | all UI text | SIL Open Font License 1.1 |
| Music & sound effects | uploaded by the project owner | provided by the project owner |

## Changelog

[`CHANGELOG.md`](CHANGELOG.md) records every released version of both viewers, with
sections for Galactic Transit and Solar System 3D. It is generated from the git history
by [`.github/scripts/build_changelog.py`](../.github/scripts/build_changelog.py), which
reads the version out of the page at each revision, so an entry always sits under the
version it actually shipped in. **Regenerate it whenever the version is bumped:**

```bash
python3 .github/scripts/build_changelog.py
```

Run it **after** committing the change, as its own commit: entries cite commit hashes,
so a log generated before the commit exists — or amended into it — would point at a
hash that never reaches `main`. Commits that only regenerate the log are skipped, so it
does not grow by talking about itself.

The build renders it to `changelog.html`, which the panel footer links to.

## Files

- [`icon.svg`](icon.svg) — the *Galactic Transit* emblem, hand-authored as vector
  (with Orbitron embedded so the lettering renders identically everywhere) and
  rasterised to the PNG sizes the manifest needs (favicons, the Apple touch icon,
  and the 192/512 and maskable app icons).
- [`logo-mark.svg`](logo-mark.svg) — the same emblem with the wordmark and the
  circular frame taken off, for the tutorial card, which is a framed panel already.
  Derived from `icon.svg`; change the artwork there first and re-derive.
- [`tools/render_icons.js`](tools/render_icons.js) — rasterises `icon.svg` to those
  PNGs through Chromium. The PNGs are derived files: change the SVG, re-run this.
- [`manifest.json`](manifest.json), [`sw.js`](sw.js) — the PWA manifest and its
  offline service worker.
### Feeding in StarHorse (Gaia DR3) — awaiting data

The measured 3D density of the inner Galaxy — the bar StarHorse revealed
([Anders et al. 2019](https://data.aip.de/projects/starhorse2019.html)) — cannot be
fetched from this environment (gaia.aip.de and data.aip.de are unreachable from the
sandbox). The converter is ready at
[`tools/build_starhorse_density.py`](tools/build_starhorse_density.py); it turns any
StarHorse CSV sample into a 1 MB density cube and a preview image, and was verified
end-to-end on synthetic data. To light it up:

1. At <https://gaia.aip.de/query> run something like
   `SELECT glon, glat, dist50 FROM <starhorse table> WHERE dist50 > 0` with a random
   subsample of a few million rows (the schema browser lists the exact table name for
   the 2019/2021 releases), export as CSV; or download a few of the partitioned catalog
   files from <https://data.aip.de/projects/starhorse2019.html> directly.
2. Hand the file(s) to the session (an upload, or any reachable URL).
3. `python3 tools/build_starhorse_density.py <files>` writes `starhorse-density.bin`;
   the page loader for it gets wired the moment real data exists.

- [`galaxy-map.webp`](galaxy-map.webp) — the face-on Milky Way illustration used
  as a density map: stars sampled where it is bright, dust where its lanes are
  dark, HII nebulae where it is pink; mirrored and rotated so the arms trail and
  the bar sits at the scene's 28°.
- [`stars-gaia.bin`](stars-gaia.bin) — the 100,000 brightest stars from AT-HYG 3.2
  (Tycho-2 merged with Gaia DR3; 98.7% carry DR3 parallax distances) — 20,000 real stars from HYG 4.1 (Gaia DR3
  astrometry), as packed position, hue and magnitude.
- [`sfx/`](sfx/) — five recorded supernova blasts and four soft star ignitions,
  played at random (with a slight per-shot detune) so repeats don't sound looped.
- [`music/`](music/) — the two background tracks, *Galactic Year* I & II by
  barbedgreenroom3. They are kept as separate files rather than embedded in the
  page: 10 MB of base64 would bloat the HTML past any sane single-file limit,
  and this way nothing is fetched until the music is switched on.
- [`vendor/`](vendor/) — pinned third-party libraries (React 18.3.1,
  ReactDOM 18.3.1, Three.js r160) used by `solar-system.html`, vendored into the
  repo so the page has **no external CDN dependencies**.

`galactic-transit.html` needs nothing at all: it is raw WebGL2 in one file.

## Running locally

No build step and no internet access needed — just open a page directly:

```bash
xdg-open solar-system.html      # Linux
open galactic-transit.html      # macOS
```

## History

This folder was previously published as `/solar-system/`, where the viewer was
served as the folder's `index.html`. It now hosts more than one visualisation, so
each viewer has its own filename and this `index.md` is rendered as the landing
page.

## Rebuilding the Andromeda map locally

`m31-map.webp` is generated, not drawn: `python3 tools/build_m31_map.py` (needs only `numpy` and
`pillow`) deprojects the four committed pictures under `tools/` and composes them. Pass
`--debug some/dir` to get a tile panel of every registered layer, and `--extra path/to/picture.jpg`
to use a wide-field optical picture of your own in place of the committed one — say, one whose licence
keeps it out of a public repository. On a Linux machine with Claude Code, "run
`tools/build_m31_map.py --extra ~/m31.jpg --debug /tmp/m31`, look at the panel, and commit the map
if the layers line up" is the whole job; the GitHub Actions workflow does the same on every push that
touches the script or its sources.
