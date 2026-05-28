# Steampipe — Lightning Talk

A short (3–5 minute) slide deck about **[Steampipe](https://steampipe.io)** — the
"SQL over your cloud" tool built on a Postgres Foreign Data Wrapper.

> The published page at `/steampipe-lightning-talk/` is this document. Open the
> slides below.

## Slides

- [`slides.html`](slides.html) — reveal.js deck, runs in any modern browser.
  - <kbd>space</kbd> / <kbd>→</kbd> next slide
  - <kbd>s</kbd> speaker notes
  - <kbd>f</kbd> fullscreen
  - <kbd>?</kbd> all shortcuts

## What's in the talk

1. What Steampipe is — Postgres + FDW + plugins.
2. **Kubernetes** plugin — query pods / deployments with plain SQL and `jsonb`.
3. **Aggregator** connections — one virtual connection over many AWS accounts.
4. **AWS** examples — public S3 buckets, EC2 instances missing tags.
5. **JSON output** (`--output json`) — pipe straight into `jq` / shell.
6. **CSV plugin** — join a hand-maintained CSV with live cloud state.
7. End note: for pure file-crunching, **[DuckDB](https://duckdb.org)** is even cooler.

The deck deliberately stays close to copy-pasteable SQL so the audience can grab
queries and try them after the talk.
