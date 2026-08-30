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
  galaxy view, several calendar eras, and one honest clock throughout — the civil year, the
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

- [`icon.svg`](icon.svg) — the *Galactic Year* emblem, hand-authored as vector
  (with Orbitron embedded so the lettering renders identically everywhere) and
  rasterised to the PNG sizes the manifest needs.
- [`manifest.json`](manifest.json), [`sw.js`](sw.js) — the PWA manifest and its
  offline service worker.
- [`stars-gaia.bin`](stars-gaia.bin) — 20,000 real stars from HYG 4.1 (Gaia DR3
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
