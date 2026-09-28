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
 *   - for a consumer who imports every client module, the total is compared
 *     to the one all-client gzip ceiling and fails. Shipping a bundle quietly
 *     over the hard ceiling is the failure this gate exists to force.
 *
 * The client roster is the WHOLE emitted tree, and every file in it is
 * classified. The previous roster was two directory names, `dist/components/ui`
 * and `dist/provider`, and the emitted tree is 93 modules. So 53 modules sat
 * outside a 92 KB ceiling that called itself a ceiling on all client JavaScript,
 * and 7 of those carried `'use client'`. A consumer imports `blocks/site-header`
 * and `pages/docs-shell`; neither path is in the two directories, so the number a
 * consumer feels was not the number the gate measured, and the success line said
 * "read across 2 roster directories" which a reader takes as coverage.
 *
 * A file is classified by what it is, not by where it lives, because the old
 * defect was positional: `provider` had been added by hand as a second directory
 * to catch one module, which is exactly how a subset comes to be called a total.
 * **A file no classification names fails the build**, which is what makes an
 * unwritten exclusion impossible: you cannot widen the measured set by saying
 * nothing. Every exclusion prints on every run with its reason, because a rule
 * that fires on nothing is indistinguishable from a rule that found nothing to
 * say.
 *
 * Run: pnpm --filter @nanisoft/prism-ui check:client-budget
 */
import { gzipSync } from 'node:zlib'
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const PKG = path.join(HERE, '..')
const DIST = path.join(PKG, 'dist')
/**
 * The scratch directory is under the package and not in the system temp
 * directory, because esbuild resolves an entry point's relative specifiers
 * against the entry file and a path crossing drive roots on Windows resolves to
 * a bare name. The failure is a syntax error on the generated import line, which
 * reads like a parse fault rather than a path fault.
 */
const WORK_PARENT = path.join(PKG, '.turbo')

/**
 * The one all-client ceiling, in bytes gzip, over every client module the package
 * emits.
 *
 * The whole-tree client bundle measures 108.0 KB. The ceiling is 116 KB, about
 * 7% headroom.
 *
 * The previous figure was 92 KB against a two-directory roster, and it left 0.3 KB
 * of slack. **A ceiling with a third of a kilobyte of headroom is not a policy, it
 * is a pin:** it fails on an unrelated dependency bump and teaches everyone to
 * answer by rerunning it with a bigger number. The 16 KB of new headroom is not
 * new weight. It is weight that was always shipping, in 53 modules the roster did
 * not read, so the honest response to a ceiling that was measuring a subset is to
 * state the real number rather than keep the flattering one.
 *
 * **The number is a policy judgement and not a derivation**, and the gate says so
 * on every run, because a single ceiling means the first surface to grow is paid
 * for by headroom the other surfaces never use. A landing page and a dashboard
 * never import each other, so a ceiling per surface is four numbers that each
 * flatter their own half. The per-surface breakdown prints for exactly this
 * reason: so the trade-off the one number makes stays visible rather than being
 * discovered by whoever hits it.
 */
const CEILING = 116 * 1024

/**
 * Ticket 19 section 5, in KB: the Components, and their per-item budgets.
 *
 * These are report-only. They were set when the roster was one directory of
 * Components, they are judgements rather than derivations, and a judgement that
 * fails a build becomes a ratchet nobody re-reads. They stay, because a printed
 * comparison against a stated number is what lets someone notice growth, and they
 * do not gate because the one hard number in this gate is the all-client ceiling.
 *
 * The Blocks and Pages are not listed here, and that is deliberate rather than an
 * oversight. A Block is a composition of Components, so its per-item figure is
 * mostly its Components' figures again: budgeting it separately would state the
 * same weight twice and read as two independent facts. Their cost is inside the
 * one deduplicated bundle, which is the number that gates.
 */
const BUDGETS = {
  accordion: 4,
  avatar: 3,
  checkbox: 4,
  dialog: 9,
  'dropdown-menu': 9,
  popover: 6,
  progress: 3,
  'live-region': 1,
  tree: 2,
  provider: 2,
  'radio-group': 4,
  select: 12,
  slider: 7,
  switch: 3,
  tabs: 5,
  tooltip: 5,
}

