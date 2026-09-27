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
 * whether an ordering claims every page, and that is stated here as the
 * join it implies: a route the site publishes that no navigation links is a page
 * an ordering left out.
 *
 * @typedef {{ name: string, slug: string, kind: string }} CatalogueItem
 * @typedef {{ slug: string, file: string, demos: string[] }} ItemDoc
 * @typedef {{ route: string, file: string, index: boolean }} ContentFile
 * @typedef {{ file: string, href: string }} ContentLink
 * @typedef {{ slug: string, kind: string, url: string }} CorpusItem
 * @typedef {{ section: string, slug: string, url: string, mirror: string }} CorpusPage
 * @typedef {{ group: string, message: string }} Finding
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
 * @property {string[]} navHrefs the hrefs the published navigation renders
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
  for (const link of joins.links) {
    const route = routeOfHref(link.href)
    if (unroutable(route)) continue
    if (!routes.has(route)) {
      fail('links', `${link.file} links ${link.href}, which is not a route the site publishes`)
    }
  }

  /* The navigation against the routes it can reach. ---------------------- */

  if (joins.navHrefs.length === 0) {
    fail(
      'routes',
      'the published export carries no navigation to check, so the navigation join is unproven. ' +
        'Build the site before running this gate.',
    )
  }
  for (const href of joins.navHrefs) {
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
  if (joins.navHrefs.length > 0) {
    const linked = new Set(joins.navHrefs.map((href) => routeOfHref(href)))
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

  return findings
}

export { CONTENT_EXTENSIONS }
