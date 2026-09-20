/**
 * `search_docs` — dependency-free term-frequency ranking over the bundled
 * corpus (ADR-0004 §1: plasma's recipe; the corpus is small enough that no
 * search index earns its bundle size). One entry point over items and docs
 * pages; the component/block/page/doc distinction is a `kind` filter.
 */

import type { PrismDocsItem, PrismDocsStore } from './store.js';
import type { ItemKind } from './lookup.js';

/** `SearchKind`'s `'doc'` means a docs page, not a `page`-kind catalog item. */
export type SearchKind = ItemKind | 'doc';

export interface SearchHit {
  /** The item name or the page title, as the result heading shows it. */
  readonly title: string;
  /** `component | block | page` for catalog items, `doc` for docs pages. */
  readonly kind: SearchKind;
  /** The one-liner the hit is sold with — the same text llms.txt bullets use. */
  readonly snippet: string;
  /** The exact follow-up call the result prints for the agent to make. */
  readonly followUp: string;
}

export interface SearchQuery {
  readonly query: string;
  readonly kind?: SearchKind;
  readonly limit?: number;
}

/** Field weights: a name hit outranks a description hit outranks a body hit. */
const WEIGHTS = { name: 8, summary: 3, body: 1 } as const;

/** Default cap — ADR-0004 §7: "search caps at 5 hits with snippets". */
export const DEFAULT_SEARCH_LIMIT = 5;
export const MAX_SEARCH_LIMIT = 10;

export function searchCorpus(docs: PrismDocsStore, { query, kind, limit = DEFAULT_SEARCH_LIMIT }: SearchQuery): SearchHit[] {
  const terms = tokenize(query);
  const capped = Math.min(Math.max(limit, 1), MAX_SEARCH_LIMIT);

  const scoreItem = (item: PrismDocsItem): number =>
    terms.reduce(
      (total, term) =>
        total +
        WEIGHTS.name * countOccurrences(item.name.toLowerCase(), term) +
        WEIGHTS.summary * countOccurrences(item.description.toLowerCase(), term) +
        WEIGHTS.body * countOccurrences(item.doc.toLowerCase(), term),
      0,
    );

  const scorePage = (page: PrismDocsStore['pages'][number]): number =>
    terms.reduce(
      (total, term) =>
        total +
        WEIGHTS.name * countOccurrences(page.title.toLowerCase(), term) +
        WEIGHTS.summary * countOccurrences((page.description ?? '').toLowerCase(), term) +
        WEIGHTS.body * countOccurrences(page.markdown.toLowerCase(), term),
      0,
    );

  const wantItems = kind === undefined || kind !== 'doc';
  const wantPages = kind === undefined || kind === 'doc';

  const candidates: Array<SearchHit & { score: number }> = [];
  if (wantItems) {
    for (const item of docs.items) {
      if (kind !== undefined && item.kind !== kind) continue;
      const score = scoreItem(item);
      if (score > 0) candidates.push({ score, title: item.name, kind: item.kind, snippet: item.description, followUp: followUpForItem(item) });
    }
  }
  if (wantPages) {
    for (const page of docs.pages) {
      const score = scorePage(page);
      if (score > 0) candidates.push({ score, title: page.title, kind: 'doc', snippet: page.description ?? page.title, followUp: `get_page { "url": "${page.url}" }` });
    }
  }

  return candidates
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, capped)
    .map(({ score: _score, ...hit }) => hit);
}

/** The next call a search hit (or doc footer) prints, steered by the data. */
export function followUpForItem(item: PrismDocsItem): string {
  if ((item.examples?.length ?? 0) > 0) return `get_item_source { "name": "${item.name}" }`;
  if (item.antdBase) return `antd_info ${item.antdBase} (antd MCP)`;
  return `get_item_doc { "name": "${item.name}" }`;
}

/** Lower-case word tokens; empty for a whitespace-only query. */
export function tokenize(query: string): string[] {
  return query.toLowerCase().split(/[^a-z0-9]+/).filter((term) => term.length > 0);
}

function countOccurrences(haystack: string, needle: string): number {
  let count = 0;
  let from = haystack.indexOf(needle);
  while (from !== -1) {
    count += 1;
    from = haystack.indexOf(needle, from + needle.length);
  }
  return count;
}
