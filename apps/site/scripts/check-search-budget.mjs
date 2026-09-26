/**
 * Fails the build when the static search index outgrows its budget.
 *
 * Advanced search mode stores one document per heading and per content block,
 * so its size scales with page length. Ticket 10 sets the tripwire at 300 KiB
 * gzipped, which is headroom over the measured 80 to 227 KiB for 60 synthetic
 * pages and far above this site's real index. The gate exists so a future
 * content explosion forces a decision rather than shipping quietly.
 *
 * Run after `next build`: node scripts/check-search-budget.mjs
 */
import { gzipSync } from 'node:zlib'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const SITE = path.join(HERE, '..')
const OUT = path.join(SITE, 'out')

const BUDGET = 300 * 1024

const candidates = [path.join(OUT, 'api', 'search'), path.join(OUT, 'api', 'search.json')]

let file = null
for (const candidate of candidates) {
  try {
    file = await readFile(candidate)
    break
  } catch {
    // try the next shape
  }
}

if (!file) {
  console.error('search-budget: no static search index found under out/api/')
  process.exit(1)
}

const gzipped = gzipSync(file).length
const kib = (bytes) => `${(bytes / 1024).toFixed(1)} KiB`

console.log(
  `search-budget: ${kib(file.length)} raw, ${kib(gzipped)} gzipped (budget ${kib(BUDGET)})`,
)

if (gzipped > BUDGET) {
  console.error(
    `\nThe search index is over budget. Use simple mode or a hosted index; see ticket 10 section 7.`,
  )
  process.exit(1)
}
