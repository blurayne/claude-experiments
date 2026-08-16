#!/usr/bin/env python3
"""Build catalog.html: a single interactive page merging the by-birthday,
by-release-date and monthly-calendar views into one document.

The gzip-compressed dataset is base64-embedded directly in the page (rather
than fetched from a separate file), so the page works when opened directly
via file:// -- browsers block fetch() of local files under the Same-Origin
Policy, but an inline <script> with the data baked in has no such
restriction. Decompression happens in-browser via the Compression Streams
API (DecompressionStream).

Controls in the header: display-mode dropdown (by birthday / by release date
/ monthly calendar for CURRENT_YEAR / monthly calendar for CURRENT_YEAR+1),
dedup mode (none / by name / by name+year) with an oldest/latest tiebreaker,
a light/dark theme toggle, and multi-select filters for status (current/out
of stock/retired) and product type. Click a photo for a full-size preview,
hover for a smaller one. Print via the browser's own Ctrl/Cmd+P.
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
}
[data-theme="dark"] {
  --bg: #1c1712;
  --panel-bg: #26201a;
  --ink: #f3ece2;
  --muted: #b6a48f;
  --border: #3c3226;
  --card-bg: #241e18;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: 'Baloo 2', 'Fredoka', 'Comic Sans MS', system-ui, sans-serif;
  background: var(--bg);
  color: var(--ink);
}
header.hero {
  background: linear-gradient(135deg, var(--ty-red) 0%, #ff6a5c 50%, var(--sunny-yellow) 100%);
  color: white;
  padding: 1.2rem 1.5rem;
}
header.hero h1 {
  margin: 0 0 .8rem;
  font-size: 1.8rem;
  text-shadow: 1px 1px 0 rgba(0,0,0,.15);
}
.controls {
  display: flex;
  flex-wrap: wrap;
  gap: .6rem;
  align-items: center;
}
.controls select, .controls button {
  font-family: inherit;
  font-size: .9rem;
  font-weight: 700;
  border-radius: 8px;
  border: 2px solid white;
  padding: .4rem .7rem;
  background: rgba(255,255,255,.15);
  color: white;
  cursor: pointer;
}
.controls select option { color: #222; }
.controls button:hover, .controls select:hover { background: rgba(255,255,255,.3); }
.controls input[type="range"] { width: 7rem; vertical-align: middle; }
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
  background: rgba(255,255,255,0.2);
  border: 2px solid rgba(255,255,255,0.5);
  border-radius: 999px;
  padding: .3rem .8rem;
  font-weight: 700;
  font-size: .85rem;
}

.filters-panel {
  background: var(--panel-bg);
  border-bottom: 2px dashed var(--border);
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
main.layout-screen .card img { max-height: calc(var(--card-width, 9rem) * 0.55); }
main.layout-screen .cal-entry { font-size: calc(var(--card-width, 9rem) * 0.055); }
main.layout-screen .cal-entry img { width: calc(var(--card-width, 9rem) * 0.15); height: calc(var(--card-width, 9rem) * 0.15); }

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
  width: var(--card-width, 6.5rem);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background: var(--card-bg);
}
.card img { max-width: 90%; max-height: 3.6rem; object-fit: contain; margin-bottom: .25rem; cursor: zoom-in; }
.card .placeholder { height: 3.6rem; display: flex; align-items: center; justify-content: center; font-size: 1.6rem; margin-bottom: .25rem; }
.card .cname { font-weight: 700; font-size: .7rem; line-height: 1.15; }
.card .cyear { font-size: .62rem; color: var(--muted); }
.card a.cname-link { color: var(--ty-red-dark); text-decoration: none; }
.card a.cname-link:hover { text-decoration: underline; }

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
.cal-entry { display: flex; align-items: center; gap: .2rem; font-size: .62rem; line-height: 1.1; margin-bottom: .15rem; min-width: 0; }
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
  background: rgba(0,0,0,.82);
  z-index: 2000;
  cursor: zoom-out;
}
#lightbox img { max-width: 90vw; max-height: 90vh; object-fit: contain; background: white; border-radius: 10px; padding: 1rem; }

@media print {
  .filters-panel, .controls, footer, #hover-preview, #lightbox { display: none !important; }
  header.hero { padding: .5rem 1rem; }
  header.hero h1 { font-size: 1.2rem; margin-bottom: 0; }
  body { background: white; }
  [data-theme="dark"] { --bg: white; --panel-bg: white; --ink: black; --card-bg: white; }
  .day-block, .card { break-inside: avoid; }
  section.month { break-before: page; }
  section.month:first-of-type { break-before: auto; }
  @page { size: A4 portrait; margin: 12mm; }
  main.mode-calendar { page: calendar-page; }
  @page calendar-page { size: A4 landscape; margin: 10mm; }
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
  dedupMode: "none",
  dedupPick: "latest",
  statusFilters: ["current", "oos", "retired"],
  typeFilters: ALL_PRODUCT_TYPES.slice(),
  layoutMode: "print",
  cardWidth: 9,
  search: ""
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

function statusKey(item) {
  if (item.is_retired) return "retired";
  if (item.is_out_of_stock) return "oos";
  return "current";
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

function displayLabel(item) {
  const name = item.web_display_name;
  const idx = name.indexOf(" - ");
  if (idx === -1) return titleCase(name);
  return titleCase(name.slice(0, idx)) + " \\u2014 " + name.slice(idx + 3);
}
function titleCase(s) {
  return s.replace(/\\w\\S*/g, t => t[0].toUpperCase() + t.slice(1).toLowerCase());
}

function cardHtml(item) {
  const label = displayLabel(item);
  const img = item.image_file
    ? `<img src="${item.image_file}" alt="" loading="lazy" data-preview="${item.image_file}">`
    : `<div class="placeholder">\\ud83e\\uddf8</div>`;
  const nameHtml = item.product_url
    ? `<a class="cname cname-link" href="${item.product_url}" target="_blank" rel="noopener">${label}</a>`
    : `<div class="cname">${label}</div>`;
  return `<div class="card">${img}${nameHtml}<div class="cyear">${item._year}</div></div>`;
}

function calEntryHtml(item) {
  const label = displayLabel(item);
  const cls = item._statusKey === "oos" ? " oos" : (item._statusKey === "retired" ? " retired" : "");
  const img = item.image_file
    ? `<img src="${item.image_file}" alt="" data-preview="${item.image_file}">`
    : `<span>\\ud83e\\uddf8</span>`;
  return `<div class="cal-entry${cls}">${img}<span class="ename">${label}</span></div>`;
}

function applyStatusTypeFilters() {
  const query = settings.search.trim().toLowerCase();
  return ALL_ITEMS.filter(i => {
    if (!statusFilters.has(i._statusKey) || !typeFilters.has(i.product_type)) return false;
    if (!query) return true;
    return i.web_display_name.toLowerCase().includes(query) || i.product_type.toLowerCase().includes(query);
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

function renderByBirthday(items) {
  const byDay = new Map();
  items.forEach(i => {
    const key = i.month + "-" + i._day;
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key).push(i);
  });

  const blocks = [];
  for (let month = 1; month <= 12; month++) {
    for (let day = 1; day <= 31; day++) {
      const dayItems = byDay.get(month + "-" + day);
      if (!dayItems || !dayItems.length) continue;
      const sections = [];
      [["current", "Current"], ["oos", "Out of Stock"], ["retired", "Retired"]].forEach(([key, label]) => {
        const bucket = dayItems.filter(i => i._statusKey === key).sort((a, b) => b.birth_date.localeCompare(a.birth_date));
        if (!bucket.length) return;
        sections.push(`<div class="status-label ${key}">${label} (${bucket.length})</div><div class="card-row">${bucket.map(i => cardHtml(i)).join("")}</div>`);
      });
      blocks.push(`<div class="day-block"><div class="block-head">${MONTHS[month - 1]} ${day}</div>${sections.join("")}</div>`);
    }
  }
  return blocks.length ? blocks.join("") : emptyState();
}

function renderByReleaseDate(items) {
  const byYear = new Map();
  items.forEach(i => {
    if (!byYear.has(i._year)) byYear.set(i._year, []);
    byYear.get(i._year).push(i);
  });
  const years = Array.from(byYear.keys()).sort((a, b) => b - a);
  if (!years.length) return emptyState();
  return years.map(year => {
    const yearItems = byYear.get(year).slice().sort((a, b) => b.birth_date.localeCompare(a.birth_date));
    return `<div class="year-block"><div class="block-head">${year} (${yearItems.length})</div><div class="card-row">${yearItems.map(i => cardHtml(i)).join("")}</div></div>`;
  }).join("");
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
  const items = visibleItems();
  const main = document.getElementById("main-content");
  const classes = [];
  if (mode.startsWith("cal")) classes.push("mode-calendar");
  if (settings.layoutMode === "screen") classes.push("layout-screen");
  main.className = classes.join(" ");
  main.style.setProperty("--card-width", settings.cardWidth + "rem");
  document.getElementById("stat-shown").textContent = "Filtered: " + items.length;

  if (mode === "birthday") {
    main.innerHTML = renderByBirthday(items);
  } else if (mode === "release") {
    main.innerHTML = renderByReleaseDate(items);
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
  const lightboxImg = lightbox.querySelector("img");

  document.getElementById("main-content").addEventListener("mouseover", e => {
    const img = e.target.closest("img[data-preview]");
    if (!img) return;
    hoverImg.src = img.dataset.preview;
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
    if (e.target.closest("img[data-preview]")) hoverPreview.style.display = "none";
  });
  document.getElementById("main-content").addEventListener("click", e => {
    const img = e.target.closest("img[data-preview]");
    if (!img) return;
    lightboxImg.src = img.dataset.preview;
    lightbox.style.display = "flex";
    hoverPreview.style.display = "none";
  });
  lightbox.addEventListener("click", () => { lightbox.style.display = "none"; });
}

function initControls() {
  document.documentElement.setAttribute("data-theme", settings.theme);
  document.getElementById("theme-btn").textContent = settings.theme === "dark" ? "\\u2600\\ufe0f Light" : "\\ud83c\\udf19 Dark";
  document.getElementById("theme-btn").addEventListener("click", toggleTheme);
  document.getElementById("print-btn").addEventListener("click", () => window.print());

  const displayModeEl = document.getElementById("display-mode");
  displayModeEl.value = settings.displayMode;
  displayModeEl.addEventListener("change", e => { settings.displayMode = e.target.value; saveSettings(); render(); });

  const dedupModeEl = document.getElementById("dedup-mode");
  dedupModeEl.value = settings.dedupMode;
  dedupModeEl.addEventListener("change", e => { settings.dedupMode = e.target.value; saveSettings(); render(); });

  const dedupPickEl = document.getElementById("dedup-pick");
  dedupPickEl.value = settings.dedupPick;
  dedupPickEl.addEventListener("change", e => { settings.dedupPick = e.target.value; saveSettings(); render(); });

  const layoutModeEl = document.getElementById("layout-mode");
  const cellSizeEl = document.getElementById("cell-size");
  layoutModeEl.value = settings.layoutMode;
  cellSizeEl.value = settings.cardWidth;
  cellSizeEl.style.display = settings.layoutMode === "screen" ? "inline-block" : "none";
  layoutModeEl.addEventListener("change", e => {
    settings.layoutMode = e.target.value;
    cellSizeEl.style.display = settings.layoutMode === "screen" ? "inline-block" : "none";
    saveSettings();
    render();
  });
  cellSizeEl.addEventListener("input", e => { settings.cardWidth = Number(e.target.value); saveSettings(); render(); });

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
<header class="hero">
  <h1>\U0001f9f8 Ty Beanie Baby Catalog</h1>
  <div class="controls">
    <select id="display-mode">
      <option value="birthday">By Birthday (Day/Month)</option>
      <option value="release">By Release Date</option>
      <option value="cal-current">Monthly Calendar &mdash; {CURRENT_YEAR}</option>
      <option value="cal-next">Monthly Calendar &mdash; {CURRENT_YEAR + 1}</option>
    </select>
    <select id="layout-mode">
      <option value="print">Print Layout</option>
      <option value="screen">Screen Layout</option>
    </select>
    <input type="range" id="cell-size" min="5" max="16" step="0.5" title="Cell size">
    <button id="theme-btn" type="button">\U0001f319 Dark</button>
    <button id="print-btn" type="button">\U0001f5a8️ Print / Save as PDF</button>
    <span class="stat-pill" id="stat-total">Loading&hellip;</span>
    <span class="stat-pill" id="stat-shown"></span>
  </div>
</header>

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

<main id="main-content"></main>

<footer>
  Data parsed from <a href="https://www.ty.com/birthdaycalendar.html?lang=en" target="_blank" rel="noopener">ty.com's birthday calendar</a>.
  Also available as <a href="calendar.md">plain markdown</a> and the <a href="calendar.html">card-view calendar</a>.
</footer>

<div id="hover-preview"><img src="" alt=""></div>
<div id="lightbox"><img src="" alt=""></div>

<script>{js}</script>
</body>
</html>
"""

    with open("catalog.html", "w") as f:
        f.write(html)
    print(f"Wrote catalog.html ({len(_items)} items, {len(PRODUCT_TYPES)} product types)")


if __name__ == "__main__":
    main()
