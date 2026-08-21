# AGENTS.md — how this was built

This is a narrative log of building the GIANTmicrobes catalog: what the two sites'
actual structure turned out to be (neither was what it looked like at first glance),
what broke and why, and where an LLM was used deliberately instead of a regex.
`index.md` is the reader-facing summary; this is the build log.

## The two sites are nothing alike

**giantmicrobes.com/us** is Magento. Product pages are `/us/products/<slug>.html`,
and a `shopall/products/index` listing (Magento's own `?p=N` pagination) plus every
`/us/main/<category>` page enumerate the current catalog — `fetch_us_catalog_list.py`
crawls both, unioning the product slugs and recording which category pages each one
appeared under, since GIANTmicrobes doesn't otherwise expose "category" as a clean
per-product field the way `/main/*` navigation implies it.

About a third of live product pages (`fetch_us_product_details.py`) don't carry the
`schema.org/Product` JSON-LD block that most do — diffing a working page (`ecoli.html`,
small, has JSON-LD) against a failing one (`chocolate.html`, 800KB+, no JSON-LD, no
gallery markup of any kind, dominated by an unrelated cross-sell widget dump) showed
these are a different Magento template, used mostly for the accessory-format lines
(keychains, stickers, ornaments, gift boxes, deluxe packs, skull models) rather than
anything to do with stock status. The fix was two-layered: fall back to `<title>`/meta
description for name and description, "Out of stock" text presence for availability,
and — since these pages also don't expose a scrapeable full-size image — a *second*
fallback sourced from the small thumbnail images that already show up in the listing
pages `fetch_us_catalog_list.py` was crawling anyway (Magento serves those from a
`/media/catalog/product/cache/<hash>/...` path; stripping the `cache/<hash>/` segment
gets back to the original unresized file path). Lower resolution than the JSON-LD
path's image, but present — flagged `image_is_fallback_thumb` on the record.

**riesenmikroben.de** looked like a client-rendered SPA at first — `curl` on `/` or
`/products` returned a ~250KB app shell with no product links, and `curl` on a guessed
API route (`/products.json`) came back `406 Not Applicable`. A Playwright-driven
headless-browser probe (`playwright.chromium`, launched directly rather than via the
`chrome-devtools` MCP server, which was locked by another concurrent session on this
machine the whole time) showed the *rendered* page had the full catalog with prices —
but captured zero XHR/fetch requests. That meant it was server-rendered after all, and
the earlier `curl` output was misleading only because its content (`product/<slug>`
links, single-quoted HTML attributes like `href='/products/bandwurm?locale=de'`) didn't
match the double-quoted-`href` regex `fetch_us_catalog_list.py`'s pattern used for the
US site. Once that was noticed, plain `curl` worked fine and no browser automation was
needed for the actual scrape.

The real find: riesenmikroben.de embeds its **entire catalog — current, out-of-stock,
and retired — in the homepage HTML in one request**, using CSS/JS-driven
`display:none` toggling for client-side category filtering instead of separate pages
or API calls per category. Each product `<div class='item CLASSES' id='varN'
style='display:...'>` carries a space-separated set of short codes, and the sidebar's
own `data-filter='<code>' data-id='<n>'` links give the code → label mapping directly
from the markup:

```
s=Bestseller, n=Neue Artikel, c1=Health, c2=Maladies, c3=Probiotics, c4=Venereals,
c5=Humanities, c6=Little Creatures, c7=Little Critters, ff=Fuzzy Fossils,
b=Geschenkboxen & Andere, r=RIESENmikroben (standard line), x=XL-Mikroben,
k=Schluesselanhaenger (keychains), ar=Archiv
```

`ar` is riesenmikroben.de's own retired/archive marker — so unlike the US site, DE
retired status needed no Wayback archaeology at all, just this one homepage fetch
(`fetch_de_catalog.py`). A price is only rendered for orderable items, which
doubles as a second (redundant, confirming) signal for availability. Per-item
description/size/confirmed-stock-line come from a lightweight follow-up fetch of each
product's own detail page (`Sofort lieferbar` / `Derzeit nicht verfügbar` /
`Ausverkauft`).

