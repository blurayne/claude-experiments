# Image models & escalation ladder

Auth: env `GOOGLE_API_KEY`, else the first `GOOGLE_API_KEY=` in a `.env` walking up
from cwd (the repo-root `.env` works). List reachable models with:

```
curl -s -H "x-goog-api-key: $GOOGLE_API_KEY" \
  https://generativelanguage.googleapis.com/v1beta/models | \
  python3 -c "import sys,json;[print(m['name']) for m in json.load(sys.stdin)['models'] if 'image' in m['name'].lower()]"
```

## Ladder (project policy)

1. **`gemini-2.5-flash-image`** — "Nano Banana". Fast, cheap (~$0.039/image), great for
   iterative edits/consistency. **Start here.**
2. **`gemini-3-pro-image`** — "Nano Banana Pro" (Gemini 3). Stronger reasoning/text/layout.
   Escalate here when Nano Banana results are too bad (rule of thumb: **2 hard fails or
   2 verify-rejections on a style** → escalate).
3. **`imagen-4.0-ultra-generate-001`** — Imagen 4 Ultra, highest fidelity/prompt-adherence.
   **STOP and ask the user before using any Imagen tier.** Other tiers:
   `imagen-4.0-generate-001` (standard), `imagen-4.0-fast-generate-001` (cheap/fast).

Also visible on this key but not in the default ladder: `gemini-3.1-flash-image(-preview)`,
`gemini-3.1-flash-lite-image`. Use only if the user asks.

## API shape

- Gemini image models → `:generateContent`, body
  `{"contents":[{"parts":[{"text":PROMPT}]}],"generationConfig":{"responseModalities":["IMAGE"]}}`;
  image comes back as `candidates[].content.parts[].inlineData.data` (base64 PNG).
  `usageMetadata.candidatesTokenCount` ≈ image tokens (~1290 for one image).
- Imagen models → `:predict`, body `{"instances":[{"prompt":PROMPT}],"parameters":{"sampleCount":1,"aspectRatio":"1:1"}}`;
  image in `predictions[].bytesBase64Encoded`.

`render.py` handles both and records the model in every sidecar + filename
(`gen-NN__<model>.png`). Costs: gemini billed on output image tokens (~$30/1M, est.);
Imagen flat per image. All figures are estimates for the `costs` column — label as such.
