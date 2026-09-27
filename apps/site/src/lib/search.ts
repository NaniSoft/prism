import { createSearchAPI, type AdvancedIndex } from 'fumadocs-core/search/server'
import type { StructuredData } from 'fumadocs-core/mdx-plugins/remark-structure'

import { source } from './source'
import type { CataloguePageData } from './catalogue'

/**
 * The static search index, assembled from the one routed tree.
 *
 * Every page the site publishes is indexed, and each carries its own compiled
 * `structuredData` (headings and content blocks), which advanced mode explodes
 * into searchable documents. An Item's page is its documentation, so the body a
 * reader reads and the body an agent searches are the same bytes read from the
 * same file: there is no second tree to walk, no location to rewrite, and no page
 * that can be published without being indexed.
 *
 * The one page with nothing to index is a Section landing page. The Catalogue
 * generates it, so it holds metadata and no body, and it is indexed by its title
 * and its route, which is what a reader searching for a Section expects to find.
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
  return source.getPages().map((page) => {
    const data = page.data as CataloguePageData
    return {
      id: page.url,
      title: (page.data.title as string | undefined) ?? page.url,
      description: page.data.description as string | undefined,
      url: page.url,
      structuredData: data.sectionIndex === true ? EMPTY : structured(page.data),
    }
  })
}

export const searchAPI = createSearchAPI('advanced', { indexes: buildSearchIndexes() })
