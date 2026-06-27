#!/usr/bin/env python3
"""Render METHODOLOGY.md -> methodology.html as a styled, standalone page so the
method/algorithm/data-sources doc is readable on the live site (GitHub Pages
serves raw .md as plain text). Run after editing METHODOLOGY.md:

    pip install markdown
    python3 render_docs.py
"""
import os, markdown

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "METHODOLOGY.md")
OUT = os.path.join(HERE, "methodology.html")

TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Eco-Navigation — Methodology, algorithm &amp; data sources</title>
<style>
  :root{{color-scheme:dark}}
  body{{background:#0E1519;color:#E7EFEF;font-family:system-ui,-apple-system,
    Segoe UI,sans-serif;line-height:1.65;max-width:52rem;margin:0 auto;
    padding:2rem 1.1rem 5rem}}
  a{{color:#65C7A8}}
  .back{{display:inline-block;margin-bottom:1.2rem;font-size:.9rem}}
  h1,h2,h3{{line-height:1.25;color:#fff}}
  h1{{font-size:1.7rem}} h2{{font-size:1.3rem;margin-top:2.2rem;
    border-top:1px solid #26383A;padding-top:1.2rem}}
  h3{{font-size:1.05rem;color:#9FE3CC}}
  code{{background:#15201F;border:1px solid #26383A;padding:.08em .35em;
    border-radius:4px;font-size:.88em}}
  pre{{background:#101a18;border:1px solid #26383A;border-radius:8px;
    padding:.9em 1em;overflow-x:auto}}
  pre code{{background:none;border:none;padding:0}}
  table{{border-collapse:collapse;width:100%;margin:1rem 0;font-size:.92rem}}
  th,td{{border:1px solid #26383A;padding:.45em .6em;text-align:left}}
  th{{background:#15201F;color:#9FE3CC}}
  tr:nth-child(even) td{{background:#121b1a}}
  blockquote{{border-left:3px solid #38C7A6;margin:1rem 0;padding:.3rem 1rem;
    background:#12201d;color:#bfeadd;border-radius:0 8px 8px 0}}
  hr{{border:none;border-top:1px solid #26383A;margin:2rem 0}}
  img{{max-width:100%}}
</style>
</head>
<body>
<a class="back" href="index.html">← Back to the interactive comparison</a>
{body}
<hr>
<p style="font-size:.85rem;color:#5C7172">Rendered from
<code>METHODOLOGY.md</code> by <code>render_docs.py</code>. Source data:
<a href="data/results.csv">results.csv</a> ·
<a href="data/eco_data.json">eco_data.json</a> ·
<a href="data/gpx/">GPX tracks</a>.</p>
</body>
</html>
"""

def main():
    md = open(SRC, encoding="utf-8").read()
    body = markdown.markdown(
        md, extensions=["fenced_code", "tables", "toc", "sane_lists"])
    open(OUT, "w", encoding="utf-8").write(TEMPLATE.format(body=body))
    print(f"wrote {OUT}")

if __name__ == "__main__":
    main()
