#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
"""Build catalog.html from merged_catalog.json, and freeze that data into
catalog_data.json.gz alongside it (the structural pattern follows
beanie-babies/scripts/generate_unified_catalog.py: the gzip-compressed dataset is
base64-embedded directly in the page so it works opened via file://, decompressed
in-browser with DecompressionStream).

Unlike beanie-babies there's no birthday/release-date to hang a calendar view off
of, so display modes are By Name / By Category / By Product Type instead, and a
language toggle switches every name/description/price/status between the US
(giantmicrobes.com) and DE (riesenmikroben.de) side of each item -- US takes
precedence as the default/canonical name since a product exists in the US line
first, if it's ever offered elsewhere; items missing one side just fall back to
whichever language they do have.
"""
import base64
import gzip
import json
import os

with open("merged_catalog.json") as f:
    _items = json.load(f)

# image_audit.json is a separate, regeneratable report (scripts/audit_images.py)
# rather than something written back onto the catalog record, so quality flags
# are joined on at build time instead of being persisted in merged_catalog.json.
if os.path.exists("image_audit.json"):
    with open("image_audit.json") as f:
        _audit_by_file = {r["file"]: r["flags"] for r in json.load(f)}
    for _item in _items:
        _f = _item.get("image_file")
        if _f:
            _item["image_quality_flags"] = _audit_by_file.get(os.path.basename(_f), [])

with gzip.open("catalog_data.json.gz", "wt") as f:
    json.dump(_items, f)
with open("catalog_data.json.gz", "rb") as f:
    _EMBEDDED_B64 = base64.b64encode(f.read()).decode("ascii")

ALL_CATEGORIES = sorted(set(
    c for i in _items for c in (i.get("categories_us") or []) + (i.get("categories_de") or [])
))
ALL_PRODUCT_TYPES = sorted(set(i["product_type"] for i in _items if i.get("product_type")))

