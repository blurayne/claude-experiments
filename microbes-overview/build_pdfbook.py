#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = ["playwright>=1.40"]
# ///
"""Render a children's picture-book PDF from viewer-data.json via headless Chromium
(playwright print-to-pdf), one A4 book per language.

viewer-data.json (built by build_viewer.py, see AGENTS.md) is the single source of
truth read here — cells_data.py, viewer.template.html and microbe_giant.py are NOT
touched or read by this script.

Layout (from TODO.md's "PDF-Book for Children" item):

- Audience is always "kids": every entry uses `desc.kids.<lang>` and the kids-wording
  name (`nameKids`, falling back to `name`) for both the entry title and the coloring
  page's injected caption.
- Section header (title/subtitle/intro) either flows inline as a banner above the
  first entry's Page A, or gets its own dedicated page, decided by one concrete rule:

      SECTION_PAGE_THRESHOLD_CHARS = 320
      dedicated page  iff  len(subtitle[lang]) + len(intro[lang]) > 320 chars

  320 chars is roughly two short sentences of subtitle plus one compact paragraph of
  intro — short enough to sit as a banner without crowding the first entry's own
  title + image grid + (often 1000+ char) description off the page. Measured against
  the real data (18 sets): most sets' kids intros run 350-600 chars per language and
  get their own page; only `organelles` (EN 276 / DE 305) and `helpful-microbes`
  (EN 309) land under the line and flow inline. The threshold is evaluated
  independently per language, since a translation can cross it while the other
  doesn't (`helpful-microbes` DE is 332, just over — so its DE banner becomes a
  dedicated page while its EN banner stays inline). There is no separate "additional
  text block" field in the data beyond title/subtitle/intro, so the "or one with an
  additional text block" clause in TODO.md collapses into this same combined-length
  check rather than needing a second condition.
- Per subject, two pages:
    Page A: entry title, then an image grid — REAL / SEM / 3D stacked as three square
    cells in a narrow left column, TEXTBOOK-with-labels alone spanning the full grid
    height in the wide right column (see compute_grid_geometry()) — then the kids
    description, with the giant-plush photo floated right inside it when present.
    The grid's overall height (and hence the row/column mm values baked into its
    inline style) is computed per entry from that entry's title + optional inline
    section banner + description length, so the grid together with the description
    fills the page instead of leaving a blank band below a short description; a
    min/max clamp keeps the labelled cell legible and the wide cell from turning into
    a tall pillarboxed strip at the extremes (see GRID_MIN_H_MM / GRID_MAX_H_MM).
    Page B: the coloring page, full-bleed A4, only emitted when the microbe has one.
    The subject's kids-wording title is injected into the empty bottom band exactly
    like viewer.template.html's injectColoringTitle() does at runtime.
- A `kind: "chapter"` set (cell-basics, cell-types, muscle-tissue, ...) has no
  microbes and no Page A/B — it renders as a single title/subtitle/kids-prose page
  (render_section_page()) in data order alongside the regular sets. A `kind: "set"`
  with an empty `microbes` array (e.g. one still being populated by other tooling) is
  simply skipped; no subject or page count is ever hard-coded, the script re-reads
  whatever viewer-data.json currently contains.
- A giant-plush photo whose `giant.keychain` is true (only `nucleus` today) is captioned
  as a keychain rather than a plush — see microbe_giant.py's KEYCHAIN.
- The TEXTBOOK grid cell is a *live* label overlay built the same way
  viewer.template.html's overlaySvg() builds it in the browser: the AVIF final plus a
  leader-line/halo-text layer computed from `lab.textbook` geometry (decrossTy +
  separateBoxes, ported below), in the chosen language (kids audience -> the en/de
  label layer, never `la`). The committed per-theme labelled SVG
  (`renders/set/*/theme/*/*.svg`) is deliberately NOT used as a fallback: it embeds a
  1-2.7 MB raster per file, is git-ignored (not guaranteed to exist in a checkout at
  all — see .gitignore's "Keep the repo lean" note), and would balloon the PDF; the
  live overlay is ~3 KB of vector markup on top of the same small AVIF the rest of the
  grid already uses.
- Missing assets are tolerated (AGENTS.md): a missing grid image or coloring page
  degrades to a small placeholder tile / a skipped Page B, never a crash. Subjects
  short of pictures are collected and reported in the final summary line.
- Raster images are re-encoded to print-sized JPEGs before Chromium ever sees them
  (see `shrink_image()`). Headless Chromium's print-to-pdf embeds whatever pixel
  dimensions the DOM references at their *source* resolution, ignoring the CSS box
  they're displayed at — pointing it straight at the 1080x1080+ AVIF finals produced
  a ~20 MB PDF for 3 subjects (~750 MB for all 112). `ffmpeg` (already decodes AVIF
  via libdav1d) downscales each image to roughly the pixel size its grid cell will
  actually print at and re-encodes as JPEG, cached in `.tmp_build/imgcache/`.

CLI:
  ./build_pdfbook.py --lang en --out microbes-book-en.pdf
  ./build_pdfbook.py --lang de --sets organelles,immune-cells --limit 5 --html-only

Determinism: the generated HTML is a pure function of viewer-data.json + this script
(no timestamps, no random ordering, no wall-clock-seeded anything). Verified two
back-to-back runs of the same input to be byte-identical except for exactly two
bytes: Chromium's print-to-pdf always stamps the PDF's own /CreationDate and
/ModDate with the real wall-clock time, and there is no Playwright/Chromium flag to
suppress it — that is the "where playwright allows" caveat. Everything else
(content streams, embedded fonts, every embedded image byte, xref layout) matched
exactly.
"""
from __future__ import annotations

