#!/usr/bin/env python3
"""Turn a StarHorse catalog sample into a density cube for Galactic Transit.

Feed it one or more CSV or CSV.GZ files from the StarHorse releases at gaia.aip.de
(StarHorse 2019 for Gaia DR2, StarHorse 2021 for eDR3/DR3). It accepts either of the
two common column layouts, case-insensitively:

  glon, glat, dist50          galactic longitude/latitude in degrees, distance in kpc
  xgal, ygal, zgal            galactocentric cartesian, kpc

Everything else in the file is ignored, so a full-column download works as well as a
three-column query result. A few million rows sampled at random from the catalog are
plenty — the cube is 160x40x160, and more rows only smooth it.

    python3 tools/build_starhorse_density.py starhorse_sample.csv.gz [more files...]

Writes starhorse-density.bin next to this script's parent folder (astro-visuals/) and a
starhorse-preview.png face-on projection so the result can be eyeballed: the galactic
bar should stand out at roughly 28 degrees, as in Anders et al. (2019, A&A 628, A94).

The cube's frame matches the page's scene: the Sun 8.2 kpc from the centre on +Z, the
direction of galactic rotation (l=90) on +X, north on +Y. Counts are stored as uint8 on
a log scale after a small header: magic 'SHD1', then nx, ny, nz as uint16 little-endian,
then xmax, ymax, zmax as float32 kpc half-extents, then nx*ny*nz bytes, x fastest.
"""

import csv
import gzip
import math
import struct
import sys
from pathlib import Path

NX, NY, NZ = 160, 40, 160
XMAX, YMAX, ZMAX = 12.0, 3.0, 12.0    # kpc half-extents
R_SUN = 8.2                            # kpc, Sun's galactocentric distance


def open_any(path):
    return gzip.open(path, "rt") if str(path).endswith(".gz") else open(path, "rt")


def main(paths):
    grid = bytearray(NX * NY * NZ)
    counts = [0] * (NX * NY * NZ)
    rows = kept = 0
    for path in paths:
        with open_any(path) as f:
            rdr = csv.DictReader(f)
            cols = {c.lower().strip(): c for c in rdr.fieldnames}
            if {"glon", "glat", "dist50"} <= cols.keys():
                gl, gb, gd = cols["glon"], cols["glat"], cols["dist50"]
                mode = "spherical"
            elif {"xgal", "ygal", "zgal"} <= cols.keys():
                gx, gy, gz = cols["xgal"], cols["ygal"], cols["zgal"]
                mode = "cartesian"
            else:
                sys.exit(f"{path}: need glon/glat/dist50 or xgal/ygal/zgal, "
                         f"found {sorted(cols)[:12]}...")
            for row in rdr:
                rows += 1
                try:
                    if mode == "spherical":
                        l = math.radians(float(row[gl]))
                        b = math.radians(float(row[gb]))
                        d = float(row[gd])
                        if not 0 < d < 30:
                            continue
                        X = d * math.cos(b) * math.sin(l)
                        Y = d * math.sin(b)
                        Z = R_SUN - d * math.cos(b) * math.cos(l)
                    else:
                        # StarHorse XGal points from the centre away from the Sun, YGal
                        # along rotation, ZGal north; the scene wants the Sun on +Z.
                        X = float(row[gy])
                        Y = float(row[gz])
                        Z = -float(row[gx])
                except ValueError:
                    continue
                ix = int((X + XMAX) / (2 * XMAX) * NX)
                iy = int((Y + YMAX) / (2 * YMAX) * NY)
                iz = int((Z + ZMAX) / (2 * ZMAX) * NZ)
                if 0 <= ix < NX and 0 <= iy < NY and 0 <= iz < NZ:
                    counts[(iz * NY + iy) * NX + ix] += 1
                    kept += 1
    if kept == 0:
        sys.exit("no rows landed in the cube — check units (dist50 must be kpc)")
    peak = max(counts)
    for i, c in enumerate(counts):
        grid[i] = min(255, round(255 * math.log1p(c) / math.log1p(peak)))
    out = Path(__file__).resolve().parent.parent / "starhorse-density.bin"
    with open(out, "wb") as f:
        f.write(b"SHD1")
        f.write(struct.pack("<3H", NX, NY, NZ))
        f.write(struct.pack("<3f", XMAX, YMAX, ZMAX))
        f.write(bytes(grid))
    print(f"{rows:,} rows read, {kept:,} inside the cube; peak cell {peak}")
    print(f"wrote {out} ({out.stat().st_size/1024:.0f} KB)")

    try:
        from PIL import Image
        img = [[0] * NX for _ in range(NZ)]
        for iz in range(NZ):
            for ix in range(NX):
                img[NZ - 1 - iz][ix] = max(grid[(iz * NY + iy) * NX + ix]
                                           for iy in range(NY))
        im = Image.new("L", (NX, NZ))
        im.putdata([v for r in img for v in r])
        pv = out.with_name("starhorse-preview.png")
        im.resize((NX * 3, NZ * 3), Image.NEAREST).save(pv)
        print(f"wrote {pv} — the bar should slant across the centre")
    except ImportError:
        print("(no PIL: skipped the preview image)")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    main(sys.argv[1:])
