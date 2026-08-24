#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///
"""Text-to-speech: render every microbe's kids description to MP3 (EN + DE),
WITH word-level timestamps for karaoke-style highlighting during playback.

Same API shape as /home/markusg/Projects/audiobook/scripts/el.py (ElevenLabs),
stdlib-only (urllib). Uses the `/with-timestamps` endpoint — one API call
returns BOTH the audio and character-level alignment in a single response (so
getting timestamps costs no extra characters versus plain audio-only tts).
Character timings are collapsed into WORD spans client-side, since that's what
the viewer highlights.

Auth: $ELEVENLABS_API_KEY, else the audiobook project's .env
(/home/markusg/Projects/audiobook/.env), else a .env walking up from cwd.

Output:
  renders/set/<set>/audio/<key>.kids-<lang>.mp3    the voice clip (committed)
  renders/set/<set>/audio/<key>.kids-<lang>.json    [{"w":word,"s":start_s,"e":end_s}, ...]

Usage:
  tts.py                          # all microbes, both languages, skip existing
  tts.py --microbe erythrocyte    # just one
  tts.py --lang en                # just one language
  tts.py --force                  # re-render even if the file exists
  tts.py --balance                # print remaining ElevenLabs credits and exit
  tts.py --dry-run                # print planned chars, don't call the API
"""
from __future__ import annotations
import argparse, base64, json, os, re, sys, time, urllib.request, urllib.error
from pathlib import Path

API = "https://api.elevenlabs.io/v1"
VOICE_ID = "RILOU7YmBhvwJGDGjNmP"   # "Jane - Professional Audiobook Reader", reads EN + DE
MODEL = "eleven_v3"                 # v3: same price per character as multilingual_v2
                                    # (cost multiplier 1.0, checked against /v1/models)
                                    # and it still returns word-level timestamps at every
                                    # bitrate, which the viewer's karaoke highlighting
                                    # depends on — that was the thing worth checking
                                    # before switching, not the audio.
OUTPUT_FORMAT = "mp3_44100_128"     # 128 kbps, not 192: bitrate costs no credits (billing
                                    # is per character) but these files are committed, and
                                    # measured on a real German clip 128 gives ~1.0 MiB per
                                    # clip against 1.4 MiB at 192 — for speech 128 is
                                    # already transparent, so 192 would add ~65 MB across
                                    # the atlas for no audible gain. Raise it here if a
                                    # future voice needs it.
MIN_BYTES = 2000                    # smaller than this == not a real render

HERE = Path(__file__).resolve().parents[4]   # scripts/microbe-render/skills/.claude -> microbes-overview
DATA_PATH = HERE / "viewer-data.json"
AUDIOBOOK_ENV = Path("/home/markusg/Projects/audiobook/.env")


def load_key() -> str:
    k = os.environ.get("ELEVENLABS_API_KEY")
    if k:
        return k.strip()
    for env in [AUDIOBOOK_ENV, *[(d / ".env") for d in [Path.cwd(), *Path.cwd().parents]]]:
        if env.is_file():
            for line in env.read_text().splitlines():
                if line.strip().startswith("ELEVENLABS_API_KEY="):
                    return line.split("=", 1)[1].strip().strip('"').strip("'")
    sys.exit("ERROR: ELEVENLABS_API_KEY not found (env, or audiobook/.env, or a local .env).")


def _req(method, path, *, json_body=None, timeout=180, key=None) -> dict:
    data = json.dumps(json_body).encode() if json_body is not None else None
    headers = {"xi-api-key": key or load_key(), "Accept": "application/json"}
    if data is not None:
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(API + path, data=data, method=method, headers=headers)
    last = ""
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return json.loads(r.read().decode())
        except urllib.error.HTTPError as e:
            msg = e.read().decode(errors="replace")
            last = f"HTTP {e.code}: {msg[:300]}"
            if e.code in (429, 500, 502, 503) and attempt < 3:
                time.sleep(3 * (attempt + 1)); continue
            raise RuntimeError(last)
        except urllib.error.URLError as e:
            last = str(e)
            if attempt < 3:
                time.sleep(3 * (attempt + 1)); continue
            raise RuntimeError(last)
    raise RuntimeError(last)


