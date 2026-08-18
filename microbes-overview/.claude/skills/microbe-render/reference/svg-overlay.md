# SVG overlay spec

`build_svg.py` turns a chosen render + a `labels.json` into a labelled teaching SVG
plus a toggle HTML. The base image is the bottom layer; three independent label
layers sit on top.

## labels.json
```json
{
  "microbe": "rod-bacterium",
  "base": "rod-bacterium.attempts/gen-01__gemini-2.5-flash-image.png",  // relative to the .svg
  "width": 1080, "height": 1080,
  "labels": [
    {"key":"cell_wall","ax":762,"ay":424,"tx":935,"ty":398,
     "la":"Paries cellularis","en":"Cell wall","de":"Zellwand"}
  ]
}
```
- `ax,ay` = point ON the structure (the leader line starts here — **no anchor dot/circle**).
- `tx,ty` = the label text position (baseline, at the near edge per the anchor rule),
  out in an empty margin. Put right-side text near the right edge, left-side near the
  left edge, and spread them so leaders don't cross.
- **Leader endpoint = the CENTRE of the label text**, not the `tx,ty` edge: the line
  runs from `ax,ay` to the text's horizontal midpoint at mid-height. The text is
  painted last, so its halo hides the overlap and the leader appears to emerge from
  the middle of the label. `build_svg.py` computes the centre from the glyph widths.
- An **annotation subagent** produces these by viewing the specific chosen image —
  coordinates are per-image because generated layouts differ.

## Layers & default state
- `#labels-en` visible (`display:inline`), `#labels-la` and `#labels-de` hidden.
- Each label: light-over-dark leader line and halo text (default white fill + 4px
  black `paint-order:stroke`) so it reads over dark / false-colour images.
- **Label ink is per-style.** Override via top-level `text_fill` / `text_stroke` in
  `labels.json`. **Watercolor plates use black text on a paper-coloured halo**
  (`"text_fill":"#111"`, `"text_stroke":"#F5E9CE"`) so labels sit naturally on the
  cream paper instead of glowing white. Dark/false-colour styles (textbook, 3d, sem)
  keep the white-on-black default.
- **Anchor rule:** left-margin label (`tx < ax`) → `text-anchor:start` (reads right,
  toward the cell); right-margin label → `text-anchor:end` (reads left). This keeps
  text on-canvas.

## HTML wrapper
`<microbe>.<theme>.html` inlines the SVG and adds En/La/De buttons that toggle each
layer's `display`. Multiple languages can be shown at once; **English starts on**.

## Base image format
Reference the **PNG** (or AVIF) for the SVG base — broad browser support. Do **not**
use HEIC as the SVG base (Safari-only); HEIC is archival storage only. If the source
micrograph carries a baked-in data/scale bar, crop it before using it as a base.
