import { loader } from 'fumadocs-core/source'
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema'
import { defineDocs } from 'fumadocs-mdx/macro'
import { z } from 'zod'

import { catalogueSource } from './catalogue'
import { contentTree } from './content-tree'
import { PAGE_TREE } from './nav'

/** The one extension the content tree is copied in rather than authored in. */
const GENERATED = '.md'

/**
 * A page's own first heading, which is the only title a generated file has.
 *
 * A published package's `CHANGELOG.md` is copied into the content tree byte for
 * byte, so it has no frontmatter to take a title from and its first line is its
 * own name. Deriving the title from those bytes is what keeps the two true at
 * once: injecting frontmatter would give the page a title and break the
 * property the Section exists for, which is that the site's text and the
 * package's text are the same bytes.
 *
 * The corpus derives the same title from the same bytes, from the shared
 * changelog rule in `scripts/published-packages.mjs`, and the content-join gate
 * asserts that the heading names the package whose route it was filed under.
 * The two cannot be pointed at one module from here, because this one is bundled
 * into the app and that one reads the workspace, so the join is what holds them
 * together rather than a shared import.
 */
function firstHeading(source: string): string {
  for (const line of source.split(/\r?\n/)) {
    const heading = /^#\s+(.+?)\s*$/.exec(line)
    if (heading) return heading[1] ?? ''
  }
  return ''
}

/**
 * The schema a generated page is read with.
 *
 * `pageSchema` requires a `title`, which a byte-for-byte copy of a package's
 * changelog cannot have. The title is derived instead of authored, and
 * `selfTitled` records that the file already opens with its own heading, so the
 * page frame prints one heading rather than the same heading twice. It is not a
 * `kind` and not a `category`: it says where the title came from, it is derived
 * from the file rather than read from frontmatter, and no author can set it.
 */
function generatedSchema(source: string) {
  return z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
    })
    .transform(({ title, description }) => ({
      title: title ?? firstHeading(source),
      ...(description === undefined ? {} : { description }),
      selfTitled: true,
    }))
}

/**
 * The schema an authored page is read with: the page schema plus a stated route.
 *
 * `pageSchema` types a page's frontmatter as `title` plus `description`, which is
 * the shape the page template reads. The schema strips what it does not know, so
 * a key outside that list is not rejected, it is discarded.
 *
 * `slug` is the one addition, and it is the route a page states rather than
 * inherits. Every Item page carries it, because an Item is filed under its Kind
 * and its Category while it is published at `<section>/<slug>`, so the two cannot
 * both be read out of the path. A content page carries none and is addressed by
 * where it sits; `content-tree.ts` refuses either mistake. It is optional here
 * rather than required so one schema reads both halves of the tree, and it is a
 * plain string rather than a route object, so the only thing that decides what a
 * page's route means is the projection.
 *
 * There is no `kind` and no `category` key, and adding one would achieve nothing:
 * the schema strips it. Existence, Kind and Category come from the Catalogue, and
 * `content-tree.ts` merges them into the page's data from `buildCatalog()`.
 */
const authoredSchema = pageSchema.extend({ slug: z.string().optional() })

/**
 * The one content collection: the whole content tree, read in one place.
 *
 * It is rooted at the site rather than at `content/`, because the content tree is
 * two trees today and both of them are documentation: the hand-written pages
 * under `content/`, and an Item's documentation beside its Demo under `items/`.
 * One collection reading the whole tree is what makes an Item's page a page
 * rather than a lookup. There is no second collection, no private base URL and
 * no slug join at render time: the Item page the Catalogue's ordering names is
 * the file that holds the prose, and the route is stated in that file.
 *
 * The globs are literals on purpose: the macro reads them statically to decide
 * how content files are bundled, and it refuses a computed array rather than
 * guessing which files belong to the collection. A collection is named for a
 * tree and holds a tree, so one `defineDocs` with a meta side covers both halves;
 * `defineCollections({ type: 'doc' })` has no meta side, which is what left every
 * `meta.json` beside a page inert until the tree grew one.
 *
 * `metaSchema` types a meta file, and the set of keys it accepts is the whole
 * vocabulary available to order the tree: `title`, `pages`, `pagesIndex`,
 * `description`, `root`, `defaultOpen`, `collapsible` and `icon`. There is no
 * `folders` key, and writing one produces a meta file that reads as though it
 * ordered something and orders nothing. `meta.files` is JSON only: the repository
 * states every machine-readable fact it owns in JSON, and a meta file in another
 * dialect would arrive with no gate over it.
 *
 * Two extensions, for two reasons. The authored pages are `.mdx`; the
 * Changelogs Section is `.md`, because its per-package files are copies of a
 * package's `CHANGELOG.md` and re-serialising them into MDX would put a second
 * copy of every changelog between the package and the reader. The two are told
 * apart by the schema, which is a function of the file, so a `.mdx` page still
 * has to declare its `title` in frontmatter and only a generated file derives
 * one.
 */
export const site = defineDocs({
  dir: '.',
  docs: {
    files: ['content/**/*.mdx', 'content/**/*.md', 'items/**/*.mdx'],
    schema: ({ path, source }) =>
      path.endsWith(GENERATED) ? generatedSchema(source) : authoredSchema,
  },
  meta: { files: ['content/**/*.json'], schema: metaSchema },
})

/**
 * The one routed tree: the hand-written `site` pages and the catalogue's
 * generated Section landing pages and orderings, both under `baseUrl: '/'` so a
 * page's `url` is its public path (`/components/button`, `/docs/quickstart`).
 *
 * `site` is listed first, so it writes first, and two sources claiming the same
 * virtual path would resolve by write order with no warning. `contentTree('site')`
 * is the plugin that watches for it, because it is the one place every path in the
 * tree passes through, and it is the difference between a page that is published
 * at the route of another and a build that says which two files collided.
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
  { baseUrl: '/', pageTree: PAGE_TREE, plugins: [contentTree('site')] },
)
