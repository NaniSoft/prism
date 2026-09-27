/**
 * The site's content joins, as plain data in and findings out.
 *
 * The gate in `check-content-joins.mjs` reads the four surfaces involved, the
 * Catalogue, the content tree, the Corpus and the published export. This file
 * decides what those four must agree on, and touches no filesystem, so the whole
 * gate is testable against a flat tree and a nested tree without either being on
 * disk.
 *
 * Every assertion below is about a *join*, never about a particular depth. The
 * content tree is flat today and becomes nested later in this effort, and a rule
 * that named a directory level would either pass vacuously now or need rewriting
 * at the moment it is most needed. So a page is whatever the tree holds wherever
 * it holds it, and its route comes from where it sits.
 *
 * Two things are deliberately not here. There is no `kind` and no `category` in
 * the content tree, because those come from the Catalogue and nowhere else, and
 * a second list of them is the failure this gate exists to prevent. And nothing
 * re-derives what the Corpus contains: the Corpus arrives as the Store the MCP
 * server reads and is compared, not recomputed.
 *
 * The routing tree is not read here either, because it cannot be: the site's
 * content source is declared through the macro API, whose module throws unless
 * the bundler plugin compiled it. The one thing the gate needs from the tree is
 * whether an ordering claims every page, and that is stated here as the join it
 * implies: a route the site publishes that no navigation links is a page an
 * ordering left out. The published navigation is read as a tree rather than as a
 * list of hrefs, so a group a reader can see is a group this file can check.
 *
 * @typedef {{ name: string, slug: string, kind: string, category: string | null }} CatalogueItem
 * @typedef {{ slug: string, kind: string, file: string, group: string[], demo: string | null, demos: string[] }} ItemDoc
 * @typedef {{ route: string, file: string, index: boolean }} ContentFile
 * @typedef {{ file: string, href: string }} ContentLink
 * @typedef {{ slug: string, kind: string, url: string }} CorpusItem
 * @typedef {{ section: string, slug: string, url: string, mirror: string }} CorpusPage
 * @typedef {{ group: string, message: string }} Finding
 *
 * @typedef {object} NavGroup
 * @property {string | null} label the heading a reader sees, null when there is none
 * @property {string | null} url the heading's own route, null when the heading is a label
 * @property {string[]} hrefs the routes listed directly in this group
 * @property {NavGroup[]} groups the groups nested in this one, at any depth
 *
 * @typedef {object} NavBlock
 * @property {string[]} hrefs the routes at this block's own level
 * @property {NavGroup[]} groups the groups this block holds
 *
 * @typedef {object} Joins
 * @property {CatalogueItem[]} catalogue the checked Catalogue, read through `buildCatalog()`
 * @property {string[]} sections the declared content Sections, from the Store's own list
 * @property {string[]} contentDirectories the directory names under `content/`
 * @property {ContentFile[]} contentFiles every authored file in the content tree
 * @property {ContentLink[]} links the internal links in the authored prose
 * @property {ItemDoc[]} itemDocs the documentation files in the item content tree
 * @property {string[]} demoFiles the demo files on disk, by slug
 * @property {{ items: CorpusItem[], pages: CorpusPage[] }} corpus the Corpus, as the Store
 * @property {string[]} routes the routes the site publishes
 * @property {NavBlock[]} navBlocks the navigation blocks the published export renders
 */

/** The one authored extension, kept as a list so a later file type is one edit. */
const CONTENT_EXTENSIONS = ['.mdx']

const INDEX = 'index'

/**
 * The route a content file is addressed by. `index.mdx` is its folder's landing
 * page and every other file is a page of its own; the rule is the same at every
 * depth, which is what lets the content tree be nested later without edits here.
 *
 * @param {string} relative a forward-slashed path below the collection root
 * @returns {string}
 */
export function routeForFile(relative) {
  const withoutExtension = relative.replace(/\.mdx?$/, '')
  if (withoutExtension === INDEX) return '/'
  if (withoutExtension.endsWith(`/${INDEX}`)) {
    return `/${withoutExtension.slice(0, -(INDEX.length + 1))}`
  }
  return `/${withoutExtension}`
}

/** A link may carry a query or a fragment; the route it names is what is left. */
function routeOfHref(href) {
  const [withoutQuery = ''] = href.split('?')
  const [withoutHash = ''] = withoutQuery.split('#')
  if (withoutHash.length > 1 && withoutHash.endsWith('/')) return withoutHash.slice(0, -1)
  return withoutHash
}

