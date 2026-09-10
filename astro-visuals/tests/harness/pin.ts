import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

/**
 * The gate's baseline: the release the current work is compared against.
 *
 * Through the TypeScript migration this was fd0f980 (v2.78.0, the last commit before it),
 * and the gate proved the whole migration pixel-null against it. v3.1.0 changed pixels deliberately
 * (rotation, arm evolution, collision) and v3.1.1 after it (Andromeda's limb prose and the
 * observational figures in the help), so the pin rides the latest release and the gate
 * guards the next change instead. AGENTS.md carries the rule: a release
 * that intends visual change repins to its own final content commit, as its own commit, and
 * the pin never moves to make an unintended difference go away.
 */
export const PIN = '47f9a8f868039496cf07400f22873065e987c11f'

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
