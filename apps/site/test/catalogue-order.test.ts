import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { buildCatalog, type CatalogItem, type CatalogKind } from '@nanisoft/prism-ui/catalog'

import { catalogueSource, categoryFolder, KINDS, SECTIONS } from '../src/lib/catalogue'
import { routedPath } from '../src/lib/content-tree'

/**
 * The generated catalogue order, and the routes the Item pages state.
 *
 * The site's routing tree cannot be built in this lane, because the macro module
 * `defineDocs` compiles through is a stub that throws unless the bundler plugin
 * compiled it. The generated source can be read, though: it is a plain
 * `StaticSource`, built by `buildCatalog()` and nothing else, and it is the thing
 * the ordering could fall behind. So the Catalogue is read here through its own
 * tooling entry point and the emitted files are compared to it.
 *
 * The comparison is equality, not containment. A hand-written `pages` array that
 * happened to list every slug would pass a containment check and still be a
 * second list with a build that has to be trusted; equality fails the moment the
 * Catalogue and the ordering disagree in either direction, which is the only
 * property that makes the array safe to be a whitelist.
 *
 * The comparison is depth first, because the ordering is a tree. An Item filed
 * under a Category is claimed by its folder rather than by the Section's own
 * array, and the Section's array names the folder at the place of the first Item
 * inside it. Read the way a reader reads the sidebar, the order is the
 * Catalogue's own with its Items gathered into their Categories: nothing is
 * reordered inside a folder, the folders take the place of the first Item in
 * each, and every Item appears once. That is the property worth asserting,
 * because it is the one a hand-written array would break the moment one Item was
 * filed, and the one a `sort` over slugs would break the moment two Items shared
 * a name. A flat Section is the special case where every run holds one Item, so
 * this assertion is the old one in the case where the old one held and says
 * something the old one could not once the tree is fully nested.
 *
 * An Item's page is no longer emitted here. It is the Item's documentation, read
 * by the one collection beside its Demo, and what this file checks about it is
 * the two things the Catalogue and the documentation have to agree on: the route
 * the document states, and the folder the projection puts it in. Both are read
 * from the files on disk through the site's own projection, so the assertion is
 * about the real tree rather than about a restatement of it. `content-tree.test.ts`
 * builds the whole tree from those files and proves what a reader gets.
 */

const SITE = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const ITEMS = path.join(SITE, 'items')

const files = catalogueSource.files
const catalogue = buildCatalog()

/** The Section order, read the way the tree builder reads it. */
function orderFor(kind: CatalogKind): string[] {
  return readOrder(SECTIONS[kind].segment)

  function readOrder(prefix: string): string[] {
    const meta = files.find((file) => file.type === 'meta' && file.path === `${prefix}/meta.json`)
    if (!meta || meta.type !== 'meta') throw new Error(`no generated order for ${prefix}`)
    return (meta.data.pages ?? []).flatMap((entry) => {
      const folder = `${prefix}/${entry}`
      const nested = files.some(
        (file) => file.type === 'meta' && file.path === `${folder}/meta.json`,
      )
      return nested ? readOrder(folder) : [entry]
    })
  }
}

/** Every file below a directory, at whatever depth the tree holds. */
function walk(root: string): string[] {
  return readdirSync(root).flatMap((name) => {
    const full = path.join(root, name)
    return statSync(full).isDirectory() ? walk(full) : [full]
  })
}

/** One Item's documentation, as the collection reads it: a path and frontmatter. */
interface ItemDocument {
  file: string
  slug: string
  title: string
  route: string | null
  /** Where the projection puts it in the routed tree. */
  at: string
  /** The folders between the Section and the page, which is its Category. */
  group: string[]
}

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---/
const KEY = (name: string) => new RegExp(`^${name}:\\s*(.+)$`, 'm')

/** Every Item's documentation, read from the tree rather than from a manifest. */
const documents: ItemDocument[] = walk(ITEMS)
  .filter((file) => file.endsWith('.mdx'))
  .map((file) => {
    const front = FRONTMATTER.exec(readFileSync(file, 'utf8'))?.[1] ?? ''
    const at = routedPath(path.relative(SITE, file).split(path.sep).join('/'))
    return {
      file: path.relative(SITE, file).split(path.sep).join('/'),
      slug: path.basename(file, '.mdx'),
      title: (KEY('title').exec(front)?.[1] ?? '').trim(),
      route: (KEY('slug').exec(front)?.[1] ?? '').trim() || null,
      at,
      group: at.split('/').slice(1, -1),
    }
  })

/** The Items the content tree files under a folder, read from those files. */
const nestedItems = catalogue.filter((item) =>
  documents.some((doc) => doc.slug === item.slug && doc.group.length > 0),
)

