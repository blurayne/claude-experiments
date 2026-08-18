#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
"""Assemble a labelled teaching SVG from a base render + a labels.json.

The base microbe image becomes the bottom layer. On top sit THREE independent
label layers — Latin, English, German — each its own <g> that can be toggled.
English is visible by default; Latin and German start hidden. A thin HTML wrapper
adds En/La/De on/off buttons.

labels.json schema:
{
  "microbe": "rod-bacterium",
  "base": "theme/sem/rod-bacterium.avif",   # path RELATIVE to the .svg location
  "width": 1080, "height": 1080,
  "labels": [
    {"key":"cell_wall",
     "ax":540,"ay":120,        # anchor: the structure on the image
     "tx":940,"ty":110,        # text anchor position (leader line ends here)
     "la":"Paries cellulae","en":"Cell wall","de":"Zellwand"}
  ]
}

Usage: build_svg.py --labels labels.json --out rod-bacterium.sem
       (writes rod-bacterium.sem.svg and rod-bacterium.sem.html next to --out)
Only stdlib — no third-party deps.
"""
from __future__ import annotations
import argparse, json, html, base64, mimetypes
from pathlib import Path

LANGS = [("en", "English"), ("la", "Latin"), ("de", "Deutsch")]
DEFAULT_ON = "en"

# Style tokens — kept in sync with reference/styles.md.
FONT = "font-family='Nunito, system-ui, sans-serif'"
LABEL_FS = 26
DOT_R = 6
LINE = "#f4f4f5"
LINE_DARK = "#111"
# Default label ink: white glyphs with a black halo, for dark/false-colour images.
# A labels.json may override per style via top-level "text_fill"/"text_stroke"
# (e.g. watercolor plates use black text on a paper-coloured halo).
TEXT_FILL = "#fff"
TEXT_STROKE = "#000"


def esc(s: str) -> str:
    return html.escape(str(s), quote=True)


# Rough per-glyph advance widths as a fraction of the font size (Nunito 700).
# Used only to find the text's horizontal centre so the leader can end there;
# the text's own halo covers the overlap, so small errors are invisible.
_WIDE = set("mwMW—–@%")
_NARROW = set("ijlItf.,:;'!|()[] ")


def text_width(txt: str, fs: int) -> float:
    total = 0.0
    for ch in txt:
        total += 0.92 if ch in _WIDE else 0.34 if ch in _NARROW else 0.56
    return total * fs


def layer(lang: str, labels: list[dict], w: int,
          fill: str = TEXT_FILL, stroke: str = TEXT_STROKE) -> str:
    """One language layer: leader line + text callout per label.

    The leader ends at the CENTRE of the label text (horizontal midpoint of the
    rendered glyphs, vertical mid-height), not at its baseline edge — the text is
    painted last, so its halo hides the line where they overlap and the leader
    reads as emerging from the middle of the label. `fill`/`stroke` set the glyph
    colour and halo (default white-on-black; watercolor uses black-on-paper).
    """
    vis = "inline" if lang == DEFAULT_ON else "none"
    out = [f'<g id="labels-{lang}" class="labellayer" style="display:{vis}">']
    for lb in labels:
        ax, ay, tx, ty = lb["ax"], lb["ay"], lb["tx"], lb["ty"]
        txt = lb.get(lang) or lb.get("en") or lb["key"]
        # A label in the LEFT margin (tx < ax) reads rightward toward the cell
        # (anchor=start); one in the RIGHT margin reads leftward (anchor=end).
        # This keeps text on-canvas instead of overflowing the edge.
        anchor = "start" if tx < ax else "end"
        # Leader endpoint = centre of the text box. text-anchor=start grows the
        # text rightward from tx, =end grows it leftward, so the centre sits half
        # a text-width toward the growth direction; mid-height is ~1/3 fs up.
        half = text_width(txt, LABEL_FS) / 2
        cx = tx + half if anchor == "start" else tx - half
        cy = ty - LABEL_FS * 0.33
        # Halo drawn as TWO stacked <text>: a stroke-only copy first (the halo),
        # then the fill copy on top. Painter's order (document order) gives the same
        # result as paint-order:stroke but renders correctly in every engine —
        # cairosvg / some PDF converters ignore paint-order and would otherwise
        # paint the halo over the fill. No anchor circle/dot — just line + text.
        tspec = (f'x="{tx}" y="{ty}" {FONT} font-size="{LABEL_FS}" '
                 f'font-weight="700" text-anchor="{anchor}"')
        out.append(
            f'<line x1="{ax}" y1="{ay}" x2="{cx:.0f}" y2="{cy:.0f}" stroke="{LINE}" '
            f'stroke-width="2" opacity="0.9"/>'
            f'<line x1="{ax}" y1="{ay}" x2="{cx:.0f}" y2="{cy:.0f}" stroke="{LINE_DARK}" '
            f'stroke-width="0.7"/>'
            f'<text {tspec} fill="none" stroke="{stroke}" stroke-width="4" '
            f'stroke-linejoin="round">{esc(txt)}</text>'
            f'<text {tspec} fill="{fill}">{esc(txt)}</text>'
        )
    out.append("</g>")
    return "\n".join(out)


