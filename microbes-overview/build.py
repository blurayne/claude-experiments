"""Build HTML and PDF posters from cells_data.PAGES.

Usage:
    python3 build.py        # generates microbes_de.html, microbes_en.html, *.pdf
"""
from __future__ import annotations
import html
from pathlib import Path

from cells_data import PAGES


HERE = Path(__file__).parent


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
  display: flex;
  gap: 1.5mm;
  margin-bottom: 1.5mm;
}
.images svg { width: 100%; height: auto; display: block; }
.image-cell {
  flex: 1;
  text-align: center;
}
.image-label {
  font-size: 6pt;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 0.5mm;
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
        "img_micro": "Mikroskop-Stil",
        "img_flat": "Infografik-Stil",
        "img_cute": "Kinder-Stil",
        "page": "Seite",
        "cover_note": (
            "Die Mikroskop-Bilder sind keine echten Aufnahmen, sondern stilisierte "
            "Skizzen, die typische Form und Färbung andeuten. Der „Kurzgesagt-Stil“ "
            "und der „Kinder-Stil“ sind ebenfalls handgezeichnete SVGs."
        ),
        "toc_title": "Inhalt",
    },
    "en": {
        "title": "Microbes & cells — overview",
        "subtitle": "Immune cells, pathogens and body cells side by side",
        "function": "Function",
        "deps": "Depends on / Targets",
        "img_micro": "Microscope style",
        "img_flat": "Infographic style",
        "img_cute": "Kids style",
        "page": "Page",
        "cover_note": (
            "The microscope-style images are not real photographs — they are "
            "stylised drawings that hint at typical shape and staining. The "
            "infographic and kids styles are likewise hand-drawn SVGs."
        ),
        "toc_title": "Contents",
    },
}


def render_cell(entry: dict, lang: str, labels: dict) -> str:
    micro, flat, cute = entry["shape"](entry["palette"])
    name = entry[f"name_{lang}"]
    func = entry[f"func_{lang}"]
    deps = entry[f"deps_{lang}"]
    return f"""
    <div class="cell">
      <h3 class="cell-name">{html.escape(name)}</h3>
      <div class="images">
        <div class="image-cell">{micro}<div class="image-label">{labels["img_micro"]}</div></div>
        <div class="image-cell">{flat}<div class="image-label">{labels["img_flat"]}</div></div>
        <div class="image-cell">{cute}<div class="image-label">{labels["img_cute"]}</div></div>
      </div>
      <div class="text-block">
        <p><span class="label">{labels["function"]}:</span> {html.escape(func)}</p>
        <p><span class="label">{labels["deps"]}:</span> {html.escape(deps)}</p>
      </div>
    </div>"""


def render_page(page: dict, idx: int, total: int, lang: str, labels: dict) -> str:
    title = page[f"title_{lang}"]
    subtitle = page.get(f"subtitle_{lang}", "")
    cells = "\n".join(render_cell(e, lang, labels) for e in page["entries"])
    return f"""
    <section class="page">
      <header class="page-header">
        <h2 class="page-title">{html.escape(title)}</h2>
        <span class="page-subtitle">{html.escape(subtitle)}</span>
        <span class="page-number">{labels["page"]} {idx} / {total}</span>
      </header>
      <div class="grid">
        {cells}
      </div>
    </section>"""


def render_cover(lang: str, labels: dict) -> str:
    toc_items = "".join(
        f"<li>{i + 1}. {html.escape(p[f'title_{lang}'])}</li>"
        for i, p in enumerate(PAGES)
    )
    return f"""
    <section class="page">
      <div class="cover">
        <h1>{html.escape(labels["title"])}</h1>
        <p class="subtitle">{html.escape(labels["subtitle"])}</p>
        <div class="toc">
          <strong>{labels["toc_title"]}</strong>
          <ol>{toc_items}</ol>
        </div>
        <p class="note">{html.escape(labels["cover_note"])}</p>
      </div>
    </section>"""


def render_doc(lang: str) -> str:
    labels = LABELS[lang]
    total = len(PAGES) + 1
    cover = render_cover(lang, labels)
    pages = "\n".join(
        render_page(p, i + 2, total, lang, labels) for i, p in enumerate(PAGES)
    )
    return f"""<!doctype html>
<html lang="{lang}">
<head>
  <meta charset="utf-8"/>
  <title>{html.escape(labels["title"])}</title>
  <style>{CSS}</style>
</head>
<body>
  {cover}
  {pages}
</body>
</html>"""


def build():
    for lang in ("de", "en"):
        html_doc = render_doc(lang)
        html_path = HERE / f"microbes_{lang}.html"
        html_path.write_text(html_doc, encoding="utf-8")
        print(f"wrote {html_path}")

        # PDF via WeasyPrint
        try:
            from weasyprint import HTML
            pdf_path = HERE / f"microbes_{lang}.pdf"
            HTML(string=html_doc, base_url=str(HERE)).write_pdf(str(pdf_path))
            print(f"wrote {pdf_path}")
        except Exception as exc:
            print(f"PDF generation failed for {lang}: {exc}")


if __name__ == "__main__":
    build()
