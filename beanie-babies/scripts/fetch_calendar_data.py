#!/usr/bin/env python3
"""Fetch and classify all TY Beanie Baby birthday calendar entries for the year.

Data source: https://tools.ty.com/api/birthday-calendar/month/{1-12}
  - no params            -> current items that are in stock
  - ?oos=true             -> current items (in stock + out of stock)
  - ?oos=true&retired=true -> everything (current + retired)

Writes calendar_data.json: a flat list of items with classification flags.
"""
import gzip
import json
import re
import time
import urllib.error
import urllib.request

MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
]

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    ),
    "Referer": "https://www.ty.com/",
}


def fetch(url, retries=5, delay=2):
    req = urllib.request.Request(url, headers=HEADERS)
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=20) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except (urllib.error.URLError, TimeoutError, ConnectionError) as e:
            if attempt == retries - 1:
                raise
            time.sleep(delay)


def slugify(name):
    s = name.lower().strip()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")


def main():
    all_items = {}  # item_no -> record

    for month in range(1, 13):
        base_url = f"https://tools.ty.com/api/birthday-calendar/month/{month}"
        in_stock = fetch(base_url)
        current_all = fetch(f"{base_url}?oos=true")
        everything = fetch(f"{base_url}?oos=true&retired=true")

        in_stock_ids = {i["item_no"] for i in in_stock}
        current_ids = {i["item_no"] for i in current_all}

        for item in everything:
            item_no = item["item_no"]
            is_current = item_no in current_ids
            is_retired = not is_current
            is_out_of_stock = is_current and item_no not in in_stock_ids

            record = dict(item)
            record["month"] = month
            record["month_name"] = MONTHS[month - 1]
            record["is_current"] = is_current
            record["is_out_of_stock"] = is_out_of_stock
            record["is_retired"] = is_retired
            record["slug"] = slugify(item["display_name"])
            record["image_url_lg"] = re.sub(r"_thmb\.", "_lg.", item["image_thmb"])
            record["product_url"] = (
                f"https://www.ty.com/product/{record['slug']}/{item_no}.html?lang=en"
                if is_current
                else None
            )
            all_items[item_no] = record

        print(
            f"{MONTHS[month - 1]}: {len(everything)} total "
            f"({len(in_stock_ids)} in-stock, {len(current_ids) - len(in_stock_ids)} oos-current, "
            f"{len(everything) - len(current_ids)} retired)"
        )
        time.sleep(0.2)

    items = list(all_items.values())
    items.sort(key=lambda i: (i["month"], i["birth_date"], i["display_name"]))

    with gzip.open("calendar_data.json.gz", "wt") as f:
        json.dump(items, f, indent=2)

    print(f"\nTotal unique items: {len(items)}")
    print(f"Current (in-stock): {sum(1 for i in items if i['is_current'] and not i['is_out_of_stock'])}")
    print(f"Current (out-of-stock): {sum(1 for i in items if i['is_current'] and i['is_out_of_stock'])}")
    print(f"Retired: {sum(1 for i in items if i['is_retired'])}")


if __name__ == "__main__":
    main()
