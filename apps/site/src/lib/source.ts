import { loader } from 'fumadocs-core/source'
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema'
import { defineCollections, defineDocs } from 'fumadocs-mdx/macro'

import { catalogueSource } from './catalogue'
import { PAGE_TREE } from './nav'

/**
 * The two content collections, compiled by `fumadocs-mdx`.
 *
 * `site` is the hand-written page tree under `content/`: the guides, the
 * Foundations pages and the Content section. It is declared with `defineDocs`
 * rather than `defineCollections({ type: 'doc' })` because that form has no meta
 * side, which left every `meta.json` beside a page inert. It has a meta side
 * now, and it carries the order of the tree: one file per folder, naming the
 * pages beneath it. `prose` stays a plain doc collection, because the item
 * bodies under `items/` are looked up by slug at render time and there is no
 * folder order to express.
 *
 * `schema: pageSchema` types a page's frontmatter as `title` plus `description`,
 * which is the shape the page template reads. `schema: metaSchema` types a meta
 * file, and the set of keys it accepts is the whole vocabulary available to
 * order the tree: `title`, `pages`, `pagesIndex`, `description`, `root`,
 * `defaultOpen`, `collapsible` and `icon`. The schema strips what it does not
 * know, so a key outside that list is not rejected, it is discarded. There is no
 * `folders` key, and writing one produces a meta file that reads as though it
 * ordered something and orders nothing.
 *
 * `meta.files` is JSON only. The repository states every machine-readable fact
 * it owns in JSON, and a meta file in another dialect would arrive with no gate
 * over it.
 */
export const site = defineDocs({
  dir: 'content',
  docs: { files: ['**/*.mdx'], schema: pageSchema },
  meta: { files: ['**/*.json'], schema: metaSchema },
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
 *
 * `site` is listed first, so it writes first, and two sources claiming the same
 * virtual path resolve by write order with no warning. That is a hazard this
 * module records rather than one it fixes, because the collision has to be
 * observed before it can be gated.
 *
 * `PAGE_TREE` is empty and the two flags it deliberately omits are the ones that
 * would break a folder's metadata and its index lookup. It is declared in
 * `nav.ts` beside the projection that depends on both, and its emptiness is
 * asserted rather than assumed.
 */
export const source = loader(
  {
    site: site.toFumadocsSource(),
    catalogue: catalogueSource,
  },
  { baseUrl: '/', pageTree: PAGE_TREE },
)

/**
 * The prose tree, internal only. `/_prose/component/button` is never routed; the
 * item page reads the body it holds.
 *
 * `itemSlugs` is what keeps that lookup working while the tree grows folders. A
 * document is addressed by the Item that names it: the top folder is its Kind
 * and its own file name is its slug, and every folder between them is the
 * content tree's business rather than the lookup's. Without it, filing a
 * Component under its Category would move its prose route to
 * `/_prose/component/data-display/card/card` and the Item page would quietly
 * render "no prose has been authored for this item yet", with a green build and
 * a page that looks complete. The file name is the Item's slug because the
 * content-join gate fails the build when it is not, so this rule and the gate
 * read the same identity from the same place.
 */
export const proseSource = loader(
  { prose: prose.toFumadocsSource() },
  {
    baseUrl: '/_prose',
    slugs: (file) => {
      const segments = file.path.split('/')
      return [segments[0] ?? '', (segments[segments.length - 1] ?? '').replace(/\.mdx$/, '')]
    },
  },
)
