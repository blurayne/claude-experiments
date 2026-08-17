#!/usr/bin/env python3
"""Build catalog.html: a single interactive page merging the by-birthday,
by-release-date, by-name and monthly-calendar views into one document.

The gzip-compressed dataset is base64-embedded directly in the page (rather
than fetched from a separate file), so the page works when opened directly
via file:// -- browsers block fetch() of local files under the Same-Origin
Policy, but an inline <script> with the data baked in has no such
restriction. Decompression happens in-browser via the Compression Streams
API (DecompressionStream).

Layout: a slim sticky header (title + an "Options" toggle) with a
collapsible white panel underneath holding every control -- display mode
(by birthday / by release date / by name / monthly calendar, each with an
up/down sort-order toggle except the calendar), a screen/print layout switch
with a columns slider (hidden in calendar mode, since that view is fixed),
a text-size slider, dedup mode, a "Display Options" dropdown (show/hide
year, product type, description; product type inline vs as a label; status
as section headers, as labels, or hidden), theme toggle, free-text search,
and multi-select status/product-type filters. Every setting persists to
localStorage. Photos show an animated shimmer placeholder until loaded (no
layout jump). Click a photo for a full-size preview with prev/next
arrow-key and swipe navigation (with a slide transition) and full item
info; hover for a smaller preview. Print via the browser's own Ctrl/Cmd+P
-- the monthly-calendar view starts each month on its own page.
"""
import base64
import gzip
import json

CURRENT_YEAR = 2026

with open("calendar_data.json.gz", "rb") as f:
    _gz_bytes = f.read()
_EMBEDDED_B64 = base64.b64encode(_gz_bytes).decode("ascii")

with gzip.open("calendar_data.json.gz", "rt") as f:
    _items = json.load(f)
PRODUCT_TYPES = sorted(set(i["product_type"] for i in _items))

