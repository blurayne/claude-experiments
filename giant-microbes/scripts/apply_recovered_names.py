#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.10"
# dependencies = []
# ///
"""Fold researched product names into merged_catalog.json, conservatively.

130 records carry only their URL slug as a name — retired products whose Wayback
snapshots never yielded a title. Research agents proposed names for most of them.
Two failure modes make it unsafe to write those in as-is:

1. **Unsourced names.** Some records came back with a confident name and
   `source_kind: "none"`. A name nobody read anywhere is a guess; it is dropped.

2. **Format collapse.** The catalog sells the same microbe as a plush, a Gigantic,
   a Petri Dish, a key chain and a 12-pack. Agents repeatedly returned the *base*
   product name for a variant slug — `bedbug-petri` and `bedbug-gigantic` both came
   back as "Bed Bug", sourced from one listing for the ordinary plush. Accepting
   that would silently merge five distinct products into one name. So a name is
   only accepted if it carries whatever format qualifier the slug carries.

Everything that fails those checks falls back to a readable title-cased slug,
flagged `name_is_derived_from_slug` so nothing downstream mistakes it for the
retailer's own copy — the same convention `name_de_is_translation` already uses.
"""

import glob
import json
import os
import re

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CATALOG = os.path.join(HERE, "merged_catalog.json")
DEFAULT_GLOB = "/tmp/gm_out/names_batch*.json"

# slug token -> what the recovered name must mention for the name to be trusted
FORMAT_TOKENS = {
    "petri": ("petri",),
    "gigantic": ("gigantic", "giant "),
    "xl": ("xl", "gigantic"),
    "kc": ("key chain", "keychain", "key-chain"),
    "keychain": ("key chain", "keychain", "key-chain"),
    "pack": ("pack", "set"),
    "earrings": ("earring",),
    "necklace": ("necklace", "pendant"),
    "ornament": ("ornament",),
    "mug": ("mug",),
    "putty": ("putty",),
    "vinyl": ("vinyl",),
    "sticker": ("sticker",),
    "tie": ("tie",),
    "puzzle": ("puzzle", "jigsaw"),
    "mini": ("mini",),
    "box": ("box", "set", "deluxe"),
    "deluxe": ("deluxe", "set", "box"),
}

SMALL_WORDS = {"a", "an", "and", "the", "of", "for", "with", "in", "on", "to"}


def derived_name(slug):
    words = re.split(r"[-_]+", slug)
    out = []
    for n, w in enumerate(words):
        if not w:
            continue
        if w.lower() in SMALL_WORDS and n > 0:
            out.append(w.lower())
        elif len(w) <= 3 and w.isalpha() and w.lower() in {"xl", "kc", "hiv", "hpv", "std", "tb", "dna", "rna", "ai"}:
            out.append(w.upper())
        else:
            out.append(w[:1].upper() + w[1:])
    return " ".join(out)


def format_ok(slug, name):
    """Does the proposed name keep every format qualifier the slug carries?"""
    low = name.lower()
    tokens = set(re.split(r"[-_]+", slug.lower()))
    for token, needles in FORMAT_TOKENS.items():
        if token in tokens and not any(nd in low for nd in needles):
            return False, token
    return True, None


def main():
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument("--glob", default=DEFAULT_GLOB)
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    proposals = {}
    for path in sorted(glob.glob(args.glob)):
        if "draft" in path:
            continue
        for rec in json.load(open(path)):
            if rec.get("slug"):
                proposals[rec["slug"]] = rec

    catalog = json.load(open(CATALOG))
    stats = {"accepted": 0, "derived": 0, "no_proposal": 0,
             "rejected_unsourced": 0, "rejected_format": 0, "descriptions_added": 0,
             "species_added": 0}
    examples = {"accepted": [], "rejected_format": [], "rejected_unsourced": []}

    for item in catalog:
        slug = item.get("slug_us")
        if not slug or item.get("name") != slug:
            continue                                   # already has a real name
        p = proposals.get(slug)
        fallback = derived_name(slug)

        if not p:
            stats["no_proposal"] += 1
            chosen, source = fallback, None
        else:
            official = (p.get("official_name") or "").strip()
            source = p.get("source")
            kind = p.get("source_kind")
            if not official:
                chosen, source = fallback, None
            elif not source or kind in (None, "none"):
                stats["rejected_unsourced"] += 1
                examples["rejected_unsourced"].append((slug, official))
                chosen, source = fallback, None
            else:
                ok, missing = format_ok(slug, official)
                if not ok:
                    stats["rejected_format"] += 1
                    examples["rejected_format"].append((slug, official, missing))
                    chosen, source = fallback, None
                else:
                    chosen = official

        if source:
            stats["accepted"] += 1
            examples["accepted"].append((slug, chosen))
            item["name"] = chosen
            item["name_us"] = chosen
            item["name_source"] = source
            item["name_source_kind"] = p.get("source_kind")
            item["name_recovery_confidence"] = p.get("confidence")
            item.pop("name_is_derived_from_slug", None)
            if p.get("species") and not item.get("species"):
                item["species"] = p["species"]
                stats["species_added"] += 1
            if p.get("description") and not item.get("description_us"):
                item["description_us"] = p["description"]
                item["description_source"] = source
                stats["descriptions_added"] += 1
        else:
            stats["derived"] += 1
            item["name"] = chosen
            item["name_us"] = chosen
            item["name_is_derived_from_slug"] = True

    for k, v in stats.items():
        print(f"  {k:22s} {v}")
    for label in ("accepted", "rejected_format", "rejected_unsourced"):
        if examples[label]:
            print(f"\n{label} (first 6):")
            for e in examples[label][:6]:
                print("   ", e)

    if args.dry_run:
        print("\n--dry-run: merged_catalog.json not written")
        return
    json.dump(catalog, open(CATALOG, "w"), indent=2, ensure_ascii=False)
    print("\nmerged_catalog.json updated")


if __name__ == "__main__":
    main()