CSS = """
:root {
  --microbe-teal: #0e9594;
  --microbe-teal-dark: #086d6c;
  --spore-lime: #b4e600;
  --petri-orange: #f0932c;
  --nucleus-purple: #9c6ade;
  --membrane-blue: #3fa0f0;
  --danger-red: #e2493a;
}
[data-theme="light"] {
  --bg: #f2faf7;
  --panel-bg: #ffffff;
  --ink: #123330;
  --muted: #5c8a83;
  --border: #d8ede8;
  --card-bg: #fdfffe;
  --shimmer-a: #d8ede8;
  --shimmer-b: #fdfffe;
}
[data-theme="dark"] {
  --bg: #0e1a18;
  --panel-bg: #142523;
  --ink: #e7f5f2;
  --muted: #8fbdb5;
  --border: #22403c;
  --card-bg: #182b28;
  --shimmer-a: #22403c;
  --shimmer-b: #24413d;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: 'Quicksand', 'Comic Sans MS', system-ui, sans-serif;
  background: var(--bg);
  color: var(--ink);
}
.sticky-wrap { position: sticky; top: 0; z-index: 500; box-shadow: 0 2px 8px rgba(0,0,0,.15); }
header.hero {
  background: linear-gradient(135deg, var(--microbe-teal) 0%, #1cc7a0 55%, var(--spore-lime) 100%);
  color: white;
  padding: .8rem 1.5rem;
}
.hero-top { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
.hero-top h1 { margin: 0; font-size: 1.5rem; text-shadow: 1px 1px 0 rgba(0,0,0,.15); white-space: nowrap; }
.hero-icon { height: 1.9em; width: auto; vertical-align: -.55em; margin-right: .1em; filter: drop-shadow(0 1px 2px rgba(0,0,0,.25)); }
.hero-actions { display: flex; align-items: center; gap: .5rem; }
#options-toggle-btn, #lang-chooser {
  font-family: inherit; font-size: .9rem; font-weight: 700; border-radius: 8px;
  border: 2px solid white; padding: .45rem .8rem; background: rgba(255,255,255,.15);
  color: white; cursor: pointer; flex-shrink: 0;
}
#lang-chooser option { color: #222; }
#options-toggle-btn:hover, #lang-chooser:hover { background: rgba(255,255,255,.3); }

#options-panel { background: var(--panel-bg); max-height: 0; overflow: hidden; transition: max-height .3s ease; }
#options-panel.open { max-height: 46rem; overflow-y: auto; }

.controls { display: flex; flex-wrap: wrap; gap: .6rem; align-items: center; padding: 1rem 1.5rem; border-bottom: 2px dashed var(--border); }
.controls select, .controls button {
  font-family: inherit; font-size: .85rem; font-weight: 700; border-radius: 8px;
  border: 2px solid var(--border); padding: .4rem .7rem; background: var(--card-bg);
  color: var(--ink); cursor: pointer;
}
.controls select option { color: #222; }
.controls button:hover, .controls select:hover { background: var(--bg); }
.controls input[type="range"] { width: 7rem; vertical-align: middle; }
#sort-order-btn { font-size: 1rem; padding: .4rem .6rem; }
#search-box {
  font-family: inherit; font-size: .85rem; padding: .35rem .6rem; border-radius: 8px;
  border: 1px solid var(--border); background: var(--card-bg); color: var(--ink);
  width: 14rem; max-width: 100%;
}
.stat-pill { background: var(--bg); border: 2px solid var(--border); border-radius: 999px; padding: .3rem .8rem; font-weight: 700; font-size: .85rem; color: var(--ink); }

.dropdown-wrap { position: relative; }
.dropdown-panel {
  display: none; position: fixed; background: var(--panel-bg); color: var(--ink);
  border: 2px solid var(--border); border-radius: 10px; padding: .8rem; z-index: 1000;
  min-width: 15rem; max-height: 80vh; overflow-y: auto; box-shadow: 0 8px 24px rgba(0,0,0,.25);
  flex-direction: column; gap: .6rem;
}
.dropdown-panel.open { display: flex; }
.dropdown-panel label { display: flex; align-items: center; gap: .4rem; font-size: .82rem; font-weight: 600; cursor: pointer; }
.dropdown-panel .opt-row { display: flex; align-items: center; justify-content: space-between; gap: .5rem; font-size: .8rem; font-weight: 700; }
.dropdown-panel select { font-family: inherit; font-size: .8rem; font-weight: 600; padding: .25rem .5rem; border-radius: 6px; border: 1px solid var(--border); background: var(--card-bg); color: var(--ink); }
.dropdown-panel hr { border: none; border-top: 1px solid var(--border); margin: .1rem 0; width: 100%; }

.filters-panel { background: var(--panel-bg); padding: .8rem 1.5rem; display: flex; flex-wrap: wrap; gap: 1.5rem; }
.filter-group { display: flex; flex-direction: column; gap: .3rem; }
.filter-group .group-label { font-weight: 800; font-size: .75rem; text-transform: uppercase; color: var(--muted); }
.filter-group .options { display: flex; flex-wrap: wrap; gap: .4rem; max-width: 46rem; align-items: center; max-height: 8rem; overflow-y: auto; }
.filter-group label { display: flex; align-items: center; gap: .3rem; font-size: .82rem; font-weight: 600; cursor: pointer; padding: .2rem .5rem; border-radius: 6px; border: 1px solid var(--border); }
.filter-group label:hover { background: var(--bg); }
.filter-group select { font-family: inherit; font-size: .82rem; font-weight: 600; padding: .25rem .5rem; border-radius: 6px; border: 1px solid var(--border); background: var(--card-bg); color: var(--ink); }

main { max-width: 1200px; margin: 0 auto; padding: 1rem 1.2rem 3rem; }
main.layout-screen { max-width: none; }

.group-block { margin-bottom: 1.6rem; }
.block-head { font-weight: 800; font-size: 1.1rem; color: white; background: var(--microbe-teal); border-radius: 6px; padding: .3rem .8rem; margin-bottom: .5rem; }

.card-row { display: flex; flex-wrap: wrap; gap: .6rem; margin-bottom: .3rem; }
.card {
  border: 1.5px solid var(--border); border-radius: 10px; padding: .5rem;
  width: calc((100% - (var(--columns, 6) - 1) * .6rem) / var(--columns, 6));
  min-width: 5rem; display: flex; flex-direction: column; align-items: center; text-align: center; background: var(--card-bg);
}
.card img, .card .placeholder { width: 100%; aspect-ratio: 1 / 1; object-fit: contain; margin-bottom: .25rem; border-radius: 4px; }
.card img { cursor: zoom-in; }
.card .placeholder { display: flex; align-items: center; justify-content: center; font-size: 1.6rem; background: var(--bg); }
.card .cname { font-weight: 700; font-size: calc(.7rem * var(--text-scale, 1)); line-height: 1.15; }
.card .cspecies { font-size: calc(.6rem * var(--text-scale, 1)); font-style: italic; color: var(--muted); }
.card .cdesc {
  font-size: calc(.64rem * var(--text-scale, 1)); color: var(--muted); font-style: italic; line-height: 1.15;
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; cursor: help;
}
.card .cdesc:hover, .card .cdesc.expanded { -webkit-line-clamp: unset; overflow: visible; }
main.full-desc .card .cdesc { -webkit-line-clamp: unset; overflow: visible; cursor: default; }
.card .cprice { font-size: calc(.62rem * var(--text-scale, 1)); color: var(--muted); font-weight: 700; }
.card a.cname-link { color: var(--microbe-teal-dark); text-decoration: none; }
.card a.cname-link:hover { text-decoration: underline; }
.card-badges { display: flex; flex-wrap: wrap; gap: .2rem; justify-content: center; margin-top: .2rem; }
.badge-pill { font-size: calc(.58rem * var(--text-scale, 1)); font-weight: 800; padding: .1rem .45rem; border-radius: 999px; color: white; white-space: nowrap; }
.badge-pill.type { background: var(--microbe-teal-dark); }
.badge-pill.category { background: var(--membrane-blue); }
.badge-pill.in_stock { background: #2e9e5b; }
.badge-pill.out_of_stock { background: var(--petri-orange); }
.badge-pill.retired { background: var(--nucleus-purple); }
.badge-pill.not_offered { background: #999; }

img.microbe-img {
  background-image: linear-gradient(100deg, var(--shimmer-a) 30%, var(--shimmer-b) 50%, var(--shimmer-a) 70%);
  background-size: 300% 100%; animation: microbe-shimmer 1.3s ease-in-out infinite;
}
img.microbe-img.loaded { animation: none; background-image: none; }
@keyframes microbe-shimmer { 0% { background-position: 150% 0; } 100% { background-position: -150% 0; } }

.empty-state { text-align: center; padding: 3rem 1rem; color: var(--muted); font-size: 1.1rem; }
footer { text-align: center; padding: 1.5rem; color: var(--muted); font-size: .8rem; }
footer a { color: var(--microbe-teal-dark); }

#hover-preview {
  position: fixed; display: none; pointer-events: none; z-index: 1000; background: var(--panel-bg);
  border: 2px solid var(--border); border-radius: 10px; padding: .5rem; box-shadow: 0 8px 24px rgba(0,0,0,.25);
}
#hover-preview img { display: block; max-width: 50vw; max-height: 50vh; object-fit: contain; }

#lightbox {
  position: fixed; inset: 0; display: none; align-items: center; justify-content: center;
  background: rgba(0,0,0,.85); z-index: 2000; touch-action: pan-y;
}
#lightbox .lb-content { display: flex; flex-direction: column; align-items: center; max-width: 92vw; max-height: 92vh; cursor: default; overflow: hidden; }
#lightbox img { max-width: 88vw; max-height: 65vh; object-fit: contain; background: white; border-radius: 10px; padding: 1rem; }
#lightbox img.anim-next { animation: lb-enter-right .28s ease; }
#lightbox img.anim-prev { animation: lb-enter-left .28s ease; }
@keyframes lb-enter-right { from { transform: translateX(60px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
@keyframes lb-enter-left { from { transform: translateX(-60px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
#lightbox .lb-info { color: white; text-align: center; margin-top: .8rem; max-width: 34rem; }
#lightbox .lb-info .lb-name { font-size: 1.3rem; font-weight: 800; }
#lightbox .lb-info .lb-species { font-size: 1rem; font-style: italic; opacity: .85; }
#lightbox .lb-info .lb-desc { font-size: .95rem; font-style: italic; opacity: .9; margin-top: .2rem; }
#lightbox .lb-info .lb-meta { font-size: .85rem; opacity: .8; margin-top: .4rem; }
#lightbox .lb-info .lb-avail { font-size: .85rem; opacity: .9; margin-top: .3rem; display: flex; gap: .6rem; justify-content: center; flex-wrap: wrap; }
.lb-nav {
  position: fixed; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,.15); color: white;
  border: 2px solid rgba(255,255,255,.6); border-radius: 999px; width: 3rem; height: 3rem; font-size: 1.4rem; cursor: pointer; z-index: 2001;
}
.lb-nav:hover { background: rgba(255,255,255,.3); }
#lb-prev { left: 1.5rem; }
#lb-next { right: 1.5rem; }
#lb-close {
  position: fixed; top: 1.2rem; right: 1.5rem; background: rgba(255,255,255,.15); color: white;
  border: 2px solid rgba(255,255,255,.6); border-radius: 999px; width: 2.4rem; height: 2.4rem; font-size: 1.1rem; cursor: pointer; z-index: 2001;
}

@media print {
  #options-panel, #options-toggle-btn, #lang-chooser, footer, #hover-preview, #lightbox { display: none !important; }
  .sticky-wrap { position: static; box-shadow: none; }
  header.hero { padding: .5rem 1rem; }
  .hero-top h1 { font-size: 1.2rem; }
  body { background: white; }
  [data-theme="dark"] { --bg: white; --panel-bg: white; --ink: black; --card-bg: white; }
  .card { break-inside: avoid; }
  @page { size: A4 portrait; margin: 12mm; @bottom-center { content: "Page " counter(page) " of " counter(pages); font-size: 9pt; color: #5c8a83; } }
}
"""

