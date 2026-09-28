import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'

/**
 * The site lane: node, no network, the real modules over the real options.
 *
 * `@` is the site's own path mapping, the same one `tsconfig.json` and the
 * bundler use, so a module this lane imports resolves here exactly as it does in
 * the app. Without it a module that addresses its neighbours by the mapping the
 * app uses is unimportable from a test, which is a difference between the two
 * that has no reason to exist.
 */
export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
    testTimeout: 20000,
  },
})
