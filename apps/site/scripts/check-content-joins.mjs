/**
 * The site's content-join gate, and the site's first `check` task.
 *
 * The rest of this restructure is a series of moves that can each lose a content
 * surface without anything complaining. A content file moves and reaches no
 * route. An Item's documentation moves and its Demo stops being found beside it.
 * A Section directory is renamed and every page under it leaves the Corpus. The
 * common shape of all of them is that the build is green, because every one of
 * them fails by omission rather than by error.
 *
 * So this gate asserts the joins between the four things that have to agree:
 * the Catalogue (the one list, read through `buildCatalog()`), the content tree
 * on disk, the Corpus (the `PrismDocsStore` the MCP server reads, consumed
 * rather than re-derived) and the routes the site publishes. The navigation is
 * read from the published export, so it is the navigation a reader gets rather
 * than a list this gate keeps beside it.
 *
 * The assertions live in `content-joins.mjs` and are about joins, not about a
 * directory depth, because the content tree is flat today and nested later in
 * this effort. The test lane proves both shapes.
 *
 * Run: pnpm --filter @nanisoft/site check
 */
import { existsSync } from 'node:fs'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { buildCatalog } from '@nanisoft/prism-ui/catalog'
import { parsePrismDocsStore, STORE_SECTIONS } from '@nanisoft/prism-llms'

import { CONTENT_EXTENSIONS, findContentJoins, routeForFile } from './content-joins.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const SITE = path.join(HERE, '..')
const REPO = path.join(SITE, '..', '..')
const CONTENT_ROOT = path.join(SITE, 'content')
const ITEMS_ROOT = path.join(SITE, 'items')
const DEMOS_ROOT = path.join(SITE, 'src', 'demos')
const APP_ROOT = path.join(SITE, 'src', 'app')
const OUT = path.join(SITE, 'out')
const STORE_FILE = path.join(REPO, 'packages', 'llms', 'dist', 'data.json')

/** The demo an Item's documentation names, which is how a Demo is discovered. */
const DEMO_REFERENCE = /<ComponentDemo\s+[^>]*?slug=["']([^"']+)["']/g
/** A link to another page of this site, which is what a moved page breaks. */
const INTERNAL_LINK = /\]\((\/[^)\s]*)\)/g
/** A navigation element, and the links inside it. */
const NAV_BLOCK = /<nav\b[^>]*>([\s\S]*?)<\/nav>/g
const HREF = /href="([^"]*)"/g

function die(message) {
  console.error(`content-joins: ${message}`)
  process.exit(1)
}

/** Every file under `dir`, depth first and name sorted. */
async function walkFiles(dir) {
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return []
  }
  const files = []
  for (const entry of [...entries].sort((a, b) => a.name.localeCompare(b.name))) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) files.push(...(await walkFiles(full)))
    else if (entry.isFile()) files.push(full)
  }
  return files
}

const isContent = (file) => CONTENT_EXTENSIONS.some((extension) => file.endsWith(extension))
/** A site-root-relative, forward-slashed path, which is what a finding prints. */
const toSite = (file) => path.relative(SITE, file).split(path.sep).join('/')
/** A path below a collection root, forward-slashed, which is what routes use. */
const below = (root, file) => path.relative(root, file).split(path.sep).join('/')

/* The Catalogue, the one list. Never derived from a directory scan. */

const catalogue = buildCatalog()

/* The Corpus, consumed. Never re-derived from the content tree. */

if (!existsSync(STORE_FILE)) {
  die(
    `the Corpus is missing at ${toSite(STORE_FILE)}. ` +
      'Run pnpm --filter @nanisoft/prism-llms build first: this gate reads the corpus rather ' +
      'than rebuilding what it is checking.',
  )
}
const store = parsePrismDocsStore(JSON.parse(await readFile(STORE_FILE, 'utf8')))

/* The content tree, at whatever depth it is at, and its internal links. */