JS = """
const EMBEDDED_DATA_B64 = "%(embedded_b64)s";
const ALL_CATEGORIES = %(categories_json)s;
const ALL_PRODUCT_TYPES = %(product_types_json)s;
const STATUS_KEYS = ["in_stock", "out_of_stock", "retired", "not_offered"];
const STATUS_LABELS = { in_stock: "In Stock", out_of_stock: "Out of Stock", retired: "Retired", not_offered: "Not Offered" };

const DEFAULT_SETTINGS = {
  theme: "light",
  lang: "us",
  displayMode: "name",
  sortOrder: "asc",
  categoryFilters: ALL_CATEGORIES.slice(),
  typeFilters: ALL_PRODUCT_TYPES.slice(),
  usStatusFilters: STATUS_KEYS.slice(),
  deStatusFilters: STATUS_KEYS.slice(),
  layoutMode: "print",
  columns: 6,
  textScale: 1,
  search: "",
  // "with" | "without" | "any". 51 retired items have no photo anywhere
  // reachable and render as a bare placeholder tile, so "with" is the
  // default -- but "without" is exactly the triage view for going after them.
  photoFilter: "with",
  // "any" | "hide" | "only". image_quality_flags (audit_images.py) marks over
  // half the catalog "small-subject" or "small", too broad a net to act on by
  // default -- this only reacts to flags that mean a photo actually looks bad
  // on screen (see LOW_QUALITY_FLAGS below), and defaults to not filtering.
  qualityFilter: "any",
  showSpecies: true,
  showDescription: false,
  fullDescription: false,
  showPrice: true,
  showCategories: false,
  optionsOpen: true
};

function loadSettings() {
  try {
    const raw = localStorage.getItem("microbe-settings");
    if (!raw) return Object.assign({}, DEFAULT_SETTINGS);
    return Object.assign({}, DEFAULT_SETTINGS, JSON.parse(raw));
  } catch (e) {
    return Object.assign({}, DEFAULT_SETTINGS);
  }
}
function saveSettings() { localStorage.setItem("microbe-settings", JSON.stringify(settings)); }

let ALL_ITEMS = [];
let settings = loadSettings();
let categoryFilters = new Set(settings.categoryFilters);
let typeFilters = new Set(settings.typeFilters);
let usStatusFilters = new Set(settings.usStatusFilters);
let deStatusFilters = new Set(settings.deStatusFilters);
let LIGHTBOX_ITEMS = [];
let lightboxIndex = -1;

function base64ToBytes(b64) {
  const binStr = atob(b64);
  const bytes = new Uint8Array(binStr.length);
  for (let i = 0; i < binStr.length; i++) bytes[i] = binStr.charCodeAt(i);
  return bytes;
}

async function loadData() {
  const bytes = base64ToBytes(EMBEDDED_DATA_B64);
  const ds = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
  const text = await new Response(ds).text();
  ALL_ITEMS = JSON.parse(text);
  ALL_ITEMS.forEach(item => {
    item._searchText = [
      item.name_us, item.name_de, item.species,
      item.description_us, item.description_de,
      ...(item.categories_us || []), ...(item.categories_de || []),
      item.product_type,
    ].filter(Boolean).join(" ").toLowerCase();
  });
  document.getElementById("stat-total").textContent = "Total: " + ALL_ITEMS.length;
  render();
}

function displayName(item) {
  if (settings.lang === "de") return item.name_de || item.name_us || item.name;
  return item.name_us || item.name_de || item.name;
}
function displayDescription(item) {
  if (settings.lang === "de") return item.description_de || item.description_us || "";
  return item.description_us || item.description_de || "";
}
function displayUrl(item) {
  if (settings.lang === "de") return item.product_url_de || item.product_url_us || "";
  return item.product_url_us || item.product_url_de || "";
}
function displayPrice(item) {
  if (settings.lang === "de" && item.price_de) return item.price_de + " " + (item.currency_de || "EUR");
  if (item.price_us) return item.price_us + " " + (item.currency_us || "USD");
  if (item.price_de) return item.price_de + " " + (item.currency_de || "EUR");
  return "";
}

function trackItem(item) { LIGHTBOX_ITEMS.push(item); return LIGHTBOX_ITEMS.length - 1; }

function statusBadges(item) {
  const badges = [];
  if (item.status_us) badges.push(`<span class="badge-pill ${item.status_us}" title="US availability">US: ${STATUS_LABELS[item.status_us]}</span>`);
  if (item.status_de) badges.push(`<span class="badge-pill ${item.status_de}" title="DE availability">DE: ${STATUS_LABELS[item.status_de]}</span>`);
  return badges.join("");
}
function categoryBadges(item) {
  if (!settings.showCategories) return "";
  const cats = new Set([...(item.categories_us || []), ...(item.categories_de || [])]);
  return Array.from(cats).map(c => `<span class="badge-pill category">${c}</span>`).join("");
}

function cardHtml(item) {
  const name = displayName(item);
  const species = item.species_display || item.species;
  const description = displayDescription(item);
  const url = displayUrl(item);
  const idx = trackItem(item);
  const img = item.image_file
    ? `<img class="microbe-img" src="${item.image_file}" alt="" loading="lazy" data-idx="${idx}" onload="this.classList.add('loaded')">`
    : `<div class="placeholder">\\ud83e\\udda0</div>`;
  const nameHtml = url
    ? `<a class="cname cname-link" href="${url}" target="_blank" rel="noopener">${name}</a>`
    : `<div class="cname">${name}</div>`;
  const speciesHtml = settings.showSpecies && species ? `<div class="cspecies">${species}</div>` : "";
  const descHtml = settings.showDescription && description ? `<div class="cdesc" data-tap-expand="1">${description}</div>` : "";
  const priceHtml = settings.showPrice && displayPrice(item) ? `<div class="cprice">${displayPrice(item)}</div>` : "";
  const badges = `<span class="badge-pill type">${item.product_type}</span>` + categoryBadges(item) + statusBadges(item);
  const badgesHtml = `<div class="card-badges">${badges}</div>`;
  return `<div class="card">${img}${nameHtml}${speciesHtml}${descHtml}${priceHtml}${badgesHtml}</div>`;
}

function queryVariants(query) {
  const variants = [query];
  if (query.endsWith("s") && query.length > 3) variants.push(query.slice(0, -1));
  else variants.push(query + "s");
  return variants;
}

// audit_images.py's own thresholds for "genuinely looks bad on screen" --
// thumbnail-grade resolution, no real detail beyond a half-scale upscale, or
// visibly soft focus. Deliberately excludes "small"/"small-subject", which
// flag over half the catalog on canvas/content size alone and would make the
// filter hide more than it shows.
const LOW_QUALITY_FLAGS = new Set(["tiny", "soft", "upscaled"]);
function isLowQuality(item) {
  return (item.image_quality_flags || []).some(f => LOW_QUALITY_FLAGS.has(f));
}

function applyFilters() {
  const query = settings.search.trim().toLowerCase();
  const variants = query ? queryVariants(query) : [];
  return ALL_ITEMS.filter(i => {
    if (settings.photoFilter === "with" && !i.image_file) return false;
    if (settings.photoFilter === "without" && i.image_file) return false;
    if (settings.qualityFilter === "hide" && isLowQuality(i)) return false;
    // "only" only makes sense against items that have a photo to judge --
    // one with none isn't "high quality", it just has nothing to flag.
    if (settings.qualityFilter === "only" && (!i.image_file || !isLowQuality(i))) return false;
    if (!typeFilters.has(i.product_type)) return false;
    if (!usStatusFilters.has(i.status_us) || !deStatusFilters.has(i.status_de)) return false;
    const cats = [...(i.categories_us || []), ...(i.categories_de || [])];
    if (cats.length && !cats.some(c => categoryFilters.has(c))) return false;
    if (!cats.length && categoryFilters.size !== ALL_CATEGORIES.length) return false;
    if (!query) return true;
    return variants.some(v => i._searchText.includes(v));
  });
}

function byName(a, b) { return displayName(a).localeCompare(displayName(b)); }
function sortDir() { return settings.sortOrder === "desc" ? -1 : 1; }

function groupBlocks(items, keyFn) {
  const groups = new Map();
  items.forEach(i => {
    const keys = keyFn(i);
    (keys.length ? keys : ["(none)"]).forEach(k => {
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(i);
    });
  });
  return groups;
}

function emptyState() { return '<div class="empty-state">No microbes match the current filters.</div>'; }

function renderByName(items) {
  if (!items.length) return emptyState();
  const dir = sortDir();
  const sorted = items.slice().sort((a, b) => dir * byName(a, b));
  return `<div class="group-block"><div class="card-row">${sorted.map(cardHtml).join("")}</div></div>`;
}

function renderGrouped(items, keyFn) {
  const groups = groupBlocks(items, keyFn);
  if (!groups.size) return emptyState();
  const dir = sortDir();
  const keys = Array.from(groups.keys()).sort((a, b) => dir * a.localeCompare(b));
  return keys.map(k => {
    const groupItems = groups.get(k).slice().sort(byName);
    return `<div class="group-block"><div class="block-head">${k} (${groupItems.length})</div><div class="card-row">${groupItems.map(cardHtml).join("")}</div></div>`;
  }).join("");
}

function render() {
  const items = applyFilters();
  const main = document.getElementById("main-content");
  const classes = [];
  if (settings.layoutMode === "screen") classes.push("layout-screen");
  if (settings.fullDescription) classes.push("full-desc");
  main.className = classes.join(" ");
  main.style.setProperty("--columns", settings.columns);
  main.style.setProperty("--text-scale", settings.textScale);
  document.getElementById("stat-shown").textContent = "Filtered: " + items.length;

  LIGHTBOX_ITEMS = [];
  if (settings.displayMode === "name") main.innerHTML = renderByName(items);
  else if (settings.displayMode === "category") main.innerHTML = renderGrouped(items, i => [...new Set([...(i.categories_us || []), ...(i.categories_de || [])])]);
  else if (settings.displayMode === "type") main.innerHTML = renderGrouped(items, i => [i.product_type]);
}

function toggleTheme() {
  const html = document.documentElement;
  const next = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
  html.setAttribute("data-theme", next);
  document.getElementById("theme-btn").textContent = next === "dark" ? "\\u2600\\ufe0f Light" : "\\ud83c\\udf19 Dark";
  settings.theme = next;
  saveSettings();
}

function toggleFullscreen() {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen().catch(() => {});
}

function updateFullscreenBtn() {
  const btn = document.getElementById("fullscreen-btn");
  btn.textContent = document.fullscreenElement ? "\\u2715 Exit Fullscreen" : "\\u26f6 Fullscreen";
}

function setLang(lang) {
  settings.lang = lang;
  document.getElementById("lang-chooser").value = lang;
  saveSettings();
  render();
}

function setupPreview() {
  const hoverPreview = document.getElementById("hover-preview");
  const hoverImg = hoverPreview.querySelector("img");
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lb-img");

  document.getElementById("main-content").addEventListener("mouseover", e => {
    const img = e.target.closest("img[data-idx]");
    if (!img) return;
    hoverImg.src = img.src;
    hoverPreview.style.display = "block";
  });
  document.getElementById("main-content").addEventListener("mousemove", e => {
    if (hoverPreview.style.display !== "block") return;
    const pad = 16;
    let x = e.clientX + pad;
    let y = e.clientY + pad;
    if (x + 300 > window.innerWidth) x = e.clientX - pad - 300;
    if (y + 300 > window.innerHeight) y = e.clientY - pad - 300;
    hoverPreview.style.left = Math.max(0, x) + "px";
    hoverPreview.style.top = Math.max(0, y) + "px";
  });
  document.getElementById("main-content").addEventListener("mouseout", e => {
    if (e.target.closest("img[data-idx]")) hoverPreview.style.display = "none";
  });
  document.getElementById("main-content").addEventListener("click", e => {
    const desc = e.target.closest("[data-tap-expand]");
    if (desc) { desc.classList.toggle("expanded"); return; }
    const img = e.target.closest("img[data-idx]");
    if (!img) return;
    showLightbox(Number(img.dataset.idx));
    hoverPreview.style.display = "none";
  });

  function showLightbox(idx, dir) {
    if (!LIGHTBOX_ITEMS.length) return;
    lightboxIndex = ((idx %% LIGHTBOX_ITEMS.length) + LIGHTBOX_ITEMS.length) %% LIGHTBOX_ITEMS.length;
    const item = LIGHTBOX_ITEMS[lightboxIndex];
    lightboxImg.classList.remove("loaded", "anim-next", "anim-prev");
    void lightboxImg.offsetWidth;
    if (dir === "next") lightboxImg.classList.add("anim-next");
    else if (dir === "prev") lightboxImg.classList.add("anim-prev");
    lightboxImg.src = item.image_file || "";
    document.getElementById("lb-name").textContent = displayName(item);
    document.getElementById("lb-species").textContent = item.species || "";
    document.getElementById("lb-species").style.display = item.species ? "block" : "none";
    const desc = displayDescription(item);
    document.getElementById("lb-desc").textContent = desc;
    document.getElementById("lb-desc").style.display = desc ? "block" : "none";
    document.getElementById("lb-meta").textContent = [item.product_type, displayPrice(item)].filter(Boolean).join("  \\u00b7  ");
    document.getElementById("lb-avail").innerHTML = statusBadges(item);
    lightbox.style.display = "flex";
  }

  function closeLightbox() { lightbox.style.display = "none"; }
  function prev() { showLightbox(lightboxIndex - 1, "prev"); }
  function next() { showLightbox(lightboxIndex + 1, "next"); }

  document.getElementById("lb-prev").addEventListener("click", prev);
  document.getElementById("lb-next").addEventListener("click", next);
  document.getElementById("lb-close").addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", e => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener("keydown", e => {
    if (lightbox.style.display !== "flex") return;
    if (e.key === "ArrowLeft") prev();
    else if (e.key === "ArrowRight") next();
    else if (e.key === "Escape") closeLightbox();
  });

  let touchStartX = null;
  lightbox.addEventListener("touchstart", e => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
  lightbox.addEventListener("touchend", e => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) { dx > 0 ? prev() : next(); }
    touchStartX = null;
  }, { passive: true });
}

function setupDropdown(btnId, panelId) {
  const btn = document.getElementById(btnId);
  const panel = document.getElementById(panelId);
  function positionPanel() {
    const rect = btn.getBoundingClientRect();
    const width = Math.max(panel.offsetWidth, 240);
    let left = rect.left;
    if (left + width > window.innerWidth - 8) left = window.innerWidth - width - 8;
    panel.style.top = (rect.bottom + 6) + "px";
    panel.style.left = Math.max(8, left) + "px";
  }
  btn.addEventListener("click", e => {
    e.stopPropagation();
    const opening = !panel.classList.contains("open");
    if (opening) positionPanel();
    panel.classList.toggle("open", opening);
  });
  window.addEventListener("resize", () => { if (panel.classList.contains("open")) positionPanel(); });
  panel.addEventListener("click", e => e.stopPropagation());
  document.addEventListener("click", () => panel.classList.remove("open"));
}

function updateColumnsRange() {
  const columnsEl = document.getElementById("columns-slider");
  columnsEl.min = 1;
  columnsEl.max = settings.layoutMode === "screen" ? 12 : 8;
  columnsEl.value = settings.columns;
}

function setupCheckboxGroup(selector, attr, filterSet) {
  document.querySelectorAll(selector).forEach(el => {
    el.checked = filterSet.has(el.dataset[attr]);
    el.addEventListener("change", () => {
      const v = el.dataset[attr];
      if (el.checked) filterSet.add(v); else filterSet.delete(v);
      saveSettings();
      render();
    });
  });
}

function initControls() {
  document.documentElement.setAttribute("data-theme", settings.theme);
  document.getElementById("theme-btn").textContent = settings.theme === "dark" ? "\\u2600\\ufe0f Light" : "\\ud83c\\udf19 Dark";
  document.getElementById("theme-btn").addEventListener("click", toggleTheme);
  document.getElementById("print-btn").addEventListener("click", () => window.print());
  const fsBtn = document.getElementById("fullscreen-btn");
  if (document.fullscreenEnabled === false) {
    fsBtn.style.display = "none";
  } else {
    fsBtn.addEventListener("click", toggleFullscreen);
    document.addEventListener("fullscreenchange", updateFullscreenBtn);
    updateFullscreenBtn();
  }
  const langChooser = document.getElementById("lang-chooser");
  langChooser.value = settings.lang;
  langChooser.addEventListener("change", e => setLang(e.target.value));

  const optionsPanel = document.getElementById("options-panel");
  optionsPanel.classList.toggle("open", settings.optionsOpen);
  document.getElementById("options-toggle-btn").addEventListener("click", () => {
    settings.optionsOpen = !settings.optionsOpen;
    optionsPanel.classList.toggle("open", settings.optionsOpen);
    saveSettings();
  });

  const displayModeEl = document.getElementById("display-mode");
  displayModeEl.value = settings.displayMode;
  displayModeEl.addEventListener("change", e => { settings.displayMode = e.target.value; saveSettings(); render(); });

  const sortOrderBtn = document.getElementById("sort-order-btn");
  sortOrderBtn.textContent = settings.sortOrder === "desc" ? "\\u2193" : "\\u2191";
  sortOrderBtn.addEventListener("click", () => {
    settings.sortOrder = settings.sortOrder === "desc" ? "asc" : "desc";
    sortOrderBtn.textContent = settings.sortOrder === "desc" ? "\\u2193" : "\\u2191";
    saveSettings();
    render();
  });

  const layoutModeEl = document.getElementById("layout-mode");
  layoutModeEl.value = settings.layoutMode;
  updateColumnsRange();
  layoutModeEl.addEventListener("change", e => { settings.layoutMode = e.target.value; updateColumnsRange(); saveSettings(); render(); });
  document.getElementById("columns-slider").addEventListener("input", e => { settings.columns = Number(e.target.value); saveSettings(); render(); });

  const textSizeEl = document.getElementById("text-size");
  textSizeEl.value = settings.textScale;
  textSizeEl.addEventListener("input", e => { settings.textScale = Number(e.target.value); saveSettings(); render(); });

  const searchEl = document.getElementById("search-box");
  searchEl.value = settings.search;
  searchEl.addEventListener("input", e => { settings.search = e.target.value; saveSettings(); render(); });

  setupCheckboxGroup("input[data-category]", "category", categoryFilters);
  setupCheckboxGroup("input[data-type]", "type", typeFilters);
  setupCheckboxGroup("input[data-us-status]", "usStatus", usStatusFilters);
  setupCheckboxGroup("input[data-de-status]", "deStatus", deStatusFilters);

  const optPhoto = document.getElementById("opt-photo-filter");
  optPhoto.value = settings.photoFilter;
  optPhoto.addEventListener("change", () => { settings.photoFilter = optPhoto.value; saveSettings(); render(); });

  const optQuality = document.getElementById("opt-quality-filter");
  optQuality.value = settings.qualityFilter;
  optQuality.addEventListener("change", () => { settings.qualityFilter = optQuality.value; saveSettings(); render(); });

  const optSpecies = document.getElementById("opt-species");
  const optDesc = document.getElementById("opt-desc");
  const optFullDesc = document.getElementById("opt-full-desc");
  const optPrice = document.getElementById("opt-price");
  const optCategories = document.getElementById("opt-categories");
  optSpecies.checked = settings.showSpecies;
  optDesc.checked = settings.showDescription;
  optFullDesc.checked = settings.fullDescription;
  optPrice.checked = settings.showPrice;
  optCategories.checked = settings.showCategories;
  optSpecies.addEventListener("change", () => { settings.showSpecies = optSpecies.checked; saveSettings(); render(); });
  optDesc.addEventListener("change", () => { settings.showDescription = optDesc.checked; saveSettings(); render(); });
  optFullDesc.addEventListener("change", () => { settings.fullDescription = optFullDesc.checked; saveSettings(); render(); });
  optPrice.addEventListener("change", () => { settings.showPrice = optPrice.checked; saveSettings(); render(); });
  optCategories.addEventListener("change", () => { settings.showCategories = optCategories.checked; saveSettings(); render(); });

  setupDropdown("display-opts-btn", "display-opts-panel");
}

document.addEventListener("DOMContentLoaded", () => {
  initControls();
  setupPreview();
  loadData();
});
"""


