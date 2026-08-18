#!/usr/bin/env bash
# Pull upload date, id, duration, title and description for every video on the
# bearbait channel. Title/description use yt-dlp's %(...)j conversion so that
# embedded newlines stay inside one TSV record.
set -uo pipefail
cd "$(dirname "$0")"

yt-dlp --skip-download --ignore-errors \
  --print "%(upload_date)s\t%(id)s\t%(duration)s\t%(title)j\t%(description)j" \
  "https://www.youtube.com/@bearbaitofficial/videos" \
  > meta.tsv 2> meta.log

echo "META DONE: $(wc -l < meta.tsv) records"
