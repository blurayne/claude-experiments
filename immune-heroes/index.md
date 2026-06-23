# Immune Heroes — talk to your immune-system buddies

A browser voice app for kids (~7–10 years). You tap one big button and **talk out
loud** to **Senua**, a brave white blood cell who lives in the body's immune system.
Senua listens, thinks, and talks back in a real voice — explaining what immune cells
do and naming the body's organs and their jobs, at roughly a ten-year-old's level.

> The published page at `/immune-heroes/` serves the hand-written [`index.html`](index.html)
> so the app loads as the landing page. This `index.md` is kept as documentation.

## How it works

A single self-contained HTML file — **no build step, no libraries, no backend**.
Everything runs in the browser:

- **Speech ↔ speech in real time** via the **OpenAI Realtime API** (default
  `gpt-realtime-mini` — cheaper; switch to `gpt-realtime` in settings for the richest voice),
  connected straight from the browser over **WebRTC**. Audio flows peer-to-peer with
  OpenAI, so latency is low and Senua can be interrupted mid-sentence.
- **Microphone** via `getUserMedia`; **Senua's voice** plays through an `<audio>` sink.
- The cartoon white blood cell is inline **SVG**; its mouth, bob and the ripple ring are
  driven by the **Web Audio API** (an `AnalyserNode` reads the live audio level each frame).
- Live **transcripts** (yours and Senua's) arrive over the WebRTC **data channel**.

### Features

- **A cast of friends** — tap an avatar to switch between **Senua** (white blood cell),
  **Rubina** (red blood cell), **Theo** (T-helper), **Kilian** (T-killer), **Denni**
  (dendritic cell) and **Makro** (macrophage). Each has its own **voice**, colour and
  character; switching reconnects so the new voice takes effect, and the shared memory
  carries the conversation across.
- **Idle nudges** — the friend always waits **at least ~10 s after its own last spoken word**
  (counted from when the audio actually finishes, then a 10–18 s gap) and only speaks again
  if the child stays quiet; it then gently encourages a question, shares a quick fact, or
  tells a **1–2 minute adventure story with a small moral**. Normal answers stay to 1–2 short
  sentences. The system prompt reinforces the same pacing so the friends don't talk nonstop.
- **Text on/off toggle** — speech is the main channel, so on-screen captions are **off by
  default**; flip them on with the 💬 button (saved in `localStorage`).
- **English / German** language selector — the whole UI and the friends' spoken language
  switch, and the choice is saved in `localStorage`.
- **Token counter & cost estimate** (top-left): the Realtime API reports token usage per
  response, which the app sums up. OpenAI doesn't expose your account balance to a browser,
  so you can set an optional **token budget** in settings; the pill then shows how many
  tokens are *left* against it (and turns red when nearly empty). Otherwise it shows tokens
  *used*. The pill also appends a **rough $ cost estimate** from public list prices
  (audio-token rates for OpenAI/Gemini; ElevenLabs is metered **per minute** of connected
  time, so it shows `⏱ minutes · ~$`). Settings shows the per-provider rate card and which
  API is cheapest. Estimates only — not a bill.
- **Daily spending limit** (default **$1/day**, changeable in settings): the app tracks the
  estimated spend per local day in `localStorage`. When the day's budget is used up, any
  live session ends and the active "cell" tells the child — in character, read aloud via the
  browser's free speech synthesis — that playtime is over and the little helper-cells must go
  back to work inside the body; come back tomorrow. The counter resets at local midnight.
- **Password-protected settings**: the grown-ups panel is gated. On first use you're asked to
  **set a password** (which then opens settings straight away); afterwards you're prompted for
  it before the dialog opens. The password is stored only as a SHA-256 hash on the device, and
  can be changed inside settings.
- **Secret memory**: the last ~10 exchanges are summarised into a short, private note in
  `localStorage` and quietly injected into the system prompt on the next start, so the
  friends can pick up where you left off. Clear it any time in settings.
- **Invented friends roster**: agents can make up new friend cells (name, cell type, one
  trait) via a `remember_friend` tool; up to ~120 are kept in `localStorage` and the latest
  100 are injected at init so they're reused consistently. (Auto-save works on OpenAI &
  Gemini; on ElevenLabs the roster is injected read-only.)
