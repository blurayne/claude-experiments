#!/usr/bin/env python3
"""Render iso-tables-verified.md into a standalone HTML in the dossier style.

Reuses the exact <style> block (incl. the Deep-Field space theme) from the
Schweissglas dossier so the appendix matches the rest of the site, then wraps
the converted Markdown body in the same header / footer / theme-toggle shell.
"""
import re
from pathlib import Path
import markdown

HERE = Path(__file__).parent
DOSSIER = HERE / "2026-08-11_schweissglas-augenschutz_dossier.html"
SRC = HERE / "iso-tables-verified.md"
OUT = HERE / "iso-tables-verified.html"

# 1) borrow the dossier's full <style> block (fonts, tokens, tables, space theme)
dossier = DOSSIER.read_text(encoding="utf-8")
css = re.search(r"<style>(.*?)</style>", dossier, re.S).group(1)

# 2) per-file tweaks: this doc uses ## as section titles and ### as subheads,
#    so promote h2 to a full gradient title and shrink h3; small tables shouldn't
#    force horizontal scroll; add blockquote / hr / code styling the md needs.
css += """
/* ---- iso-tables appendix overrides ---- */
h2{font-family:'Space Grotesk',sans-serif;font-size:22px;font-weight:600;
  text-transform:none;letter-spacing:-.01em;margin:8px 0 12px;
  background:linear-gradient(100deg,var(--teal),var(--tx) 46%,var(--amber));
  -webkit-background-clip:text;background-clip:text;color:transparent}
h3{font-size:16.5px;margin:22px 0 8px}
table{min-width:0}
.tscroll table{min-width:0}
tbody td,thead th{white-space:normal}
blockquote{border-left:2px solid var(--amber);margin:18px 0;padding:6px 0 6px 15px;
  color:var(--tx2);font-size:14px;background:color-mix(in srgb,var(--amber) 6%,transparent);
  border-radius:0 3px 3px 0}
blockquote p{margin:0}
hr{border:none;border-top:1px solid var(--line);margin:34px 0}
code{background:var(--bg2);border:1px solid var(--line);padding:1px 5px;border-radius:3px;font-size:.88em}
.content>p:first-of-type{font-size:16px;color:var(--tx2)}
"""

# 3) convert the markdown body (drop the leading H1, kept for the header)
md_text = SRC.read_text(encoding="utf-8")
md_text = re.sub(r"\A#\s+.*?\n", "", md_text, count=1)  # strip first H1 line
body = markdown.markdown(
    md_text,
    extensions=["tables", "sane_lists", "fenced_code", "attr_list"],
    output_format="html5",
)
# wrap every table in a scroll container for the bordered card look
body = re.sub(r"<table>", '<div class="tscroll"><table>', body)
body = re.sub(r"</table>", "</table></div>", body)

# 4) assemble the page
meta_chips = [
    "Stand 13.08.2026",
    "EN ISO 12312-2:2015",
    "ISO/DIS 12312-2:2025",
    "Chou et al. 2021 (AJ 162:103)",
    "Anhang zum Augenschutz-Dossier",
]
chips = "\n".join(f"    <span>{c}</span>" for c in meta_chips)

html = f"""<!DOCTYPE html>
<html lang="de" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>ISO 12312-2 &mdash; verifiziert &amp; neu durchgerechnet &middot; SoFi 12.08.2026</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<style>{css}</style>
</head>
<body>
<div class="wrap">

<header class="fade">
  <button id="themeBtn" aria-label="Hell/Dunkel umschalten">HELL</button>
  <div class="eyebrow">Observatory &middot; Norm-Verifikation</div>
  <h1>ISO 12312-2<br><em>verifiziert &amp; neu durchgerechnet</em></h1>
  <p class="sub">Die Originalwerte der Norm, belegt wie sie legitim beschafft wurden, und die
  Sicherheitsaussage des Augenschutz-Dossiers (DIN&nbsp;5&nbsp;+&nbsp;DIN&nbsp;11 gestapelt) direkt gegen
  den Normtext nachgerechnet.</p>
  <div class="meta">
{chips}
  </div>
</header>

<section class="content fade">
{body}
</section>

<footer>
  Anhang zum <a href="2026-08-11_schweissglas-augenschutz_dossier.html">Schwei&szlig;glas-&amp;-Augenschutz-Dossier</a>
  &middot; Zahlenwerte aus der Verlags-Vorschau der Norm, eigene Nachrechnung nach der EN-169-Stufenformel
  &middot; Stand 13.08.2026.<br>
  Dieser Anhang ersetzt keine augen&auml;rztliche Untersuchung. Bei Sehst&ouml;rungen: 116117, im Notfall 112.
</footer>
</div>

<script>
const tb=document.getElementById('themeBtn');
tb.textContent=document.documentElement.dataset.theme==='dark'?'HELL':'DUNKEL';
tb.onclick=()=>{{const d=document.documentElement;
  const n=d.dataset.theme==='dark'?'light':'dark';
  d.dataset.theme=n;tb.textContent=n==='dark'?'HELL':'DUNKEL';}};
</script>
</body>
</html>
"""

OUT.write_text(html, encoding="utf-8")
print(f"wrote {OUT} ({len(html)} bytes)")
