#!/usr/bin/env python3
"""Render calendar_data.json into a single self-contained, styled calendar.html."""
import gzip
import json
from datetime import datetime
from html import escape

MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
]


def parse_birth_date(birth_date):
    return datetime.strptime(birth_date, "%Y-%m-%d %H:%M:%S")


def fmt_birthday(dt, month_name):
    return f"{month_name} {dt.day}, {dt.year}"


def display_label(item):
    name = item["web_display_name"]
    if " - " in name:
        n, desc = name.split(" - ", 1)
        return f"{n.title()} — {desc}"
    return name.title()


CSS = """
:root {
  --ty-red: #e2231a;
  --ty-red-dark: #b71c14;
  --sky-blue: #3fb6f0;
  --sunny-yellow: #ffce3a;
  --grass-green: #4caf50;
  --grape-purple: #9c6ade;
  --cream: #fff8ee;
  --ink: #33261c;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: 'Baloo 2', 'Fredoka', 'Comic Sans MS', system-ui, sans-serif;
  background: var(--cream);
  color: var(--ink);
}
header.hero {
  background: linear-gradient(135deg, var(--ty-red) 0%, #ff6a5c 50%, var(--sunny-yellow) 100%);
  color: white;
  padding: 2.5rem 1.5rem 2rem;
  text-align: center;
  box-shadow: 0 4px 0 rgba(0,0,0,0.08);
}
header.hero h1 {
  font-size: 2.6rem;
  margin: 0 0 .4rem;
  text-shadow: 2px 2px 0 rgba(0,0,0,0.15);
  letter-spacing: .5px;
}
header.hero p {
  margin: .2rem 0;
  font-size: 1.1rem;
  opacity: .95;
}
header.hero .stats {
  margin-top: 1rem;
  display: flex;
  gap: .75rem;
  justify-content: center;
  flex-wrap: wrap;
}
.stat-pill {
  background: rgba(255,255,255,0.25);
  border: 2px solid rgba(255,255,255,0.6);
  border-radius: 999px;
  padding: .35rem 1rem;
  font-weight: 700;
  font-size: .95rem;
}
nav.month-nav {
  position: sticky;
  top: 0;
  z-index: 10;
  background: white;
  border-bottom: 3px dashed var(--ty-red);
  padding: .6rem .5rem;
  display: flex;
  gap: .4rem;
  flex-wrap: wrap;
  justify-content: center;
}
nav.month-nav a {
  text-decoration: none;
  color: var(--ty-red-dark);
  background: var(--sunny-yellow);
  border: 2px solid var(--ty-red);
  border-radius: 999px;
  padding: .3rem .85rem;
  font-weight: 700;
  font-size: .85rem;
  transition: transform .1s ease;
}
nav.month-nav a:hover { transform: scale(1.08); background: var(--sky-blue); color: white; }

.filters {
  display: flex;
  gap: 1.2rem;
  justify-content: center;
  flex-wrap: wrap;
  padding: .8rem;
  background: #fff;
  border-bottom: 1px solid #eee;
  font-weight: 600;
}
.filters label {
  display: flex;
  align-items: center;
  gap: .35rem;
  cursor: pointer;
  padding: .25rem .6rem;
  border-radius: 8px;
}
.filters label:hover { background: #f3f3f3; }
.filters .sep {
  width: 2px;
  background: #eee;
  margin: 0 .3rem;
}

main { max-width: 1100px; margin: 0 auto; padding: 1rem 1rem 3rem; }

section.month {
  margin: 2.2rem 0;
  scroll-margin-top: 4.2rem;
}
section.month h2 {
  font-size: 1.8rem;
  color: var(--ty-red-dark);
  border-bottom: 4px solid var(--sunny-yellow);
  display: inline-block;
  padding-bottom: .15rem;
  margin-bottom: .3rem;
}
section.month .count {
  color: #776a5e;
  font-size: .9rem;
  margin-bottom: .8rem;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: .9rem;
}
.card {
  background: white;
  border: 2px solid #f0e4d3;
  border-radius: 16px;
  padding: .75rem;
  display: flex;
  gap: .7rem;
  align-items: center;
  box-shadow: 0 2px 0 rgba(0,0,0,0.04);
  transition: transform .12s ease, box-shadow .12s ease;
}
.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 14px rgba(0,0,0,0.10);
  border-color: var(--sky-blue);
}
.card img {
  width: 56px;
  height: 56px;
  object-fit: contain;
  border-radius: 10px;
  background: #faf3e8;
  flex-shrink: 0;
}
.card .img-placeholder {
  width: 56px;
  height: 56px;
  border-radius: 10px;
  background: #faf3e8;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
}
.card .info { min-width: 0; flex: 1; }
.card .date {
  font-size: .75rem;
  color: #a1826a;
  font-weight: 700;
  text-transform: uppercase;
}
.card .name {
  font-weight: 700;
  font-size: 1rem;
  color: var(--ink);
  text-decoration: none;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card .name.linked { color: var(--ty-red-dark); }
.card .name.linked:hover { text-decoration: underline; }
.badges { margin-top: .3rem; display: flex; gap: .3rem; flex-wrap: wrap; }
.badge {
  font-size: .68rem;
  font-weight: 800;
  padding: .15rem .5rem;
  border-radius: 999px;
  color: white;
  letter-spacing: .3px;
}
.badge.current { background: var(--grass-green); }
.badge.oos { background: #f0a02c; }
.badge.retired { background: var(--grape-purple); }

.card.is-retired { opacity: .82; }
.card.hidden { display: none; }

footer {
  text-align: center;
  padding: 2rem 1rem;
  color: #a1826a;
  font-size: .85rem;
}
footer a { color: var(--ty-red-dark); }

@media print {
  footer { display: none; }
}
"""