def main():
    category_checkboxes = "\n".join(
        f'<label><input type="checkbox" data-category="{c}" checked> {c}</label>'
        for c in ALL_CATEGORIES
    )
    type_checkboxes = "\n".join(
        f'<label><input type="checkbox" data-type="{t}" checked> {t}</label>'
        for t in ALL_PRODUCT_TYPES
    )
    status_labels = {"in_stock": "In Stock", "out_of_stock": "Out of Stock", "retired": "Retired", "not_offered": "Not Offered"}
    us_status_checkboxes = "\n".join(
        f'<label><input type="checkbox" data-us-status="{s}" checked> {status_labels[s]}</label>'
        for s in ["in_stock", "out_of_stock", "retired", "not_offered"]
    )
    de_status_checkboxes = "\n".join(
        f'<label><input type="checkbox" data-de-status="{s}" checked> {status_labels[s]}</label>'
        for s in ["in_stock", "out_of_stock", "retired", "not_offered"]
    )

    js = JS % {
        "embedded_b64": _EMBEDDED_B64,
        "categories_json": json.dumps(ALL_CATEGORIES),
        "product_types_json": json.dumps(ALL_PRODUCT_TYPES),
    }

    html = f"""<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>GIANTmicrobes Catalog</title>
<link rel="icon" href="favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="favicon-16x16.png">
<link rel="apple-touch-icon" href="icon-180.png">
<link rel="manifest" href="manifest.json">
<meta name="theme-color" content="#0e9594">
<meta name="apple-mobile-web-app-title" content="Microbes">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@500;700;800&display=swap" rel="stylesheet">
<style>{CSS}</style>
</head>
<body>
<div class="sticky-wrap">
<header class="hero">
  <div class="hero-top">
    <h1><img class="hero-icon" src="icon.png" alt="" width="512" height="512"> GIANTmicrobes Catalog</h1>
    <div class="hero-actions">
      <select id="lang-chooser" title="Language / Sprache">
        <option value="us">\U0001f1fa\U0001f1f8 English</option>
        <option value="de">\U0001f1e9\U0001f1ea Deutsch</option>
      </select>
      <button id="options-toggle-btn" type="button">☰ Options</button>
    </div>
  </div>
</header>

<div id="options-panel">
  <div class="controls">
    <select id="display-mode">
      <option value="name">By Name</option>
      <option value="category">By Category</option>
      <option value="type">By Product Type</option>
    </select>
    <button id="sort-order-btn" type="button" title="Sort order">↑</button>
    <select id="layout-mode">
      <option value="print">Print Layout</option>
      <option value="screen">Screen Layout</option>
    </select>
    <input type="range" id="columns-slider" min="1" max="8" step="1" title="Columns">
    <input type="range" id="text-size" min="0.6" max="2.5" step="0.1" title="Text size">
    <div class="dropdown-wrap">
      <button id="display-opts-btn" type="button">⚙️ Display Options</button>
      <div id="display-opts-panel" class="dropdown-panel">
        <label><input type="checkbox" id="opt-species"> Show Species</label>
        <label><input type="checkbox" id="opt-desc"> Show Description</label>
        <label><input type="checkbox" id="opt-full-desc"> Show Full Description (not cut off)</label>
        <label><input type="checkbox" id="opt-price"> Show Price</label>
        <label><input type="checkbox" id="opt-categories"> Show Category Labels</label>
      </div>
    </div>
    <button id="theme-btn" type="button">\U0001f319 Dark</button>
    <button id="fullscreen-btn" type="button">⛶ Fullscreen</button>
    <button id="print-btn" type="button">\U0001f5a8️ Print / Save as PDF</button>
    <span class="stat-pill" id="stat-total">Loading&hellip;</span>
    <span class="stat-pill" id="stat-shown"></span>
  </div>

  <div class="filters-panel">
    <div class="filter-group">
      <span class="group-label">Search</span>
      <div class="options">
        <input type="search" id="search-box" placeholder="e.g. e.coli, brain, keychain&hellip;">
      </div>
    </div>
    <div class="filter-group">
      <span class="group-label">Photo</span>
      <div class="options">
        <select id="opt-photo-filter" title="Photo presence">
          <option value="with">Only items with a photo</option>
          <option value="without">Only items without a photo</option>
          <option value="any">Any</option>
        </select>
        <select id="opt-quality-filter" title="Photo quality">
          <option value="any">Any quality</option>
          <option value="hide">Hide low-quality photos</option>
          <option value="only">Only low-quality photos</option>
        </select>
      </div>
    </div>
    <div class="filter-group">
      <span class="group-label">US Availability</span>
      <div class="options">
        {us_status_checkboxes}
      </div>
    </div>
    <div class="filter-group">
      <span class="group-label">DE Availability</span>
      <div class="options">
        {de_status_checkboxes}
      </div>
    </div>
    <div class="filter-group">
      <span class="group-label">Product Type</span>
      <div class="options">
        {type_checkboxes}
      </div>
    </div>
    <div class="filter-group">
      <span class="group-label">Category</span>
      <div class="options">
        {category_checkboxes}
      </div>
    </div>
  </div>
</div>
</div>

<main id="main-content"></main>

<footer>
  Data parsed from <a href="https://www.giantmicrobes.com/us/" target="_blank" rel="noopener">giantmicrobes.com</a> and
  <a href="https://www.riesenmikroben.de/" target="_blank" rel="noopener">riesenmikroben.de</a>.
  Retired-item dates are approximate (Internet Archive Wayback Machine coverage) &mdash; see AGENTS.md.
</footer>

<div id="hover-preview"><img src="" alt=""></div>
<div id="lightbox">
  <button id="lb-prev" class="lb-nav" type="button" aria-label="Previous">&#8592;</button>
  <button id="lb-next" class="lb-nav" type="button" aria-label="Next">&#8594;</button>
  <button id="lb-close" type="button" aria-label="Close">&#10005;</button>
  <div class="lb-content">
    <img id="lb-img" src="" alt="">
    <div class="lb-info">
      <div class="lb-name" id="lb-name"></div>
      <div class="lb-species" id="lb-species"></div>
      <div class="lb-desc" id="lb-desc"></div>
      <div class="lb-meta" id="lb-meta"></div>
      <div class="lb-avail" id="lb-avail"></div>
    </div>
  </div>
</div>

<script>{js}</script>
</body>
</html>
"""

    with open("catalog.html", "w") as f:
        f.write(html)
    print(f"Wrote catalog.html ({len(_items)} items, {len(ALL_CATEGORIES)} categories, {len(ALL_PRODUCT_TYPES)} product types)")


if __name__ == "__main__":
    main()
