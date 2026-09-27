import {
  buildCatalog,
  COMPONENT_CATEGORIES,
  type CatalogItem,
  type CatalogKind,
  type ComponentCategory,
} from '@nanisoft/prism-ui/catalog'
import type { MetaData, PageData, StaticSource } from 'fumadocs-core/source'

import generatedItemGroups from '@/generated/item-groups.json'

/**
 * Builds the routed page tree from the checked catalogue.
 *
 * Ticket 09 keeps one list, `packages/ui/src/catalog.ts`, and ticket 10 routes
 * it through a `StaticSource`: a plain object with virtual paths, no file on
 * disk. One page per item at `<segment>/<slug>.mdx`, plus one explicit page per
 * section root so a section builds while its roster is still thin. The prose
 * body is looked up separately at render time, from the `items/` collection.
 *
 * Each section also carries a generated `meta.json`, and that is the order the
 * navigation reads. It is generated from the same `buildCatalog()` call that
 * emits the pages, from the same array, so the order cannot fall behind the
 * Catalogue: a new Item is a line in one list and the ordering grows with it.
 * A hand-written `pages` array would be the opposite, because a `pages` array is
 * a whitelist rather than a reorder. An Item it omits does not move down the
 * list, it leaves the primary tree, lands in the fallback collection and keeps
 * its exported route, which is a page reachable by URL and invisible in the
 * navigation with a green build. Generating the array is what removes the
 * opportunity.
 *
 * **Where an Item sits in the tree is read, and its route is stated.** A
 * Component's documentation is filed under its Category, so its page is emitted
 * at `<segment>/<category>/<slug>.mdx` and the page tree nests it under a
 * folder. The folders come from `item-groups.json`, which the site's own build
 * generates from the documentation tree with the same rule the corpus and the
 * gate read, so the tree follows the content rather than a second hand-kept list
 * of where content is. A Block's and a Page's documentation is filed one folder
 * deeper and with no Category folder above it, because a Block and a Page have
 * no Category, so their pages are emitted flat and their sidebars are flat
 * lists.
 *
 * The route does not follow the folder. Every catalogue page carries an explicit
 * `slugs` array of `<segment>/<slug>`, so a Component's published address is
 * the Catalogue's word for it and not a side effect of how deeply its
 * documentation happens to be filed. Forty-two routes are unchanged by the
 * nesting, and the corpus, the redirects and every cached agent instruction that
 * names one keep resolving.
 */

/** The three Kinds, in the order the Sections are built and rendered. */
export const KINDS = ['component', 'block', 'page'] as const

/**
 * The item manifest, read: which folder each Item's documentation is filed
 * under, keyed by slug, generated from the documentation tree by the same rule
 * the corpus builder and the content-join gate read. A JSON import is inferred
 * as a literal object, so it is widened here to the shape it is used as rather
 * than indexed through a literal type.
 */
const itemGroups: Readonly<Record<string, readonly string[]>> = generatedItemGroups

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

export const SECTIONS: Record<
  CatalogKind,
  { segment: string; title: string; description: string }
> = {
  component: {
    segment: 'components',
    title: 'Components',
    description:
      'Focused, accessible, product-agnostic exports. A Component has one job and consumes semantic tokens only.',
  },
  block: {
    segment: 'blocks',
    title: 'Blocks',
    description:
      'Pre-composed, product-agnostic sections assembled from Components. A Block takes its content as props and fetches nothing.',
  },
  page: {
    segment: 'pages',
    title: 'Pages',
    description:
      'Complete structural compositions of Blocks and Components that model a whole screen and receive application-owned data.',
  },
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

/** The folders an Item's documentation is filed under, checked against the manifest. */
function groupOf(item: CatalogItem): readonly string[] {
  const entry = Object.hasOwn(itemGroups, item.slug) ? itemGroups[item.slug] : undefined
  if (entry === undefined) {
    throw new Error(
      `the item manifest has no entry for the Catalogue Item ${item.name} (${item.kind}). Run ` +
        'node scripts/generate-demos.mjs: the manifest is generated from the documentation tree.',
    )
  }
  if (item.kind !== 'component' && entry.length > 0) {
    throw new Error(
      `the content tree files the ${item.kind} ${item.name} under '${entry.join('/')}'. A Block ` +
        'and a Page have no Category, and the constitution says so in two places.',
    )
  }
  return entry
}

/** The virtual path of an Item's page, which is where in the tree it sits. */
function itemPath(item: CatalogItem, group: readonly string[]): string {
  return [SECTIONS[item.kind].segment, ...group, `${item.slug}.mdx`].join('/')
}

function itemData(item: CatalogItem): CataloguePageData {
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

  for (const item of items) {
    files.push({
      type: 'page',
      path: itemPath(item, groupOfItem.get(item.slug) ?? []),
      // The route is the Catalogue's, stated here rather than read out of the
      // folder, so nesting an Item in the content tree cannot move its address.
      slugs: [SECTIONS[item.kind].segment, item.slug],
      data: itemData(item),
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

export function itemFor(kind: CatalogKind, slug: string): CatalogItem | undefined {
  return buildCatalog().find((item) => item.kind === kind && item.slug === slug)
}
