#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
"""Assemble a microbe's render.md (§3–6) + render.meta.json from its inputs.

Reads, under renders/set/<SET>/:
  <microbe>.render.md          preamble kept verbatim up to "## 3." (science §1–2)
  <microbe>.descriptions.json  {kids_en,kids_de,adults_en,adults_de,sci_en,sci_de}
  <microbe>.prompts.json       {textbook,sem,3d,watercolor}
  <microbe>.verdicts.json      {"themes":{th:{attempt:verdict}}, "reference":str,
                                "svg_theme":th, "decision":[[style,verdict,att,note]]}
  theme/<th>/<microbe>.attempts/gen-*.json   render sidecars (usage/cost/model)
  theme/<svg_theme>/<microbe>.<svg_theme>.svg + .html   labelled SVG (embedded inline)
  ../reference-microscopy/theme/*/<microbe>.attempts/real-*.json   reference(s)

Writes <microbe>.render.md (preamble + §3 descriptions + §4 prompts + §5 every
picture incl. the embedded labelled SVG + reference + §6 decision) and
<microbe>.render.meta.json. All image paths are relative to the render.md and use
AVIF. German descriptions get proper umlauts.

Usage: assemble_md.py --microbe rod-bacterium --set pathogens-generic
"""
from __future__ import annotations
import argparse, json, glob, re
from urllib.parse import quote
from pathlib import Path

THEMES = [("textbook", "Textbook illustration"), ("sem", "SEM micrograph"),
          ("3d", "3D medical render"), ("watercolor", "Watercolor plate")]
UML = {"Staebchen": "Stäbchen", "staebchen": "stäbchen", "stabfoermige": "stabförmige",
       "stabfoermigen": "stabförmigen", "Gummibaerchen": "Gummibärchen", "koennen": "können",
       "boese": "böse", "boesen": "bösen", "Naehrstoffe": "Nährstoffe", "Naehrstoffen": "Nährstoffen",
       "gefaehrlich": "gefährlich", "uebermaessiger": "übermäßiger", "foerdert": "fördert",
       "Staemme": "Stämme", "aeussere": "äußere", "aeusseren": "äußeren", "duenne": "dünne",
       "Laenge": "Länge", "laengliche": "längliche", "Oberflaeche": "Oberfläche",
       "oekologisch": "ökologisch", "zaehlt": "zählt", "Antikoerper": "Antikörper",
       "Huellstrukturen": "Hüllstrukturen", "verdraengen": "verdrängen", "ergaenzt": "ergänzt",
       "Ernaehrung": "Ernährung", "fuer": "für"}
attn = lambda p: int(re.search(r"gen-(\d+)", p).group(1))
realn = lambda p: int(re.search(r"real-(\d+)", p).group(1))


def fix_de(s: str) -> str:
    for a, b in UML.items():
        s = s.replace(a, b)
    return s


