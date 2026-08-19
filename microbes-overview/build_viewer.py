#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
"""Build the interactive microbes viewer.

Scans the AI-render library under ``renders/set/`` plus the bilingual set
metadata in ``cells_data.py`` and produces two artifacts next to this script:

  - ``viewer-data.json`` — the source-of-truth data model (all sets, microbes,
    bilingual descriptions per audience, and the present image / labelled-SVG
    paths).
  - ``viewer.html``      — the self-contained front-end (``viewer.template.html``)
    with that JSON inlined into its ``<script id="microbe-data">`` block.

Stdlib only, like the other microbe-render scripts. Run it from the
``microbes-overview`` folder after ``scripts/overview.py`` has refreshed the
``finals/`` galleries:

    uv run build_viewer.py            # or: python3 build_viewer.py

Data facts it relies on (see AGENTS.md):
  * cells_data page ``id`` maps 1:1 to ``renders/set/<id>`` EXCEPT
    ``pathogens`` -> ``pathogens-generic``.
  * per microbe: ``<key>.render.meta.json`` (name/set/short_description) and
    ``<key>.descriptions.json`` (kids_/adults_/sci_ x _en/_de).
  * finals: ``finals/<key>__{reference,sem,3d,textbook,watercolor}.avif``.
  * labelled SVGs (textbook/3d/watercolor only):
    ``theme/<style>/<key>.<style>.svg``.
  * German microbe name is matched by exact ``meta.name == entry.name_en``
    within the mapped set; missing assets are simply omitted (viewer shows a
    placeholder).
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

from microbe_giant import GIANT, AI_CLEANED
from microbe_scale import SCALE, weight_class, weight_pg


def slugify(name: str) -> str:
    """Match the microbe-render key convention: drop parentheticals, lowercase,
    non-alphanumerics -> hyphen. Lets us map a cells_data entry to a render key
    when meta.name and name_en differ (e.g. 'Urothelial cell (umbrella cell)')."""
    name = re.sub(r"\([^)]*\)", " ", name)
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")

HERE = Path(__file__).resolve().parent
RENDERS = HERE / "renders" / "set"
TEMPLATE = HERE / "viewer.template.html"
DATA_OUT = HERE / "viewer-data.json"
HTML_OUT = HERE / "viewer.html"

# Non-microbe folders under renders/set to skip when enumerating.
SKIP_SETS = {"reference-microscopy", "set"}

# cells_data page id -> renders/set/<folder>
PAGE_TO_FOLDER = {"pathogens": "pathogens-generic"}

# Styles that have a flat final image.
IMG_STYLES = ["reference", "sem", "3d", "textbook", "watercolor"]
# Styles that additionally carry a labelled SVG overlay.
SVG_STYLES = ["textbook", "3d", "watercolor"]


def load_pages():
    """Import PAGES from cells_data.py (adds HERE to sys.path)."""
    sys.path.insert(0, str(HERE))
    import cells_data  # noqa: E402

    return cells_data.PAGES


def fix_de(s: str) -> str:
    """cells_data prose is already proper UTF-8; keep as-is."""
    return s or ""


def build():
    if not TEMPLATE.exists():
        sys.exit(f"ERROR: template not found: {TEMPLATE}")

    pages = load_pages()

    sets_out = []
    total_microbes = 0

    for page in pages:
        folder = PAGE_TO_FOLDER.get(page["id"], page["id"])
        set_dir = RENDERS / folder
        if not set_dir.is_dir():
            print(f"  (skip: no render folder for page {page['id']} -> {folder})")
            continue

        # cells_data entry lookup by exact name_en AND by slug(name_en); a render
        # microbe matches on meta.name first, else on its key (a slug).
        name_lookup, slug_lookup = {}, {}
        order = {}
        for i, e in enumerate(page.get("entries", [])):
            rec = {
                "name_de": e.get("name_de", ""),
                # best-effort German one-liner from the poster "function" text
                "short_de": e.get("func_de", ""),
                "order": i,
            }
            name_lookup[e["name_en"]] = rec
            slug_lookup[slugify(e["name_en"])] = rec
            order[e["name_en"]] = i

        microbes = []
        for meta_path in sorted(set_dir.glob("*.render.meta.json")):
            meta = json.loads(meta_path.read_text())
            key = meta.get("microbe") or meta_path.name.split(".", 1)[0]
            name_en = meta.get("name", key)
            short_en = meta.get("short_description", "")

            look = name_lookup.get(name_en) or slug_lookup.get(key) or {}
            name_de = look.get("name_de") or name_en
            short_de = look.get("short_de") or short_en

            # provenance of the real micrograph: prefer the download sidecar in
            # reference-microscopy (it carries the actual source page URL); fall
            # back to the meta summary string. (attempts dirs are git-ignored, but
            # this runs at build time and the URL is baked into viewer-data.json.)
            ref_info = None
            ref_glob = (RENDERS / "reference-microscopy" / "theme").glob(
                f"*/{key}.attempts/real-*.json"
            )
            for sp in sorted(ref_glob):
                try:
                    rj = json.loads(sp.read_text())
                except Exception:
                    continue
                url = rj.get("source_page") or rj.get("source_url") or ""
                if url:
                    # a direct-image source_url can be opened in the preview itself
                    raw = rj.get("source_url", "")
                    is_img = bool(re.search(r"\.(jpe?g|png|gif|webp|avif|tiff?)(\?|$)", raw, re.I))
                    ref_info = {
                        "url": url,
                        "img": raw if is_img else "",
                        "license": rj.get("license", ""),
                        "attribution": rj.get("attribution", ""),
                        "modality": rj.get("modality", ""),
                    }
                    break
            if not ref_info:
                r = meta.get("reference") or {}
                ref_info = {"url": "", "license": r.get("styles", ""),
                            "attribution": "", "modality": ""}

            # descriptions (six audience blocks)
            desc = {"kids": {}, "adults": {}, "sci": {}}
            dpath = set_dir / f"{key}.descriptions.json"
            if dpath.exists():
                d = json.loads(dpath.read_text())
                for aud in ("kids", "adults", "sci"):
                    desc[aud] = {
                        "en": d.get(f"{aud}_en", ""),
                        "de": fix_de(d.get(f"{aud}_de", "")),
                    }

            # present final images (existence check, relative to HERE)
            img = {}
            finals = set_dir / "finals"
            for st in IMG_STYLES:
                p = finals / f"{key}__{st}.avif"
                if p.exists():
                    img[st] = p.relative_to(HERE).as_posix()

            # kids' black-and-white coloring page (self-contained vector SVG)
            col_path = set_dir / "coloring" / f"{key}.coloring.svg"
            coloring = col_path.relative_to(HERE).as_posix() if col_path.exists() else ""

            # kids' text-to-speech narration (mp3 + word-level timing for
            # karaoke-style highlighting during playback), EN + DE
            audio = {}
            for lang in ("en", "de"):
                abase = set_dir / "audio" / f"{key}.kids-{lang}"
                amp3, ajson = abase.with_name(abase.name + ".mp3"), abase.with_name(abase.name + ".json")
                if amp3.exists() and ajson.exists():
                    try:
                        words = json.loads(ajson.read_text())
                    except Exception:
                        words = []
                    audio[lang] = {"src": amp3.relative_to(HERE).as_posix(), "words": words}

            # present labelled SVGs (kept as a lightbox fallback) + the compact
            # label geometry, which the viewer renders live as an overlay on the
            # small AVIF final (the committed .svg files embed the full raster and
            # are far too heavy to load many of).
            svg = {}
            lab = {}
            for st in SVG_STYLES:
                p = set_dir / "theme" / st / f"{key}.{st}.svg"
                if p.exists():
                    svg[st] = p.relative_to(HERE).as_posix()
                lp = set_dir / "theme" / st / f"{key}.labels.json"
                if lp.exists():
                    lj = json.loads(lp.read_text())
                    items = [
                        {k: it[k] for k in ("ax", "ay", "tx", "ty", "la", "en", "de")}
                        for it in lj.get("labels", [])
                    ]
                    if items:
                        lab[st] = {
                            "w": lj.get("width", 1080),
                            "h": lj.get("height", 1080),
                            "fill": lj.get("text_fill", "#ffffff"),
                            "stroke": lj.get("text_stroke", "#000000"),
                            "items": items,
                        }

            # search blob: name + one-liner + all six descriptions, lowercased
            blob = " ".join(
                [name_en, name_de, short_en, short_de]
                + [desc[a][l] for a in desc for l in ("en", "de")]
            ).lower()

            # size/weight scale meter (see microbe_scale.py) — omitted if the
            # key has no entry there rather than guessing a placeholder value
            scale = None
            if key in SCALE:
                size_um, w_val, w_unit = SCALE[key]
                scale = {
                    "size_um": size_um,
                    "weight_val": w_val,
                    "weight_unit": w_unit,
                    "weight_class": weight_class(weight_pg(w_val, w_unit)),
                }

            # matching GIANTmicrobes plush photo, if one was copied in under
            # renders/set/<set>/giant/<key>.* (see microbe_giant.py)
            giant = None
            if key in GIANT:
                gp = next(iter((set_dir / "giant").glob(f"{key}.*")), None)
                if gp:
                    gm_name, gm_url = GIANT[key]
                    giant = {"img": gp.relative_to(HERE).as_posix(), "name": gm_name,
                             "url": gm_url, "cleaned": key in AI_CLEANED}

            microbes.append(
                {
                    "key": key,
                    "name": {"en": name_en, "de": name_de},
                    "short": {"en": short_en, "de": short_de},
                    "desc": desc,
                    "img": img,
                    "svg": svg,
                    "lab": lab,
                    "coloring": coloring,
                    "audio": audio,
                    "ref": ref_info,
                    "scale": scale,
                    "giant": giant,
                    "search": blob,
                    "_order": look.get("order", order.get(name_en, 10_000)),
                }
            )

        # order microbes by cells_data entry order, unmatched extras appended
        microbes.sort(key=lambda m: (m.pop("_order"), m["key"]))
        total_microbes += len(microbes)

        # the set's own kids-mode narration (same pipeline as per-microbe audio,
        # keyed with a leading underscore so it can't collide with a microbe key)
        set_audio = {}
        for lang in ("en", "de"):
            abase = set_dir / "audio" / f"_set-intro.kids-{lang}"
            amp3, ajson = abase.with_name(abase.name + ".mp3"), abase.with_name(abase.name + ".json")
            if amp3.exists() and ajson.exists():
                try:
                    words = json.loads(ajson.read_text())
                except Exception:
                    words = []
                set_audio[lang] = {"src": amp3.relative_to(HERE).as_posix(), "words": words}

        sets_out.append(
            {
                "id": page["id"],
                "folder": folder,
                "title": {"en": page["title_en"], "de": page["title_de"]},
                "subtitle": {
                    "en": page.get("subtitle_en", ""),
                    "de": page.get("subtitle_de", ""),
                },
                "desc": {
                    "kids": {
                        "en": page.get("description_kids_en", ""),
                        "de": fix_de(page.get("description_kids_de", "")),
                    },
                    "adults": {
                        "en": page.get("description_adults_en", ""),
                        "de": fix_de(page.get("description_adults_de", "")),
                    },
                    "sci": {
                        "en": page.get("description_en", ""),
                        "de": fix_de(page.get("description_de", "")),
                    },
                },
                "audio": set_audio,
                "microbes": microbes,
            }
        )

    data = {"sets": sets_out}
    DATA_OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1))

    # inline the data into the template
    tpl = TEMPLATE.read_text()
    if "__DATA__" not in tpl:
        sys.exit("ERROR: template has no __DATA__ placeholder")
    compact = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    # Guard against a literal "</script>" inside prose closing the data block.
    # "<\/" is a valid JSON escape of "/", so structure stays intact.
    compact = compact.replace("</", "<\\/")
    HTML_OUT.write_text(tpl.replace("__DATA__", compact))

    print(f"wrote {DATA_OUT.name}: {len(sets_out)} sets, {total_microbes} microbes")
    print(f"wrote {HTML_OUT.name}")


if __name__ == "__main__":
    build()