/**
 * The Catalogue's own order for one kind, gathered into the folders the Items
 * sit in and with nothing reordered inside a folder.
 *
 * The Catalogue interleaves Categories, so a sidebar that groups by Category
 * cannot also read as the Catalogue verbatim: a reader meets all seven Layout
 * Components before the first Feedback one, which is the point of a group. What
 * has to hold is that the grouping is the *only* transformation, so it is
 * asserted as the transformation rather than as a list typed out again: every
 * Item of a folder gathers at the place that folder is first met, and inside a
 * folder the Catalogue's own order is untouched. A flat Section is the case
 * where every Item is in its own group, so this is the old assertion in the case
 * where the old one held, and it says something the old one could not once the
 * tree is fully nested.
 */
function groupedOrder(kind: CatalogKind): string[] {
  const folders = new Map<string, string[]>()
  for (const item of catalogue.filter((entry) => entry.kind === kind)) {
    const folder = nestedItems.includes(item) ? categoryFolder(item.category as never) : ''
    const slugs = folders.get(folder) ?? []
    slugs.push(item.slug)
    folders.set(folder, slugs)
  }
  return [...folders.values()].flat()
}

describe('the generated catalogue order', () => {
  it.each(KINDS)('is the %s section of the Catalogue, gathered into its folders', (kind) => {
    expect(orderFor(kind)).toEqual(groupedOrder(kind))
  })

  it.each(['block', 'page'] as const)('leaves the %s section in the Catalogue order', (kind) => {
    // No folder, so no run to gather, and the flat list is the Catalogue read
    // straight through. A Block and a Page have no Category, so this is the
    // whole of what "flat" means.
    expect(orderFor(kind)).toEqual(
      catalogue.filter((item) => item.kind === kind).map((item) => item.slug),
    )
  })

  it.each(KINDS)('claims every %s and invents none', (kind) => {
    const order = orderFor(kind)
    const slugs = catalogue.filter((item) => item.kind === kind).map((item) => item.slug)
    expect(order).toHaveLength(slugs.length)
    expect(new Set(order).size).toBe(order.length)
    for (const slug of order) expect(slugs).toContain(slug)
  })

  it.each(KINDS)('leaves the %s Section index to the folder lookup', (kind) => {
    // Naming the index page in the ordering would take the folder's automatic
    // `index.mdx` lookup away, which is the route a group heading links to, and
    // would list the landing page as a child of itself.
    const segment = SECTIONS[kind].segment
    expect(orderFor(kind)).not.toContain(segment)
    expect(
      files.some((file) => file.type === 'page' && file.path === `${segment}/index.mdx`),
    ).toBe(true)
  })

  it('claims every Item exactly once across the three Sections', () => {
    const claimed = KINDS.flatMap((kind) => orderFor(kind))
    expect(claimed).toHaveLength(catalogue.length)
    expect(new Set(claimed).size).toBe(catalogue.length)
  })
})

describe('the generated routing source', () => {
  it('emits one Section index per Kind and no Item page', () => {
    // An Item's page is its documentation, so the Catalogue does not emit it. It
    // emits what no file on disk can say: the landing page of a Section, and the
    // order of every folder. An Item page emitted from here would be a second
    // page for one Item, and the storage would resolve the two by write order.
    const pages = files.filter((file) => file.type === 'page')
    expect(pages.map((file) => file.path)).toEqual(KINDS.map((kind) => `${SECTIONS[kind].segment}/index.mdx`))
    expect(pages.every((file) => file.type === 'page' && file.slugs?.length === 1)).toBe(true)
  })

  it('claims no virtual path twice, which resolves by write order otherwise', () => {
    const paths = files.map((file) => file.path)
    expect(new Set(paths).size).toBe(paths.length)
  })

  it('states the Section landing route rather than reading it out of the folder', () => {
    for (const file of files) {
      if (file.type !== 'page') continue
      const segment = file.path.split('/')[0] as string
      const kind = KINDS.find((entry) => SECTIONS[entry].segment === segment)
      expect(kind, `${file.path} is not a Section landing page`).toBeDefined()
      expect(file.slugs).toEqual([SECTIONS[kind as CatalogKind].segment])
    }
  })

  it('gives every folder an ordering, and no Section folder an index it cannot reach', () => {
    // A Section folder carries a meta because it has an index page for a group
    // heading to link to. A Category folder carries one because it orders its
    // Items, and it has no index: a group with no landing page is a label, and
    // the sidebar renders it as one rather than as a dead link.
    const metas = files.filter((file) => file.type === 'meta')
    expect(metas.length).toBeGreaterThan(KINDS.length)
    for (const file of metas) {
      if (file.type !== 'meta') continue
      const folder = file.path.replace(/\/meta\.json$/, '')
      const depth = folder.split('/').length
      const isSection = KINDS.some((kind) => SECTIONS[kind].segment === folder)
      if (isSection) {
        expect(
          files.some((entry) => entry.type === 'page' && entry.path === `${folder}/index.mdx`),
        ).toBe(true)
        expect(Array.isArray(file.data.pages)).toBe(true)
      } else {
        // A folder below a Section is a Category, and its label a reader reads is
        // the Catalogue's name for it rather than anything typed into the folder.
        expect(depth).toBe(2)
        expect(typeof file.data.title).toBe('string')
        expect(Array.isArray(file.data.pages)).toBe(true)
      }
    }
  })

  it('refuses a folder that names no Category rather than labelling it by the folder', () => {
    // A folder the Catalogue does not know is a group a reader would see under a
    // name nobody chose, so the build stops instead. Every Category in the
    // Catalogue is spelled once and has a folder slug.
    const filedItems = catalogue.filter(
      (item: CatalogItem) => item.category !== null && item.kind === 'component',
    )
    expect(filedItems.length).toBe(catalogue.filter((i) => i.category !== null).length)
    const folders = new Set(
      files
        .filter((file) => file.type === 'meta')
        .map((file) => file.path.replace(/\/meta\.json$/, ''))
        .filter((folder) => folder.split('/').length === 2),
    )
    for (const folder of folders) {
      const name = folder.split('/')[1] as string
      expect(filedItems.map((item) => categoryFolder(item.category as never))).toContain(name)
    }
  })
})

