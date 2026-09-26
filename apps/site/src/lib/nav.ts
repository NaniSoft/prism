import { SECTIONS, type CataloguePageData } from './catalogue'
import { source } from './source'

/**
 * The site's navigation, derived from the one routed tree.
 *
 * Order inside a section is explicit where the order carries meaning (the guide
 * sequence, the Foundations order chosen in ticket 11) and alphabetical
 * otherwise. Nothing here is hand-listed: an item appears because it is a page
 * in the tree, so navigation cannot drift from the routes.
 */

export type NavItem = { title: string; url: string; description?: string }
export type NavSection = { id: string; title: string; url: string; items: NavItem[] }

const GUIDE_ORDER = [
  'quickstart',
  'architecture',
  'composition',
  'theming',
  'agent-workflow',
  'brand',
] as const

const FOUNDATION_ORDER = [
  'colors',
  'iconography',
  'radii',
  'shadows',
  'spacings',
  'typography',
  'motion',
  'variables',
] as const

const CONTENT_ORDER = [
  'about-content',
  'audience',
  'voice',
  'writing-mechanics',
  'product-vocabulary',
  'glossary',
] as const

function lastSegment(url: string): string {
  const parts = url.split('/').filter(Boolean)
  return parts[parts.length - 1] ?? ''
}

function ordered(pages: NavItem[], order: readonly string[]): NavItem[] {
  const rank = new Map(order.map((slug, index) => [slug, index]))
  return [...pages].sort((a, b) => {
    const ra = rank.get(lastSegment(a.url)) ?? Number.MAX_SAFE_INTEGER
    const rb = rank.get(lastSegment(b.url)) ?? Number.MAX_SAFE_INTEGER
    if (ra !== rb) return ra - rb
    return a.title.localeCompare(b.title)
  })
}

function under(prefix: string, predicate?: (page: { url: string }) => boolean): NavItem[] {
  return source
    .getPages()
    .filter((page) => page.url.startsWith(`${prefix}/`))
    .filter((page) => (predicate ? predicate(page) : true))
    .map((page) => ({
      title: (page.data.title as string | undefined) ?? page.url,
      url: page.url,
      description: page.data.description as string | undefined,
    }))
}

export function buildNav(): NavSection[] {
  const sections: NavSection[] = []

  sections.push({
    id: 'docs',
    title: 'Guides',
    url: '/docs',
    items: ordered(under('/docs'), GUIDE_ORDER),
  })

  sections.push({
    id: 'foundations',
    title: 'Foundations',
    url: '/foundations',
    items: ordered(under('/foundations'), FOUNDATION_ORDER),
  })

  sections.push({
    id: 'content',
    title: 'Content',
    url: '/content',
    items: ordered(under('/content'), CONTENT_ORDER),
  })

  for (const kind of ['component', 'block', 'page'] as const) {
    const section = SECTIONS[kind]
    const items = source
      .getPages()
      .filter(
        (page) =>
          page.type === 'catalogue' &&
          !(page.data as CataloguePageData).sectionIndex &&
          (page.data as CataloguePageData).kind === kind,
      )
      .map((page) => ({
        title: (page.data.title as string | undefined) ?? page.url,
        url: page.url,
        description: page.data.description as string | undefined,
      }))
      .sort((a, b) => a.title.localeCompare(b.title))
    sections.push({ id: section.segment, title: section.title, url: `/${section.segment}`, items })
  }

  return sections
}

/** The header's top-level row. Section landing pages, plus the marketing routes. */
export const TOP_NAV = [
  { href: '/', label: 'Overview' },
  { href: '/docs', label: 'Guides' },
  { href: '/foundations', label: 'Foundations' },
  { href: '/components', label: 'Components' },
  { href: '/blocks', label: 'Blocks' },
  { href: '/pages', label: 'Pages' },
  { href: '/content', label: 'Content' },
  { href: '/themes', label: 'Themes' },
] as const

export type FlatNav = { title: string; url: string }

/** Every routed page in reading order, for prev/next. */
export function flattenNav(sections: NavSection[]): FlatNav[] {
  return sections.flatMap((section) => [
    { title: section.title, url: section.url },
    ...section.items.map((item) => ({ title: item.title, url: item.url })),
  ])
}
