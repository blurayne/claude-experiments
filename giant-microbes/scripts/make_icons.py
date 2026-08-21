#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = ["pillow"]
# ///
"""Generate the site/app icon set from one piece of source art.

Input is the kawaii bacterium + heart + virus illustration (`icon-source.png`, a
1024px opaque PNG on a near-white studio background). This flood-fills that
background away from the edges rather than keying out white globally -- the art
has real white in it (eye highlights, specular on the heart), and a global key
would punch holes in them. The cut mask is blurred half a pixel so downscaled
copies keep clean edges instead of stair-stepping.

Outputs, all committed (there is no build step wired to this -- run it by hand if
the art changes):

  icon.png              512px, transparent   header logo + manifest master
  icon-192/512.png      transparent          manifest "any"
  icon-maskable-512.png opaque, art at 72%   manifest "maskable" (Android crops)
  icon-180.png          opaque               apple-touch-icon (iOS mattes alpha
                                             to black, so this one is flattened)
  favicon-16/32.png     transparent          browser tab
  favicon.ico           16+32+48             legacy/bookmark
"""

import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "icon-source.png"
# --bg of the catalog's light theme; what the flattened icons sit on.
CREAM = (242, 250, 247, 255)


def cut_background(img: Image.Image) -> Image.Image:
    """Flood-fill the plain backdrop away from every edge, return RGBA art."""
    img = img.convert("RGB")
    w, h = img.size
    work = img.copy()
    mark = (255, 0, 255)
    seeds = [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1),
             (w // 2, 0), (w // 2, h - 1), (0, h // 2), (w - 1, h // 2)]
    for seed in seeds:
        ImageDraw.floodfill(work, seed, mark, thresh=45)

    alpha = Image.new("L", (w, h), 255)
    ap, wp = alpha.load(), work.load()
    for y in range(h):
        for x in range(w):
            if wp[x, y] == mark:
                ap[x, y] = 0
    alpha = alpha.filter(ImageFilter.GaussianBlur(0.6))

    out = img.copy()
    out.putalpha(alpha)
    return out


def square(art: Image.Image, margin: float = 0.06, size: int = 1024) -> Image.Image:
    """Crop to the art's own bounds, then centre it on a square with margin."""
    bbox = art.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()
    art = art.crop(bbox)
    cw, ch = art.size
    side = max(cw, ch)
    pad = int(side * margin)
    canvas = Image.new("RGBA", (side + 2 * pad, side + 2 * pad), (0, 0, 0, 0))
    canvas.paste(art, ((side - cw) // 2 + pad, (side - ch) // 2 + pad), art)
    return canvas.resize((size, size), Image.LANCZOS)


def main() -> None:
    src_path = Path(sys.argv[1]) if len(sys.argv) > 1 else SOURCE
    src = Image.open(src_path)
    art = src.convert("RGBA") if src.mode == "RGBA" else cut_background(src)
    master = square(art)

    def transparent(size: int, tighten: float = 0.0, sharpen: bool = False) -> Image.Image:
        img = master
        if tighten:
            w, _ = master.size
            c = int(w * tighten)
            img = master.crop((c, c, w - c, w - c))
        img = img.resize((size, size), Image.LANCZOS)
        if sharpen:  # the 16/32px copies turn to mush without it
            img = img.filter(ImageFilter.UnsharpMask(radius=1, percent=70, threshold=2))
        return img

    def opaque(size: int, scale: float, tighten: float = 0.0) -> Image.Image:
        inner = transparent(int(size * scale), tighten=tighten)
        canvas = Image.new("RGBA", (size, size), CREAM)
        off = (size - inner.size[0]) // 2
        canvas.paste(inner, (off, off), inner)
        return canvas.convert("RGB")

    written = []
    for name, img in [
        ("icon.png", transparent(512)),
        ("icon-192.png", transparent(192)),
        ("icon-512.png", transparent(512)),
        ("icon-maskable-512.png", opaque(512, scale=0.72, tighten=0.06)),
        ("icon-180.png", opaque(180, scale=0.94, tighten=0.05)),
        ("favicon-32x32.png", transparent(32, tighten=0.06, sharpen=True)),
        ("favicon-16x16.png", transparent(16, tighten=0.08, sharpen=True)),
    ]:
        img.save(ROOT / name)
        written.append(name)

    transparent(48, tighten=0.06, sharpen=True).save(
        ROOT / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)]
    )
    written.append("favicon.ico")
    print(f"Wrote {len(written)} icons from {src_path.name}: {', '.join(written)}")


if __name__ == "__main__":
    main()
