#!/usr/bin/env python3
"""Regenerate src/astro/gc-data.ts from the published catalogues.

The sandbox that wrote the first version of that file could not reach any astronomy host,
so the S-star orbits in it are the papers' values as transcribed. This tool is what checks
them: it runs on GitHub's runner (the astro-visuals data workflow), where the hosts are
reachable, and rewrites the table from VizieR's copy of Gillessen et al. 2017 (J/ApJ/837/30,
the orbital-element table) and Gaia BH1's position from Gaia DR3 (I/355). S2 keeps the GRAVITY
Collaboration's 2020 interferometric solution, which is more precise than the 2017 fit and is
carried here rather than fetched. The black hole's own numbers and BH1's orbit are the papers'
and stay as written.

Every value is printed beside the one it replaces, so the run's log is the verification. If a
catalogue cannot be reached or a column cannot be identified the file is left untouched and the
exit code says so — a table that could not be checked must not be silently rewritten.

    python tools/fetch_sstars.py            # rewrite src/astro/gc-data.ts
    python tools/fetch_sstars.py --check    # fetch and compare, write nothing
"""
from __future__ import annotations

import re
import sys
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE.parent / "src" / "astro" / "gc-data.ts"
VIZIER = "https://vizier.cds.unistra.fr/viz-bin/asu-tsv"

# The GRAVITY 2020 solution for S2 (A&A 636, L5): kept, not fetched.
S2_GRAVITY = dict(name="S2", aMas=125.058, e=0.884649, i=134.567, om=228.171, w=66.263, t0=2018.379, P=16.0455)
# Orbits the 2017 table lists but the piece does not draw: these have since been disputed or
# superseded (S62, S4714 — Peißker et al.'s sub-ten-year orbits, which GRAVITY's imaging did
# not reproduce), or are too poorly constrained to draw honestly.
SKIP = {"S62", "S4714"}
# The stars the piece draws: the well-determined orbits of the 2017 table.
DRAWN = ["S1", "S8", "S9", "S12", "S13", "S14", "S17", "S21", "S24", "S31", "S38", "S54", "S55"]

COLS = {
    "name": re.compile(r"^(Name|Star|ID)$", re.I),
    "a": re.compile(r"^a$", re.I),
    "e": re.compile(r"^e$", re.I),
    "i": re.compile(r"^(i|inc)$", re.I),
    "om": re.compile(r"^(Omega|Om|Node|Ome)$"),
    "w": re.compile(r"^(omega|w|om|ome|argp)$"),
    "t0": re.compile(r"^(tP|Tp|T0|tperi|Tperi)$", re.I),
    "P": re.compile(r"^(P|Per|Period)$", re.I),
}


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": "galactic-transit/1.0 (fetch_sstars.py)"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read().decode("utf-8", "replace")


def parse_tsv(text: str) -> list[dict[str, str]]:
    """VizieR's TSV: comment lines, then a header row, a units row, a dashes row, then data.
    Returns every table found as a list of row dicts, concatenated, each carrying its table."""
    rows: list[dict[str, str]] = []
    header: list[str] | None = None
    table = ""
    for line in text.splitlines():
        if line.startswith("#Table"):
            table = line.split()[1] if len(line.split()) > 1 else ""
            header = None
            continue
        if line.startswith("#") or not line.strip():
            continue
        if header is None:
            header = [h.strip() for h in line.split("\t")]
            continue
        if set(line.strip()) <= {"-", "\t", " "}:
            continue
        if all(re.fullmatch(r"[\w./%\-]*", c.strip()) and not re.search(r"\d\.\d", c) for c in line.split("\t")) and \
           any(c.strip() in ("arcsec", "mas", "deg", "yr", "a", "d") for c in line.split("\t")):
            continue  # the units row
        cells = line.split("\t")
        row = {header[k]: cells[k].strip() for k in range(min(len(header), len(cells)))}
        row["_table"] = table
        rows.append(row)
    return rows


def find_columns(row: dict[str, str]) -> dict[str, str] | None:
    got: dict[str, str] = {}
    for key, rx in COLS.items():
        for col in row:
            if rx.match(col):
                got[key] = col
                break
    return got if all(k in got for k in COLS) else None


def sstars_from_vizier() -> tuple[dict[str, dict[str, float]], str]:
    url = f"{VIZIER}?-source=J/ApJ/837/30&-out.all=1&-out.max=unlimited"
    print(f"fetching {url}")
    rows = parse_tsv(fetch(url))
    if not rows:
        raise RuntimeError("VizieR returned no rows for J/ApJ/837/30")
    cols = None
    for r in rows:
        cols = find_columns(r)
        if cols:
            break
    if not cols:
        seen = sorted({c for r in rows for c in r if c != "_table"})
        raise RuntimeError(f"could not identify the orbital-element columns; columns seen: {seen}")
    print("columns:", cols)
    out: dict[str, dict[str, float]] = {}
    for r in rows:
        if find_columns(r) != cols:
            continue
        name = r[cols["name"]].replace(" ", "")
        try:
            vals = {k: float(r[cols[k]]) for k in ("a", "e", "i", "om", "w", "t0", "P")}
        except ValueError:
            continue
        # the table gives a in arcseconds; the piece keeps milliarcseconds
        unit_mas = vals["a"] > 50
        out[name] = dict(aMas=vals["a"] if unit_mas else vals["a"]*1000, e=vals["e"], i=vals["i"],
                         om=vals["om"], w=vals["w"], t0=vals["t0"], P=vals["P"])
    return out, f"VizieR J/ApJ/837/30 ({cols})"


