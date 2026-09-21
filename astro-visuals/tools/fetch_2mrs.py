#!/usr/bin/env python3
"""Fetch the 2MASS Redshift Survey and write it as the piece's deep field.

2MRS (Huchra et al. 2012, ApJS 199, 26; VizieR J/ApJS/199/26, table 3) is the all-sky
redshift survey of the 2MASS galaxies brighter than Ks = 11.75: some 43,500 galaxies out to
about 15,000 km/s — 650 million light years — the largest volume of the Universe mapped
uniformly over the whole sky. Past the 3,500 km/s groups it is what there is to draw.

The catalogue is written as a small binary, data/2mrs.bin, that the page fetches only when
the eye goes far enough out to need it (the page itself would grow by a third otherwise):
an 8-byte header ('2MRS', uint32 count) then 6 bytes a galaxy, little-endian — uint16
supergalactic longitude ×100, int16 latitude ×100, uint16 heliocentric cz in km/s. The
distance the page draws is cz over H0 = 74.6 (Cosmicflows-4's value), which is a model of
distance: a galaxy's own motion is in its velocity, and the article says so.

The great clusters the deep field names are a table here, by their Abell numbers, with
NED's positions and redshifts; each is checked against the survey itself — the galaxies
within two degrees and 1,500 km/s are counted, and a name whose neighbourhood is not a
concentration is dropped from the written table rather than drawn.

VizieR is reachable from GitHub's runner (the data workflow) and not from the sandbox; the
catalogue's own terms ask that its files not be redistributed, so no mirror is used and the
piece carries only the derived positions, with the citation.

    python tools/fetch_2mrs.py            # write data/2mrs.bin and src/astro/deep-data.ts
"""
from __future__ import annotations

import math
import struct
import sys
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
BIN = HERE.parent / "data" / "2mrs.bin"
OUT = HERE.parent / "src" / "astro" / "deep-data.ts"
VIZIER = "https://vizier.cds.unistra.fr/viz-bin/asu-tsv?-source=J/ApJS/199/26/table3&-out=RAJ2000,DEJ2000,GLON,GLAT,Ktmag,cz&-out.max=unlimited"
H0 = 74.6

# The great clusters, by Abell number: NED positions (J2000) and heliocentric cz, km/s
CLUSTERS = [
    ("Virgo Cluster",    187.70,  12.39,  1079, "M87; Binggeli et al. 1987"),
    ("Fornax Cluster",    54.62, -35.45,  1442, "NGC 1399; Drinkwater et al. 2001"),
    ("Coma Cluster",     194.95,  27.98,  6925, "Abell 1656; Struble & Rood 1999"),
    ("Perseus Cluster",   49.95,  41.51,  5366, "Abell 426; Struble & Rood 1999"),
    ("Norma Cluster",    243.55, -60.85,  4871, "Abell 3627, the Great Attractor's core; Kraan-Korteweg et al. 1996"),
    ("Centaurus Cluster",192.20, -41.31,  3397, "Abell 3526; Struble & Rood 1999"),
    ("Hydra Cluster",    159.17, -27.53,  3777, "Abell 1060; Struble & Rood 1999"),
    ("Antlia Cluster",   157.51, -35.32,  2797, "NGC 3268; Smith Castelli et al. 2008"),
    ("Leo Cluster",      176.12,  19.84,  6595, "Abell 1367; Struble & Rood 1999"),
    ("Hercules Cluster", 241.15,  17.72, 11000, "Abell 2151; Struble & Rood 1999"),
    ("Shapley Concentration", 201.99, -31.50, 14390, "Abell 3558, the Shapley core; Quintana et al. 1995"),
    ("Pavo–Indus (A3742)", 316.35, -47.18, 4800, "Abell 3742 / NGC 7014; Struble & Rood 1999"),
]

EQ2GAL = [[-0.0548755604, -0.8734370902, -0.4838350155], [0.4941094279, -0.4448296300, 0.7469822445], [-0.8676661490, -0.1980763734, 0.4559837762]]


def gal_vec(l, b):
    l, b = math.radians(l), math.radians(b)
    return [math.cos(b)*math.cos(l), math.cos(b)*math.sin(l), math.sin(b)]


SGX = gal_vec(137.37, 0); SGZ = gal_vec(47.37, 6.32)
SGY = [SGZ[1]*SGX[2]-SGZ[2]*SGX[1], SGZ[2]*SGX[0]-SGZ[0]*SGX[2], SGZ[0]*SGX[1]-SGZ[1]*SGX[0]]


