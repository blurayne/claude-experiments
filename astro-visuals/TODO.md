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
- [x] Revert v2.60.3's hiding of the core, and fix only the marked spot: the compact
      bright blob sitting in the dark lane, right of centre, in the Solar System view.
      Reverted in full (the bare "Settings" title, asked for separately, stays). The spot
      was never the core glow: it is the galaxy's nuclear star cluster and nuclear disc —
      ~370 + ~2,000 bright *stars* within 200 pc of Sgr A* — which are drawn after the
      dust and at 8 kpc collapse onto one pixel. From inside the disk that index range is
      skipped; the bulge's star cloud and the core glow draw as before, the lane through
      them. Verified: the point vanishes, the frame is otherwise unchanged, and from outside
      the flag changes nothing — v2.60.4.
- [x] At ×10⁷ the Sun looks almost stuck while the galaxy rotates past it and many stars
      move faster than it. Is the galaxy spinning faster than the Sun travels, or are the
      stars' speeds wrong? Measured, not a bug: the Sun turns 160° per 100 Myr, exactly the
      flat-curve rate at its radius, so it co-moves with its neighbours; stars inside its
      orbit have higher angular speed (same 230 km/s, smaller circle) and do lap it; and
      the arm pattern turns 225° per 100 Myr — 41% faster — by design: corotation is drawn
      at 19 kly so the Sun crosses an arm every ~140 Myr, the cadence the ice-age hypothesis
      needs, and only an arm crossing cools Earth below the 11.2 °C ice threshold. Gaia-era
      measurements put spiral corotation near the Sun instead, which would end the ice ages
      — the owner's call; left as is — assessed under v2.61.0.
- [x] Does our galaxy rotate in the right direction? If not the Andromeda merger needs
      another fix too. Check Andromeda's rotation direction as well. It did not: the scene
      frame the star builders use (l=90° on +x, north on +y, centre on −z) is left-handed,
      so the whole drawn universe was a mirror image — counter-clockwise from galactic
      north where the Galaxy turns clockwise, constellations flipped. Every data set shares
      the frame consistently, so the fix is one reflection in the projection; the drag keeps
      its feel. Andromeda's direction and spin were built in the same frame and come right
      with it (its comment said the wrong side approaches; the numbers were right). Verified
      old against new: Rigel left of Betelgeuse, clockwise from north, drag unchanged —
      v2.61.0.
- [x] A third slider in the Simulation panel, −100% … 0 … +100%, default 0, with a reset
      button instead of +/−. +50% runs time at half the set speed; −50% at half the set
      speed backwards. "Shuttle": at 0 it is not engaged and the clock belongs to play/pause
      as before (so the piece still opens running); off 0 it takes the clock over, forward
      or backward, paused or not; reset returns 0. Not persisted. Backwards, the trails are
      recomputed from the clock at ~10 Hz so the swept path retracts. Measured ±100 → ±1×,
      ±50 → ±0.5×, and −100 while paused → −1× — v2.62.0.
- [x] HUD: debounce its maximum width for 1 s — growing wider applies at once, shrinking
      waits, so a wider bar stays before a shorter one replaces it. A min-width floor on the
      status bar, measured with the floor lifted at the HUD's own tick; lowered only after a
      full second of narrower content. Measured: 420 → 497 px at the first sample after the
      number lengthened, held through 1.4 s after it shortened, released by 2.7 s — v2.62.1.
- [x] The shuttle reads "off" at 0 instead of "0%" — v2.63.0.
- [x] Allow panning with two fingers. The two pointers' midpoint carries the scene; kept
      as a fraction of the view's height along the camera's right and up (so zoom keeps the
      composition and a galaxy-scale pan cannot lose the Sun after a dive), cleared at every
      re-seed of the view. Verified with real touch: +80,+80 px of fingers moved the Sun
      label +80,+80 px, a pinch zoomed with zero pan drift, GO cleared it — v2.63.0.
- [x] "If galactic age": the background texture 20% more transparent — read as the glacial
      frost again, on top of v2.60.2's 20%: .336 → .269, 64% of the original — v2.63.0.
- [x] Improve the visibility of Andromeda's spiral arms a bit. Stars, HII knots and the
      haze are now weighted by the map's ridges (a pixel's excess over a 20-px blur, clamped
      at 0.3, K = 24; haze 60% of that; an arm's stars 25% of that brighter). Measured at
      screen scale the star layer's arm contrast goes ~1.5 → ~2, and face-on the arms read
      as arms where they were a mottle. K = 3 did nothing and K = 12 little: the map's
      ridges average 0.08 — v2.63.1.
- [x] Zoom + / − buttons under the help button, switchable on/off in Visuals. Each press
      zooms smoothly, and the steps respect the objects: always toward the next bigger or
      smaller object, in two steps per object. A ladder of sixteen object scales (Sun to
      Local Group) with a geometric rung between each pair; a press moves the goal one
      rung and the existing log-space easing carries the distance there. Verified: help
      146 px → + 190 → − 234 → pause; Oort shell − − → nearest stars and + + back; the
      switch hides them, closes the gap and persists — v2.64.0.
- [x] Put the zoom buttons under the play button, and have them active by default. Dock
      order is now help → play → + → −; they were on by default already and now also take
      their state from the Visuals switch at boot. Verified fresh, with an old settings
      set, and in landscape — v2.64.1.