CSS = """
:root {
  --ty-red: #e2231a;
  --ty-red-dark: #b71c14;
  --sunny-yellow: #ffce3a;
  --grass-green: #4caf50;
  --orange: #f0a02c;
  --purple: #9c6ade;
}
[data-theme="light"] {
  --bg: #fff8ee;
  --panel-bg: #ffffff;
  --ink: #33261c;
  --muted: #a1826a;
  --border: #f0e4d3;
  --card-bg: #fffdf9;
  --shimmer-a: #f0e4d3;
  --shimmer-b: #fffdf9;
}
[data-theme="dark"] {
  --bg: #1c1712;
  --panel-bg: #26201a;
  --ink: #f3ece2;
  --muted: #b6a48f;
  --border: #3c3226;
  --card-bg: #241e18;
  --shimmer-a: #3c3226;
  --shimmer-b: #4a3d2e;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: 'Baloo 2', 'Fredoka', 'Comic Sans MS', system-ui, sans-serif;
  background: var(--bg);
  color: var(--ink);
}
.sticky-wrap {
  position: sticky;
  top: 0;
  z-index: 500;
  box-shadow: 0 2px 8px rgba(0,0,0,.15);
}
header.hero {
  background: linear-gradient(135deg, var(--ty-red) 0%, #ff6a5c 50%, var(--sunny-yellow) 100%);
  color: white;
  padding: .8rem 1.5rem;
}
.hero-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.hero-top h1 {
  margin: 0;
  font-size: 1.5rem;
  text-shadow: 1px 1px 0 rgba(0,0,0,.15);
  white-space: nowrap;
}
#options-toggle-btn {
  font-family: inherit;
  font-size: .9rem;
  font-weight: 700;
  border-radius: 8px;
  border: 2px solid white;
  padding: .45rem .8rem;
  background: rgba(255,255,255,.15);
  color: white;
  cursor: pointer;
  flex-shrink: 0;
}
#options-toggle-btn:hover { background: rgba(255,255,255,.3); }

#options-panel {
  background: var(--panel-bg);
  max-height: 0;
  overflow: hidden;
  transition: max-height .3s ease;
}
#options-panel.open { max-height: 44rem; overflow-y: auto; }

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: .6rem;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 2px dashed var(--border);
}
.controls select, .controls button {
  font-family: inherit;
  font-size: .85rem;
  font-weight: 700;
  border-radius: 8px;
  border: 2px solid var(--border);
  padding: .4rem .7rem;
  background: var(--card-bg);
  color: var(--ink);
  cursor: pointer;
}
.controls select option { color: #222; }
.controls button:hover, .controls select:hover { background: var(--bg); }
.controls input[type="range"] { width: 7rem; vertical-align: middle; }
#sort-order-btn { font-size: 1rem; padding: .4rem .6rem; }
#search-box {
  font-family: inherit;
  font-size: .85rem;
  padding: .35rem .6rem;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--card-bg);
  color: var(--ink);
  width: 14rem;
  max-width: 100%;
}
.stat-pill {
  background: var(--bg);
  border: 2px solid var(--border);
  border-radius: 999px;
  padding: .3rem .8rem;
  font-weight: 700;
  font-size: .85rem;
  color: var(--ink);
}

.dropdown-wrap { position: relative; }
.dropdown-panel {
  display: none;
  position: absolute;
  top: 115%;
  left: 0;
  background: var(--panel-bg);
  color: var(--ink);
  border: 2px solid var(--border);
  border-radius: 10px;
  padding: .8rem;
  z-index: 100;
  min-width: 15rem;
  box-shadow: 0 8px 24px rgba(0,0,0,.25);
  flex-direction: column;
  gap: .6rem;
}
.dropdown-panel.open { display: flex; }
.dropdown-panel label {
  display: flex;
  align-items: center;
  gap: .4rem;
  font-size: .82rem;
  font-weight: 600;
  cursor: pointer;
}
.dropdown-panel .opt-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .5rem;
  font-size: .8rem;
  font-weight: 700;
}
.dropdown-panel select {
  font-family: inherit;
  font-size: .8rem;
  font-weight: 600;
  padding: .25rem .5rem;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--card-bg);
  color: var(--ink);
}
.dropdown-panel hr { border: none; border-top: 1px solid var(--border); margin: .1rem 0; width: 100%; }

.filters-panel {
  background: var(--panel-bg);
  padding: .8rem 1.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}
.filter-group { display: flex; flex-direction: column; gap: .3rem; }
.filter-group .group-label { font-weight: 800; font-size: .75rem; text-transform: uppercase; color: var(--muted); }
.filter-group .options { display: flex; flex-wrap: wrap; gap: .4rem; max-width: 46rem; align-items: center; }
.filter-group label {
  display: flex;
  align-items: center;
  gap: .3rem;
  font-size: .82rem;
  font-weight: 600;
  cursor: pointer;
  padding: .2rem .5rem;
  border-radius: 6px;
  border: 1px solid var(--border);
}
.filter-group label:hover { background: var(--bg); }
.filter-group select {
  font-family: inherit;
  font-size: .82rem;
  font-weight: 600;
  padding: .25rem .5rem;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--card-bg);
  color: var(--ink);
}

main { max-width: 1200px; margin: 0 auto; padding: 1rem 1.2rem 3rem; }
main.layout-screen { max-width: none; }

.day-block { margin-bottom: 1.6rem; break-inside: avoid-page; }
.year-block { margin-bottom: 1.6rem; }
.block-head {
  font-weight: 800;
  font-size: 1.1rem;
  color: white;
  background: var(--ty-red);
  border-radius: 6px;
  padding: .3rem .8rem;
  margin-bottom: .5rem;
}
.status-label {
  font-size: .72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .3px;
  margin: .4rem 0 .3rem .1rem;
}
.status-label.current { color: var(--grass-green); }
.status-label.oos { color: var(--orange); }
.status-label.retired { color: var(--purple); }

.card-row { display: flex; flex-wrap: wrap; gap: .6rem; margin-bottom: .3rem; }
.card {
  border: 1.5px solid var(--border);
  border-radius: 10px;
  padding: .5rem;
  width: calc((100% - (var(--columns, 6) - 1) * .6rem) / var(--columns, 6));
  min-width: 5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background: var(--card-bg);
}
.card img, .card .placeholder { width: 100%; aspect-ratio: 1 / 1; object-fit: contain; margin-bottom: .25rem; border-radius: 4px; }
.card img { cursor: zoom-in; }
.card .placeholder { display: flex; align-items: center; justify-content: center; font-size: 1.6rem; background: var(--bg); }
.card .cname { font-weight: 700; font-size: calc(.7rem * var(--text-scale, 1)); line-height: 1.15; }
.card .cdesc { font-size: calc(.64rem * var(--text-scale, 1)); color: var(--muted); font-style: italic; line-height: 1.1; }
.card .cyear { font-size: calc(.62rem * var(--text-scale, 1)); color: var(--muted); }
.card a.cname-link { color: var(--ty-red-dark); text-decoration: none; }
.card a.cname-link:hover { text-decoration: underline; }
.card-badges { display: flex; flex-wrap: wrap; gap: .2rem; justify-content: center; margin-top: .2rem; }
.badge-pill {
  font-size: calc(.58rem * var(--text-scale, 1));
  font-weight: 800;
  padding: .1rem .45rem;
  border-radius: 999px;
  color: white;
  white-space: nowrap;
}
.badge-pill.type { background: var(--ty-red-dark); }
.badge-pill.current { background: var(--grass-green); }
.badge-pill.oos { background: var(--orange); }
.badge-pill.retired { background: var(--purple); }

/* Shimmer placeholder while an image loads, sized so nothing jumps once it's ready. */
img.beanie-img {
  background-image: linear-gradient(100deg, var(--shimmer-a) 30%, var(--shimmer-b) 50%, var(--shimmer-a) 70%);
  background-size: 300% 100%;
  animation: beanie-shimmer 1.3s ease-in-out infinite;
}
img.beanie-img.loaded { animation: none; background-image: none; }
@keyframes beanie-shimmer {
  0% { background-position: 150% 0; }
  100% { background-position: -150% 0; }
}

section.month { margin-bottom: 2rem; scroll-margin-top: 1rem; }
section.month h2 {
  font-size: 1.4rem;
  color: var(--ty-red-dark);
  border-bottom: 3px solid var(--sunny-yellow);
  display: inline-block;
  padding-bottom: .1rem;
}
.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: .3rem;
  margin-top: .5rem;
}
.cal-weekday { text-align: center; font-weight: 800; font-size: .75rem; color: var(--ty-red-dark); padding-bottom: .2rem; border-bottom: 2px solid var(--sunny-yellow); }
.cal-day {
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: .3rem;
  min-height: 5rem;
  background: var(--card-bg);
}
.cal-day.empty { background: transparent; border-color: transparent; }
.cal-day .daynum { font-weight: 800; font-size: .75rem; color: var(--muted); margin-bottom: .2rem; }
.cal-entries { display: grid; grid-template-columns: 1fr 1fr; gap: 0 .3rem; }
.cal-entry { display: flex; align-items: center; gap: .2rem; font-size: calc(.62rem * var(--text-scale, 1)); line-height: 1.1; margin-bottom: .15rem; min-width: 0; }
.cal-entry img { width: 1rem; height: 1rem; object-fit: contain; border-radius: 2px; background: var(--bg); flex-shrink: 0; cursor: zoom-in; }
.cal-entry .ename { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
.cal-entry.oos { color: var(--orange); }
.cal-entry.retired { color: var(--muted); }

.empty-state { text-align: center; padding: 3rem 1rem; color: var(--muted); font-size: 1.1rem; }

footer { text-align: center; padding: 1.5rem; color: var(--muted); font-size: .8rem; }

#hover-preview {
  position: fixed;
  display: none;
  pointer-events: none;
  z-index: 1000;
  background: var(--panel-bg);
  border: 2px solid var(--border);
  border-radius: 10px;
  padding: .5rem;
  box-shadow: 0 8px 24px rgba(0,0,0,.25);
}
#hover-preview img { display: block; max-width: 50vw; max-height: 50vh; object-fit: contain; }

#lightbox {
  position: fixed;
  inset: 0;
  display: none;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,.85);
  z-index: 2000;
  touch-action: pan-y;
}
#lightbox .lb-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 92vw;
  max-height: 92vh;
  cursor: default;
  overflow: hidden;
}
#lightbox img { max-width: 88vw; max-height: 70vh; object-fit: contain; background: white; border-radius: 10px; padding: 1rem; }
#lightbox img.anim-next { animation: lb-enter-right .28s ease; }
#lightbox img.anim-prev { animation: lb-enter-left .28s ease; }
@keyframes lb-enter-right { from { transform: translateX(60px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
@keyframes lb-enter-left { from { transform: translateX(-60px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
#lightbox .lb-info { color: white; text-align: center; margin-top: .8rem; max-width: 30rem; }
#lightbox .lb-info .lb-name { font-size: 1.3rem; font-weight: 800; }
#lightbox .lb-info .lb-desc { font-size: .95rem; font-style: italic; opacity: .9; margin-top: .2rem; }
#lightbox .lb-info .lb-meta { font-size: .85rem; opacity: .8; margin-top: .4rem; }
.lb-nav {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255,255,255,.15);
  color: white;
  border: 2px solid rgba(255,255,255,.6);
  border-radius: 999px;
  width: 3rem;
  height: 3rem;
  font-size: 1.4rem;
  cursor: pointer;
  z-index: 2001;
}
.lb-nav:hover { background: rgba(255,255,255,.3); }
#lb-prev { left: 1.5rem; }
#lb-next { right: 1.5rem; }
#lb-close {
  position: fixed;
  top: 1.2rem;
  right: 1.5rem;
  background: rgba(255,255,255,.15);
  color: white;
  border: 2px solid rgba(255,255,255,.6);
  border-radius: 999px;
  width: 2.4rem;
  height: 2.4rem;
  font-size: 1.1rem;
  cursor: pointer;
  z-index: 2001;
}

@media print {
  #options-panel, #options-toggle-btn, footer, #hover-preview, #lightbox { display: none !important; }
  .sticky-wrap { position: static; box-shadow: none; }
  header.hero { padding: .5rem 1rem; }
  .hero-top h1 { font-size: 1.2rem; }
  body { background: white; }
  [data-theme="dark"] { --bg: white; --panel-bg: white; --ink: black; --card-bg: white; }
  .day-block, .card { break-inside: avoid; }
  section.month { break-before: page; }
  section.month:first-of-type { break-before: auto; }
  @page {
    size: A4 portrait;
    margin: 12mm;
    @bottom-center { content: "Page " counter(page) " of " counter(pages); font-size: 9pt; color: #a1826a; }
  }
  main.mode-calendar { page: calendar-page; }
  @page calendar-page {
    size: A4 landscape;
    margin: 10mm;
    @bottom-center { content: "Page " counter(page) " of " counter(pages); font-size: 9pt; color: #a1826a; }
  }
}
"""

