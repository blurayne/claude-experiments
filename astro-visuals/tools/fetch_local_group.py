#!/usr/bin/env python3
"""Regenerate src/astro/lg-data.ts — the Local Group's galaxies — from the Local Volume Database.

The Local Volume Database (Pace 2024, arXiv:2411.07424; github.com/apace7/local_volume_database)
is the maintained catalogue of the dwarf galaxies within ~6 Mpc: positions, distance moduli,
half-light radii, magnitudes, structural angles, each with its literature reference. This tool
reads its three Local Group tables — the Milky Way's satellites, Andromeda's, and the field —
keeps everything within 1.25 Mpc, and writes the compact table the piece draws from. Three rows
are added by hand, with their sources: Andromeda and Triangulum (M33), which the database
treats as hosts rather than members, and AC G185.0−11.5, the dark-galaxy candidate of Xu et al. 2025.

Every value is the catalogue's; the classification into spheroidal / irregular / elliptical is
the literature's (McConnachie 2012 Table 1 and later discovery papers), applied by name here
because the database carries no morphology column. Candidates the database has not confirmed
as galaxies are kept and flagged, so the drawing can show them as what they are.

    python tools/fetch_local_group.py            # rewrite src/astro/lg-data.ts
    python tools/fetch_local_group.py --check    # fetch and compare, write nothing
"""
from __future__ import annotations

import csv
import io
import sys
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE.parent / "src" / "astro" / "lg-data.ts"
RAW = "https://raw.githubusercontent.com/apace7/local_volume_database/main/data/"
TABLES = ("dwarf_mw.csv", "dwarf_m31.csv", "dwarf_local_field.csv")
MAX_KPC = 1250.0   # the Group's own reach: NGC 3109's little group at 1.3 Mpc is the next thing out

# gas-rich irregulars and transition types, per McConnachie 2012 and the discovery papers
IRREGULAR = {
    "LMC", "SMC", "IC 10", "NGC 6822", "IC 1613", "WLM", "Leo A", "Aquarius", "Pegasus dIrr",
    "Sagittarius dIrr", "Phoenix", "Leo T", "LGS 3", "Antlia", "Antlia B", "NGC 3109",
    "Sextans A", "Sextans B", "UGC 4879", "Leo P", "Tucana B", "Pegasus W",
}
ELLIPTICAL = {"M 32": "cE", "NGC 205": "dE", "NGC 147": "dE", "NGC 185": "dE"}
# the database's names, tidied to the ones the sky charts use
RENAME = {"M 32": "M32", "NGC 205": "M110 (NGC 205)", "NGC 6822": "Barnard's Galaxy (NGC 6822)",
          "WLM": "Wolf–Lundmark–Melotte", "Sagittarius": "Sagittarius dSph", "Sagittarius dIrr": "SagDIG",
          "LMC": "Large Magellanic Cloud", "SMC": "Small Magellanic Cloud", "Pegasus dIrr": "Pegasus dIrr (DDO 216)"}

# the two rows the database does not carry as members
HAND = [
    # Andromeda herself: the merger model's Gaia-era 765 kpc (van der Marel et al. 2012), the
    # RA/Dec of her nucleus, M_V −21.5, the disk's PA 38° and an ellipticity from its 77°
    # inclination; a 40′ half-light radius for the drawn outline (McConnachie 2012 quotes the
    # disk scale length; the outline is what the marker needs)
    dict(name="Andromeda Galaxy (M31)", ra=10.6847, dec=41.2690, kpc=765.0, rh=40.0, Mv=-21.5, pa=38.0, ell=0.70,
         kind="spiral", host="", confirmed=1, src="van der Marel et al. 2012; McConnachie 2012"),
    # McConnachie 2012 (AJ 144, 4): M33 at 809 kpc, M_V −18.8, rh 0.75 kpc ≈ 3.2′? — the
    # half-light radius quoted there is 2.6 kpc (11′ at 809 kpc); PA 23°, ellipticity 0.34
    dict(name="Triangulum (M33)", ra=23.4621, dec=30.6599, kpc=809.0, rh=11.0, Mv=-18.8, pa=23.0, ell=0.34,
         kind="spiral", host="", confirmed=1, src="McConnachie 2012"),
    # Xu et al. 2025 (Science Advances 11, eads4057): the compact clump in HVC AC-I at
    # l = 185.0°, b = −11.5°, 277.7 kpc by the baryonic Tully–Fisher relation, an HI disk
    # ~1 kpc across, no stars, no molecular gas. RA/Dec from the galactic coordinates.
    dict(name="AC G185.0−11.5 (dark galaxy candidate)", ra=None, dec=None, l=185.0, b=-11.5, kpc=277.7, rh=6.2, Mv=None,
         pa=0.0, ell=0.0, kind="dark", host="mw", confirmed=0, src="Xu et al. 2025"),
]


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": "galactic-transit/1.0 (fetch_local_group.py)"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read().decode("utf-8", "replace")


