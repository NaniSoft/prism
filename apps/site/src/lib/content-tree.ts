import { type CatalogKind } from '@nanisoft/prism-ui/catalog'
import {
  ContentStorageMetaFile,
  ContentStoragePageFile,
  FileSystem,
  type ContentStorage,
  type LoaderPlugin,
  type PageData,
} from 'fumadocs-core/source'

import { itemData, itemFor, KINDS, SECTIONS } from './catalogue'

/**
 * Where a file the one collection reads sits in the routed tree, and what the
 * Catalogue says about an Item's page.
 *
 * **The bridge, moved rather than removed.** The Catalogue is still the only list
 * of what exists, and its routes are still the ones a reader and an agent
 * address: an Item is published at `<section>/<slug>`, and the Section segment is
 * the Catalogue's word for the Item's Kind. What changed is where that route is
 * *stated*. It used to be a `slugs` array on a virtual page the Catalogue emitted,
 * and the Item's body was a document in a second collection looked up by slug at
 * render time, so the page a reader got and the document that held its prose were
 * two things joined in the page template. Now the document is the page, it states
 * its own route in its frontmatter, and this module is the one place that says
 * what the file means: where it sits in the tree, what it is addressed by, and
 * which Catalogue entry speaks for it.
 *
 * **Why the tree position cannot be read out of the file name.** The tree builder
 * nests a folder per directory, and the `pages` array of a meta file names its
 * children by what sits beside it. A Component's documentation is filed under its
 * Category, so `items/component/data-display/avatar/avatar.mdx` belongs at
 * `components/data-display/avatar.mdx` beside the ordering the Catalogue
 * generates for that folder. The route is a different matter and does not follow
 * the folder at all: `components/avatar`, not
 * `components/data-display/avatar/avatar`, which is why the document carries it
 * rather than deriving it.
 *
 * **The Kind and the Category are never read from the file.** They are merged in
 * from `itemData()` below, which reads `buildCatalog()`, and the collection's
 * schema is a strip schema, so a `kind:` or a `category:` in an Item's frontmatter
 * is discarded before this runs. There is no path by which the content tree can
 * become a second list of them: the merge is the only writer, and what it writes
 * it read from the Catalogue.
 *
 * **The group comes from the file, the ordering comes from the manifest, and the
 * two are the same rule read twice.** `items/` is the truth and the grouping is
 * read out of the path, which is what `item-content.mjs` reads and what
 * `item-groups.json` is generated from. If the two ever disagreed, the Item's page
 * would land outside every ordering, the tree would put it in the fallback
 * collection, and `projectNav()` would refuse to render, so the disagreement
 * fails the build rather than publishing a page no sidebar links.
 *
 * **A file this module cannot place stops the build.** A path under neither
 * `content/` nor `items/`, a Kind that is not one of the three, a document that is
 * not in a folder named for it, an Item the Catalogue does not claim, a route that
 * is not the Catalogue's, and a title that is not the Catalogue's name: each is
 * reported by name here. The one collection has to read the whole content tree
 * and place every file in it, because a file nobody places is either a page
 * reachable only by URL or a page nothing links, and both look like a green build.
 *
 * `type` is the collection's own name in the loader, and the coupling is stated
 * rather than inferred. `loader()` writes every source into one storage and each
 * file carries the key it arrived under, so the plugin is told which key read the
 * tree from disk and leaves the Catalogue's generated files exactly where the
 * Catalogue put them. Reading it off a file's own `absolutePath` instead would be
 * a guess about where a source came from; this way the two sources are the two
 * the loader was handed.
 */
export function contentTree(type: string): LoaderPlugin<ContentStorage> {
  return {
    name: 'prism:content-tree',
    transformStorage({ storage }) {
      // A fresh file system rather than a rename in place, so the projected tree
      // is built by the same code that built the unprojected one and cannot leave
      // a half-renamed folder behind for the tree builder to find.
      const routed = new FileSystem<ContentStoragePageFile | ContentStorageMetaFile>()

      for (const read of storage.getFiles()) {
        const file = storage.read(read)
        if (!file) continue
        const path = file.type === type ? place(file, read) : read
        file.path = path
        const claimed = routed.read(path)
        if (claimed !== undefined) {
          // Two sources claiming one virtual path resolve by write order,
          // silently. That is a hazard this module records rather than one it
          // fixes, because the collision has to be observed before it can be
          // gated; here it is observed, and the projection is the one place both
          // files pass through, so it is the one place it can be named.
          throw new Error(
            `the routed tree holds ${path} twice, from ${String(claimed.absolutePath ?? 'the Catalogue')} ` +
              `and from ${String(file.absolutePath ?? 'the Catalogue')}, and one of them would be ` +
              'published at the route of the other. The site collection is listed first, so the ' +
              'second write wins with no warning.',
          )
        }
        routed.write(path, file)
      }

      storage.files = routed.files
      storage.folders = routed.folders
    },
  }
}

/** Where a file the collection read belongs, and what its page carries. */
function place(file: ContentStoragePageFile | ContentStorageMetaFile, read: string): string {
  const path = routedPath(read)
  if (file.format === 'page') {
    if (isItemDocument(read)) placeItem(file, read)
    else placeContent(file, read)
  }
  return path
}

/** The two folders the one collection reads, and the only two it may read. */
const CONTENT = 'content'
const ITEMS = 'items'

/** Whether the collection read this file out of the Item tree. */
function isItemDocument(file: string): boolean {
  return file.startsWith(`${ITEMS}/`)
}

