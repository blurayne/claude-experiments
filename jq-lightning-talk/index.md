# jq — Lightning Talk

A short slide deck about **[jq](https://jqlang.github.io/jq/)** — the
JSON-processor that turned out to be a real programming language —
and the family of alternative implementations that grew up around it.

> The published page at `/jq-lightning-talk/` is this document. Open the
> slides below.

## Slides

- [`slides.html`](slides.html) — reveal.js deck, runs in any modern browser.
  - <kbd>space</kbd> / <kbd>→</kbd> next slide
  - <kbd>s</kbd> speaker notes
  - <kbd>f</kbd> fullscreen
  - <kbd>?</kbd> all shortcuts

## What's in the talk (≈ 5 min, 11 slides)

1. What jq is — a filter pipeline for JSON.
2. It's a real language — variables, functions, recursion, `reduce` / `foreach`, modules.
3. **jq vs JMESPath** — same query side-by-side; JMESPath is a closed query language,
   jq is a programming language. Short note that jq's filter composition is **PEG**-shaped
   (ordered sequencing, alternation, no ambiguity).
4. **Turing completeness** — recursion + generators + unbounded data ⇒ Turing-complete.
   The deck shows a tiny `while` combinator as proof-by-construction.
5. The family:
   - [`jq`](https://github.com/jqlang/jq) — the original, in C.
   - [`gojq`](https://github.com/itchyny/gojq) — pure-Go reimplementation, library-friendly.
   - [`jaq`](https://github.com/01mf02/jaq) — Rust, faster, fixes some jq quirks.
   - [`fq`](https://github.com/wader/fq) — jq for **binary** formats (PNG, ELF, MP4, …).
   - [`faq`](https://github.com/jzelinskie/faq) — jq for **YAML / TOML / XML / BSON / …**.
6. tl;dr — pick the implementation that matches your *input*, not your taste.

## Reference

The talk takes its shape from an earlier version at
<http://blog.evolution515.net/slides/jq.pdf>. That PDF could not be fetched
from this sandbox (the host is not on the network allow-list), so the
content here is a re-derivation rather than a faithful port — open an issue
or paste the outline if you want it aligned more closely.
