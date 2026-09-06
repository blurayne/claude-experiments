import { defineConfig } from '@playwright/test'
import { cpus } from 'node:os'
import { CHROMIUM_ARGS } from './tests/harness/session'

/**
 * Two projects over one server.
 *
 *   baseline — photographs `baseline-page.html`, the pinned pre-refactor build, into
 *              tests/baselines/. Run once, and again whenever the pin moves.
 *   parity   — photographs the built `galactic-transit.html` and requires the same pixels.
 *
 * Both are served from the same directory, so the page under test and the page it is
 * compared against fetch byte-identical data files over identical relative paths.
 *
 * The renderer is SwiftShader and the page is fragment-bound, so a state costs a minute or
 * two whatever we do.
 *
 * It runs on ONE worker by default, and that is a correctness decision rather than a
 * scheduling one. At three workers a state was observed to differ from its own baseline by
 * 8% of pixels at max delta 3 — the signature of a rasteriser rounding differently, not of a
 * changed picture — and to compare byte-identical when re-run alone. Several software
 * rasterisers competing for the same cores do not tile the frame the same way twice, and a
 * gate that reports a difference because the machine was busy is worse than no gate: it
 * teaches you to re-run until it goes green. Wall-clock is roughly a wash anyway, since the
 * workers were only splitting a fixed amount of CPU between them.
 *
 * PARITY_WORKERS overrides it for a quick single-state check, where contention cannot arise.
 */
export default defineConfig({
  testDir: './tests/e2e',
  globalSetup: './tests/harness/global-setup.ts',
  outputDir: './test-results',
  timeout: 900_000,
  expect: { timeout: 30_000 },
  fullyParallel: true,
  workers: Number(process.env.PARITY_WORKERS ?? 1),
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  forbidOnly: !!process.env.CI,
  retries: 0, // a flaky parity gate is a broken parity gate; never paper over it

  use: {
    baseURL: 'http://localhost:4321',
    launchOptions: { args: CHROMIUM_ARGS },
    trace: 'retain-on-failure',
  },

  webServer: {
    command: 'node scripts/serve.mjs . 4321',
    url: 'http://localhost:4321/manifest.json',
    reuseExistingServer: true,
    stdout: 'ignore',
  },

  projects: [
    { name: 'baseline', testMatch: /baseline\.spec\.ts/ },
    { name: 'boot', testMatch: /boot\.spec\.ts/ },
    { name: 'parity', testMatch: /parity\.spec\.ts/, dependencies: ['boot'] },
  ],
})
