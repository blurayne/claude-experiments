#!/usr/bin/env python3
"""Turn YouTube auto-caption VTT files into readable, timestamped transcripts.

Auto-captions repeat every line two or three times as the rolling caption
window advances, and carry inline word timing tags. Both have to go, or the
transcript is three times its real length and unreadable. Output keeps one
[mm:ss] marker per line so claims stay citable to a point in the video.
"""
import json
import pathlib
import re
import sys

HERE = pathlib.Path(__file__).parent
CORE = HERE / "core"
OUT = HERE / "transcripts"

# crawl.sh writes yt-dlp's full info JSON per video, which is mostly format
# listings and runs to tens of megabytes. Those are distilled into one
# metadata.jsonl and the originals dropped, so headers come from there.
META = {}
_meta_file = HERE / "metadata.jsonl"
if _meta_file.exists():
    for _line in _meta_file.read_text(encoding="utf-8").splitlines():
        if _line.strip():
            _rec = json.loads(_line)
            META[_rec["id"]] = _rec

TAG = re.compile(r"<[^>]+>")
CUE = re.compile(r"^(\d{2}:\d{2}:\d{2})\.\d{3} --> ")


def stamp(hms: str) -> str:
    h, m, s = hms.split(":")
    total = int(h) * 60 + int(m)
    return f"[{total:02d}:{s}]"


def parse(path: pathlib.Path) -> str:
    lines, current = [], None
    for raw in path.read_text(encoding="utf-8", errors="replace").splitlines():
        cue = CUE.match(raw)
        if cue:
            current = stamp(cue.group(1))
            continue
        text = TAG.sub("", raw).strip()
        if not text or text.startswith(("WEBVTT", "Kind:", "Language:")):
            continue
        if lines and lines[-1][1] == text:
            continue
        lines.append((current, text))

    # The rolling window means a line often reappears a few cues later as the
    # tail of a longer block. Drop any line already emitted in the last 4.
    out, recent = [], []
    for ts, text in lines:
        if text in recent:
            continue
        recent = (recent + [text])[-4:]
        out.append((ts, text))

    return "\n".join(f"{ts} {t}" if ts else t for ts, t in out)


def main() -> None:
    OUT.mkdir(exist_ok=True)
    written = 0
    for vtt in sorted(CORE.glob("*.vtt")):
        vid = vtt.name.split(".")[0]
        # Prefer the manually-uploaded track when both exist.
        if ".en-orig." in vtt.name and (CORE / f"{vid}.en.vtt").exists():
            continue
        meta = META.get(vid)
        header = f"# {vid}\n"
        if meta:
            header = (
                f"# {meta.get('title', vid)}\n"
                f"id: {vid}\n"
                f"date: {meta.get('upload_date', 'NA')}\n"
                f"duration_s: {meta.get('duration', 'NA')}\n"
                f"url: https://www.youtube.com/watch?v={vid}\n\n"
                f"## description\n{(meta.get('description') or '').strip()}\n\n"
                f"## transcript\n"
            )
        (OUT / f"{vid}.md").write_text(header + parse(vtt) + "\n")
        written += 1
    print(f"transcripts written: {written}", file=sys.stderr)


if __name__ == "__main__":
    main()
