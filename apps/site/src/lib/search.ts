import { createSearchAPI, type AdvancedIndex } from 'fumadocs-core/search/server'
import type { StructuredData } from 'fumadocs-core/mdx-plugins/remark-structure'

import { buildCatalog } from '@nanisoft/prism-ui/catalog'

import { proseSource, source } from './source'
import type { CataloguePageData } from './catalogue'

/**
 * The static search index, assembled from both trees.
 *
 * The routed `source` carries the hand-written pages, each of which has a
 * compiled `structuredData` (headings and content blocks) that advanced mode
 * explodes into searchable documents. It also carries the catalogue's virtual
 * pages, which have metadata but no body; the item bodies live in the `prose`
 * tree, so those are indexed from there and their `/_prose/...` location is
 * rewritten to the public item URL.
 *
 * No custom tokenizer is passed. The default `multilingual` tokenizer is used by
 * both the build (here) and the browser (the same `fumadocs-core` version), so
 * the query is tokenized identically by construction. Ticket 10's shared-tokenizer
 * requirement is about a *custom* tokenizer drifting; there is none to drift.
 */

const EMPTY: StructuredData = { headings: [], contents: [] }

function structured(data: { structuredData?: unknown }): StructuredData {
  const value = data.structuredData
  return (value as StructuredData | undefined) ?? EMPTY
}

export function buildSearchIndexes(): AdvancedIndex[] {
  const indexed: AdvancedIndex[] = []
  const catalogue = buildCatalog()
  const bySlug = new Map(catalogue.map((item) => [item.slug, item]))

  for (const page of source.getPages()) {
    const data = page.data as CataloguePageData
    if (data.sectionIndex) {
      indexed.push({
        id: page.url,
        title: (page.data.title as string | undefined) ?? page.url,
        description: page.data.description as string | undefined,
        url: page.url,
        structuredData: EMPTY,
      })
      continue
    }

    // Catalogue item pages are indexed from the prose tree below, so an item
    // appears once and carries its body rather than its catalogue one-liner.
    if (page.type === 'catalogue') continue

    indexed.push({
      id: page.url,
      title: (page.data.title as string | undefined) ?? page.url,
      description: page.data.description as string | undefined,
      url: page.url,
      structuredData: structured(page.data),
    })
  }

  for (const page of proseSource.getPages()) {
    const [kind, slug] = page.slugs
    if (!kind || !slug) continue
    const item = bySlug.get(slug)
    const url = `/${kind}s/${slug}`
    indexed.push({
      id: url,
      title: item?.name ?? (page.data.title as string | undefined) ?? url,
      description: item?.description ?? (page.data.description as string | undefined),
      url,
      structuredData: structured(page.data),
    })
  }

  return indexed
}

export const searchAPI = createSearchAPI('advanced', { indexes: buildSearchIndexes() })
