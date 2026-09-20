#!/usr/bin/env python3
"""Regenerate src/astro/sc-data.ts — the galaxies and groups beyond the Local Group.

Two catalogues, both real and both reachable as verbatim copies on raw.githubusercontent.com
(the sandbox reaches that host; GitHub's runner reaches VizieR as well and prefers it):

  * Kourkchi & Tully 2017, "Galaxy Groups within 3500 km/s" (ApJ 843, 16; VizieR
    J/ApJ/843/16, Table 2): 8,826 groups — every galaxy of the 2MASS Redshift Survey out to
    3,500 km/s gathered into groups, each with supergalactic coordinates, a Cosmicflows-3
    distance where its members have one (1,951 groups) and a Local-Sheet velocity for the
    rest, a Ks luminosity, a velocity dispersion and a turnaround radius. This is the
    Virgo Supercluster and the nearer cosmic web, as measured.
  * Karachentsev, Makarov & Kaisina 2013, the Updated Nearby Galaxy Catalog (AJ 145, 101;
    VizieR J/AJ/145/101): 869 galaxies within ~11 Mpc with names, distances, Ks magnitudes
    and morphological types — the ones a chart names.

Groups are written packed (base64 of little-endian 16-bit fields) because 8,826 rows of
decimal text would be a third of the page; the galaxies are written as rows. Where a group
has no measured distance its Local-Sheet velocity over H0 = 74.6 km/s/Mpc (Cosmicflows-4's
value) stands in, and the row says so with a flag. The chart's group names are a table in
this tool, keyed by the group's principal galaxy's PGC number; each is checked against the
nearby-galaxy catalogue where the galaxy is in it (position and distance must agree), and
the rest are marked for the runner to confirm against HyperLEDA (VizieR VII/237).

    python tools/fetch_supercluster.py            # rewrite src/astro/sc-data.ts
    python tools/fetch_supercluster.py --check    # fetch and compare, write nothing
"""
from __future__ import annotations

import base64
import math
import struct
import sys
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE.parent / "src" / "astro" / "sc-data.ts"
KT_MIRROR = "https://raw.githubusercontent.com/DESI-UR/DESI_SGA/master/TF/apjaa76dbt2_mrt.txt"
KT_VIZIER = "https://vizier.cds.unistra.fr/viz-bin/asu-tsv?-source=J/ApJ/843/16/table2&-out.all=1&-out.max=unlimited"
UNGC_MIRROR = "https://raw.githubusercontent.com/carlzimmerman/zimmerman-formula/main/real_research/data/ungc_karachentsev2013.tsv"
UNGC_VIZIER = "https://vizier.cds.unistra.fr/viz-bin/asu-tsv?-source=J/AJ/145/101/catalog&-out=Name,_RA,_DE,Kmag,TT,HRV,Dist,f_Dist&-out.max=unlimited"
H0 = 74.6

# The chart's names, by the group's principal galaxy (PGC1 in Kourkchi & Tully). The kind
# says how the chart draws it: a cluster gets a glow the size of its turnaround radius.
NAMED = {
    2557:  ("Local Group", "group"),
    41220: ("Virgo Cluster", "cluster"),          # NGC 4472 (M49)
    13418: ("Fornax Cluster", "cluster"),         # NGC 1399
    13505: ("Eridanus Cluster", "cluster"),       # NGC 1407
    43296: ("Centaurus Cluster", "cluster"),      # NGC 4696
    31478: ("Hydra Cluster", "cluster"),          # NGC 3311
    30308: ("Antlia Cluster", "cluster"),         # NGC 3258
    28630: ("M81 Group", "group"),                # NGC 3031
    46957: ("Centaurus A Group", "group"),        # NGC 5128
    48082: ("M83 Group", "group"),                # NGC 5236
    9892:  ("Maffei Group", "group"),             # Maffei 1
    13826: ("IC 342 Group", "group"),
    43495: ("Canes I Group (M94)", "group"),      # NGC 4736
    50063: ("M101 Group", "group"),               # NGC 5457
    39600: ("M106 Group", "group"),               # NGC 4258
    65001: ("NGC 6946 Group", "group"),
    62836: ("NGC 6744 Group", "group"),
    34695: ("Leo Triplet (M66)", "group"),        # NGC 3627
    32256: ("Leo I Group (M96)", "group"),        # NGC 3379
    10123: ("NGC 1023 Group", "group"),
    42407: ("Sombrero Group (M104)", "group"),    # NGC 4594
    29265: ("NGC 3115 Group", "group"),
    14765: ("Dorado Group", "group"),             # NGC 1553
    53932: ("NGC 5846 Group", "group"),
    37617: ("Ursa Major Cluster (M109)", "cluster"),  # NGC 3992
    42734: ("NGC 4636 Group", "group"),
    49356: ("Canes II Group (NGC 5353)", "group"),
    37969: ("Antennae Group", "group"),           # NGC 4038
    43451: ("NGC 4697 Group", "group"),
    47404: ("M51 Group", "group"),                # NGC 5194
}
# what the nearby catalogue calls those principals, for the position check
UNGC_NAME = {2557: "MESSIER031", 28630: "MESSIER081", 46957: "NGC5128", 48082: "NGC5236", 9892: "Maffei1", 13826: "IC0342",
             43495: "NGC4736", 50063: "MESSIER101", 39600: "NGC4258", 65001: "NGC6946", 62836: "NGC6744", 34695: "NGC3627",
             32256: "NGC3379", 10123: "NGC1023", 42407: "NGC4594", 29265: "NGC3115", 47404: "NGC5194"}