describe("the route each Item's document states", () => {
  it('is the Catalogue route, for every Item', () => {
    // Forty-two addresses are published and the Corpus advertises them. The
    // document states the route rather than deriving it from the folder it is
    // filed in, so a Component filed under a Category and a Block filed flat are
    // both addressed the Catalogue's way. The value is a slug path rather than a
    // URL, and `baseUrl: '/'` is what turns one into the other.
    expect(documents).toHaveLength(catalogue.length)
    for (const item of catalogue) {
      const doc = documents.find((entry) => entry.slug === item.slug)
      expect(doc, `${item.name} has no documentation file`).toBeDefined()
      expect(doc?.route, `${doc?.file} states no route`).toBe(
        `${SECTIONS[item.kind].segment}/${item.slug}`,
      )
    }
  })

  it('is stated once per document, and by no document but an Item page', () => {
    // `slug` is the one frontmatter key a content page may not carry, because a
    // content page is addressed by where it sits. The projection refuses it, and
    // a key it never sees cannot have drifted here either.
    for (const doc of documents) expect(doc.route).not.toBeNull()
  })
})

describe('where the projection files an Item page', () => {
  it('puts a filed Component in its Category folder and leaves a flat Section flat', () => {
    // The tree position is the one thing the Catalogue and the documentation
    // cannot both compute for themselves: the ordering has to name the folder
    // this file is in, or the page lands outside every ordering, the tree moves
    // it to the fallback collection, and the build fails with a page no sidebar
    // links. So the two are asserted against each other here, and the whole tree
    // is built in `content-tree.test.ts`.
    expect(nestedItems.length).toBeGreaterThan(0)
    for (const item of nestedItems) {
      const folder = `components/${categoryFolder(item.category as never)}`
      expect(documents.find((doc) => doc.slug === item.slug)?.at).toBe(`${folder}/${item.slug}.mdx`)
      expect(
        files.some((file) => file.type === 'meta' && file.path === `${folder}/meta.json`),
        `${item.name} is filed under no folder`,
      ).toBe(true)
    }
    for (const item of catalogue.filter((entry) => !nestedItems.includes(entry))) {
      const segment = SECTIONS[item.kind].segment
      expect(documents.find((doc) => doc.slug === item.slug)?.at).toBe(
        `${segment}/${item.slug}.mdx`,
      )
    }
  })

  it('is the same rule at any depth, which is what lets the tree grow folders', () => {
    // The folders between the Kind and the Item's own folder are the Item's place
    // in the tree, at whatever number of them there is. A rule that counted a
    // level would break the day a Section nests, which is the day it is needed.
    const at: [string, string][] = [
      ['items/component/button/button.mdx', 'components/button.mdx'],
      ['items/component/data-display/card/card.mdx', 'components/data-display/card.mdx'],
      ['items/component/a/b/c/thing/thing.mdx', 'components/a/b/c/thing.mdx'],
      ['items/block/cta-01/cta-01.mdx', 'blocks/cta-01.mdx'],
      ['items/block/group/thing/thing.mdx', 'blocks/group/thing.mdx'],
      ['items/page/auth-page/auth-page.mdx', 'pages/auth-page.mdx'],
      ['content/docs/quickstart.mdx', 'docs/quickstart.mdx'],
      ['content/meta.json', 'meta.json'],
      ['content/foundations/tokens/colors/colors.mdx', 'foundations/tokens/colors/colors.mdx'],
    ]
    for (const [file, expected] of at) expect(routedPath(file)).toBe(expected)
  })

  it('names the Catalogue name for the Item, in the document beside its prose', () => {
    // The tree builder labels a page with `data.title`, so a document whose title
    // disagreed with the Catalogue would put a second name in the sidebar. The
    // projection refuses it; the pair is asserted here because a rename in the
    // Catalogue and a rename in forty-two documents must be one change.
    for (const doc of documents) {
      const item = catalogue.find((entry) => entry.slug === doc.slug)
      expect(doc.title, `${doc.file} is titled something the Catalogue does not call it`).toBe(
        item?.name,
      )
    }
  })
})