JS = """
function applyFilters() {
  var showCurrent = document.getElementById('f-current').checked;
  var showOos = document.getElementById('f-oos').checked;
  var showRetired = document.getElementById('f-retired').checked;
  document.querySelectorAll('.card').forEach(function(card) {
    var isCurrent = card.dataset.current === '1';
    var isOos = card.dataset.oos === '1';
    var isRetired = card.dataset.retired === '1';
    var visible = (isRetired && showRetired) ||
                  (!isRetired && isOos && showOos) ||
                  (!isRetired && !isOos && isCurrent && showCurrent);
    card.classList.toggle('hidden', !visible);
  });
}
function applySort() {
  var mode = document.querySelector('input[name="sort-mode"]:checked').value;
  document.querySelectorAll('.card-grid').forEach(function (grid) {
    var cards = Array.from(grid.children);
    cards.sort(function (a, b) {
      var ka = mode === 'birthday' ? a.dataset.birthday : a.dataset.day.padStart(2, '0');
      var kb = mode === 'birthday' ? b.dataset.birthday : b.dataset.day.padStart(2, '0');
      if (ka < kb) return -1;
      if (ka > kb) return 1;
      return a.dataset.name.localeCompare(b.dataset.name);
    });
    cards.forEach(function (card) { grid.appendChild(card); });
  });
}
document.addEventListener('DOMContentLoaded', function () {
  ['f-current', 'f-oos', 'f-retired'].forEach(function (id) {
    document.getElementById(id).addEventListener('change', applyFilters);
  });
  document.querySelectorAll('input[name="sort-mode"]').forEach(function (el) {
    el.addEventListener('change', applySort);
  });
  applyFilters();
  applySort();
});
"""


