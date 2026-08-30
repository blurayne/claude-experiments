#!/usr/bin/env python3
"""Rebuild astro-visuals/CHANGELOG.md from the git history.

Each commit is filed under the version the page carried once that commit landed, read
straight out of the file at that revision, so the log cannot drift from what shipped.
Commits are split by which viewer they touched; one touching both appears under both.
"""

from __future__ import annotations

import re
import subprocess
from collections import OrderedDict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SUB = "astro-visuals"
SECTIONS = [
    ("Galactic Transit", f"{SUB}/galactic-transit.html"),
    ("Solar System 3D", f"{SUB}/solar-system.html"),
]
UNIT = "\x1f"


def git(*args: str) -> str:
    return subprocess.run(["git", *args], cwd=ROOT, capture_output=True,
                          text=True, check=True).stdout


def version_at(commit: str) -> str | None:
    """The semantic version the page carried at this revision, if it had one yet."""
    try:
        blob = git("show", f"{commit}:{SUB}/galactic-transit.html")
    except subprocess.CalledProcessError:
        return None
    m = re.search(r"version: '(\d+\.\d+\.\d+)'", blob)
    return m.group(1) if m else None


def tidy(subject: str) -> str:
    """Drop the path prefix the commit subject already carries from its section."""
    s = re.sub(r"^(astro-visuals|galactic-transit|solar-system)\s*:\s*", "", subject)
    return s[0].upper() + s[1:] if s else s


def main() -> None:
    raw = git("log", "--format=%H" + UNIT + "%ad" + UNIT + "%s", "--date=short",
              "--", SUB).strip()
    commits = []
    for line in raw.split("\n"):
        sha, date, subject = line.split(UNIT, 2)
        files = git("show", "--name-only", "--format=", sha).split()
        commits.append((sha, date, subject, files))

    out = ["# Changelog", "",
           "Generated from the git history by `.github/scripts/build_changelog.py`;",
           "each entry is filed under the version the page carried once it landed.", ""]

    for title, path in SECTIONS:
        mine = [c for c in commits if path in c[3]]
        if not mine:
            continue
        out += [f"## {title}", ""]
        groups: OrderedDict[str, list] = OrderedDict()
        for sha, date, subject, _ in mine:
            ver = version_at(sha) or "unversioned"
            groups.setdefault(ver, []).append((sha, date, subject))
        for ver, items in groups.items():
            head = f"### {ver}" if ver != "unversioned" else "### Before versioning"
            out.append(f"{head} — {items[0][1]}")
            out.append("")
            for sha, _, subject in items:
                out.append(f"- {tidy(subject)} (`{sha[:7]}`)")
            out.append("")

    dst = ROOT / SUB / "CHANGELOG.md"
    dst.write_text("\n".join(out).rstrip() + "\n", encoding="utf-8")
    versions = sum(1 for t, p in SECTIONS for _ in [0])
    print(f"wrote {dst.relative_to(ROOT)}: {len(commits)} commits")


if __name__ == "__main__":
    main()
