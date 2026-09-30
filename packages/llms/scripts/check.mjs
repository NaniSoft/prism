/**
 * The prism-llms drift gate.
 *
 * Build-fresh: `dist/` is never committed. The gate emits twice into temporary
 * directories and asserts the eight invariants. All eight fail the build,
 * because a stale doc is a lie:
 *
 *  1. coverage: every catalogue item has a prose page and a mirror; every
 *     content page, at any depth in its Section, has a mirror
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

import { STORE_KINDS } from '../dist/store.js'
import { fileURLToPath } from 'node:url'

import { buildCatalog } from '@nanisoft/prism-ui/catalog'

import { readItemContent } from '../../../apps/site/scripts/item-content.mjs'
import { collectContentPages, emit } from './build.mjs'
import { validateDemoSource, scanPrismImports } from '../dist/demo-graph.js'
import { parsePrismDocsStore, STORE_SECTIONS } from '../dist/index.js'

const PKG_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const REPO_ROOT = path.resolve(PKG_ROOT, '..', '..')
const UI_ROOT = path.join(REPO_ROOT, 'packages', 'ui')
const SITE_ROOT = path.join(REPO_ROOT, 'apps', 'site')
const ITEMS_ROOT = path.join(SITE_ROOT, 'items')
const CONTENT_ROOT = path.join(SITE_ROOT, 'content')
const WORK = path.join(PKG_ROOT, '.turbo', 'check')
const DIST = path.join(PKG_ROOT, 'dist')
const README = path.join(PKG_ROOT, 'README.md')
/**
 * The Kinds and where each is published.
 *
 * `KINDS` is read from the **built** store rather than written out. It was a
 * literal, and a literal is a second list about the same three kinds: the fourth
 * Kind landed and this gate reported two failures about a mirror path of
 * `undefined`, which is what a hand-written list does when a Kind is added and it is
 * not. Read from `dist/store.js` rather than `src/store.ts` because this is a `.mjs`
 * script and cannot import TypeScript, and the built module is the same declaration
 * with the `_KindsMatch` assertion already checked against the catalogue.
 *
 * `SEGMENT` is a genuine second fact, not a second list: the union does not say
 * where a Kind is published, and a Kind whose segment is derived from its own name
 * is the `live` case, which is singular at both ends.
 */
const KINDS = [...STORE_KINDS]
const SEGMENT = { component: 'components', block: 'blocks', page: 'pages', live: 'live' }

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

/**
 * Where every Item's documentation and its Demo are, read by the site's own rule
 * rather than by a path restated here. There is one place either can sit, so
 * every Demo is covered: the one beside the documentation it documents.
 */
const itemContent = await readItemContent(ITEMS_ROOT)
const contentBySlug = new Map(itemContent.map((item) => [item.slug, item]))

/** Every Demo in the tree, for the self-contained contract and the imports. */
async function collectDemos() {
  const demos = []
  for (const item of itemContent) {
    if (item.demo === null) continue
    const code = await readText(item.demo)
    if (code !== undefined) {
      demos.push({ file: path.relative(SITE_ROOT, item.demo).split(path.sep).join('/'), code })
    }
  }
  return demos
}