import argparse
import hashlib
import html
import json
import re
import subprocess
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DATA_PATH = ROOT / "viewer-data.json"
TMP_DIR = ROOT / ".tmp_build"          # local scratch, never /tmp (small tmpfs here)
IMG_CACHE_DIR = TMP_DIR / "imgcache"

# Target longest-edge pixel widths for the print-sized JPEG cache, chosen per grid
# slot at roughly 200 dpi for the mm box that slot occupies on the A4 page (see the
# .grid / .cell CSS below: the narrow column (REAL/SEM/3D, stacked) is a near-square
# cell whose side tracks the computed row height, typically ~55-70mm; the TEXTBOOK
# cell spans the full wide column and is much bigger, typically ~120-150mm on a side;
# floated plush photo ~32mm).
IMG_W_NARROW = 480     # REAL / SEM / 3D cells
IMG_W_TEXTBOOK = 1100  # TEXTBOOK cell's base raster (bigger cell than before -> more px)
IMG_W_PLUSH = 340      # floated giant-plush photo


def shrink_image(rel_src: str | None, target_w: int) -> str | None:
    """Downscale+re-encode an image referenced from viewer-data.json to a small
    print-sized JPEG, cached under .tmp_build/imgcache/. Returns a path relative to
    ROOT (so it works with the <base href> the generated HTML sets), or the original
    path unchanged if the source is missing or ffmpeg fails (never raises)."""
    if not rel_src:
        return rel_src
    src = ROOT / rel_src
    if not src.is_file():
        return rel_src
    IMG_CACHE_DIR.mkdir(parents=True, exist_ok=True)
    key = hashlib.sha1(f"{rel_src}:{target_w}".encode()).hexdigest()[:16]
    out = IMG_CACHE_DIR / f"{key}.jpg"
    if not out.exists():
        try:
            subprocess.run(
                ["ffmpeg", "-y", "-loglevel", "error", "-i", str(src),
                 "-vf", f"scale='min({target_w},iw)':-2:flags=lanczos",
                 "-update", "1", "-frames:v", "1", "-q:v", "4", str(out)],
                check=True, capture_output=True, timeout=30,
            )
        except Exception:
            return rel_src
    return str(out.relative_to(ROOT))

SECTION_PAGE_THRESHOLD_CHARS = 320

SVGNS = "http://www.w3.org/2000/svg"
ET.register_namespace("", SVGNS)

# ---------------------------------------------------------------------------
# Label-overlay geometry, ported from viewer.template.html's overlaySvg() /
# decrossTy() / separateBoxes() / textW() so the PDF's labelled textbook cell
# lays labels out exactly like the live viewer does. Only one language layer
# is ever needed here (the PDF is single-language), unlike the JS which builds
# all three (en/la/de) and toggles visibility.
# ---------------------------------------------------------------------------
LAB_FS = 36  # bumped from the on-screen 26: the SVG's user units track the source
# image's native pixel size (1080x1080), not print mm, so a font-size tuned to look
# right on a browser screen renders as unreadable specks once printed into even a
# fairly large cell (a 26-unit label in a 1080-unit-wide image is only ~2.4% of the
# cell's width/height; at the *old* ~46.5mm-tall wide cell that was ~1.1mm of actual
# ink -- illegible). It need not match the on-screen ratio, so it is chosen purely
# for print legibility against the new, much larger TEXTBOOK cell (see GRID_*).
W_WIDE = set("mwMW—–@%")
W_NARROW = set("ijlItf.,:;'!|()[] ")


def text_w(t: str, fs: float = LAB_FS) -> float:
    s = 0.0
    for c in t:
        if c in W_WIDE:
            s += 0.92
        elif c in W_NARROW:
            s += 0.34
        else:
            s += 0.56
    return s * fs


MIN_LABEL_GAP = LAB_FS + 8


# ---------------------------------------------------------------------------
# Entry-page grid geometry: the 2x2 image grid used to be a fixed 96mm-tall block
# (46.5mm rows), leaving whatever was left of the page below the description blank
# -- often ~30% of the page for a short description. Instead, size the grid from the
# *actual* space this specific entry's title + (optional inline section banner) +
# description will use, so grid + description together fill the page.
#
# Chromium's print pagination has no reflow-aware "flex-grow to fill remaining
# space" primitive that is safe to rely on here (see the module docstring's fr-row
# fragmentation bug), so the number still has to be a concrete mm value baked into
# the HTML -- it just isn't a single magic constant anymore. There's no live
# Chromium measurement pass either (that would make the generated HTML depend on
# font metrics/AA of whatever machine renders it, breaking the "pure function of
# viewer-data.json + this script" determinism the module docstring promises); instead
# this is a deliberately *conservative* (over-estimating) text-wrap estimate of the
# description block's height, built from the same character-width classification
# used for label text (text_w()), so the computed grid height errs a little small
# rather than risk the paragraph overflowing onto a second physical page.
DESC_FONT_PT = 9.6          # matches body font-size in CSS
DESC_LINE_H_MM = DESC_FONT_PT * 1.42 * 0.3527  # pt -> mm, matches CSS line-height
DESC_WIDTH_MM = 184.0       # full content width (210mm page - 2*13mm padding)
DESC_WIDTH_FUDGE = 0.88     # text_w()'s per-character-class widths were tuned against
                             # the label overlay's font (see LAB_FS), not IBM Plex
                             # Sans body text; measuring a real render against the
                             # estimate (helpful-microbes/saccharomyces-cerevisiae,
                             # which used to overflow) showed the real paragraph runs
                             # ~11% taller than the naive estimate. Treating the box as
                             # narrower than it really is inflates the line count (and
                             # so the estimated height) enough to cover that gap and
                             # then some, safely, without needing per-run measurement.
