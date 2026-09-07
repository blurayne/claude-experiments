import { defineConfig } from '@playwright/test'
import { cpus } from 'node:os'
import { CHROMIUM_ARGS } from './tests/harness/session'

/**
 * Two projects over one server.
 *
 *   boot   — the assertions a parse check cannot make: no errors, every id resolves, the
 *            saved settings actually take, sw.js parses and declares its cache name once.
 *   parity — photographs the pinned pre-refactor page and the built page back to back and
 *            requires the same pixels. There is no stored reference; see parity.spec.ts.
 *
 * Both pages are served from the same directory, so each fetches byte-identical data files
 * over identical relative paths.
 *
 * The renderer is SwiftShader and the page is fragment-bound, so a state costs a minute or
 * two whatever we do.
 *
 * It ran on one worker while the gate compared against stored baselines, because contention
 * changed the candidate and not the reference, and a gate that reports a difference because
 * the machine was busy is worse than no gate. Now that both shots are taken back to back
 * inside the same test, load hits them equally and cancels, so the workers are back — which
 * matters, because a full run is the unit of progress here and there are a dozen steps left.
 *
 * PARITY_WORKERS overrides it.
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
    { name: 'boot', testMatch: /boot\.spec\.ts/ },
    { name: 'parity', testMatch: /parity\.spec\.ts/, dependencies: ['boot'] },
  ],
})
