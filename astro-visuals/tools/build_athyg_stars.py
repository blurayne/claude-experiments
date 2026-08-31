#!/usr/bin/env python3
"""Build the real-sky binaries from the AT-HYG catalog (astronexus/ATHYG-Database).

    python3 tools/build_athyg_stars.py path/to/athyg_v32-1.csv.gz path/to/athyg_v32-2.csv.gz

Writes, next to this script's parent folder:
  stars-gaia.bin       the brightest 100,000 stars
  stars-gaia-deep.bin  the next 400,000, loaded lazily at hi-fi quality and above

Format 'GSK2', little-endian, 20 bytes per record after the 4-byte magic:
  x, y, z    float32   scene units (1 unit = 30 ly), Sun-relative, galactic frame with
                       l=90 (the direction the Sun orbits) on +x, north on +y, GC on -z
  r, g, b    uint8     display colour from the measured B-V index
  mag        uint8     apparent magnitude, -2..12 mapped to 0..255
  vx, vy, vz int8      heliocentric space velocity, km/s, clamped to +-127
  pad        uint8     zero

Velocities are Gaia DR3 proper motion + radial velocity where AT-HYG carries them
(~97%); stars without one stand still rather than being guessed at.

AT-HYG is CC BY-SA 4.0, David Nash / astronexus.com; the underlying astrometry is
ESA/Gaia/DPAC (Gaia DR3) and Hipparcos for stars Gaia saturates on.
"""

import csv
import gzip
import struct
import sys
from pathlib import Path

R = [(-0.05487556, -0.87343709, -0.48383502),
     ( 0.49410943, -0.44482963,  0.74698225),
     (-0.86766615, -0.19807637,  0.45598378)]   # equatorial -> galactic, J2000
PC2U = 3.2615638/30

N_BRIGHT, N_DEEP = 100000, 400000


def bv_rgb(bv):
    t = max(-0.4, min(2.0, bv))
    if t < 0.0:   r, g, b = 0.68+0.30*(t+0.4)/0.4, 0.76+0.22*(t+0.4)/0.4, 1.00
    elif t < 0.4: r, g, b = 0.98+0.02*t/0.4, 0.98+0.02*t/0.4, 1.00
    elif t < 0.8: r, g, b = 1.00, 1.00-0.10*(t-0.4)/0.4, 1.00-0.30*(t-0.4)/0.4
    elif t < 1.4: r, g, b = 1.00, 0.90-0.28*(t-0.8)/0.6, 0.70-0.42*(t-0.8)/0.6
    else:         r, g, b = 1.00, 0.62-0.20*(t-1.4)/0.6, 0.28-0.16*(t-1.4)/0.6
    return (min(1, max(0, r)), min(1, max(0, g)), min(1, max(0, b)))


def to_scene(x0, y0, z0):
    Xg = R[0][0]*x0 + R[0][1]*y0 + R[0][2]*z0
    Yg = R[1][0]*x0 + R[1][1]*y0 + R[1][2]*z0
    Zg = R[2][0]*x0 + R[2][1]*y0 + R[2][2]*z0
    return Yg, Zg, -Xg


def main(paths):
    stars = []
    n_vel = 0
    for path in paths:
        with gzip.open(path, 'rt') if str(path).endswith('.gz') else open(path) as f:
            for row in csv.DictReader(f):
                try:
                    mag = float(row['mag']); d = float(row['dist'])
                except (ValueError, KeyError):
                    continue
                if d <= 0.000006 or d > 60000 or not row['dist_src']:
                    continue
                try:
                    vel = (float(row['vx']), float(row['vy']), float(row['vz']))
                    n_vel += 1
                except (ValueError, KeyError):
                    vel = None
                stars.append((mag, float(row['x0']), float(row['y0']), float(row['z0']),
                              row['ci'], vel))
    stars.sort(key=lambda s: s[0])
    print(f"{len(stars):,} usable rows, {n_vel:,} with 3D velocities")

    def pack(subset):
        out = bytearray(b'GSK2')
        for mag, x0, y0, z0, ci, vel in subset:
            sx, sy, sz = (v*PC2U for v in to_scene(x0, y0, z0))
            try: bv = float(ci)
            except ValueError: bv = 0.55
            r, g, b = bv_rgb(bv)
            m8 = max(0, min(255, round((mag+2)/14*255)))
            if vel:
                # velocities rotate exactly like positions; km/s clamped to a byte
                vx, vy, vz = to_scene(*vel)
                v8 = [max(-127, min(127, round(v))) for v in (vx, vy, vz)]
            else:
                v8 = [0, 0, 0]
            out += struct.pack('<3f4B3bB', sx, sy, sz,
                               round(r*255), round(g*255), round(b*255), m8,
                               v8[0], v8[1], v8[2], 0)
        return bytes(out)

    base = Path(__file__).resolve().parent.parent
    (base/'stars-gaia.bin').write_bytes(pack(stars[:N_BRIGHT]))
    (base/'stars-gaia-deep.bin').write_bytes(pack(stars[N_BRIGHT:N_BRIGHT+N_DEEP]))
    for n in ('stars-gaia.bin', 'stars-gaia-deep.bin'):
        print(f"{n}: {(base/n).stat().st_size/1024:.0f} KB")
    print(f"bright tier to mag {stars[N_BRIGHT-1][0]:.2f}, "
          f"deep tier to mag {stars[min(len(stars), N_BRIGHT+N_DEEP)-1][0]:.2f}")


if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    main(sys.argv[1:])
