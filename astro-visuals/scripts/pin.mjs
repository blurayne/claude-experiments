// Materialise the pre-refactor page next to the assets it fetches, so the baseline can be
// captured from the build the refactor must reproduce rather than from whatever is in the
// working tree.
//
// It is written as a second HTML file in the same directory, not into a checkout of its own:
// every data file, icon and audio clip the page fetches is unchanged by this refactor, so a
// sibling file gets the identical relative paths for free.
//
// The baselines themselves are not committed. They are regenerated from this pinned commit,
// which means they can never drift out of step with the build they claim to represent, and
// several megabytes of PNG never reach a repository that is served publicly.

import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..')

/** v2.78.0 — the last commit to touch the page before the refactor began. */
export const PIN = 'fd0f980bec38084b58c7a90c152bff94b73a6959'
export const BASELINE_PAGE = 'baseline-page.html'

export function materialise() {
  const html = execFileSync('git', ['show', `${PIN}:astro-visuals/galactic-transit.html`], {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  })
  writeFileSync(resolve(ROOT, BASELINE_PAGE), html)
  return html.length
}

// Only when run as a script. The spec files import BASELINE_PAGE for its name alone, and a
// module that rewrites a file merely because it was imported would do it once per worker.
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  console.log(`${BASELINE_PAGE} <- ${PIN.slice(0, 7)}:galactic-transit.html (${materialise()} bytes)`)
}
