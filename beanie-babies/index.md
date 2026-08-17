# Ty Beanie Baby Birthday Calendar

A full year of Ty Beanie Baby birthdays, parsed straight from
[ty.com's own birthday calendar tool](https://www.ty.com/birthdaycalendar.html?lang=en)
(which turned out to be a small Nuxt app at `tools.ty.com` backed by a JSON API,
`GET /api/birthday-calendar/month/{1-12}`). Every Beanie Baby with a birthday —
2,779 of them — with its photo downloaded locally (AVIF, transparent background),
marked as **current**, **out of stock**, or **retired**, classified by
**product type** (Beanie Baby, Beanie Boo, Beanie Belly, Slipper, Clip/Keychain,
Sparkle/Sequin Beanie, and more), and tagged with structured details (animal
type, colors, patterns, size, retailer exclusive) plus, for all 324 current
items, the real marketing description fetched from ty.com's own product page
(far richer than anything derivable from the calendar API's terse "NAME -
description" text, and often the only place the animal/species is actually
named). Current items link straight to their product page on ty.com.

- [**catalog.html**](catalog.html) — the interactive, all-in-one browser. A
  sticky header with a collapsible options panel holds every control:
  display mode (by birthday, by release date, by name, or a real monthly
  wall calendar for this year or next — each with an up/down sort-order
  toggle except the calendar), a print/screen layout switch with a columns
  slider and an independent text-size slider, light/dark theme, dedup (by
  name or name+year, keeping the oldest or newest variant), a free-text
  search that matches name, description, animal type, color, pattern, size
  and retailer/region exclusive (with a singular/plural fallback), and
  multi-select status/product-type filters. "Display Options" lets you
  show/hide year, product type, animal type and description (clamped to 3
  lines by default -- hover or tap a description to expand it in place, or
  turn on "Show Full Description" to never clamp), show product/animal type
  inline in the name or as a label, and show status as section headers, as
  per-item labels, or hidden. Click a photo for a full-size preview with
  arrow-key/swipe navigation and a slide animation, plus the full name,
  description, product type, year and status; hover for a smaller preview.
  Every setting persists to `localStorage`. The whole dataset is
  base64-embedded in the page, so it works opened directly from disk
  (`file://`) — no server needed. Print via the browser's own Ctrl/Cmd+P
  (page numbers included); the monthly-calendar view starts each month on
  its own page.
- [`images/`](images/) — every downloaded product photo (AVIF), named by item
  number. 18 items had permanently dead image URLs on ty.com's own CDN; 10 of
  those were manually found and verified via web search (see
  `scripts/integrate_found_images.py`), the remaining 8 show a 🧸 placeholder.
- [`scripts/`](scripts/) — the pipeline that built this: `fetch_calendar_data.py`
  (hits the API for all 12 months and classifies each item), `verify_links.py`
  (confirms each current item's product page actually resolves before linking
  it), `download_images.py` (pulls every photo), `convert_to_avif.py`
  (AVIF + transparency), `classify_product_types.py` (fetches ty.com's own
  catalog category listings as ground truth, falls back to keyword rules for
  retired items), `extract_descriptions.py` (derives colors, patterns, size
  and retailer-exclusive from each item's description),
  `fetch_product_descriptions.py` (fetches the real marketing description
  for every current item from its ty.com product page),
  `classify_animal_types.py` (derives animal type from both the calendar-API
  text and, when available, that richer product description),
  `integrate_found_images.py` (the 10 manually-sourced replacement photos),
  and `generate_unified_catalog.py` (renders `catalog.html` from
  `calendar_data.json.gz`).

## By the numbers

- 287 current and in stock
- 37 current but out of stock
- 2,455 retired
- 1,715 unique names (2,779 items counting every colorway/reissue)
- 2,406 items tagged with at least one animal type

## Data quality note

19 "State Beanie" bears (Kansas, Georgia, Wisconsin, Florida, etc.) have their
birthday set to their US state's actual statehood date in ty.com's own data —
but the year was corrupted for most of them (e.g. Wisconsin showed birth year
2048 instead of 1848; the month/day, May 29, is genuinely Wisconsin's
statehood anniversary). Verified against real statehood dates and corrected
in `calendar_data.json.gz`; see `birth_date_note` on the affected items.

## Note on rebuilding

This isn't wired into a CI auto-rebuild workflow — it depends on ty.com's live
catalog and re-running it later would just produce diffs from stock/retirement
changes over time, not from anything in this repo. Re-run the scripts manually
if you want a fresh snapshot, roughly in this order: `fetch_calendar_data.py`,
`verify_links.py`, `download_images.py`, `convert_to_avif.py`,
`classify_product_types.py`, `extract_descriptions.py`,
`fetch_product_descriptions.py`, `classify_animal_types.py`, then
`generate_unified_catalog.py`.
