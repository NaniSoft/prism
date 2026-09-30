import { buildSimpleIndexes } from '@/lib/search'

/**
 * The static search index, in the shape the bar's dialog reads.
 *
 * `revalidate = false` is the static marker Next.js accepts on a route handler
 * under `output: 'export'`; without it or `dynamic = 'force-static'`, the export
 * build fails. `staticGET` serialises the whole index as one JSON body, which
 * the client downloads lazily when the reader opens search.
 *
 * **The body is the array, not a serialised search engine.** This route used to hand
 * the same pages to `createSearchAPI('simple', ...)`, which serialises FlexSearch's
 * inverted index: an object with an internal document-id store and a token table, at
 * 1.5 MB. The bar's `SearchDialog` does not read a search engine's index, it reads an
 * array of `{ id, title, url, description?, content?, breadcrumbs? }` and filters it in
 * the browser, and it defends itself against anything else by setting its entries to
 * an empty list. So the payload was 1.5 MB of bytes the dialog silently discarded, and
 * every search on this site answered "No matches." with a network panel that looked
 * healthy. The four consumer sites emit the array because that is the contract; this
 * one was the only site still emitting an engine's index into a dialog that cannot
 * read one.
 *
 * The pages indexed are unchanged, and so is the reason one Section is not among them:
 * `buildSimpleIndexes()` is the same function, and the manifest still owns the
 * exclusion. What changed is the serialisation, so the index is smaller rather than
 * different, and `scripts/check-search-budget.mjs` reads the array as well as the two
 * engine shapes it used to know.
 */
export const revalidate = false

export function staticGET(): Response {
  return Response.json(buildSimpleIndexes())
}

export const GET = staticGET
