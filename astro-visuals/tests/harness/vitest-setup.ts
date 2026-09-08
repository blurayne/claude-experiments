import { materialisePinnedPage } from './pin'

/**
 * `npm test` materialises the pinned pre-refactor page, exactly as Playwright's globalSetup
 * does for the e2e suites.
 *
 * Three unit tests read it: the CSS split and the shader extraction both assert, line for line,
 * that what came out of the single file is what was in it. Without this they pass on any
 * machine that has run the e2e suite at least once and fail on a clean checkout — which is
 * what happened the first time CI ran them, and is the only place that difference shows.
 */
export default function setup(): void {
  materialisePinnedPage()
}