def balance(key=None) -> dict:
    s = _req("GET", "/user/subscription", key=key)
    return {"used": s["character_count"], "limit": s["character_limit"],
            "remaining": s["character_limit"] - s["character_count"]}


def performance_text(base: Path, plain: str) -> tuple[str, bool]:
    """Prefer a hand-written `<base>.tagged.txt` over the catalogue prose.

    v3 responds to inline performance directions ([excited], [whispers], [sighs],
    [curious]). Those belong to the *narration*, not to the catalogue: the same
    description is read on screen by people who never press play, and by the other
    language and the other two audience registers. Keeping them in a sidecar next
    to the mp3 means the page text stays clean, the tags are diffable on their own,
    and re-running without the sidecar reverts to plain narration. The tags are
    stripped back out of the word timings by chars_to_words().
    """
    f = base.parent / (base.name + ".tagged.txt")
    if f.is_file():
        s = f.read_text(encoding="utf-8").strip()
        if s:
            return s, True
    return plain, False


def chars_to_words(text: str, chars: list[str], starts: list[float], ends: list[float]) -> list[dict]:
    """Collapse ElevenLabs' per-CHARACTER alignment into per-WORD spans. A word
    is a maximal run of non-whitespace characters; its start/end is the
    start of its first char / end of its last char.

    v3 audio tags -- [excited], [whispers], [sighs] -- are performance directions,
    not speech, but they ARE part of the text we send, so the alignment contains
    them like any other characters. They must not survive into the word list: the
    viewer builds the *displayed* prose from these words whenever narration exists
    (see proseHTML in viewer.template.html), so a leaked tag is not a silent
    cosmetic issue, it prints "[excited]" in the middle of the paragraph. Bracketed
    spans are therefore skipped here, which also keeps the surrounding words'
    timings honest -- the tag's own duration simply belongs to no word.
    """
    words = []
    cur_chars, cur_start = [], None
    in_tag = False
    for ch, s, e in zip(chars, starts, ends):
        if ch == "[":
            in_tag = True
        if in_tag:
            if ch == "]":
                in_tag = False
                if cur_chars:   # flush anything pending before the tag
                    words.append({"w": "".join(cur_chars), "s": round(cur_start, 3), "e": round(prev_end, 3)})
                    cur_chars, cur_start = [], None
            continue
        if ch.strip() == "":
            if cur_chars:
                words.append({"w": "".join(cur_chars), "s": round(cur_start, 3), "e": round(prev_end, 3)})
                cur_chars, cur_start = [], None
            continue
        if cur_start is None:
            cur_start = s
        cur_chars.append(ch)
        prev_end = e
    if cur_chars:
        words.append({"w": "".join(cur_chars), "s": round(cur_start, 3), "e": round(prev_end, 3)})
    return words


