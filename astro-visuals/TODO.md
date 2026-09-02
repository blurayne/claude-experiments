# TODO — Galactic Transit

Everything the owner asks for lands here first, as a checkbox, and is committed on its own
before the work starts. An item is ticked when it ships, with the version that carried it.

## 2026-09-01

- [x] Keep this file: every request becomes a checkbox here, committed before the work;
      the rule lives in `AGENTS.md` — commit 6181f0d.
- [x] The Milky Way's rotation seems to change suddenly around galactic year 51.7, during
      the Andromeda merger — check whether that is real, and fix it if not. Not real: the
      disk's spin was the accumulated angle scaled by (1 − merge), which ran it backwards
      at four times its speed from 11.7 Gyr; now the integral of a fading rate — v2.53.1.
- [x] Rename the "Sun nebula" label to "Anthropic Nebula" — v2.53.1.
- [x] Rename "Sun" in the view select to "Solar System" — v2.53.1.

## 2026-09-02

- [x] The info panel calls the Sun's phase "white dwarf" while it is still shown as a
      nebula on screen — fix the mismatch. The panel now reads "planetary nebula" for as
      long as the shell physically exists (`pnState`, 0.3 Gyr past `sunState`'s own
      cutoff), not the moment the clock crosses into white-dwarf age — v2.53.2.
- [x] The view select still reads "Solar System" once the Sun has turned into a nebula —
      call it "Anthropic Nebula" from that point onward. Turns at the same age (12.37 Gyr)
      the panel and the 3D label already do, and correctly reverts if the clock scrubs
      back before it happened — v2.53.3.
- [x] Clicking the view selector causes a flashing screen and it can't be used to pick
      another view — happens even without the Sun having been swallowed. Regression from
      v2.53.3: the rename was writing the option's text every frame, unconditionally.
      Guarded to write only on an actual change — v2.53.4.
- [x] Show the Galactic Year logo on the tutorial start screen too, as a right-aligned
      SVG, keeping its background transparent. `icon.svg` referenced (not inlined) and
      floated right in the tour card, on its own translucent disc — v2.54.0.
- [x] On the tutorial the logo should drop the "Galactic Year" lettering and the outer
      circle, and be a bit bigger. `logo-mark.svg` — the emblem without the wordmark and
      without the frame's three circles — at 132px (96 short, 88 phone) — v2.55.0.
- [x] `m31-map.webp` has blurry parts visible in the simulation (the azimuthal fill where
      the PHAT panorama has no coverage). Rebuild it from the wide-field pictures the owner
      supplied — Herschel/Planck far-IR (dust), GALEX UV (young stars), wide optical — each
      deprojected from 77° to face-on and registered to the PHAT map, so every channel comes
      from the instrument that measures it and the gaps are filled with real data, not
      extrapolation. Deliver as a script that also runs locally with Claude CLI on Linux.
      Done in `tools/build_m31_map.py` (numpy + Pillow; `--debug`, `--extra` for a local
      picture); the three CC/public-domain pictures are committed, the fourth (the portrait
      mosaic, Robert Gendler's, not freely licensed) is not — use it locally via `--extra`.
      The bulge zone remains modelled, as disclosed — v2.54.0.
- [x] Dark clouds render as black discs sitting on top of the stars and the core glow.
      They should sit within the star field: darken only the diffuse haze, and be drawn
      beneath the stars, the HII regions and the core. Draw order is now haze → dust →
      stars → HII and core, and the sprite never goes fully opaque — v2.56.1.
- [x] Rename "Galactic Year" to "Galactic Transit" on the favicon and in the app icon
      manifest. Wordmark refitted to the arc (43/2.5, same coverage as before), all six
      PNGs regenerated from the SVG by the new `tools/render_icons.js`, manifest and the
      iOS home-screen title renamed. The *galactic year* counter and the music track
      titles keep their name — v2.57.0.
- [ ] Andromeda's dark clouds render over the Milky Way (and vice versa): a galaxy that is
- [x] Andromeda's dark clouds render over the Milky Way (and vice versa): a galaxy that is
      behind the other from the camera's viewpoint darkens the one in front, because
      multiply blending knows nothing of depth. Draw the farther galaxy's haze and dust
      first, each frame, so clouds only ever thin their own galaxy's light — v2.57.1.
- [ ] Drop the "The clock is stopped while you read. It starts when you do." paragraph
      from the tutorial card.
- [ ] `sw.js` carries two `const V` lines after v2.57.1 — a SyntaxError, so the service
      worker cannot install at all. Collapse them back to one.

### Shipped earlier, for the record

- [x] Panels close by swiping toward their own edge (already in place; verified).
- [x] The merged remnant is no longer captioned "Andromeda (M31)" — v2.51.1.
- [x] A supernova blast shader of its own — v2.52.0.
- [x] Scenario list in the order things happen; "After the merger" actually after it — v2.52.0.
- [x] The Sun reddens as a giant; inner planets flare white when swallowed and stay gone;
      a planetary nebula is drawn and labelled; remnants are filamentary shells — v2.53.0.