# hand rows beyond the two catalogues, with their sources
EXTRA_GALAXIES = [
    # Cloud-9: the starless "dark galaxy" near M94 — Zhou et al. 2023 (FAST), Benítez-Llambay & Navarro
    # 2023, Anand et al. 2025 (arXiv:2508.20157; Hubble found no stars). RA 12h51m52s, Dec +40°17′29″
    # (the VLA field centre, Kurapati et al. 2024), 4.4 Mpc by association with M94.
    ("Cloud-9 (dark galaxy candidate)", 192.9667, 40.2914, 4.4, None, -9, "dark", "Anand et al. 2025"),
]

# supergalactic frame (de Vaucouleurs): pole at galactic 47.37, +6.32; origin at 137.37, 0
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
    req = urllib.request.Request(url, headers={"User-Agent": "galactic-transit/1.0 (fetch_supercluster.py)"})
    with urllib.request.urlopen(req, timeout=120) as r:
        return r.read().decode("utf-8", "replace")


def try_fetch(urls):
    last = None
    for u in urls:
        try:
            print(f"fetching {u}")
            return fetch(u), u
        except Exception as exc:  # noqa: BLE001
            print(f"  not reachable: {exc}")
            last = exc
    raise RuntimeError(f"no source reachable: {last}")


def parse_groups_tsv(text):
    """VizieR's TSV: comment lines, a header row, a units row, a dashes row, then data — by column name"""
    import re
    rows = []
    hdr = None
    cols = {}
    want = {"pgc1": r"^PGC1$", "mem": r"^(Mem|Nmem)$", "sgl": r"^SGL$", "sgb": r"^SGB$", "logK": r"^logK$",
            "vls": r"^VLS$", "D": r"^(D|Dist)$", "sigV": r"^sigmaV$", "r2t": r"^R2t$"}
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
            if any(k not in cols for k in ("pgc1", "mem", "sgl", "sgb", "vls")):
                print(f"  VizieR columns not identified: {hdr}")
                return []
            continue
        if set(line.strip()) <= set("-\t "):
            continue
        try:
            g = lambda k, t=float: (t(cells[cols[k]]) if k in cols and cols[k] < len(cells) and cells[cols[k]] else None)  # noqa: E731
            pgc1 = g("pgc1", int)
        except ValueError:
            continue  # the units row
        if pgc1 is None:
            continue
        try:
            rows.append(dict(pgc1=pgc1, mem=g("mem", int), sgl=g("sgl"), sgb=g("sgb"), logK=g("logK"), vls=g("vls", int), D=g("D"), sigV=g("sigV", int), r2t=g("r2t")))
        except ValueError:
            continue
    return rows


def parse_groups(text):
    """the ApJ machine-readable table (fixed columns), or VizieR's TSV by header"""
    if "#Column" in text[:40000] or "#RESOURCE=" in text[:4000]:   # VizieR's TSV, not the journal's MRT
        return parse_groups_tsv(text)
    rows = []
    for line in text.splitlines():
        if not line.strip() or line[0] in "#-" or not line[:7].strip().isdigit():
            continue
        f = lambda a, b, t=float: (t(line[a-1:b].strip()) if line[a-1:b].strip() else None)  # noqa: E731
        try:
            rows.append(dict(pgc1=f(1, 7, int), mem=f(17, 19, int), sgl=f(39, 46), sgb=f(48, 55), logK=f(63, 67),
                             vls=f(74, 77, int), D=f(83, 87), sigV=f(96, 98, int), r2t=f(100, 104)))
        except ValueError:
            continue
    return rows


