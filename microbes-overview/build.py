"""Build HTML and PDF posters from cells_data.PAGES.

Usage:
    python3 build.py            # all four tiers × two languages → 8 HTML + 8 PDF
    python3 build.py --mode all # use 2x2 image grid (renders microscope-SVG too)

Per-tier outputs use the cumulative inclusion rule: each entry has a `tier`
field with one of {"basic", "ext30", "ext100", "complete"}. A build at tier
N includes entries whose tier is N or lower (in the order basic < ext30 <
ext100 < complete). Pages with no surviving entries are dropped.

Image layout:
- Each entry can declare `image_filename` (relative to `images/`),
  `image_url`, `image_credit`, `image_license`.
- Mode "auto" (default): if a real microscope photo is present, render
  3×1 = [real, infographic, kids]; otherwise render 3×1 = [microscope-svg,
  infographic, kids].
- Mode "all": render 2×2 = [real (or placeholder), microscope-svg,
  infographic, kids] — keeps the microscope-style SVG alongside the photo.

CSS classes for filtering / theming:
- On each `.cell`: `tier-{basic|ext30|ext100|complete}`, `kind-{page_id}`.
- On each `.image-cell`: `img-microscope-real`, `img-microscope-svg`,
  `img-infographic`, or `img-kids`.
- On the `.images` container: `images-3` or `images-4` for layout.
"""
from __future__ import annotations
import argparse
import html
import os
from pathlib import Path

from cells_data import PAGES


HERE = Path(__file__).parent
IMAGES_DIR = HERE / "images"

TIER_ORDER = ["basic", "ext30", "ext100", "complete"]
TIER_RANK = {t: i for i, t in enumerate(TIER_ORDER)}
DEFAULT_TIER = "ext30"


CSS = """
@page {
  size: A4 landscape;
  margin: 8mm;
}
* { box-sizing: border-box; }
html, body {
  margin: 0; padding: 0;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  color: #1a1a1a;
  background: #fafafa;
}
.page {
  width: 281mm;
  height: 194mm;
  page-break-after: always;
  display: flex;
  flex-direction: column;
  padding: 4mm 6mm 6mm;
  background: #fff;
}
.page:last-child { page-break-after: auto; }
.page-header {
  border-bottom: 2px solid #1d3557;
  padding-bottom: 2mm;
  margin-bottom: 3mm;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}
.page-title { font-size: 14pt; font-weight: 700; color: #1d3557; margin: 0; }
.page-subtitle { font-size: 9pt; color: #555; margin-left: 8mm; flex: 1; }
.page-number { font-size: 8pt; color: #888; }
.page-description {
  font-size: 8pt;
  color: #333;
  margin: 0 0 2.5mm;
  line-height: 1.35;
  font-style: italic;
  border-left: 2px solid #a8c5d6;
  padding: 0 0 0 2.5mm;
}
.grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 3mm;
}
.cell {
  border: 1px solid #ccc;
  border-radius: 2mm;
  padding: 2mm 2.5mm;
  display: flex;
  flex-direction: column;
  background: #fefefe;
  break-inside: avoid;
}
.cell-name {
  font-size: 10.5pt;
  font-weight: 700;
  color: #1d3557;
  margin: 0 0 1.5mm;
  line-height: 1.15;
}
.images {
  margin-bottom: 1.5mm;
}
.images svg { width: 100%; height: auto; display: block; }
.images img { width: 100%; height: auto; display: block; object-fit: cover; }
.images.images-3 {
  display: flex;
  gap: 1.5mm;
}
.images.images-3 .image-cell { flex: 1; }
.images.images-4 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 1.5mm;
}
.image-cell { text-align: center; }
.image-label {
  font-size: 6pt;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 0.5mm;
}
.image-placeholder {
  width: 100%;
  aspect-ratio: 1 / 1;
  background: repeating-linear-gradient(
    45deg,
    #f3f3f3,
    #f3f3f3 3px,
    #e8e8e8 3px,
    #e8e8e8 6px
  );
  border: 1px dashed #bbb;
  border-radius: 1mm;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
  font-size: 6pt;
  text-align: center;
  padding: 1mm;
}
.text-block { font-size: 8pt; line-height: 1.3; color: #222; }
.text-block p { margin: 0 0 1mm; }
.text-block .label {
  font-weight: 700; color: #1d3557; font-size: 7.5pt;
  text-transform: uppercase; letter-spacing: 0.3px;
}
.cover {
  height: 194mm;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 20mm;
}
.cover h1 { font-size: 28pt; color: #1d3557; margin: 0 0 4mm; }
.cover .subtitle { font-size: 14pt; color: #555; margin-bottom: 12mm; }
.cover .toc {
  text-align: left;
  font-size: 11pt;
  column-count: 2;
  column-gap: 14mm;
  width: 200mm;
}
.cover .toc li { margin-bottom: 2mm; }
.cover .note {
  margin-top: 14mm; font-size: 8pt; color: #888; max-width: 200mm;
}
.cover .variant {
  margin-top: 6mm; font-size: 10pt; color: #1d3557; font-weight: 600;
}
.credits-page { padding: 8mm 12mm; }
.credits-page h2 {
  font-size: 16pt; color: #1d3557; margin: 0 0 4mm;
  border-bottom: 2px solid #1d3557; padding-bottom: 2mm;
}
.credits-list {
  font-size: 7.5pt; line-height: 1.4; color: #333;
  column-count: 2; column-gap: 8mm;
}
.credits-list .credit { break-inside: avoid; margin-bottom: 1.5mm; }
.credits-list .credit-name { font-weight: 700; color: #1d3557; }
.credits-list .credit-license { color: #666; font-style: italic; }
.credits-list .credit-url { color: #4a6fa5; word-break: break-all; }
@media screen {
  body { padding: 20px 0; }
  .page { margin: 0 auto 20px; box-shadow: 0 4px 18px rgba(0,0,0,0.12); }
}
"""