def build_svg(spec: dict) -> str:
    w, h = spec.get("width", 1080), spec.get("height", 1080)
    base = esc(spec["base"])
    labels = spec.get("labels", [])
    fill = spec.get("text_fill", TEXT_FILL)
    stroke = spec.get("text_stroke", TEXT_STROKE)
    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" '
        f'width="{w}" height="{h}" role="img" '
        f'aria-label="Labelled diagram of {esc(spec.get("microbe",""))}">',
        f'<image href="{base}" x="0" y="0" width="{w}" height="{h}"/>',
    ]
    for lang, _ in LANGS:
        parts.append(layer(lang, labels, w, fill, stroke))
    parts.append("</svg>")
    return "\n".join(parts)


def build_html(svg: str, spec: dict) -> str:
    microbe = esc(spec.get("microbe", ""))
    buttons = "\n".join(
        f'<button data-lang="{code}" class="{"on" if code==DEFAULT_ON else ""}">'
        f'{name}</button>' for code, name in LANGS)
    return f"""<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{microbe} — labelled</title>
<style>
  body{{margin:0;font-family:Nunito,system-ui,sans-serif;background:#0e0e11;color:#eee;
       display:flex;flex-direction:column;align-items:center;gap:14px;padding:18px}}
  .bar{{display:flex;gap:8px}}
  button{{background:#1b1b21;color:#bbb;border:2px solid #333;border-radius:999px;
          padding:7px 16px;font-weight:700;cursor:pointer}}
  button.on{{background:#1e3a34;border-color:#2f8f7a;color:#7fe0c8}}
  svg{{max-width:min(92vw,720px);height:auto;background:#000;border-radius:12px}}
</style></head><body>
<h2 style="margin:.2em 0">{microbe}</h2>
<div class="bar">{buttons}</div>
{svg}
<script>
 // Multiple layers may be shown at once; English starts on.
 document.querySelectorAll('.bar button').forEach(function(b){{
   b.addEventListener('click',function(){{
     b.classList.toggle('on');
     var g=document.getElementById('labels-'+b.dataset.lang);
     if(g) g.style.display=b.classList.contains('on')?'inline':'none';
   }});
 }});
</script></body></html>"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--labels", required=True)
    ap.add_argument("--out", required=True, help="output stem (no extension)")
    ap.add_argument("--embed", action="store_true",
                    help="inline the base image as a data URI (self-contained SVG)")
    args = ap.parse_args()
    spec = json.loads(Path(args.labels).read_text())
    if args.embed:
        # Inline the base image as a data URI so the SVG is self-contained and
        # renders (base + labels) when embedded via markdown ![](x.svg).
        bp = (Path(args.labels).parent / spec["base"]).resolve()
        mime = mimetypes.guess_type(bp.name)[0] or "image/avif"
        spec["base"] = f"data:{mime};base64," + base64.b64encode(bp.read_bytes()).decode()
    svg = build_svg(spec)
    # Append extensions (do NOT use with_suffix — the stem may contain dots
    # like "rod-bacterium.textbook", which with_suffix would clobber).
    svg_path = Path(str(args.out) + ".svg")
    html_path = Path(str(args.out) + ".html")
    svg_path.write_text(svg)
    html_path.write_text(build_html(svg, spec))
    print(json.dumps({"ok": True, "svg": str(svg_path), "html": str(html_path),
                      "labels": len(spec.get("labels", []))}))


if __name__ == "__main__":
    main()
