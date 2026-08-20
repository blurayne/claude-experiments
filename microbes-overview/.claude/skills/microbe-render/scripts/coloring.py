#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = ["requests>=2.31", "pillow>=10.3", "numpy>=1.26", "potracer>=0.0.4"]
# ///
"""Render a black-and-white *coloring-book* page for a microbe and vectorise it.

Kids' coloring style: a friendly cartoon character (with a face) of the microbe,
in a scene typical of where it lives, together with other cell/microbe characters —
bold clean black outlines on white, no shading, colourable. The generated raster is
traced to a crisp **vector SVG** (scales perfectly to A4 for printing). An optional
bilingual speech bubble is drawn as vector line-art with EN/DE toggle text layers
(reusing the `#labels-en`/`#labels-de` layer convention). No anatomical labels.

Output: renders/set/<set>/coloring/<microbe>.coloring.svg  (committed, lightweight)
        renders/set/<set>/coloring/<microbe>.attempts/gen-NN.png  (raw, git-ignored)

Usage:
  coloring.py --microbe macrophage --set immune-cells \
      --prompt-file p.txt [--speech-en "..."] [--speech-de "..."] \
      [--model gemini-3-pro-image] [--attempt 1] [--threshold 145]
Auth: GOOGLE_API_KEY env, else a .env walking up from cwd.
"""
from __future__ import annotations
import argparse, base64, io, json, os, sys, time, html
from pathlib import Path
import requests
import numpy as np
from PIL import Image, ImageFilter
from potrace import Bitmap

API = "https://generativelanguage.googleapis.com/v1beta/models"


def load_key() -> str:
    k = os.environ.get("GOOGLE_API_KEY")
    if k:
        return k.strip()
    for d in [Path.cwd(), *Path.cwd().parents]:
        env = d / ".env"
        if env.is_file():
            for line in env.read_text().splitlines():
                if line.strip().startswith("GOOGLE_API_KEY="):
                    return line.split("=", 1)[1].strip().strip('"').strip("'")
    sys.exit("ERROR: GOOGLE_API_KEY not found.")