JS = """
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const CURRENT_YEAR = %(current_year)s;
const EMBEDDED_DATA_B64 = "%(embedded_b64)s";

const ALL_PRODUCT_TYPES = %(product_types_json)s;
const DEFAULT_SETTINGS = {
  theme: "light",
  displayMode: "birthday",
  sortOrder: "asc",
  dedupMode: "none",
  dedupPick: "latest",
  statusFilters: ["current", "oos", "retired"],
  typeFilters: ALL_PRODUCT_TYPES.slice(),
  layoutMode: "print",
  columns: 4,
  textScale: 1,
  search: "",
  showYear: true,
  showType: true,
  showDescription: false,
  typeDisplayMode: "label",
  statusDisplayMode: "sections",
  optionsOpen: true
};

function loadSettings() {
  try {
    const raw = localStorage.getItem("beanie-settings");
    if (!raw) return Object.assign({}, DEFAULT_SETTINGS);
    return Object.assign({}, DEFAULT_SETTINGS, JSON.parse(raw));
  } catch (e) {
    return Object.assign({}, DEFAULT_SETTINGS);
  }
}
function saveSettings() {
  localStorage.setItem("beanie-settings", JSON.stringify(settings));
}

let ALL_ITEMS = [];
let settings = loadSettings();
let statusFilters = new Set(settings.statusFilters);
let typeFilters = new Set(settings.typeFilters);
let LIGHTBOX_ITEMS = [];
let lightboxIndex = -1;

function statusKey(item) {
  if (item.is_retired) return "retired";
  if (item.is_out_of_stock) return "oos";
  return "current";
}
function statusLabel(key) {
  return key === "current" ? "Current" : (key === "oos" ? "Out of Stock" : "Retired");
}

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
    const [datePart] = item.birth_date.split(" ");
    const [y, m, d] = datePart.split("-").map(Number);
    item._year = y;
    item._day = d;
    item._statusKey = statusKey(item);
  });
  document.getElementById("stat-total").textContent = "Total: " + ALL_ITEMS.length;
  render();
}

function titleCase(s) {
  return s.replace(/\\w\\S*/g, t => t[0].toUpperCase() + t.slice(1).toLowerCase());
}
function splitName(item) {
  const name = item.web_display_name;
  const idx = name.indexOf(" - ");
  if (idx === -1) return { name: titleCase(name), description: "" };
  return { name: titleCase(name.slice(0, idx)), description: name.slice(idx + 3) };
}

function typeBadgeHtml(item) {
  if (!settings.showType || settings.typeDisplayMode !== "label") return "";
  return `<span class="badge-pill type">${item.product_type}</span>`;
}
function statusBadgeHtml(item) {
  if (settings.statusDisplayMode !== "labels") return "";
  return `<span class="badge-pill ${item._statusKey}">${statusLabel(item._statusKey)}</span>`;
}

function trackItem(item) {
  LIGHTBOX_ITEMS.push(item);
  return LIGHTBOX_ITEMS.length - 1;
}

function cardHtml(item) {
  const { name, description } = splitName(item);
  let nameText = name;
  if (settings.showType && settings.typeDisplayMode === "inline") nameText += ` (${item.product_type})`;
  const idx = trackItem(item);
  const img = item.image_file
    ? `<img class="beanie-img" src="${item.image_file}" alt="" loading="lazy" data-idx="${idx}" onload="this.classList.add('loaded')" onerror="if(!this.dataset.retried){this.dataset.retried=1;this.src=this.src;}">`
    : `<div class="placeholder">\\ud83e\\uddf8</div>`;
  const nameHtml = item.product_url
    ? `<a class="cname cname-link" href="${item.product_url}" target="_blank" rel="noopener">${nameText}</a>`
    : `<div class="cname">${nameText}</div>`;
  const descHtml = settings.showDescription && description ? `<div class="cdesc">${description}</div>` : "";
  const yearHtml = settings.showYear ? `<div class="cyear">${item._year}</div>` : "";
  const badges = typeBadgeHtml(item) + statusBadgeHtml(item);
  const badgesHtml = badges ? `<div class="card-badges">${badges}</div>` : "";
  return `<div class="card">${img}${nameHtml}${descHtml}${yearHtml}${badgesHtml}</div>`;
}

function calEntryHtml(item) {
  const { name } = splitName(item);
  let label = name;
  if (settings.showType && settings.typeDisplayMode === "inline") label += ` (${item.product_type})`;
  const cls = settings.statusDisplayMode === "hidden" ? "" :
    (item._statusKey === "oos" ? " oos" : (item._statusKey === "retired" ? " retired" : ""));
  const idx = trackItem(item);
  const img = item.image_file
    ? `<img class="beanie-img" src="${item.image_file}" alt="" loading="lazy" data-idx="${idx}" onload="this.classList.add('loaded')" onerror="if(!this.dataset.retried){this.dataset.retried=1;this.src=this.src;}">`
    : `<span>\\ud83e\\uddf8</span>`;
  return `<div class="cal-entry${cls}">${img}<span class="ename">${label}</span></div>`;
}

function queryVariants(query) {
  // Cheap singular/plural fallback so "cats" also matches "cat" and
  // "bouncers" also matches the product type "Beanie Bouncer".
  const variants = [query];
  if (query.endsWith("s") && query.length > 3) variants.push(query.slice(0, -1));
  else variants.push(query + "s");
  return variants;
}

function applyStatusTypeFilters() {
  const query = settings.search.trim().toLowerCase();
  const variants = query ? queryVariants(query) : [];
  return ALL_ITEMS.filter(i => {
    if (!statusFilters.has(i._statusKey) || !typeFilters.has(i.product_type)) return false;
    if (!query) return true;
    const haystack = i.web_display_name.toLowerCase() + " " + i.product_type.toLowerCase() + " " + (i.animal_types || []).join(" ");
    return variants.some(v => haystack.includes(v));
  });
}

function applyDedup(items) {
  if (settings.dedupMode === "none") return items;
  const groups = new Map();
  items.forEach(i => {
    const key = settings.dedupMode === "name" ? i.display_name : (i.display_name + "|" + i._year);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(i);
  });
  const result = [];
  groups.forEach(group => {
    if (group.length === 1) { result.push(group[0]); return; }
    const sorted = group.slice().sort((a, b) => a.birth_date.localeCompare(b.birth_date));
    result.push(settings.dedupPick === "oldest" ? sorted[0] : sorted[sorted.length - 1]);
  });
  return result;
}

function visibleItems() {
  return applyDedup(applyStatusTypeFilters());
}

function byBirthDate(a, b) { return a.birth_date.localeCompare(b.birth_date); }
function byName(a, b) { return a.display_name.localeCompare(b.display_name) || byBirthDate(a, b); }

function statusSections(items, rowClass, dir, compareFn) {
  compareFn = compareFn || byBirthDate;
  if (settings.statusDisplayMode === "sections") {
    const sections = [];
    [["current", "Current"], ["oos", "Out of Stock"], ["retired", "Retired"]].forEach(([key, label]) => {
      const bucket = items.filter(i => i._statusKey === key).sort((a, b) => dir * compareFn(a, b));
      if (!bucket.length) return;
      sections.push(`<div class="status-label ${key}">${label} (${bucket.length})</div><div class="${rowClass}">${bucket.map(i => cardHtml(i)).join("")}</div>`);
    });
    return sections.join("");
  }
  const sorted = items.slice().sort((a, b) => dir * compareFn(a, b));
  return `<div class="${rowClass}">${sorted.map(i => cardHtml(i)).join("")}</div>`;
}

function sortDir() {
  return settings.sortOrder === "desc" ? -1 : 1;
}

function renderByBirthday(items) {
  const byDay = new Map();
  items.forEach(i => {
    const key = i.month + "-" + i._day;
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key).push(i);
  });

  const blockData = [];
  for (let month = 1; month <= 12; month++) {
    for (let day = 1; day <= 31; day++) {
      const dayItems = byDay.get(month + "-" + day);
      if (!dayItems || !dayItems.length) continue;
      blockData.push({ label: MONTHS[month - 1] + " " + day, items: dayItems });
    }
  }
  if (!blockData.length) return emptyState();
  const dir = sortDir();
  if (dir === -1) blockData.reverse();
  return blockData.map(b => `<div class="day-block"><div class="block-head">${b.label}</div>${statusSections(b.items, "card-row", dir)}</div>`).join("");
}

function renderByReleaseDate(items) {
  const byYear = new Map();
  items.forEach(i => {
    if (!byYear.has(i._year)) byYear.set(i._year, []);
    byYear.get(i._year).push(i);
  });
  const years = Array.from(byYear.keys()).sort((a, b) => a - b);
  if (!years.length) return emptyState();
  const dir = sortDir();
  if (dir === -1) years.reverse();
  return years.map(year => {
    const yearItems = byYear.get(year);
    return `<div class="year-block"><div class="block-head">${year} (${yearItems.length})</div>${statusSections(yearItems, "card-row", dir)}</div>`;
  }).join("");
}

function renderByName(items) {
  if (!items.length) return emptyState();
  return `<div class="year-block">${statusSections(items, "card-row", sortDir(), byName)}</div>`;
}

function weekday(year, month, day) {
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay(); // 0=Sun
}
function daysInMonth(year, month) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function renderMonthlyCalendar(items, year) {
  const byDay = new Map();
  items.forEach(i => {
    const key = i.month + "-" + i._day;
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key).push(i);
  });

  const sections = [];
  for (let month = 1; month <= 12; month++) {
    const numDays = daysInMonth(year, month);
    const firstWeekday = weekday(year, month, 1);
    const cells = [];
    for (let i = 0; i < firstWeekday; i++) cells.push('<div class="cal-day empty"></div>');
    for (let day = 1; day <= numDays; day++) {
      const dayItems = (byDay.get(month + "-" + day) || []).slice().sort((a, b) => (a._statusKey > b._statusKey ? 1 : -1) || a.display_name.localeCompare(b.display_name));
      const entries = dayItems.map(calEntryHtml).join("");
      cells.push(`<div class="cal-day"><div class="daynum">${day}</div><div class="cal-entries">${entries}</div></div>`);
    }
    const weekdayHead = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(w => `<div class="cal-weekday">${w}</div>`).join("");
    sections.push(`<section class="month" id="cal-${MONTHS[month - 1].toLowerCase()}"><h2>${MONTHS[month - 1]} ${year}</h2><div class="cal-grid">${weekdayHead}${cells.join("")}</div></section>`);
  }
  return sections.join("");
}

function emptyState() {
  return '<div class="empty-state">No Beanie Babies match the current filters.</div>';
}

function render() {
  const mode = settings.displayMode;
  const isCalendar = mode.startsWith("cal");
  const items = visibleItems();
  const main = document.getElementById("main-content");
  const classes = [];
  if (isCalendar) classes.push("mode-calendar");
  if (settings.layoutMode === "screen") classes.push("layout-screen");
  main.className = classes.join(" ");
  main.style.setProperty("--columns", settings.columns);
  main.style.setProperty("--text-scale", settings.textScale);
  document.getElementById("stat-shown").textContent = "Filtered: " + items.length;

  document.getElementById("columns-slider").style.display = isCalendar ? "none" : "inline-block";
  document.getElementById("sort-order-btn").style.display = isCalendar ? "none" : "inline-block";

  LIGHTBOX_ITEMS = [];
  if (mode === "birthday") {
    main.innerHTML = renderByBirthday(items);
  } else if (mode === "release") {
    main.innerHTML = renderByReleaseDate(items);
  } else if (mode === "name") {
    main.innerHTML = renderByName(items);
  } else if (mode === "cal-current") {
    main.innerHTML = renderMonthlyCalendar(items, CURRENT_YEAR);
  } else if (mode === "cal-next") {
    main.innerHTML = renderMonthlyCalendar(items, CURRENT_YEAR + 1);
  }
}

function toggleTheme() {
  const html = document.documentElement;
  const next = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
  html.setAttribute("data-theme", next);
  document.getElementById("theme-btn").textContent = next === "dark" ? "\\u2600\\ufe0f Light" : "\\ud83c\\udf19 Dark";
  settings.theme = next;
  saveSettings();
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
    const img = e.target.closest("img[data-idx]");
    if (!img) return;
    showLightbox(Number(img.dataset.idx));
    hoverPreview.style.display = "none";
  });

  function showLightbox(idx, dir) {
    if (!LIGHTBOX_ITEMS.length) return;
    lightboxIndex = ((idx %% LIGHTBOX_ITEMS.length) + LIGHTBOX_ITEMS.length) %% LIGHTBOX_ITEMS.length;
    const item = LIGHTBOX_ITEMS[lightboxIndex];
    const { name, description } = splitName(item);
    lightboxImg.classList.remove("loaded", "anim-next", "anim-prev");
    void lightboxImg.offsetWidth;
    if (dir === "next") lightboxImg.classList.add("anim-next");
    else if (dir === "prev") lightboxImg.classList.add("anim-prev");
    lightboxImg.src = item.image_file || "";
    document.getElementById("lb-name").textContent = name;
    document.getElementById("lb-desc").textContent = description || "";
    document.getElementById("lb-desc").style.display = description ? "block" : "none";
    document.getElementById("lb-meta").textContent = [item.product_type, item._year, statusLabel(item._statusKey)].join("  \\u00b7  ");
    lightbox.style.display = "flex";
  }

  function closeLightbox() { lightbox.style.display = "none"; }
  function prev() { showLightbox(lightboxIndex - 1, "prev"); }
  function next() { showLightbox(lightboxIndex + 1, "next"); }

  document.getElementById("lb-prev").addEventListener("click", prev);
  document.getElementById("lb-next").addEventListener("click", next);
  document.getElementById("lb-close").addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", e => {
    if (e.target === lightbox) closeLightbox();
  });
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
  btn.addEventListener("click", e => {
    e.stopPropagation();
    panel.classList.toggle("open");
  });
  panel.addEventListener("click", e => e.stopPropagation());
  document.addEventListener("click", () => panel.classList.remove("open"));
}

function updateColumnsRange() {
  const columnsEl = document.getElementById("columns-slider");
  columnsEl.min = 1;
  columnsEl.max = settings.layoutMode === "screen" ? 10 : 6;
  columnsEl.value = settings.columns;
}

function initControls() {
  document.documentElement.setAttribute("data-theme", settings.theme);
  document.getElementById("theme-btn").textContent = settings.theme === "dark" ? "\\u2600\\ufe0f Light" : "\\ud83c\\udf19 Dark";
  document.getElementById("theme-btn").addEventListener("click", toggleTheme);
  document.getElementById("print-btn").addEventListener("click", () => window.print());

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

  const dedupModeEl = document.getElementById("dedup-mode");
  dedupModeEl.value = settings.dedupMode;
  dedupModeEl.addEventListener("change", e => { settings.dedupMode = e.target.value; saveSettings(); render(); });

  const dedupPickEl = document.getElementById("dedup-pick");
  dedupPickEl.value = settings.dedupPick;
  dedupPickEl.addEventListener("change", e => { settings.dedupPick = e.target.value; saveSettings(); render(); });

  const layoutModeEl = document.getElementById("layout-mode");
  layoutModeEl.value = settings.layoutMode;
  updateColumnsRange();
  layoutModeEl.addEventListener("change", e => {
    settings.layoutMode = e.target.value;
    updateColumnsRange();
    saveSettings();
    render();
  });
  document.getElementById("columns-slider").addEventListener("input", e => { settings.columns = Number(e.target.value); saveSettings(); render(); });

  const textSizeEl = document.getElementById("text-size");
  textSizeEl.value = settings.textScale;
  textSizeEl.addEventListener("input", e => { settings.textScale = Number(e.target.value); saveSettings(); render(); });

  const searchEl = document.getElementById("search-box");
  searchEl.value = settings.search;
  searchEl.addEventListener("input", e => { settings.search = e.target.value; saveSettings(); render(); });

  document.querySelectorAll("input[data-status]").forEach(el => {
    el.checked = statusFilters.has(el.dataset.status);
    el.addEventListener("change", () => {
      const v = el.dataset.status;
      if (el.checked) statusFilters.add(v); else statusFilters.delete(v);
      settings.statusFilters = Array.from(statusFilters);
      saveSettings();
      render();
    });
  });
  document.querySelectorAll("input[data-type]").forEach(el => {
    el.checked = typeFilters.has(el.dataset.type);
    el.addEventListener("change", () => {
      const v = el.dataset.type;
      if (el.checked) typeFilters.add(v); else typeFilters.delete(v);
      settings.typeFilters = Array.from(typeFilters);
      saveSettings();
      render();
    });
  });

  const optYear = document.getElementById("opt-year");
  const optType = document.getElementById("opt-type");
  const optDesc = document.getElementById("opt-desc");
  const optTypeMode = document.getElementById("opt-type-mode");
  const optStatusMode = document.getElementById("opt-status-mode");
  optYear.checked = settings.showYear;
  optType.checked = settings.showType;
  optDesc.checked = settings.showDescription;
  optTypeMode.value = settings.typeDisplayMode;
  optStatusMode.value = settings.statusDisplayMode;
  optYear.addEventListener("change", () => { settings.showYear = optYear.checked; saveSettings(); render(); });
  optType.addEventListener("change", () => { settings.showType = optType.checked; saveSettings(); render(); });
  optDesc.addEventListener("change", () => { settings.showDescription = optDesc.checked; saveSettings(); render(); });
  optTypeMode.addEventListener("change", () => { settings.typeDisplayMode = optTypeMode.value; saveSettings(); render(); });
  optStatusMode.addEventListener("change", () => { settings.statusDisplayMode = optStatusMode.value; saveSettings(); render(); });

  setupDropdown("display-opts-btn", "display-opts-panel");
}

document.addEventListener("DOMContentLoaded", () => {
  initControls();
  setupPreview();
  loadData();
});
"""