def bh1_from_gaia() -> dict[str, float]:
    url = f"{VIZIER}?-source=I/355/gaiadr3&Source=4373465352415301632&-out=RA_ICRS,DE_ICRS,Plx"
    print(f"fetching {url}")
    rows = parse_tsv(fetch(url))
    for r in rows:
        if "RA_ICRS" in r and r["RA_ICRS"]:
            plx = float(r["Plx"])
            return dict(ra=float(r["RA_ICRS"]), dec=float(r["DE_ICRS"]), distPc=1000/plx, plx=plx)
    raise RuntimeError("Gaia DR3 4373465352415301632 not found in I/355")


def current_table(src: str) -> dict[str, dict[str, float]]:
    out: dict[str, dict[str, float]] = {}
    for m in re.finditer(r"\{ name: '(\w+)',\s*aMas: ([\d.]+),\s*e: ([\d.]+),\s*i: ([\d.]+),\s*om: ([\d.]+),\s*w: ([\d.]+),\s*t0: ([\d.]+),\s*P: ([\d.]+)\s*\}", src):
        out[m.group(1)] = dict(aMas=float(m.group(2)), e=float(m.group(3)), i=float(m.group(4)), om=float(m.group(5)),
                               w=float(m.group(6)), t0=float(m.group(7)), P=float(m.group(8)))
    return out


def fmt_row(name: str, v: dict[str, float]) -> str:
    return (f"  {{ name: '{name}',".ljust(18) + f" aMas: {v['aMas']:g},".ljust(16) + f" e: {v['e']:g},".ljust(14)
            + f" i: {v['i']:g},".ljust(13) + f" om: {v['om']:g},".ljust(14) + f" w: {v['w']:g},".ljust(13)
            + f" t0: {v['t0']:g},".ljust(15) + f" P: {v['P']:g} }},")


def main() -> int:
    check_only = "--check" in sys.argv
    src = OUT.read_text(encoding="utf-8")
    old = current_table(src)
    try:
        fetched, source = sstars_from_vizier()
    except Exception as exc:  # noqa: BLE001 - the whole point is to report and leave the file alone
        print(f"S-stars: NOT verified — {exc}")
        return 2
    table: dict[str, dict[str, float]] = {"S2": {k: v for k, v in S2_GRAVITY.items() if k != "name"}}
    missing = [n for n in DRAWN if n not in fetched]
    if missing:
        print(f"S-stars: NOT verified — the table lacks {missing}; names present: {sorted(fetched)}")
        return 2
    for n in DRAWN:
        table[n] = fetched[n]
    print(f"\n{'star':6} {'field':5} {'in file':>12} {'catalogue':>12}")
    changed = 0
    for n in sorted(table, key=lambda k: table[k]["P"]):
        for f in ("aMas", "e", "i", "om", "w", "t0", "P"):
            a, b = old.get(n, {}).get(f), table[n][f]
            flag = "" if a is not None and abs(a - b) <= 1e-9*max(1, abs(b)) else "  <-- differs"
            if flag:
                changed += 1
            print(f"{n:6} {f:5} {a if a is not None else '—':>12} {b:>12}{flag}")
    try:
        bh1 = bh1_from_gaia()
        print(f"\nGaia BH1 (DR3): RA {bh1['ra']:.5f}  Dec {bh1['dec']:.5f}  plx {bh1['plx']:.4f} mas -> {bh1['distPc']:.1f} pc")
    except Exception as exc:  # noqa: BLE001
        print(f"Gaia BH1: NOT verified — {exc}")
        bh1 = None
    print(f"\n{changed} value(s) differ from the file.")
    if check_only:
        return 0
    rows = "\n".join(fmt_row(n, table[n]) for n in sorted(table, key=lambda k: table[k]["P"]))
    new = re.sub(r"(export const SSTARS: readonly SStar\[\] = \[\n)(.*?)(\n\])", lambda m: m.group(1) + rows + m.group(3), src, flags=re.S)
    if bh1:
        new = re.sub(r"  ra: [\d.]+,(\s*//[^\n]*)?", f"  ra: {bh1['ra']:.5f},        // Gaia DR3, via {source.split()[0]}", new, count=1)
        new = re.sub(r"  dec: -?[\d.]+,(\s*//[^\n]*)?", f"  dec: {bh1['dec']:.5f},", new, count=1)
        new = re.sub(r"  distPc: [\d.]+,", f"  distPc: {bh1['distPc']:.0f},", new, count=1)
    if new != src:
        OUT.write_text(new, encoding="utf-8")
        print(f"wrote {OUT}")
    else:
        print("file already matches the catalogues")
    return 0


if __name__ == "__main__":
    sys.exit(main())
