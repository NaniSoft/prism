import {
  buildCatalog,
  type CatalogItem,
  type CatalogKind,
  type ComponentCategory,
} from '@nanisoft/prism-ui/catalog'
import type { MetaData, PageData, StaticSource } from 'fumadocs-core/source'

/**
 * Builds the routed page tree from the checked catalogue.
 *
 * Ticket 09 keeps one list, `packages/ui/src/catalog.ts`, and ticket 10 routes
 * it through a `StaticSource`: a plain object with virtual paths, no file on
 * disk. One page per item at `<segment>/<slug>.mdx`, plus one explicit page per
 * section root so a section builds while its roster is still thin. The prose
 * body is looked up separately at render time, from the `items/` collection.
 */

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

const EMPTY: never[] = []

function itemPath(item: CatalogItem): string {
  return `${SECTIONS[item.kind].segment}/${item.slug}.mdx`
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

  for (const kind of ['component', 'block', 'page'] as const) {
    files.push({
      type: 'page',
      path: `${SECTIONS[kind].segment}/index.mdx`,
      data: indexData(kind),
    })
  }

  for (const item of items) {
    files.push({ type: 'page', path: itemPath(item), data: itemData(item) })
  }

  return { files }
}

export const catalogueSource = build()

export function itemFor(kind: CatalogKind, slug: string): CatalogItem | undefined {
  return buildCatalog().find((item) => item.kind === kind && item.slug === slug)
}
