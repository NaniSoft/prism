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
 * than a list this gate keeps beside it, and it is read as a tree rather than as
 * a list of hrefs, so a Category group a reader can see is a group the gate can
 * check.
 *
 * The assertions live in `content-joins.mjs` and are about joins, not about a
 * directory depth, because the content tree is flat today and nested later in
 * this effort. The test lane proves both shapes.
 *
 * An Item's documentation and its Demo are located by `item-content.mjs`, the
 * rule the demo generator and the corpus builder read, so a Demo left behind in
 * a second directory when its documentation moved is a finding here rather than
 * a green build.
 *
 * The route a document states in its own frontmatter is read here too, because a
 * document and the Corpus have to agree about a published address and this is the
 * one place both are read. An Item is filed under its Kind and its Category while
 * it is published at its Section, so the document says which one it is, and a
 * document that says something else is a route no agent holding a cached index can
 * resolve.
 *
 * The Changelogs Section adds the joins the reference design system has no gate
 * for. A published package holding a changelog and no route is a finding, and so
 * is a route whose bytes are not the package's bytes, and so is a hand-authored
 * page in the Section, an index that does not link a published package, and a
 * Corpus carrying a changelog no package claims. The packages are discovered from
 * the workspace through the same rule the copy step reads, so this gate cannot
 * end up agreeing with a list nobody checks against the workspace.
 *
 * Run: pnpm --filter @nanisoft/site check
 */
import { existsSync } from 'node:fs'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { buildCatalog } from '@nanisoft/prism-ui/catalog'
import { parsePrismDocsStore, STORE_SECTIONS } from '@nanisoft/prism-llms'

import { CONTENT_EXTENSIONS, findContentJoins, parseNav, routeForFile, routeOfHref } from './content-joins.mjs'
import { readItemContent } from './item-content.mjs'
import { CHANGELOG_SECTION, readPublishedChangelogs, splitChangelog } from './published-packages.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const SITE = path.join(HERE, '..')
const REPO = path.join(SITE, '..', '..')
const CONTENT_ROOT = path.join(SITE, 'content')
const CHANGELOG_ROOT = path.join(CONTENT_ROOT, CHANGELOG_SECTION)
const ITEMS_ROOT = path.join(SITE, 'items')
const APP_ROOT = path.join(SITE, 'src', 'app')
const OUT = path.join(SITE, 'out')
const STORE_FILE = path.join(REPO, 'packages', 'llms', 'dist', 'data.json')

/** The demo an Item's documentation names, which is how a Demo is claimed. */
const DEMO_REFERENCE = /<ComponentDemo\s+[^>]*?slug=["']([^"']+)["']/g
/** A link to another page of this site, which is what a moved page breaks. */
const INTERNAL_LINK = /\]\((\/[^)\s]*)\)/g
/** The `slug` an Item's page states in its frontmatter, which is its route. */
const DECLARED_ROUTE = /^slug:\s*(.+?)\s*$/m

/**
 * The route a document states in its frontmatter, or null when it states none.
 *
 * Read from the document's own bytes, and normalised, because a document is
 * content rather than a data file and a hand-edited one arrives with whatever
 * line endings the editor wrote. The leading slash is added here so the value is
 * the route a reader is addressed by, which is the form the Corpus advertises and
 * therefore the form the two are compared in.
 */
