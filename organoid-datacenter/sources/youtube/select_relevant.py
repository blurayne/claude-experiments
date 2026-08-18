#!/usr/bin/env python3
"""Pick the videos worth crawling from the flat channel listing.

Two tiers:
  core  - organoid / biocomputing / disembodied-brain material, gets a full transcript
  wide  - broader neuro, consciousness and AI-comparison material, metadata only

Everything else on the channel (bears, prions, cryptids) stays out.
"""
import re
import pathlib

HERE = pathlib.Path(__file__).parent

CORE = re.compile(
    r"organoid|mini.?brain|minibrain|lab.?grown brain|lab.?grown.*brain|brain in a (vat|jar)"
    r"|disembod|biocomput|bio.?hybrid|wetware|wetwear|brain tissue|dish.?brain"
    r"|neurons? (with|combin|control|play)|synthetic neuron|artificial neuron"
    r"|data ?cent(er|re)s? powered|human brain.*(comput|robot|data)"
    r"|brain.*grafted|grafting lab|chimer|reanimat|revived.*brain|brain.*revived",
    re.I,
)

WIDE = re.compile(
    r"conscious|sentien|sapien|neuro|brain|cognit|intellig|cyborg|brain.?computer"
    r"|personhood|ai rights|mortal computation|fungal|plants? (are|intelligen)"
    r"|pain|suffer|qualia",
    re.I,
)

rows = []
for line in (HERE / "channel_videos.txt").read_text().splitlines():
    if "|" not in line:
        continue
    vid, title = line.split("|", 1)
    if CORE.search(title):
        rows.append(("core", vid, title))
    elif WIDE.search(title):
        rows.append(("wide", vid, title))

core = [r for r in rows if r[0] == "core"]
wide = [r for r in rows if r[0] == "wide"]

(HERE / "core_ids.txt").write_text(
    "".join(f"https://www.youtube.com/watch?v={v}\n" for _, v, _ in core)
)
(HERE / "wide_ids.txt").write_text(
    "".join(f"https://www.youtube.com/watch?v={v}\n" for _, v, _ in wide)
)
(HERE / "selection.tsv").write_text(
    "".join(f"{tier}\t{v}\t{t}\n" for tier, v, t in rows)
)

print(f"core: {len(core)}  wide: {len(wide)}  total: {len(rows)}")
