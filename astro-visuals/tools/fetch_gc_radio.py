#!/usr/bin/env python3
"""Check src/astro/gc-radio-data.ts against the catalogues, and rewrite what they verify.

The radio objects of the Galactic Centre are placed by their catalogue designations (a G-name
encodes l and b), with sizes from Green's catalogue of supernova remnants and the papers the
table names. The sandbox that wrote the table could reach no astronomy host, so this tool is
what checks it, on GitHub's runner (the astro-visuals data workflow):

  * Green's catalogue (VizieR VII/284) for every remnant's position and size;
  * LaRosa et al. 2000 (VizieR J/AJ/119/207, the 90-cm source list) for the positions of
    the named sources it lists, matched by designation or by name in its notes.

Every value is printed beside the one it replaces, so the run's log is the verification. A
catalogue that cannot be reached, or a column that cannot be identified, leaves the file
untouched and is reported; the exit code is 0 either way because the S-star step after this
one must still run, and the workflow log carries the outcome.

    python tools/fetch_gc_radio.py            # rewrite what the catalogues verify
    python tools/fetch_gc_radio.py --check    # fetch and compare, write nothing
"""
from __future__ import annotations

import re
import sys
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE.parent / "src" / "astro" / "gc-radio-data.ts"
VIZIER = "https://vizier.cds.unistra.fr/viz-bin/asu-tsv"

ROW = re.compile(r"\{ name: '([^']*)',\s*g: '([^']*)',\s*kind: '(\w+)',\s*l: ([\d.]+),\s*b: (-?[\d.]+),\s*maj: ([\d.]+),\s*min: ([\d.]+),")


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": "galactic-transit/1.0 (fetch_gc_radio.py)"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read().decode("utf-8", "replace")


def parse_tsv(text: str) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    header: list[str] | None = None
    for line in text.splitlines():
        if line.startswith("#Table"):
            header = None
            continue
        if line.startswith("#") or not line.strip():
            continue
        if header is None:
            header = [h.strip() for h in line.split("\t")]
            continue
        if set(line.strip()) <= {"-", "\t", " "}:
            continue
        cells = line.split("\t")
        if any(c.strip() in ("deg", "arcmin", "Jy", "mJy", "arcsec") for c in cells) and not any(re.search(r"\d\.\d", c) for c in cells):
            continue  # the units row
        rows.append({header[k]: cells[k].strip() for k in range(min(len(header), len(cells)))})
    return rows


def col(row: dict[str, str], *names: str) -> str | None:
    for n in names:
        for c in row:
            if c.lower() == n.lower():
                return c
    return None


def gname_lb(g: str) -> tuple[float, float] | None:
    m = re.fullmatch(r"G(\d+\.\d+)([+-]\d+\.\d+)", g)
    return (float(m.group(1)), float(m.group(2))) if m else None


def green_snrs() -> dict[str, dict[str, float]]:
    url = f"{VIZIER}?-source=VII/284/snrs&-out.all=1&-out.max=unlimited"
    print(f"fetching {url}")
    rows = parse_tsv(fetch(url))
    if not rows:
        raise RuntimeError("no rows from VII/284")
    r0 = rows[0]
    cn, cl, cb, cs = col(r0, "SNR", "Name"), col(r0, "GLON", "_Glon", "l"), col(r0, "GLAT", "_Glat", "b"), col(r0, "Size", "MajAxis")
    if not (cn and cl and cb and cs):
        raise RuntimeError(f"columns not identified in VII/284: {list(r0)}")
    out: dict[str, dict[str, float]] = {}
    for r in rows:
        try:
            size = r[cs].replace("x", "×").split("×")
            maj = float(size[0]); mn = float(size[1]) if len(size) > 1 and size[1].strip() else maj
            out["G" + r[cn].strip().lstrip("G")] = dict(l=float(r[cl]), b=float(r[cb]), maj=maj, min=mn)
        except (ValueError, KeyError):
            continue
    return out


