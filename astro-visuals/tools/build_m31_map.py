#!/usr/bin/env python3
"""Build m31-map.webp: a face-on probability map of the Andromeda galaxy.

The Milky Way in galactic-transit.html is generated from a photographic
probability map (galaxy-map.webp): stars are sampled from luminance, dust from
dark lanes (local darkness against a 5-px blur), HII regions from blue excess,
and point colours come straight from the image. This script builds the same
kind of map for M31, from real data, one instrument per channel:

  PHAT      heic2501a - the PHAT+PHAST Hubble panorama (Jan 2025): ~200 million
            resolved stars, but a STRIP along the major axis - after the 77-degree
            deprojection it covers two bands either side of the bulge and nothing
            else. Kept exactly where it has coverage.
  optical   a wide-field colour image of the whole disk, deprojected the same way
            and registered to the PHAT frame by cross-correlation. Luminance and
            colour everywhere the panorama does not reach (which is most of it).
  far-IR    Herschel/Planck: dust EMISSION. Rings of cold dust are bright here, so
            this becomes the darkening the map's dust sampler reads as lanes.
  UV        GALEX: young hot stars and star-forming rings. Becomes the blue excess
            the map's HII sampler reads.

Before this, everything outside the panorama's strip was an azimuthal average
with noise on it - a grey ball with two windows of structure - and that is the
blur the simulation showed. Now the gaps are filled with measurements, not
extrapolation. Only sky-plane positions are measured in any of them; the
simulation models the third dimension (thickness, bulge, halo) and says so.

Sources (committed under tools/, so the build is reproducible offline):
  tools/m31-src.jpg           heic2501a, NASA/ESA/B.F. Williams et al., CC BY 4.0
  tools/m31-wide-optical.jpg  wide optical, Adam Evans, CC BY 2.0 (Wikimedia Commons)
  tools/m31-wide-ir.jpg       Herschel/Planck far-IR, ESA/NASA/JPL-Caltech, CC BY-SA 3.0 IGO
  tools/m31-wide-uv.jpg       GALEX ultraviolet, NASA/JPL-Caltech, public domain
Higher-resolution originals of the same pictures exist on Wikimedia Commons and
the ESA/NASA image archives; drop one in over the committed file to use it.

  --extra PATH   use PATH as the optical wide-field image instead of the committed
                 one (a local, uncommitted picture - say, one whose licence does not
                 allow it in a public repo). Recorded in m31-map.json as a local file.
  --phat-only    the previous behaviour: panorama plus azimuthal fill, no wide field.
  --no-phat      wide-field layers only (when the panorama cannot be fetched).
  --analytic     no imagery at all: the structural model (rings + disk + bulge).

Runs on numpy + Pillow alone: python3 tools/build_m31_map.py
"""
import io, json, math, sys, time, urllib.request
from pathlib import Path

import numpy as np
from PIL import Image

HERE = Path(__file__).resolve().parent
OUT_DIR = HERE.parent
OUT_MAP = OUT_DIR / 'm31-map.webp'
OUT_META = OUT_DIR / 'm31-map.json'
SRC_CACHE = HERE / 'm31-src.jpg'

N = 448                 # output side, same as galaxy-map.webp
R_EDGE_PX = 188.6       # disk edge radius in output pixels, same convention
INCL_DEG = 77.0         # de Vaucouleurs; the deprojection stretch is 1/cos(i)
R25_KPC = 20.6          # the drawn edge corresponds to M31's R25
CI = math.cos(math.radians(INCL_DEG))

SOURCES = [
    ('https://cdn.esahubble.org/archives/images/publicationjpg/heic2501a.jpg', 'publication'),
    ('https://cdn.esahubble.org/archives/images/screen/heic2501a.jpg', 'screen'),
]
CREDIT = ('NASA, ESA, B. F. Williams (Univ. of Washington), Z. Chen (Univ. of '
          'Washington), L. C. Johnson (Northwestern Univ.), the PHAT and PHAST teams')

WIDE = {
    'optical': dict(file='m31-wide-optical.jpg', credit='Adam Evans', license='CC BY 2.0',
                    what='wide-field optical: luminance and colour'),
    'ir':      dict(file='m31-wide-ir.jpg', credit='ESA/NASA/JPL-Caltech (Herschel, Planck)',
                    license='CC BY-SA 3.0 IGO', what='far-infrared dust emission: the lanes'),
    'uv':      dict(file='m31-wide-uv.jpg', credit='NASA/JPL-Caltech (GALEX)',
                    license='public domain', what='ultraviolet: young stars and HII, the blue excess'),
}


# ---------------------------------------------------------------- helpers
def fetch_source():
    if SRC_CACHE.exists() and SRC_CACHE.stat().st_size > 50_000:
        print(f'using cached source {SRC_CACHE.name} ({SRC_CACHE.stat().st_size} bytes)')
        return SRC_CACHE.read_bytes(), 'cache'
    for url, tag in SOURCES:
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'claude-experiments-m31-map/1.0'})
            with urllib.request.urlopen(req, timeout=120) as r:
                data = r.read()
            if len(data) < 50_000:
                raise ValueError(f'suspiciously small response ({len(data)} bytes)')
            Image.open(io.BytesIO(data)).verify()
            SRC_CACHE.write_bytes(data)
            print(f'downloaded {tag}: {url} ({len(data)} bytes)')
            return data, url
        except Exception as e:
            print(f'  {tag} failed: {e}')
    return None, None


def box_blur(a, k, passes=3):
    """Separable box blur, edge-clamped; k = half width. 2-D or 3-D (last axis channels)."""
    if a.ndim == 3:
        return np.stack([box_blur(a[..., c], k, passes) for c in range(a.shape[2])], -1)
    out = a.astype(np.float32).copy()
    for _ in range(passes):
        c = np.cumsum(np.pad(out, ((0, 0), (1, 0))), axis=1)
        i0 = np.clip(np.arange(out.shape[1]) - k, 0, out.shape[1])
        i1 = np.clip(np.arange(out.shape[1]) + k + 1, 0, out.shape[1])
        out = (c[:, i1] - c[:, i0]) / (i1 - i0)
        c = np.cumsum(np.pad(out, ((1, 0), (0, 0))), axis=0)
        i0 = np.clip(np.arange(out.shape[0]) - k, 0, out.shape[0])
        i1 = np.clip(np.arange(out.shape[0]) + k + 1, 0, out.shape[0])
        out = (c[i1, :] - c[i0, :]) / (i1 - i0)[:, None]
    return out


