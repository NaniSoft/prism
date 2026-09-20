import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  // The site tsconfig sets jsx: 'preserve' (Next's requirement); vitest must
  // transform JSX itself. Vite 8's transformer is oxc (config key `oxc`).
  oxc: {
    jsx: { runtime: 'automatic' },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    // globals: registers RTL's automatic cleanup between tests.
    globals: true,
    // Regenerates the gitignored worker stamp before anything imports
    // worker/mcp.ts — the /mcp tests cannot assume a build ran first.
    globalSetup: './scripts/vitest.global-setup.mjs',
  },
});