def main():
    type_checkboxes = "\n".join(
        f'<label><input type="checkbox" data-type="{t}" checked> {t}</label>'
        for t in PRODUCT_TYPES
    )

    js = JS % {
        "current_year": CURRENT_YEAR,
        "product_types_json": json.dumps(PRODUCT_TYPES),
        "embedded_b64": _EMBEDDED_B64,
    }

    html = f"""<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Ty Beanie Baby Catalog</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700;800&display=swap" rel="stylesheet">
<style>{CSS}</style>
</head>
<body>
<div class="sticky-wrap">
<header class="hero">
  <div class="hero-top">
    <h1>\U0001f9f8 Ty Beanie Baby Catalog</h1>
    <button id="options-toggle-btn" type="button">☰ Options</button>
  </div>
</header>

<div id="options-panel">
  <div class="controls">
    <select id="display-mode">
      <option value="birthday">By Birthday (Day/Month)</option>
      <option value="release">By Release Date</option>
      <option value="name">By Name</option>
      <option value="cal-current">Monthly Calendar &mdash; {CURRENT_YEAR}</option>
      <option value="cal-next">Monthly Calendar &mdash; {CURRENT_YEAR + 1}</option>
    </select>
    <button id="sort-order-btn" type="button" title="Sort order">↑</button>
    <select id="layout-mode">
      <option value="print">Print Layout</option>
      <option value="screen">Screen Layout</option>
    </select>
    <input type="range" id="columns-slider" min="1" max="6" step="1" title="Columns">
    <input type="range" id="text-size" min="0.6" max="2.5" step="0.1" title="Text size">
    <div class="dropdown-wrap">
      <button id="display-opts-btn" type="button">⚙️ Display Options</button>
      <div id="display-opts-panel" class="dropdown-panel">
        <label><input type="checkbox" id="opt-year"> Show Year</label>
        <label><input type="checkbox" id="opt-type"> Show Product Type</label>
        <label><input type="checkbox" id="opt-desc"> Show Description</label>
        <hr>
        <div class="opt-row"><span>Product type as</span>
          <select id="opt-type-mode">
            <option value="label">Label</option>
            <option value="inline">Part of name</option>
          </select>
        </div>
        <div class="opt-row"><span>Status as</span>
          <select id="opt-status-mode">
            <option value="sections">Section headers</option>
            <option value="labels">Labels</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>
      </div>
    </div>
    <button id="theme-btn" type="button">\U0001f319 Dark</button>
    <button id="print-btn" type="button">\U0001f5a8️ Print / Save as PDF</button>
    <span class="stat-pill" id="stat-total">Loading&hellip;</span>
    <span class="stat-pill" id="stat-shown"></span>
  </div>

  <div class="filters-panel">
    <div class="filter-group">
      <span class="group-label">Search</span>
      <div class="options">
        <input type="search" id="search-box" placeholder="e.g. cat, boo, sequin&hellip;">
      </div>
    </div>
    <div class="filter-group">
      <span class="group-label">Status</span>
      <div class="options">
        <label><input type="checkbox" data-status="current" checked> ✅ Current</label>
        <label><input type="checkbox" data-status="oos" checked> \U0001f4e6 Out of Stock</label>
        <label><input type="checkbox" data-status="retired" checked> \U0001f3db️ Retired</label>
      </div>
    </div>
    <div class="filter-group">
      <span class="group-label">Duplicates</span>
      <div class="options">
        <select id="dedup-mode">
          <option value="none">No deduplication</option>
          <option value="name">Deduplicate by Name only</option>
          <option value="name-year">Deduplicate by Name + Year</option>
        </select>
        <select id="dedup-pick">
          <option value="latest">Keep latest</option>
          <option value="oldest">Keep oldest</option>
        </select>
      </div>
    </div>
    <div class="filter-group">
      <span class="group-label">Product Type</span>
      <div class="options">
        {type_checkboxes}
      </div>
    </div>
  </div>
</div>
</div>

<main id="main-content"></main>

<footer>
  Data parsed from <a href="https://www.ty.com/birthdaycalendar.html?lang=en" target="_blank" rel="noopener">ty.com's birthday calendar</a>.
  Also available as <a href="calendar.md">plain markdown</a> and the <a href="calendar.html">card-view calendar</a>.
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
      <div class="lb-desc" id="lb-desc"></div>
      <div class="lb-meta" id="lb-meta"></div>
    </div>
  </div>
</div>

<script>{js}</script>
</body>
</html>
"""

    with open("catalog.html", "w") as f:
        f.write(html)
    print(f"Wrote catalog.html ({len(_items)} items, {len(PRODUCT_TYPES)} product types)")


if __name__ == "__main__":
    main()
