import { defineConfig } from 'vitest/config'

/**
 * The token lane reads the DTCG source and the emitted `dist/` directly, so it
 * runs in plain Node. `pretest` builds the tokens first so the emitted files
 * under test always exist.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.mjs'],
  },
})
