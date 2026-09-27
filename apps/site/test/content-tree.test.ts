import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { buildCatalog, type CatalogItem, type CatalogKind } from '@nanisoft/prism-ui/catalog'
import type { Folder, Root } from 'fumadocs-core/page-tree'
import { loader, type MetaData, type PageData, type StaticSource } from 'fumadocs-core/source'

import { catalogueSource, categoryFolder, KINDS, SECTIONS } from '../src/lib/catalogue'
import { contentTree, routedPath } from '../src/lib/content-tree'
import { flattenNav, PAGE_TREE, projectNav, type NavEntry, type NavSection } from '../src/lib/nav'

/**
 * The one routed tree, built from the files the site holds.
 *
 * The site's own tree cannot be built in this lane: `defineDocs` compiles through
 * the macro, and the macro module is a stub that throws by design unless the
 * bundler plugin compiled it. What can be built is the tree those files produce,
 * because every input is plain data: the authored `.mdx` and `.md` pages and the
 * authored `meta.json` are files on disk, and the Catalogue's Section landing
 * pages and orderings are a `StaticSource` of plain objects. So this lane reads
 * them all and hands them to a real `loader()` call carrying the site's own
 * options, the site's own `PAGE_TREE` and the site's own projection plugin. The
 * tree it gets back is the tree the build gets back, minus the compiled MDX
 * bodies, which no assertion here reads.
 *
 * That is the whole point of the change this file covers. Before it, the Item
 * pages were the Catalogue's virtual pages and the prose was a second collection
 * looked up by slug, so the tree, the routes and the bodies were three things
 * that had to be reconciled; a page could be published with an empty body, or a
 * body could be filed with no page, and neither was visible from the tree. Now
 * one collection holds both halves, the file that holds the prose is the page,
 * and the two joins the projection makes are the only ones left to be wrong.
 *
 * The assertions are the ones a reader and an agent would notice: forty-two
 * routes unchanged, a Category group labelled with the Catalogue's word for it, a
 * flat list where there is no Category, nothing in the fallback collection, and
 * no `/_prose` left to reach.
 */

const SITE = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const CONTENT = path.join(SITE, 'content')
const catalogue = buildCatalog()

/** Every file below a directory, at whatever depth the tree holds. */
function walk(root: string): string[] {
  return readdirSync(root).flatMap((name) => {
    const full = path.join(root, name)
    return statSync(full).isDirectory() ? walk(full) : [full]
  })
}

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---/
const KEY = (name: string) => new RegExp(`^${name}:\\s*(.+)$`, 'm')
const relative = (full: string) => path.relative(SITE, full).split(path.sep).join('/')

/**
 * Every file the one collection reads, as the tree builder reads it.
 *
 * A page carries its frontmatter and nothing else, which is what the projection
 * expects to find: it reads the declared route off it, refuses a disagreement
 * with the Catalogue, and merges the Catalogue's words in. A generated `.md`
 * changelog has no frontmatter at all, and its title is its own first heading,
 * which is the rule the collection's schema applies.
 */