def parse_ungc(text):
    rows = []
    hdr = None
    for line in text.splitlines():
        if line.startswith("#") or not line.strip():
            continue
        cells = line.split("\t")
        if hdr is None:
            hdr = [c.strip() for c in cells]; continue
        if set(line.strip()) <= set("-\t "):
            continue
        r = dict(zip(hdr, [c.strip() for c in cells]))
        try:
            ra, dec, dist = float(r["_RAJ2000"]), float(r["_DEJ2000"]), float(r["Dist"])
        except (ValueError, KeyError):
            continue
        k = r.get("Kmag", "")
        tt = r.get("TT", "")
        rows.append(dict(name=r["Name"], ra=ra, dec=dec, dist=dist, k=float(k) if k else None, tt=int(tt) if tt.lstrip("-").isdigit() else None))
    return rows


def pretty(name):
    n = name.replace("MESSIER0", "M").replace("MESSIER", "M")
    for p in ("NGC", "IC", "UGC", "ESO", "PGC", "DDO", "KKH", "KK", "AM", "UGCA"):
        if n.startswith(p + "0"):
            n = p + " " + n[len(p):].lstrip("0")
        elif n.startswith(p) and len(n) > len(p) and n[len(p)].isdigit():
            n = p + " " + n[len(p):]
    return n


