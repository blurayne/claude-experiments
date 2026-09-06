import { defineConfig } from 'vitest/config'

// Unit tests only. The browser-driven suites are Playwright's (tests/e2e), and mixing the two
// runners in one command hides which layer failed.
export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
  },
})