/**
 * Client modules that are deliberately unbudgeted, each with its reason, printed
 * on every run.
 *
 * A per-item budget is a Component's own weight. A Block, a Page and a barrel
 * have no weight of their own: a Block composes Components, a Page composes
 * Blocks, and a barrel re-exports. Naming a figure for one of those states the
 * same bytes twice and reads as corroboration. Their cost is in the one
 * deduplicated bundle below, which is the number that gates.
 */
const UNBUDGETED = [
  // The key is `test` and not `match`, because `Array.prototype.find` gives a
  // predicate the element as its first argument and `rule.match` reads as a
  // method on the rule while the pattern is what is being called. Named so the
  // next reader does not have to work that out.
  {
    test: /^(blocks|pages)\//,
    reason: 'a Block composes Components and a Page composes Blocks, so its own figure restates theirs',
  },
  {
    // A barrel is excluded by kind, not by path, so it is never a client entry
    // point and this rule is a belt to the braces rather than the mechanism.
    // It is here so the reason is stated if the classification ever changes.
    test: /(^|\/)index\.js$/,
    reason: 'a barrel re-exports; it carries no implementation',
  },
  {
    test: /^components\/ui\/(badge|breadcrumb|button|card)\.js$/,
    reason: 'a presentational Component with no directive and no client dependency: it costs a few hundred bytes and a per-item figure for it is noise',
  },
  {
    test: /^provider\/theme-script\.js$/,
    reason: 'the boot script is priced in raw bytes by check-boot-budget.mjs, because it runs before paint and is not a bundle',
  },
]

/**
 * The classification, one per kind of file the package emits, and the exclusions
 * with their reasons, printed on every run.
 *
 * The types and the source maps are the exclusion that matters and it was never
 * stated before: 186 `.d.ts` and `.d.ts.map` files plus a `.tsbuildinfo` are
 * 160.6 KB gzip of the emitted tree and are not JavaScript a browser runs. Excluding
 * them is a decision, so it is declared as one and printed, rather than living in
 * a `readdir` filter where a reader cannot see it and a future file kind falls
 * through it silently.
 */
const EXCLUSIONS = [
  {
    match: (rel) => rel.endsWith('.d.ts') || rel.endsWith('.d.ts.map'),
    reason: 'a type declaration or its map: not JavaScript a browser runs, and 160.6 KB gzip of the emitted tree',
  },
  {
    match: (rel) => rel.endsWith('.tsbuildinfo'),
    reason: "TypeScript's own incremental-build cache: it is an input to a later build, not an output of this one",
  },
  {
    // The face is not JavaScript and it is not a module: it is 70.7 KB of font
    // binary that a browser fetches over the network, once, and that no bundler
    // inlines. It is a real cost to a consumer and it is priced in its own budget
    // (check-typeface.mjs reads the licence and the @font-face sources), so
    // excluding it here is not a way of losing it. Counting it as a module would
    // be a worse lie, because gzipping a woff2 measures nothing a reader pays.
    match: (rel) => /^fonts\//.test(rel),
    reason: 'the face and its licence: 70.7 KB of binary fetched over the network, priced by check-typeface.mjs and not by this gate',
  },
]

/**
 * Every emitted file, classified. `null` is a file no classification names, and
 * the caller fails on it.
 */