DESC_PLUSH_NARROWING_MM = 20.0  # allowance for the floated plush photo eating into
                                 # the desc's width; for a short paragraph the float
                                 # (~36mm tall incl. caption) can span *most* of it,
                                 # not just a line or two, so this is deliberately
                                 # generous rather than area-weighted
H1_HEIGHT_MM = 15.0         # entry <h1> (20pt) + its 4mm bottom margin, plus slop
BANNER_HEIGHT_MM = 44.0     # conservative estimate of the inline .section-banner's
                             # rendered height + margin-bottom
                             # (only present on the first entry of a short section)
GRID_MARGIN_BOTTOM_MM = 5.0  # .grid's margin-bottom
GRID_GAP_MM = 3.0            # .grid's gap
GRID_SAFETY_MM = 6.0         # slop for estimation error / borders / rounding
PAGE_CONTENT_H_MM = 267.0    # 297mm page - 2*15mm vertical padding
GRID_MIN_H_MM = 95.0   # floor: keeps the labelled-diagram cell legible even for the
                        # longest description in the data
# Ceiling, DERIVED not chosen: the three stacked images must span exactly the
# height of the big one beside them. The TEXTBOOK art is square, so it renders at
# min(wide_w, grid_h) and is centred in its (wide_w x grid_h) box. The moment
# grid_h passes wide_w the diagram stops growing while the left stack keeps going,
# so the big picture ends visibly short of the stack — at the old 155mm ceiling it
# was letterboxed by 23.7mm, i.e. ~12mm of blank above and below. Solving
# wide_w >= grid_h for the break-even point:
#     wide_w  = DESC_WIDTH_MM - GRID_GAP_MM - row_h,   row_h = (H - 2*GRID_GAP_MM)/3
#     =>  H   = (3*(DESC_WIDTH_MM - GRID_GAP_MM) + 2*GRID_GAP_MM) / 4
# At or below that height the diagram fills its cell exactly and the two columns
# align top and bottom. Kept as an expression so it stays correct if the page
# width or gap ever changes.
GRID_MAX_H_MM = (3 * (DESC_WIDTH_MM - GRID_GAP_MM) + 2 * GRID_GAP_MM) / 4  # 137.25mm


def estimate_text_lines(text: str, width_mm: float, fs_pt: float) -> int:
    """Greedy word-wrap line count estimate. Words are treated as atomic (no
    hyphenation credit, even though the real CSS has hyphens:auto), which biases
    the estimate toward *more* lines / a *taller* block than the real render --
    the safe direction, since this only feeds a MIN-height floor computation."""
    max_w = width_mm / 0.3527  # mm budget -> same "pt-ish" unit text_w() returns
    space_w = text_w(" ", fs_pt)
    lines = 1
    cur = 0.0
    for word in text.split():
        w = text_w(word, fs_pt)
        nxt = w if cur == 0 else cur + space_w + w
        if nxt > max_w and cur > 0:
            lines += 1
            cur = w
        else:
            cur = nxt
    return lines


def estimate_desc_height_mm(text: str, has_plush: bool) -> float:
    width = DESC_WIDTH_MM - (DESC_PLUSH_NARROWING_MM if has_plush else 0.0)
    width *= DESC_WIDTH_FUDGE
    lines = estimate_text_lines(text, width, DESC_FONT_PT)
    return lines * DESC_LINE_H_MM


def compute_grid_geometry(desc_text: str, has_plush: bool, has_banner: bool) -> dict:
    """Returns the inline-style mm values for one entry page's .grid: its overall
    height, the (per-row) height of the 3 stacked narrow cells (REAL/SEM/3D), and
    the two column widths. The narrow column's width is set equal to its row height
    so those three cells are square (their source finals are square); the TEXTBOOK
    cell then gets the rest of the width across the *full* grid height, which is a
    large, closer-to-square cell instead of a short, badly letterboxed strip."""
    used = H1_HEIGHT_MM + GRID_MARGIN_BOTTOM_MM + GRID_SAFETY_MM
    if has_banner:
        used += BANNER_HEIGHT_MM
    used += estimate_desc_height_mm(desc_text, has_plush)
    avail = PAGE_CONTENT_H_MM - used
    grid_h = max(GRID_MIN_H_MM, min(GRID_MAX_H_MM, avail))
    row_h = (grid_h - 2 * GRID_GAP_MM) / 3
    narrow_w = row_h
    wide_w = DESC_WIDTH_MM - GRID_GAP_MM - narrow_w
    return {"grid_h": grid_h, "row_h": row_h, "narrow_w": narrow_w, "wide_w": wide_w}


