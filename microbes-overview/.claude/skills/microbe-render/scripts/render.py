#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = ["requests>=2.31", "pillow>=10.3", "pillow-heif>=0.16", "pillow-avif-plugin>=1.4"]
# ///
"""Render one microbe image with Google's image models (Nano Banana etc.).

Deterministic worker for the microbe-render skill. It does NOT judge images —
a Claude verify-subagent does that. This script only: calls the API, saves the
lossless PNG master at 1080x1080, emits web-safe AVIF (+ optional HEIC archival),
records model/usage/latency/cost in a sidecar, and prints one JSON line for the
orchestrator.

Auth: env GOOGLE_API_KEY, else the first GOOGLE_API_KEY= line found in a .env
walking up from the current directory (repo root .env supported).

Escalation ladder (default): the caller passes --model; the built-in ladder is
only used with --escalate, which retries the next-better model after repeated
hard failures. Imagen tiers are never entered automatically — the orchestrator
must ask the user first (per project policy).

Usage:
  render.py --microbe rod-bacterium --set pathogens-generic --theme sem \
            --prompt-file prompt.txt --attempt 1
  render.py ... --model gemini-3-pro-image        # force a model
  render.py ... --formats png,avif,heic
Output: prints a JSON object to stdout; nonzero exit on hard failure.
"""
from __future__ import annotations
import argparse, base64, json, os, sys, time, hashlib, io
from pathlib import Path

import requests
from PIL import Image

# ---- optional format plugins (degrade gracefully) --------------------------
try:
    import pillow_avif  # noqa: F401  registers AVIF
    HAVE_AVIF = True
except Exception:
    HAVE_AVIF = False
try:
    import pillow_heif
    pillow_heif.register_heif_opener()
    HAVE_HEIC = True
except Exception:
    HAVE_HEIC = False

API = "https://generativelanguage.googleapis.com/v1beta/models"

# Escalation ladder + rough $/image estimates (output image ~1290 tokens).
# Prices are ESTIMATES for the costs column; refined from usageMetadata when present.
LADDER = ["gemini-2.5-flash-image", "gemini-3-pro-image",
          "imagen-4.0-ultra-generate-001"]
PRICE_PER_IMAGE = {           # USD, best-effort
    "gemini-2.5-flash-image": 0.039,
    "gemini-3-pro-image": 0.134,
    "gemini-3-pro-image-preview": 0.134,
    "gemini-3.1-flash-image": 0.039,
    "imagen-4.0-generate-001": 0.04,
    "imagen-4.0-ultra-generate-001": 0.06,
    "imagen-4.0-fast-generate-001": 0.02,
}
IS_IMAGEN = lambda m: m.startswith("imagen")

# Per-attempt base timeouts (seconds), tuned from live latency measurement on
# 2026-08-15 (3x calls each, simple + realistic-length prompts):
#   gemini-2.5-flash-image: 7-23s observed  -> 60s base (~2.5x headroom)
#   gemini-3-pro-image:    15-44s observed  -> 90s base (~2x headroom)
# Untested models/tiers fall back to DEFAULT_TIMEOUT_S.
MODEL_TIMEOUTS_S = {
    "gemini-2.5-flash-image": 60,
    "gemini-3-pro-image": 90,
    "gemini-3-pro-image-preview": 90,
    "gemini-3.1-flash-image": 60,
    "gemini-3.1-flash-image-preview": 60,
    "gemini-3.1-flash-lite-image": 60,
}
DEFAULT_TIMEOUT_S = 120
MAX_ATTEMPTS = 3          # 1 try + 2 retries
RETRY_BACKOFF_BASE_S = 3  # sleep before retry N is RETRY_BACKOFF_BASE_S * (N-1)


def post_with_retry(url: str, headers: dict, body: dict, model: str) -> requests.Response:
    """POST with per-attempt timeout escalation (100% / 200% / 300% of the
    model's base timeout) and a short sleep before each retry. Retries on
    timeout, connection errors, HTTP 5xx and 429 (transient); returns
    immediately on 2xx or any other non-transient status for the caller to
    handle. Raises RuntimeError if all MAX_ATTEMPTS are exhausted."""
    base = MODEL_TIMEOUTS_S.get(model, DEFAULT_TIMEOUT_S)
    last_err = None
    for attempt in range(1, MAX_ATTEMPTS + 1):
        timeout = base * attempt  # 100% / 200% / 300%
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
    here = Path.cwd()
    for d in [here, *here.parents]:
        env = d / ".env"
        if env.is_file():
            for line in env.read_text().splitlines():
                line = line.strip()
                if line.startswith("GOOGLE_API_KEY="):
                    return line.split("=", 1)[1].strip().strip('"').strip("'")
    sys.exit("ERROR: GOOGLE_API_KEY not in environment and no .env found upward.")


