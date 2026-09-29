import {
  buildCatalog,
  CATALOG_KINDS,
  COMPONENT_CATEGORIES,
  type CatalogItem,
  type CatalogKind,
  type ComponentCategory,
} from '@nanisoft/prism-ui/catalog'
import type { MetaData, PageData, StaticSource } from 'fumadocs-core/source'

import { sectionFor } from './sections'

/**
 * Builds the routed page tree from the checked catalogue.
 *
 * Ticket 09 keeps one list, `packages/ui/src/catalog.ts`, and ticket 10 routes
 * it through a `StaticSource`: a plain object with virtual paths, no file on
 * disk. What it emits is the two things a file on disk cannot say. One page per
 * Section root, so a Section landing page exists for a group heading to link to
 * and a Section builds while its roster is still thin, and one `meta.json` per
 * folder, which is the order the navigation reads. The Item pages themselves are
 * not emitted here: an Item's page is its documentation, read by the one
 * collection beside its Demo, and `content-tree.ts` places it in this tree and
 * gives it the Catalogue's data.
 *
 * Each Section's `meta.json` carries the order the navigation reads, and it is
 * generated from the same `buildCatalog()` call, from the same array, so the
 * order cannot fall behind the Catalogue: a new Item is a line in one list and
 * the ordering grows with it. A hand-written `pages` array would be the
 * opposite, because a `pages` array is a whitelist rather than a reorder. An Item
 * it omits does not move down the list, it leaves the primary tree, lands in the
 * fallback collection and keeps its exported route, which is a page reachable by
 * URL and invisible in the navigation with a green build. Generating the array is
 * what removes the opportunity.
 *
 * **Where an Item sits in the tree is read, and its route is stated by the
 * document.** A Component's documentation is filed under its Category, so the
 * ordering names a Category folder at the place of the first Item inside it and
 * the page tree nests it. The folder comes from the Catalogue, as the slug of the
 * Item's own Category, which is what removed the item manifest this module used
 * to import: there is no longer a generated file saying which folder an Item
 * lives in, because the one fact it recorded is in the Catalogue and the file
 * path is read by the projection. A Component filed under a folder that is not
 * its Category still publishes its route and still leaves the sidebar, and
 * `projectNav()` refuses to render that tree, so the disagreement fails the
 * build rather than shipping a page nothing links.
 *
 * The route does not follow the folder, and nothing here computes one. Each Item
 * page states `<segment>/<slug>` in its own frontmatter and `content-tree.ts`
 * refuses the page whose declared route is not this Catalogue's word for it, so
 * a Component's published address is the Catalogue's and not a side effect of how
 * deeply its documentation happens to be filed. Forty-two routes are unchanged
 * by the nesting, and the corpus, the redirects and every cached agent
 * instruction that names one keep resolving.
 */

/**
 * The Kinds, in the order the Sections are built and rendered.
 *
 * Read from `CATALOG_KINDS` rather than written out, and this is the whole fix.
 * The list was a second literal about the same three kinds, so a Kind added to the
 * catalogue and to the store compiles cleanly, builds every site, and then simply
 * does not appear here: the site omits it with no error anywhere. A list that has
 * to be edited in step with another one is a list that will eventually be wrong,
 * and importing the one that already exists is cheaper than any gate that would
 * have caught it later.
 */
export const KINDS: readonly CatalogKind[] = CATALOG_KINDS

/** The catalogue metadata a routed page carries. */
export type CataloguePageData = PageData & {
  kind: CatalogKind
  category: ComponentCategory | null
  status: 'stable' | 'deprecated'
  exports: string[]
  source: string
  slug: string
  name: string
  /** Marks the explicit index page of a catalogue section. */
  sectionIndex?: boolean
}

type CatalogueConfig = { pageData: CataloguePageData; metaData: MetaData }

/**
 * The one Section a Kind is published at, with the words a reader is shown.
 *
 * The segment and the title are read from the manifest rather than written here,
 * because this was the fourth place the Section list was stated and the one a
 * rename had to be repeated in. A Kind whose Section the manifest does not
 * declare throws rather than publishing at an invented route, which is the
 * failure a segment written beside a list is always one edit away from. Only the
 * description is authored here: the prose Sections take theirs from their own
 * index page's frontmatter, and a catalogue Section's is the one piece of copy
 * that exists to describe a roster of Items.
 */