def find_nucleus(lum):
    b = box_blur(lum, max(2, lum.shape[1] // 200))
    iy, ix = np.unravel_index(np.argmax(b), b.shape)
    return float(ix), float(iy)


def major_axis_angle(lum, cx, cy):
    """Position angle of the bright disk's principal axis, from second moments."""
    thr = np.quantile(lum, 0.985) * 0.25
    ys, xs = np.nonzero(lum > thr)
    w = lum[ys, xs] - thr
    dx, dy = xs - cx, ys - cy
    keep = (dx * dx + dy * dy) < (max(lum.shape) * 0.7) ** 2
    dx, dy, w = dx[keep], dy[keep], w[keep]
    sxx = np.sum(w * dx * dx); syy = np.sum(w * dy * dy); sxy = np.sum(w * dx * dy)
    return 0.5 * math.atan2(2 * sxy, sxx - syy)   # radians, image coords (y down)


def spiral_winding(lum, r_lo=0.30, r_hi=0.88):
    """Sign of the m=2 log-spiral pattern: +1 if arms open counter-clockwise
    (screen sense, y up) going outward, -1 for clockwise, ~0 for none."""
    n = lum.shape[0]; c = (n - 1) / 2
    yy, xx = np.mgrid[0:n, 0:n]
    x = xx - c; y = -(yy - c)
    r = np.hypot(x, y) / R_EDGE_PX
    ann = (r > r_lo) & (r < r_hi)
    phi = np.arctan2(y, x)[ann]
    lr = np.log(r[ann])
    v = lum[ann]
    bins = np.clip(((r[ann] - r_lo) / (r_hi - r_lo) * 40).astype(int), 0, 39)
    mean = np.bincount(bins, v, 40) / np.maximum(1, np.bincount(bins, None, 40))
    res = v - mean[bins]
    best = 0.0
    for pitch in range(8, 32, 2):
        t = 1.0 / math.tan(math.radians(pitch))
        for sgn in (+1, -1):
            a = np.abs(np.sum(res * np.exp(2j * (phi + sgn * t * lr))))
            if a > abs(best):
                best = sgn * a
    return 1 if best > 0 else -1


def out_grid():
    c0 = (N - 1) / 2
    jj, ii = np.mgrid[0:N, 0:N].astype(np.float32)
    return ii - c0, jj - c0                       # X right, Y down, output px


def bilinear(v, xs, ys):
    """Sample a 2-D or 3-D array at float coords; outside the array reads 0."""
    h, w = v.shape[:2]
    inside = (xs >= 0) & (xs <= w - 1.001) & (ys >= 0) & (ys <= h - 1.001)
    xc = np.clip(xs, 0, w - 1.001); yc = np.clip(ys, 0, h - 1.001)
    x0 = xc.astype(int); y0 = yc.astype(int)
    fx = (xc - x0)[..., None] if v.ndim == 3 else xc - x0
    fy = (yc - y0)[..., None] if v.ndim == 3 else yc - y0
    out = (v[y0, x0] * (1 - fx) * (1 - fy) + v[y0, x0 + 1] * fx * (1 - fy)
           + v[y0 + 1, x0] * (1 - fx) * fy + v[y0 + 1, x0 + 1] * fx * fy)
    return out * (inside[..., None] if v.ndim == 3 else inside), inside


def fill_and_bulge(sq, sqm, seed, rb=9.5):
    """The bulge cannot be deprojected (the 1/cos i stretch turns a spheroid into a
    vertical cigar), so: cut the cigar out of the measured set, fill everything
    unmeasured, and add the bulge back round, from the photo's own major-axis
    profile where the sky is unstretched. Shared by the panorama and the wide-field
    optical, which have the same problem. rb: the bulge's radius in output px."""
    Xo, Yo = out_grid()
    BW = int(3.6 * rb)
    c0 = (N - 1) / 2
    slice_rows = sq[int(c0) - 3:int(c0) + 4]
    bprof = np.zeros((BW + 1, 3), np.float32)
    for k in range(BW + 1):
        cols = []
        for s_ in (-1, 1):
            j = int(round(c0 + s_ * k))
            if 0 <= j < N: cols.append(slice_rows[:, j])
        bprof[k] = np.concatenate(cols).mean(axis=0)
    bprof = np.maximum(bprof - bprof[BW], 0)
    for k in range(BW - 1, -1, -1):
        bprof[k] = np.maximum(bprof[k], bprof[k + 1])
    cigar = (np.abs(Xo) < 4.5 * rb) & (np.abs(Yo) < 3.9 * rb / CI)
    sqm = sqm & ~cigar
    r = np.hypot(Xo, Yo)
    rbin = np.clip((r / (N / 2) * 120).astype(int), 0, 119)
    rng = np.random.default_rng(seed)
    filled = sq.copy()
    good = sqm & (r < N / 2)
    # The level of the fill comes from a band just outside the column, per ring,
    # not from the whole ring: a whole ring averages in the arm crossings on the
    # major axis, and the column would then stand brighter than everything beside
    # it. Where that band is empty (rings the column swallows whole) the whole ring.
    near = good & (np.abs(Xo) < 4.5 * rb + 16)
    for ch in range(3):
        v = sq[:, :, ch]
        s_ = np.bincount(rbin[good], v[good], minlength=120)
        raw = np.bincount(rbin[good], minlength=120)
        prof = s_ / np.maximum(1, raw)
        sn = np.bincount(rbin[near], v[near], minlength=120)
        rn = np.bincount(rbin[near], minlength=120)
        prof = np.where(rn >= 12, sn / np.maximum(1, rn), prof)
        for k in range(118, -1, -1):            # rings the cigar swallowed whole
            if raw[k] < 8: prof[k] = prof[k + 1]
        fill = prof[rbin] * (0.82 + 0.36 * rng.random((N, N)))
        filled[:, :, ch] = np.where(sqm, v, fill)
    soft = box_blur(sqm.astype(np.float32), 4, 3)
    seam = (soft > 0.02) & (soft < 0.98)
    for ch in range(3):
        b = box_blur(filled[:, :, ch], 2, 1)
        filled[:, :, ch] = np.where(seam, b, filled[:, :, ch])
    rb_r = np.clip(np.hypot(Xo, Yo * 1.08), 0, BW - 1e-3)
    i0_ = rb_r.astype(int); fb = (rb_r - i0_)[..., None]
    filled += bprof[i0_] * (1 - fb) + bprof[i0_ + 1] * fb
    return np.clip(filled, 0, None), sqm


def edge_fade(img):
    Xo, Yo = out_grid()
    r = np.hypot(Xo, Yo)
    fade = np.clip(1 - (r - N / 2 * 0.94) / (N * 0.05), 0, 1)
    return img * fade[:, :, None]


# ---------------------------------------------------------------- the panorama
def analytic_map():
    print('building the analytic model (no imagery)')
    c = (N - 1) / 2
    yy, xx = np.mgrid[0:N, 0:N]
    x = (xx - c) / R_EDGE_PX * R25_KPC
    y = -(yy - c) / R_EDGE_PX * R25_KPC
    r = np.hypot(x, y)
    th = np.arctan2(y, x)
    rng = np.random.default_rng(31)
    disk = np.exp(-r / 5.5) * 0.55
    bulge = 2.1 * np.exp(-np.power(r / 1.9, 0.62))
    ring10 = 0.95 * np.exp(-((r - 10.3) / 1.15) ** 2)
    r5 = np.hypot(x - 0.6, y + 0.4)
    ring5 = 0.34 * np.exp(-((r5 - 5.1) / 0.85) ** 2)
    ring15 = 0.26 * np.exp(-((r - 15.4) / 1.4) ** 2)
    arms = 1 + 0.35 * np.cos(2 * th - 2.4 * np.log(np.maximum(r, 0.5)) / math.tan(math.radians(25)))
    lum = disk + bulge + (ring10 * arms + ring5 + ring15)
    lum *= 1 + 0.22 * (rng.random((N, N)) - 0.5)
    lum *= r < R25_KPC * 1.05
    lum /= lum.max()
    warm = np.clip(bulge / (lum + 1e-6), 0, 1)
    blue = np.clip((ring10 * arms + ring15) / (lum + 1e-6), 0, 1)
    R = lum * (0.72 + 0.30 * warm - 0.16 * blue)
    G = lum * (0.78 + 0.16 * warm - 0.04 * blue)
    B = lum * (0.86 - 0.06 * warm + 0.22 * blue)
    lane = 0.55 * np.exp(-((r - 9.3) / 0.75) ** 2) + 0.3 * np.exp(-((r5 - 4.4) / 0.6) ** 2)
    lane *= 0.7 + 0.3 * np.cos(2 * th + 0.8)
    dust = 1 - np.clip(lane, 0, 0.8) * 0.6
    img = np.stack([R * dust, G * dust, B * dust], -1)
    return np.clip(img, 0, 1), 'analytic structural model (Gordon et al. 2006 rings)'


def photographic_map(data):
    """The PHAT panorama, deprojected. Returns (image, note, measured-mask)."""
    img = Image.open(io.BytesIO(data)).convert('RGB')
    if img.width > 6000:
        img = img.resize((6000, round(img.height * 6000 / img.width)), Image.LANCZOS)
    a = np.asarray(img, np.float32) / 255
    lum = a.mean(axis=2)
    corners = np.concatenate([lum[:40, :40].ravel(), lum[:40, -40:].ravel(),
                              lum[-40:, :40].ravel(), lum[-40:, -40:].ravel()])
    sky = float(np.median(corners))
    print(f'panorama {img.width}x{img.height}, sky level {sky:.4f}')
    covered = box_blur((lum > sky + 0.006).astype(np.float32), 8, 2) > 0.30
    lum = np.clip(lum - sky, 0, None)
    cxn, cyn = find_nucleus(lum)
    unsharp = lum - box_blur(lum, 9, 2)
    yy0, xx0 = np.mgrid[0:lum.shape[0], 0:lum.shape[1]]
    far = np.hypot(xx0 - cxn, yy0 - cyn) > 0.1 * lum.shape[1]
    us = np.where(far & covered, unsharp, 0)
    for _ in range(8):
        iy, ix = np.unravel_index(np.argmax(us), us.shape)
        if us[iy, ix] < 0.055: break
        covered &= np.hypot(xx0 - ix, yy0 - iy) > 0.012 * lum.shape[1]
        us[max(0, iy - 60):iy + 61, max(0, ix - 60):ix + 61] = 0
        print(f'  blotted compact source at ({ix},{iy})')

    cx, cy = find_nucleus(lum)
    ang = major_axis_angle(lum, cx, cy)
    print(f'  nucleus at ({cx:.0f},{cy:.0f}), major axis {math.degrees(ang):+.2f} deg from horizontal')
    big = max(img.width, img.height) * 2
    canvas = Image.new('RGB', (big, big))
    canvas.paste(Image.fromarray((a * 255).astype(np.uint8)), (round(big / 2 - cx), round(big / 2 - cy)))
    mcanvas = Image.new('L', (big, big))
    mcanvas.paste(Image.fromarray((covered * 255).astype(np.uint8)), (round(big / 2 - cx), round(big / 2 - cy)))
    rot = np.asarray(canvas.rotate(math.degrees(ang), Image.BILINEAR, center=(big / 2, big / 2)), np.float32) / 255
    mrot = np.asarray(mcanvas.rotate(math.degrees(ang), Image.NEAREST, center=(big / 2, big / 2))) > 127
    cc = big / 2
    row = rot[int(cc) - 6:int(cc) + 7].mean(axis=(0, 2))
    prof_x = np.abs(np.arange(big) - cc)
    xb = np.clip((prof_x / cc * 200).astype(int), 0, 199)
    pm = np.bincount(xb, row, 200) / np.maximum(1, np.bincount(xb, None, 200))
    inner = pm[2:20].max()
    edge_bin = next((i for i in range(20, 200) if pm[i] < inner * 0.02), 180)
    r_edge = (edge_bin + 0.5) / 200 * cc
    print(f'  disk edge at {r_edge:.0f} px along the major axis')

    X, Y = out_grid()
    xs = X / R_EDGE_PX * r_edge + cc
    ys = Y / R_EDGE_PX * r_edge * CI + cc
    sq, _ = bilinear(rot, xs, ys)
    xi = np.clip(np.round(xs).astype(int), 0, big - 1)
    def _cov(dy): return mrot[np.clip(np.round(ys + dy).astype(int), 0, big - 1), xi]
    sqm = _cov(-8) & _cov(0) & _cov(8)
    base = box_blur(sq, 3, 2)
    sq = np.minimum(sq, base * 3.0 + 0.02)
    sqm = box_blur(sqm.astype(np.float32), 4, 2) > 0.85
    filled, sqm = fill_and_bulge(sq, sqm, 205)
    return edge_fade(filled), None, sqm


# ---------------------------------------------------------------- wide field
# Each wide-field picture goes through the same four steps: sky and foreground
# stars off, centre and position angle from moments, the canvas turned so the
# major axis is horizontal, and — for the optical only — the bulge subtracted
# right there in the sky plane, where it is a round-ish blob, rather than after
# the deprojection, where the 1/cos(77°) stretch would have drawn it as a column
# the height of the disk. It is added back round in the face-on frame.

def load_sky(path, kind):
    """-> dict(rot: RGB canvas, lrot: band luminance canvas, cc, r_edge,
               bulge: (profile in sky px along the major axis) or None)."""
    img = Image.open(path).convert('RGB')
    if max(img.size) > 2400:
        s = 2400 / max(img.size)
        img = img.resize((round(img.width * s), round(img.height * s)), Image.LANCZOS)
    a = np.asarray(img, np.float32) / 255
    w = {'optical': (1 / 3, 1 / 3, 1 / 3), 'uv': (0.2, 0.3, 0.5), 'ir': (0.6, 0.4, 0.0)}[kind]
    lum = a[..., 0] * w[0] + a[..., 1] * w[1] + a[..., 2] * w[2]
    m = max(8, min(img.size) // 20)
    border = np.concatenate([lum[:m].ravel(), lum[-m:].ravel(), lum[:, :m].ravel(), lum[:, -m:].ravel()])
    sky = float(np.quantile(border, 0.5))
    lum = np.clip(lum - sky, 0, None)
    a = np.clip(a - sky, 0, None)
    k = max(2, img.width // 400)
    yy, xx = np.mgrid[0:lum.shape[0], 0:lum.shape[1]]
    _b = box_blur(lum, 4 * k, 2); _w = np.where(_b > 0.15 * _b.max(), _b, 0)
    ncx = float((_w * xx).sum() / _w.sum()); ncy = float((_w * yy).sum() / _w.sum())   # the galaxy's centroid
    n_spots = 0; m32_xy = None
    # Compact BLOBS first, while their whole profile is still there: M32 above all,
    # which sits almost on the minor axis and would be stretched into a streak the
    # height of the disk. The simulation draws the companions itself. Only the
    # optical shows them; in the other bands the pass would eat the ring's knots.
    if kind == 'optical':
        wide = box_blur(lum, 20 * k, 2)
        dc = np.hypot(xx - ncx, yy - ncy)
        us2 = np.where((dc > 0.07 * img.width) & (dc < 0.35 * img.width), lum - wide, 0)
        floor2 = 0.10 * float(np.quantile(wide, 0.999))
        for _ in range(6):
            iy, ix = np.unravel_index(np.argmax(us2), us2.shape)
            if us2[iy, ix] < floor2: break
            disc = np.hypot(xx - ix, yy - iy) <= 14 * k
            lum = np.where(disc, wide, lum)
            a = np.where(disc[..., None], box_blur(a, 20 * k, 2), a)
            us2[max(0, iy - 24 * k):iy + 24 * k + 1, max(0, ix - 24 * k):ix + 24 * k + 1] = 0
            n_spots += 1
            print(f'         blotted a compact blob at ({ix},{iy}), {dc[iy, ix]:.0f} px from the centre')
    # M32 itself: projected against the bright inner disk, it never wins the blob
    # contest against stars on dark sky, so it is taken by name — the brightest
    # smoothed spot in an annulus round the nucleus that is not the nucleus.
    if kind == 'optical':
        # compact is the test — the bulge's wing along the major axis is brighter
        # than M32 but smooth, and an unsharp mask at M32's own size leaves it out
        u8 = box_blur(lum - box_blur(lum, 8 * k, 2), k, 1)
        dc = np.hypot(xx - ncx, yy - ncy)
        cand = np.where((dc > 0.09 * img.width) & (dc < 0.25 * img.width), u8, 0)
        iy, ix = np.unravel_index(np.argmax(cand), cand.shape)
        disc = np.hypot(xx - ix, yy - iy) <= 10 * k
        wide2 = box_blur(lum, 20 * k, 2)
        lum = np.where(disc, wide2, lum)
        a = np.where(disc[..., None], box_blur(a, 20 * k, 2), a)
        n_spots += 1
        m32_xy = (int(ix), int(iy))
        print(f'         blotted M32 at ({ix},{iy}), {dc[iy, ix]:.0f} px from the centre')
    # Then the brightest compact PEAKS, one at a time, never a threshold over the
    # whole frame: a threshold low enough to catch faint stars also catches the
    # arms' own knots, and blotting those is blotting the galaxy.
    smooth = box_blur(lum, 3 * k, 2)
    unsharp = lum - smooth
    us = np.where(np.hypot(xx - ncx, yy - ncy) > 0.04 * img.width, unsharp, 0)
    floor = 0.10 * float(np.quantile(smooth, 0.999))
    spots = np.zeros(lum.shape, bool)
    for _ in range(80):
        iy, ix = np.unravel_index(np.argmax(us), us.shape)
        if us[iy, ix] < floor: break
        spots |= np.hypot(xx - ix, yy - iy) <= 2.5 * k
        n_spots += 1
        us[max(0, iy - 6 * k):iy + 6 * k + 1, max(0, ix - 6 * k):ix + 6 * k + 1] = 0
    lum = np.where(spots, smooth, lum)
    a = np.where(spots[..., None], box_blur(a, 3 * k, 2), a)
    # Centre and orientation from second moments, iterated: each pass keeps only
    # what lies inside the previous ellipse, so a companion or — in the far-IR —
    # the Milky Way's own foreground cirrus does not lean on the answer. The
    # far-IR picture is full of that cirrus, hence its much higher threshold.
    b = box_blur(lum, 2 * k, 2)
    thr = {'optical': 0.06, 'uv': 0.06, 'ir': 0.20}[kind] * float(np.quantile(b, 0.999))
    sel = b > thr
    for it in range(3):
        wgt = np.where(sel, b - thr, 0)
        tot = wgt.sum()
        cx = float((wgt * xx).sum() / tot); cy = float((wgt * yy).sum() / tot)
        dx = xx - cx; dy = yy - cy
        sxx = (wgt * dx * dx).sum() / tot; syy = (wgt * dy * dy).sum() / tot; sxy = (wgt * dx * dy).sum() / tot
        ang = 0.5 * math.atan2(2 * sxy, sxx - syy)
        ca, sa = math.cos(ang), math.sin(ang)
        u = dx * ca + dy * sa; v = -dx * sa + dy * ca
        su = math.sqrt(max(1e-6, (wgt * u * u).sum() / tot)); sv = math.sqrt(max(1e-6, (wgt * v * v).sum() / tot))
        gate = 2.6 if it == 0 else 2.2
        sel = (b > thr) & ((u / (gate * su)) ** 2 + (v / (gate * sv)) ** 2 < 1)
    print(f'  {kind}: {img.width}x{img.height}, sky {sky:.3f}, {n_spots} compact sources blotted, '
          f'centre ({cx:.0f},{cy:.0f}), major axis {math.degrees(ang):+.1f} deg, axis ratio {sv / su:.2f}')
    big = max(img.size) * 2
    cv = Image.new('RGB', (big, big))
    cv.paste(Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8)), (round(big / 2 - cx), round(big / 2 - cy)))
    lv = Image.new('F', (big, big))
    lv.paste(Image.fromarray(lum.astype(np.float32), 'F'), (round(big / 2 - cx), round(big / 2 - cy)))
    rot = np.asarray(cv.rotate(math.degrees(ang), Image.BILINEAR, center=(big / 2, big / 2)), np.float32) / 255
    lrot = np.asarray(lv.rotate(math.degrees(ang), Image.BILINEAR, center=(big / 2, big / 2)), np.float32)
    cc = big / 2
    # provisional scale: where the major-axis profile falls to 8% of its peak
    row = lrot[int(cc) - 4:int(cc) + 5].mean(axis=0)
    prof_x = np.abs(np.arange(big) - cc)
    xb = np.clip((prof_x / cc * 200).astype(int), 0, 199)
    pm = np.bincount(xb, row, 200) / np.maximum(1, np.bincount(xb, None, 200))
    pk = pm[1:60].max()
    edge_bin = next((i for i in range(6, 200) if pm[i] < pk * 0.08), 160)
    r_edge = (edge_bin + 0.5) / 200 * cc
    print(f'         provisional disk radius {r_edge:.0f} canvas px')

    bulge = None
    if kind == 'optical':
        # The bulge, separated from the disk by a photometric decomposition along the
        # major axis (where the sky is unstretched): a Sersic bulge plus an exponential
        # disk, shape by grid search, amplitudes by least squares, per channel. Only
        # the BULGE component is subtracted on the sky — as an ellipse with the core's
        # own axis ratio — so the disk is never touched, along the minor axis least of
        # all, and the same component is added back round in the face-on frame.
        Xs = np.arange(big, dtype=np.float32)[None, :] - cc
        Ys = np.arange(big, dtype=np.float32)[:, None] - cc
        inner = (lrot > 0.60 * lrot.max()) & (np.hypot(Xs, Ys) < 0.3 * r_edge)
        wq = np.where(inner, lrot, 0); tq = wq.sum()
        q = float(np.clip(math.sqrt((wq * Ys * Ys).sum() / tq) / math.sqrt((wq * Xs * Xs).sum() / tq), 0.55, 0.95))
        xmax = int(0.6 * r_edge)
        xs_ = np.arange(1, xmax, dtype=np.float32)
        rows = rot[int(cc) - 2:int(cc) + 3]
        profc = np.stack([(rows[:, int(cc) + i].mean(axis=0) + rows[:, int(cc) - i].mean(axis=0)) / 2
                          for i in range(1, xmax)])                     # (xmax-1, 3)
        profl = profc.mean(axis=1)
        best = None
        # constrained to a bulge: Sersic n >= 1.5 and r_e within 2-9% of the disk radius
        # (M31's is ~1 kpc, 5%); unconstrained, the fit degenerates into two exponentials
        for n_ in (1.5, 2.0, 3.0, 4.0):
            for re_ in np.linspace(0.02, 0.09, 8) * r_edge:
                fb = np.exp(-(xs_ / re_) ** (1 / n_))
                for h_ in np.linspace(0.15, 0.8, 8) * r_edge:
                    fd = np.exp(-xs_ / h_)
                    A = np.stack([fb, fd], 1)
                    coef, *_ = np.linalg.lstsq(A, profl, rcond=None)
                    if coef.min() < 0: continue
                    res = float(((A @ coef - profl) ** 2).sum())
                    if best is None or res < best[0]: best = (res, n_, re_, h_, fb, fd)
        _, n_, re_, h_, fb, fd = best
        A = np.stack([fb, fd], 1)
        Bc = np.stack([np.clip(np.linalg.lstsq(A, profc[:, ch], rcond=None)[0], 0, None) for ch in range(3)])  # (3,2)
        r_e = np.sqrt(Xs * Xs + (Ys / q) ** 2)
        shape = np.exp(-(r_e / re_) ** (1 / n_))
        model = shape[..., None] * Bc[:, 0][None, None, :]
        model = np.minimum(model, 0.9 * rot)         # never the last of the light
        rot = np.clip(rot - model, 0, None)
        lrot = np.clip(lrot - model.mean(axis=2), 0, None)
        bulge = dict(B=Bc[:, 0], re=float(re_), n=float(n_))
        print(f'         bulge/disk fit on the sky: Sersic n={n_:.1f}, r_e={re_:.0f} px, axis ratio {q:.2f}; '
              f'disk h={h_:.0f} px; bulge/disk at centre {Bc[:, 0].mean() / max(1e-6, Bc[:, 1].mean()):.1f}')
    m32 = None
    if m32_xy is not None:   # into the rotated canvas frame, relative to its centre
        dx, dy = m32_xy[0] - cx, m32_xy[1] - cy
        ca, sa = math.cos(ang), math.sin(ang)
        m32 = (dx * ca + dy * sa, -dx * sa + dy * ca)
    return dict(rot=rot, lrot=lrot, cc=cc, r_edge=r_edge, bulge=bulge, m32=m32)


def deproject(rot, cc, r_edge, s, theta, flip):
    """Sample the face-on map grid from a sky canvas whose major axis is horizontal.
    s scales the provisional disk radius, theta turns the face-on plane, flip
    mirrors it (which side of the minor axis is the near side is not something
    a flat picture can tell; the reference decides)."""
    X, Y = out_grid()
    if flip: Y = -Y
    ct, st = math.cos(theta), math.sin(theta)
    u = X * ct - Y * st; v = X * st + Y * ct
    k = r_edge * s / R_EDGE_PX
    return bilinear(rot, u * k + cc, v * k * CI + cc)


def signature(lum):
    """What registration compares: log-stretched, high-passed, so rings and arms
    count and the smooth disk does not."""
    f = box_blur(np.log1p(40 * np.clip(lum, 0, None)), 3, 2)   # texture and speckle off first
    return f - box_blur(f, 14, 2)


def ncc(a, b, m):
    a = a[m]; b = b[m]
    a = a - a.mean(); b = b - b.mean()
    d = math.sqrt(float((a * a).sum() * (b * b).sum()))
    return float((a * b).sum() / d) if d > 0 else -1.0


def ring_radius(lum, mask, lo=0.40, hi=0.75):   # the reference; layers use lo=0.2, hi=0.85
    """Radius of the strongest ring in a face-on image: the peak of the
    high-passed azimuthal profile between lo and hi of the disk radius."""
    X, Y = out_grid()
    r = np.hypot(X, Y) / R_EDGE_PX
    m = mask & (r > 0.12) & (r < 0.98)
    bins = np.clip((r[m] * 100).astype(int), 0, 99)
    prof = np.bincount(bins, lum[m], 100) / np.maximum(1, np.bincount(bins, None, 100))
    ok = np.bincount(bins, None, 100) > 20
    idx = np.arange(100)
    prof = np.interp(idx, idx[ok], prof[ok]) if ok.sum() > 5 else prof
    hp = prof - np.convolve(np.pad(prof, 12, 'edge'), np.ones(25) / 25, 'valid')
    win = (idx >= lo * 100) & (idx <= hi * 100)
    i = int(idx[win][np.argmax(hp[win])])
    return (i + 0.5) / 100 * R_EDGE_PX


def ring_azimuth(lum, mask, nb=36):
    """Brightness of the ring band (0.45-0.72 R) around its circumference, radially
    high-passed: the one low-order fingerprint every band shares — M31's ring is
    much brighter on one side — and the honest way to tell the two ends apart."""
    X, Y = out_grid()
    r = np.hypot(X, Y) / R_EDGE_PX
    m = mask & (r > 0.45) & (r < 0.72)
    w = np.clip(signature(lum), 0, None)[m]
    phi = np.arctan2(Y, X)[m]
    b = np.clip(((phi + math.pi) / (2 * math.pi) * nb).astype(int), 0, nb - 1)
    prof = np.bincount(b, w, nb) / np.maximum(1, np.bincount(b, None, nb))
    return prof - prof.mean()


def azimuth_vote(sky, ref_prof, ref_mask):
    """end_vote for register(): how well the layer's ring fingerprint matches the
    reference's at this angle, minus how well it would half a turn away."""
    X, Y = out_grid()
    inside = np.hypot(X, Y) < R_EDGE_PX * 0.98
    def vote(s_, th_):
        v_, ok_ = deproject(sky['lrot'], sky['cc'], sky['r_edge'], s_, th_, False)
        pr = ring_azimuth(np.clip(v_, 0, None), ok_ & inside & ref_mask)
        c = lambda a, b: float((a * b).sum() / max(1e-9, math.sqrt((a * a).sum() * (b * b).sum())))
        return c(pr, ref_prof) - c(np.roll(pr, len(pr) // 2), ref_prof)
    return vote


def register(sky, ref_lum, ref_mask, label, ref_ring=None, anti_lum=None, end_vote=None):
    """Lay a sky image onto a reference already in the map frame.
    Scale comes from the ring — the 10-kpc ring is the one feature every band
    shares — and only the angle (near 0 or 180: the major axis is already
    horizontal, the two ends are what moments cannot tell apart) and the
    mirror are settled by correlation. A last small scale search tidies up."""
    X, Y = out_grid()
    inside = np.hypot(X, Y) < R_EDGE_PX * 0.98
    if ref_ring is None:
        ref_ring = ring_radius(ref_lum, ref_mask)
    v1, ok1 = deproject(sky['lrot'], sky['cc'], sky['r_edge'], 1.0, 0.0, False)
    own_ring = ring_radius(v1, ok1 & inside, 0.20, 0.85)
    s0 = float(np.clip(own_ring / ref_ring, 0.4, 2.5))
    ref_sig = signature(ref_lum)
    anti_sig = signature(anti_lum) if anti_lum is not None else None
    def parts(s, th):
        v, ok = deproject(sky['lrot'], sky['cc'], sky['r_edge'], s, th, False)
        m = ref_mask & inside & ok
        if m.sum() < 2000: return -1.0, 0.0
        sg = signature(v)
        return ncc(sg, ref_sig, m), (ncc(sg, anti_sig, m) if anti_sig is not None else 0.0)
    # No mirror: these are photographs of the same sky, and a photograph is not a
    # mirror image of another. What a picture cannot tell is which END of the major
    # axis is which — 0 or 180. The angle within each end comes from the reference
    # alone; the end is chosen by the reference plus, where given, an anti-reference
    # (dust emission is bright exactly where the optical is dark), because a ring
    # system is nearly symmetric and needs every independent vote it can get.
    per_base = {}
    for base in (0.0, math.pi):
        bb = (-2, base, 0.0)
        for th in base + np.radians(np.arange(-12, 12.1, 2)):
            c, a = parts(s0, th)
            if c > bb[0]: bb = (c, th, a)
        per_base[base] = bb
    verdict = {b: v[0] - 0.8 * v[2] for b, v in per_base.items()}
    if end_vote is not None:
        # an anchor outranks the correlation: end_vote(s, theta) -> a signed score
        verdict = {b: end_vote(s0, v[1]) for b, v in per_base.items()}
    base = max(verdict, key=verdict.get)
    c0, th0, _ = per_base[base]
    best = (c0, s0, th0)
    for s in s0 * np.arange(0.92, 1.081, 0.01):
        for th in th0 + np.radians(np.arange(-2, 2.1, 0.5)):
            c, _ = parts(s, th)
            if c > best[0]: best = (c, s, th)
    c, s, th = best
    other = min(verdict.values()); chosen = verdict[base]
    print(f'  {label}: ring {own_ring:.0f} -> {ref_ring:.0f} px so scale x{s:.2f} (ring alone x{s0:.2f}); '
          f'rotation {math.degrees(th):.1f} deg; ncc {c:.3f}; end chosen {chosen:.3f} vs {other:.3f}')
    return s, th, False


def debug_panel(path, panels):
    """Side-by-side greyscale tiles of every registered layer, to check alignment
    by eye: the rings must sit on top of each other across all of them."""
    tiles = []
    for name, v in panels:
        v = np.asarray(v, np.float32)
        if v.ndim == 3: v = v.mean(axis=2)
        v = np.clip(v / max(1e-6, float(np.quantile(v, 0.995))), 0, 1) ** 0.6
        t = (v * 255).astype(np.uint8)
        t[0:2, :] = 255; t[:, 0:2] = 255
        tiles.append(t)
    Image.fromarray(np.concatenate(tiles, axis=1)).save(path)
    print(f'  debug panel: {path} [{", ".join(n for n, _ in panels)}]')


def wide_field_map(phat, phat_mask, extra_optical=None, debug_dir=None):
    """Compose the wide-field layers (and the panorama where it has coverage)."""
    srcs = {}
    for kind, meta in WIDE.items():
        p = Path(extra_optical) if (kind == 'optical' and extra_optical) else HERE / meta['file']
        if not p.exists():
            print(f'  {kind}: {p.name} missing, skipped'); continue
        srcs[kind] = load_sky(p, kind)
    if 'optical' not in srcs:
        raise SystemExit('the wide-field optical image is required (tools/m31-wide-optical.jpg or --extra)')
    X, Y = out_grid()
    r = np.hypot(X, Y)
    inside = r < R_EDGE_PX * 0.98

    # 1. the optical, registered to the panorama where there is one; otherwise it
    #    defines the frame itself (arms trailing is settled at the very end)
    o = srcs['optical']
    def map_xy(sky_uv, s, th):
        # inverse of deproject(): a point on the rotated sky canvas -> map px
        kk = o['r_edge'] * s / R_EDGE_PX
        a_, b_ = sky_uv[0] / kk, sky_uv[1] / (kk * CI)
        ct, st = math.cos(th), math.sin(th)
        return a_ * ct + b_ * st, -a_ * st + b_ * ct
    m32_vote = None
    if o.get('m32') is not None:
        # The simulation draws M32 at M32_C = (-150, -80, 530) in the disk frame:
        # above the nucleus in map rows (Z > 0 is up, v < c0). The panorama frame was
        # laid out to match, so the end that puts M32 above is the right one — an
        # anchor a photograph actually contains, unlike a ring's near-symmetry.
        m32_vote = lambda s, th: -map_xy(o['m32'], s, th)[1]
    if phat is not None:
        ref = box_blur(phat.mean(axis=2), 2, 2)     # resolved stars: speckle, smoothed first
        s, th, fl = register(o, ref, phat_mask, 'optical -> PHAT', end_vote=m32_vote)
        if m32_vote is not None:
            mx, my = map_xy(o['m32'], s, th)
            print(f'  M32 lands at map ({mx:+.0f},{my:+.0f}) px; the simulation puts it above-left, at about (-13,-45)')
    else:
        s, th, fl = 1.0, 0.0, False
        print('  optical: no panorama, defines the frame')
    opt, ok = deproject(o['rot'], o['cc'], o['r_edge'], s, th, fl)
    base = box_blur(opt, 3, 2)
    opt = np.minimum(opt, base * 3.0 + 0.02)      # compact glare cap, as for the panorama
    # the fitted bulge back, round, in the face-on frame: map px -> sky px is k
    k = o['r_edge'] * s / R_EDGE_PX
    bg = o['bulge']
    opt = opt + np.exp(-(r * k / bg['re']) ** (1 / bg['n']))[..., None] * bg['B'][None, None, :]
    # what the fit did not catch of the stretched bulge still runs up the minor axis:
    # the panorama's cigar treatment on top, modest (rb 11 px ~ 1.2 kpc), textured fill
    opt, _ = fill_and_bulge(opt, ok & inside, 331, rb=11.0)
    opt = np.where(inside[..., None], opt, 0)
    opt_lum = opt.mean(axis=2)
    ring_opt = ring_radius(opt_lum, inside)

    # 2. the UV against the optical (young stars sit on the blue arms), then the
    #    far-IR against the UV (dust rings and star-forming rings are the same rings)
    layers = {}
    ref_lum, ref_lbl = opt_lum, 'optical'
    for kind in ('uv', 'ir'):
        if kind not in srcs: continue
        ring_zone = inside & (r > 0.22 * R_EDGE_PX)     # the rings, not the bulge, decide
        # the UV's end from the ring's fingerprint; the IR's from its correlation with
        # the UV alone — its fingerprint vote came out flat, its correlation has not
        vote = azimuth_vote(srcs[kind], ring_azimuth(ref_lum, inside), inside) if kind == 'uv' else None
        s2, th2, fl2 = register(srcs[kind], ref_lum, ring_zone, f'{kind} -> {ref_lbl}', ref_ring=ring_opt, end_vote=vote)
        v, ok2 = deproject(srcs[kind]['lrot'], srcs[kind]['cc'], srcs[kind]['r_edge'], s2, th2, fl2)
        v = np.clip(v, 0, None)
        v /= max(1e-6, float(np.quantile(v[inside], 0.995)))
        layers[kind] = np.clip(v, 0, 1) * inside
        if kind == 'uv':
            ref_lum, ref_lbl = layers['uv'], 'UV'

    # 3. the panorama where it has coverage, gain-matched to the optical per radius
    #    and channel so the seam is a change of texture, not of brightness or hue
    out = opt.copy()
    if phat is not None:
        # a mosaic tile that carries no light is coverage on paper only: blended in,
        # it is a dark box over the optical. Keep the mask to where the panorama has
        # something to say.
        pl = phat.mean(axis=2)
        lit = pl > 0.25 * float(np.median(pl[phat_mask & inside]))
        phat_mask = box_blur((phat_mask & lit).astype(np.float32), 3, 2) > 0.7
        rbin = np.clip((r / R_EDGE_PX * 60).astype(int), 0, 60)
        g = np.ones((61, 3), np.float32)
        m = phat_mask & inside
        for ch in range(3):
            so = np.bincount(rbin[m], opt[..., ch][m], minlength=61)
            sp = np.bincount(rbin[m], phat[..., ch][m], minlength=61)
            cnt = np.bincount(rbin[m], minlength=61)
            ratio = np.where(cnt > 30, so / np.maximum(sp, 1e-6), np.nan)
            idx = np.arange(61); okr = ~np.isnan(ratio)
            ratio = np.interp(idx, idx[okr], ratio[okr]) if okr.sum() > 2 else np.ones(61)
            ratio = np.convolve(np.pad(ratio, 2, 'edge'), np.ones(5) / 5, 'valid')
            g[:, ch] = np.clip(ratio, 0.4, 2.5)
        soft = box_blur(phat_mask.astype(np.float32), 5, 3)[..., None]
        out = soft * (phat * g[rbin]) + (1 - soft) * opt
        print(f'  panorama blended in over {int(phat_mask.sum())} px, gain {g.mean(axis=0).round(2).tolist()}')
        inner_w = 1 - 0.6 * soft[..., 0]             # the photo carries its own lanes and blue
    else:
        inner_w = np.ones((N, N), np.float32)

    # 4. dust: far-IR emission becomes darkening, the ridges of the rings most
    if 'ir' in layers:
        d = box_blur(layers['ir'], 2, 2)          # the 4.4x stretch leaves striations
        ridge = np.clip(d - 0.55 * box_blur(d, 8, 2), 0, None)
        ridge /= max(1e-6, float(np.quantile(ridge[inside], 0.995)))
        dust = np.clip(0.55 * d + 0.9 * ridge, 0, 1)
        # inside the bulge zone the stretched inner dust is not to be trusted, and
        # the bulge sits in front of and behind it anyway: taper the darkening in
        taper = np.clip((r / R_EDGE_PX - 0.12) / 0.16, 0, 1)
        out *= (1 - 0.55 * dust * inner_w * taper)[..., None]
    # 5. HII and young stars: UV becomes blue excess, which the sampler reads
    if 'uv' in layers:
        u = layers['uv'] * inner_w
        out[..., 0] *= 1 - 0.28 * u
        out[..., 1] *= 1 - 0.08 * u
        out[..., 2] *= 1 + 0.32 * u
    out = edge_fade(np.clip(out, 0, None))
    if debug_dir:
        panels = [('optical', opt_lum)] + [(kk, layers[kk]) for kk in ('uv', 'ir') if kk in layers]
        if phat is not None: panels.append(('phat(masked)', phat.mean(axis=2) * phat_mask))
        panels.append(('final', out))
        debug_panel(str(Path(debug_dir) / 'm31-layers.png'), panels)
    return out, {kk: WIDE[kk] | {'registered': True} for kk in srcs}


# ---------------------------------------------------------------- main
def main(argv):
    # A map finished by hand outranks anything this script can compose: the v2.56
    # composite was completed face-on by the owner and an AI (tools/m31-map-hand.jpg),
    # and m31-map.json says so. The data workflow runs this script on every push that
    # touches it, so without this guard it would quietly put the seam back.
    if OUT_META.exists() and '--force' not in argv:
        try:
            src = json.loads(OUT_META.read_text()).get('source', '')
        except Exception:
            src = ''
        if str(src).startswith('hand-finished'):
            print(f'{OUT_MAP.name} is hand-finished ({OUT_META.name}: source = "{src[:40]}..."); '
                  'leaving it alone. Pass --force to rebuild it from the pictures anyway.')
            return 0
    analytic = '--analytic' in argv
    phat_only = '--phat-only' in argv
    no_phat = '--no-phat' in argv
    extra = argv[argv.index('--extra') + 1] if '--extra' in argv else None
    debug_dir = argv[argv.index('--debug') + 1] if '--debug' in argv else None
    meta = {'inclination_deg': INCL_DEG, 'r_edge_px': R_EDGE_PX, 'r25_kpc': R25_KPC}
    if analytic:
        img, note = analytic_map(); meta.update(source='analytic', note=note)
    else:
        phat = mask = None; source = 'none'
        if not no_phat:
            data, source = fetch_source()
            if data is None and phat_only:
                print('ERROR: no source image could be downloaded.', file=sys.stderr)
                return 1
            if data is not None:
                phat, _, mask = photographic_map(data)
        if phat_only:
            img = phat
            meta.update(source=source, note=None, credit=CREDIT, license='CC BY 4.0 (ESA/Hubble)')
        else:
            print('wide-field layers:')
            img, used = wide_field_map(phat, mask, extra, debug_dir)
            if extra: used['optical'] = dict(file=str(extra), credit='local file, not committed',
                                             license='unknown', what=WIDE['optical']['what'])
            meta.update(source='composite', panorama={'source': source, 'credit': CREDIT,
                                                        'license': 'CC BY 4.0 (ESA/Hubble)'} if phat is not None else None,
                        wide_field=used)

    # the arms must trail under the simulation's positive spin. The Milky Way
    # map's known-good orientation defines the target sign; flip if opposed.
    target = -1
    gm = OUT_DIR / 'galaxy-map.webp'
    if gm.exists():
        target = spiral_winding(np.asarray(Image.open(gm).convert('RGB'), np.float32).mean(axis=2) / 255)
        print(f'winding calibration from galaxy-map.webp: {target:+d}')
    got = spiral_winding(img.mean(axis=2))
    if got != target:
        img = img[::-1, :, :].copy()
        print(f'winding {got:+d} vs target {target:+d}: flipped vertically so the arms trail')
    else:
        print(f'winding {got:+d} matches the Milky Way map: arms will trail')

    peak = np.quantile(img, 0.998)
    img = np.clip(img / max(peak, 1e-6), 0, 1) ** 0.92
    Image.fromarray((img * 255).astype(np.uint8)).save(OUT_MAP, 'WEBP', quality=82, method=6)
    meta['built_utc'] = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
    OUT_META.write_text(json.dumps(meta, indent=2) + '\n')
    print(f'wrote {OUT_MAP.name} ({OUT_MAP.stat().st_size} bytes) and {OUT_META.name}')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
