/**
 * The two hooks the determinism layer installs on the page's `globalThis`.
 *
 * They are declared rather than cast at each call site: `globalThis as Record<string, ...>`
 * does not type-check (globalThis has its own incompatible members) and casting through
 * `unknown` to silence that would throw away the argument types, which is the only part
 * worth checking — `__arm` taking a frame count is the whole contract.
 */
declare global {
  /** Restart the virtual frame counter at zero and stop it after `frames` steps. */
  var __arm: (frames: number) => void
  /** Where the virtual frame counter stands, and whether the budget is spent. */
  var __frames: () => { n: number; cap: number; done: boolean }
}

export {}
