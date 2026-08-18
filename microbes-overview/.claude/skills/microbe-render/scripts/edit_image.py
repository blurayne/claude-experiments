#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = ["requests>=2.31", "pillow>=10.3", "pillow-heif>=0.16", "pillow-avif-plugin>=1.4"]
# ///
"""Edit an existing image with a Gemini image model (Nano Banana editing).

Used mainly to CLEAN a real-microscopy reference: remove baked-in text / scale
bars / black borders, recompose so the microbe fills the frame, and keep (or add)
the false-color colorization — without changing the science.

Sends the input image + an instruction to gemini-2.5-flash-image (generateContent
with an inlineData image part) and saves the result at 1080x1080 (PNG master +
AVIF + HEIC) with a usage/cost sidecar, into the standard attempts folder.

Usage:
  edit_image.py --in path/to/real-01__TEM.png \
    --microbe rod-bacterium --set reference-microscopy --theme tem --attempt 2 \
    --prompt-file clean.txt
Auth: GOOGLE_API_KEY env, else a .env walking up from cwd.
"""
from __future__ import annotations
import argparse, base64, io, json, os, sys, time, hashlib
from pathlib import Path
import requests
from PIL import Image
try:
    import pillow_avif  # noqa
    HAVE_AVIF = True
except Exception:
    HAVE_AVIF = False
try:
    import pillow_heif; pillow_heif.register_heif_opener()
    HAVE_HEIC = True
except Exception:
    HAVE_HEIC = False

API = "https://generativelanguage.googleapis.com/v1beta/models"

# Same tuning as render.py (see there for the 2026-08-15 measurement notes).
MODEL_TIMEOUTS_S = {
    "gemini-2.5-flash-image": 60,
    "gemini-3-pro-image": 90,
    "gemini-3-pro-image-preview": 90,
    "gemini-3.1-flash-image": 60,
    "gemini-3.1-flash-image-preview": 60,
    "gemini-3.1-flash-lite-image": 60,
}
DEFAULT_TIMEOUT_S = 120
MAX_ATTEMPTS = 3
RETRY_BACKOFF_BASE_S = 3


def post_with_retry(url: str, headers: dict, body: dict, model: str) -> requests.Response:
    """Same escalating-timeout retry as render.py: 100%/200%/300% of the
    model's base timeout, short sleep before each retry, retries only on
    timeout/connection errors/5xx/429."""
    base = MODEL_TIMEOUTS_S.get(model, DEFAULT_TIMEOUT_S)
    last_err = None
    for attempt in range(1, MAX_ATTEMPTS + 1):
        timeout = base * attempt
        if attempt > 1:
            time.sleep(RETRY_BACKOFF_BASE_S * (attempt - 1))
        try:
            r = requests.post(url, headers=headers, json=body, timeout=timeout)
        except (requests.exceptions.Timeout, requests.exceptions.ConnectionError) as e:
            last_err = f"{type(e).__name__}: {e} (timeout={timeout}s)"
            continue
        if r.status_code >= 500 or r.status_code == 429:
            last_err = f"HTTP {r.status_code}: {r.text[:300]} (timeout={timeout}s)"
            continue
        return r
    raise RuntimeError(f"gave up after {MAX_ATTEMPTS} attempts (timeouts {base}/{base*2}/{base*3}s): {last_err}")


def load_key() -> str:
    k = os.environ.get("GOOGLE_API_KEY")
    if k:
        return k.strip()
    for d in [Path.cwd(), *Path.cwd().parents]:
        env = d / ".env"
        if env.is_file():
            for line in env.read_text().splitlines():
                if line.strip().startswith("GOOGLE_API_KEY="):
                    return line.split("=", 1)[1].strip().strip('"').strip("'")
    sys.exit("ERROR: GOOGLE_API_KEY not found.")


def edit(model, prompt, img_bytes, mime, key):
    url = f"{API}/{model}:generateContent"
    b64 = base64.b64encode(img_bytes).decode()
    body = {"contents": [{"parts": [
                {"text": prompt},
                {"inlineData": {"mimeType": mime, "data": b64}}]}],
            "generationConfig": {"responseModalities": ["IMAGE"]}}
    r = post_with_retry(url, {"x-goog-api-key": key,
                         "Content-Type": "application/json"}, body, model)
    if r.status_code != 200:
        raise RuntimeError(f"HTTP {r.status_code}: {r.text[:300]}")
    data = r.json()
    for c in data.get("candidates", []):
        for part in c.get("content", {}).get("parts", []):
            inline = part.get("inlineData") or part.get("inline_data")
            if inline and inline.get("data"):
                return base64.b64decode(inline["data"]), data.get("usageMetadata", {})
    raise RuntimeError("no image in response: " + json.dumps(data)[:300])


def to_square(img, size):
    img = img.convert("RGB")
    w, h = img.size
    s = min(w, h)
    img = img.crop(((w - s)//2, (h - s)//2, (w - s)//2 + s, (h - s)//2 + s))
    return img.resize((size, size), Image.LANCZOS)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--in", dest="inp", required=True)
    ap.add_argument("--microbe", required=True)
    ap.add_argument("--set", dest="set_", required=True)
    ap.add_argument("--theme", required=True)
    ap.add_argument("--attempt", type=int, default=2)
    ap.add_argument("--model", default="gemini-2.5-flash-image")
    g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument("--prompt"); g.add_argument("--prompt-file")
    ap.add_argument("--size", type=int, default=1080)
    ap.add_argument("--renders-root", default="renders")
    a = ap.parse_args()
    prompt = a.prompt or Path(a.prompt_file).read_text()
    key = load_key()
    raw = Path(a.inp).read_bytes()
    mime = "image/png" if a.inp.lower().endswith("png") else "image/jpeg"

    t0 = time.time()
    out_bytes, usage = edit(a.model, prompt, raw, mime, key)
    latency = round(time.time() - t0, 1)
    img = to_square(Image.open(io.BytesIO(out_bytes)), a.size)

    attempts = Path(a.renders_root)/"set"/a.set_/"theme"/a.theme/f"{a.microbe}.attempts"
    attempts.mkdir(parents=True, exist_ok=True)
    stem = f"real-{a.attempt:02d}__edit-{a.model}"
    files = {}
    for fmt in ["png"] + (["avif"] if HAVE_AVIF else []) + (["heic"] if HAVE_HEIC else []):
        p = attempts/f"{stem}.{fmt}"
        img.save(p, "HEIF" if fmt == "heic" else fmt.upper(),
                 **({"quality": 82} if fmt in ("avif", "heic") else {}))
        files[fmt] = str(p)
    out = usage.get("candidatesTokenCount") or usage.get("totalTokenCount") or 0
    res = {"ok": True, "microbe": a.microbe, "set": a.set_, "theme": a.theme,
           "attempt": a.attempt, "model": a.model, "kind": "reference-edit",
           "source_image": a.inp, "latency_s": latency, "usage": usage,
           "cost_usd": round(out*30/1_000_000, 4) if out else 0.039,
           "prompt_sha": hashlib.sha1(prompt.encode()).hexdigest()[:12], "files": files}
    (attempts/f"{stem}.json").write_text(json.dumps(res, indent=2))
    print(json.dumps(res))


if __name__ == "__main__":
    main()