## US retired-item archaeology (Wayback Machine)

giantmicrobes.com just delists retired products (404) — no archive section like DE's.
`discover_retired_products.py` queries the Internet Archive's CDX API
(`web.archive.org/cdx/search/cdx`) for every historical `/us/products/*.html` capture,
diffs that against the current live-slug set to get retired candidates (303 of them),
and fetches each one's most recent surviving snapshot (`web.archive.org/web/<ts>id_/<url>`,
the `id_` modifier returning the raw unmodified page) to extract name/description/image
the same way as a live page, with the same JSON-LD → meta-tag fallback chain. Recovery
was partial and getting a reliable fetch there took three rewrites:

1. **First attempt (plain `urllib`, 6 concurrent workers, exponential backoff on
   failure):** hung for 20+ minutes with barely any CPU time used. archive.org was
   occasionally sending `503`s under load, but the real problem was worse than that —
2. **Second attempt (same, but with a daemon-thread wrapper meant to give `urlopen` a
   real wall-clock deadline):** still hung, and *memory kept growing* the whole time.
   `urllib`'s `timeout=` parameter is an *inactivity* timeout (no data for N seconds),
   not a deadline on the total transfer — a connection that trickles bytes slowly
   enough never triggers it, and daemon-thread requests that got "abandoned" by the
   caller kept running and buffering in the background, forever, since nothing ever
   cancelled the underlying socket read.
3. **What actually worked:** shelling out to `curl --max-time N`, which *is* a real
   deadline on the whole request regardless of how the server behaves. Once that
   swapped in, 303 items finished in about 6 minutes.

Even so, 131 of 303 candidates (43%) never returned a usable snapshot at all (archive.org
genuinely has no working capture, or it's timing out even with curl), and of the 172
that did, only 12 still had the JSON-LD template; the rest needed the `<title>`/meta
fallback. Those 291 items collectively end up with only their URL slug as a name in the
final dataset (`name_us` == `slug_us`) — documented, not silently dropped, per
`index.md`'s data-quality notes. "Release date" and "retired" status derived this way
are labeled `date_confidence: "approximate"` throughout — they're bounded by what the
Wayback Machine happened to crawl, not the product's real lifecycle.

## Matching US and DE, and translating what's left (this is where the Workflow tool came in)

The user asked explicitly for this to use workflow agents where the task genuinely
needed judgment, and for a language toggle with translation rather than just "show
whatever's there." Two passes:

1. **Deterministic pass** (`match_us_de_availability.py`): normalize each item's
   trailing parenthetical/species string (`"E. coli (Escherichia coli)"` → `escherichia
   coli`) and match exact string equality across the two catalogs — works because DE's
   equivalent `sub` field holds the same scientific name for real microbes, *and*, for
   non-biological novelty items, often holds a literal English gloss instead (DE
   "Angst" has sub "Anxiety") which also matches directly. A fuzzy-name fallback
   (`difflib`, 0.85 threshold) catches near-duplicates the species match missed. This
   found only 69 of 1056 pre-merge items — expected, since riesenmikroben.de simply
   doesn't stock most of the US accessory-format catalog (keychains, stickers,
   earrings...), so most "unmatched" items are correctly single-locale, not a matching
   failure.