def render(model: str, prompt: str, key: str) -> bytes:
    url = f"{API}/{model}:generateContent"
    headers = {"x-goog-api-key": key, "Content-Type": "application/json"}
    body = {"contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"responseModalities": ["IMAGE"]}}
    last = ""
    for attempt in range(3):
        try:
            r = requests.post(url, headers=headers, json=body, timeout=90 * (attempt + 1))
        except Exception as e:
            last = str(e); time.sleep(3 * (attempt + 1)); continue
        if r.status_code != 200:
            last = f"HTTP {r.status_code}: {r.text[:200]}"
            if r.status_code >= 500 or r.status_code == 429:
                time.sleep(3 * (attempt + 1)); continue
            break
        for c in r.json().get("candidates", []):
            for part in c.get("content", {}).get("parts", []):
                inline = part.get("inlineData") or part.get("inline_data")
                if inline and inline.get("data"):
                    return base64.b64decode(inline["data"])
        last = "no image in response"
    raise RuntimeError(last)


def to_bitmap(png: bytes, size: int, threshold: int) -> np.ndarray:
    """Grayscale → clean 1-bit: True where dark (the outlines)."""
    img = Image.open(io.BytesIO(png)).convert("L")
    # center-crop to square, resize to target
    w, h = img.size
    s = min(w, h)
    img = img.crop(((w - s) // 2, (h - s) // 2, (w - s) // 2 + s, (h - s) // 2 + s))
    img = img.resize((size, size), Image.LANCZOS)
    img = img.filter(ImageFilter.MedianFilter(3))          # despeckle
    arr = np.asarray(img)
    return arr < threshold                                  # dark pixels = black lines


def trace_paths(bitmap: np.ndarray) -> tuple[str, int]:
    """Trace to a SINGLE path 'd' with all contours as subpaths. Rendered with
    fill-rule:evenodd so holes subtract (thin outlines stay thin, white areas stay
    white) — the standard potrace→SVG mapping."""
    # potracer fills the region it traces; passing the inverted mask makes it
    # keep the thin ink strokes thin (empirically verified) rather than flooding
    # the background.
    path = Bitmap(np.invert(bitmap)).trace(turdsize=8, alphamax=1.0)
    d, n = [], 0
    for curve in path:
        n += 1
        sp = curve.start_point
        d.append(f"M{sp.x:.1f},{sp.y:.1f}")
        for seg in curve.segments:
            ep = seg.end_point
            if getattr(seg, "is_corner", False):
                c = seg.c
                d.append(f"L{c.x:.1f},{c.y:.1f} L{ep.x:.1f},{ep.y:.1f}")
            else:
                c1, c2 = seg.c1, seg.c2
                d.append(f"C{c1.x:.1f},{c1.y:.1f} {c2.x:.1f},{c2.y:.1f} {ep.x:.1f},{ep.y:.1f}")
        d.append("Z")
    return " ".join(d), n


def esc(s: str) -> str:
    return html.escape(s or "", quote=True)


# Baloo 2 / Comic Sans is a fairly wide comic font — no real font metrics
# available at generation time (this runs outside a browser), so wrapping
# uses a conservative average-advance-width heuristic instead.
_CHAR_W_RATIO = 0.58


def _wrap_lines(txt: str, font_size: float, max_width: float) -> list[str]:
    words = txt.split()
    if not words:
        return []
    max_chars = max(1, int(max_width / (font_size * _CHAR_W_RATIO)))
    lines, cur = [], words[0]
    for w in words[1:]:
        if len(cur) + 1 + len(w) <= max_chars:
            cur += " " + w
        else:
            lines.append(cur)
            cur = w
    lines.append(cur)
    return lines


def _fit_text(txt: str, max_width: float, max_lines: int = 3,
              font_start: float = 46, font_min: float = 30) -> tuple[list[str], float]:
    """Shrink font-size until the text wraps into at most `max_lines` lines
    (and no single word overflows a line on its own)."""
    font_size = font_start
    while font_size >= font_min:
        lines = _wrap_lines(txt, font_size, max_width)
        longest_word = max((len(w) for w in txt.split()), default=0)
        if len(lines) <= max_lines and longest_word * font_size * _CHAR_W_RATIO <= max_width:
            return lines, font_size
        font_size -= 2
    return _wrap_lines(txt, font_min, max_width), font_min


# --- page geometry --------------------------------------------------------
# The page is A4 portrait, not square. The traced artwork keeps its own 1:1
# square and is inset from the top; the extra height gives the speech bubble a
# margin to stick OUT of the picture into, and leaves a clear band at the
# bottom for the big microbe title (injected per-language by the viewer).
A4_RATIO = 297 / 210
ART_TOP_FRAC = 0.176   # square artwork starts this far down (× page width)


def page_height(size: int) -> int:
    return round(size * A4_RATIO)


def art_top(size: int) -> int:
    return round(size * ART_TOP_FRAC)


def bubble_svg(en: str, de: str, size: int) -> str:
    """A vector speech bubble (colourable outline) with EN/DE toggle text
    layers. Body + tail are ONE outline path (no seam where they'd otherwise
    overlap), and text auto-wraps/shrinks to fit within the bubble — sized to
    whichever of EN/DE needs more room, so both languages fit the same box.

    Sits in the page's top margin so the bubble reads as spoken *out of* the
    picture, with only its tail dipping down into the artwork."""
    if not (en or de):
        return ""
    bx, by, bw = size * 0.065, size * 0.022, size * 0.65
    r = 34
    pad_x, line_gap = 44, 1.18
    text_max_w = bw - pad_x * 2

    fitted = {}
    for lang, txt in (("en", en), ("de", de)):
        if not txt:
            continue
        lines, fsize = _fit_text(txt, text_max_w)
        fitted[lang] = (lines, fsize)

    # bubble height follows whichever language needs the most vertical room
    def block_h(lines, fsize):
        return len(lines) * fsize * line_gap
    content_h = max((block_h(lines, fsize) for lines, fsize in fitted.values()), default=46)
    bh = max(size * 0.115, content_h + 60)

    # single outline: rounded rect with a triangular tail notched into the
    # bottom edge — drawn as one continuous path so there's no seam. The tail
    # reaches past art_top() so it visibly points into the picture below, and
    # leans INWARD (tip right of its own base) toward the middle of the page
    # where the character stands. Leaning it the other way puts the tip back
    # under the bubble and it reads as a hook pointing at empty paper.
    tail_len = max(70, art_top(size) - (by + bh) + 78)
    tx1, tx2, ttx, tty = bx + 130, bx + 205, bx + 246, by + bh + tail_len
    d = (
        f"M{bx+r:.0f},{by:.0f} "
        f"L{bx+bw-r:.0f},{by:.0f} "
        f"A{r},{r} 0 0 1 {bx+bw:.0f},{by+r:.0f} "
        f"L{bx+bw:.0f},{by+bh-r:.0f} "
        f"A{r},{r} 0 0 1 {bx+bw-r:.0f},{by+bh:.0f} "
        f"L{tx2:.0f},{by+bh:.0f} "
        f"L{ttx:.0f},{tty:.0f} "
        f"L{tx1:.0f},{by+bh:.0f} "
        f"L{bx+r:.0f},{by+bh:.0f} "
        f"A{r},{r} 0 0 1 {bx:.0f},{by+bh-r:.0f} "
        f"L{bx:.0f},{by+r:.0f} "
        f"A{r},{r} 0 0 1 {bx+r:.0f},{by:.0f} Z"
    )
    box = f'<path d="{d}" fill="#fff" stroke="#000" stroke-width="5" stroke-linejoin="round"/>'
    cx = bx + bw / 2
    font = ("font-family=\"Baloo 2, Comic Sans MS, system-ui, sans-serif\" "
            "font-weight=\"700\" text-anchor=\"middle\"")

    def layer(lang, vis):
        if lang not in fitted:
            return ""
        lines, fsize = fitted[lang]
        block_top = by + bh / 2 - block_h(lines, fsize) / 2
        spans = "".join(
            f'<tspan x="{cx:.0f}" y="{block_top + (i + 0.82) * fsize * line_gap:.0f}">{esc(ln)}</tspan>'
            for i, ln in enumerate(lines)
        )
        return (f'<g id="labels-{lang}" class="labellayer" style="display:{vis}">'
                f'<text {font} font-size="{fsize:.0f}" fill="#000">{spans}</text></g>')
    return box + layer("en", "inline") + layer("de", "none" if en else "inline")


def build_svg(d: str, microbe: str, size: int, en: str, de: str) -> str:
    """Assemble the printable A4-portrait page: white sheet, the square traced
    artwork inset from the top, then the speech bubble on top of it (drawn last
    so its white fill masks any artwork ink it overlaps). The bottom band stays
    empty — the viewer drops the big microbe title in there per language."""
    ph, top = page_height(size), art_top(size)
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {ph}" '
        f'role="img" aria-label="Coloring page of {esc(microbe)}">'
        f'<rect x="0" y="0" width="{size}" height="{ph}" fill="#ffffff"/>'
        f'<g transform="translate(0,{top})">'
        f'<path d="{d}" fill="#000000" fill-rule="evenodd"/>'
        f'</g>'
        f'{bubble_svg(en, de, size)}'
        f'</svg>'
    )


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--microbe", required=True)
    ap.add_argument("--set", dest="set_", required=True)
    ap.add_argument("--model", default="gemini-3-pro-image")
    g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument("--prompt"); g.add_argument("--prompt-file")
    ap.add_argument("--speech-en", default="")
    ap.add_argument("--speech-de", default="")
    ap.add_argument("--attempt", type=int, default=1)
    ap.add_argument("--size", type=int, default=1080)
    ap.add_argument("--threshold", type=int, default=145)
    ap.add_argument("--renders-root", default="renders")
    a = ap.parse_args()
    prompt = a.prompt or Path(a.prompt_file).read_text()
    key = load_key()

    t0 = time.time()
    png = render(a.model, prompt, key)
    latency = round(time.time() - t0, 1)

    out_dir = Path(a.renders_root) / "set" / a.set_ / "coloring"
    attempts = out_dir / f"{a.microbe}.attempts"
    attempts.mkdir(parents=True, exist_ok=True)
    raw = attempts / f"gen-{a.attempt:02d}__{a.model}.png"
    raw.write_bytes(png)

    bitmap = to_bitmap(png, a.size, a.threshold)
    d, npaths = trace_paths(bitmap)
    svg = build_svg(d, a.microbe, a.size, a.speech_en, a.speech_de)
    svg_path = out_dir / f"{a.microbe}.coloring.svg"
    svg_path.write_text(svg)

    print(json.dumps({"ok": True, "microbe": a.microbe, "set": a.set_,
                      "svg": str(svg_path), "raw": str(raw), "paths": npaths,
                      "kb": round(len(svg) / 1024, 1), "latency_s": latency,
                      "model": a.model, "threshold": a.threshold}))


if __name__ == "__main__":
    main()