/**
 * A path the routing tree cannot publish, whatever produced it. `/api/**` is
 * a route handler rather than a page, and `/_next/**` is a build asset, so
 * neither is a route the content tree can be asked to produce.
 */
function unroutable(route) {
  return (
    route === '' ||
    route.startsWith('/_next/') ||
    route.startsWith('/api/') ||
    route.startsWith('#')
  )
}

/* The published navigation, read as a tree. -------------------------------- */

/** A navigation element, and everything inside it. */
const NAV_BLOCK = /<nav\b[^>]*>([\s\S]*?)<\/nav>/g
/** One tag, opening or closing. Attribute values may hold a `>`. */
const TAG = /<(\/?)([a-z][a-z0-9-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/gi
const HREF = /\bhref="([^"]*)"/

/** Elements that never have a closing tag, so they must not close a stack. */
const VOID = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'source',
  'track',
  'wbr',
])

/** One parsed element. `tag` is `#text` for the text between two tags. */
function node(tag, text = '') {
  return { tag, text, attrs: '', children: [] }
}

/**
 * Parse a fragment into elements, by tag balance.
 *
 * Balance rather than a shape, because the shape is a rendering detail and this
 * file is about what a reader gets. Nothing here knows that a group is a `div`
 * with a class, only that an element which holds a list of routes is a group and
 * an element which holds a heading and a list is a group with a name.
 */
function parse(html) {
  const root = node('#root')
  const stack = [root]
  let at = 0
  for (const match of html.matchAll(TAG)) {
    const [full, closing, tag, attrs] = match
    const parent = stack[stack.length - 1]
    if (match.index > at) parent.children.push(node('#text', html.slice(at, match.index)))
    at = match.index + full.length
    const name = tag.toLowerCase()
    if (closing !== '/') {
      const child = node(name)
      child.attrs = attrs
      parent.children.push(child)
      if (!VOID.has(name) && !attrs.trimEnd().endsWith('/')) stack.push(child)
      continue
    }
    for (let i = stack.length - 1; i > 0; i--) {
      if (stack[i].tag === name) {
        stack.length = i
        break
      }
    }
  }
  if (at < html.length) root.children.push(node('#text', html.slice(at)))
  return root
}

/** An element's own text, with its tags removed. */
function textOf(element) {
  return element.children
    .map((child) => (child.tag === '#text' ? child.text : textOf(child)))
    .join('')
    .trim()
}

/** An element with text and no elements inside it: a heading or a link. */
function leaf(element) {
  return element.children.every((child) => child.tag === '#text')
}

/** An element that holds a list of routes, which is what makes it a group. */
function isGroup(element) {
  return element.children.some((child) => child.tag === 'ul')
}

function hrefOf(element) {
  return HREF.exec(element.attrs)?.[1] ?? null
}

/** The one group inside `element`: its heading, its own routes, and its children. */
function groupOf(element) {
  const heading = element.children.find(
    (child) => (child.tag === 'a' || child.tag === 'span') && leaf(child),
  )
  const group = {
    label: heading ? textOf(heading) : null,
    url: heading !== undefined && heading.tag === 'a' ? hrefOf(heading) : null,
    hrefs: [],
    groups: [],
  }
  const list = element.children.find((child) => child.tag === 'ul')
  if (list) collect(list, group)
  return group
}

/**
 * Everything under `element`, split into the routes listed directly and the
 * groups nested below. A group is descended into rather than flattened, so a
 * route's own group is the one it is listed in.
 */
function collect(element, group) {
  for (const child of element.children) {
    if (child.tag === '#text') continue
    if (isGroup(child)) {
      group.groups.push(groupOf(child))
      continue
    }
    if (child.tag === 'a') {
      const href = hrefOf(child)
      if (href !== null) group.hrefs.push(href)
      continue
    }
    collect(child, group)
  }
}

/**
 * Every navigation block in a published page, as the reader receives it.
 *
 * A block is whatever sits inside a `<nav>`, so the header row, the sidebar and
 * the pager are three blocks rather than one merged list, and each keeps its own
 * level. A `<nav>` with no list in it, which is the header row, is a block of
 * routes with no groups rather than a group of its own.
 *
 * @param {string} html one published page
 * @returns {NavBlock[]}
 */
