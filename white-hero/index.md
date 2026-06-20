# White Hero — talk to your immune-system buddy

A browser voice app for kids (~8 years old). You tap one big button and **talk out
loud** to **Welly**, a friendly white blood cell who lives in your body's immune
system. Welly listens, thinks, and talks back in a real voice — explaining how the
body fights germs and stays healthy.

> The published page at `/white-hero/` serves the hand-written [`index.html`](index.html)
> so the app loads as the landing page. This `index.md` is kept as documentation.

## How it works

It's a single self-contained HTML file — **no build step, no libraries, no backend**.
Everything runs in the browser:

- **Speech ↔ speech in real time** via the **OpenAI Realtime API** (`gpt-realtime`),
  connected straight from the browser over **WebRTC**. Audio flows peer-to-peer with
  OpenAI, so latency is low and Welly can be interrupted mid-sentence.
- **Microphone** via `getUserMedia`; **Welly's voice** plays through an `<audio>` sink.
- The cartoon white blood cell is inline **SVG**; its mouth, bob and the ripple ring are
  driven by the **Web Audio API** (an `AnalyserNode` reads the live audio level each frame).
- Live **transcripts** (yours and Welly's) arrive over the WebRTC **data channel** and
  show up in the speech bubble.

## First-time setup (for a grown-up)

Tap **⚙️** and paste an **OpenAI API key**:

- It must be a real **API key** from
  [platform.openai.com/api-keys](https://platform.openai.com/api-keys) — a **ChatGPT or
  Claude subscription does not work**, because this uses the pay-as-you-go Realtime API
  (billed per minute of audio).
- The key is stored **only in this browser** (`localStorage`) and sent only to
  `api.openai.com`. You enter it once. Because there's no backend, anyone with access to
  the device can read it — use a personal key and revoke it if the device is shared.

You can also choose Welly's **voice** and edit Welly's **personality** in the same panel.

## Running locally

No build, no internet beyond the OpenAI API. Microphone access needs a **secure context**,
so either open it over `https://` (the deployed Pages URL works) or via `http://localhost`:

```bash
python3 -m http.server 8000   # then open http://localhost:8000/white-hero/
```

## Files

- [`index.html`](index.html) — the whole app (UI, WebRTC handshake, character, audio viz).