2. **LLM-assisted pass** (a `Workflow` script, `gm-match-translate`, run directly from
   the orchestrating session rather than as a `.py` file, since only the agent
   orchestration layer can spawn subagents): the 704 remaining US-only and 283
   remaining DE-only items were written to compact `{slug, name, species}` JSON files
   in `/tmp` (`us_compact.json`, `de_compact.json`) — deliberately *not* passed as
   in-context `args` to the workflow, since reading either file directly into the
   orchestrator's own context to relay it cost tens of thousands of tokens for no
   reason; instead every spawned agent read the files itself with its own `Read` tool,
   which doesn't touch the orchestrator's context at all. Stage A batched the US-only
   list (50 items/batch, 15 batches in parallel) against the *full* DE-only list each
   time, asking each agent to find real cross-language matches (e.g. "MRSA
   (Methicillin-resistant Staphylococcus aureus)" ↔ DE "MRSA" species "staphylococcus
   aureus"; explicitly told not to match a US keychain/sticker/accessory to a DE item
   unless the DE item was clearly that same accessory) and, for anything left
   unmatched, produce a natural German translation of the US name. Stage B then
   translated whatever DE-only items stage A didn't claim as a match into English.
   Result: 238 additional matched pairs (307 total, up from 69), 440 US-only items
   given a German name, 44 DE-only items given an English name. `apply_llm_matches.py`
   folds `llm_matches.json` back into `merged_catalog.json` — merging matched pairs
   into single records and flagging every machine-translated name with
   `name_us_is_translation` / `name_de_is_translation` so the catalog doesn't imply a
   translation is the retailer's own copy.

US takes precedence as the canonical `name` field, per the user's explicit
instruction — a product exists in the US line first, if it's ever offered elsewhere,
so `name = name_us or name_de`. The catalog's 🇺🇸/🇩🇪 toggle switches every
displayed name/description/price/status between locales live.

## Images: background removal is real work here, not a format hop

beanie-babies' ty.com photos were already pre-cut transparent PNGs; GIANTmicrobes'
product photos are plain studio shots on a white background. `remove_background.py`
runs `rembg` (the `u2net` ONNX model, ~176MB, downloaded on first run) over every
downloaded photo before AVIF conversion. One real bug here: the script renamed files
on disk (`.jpg` → `.png`) but the first version never updated `merged_catalog.json`'s
`image_file` field to match — so `convert_to_avif.py`'s own rename-tracking (which
diffs old vs. new *basenames* to patch the dataset) was comparing against a filename
that no longer existed, and every single image reference in the dataset silently went
stale, pointing at a deleted file. Caught by an actual browser check (Playwright
navigating the generated `catalog.html` and asserting `.loaded` image count > 0, not
just "the script exited 0") — the generation script had run cleanly and reported
success; only opening the page showed nothing was rendering. Fixed by having
`remove_background.py` build and apply its own filename-map the same way
`convert_to_avif.py` already did, and by a one-off repair pass matching each item's
`images/<slug>.avif` against what was actually on disk.

Only one image per item is kept (US preferred over DE when both exist) — both sites
show a full photo gallery per product, and processing 10+ images/item through
background removal for 818 items wasn't worth it for a catalog viewer.

## The not-found placeholder, and why a swarm reported 100% success on an impossible task

`giantmicrobes.com/us/media/catalog/product/...` **never 404s**. Ask it for a filename that
does not exist and it returns HTTP 200 with a 483×272 JPEG: a wide group shot of about forty
assorted plush microbes piled together. Two things follow, and both bit hard.

First, HTTP status is worthless for probing whether a media file exists — the only usable
"file not found" signal is recognising the placeholder itself.

Second, and worse: **the placeholder looks like a legitimate product photo.** Five agents were
sent to find photos for 139 retired products whose images were missing. Four came back
reporting 28/28, 28/28, 27/27 and 28/28 — every single one "verified by viewing the image and
confirming it depicts the product". They had each downloaded the same group shot 28 times and
looked at a real photo of real plush microbes. Only one agent (which happened to compare files
rather than eyeball them) reported the truth: 6 found, 22 placeholder. Of 117 claimed finds,
**34 were real** — an 71% false-positive rate produced entirely by agents doing exactly what
they were told, including the visual check.

