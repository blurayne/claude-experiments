#!/usr/bin/env python3
"""Extract structured description/details from web_display_name for every
item in calendar_data.json.gz, and add them as new fields:

  description         -- the raw text after "NAME - " (already implicit,
                          stored explicitly so downstream code/search
                          doesn't need to re-split it)
  colors               -- list of canonical colors mentioned (data-driven
                          from word frequency across all descriptions)
  patterns             -- list of pattern/texture words (sequin, reversible,
                          spotted, striped, tie-dye, ...)
  size                 -- canonical size if mentioned (small/medium/large/
                          regular/teeny/mini/xl), else null
  retailer_exclusive   -- raw text of any "(...)" parenthetical (usually a
                          retailer or region exclusive marker), else null

All of these, plus the existing product_type and animal_types, feed into
catalog.html's search box.
"""
import gzip
import json
import re

COLOR_KEYWORDS = {
    "pink": ["pink"],
    "white": ["white"],
    "brown": ["brown"],
    "black": ["black"],
    "blue": ["blue"],
    "grey": ["grey", "gray"],
    "purple": ["purple"],
    "green": ["green"],
    "multicolor": ["multicolor", "multicolored", "mutlicolored", "multi"],
    "orange": ["orange"],
    "tan": ["tan"],
    "gold": ["gold", "golden"],
    "yellow": ["yellow"],
    "red": ["red"],
    "lavender": ["lavender"],
    "aqua": ["aqua"],
    "coral": ["coral"],
    "cream": ["cream"],
    "silver": ["silver"],
    "beige": ["beige"],
    "platinum": ["platinum"],
    "mint": ["mint"],
    "turquoise": ["turquoise"],
    "lilac": ["lilac"],
    "magenta": ["magenta"],
    "teal": ["teal"],
    "rainbow": ["rainbow"],
    "pastel": ["pastel"],
}

PATTERN_KEYWORDS = {
    "sequin": ["sequin"],
    "reversible": ["reversible"],
    "sparkle": ["sparkle"],
    "glow": ["glow"],
    "glitter": ["glitter"],
    "iridescent": ["iridescent"],
    "spotted": ["spotted", "speckled"],
    "striped": ["striped", "stripe", "stripes"],
    "polka dot": ["polka"],
    "tie-dye": ["dye", "dyed"],
    "two-tone": ["tone"],
    "foil": ["foil"],
    "checkered": ["checkered", "chevron"],
    "printed": ["printed"],
}

SIZE_KEYWORDS = {
    "teeny": ["teeny"],
    "mini": ["mini"],
    "small": ["small", "sml", "s"],
    "medium": ["medium", "med", "m"],
    "large": ["large", "lrg", "l"],
    "xl": ["xl", "xxl"],
    "regular": ["reg"],
}
# size words that are single letters need word-boundary + context care;
# handled specially below (only matched inside an explicit S/M/L combo).

PAREN_RE = re.compile(r"\(([^)]+)\)")
WORD_RE = re.compile(r"[a-z']+")


def build_lookup(keyword_map):
    lookup = {}
    for canonical, keywords in keyword_map.items():
        for kw in keywords:
            lookup[kw] = canonical
    return lookup


COLOR_LOOKUP = build_lookup(COLOR_KEYWORDS)
PATTERN_LOOKUP = build_lookup(PATTERN_KEYWORDS)


def split_description(web_display_name):
    idx = web_display_name.find(" - ")
    if idx == -1:
        return ""
    return web_display_name[idx + 3:]


def strip_parens(text):
    return PAREN_RE.sub("", text)


def extract_retailer_exclusive(web_display_name):
    matches = PAREN_RE.findall(web_display_name)
    return "; ".join(matches) if matches else None


def extract_tagged(text, lookup):
    words = WORD_RE.findall(text.lower())
    found = []
    for w in words:
        canonical = lookup.get(w)
        if canonical and canonical not in found:
            found.append(canonical)
    return found


def extract_size(text):
    lowered = text.lower()
    # explicit combos like "S/M/L" or "slides S/M/L" -> multiple sizes offered
    if re.search(r"\bs\s*/\s*m\s*/\s*l\b", lowered):
        return "small/medium/large"
    words = WORD_RE.findall(lowered)
    for w in words:
        for canonical, keywords in SIZE_KEYWORDS.items():
            if w in keywords and len(w) > 1:  # skip bare single-letter tokens
                return canonical
    return None


def main():
    with gzip.open("calendar_data.json.gz", "rt") as f:
        items = json.load(f)

    n_desc = n_color = n_pattern = n_size = n_retailer = 0
    for item in items:
        name = item["web_display_name"]
        desc = split_description(name)
        clean_desc = strip_parens(desc).strip()
        item["description"] = clean_desc
        item["colors"] = extract_tagged(clean_desc, COLOR_LOOKUP)
        item["patterns"] = extract_tagged(clean_desc, PATTERN_LOOKUP)
        item["size"] = extract_size(desc)
        item["retailer_exclusive"] = extract_retailer_exclusive(name)

        if clean_desc:
            n_desc += 1
        if item["colors"]:
            n_color += 1
        if item["patterns"]:
            n_pattern += 1
        if item["size"]:
            n_size += 1
        if item["retailer_exclusive"]:
            n_retailer += 1

    with gzip.open("calendar_data.json.gz", "wt") as f:
        json.dump(items, f, indent=2)

    total = len(items)
    print(f"Processed {total} items:")
    print(f"  with description: {n_desc}")
    print(f"  with color(s): {n_color}")
    print(f"  with pattern(s): {n_pattern}")
    print(f"  with size: {n_size}")
    print(f"  with retailer_exclusive: {n_retailer}")


if __name__ == "__main__":
    main()
