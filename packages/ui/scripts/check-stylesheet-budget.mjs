/**
 * Stylesheet budget gate (Mission Gate K).
 *
 * The one stylesheet a consumer imports is `dist/styles.css`. Size is a
 * contract: the tree-shaken JS budget already caps the all-client bundle at
 * 384 KB gzip, and fonts are priced at 150 KiB per weight. The CSS needs a
 * number a pack change cannot quietly double. The ceiling is 160 KB on disk:
 * the emitted sheet measures about 139.7 KB today (139,700 bytes), so this is
 * headroom rather than the measurement itself.
 *
 * `PRISM_CSS_DIST` redirects the artifact so the suite can stage a fixture.
 *
 * Run: pnpm --filter @nanisoft/prism-ui check:stylesheet-budget
 */
import { existsSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

const NAME = 'stylesheet-budget'
const HERE = path.dirname(fileURLToPath(import.meta.url))
const PKG = path.join(HERE, '..')

const EMITTED = process.env.PRISM_CSS_DIST
  ? path.resolve(process.env.PRISM_CSS_DIST)
  : path.join(PKG, 'dist', 'styles.css')

const CEILING = 160 * 1024

if (!existsSync(EMITTED)) {
  console.error(`${NAME}: ${path.relative(PKG, EMITTED) || EMITTED} does not exist; build the package first`)
  process.exit(1)
}

const bytes = statSync(EMITTED).size
const gzip = gzipSync(readFileSync(EMITTED)).length
const kib = (n) => `${(n / 1024).toFixed(1)} KB`

console.log(`${NAME}: dist/styles.css ${kib(bytes)} on disk, ${kib(gzip)} gzip, ceiling ${kib(CEILING)}`)

if (bytes > CEILING) {
  console.error(`error dist/styles.css is ${kib(bytes)}, over the ${kib(CEILING)} ceiling`)
  console.error(`  Retune the tokens or tree-shake the utilities; do not raise the ceiling without a maintainer decision.`)
  process.exit(1)
}
console.log(`${NAME}: the one stylesheet fits its ceiling.`)