The fix is that candidate acceptance must be *mechanical*, never a judgement call:
`gm_imgutil.PlaceholderFilter` learns the placeholder at runtime by requesting a deliberately
impossible path, then rejects matches by exact digest, by 64-bit perceptual difference hash
(the shop serves the same image re-encoded at different byte sizes, so an exact hash alone
misses copies), and by its distinctive geometry. `verify_candidates.py` runs every proposed
image through it and additionally drops any two slugs that resolved to identical bytes. Only
what survives is worth a human or vision-model look — and a second, better-briefed vision pass
over the 34 survivors confirmed 33 and flagged 1 as unidentifiable.

The same placeholder had already contaminated the shipped dataset: **16 catalog items were
displaying it as their product photo.** They are now cleared and quarantined in
`images_rejected/`.

## Pixel dimensions are not resolution: the `-tmb` discovery

A quarter of the catalog's photos were soft, and the reason was invisible from file metadata.
Many recorded `image_url_us` values point at a Magento file whose name ends in `-tmb` — the
shop's *thumbnail, enlarged back up to gallery size*. Full nominal dimensions, thumbnail
detail. The un-suffixed sibling file is the real photograph and, for most products, is simply
sitting there at the adjacent path:

```
a/d/adhd-tmb.jpg   1200x960    56 KB   Laplacian variance   2.3
a/d/adhd.jpg       1200x902   138 KB   Laplacian variance  61.6
```

Same size on screen, 25× the edge energy. Sorting by pixel dimensions would rank these equal
forever, which is why the first pass never noticed.

`audit_images.py` therefore measures two things beyond dimensions: Laplacian variance (focus)
and a `detail_ratio` — RMS difference between the image and its own half-scale round trip,
which is near zero for an upscale and clearly positive for a real photograph, independent of
resolution. `upgrade_images.py` uses those to re-probe every item's candidate URLs and keep
the best. Result: **101 images replaced with genuinely sharper originals (median 20.7× the
Laplacian variance, at the same dimensions) and 36 items that had no photo at all got one.**
Median Laplacian variance across images ≥1000px went from 21.6 to 38.8.

One trap in the ranking: because the placeholder is a *sharp* graphic, it beats real product
photos on every detail metric. The first run of `upgrade_images.py` duly selected it as the
best candidate for five items in a row. Placeholder rejection has to happen before scoring,
not after.

### The second sweep: renditions, and which widget the crawler scraped from

A later audit found something the `-tmb` fix had not touched: **115 images with a long edge
under 300px, the smallest 60×50.** Two causes, both invisible in the URL unless you look for
them.

A Magento URL containing `cache/<hash>/` is not the photo, it is *a* rendition of it, and
which rendition depends on where on the page the crawler picked it up. The "recently viewed
products" strip renders at 75×90, and several items were carrying exactly that. Dropping the
`cache/<hash>/` segment yields the original upload at the same sharded path. Separately, some
records pointed into a literal `product/thumbnails/` directory holding 60px files; the real
photo is at `<a>/<b>/<name>.jpg`.

Where neither derivation lands, `upgrade_images.py` now fetches the product's own page and
scrapes media filenames off it. That page also renders related products, cross-sells and the
recently-viewed strip, so filenames are matched against the slug (`angry-brain-cell` accepts
`angry-brain-front.jpg`, rejects `brain-organ-tmb.jpg`) rather than taken wholesale.

**The accept rule has to change direction for these.** `detail_ratio` is per-pixel, so a 60×50
crop scores *higher* than the 1600×1200 photograph it was cut from — the ordinary
"is the candidate more detailed" test rejects every rescue. Against a thumbnail-sized
incumbent the honest comparison is resolution, which is a separate branch with its own
thresholds.

### The licensee storefronts, which nobody had tried

`giantmicrobes.ca` and `giantmicrobes.com.au` are licensee stores running on **Shopify**, and
Shopify publishes the entire catalog at `/products.json?limit=250&page=N` — titles, SKUs and
the *original* image uploads, frequently 2000–4200px where giantmicrobes.com serves a 1200px
re-render of the same studio shot. No scraping, no key, two requests for 428 products
(`fetch_licensee_catalogs.py`).

