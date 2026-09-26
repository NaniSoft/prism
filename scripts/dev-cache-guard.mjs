/**
 * Keeps the docs dev cache honest about the token build.
 *
 * `build.mjs` writes `packages/tokens/dist` in place so it is never absent, which
 * is the right call for a running dev server. But Turbopack resolves
 * `@nanisoft/prism-tokens/dist/*` through the package `exports` map once and caches the result
 * under `apps/site/.next/dev`. When a token change lands, that cached resolution
 * goes stale and every route fails to compile with a CssSyntaxError or
 * "Module not found" — while the files on disk are present and correct, and
 * `node --input-type=module -e "import '@nanisoft/prism-tokens/dist/themes.json'"` resolves
 * fine. Restarting the process does not clear it; only removing the cache does.
 *
 * So: fingerprint the emitted tokens, and drop the dev cache when the fingerprint
 * changes. Scoped to a fingerprint rather than mtimes so a no-op rebuild, or a
 * `git checkout` that rewrites identical content, leaves the cache warm.
 */
import { createHash } from 'node:crypto'
import { readdir, readFile, rm, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = path.join(ROOT, 'packages/tokens/dist')
const DEV_CACHE = path.join(ROOT, 'apps/site/.next/dev')
/**
 * The stamp lives outside DEV_CACHE on purpose. Next clears and rewrites
 * .next/dev whenever its own cache is invalidated, which would delete a stamp kept
 * there and make every subsequent run report "no previous fingerprint" and wipe
 * the cache for nothing. node_modules/.cache survives .next and is already reset
 * by `pnpm clean`.
 */
const STAMP = path.join(ROOT, 'apps/site/node_modules/.cache/tokens-fingerprint')

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) yield* walk(full)
    else yield full
  }
}

async function fingerprint() {
  const hash = createHash('sha256')
  const found = []
  for await (const file of walk(DIST)) found.push(file)
  const files = found.sort()
  for (const file of files) {
    hash.update(path.relative(DIST, file).replace(/\\/g, '/'))
    hash.update(await readFile(file))
  }
  return { digest: hash.digest('hex'), count: files.length }
}

// No tokens built yet: nothing to compare against, and no cache worth clearing.
let current
try {
  current = await fingerprint()
} catch (cause) {
  if (cause.code === 'ENOENT') {
    console.log('dev-cache: tokens/dist missing, skipping (run `pnpm tokens:build`)')
    process.exit(0)
  }
  throw cause
}

const previous = await readFile(STAMP, 'utf8').catch(() => null)

if (previous === current.digest) {
  console.log(`dev-cache: tokens unchanged (${current.count} files), cache warm`)
  process.exit(0)
}

await rm(DEV_CACHE, { recursive: true, force: true })
await mkdir(path.dirname(STAMP), { recursive: true })
await writeFile(STAMP, current.digest, 'utf8')

console.log(
  previous === null
    ? `dev-cache: cleared (no previous fingerprint, ${current.count} token files)`
    : `dev-cache: cleared (tokens changed, ${current.count} files)`,
)
