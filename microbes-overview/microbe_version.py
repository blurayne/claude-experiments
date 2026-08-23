"""Version, build stamp and commit sha for the atlas — derived from git, not stored.

There is deliberately no VERSION file to forget to bump. The number is computed
from the repository itself, so it cannot drift from what was actually shipped:

    MAJOR.MINOR  come from the newest `microbes-overview/vX.Y.Z` tag reachable
                 from HEAD.
    PATCH        is the number of commits touching `microbes-overview/` since
                 that tag — so every commit moves the version, with no bookkeeping.

Which means:

  * **Fixes** (anything that does not add a subject) just advance the PATCH,
    automatically, one per commit.
  * **New microbes** get a new `microbes-overview/vX.(Y+1).0` tag, which resets
    PATCH to 0 and is the only manual step. `git tag -a microbes-overview/v1.2.0`.
  * **MAJOR** is a deliberate statement about the atlas as a whole. 1.0.0 is the
    commit where every catalogued subject was finally live ("Chlamydia felis
    completes the set — 112 of 112, 18 sets").

`git describe` does the reachability work, so a tag on a commit that is not an
ancestor of HEAD is correctly ignored.

Fallbacks matter here: this runs in CI and from a tarball. Anything unavailable
degrades to a truthful placeholder rather than a wrong number — a version string
of "0.0.0+unknown" is honest; a stale hardcoded one is not.
"""
from __future__ import annotations

import subprocess
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
TAG_GLOB = "microbes-overview/v*"


def _git(*args: str) -> str | None:
    """Run git in this folder; None if git is missing, fails, or we're not in a repo."""
    try:
        p = subprocess.run(
            ["git", "-C", str(HERE), *args],
            capture_output=True, text=True, timeout=15,
        )
    except (OSError, subprocess.SubprocessError):
        return None
    out = p.stdout.strip()
    return out if p.returncode == 0 and out else None


def describe() -> dict:
    """Return {version, sha, sha_short, built, tag, dirty} for the current tree."""
    sha = _git("rev-parse", "HEAD")
    tag = _git("describe", "--tags", "--abbrev=0", "--match", TAG_GLOB)

    if tag:
        base = tag.rsplit("/v", 1)[-1]
        parts = (base.split(".") + ["0", "0", "0"])[:3]
        try:
            major, minor = int(parts[0]), int(parts[1])
        except ValueError:
            major, minor = 0, 0
        # PATCH = commits since the tag that actually touched this folder. A
        # commit elsewhere in the monorepo must not bump the atlas's version.
        n = _git("rev-list", "--count", f"{tag}..HEAD", "--", ".")
        patch = int(n) if n and n.isdigit() else 0
        version = f"{major}.{minor}.{patch}"
    else:
        version = "0.0.0+unknown"

    # Dirty tree => the build does not correspond to any commit. Say so rather
    # than letting a local edit masquerade as the tagged release.
    dirty = bool(_git("status", "--porcelain", "--", "."))

    return {
        "version": version,
        "sha": sha or "",
        "sha_short": (sha or "")[:8],
        # Build time, not commit time: this is when the artifact was produced.
        "built": datetime.now(timezone.utc).astimezone().strftime("%Y-%m-%d %H:%M:%S"),
        "tag": tag or "",
        "dirty": dirty,
    }


if __name__ == "__main__":
    import json
    print(json.dumps(describe(), indent=1))