def segs_cross(a1, a2, b1, b2) -> bool:
    def d(p, q, r):
        return (r[0] - p[0]) * (q[1] - p[1]) - (r[1] - p[1]) * (q[0] - p[0])

    d1, d2, d3, d4 = d(b1, b2, a1), d(b1, b2, a2), d(a1, a2, b1), d(a1, a2, b2)
    return ((d1 > 0 and d2 < 0) or (d1 < 0 and d2 > 0)) and ((d3 > 0 and d4 < 0) or (d3 < 0 and d4 > 0))


def decross_ty(items: list[dict]) -> list[float]:
    ty = [it["ty"] for it in items]
    for side in ("left", "right"):
        idxs = [i for i, it in enumerate(items) if (side == "left") == (it["tx"] < it["ax"])]
        if len(idxs) < 2:
            continue
        idxs.sort(key=lambda i: items[i]["ay"])
        slots = sorted(items[i]["ty"] for i in idxs)
        for k in range(1, len(slots)):
            slots[k] = max(slots[k], slots[k - 1] + MIN_LABEL_GAP)
        order = list(idxs)

        def endpoint(i):
            it = items[i]
            raw = it.get("en") or it.get("key") or ""
            anchor = "start" if it["tx"] < it["ax"] else "end"
            half = text_w(raw) / 2
            kk = order.index(i)
            cx = round(it["tx"] + half if anchor == "start" else it["tx"] - half)
            cy = round(slots[kk] - LAB_FS * 0.33)
            return (cx, cy)

        changed, guard = True, 0
        while changed and guard < 40:
            changed = False
            guard += 1
            for k in range(len(order) - 1):
                i, j = order[k], order[k + 1]
                ai, bi = (items[i]["ax"], items[i]["ay"]), endpoint(i)
                aj, bj = (items[j]["ax"], items[j]["ay"]), endpoint(j)
                if segs_cross(ai, bi, aj, bj):
                    order[k], order[k + 1] = j, i
                    changed = True
        for k, i in enumerate(order):
            ty[i] = slots[k]
    return ty


LABEL_BOX_PAD = 16  # text_w()'s per-character-class widths are an approximation of
# the real (bold, print-rendered) glyph advances, tuned loosely rather than measured
# per font; at the bumped print LAB_FS that approximation error scales up too, and a
# box computed a few units too narrow is enough for two dense labels (e.g. a 16-item
# diagram like the neuron) to be judged "not overlapping" by a hair and never get
# pushed apart, while the real glyphs collide. Padding each box a little wider than
# the estimate turns near-misses into detected overlaps, trading a bit of extra
# vertical spread for guaranteed breathing room between labels.


def separate_boxes(items: list[dict], ty: list[float], lang: str) -> list[float]:
    ty = list(ty)

    def box(i):
        it = items[i]
        raw = it.get(lang) or it.get("en") or ""
        w = text_w(raw) + LABEL_BOX_PAD
        x0 = (it["tx"] if it["tx"] < it["ax"] else it["tx"] - w) - LABEL_BOX_PAD / 2
        return (x0, x0 + w, ty[i] - LAB_FS * 1.12, ty[i] + LAB_FS * 0.48)

    for _ in range(12):
        moved = False
        order = sorted(range(len(items)), key=lambda i: ty[i])
        for k in range(1, len(order)):
            for p in range(k):
                i, j = order[p], order[k]
                ax0, ax1, ay0, ay1 = box(i)
                bx0, bx1, by0, by1 = box(j)
                ox = min(ax1, bx1) - max(ax0, bx0)
                oy = min(ay1, by1) - max(ay0, by0)
                if ox > 2 and oy > 2:
                    ty[j] += oy + 2
                    moved = True
        if not moved:
            break
    return ty


def overlay_svg_markup(lab: dict, img_src: str, lang: str) -> str:
    """Build the labelled-textbook <svg> markup: the AVIF final plus one
    language's leader-line/halo-text layer, ported from overlaySvg() in
    viewer.template.html."""
    w, h = lab["w"], lab["h"]
    fill = lab.get("fill", "#fff")
    stroke = lab.get("stroke", "#000")
    items = lab["items"]
    base_tys = decross_ty(items)
    tys = separate_boxes(items, base_tys, lang)
    parts = [
        f'<svg xmlns="{SVGNS}" viewBox="0 0 {w} {h}" width="{w}" height="{h}" '
        f'preserveAspectRatio="xMidYMid meet">',
        f'<image href="{html.escape(img_src, quote=True)}" x="0" y="0" width="{w}" height="{h}"/>',
    ]
    for i, it in enumerate(items):
        raw = it.get(lang) or it.get("en") or ""
        txt = html.escape(raw)
        anchor = "start" if it["tx"] < it["ax"] else "end"
        half = text_w(raw) / 2
        cx = round(it["tx"] + half if anchor == "start" else it["tx"] - half)
        ty = tys[i]
        cy = round(ty - LAB_FS * 0.33)
        parts.append(
            f'<line x1="{it["ax"]}" y1="{it["ay"]}" x2="{cx}" y2="{cy}" '
            f'stroke="#f4f4f5" stroke-width="2" opacity="0.9"/>'
        )
        parts.append(
            f'<line x1="{it["ax"]}" y1="{it["ay"]}" x2="{cx}" y2="{cy}" '
            f'stroke="#111" stroke-width="0.7"/>'
        )
        parts.append(
            f'<text x="{it["tx"]}" y="{ty}" font-size="{LAB_FS}" font-weight="700" '
            f'text-anchor="{anchor}" fill="none" stroke="{stroke}" stroke-width="4" '
            f'stroke-linejoin="round">{txt}</text>'
        )
        parts.append(
            f'<text x="{it["tx"]}" y="{ty}" font-size="{LAB_FS}" font-weight="700" '
            f'text-anchor="{anchor}" fill="{fill}">{txt}</text>'
        )
    parts.append("</svg>")
    return "".join(parts)


