#!/usr/bin/env python3
"""Build m31-map.webp: a face-on probability map of the Andromeda galaxy.

The Milky Way in galactic-transit.html is generated from a photographic
probability map (galaxy-map.webp): stars are sampled from luminance, dust from
dark lanes, HII regions from colour excess. This script builds the same kind of
map for M31 so Andromeda can be drawn with the same machinery, from real data:

  source   heic2501a - the PHAT+PHAST Hubble panorama of M31 (Jan 2025), the
           largest photomosaic Hubble has ever produced: ~200 million resolved
           stars across 2.5 gigapixels, assembled from >600 pointings of the
           Panchromatic Hubble Andromeda Treasury (Dalcanton et al. 2012) and
           its southern extension PHAST (Chen et al. 2025).
  credit   NASA, ESA, B. F. Williams (Univ. of Washington), Z. Chen (Univ. of
           Washington), L. C. Johnson (Northwestern Univ.), the PHAT and PHAST
           teams. Licence CC BY 4.0 (ESA/Hubble).

M31 is inclined 77 degrees to our line of sight, so the panorama is a 4.4:1
strip; this script finds the nucleus and major axis, deprojects the disk to
face-on, fills the wedges the mosaic footprint does not cover from azimuthal
averages, orients the result so the arms trail under the simulation's positive
spin, and writes a 448x448 webp a few tens of kilobytes big.

Only the sky-plane positions are measured; the simulation models the third
dimension (disk thickness, bulge, halo) itself and says so in its info panel.

Run with --analytic to skip the download and build a structural model instead
(exponential disk + the 10 kpc and 5 kpc rings + bulge, after Gordon et al.
2006 / Lewis et al. 2015): the offline stand-in for local development, and the
loud fallback of last resort - the workflow fails rather than committing it.
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

SOURCES = [
    # modest publication JPEG first (~1 MB); the screen size is the fallback
    ('https://cdn.esahubble.org/archives/images/publicationjpg/heic2501a.jpg', 'publication'),
    ('https://cdn.esahubble.org/archives/images/screen/heic2501a.jpg', 'screen'),
]
CREDIT = ('NASA, ESA, B. F. Williams (Univ. of Washington), Z. Chen (Univ. of '
          'Washington), L. C. Johnson (Northwestern Univ.), the PHAT and PHAST teams')


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
            Image.open(io.BytesIO(data)).verify()   # is it actually an image?
            SRC_CACHE.write_bytes(data)
            print(f'downloaded {tag}: {url} ({len(data)} bytes)')
            return data, url
        except Exception as e:
            print(f'  {tag} failed: {e}')
    return None, None


def box_blur(a, k, passes=3):
    """Separable box blur, edge-clamped; k = half width."""
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
    x = xx - c; y = -(yy - c)                    # y up
    r = np.hypot(x, y) / R_EDGE_PX
    ann = (r > r_lo) & (r < r_hi)
    phi = np.arctan2(y, x)[ann]
    lr = np.log(r[ann])
    v = lum[ann]
    # subtract the azimuthal mean per radius ring so only arm structure remains
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


def analytic_map():
    """Structural model of M31: exponential disk, the star-forming rings, bulge."""
    print('building the analytic model (no imagery)')
    c = (N - 1) / 2
    yy, xx = np.mgrid[0:N, 0:N]
    x = (xx - c) / R_EDGE_PX * R25_KPC          # kpc, y up
    y = -(yy - c) / R_EDGE_PX * R25_KPC
    r = np.hypot(x, y)
    th = np.arctan2(y, x)
    rng = np.random.default_rng(31)
    disk = np.exp(-r / 5.5) * 0.55
    bulge = 2.1 * np.exp(-np.power(r / 1.9, 0.62))
    # the famous 10 kpc ring, the offset 5 kpc inner ring, the faint 15 kpc one
    ring10 = 0.95 * np.exp(-((r - 10.3) / 1.15) ** 2)
    r5 = np.hypot(x - 0.6, y + 0.4)
    ring5 = 0.34 * np.exp(-((r5 - 5.1) / 0.85) ** 2)
    ring15 = 0.26 * np.exp(-((r - 15.4) / 1.4) ** 2)
    arms = 1 + 0.35 * np.cos(2 * th - 2.4 * np.log(np.maximum(r, 0.5)) / math.tan(math.radians(25)))
    lum = disk + bulge + (ring10 * arms + ring5 + ring15)
    lum *= 1 + 0.22 * (rng.random((N, N)) - 0.5)
    lum *= r < R25_KPC * 1.05
    lum /= lum.max()
    # colour: warm bulge, neutral disk, blue rings (the Hubble palette codes
    # young stars and HII blue-white; the JS side reads blue excess as HII)
    warm = np.clip(bulge / (lum + 1e-6), 0, 1)
    blue = np.clip((ring10 * arms + ring15) / (lum + 1e-6), 0, 1)
    R = lum * (0.72 + 0.30 * warm - 0.16 * blue)
    G = lum * (0.78 + 0.16 * warm - 0.04 * blue)
    B = lum * (0.86 - 0.06 * warm + 0.22 * blue)
    # dust: dark lanes hugging the inner edge of the rings
    lane = 0.55 * np.exp(-((r - 9.3) / 0.75) ** 2) + 0.3 * np.exp(-((r5 - 4.4) / 0.6) ** 2)
    lane *= 0.7 + 0.3 * np.cos(2 * th + 0.8)
    dust = 1 - np.clip(lane, 0, 0.8) * 0.6
    img = np.stack([R * dust, G * dust, B * dust], -1)
    return np.clip(img, 0, 1), 'analytic structural model (Gordon et al. 2006 rings)'


def photographic_map(data):
    img = Image.open(io.BytesIO(data)).convert('RGB')
    if img.width > 6000:
        img = img.resize((6000, round(img.height * 6000 / img.width)), Image.LANCZOS)
    a = np.asarray(img, np.float32) / 255
    lum = a.mean(axis=2)
    # sky level from the frame corners, clipped off
    corners = np.concatenate([lum[:40, :40].ravel(), lum[:40, -40:].ravel(),
                              lum[-40:, :40].ravel(), lum[-40:, -40:].ravel()])
    sky = float(np.median(corners))
    print(f'source {img.width}x{img.height}, sky level {sky:.4f}')
    covered = lum > sky + 0.008          # the mosaic footprint (black outside)
    lum = np.clip(lum - sky, 0, None)

    cx, cy = find_nucleus(lum)
    ang = major_axis_angle(lum, cx, cy)
    print(f'nucleus at ({cx:.0f},{cy:.0f}), major axis {math.degrees(ang):+.2f} deg from horizontal')

    # centre the nucleus, then rotate the major axis onto the horizontal
    big = max(img.width, img.height) * 2
    canvas = Image.new('RGB', (big, big))
    canvas.paste(Image.fromarray((a * 255).astype(np.uint8)),
                 (round(big / 2 - cx), round(big / 2 - cy)))
    mcanvas = Image.new('L', (big, big))
    mcanvas.paste(Image.fromarray((covered * 255).astype(np.uint8)),
                  (round(big / 2 - cx), round(big / 2 - cy)))
    rot = canvas.rotate(math.degrees(ang), Image.BILINEAR, center=(big / 2, big / 2))
    mrot = mcanvas.rotate(math.degrees(ang), Image.NEAREST, center=(big / 2, big / 2))

    # deproject: stretch the minor axis by 1/cos(i)
    stretch = 1 / math.cos(math.radians(INCL_DEG))
    w, h = rot.size
    dep = rot.resize((w, round(h * stretch)), Image.BILINEAR)
    mdep = mrot.resize((w, round(h * stretch)), Image.NEAREST)
    da = np.asarray(dep, np.float32) / 255
    dm = np.asarray(mdep, np.float32) > 0.5
    ccx, ccy = w / 2, dep.height / 2

    # disk extent along the major axis: where the profile falls to ~2% of the
    # inner disk (nucleus spike excluded) - that is R25 for our purposes
    dl = da.mean(axis=2)
    prof_x = np.abs(np.arange(w) - ccx)
    xb = np.clip((prof_x / (w / 2) * 100).astype(int), 0, 99)
    row = dl[int(ccy) - 6:int(ccy) + 7].mean(axis=0)
    pm = np.bincount(xb, row, 100) / np.maximum(1, np.bincount(xb, None, 100))
    inner = pm[3:25].max()
    edge_bin = next((i for i in range(25, 100) if pm[i] < inner * 0.02), 92)
    r_edge = (edge_bin + 0.5) / 100 * (w / 2)
    print(f'disk edge at {r_edge:.0f} px along the major axis')

    # square crop about the nucleus and scale to the output grid
    half = r_edge * (N / 2) / R_EDGE_PX
    y0, y1 = int(ccy - half), int(ccy + half)
    x0, x1 = int(ccx - half), int(ccx + half)
    def crop(arr, fill=0.0):
        out = np.full((y1 - y0, x1 - x0) + arr.shape[2:], fill, arr.dtype)
        sy0, sy1 = max(0, y0), min(arr.shape[0], y1)
        sx0, sx1 = max(0, x0), min(arr.shape[1], x1)
        out[sy0 - y0:sy1 - y0, sx0 - x0:sx1 - x0] = arr[sy0:sy1, sx0:sx1]
        return out
    sq = crop(da); sqm = crop(dm.astype(np.float32)) > 0.5
    sq = np.asarray(Image.fromarray((sq * 255).astype(np.uint8)).resize((N, N), Image.LANCZOS), np.float32) / 255
    sqm = np.asarray(Image.fromarray((sqm * 255).astype(np.uint8)).resize((N, N), Image.NEAREST)) > 127

    # fill the footprint wedges from azimuthal averages, with a little noise so
    # the seams do not read as painted; it is disclosed as modelled fill anyway
    c = (N - 1) / 2
    yy, xx = np.mgrid[0:N, 0:N]
    r = np.hypot(xx - c, yy - c)
    rb = np.clip((r / (N / 2) * 120).astype(int), 0, 119)
    rng = np.random.default_rng(205)
    filled = sq.copy()
    for ch in range(3):
        v = sq[:, :, ch]
        good = sqm & (r < N / 2)
        s = np.bincount(rb[good], v[good], 120)
        cnt = np.maximum(1, np.bincount(rb[good], None, 120))
        prof = s / cnt
        fill = prof[rb] * (0.86 + 0.28 * rng.random((N, N)))
        filled[:, :, ch] = np.where(sqm, v, fill)
    # feather the seam
    soft = box_blur(sqm.astype(np.float32), 2, 2)
    seam = (soft > 0.02) & (soft < 0.98)
    for ch in range(3):
        b = box_blur(filled[:, :, ch], 2, 1)
        filled[:, :, ch] = np.where(seam, b, filled[:, :, ch])
    filled[r > N / 2 * 1.0] *= np.maximum(0, 1 - (r[r > N / 2] - N / 2) / 14)[:, None]
    return np.clip(filled, 0, 1), None


def main(argv):
    analytic = '--analytic' in argv
    src_note = None
    if analytic:
        img, src_note = analytic_map()
        source = 'analytic'
    else:
        data, source = fetch_source()
        if data is None:
            print('ERROR: no source image could be downloaded.', file=sys.stderr)
            print('Run with --analytic for the structural stand-in.', file=sys.stderr)
            return 1
        img, src_note = photographic_map(data)

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

    # gentle normalisation; the JS samplers do the rest
    peak = np.quantile(img, 0.998)
    img = np.clip(img / max(peak, 1e-6), 0, 1) ** 0.92
    Image.fromarray((img * 255).astype(np.uint8)).save(OUT_MAP, 'WEBP', quality=82, method=6)
    OUT_META.write_text(json.dumps({
        'source': source, 'note': src_note,
        'credit': CREDIT, 'license': 'CC BY 4.0 (ESA/Hubble)',
        'inclination_deg': INCL_DEG, 'r_edge_px': R_EDGE_PX, 'r25_kpc': R25_KPC,
        'built_utc': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
    }, indent=2) + '\n')
    print(f'wrote {OUT_MAP.name} ({OUT_MAP.stat().st_size} bytes) and {OUT_META.name}')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
