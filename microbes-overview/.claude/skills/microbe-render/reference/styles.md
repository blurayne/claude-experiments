# Style templates (themes)

Four render themes. Each microbe is rendered in every theme; `theme` = the folder
name, `styles` = the human label in RENDER-STATUS.md. A prompt-writing subagent
fills the `{...}` slots from the microbe's science reference. Keep a consistent
"house" framing across a set so it reads as one poster.

**Global rules baked into every prompt (do not omit):**
- Square 1:1, high detail, single specimen centered, generous margin.
- **Fill the whole square edge-to-edge — no black border, dark frame, vignette or
  letterbox bars** around the image. This includes NOT drawing the artwork as a
  separate sheet/card/page lying on a table or surface (no mat, no drop shadow, no
  background panel around a "sheet"): the illustration's own background must reach
  all four edges.

**Style-consistency check (MANDATORY before accepting any render).** Compare each
render against the set's exemplars and re-render style outliers *even if the science
is correct*:
- **textbook** → must be COLOURED (every structure a distinct soft fill), like
  `cocci__textbook` / `parasite__textbook`. A monochrome / uncoloured line drawing is
  a FAIL.
- **watercolor** → warm aged paper filling the whole frame, like
  `cocci__watercolor` / `rod-bacterium__watercolor`. A framed/matted sheet-on-a-surface
  is a FAIL.
- **3d** → natural biological tints (see below); **sem** → false-colour surface only.
- **No text, no letters, no numbers, no labels, no scale bars, no watermark** baked
  into the image (labels are added later as SVG layers).
- Anatomically faithful to the reference: correct gross morphology, only the
  structures the reference lists, none of the flagged-misleading ones (e.g. no
  mesosome), correct relative sizes and counts.
- Neutral/!dark uncluttered background so overlay labels read well.

## sem — colorized SEM micrograph
`{organism}` rendered as a photorealistic **false-color scanning electron
micrograph**: crisp 3D surface texture, shallow depth of field, specimen
attached to a subtly textured substrate, cool studio microscopy lighting,
false-color palette ({palette}). Convey true scale and the surface appendages
({surface_features}). Looks like a real SEM plate minus any text.

## textbook — clean labeled-diagram illustration
`{organism}` as a **clean cutaway textbook illustration**: semi-flat vector-ish
shading, crisp boundaries between structures, a quarter cut-away revealing the
interior ({internal_structures}) with the envelope layers ({envelope_layers})
clearly distinct, muted educational palette, generous negative space around each
structure so labels can attach. No text. **Match the exact house look of
`rod-bacterium__textbook` / `parasite__textbook`:** a MUTED, sophisticated, slightly
desaturated educational palette (soft dusty tints — never bright primary/cartoon
colours); THIN, clean outlines (NOT heavy black cartoon strokes); gentle soft shading
with subtle dimensionality; each structure its own distinct soft colour fill; a
neutral dark-charcoal / muted background. Refined and elegant. Two failure modes to
re-render: (a) a monochrome / uncoloured line drawing; (b) a bold-black-outlined,
bright, flat cartoon. Both are FAILs.

## 3d — semi-realistic 3D medical render
`{organism}` as a **stylized 3D medical-illustration still**: soft global
illumination, subsurface scattering on membranes, clean seamless studio
background, gentle rim light, structures ({key_structures}) modeled with
believable material but slightly idealized for clarity. Scientific-animation look.
**Colorize with natural, believable biological tones so the structures are clearly
distinguishable** — a warm translucent cell body, distinct tints for the wall,
membrane, nucleoid, plasmids and ribosomes — not near-monochrome and not neon.

## Reference-clean edit (edit_image.py, for real micrographs)
Send the downloaded micrograph + this instruction to clean it for teaching:
"Remove ALL text, letters, captions, numbers and scale bars, and remove any black
borders / frames / letterbox bars. Recompose so the {organism} fills the frame,
centered, on a clean uniform background. **Keep the existing false-color
colorization if present; if the image is greyscale, apply a tasteful natural
false-color.** Do not change the shape or invent structures. Square, no text."
If the source is letterboxed, pad it with the sampled background colour (not black)
before editing so no black bars survive.

## watercolor — naturalist scientific plate
`{organism}` as a **hand-painted watercolour naturalist plate**: soft washes,
fine ink linework for outlines, aged-paper warmth, the composition of a 19th-c.
scientific atlas but anatomically modern and correct. Single specimen, no text.
Labels on this style use **black text on a paper-coloured halo** (see below).
**The warm aged paper must FILL THE ENTIRE FRAME edge-to-edge and corner-to-corner —
the paper IS the background.** Do NOT render the artwork as a separate sheet/card/page
lying on a table or surface, and NO mat, border, frame, drop-shadow, or grey/dark
panel around a paper sheet (the most common failure here). Match `cocci__watercolor`
/ `rod-bacterium__watercolor`: subject large and centred, a soft darker wash halo
directly on the paper behind it, rich translucent washes. A framed/matted
sheet-on-a-surface is a FAIL → re-render.

---

## SVG label style tokens (kept in sync with build_svg.py)
- Font: Nunito / system sans, weight 700, size 26 (on the 1080² canvas).
- No anchor dot — the leader line runs from the structure to the label.
- Leader line: 2px light under 0.7px dark, ~0.9 opacity; it **ends at the centre of
  the label text** (hidden under the text halo), not at the text's edge.
- Text: 4px `paint-order:stroke` halo → readable on any background; `text-anchor`
  flips to `end` when the callout sits left of its anchor. Ink is **per-style**:
  white-fill / black-halo by default (textbook, 3d, sem); **watercolor overrides to
  `text_fill:#111` / `text_stroke:#F5E9CE`** (black on paper) via `labels.json`.
- Three layers `#labels-en|la|de`; **English visible by default**, La/De hidden,
  toggled by the HTML buttons.