def tts_with_timestamps(text: str, mp3_out: Path, json_out: Path, *, key=None,
                        skip_existing=True) -> bool:
    """Returns True if generated, False if skipped."""
    if skip_existing and mp3_out.exists() and mp3_out.stat().st_size > MIN_BYTES and json_out.exists():
        return False
    body = {"text": text, "model_id": MODEL,
            "voice_settings": {"stability": 0.45, "similarity_boost": 0.75,
                               "use_speaker_boost": True}}
    resp = _req("POST", f"/text-to-speech/{VOICE_ID}/with-timestamps?output_format={OUTPUT_FORMAT}",
               json_body=body, key=key)
    audio = base64.b64decode(resp["audio_base64"])
    align = resp["alignment"]
    words = chars_to_words(text, align["characters"],
                           align["character_start_times_seconds"],
                           align["character_end_times_seconds"])
    mp3_out.parent.mkdir(parents=True, exist_ok=True)
    mp3_out.write_bytes(audio)
    json_out.write_text(json.dumps(words, separators=(",", ":"), ensure_ascii=False))
    return True


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--microbe", help="only this microbe key")
    ap.add_argument("--set", dest="set_", help="only this set id")
    ap.add_argument("--lang", choices=["en", "de"], help="only this language")
    ap.add_argument("--force", action="store_true", help="re-render even if file exists")
    ap.add_argument("--balance", action="store_true", help="print remaining credits and exit")
    ap.add_argument("--dry-run", action="store_true", help="print planned chars, don't call the API")
    a = ap.parse_args()

    key = load_key()
    if a.balance:
        print(json.dumps(balance(key=key), indent=2)); return

    data = json.loads(DATA_PATH.read_text())
    langs = [a.lang] if a.lang else ["en", "de"]

    jobs = []  # (set_id, key, lang, text, mp3_path, json_path)
    for s in data["sets"]:
        if a.set_ and s["id"] != a.set_:
            continue
        # NOTE: the audio folder lives at renders/set/<FOLDER>/audio — folder is
        # usually == id, EXCEPT page "pathogens" -> folder "pathogens-generic"
        # (same PAGE_TO_FOLDER remap as build_viewer.py). Using s["id"] here
        # silently wrote a whole set's audio into a folder build_viewer.py never
        # reads from — always use s["folder"].
        folder = s["folder"]
        # the set's own intro paragraph (--microbe doesn't apply to this job —
        # it's not a microbe). Leading underscore avoids ever colliding with a
        # real microbe key.
        if not a.microbe:
            for lang in langs:
                text = (s.get("desc", {}).get("kids", {}) or {}).get(lang, "")
                if not text.strip():
                    continue
                base = HERE / "renders" / "set" / folder / "audio" / f"_set-intro.kids-{lang}"
                mp3_path = base.parent / (base.name + ".mp3")
                json_path = base.parent / (base.name + ".json")
                text, tagged = performance_text(base, text)
                jobs.append((s["id"], "_set-intro", lang, text, mp3_path, json_path))
        for m in s["microbes"]:
            if a.microbe and m["key"] != a.microbe:
                continue
            for lang in langs:
                text = (m.get("desc", {}).get("kids", {}) or {}).get(lang, "")
                if not text.strip():
                    continue
                base = HERE / "renders" / "set" / folder / "audio" / f"{m['key']}.kids-{lang}"
                # NOTE: Path.with_suffix() would treat ".kids-en" as the suffix to
                # replace (it's text after the last dot) and silently drop it —
                # append the extension via string concat instead.
                mp3_path = base.parent / (base.name + ".mp3")
                json_path = base.parent / (base.name + ".json")
                text, tagged = performance_text(base, text)
                jobs.append((s["id"], m["key"], lang, text, mp3_path, json_path))

    total_chars = sum(len(j[3]) for j in jobs)
    to_generate = [j for j in jobs if a.force or not
                   (j[4].exists() and j[4].stat().st_size > MIN_BYTES and j[5].exists())]
    gen_chars = sum(len(j[3]) for j in to_generate)
    print(f"{len(jobs)} clips total, {len(to_generate)} to generate, "
          f"{total_chars} chars total / {gen_chars} chars to spend")

    if a.dry_run:
        return

    if to_generate:
        bal = balance(key=key)
        print(f"ElevenLabs balance: {bal['remaining']} chars remaining")
        if gen_chars > bal["remaining"]:
            sys.exit(f"ERROR: need {gen_chars} chars but only {bal['remaining']} remain — aborting "
                     f"before spending partial budget. Re-run with --lang/--microbe/--set to narrow scope.")

    done = 0
    for set_id, key_, lang, text, mp3_out, json_out in to_generate:
        try:
            generated = tts_with_timestamps(text, mp3_out, json_out, key=key, skip_existing=not a.force)
            done += 1
            print(f"[{done}/{len(to_generate)}] {'wrote' if generated else 'skip'} {mp3_out.relative_to(HERE)} "
                 f"({len(text)} chars, {mp3_out.stat().st_size} bytes)")
        except Exception as e:
            print(f"[{done+1}/{len(to_generate)}] FAILED {set_id}/{key_}.{lang}: {e}", file=sys.stderr)

    print(f"done: {done}/{len(to_generate)} generated")


if __name__ == "__main__":
    main()