def card_html(item, month_name):
    dt = parse_birth_date(item["birth_date"])
    date_str = fmt_birthday(dt, month_name)
    label = escape(display_label(item))
    is_current_notoos = item["is_current"] and not item["is_out_of_stock"]

    badges = []
    if is_current_notoos:
        badges.append('<span class="badge current">Current</span>')
    if item["is_out_of_stock"]:
        badges.append('<span class="badge oos">Out of Stock</span>')
    if item["is_retired"]:
        badges.append('<span class="badge retired">Retired</span>')

    if item["product_url"]:
        name_html = (
            f'<a class="name linked" href="{escape(item["product_url"])}" '
            f'target="_blank" rel="noopener">{label}</a>'
        )
    else:
        name_html = f'<span class="name">{label}</span>'

    if item["image_file"]:
        img_html = f'<img src="{escape(item["image_file"])}" alt="{label}" loading="lazy" width="56" height="56">'
    else:
        img_html = '<div class="img-placeholder" aria-hidden="true">🧸</div>'

    return f"""<div class="card{' is-retired' if item['is_retired'] else ''}"
     data-current="{1 if is_current_notoos else 0}"
     data-oos="{1 if item['is_out_of_stock'] else 0}"
     data-retired="{1 if item['is_retired'] else 0}"
     data-day="{dt.day}"
     data-birthday="{item['birth_date'][:10]}"
     data-name="{escape(item['display_name'])}">
  {img_html}
  <div class="info">
    <div class="date">{date_str}</div>
    {name_html}
    <div class="badges">{''.join(badges)}</div>
  </div>
</div>"""


def main():
    with gzip.open("calendar_data.json.gz", "rt") as f:
        items = json.load(f)

    by_month = {m: [] for m in range(1, 13)}
    for item in items:
        by_month[item["month"]].append(item)

    total = len(items)
    n_current = sum(1 for i in items if i["is_current"] and not i["is_out_of_stock"])
    n_oos = sum(1 for i in items if i["is_out_of_stock"])
    n_retired = sum(1 for i in items if i["is_retired"])

    nav_links = "\n".join(
        f'<a href="#{m.lower()}">{m}</a>' for m in MONTHS
    )

    month_sections = []
    for month in range(1, 13):
        month_name = MONTHS[month - 1]
        # Default sort: month+day (day-of-month), not full birth_date, so e.g.
        # day 2 sorts before day 10 regardless of birth year.
        month_items = sorted(
            by_month[month],
            key=lambda i: (parse_birth_date(i["birth_date"]).day, i["birth_date"], i["display_name"]),
        )
        cards = "\n".join(card_html(i, month_name) for i in month_items)
        month_sections.append(f"""
<section class="month" id="{month_name.lower()}">
  <h2>{month_name}</h2>
  <div class="count">{len(month_items)} Beanie Babies</div>
  <div class="card-grid">
{cards}
  </div>
</section>""")

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Ty Beanie Baby Birthday Calendar</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700;800&display=swap" rel="stylesheet">
<style>{CSS}</style>
</head>
<body>
<header class="hero">
  <h1>🧸 Ty Beanie Baby Birthday Calendar 🎂</h1>
  <p>Every Beanie Baby's birthday, straight from Ty's own calendar tool.</p>
  <div class="stats">
    <span class="stat-pill">{total} Beanie Babies</span>
    <span class="stat-pill">{n_current} Current</span>
    <span class="stat-pill">{n_oos} Out of Stock</span>
    <span class="stat-pill">{n_retired} Retired</span>
  </div>
</header>

<nav class="month-nav">
{nav_links}
</nav>

<div class="filters">
  <label><input type="checkbox" id="f-current" checked> ✅ Show Current</label>
  <label><input type="checkbox" id="f-oos" checked> 📦 Show Out of Stock</label>
  <label><input type="checkbox" id="f-retired" checked> 🏛️ Show Retired</label>
  <span class="sep"></span>
  <label><input type="radio" name="sort-mode" value="monthday" checked> 🔁 Sort by Month + Day</label>
  <label><input type="radio" name="sort-mode" value="birthday"> 📅 Sort by Birthday (Year)</label>
</div>

<main>
{''.join(month_sections)}
</main>

<footer>
  Data parsed from <a href="https://www.ty.com/birthdaycalendar.html?lang=en" target="_blank" rel="noopener">ty.com's birthday calendar</a>.
  Also available as <a href="calendar.md">plain markdown</a>.
</footer>

<script>{JS}</script>
</body>
</html>
"""

    with open("calendar.html", "w") as f:
        f.write(html)

    print(f"Wrote calendar.html with {total} cards across 12 months.")


if __name__ == "__main__":
    main()