function catalogueSection(
  kind: CatalogKind,
  description: string,
  segment = `${kind}s`,
): { segment: string; title: string; description: string } {
  const section = sectionFor(segment)
  if (section === undefined) {
    throw new Error(
      `the Catalogue publishes the ${kind} Section at /${segment} and the manifest declares no ` +
        'Section there, so there is no route to publish it at. The segment is the manifest word.',
    )
  }
  return { segment: section.segment, title: section.title, description }
}

export const SECTIONS: Record<CatalogKind, { segment: string; title: string; description: string }> = {
  component: catalogueSection(
    'component',
    'Focused, accessible, product-agnostic exports. A Component has one job and consumes semantic tokens only.',
  ),
  block: catalogueSection(
    'block',
    'Pre-composed, product-agnostic sections assembled from Components. A Block takes its content as props and fetches nothing.',
  ),
  page: catalogueSection(
    'page',
    'Complete structural compositions of Blocks and Components that model a whole screen and receive application-owned data.',
  ),
  // A `live` surface is one whose content changes over time without a navigation
  // event: the event log, the tool-call ledger, the status tiers and the run
  // controls. The segment is passed rather than derived, because `${kind}s` would
  // publish it at `/lives`, and the irregular segment is named in one place instead
  // of being spelled out at every read.
  live: catalogueSection(
    'live',
    'Surfaces whose content changes over time without a navigation event. A live surface owns the event log, the ledger, the status tiers and the run controls; the consumer owns the socket, the transport and the persistence.',
    'live',
  ),
}

/**
 * The folder a Category is filed under.
 *
 * Derived from the Category's own name, so the folder and the label a reader
 * sees cannot disagree, and a new Category needs no second edit to appear in the
 * tree. The reference uses a different casing for these folders and the
 * specification keeps Prism's slug casing, so this is a slug of the Catalogue's
 * name rather than a name of its own.
 */
