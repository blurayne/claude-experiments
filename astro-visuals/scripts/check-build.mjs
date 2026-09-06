// Assertions about the emitted galactic-transit.html, run as part of `npm run build`.
//
// A bundler can silently produce a file that is wrong in ways no test of the running page
// will notice quickly: a side-effect-only module tree-shaken away, the build-stamp
// placeholders mangled into something build_site.py no longer recognises, an external
// stylesheet where an inline one is required. Each of those has a cheap textual check, so
// each gets one here rather than being discovered in production.

import { readFileSync, statSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = resolve(ROOT, 'galactic-transit.html')
const html = readFileSync(OUT, 'utf8')

const failures = []
const check = (ok, what) => { if (!ok) failures.push(what) }

// The page must stay ONE file. sw.js caches it by name and serves it as the offline shell;
// an external script or stylesheet would 404 offline and take the PWA with it.
check(!/<script[^>]+\bsrc=/.test(html), 'the output references an external script')
check(!/<link[^>]+rel=["']?stylesheet/.test(html), 'the output references an external stylesheet')

// build_site.py substitutes these on the copy under _site/. If the bundler splits or escapes
// them the deployed page silently reports itself as a dev build for ever.
for (const token of ['__BUILD_DATE__', '__BUILD_TIME__', '__BUILD_SHA__'])
  check(html.includes(token), `the build stamp placeholder ${token} did not survive the bundle`)

// Markers from side-effect-only code paths, which are exactly what tree-shaking removes and
// what no smoke test exercises: the no-WebGL2 abort, and each async data loader.
for (const marker of ['webgl2', 'galaxy-map.webp', 'm31-map.webp', 'earth-map.webp', 'stars-gaia.bin'])
  check(html.includes(marker), `marker "${marker}" is missing — a side-effect module was dropped`)

// The service worker's cache name and the page's own version must agree, or a release ships
// with a worker that keeps serving the previous build from cache.
const pageVersion = html.match(/version:\s*['"]([\d.]+)['"]/)?.[1]
const swVersion = readFileSync(resolve(ROOT, 'sw.js'), 'utf8').match(/const V = 'galactic-transit-([\d.]+)'/)?.[1]
check(pageVersion !== undefined, 'no BUILD.version found in the output')
check(pageVersion === swVersion, `version mismatch: page ${pageVersion}, sw.js ${swVersion}`)

const kb = Math.round(statSync(OUT).size / 1024)
if (failures.length) {
  console.error(`check-build: ${failures.length} problem(s) with galactic-transit.html (${kb} kB)`)
  for (const f of failures) console.error('  ✘ ' + f)
  process.exit(1)
}
console.log(`check-build: galactic-transit.html ${kb} kB, ${pageVersion} — all assertions pass`)
