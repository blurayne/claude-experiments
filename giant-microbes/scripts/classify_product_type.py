#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
"""Derive a `product_type` for every item in merged_catalog.json.

GIANTmicrobes sells the same "microbe" across many physical formats, not just the
classic plush. Keyword rules run against the US slug/name first (most reliable,
consistent English vocabulary across 15+ years of the catalog), falling back to DE
category codes (Schluesselanhaenger/XL-Mikroben/RIESENmikroben) for DE-only items.
Order matters -- more specific formats are checked before the generic "Plush"
fallback.

Writes merged_catalog.json back in place with `product_type` added.
"""
import json
import re

# Physical formats that are never *also* a keychain go first, because the
# Keychain rule below is greedy: it matches the `-kc` slug fragment anywhere.
# Without these, 47 petri dishes, 11 necklaces, 7 ties and 7 putties fell
# through to the "Plush" fallback and shipped as plush toys. (A "Vinyl Key
# Chain" genuinely is a keychain, so Vinyl deliberately stays *after* it.)
RULES = [
    ("Petri Dish", re.compile(r"petri", re.I)),
    ("Putty", re.compile(r"\bputty\b", re.I)),
    ("Soap", re.compile(r"\bsoap\b", re.I)),
    ("Tie", re.compile(r"\btie\b|necktie|bow[-_ ]?tie", re.I)),
    ("Necklace", re.compile(r"necklace|pendant", re.I)),
    ("Bracelet", re.compile(r"bracelet", re.I)),
    ("Glassware", re.compile(r"stemmed[-_ ]?glass|water[-_ ]?glass|\bpint\b|\btumbler\b", re.I)),
    ("Tube", re.compile(r"\btube\b", re.I)),
    ("Apparel", re.compile(r"t-shirt|tshirt|\bhoodie\b|\bsocks\b|\bscrub\b", re.I)),
    ("Gift Card", re.compile(r"gift[-_ ]?card", re.I)),
    ("Keychain", re.compile(r"\bkc\b|key[-_ ]?chain", re.I)),
    ("Sticker", re.compile(r"sticker", re.I)),
    ("Ornament", re.compile(r"ornament", re.I)),
    ("Magnet", re.compile(r"magnet", re.I)),
    ("Patch", re.compile(r"\bpatch\b", re.I)),
    ("Pin", re.compile(r"\bpin\b", re.I)),
    ("Mug", re.compile(r"\bmug\b", re.I)),
    ("Coaster", re.compile(r"coaster", re.I)),
    ("Puzzle", re.compile(r"puzzle|jigsaw", re.I)),
    ("Earrings", re.compile(r"earring", re.I)),
    ("Phone/Tech Case", re.compile(r"airpods|case-cover|phone case", re.I)),
    ("Skull Model", re.compile(r"skull", re.I)),
    ("Vinyl Figure", re.compile(r"vinyl", re.I)),
    ("Mini Plush", re.compile(r"\bmini\b|minis\b", re.I)),
    ("Gift/Deluxe Box Set", re.compile(r"gift-box|giftbox|deluxe|bundle|-pack\b|\bpack1|\bset\b", re.I)),
    ("XL/Gigantic Plush", re.compile(r"\bxl\b|gigantic", re.I)),
]

DE_CATEGORY_TYPE = {
    "Schluesselanhaenger": "Keychain",
    "XL-Mikroben": "XL/Gigantic Plush",
}


def classify(item):
    haystack = " ".join(filter(None, [
        item.get("slug_us", ""),
        item.get("name_us", ""),
    ]))
    for label, pattern in RULES:
        if pattern.search(haystack):
            return label

    for cat in item.get("categories_de", []):
        if cat in DE_CATEGORY_TYPE:
            return DE_CATEGORY_TYPE[cat]

    return "Plush"


def main():
    with open("merged_catalog.json") as f:
        items = json.load(f)

    for item in items:
        item["product_type"] = classify(item)

    with open("merged_catalog.json", "w") as f:
        json.dump(items, f, indent=2, ensure_ascii=False)

    from collections import Counter
    counts = Counter(item["product_type"] for item in items)
    print(f"Classified {len(items)} items into {len(counts)} product types:")
    for label, n in counts.most_common():
        print(f"  {label}: {n}")


if __name__ == "__main__":
    main()
