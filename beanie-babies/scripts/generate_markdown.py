#!/usr/bin/env python3
"""Render calendar_data.json into calendar.md, a month-by-month markdown calendar."""
import gzip
import json
from datetime import datetime

MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
]


def fmt_date(birth_date, month_name):
    dt = datetime.strptime(birth_date, "%Y-%m-%d %H:%M:%S")
    return f"{month_name} {dt.day}, {dt.year}"


def display_label(item):
    name = item["web_display_name"]
    if " - " in name:
        n, desc = name.split(" - ", 1)
        return f"{n.title()} — {desc}"
    return name.title()


def check(flag):
    return "✅" if flag else ""


def main():
    with gzip.open("calendar_data.json.gz", "rt") as f:
        items = json.load(f)

    by_month = {m: [] for m in range(1, 13)}
    for item in items:
        by_month[item["month"]].append(item)

    lines = []
    lines.append("# Ty Beanie Baby Birthday Calendar")
    lines.append("")
    lines.append(
        "Every Ty Beanie Baby's birthday, parsed straight from Ty's own "
        "[birthday calendar tool](https://www.ty.com/birthdaycalendar.html?lang=en), "
        "with downloaded photos and current/out-of-stock/retired status for each one. "
        "See [calendar.html](calendar.html) for the styled, browsable version."
    )
    lines.append("")

    total = len(items)
    n_current = sum(1 for i in items if i["is_current"] and not i["is_out_of_stock"])
    n_oos = sum(1 for i in items if i["is_out_of_stock"])
    n_retired = sum(1 for i in items if i["is_retired"])
    lines.append(
        f"**{total} Beanie Babies** across the year — "
        f"{n_current} current, {n_oos} current but out of stock, {n_retired} retired."
    )
    lines.append("")

    lines.append("## Jump to a month")
    lines.append("")
    lines.append(
        " · ".join(f"[{m}](#{m.lower()})" for m in MONTHS)
    )
    lines.append("")

    for month in range(1, 13):
        month_name = MONTHS[month - 1]
        month_items = sorted(
            by_month[month], key=lambda i: (i["birth_date"], i["display_name"])
        )
        lines.append(f"## {month_name}")
        lines.append("")
        lines.append(f"{len(month_items)} Beanie Babies born in {month_name}.")
        lines.append("")
        lines.append("| Date | Image | Name | Current | Out of Stock | Retired |")
        lines.append("|---|---|---|:---:|:---:|:---:|")
        for item in month_items:
            date_str = fmt_date(item["birth_date"], month_name)
            if item["image_file"]:
                img = f'<img src="{item["image_file"]}" width="56" alt="{item["display_name"]}">'
            else:
                img = "🧸"
            label = display_label(item)
            name_cell = f"[{label}]({item['product_url']})" if item["product_url"] else label
            is_current_notoos = item["is_current"] and not item["is_out_of_stock"]
            lines.append(
                f"| {date_str} | {img} | {name_cell} | {check(is_current_notoos)} "
                f"| {check(item['is_out_of_stock'])} | {check(item['is_retired'])} |"
            )
        lines.append("")

    with open("calendar.md", "w") as f:
        f.write("\n".join(lines))

    print(f"Wrote calendar.md with {total} rows across 12 months.")


if __name__ == "__main__":
    main()
