/**
 * Case-insensitive resolution over the bundled corpus, with did-you-mean
 * suggestions on a miss (ADR-0004 §2: lookups are case-insensitive and a miss
 * returns the closest matches plus a browse pointer — never a throw).
 *
 * Maps are built once per `createPrismMcpServer()` call — per request on the
 * Worker lane, never at isolate scope (ticket 05's startup-limit rule).
 */

import type { PrismDocsItem, PrismDocsPage, PrismDocsTheme } from './store.js';

/** One catalog item kind — the `kind` parameter shared by the item tools. */
export type ItemKind = PrismDocsItem['kind'];

/** Order the catalog tools group and count kinds in. */
export const ITEM_KINDS: readonly ItemKind[] = ['component', 'block', 'page'];

/** The theme atom a bare `get_theme_doc()` answers with. */
export const DEFAULT_PACK = 'blue';
export const DEFAULT_MODE = 'light';

/** Lower-cased, trimmed lookup key. */
const fold = (value: string): string => value.trim().toLowerCase();

/** Smallest-edit-distance suggestions, closest and shortest first. */
export function didYouMean(query: string, candidates: readonly string[], limit = 3): string[] {
  const target = fold(query);
  return candidates
    .map((candidate) => {
      const folded = fold(candidate);
      // A substring hit is a better lead than its raw edit distance suggests.
      const distance = folded.includes(target) ? Math.min(levenshtein(target, folded), 1) : levenshtein(target, folded);
      return { candidate, distance };
    })
    .filter((entry) => entry.distance <= 3)
    .sort((a, b) => a.distance - b.distance || a.candidate.length - b.candidate.length)
    .slice(0, limit)
    .map((entry) => entry.candidate);
}

/** Classic two-row Levenshtein distance, case-folded by the caller. */
function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    for (let j = 1; j <= b.length; j += 1) {
      const substitution = (previous[j - 1] ?? 0) + (a[i - 1] === b[j - 1] ? 0 : 1);
      current.push(Math.min((previous[j] ?? 0) + 1, (current[j - 1] ?? 0) + 1, substitution));
    }
    previous = current;
  }
  return previous[b.length] ?? a.length + b.length;
}

/** What resolving an item name produced. */
export type ItemMatch =
  | { readonly status: 'ok'; readonly item: PrismDocsItem }
  | { readonly status: 'kind-mismatch'; readonly item: PrismDocsItem }
  | { readonly status: 'miss'; readonly suggestions: readonly string[] };

export interface ItemLookup {
  /** Every item name, in corpus order — the suggestion pool and catalog input. */
  readonly names: readonly string[];
  find(name: string, kind?: ItemKind): ItemMatch;
  suggest(name: string): readonly string[];
}

export function createItemLookup(items: readonly PrismDocsItem[]): ItemLookup {
  const byKey = new Map(items.map((item) => [fold(item.name), item] as const));
  const names = items.map((item) => item.name);
  return {
    names,
    find(name, kind) {
      const item = byKey.get(fold(name));
      if (!item) return { status: 'miss', suggestions: didYouMean(name, names) };
      // `kind` is a disambiguator, not a filter: a wrong one is a miss the
      // agent must hear about, not a silent hit for the wrong entity.
      if (kind && item.kind !== kind) return { status: 'kind-mismatch', item };
      return { status: 'ok', item };
    },
    suggest: (name) => didYouMean(name, names),
  };
}

export interface PageLookup {
  /** Every page url, in corpus order. */
  readonly urls: readonly string[];
  find(url: string): PrismDocsPage | undefined;
  suggest(url: string): readonly string[];
}

/**
 * Site-pathname lookup (`/docs/theming`), tolerant of case, trailing slashes,
 * and absolute site URLs (`https://prism.nanisoft.com/docs/theming`).
 */
export function createPageLookup(pages: readonly PrismDocsPage[], baseUrl: string): PageLookup {
  const origin = baseUrl.replace(/\/+$/, '');
  const keyOf = (url: string): string => {
    let path = url.trim();
    if (path.toLowerCase().startsWith(origin.toLowerCase())) path = path.slice(origin.length) || '/';
    if (path.length > 1) path = path.replace(/\/+$/, '');
    return fold(path);
  };

  const byKey = new Map(pages.map((page) => [keyOf(page.url), page] as const));
  const urls = pages.map((page) => page.url);
  return {
    urls,
    find: (url) => byKey.get(keyOf(url)),
    suggest: (url) => didYouMean(keyOf(url), urls),
  };
}

export interface ThemeLookup {
  /** Every theme-atom slug, in corpus order. */
  readonly slugs: readonly string[];
  find(pack: string, mode: string): PrismDocsTheme | undefined;
  suggest(slug: string): readonly string[];
}

/** Theme atoms are slugged `<pack>-<mode>` (prism-llms emits four). */
export const themeSlug = (pack: string, mode: string): string => `${pack}-${mode}`;

export function createThemeLookup(themes: readonly PrismDocsTheme[]): ThemeLookup {
  const byKey = new Map(themes.map((theme) => [fold(theme.slug), theme] as const));
  const slugs = themes.map((theme) => theme.slug);
  return {
    slugs,
    find: (pack, mode) => byKey.get(fold(themeSlug(pack, mode))),
    suggest: (slug) => didYouMean(slug, slugs),
  };
}

/** Resolve which example's source `get_item_source` should return. */
export type ExampleMatch =
  | { readonly status: 'ok'; readonly example: NonNullable<PrismDocsItem['examples']>[number] }
  | { readonly status: 'none' }
  | { readonly status: 'miss'; readonly suggestions: readonly string[] };

export function resolveExample(item: PrismDocsItem, slug?: string): ExampleMatch {
  const examples = item.examples ?? [];
  if (examples.length === 0) return { status: 'none' };
  if (slug === undefined) return { status: 'ok', example: examples[0]! };

  const byKey = new Map(examples.map((example) => [fold(example.slug), example] as const));
  const example = byKey.get(fold(slug));
  if (example) return { status: 'ok', example };
  return { status: 'miss', suggestions: didYouMean(slug, examples.map((entry) => entry.slug)) };
}