def rel(p: str, set_name: str = "") -> str:
    """Sidecar paths are repo-root relative; the render.md sits in
    renders/set/<set_name>/, so rewrite them relative to THAT.

    Stripping the prefix blindly only works while the file belongs to the same
    set. The real micrograph does not — it lives in reference-microscopy — so
    the reference image link pointed at a path inside the microbe's own set and
    resolved nowhere. Hop up one level for anything owned by another set."""
    m = re.match(r"^renders/set/([^/]+)/(.*)$", p)
    if not m:
        return p
    owner, rest = m.groups()
    out = rest if owner == set_name else f"../{owner}/{rest}"
    # some reference filenames carry the modality in parentheses; an unescaped
    # ")" ends a markdown link early, so percent-encode the whole path
    return quote(out, safe="/")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--microbe", required=True)
    ap.add_argument("--set", dest="set_", required=True)
    ap.add_argument("--renders-root", default="renders")
    a = ap.parse_args()
    sd = Path(a.renders_root) / "set" / a.set_
    m = a.microbe

    d = {k: (fix_de(v) if k.endswith("_de") else v)
         for k, v in json.loads((sd / f"{m}.descriptions.json").read_text()).items()}
    prompts = json.loads((sd / f"{m}.prompts.json").read_text())
    verd = json.loads((sd / f"{m}.verdicts.json").read_text())
    vth, vref = verd.get("themes", {}), verd.get("reference", "")
    svg_theme = verd.get("svg_theme", "textbook")

    # §3 descriptions
    out = ["## 3. Audience descriptions (EN + DE)", "",
           "**Kids (GiantMicrobes-style).**  ", f"🇬🇧 {d['kids_en']}  ", f"🇩🇪 {d['kids_de']}", "",
           "**Adults (popular science, health).**  ", f"🇬🇧 {d['adults_en']}  ", f"🇩🇪 {d['adults_de']}", "",
           "**Scientific.**  ", f"🇬🇧 {d['sci_en']}  ", f"🇩🇪 {d['sci_de']}", ""]
    # §4 prompts
    out += ["## 4. Prompts per style (sent to Nano Banana)", ""]
    for th, label in THEMES:
        out += [f"<details><summary>{label} (<code>{th}</code>)</summary>", "",
                prompts[th], "", "</details>", ""]
    # §5 every picture + embedded SVG + reference
    out += ["## 5. Every picture (renders + reference) with verdicts", ""]
    themes_meta = []
    for th, label in THEMES:
        sids = sorted(glob.glob(str(sd / "theme" / th / f"{m}.attempts" / "gen-*.json")),
                      key=attn)
        scs = [json.loads(Path(s).read_text()) for s in sids]
        tok = sum(s.get("usage", {}).get("totalTokenCount", 0) or 0 for s in scs)
        cost = sum(s.get("cost_usd", 0) or 0 for s in scs)
        tm = sum(s.get("latency_s", 0) or 0 for s in scs)
        model = scs[-1]["model"] if scs else "gemini-2.5-flash-image"
        # A theme counts as "built" once its labelled SVG exists — labelled figures
        # are produced for several styles now, not only the primary svg_theme.
        built = (sd / "theme" / th / f"{m}.{th}.svg").exists()
        themes_meta.append({"theme": th, "styles": label, "model": model,
            "render_count": len(scs), "pass": True,
            "svg_status": "built" if built else "pending (same pipeline)",
            "time_s": round(tm, 1), "tokens": tok, "cost_usd": round(cost, 4)})
        out.append(f"### {label} (`{th}`) — {len(scs)} attempt(s), {tok} tok, ${cost:.3f}")
        for s in scs:
            att = s.get("attempt", 1)
            out.append(f"- attempt {att} · `{s['model']}` · {s.get('latency_s')}s — "
                       f"{vth.get(th, {}).get(str(att), '—')}")
            out.append(f"  ![{th} {att}]({rel(s['files'].get('avif', s['files'].get('png')), a.set_)})")
        if built:
            out += ["", f"**Labelled figure ({th}, English default; Latin/German toggle in the SVG/HTML):**",
                    f"![labelled](theme/{th}/{m}.{th}.svg)",
                    f"[interactive SVG](theme/{th}/{m}.{th}.svg) · [HTML](theme/{th}/{m}.{th}.html)"]
        out.append("")
    # reference (prefer the cleaned/edited highest real-NN for display)
    rsids = sorted(glob.glob(str(sd / ".." / "reference-microscopy" / "theme" / "*" /
                                 f"{m}.attempts" / "real-*.json")), key=realn)
    out.append("### Real microscopy reference (`reference-microscopy`)")
    ref_meta = None
    if rsids:
        src = json.loads(Path(rsids[0]).read_text())       # original: source/license/modality
        disp = json.loads(Path(rsids[-1]).read_text())      # display: latest (edited) image
        avif = disp["files"].get("avif", disp["files"].get("png"))
        out.append(f"- `{src.get('modality','')}` · {src.get('license','')} · "
                   f"{src.get('attribution','')} — {vref}")
        out.append(f"  ![reference]({rel(avif, a.set_)})")
        ref_meta = {"theme": f"real ({src.get('modality','')})",
                    "styles": f"{src.get('modality','')} · {src.get('license','')}",
                    "model": "— (edit)" if disp.get("kind") == "reference-edit" else "— (download)",
                    "render_count": len(rsids), "pass": True, "svg_status": "n/a",
                    "time_s": disp.get("latency_s", 0),
                    "tokens": disp.get("usage", {}).get("totalTokenCount", 0) or 0,
                    "cost_usd": disp.get("cost_usd", 0.0) or 0.0}
    out.append("")
    # §6 decision
    out += ["## 6. Teaching-use decision", "", "| style | verdict | attempts | note |",
            "|---|---|---|---|"]
    for row in verd.get("decision", []):
        out.append("| " + " | ".join(str(x) for x in row) + " |")
    out.append("")

    md = (sd / f"{m}.render.md").read_text()
    cut = md.index("## 3. ") if "## 3. " in md else len(md)
    (sd / f"{m}.render.md").write_text(md[:cut] + "\n".join(out))

    meta = {"microbe": m, "name": verd.get("name", m), "set": a.set_,
            "short_description": verd.get("short_description", ""),
            "themes": themes_meta, "reference": ref_meta}
    (sd / f"{m}.render.meta.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2))
    print(f"assembled {m}: {len(themes_meta)} themes, ref={'yes' if ref_meta else 'no'}")


if __name__ == "__main__":
    main()