def num(s: str | None, default: float | None = None) -> float | None:
    try:
        return float(s) if s not in (None, "") else default
    except ValueError:
        return default


def gal_to_eq(l_deg: float, b_deg: float) -> tuple[float, float]:
    """galactic -> equatorial J2000, the transpose of the builders' matrix"""
    import math
    R = [[-0.0548755604, -0.8734370902, -0.4838350155],
         [0.4941094279, -0.4448296300, 0.7469822445],
         [-0.8676661490, -0.1980763734, 0.4559837762]]
    l, b = math.radians(l_deg), math.radians(b_deg)
    g = [math.cos(b)*math.cos(l), math.cos(b)*math.sin(l), math.sin(b)]
    e = [sum(R[i][k]*g[i] for i in range(3)) for k in range(3)]   # transpose
    ra = math.degrees(math.atan2(e[1], e[0])) % 360
    dec = math.degrees(math.asin(max(-1, min(1, e[2]))))
    return ra, dec


def rows_from_lvdb() -> list[dict]:
    out: list[dict] = []
    for t in TABLES:
        text = fetch(RAW + t)
        for r in csv.DictReader(io.StringIO(text)):
            dm = num(r.get("distance_modulus"))
            if dm is None:
                continue
            kpc = 10 ** (dm/5 + 1)/1000
            if kpc > MAX_KPC:
                continue
            name = r["name"].strip()
            mv = num(r.get("apparent_magnitude_v"))
            Mv = (mv - dm) if mv is not None else None
            kind = ELLIPTICAL.get(name) or ("dIrr" if name in IRREGULAR else "dSph")
            out.append(dict(
                name=RENAME.get(name, name), ra=float(r["ra"]), dec=float(r["dec"]), kpc=round(kpc, 1),
                rh=num(r.get("rhalf"), 0.0), Mv=round(Mv, 2) if Mv is not None else None,
                pa=num(r.get("position_angle"), 0.0), ell=num(r.get("ellipticity"), 0.0),
                kind=kind, host=r.get("host", ""), confirmed=int(r.get("confirmed_galaxy") == "1"),
                src=f"LVDB {t.replace('.csv', '')}; distance {r.get('ref_distance', '')}".strip("; "),
            ))
    return out


def fmt(v) -> str:
    if v is None:
        return "null"
    if isinstance(v, str):
        return "'" + v.replace("\\", "\\\\").replace("'", "\\'") + "'"
    return f"{v:g}"


def main() -> int:
    check_only = "--check" in sys.argv
    try:
        rows = rows_from_lvdb()
    except Exception as exc:  # noqa: BLE001
        print(f"Local Group: NOT fetched — {exc}")
        return 2
    for h in HAND:
        h = dict(h)
        if h["ra"] is None:
            h["ra"], h["dec"] = (round(x, 4) for x in gal_to_eq(h.pop("l"), h.pop("b")))
        rows.append(h)
    rows.sort(key=lambda r: r["kpc"])
    print(f"{len(rows)} galaxies within {MAX_KPC:.0f} kpc ({sum(r['confirmed'] for r in rows)} confirmed)")
    lines = ["  [" + ", ".join(fmt(r[k]) for k in ("name", "ra", "dec", "kpc", "rh", "Mv", "pa", "ell", "kind", "host", "confirmed", "src")) + "]," for r in rows]
    body = "\n".join(lines)
    header = '''/**
 * The Local Group: every galaxy within 1.6 Mpc, from the Local Volume Database (Pace 2024,
 * arXiv:2411.07424 — github.com/apace7/local_volume_database), plus Andromeda and Triangulum (M33)
 * from McConnachie 2012 and the dark-galaxy candidate AC G185.0−11.5 from Xu et al. 2025.
 *
 * Generated by `tools/fetch_local_group.py` — edit the tool, not this file. Each row:
 *   name, RA°, Dec° (J2000), distance kpc (from the distance modulus), half-light radius
 *   arcmin (0 where unmeasured), absolute V magnitude (null where unmeasured), position
 *   angle °, ellipticity, kind, host, confirmed (1: the database confirms it a galaxy;
 *   0: a candidate), source.
 */

export type LgKind = 'dSph' | 'dIrr' | 'dE' | 'cE' | 'spiral' | 'dark'
export type LgRow = readonly [string, number, number, number, number, number | null, number, number, LgKind, string, number, string]

export const LG_ROWS: readonly LgRow[] = [
'''
    new = header + body + "\n]\n"
    old = OUT.read_text(encoding="utf-8") if OUT.exists() else ""
    if new == old:
        print("file already matches the catalogue")
        return 0
    if check_only:
        print("differs from the file (not written)")
        return 0
    OUT.write_text(new, encoding="utf-8")
    print(f"wrote {OUT}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
