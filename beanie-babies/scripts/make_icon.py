#!/usr/bin/env python3
"""Turn `icon-source.png` into the site's favicon / app-icon set.

The source is a flat illustration of a Ty teddy bear on white, with a soft
blue-grey drop shadow under it. The job is to knock the white out without
losing that shadow, which means the background can't just be keyed to
transparent -- the shadow *is* background, only darker.

So the alpha channel is built in two parts:

* **Unmultiply.** Every pixel is treated as some foreground colour composited
  over the (near-)white paper: `alpha = (bg - min(r,g,b)) / bg`, and the colour
  is divided back out. White paper lands at alpha 0, the shadow keeps exactly
  the darkness it had on white, and it composites correctly onto any other
  background. A small deadband stops the paper's own noise (it is 249-255, not
  a clean 255) from leaving a grey haze.
* **Silhouette.** Unmultiply alone would eat the bear's own light pixels -- the
  cream muzzle, the white "ty" letters, the eye highlights. So the bear is
  found separately (dark outline, then flood-filled from the border to fill the
  enclosed light areas) and forced to alpha 255 with its original colour.

The two are combined with `max()`, which leaves the anti-aliased rim of the
outline to the unmultiply path, where it belongs.

Everything else is bookkeeping: crop the terminal-paste letterbox, crop to the
artwork, pad to a square, and write out the sizes `build_site.py` looks for.

    python3 scripts/make_icon.py
"""

from __future__ import annotations

from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "icon-source.png"

# Pixels at or below this in their darkest channel are bear, not shadow. The
# shadow bottoms out around 190; the bear's outline is far darker.
SILHOUETTE_MAX = 170
# Ignore this much paper noise before a pixel counts as shadow at all.
DEADBAND = 5
# Breathing room around the artwork, as a fraction of the square side.
MARGIN = 0.04
# Android crops maskable icons to whatever shape the launcher likes, and only
# the middle 80% is guaranteed to survive -- hence its own padded, opaque copy.
MASKABLE_SAFE = 0.62
MASKABLE_BG = (255, 248, 238)  # --bg from the catalog's light theme

# (filename, size, background). None = transparent.
OUTPUTS = [
    ("icon.png", 1024, None),  # the master, linked for download
    ("icon-512.png", 512, None),
    ("icon-192.png", 192, None),
    # apple-touch-icon. Transparent like the rest, which costs us on iOS -- it
    # composites these onto black -- but iOS isn't the target and a white square
    # here would be the one icon that isn't actually transparent.
    ("icon-180.png", 180, None),
    ("icon-96.png", 96, None),  # the one the page header actually loads
    ("favicon-32x32.png", 32, None),
    ("favicon-16x16.png", 16, None),
]


def trim_letterbox(rgb: np.ndarray) -> np.ndarray:
    """Drop the bluish side bars a terminal paste adds around the image."""
    bluish = (rgb[:, :, 2] - rgb[:, :, 0]) > 3
    keep = np.where(bluish.mean(axis=0) < 0.5)[0]
    if keep.size == 0:
        return rgb
    return rgb[:, keep.min() + 2 : keep.max() - 1]


def fill_from_border(mask: np.ndarray) -> np.ndarray:
    """Return `mask` with every hole not reachable from the border filled in."""
    h, w = mask.shape
    outside = np.zeros((h, w), dtype=bool)
    queue: deque[tuple[int, int]] = deque()

    for y in range(h):
        for x in (0, w - 1):
            if not mask[y, x] and not outside[y, x]:
                outside[y, x] = True
                queue.append((y, x))
    for x in range(w):
        for y in (0, h - 1):
            if not mask[y, x] and not outside[y, x]:
                outside[y, x] = True
                queue.append((y, x))

    while queue:
        y, x = queue.popleft()
        for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
            if 0 <= ny < h and 0 <= nx < w and not mask[ny, nx] and not outside[ny, nx]:
                outside[ny, nx] = True
                queue.append((ny, nx))

    return ~outside


def cut_background(rgb: np.ndarray) -> np.ndarray:
    """RGB-on-white -> RGBA, keeping the shadow as partial alpha."""
    rgb = rgb.astype(np.float64)
    darkest = rgb.min(axis=2)

    # The paper isn't a clean 255; take its actual level from the brightest 1%.
    paper = float(np.percentile(darkest, 99))

    alpha = np.clip((paper - darkest - DEADBAND) / (paper - DEADBAND), 0.0, 1.0)

    # Undo the composite over paper: colour = (pixel - paper * (1 - a)) / a.
    safe = np.maximum(alpha, 1e-6)[:, :, None]
    unmultiplied = np.clip((rgb - paper * (1.0 - safe)) / safe, 0, 255)

    solid = fill_from_border(darkest < SILHOUETTE_MAX)

    out = np.where(solid[:, :, None], rgb, unmultiplied)
    alpha = np.maximum(alpha, solid.astype(np.float64))

    return np.dstack([out, alpha * 255.0]).round().astype(np.uint8)


def crop_to_square(rgba: np.ndarray) -> Image.Image:
    """Crop to the visible artwork, then pad out to a centred square."""
    visible = rgba[:, :, 3] > 8
    ys, xs = np.where(visible)
    top, bottom = int(ys.min()), int(ys.max())
    left, right = int(xs.min()), int(xs.max())

    art = Image.fromarray(rgba[top : bottom + 1, left : right + 1], "RGBA")
    side = int(round(max(art.size) * (1 + 2 * MARGIN)))

    square = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    square.paste(art, ((side - art.width) // 2, (side - art.height) // 2))
    return square


def main() -> None:
    rgb = np.asarray(Image.open(SOURCE).convert("RGB"))
    master = crop_to_square(cut_background(trim_letterbox(rgb)))

    for name, size, background in OUTPUTS:
        icon = master.resize((size, size), Image.LANCZOS)
        if background is not None:
            flat = Image.new("RGBA", icon.size, background + (255,))
            flat.alpha_composite(icon)
            icon = flat
        icon.save(ROOT / name, optimize=True)
        print(f"{name:24} {size}x{size}")

    maskable = Image.new("RGBA", (512, 512), MASKABLE_BG + (255,))
    inner = master.resize((int(512 * MASKABLE_SAFE),) * 2, Image.LANCZOS)
    offset = (512 - inner.width) // 2
    maskable.alpha_composite(inner, (offset, offset))
    maskable.save(ROOT / "icon-maskable-512.png", optimize=True)
    print(f"{'icon-maskable-512.png':24} 512x512")

    ico = ROOT / "favicon.ico"
    master.resize((64, 64), Image.LANCZOS).save(
        ico, sizes=[(16, 16), (32, 32), (48, 48), (64, 64)]
    )
    print(f"{ico.name:24} 16/32/48/64")


if __name__ == "__main__":
    main()
