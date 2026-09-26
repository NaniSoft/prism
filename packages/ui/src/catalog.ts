/**
 * The checked Prism catalogue: the single list of Components, Blocks and Pages.
 *
 * This is the shape fixed by tickets 09 and 19, not the finished 28-item roster.
 * The v1 build grows it one authored entry at a time; `source` and `exports` are
 * the fields the build checks against disk and the emitted declarations, never
 * the reverse, so the internal shadcn registry stays derived rather than
 * authoritative. Tooling only: a consumer's runtime UI must not import this.
 */

export const CATALOG_KINDS = ['component', 'block', 'page'] as const
export type CatalogKind = (typeof CATALOG_KINDS)[number]

export const COMPONENT_CATEGORIES = [
  'Call to action',
  'Forms and inputs',
  'Feedback',
  'Layout',
  'Data display',
  'Typography',
  'Miscellaneous',
] as const
export type ComponentCategory = (typeof COMPONENT_CATEGORIES)[number]

export interface CatalogItem {
  name: string
  slug: string
  kind: CatalogKind
  category: ComponentCategory | null
  description: string
  source: string
  exports: string[]
  status: 'stable' | 'deprecated'
}

export const catalog: readonly CatalogItem[] = [
  {
    name: 'Button',
    slug: 'button',
    kind: 'component',
    category: 'Call to action',
    description: 'The action control for commands, links and loading states.',
    source: 'src/components/ui/button.tsx',
    exports: ['Button'],
    status: 'stable',
  },
  {
    name: 'Badge',
    slug: 'badge',
    kind: 'component',
    category: 'Data display',
    description: 'A compact status or category label.',
    source: 'src/components/ui/badge.tsx',
    exports: ['Badge'],
    status: 'stable',
  },
  {
    name: 'Card',
    slug: 'card',
    kind: 'component',
    category: 'Data display',
    description: 'A bordered surface for a small group of related content.',
    source: 'src/components/ui/card.tsx',
    exports: ['Card', 'CardHeader', 'CardTitle', 'CardDescription', 'CardContent', 'CardFooter'],
    status: 'stable',
  },
  {
    name: 'Section',
    slug: 'section',
    kind: 'component',
    category: 'Layout',
    description: 'The container and heading primitives every Block composes for rhythm.',
    source: 'src/components/ui/section.tsx',
    exports: ['Section', 'SectionHeading'],
    status: 'stable',
  },
  {
    name: 'Hero01',
    slug: 'hero-01',
    kind: 'block',
    category: null,
    description: 'A centered marketing hero with an optional eyebrow and one or two actions.',
    source: 'src/blocks/hero-01/index.tsx',
    exports: ['Hero01'],
    status: 'stable',
  },
  {
    name: 'FeatureGrid01',
    slug: 'feature-grid-01',
    kind: 'block',
    category: null,
    description: 'A feature grid with optional icon tiles and a section heading.',
    source: 'src/blocks/feature-grid-01/index.tsx',
    exports: ['FeatureGrid01'],
    status: 'stable',
  },
  {
    name: 'Stats01',
    slug: 'stats-01',
    kind: 'block',
    category: null,
    description: 'A KPI row with optional directional deltas.',
    source: 'src/blocks/stats-01/index.tsx',
    exports: ['Stats01'],
    status: 'stable',
  },
  {
    name: 'Pricing01',
    slug: 'pricing-01',
    kind: 'block',
    category: null,
    description: 'A plan comparison with one highlighted tier.',
    source: 'src/blocks/pricing-01/index.tsx',
    exports: ['Pricing01'],
    status: 'stable',
  },
  {
    name: 'Cta01',
    slug: 'cta-01',
    kind: 'block',
    category: null,
    description: 'A closing call to action on a filled primary surface.',
    source: 'src/blocks/cta-01/index.tsx',
    exports: ['Cta01'],
    status: 'stable',
  },
]

/** Returns the catalogue ordered for display and keyed for lookup. */
export function buildCatalog(items: readonly CatalogItem[] = catalog): CatalogItem[] {
  return [...items].sort((a, b) => a.name.localeCompare(b.name))
}

export const catalogBySlug: ReadonlyMap<string, CatalogItem> = new Map(
  catalog.map((item) => [item.slug, item]),
)