export function categoryFolder(category: ComponentCategory): string {
  return category.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

/** The Category a folder names, or a build failure naming the folder. */
function categoryOf(folder: string): ComponentCategory {
  const found = COMPONENT_CATEGORIES.find((category) => categoryFolder(category) === folder)
  if (found === undefined) {
    throw new Error(
      `the content tree files an Item under '${folder}', which names no Category. A Component's ` +
        `folder is the slug of its Category, and the Categories are: ${COMPONENT_CATEGORIES.join(', ')}.`,
    )
  }
  return found
}

/**
 * The folders an Item's page is nested under in the tree, read from the
 * Catalogue rather than from a generated file.
 *
 * A Component's folder is the slug of its own Category, so the folder, the label
 * the sidebar shows and the Catalogue entry are one fact read three ways and
 * cannot disagree about which role a Component is for. A Block and a Page have
 * no Category, and the constitution says so in two places, so their folder list
 * is empty and their sidebars are flat lists. A Component the Catalogue gives no
 * Category would nest nowhere, and `categoryFolder()` throws on it rather than
 * filing it under a folder a reader would be told nothing about.
 *
 * The other side of the join is the documentation tree: `content-tree.ts` reads
 * the same folder out of the file path. The two are asserted against each other
 * in the test lane, and a disagreement is a build failure rather than a silent
 * split, because the ordering below would name one folder and the page would be
 * placed in the other, which is a page that keeps its route and leaves the
 * sidebar.
 */
function groupOf(item: CatalogItem): readonly string[] {
  if (item.kind !== 'component') {
    if (item.category !== null) {
      throw new Error(
        `the Catalogue files the ${item.kind} ${item.name} under the Category '${item.category}'. A ` +
          'Block and a Page have no Category, and the constitution says so in two places.',
      )
    }
    return []
  }
  if (item.category === null) {
    throw new Error(
      `the Catalogue Item ${item.name} is a Component with no Category, so it has no folder to nest ` +
        'under and would be filed in no group at all. Every Component belongs to one of the seven.',
    )
  }
  return [categoryFolder(item.category)]
}

/**
 * The Catalogue's own words for an Item's page.
 *
 * Merged into the page's data by `content-tree.ts` rather than carried by a page
 * emitted from here, because the page is the Item's documentation and the
 * documentation is not where the Catalogue's words are written. Every field here
 * is read from `buildCatalog()`, so an Item page carries the one list's account
 * of itself and the file beside it carries the prose.
 */
export function itemData(item: CatalogItem): CataloguePageData {
  return {
    title: item.name,
    description: item.description,
    kind: item.kind,
    category: item.category,
    status: item.status,
    exports: [...item.exports],
    source: item.source,
    slug: item.slug,
    name: item.name,
  }
}

function indexData(kind: CatalogKind): CataloguePageData {
  const section = SECTIONS[kind]
  return {
    title: section.title,
    description: section.description,
    kind,
    category: null,
    status: 'stable',
    exports: [],
    source: '',
    slug: section.segment,
    name: section.title,
    sectionIndex: true,
  }
}

function build(): StaticSource<CatalogueConfig> {
  const items = buildCatalog()
  const files: StaticSource<CatalogueConfig>['files'] = []
  const groupOfItem = new Map<string, readonly string[]>(
    items.map((item) => [item.slug, groupOf(item)]),
  )

  for (const kind of KINDS) {
    const segment = SECTIONS[kind].segment
    files.push({
      type: 'page',
      path: `${segment}/index.mdx`,
      slugs: [segment],
      data: indexData(kind),
    })
    // The ordering, generated from the same array the pages came from. The
    // section's own index page is deliberately absent from it: naming it would
    // take the folder's automatic `index.mdx` lookup away and list the landing
    // page as a child of itself, and the lookup is what a group heading links
    // to.
    //
    // A folder takes the place of the first Item filed under it, so read depth
    // first the order is still the Catalogue's own: a reader sees the Items in
    // Catalogue order, whether they sit in a folder or beside it. A folder that
    // is emitted before an Item it contains would move that Item up the list,
    // and the ordering is a reading order rather than a sort.
    files.push({
      type: 'meta',
      path: `${segment}/meta.json`,
      data: {
        pages: orderFor(
          items.filter((item) => item.kind === kind),
          0,
          segment,
          groupOfItem,
          files,
        ),
      },
    })
  }

  return { files }
}

/**
 * The `pages` array for one level of one section, in the Catalogue's order, and
 * the meta files for every folder below it.
 *
 * `depth` is how many folders deep this level is, so the rule is the same at
 * every depth: an Item with no folder left to file it under is named directly, an
 * Item with one is named by the folder, and the folder is emitted once, at the
 * first of the Items inside it. The files are pushed onto `files` as the walk
 * goes, which is what keeps a nested folder's ordering and its pages in one
 * place instead of two.
 */
function orderFor(
  items: CatalogItem[],
  depth: number,
  prefix: string,
  groupOfItem: Map<string, readonly string[]>,
  files: StaticSource<CatalogueConfig>['files'],
): string[] {
  const pages: string[] = []
  const claimed = new Set<string>()
  for (const item of items) {
    const group = groupOfItem.get(item.slug) ?? []
    if (group.length <= depth) {
      pages.push(item.slug)
      continue
    }
    const folder = group[depth] as string
    if (claimed.has(folder)) continue
    claimed.add(folder)
    const inside = items.filter((other) => (groupOfItem.get(other.slug) ?? [])[depth] === folder)
    const children = orderFor(inside, depth + 1, `${prefix}/${folder}`, groupOfItem, files)
    files.push({
      type: 'meta',
      path: `${prefix}/${folder}/meta.json`,
      // A folder one level below a Section is a Category, and the label a reader
      // reads is the Catalogue's name for it rather than the folder's. Anything
      // deeper has no label in the Catalogue, so it takes the folder name the
      // tree builder derives, which is the one honest thing to show.
      data: depth === 0 ? { title: categoryOf(folder), pages: children } : { pages: children },
    })
    pages.push(folder)
  }
  return pages
}

export const catalogueSource = build()

/**
 * The one Catalogue Item a document names, read by Kind and slug.
 *
 * Keyed once at module scope rather than searched per call, because the routed
 * tree asks this question for every Item page on every build and the Catalogue is
 * the answer, not a list kept beside it. An Item the Catalogue does not claim is
 * `undefined`, and the caller says so in its own words: that is the failure the
 * content-join gate also reports, from the same `buildCatalog()` call.
 */
const byIdentity = new Map(
  buildCatalog().map((item) => [`${item.kind}/${item.slug}`, item] as const),
)

export function itemFor(kind: CatalogKind, slug: string): CatalogItem | undefined {
  return byIdentity.get(`${kind}/${slug}`)
}