async function classifyTree() {
  const rows = []
  const walk = async (dir) => {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        await walk(file)
        continue
      }
      const rel = path.relative(DIST, file).split(path.sep).join('/')
      const excluded = EXCLUSIONS.find((rule) => rule.match(rel))
      if (excluded) {
        rows.push({ rel, kind: 'excluded', reason: excluded.reason, bytes: (await readFile(file)).length })
        continue
      }
      if (rel === 'styles.css') {
        // Classified here rather than excluded, because the stylesheet has its
        // own budget in its own unit and a separate table. Calling it a
        // classification is the honest description: it is in the emitted tree,
        // it is measured, and this gate is the one that measures it.
        rows.push({ rel, kind: 'stylesheet', reason: null, bytes: (await readFile(file)).length })
        continue
      }
      if (!rel.endsWith('.js')) {
        rows.push({ rel, kind: null, reason: null, bytes: (await readFile(file)).length })
        continue
      }
      const source = await readFile(file, 'utf8')
      rows.push({ rel, file, source, bytes: (await readFile(file)).length, kind: kindOf(rel, source) })
    }
  }
  await walk(DIST)
  return rows.sort((a, b) => a.rel.localeCompare(b.rel))
}

/** What a JavaScript module IS, by content. A directory is not a category. */
function kindOf(rel, source) {
  if (rel === 'styles.css') return 'stylesheet'
  // A barrel re-exports; it carries no implementation, and a consumer that
  // imports it pays for everything behind it.
  if (/(^|\/)index\.js$/.test(rel) || rel === 'index.js') return 'barrel'
  if (/^lib\//.test(rel)) return 'library'
  if (/^['"]use client['"]/m.test(source)) return 'client'
  // A module that reaches into a client surface pulls client code into the
  // consumer's graph, so it is a client cost even though it is not itself client.
  if (/from\s+['"][^'"]*(?:components\/ui|provider|blocks\/|pages\/|theming)/.test(source)) {
    return 'client-adjacent'
  }
  return 'server'
}

/**
 * The client entry points: every module a consumer can import that carries client
 * code, whether it declares the directive itself or reaches a module that does.
 */
function clientEntries(rows) {
  return rows.filter((row) => row.kind === 'client' || row.kind === 'client-adjacent')
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

const tree = await classifyTree()
const failures = []

// An unclassified file is a failure, and that is the whole point of walking the
// tree rather than listing directories. The roster used to be two names, and a
// module in a third place was invisible rather than refused.
const unclassified = tree.filter((row) => row.kind === null)
if (unclassified.length > 0) {
  failures.push(
    `emitted file(s) no classification names: ${unclassified.map((r) => r.rel).join(', ')}. ` +
      'Add a classification to this gate rather than an exclusion somewhere else, so the ' +
      'measured set cannot be widened by saying nothing.',
  )
}

const clients = clientEntries(tree)
// A per-item budget is a Component's own weight, so it is keyed by the bare
// component name and a Block or a Page is deliberately unbudgeted with a stated
// reason rather than an unstated gap.
const nameOf = (rel) => rel.replace(/\.js$/, '').split('/').pop()
const unbudgetedReason = (rel) => UNBUDGETED.find((rule) => rule.test.test(rel))?.reason ?? null
const budgetable = clients.filter((entry) => unbudgetedReason(entry.rel) === null)
const names = budgetable.map((entry) => nameOf(entry.rel))
const missing = [...new Set(names.filter((name) => !(name in BUDGETS)))]
const extra = Object.keys(BUDGETS).filter((name) => !names.includes(name))

if (missing.length) {
  failures.push(
    `Component(s) without a per-item budget: ${missing.join(', ')}. ` +
      'Add a budget to BUDGETS, or a reason to UNBUDGETED if it has no weight of its own.',
  )
}
if (extra.length) {
  failures.push(`budget(s) naming a module that is not a budgetable client Component: ${extra.join(', ')}`)
}

await mkdir(WORK_PARENT, { recursive: true })
const WORK = await mkdtemp(path.join(WORK_PARENT, 'client-budget-'))

let total = 0
const rows = []
for (const entry of budgetable) {
  const bytes = await measure(entry.file)
  total += bytes
  rows.push({ name: nameOf(entry.rel), rel: entry.rel, bytes, budget: BUDGETS[nameOf(entry.rel)] })
}

// The ceiling is the cost of importing every client module at once, so it is
// measured as one deduplicated bundle rather than the sum of the per-item bundles
// (which would count the shared floating engine once per component).
const entry = path.join(WORK, 'all-client.mjs')
const specifier = (file) => {
  const rel = path.relative(WORK, file).split(path.sep).join('/')
  return rel.startsWith('.') ? rel : `./${rel}`
}
await writeFile(
  entry,
  clients.map((e) => `export * from '${specifier(e.file)}'`).join('\n'),
  'utf8',
)
const totalBytes = await measure(entry)
// The same bundle with only React external: the shared floating engine and the
// class-merge utility included, for the record.
const fullBytes = await measure(entry, ['react', 'react-dom', 'react/*', 'react-dom/*'])
await rm(WORK, { recursive: true, force: true })

// The per-surface breakdown, printed on every run. It is here because the one
// ceiling is a policy judgement and a policy nobody can see the consequences of is
// a policy that gets re-litigated by whoever hits it. The figures are the raw
// module sizes and they deliberately do NOT sum to the bundle: a shared helper
// appears in whichever surface emitted it and the deduplicated bundle counts it
// once, so a breakdown that added up would be a breakdown measuring something
// else.
console.log('\nper-surface, raw module gzip. These do not sum to the bundle and must not:')
const bySurface = new Map()
for (const entry of clients) {
  const top = entry.rel.split('/')[0] === 'index.js' ? '(root)' : entry.rel.split('/')[0]
  const at = bySurface.get(top) ?? { count: 0, gz: 0 }
  at.count += 1
  at.gz += gzipSync(Buffer.from(entry.source, 'utf8')).length
  bySurface.set(top, at)
}
for (const [surface, at] of [...bySurface].sort((a, b) => b[1].gz - a[1].gz)) {
  console.log(`  ${surface.padEnd(14)} ${String(at.count).padStart(3)} module(s)  ${kib(at.gz).padStart(9)} gzip`)
}

console.log('\nper-item, against the report-only budget in this gate:')
for (const row of rows) {
  const over = row.bytes > row.budget * 1024
  console.log(
    `  ${over ? '!' : '.'} ${row.name.padEnd(15)} ${kib(row.bytes).padStart(8)}  ` +
      `budget ${String(row.budget).padStart(2)} KB${over ? '  OVER' : ''}`,
  )
}

console.log(`\nclient-budget: the whole emitted tree, ${tree.length} file(s), every one classified`)
console.log(`  exclusions, printed on every run so one that fires on nothing is arguable:`)
for (const rule of EXCLUSIONS) {
  const hit = tree.filter((r) => r.kind === 'excluded' && rule.match(r.rel)).length
  console.log(`    ${hit} file(s): ${rule.reason}`)
}
console.log(`  ${clients.length} client entry point(s) of ${tree.filter((r) => r.kind !== 'excluded').length} classified module(s)`)
console.log(`  ${budgetable.length} budgetable Component(s); ${clients.length - budgetable.length} client module(s) with no per-item budget, each for a stated reason:`)
for (const rule of UNBUDGETED) {
  const hit = clients.filter((e) => rule.test.test(e.rel)).length
  console.log(`    ${hit} file(s): ${rule.reason}`)
}
console.log(`  per-item sum of individually bundled modules: ${kib(total)} (informational)`)
console.log(`  one deduplicated bundle of all ${clients.length}: ${kib(totalBytes)} (ceiling ${kib(CEILING)})`)
console.log(`  the same bundle with the shared runtime included: ${kib(fullBytes)} (informational)`)
console.log('  the ceiling is a policy judgement and not a derivation: a landing page and a dashboard never')
console.log('  import each other, so the first to grow is paid for by headroom the other never uses.')

const overBudget = rows.filter((row) => row.bytes > row.budget * 1024)
if (overBudget.length) {
  console.warn(
    `\n${overBudget.length} module(s) over their per-item budget: ` +
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

// Derived from the constant, never restated. A hardcoded figure here is a positive
// claim that stops being true the day the ceiling moves, and it is printed on the
// passing run, which is the run nobody reads carefully.
console.log(
  `\nclient-budget: the whole-tree client bundle is within the ${kib(CEILING)} ceiling, ` +
    `measured over ${clients.length} entry point(s) from ${tree.length} classified file(s)`,
)
