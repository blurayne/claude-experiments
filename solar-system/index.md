# Solar System 3D

An interactive 3D viewer of the solar system, rendered directly in the browser.

> The published page at `/solar-system/` serves the hand-written [`index.html`](index.html) so the viewer loads as the landing page. This `index.md` is kept as documentation for the experiment.

## Files

- [`index.html`](index.html) — the interactive 3D viewer. Open this file in a modern browser, or visit `/solar-system/` on the deployed site.
- [`vendor/`](vendor/) — pinned third-party libraries (React 18.3.1, ReactDOM 18.3.1, Three.js r160), vendored into the repo so the page has **no external CDN dependencies**.

## Running locally

The viewer needs no build step and no internet access — React, ReactDOM and
Three.js are bundled in [`vendor/`](vendor/), and the JSX is precompiled to
plain JS inline in the HTML (no in-browser Babel). Just open it directly:

```bash
xdg-open index.html   # Linux
open index.html       # macOS
```