- [x] An event (scenario) and a viewport (view) on screen for the "Anthropic Nebula".
      Scenario "The Anthropic Nebula — the Sun casts its shell (+7.8 Gyr)": lands 20 Myr
      before it, ×10⁷, framed at ~3.5 ly; view "Anthropic Nebula" frames the same,
      following the Sun's remains. The old option renamed once the Sun is gone now reads
      "Anthropic Nebula core" so the plain name is the view's — v2.65.0.
- [x] Debug only: an option to encode the current settings into a QR code, drawn as the
      topmost overlay, at 1×, 2× or 4× pixels per module, switchable on/off in settings;
      entering debug mode switches it on. A "Debug" section in settings, shown only in
      debug mode. The encoder lives in the page (byte mode, level L, v1–40, masks by
      penalty), verified module for module against Python's `qrcode` at every size; the
      exported state (~1 KB, timestamp left out so the code holds still) is v23; the drawn
      overlay decodes back exactly with zxing — v2.65.0.
- [x] The Sun's shell casting should look better — something of an explosion at its
      onset, while staying scientifically correct (clarified: the planetary nebula, not a
      supernova). `PN_FS` rewritten on the interacting-winds picture, staged over the
      nebula's age: warm dusty envelope in a burst of scattered starlight (a reflection
      halo up to 3.5× the shell via `uBurst`, not a shock), the ionisation front sweeping
      out (teal inside, warm dust beyond), the fast wind hollowing the cavity, the
      filamentary [OIII]/Hα shell with cometary knots and the old wind's halo, then
      dissolution. Rendered through its life and closely at the onset — v2.67.0.
- [x] Add Earth to the view select; a proper 3D Earth with shaders for the planet's phases
      as it goes through time; a Moon, with its orbit shown at Earth scale. "Earth" view
      (follows the planet, the Moon's orbit in frame; two zoom presses to the globe); a
      sphere shaded in the fragment (`GLOBE_FS`) with an era model from the clock and the
      climate — molten Hadean, hazed Archean, snowballs, caps, greening, drying, melting
      again — clouds with shadows, Rayleigh limb, soft red terminator, glint, city lights
      in the human era; the Moon at its true, receding distance with maria, its orbit ring
      and label; the Sun and nebula sized by the camera's distance to the Sun (from Earth
      it had filled the sky); the readout down to km. Verified across eras, over the pole
      in June, at the terminator, and all other views unchanged — v2.68.0.
- [ ] Speed slider reaches down to hours: 1, 2, 3, 4, 6, 8, 10, 12, 16, 20, 24, 32 hours,
      1–4 weeks, 1, 2, 4, 6, 8 months, then years as n × 10^k with n = 1…9 per decade.
- [ ] An option that locks the viewport to a planet's spin (the camera co-rotates with the
      body, so the same face stays in view and the plates can be watched drifting) — a
      short name for it, "Spin lock" or better.
- [x] Earth from real textures (SVG-like coastlines) rather than noise: today's map, the
      plates moving from Pangaea to now and on to Pangaea Proxima, the oceans evaporating
      and the biosphere collapsing; ice ages and dry periods incorporated — v2.69.0.
- [x] The "helix" scenario starts at the current date and time: simT counts Earth's
      orbits from 2026.0, so it is set to the real elapsed fraction of years since
      2026-01-01 UTC, and the human-year readout follows — v2.65.0.
- [x] Planet trails: are they drawn in the right direction? They should fade out at the
      end, not at the start. Forward, yes: sample N−1 is now and the brightest, the fade
      runs into the past (`vF = id/N`, pow 1.7). In reverse (the shuttle) they pointed into
      the sim-past, which then lies AHEAD of the body — the sweep now follows the viewing
      direction, recomputed on every change of the shuttle's sign, paused or not.
      Verified: sample 0 is the past forward and the future in reverse — v2.65.0.
- [x] The QR overlay is movable by touch (or mouse): pointer-captured drag, clamped to
      the screen, and the canvas below never sees it — v2.65.0.
- [x] The QR overlay defaults to 1x pixels per module (slider 0). Verified on a fresh
      profile at a phone's DPR: 117 px canvas, decodes back to the exact state, and a
      full-resolution screenshot of the page decodes too — v2.65.1.
- [x] The QR overlay sits bottom right by default, remembers where it is moved to, and a
      double tap on it switches it off. Its place is fractions of the free space, so (1,1)
      is the corner at any size or scale; a drag records it and saves it. Verified: bottom
      right on a fresh profile, still cornered after switching to 4×, dragged to the top
      left and back there after a reload, a single tap leaves it alone, a drag is never a
      tap, and two taps in quick succession switch it off — v2.66.0.

### Shipped earlier, for the record

- [x] Panels close by swiping toward their own edge (already in place; verified).
- [x] The merged remnant is no longer captioned "Andromeda (M31)" — v2.51.1.
- [x] A supernova blast shader of its own — v2.52.0.
- [x] Scenario list in the order things happen; "After the merger" actually after it — v2.52.0.
- [x] The Sun reddens as a giant; inner planets flare white when swallowed and stay gone;
      a planetary nebula is drawn and labelled; remnants are filamentary shells — v2.53.0.
