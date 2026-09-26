import { searchAPI } from '@/lib/search'

/**
 * The static search index.
 *
 * `revalidate = false` is the static marker Next.js accepts on a route handler
 * under `output: 'export'`; without it or `dynamic = 'force-static'`, the export
 * build fails. `staticGET` serialises the whole index as one JSON body, which
 * the client downloads lazily on first search.
 */
export const revalidate = false

export const { staticGET: GET } = searchAPI
