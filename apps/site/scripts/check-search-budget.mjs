/**
 * Fails the build when the static search index outgrows its budget, or when it
 * stops holding the pages it is meant to hold.
 *
 * Advanced search mode stores one document per heading and per content block,
 * so its size scales with page length. Ticket 10 sets the tripwire at 300 KiB
 * gzipped, which is headroom over the measured 80 to 227 KiB for 60 synthetic
 * pages and far above this site's real index. The gate exists so a future
 * content explosion forces a decision rather than shipping quietly. The
 * threshold has not moved: it is the number a reader's browser downloads, and a
 * number that moves with the content stops being a ceiling.
 *
 * **The size check is one of two, and the second is why the first still means
 * something.** The index does not carry every page the site publishes: the
 * Section manifest marks one Section as not searched, and its pages are a dated
 * record of what changed rather than reference material. A budget measured over
 * an index with a hole in it is a budget on the pages that were left, so the
 * gate also compares the set of routes the built index holds against the set the
 * content tree, the Item documentation and the Section manifest say it should
 * hold. The two are compared in both directions, which makes three failures
 * impossible to ship:
 *
 *   - a page the site publishes that the index does not hold, so a reader
 *     searching for reference material finds nothing;
 *   - a route in the index the manifest excludes, so the exclusion is not
 *     actually removing the bytes and the ceiling is being read wrong;
 *   - a Section flipped to not searched without this gate noticing, so the
 *     exclusion cannot widen one Section at a time until the budget always
 *     passes.
 *
 * The expected set is derived from the content tree on disk, never from the
 * module that built the index, because a gate that agrees with the code it
 * checks cannot fail. The extensions and the route rule are the content-join
 * gate's own, and the Item pages are located by the rule every other consumer
 * locates them by, `readItemContent`, with their route taken from the one each
 * document states in its own frontmatter. The surfaces compared are therefore
 * the tree, the documents and the built artefact, with the manifest as the
 * fourth.
 *
 * Run after `next build`: node scripts/check-search-budget.mjs
 */
import { gzipSync } from 'node:zlib'
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { isSearchedRoute, SECTIONS } from '../src/lib/sections.ts'

import { CONTENT_EXTENSIONS, routeForFile } from './content-joins.mjs'
import { readItemContent } from './item-content.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const SITE = path.join(HERE, '..')
const OUT = path.join(SITE, 'out')
const CONTENT_ROOT = path.join(SITE, 'content')
const ITEMS_ROOT = path.join(SITE, 'items')

const BUDGET = 300 * 1024

/** The `slug` an Item's page states in its own frontmatter, which is its route. */
const DECLARED_ROUTE = /^slug:\s*(.+?)\s*$/m

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

/* The routes the built index holds, read out of the artefact itself. */

/**
 * The routes a serialised index holds, read from whichever shape it has.
 *
 * Advanced mode serialises one document per heading and per content block, each
 * naming the page it came from, so the routes are the union of `page_id` over the
 * documents. Simple mode serialises one document per page, addressed by its own
 * id and with no `page_id` at all, so the routes are the document ids.
 *
 * Both shapes are read because the mode is a decision and not a constant: a gate
 * that understood one of them would read zero routes out of the other and pass
 * the size half while proving nothing about coverage, which is the whole reason
 * the coverage half exists. A shape this reader does not recognise is an error,
 * never an empty set.
 *
 * @param {Buffer} bytes the built index
 * @returns {string[]}
 */
function indexedRoutes(bytes) {
  const index = JSON.parse(bytes.toString('utf8'))
  const documents = index?.docs?.docs
  if (documents === null || typeof documents !== 'object') {
    throw new Error(
      'the built index has no documents.docs, so the routes it holds cannot be read and the ' +
        'coverage half of this gate has nothing to compare. Refusing to pass a check it could not run.',
    )
  }

  const byPageId = new Set()
  const byDocumentId = new Set()
  for (const [id, document] of Object.entries(documents)) {
    if (typeof document?.page_id === 'string') byPageId.add(document.page_id)
    // Only a document that carries no page reference is itself a page, so a
    // simple index and the page-shaped document of an advanced one both land
    // here and an advanced heading never does.
    if (document?.page_id === undefined && typeof document?.url === 'string') byDocumentId.add(document.url)
  }

  const routes = byPageId.size > 0 ? byPageId : byDocumentId
  if (routes.size === 0) {
    throw new Error(
      'the built index carries documents but none of them names a page, by `page_id` or by `url`, so the ' +
        'routes it holds cannot be read. The two shapes this gate knows are an advanced index, whose documents ' +
        'name their page, and a simple index, whose documents are pages. Refusing to report zero pages held.',
    )
  }
  return [...routes].sort()
}

/* The routes the index is supposed to hold, read from the tree and the manifest. */

/** Every file under `dir`, depth first and name sorted. */
async function walkFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => [])
  const files = []
  for (const entry of [...entries].sort((a, b) => a.name.localeCompare(b.name))) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) files.push(...(await walkFiles(full)))
    else if (entry.isFile()) files.push(full)
  }
  return files
}

/**
 * Every route the site publishes a content page at, minus the routes the Section
 * manifest excludes from the index.
 *
 * Three sources and no others, because those are the three ways a page gets into
 * the routing tree: a file under `content/`, an Item's own documentation, and a
 * Section's landing page. The landing page is named for all seven Sections
 * because every Section has one, four authored and three generated, and the
 * generated three carry no file here to be found by.
 */
async function expectedRoutes() {
  const routes = new Set()
  for (const file of await walkFiles(CONTENT_ROOT)) {
    if (!CONTENT_EXTENSIONS.some((extension) => file.endsWith(extension))) continue
    const relative = path.relative(CONTENT_ROOT, file).split(path.sep).join('/')
    routes.add(routeForFile(relative))
  }
  for (const item of await readItemContent(ITEMS_ROOT)) {
    const declared = DECLARED_ROUTE.exec((await readFile(item.doc, 'utf8')).replace(/\r\n/g, '\n'))?.[1]
    if (declared === undefined) continue
    routes.add(`/${declared.replace(/^['"]|['"]$/g, '').replace(/^\/+/, '')}`)
  }
  for (const section of SECTIONS) routes.add(`/${section.segment}`)
  return [...routes].filter((route) => isSearchedRoute(route)).sort()
}

const held = indexedRoutes(file)
const expected = await expectedRoutes()
const heldSet = new Set(held)
const expectedSet = new Set(expected)
const missing = expected.filter((route) => !heldSet.has(route))
const unexpected = held.filter((route) => !expectedSet.has(route))

console.log(
  `search-budget: ${kib(file.length)} raw, ${kib(gzipped)} gzipped (budget ${kib(BUDGET)}), ` +
    `${held.length} pages indexed of ${expected.length} expected`,
)

const failed = []

if (gzipped > BUDGET) {
  failed.push(
    'The search index is over budget. Use simple mode or a hosted index; see ticket 10 section 7.',
  )
}

if (missing.length > 0) {
  failed.push(
    `${missing.length} published page(s) the index does not hold, so a reader searching for them ` +
      `finds nothing: ${missing.join(', ')}`,
  )
}

if (unexpected.length > 0) {
  failed.push(
    `${unexpected.length} route(s) the index holds that the Section manifest does not say it should: ` +
      `${unexpected.join(', ')}`,
  )
}

if (failed.length > 0) {
  console.error('')
  for (const finding of failed) console.error(finding)
  console.error('')
  process.exit(1)
}
