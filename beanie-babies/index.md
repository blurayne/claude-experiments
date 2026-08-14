# Ty Beanie Baby Birthday Calendar

A full year of Ty Beanie Baby birthdays, parsed straight from
[ty.com's own birthday calendar tool](https://www.ty.com/birthdaycalendar.html?lang=en)
(which turned out to be a small Nuxt app at `tools.ty.com` backed by a JSON API,
`GET /api/birthday-calendar/month/{1-12}`). Every Beanie Baby with a birthday —
2,779 of them — with its photo downloaded locally and marked as **current**,
**out of stock**, or **retired**. Current items link straight to their product
page on ty.com.

- [**calendar.html**](calendar.html) — the styled, browsable version. Bright
  TY-red/sunny-yellow styling, a sticky month jump bar, and checkboxes to
  filter by Current / Out of Stock / Retired.
- [**calendar.md**](calendar.md) — the same data as a plain markdown table,
  one section per month.
- [`images/`](images/) — every downloaded product photo, named by item number.
- [`scripts/`](scripts/) — the pipeline that built this: `fetch_calendar_data.py`
  (hits the API for all 12 months and classifies each item), `verify_links.py`
  (confirms each current item's product page actually resolves before linking
  it), `download_images.py` (pulls every photo), and
  `generate_markdown.py` / `generate_html.py` (render the two calendar files
  from `calendar_data.json`).

## By the numbers

- 287 current and in stock
- 37 current but out of stock
- 2,455 retired

## Note on rebuilding

This isn't wired into a CI auto-rebuild workflow — it depends on ty.com's live
catalog and re-running it later would just produce diffs from stock/retirement
changes over time, not from anything in this repo. Re-run the scripts manually
(in order: `fetch_calendar_data.py`, `verify_links.py`, `download_images.py`,
`generate_markdown.py`, `generate_html.py`) if you want a fresh snapshot.
