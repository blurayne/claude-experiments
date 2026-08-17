#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
"""Fold the LLM-assisted matching+translation pass (llm_matches.json, produced by
the gm-match-translate Workflow) into merged_catalog.json.

Deterministic species/name matching (match_us_de_availability.py) only found 69 of
the 1056 items in both catalogs -- most of the rest are genuinely single-locale
(accessory formats like keychains/stickers that riesenmikroben.de doesn't carry),
but some are the same product with names that just don't share a machine-comparable
string (translated species, differently-worded descriptors). This pass asked an LLM
to (a) find those semantic matches and (b) translate the name of every item that's
still single-locale after that, so the catalog UI's US/DE language toggle has
something to show on both sides for every item -- machine-translated names are
flagged with a `name_*_is_translation` field so the catalog can (optionally) mark
them as such rather than implying they're riesenmikroben.de's/giantmicrobes.com's
own copy.

Writes merged_catalog.json back in place.
"""
import json

with open("merged_catalog.json") as f:
    items = json.load(f)
with open("llm_matches.json") as f:
    llm = json.load(f)

by_slug_us = {i["slug_us"]: i for i in items if i.get("slug_us") and not i.get("slug_de")}
by_slug_de = {i["slug_de"]: i for i in items if i.get("slug_de") and not i.get("slug_us")}

merged_pairs = 0
translated_de = 0
translated_us = 0

for m in llm["matches"]:
    us_item = by_slug_us.get(m["slug"])
    if us_item is None:
        continue
    if m.get("matched_de_slug"):
        de_item = by_slug_de.get(m["matched_de_slug"])
        if de_item is None:
            continue
        merged = {**us_item, **de_item, "match_method": "llm", "match_confidence": m.get("confidence")}
        merged["name"] = merged.get("name_us") or merged.get("name_de")
        items.remove(us_item)
        items.remove(de_item)
        items.append(merged)
        del by_slug_us[m["slug"]]
        del by_slug_de[m["matched_de_slug"]]
        merged_pairs += 1
    elif m.get("german_translation"):
        us_item["name_de"] = m["german_translation"]
        us_item["name_de_is_translation"] = True
        translated_de += 1

for t in llm["deTranslations"]:
    de_item = by_slug_de.get(t["slug"])
    if de_item is None:
        continue
    de_item["name_us"] = t["english_translation"]
    de_item["name_us_is_translation"] = True
    translated_us += 1

with open("merged_catalog.json", "w") as f:
    json.dump(items, f, indent=2, ensure_ascii=False)

print(f"Merged {merged_pairs} additional US/DE pairs via LLM matching")
print(f"Added German translations to {translated_de} US-only items")
print(f"Added English translations to {translated_us} DE-only items")
print(f"Final merged catalog size: {len(items)} items")
