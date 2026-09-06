import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

/**
 * v2.78.0 — the last commit to touch the page before the refactor began. The baselines are
 * captured from this, not from the working tree, so "what the page used to do" is a fixed
 * point in git rather than whatever happens to be checked out.
 */
export const PIN = 'fd0f980bec38084b58c7a90c152bff94b73a6959'

/**
 * The pinned page is written as a sibling of the live one rather than into a checkout of its
 * own. Every data file, icon and audio clip it fetches is untouched by this refactor, so a
 * second HTML file in the same directory gets the identical relative paths for free — and
 * the build under test and the build it is compared against then read byte-identical data.
 */
export const BASELINE_PAGE = 'baseline-page.html'

export function materialisePinnedPage(): number {
  const html = execFileSync('git', ['show', `${PIN}:astro-visuals/galactic-transit.html`], {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  })
  writeFileSync(resolve(ROOT, BASELINE_PAGE), html)
  return html.length
}
