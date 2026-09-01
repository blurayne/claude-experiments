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
    corners = np.concatenate([lum[:40, :40].ravel(), lum[:40, -40:].ravel(),
                              lum[-40:, :40].ravel(), lum[-40:, -40:].ravel()])
    sky = float(np.median(corners))
    print(f'source {img.width}x{img.height}, sky level {sky:.4f}')
    covered = lum > sky + 0.008
    lum = np.clip(lum - sky, 0, None)

    cx, cy = find_nucleus(lum)
    ang = major_axis_angle(lum, cx, cy)
    print(f'nucleus at ({cx:.0f},{cy:.0f}), major axis {math.degrees(ang):+.2f} deg from horizontal')

    big = max(img.width, img.height) * 2
    canvas = Image.new('RGB', (big, big))
    canvas.paste(Image.fromarray((a * 255).astype(np.uint8)),
                 (round(big / 2 - cx), round(big / 2 - cy)))
    mcanvas = Image.new('L', (big, big))
    mcanvas.paste(Image.fromarray((covered * 255).astype(np.uint8)),
                  (round(big / 2 - cx), round(big / 2 - cy)))
    rot = np.asarray(canvas.rotate(math.degrees(ang), Image.BILINEAR,
                                   center=(big / 2, big / 2)), np.float32) / 255
    mrot = np.asarray(mcanvas.rotate(math.degrees(ang), Image.NEAREST,
                                     center=(big / 2, big / 2))) > 127
    cc = big / 2

    # disk extent along the (now horizontal) major axis, on the sky image
    row = rot[int(cc) - 6:int(cc) + 7].mean(axis=(0, 2))
    prof_x = np.abs(np.arange(big) - cc)
    xb = np.clip((prof_x / cc * 200).astype(int), 0, 199)
    pm = np.bincount(xb, row, 200) / np.maximum(1, np.bincount(xb, None, 200))
    inner = pm[2:20].max()
    edge_bin = next((i for i in range(20, 200) if pm[i] < inner * 0.02), 180)
    r_edge = (edge_bin + 0.5) / 200 * cc
    print(f'disk edge at {r_edge:.0f} px along the major axis')

    # Deproject with the uniform 1/cos(i) stretch. That is correct for the thin
    # disk and wrong for the spheroidal bulge (it becomes a vertical cigar), and
    # at 77 degrees no smooth radius-dependent remap can fix that monotonically.
    # So: deproject uniformly, declare the cigar zone unmeasured, let the
    # azimuthal fill paint the disk through it, and add a round synthetic bulge
    # coloured from the photo on top. The simulation already discloses that the
    # bulge's structure is modelled.
    ci = math.cos(math.radians(INCL_DEG))
    c0 = (N - 1) / 2
    jj, ii = np.mgrid[0:N, 0:N].astype(np.float32)
    X = (ii - c0) / R_EDGE_PX * r_edge          # disk-plane coords in source px
    Y = (jj - c0) / R_EDGE_PX * r_edge
    xs = np.clip(X + cc, 0, big - 2)
    ys = np.clip(Y * ci + cc, 0, big - 2)
    x0 = xs.astype(int); y0 = ys.astype(int)
    fx = xs - x0; fy = ys - y0
    sq = np.empty((N, N, 3), np.float32)
    for ch in range(3):
        v = rot[:, :, ch]
        sq[:, :, ch] = (v[y0, x0] * (1 - fx) * (1 - fy) + v[y0, x0 + 1] * fx * (1 - fy)
                      + v[y0 + 1, x0] * (1 - fx) * fy + v[y0 + 1, x0 + 1] * fx * fy)
    sqm = mrot[np.round(ys).astype(int), np.round(xs).astype(int)]

    # the photo's bulge colour and brightness, taken where it is unsmeared
    Xo = ii - c0; Yo = jj - c0                  # output px
    centre = np.hypot(Xo, Yo) < 7
    c_bulge = sq[centre].mean(axis=0)
    rb = 9.5                                    # ~1 kpc effective radius, output px
    cigar = (np.abs(Xo) < 3.4 * rb) & (np.abs(Yo) < 3.4 * rb / ci)
    sqm = sqm & ~cigar                          # unmeasured: filled azimuthally below

    # fill what the mosaic footprint does not cover from azimuthal averages
    r = np.hypot(ii - c0, jj - c0)
    rbin = np.clip((r / (N / 2) * 120).astype(int), 0, 119)
    rng = np.random.default_rng(205)
    filled = sq.copy()
    good = sqm & (r < N / 2)
    for ch in range(3):
        v = sq[:, :, ch]
        s = np.bincount(rbin[good], v[good], minlength=120)
        cnt = np.maximum(1, np.bincount(rbin[good], minlength=120))
        prof = s / cnt
        fill = prof[rbin] * (0.86 + 0.28 * rng.random((N, N)))
        filled[:, :, ch] = np.where(sqm, v, fill)
    soft = box_blur(sqm.astype(np.float32), 2, 2)
    seam = (soft > 0.02) & (soft < 0.98)
    for ch in range(3):
        b = box_blur(filled[:, :, ch], 2, 1)
        filled[:, :, ch] = np.where(seam, b, filled[:, :, ch])
    # the round bulge, Sersic-ish, carrying the photo's own central colour
    rb_r = np.hypot(Xo, Yo * 1.08)
    bulge = np.exp(-np.power(np.maximum(rb_r, 0.3) / rb, 0.55) + 1.0)
    filled += np.clip(bulge, 0, 1.35)[:, :, None] * c_bulge[None, None, :]
    fade = np.clip(1 - (r - N / 2 * 0.94) / (N * 0.05), 0, 1)
    filled *= fade[:, :, None]
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
