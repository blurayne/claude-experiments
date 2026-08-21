#!/usr/bin/env python3
"""Render `index.md` files (and the top-level `README.md`) to HTML under `_site/`.

Each subfolder is copied verbatim so static assets ride along. If a subfolder
already ships its own `index.html`, that file is preserved untouched. Otherwise,
`index.md` is rendered into `index.html`. Subfolders with neither file are
skipped. The top-level `README.md` becomes the site root `index.html`.

A subfolder that ships icon/manifest files (`favicon-32x32.png`, `icon-180.png`,
`manifest.json`, ...) gets the matching `<link>` tags injected into the rendered
page's head, so its `index.html` carries the same favicon and install metadata as
whatever app the folder contains.
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
{head_extra}<style>
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


# (file in the subfolder, link tag to emit). Only present files are linked.
ICON_LINKS = [
    ("favicon.ico", '<link rel="icon" href="favicon.ico" sizes="any">'),
    ("favicon-32x32.png", '<link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png">'),
    ("favicon-16x16.png", '<link rel="icon" type="image/png" sizes="16x16" href="favicon-16x16.png">'),
    ("icon.svg", '<link rel="icon" type="image/svg+xml" href="icon.svg">'),
    ("icon-180.png", '<link rel="apple-touch-icon" href="icon-180.png">'),
    ("manifest.json", '<link rel="manifest" href="manifest.json">'),
]


def head_extra_for(sub: Path) -> str:
    tags = [tag for name, tag in ICON_LINKS if (sub / name).exists()]
    return "".join(tag + "\n" for tag in tags)


def render(md_text: str, title: str, head_extra: str = "") -> str:
    body = markdown.markdown(
        md_text,
        extensions=["fenced_code", "tables", "toc", "sane_lists"],
    )
    return PAGE_TEMPLATE.format(title=title, body=body, head_extra=head_extra)


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
        idx_html = sub / "index.html"
        if not idx_md.exists() and not idx_html.exists():
            continue

        dest = OUT / sub.name
        shutil.copytree(sub, dest)
        (dest / "index.md").unlink(missing_ok=True)

        # Only render index.md when the subfolder doesn't ship its own index.html.
        if idx_md.exists() and not idx_html.exists():
            (dest / "index.html").write_text(
                render(idx_md.read_text(), sub.name, head_extra_for(sub))
            )


if __name__ == "__main__":
    build()
