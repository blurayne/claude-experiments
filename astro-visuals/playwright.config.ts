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
 * The renderer is SwiftShader and the page is fragment-bound, so a state costs the better
 * part of a minute. Workers are capped below the core count because each one is a software
 * rasteriser competing for the same CPU — oversubscribing makes the suite slower, not faster,
 * and (worse) makes it time out unevenly.
 */
export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './test-results',
  timeout: 900_000,
  expect: { timeout: 30_000 },
  fullyParallel: true,
  workers: Math.max(1, Math.min(3, Math.floor((cpus().length - 2) / 4))),
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