# ---------------------------------------------------------------------------
# Coloring-page title injection, ported from injectColoringTitle() in
# viewer.template.html: the SVG's bottom band is left empty on purpose by
# coloring.py, and the title goes there. We also need to pick which of the
# SVG's existing #labels-en/#labels-de speech-bubble layers (from
# coloring.py's bubble_svg()) stays visible for this single-language PDF.
# ---------------------------------------------------------------------------
def build_coloring_page_svg(svg_path: Path, lang: str, kids_name: dict) -> str:
    tree = ET.parse(svg_path)
    root = tree.getroot()
    vb = root.get("viewBox")
    if vb:
        _, _, w, h = (float(x) for x in vb.split())
    else:
        w = float(root.get("width", 1080))
        h = float(root.get("height", w))

    for g in root.iter(f"{{{SVGNS}}}g"):
        gid = g.get("id")
        if gid in ("labels-en", "labels-de"):
            show = gid == f"labels-{lang}"
            g.set("style", "display:inline" if show else "display:none")

    txt = (kids_name.get(lang) or kids_name.get("en") or "").strip()
    cx = w / 2
    max_w = w - w * 0.11
    base_y = h - round(w * 0.083)
    fs = round(w * 0.067)
    while fs > 32 and text_w(txt, fs) > max_w:
        fs -= 2
    title_el = ET.SubElement(root, f"{{{SVGNS}}}text")
    title_el.set("class", "page-title")
    title_el.set("x", str(cx))
    title_el.set("y", str(base_y))
    title_el.set("text-anchor", "middle")
    title_el.set("font-size", str(fs))
    title_el.set("font-weight", "700")
    title_el.set("fill", "#000")
    title_el.set("font-family", '"Baloo 2","Comic Sans MS",system-ui,sans-serif')
    title_el.text = txt
    return ET.tostring(root, encoding="unicode")


# ---------------------------------------------------------------------------
# HTML assembly
# ---------------------------------------------------------------------------
UI = {
    "en": {
        "real": "Real photo", "sem": "Electron microscope", "3d": "3D model",
        "textbook": "Labelled diagram", "no_pic": "no picture yet",
        "plush": "GIANTmicrobe", "keychain": "GIANTmicrobe keychain",
    },
    "de": {
        "real": "Echtes Foto", "sem": "Elektronenmikroskop", "3d": "3D-Modell",
        "textbook": "Beschriftetes Bild", "no_pic": "noch kein Bild",
        "plush": "RIESENmikrobe", "keychain": "RIESENmikrobe Schlüsselanhänger",
    },
}