LABELS = {
    "de": {
        "title": "Mikroben & Zellen — Überblick",
        "subtitle": "Immunzellen, Pathogene und Körperzellen im Vergleich",
        "function": "Aufgabe",
        "deps": "Abhängigkeiten / Ziele",
        "img_real": "Mikroskop-Aufnahme",
        "img_micro": "Mikroskop-Stil",
        "img_flat": "Infografik-Stil",
        "img_cute": "Kinder-Stil",
        "img_missing": "Bild fehlt",
        "page": "Seite",
        "cover_note": (
            "Wo eine echte Mikroskop-Aufnahme verfügbar ist, wird sie gezeigt; "
            "sonst eine stilisierte Mikroskop-Skizze. Der „Kurzgesagt-Stil“ und "
            "der „Kinder-Stil“ sind handgezeichnete SVGs."
        ),
        "toc_title": "Inhalt",
        "credits_title": "Bildquellen",
        "credits_intro": (
            "Alle echten Mikroskop-Aufnahmen stammen aus offenen Quellen "
            "(Wikimedia Commons, CDC PHIL, NIAID u.a.) unter freier Lizenz."
        ),
        "variant_basic": "Variante: Grundlagen (~30 Einträge)",
        "variant_ext30": "Variante: Standard (~60–70 Einträge)",
        "variant_ext100": "Variante: Erweitert (~100 Einträge)",
        "variant_complete": "Variante: Vollständig",
    },
    "en": {
        "title": "Microbes & cells — overview",
        "subtitle": "Immune cells, pathogens and body cells side by side",
        "function": "Function",
        "deps": "Depends on / Targets",
        "img_real": "Microscope photo",
        "img_micro": "Microscope style",
        "img_flat": "Infographic style",
        "img_cute": "Kids style",
        "img_missing": "Image missing",
        "page": "Page",
        "cover_note": (
            "Where a real microscope photograph is available, it is shown; "
            "otherwise a stylised microscope-style sketch. The infographic "
            "and kids styles are hand-drawn SVGs."
        ),
        "toc_title": "Contents",
        "credits_title": "Image credits",
        "credits_intro": (
            "All real microscope images come from open sources (Wikimedia "
            "Commons, CDC PHIL, NIAID and similar) under free licences."
        ),
        "variant_basic": "Variant: basics (~30 entries)",
        "variant_ext30": "Variant: standard (~60–70 entries)",
        "variant_ext100": "Variant: extended (~100 entries)",
        "variant_complete": "Variant: complete",
    },
}


TIER_LABEL_KEY = {
    "basic": "variant_basic",
    "ext30": "variant_ext30",
    "ext100": "variant_ext100",
    "complete": "variant_complete",
}


def entry_tier(entry: dict) -> str:
    return entry.get("tier", DEFAULT_TIER)


def entry_in_tier(entry: dict, active: str) -> bool:
    return TIER_RANK[entry_tier(entry)] <= TIER_RANK[active]


def filter_pages(active_tier: str) -> list[dict]:
    out = []
    for page in PAGES:
        kept = [e for e in page["entries"] if entry_in_tier(e, active_tier)]
        if not kept:
            continue
        out.append({**page, "entries": kept})
    return out


