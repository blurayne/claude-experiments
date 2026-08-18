#!/usr/bin/env bash
# Parallel crawl of the selected videos.
#   core -> info JSON + English auto-subtitles (full transcript)
#   wide -> info JSON only (date, description, duration)
# yt-dlp handles one video at a time, so the speedup comes from running
# several processes over disjoint slices of the URL list.
set -uo pipefail
cd "$(dirname "$0")"

JOBS=8
mkdir -p core wide

split -n "l/$JOBS" -d core_ids.txt core/batch_
split -n "l/$JOBS" -d wide_ids.txt wide/batch_

for f in core/batch_*; do
  yt-dlp --skip-download --ignore-errors --no-warnings \
    --write-info-json --write-auto-subs --write-subs \
    --sub-langs "en.*" --sub-format vtt \
    -o "core/%(id)s" -a "$f" >> core/crawl.log 2>&1 &
done

for f in wide/batch_*; do
  yt-dlp --skip-download --ignore-errors --no-warnings \
    --write-info-json \
    -o "wide/%(id)s" -a "$f" >> wide/crawl.log 2>&1 &
done

wait

echo "CRAWL DONE"
echo "core info:  $(ls core/*.info.json 2>/dev/null | wc -l)"
echo "core subs:  $(ls core/*.vtt 2>/dev/null | wc -l)"
echo "wide info:  $(ls wide/*.info.json 2>/dev/null | wc -l)"
