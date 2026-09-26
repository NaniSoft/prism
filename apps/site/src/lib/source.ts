import { loader } from 'fumadocs-core/source'
import { pageSchema } from 'fumadocs-core/source/schema'
import { defineCollections } from 'fumadocs-mdx/macro'

import { catalogueSource } from './catalogue'

/**
 * The two content collections, compiled by `fumadocs-mdx`.
 *
 * `site` is the hand-written page tree under `content/`: the guides, the
 * Foundations pages and the Content section. `prose` is the per-item body under
 * `items/<kind>/<slug>.mdx`; it is not routed, only looked up by the item page.
 *
 * `schema: pageSchema` types the frontmatter as `title` plus `description`,
 * which is the shape the page template reads.
 */
export const site = defineCollections({
  type: 'doc',
  dir: 'content',
  files: ['**/*.mdx'],
  schema: pageSchema,
})

export const prose = defineCollections({
  type: 'doc',
  dir: 'items',
  files: ['**/*.mdx'],
  schema: pageSchema,
})

/**
 * The one routed tree: the hand-written `site` pages merged with the catalogue's
 * generated pages, both under `baseUrl: '/'` so a page's `url` is its public
 * path (`/components/button`, `/docs/quickstart`).
 */
export const source = loader(
  {
    site: site.toFumadocsSource(),
    catalogue: catalogueSource,
  },
  { baseUrl: '/' },
)

/**
 * The prose tree, internal only. `/_prose/component/button` is never routed; the
 * item page reads the body it holds.
 */
export const proseSource = loader(
  { prose: prose.toFumadocsSource() },
  { baseUrl: '/_prose' },
)
