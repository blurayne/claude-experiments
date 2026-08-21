"""Shared image measurement + placeholder detection for the GIANTmicrobes pipeline.

Imported by audit_images.py, upgrade_images.py and verify_candidates.py.
Plain module (no uv shebang) — the callers carry the dependency metadata.

Two things live here because getting either wrong silently corrupts the dataset.

1. QUALITY METRICS. Pixel dimensions are not quality. Several source images are
   thumbnails enlarged to gallery size: full nominal resolution, no detail. The
   `detail_ratio` metric (RMS difference against the image's own half-scale round
   trip) is near zero for those and meaningfully positive for a real photograph,
   independent of resolution.

2. PLACEHOLDER DETECTION. giantmicrobes.com's Magento media path answers **HTTP
   200 with a stock group-shot of assorted plush microbes** for any filename that
   does not exist — it never 404s. Two consequences:
     * HTTP status is useless for probing whether a media file exists.
     * The placeholder *looks like a legitimate product photo*, so an eyeball
       check (human or model) passes it. It has to be matched, not judged.
   It is served re-encoded at different byte sizes, so an exact hash misses
   copies. We match on a perceptual difference hash instead, and derive the
   reference at runtime by requesting a deliberately nonexistent path.
"""

import hashlib
import os
import subprocess
import tempfile

import numpy as np
from PIL import Image

UA = ("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/124.0 Safari/537.36")
REFERER = "https://www.giantmicrobes.com/"
MEDIA_ROOT = "https://www.giantmicrobes.com/us/media/catalog/product"

# Observed exact digests of the placeholder (fast path). The perceptual check
# below is the authoritative one; these just save work.
KNOWN_PLACEHOLDER_MD5 = {
    "2e4b621de7296c5b5137cf14698a1e37",   # 483x272, 306120 B
    "fae0c1233b81726082d634222dd896f4",   # 483x272, 201528 B (re-encode)
}
PLACEHOLDER_SIZE = (483, 272)
DHASH_MAX_DISTANCE = 6      # out of 64 bits


def load_rgba(path):
    """RGBA array. AVIF goes through ImageMagick — Pillow has no AVIF here."""
    if str(path).lower().endswith(".avif"):
        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
            tmp_path = tmp.name
        try:
            subprocess.run(["convert", str(path), tmp_path], check=True,
                           capture_output=True)
            return np.asarray(Image.open(tmp_path).convert("RGBA"), dtype=np.float64)
        finally:
            os.unlink(tmp_path)
    return np.asarray(Image.open(path).convert("RGBA"), dtype=np.float64)


def _gray_on_white(rgba):
    a = rgba[:, :, 3:4] / 255.0
    rgb = rgba[:, :, :3] * a + 255.0 * (1.0 - a)
    return rgb @ np.array([0.299, 0.587, 0.114])


def measure(path):
    """dims, Laplacian variance (focus) and detail_ratio (real-resolution)."""
    rgba = load_rgba(path)
    h, w = rgba.shape[0], rgba.shape[1]
    gray = _gray_on_white(rgba)
    if min(h, w) > 4:
        lap = (-4.0 * gray[1:-1, 1:-1] + gray[:-2, 1:-1] + gray[2:, 1:-1]
               + gray[1:-1, :-2] + gray[1:-1, 2:])
        lap_var = float(lap.var())
    else:
        lap_var = 0.0
    im = Image.fromarray(gray.astype(np.uint8))
    back = (im.resize((max(1, w // 2), max(1, h // 2)), Image.LANCZOS)
              .resize((w, h), Image.LANCZOS))
    detail = float(np.sqrt(((gray - np.asarray(back, dtype=np.float64)) ** 2).mean()))
    return {"w": w, "h": h, "lap_var": round(lap_var, 2),
            "detail_ratio": round(detail, 3), "bytes": os.path.getsize(path)}


def dhash(path, size=8):
    """64-bit difference hash — survives re-encoding and mild rescaling."""
    gray = _gray_on_white(load_rgba(path))
    im = Image.fromarray(gray.astype(np.uint8)).resize((size + 1, size), Image.LANCZOS)
    a = np.asarray(im, dtype=np.int16)
    bits = (a[:, 1:] > a[:, :-1]).flatten()
    return "".join("1" if b else "0" for b in bits)


def hamming(a, b):
    return sum(1 for x, y in zip(a, b) if x != y)


def md5(path):
    h = hashlib.md5()
    with open(path, "rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 16), b""):
            h.update(chunk)
    return h.hexdigest()


def fetch(url, dest, timeout=25, retries=1):
    """curl with a real wall-clock deadline. Returns the HTTP status string.

    urllib's `timeout=` is an inactivity timeout, not a deadline — a server that
    trickles bytes never trips it. This pipeline lost hours to that before; use
    curl --max-time and nothing else.
    """
    status = "000"
    for _ in range(retries + 1):
        r = subprocess.run(
            ["curl", "-s", "-L", "-o", dest, "-w", "%{http_code}",
             "--max-time", str(timeout), "-A", UA, "-H", f"Referer: {REFERER}", url],
            capture_output=True, text=True)
        status = r.stdout.strip() or "000"
        if status == "200":
            break
    return status


def learn_placeholder(tmpdir=None):
    """Ask the shop for a path that cannot exist and keep what it sends back."""
    tmpdir = tmpdir or tempfile.mkdtemp()
    ref = os.path.join(tmpdir, "placeholder_ref.jpg")
    url = f"{MEDIA_ROOT}/z/z/zz-nonexistent-probe-9f3a2b.jpg"
    if fetch(url, ref) == "200" and os.path.getsize(ref) > 1000:
        return {"path": ref, "md5": md5(ref), "dhash": dhash(ref)}
    return None


class PlaceholderFilter:
    """Rejects the shop's not-found group-shot however it was re-encoded."""

    def __init__(self, reference=None):
        self.md5s = set(KNOWN_PLACEHOLDER_MD5)
        self.dhashes = set()
        if reference is None:
            reference = learn_placeholder()
        if reference:
            self.md5s.add(reference["md5"])
            self.dhashes.add(reference["dhash"])
        self.reference = reference

    def is_placeholder(self, path):
        """-> (bool, reason)"""
        try:
            if md5(path) in self.md5s:
                return True, "exact placeholder digest"
            d = dhash(path)
            for known in self.dhashes:
                dist = hamming(d, known)
                if dist <= DHASH_MAX_DISTANCE:
                    return True, f"perceptual match to placeholder (distance {dist})"
            # Size via load_rgba, not Image.open — the latter cannot read AVIF
            # here, and an exception would be misreported as "placeholder".
            rgba = load_rgba(path)
            if (rgba.shape[1], rgba.shape[0]) == PLACEHOLDER_SIZE:
                return True, f"placeholder geometry {PLACEHOLDER_SIZE[0]}x{PLACEHOLDER_SIZE[1]}"
        except Exception as exc:                        # noqa: BLE001
            return True, f"unreadable ({exc})"
        return False, ""