const contentFiles = []
const links = []
for (const file of await walkFiles(CONTENT_ROOT)) {
  if (!isContent(file)) continue
  const withoutExtension = below(CONTENT_ROOT, file).replace(/\.mdx?$/, '')
  const entry = toSite(file)
  contentFiles.push({
    route: routeForFile(withoutExtension),
    file: entry,
    index: path.posix.basename(withoutExtension) === 'index',
  })
  for (const [, href] of (await readFile(file, 'utf8')).matchAll(INTERNAL_LINK)) {
    links.push({ file: entry, href })
  }
}
const contentDirectories = (
  await readdir(CONTENT_ROOT, { withFileTypes: true }).catch(() => [])
)
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort()

/* The Item documentation, and the Demo each one names. */

const itemDocs = []
for (const file of await walkFiles(ITEMS_ROOT)) {
  if (!isContent(file)) continue
  const source = await readFile(file, 'utf8')
  const entry = toSite(file)
  itemDocs.push({
    slug: path.basename(file).replace(/\.mdx?$/, ''),
    file: entry,
    demos: [...source.matchAll(DEMO_REFERENCE)].map((match) => match[1]),
  })
  for (const [, href] of source.matchAll(INTERNAL_LINK)) links.push({ file: entry, href })
}
const demoFiles = (await walkFiles(DEMOS_ROOT))
  .filter((file) => file.endsWith('.tsx'))
  .map((file) => path.basename(file, '.tsx'))
  .sort()

/* The routes the site publishes: the content tree, the App Router, and the
   catalogue's own section landing pages. The section names are read from the
   Corpus, because the Corpus is where the site's segment names are readable
   without this gate keeping a second list of them. */

const routes = new Set(contentFiles.map((entry) => entry.route))
for (const file of await walkFiles(APP_ROOT)) {
  if (path.basename(file) !== 'page.tsx') continue
  const segments = path
    .relative(APP_ROOT, path.dirname(file))
    .split(path.sep)
    .filter((segment) => segment && segment !== '.')
  // A dynamic segment is served by the collections above, not by a file.
  if (segments.some((segment) => segment.startsWith('['))) continue
  routes.add(`/${segments.join('/')}`)
}
for (const item of store.items) {
  routes.add(item.url)
  routes.add(`/${item.url.split('/')[1] ?? ''}`)
}

/* The navigation, as published. */

if (!existsSync(OUT)) {
  die(
    'apps/site/out is missing. Run pnpm --filter @nanisoft/site build first: the gate reads the ' +
      'published navigation, and a navigation that was never published cannot be checked.',
  )
}
const navHrefs = new Set()
let publishedPages = 0
for (const file of await walkFiles(OUT)) {
  if (!file.endsWith('.html')) continue
  publishedPages += 1
  const html = await readFile(file, 'utf8')
  for (const [, body] of html.matchAll(NAV_BLOCK)) {
    for (const [, href] of body.matchAll(HREF)) navHrefs.add(href)
  }
}

/* The joins. */

const findings = findContentJoins({
  catalogue,
  sections: [...STORE_SECTIONS],
  contentDirectories,
  contentFiles,
  links,
  itemDocs,
  demoFiles,
  corpus: {
    items: store.items.map((item) => ({ slug: item.slug, kind: item.kind, url: item.url })),
    pages: store.pages.map((page) => ({
      section: page.section,
      slug: page.slug,
      url: page.url,
      mirror: page.mirror,
    })),
  },
  routes: [...routes],
  navHrefs: [...navHrefs],
})

if (findings.length > 0) {
  console.error(`content-joins: ${findings.length} broken join(s)\n`)
  for (const finding of findings) console.error(`  [${finding.group}] ${finding.message}`)
  console.error('')
  process.exit(1)
}

console.log(
  `content-joins: every join holds - ${catalogue.length} Items, ${contentFiles.length} content ` +
    `files, ${store.pages.length} Corpus pages, ${routes.size} routes, ${navHrefs.size} ` +
    `navigation links across ${publishedPages} published pages`,
)