This is the answer to the "large but flat, no better source reachable" images. 74 of them were
replaced with a sharper copy, up to 6.5× the detail at the same subject size.

Matching is the whole difficulty, and a title match alone is wrong: GIANTmicrobes sells the
same character in eight formats, and "Blood Cell Mug" is 0.76 similar to "Blood Cells Gift
Box". `match_licensee_images.py` requires a fuzzy title match **and** an exact format match,
where the format is derived on both sides from a fixed vocabulary — with the specific formats
ordered ahead of the generic keychain rule, the same ordering that once filed every petri dish
as a plush toy.

### Background removal eats pale packaging

rembg/u2net looks for *a subject*. A white gift box on a white studio backdrop is not one, so
the gift boxes, the Einstein paper puzzle and the Germs Deluxe 10-pack came out erased or
half-transparent — and so did keyring clips, earring hooks and hang tags, which the model
treats as background clutter.

The fallback is dumber and better for exactly that case: flood-fill the backdrop inwards from
the frame edge, which keeps every white pixel *not connected to the border*. `repair_cutouts.py`
scores each shipped cut-out against a flood-fill of its original (how much of the subject
survived, how much is semi-transparent) and redid 61 that way. It is only a fallback — on a
lifestyle shot, a dark table or a textured backdrop there is nothing to flood-fill and rembg
remains the better tool, which is why the score includes how much of the frame flood-fill
thinks is subject.

**Two ways this bit:** the score triages, it does not decide — at a 0.90 threshold it flags
plenty of cut-outs whose only "loss" is a drop shadow, so the list goes onto a contact sheet
first. And the script re-cuts from whatever source directory it is pointed at: aimed at all 179
licensee probes rather than the 74 adopted ones, it *replaced* 65 pictures with a different
photo of the same product instead of repairing them. It now compares perceptual hashes and
refuses when the source is not the same photograph.

### Nothing is adopted on a metric alone

Every proposed replacement goes onto a contact sheet (`make_contact_sheet.py`, numbered cells,
checkerboard so transparency is visible) and is looked at next to what it would replace. Of
104 mechanically-approved upgrades, **21 were wrong**: "GIGANTIC!" logo banners with no product
in frame, SEM micrographs of the real pathogen where the plush was expected, marketing
infographics, lifestyle shots, blister packaging instead of the loose figure, and four cases of
simply the wrong product (a human skull for the woolly mammoth skull keychain). Every one of
them passed the placeholder filter and the sharpness test. They stay in
`image_upgrade_report.json` as `rejected-visual` with the reason.

### What image search is and is not good for

For the 119 items with no photo, DuckDuckGo's `i.js` and Bing's async image endpoint both work
without a key and return usable candidates (`search_image_candidates.py`). For items a reseller
still lists, this finds real product photos. For the remaining tail — retired petri dishes,
12-packs, one-off dolls — it confidently returns *something* for every query and that something
is a generic crocheted brain, a stock photo of a real bacterial culture, or another product's
gift box. Nothing from that pass was adopted. The Wayback Machine, queried with a domain-wide
CDX regex rather than per-URL guesses, was worth far more: 66 recoveries against zero.

## AI upscaling: tried, measured, rejected

For images with no better source anywhere, the fallback was Gemini image editing (Nano Banana)
via `ai_upscale.py`. Every attempt is gated, because a rule from the sibling microbes-overview
project applies directly: *a plush toy's outline is the product.* An image model asked to
enhance a plush will restyle ears, round off limbs and restitch faces, and the result is a
photo of a toy that was never sold. So each output must clear a silhouette IoU against the
original and actually measure sharper.

**17 attempts across sources from 60px to 500px: zero passed.** Two distinct failure modes,
often together:

