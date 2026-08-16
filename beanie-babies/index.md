# Ty Beanie Baby Birthday Calendar

A full year of Ty Beanie Baby birthdays, parsed straight from
[ty.com's own birthday calendar tool](https://www.ty.com/birthdaycalendar.html?lang=en)
(which turned out to be a small Nuxt app at `tools.ty.com` backed by a JSON API,
`GET /api/birthday-calendar/month/{1-12}`). Every Beanie Baby with a birthday —
2,779 of them — with its photo downloaded locally (AVIF, transparent background),
marked as **current**, **out of stock**, or **retired**, and classified by
**product type** (Beanie Baby, Beanie Boo, Beanie Belly, Slipper, Clip/Keychain,
Sparkle/Sequin Beanie, and more — see `scripts/classify_product_types.py`).
Current items link straight to their product page on ty.com.

- [**catalog.html**](catalog.html) — the interactive, all-in-one browser.
  Switch between three views (by birthday day/month, by release date, or a
  real monthly wall calendar for this year or next), toggle light/dark theme
  and a print/screen layout with an adjustable cell-size slider, search by
  keyword, deduplicate by name or name+year (keeping the oldest or newest
  variant), filter by status and product type (multi-select), and click any
  photo for a full-size preview (hover for a smaller one). Every setting is
  remembered in `localStorage`. The whole dataset is embedded in the page, so
  it works opened directly from disk (`file://`) — no server needed. Print via
  the browser's own Ctrl/Cmd+P; the monthly-calendar view starts each month on
  its own page.
- [**calendar.html**](calendar.html) — the original styled, browsable version.
  Bright TY-red/sunny-yellow styling, a sticky month jump bar, checkboxes to
  filter by Current / Out of Stock / Retired, and a toggle to sort by
  month+day or by full birthday (year).
- [**calendar.md**](calendar.md) — the same data as a plain markdown table,
  one section per month, with separate Month/Day/Birthday columns.
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
  retired items), `integrate_found_images.py` (the 10 manually-sourced
  replacement photos), and `generate_markdown.py` / `generate_html.py` /
  `generate_unified_catalog.py` (render the three output files from
  `calendar_data.json.gz`).

## By the numbers

- 287 current and in stock
- 37 current but out of stock
- 2,455 retired
- 1,715 unique names (2,779 items counting every colorway/reissue)

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
`classify_product_types.py`, then the three `generate_*.py` renderers.
