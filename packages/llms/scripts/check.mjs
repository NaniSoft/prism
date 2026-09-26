/**
 * The prism-llms drift gate.
 *
 * Build-fresh: `dist/` is never committed. The gate emits twice into temporary
 * directories and asserts the eight invariants. All eight fail the build,
 * because a stale doc is a lie:
 *
 *  1. coverage: every catalogue item has a prose page and a mirror; every
 *     guide, Foundation and Content page has a mirror
 *  2. the demo self-contained contract
 *  3. cross-references resolve (public runtime exports, `<ComponentDemo>` keys)
 *  4. descriptions and titles are non-empty
 *  5. `data.json` parses through `parsePrismDocsStore` and assigns to
 *     `PrismDocsStore` in a throwaway `tsc` project
 *  6. every `llms.txt` link resolves and every mirror exists
 *  7. determinism: emit twice, byte-compare every file
 *  8. the README's declared output list equals the emitted `dist/` set
 */
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { buildCatalog } from '@nanisoft/prism-ui/catalog'

import { emit } from './build.mjs'
import { validateDemoSource, scanPrismImports } from '../dist/demo-graph.js'
import { parsePrismDocsStore } from '../dist/index.js'

const PKG_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const REPO_ROOT = path.resolve(PKG_ROOT, '..', '..')
const UI_ROOT = path.join(REPO_ROOT, 'packages', 'ui')
const SITE_ROOT = path.join(REPO_ROOT, 'apps', 'site')
const ITEMS_ROOT = path.join(SITE_ROOT, 'items')
const CONTENT_ROOT = path.join(SITE_ROOT, 'content')
const DEMOS_ROOT = path.join(SITE_ROOT, 'src', 'demos')
const WORK = path.join(PKG_ROOT, '.turbo', 'check')
const DIST = path.join(PKG_ROOT, 'dist')
const README = path.join(PKG_ROOT, 'README.md')
const KINDS = ['component', 'block', 'page']
const PAGE_SECTIONS = ['docs', 'foundations', 'content']
const SEGMENT = { component: 'components', block: 'blocks', page: 'pages' }

async function readText(file) {
  try {
    return (await readFile(file, 'utf8')).replace(/\r\n/g, '\n')
  } catch {
    return undefined
  }
}