def eq_to_sg(ra, dec):
    r, d = math.radians(ra), math.radians(dec)
    e = [math.cos(d)*math.cos(r), math.cos(d)*math.sin(r), math.sin(d)]
    g = [sum(EQ2GAL[i][k]*e[k] for k in range(3)) for i in range(3)]
    x, y, z = (sum(g[k]*v[k] for k in range(3)) for v in (SGX, SGY, SGZ))
    return (math.degrees(math.atan2(y, x)) % 360, math.degrees(math.asin(max(-1, min(1, z)))))


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "galactic-transit/1.0 (fetch_2mrs.py)"})
    with urllib.request.urlopen(req, timeout=300) as r:
        return r.read().decode("utf-8", "replace")


def parse(text):
    import re
    hdr = None; cols = {}
    want = {"ra": r"^(RAJ2000|_RAJ2000|RAdeg|RA_ICRS)$", "dec": r"^(DEJ2000|_DEJ2000|DEdeg|DE_ICRS)$", "cz": r"^(cz|Vh|HRV)$", "k": r"^(Ktmag|Kmag|Kcmag)$"}
    rows = []
    for line in text.splitlines():
        if line.startswith("#") or not line.strip():
            continue
        cells = [c.strip() for c in line.split("\t")]
        if hdr is None:
            hdr = cells
            for k, rx in want.items():
                for i, h in enumerate(hdr):
                    if re.match(rx, h):
                        cols[k] = i; break
            if any(k not in cols for k in ("ra", "dec", "cz")):
                raise RuntimeError(f"columns not identified: {hdr}")
            continue
        if set(line.strip()) <= set("-\t "):
            continue
        try:
            ra, dec, cz = float(cells[cols["ra"]]), float(cells[cols["dec"]]), float(cells[cols["cz"]])
        except (ValueError, IndexError):
            continue  # the units row, or a galaxy without a redshift
        rows.append((ra, dec, cz))
    return rows


def main():
    print(f"fetching {VIZIER}")
    try:
        rows = parse(fetch(VIZIER))
    except Exception as exc:  # noqa: BLE001
        print(f"2MRS: NOT fetched — {exc}")
        return 2
    rows = [r for r in rows if 0 < r[2] < 65000]
    if len(rows) < 40000:
        print(f"2MRS: only {len(rows)} usable rows — file left untouched")
        return 2
    print(f"{len(rows)} galaxies with redshifts")
    sg = [eq_to_sg(ra, dec) + (cz,) for ra, dec, cz in rows]
    buf = bytearray(b"2MRS" + struct.pack("<I", len(sg)))
    for l, b, cz in sg:
        buf += struct.pack("<HhH", int(round(l*100)) % 36000, int(round(b*100)), int(round(cz)))
    BIN.parent.mkdir(parents=True, exist_ok=True)
    BIN.write_bytes(bytes(buf))
    print(f"wrote {BIN} ({len(buf)//1024} KB)")
    # the named clusters, each checked against the survey
    lines = []
    for name, ra, dec, cz, src in CLUSTERS:
        cl, cb = eq_to_sg(ra, dec)
        n = 0
        for l, b, v in sg:
            if abs(v - cz) > 1500:
                continue
            d = math.degrees(math.acos(max(-1, min(1, math.sin(math.radians(b))*math.sin(math.radians(cb)) + math.cos(math.radians(b))*math.cos(math.radians(cb))*math.cos(math.radians(l - cl))))))
            if d < 2.0:
                n += 1
        ok = n >= 8
        print(f"  {name:24} SGL {cl:7.2f} SGB {cb:6.2f} cz {cz:6.0f}: {n:4} survey galaxies within 2° and 1,500 km/s {'ok' if ok else 'DROPPED'}")
        if ok:
            q = lambda t: t.replace("\\", "\\\\").replace("'", "\\'")   # noqa: E731 — the apostrophe in "Attractor's" broke the build once
            lines.append(f"  ['{q(name)}', {cl:.3f}, {cb:.3f}, {cz}, {n}, '{q(src)}'],")
    OUT.write_text(f'''/**
 * The deep field's names: the great clusters of the 2MASS Redshift Survey's volume, by
 * NED's positions and redshifts, each checked against the survey (the count is the survey's
 * galaxies within 2° and 1,500 km/s of it). Generated by `tools/fetch_2mrs.py` — edit the
 * tool, not this file. The survey itself is data/2mrs.bin (see the tool's header).
 */

export const DEEP_N = {len(sg)}
export const DEEP_H0 = {H0}
export type DeepCluster = readonly [string, number, number, number, number, string]
/** name, SGL°, SGB°, heliocentric cz km/s, survey galaxies round it, source */
export const DEEP_CLUSTERS: readonly DeepCluster[] = [
{chr(10).join(lines)}
]
''', encoding="utf-8")
    print(f"wrote {OUT}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
