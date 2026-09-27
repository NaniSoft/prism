import { describe, expect, it } from 'vitest'

import { buildCatalog, type CatalogKind, type CatalogItem } from '@nanisoft/prism-ui/catalog'
import type { Folder, Root } from 'fumadocs-core/page-tree'
import { loader } from 'fumadocs-core/source'

import { catalogueSource, categoryFolder, KINDS, SECTIONS } from '../src/lib/catalogue'
import { PAGE_TREE, projectNav } from '../src/lib/nav'

/**
 * The generated catalogue order, and the routing tree it orders.
 *
 * The site's routing tree cannot be built in this lane, because the macro module
 * `defineDocs` compiles through is a stub that throws unless the bundler plugin
 * compiled it. The generated source can be read, though: it is a plain
 * `StaticSource`, built by `buildCatalog()` and nothing else, and it is the
 * thing the ordering could fall behind. So the Catalogue is read here through
 * its own tooling entry point and the emitted files are compared to it.
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
 * inside it. Read the way a reader reads the sidebar, the order is still the
 * Catalogue's own: a reader meets the Items in Catalogue order whether they sit
 * in a folder or beside it, and that is the property worth asserting, because it
 * is the one a hand-written array would break the moment one Item was filed.
 *
 * The tree itself is built here, from the real `StaticSource` and the site's own
 * `PAGE_TREE`, for the same reason `nav.test.ts` builds one: the projection is
 * pure and the files are plain data, so a real loader call over them is the
 * whole tree rather than a stand-in for it. That is what proves a Component is
 * nested under its Category in the navigation *and* keeps its route, which are
 * two different facts about the same page.
 */

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

/** A real page tree over the generated source, built the way the site builds it. */
function tree(): Root {
  return loader({ files }, { baseUrl: '/', pageTree: PAGE_TREE }).getPageTree()
}

function folderAt(root: Root, at: string): Folder | undefined {
  const walk = (nodes: Folder['children']): Folder | undefined => {
    for (const node of nodes) {
      if (node.type !== 'folder') continue
      if (node.$ref?.folder === at) return node
      const found = walk(node.children)
      if (found) return found
    }
    return undefined
  }
  return walk(root.children)
}

const filed = catalogue.filter((item: CatalogItem) => item.category !== null && item.kind === 'component')
/** The Items the content tree has filed in a folder, read from the emitted paths. */
const nestedItems = catalogue.filter((item) =>
  files.some(
    (file) =>
      file.type === 'page' &&
      file.path.split('/').length > 2 &&
      file.path.endsWith(`/${item.slug}.mdx`),
  ),
)

describe('the generated catalogue order', () => {
  it.each(KINDS)('is the %s section of the Catalogue, in the Catalogue order', (kind) => {
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

describe('the generated routing tree', () => {
  it('emits one page per Item plus one Section index per Kind', () => {
    const pages = files.filter((file) => file.type === 'page')
    expect(pages).toHaveLength(catalogue.length + KINDS.length)
  })

  it('claims no virtual path twice, which resolves by write order otherwise', () => {
    const paths = files.map((file) => file.path)
    expect(new Set(paths).size).toBe(paths.length)
  })

  it('states every page route rather than reading it out of the folder', () => {
    // A page with no explicit slugs takes its route from where it sits, which is
    // how filing a Component under its Category would move forty-two published
    // addresses. Every catalogue page states `<segment>/<slug>`, so the folder is
    // free to change without a route moving.
    for (const file of files) {
      if (file.type !== 'page') continue
      const segment = file.path.split('/')[0] as CatalogKind
      const item = catalogue.find(
        (entry) => entry.kind === segment && file.path.endsWith(`/${entry.slug}.mdx`),
      )
      if (!item) continue
      expect(file.slugs).toEqual([SECTIONS[segment].segment, item.slug])
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
        // A folder below a Section is a Category, and its label is the
        // Catalogue's name for it rather than anything typed into the folder.
        expect(depth).toBe(2)
        expect(typeof file.data.title).toBe('string')
        expect(Array.isArray(file.data.pages)).toBe(true)
      }
    }
  })

  it('nests a filed Component under a folder named for its Category', () => {
    expect(nestedItems.length).toBeGreaterThan(0)
    for (const item of nestedItems) {
      const folder = `components/${item.category === null ? '' : categoryFolder(item.category)}`
      expect(
        files.some((file) => file.type === 'meta' && file.path === `${folder}/meta.json`),
        `${item.name} is filed under no folder`,
      ).toBe(true)
      expect(
        files.some(
          (file) => file.type === 'page' && file.path === `${folder}/${item.slug}.mdx`,
        ),
        `${item.name} is not in its Category folder`,
      ).toBe(true)
    }
  })

  it('refuses a folder that names no Category rather than labelling it by the folder', () => {
    // A folder the Catalogue does not know is a group a reader would see under a
    // name nobody chose, so the build stops instead. Every Category in the
    // Catalogue is spelled once and has a folder slug.
    expect(filed.length).toBe(catalogue.filter((i) => i.category !== null).length)
    const folders = new Set(
      files
        .filter((file) => file.type === 'meta')
        .map((file) => file.path.replace(/\/meta\.json$/, ''))
        .filter((folder) => folder.split('/').length === 2),
    )
    for (const folder of folders) {
      const name = folder.split('/')[1] as string
      expect(filed.map((item) => categoryFolder(item.category as never))).toContain(name)
    }
  })
})

describe('the navigation the generated tree produces', () => {
  const sections = projectNav(tree())

  it('gives a filed Component a group, and leaves its route where it was', () => {
    for (const item of nestedItems) {
      const category = item.category as NonNullable<CatalogItem['category']>
      const folder = `components/${categoryFolder(category)}`
      const node = folderAt(tree(), folder)
      expect(node, `no folder at ${folder}`).toBeDefined()
      expect(node?.index, `${folder} has an index page, so its heading would be a link`).toBeUndefined()
      expect(node?.children.map((child) => (child.type === 'page' ? child.url : null))).toContain(
        `/components/${item.slug}`,
      )
    }
  })

  it('renders the group under the Section, with the Catalogue label', () => {
    const components = sections.find((section) => section.url === '/components')
    expect(components).toBeDefined()
    for (const item of nestedItems) {
      const category = item.category as NonNullable<CatalogItem['category']>
      const group = components?.items.find(
        (entry) => entry.type === 'group' && entry.title === category,
      )
      expect(group, `no '${category}' group in the sidebar`).toBeDefined()
      if (group?.type !== 'group') throw new Error('expected a group')
      expect(group.items).toContainEqual({ type: 'page', title: item.name, url: `/components/${item.slug}` })
    }
  })

  it('keeps the route of an Item that has not moved, and of one that has', () => {
    const flat = sections.find((section) => section.url === '/components')?.items ?? []
    const urls = flat.flatMap((entry) => (entry.type === 'group' ? entry.items : [entry]))
    for (const item of catalogue.filter((entry) => entry.kind === 'component')) {
      expect(urls).toContainEqual({ type: 'page', title: item.name, url: `/components/${item.slug}` })
    }
  })
})