async function walkFiles(dir, prefix = '') {
  const files = {}
  for (const entry of (await readdir(dir, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name
    if (entry.isDirectory()) Object.assign(files, await walkFiles(path.join(dir, entry.name), rel))
    else files[rel] = await readText(path.join(dir, entry.name))
  }
  return files
}

async function collectDemos() {
  if (!existsSync(DEMOS_ROOT)) return []
  const demos = []
  for (const file of (await readdir(DEMOS_ROOT)).filter((name) => name.endsWith('.tsx')).sort()) {
    const code = await readText(path.join(DEMOS_ROOT, file))
    if (code !== undefined) demos.push({ file: `src/demos/${file}`, code })
  }
  return demos
}

async function itemMdx(item) {
  return readText(path.join(ITEMS_ROOT, item.kind, `${item.slug}.mdx`))
}

/** The throwaway tsc project (invariant 5): the guard plus the type assignment. */
async function validateStoreAgainstType(emitDir) {
  const projectDir = path.join(WORK, 'store-validate')
  await mkdir(projectDir, { recursive: true })
  const dataFile = path.relative(projectDir, path.join(emitDir, 'data.json')).split(path.sep).join('/')
  const libFile = path.relative(projectDir, path.join(PKG_ROOT, 'dist', 'index.js')).split(path.sep).join('/')
  await writeFile(
    path.join(projectDir, 'validate-store.ts'),
    [
      "import { readFileSync } from 'node:fs'",
      `import { parsePrismDocsStore, type PrismDocsStore } from '${libFile}'`,
      '',
      `const raw: unknown = JSON.parse(readFileSync(new URL('${dataFile}', import.meta.url), 'utf8'))`,
      'export const store: PrismDocsStore = parsePrismDocsStore(raw)',
      '',
    ].join('\n'),
  )
  await writeFile(
    path.join(projectDir, 'tsconfig.json'),
    `${JSON.stringify(
      {
        compilerOptions: {
          target: 'es2022',
          module: 'nodenext',
          moduleResolution: 'nodenext',
          strict: true,
          noEmit: true,
          resolveJsonModule: true,
          skipLibCheck: true,
          types: ['node'],
        },
        include: ['validate-store.ts'],
      },
      null,
      2,
    )}\n`,
  )
  const tsc = path.join(PKG_ROOT, 'node_modules', 'typescript', 'bin', 'tsc')
  const result = spawnSync(process.execPath, [tsc, '-p', path.join(projectDir, 'tsconfig.json')], {
    cwd: PKG_ROOT,
    encoding: 'utf8',
  })
  return { ok: result.status === 0, output: `${result.stdout ?? ''}${result.stderr ?? ''}`.trim() }
}

/** The README's declared output list, parsed from the `## Output` code fence. */
async function declaredOutputs() {
  const readme = await readText(README)
  if (readme === undefined) throw new Error('prism-llms: README.md is missing')
  const section = /##\s+Output[\s\S]*?```text\n([\s\S]*?)```/.exec(readme)
  if (!section) throw new Error('prism-llms: README.md has no "## Output" text fence')
  return (section[1] ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
}

function globToRegExp(glob) {
  const escaped = glob
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '\u0000')
    .replace(/\*/g, '[^/]*')
    .replace(/\u0000/g, '.*')
  return new RegExp(`^${escaped}$`)
}

const failures = []
const fail = (invariant, message) => failures.push(`[${invariant}] ${message}`)

const catalogue = buildCatalog()
const byName = new Map(catalogue.map((entry) => [entry.name, entry]))
/** Every public runtime export the checked catalogue promises (gap 7). */
const publicExports = new Set(catalogue.flatMap((entry) => entry.exports))

/* --- 1 + 7: build-fresh emits, byte compare ----------------------------- */

await rm(WORK, { recursive: true, force: true })
const dirA = path.join(WORK, 'a')
const dirB = path.join(WORK, 'b')
let firstEmit
try {
  firstEmit = await emit(dirA)
  await emit(dirB)
} catch (error) {
  console.error(`prism-llms#check: emit failed\n${error.message}`)
  process.exit(1)
}

const snapshotA = await walkFiles(dirA)
const snapshotB = await walkFiles(dirB)
const drift = Object.keys(snapshotA)
  .filter((file) => snapshotA[file] !== snapshotB[file])
  .concat(Object.keys(snapshotB).filter((file) => !(file in snapshotA)))
if (drift.length > 0) fail('determinism', `two builds differ: ${drift.join(', ')}`)

/* --- 1: coverage -------------------------------------------------------- */

for (const item of catalogue) {
  const mdx = await itemMdx(item)
  if (mdx === undefined) fail('coverage', `item '${item.name}' has no apps/site/items/${item.kind}/${item.slug}.mdx`)
  const mirror = `md/${SEGMENT[item.kind]}/${item.slug}.md`
  if (snapshotA[mirror] === undefined) fail('coverage', `item '${item.name}' has no mirror ${mirror}`)
}
for (const section of PAGE_SECTIONS) {
  const dir = path.join(CONTENT_ROOT, section)
  if (!existsSync(dir)) continue
  for (const file of (await readdir(dir)).filter((name) => name.endsWith('.mdx'))) {
    if (file === 'index.mdx') continue
    const slug = file.replace(/\.mdx$/, '')
    if (snapshotA[`md/${section}/${slug}.md`] === undefined) {
      fail('coverage', `page '${section}/${slug}' has no mirror md/${section}/${slug}.md`)
    }
  }
}

/* --- 2: the demo self-contained contract -------------------------------- */

const demos = await collectDemos()
for (const demo of demos) {
  for (const violation of validateDemoSource(demo.code)) {
    fail('demo-contract', `${demo.file}: ${violation.reason}`)
  }
}

/* --- 3: cross-references resolve ---------------------------------------- */

for (const demo of demos) {
  for (const name of scanPrismImports(demo.code)) {
    if (!publicExports.has(name)) {
      fail('cross-refs', `${demo.file} imports '${name}', which is not a public prism-ui runtime export`)
    }
  }
}
for (const item of catalogue) {
  const mdx = await itemMdx(item)
  if (mdx === undefined) continue
  for (const match of mdx.matchAll(/<ComponentDemo\s+([^>]*?)\/>/g)) {
    const slug = /\bslug=["']([^"']+)["']/.exec(match[1] ?? '')?.[1]
    if (!slug || !existsSync(path.join(DEMOS_ROOT, `${slug}.tsx`))) {
      fail('cross-refs', `${item.kind}/${item.slug}.mdx references <ComponentDemo slug="${slug}">, which has no demo file`)
    }
  }
}

/* --- 4: descriptions and titles ----------------------------------------- */

for (const item of firstEmit.store.items) {
  if (!item.description || item.description.trim().length === 0) {
    fail('descriptions', `item '${item.name}' has an empty description`)
  }
}
for (const page of firstEmit.store.pages) {
  if (!page.title || page.title.trim().length === 0) {
    fail('descriptions', `page '${page.url}' has an empty title`)
  }
}

/* --- 5: data.json validates against PrismDocsStore ----------------------- */

try {
  parsePrismDocsStore(JSON.parse(snapshotA['data.json'] ?? ''))
} catch (error) {
  fail('store', `data.json does not parse through parsePrismDocsStore: ${error.message}`)
}
const typeCheck = await validateStoreAgainstType(dirA)
if (!typeCheck.ok) fail('store', `data.json does not assign to PrismDocsStore:\n${typeCheck.output}`)

/* --- 6: llms.txt links and mirror completeness --------------------------- */

const llmsTxt = snapshotA['llms.txt']
if (llmsTxt === undefined) {
  fail('links', 'llms.txt was not emitted')
} else {
  const base = 'https://prism.nanisoft.com'
  const linkPattern = new RegExp(`${base.replace(/\./g, '\\.')}/(${PAGE_SECTIONS.concat(Object.values(SEGMENT)).join('|')})/[\\w.-]+\\.md`, 'g')
  const links = [...new Set(llmsTxt.match(linkPattern) ?? [])]
  for (const link of links) {
    const mirror = `md${link.slice(base.length)}`
    if (snapshotA[mirror] === undefined) fail('links', `llms.txt links ${link}, which has no mirror ${mirror}`)
  }
}
for (const item of firstEmit.store.items) {
  if (snapshotA[`md/${SEGMENT[item.kind]}/${item.slug}.md`] === undefined) {
    fail('links', `item '${item.name}' has no mirror`)
  }
}
for (const page of firstEmit.store.pages) {
  if (snapshotA[`md/${page.section}/${page.slug}.md`] === undefined) {
    fail('links', `page '${page.url}' has no mirror`)
  }
}

/* --- 8: the declared output list equals the emitted dist set ------------- */

try {
  const declared = await declaredOutputs()
  const patterns = declared.map(globToRegExp)
  const actual = existsSync(DIST) ? Object.keys(await walkFiles(DIST)).sort() : []
  if (actual.length === 0) fail('output-list', 'dist/ is empty; run the build before this gate')
  const unexpected = actual.filter((file) => !patterns.some((pattern) => pattern.test(file)))
  const missing = declared.filter((glob) => !actual.some((file) => globToRegExp(glob).test(file)))
  for (const file of unexpected) fail('output-list', `dist/${file} is emitted but not declared in the README`)
  for (const glob of missing) fail('output-list', `the README declares "${glob}" but dist/ has no match`)
} catch (error) {
  fail('output-list', error.message)
}

/* --- verdict ------------------------------------------------------------ */

if (failures.length > 0) {
  console.error(`prism-llms#check: ${failures.length} failure(s)\n\n${failures.join('\n')}`)
  process.exit(1)
}
console.log(
  `prism-llms#check: 8 invariants green - ${firstEmit.store.items.length} items, ` +
    `${firstEmit.store.pages.length} pages, ${Object.keys(snapshotA).length} corpus files`,
)