def call_gemini(model: str, prompt: str, key: str) -> tuple[bytes, dict]:
    """Return (png_bytes, usage) from a gemini image model, else raise."""
    url = f"{API}/{model}:generateContent"
    headers = {"x-goog-api-key": key, "Content-Type": "application/json"}
    # Some deployments want ["IMAGE"], others ["TEXT","IMAGE"]; try both.
    for mods in (["IMAGE"], ["TEXT", "IMAGE"]):
        body = {"contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"responseModalities": mods}}
        try:
            r = post_with_retry(url, headers, body, model)
        except RuntimeError as e:
            last = str(e)
            continue
        if r.status_code != 200:
            last = f"HTTP {r.status_code}: {r.text[:300]}"
            continue
        data = r.json()
        cands = data.get("candidates", [])
        for c in cands:
            for part in c.get("content", {}).get("parts", []):
                inline = part.get("inlineData") or part.get("inline_data")
                if inline and inline.get("data"):
                    return base64.b64decode(inline["data"]), data.get("usageMetadata", {})
        last = "no image part in response: " + json.dumps(data)[:300]
    raise RuntimeError(last)


def call_imagen(model: str, prompt: str, key: str) -> tuple[bytes, dict]:
    url = f"{API}/{model}:predict"
    headers = {"x-goog-api-key": key, "Content-Type": "application/json"}
    body = {"instances": [{"prompt": prompt}],
            "parameters": {"sampleCount": 1, "aspectRatio": "1:1"}}
    r = post_with_retry(url, headers, body, model)
    if r.status_code != 200:
        raise RuntimeError(f"HTTP {r.status_code}: {r.text[:300]}")
    preds = r.json().get("predictions", [])
    for p in preds:
        b64 = p.get("bytesBase64Encoded")
        if b64:
            return base64.b64decode(b64), {}
    raise RuntimeError("no prediction bytes: " + json.dumps(r.json())[:300])


def to_square(img: Image.Image, size: int) -> Image.Image:
    img = img.convert("RGB")
    w, h = img.size
    s = min(w, h)
    img = img.crop(((w - s) // 2, (h - s) // 2, (w - s) // 2 + s, (h - s) // 2 + s))
    return img.resize((size, size), Image.LANCZOS)


def cost_for(model: str, usage: dict) -> float:
    # Prefer token-based when the API reports image output tokens.
    out = usage.get("candidatesTokenCount") or usage.get("totalTokenCount")
    if out and not IS_IMAGEN(model):
        # gemini image output billed ~ $30 / 1M output tokens (estimate).
        return round(out * 30 / 1_000_000, 4)
    return PRICE_PER_IMAGE.get(model, 0.05)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--microbe", required=True)
    ap.add_argument("--set", dest="set_", required=True)
    ap.add_argument("--theme", required=True)
    g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument("--prompt")
    g.add_argument("--prompt-file")
    ap.add_argument("--model", default=LADDER[0])
    ap.add_argument("--attempt", type=int, default=1)
    ap.add_argument("--size", type=int, default=1080)
    ap.add_argument("--formats", default="png,avif" + (",heic" if HAVE_HEIC else ""))
    ap.add_argument("--renders-root", default="renders")
    args = ap.parse_args()

    prompt = args.prompt if args.prompt else Path(args.prompt_file).read_text()
    key = load_key()

    theme_dir = Path(args.renders_root) / "set" / args.set_ / "theme" / args.theme
    attempts = theme_dir / f"{args.microbe}.attempts"
    attempts.mkdir(parents=True, exist_ok=True)

    t0 = time.time()
    try:
        raw, usage = (call_imagen if IS_IMAGEN(args.model) else call_gemini)(
            args.model, prompt, key)
    except Exception as e:
        print(json.dumps({"ok": False, "model": args.model, "error": str(e),
                          "microbe": args.microbe, "theme": args.theme,
                          "attempt": args.attempt}))
        sys.exit(2)
    latency = round(time.time() - t0, 1)

    img = to_square(Image.open(io.BytesIO(raw)), args.size)
    stem = f"gen-{args.attempt:02d}__{args.model}"
    written = {}
    for fmt in [f.strip() for f in args.formats.split(",") if f.strip()]:
        p = attempts / f"{stem}.{fmt}"
        try:
            if fmt == "png":
                img.save(p, "PNG")
            elif fmt == "avif":
                if not HAVE_AVIF:
                    continue
                img.save(p, "AVIF", quality=82)
            elif fmt == "heic":
                if not HAVE_HEIC:
                    continue
                img.save(p, "HEIF", quality=82)
            else:
                img.save(p)
            written[fmt] = str(p)
        except Exception as e:
            written[fmt] = f"ERROR: {e}"

    cost = cost_for(args.model, usage)
    result = {
        "ok": True, "microbe": args.microbe, "set": args.set_, "theme": args.theme,
        "attempt": args.attempt, "model": args.model, "latency_s": latency,
        "prompt_sha": hashlib.sha1(prompt.encode()).hexdigest()[:12],
        "usage": usage, "cost_usd": cost, "size": args.size,
        "files": written,
        "have_avif": HAVE_AVIF, "have_heic": HAVE_HEIC,
    }
    (attempts / f"{stem}.json").write_text(json.dumps(result, indent=2))
    print(json.dumps(result))


if __name__ == "__main__":
    main()
