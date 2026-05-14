#!/usr/bin/env python3
"""Render every `index.md` (and the top-level `README.md`) to HTML under `_site/`.

Each subfolder is copied verbatim so static assets ride along; only `index.md`
is replaced with a rendered `index.html`. The top-level `README.md` becomes the
site root `index.html`.
"""

from __future__ import annotations

import shutil
from pathlib import Path

import markdown

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "_site"
SKIP_DIRS = {".git", ".github", "_site", "node_modules"}

PAGE_TEMPLATE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
<style>
  body {{ font-family: system-ui, sans-serif; max-width: 48rem; margin: 2rem auto; padding: 0 1rem; line-height: 1.6; color: #222; }}
  a {{ color: #0366d6; }}
  code {{ background: #f4f4f4; padding: .1em .3em; border-radius: 3px; }}
  pre code {{ display: block; padding: .8em; overflow-x: auto; }}
  h1, h2, h3 {{ line-height: 1.25; }}
  hr {{ border: none; border-top: 1px solid #eee; margin: 2rem 0; }}
</style>
</head>
<body>
{body}
</body>
</html>
"""


def render(md_text: str, title: str) -> str:
    body = markdown.markdown(
        md_text,
        extensions=["fenced_code", "tables", "toc", "sane_lists"],
    )
    return PAGE_TEMPLATE.format(title=title, body=body)


def build() -> None:
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir()

    readme = ROOT / "README.md"
    if readme.exists():
        (OUT / "index.html").write_text(render(readme.read_text(), "Claude Experiments"))

    for sub in sorted(ROOT.iterdir()):
        if not sub.is_dir() or sub.name.startswith(".") or sub.name in SKIP_DIRS:
            continue
        idx_md = sub / "index.md"
        if not idx_md.exists():
            continue

        dest = OUT / sub.name
        shutil.copytree(sub, dest)
        (dest / "index.md").unlink(missing_ok=True)
        (dest / "index.html").write_text(render(idx_md.read_text(), sub.name))


if __name__ == "__main__":
    build()
