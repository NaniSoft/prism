import next from 'eslint-config-next'

/**
 * Flat config, because `next lint` no longer exists.
 *
 * Next 16 removed the `next lint` command, so `pnpm lint` was invoking a binary
 * that is not there and failing before it read a single file. ESLint is now run
 * directly against this config, which is what `next lint` used to do for you.
 *
 * Scope is this app only. The registry under `packages/` is a separate workspace
 * with its own build gates, and linting it from here would resolve its imports
 * against this app's tsconfig, so it is excluded rather than half-checked.
 *
 * `apps/site/src/generated` is machine output, regenerated on every predev,
 * prebuild and pretypecheck by `analyze-blocks.mjs` and gitignored. Linting it
 * would report on a file no one edits.
 */
const config = [
  {
    ignores: ['.next/**', 'node_modules/**', 'src/generated/**', 'next-env.d.ts'],
  },
  ...next,
]

export default config