/**
 * The route a page states in its frontmatter, or nothing.
 *
 * Read as `unknown` because the projection runs over the whole collection and
 * the shape that reaches it is a union: an Item page, a content page and a
 * generated changelog copy. The collection's schema is what decides which of them
 * can hold the key, and it is a strip schema, so a page that did not state a
 * route has no key to read rather than an empty one.
 */
function declaredRoute(data: PageData): string | undefined {
  const value = (data as { slug?: unknown }).slug
  return typeof value === 'string' ? value : undefined
}

/** The path a file the collection read occupies in the routed tree. */
export function routedPath(file: string): string {
  if (file.startsWith(`${CONTENT}/`)) {
    // The content tree's own root is the routed tree's root, which is why the
    // root `meta.json` orders the Sections and nothing above them.
    return file.slice(CONTENT.length + 1)
  }
  if (isItemDocument(file)) return itemPath(file, itemOf(file))
  throw new Error(
    `the site collection read ${file}, which is under neither ${CONTENT}/ nor ${ITEMS}/, so there ` +
      'is nowhere in the routed tree to put it. The one collection reads the whole content tree, ' +
      'so every file it compiles has to be one of its files.',
  )
}

/**
 * What a document in the Item tree says about itself, from where it is filed.
 *
 * `items/<kind>/<group...>/<slug>/<slug>.mdx` is an Item of that Kind, in that
 * group, with that slug. The Kind is the Catalogue's word for the Item and the
 * group is the Item's place in the tree; neither is read from a frontmatter key
 * and neither is invented here.
 */
function itemOf(file: string): { kind: CatalogKind; slug: string; group: string[] } {
  const segments = file.split('/')
  const kind = segments[1]
  if (kind === undefined || !(KINDS as readonly string[]).includes(kind)) {
    throw new Error(
      `${file} is filed under '${kind ?? ''}', which names no Kind. An Item's documentation is ` +
        `filed under its Kind, and the Kinds are: ${KINDS.join(', ')}.`,
    )
  }
  return {
    kind: kind as CatalogKind,
    slug: segments[segments.length - 2] ?? '',
    group: segments.slice(2, -2),
  }
}

/**
 * The tree position of an Item's page, from where its documentation is filed.
 *
 * The Kind becomes the Section segment, the folders between the Kind and the Item
 * are the Item's place in the tree, and the Item's own folder is the page. Being
 * in a folder named for the Item is what makes this a page rather than a folder
 * holding one, and it is the same rule `item-content.mjs` states for the Demo
 * beside it.
 */
function itemPath(file: string, item: { kind: CatalogKind; slug: string; group: string[] }): string {
  if (item.slug === '' || !file.endsWith(`/${item.slug}/${item.slug}.mdx`)) {
    throw new Error(
      `${file} is not in a folder named for it, so it has no place in the routed tree and no ` +
        'Demo beside it either. One folder per Item holds both, and the corpus and the gate each ' +
        'report a document that is not in one.',
    )
  }
  return [SECTIONS[item.kind].segment, ...item.group, `${item.slug}.mdx`].join('/')
}

/**
 * An Item's page: its route from the document, its data from the Catalogue.
 *
 * The route is asserted rather than adopted. Forty-two addresses are published,
 * the Corpus advertises them and every cached agent instruction that names one
 * resolves it, so a document whose declared route is not the Catalogue's is a
 * published-surface change and has to be refused here, where the route is
 * produced, rather than discovered by a reader following a link that 404s.
 */
function placeItem(file: ContentStoragePageFile, read: string): void {
  const { kind, slug } = itemOf(read)
  const item = itemFor(kind, slug)
  if (item === undefined) {
    throw new Error(
      `${read} documents the ${kind} '${slug}', which no Catalogue Item claims, so the content ` +
        'tree has become a second list. Existence, Kind and Category come from the Catalogue.',
    )
  }
  const route = `${SECTIONS[kind].segment}/${item.slug}`
  const declared = declaredRoute(file.data)
  if (declared === undefined) {
    throw new Error(
      `${read} states no route in its frontmatter, and the Catalogue publishes the ` +
        `${item.kind} ${item.name} at /${route}. An Item is filed under its Kind and its ` +
        'Category while it is published at its Section, so the two cannot both be read out of ' +
        'the path and the page has to say which one it is.',
    )
  }
  if (declared !== route) {
    throw new Error(
      `${read} states the route '${declared}', and the Catalogue publishes the ${item.kind} ` +
        `${item.name} at /${route}, so the two disagree about a published address. The Corpus ` +
        'advertises the Catalogue route, and an agent holding a cached index resolves that one.',
    )
  }
  if (file.data.title !== item.name) {
    throw new Error(
      `${read} is titled '${file.data.title ?? 'nothing'}' and the Catalogue calls this Item ` +
        `${item.name}. The name a reader is shown comes from the Catalogue, and a second name in ` +
        'the frontmatter is a second list of it.',
    )
  }
  file.slugs = route.split('/')
  file.data = { ...file.data, ...itemData(item) }
}

/**
 * A content page: the route it is addressed by is where it sits.
 *
 * The one exception is the Changelogs Section, whose files are byte-for-byte
 * copies of a package's own `CHANGELOG.md` and carry no frontmatter at all. They
 * are read by the generated schema and land here with no `slug` key, which is the
 * only thing this check allows.
 */
function placeContent(file: ContentStoragePageFile, read: string): void {
  const declared = declaredRoute(file.data)
  if (declared === undefined) return
  throw new Error(
    `${read} states the route '${declared}'. A content page is addressed by where it is filed, ` +
      'and only an Item states a route, because only an Item is filed under a Kind and a ' +
      'Category rather than under the Section a reader reaches it from.',
  )
}