- The outline changes outright (IoU 0.22–0.89). The Anopheles mosquito came back as a
  confident, well-lit, entirely invented plush with the wrong body plan.
- Where the outline *did* survive (`earache-petri` IoU 0.987, `amoeba-gigantic` 0.955), the
  output measured **less** detailed than the input (gain 0.88× and 0.41×) — a smooth
  re-illustration, not a restoration.

One measurement bug is worth recording because it nearly produced a wrong conclusion: the model
often returns the subject on a *black* backdrop instead of the white one it was given. The first
silhouette check thresholded against white, so the whole frame counted as subject and everything
failed for the wrong reason. The mask now samples the background colour from the image corners,
which measures shape rather than backdrop. The verdict survived the fix — it just became
trustworthy.

Conclusion: for this catalog, AI upscaling is not a usable fallback. A soft authentic vendor
photo beats a sharp invented one. The script and its report are kept so the negative result is
reproducible rather than re-litigated.

## Two data bugs the verification pass surfaced

**`product_type` silently defaulted 111 records to "Plush".** The rule list in
`classify_product_type.py` had no pattern for petri dishes, necklaces, ties, putty, soap,
glassware or tubes, and its generic `Keychain` rule (which matches the `-kc` slug fragment
anywhere) ran first. So all 47 Petri Dish products, 11 necklaces, 7 putties and 7 ties shipped
as plush toys. Fixed by adding those formats *ahead* of the keychain rule — deliberately not
ahead of it for Vinyl, since a "Vinyl Key Chain" genuinely is a keychain. 84 records reclassified.

**`status_us` said "never sold in the US" for 246 products that have US product pages.**
Every one of them carried `match_method: "llm"` — the merge pass that folds a matched US/DE
pair into a single record had failed to carry the US status across, and the field defaulted to
`not_offered`. It was invisible because `not_offered` is a plausible-looking value; it only
surfaced when a completeness check sampled 25 records and found 6 supposedly-not-offered items
in stock, and the count of the contradiction (246) then matched the count of the bug exactly.
`refresh_us_availability.py` re-derives the field from the live storefront instead of trusting
it: 171 in stock, 45 out of stock, 30 genuinely retired. Notably the *rest* of the availability
data was fine — the same full re-check moved only 4 other records — so this was one bug, not
general rot. Records now carry `status_us_checked` and `status_us_source` so the next reader
can see how old the answer is and which signal produced it.

**One live product was missing entirely:** `zombievirus` (Zombie Virus, *Pithovirus sibericum*),
present on every shopall and category listing but absent from the dataset. Its own product page
now sits behind a Cloudflare challenge (HTTP 403), so its details came from an April 2025
Wayback snapshot while its photo came straight off the media path, which is not challenged.
Both catalogs are otherwise complete: 471 live US slugs and all 353 DE slugs map to a record.

## Rate limiting / politeness

Small per-page delays (`time.sleep(0.2)`) during the US category-page crawl; `curl`
with real deadlines rather than unbounded retries against archive.org; a custom
desktop `User-Agent` and `Referer` header throughout (matching the pattern from
`beanie-babies/scripts/`) so requests look like an ordinary browser rather than a
bare script. Both sites' `robots.txt` were checked — neither disallows the paths this
pipeline touches (giantmicrobes.com only excludes a few special-offer landing pages
irrelevant here; riesenmikroben.de has no `robots.txt` restrictions found).

## Re-running

See `index.md`'s "Note on rebuilding" for the script order. Every script is a
`uv`-shebang (`#!/usr/bin/env -S uv run --script`) single file with inline PEP 723
dependency metadata — `chmod +x` and run directly, or `uv run scripts/<name>.py`. The
LLM matching/translation step (`gm-match-translate`) is a `Workflow` script, not a
plain Python file — it isn't meant to be re-run standalone unless the deterministic
match in `match_us_de_availability.py` has been re-run first and produced fresh
`us_unmatched.json`/`de_unmatched.json` to feed it.