function declaredRoute(source) {
  const declared = DECLARED_ROUTE.exec(source.replace(/\r\n/g, '\n'))?.[1]?.replace(/^['"]|['"]$/g, '')
  return declared ? `/${declared.replace(/^\/+/, '')}` : null
}

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

/* The Item documentation, and the Demo each one is found beside. */

/**
 * The documentation tree, read by the same rule the demo generator and the
 * corpus builder read, so the gate cannot disagree with either of them about
 * where an Item's documentation or its Demo is. A Demo left behind in a second
 * directory when a document moved is exactly the failure the rule refuses to
 * paper over, and this is where that refusal becomes a finding.
 */
const itemContent = await readItemContent(ITEMS_ROOT)
const itemDocs = []
for (const item of itemContent) {
  const entry = toSite(item.doc)
  const source = await readFile(item.doc, 'utf8')
  itemDocs.push({
    slug: item.slug,
    kind: item.kind,
    file: entry,
    group: item.group,
    route: declaredRoute(source),
    demo: item.demo === null ? null : path.basename(item.demo, '.tsx'),
    demos: [...source.matchAll(DEMO_REFERENCE)].map((match) => match[1]),
  })
  for (const [, href] of source.matchAll(INTERNAL_LINK)) links.push({ file: entry, href })
}
/**
 * Every Demo in the tree, read from the documentation tree itself rather than
 * from the folders that happen to hold a document, so a Demo filed anywhere the
 * rule does not expect one is a finding rather than a file the gate stopped
 * looking for. There is one place a Demo can sit, so this is the whole set.
 */
const demoFiles = new Set(
  (await walkFiles(ITEMS_ROOT))
    .filter((file) => file.endsWith('.tsx'))
    .map((file) => path.basename(file, '.tsx')),
)

/* The Changelogs Section: the published packages, the generated routes, and
   the authored index that links them. ---------------------------------------- */

/**
 * The published packages that owe the site a route, discovered from the
 * workspace by the rule the copy step reads rather than listed here. Listing them
 * in this gate would make the gate agree with a list nobody checks against the
 * workspace, which is the same second list the discovery exists to remove.
 */
const changelogPackages = (await readPublishedChangelogs(REPO)).map((entry) => ({
  package: entry.name,
  route: entry.route,
  file: entry.changelog,
  text: entry.text,
}))

/**
 * Every generated changelog file on the content tree, and its bytes.
 *
 * The whole Section is read rather than the routes the packages claim, so a
 * route no package claims is a finding in the other direction. The authored
 * `index.mdx` is excluded because it is the one hand-written page here and is
 * judged by its links instead.
 */
const changelogFiles = []
for (const file of await walkFiles(CHANGELOG_ROOT)) {
  const entry = toSite(file)
  if (entry === `content/${CHANGELOG_SECTION}/index.mdx`) continue
  if (!CONTENT_EXTENSIONS.some((extension) => file.endsWith(extension))) continue
  const withoutExtension = below(CHANGELOG_ROOT, file).replace(/\.mdx?$/, '')
  changelogFiles.push({
    route: routeForFile(`${CHANGELOG_SECTION}/${withoutExtension}`),
    file: entry,
    text: (await readFile(file, 'utf8')).replace(/\r\n/g, '\n'),
  })
}

/** The changelog routes the authored index links, which is the reader's way in. */
const changelogIndex = []
for (const link of links) {
  if (link.file !== `content/${CHANGELOG_SECTION}/index.mdx`) continue
  const route = routeOfHref(link.href)
  if (route.startsWith(`/${CHANGELOG_SECTION}/`)) changelogIndex.push(route)
}

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

/* The navigation, as published, and as the reader receives it. */

if (!existsSync(OUT)) {
  die(
    'apps/site/out is missing. Run pnpm --filter @nanisoft/site build first: the gate reads the ' +
      'published navigation, and a navigation that was never published cannot be checked.',
  )
}
const navBlocks = new Map()
let publishedPages = 0
for (const file of await walkFiles(OUT)) {
  if (!file.endsWith('.html')) continue
  publishedPages += 1
  for (const block of parseNav(await readFile(file, 'utf8'))) {
    navBlocks.set(JSON.stringify(block), block)
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
  demoFiles: [...demoFiles],
  changelogPackages,
  changelogFiles,
  changelogIndex,
  corpus: {
    items: store.items.map((item) => ({ slug: item.slug, kind: item.kind, url: item.url })),
    pages: store.pages.map((page) => ({
      section: page.section,
      slug: page.slug,
      url: page.url,
      mirror: page.mirror,
    })),
    changelogs: store.changelogs.map((entry) => ({
      package: entry.package,
      route: entry.route,
      versions: [...entry.versions],
    })),
  },
  routes: [...routes],
  navBlocks: [...navBlocks.values()],
})

if (findings.length > 0) {
  console.error(`content-joins: ${findings.length} broken join(s)\n`)
  for (const finding of findings) console.error(`  [${finding.group}] ${finding.message}`)
  console.error('')
  process.exit(1)
}

console.log(
  `content-joins: every join holds - ${catalogue.length} Items, ${contentFiles.length} content ` +
    `files, ${itemDocs.length} Item documents, ${store.pages.length} Corpus pages, ` +
    `${changelogPackages.length} published changelogs, ${routes.size} routes, ` +
    `${navBlocks.size} navigation blocks across ${publishedPages} published pages`,
)
