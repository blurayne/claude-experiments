#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
"""Merge the US (live + Wayback-retired) and DE catalogs into one item-per-microbe
dataset with per-locale availability, matching across languages by normalized
species/parenthetical name -- e.g. US "E. coli (Escherichia coli)" and DE "E. coli
(Escherichia coli)" share the species token "escherichia coli"; for non-biological
novelty items (organs, emotions...) the DE `species` field is often already the
English gloss (e.g. DE "Angst" has sub "Anxiety"), so the same species-equality
match also catches those.

Two passes:
  1. Exact match on normalized species/parenthetical string.
  2. Close fuzzy match (difflib, high threshold) on normalized product name, for
     pairs the species pass missed (spelling/punctuation drift).

Whatever's left after both passes is written to us_unmatched.json / de_unmatched.json
for a follow-up matching+translation pass (done separately, via LLM fan-out, since
it needs actual language understanding -- see AGENTS.md).

US precedence: canonical `name` = name_us when present, else name_de (a product
exists in the US line before, if ever, reaching riesenmikroben.de).

Writes merged_catalog.json.
"""
import json
import re
import unicodedata
from difflib import SequenceMatcher

SPECIES_RE = re.compile(r"\(([^()]+)\)\s*$")


def normalize(s):
    if not s:
        return ""
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode("ascii")
    s = re.sub(r"[^a-z0-9]+", " ", s.lower()).strip()
    return s


def us_species(name):
    m = SPECIES_RE.search(name or "")
    return normalize(m.group(1)) if m else ""


def load_us():
    with open("us_products_detailed.json") as f:
        live = json.load(f)
    try:
        with open("retired_candidates.json") as f:
            retired = json.load(f)
    except FileNotFoundError:
        retired = []

    items = []
    for r in live:
        items.append({
            "slug_us": r["slug"],
            "name_us": r["name"],
            "sku_us": r["sku"],
            "price_us": r["price"],
            "currency_us": r["currency"],
            "status_us": r["availability"],
            "description_us": r["description"],
            "image_url_us": r["image_url"],
            "image_is_fallback_thumb_us": r.get("image_is_fallback_thumb", False),
            "categories_us": r["categories"],
            "product_url_us": r["product_url"],
            "species": us_species(r["name"]),
        })
    for r in retired:
        parsed = r.get("parsed") or {}
        name = parsed.get("name", r["slug"])
        items.append({
            "slug_us": r["slug"],
            "name_us": name,
            "sku_us": parsed.get("sku", ""),
            "price_us": parsed.get("price"),
            "currency_us": parsed.get("currency", "USD"),
            "status_us": "retired",
            "description_us": parsed.get("description", ""),
            "image_url_us": parsed.get("image_url", ""),
            "image_is_fallback_thumb_us": parsed.get("parse_method") != "jsonld",
            "categories_us": [],
            "product_url_us": f"https://www.giantmicrobes.com/us/products/{r['slug']}.html",
            "species": us_species(name),
            "first_seen_us": r["first_seen"],
            "last_seen_us": r["last_seen"],
            "date_confidence_us": r["date_confidence"],
            "needs_extraction": parsed is None or parsed.get("parse_method") == "fallback_meta",
        })
    return items


def load_de():
    with open("de_products_detailed.json") as f:
        rows = json.load(f)
    items = []
    for r in rows:
        items.append({
            "slug_de": r["slug"],
            "name_de": r["name_de"],
            "price_de": r["price"],
            "currency_de": r["currency"],
            "status_de": r["status"],
            "description_de": r.get("description_de", ""),
            "size_de": r.get("size", ""),
            "image_url_de": r["image_url"],
            "categories_de": r["categories"],
            "product_url_de": r["product_url"],
            "species": normalize(r["species"]),
        })
    return items


def fuzzy_best_match(name, candidates, threshold=0.85):
    norm = normalize(name)
    best, best_score = None, 0.0
    for cand in candidates:
        score = SequenceMatcher(None, norm, normalize(cand["name_de"])).ratio()
        if score > best_score:
            best, best_score = cand, score
    return best if best_score >= threshold else None


def main():
    us_items = load_us()
    de_items = load_de()

    de_by_species = {}
    for d in de_items:
        if d["species"]:
            de_by_species.setdefault(d["species"], []).append(d)

    merged = []
    matched_de_slugs = set()

    unmatched_us = []
    for u in us_items:
        candidates = de_by_species.get(u["species"], []) if u["species"] else []
        match = candidates[0] if len(candidates) == 1 else None
        if match is None and candidates:
            # multiple DE items share this species (e.g. colour variants) -- try
            # the closest name among them instead of guessing.
            match = fuzzy_best_match(u["name_us"], candidates, threshold=0.5)
        if match:
            matched_de_slugs.add(match["slug_de"])
            merged.append({**u, **match, "match_method": "species"})
        else:
            unmatched_us.append(u)

    unmatched_de = [d for d in de_items if d["slug_de"] not in matched_de_slugs]

    # Fuzzy name pass for leftovers.
    still_unmatched_us = []
    for u in unmatched_us:
        match = fuzzy_best_match(u["name_us"], unmatched_de, threshold=0.85)
        if match and match["slug_de"] not in matched_de_slugs:
            matched_de_slugs.add(match["slug_de"])
            merged.append({**u, **match, "match_method": "fuzzy_name"})
        else:
            still_unmatched_us.append(u)

    still_unmatched_de = [d for d in unmatched_de if d["slug_de"] not in matched_de_slugs]

    for u in still_unmatched_us:
        merged.append({**u, "status_de": "not_offered", "match_method": None})
    for d in still_unmatched_de:
        merged.append({**d, "status_us": "not_offered", "match_method": None})

    for m in merged:
        m["name"] = m.get("name_us") or m.get("name_de")

    merged.sort(key=lambda m: normalize(m["name"]))

    with open("merged_catalog.json", "w") as f:
        json.dump(merged, f, indent=2, ensure_ascii=False)

    with open("us_unmatched.json", "w") as f:
        json.dump(still_unmatched_us, f, indent=2, ensure_ascii=False)
    with open("de_unmatched.json", "w") as f:
        json.dump(still_unmatched_de, f, indent=2, ensure_ascii=False)

    print(f"Merged catalog: {len(merged)} items")
    print(f"  Matched (species): {sum(1 for m in merged if m['match_method'] == 'species')}")
    print(f"  Matched (fuzzy name): {sum(1 for m in merged if m['match_method'] == 'fuzzy_name')}")
    print(f"  US-only (no DE match): {len(still_unmatched_us)}")
    print(f"  DE-only (no US match): {len(still_unmatched_de)}")


if __name__ == "__main__":
    main()
