/**
 * Vitest global setup (ticket 22, review round 2): regenerate the gitignored
 * worker stamp before any test module loads `worker/mcp.ts`, which imports
 * `worker/generated/mcp-data-built.ts`. On a fresh checkout nothing else has
 * produced it — turbo's `test` task only orders upstream `^build`s, not this
 * package's own build — so the tests regenerate it here (single source of
 * truth stays scripts/stamp-mcp-data.mjs, which reads the bundled prism-llms
 * corpus and throws a clear error when that build was skipped).
 *
 * A `pretest` script was rejected deliberately: this repo's .npmrc does not
 * enable pnpm pre/post lifecycle scripts, so it would silently not run.
 */
export default async () => {
  await import('./stamp-mcp-data.mjs');
};
