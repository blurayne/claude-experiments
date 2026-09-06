import { materialisePinnedPage, PIN, BASELINE_PAGE } from './pin'

/**
 * Runs once before any project. Materialising the pinned page here rather than in a shell
 * step keeps it in TypeScript with the rest of the harness — and, more usefully, means it
 * cannot be forgotten: there is no way to run the baseline project against a stale copy.
 */
export default function globalSetup(): void {
  const bytes = materialisePinnedPage()
  console.log(`${BASELINE_PAGE} <- ${PIN.slice(0, 7)}:galactic-transit.html (${bytes} bytes)`)
}
