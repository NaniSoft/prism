/**
 * The per-item client-JavaScript budget (ticket 19 section 5, ticket 15).
 *
 * Each emitted `dist/components/ui/<name>.js` plus its Base UI subtree is
 * bundled tree-shaken with esbuild, minified and gzipped. The measurement
 * follows ticket 19's model: React, React DOM, the shared floating engine
 * (`@floating-ui/*`) and the shared class-merge utility (`clsx`,
 * `tailwind-merge`) are the runtime every client component already pays for, so
 * they are excluded from the measured figure. Everything else, including Base
 * UI's own subtree and the icons a component imports, is measured. The script
 * also prints the same aggregate with only React external, so the reader can see
 * the shared runtime's own weight.
 *
 * Two verdicts:
 *
 *   - per item, the gzipped size is compared to ticket 19's budget and
 *     reported. The thresholds are judgements, so an overage prints and does
 *     not fail;
 *   - for a consumer who imports every client component, the total is compared
 *     to the 90 KB gzip ceiling and fails. Shipping a bundle quietly over the
 *     hard ceiling is the failure this gate exists to force.
 *
 * The client roster is checked in both directions: every component that carries
 * `'use client'` must have a budget, and every budget must name a real client
 * component. A new client component therefore cannot ship without a number.
 *
 * Run: pnpm --filter @nanisoft/prism-ui check:client-budget
 */
import { gzipSync } from 'node:zlib'
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const PKG = path.join(HERE, '..')
const DIST = path.join(PKG, 'dist', 'components', 'ui')
const WORK = path.join(PKG, '.turbo', 'client-budget')
const CEILING = 90 * 1024

/** Ticket 19 section 5, in KB. The 13 client components and their budgets. */
const BUDGETS = {
  accordion: 4,
  avatar: 3,
  checkbox: 4,
  dialog: 9,
  'dropdown-menu': 9,
  popover: 6,
  progress: 3,
  'radio-group': 4,
  select: 12,
  slider: 7,
  switch: 3,
  tabs: 5,
  tooltip: 5,
}

async function clientComponents() {
  const names = []
  for (const name of await readdir(DIST)) {
    if (!name.endsWith('.js')) continue
    const source = await readFile(path.join(DIST, name), 'utf8')
    if (/^['"]use client['"]/m.test(source)) names.push(name.replace(/\.js$/, ''))
  }
  return names.sort()
}

/** The runtime every client component already pays for, counted once. */
const SHARED = [
  'react',
  'react-dom',
  'react/*',
  'react-dom/*',
  '@floating-ui/*',
  'clsx',
  'tailwind-merge',
]

/** Bundle one entry tree-shaken and return its gzipped byte size. */
async function measure(entryPoint, external = SHARED) {
  const result = await build({
    entryPoints: [entryPoint],
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'browser',
    target: 'es2022',
    minify: true,
    logLevel: 'silent',
    absWorkingDir: PKG,
    external,
    define: { 'process.env.NODE_ENV': '"production"' },
  })
  const bytes = Buffer.from(result.outputFiles[0].text, 'utf8')
  return gzipSync(bytes).length
}

const kib = (bytes) => `${(bytes / 1024).toFixed(1)} KB`

const clients = await clientComponents()
const missing = clients.filter((name) => !(name in BUDGETS))
const extra = Object.keys(BUDGETS).filter((name) => !clients.includes(name))

const failures = []
if (missing.length) {
  failures.push(
    `client component(s) without a budget: ${missing.join(', ')}. ` +
      'Add a per-item budget to ticket 19 section 5 and to this gate.',
  )
}
if (extra.length) {
  failures.push(`budget(s) naming a component that is not a client component: ${extra.join(', ')}`)
}

await mkdir(WORK, { recursive: true })

let total = 0
const rows = []
for (const name of clients) {
  const bytes = await measure(path.join(DIST, `${name}.js`))
  total += bytes
  const budget = BUDGETS[name]
  rows.push({ name, bytes, budget })
}

// The ceiling is the cost of importing every client component at once, so it is
// measured as one deduplicated bundle rather than the sum of the per-item
// bundles (which would count the shared floating engine thirteen times).
const entry = path.join(WORK, 'all-client.mjs')
await writeFile(
  entry,
  clients
    .map((name) => {
      const rel = path.relative(WORK, path.join(DIST, `${name}.js`)).split(path.sep).join('/')
      return `export * from '${rel}'`
    })
    .join('\n'),
  'utf8',
)
const totalBytes = await measure(entry)
// The same bundle with only React external: the shared floating engine and the
// class-merge utility included, for the record.
const fullBytes = await measure(entry, ['react', 'react-dom', 'react/*', 'react-dom/*'])
await rm(WORK, { recursive: true, force: true })

for (const row of rows) {
  const over = row.bytes > row.budget * 1024
  console.log(
    `  ${over ? '!' : '.'} ${row.name.padEnd(15)} ${kib(row.bytes).padStart(8)}  ` +
      `budget ${String(row.budget).padStart(2)} KB${over ? '  OVER' : ''}`,
  )
}

console.log(`\nclient-budget: ${clients.length} client components`)
console.log(`  per-item sum of individually bundled modules: ${kib(total)} (informational)`)
console.log(`  one deduplicated bundle of all ${clients.length}: ${kib(totalBytes)} (ceiling ${kib(CEILING)})`)
console.log(`  the same bundle with the shared runtime included: ${kib(fullBytes)} (informational)`)

const overBudget = rows.filter((row) => row.bytes > row.budget * 1024)
if (overBudget.length) {
  console.warn(
    `\n${overBudget.length} component(s) over their per-item budget: ` +
      overBudget.map((row) => `${row.name} ${kib(row.bytes)} / ${row.budget} KB`).join(', '),
  )
}

if (totalBytes > CEILING) {
  failures.push(
    `the all-client bundle is ${kib(totalBytes)} gzipped, over the ${kib(CEILING)} ceiling`,
  )
}

if (failures.length) {
  console.error(`\nclient-budget: ${failures.length} failure(s)`)
  for (const failure of failures) console.error(`  - ${failure}`)
  process.exit(1)
}

console.log('\nclient-budget: the all-client bundle is within the 90 KB ceiling')