async function itemMdx(item) {
  const found = contentBySlug.get(item.slug)
  return found ? readText(found.doc) : undefined
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

/**
 * Every public runtime export `@nanisoft/prism-ui` publishes, read from the
 * package's own `exports` map rather than from the catalogue alone.
 *
 * **The catalogue was the whole population and it was short by a subpath.** This
 * set was `catalogue.flatMap((entry) => entry.exports)`, which names the
 * Components, Blocks and Pages and nothing else, so the three exports the
 * `./provider` subpath publishes were invisible to it: `PrismProvider`,
 * `usePrismTheme` and `PrismThemeScript`. A Demo that mounted the provider, which
 * is the only way to preview a Component that needs one, was reported as importing
 * something that is not public. It is public, and the report was wrong.
 *
 * The fix reads the manifest and the emitted declarations rather than adding the
 * three names, because a hand-list here is exactly the second list this
 * repository's own conventions warn about: it would be correct until the next
 * subpath or the next export, and nothing would say so. `PUBLIC_EXPORTS` is
 * derived, so a new subpath is covered the moment the manifest declares it.
 *
 * Type-only exports are excluded, for the reason the surface gate gives: a `type`
 * is not a runtime export and a Demo importing one is importing something that
 * does not exist at run time.
 */
const publicExports = new Set(catalogue.flatMap((entry) => entry.exports))
for (const name of await providerRuntimeExports()) publicExports.add(name)

/**
 * The runtime exports on the manifest's non-Item subpaths, read from the emitted
 * declarations each one resolves to.
 *
 * `./components/*`, `./blocks/*` and `./pages/*` are the Items the catalogue
 * already names, so they are not read again; what is missing is everything the
 * manifest publishes beside them, which today is the provider and the theming
 * vocabulary. A subpath whose declarations cannot be read is reported rather than
 * skipped, because a set that quietly loses a subpath is the same silent gap this
 * whole mechanism exists to close.
 */
async function providerRuntimeExports() {
  const manifestPath = path.join(REPO_ROOT, 'packages', 'ui', 'package.json')
  const manifest = JSON.parse((await readFile(manifestPath, 'utf8')).replace(/^\uFEFF/, ''))
  const names = []

  for (const [subpath, target] of Object.entries(manifest.exports)) {
    if (typeof target === 'string') continue
    if (subpath.includes('*')) continue
    const declaration = target.types ?? target.default
    if (typeof declaration !== 'string' || !declaration.endsWith('.d.ts')) continue
    const file = path.join(REPO_ROOT, 'packages', 'ui', declaration)
    let source
    try {
      source = await readFile(file, 'utf8')
    } catch (cause) {
      fail(
        'cross-refs',
        `the "${subpath}" subpath of @nanisoft/prism-ui publishes ${declaration}, which this check could not ` +
          `read, so its runtime exports are not in the set a Demo is measured against. ${cause.message}`,
      )
      continue
    }
    for (const match of source.matchAll(
      /export\s+(?:declare\s+)?(?:function|const|class|let|var)\s+([A-Za-z0-9_$]+)/g,
    )) {
      const name = match[1]
      if (name !== undefined) names.push(name)
    }
    for (const match of source.matchAll(/export\s*\{([^}]*)\}/g)) {
      for (const part of (match[1] ?? '').split(',')) {
        const name = part.trim().split(/\s+as\s+/).pop()?.trim()
        if (name && name !== 'default' && !/^type\s/.test(part.trim())) names.push(name)
      }
    }
  }
  return names
}

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
  if (mdx === undefined) {
    fail('coverage', `item '${item.name}' has no documentation file in apps/site/items`)
  }
  const mirror = `md/${SEGMENT[item.kind]}/${item.slug}.md`
  if (snapshotA[mirror] === undefined) fail('coverage', `item '${item.name}' has no mirror ${mirror}`)
}
for (const page of await collectContentPages(CONTENT_ROOT, STORE_SECTIONS)) {
  if (snapshotA[page.mirrorPath] === undefined) {
    fail('coverage', `the content page ${page.route} has no mirror ${page.mirrorPath}`)
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
    // The Demo a document names must be the Demo beside it, which is the join
    // this gate now reads rather than a lookup in the flat demo root: a Demo
    // left behind when its documentation moved would satisfy the old check and
    // render the Item from a second directory.
    const found = contentBySlug.get(item.slug)
    if (!slug || found === undefined || found.demo === null) {
      fail(
        'cross-refs',
        `${item.kind}/${item.slug}.mdx references <ComponentDemo slug="${slug}">, which has no demo beside its documentation`,
      )
    } else if (slug !== item.slug) {
      fail(
        'cross-refs',
        `${item.kind}/${item.slug}.mdx references <ComponentDemo slug="${slug}">, which is the Demo of another Item`,
      )
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
  // The path segment allows `/` because a page nested in its Section is linked
  // by its full tree path, not by its file name.
  const linkPattern = new RegExp(`${base.replace(/\./g, '\\.')}/(${STORE_SECTIONS.concat(Object.values(SEGMENT)).join('|')})/[\\w./-]+\\.md`, 'g')
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
