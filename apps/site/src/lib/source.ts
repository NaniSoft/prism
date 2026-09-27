import { loader } from 'fumadocs-core/source'
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema'
import { defineCollections, defineDocs } from 'fumadocs-mdx/macro'
import { z } from 'zod'

import { catalogueSource } from './catalogue'
import { PAGE_TREE } from './nav'

/** The two extensions the content tree is read in. */
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
 * `site` reads two extensions. The authored pages are `.mdx`; the Changelogs
 * Section is `.md`, because its per-package files are copies of a package's
 * `CHANGELOG.md` and re-serialising them into MDX would put a second copy of
 * every changelog between the package and the reader. The two are told apart by
 * the schema, which is a function of the file, so a `.mdx` page still has to
 * declare its `title` in frontmatter and only a generated file derives one.
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
  docs: {
    // Both globs are literals on purpose: the macro reads them statically to
    // decide how content files are bundled, and it refuses a computed array
    // rather than guessing which files belong to the collection.
    files: ['**/*.mdx', '**/*.md'],
    schema: ({ path, source }) =>
      path.endsWith(GENERATED) ? generatedSchema(source) : pageSchema,
  },
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
