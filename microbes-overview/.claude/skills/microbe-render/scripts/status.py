#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
"""Regenerate RENDER-STATUS.md from the per-microbe metadata files, and print a
running tokens/cost tally to the console.

Source of truth: one metadata JSON per microbe, written by the orchestrator next
to its render markdown, at renders/set/<SET>/<MICROBE>.render.meta.json:

{
  "microbe": "rod-bacterium",
  "name": "Rod-shaped bacterium (bacillus)",
  "set": "pathogens-generic",
  "short_description": "Textbook Gram-negative rod...",
  "themes": [
    {"theme":"sem","styles":"SEM micrograph","model":"gemini-2.5-flash-image",
     "render_count":2,"pass":true,"svg_status":"built",
     "time_s":14.8,"tokens":2580,"cost_usd":0.077}
  ],
  "reference": {"theme":"real","styles":"SEM (Wikimedia)","model":"—",
     "render_count":1,"pass":true,"svg_status":"n/a",
     "time_s":0,"tokens":0,"cost_usd":0.0}
}

Also cross-checks the grand total against the raw render.py attempt sidecars so a
forgotten meta update still shows up in the console tally.

Usage: status.py [--renders-root renders] [--out RENDER-STATUS.md]
"""
from __future__ import annotations
import argparse, json, glob, time
from pathlib import Path

COLS = ["name", "short description", "set name", "styles", "model",
        "render count", "pass", "svg status", "time taken", "tokens used",
        "costs"]
THEME_ORDER = ["textbook", "sem", "3d", "watercolor"]
LINKCOLS = {"name", "set name", "styles"}   # columns rendered as links


def fmt_time(s): return f"{s:.0f}s" if s < 60 else f"{s/60:.1f}m"
def fmt_cost(c): return f"${c:.3f}"


def collect_meta(root: Path):
    rows, tok, cost = [], 0, 0
    for mf in sorted(glob.glob(str(root / "set" / "*" / "*.render.meta.json"))):
        m = json.loads(Path(mf).read_text())
        for th in m.get("themes", []) + ([m["reference"]] if m.get("reference") else []):
            st, mic, tk = m.get("set", ""), m["microbe"], th.get("theme", "")
            # links are relative to RENDER-STATUS.md (which sits above renders/)
            base = f"{root}/set/{st}"
            mlog = f"{base}/{mic}.render.md"
            setov = f"{base}/OVERVIEW.md"
            # style links to its per-theme gallery; reference rows link to the log
            styleslink = (f"{base}/theme/{tk}/OVERVIEW.md"
                          if tk in THEME_ORDER else mlog)
            rows.append({
                "name": (m.get("name", mic), mlog),
                "short description": m.get("short_description", ""),
                "set name": (m.get("set", ""), setov),
                "styles": (th.get("styles", th.get("theme", "")), styleslink),
                "model": th.get("model", "—"),
                "render count": th.get("render_count", 0),
                "pass": "✅" if th.get("pass") else "❌",
                "svg status": th.get("svg_status", "—"),
                "time taken": fmt_time(th.get("time_s", 0)),
                "tokens used": th.get("tokens", 0),
                "costs": fmt_cost(th.get("cost_usd", 0.0)),
            })
            tok += th.get("tokens", 0) or 0
            cost += th.get("cost_usd", 0.0) or 0.0
    return rows, tok, cost


def raw_tally(root: Path):
    """Ground-truth sum straight from render.py/edit sidecars, grouped by set.

    Tokens/cost come from the token usage the Google API reports per call (there
    is no live billing endpoint); cost = reported tokens × current price estimate.
    """
    tok = cost = n = 0
    per_set = {}
    for f in glob.glob(str(root / "set" / "*" / "theme" / "*" / "*.attempts" / "*.json")):
        try:
            d = json.loads(Path(f).read_text())
        except Exception:
            continue
        if not d.get("ok"):
            continue
        st = d.get("set") or Path(f).relative_to(root / "set").parts[0]
        u = d.get("usage", {})
        t = u.get("totalTokenCount", 0) or 0
        c = d.get("cost_usd", 0.0) or 0.0
        n += 1; tok += t; cost += c
        ps = per_set.setdefault(st, [0, 0, 0.0])
        ps[0] += 1; ps[1] += t; ps[2] += c
    return n, tok, cost, per_set


# Lila background, white text — the burn lines the user asked for.
LILA = "\033[48;5;93m\033[97m"
RST = "\033[0m"
def burn(msg): print(f"{LILA} {msg} {RST}")


def _cell(col, val):
    if col in LINKCOLS and isinstance(val, tuple):
        text, link = val
        return f"[{text}]({link})" if link else str(text)
    return str(val)


def md_table(rows):
    head = "| " + " | ".join(COLS) + " |"
    sep = "| " + " | ".join("---" for _ in COLS) + " |"
    body = ["| " + " | ".join(_cell(c, r[c]) for c in COLS) + " |" for r in rows]
    return "\n".join([head, sep, *body])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--renders-root", default="renders")
    ap.add_argument("--out", default="RENDER-STATUS.md")
    args = ap.parse_args()
    root = Path(args.renders_root)

    rows, tok, cost = collect_meta(root)
    n_raw, tok_raw, cost_raw, per_set = raw_tally(root)

    total_line = (f"**TOTAL — {len(rows)} rows · {tok:,} tokens · {fmt_cost(cost)}**"
                  f"  ·  raw sidecar tally: {n_raw} renders · {tok_raw:,} tokens · "
                  f"{fmt_cost(cost_raw)}")

    doc = [
        "# Render status",
        "",
        "Auto-generated by `status.py`. One row per microbe × style. "
        "`costs` are best-effort USD from Gemini image-token usage.",
        "",
        md_table(rows) if rows else "_(no renders yet)_",
        "",
        total_line,
        "",
        f"_Updated {time.strftime('%Y-%m-%d %H:%M')} local._",
        "",
    ]
    Path(args.out).write_text("\n".join(doc))

    # Console tally in lila-on-white, per set + grand total (from Google API
    # token usage; there is no live billing endpoint).
    for st in sorted(per_set):
        c, t, u = per_set[st]
        burn(f"SET {st}: {c} renders · {t:,} tokens · {fmt_cost(u)}")
    burn(f"TOTAL: {n_raw} renders · {tok_raw:,} tokens · {fmt_cost(cost_raw)}")
    print(f"→ wrote {args.out}")


if __name__ == "__main__":
    main()
