import { defineConfig } from 'vitest/config'

/**
 * The component lane. jsdom is not a browser, so it cannot evaluate
 * `@media (pointer: coarse)`, colour contrast or layout; the keyboard, focus
 * and role assertions here are the part of the accessibility claim jsdom can
 * hold, and the report-only Playwright job is where the rest is checked.
 */
export default defineConfig({
  esbuild: { jsx: 'automatic' },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.tsx', 'test/**/*.test.tsx'],
    setupFiles: ['./test/setup.ts'],
    testTimeout: 20000,
  },
})