def larosa_sources() -> dict[str, dict[str, float]]:
    url = f"{VIZIER}?-source=J/AJ/119/207&-out.all=1&-out.max=unlimited"
    print(f"fetching {url}")
    rows = parse_tsv(fetch(url))
    if not rows:
        raise RuntimeError("no rows from J/AJ/119/207")
    out: dict[str, dict[str, float]] = {}
    for r in rows:
        cn = col(r, "Name", "GName", "Source", "ID")
        cl, cb = col(r, "GLON", "_Glon", "l"), col(r, "GLAT", "_Glat", "b")
        if not cn:
            continue
        name = r[cn].strip()
        try:
            if cl and cb and r[cl] and r[cb]:
                out[name] = dict(l=float(r[cl]), b=float(r[cb]))
            else:
                lb = gname_lb(name)
                if lb:
                    out[name] = dict(l=lb[0], b=lb[1])
        except ValueError:
            continue
        # the notes column, where the paper's names (the Snake, the Pelican, the Cane…) live
        cnote = col(r, "Note", "Notes", "Com", "Comment", "Rem")
        if cnote and r.get(cnote):
            out[name]["note"] = r[cnote]  # type: ignore[assignment]
    return out


def main() -> int:
    check_only = "--check" in sys.argv
    src = OUT.read_text(encoding="utf-8")
    table = [(m, dict(name=m.group(1), g=m.group(2), kind=m.group(3), l=float(m.group(4)), b=float(m.group(5)),
                      maj=float(m.group(6)), min=float(m.group(7)))) for m in ROW.finditer(src)]
    print(f"{len(table)} rows in the file")
    verified: dict[str, dict[str, float]] = {}
    try:
        green = green_snrs()
        print(f"Green's catalogue: {len(green)} remnants")
        for _, row in table:
            if row["kind"] == "snr" and row["g"] in green:
                verified[row["g"]] = green[row["g"]]
    except Exception as exc:  # noqa: BLE001
        print(f"Green's catalogue: NOT verified — {exc}")
    try:
        larosa = larosa_sources()
        print(f"LaRosa et al. 2000: {len(larosa)} sources")
        for _, row in table:
            if row["g"] in larosa and row["g"] not in verified:
                verified[row["g"]] = {k: v for k, v in larosa[row["g"]].items() if k in ("l", "b")}
            # the named ones: find the paper's name in a note
            if not row["g"] and row["name"]:
                key = row["name"].replace("the ", "").lower()
                for gname, v in larosa.items():
                    if key in str(v.get("note", "")).lower():
                        verified[row["name"]] = {"l": v["l"], "b": v["b"], "g": gname}  # type: ignore[dict-item]
                        break
    except Exception as exc:  # noqa: BLE001
        print(f"LaRosa et al. 2000: NOT verified — {exc}")
    print(f"\n{'object':18} {'field':5} {'in file':>10} {'catalogue':>10}")
    changed = 0
    for _, row in table:
        v = verified.get(row["g"]) or verified.get(row["name"])
        if not v:
            continue
        for f in ("l", "b", "maj", "min"):
            if f in v:
                a, b = row[f], float(v[f])
                flag = "" if abs(a - b) <= 1e-9 else "  <-- differs"
                changed += bool(flag)
                print(f"{row['name']:18} {f:5} {a:>10} {b:>10}{flag}")
        if "g" in v:
            print(f"{row['name']:18} {'g':5} {row['g'] or '—':>10} {v['g']:>10}")
    print(f"\n{len(verified)} object(s) verified, {changed} value(s) differ.")
    if check_only or not changed:
        return 0
    new = src
    for m, row in table:
        v = verified.get(row["g"]) or verified.get(row["name"])
        if not v:
            continue
        text = m.group(0)
        for f in ("l", "b", "maj", "min"):
            if f in v:
                text = re.sub(rf"\b{f}: (-?[\d.]+),", f"{f}: {float(v[f]):g},", text, count=1)
        if "g" in v and not row["g"]:
            text = text.replace("g: '',", f"g: '{v['g']}',", 1).replace("fromImage: true, ", "")
        new = new.replace(m.group(0), text, 1)
    if new != src:
        OUT.write_text(new, encoding="utf-8")
        print(f"wrote {OUT}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
