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

## Audience registers are not decoration

Every piece of prose in this atlas exists three times — **Kids**, **Adults**, **Scientist** —
in **both** languages, and the viewer's audience switch is the whole point of the data model.
So *always write for a named audience*, never write one text and lightly reword it twice:

- **Kids** — playful, GiantMicrobes-flavoured. Assumes basic body/microbe knowledge, not
  none. Says what the thing *does for you*, friend or foe. For a pathogen, say how it is
  dealt with, and **vary it** (hygiene, rest, water, a medicine from the doctor, the body
  clearing it) — "your immune system eats the invaders" is fine occasionally, never as a
  formula. No fear imagery, no war metaphors, no blood.
- **Adults** — popular science, health-focused. Mechanism in plain words, no moralising
  about good and bad microbes.
- **Scientist** — precise mechanism, correct terminology, the numbers that matter, and the
  caveat where the textbook simplification breaks down.

The German is a **register-matched rewrite**, not a translation of the English. Real umlauts
(ä ö ü ß), real em dashes (—), never `--`. The same rule applies to set/chapter descriptions
(`description_kids_*`, `description_adults_*` in `cells_data.py`), not only to microbes.

## Adding a new entry — the checklist that keeps getting missed

Rendering is the visible part and the smallest part. A subject is **not** done until all of
this is true; each line here is something that was silently skipped at least once.

1. **`cells_data.py`** — the entry, with `name_en`/`name_de` (+ optional `name_kids_*`),
   `func_*`, `deps_*`, `related`. `name_en` is load-bearing: `build_viewer.py` matches the
   render to the catalogue on `meta.name == name_en` **byte-exactly**, and the render key is
   `name_en` with parentheticals dropped, lowercased, non-alphanumerics hyphenated. Get it
   wrong and the subject vanishes from the site with no error.
2. **Renders** — the five pictures, three labelled diagrams, coloring page, per the
   `microbe-render` skill.
3. **Both languages, all three audiences** — six description blocks EN+DE. Not five.
4. **Kids narration, EN and DE** — `tts.py --microbe <key>`, and it only works *after*
   `build_viewer.py` has seen the subject (it reads `viewer-data.json`; a subject that has
   not been through the barrier reports "0 clips" and silently does nothing). Verify the
   entry ends up with `audio [de, en]`, not one of them.
5. **`microbe_scale.py`** — size and weight, or the scale meter is simply absent.
6. **`microbe_giant.py`** — look for a matching GIANTmicrobes plush and **prove the match**.
   Judge against the `species` field of `../giant-microbes/merged_catalog.json`, view the
   product photo, and confirm the URL resolves. Same genus is not the same organism; a
   generic plush does not belong to one named member. Prefer the `riesenmikroben.de` URL
   whenever the string exists at all. If there is no exact match, record *why not* in the
   docstring's non-link list — an unrecorded non-link gets re-litigated every audit.
   Re-run the audit over the **whole** catalogue after each batch, not just the new subject:
   the audit only walks live subjects, so a plush for something rendered later is never
   found unless you sweep again.
7. **Barrier, in order** — `status.py` → `overview.py` → `build_viewer.py` → `tts.py` →
   `build_viewer.py` → `build_overview.py`.
8. **`index.md` and the set counts** — they go stale silently.
9. **`PLAN.md`** — record every compromise you accepted rather than fixed.

### Local preview

```bash
cd microbes-overview
python3 -m http.server 8791
# open http://localhost:8791/viewer.html
```