CSS = """
/* Margin is deliberately 0 here, NOT "margin: 15mm 13mm": Chromium's print
   pagination does not shrink the layout containing-block width by @page's margin
   (it only reserves blank space around the physical page when slicing content into
   pages) — percentage-based CSS below (the .grid columns) still resolves against
   the ORIGINAL (unmargined, viewport-derived) width, so content silently overflows
   off the right edge of the physical page instead of wrapping inside a margin.
   Instead every .page div gets an explicit absolute `width: 210mm` (immune to
   viewport ambiguity, since mm is not viewport-relative) and its own padding does
   the margin's job, so percentages resolve against the real 184mm content width. */
@page { size: A4; margin: 0; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  font-family: "IBM Plex Sans", "Segoe UI", system-ui, -apple-system, sans-serif;
  color: #1c2321; font-size: 9.6pt; line-height: 1.42;
}
.title-font { font-family: "Baloo 2", "Comic Sans MS", system-ui, sans-serif; }
.page {
  width: 210mm; break-after: page; page-break-after: always;
}
.page:last-child { break-after: auto; page-break-after: auto; }
.page:not(.coloring-page) { padding: 15mm 13mm; min-height: 297mm; }

/* ---- section pages ---- */
.section-page {
  border: 2.5mm solid #1f8a70; border-radius: 6mm; padding: 16mm; margin-top: 30mm;
}
.section-page h1 { font-size: 30pt; margin: 0 0 4mm; color: #146a56; }
.section-page .subtitle { font-size: 13pt; font-style: italic; color: #3a5148; margin: 0 0 8mm; }
.section-page p { font-size: 12pt; line-height: 1.55; margin: 0; }

/* ---- inline section banner (prepended to first entry of a short section) ---- */
.section-banner {
  background: #eaf6f1; border: 1mm solid #1f8a70; border-radius: 3mm;
  padding: 4mm 5mm; margin-bottom: 5mm;
}
.section-banner h2 { font-size: 15pt; margin: 0 0 1mm; color: #146a56; }
.section-banner .subtitle { font-size: 9.5pt; font-style: italic; color: #3a5148; margin: 0 0 2mm; }
.section-banner p { font-size: 8.6pt; margin: 0; line-height: 1.35; }

/* ---- entry page ---- */
.entry-page h1 { font-size: 20pt; margin: 0 0 4mm; color: #146a56; }
.grid {
  display: grid;
  /* Left column: REAL/SEM/3D stacked 3-high, square cells. Right column: TEXTBOOK
     alone, spanning the full grid height -- the labelled-diagram cell earns the
     wide column instead of sharing it with SEM, so it gets much more area (and a
     much less letterboxed aspect ratio for the square source art) than before.
     grid-template-columns/-rows/height are set inline per page (see
     compute_grid_geometry()) from that entry's actual title + banner + description
     length, so the grid together with the description fills the page instead of
     leaving a blank band. Explicit mm values, not "1fr 1fr": Chromium's
     print-to-pdf layout pass computed `fr` track sizing correctly when measured
     interactively (getBoundingClientRect matched the intended height) but produced
     corrupted, overlapping row heights for some entries in the actual printed PDF
     raster — an intrinsic-content-size-vs-fr sizing bug specific to the print
     fragmentation pass. Fixed mm heights sidestep it entirely; only the number
     substituted in is no longer a single fixed magic constant. break-inside:avoid
     keeps the whole grid from ever being split across a page boundary (the other
     scenario that can corrupt a fragmented CSS Grid in print). */
  grid-template-areas: "real text" "sem text" "threed text";
  gap: 3mm;
  margin-bottom: 5mm;
  break-inside: avoid;
}
.cell.cell-real     { grid-area: real; }
.cell.cell-sem      { grid-area: sem; }
.cell.cell-3d       { grid-area: threed; }
.cell.cell-textbook { grid-area: text; }
/* No frame, no tinted panel: the pictures sit directly on the page and each one
   carries its own corner label instead. Boxing them made four bordered panels
   compete with the artwork, and the caption band ate vertical space the image
   could use. */
.cell {
  overflow: hidden; display: flex; flex-direction: column;
  min-width: 0; min-height: 0;  /* grid items default to min-width:auto, which
    would let a large intrinsic image/SVG size push the cell past its track and
    off the page instead of shrinking to fit it */
  break-inside: avoid;
}
.cell .imgwrap {
  flex: 1 1 auto; min-width: 0; min-height: 0; display: flex;
  align-items: center; justify-content: center; overflow: hidden;
}
/* Shrink-wraps the picture so the label can anchor to the IMAGE's own corner
   rather than the grid cell's — a square render inside a tall cell would
   otherwise leave the label stranded in blank space below it. */
.cell .imgfit {
  position: relative; display: inline-flex;
  max-width: 100%; max-height: 100%; min-width: 0; min-height: 0;
}
.cell .imgfit img, .cell .imgfit svg {
  display: block; max-width: 100%; max-height: 100%; width: auto; height: auto;
  object-fit: contain;
}
/* Bottom-RIGHT by request, and it is also the safe corner: the caption used to
   be a top band because several labelled diagrams anchor a leader at the very
   top edge (Giardia's "Trophozoit"), which an overlay there clipped. Watch this
   corner for the same collision on diagrams whose labels reach it. */
.cell .cap {
  position: absolute; right: 0; bottom: 0;
  font-size: 6.4pt; letter-spacing: .02em; text-transform: uppercase;
  color: #000; background: #fff;
  padding: 0.9mm 1.8mm;
  border-top-left-radius: 1.2mm;
}
.cell .ph { font-size: 8pt; color: #8a9a94; text-align: center; padding: 2mm; }
.desc p { margin: 0; text-align: justify; hyphens: auto; }
.plush {
  float: right; width: 32mm; margin: 0 0 3mm 4mm; text-align: center;
}
/* No frame: the plush sits on the page like the grid images do. The caption is
   the vendor's brand rather than a joke about the toy — it says what the picture
   is, which is the same job the corner labels do on the grid. */
.plush img { width: 100%; height: auto; }
.plush .cap { font-size: 6.6pt; color: #4b5f58; margin-top: 1mm;
  letter-spacing: .03em; text-transform: uppercase; }

/* ---- coloring page (full-bleed, no padding/margin) ---- */
.coloring-page { width: 210mm; height: 297mm; }
.coloring-page svg { width: 100%; height: 100%; display: block; }
"""


def esc(s: str) -> str:
    return html.escape(s or "", quote=False)


def grid_cell(kind: str, cap: str, img_rel: str | None, lab: dict | None, lang: str, no_pic: str) -> str:
    if kind == "textbook" and img_rel and lab:
        inner = overlay_svg_markup(lab, img_rel, lang)
    elif img_rel:
        inner = f'<img src="{html.escape(img_rel, quote=True)}" loading="eager">'
    else:
        inner = f'<div class="ph">{esc(no_pic)}</div>'
    # The label lives inside .imgfit so it anchors to the picture's own corner.
    # A missing picture gets no label — there is nothing to caption.
    if img_rel:
        body = f'<div class="imgfit">{inner}<span class="cap">{esc(cap)}</span></div>'
    else:
        body = inner
    return f'<div class="cell cell-{kind}"><div class="imgwrap">{body}</div></div>'


