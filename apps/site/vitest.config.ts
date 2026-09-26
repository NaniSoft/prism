import { defineConfig } from 'vitest/config'

/** The site Worker lane: node, no network, the real handler over the bundle. */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
    testTimeout: 20000,
  },
})