def image_path_for(entry: dict) -> Path | None:
    fname = entry.get("image_filename")
    if not fname:
        return None
    return IMAGES_DIR / fname


def has_real_image(entry: dict) -> bool:
    p = image_path_for(entry)
    return bool(p and p.exists())


def render_real_image_cell(entry: dict, labels: dict) -> str:
    p = image_path_for(entry)
    if p and p.exists():
        rel = f"images/{p.name}"
        return (
            f'<div class="image-cell img-microscope-real">'
            f'<img src="{html.escape(rel)}" alt=""/>'
            f'<div class="image-label">{labels["img_real"]}</div>'
            f"</div>"
        )
    return (
        f'<div class="image-cell img-microscope-real img-missing">'
        f'<div class="image-placeholder">{labels["img_missing"]}</div>'
        f'<div class="image-label">{labels["img_real"]}</div>'
        f"</div>"
    )


def render_cell(entry: dict, kind: str, lang: str, labels: dict, mode: str) -> str:
    micro, flat, cute = entry["shape"](entry["palette"])
    name = entry[f"name_{lang}"]
    func = entry[f"func_{lang}"]
    deps = entry[f"deps_{lang}"]
    tier = entry_tier(entry)

    micro_svg_cell = (
        f'<div class="image-cell img-microscope-svg">{micro}'
        f'<div class="image-label">{labels["img_micro"]}</div></div>'
    )
    flat_cell = (
        f'<div class="image-cell img-infographic">{flat}'
        f'<div class="image-label">{labels["img_flat"]}</div></div>'
    )
    cute_cell = (
        f'<div class="image-cell img-kids">{cute}'
        f'<div class="image-label">{labels["img_cute"]}</div></div>'
    )
    real_cell = render_real_image_cell(entry, labels)
    has_real = has_real_image(entry)

    if mode == "all":
        images_cells = [real_cell, micro_svg_cell, flat_cell, cute_cell]
        images_layout = "images-4"
    elif has_real:
        images_cells = [real_cell, flat_cell, cute_cell]
        images_layout = "images-3"
    else:
        images_cells = [micro_svg_cell, flat_cell, cute_cell]
        images_layout = "images-3"

    images_html = "\n        ".join(images_cells)
    classes = f"cell tier-{tier} kind-{kind}"
    return f"""
    <div class="{classes}">
      <h3 class="cell-name">{html.escape(name)}</h3>
      <div class="images {images_layout}">
        {images_html}
      </div>
      <div class="text-block">
        <p><span class="label">{labels["function"]}:</span> {html.escape(func)}</p>
        <p><span class="label">{labels["deps"]}:</span> {html.escape(deps)}</p>
      </div>
    </div>"""


def render_page(page: dict, idx: int, total: int, lang: str, labels: dict, mode: str) -> str:
    title = page[f"title_{lang}"]
    subtitle = page.get(f"subtitle_{lang}", "")
    description = page.get(f"description_{lang}", "")
    kind = page["id"]
    desc_html = (
        f'<p class="page-description">{html.escape(description)}</p>'
        if description else ""
    )
    cells = "\n".join(
        render_cell(e, kind, lang, labels, mode) for e in page["entries"]
    )
    return f"""
    <section class="page kind-{kind}">
      <header class="page-header">
        <h2 class="page-title">{html.escape(title)}</h2>
        <span class="page-subtitle">{html.escape(subtitle)}</span>
        <span class="page-number">{labels["page"]} {idx} / {total}</span>
      </header>
      {desc_html}
      <div class="grid">
        {cells}
      </div>
    </section>"""


def render_cover(pages: list[dict], lang: str, labels: dict, tier: str) -> str:
    toc_items = "".join(
        f"<li>{i + 1}. {html.escape(p[f'title_{lang}'])}</li>"
        for i, p in enumerate(pages)
    )
    variant_label = labels[TIER_LABEL_KEY[tier]]
    return f"""
    <section class="page">
      <div class="cover">
        <h1>{html.escape(labels["title"])}</h1>
        <p class="subtitle">{html.escape(labels["subtitle"])}</p>
        <p class="variant">{html.escape(variant_label)}</p>
        <div class="toc">
          <strong>{labels["toc_title"]}</strong>
          <ol>{toc_items}</ol>
        </div>
        <p class="note">{html.escape(labels["cover_note"])}</p>
      </div>
    </section>"""


