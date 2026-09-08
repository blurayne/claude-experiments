import { defineConfig } from 'vitest/config'

// Unit tests only. The browser-driven suites are Playwright's (tests/e2e), and mixing the two
// runners in one command hides which layer failed.
export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
    // The pinned pre-refactor page, materialised from git before anything runs: the CSS and
    // shader tests compare against it, and a clean checkout does not have it lying around.
    globalSetup: ['tests/harness/vitest-setup.ts'],
  },
})
