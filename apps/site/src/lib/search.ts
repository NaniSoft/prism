import { createSearchAPI, type AdvancedIndex } from 'fumadocs-core/search/server'
import type { StructuredData } from 'fumadocs-core/mdx-plugins/remark-structure'

import { isSearchedRoute } from './sections'
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
 * **The pages a Section holds are not indexed when the Section says they are not.**
 * `isSearchedRoute()` is the whole of it, and the Section manifest owns the
 * answer, so this module names no segment. One Section answers false, and the
 * reason is that the index exists to answer a question, which is how do I use
 * this. A changelog cannot answer it. A changelog is a dated record of what
 * changed, so its value is entirely in its dates and its wording is the package
 * maintainer's rather than a reader's; a reader who searches for it is looking
 * for the version a change landed in, which is a question the routes, the
 * navigation, the Corpus and the tools answer better and already do. It is also
 * the one kind of page here that grows without bound: the text arrives from the
 * changesets generator on every release and is never shortened, so any budget an
 * index containing it is held to is a budget a routine release breaks. Excluding
 * a class of page that a release grows is the design answer; trimming the
 * threshold to fit what a release happens to have produced would make the number
 * a report of history rather than a limit.
 *
 * The exclusion is a decision about the client's index and nothing else. The
 * four changelog routes keep their pages, their navigation entries, the authored
 * index that links them, the Corpus entry, the Markdown mirror and the
 * `get_changelog` tool, so a reader and an agent reach the same bytes they
 * reached before, by navigation, by link, by URL and by tool call. Only the bytes
 * a reader's browser downloads on the first keystroke are not carrying them. The
 * site's search budget gate asserts both halves: the index stays inside its
 * ceiling, and the set of routes it holds is every published page except the ones
 * the manifest excludes, so the exclusion cannot widen without a failing build.
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
  return source
    .getPages()
    .filter((page) => isSearchedRoute(page.url))
    .map((page) => {
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
