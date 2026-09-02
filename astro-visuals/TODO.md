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
- [x] Andromeda's dark clouds render over the Milky Way (and vice versa): a galaxy that is
      behind the other from the camera's viewpoint darkens the one in front, because
      multiply blending knows nothing of depth. Draw the farther galaxy's haze and dust
      first, each frame, so clouds only ever thin their own galaxy's light — v2.57.1.
- [x] Drop the "The clock is stopped while you read. It starts when you do." paragraph
      from the tutorial card. The behaviour is unchanged — the tour still holds the clock
      and hands it back on the way out, it just no longer says so — v2.57.2.
- [x] `sw.js` carries two `const V` lines after v2.57.1 — a SyntaxError, so the service
      worker cannot install at all. Collapsed to one, keeping the `galactic-transit-`
      prefix the second line had reverted — v2.57.2.
- [x] Use the owner's face-on Andromeda picture — the v2.56 composite completed by human
      and AI — as `m31-map.webp`, at the highest quality; say in the changelog that it was
      completed by human and AI; then reprocess the Andromeda model from it. Installed
      lossless at the sampler's 448² (the 2048² original kept as `tools/m31-map-hand.jpg`),
      mirrored left-right so the arms trail under the simulation's spin as supplied they
      led; the builder now refuses to overwrite a hand-finished map without `--force`, so
      the data workflow cannot put the seam back. The model regenerates from the map at
      load, verified in the renderer — v2.58.0.
- [x] Hot-fix: v2.58.0's `sw.js` carried two `const V` lines (rebase keep-both) — one
      line again, and the ship chain now stops on a failed parse — v2.58.1.
- [x] Labels that just spin around: debounce them, but without labels jumping. A new
      feature flag under Other options, on by default for now. "Steady labels": every
      label eases into place (60 ms), lands rather than flies on a single leap, steps aside
      while its target leaps frame after frame and returns once calm, and hiding is
      debounced — v2.59.0.
- [x] After the Andromeda–Milky Way merger, show one label only: "Milkomeda" (the name
      Cox & Loeb gave the remnant; the request said "Milkomedia") — from the same merge
      threshold at which the other galaxy names step down — v2.59.0.
- [x] Losing focus must remember the play state of the animation and the music, and
      restore exactly that on regaining focus (the v2.45.0 handler is not doing it). It
      recorded what the media element was doing, and a backgrounded tab has that paused by
      the browser already — so it recorded "nothing playing". It now records the intent and
      restores it, and survives the doubled visibilitychange some browsers fire — v2.59.1.
- [x] Swiping a panel toward its own screen edge to close it still does not work. It
      works with a mouse; the gesture is being lost on touch. Not touch as such: the panel
      is 178 px wide on a phone, so the swipe crossed its own edge and `pointerleave`
      aborted it. The pointer is captured now, `pointerleave` is gone, and the panels carry
      `touch-action:pan-y`. Verified with real touch events at phone size — v2.59.1.
- [x] Music does not play any more, especially after a reset; check the sound effects too.
      Two latches that could never be retried: the audio unlock stood down on the first
      gesture even when the `play()` it tried was refused, and the sample-bank loader
      marked itself tried before the work, with its fallback only on a rejection — so a
      `decodeAudioData` that never settles left the effects silent for the visit. The
      unlock now waits for the music to actually play and listens for more gesture types;
      the banks retry and fall back on a timeout. Note the effects slider ships at 0
      (effects are opt-in by design) — v2.59.2.
- [x] Settings dialog: title reads "settings", small like the other dialogs' titles. At
      8.5px (7.5px on a phone), the size its sibling panels Simulation and Earth use — it
      sits in the same columns as them, so that is the "other" it should match — v2.60.0.
- [x] Settings dialog: move the full/auto buttons to the bottom left, on the same line as
      the refresh button. They live in `.hudfoot` now; the empty toggles row and its rule
      above it are gone — v2.60.0.
- [x] Move the build stamp, date and changelog link out of the settings footer and into
      the information dialog, as its second line (`.info-sub`, directly under the title;
      the `buildInfo` id moved with it, since the UTC tooltip hangs off it) — v2.60.0.
- [x] The dark clouds cannot be seen on the galaxy in the helix view. From inside the
      disk the band's light all lies behind the local dust, but the HII band was drawn
      after the dust, so nothing carved it; and at dive a cloud that should span degrees
      was clamped to a 40 px dot. Inside the disk the whole backdrop now goes down first
      and the dust over it — the Great Rift splits the band and hides the centre — with
      the deep ceiling scaled by canvas width so a phone is not blackened. Measured: 40 px
      carves a lane, 120 and 220 crush the band — v2.60.1.
- [x] During a glacial age, make the textured background 20% more transparent. The frost
      crystal texture on the panels (`.hud/.env/.gamebar/.note/.info-card::before`), whose
      opacity rides `--iceA`: .42 × 0.8 = .336. Not the glacial wash under it — measured,
      that is nearly black over an already-dark scene and moves the panel by 0.5/255 — the
      texture is what sits over the readings — v2.60.2.
- [x] Add a setting under Visuals to turn the dark clouds off. Already there: Visuals →
      features → "dark clouds" (`tDust`), persisted in `S_TOG`. Verified end to end —
      unticked, the band brightens 80 → 102 and it stays off across a reload — so no second
      switch was added — v2.60.3.
- [x] Remove the version number from the settings dialog. The `verHud` span and the line
      that filled it both went (an orphaned id is how v2.60.0 died at boot) — v2.60.3.
- [x] With the dark clouds on, the centre of the galaxy can still be seen from inside the
      disk. Not accurate: from Earth the Galactic Centre is hidden behind the dust. The core
      glow is now not drawn while the eye is in the dust layer (within ~25 units of the
      plane and inside the disk's edge), fading in as it rises out or leaves the disk; the
      multiply could never take a glow that bright to nothing. Edge-on from outside the
      bulge still glows with the lane through it — v2.60.3.

### Shipped earlier, for the record

- [x] Panels close by swiping toward their own edge (already in place; verified).
- [x] The merged remnant is no longer captioned "Andromeda (M31)" — v2.51.1.
- [x] A supernova blast shader of its own — v2.52.0.
- [x] Scenario list in the order things happen; "After the merger" actually after it — v2.52.0.
- [x] The Sun reddens as a giant; inner planets flare white when swallowed and stay gone;
      a planetary nebula is drawn and labelled; remnants are filamentary shells — v2.53.0.