export function parseNav(html) {
  const blocks = []
  for (const [, body] of html.matchAll(NAV_BLOCK)) {
    const block = { hrefs: [], groups: [] }
    collect(parse(body), block)
    blocks.push(block)
  }
  return blocks
}

/** Every group in a set of blocks, at any depth. */
function allGroups(blocks) {
  const out = []
  const walk = (group) => {
    out.push(group)
    for (const nested of group.groups) walk(nested)
  }
  for (const block of blocks) {
    for (const group of block.groups) walk(group)
  }
  return out
}

/**
 * Every route a set of blocks links, at every level. A group's own route counts:
 * it is a link a reader can follow, and it is usually a Section landing page that
 * no other navigation entry points at.
 */
function everyHref(blocks) {
  const out = []
  for (const block of blocks) {
    out.push(...block.hrefs)
    for (const group of allGroups([block])) {
      if (group.url !== null) out.push(group.url)
      out.push(...group.hrefs)
    }
  }
  return out
}

/**
 * The label of the innermost group a route is listed in, and null when it is
 * listed at the top level of a block. This is what tells a reader that an Item
 * sits under a Category, and it is only in the markup, so it is the only place
 * the answer exists.
 */
function enclosingLabels(blocks) {
  const labels = new Map()
  const walk = (group, above) => {
    for (const href of group.hrefs) {
      if (!labels.has(href)) labels.set(href, above)
    }
    for (const nested of group.groups) walk(nested, [...above, nested.label])
  }
  for (const block of blocks) {
    for (const href of block.hrefs) {
      if (!labels.has(href)) labels.set(href, [])
    }
    for (const group of block.groups) walk(group, [])
  }
  return labels
}

/**
 * Every join the site's content surfaces must satisfy, as a flat list of
 * findings. An empty list is the gate passing.
 *
 * @param {Joins} joins
 * @returns {Finding[]}
 */