def main():
    check_only = "--check" in sys.argv
    # each source is fetched AND parsed before it counts; a copy that parses short is skipped
    groups, kt_src = [], ""
    for url in (KT_VIZIER, KT_MIRROR):
        try:
            print(f"fetching {url}")
            groups = parse_groups(fetch(url)); kt_src = url
        except Exception as exc:  # noqa: BLE001
            print(f"  not reachable: {exc}"); continue
        if len(groups) >= 8000:
            break
        print(f"  parsed only {len(groups)} groups from this copy — trying the next")
    gals, ungc_src = [], ""
    for url in (UNGC_VIZIER, UNGC_MIRROR):
        try:
            print(f"fetching {url}")
            gals = parse_ungc(fetch(url)); ungc_src = url
        except Exception as exc:  # noqa: BLE001
            print(f"  not reachable: {exc}"); continue
        if len(gals) >= 800:
            break
        print(f"  parsed only {len(gals)} galaxies from this copy — trying the next")
    if len(groups) < 8000 or len(gals) < 800:
        print(f"unexpected sizes: {len(groups)} groups, {len(gals)} galaxies — file left untouched")
        return 2
    print(f"{len(groups)} groups, {len(gals)} galaxies")
    # ---- the named groups: check the principal's position against the nearby catalogue ----
    by_pgc = {g["pgc1"]: g for g in groups}
    by_name = {g["name"]: g for g in gals}
    named_rows = []
    for pgc, (name, kind) in NAMED.items():
        g = by_pgc.get(pgc)
        if not g:
            print(f"  {name}: PGC {pgc} not in the group catalogue — dropped"); continue
        status = "pgc"     # named from the PGC number; the runner confirms against HyperLEDA
        u = by_name.get(UNGC_NAME.get(pgc, ""))
        if u:
            sgl, sgb = eq_to_sg(u["ra"], u["dec"])
            dsep = math.degrees(math.acos(max(-1, min(1, math.sin(math.radians(sgb))*math.sin(math.radians(g["sgb"])) + math.cos(math.radians(sgb))*math.cos(math.radians(g["sgb"]))*math.cos(math.radians(sgl - g["sgl"]))))))
            dd = abs((g["D"] or u["dist"]) - u["dist"])/u["dist"]
            ok = dsep < 3.5 and dd < 0.35   # the group's position is its members' mean, not the principal's
            status = "ungc" if ok else "MISMATCH"
            print(f"  {name:28} PGC {pgc:6} vs {u['name']:12} sep {dsep:5.2f}°  D {g['D']} vs {u['dist']}  {'ok' if ok else 'MISMATCH'}")
        named_rows.append((pgc, name, kind, status))
    # ---- pack the groups ----
    buf = bytearray()
    n_vel = 0
    for g in groups:
        d = g["D"]
        flag = 0
        if d is None:
            d = max(0.5, g["vls"]/H0); flag = 1; n_vel += 1
        buf += struct.pack("<HhHhH", int(round(g["sgl"]*100)) % 36000, int(round(g["sgb"]*100)), min(32767, int(round(d*100))) | (flag << 15),
                           int(round((g["logK"] or 0)*100)), min(65535, g["mem"]))
    packed = base64.b64encode(bytes(buf)).decode("ascii")
    print(f"{n_vel} groups placed by velocity (no Cosmicflows distance); packed {len(packed)} chars")
    # the groups' PGC ids, for the named table to point into: index by row order
    index = {g["pgc1"]: i for i, g in enumerate(groups)}
    # ---- the galaxies ----
    gal_lines = []
    for u in sorted(gals, key=lambda x: (x["k"] if x["k"] is not None else 99)):
        tt = u["tt"]
        kind = "E" if tt is not None and tt <= -1 else "I" if tt is not None and tt >= 8 else "S" if tt is not None else "?"
        gal_lines.append(f"  ['{pretty(u['name'])}', {u['ra']:.4f}, {u['dec']:.4f}, {u['dist']:.2f}, {u['k'] if u['k'] is not None else 'null'}, '{kind}'],")
    for name, ra, dec, dist, k, tt, kind, src in EXTRA_GALAXIES:
        gal_lines.append(f"  ['{name}', {ra:.4f}, {dec:.4f}, {dist:.2f}, {k if k is not None else 'null'}, '{kind}'],   // {src}")
    named_lines = [f"  [{index[p]}, '{n}', '{k}', '{s}']," for p, n, k, s in named_rows]
    header = f'''/**
 * Beyond the Local Group: the groups of Kourkchi & Tully 2017 ("Galaxy Groups within
 * 3500 km/s", ApJ 843, 16 — VizieR J/ApJ/843/16) and the galaxies of Karachentsev,
 * Makarov & Kaisina 2013 (the Updated Nearby Galaxy Catalog, AJ 145, 101 — VizieR
 * J/AJ/145/101). Generated by `tools/fetch_supercluster.py` — edit the tool, not this file.
 *
 * SC_GROUPS_PACKED: {len(groups)} groups, 10 bytes each, little-endian: uint16 SGL×100,
 * int16 SGB×100, uint16 distance Mpc×100 with bit 15 set when the distance is the
 * Local-Sheet velocity over H0 = {H0} rather than a Cosmicflows-3 measurement ({n_vel} of
 * them), int16 log Ks luminosity ×100, uint16 members. The turnaround radius the chart's
 * cluster glows use is recovered from the luminosity (Kourkchi & Tully eq. 6, R ∝ M^1/3). Sources at generation: {kt_src.split('/')[2]}, {ungc_src.split('/')[2]}.
 *
 * SC_NAMED: the chart's groups — index into the packed table, name, kind, and how the name
 * was checked: 'ungc' (the principal galaxy's position and distance agree with the nearby
 * catalogue), 'pgc' (named from the PGC number; the runner confirms against HyperLEDA).
 *
 * SC_GALAXIES: name, RA°, Dec° (J2000), distance Mpc, Ks magnitude, kind (E, S, I,
 * ? unknown, dark), brightest first.
 */

export const SC_GROUPS_N = {len(groups)}
export const SC_GROUPS_PACKED = '{packed}'

export type ScNamed = readonly [number, string, 'group' | 'cluster', 'ungc' | 'pgc' | 'MISMATCH']
export const SC_NAMED: readonly ScNamed[] = [
'''
    body = "\n".join(named_lines) + "\n]\n\nexport type ScGalaxy = readonly [string, number, number, number, number | null, 'E' | 'S' | 'I' | '?' | 'dark']\nexport const SC_GALAXIES: readonly ScGalaxy[] = [\n" + "\n".join(gal_lines) + "\n]\n"
    new = header + body
    old = OUT.read_text(encoding="utf-8") if OUT.exists() else ""
    if new == old:
        print("file already matches the catalogues"); return 0
    if check_only:
        print("differs from the file (not written)"); return 0
    OUT.write_text(new, encoding="utf-8")
    print(f"wrote {OUT} ({len(new)//1024} KB)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
