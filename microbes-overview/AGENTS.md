# microbes-overview — agent notes

This folder builds one thing: a **render library + interactive viewer** — AI-rendered
teaching images under `renders/set/` (produced by the `microbe-render` skill in
`.claude/skills/`) and the single-page `viewer.html` that browses them.

`cells_data.py` is the catalogue it reads for names and descriptions. It used to also
feed a WeasyPrint poster builder (`build.py` → `microbes_{en,de}.html/.pdf`, with BioArt
icons fetched into `images/`); that pipeline was removed, so the per-entry
`image_filename` / `image_url` / `image_credit` / `image_license` fields are dormant
provenance metadata that nothing reads any more.

## The interactive viewer

`viewer.html` is a self-contained, framework-free page (vanilla JS) that reads an inlined
JSON blob and renders every microbe. Users switch **audience** (Kids/Adult/Scientist),
**language** (EN/DE), **picture layout** (a 2×2 grid of style boxes), **theme** (Dark-lab /
Blueprint / Petri, each light+dark), search by name/description, and open any figure
fullscreen. It works on mobile and desktop.

### Build pipeline

```
cells_data.py  +  renders/set/**  ──►  build_viewer.py  ──►  viewer-data.json  ──►  viewer.html
                                             │
                                    viewer.template.html (front-end, with a __DATA__ slot)
```

Rebuild after any render or data change:

```bash
cd microbes-overview
uv run build_viewer.py      # or: python3 build_viewer.py   (stdlib only)
```

It prints e.g. `wrote viewer-data.json: 12 sets, 72 microbes` and `wrote viewer.html`.
If you added **new** renders, run the skill's `scripts/overview.py` first so the
`finals/` galleries exist, then `build_viewer.py`.

- **`build_viewer.py`** scans the data and emits `viewer-data.json` (the source of truth),
  then injects it (compacted, with `</`→`<\/` guarded) into `viewer.template.html`'s
  `<script id="microbe-data">` slot to produce `viewer.html`.
- **`viewer.template.html`** is the editable front-end. Edit it (HTML/CSS/JS) and re-run
  `build_viewer.py` to regenerate `viewer.html`. **Never hand-edit `viewer.html`** — it is
  generated and will be overwritten.

### What goes into `viewer-data.json`

Per set (in `cells_data.py` `PAGES` order): bilingual `title`/`subtitle`/`description`.
Per microbe: bilingual `name`/`short`, six audience descriptions
(`desc.{kids,adults,sci}.{en,de}`), the present final image paths
(`img.{reference,sem,3d,textbook,watercolor}` — existence-checked), the committed labelled
SVG paths (`svg.*`, a lightbox fallback), the compact **label geometry** (`lab.*` — anchor
+ text coords + `la`/`en`/`de` per structure, read from each `theme/<style>/<key>.labels.json`),
and a lowercased `search` blob.

### Labels: language × audience

The labelled diagrams are rendered **live** as an SVG overlay: the small AVIF final plus
label layers generated from `lab` geometry (this avoids loading the committed
`theme/*/*.svg` files, which embed the full 1–2.7 MB raster and are far too heavy to load
many of). Label visibility follows the UI:

- **Kids / Adults** → the everyday label in the chosen language (`en` or `de`).
- **Scientist** → the **Latin** scientific term (the `la` layer), regardless of language.

Descriptions switch by audience+language independently. There is **no** per-audience label
*wording* in the data — only the three language layers — so the Scientist→Latin mapping is
how audience touches the labels. (See `.claude/skills/microbe-render/reference/svg-overlay.md`.)

### Data facts / gotchas

- `cells_data` page `id` maps 1:1 to `renders/set/<id>` **except** `pathogens` →
  `pathogens-generic`. `build_viewer.py` has this in `PAGE_TO_FOLDER`.
- German microbe names come from `cells_data` matched by **exact `meta.name == name_en`**
  within the mapped set (slugs are unreliable, e.g. "Immunoglobulin G (IgG)" → key `igg`).
  No match (e.g. `coronavirus`, not in `cells_data`) → English name is reused.
- Skip the `reference-microscopy` and stray `set` folders when enumerating.
- **Missing assets are tolerated.** A microbe/style with no final AVIF shows a placeholder
  tile; the labelled overlay needs the AVIF, so microbes with no finals at all
  (`epithelial/paneth-cell`, `reproductive/leydig-cell` at time of writing) show
  placeholders in the grid and fall back to the committed embedded SVG in the lightbox.
- Performance: only near-viewport cards build (IntersectionObserver), far ones tear down,
  and every raster load goes through a small concurrency gate so a nav-jump can't flood the
  request pool. Labelled thumbnails and the lightbox both use the light AVIF-based overlay.

### Deployment (GitHub Pages)

`.github/scripts/build_site.py` copies this whole folder into `_site/microbes-overview/`
verbatim and preserves any committed `*.html`, so `viewer.html` is served as-is at
`/microbes-overview/viewer.html` and is linked from `index.md` (the folder's markdown
landing page is unchanged). For Pages to serve the images, the referenced
`renders/set/*/finals/*.avif` and `renders/set/*/theme/*/*.svg` (and `viewer.html` +
`viewer-data.json`) must be **committed** — PNG masters and HEIC copies stay git-ignored.

### Coloring-book pages (kids)

A separate style: black-and-white **vector** SVG coloring pages (friendly characters
with faces in a typical scene, bilingual EN/DE speech bubble, no anatomical labels).
`scripts/coloring.py` renders a B&W line-art raster with an image model, then traces
it to a crisp scalable SVG (potracer) and injects a vector speech bubble with
`#labels-en`/`#labels-de` toggle text — so the viewer's language switch flips the
speech, and the Print button prints it full-size on A4. Output:
`renders/set/<set>/coloring/<microbe>.coloring.svg` (committed; the raster
`*.attempts/*.png` stay git-ignored). Currently the immune-cells + red-blood packs
(12 pages). `build_viewer.py` picks up `coloring/<key>.coloring.svg` into each
microbe's `coloring` field; "Coloring" is a Pictures-chooser option.

### Local preview

```bash
cd microbes-overview
python3 -m http.server 8791
# open http://localhost:8791/viewer.html
```