export function findContentJoins(joins) {
  const findings = []
  const fail = (group, message) => findings.push({ group, message })

  /* The Catalogue and the content folders, in both directions. ------------ */

  const catalogueSlugs = new Map(joins.catalogue.map((item) => [item.slug, item]))
  const docsBySlug = new Map()
  for (const doc of joins.itemDocs) {
    docsBySlug.set(doc.slug, [...(docsBySlug.get(doc.slug) ?? []), doc])
  }

  for (const item of joins.catalogue) {
    const docs = docsBySlug.get(item.slug) ?? []
    if (docs.length === 0) {
      fail(
        'catalogue',
        `the Catalogue Item ${item.name} (${item.kind}) has no documentation file: ` +
          `no file named ${item.slug}.mdx in the item content tree`,
      )
      continue
    }
    if (docs.length > 1) {
      fail(
        'catalogue',
        `${docs.length} documentation files claim the Catalogue Item's slug '${item.slug}': ` +
          docs.map((doc) => doc.file).join(', '),
      )
    }
    // The Kind is the top folder of the documentation tree, and it is the
    // Catalogue's word for the Item. A document filed under the wrong Kind is
    // read by the page template as a document of that Kind, so the Item page
    // renders as though no prose had been authored for it, with a green build.
    for (const doc of docs) {
      if (doc.kind !== item.kind) {
        fail(
          'catalogue',
          `${doc.file} sits in the '${doc.kind}' folder, but the Catalogue Item ${item.name} ` +
            `is a ${item.kind}, so the Item page cannot find the prose it filed`,
        )
      }
    }
  }

  for (const doc of joins.itemDocs) {
    if (!catalogueSlugs.has(doc.slug)) {
      fail(
        'catalogue',
        `${doc.file} documents '${doc.slug}', which no Catalogue Item claims, so the ` +
          'content tree has become a second list',
      )
    }
  }

  /* The declared Sections and the directories on disk. --------------------- */

  const declared = new Set(joins.sections)
  for (const section of joins.sections) {
    if (!joins.contentDirectories.includes(section)) {
      fail(
        'section',
        `the Section '${section}' is declared for the Corpus but there is no ` +
          `content/${section} directory, so every page in it is missing from the agent surface`,
      )
    }
  }
  for (const directory of joins.contentDirectories) {
    if (!declared.has(directory)) {
      fail(
        'section',
        `content/${directory} is a content directory that no declared Section claims, so the ` +
          'Corpus never walks it and its pages reach no agent surface',
      )
    }
  }

  /* Every Item's Demo, discovered from beside its documentation. ---------- */

  const demoFiles = new Set(joins.demoFiles)
  const claimed = new Map()
  for (const item of joins.catalogue) {
    const doc = (docsBySlug.get(item.slug) ?? [])[0]
    if (doc === undefined) continue
    if (doc.demos.length === 0) {
      fail('demo', `${doc.file} names no demo, so ${item.name} (${item.kind}) has none to render`)
    }
    for (const demo of doc.demos) {
      claimed.set(demo, [...(claimed.get(demo) ?? []), doc.file])
      if (!demoFiles.has(demo)) {
        fail(
          'demo',
          `${doc.file} names the demo '${demo}', which is not a demo file, so the Item ` +
            'renders a placeholder and the Corpus carries no example',
        )
      }
      // Discovery is by adjacency, so the Demo a document names has to be the
      // one the rule found beside it. A Demo left behind in the flat root when
      // its documentation moved would still satisfy the check above, and the
      // Item would render from a second directory with every gate green.
      if (demo !== doc.demo) {
        fail(
          'demo',
          `${doc.file} names the demo '${demo}', but the demo beside it is ` +
            `${doc.demo ?? 'nothing at all'}, so the document and its Demo have come apart`,
        )
      }
    }
  }
  for (const demo of joins.demoFiles) {
    const owners = claimed.get(demo) ?? []
    if (owners.length === 0) {
      fail('demo', `the demo file ${demo}.tsx is claimed by no Item's documentation`)
    } else if (owners.length > 1) {
      fail(
        'demo',
        `the demo file ${demo}.tsx is claimed by ${owners.length} Items: ${owners.join(', ')}`,
      )
    }
  }

  /* The Corpus, consumed rather than re-derived. ------------------------- */

  const corpusItems = new Map(joins.corpus.items.map((item) => [item.slug, item]))
  for (const item of joins.catalogue) {
    const entry = corpusItems.get(item.slug)
    if (entry === undefined) {
      fail('corpus', `the Corpus has no entry for the Catalogue Item ${item.name} (${item.kind})`)
      continue
    }
    if (entry.kind !== item.kind) {
      fail(
        'corpus',
        `the Corpus calls '${item.slug}' a ${entry.kind} and the Catalogue calls it a ${item.kind}`,
      )
    }
  }
  for (const entry of joins.corpus.items) {
    if (!catalogueSlugs.has(entry.slug)) {
      fail('corpus', `the Corpus lists the item '${entry.slug}', which the Catalogue does not`)
    }
  }

  // An index file is a Section's landing page, and the Corpus has never carried
  // one, so it is the only authored file exempt from the join.
  const corpusPages = new Map(joins.corpus.pages.map((page) => [page.url, page]))
  const pageRoutes = new Set(joins.contentFiles.filter((file) => !file.index).map((f) => f.route))
  for (const route of pageRoutes) {
    if (!corpusPages.has(route)) {
      const file = joins.contentFiles.find((entry) => entry.route === route)
      fail(
        'corpus',
        `the content page ${route} (${file?.file}) is in the tree but not in the Corpus, so no ` +
          'agent can reach it',
      )
    }
  }
  for (const page of joins.corpus.pages) {
    if (!pageRoutes.has(page.url)) {
      fail(
        'corpus',
        `the Corpus lists the page ${page.url} but the content tree holds no file at that route`,
      )
    }
    const expected = `${page.url}.md`
    if (page.mirror !== expected) {
      fail(
        'corpus',
        `the Corpus lists the page ${page.url} with the mirror ${page.mirror}, which is not the ` +
          `route plus '.md' (${expected})`,
      )
    }
  }

  /* The routes a page is addressed by. ----------------------------------- */

  const routes = new Set(joins.routes)
  const navHrefs = everyHref(joins.navBlocks)
  for (const link of joins.links) {
    const route = routeOfHref(link.href)
    if (unroutable(route)) continue
    if (!routes.has(route)) {
      fail('links', `${link.file} links ${link.href}, which is not a route the site publishes`)
    }
  }

  /* The navigation against the routes it can reach. ---------------------- */

  if (navHrefs.length === 0) {
    fail(
      'routes',
      'the published export carries no navigation to check, so the navigation join is unproven. ' +
        'Build the site before running this gate.',
    )
  }
  for (const href of navHrefs) {
    const route = routeOfHref(href)
    if (unroutable(route)) continue
    if (!routes.has(route)) {
      fail(
        'routes',
        `the published navigation links ${href}, which the routing tree does not produce`,
      )
    }
  }

  /* The navigation against the routes an ordering governs, both ways. ----- */

  // A `pages` array in a meta file is a whitelist, not a reorder. A page it
  // omits and does not cover with an ellipsis leaves the primary tree, lands in
  // the fallback collection, and keeps its exported route. The page template
  // refuses to project a tree that has one, so the build fails before this gate
  // runs; this is the same rule from the reader's side, over two surfaces the
  // gate already reads, so it holds at any depth and needs the tree never to be
  // instantiated. The one direction it cannot check is the fallback itself,
  // which is why both exist rather than one.
  //
  // The population is what the content tree and the Catalogue publish. A
  // catalogue Section landing page is not in it, because it is only reachable
  // through its folder, and a folder that lost its place in the ordering takes
  // every page beneath it with it, so the Item routes already carry the failure.
  //
  // Skipped entirely when there is no navigation to compare against, so a build
  // that was never published reports the one finding above rather than one per
  // page.
  if (navHrefs.length > 0) {
    const linked = new Set(navHrefs.map((href) => routeOfHref(href)))
    for (const file of joins.contentFiles) {
      if (linked.has(file.route)) continue
      fail(
        'routes',
        `the content page ${file.route} (${file.file}) is published but no navigation links ` +
          'it, so a page-tree ordering left it out and it is reachable only by URL',
      )
    }
    for (const item of joins.corpus.items) {
      if (linked.has(item.url)) continue
      fail(
        'routes',
        `the Catalogue Item page ${item.url} (${item.kind} ${item.slug}) is published but no ` +
          'navigation links it, so a page-tree ordering left it out and it is reachable only by URL',
      )
    }
  }

  /* The Category groups, from the Catalogue and the published sidebar. ---- */

  // Two directions, because one alone lets the tree drift. The Catalogue says
  // which Items belong to which Category; the sidebar says which group a reader
  // finds each of them under. Filing an Item under a folder in the content tree
  // is the intent, the folder is the tree's shape, and neither of them is the
  // label: the label is compared against the Catalogue, so a folder, a rendered
  // heading and a catalogue entry all have to agree before a reader is told an
  // Item is a Data display Component.
  const categories = new Set(
    joins.catalogue.map((item) => item.category).filter((value) => value !== null),
  )
  const byUrl = new Map(joins.corpus.items.map((item) => [item.url, item]))
  const labels = enclosingLabels(joins.navBlocks)

  for (const item of joins.catalogue) {
    const doc = (docsBySlug.get(item.slug) ?? [])[0]
    if (doc === undefined || doc.group.length === 0) continue
    const entry = corpusItems.get(item.slug)
    if (entry === undefined) continue
    const around = labels.get(entry.url)
    if (around === undefined) continue
    if (around.length === 0) {
      fail(
        'category',
        `${doc.file} is filed under the '${doc.group.join('/')}' folder, but the published ` +
          `navigation lists ${entry.url} with no group, so a reader is not told which Category ` +
          'the Item belongs to',
      )
      continue
    }
    const label = around[around.length - 1]
    if (label !== item.category) {
      fail(
        'category',
        `${doc.file} is filed under the '${doc.group.join('/')}' folder and the published ` +
          `navigation lists ${entry.url} under '${label ?? 'a group with no heading'}', but the ` +
          `Catalogue calls ${item.name} a ${item.category ?? 'Component with no Category'}`,
      )
    }
  }

  for (const group of allGroups(joins.navBlocks)) {
    if (group.label === null || !categories.has(group.label)) continue
    for (const href of group.hrefs) {
      const route = routeOfHref(href)
      const item = byUrl.get(route)
      if (item === undefined) {
        fail(
          'category',
          `the published navigation group '${group.label}' lists ${href}, which is not a ` +
            'Catalogue Item, so a Category group holds something that is not a Component',
        )
        continue
      }
      const entry = catalogueSlugs.get(item.slug)
      if (entry?.category !== group.label) {
        fail(
          'category',
          `the published navigation group '${group.label}' lists ${href}, which the Catalogue ` +
            `calls a ${entry?.category ?? 'Component with no Category'}`,
        )
      }
    }
  }

  return findings
}

export { CONTENT_EXTENSIONS }