def render_entry_page(set_: dict, m: dict, lang: str, banner_html: str, missing: list[str]) -> str:
    u = UI[lang]
    name = (m.get("nameKids") or m["name"]).get(lang) or (m.get("nameKids") or m["name"]).get("en", "")
    img = m.get("img", {})
    lab = m.get("lab", {})
    key = m["key"]

    for style in ("reference", "sem", "3d", "textbook"):
        if style not in img:
            missing.append(f"{key} ({set_['id']}): missing {style} image")
    if "textbook" in img and "textbook" not in lab:
        missing.append(f"{key} ({set_['id']}): has textbook image but no label geometry")

    cells = (
        grid_cell("real", u["real"], shrink_image(img.get("reference"), IMG_W_NARROW), None, lang, u["no_pic"])
        + grid_cell("sem", u["sem"], shrink_image(img.get("sem"), IMG_W_NARROW), None, lang, u["no_pic"])
        + grid_cell("3d", u["3d"], shrink_image(img.get("3d"), IMG_W_NARROW), None, lang, u["no_pic"])
        + grid_cell("textbook", u["textbook"], shrink_image(img.get("textbook"), IMG_W_TEXTBOOK),
                    lab.get("textbook"), lang, u["no_pic"])
    )

    plush = ""
    giant = m.get("giant")
    has_plush = bool(giant and giant.get("img"))
    if has_plush:
        plush_src = shrink_image(giant["img"], IMG_W_PLUSH)
        plush_cap = u["keychain"] if giant.get("keychain") else u["plush"]
        plush = (
            f'<div class="plush"><img src="{html.escape(plush_src, quote=True)}">'
            f'<div class="cap">{esc(plush_cap)}</div></div>'
        )
    else:
        missing.append(f"{key} ({set_['id']}): no giant-plush photo")

    desc = m.get("desc", {}).get("kids", {}).get(lang) or m.get("desc", {}).get("kids", {}).get("en", "")

    geo = compute_grid_geometry(desc, has_plush, has_banner=bool(banner_html))
    grid_style = (
        f'grid-template-columns:{geo["narrow_w"]:.1f}mm {geo["wide_w"]:.1f}mm;'
        f'grid-template-rows:repeat(3,{geo["row_h"]:.1f}mm);'
        f'height:{geo["grid_h"]:.1f}mm;'
    )

    return (
        f'<div class="page entry-page">{banner_html}'
        f'<h1 class="title-font">{esc(name)}</h1>'
        f'<div class="grid" style="{grid_style}">{cells}</div>'
        f'<div class="desc">{plush}<p>{esc(desc)}</p></div>'
        f'</div>'
    )


def render_coloring_page(set_: dict, m: dict, lang: str, missing: list[str]) -> str | None:
    rel = m.get("coloring")
    if not rel:
        missing.append(f"{m['key']} ({set_['id']}): no coloring page")
        return None
    svg_path = ROOT / rel
    if not svg_path.is_file():
        missing.append(f"{m['key']} ({set_['id']}): coloring page listed but file missing on disk")
        return None
    kids_name = m.get("nameKids") or m["name"]
    svg_markup = build_coloring_page_svg(svg_path, lang, kids_name)
    return f'<div class="page coloring-page">{svg_markup}</div>'


def render_section_page(set_: dict, lang: str) -> str:
    title = set_["title"].get(lang, "")
    subtitle = set_["subtitle"].get(lang, "")
    intro = set_["desc"]["kids"].get(lang, "")
    return (
        f'<div class="page"><div class="section-page">'
        f'<h1 class="title-font">{esc(title)}</h1>'
        f'<p class="subtitle">{esc(subtitle)}</p>'
        f'<p>{esc(intro)}</p>'
        f'</div></div>'
    )


def render_section_banner(set_: dict, lang: str) -> str:
    title = set_["title"].get(lang, "")
    subtitle = set_["subtitle"].get(lang, "")
    intro = set_["desc"]["kids"].get(lang, "")
    return (
        f'<div class="section-banner">'
        f'<h2 class="title-font">{esc(title)}</h2>'
        f'<p class="subtitle">{esc(subtitle)}</p>'
        f'<p>{esc(intro)}</p>'
        f'</div>'
    )


def section_needs_own_page(set_: dict, lang: str) -> bool:
    subtitle = set_["subtitle"].get(lang, "")
    intro = set_["desc"]["kids"].get(lang, "")
    return len(subtitle) + len(intro) > SECTION_PAGE_THRESHOLD_CHARS


