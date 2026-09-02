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
- [ ] Show the Galactic Year logo on the tutorial start screen too, as a right-aligned
      SVG, keeping its background transparent.

### Shipped earlier, for the record

- [x] Panels close by swiping toward their own edge (already in place; verified).
- [x] The merged remnant is no longer captioned "Andromeda (M31)" — v2.51.1.
- [x] A supernova blast shader of its own — v2.52.0.
- [x] Scenario list in the order things happen; "After the merger" actually after it — v2.52.0.
- [x] The Sun reddens as a giant; inner planets flare white when swallowed and stay gone;
      a planetary nebula is drawn and labelled; remnants are filamentary shells — v2.53.0.