- **Choosable AI provider** (settings): **OpenAI Realtime** (default, proven) or —
  *experimental* — **Google Gemini Live** (native speech-to-speech, just needs a Gemini
  key) and **ElevenLabs Conversational AI** (connect to an agent you create in their
  dashboard with **Claude** as its LLM; search & pick the voice in-app). Gemini Live model
  IDs churn, so settings has a **List models** button that queries the Gemini `models.list`
  API with your key, keeps only those advertising `bidiGenerateContent` (Live), and lets you
  pick one (remembering whether it needs the `v1beta` or `v1alpha` endpoint).

## Why OpenAI Realtime — and the other options

This app uses the **OpenAI Realtime API** (`gpt-realtime`, speech↔speech over WebRTC)
because it's a single end-to-end audio model with low latency, native barge-in, and a
browser-friendly WebRTC handshake — a good fit for a no-backend static page. For
reference, the realtime-voice landscape as of mid-2026:

**Native speech-to-speech** (one model: audio in → audio out; lowest latency, richer audio
understanding like tone/laughter, but locked to one model and weaker text reasoning):

- **OpenAI Realtime API** — `gpt-realtime`, WebRTC/WebSocket (used here).
- **Google Gemini Live API** — bidirectional audio/video over WebSocket.
- **Amazon Nova Sonic** (Bedrock) — speech-to-speech model (~1.1 s TTFT).
- **xAI Grok Voice Agent** — among the lowest measured latency (~0.78 s TTFT).
- **Hume EVI** — emotionally-aware realtime voice.
- **Azure OpenAI Realtime** — Microsoft-hosted `gpt-realtime`.
- **Kyutai Moshi** — open, full-duplex speech-to-speech.

**Pipeline / voice-agent stacks** (mix-and-match STT + LLM + TTS, or agent orchestration;
swap any component and use a frontier text LLM, at a bit more latency): **AssemblyAI**
Voice Agent, **Deepgram** Voice Agent, **ElevenLabs** Conversational AI, **Cartesia**,
**Ultravox**, and frameworks like **LiveKit Agents / Pipecat / Vapi / Retell**.

Note: **Anthropic/Claude has no native realtime speech API** (text only), so Claude would
be used as the LLM *inside* a pipeline rather than as a speech-to-speech endpoint.

Sources:
[AssemblyAI](https://www.assemblyai.com/blog/best-speech-to-speech-voice-agent-api) ·
[Inworld](https://inworld.ai/resources/best-realtime-ai-api) ·
[GetStream](https://getstream.io/blog/speech-apis/) ·
[Softcery](https://softcery.com/lab/ai-voice-agents-real-time-vs-turn-based-tts-stt-architecture)

## First-time setup (for a grown-up)

Tap **⚙️** and paste an **OpenAI API key**:

- It must be a real **API key** from
  [platform.openai.com/api-keys](https://platform.openai.com/api-keys) — a **ChatGPT or
  Claude subscription does not work**, because this uses the pay-as-you-go Realtime API.
- The key is stored **only in this browser** (`localStorage`) and sent only to
  `api.openai.com`. Because there's no backend, anyone with access to the device can read
  it — use a personal key and revoke it if the device is shared.
- You can also choose the **language**, Senua's **voice**, edit Senua's **personality**,
  set a **token budget**, and clear the **memory** in the same panel.

## Running locally

No build, no internet beyond the OpenAI + GitHub APIs. Microphone access needs a **secure
context**, so open it over `https://` (the deployed Pages URL works) or via `http://localhost`:

```bash
python3 -m http.server 8000   # then open http://localhost:8000/immune-heroes/
```

## Files

- [`index.html`](index.html) — the whole app (UI, i18n, WebRTC handshake, character,
  audio viz, token counter, memory).
- [`prompts.md`](prompts.md) — the built-in character prompts: the shared rulebook
  (added to every friend) written once, then each character's own personality. The
  grown-ups dialog edits only the per-character part; the shared rules are appended
  automatically.