def build_book(sets: list[dict], lang: str) -> tuple[str, int, list[str], list[str]]:
    """Returns (html, expected_page_count, subjects_included, missing_report)."""
    pages: list[str] = []
    missing: list[str] = []
    subjects: list[str] = []
    expected = 0

    for set_ in sets:
        if set_.get("kind") == "chapter":
            # A prose-only chapter (cell-basics, cell-types, muscle-tissue, ...):
            # empty `microbes`, no coloring pages, no entry grids -- just its own
            # title/subtitle/kids-prose page, in data order alongside the sets.
            pages.append(render_section_page(set_, lang))
            expected += 1
            continue
        microbes = set_["microbes"]
        if not microbes:
            # A "set" kind with no microbes yet (e.g. a set still being populated
            # by other tooling) contributes nothing -- never hard-code a subject
            # or page count, just skip sets that currently have none.
            continue
        own_page = section_needs_own_page(set_, lang)
        if own_page:
            pages.append(render_section_page(set_, lang))
            expected += 1
        for i, m in enumerate(microbes):
            banner = render_section_banner(set_, lang) if (i == 0 and not own_page) else ""
            pages.append(render_entry_page(set_, m, lang, banner, missing))
            expected += 1
            subjects.append(f"{set_['id']}/{m['key']}")
            colpage = render_coloring_page(set_, m, lang, missing)
            if colpage:
                pages.append(colpage)
                expected += 1

    body = "\n".join(pages)
    doc = (
        "<!doctype html>\n"
        f'<html lang="{lang}"><head><meta charset="utf-8">'
        f'<base href="file://{ROOT}/">'
        f"<title>Microbes picture book ({lang})</title>"
        f"<style>{CSS}</style></head><body>{body}</body></html>"
    )
    return doc, expected, subjects, missing


# ---------------------------------------------------------------------------
def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--lang", choices=["en", "de"], default="en")
    ap.add_argument("--out", default=None, help="output PDF path (default microbes-book-<lang>.pdf)")
    ap.add_argument("--sets", default=None, help="comma-separated set ids to include (default: all)")
    ap.add_argument("--limit", type=int, default=None, help="cap total microbes included, for a fast smoke test")
    ap.add_argument("--html-only", action="store_true", help="write the intermediate HTML instead of a PDF")
    args = ap.parse_args()

    out_path = Path(args.out) if args.out else ROOT / f"microbes-book-{args.lang}.pdf"

    data = json.loads(DATA_PATH.read_text())
    sets = data["sets"]

    if args.sets:
        wanted = set(args.sets.split(","))
        known = {s["id"] for s in sets}
        unknown = wanted - known
        if unknown:
            sys.exit(f"unknown --sets id(s): {', '.join(sorted(unknown))}")
        sets = [s for s in sets if s["id"] in wanted]

    if args.limit is not None:
        remaining = args.limit
        limited = []
        for s in sets:
            s2 = dict(s)
            s2["microbes"] = s["microbes"][:max(remaining, 0)]
            remaining -= len(s2["microbes"])
            limited.append(s2)
        sets = limited

    doc, expected_pages, subjects, missing = build_book(sets, args.lang)

    if args.html_only:
        html_out = out_path if out_path.suffix == ".html" else out_path.with_suffix(".html")
        html_out.write_text(doc)
        print(f"wrote {html_out} (html-only, {expected_pages} expected pages, "
              f"{len(subjects)} subjects, {len(missing)} missing-asset notes)")
        return 0

    TMP_DIR.mkdir(exist_ok=True)
    tmp_html = TMP_DIR / f"book-{args.lang}.html"
    tmp_html.write_text(doc)

    from playwright.sync_api import sync_playwright  # deferred: not needed for --html-only

    with sync_playwright() as p:
        browser = p.chromium.launch()
        # Chromium paginates for print WITHOUT reflowing: percentage-based CSS (the
        # grid columns, in particular) resolves against whatever the layout viewport
        # was at goto()-time, and print only crops that layout down to the @page box
        # rather than re-laying it out narrower. Leaving the default (much wider)
        # viewport in place made every percentage-wide box compute too wide and get
        # clipped at the physical page edge instead of wrapping inside the margins.
        # Matching the viewport to A4's CSS-pixel size (96 CSS px/in: 210mm=793.7px,
        # 297mm=1122.5px) makes the pre-print layout match the eventual page size.
        page = browser.new_page(viewport={"width": 794, "height": 1123})
        page.goto(f"file://{tmp_html}")
        page.wait_for_load_state("networkidle")
        page.emulate_media(media="print")
        page.pdf(path=str(out_path), format="A4", print_background=True, prefer_css_page_size=True)
        browser.close()

    size_kb = out_path.stat().st_size / 1024
    actual_pages = pdf_page_count(out_path)
    note = "" if actual_pages == expected_pages else (
        f"  ** WARNING: expected {expected_pages} pages, PDF has {actual_pages} "
        f"-> some entry likely overflowed onto an extra page **"
    )
    print(f"wrote {out_path}: {actual_pages} pages ({size_kb:.0f} KB), "
          f"{len(subjects)} subjects, lang={args.lang}{note}")
    if missing:
        print(f"{len(missing)} missing-asset notes:")
        for line in missing:
            print(f"  - {line}")
    return 0


def pdf_page_count(path: Path) -> int:
    try:
        out = subprocess.run(["pdfinfo", str(path)], capture_output=True, text=True, check=True).stdout
        m = re.search(r"^Pages:\s+(\d+)", out, re.MULTILINE)
        if m:
            return int(m.group(1))
    except Exception:
        pass
    return -1


if __name__ == "__main__":
    raise SystemExit(main())
