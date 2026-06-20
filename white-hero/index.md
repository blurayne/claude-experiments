# White Hero — talk to your immune-system buddy

A browser voice app for kids (~7–10 years). You tap one big button and **talk out
loud** to **Senua**, a brave white blood cell who lives in the body's immune system.
Senua listens, thinks, and talks back in a real voice — explaining what immune cells
do and naming the body's organs and their jobs, at roughly a ten-year-old's level.

> The published page at `/white-hero/` serves the hand-written [`index.html`](index.html)
> so the app loads as the landing page. This `index.md` is kept as documentation.

## How it works

A single self-contained HTML file — **no build step, no libraries, no backend**.
Everything runs in the browser:

- **Speech ↔ speech in real time** via the **OpenAI Realtime API** (`gpt-realtime`),
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
- **Idle nudges** — if the child is quiet for a random 5–15 s, the friend gently encourages
  a question, shares a quick fact, or tells a **1–2 minute adventure story with a small
  moral**. Normal answers stay to 1–2 short sentences.
- **Text on/off toggle** — speech is the main channel, so on-screen captions are **off by
  default**; flip them on with the 💬 button (saved in `localStorage`).
- **English / German** language selector — the whole UI and the friends' spoken language
  switch, and the choice is saved in `localStorage`.
- **Token counter** (top-left): the Realtime API reports token usage per response, which
  the app sums up. OpenAI doesn't expose your account balance to a browser, so you can set
  an optional **token budget** in settings; the pill then shows how many tokens are *left*
  against it (and turns red when nearly empty). Otherwise it shows tokens *used*.
- **Secret memory**: the last ~10 exchanges are summarised into a short, private note in
  `localStorage` and quietly injected into the system prompt on the next start, so the
  friends can pick up where you left off. Clear it any time in settings.

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
python3 -m http.server 8000   # then open http://localhost:8000/white-hero/
```

## Files

- [`index.html`](index.html) — the whole app (UI, i18n, WebRTC handshake, character,
  audio viz, token counter, memory).