function contentFiles(): StaticSource['files'] {
  const files: StaticSource['files'] = []
  for (const full of [...walk(CONTENT), ...walk(path.join(SITE, 'items'))]) {
    const file = relative(full)
    if (full.endsWith('.mdx') || full.endsWith('.md')) {
      const source = readFileSync(full, 'utf8')
      const front = FRONTMATTER.exec(source)?.[1] ?? ''
      const data: PageData & { slug?: string } = {
        title: (KEY('title').exec(front)?.[1] ?? /^#\s+(.+?)\s*$/m.exec(source)?.[1] ?? '').trim(),
      }
      const route = (KEY('slug').exec(front)?.[1] ?? '').trim()
      if (route) data.slug = route
      files.push({ type: 'page', path: file, data })
      continue
    }
    if (path.basename(full) === 'meta.json') {
      files.push({
        type: 'meta',
        path: file,
        data: JSON.parse(readFileSync(full, 'utf8')) as MetaData,
      })
    }
  }
  return files
}

/** A real loader over those files, with the options the routed tree is built with. */
function treeOf(overrides: StaticSource['files'] = []) {
  return loader(
    // Two sources, keyed as the site keys them, because the key is how a file is
    // told which of them read it and the projection acts on the collection's.
    { site: { files: [...contentFiles(), ...overrides] }, catalogue: catalogueSource },
    { baseUrl: '/', pageTree: PAGE_TREE, plugins: [contentTree('site')] },
  )
}

const site = () => treeOf()
const routeOf = (item: CatalogItem) => `/${SECTIONS[item.kind].segment}/${item.slug}`

/** A folder of the tree, by the virtual path the projection filed it under. */
function folderAt(tree: Root, at: string): Folder | undefined {
  const walkFolders = (nodes: Folder['children']): Folder | undefined => {
    for (const node of nodes) {
      if (node.type !== 'folder') continue
      if (node.$ref?.folder === at) return node
      const found = walkFolders(node.children)
      if (found) return found
    }
    return undefined
  }
  return walkFolders(tree.children)
}

/** The Items the content tree files under a folder, read from the projected tree. */
const filed = catalogue.filter((item) => {
  const at = routedPath(`items/${item.kind}/${item.slug}/${item.slug}.mdx`)
  return at.split('/').length > 2
})

describe('the routed tree the one collection produces', () => {
  it('publishes every Item at the route the Catalogue gives it', () => {
    const source = site()
    for (const item of catalogue) {
      const page = source.getPageByUrl(routeOf(item))
      expect(page, `${item.name} is not published at ${routeOf(item)}`).toBeDefined()
      expect(page?.data).toMatchObject({
        slug: item.slug,
        name: item.name,
        description: item.description,
        kind: item.kind,
        category: item.category,
        status: item.status,
        exports: item.exports,
        source: item.source,
      })
    }
  })

  it('publishes the same forty-two routes the Corpus advertises', () => {
    // The Corpus derives an Item's address from the Catalogue, and it is read by
    // every tool, so a route that moved here would be a route an agent holding a
    // cached index cannot resolve.
    const published = site()
      .getPages()
      .map((page) => page.url)
      .sort()
    const advertised = catalogue.map(routeOf).sort()
    expect(published).toEqual(expect.arrayContaining(advertised))
    expect(published.filter((url) => advertised.includes(url))).toHaveLength(
      advertised.length,
    )
  })

  it('leaves no private base URL behind', () => {
    // The prose tree was `/_prose`, addressed by Kind and slug and never routed.
    // Its retirement is the point of the change, so it is asserted as a route
    // that resolves to nothing rather than as an export that is gone.
    const source = site()
    expect(source.getPageByUrl('/_prose/component/button')).toBeUndefined()
    expect(source.getPage(['_prose', 'component', 'button'])).toBeUndefined()
    expect(source.getPages().map((page) => page.url).filter((url) => url.includes('_prose'))).toEqual(
      [],
    )
  })

  it('leaves no page in the fallback collection', () => {
    // The silent mode: the route exists, the page builds, and a reader reaches it
    // only by URL. `projectNav` throws on a tree in this state, so this is also
    // the assertion that the build would refuse.
    const source = site()
    expect(source.getPageTree().fallback).toBeUndefined()
    expect(() => projectNav(source.getPageTree())).not.toThrow()
  })

  it('publishes each Section landing page and every content page it holds', () => {
    const source = site()
    for (const kind of KINDS) {
      const segment = SECTIONS[kind].segment
      expect(source.getPageByUrl(`/${segment}`)?.data.title).toBe(SECTIONS[kind].title)
    }
    for (const file of walk(CONTENT)) {
      if (!file.endsWith('.mdx') && !file.endsWith('.md')) continue
      const slug = relative(file).replace(/^content\//, '').replace(/\.mdx?$/, '')
      const route = slug.endsWith('/index') ? `/${slug.slice(0, -'/index'.length)}` : `/${slug}`
      expect(source.getPageByUrl(route), `${file} is not published`).toBeDefined()
    }
  })
})

describe('the navigation the one collection produces', () => {
  const sections = (): NavSection[] => projectNav(site().getPageTree())
  const listed = (url: string): NavEntry[] =>
    sections().find((section) => section.url === url)?.items ?? []

  it('lists every Item in the Catalogue order, gathered into its Category', () => {
    for (const item of filed) {
      const folder = `components/${categoryFolder(item.category as never)}`
      const node = folderAt(site().getPageTree(), folder)
      expect(node, `no folder at ${folder}`).toBeDefined()
      // A Category folder has no landing page of its own, so its heading is a
      // label and not a link, and the page inside it is the only thing in it.
      expect(node?.index, `${folder} has an index page, so its heading would be a link`).toBeUndefined()
      expect(node?.children.map((child) => (child.type === 'page' ? child.url : null))).toContain(
        routeOf(item),
      )
    }
  })

  it('labels a Category group with the Catalogue name for it', () => {
    const components = sections().find((section) => section.url === '/components')
    expect(components).toBeDefined()
    for (const item of filed) {
      const group = components?.items.find(
        (entry) => entry.type === 'group' && entry.title === item.category,
      )
      expect(group, `no '${item.category}' group in the sidebar`).toBeDefined()
      if (group?.type !== 'group') throw new Error(`no '${item.category}' group in the sidebar`)
      expect(group.items).toContainEqual({ type: 'page', title: item.name, url: routeOf(item) })
    }
  })

  it('renders the Blocks and Pages sidebars as flat lists', () => {
    // A Block and a Page have no Category, so a group here would be a label with
    // one child under it, which reads as a category the reader was never told
    // exists. The sidebar is the flat list the Catalogue is, and nothing wraps
    // it.
    for (const kind of ['block', 'page'] as const) {
      const url = `/${SECTIONS[kind].segment}`
      expect(listed(url).every((entry) => entry.type === 'page'), `${url} nests a group`).toBe(true)
      expect(listed(url).map((entry) => (entry.type === 'page' ? entry.url : null))).toEqual(
        catalogue.filter((item) => item.kind === kind).map(routeOf),
      )
    }
  })

  it('keeps every Item route in the reading order, and every content page', () => {
    const routes = flattenNav(sections()).map((entry) => entry.url)
    for (const item of catalogue) expect(routes).toContain(routeOf(item))
    for (const file of walk(CONTENT)) {
      if (!file.endsWith('.mdx') && !file.endsWith('.md')) continue
      const slug = relative(file).replace(/^content\//, '').replace(/\.mdx?$/, '')
      const route = slug.endsWith('/index') ? `/${slug.slice(0, -'/index'.length)}` : `/${slug}`
      expect(routes, `${route} is published and no navigation links it`).toContain(route)
    }
  })
})

describe('what the projection refuses', () => {
  const page = (
    file: string,
    data: PageData & { slug?: string },
  ): StaticSource['files'][number] => ({ type: 'page', path: file, data, absolutePath: file })

  it('a document whose stated route is not the Catalogue route', () => {
    // Forty-two addresses are published. A document that states another one is a
    // published-surface change, and the Corpus, the redirects and every cached
    // agent instruction resolve the Catalogue's, so it is refused where the route
    // is produced rather than discovered by a reader following a dead link.
    expect(() =>
      treeOf([page('items/component/layout/button/button.mdx', { title: 'Button', slug: 'components/buton' })]),
    ).toThrow(/components\/buton/)
    expect(() =>
      treeOf([page('items/component/layout/button/button.mdx', { title: 'Button' })]),
    ).toThrow(/states no route/)
  })

  it('a document whose title is not the Catalogue name for it', () => {
    // The tree builder labels a page with its title, so a document that disagreed
    // with the Catalogue would put a second name in the sidebar for one Item.
    expect(() =>
      treeOf([
        page('items/component/layout/button/button.mdx', { title: 'Button component', slug: 'components/button' }),
      ]),
    ).toThrow(/Button component/)
  })

  it('a document the Catalogue does not claim', () => {
    expect(() =>
      treeOf([page('items/component/layout/ghost/ghost.mdx', { title: 'Ghost', slug: 'components/ghost' })]),
    ).toThrow(/no Catalogue Item claims/)
  })

  it('a document that is not in a folder named for it', () => {
    expect(() =>
      treeOf([page('items/component/layout/ghost.mdx', { title: 'Ghost', slug: 'components/ghost' })]),
    ).toThrow(/not in a folder named for it/)
  })

  it('a content page that states a route', () => {
    expect(() =>
      treeOf([page('content/docs/quickstart.mdx', { title: 'Quickstart', slug: 'start-here' })]),
    ).toThrow(/addressed by where it is filed/)
  })

  it('a file under neither content/ nor items/', () => {
    expect(() => treeOf([page('drafts/scratch.mdx', { title: 'Scratch' })])).toThrow(
      /nowhere in the routed tree/,
    )
  })

  it('two files that claim one routed path', () => {
    // The hazard two content sources claiming one virtual path resolve by write
    // order, silently. The projection is the one place both pass through, so it
    // is the one place the collision can be named. A hand-written page filed
    // where a catalogue Section lives is the case that would otherwise be
    // published at the route of the Item it shadows.
    expect(() => treeOf([page('content/blocks/cta-01.mdx', { title: 'Cta01' })])).toThrow(
      /blocks\/cta-01\.mdx twice/,
    )
  })
})
