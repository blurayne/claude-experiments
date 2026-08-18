#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = ["requests>=2.31", "pillow>=10.3", "pillow-heif>=0.16", "pillow-avif-plugin>=1.4"]
# ///
"""Download a REAL microscopy reference image (freely-licensed) and normalise it
like a render: 1080x1080, PNG master + AVIF (+ HEIC), with a sidecar recording
source page, license and attribution.

A Claude subagent finds the URL/license; this script only fetches + records. The
downloaded image still needs AI visual verification (a verify-subagent confirms
it actually shows the microbe).

Usage:
  fetch_reference.py --microbe rod-bacterium --theme sem \
    --url https://upload.wikimedia.org/.../Ecoli.jpg \
    --source-page https://commons.wikimedia.org/wiki/File:Ecoli.jpg \
    --license "CC BY-SA 4.0" --attribution "Author, Wikimedia Commons" \
    --modality SEM
Set is always 'reference-microscopy'.
"""
from __future__ import annotations
import argparse, io, json, time
from pathlib import Path
import requests
from PIL import Image
GET_TIMEOUT_S = 120  # base timeout for downloading a licensed reference image
MAX_ATTEMPTS = 3
RETRY_BACKOFF_BASE_S = 3


def get_with_retry(url: str, headers: dict) -> requests.Response:
    """Same escalating-timeout retry pattern as render.py/edit_image.py:
    100%/200%/300% of GET_TIMEOUT_S, short sleep before each retry, retries
    only on timeout/connection errors/5xx/429."""
    last_err = None
    for attempt in range(1, MAX_ATTEMPTS + 1):
        timeout = GET_TIMEOUT_S * attempt
        if attempt > 1:
            time.sleep(RETRY_BACKOFF_BASE_S * (attempt - 1))
        try:
            r = requests.get(url, headers=headers, timeout=timeout)
        except (requests.exceptions.Timeout, requests.exceptions.ConnectionError) as e:
            last_err = f"{type(e).__name__}: {e} (timeout={timeout}s)"
            continue
        if r.status_code >= 500 or r.status_code == 429:
            last_err = f"HTTP {r.status_code} (timeout={timeout}s)"
            continue
        return r
    raise RuntimeError(f"gave up after {MAX_ATTEMPTS} attempts: {last_err}")


try:
    import pillow_avif  # noqa
    HAVE_AVIF = True
except Exception:
    HAVE_AVIF = False
try:
    import pillow_heif
    pillow_heif.register_heif_opener()
    HAVE_HEIC = True
except Exception:
    HAVE_HEIC = False

UA = {"User-Agent": "microbe-render/1.0 (educational; contact via repo)"}


def to_square(img, size):
    img = img.convert("RGB")
    w, h = img.size
    s = min(w, h)
    img = img.crop(((w - s)//2, (h - s)//2, (w - s)//2 + s, (h - s)//2 + s))
    return img.resize((size, size), Image.LANCZOS)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--microbe", required=True)
    ap.add_argument("--theme", default="real")
    ap.add_argument("--url", required=True)
    ap.add_argument("--source-page", default="")
    ap.add_argument("--license", default="")
    ap.add_argument("--attribution", default="")
    ap.add_argument("--modality", default="")
    ap.add_argument("--size", type=int, default=1080)
    ap.add_argument("--renders-root", default="renders")
    args = ap.parse_args()

    SET = "reference-microscopy"
    theme_dir = Path(args.renders_root)/"set"/SET/"theme"/args.theme
    attempts = theme_dir/f"{args.microbe}.attempts"
    attempts.mkdir(parents=True, exist_ok=True)

    t0 = time.time()
    try:
        r = get_with_retry(args.url, UA)
    except RuntimeError as e:
        print(json.dumps({"ok": False, "error": str(e),
                          "url": args.url})); raise SystemExit(2)
    if r.status_code != 200 or not r.content:
        print(json.dumps({"ok": False, "error": f"HTTP {r.status_code}",
                          "url": args.url})); raise SystemExit(2)
    img = to_square(Image.open(io.BytesIO(r.content)), args.size)

    stem = f"real-01__{args.modality or 'micrograph'}"
    written = {}
    for fmt in ["png"] + (["avif"] if HAVE_AVIF else []) + (["heic"] if HAVE_HEIC else []):
        p = attempts/f"{stem}.{fmt}"
        if fmt == "png": img.save(p, "PNG")
        elif fmt == "avif": img.save(p, "AVIF", quality=82)
        elif fmt == "heic": img.save(p, "HEIF", quality=82)
        written[fmt] = str(p)

    meta = {"ok": True, "microbe": args.microbe, "set": SET, "theme": args.theme,
            "kind": "reference-microscopy", "source_url": args.url,
            "source_page": args.source_page, "license": args.license,
            "attribution": args.attribution, "modality": args.modality,
            "latency_s": round(time.time()-t0, 1), "files": written,
            "tokens": 0, "cost_usd": 0.0, "verified": None}
    (attempts/f"{stem}.json").write_text(json.dumps(meta, indent=2))
    print(json.dumps(meta))


if __name__ == "__main__":
    main()