def collect_credits(pages: list[dict], lang: str) -> list[dict]:
    out = []
    seen = set()
    for page in pages:
        for entry in page["entries"]:
            fname = entry.get("image_filename")
            if not fname or fname in seen:
                continue
            seen.add(fname)
            out.append({
                "name": entry[f"name_{lang}"],
                "filename": fname,
                "url": entry.get("image_url", ""),
                "credit": entry.get("image_credit", ""),
                "license": entry.get("image_license", ""),
                "present": (IMAGES_DIR / fname).exists(),
            })
    return out


def render_credits_page(pages: list[dict], lang: str, labels: dict) -> str:
    credits = collect_credits(pages, lang)
    if not credits:
        return ""
    items = []
    for c in credits:
        url_html = (
            f'<span class="credit-url">{html.escape(c["url"])}</span>'
            if c["url"] else ""
        )
        license_html = (
            f'<span class="credit-license">{html.escape(c["license"])}</span>'
            if c["license"] else ""
        )
        credit_html = html.escape(c["credit"]) if c["credit"] else ""
        items.append(
            f'<div class="credit">'
            f'<span class="credit-name">{html.escape(c["name"])}</span> — '
            f'{credit_html} {license_html} {url_html}'
            f"</div>"
        )
    return f"""
    <section class="page credits-page">
      <h2>{html.escape(labels["credits_title"])}</h2>
      <p style="font-size:8pt;color:#555;margin:0 0 3mm;">{html.escape(labels["credits_intro"])}</p>
      <div class="credits-list">
        {"".join(items)}
      </div>
    </section>"""


def render_doc(lang: str, tier: str, mode: str) -> str:
    labels = LABELS[lang]
    pages = filter_pages(tier)
    credits_html = render_credits_page(pages, lang, labels)
    total = len(pages) + 1 + (1 if credits_html else 0)
    cover = render_cover(pages, lang, labels, tier)
    pages_html = "\n".join(
        render_page(p, i + 2, total, lang, labels, mode)
        for i, p in enumerate(pages)
    )
    return f"""<!doctype html>
<html lang="{lang}" data-tier="{tier}" data-mode="{mode}">
<head>
  <meta charset="utf-8"/>
  <title>{html.escape(labels["title"])} — {html.escape(labels[TIER_LABEL_KEY[tier]])}</title>
  <style>{CSS}</style>
</head>
<body class="tier-{tier} mode-{mode}">
  {cover}
  {pages_html}
  {credits_html}
</body>
</html>"""


def output_basename(lang: str, tier: str) -> str:
    # The "ext30" tier maps to the legacy `microbes_<lang>` filename so
    # existing links (and the default index.md targets) keep working.
    if tier == "ext30":
        return f"microbes_{lang}"
    return f"microbes_{tier}_{lang}"


def populated_tiers() -> list[str]:
    """Tiers that actually have entries explicitly tagged. The default tier
    is always included so the legacy output is always produced."""
    tagged = {e.get("tier", DEFAULT_TIER) for p in PAGES for e in p["entries"]}
    tagged.add(DEFAULT_TIER)
    return [t for t in TIER_ORDER if t in tagged]


def build(mode: str = "auto", tiers: list[str] | None = None, write_pdf: bool = True):
    tiers = tiers or populated_tiers()
    for tier in tiers:
        pages = filter_pages(tier)
        if not pages:
            print(f"skipping tier {tier} (no entries)")
            continue
        for lang in ("de", "en"):
            html_doc = render_doc(lang, tier, mode)
            base = output_basename(lang, tier)
            html_path = HERE / f"{base}.html"
            html_path.write_text(html_doc, encoding="utf-8")
            print(f"wrote {html_path}")

            if not write_pdf:
                continue
            try:
                from weasyprint import HTML
                pdf_path = HERE / f"{base}.pdf"
                HTML(string=html_doc, base_url=str(HERE)).write_pdf(str(pdf_path))
                print(f"wrote {pdf_path}")
            except Exception as exc:
                print(f"PDF generation failed for {tier}/{lang}: {exc}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--mode", choices=["auto", "all"], default="auto",
                    help="auto: 3x1 (real or micro-svg + info + kids); all: 2x2 with all four.")
    ap.add_argument("--tier", choices=TIER_ORDER, action="append",
                    help="Restrict to specific tier(s); may be repeated. Default: all four.")
    ap.add_argument("--no-pdf", action="store_true", help="Skip PDF rendering.")
    args = ap.parse_args()
    build(mode=args.mode, tiers=args.tier, write_pdf=not args.no_pdf)


if __name__ == "__main__":
    main()
