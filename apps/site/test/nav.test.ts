import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { Folder, Root } from 'fumadocs-core/page-tree'
import { loader, type MetaData, type PageData, type StaticSource } from 'fumadocs-core/source'
import { metaSchema } from 'fumadocs-core/source/schema'
import { describe, expect, it } from 'vitest'

import { flattenNav, PAGE_TREE, projectNav } from '../src/lib/nav'

/**
 * The navigation projection, over plain page-tree data.
 *
 * The site's real routing tree cannot be built here. `defineDocs` compiles
 * through the `fumadocs-mdx` macro, and the macro module is a stub that throws
 * by design unless the bundler plugin compiled it, so `getPageTree()` is
 * unreachable from a plain script and from this lane. Two things stand in for
 * it, deliberately and for different reasons.
 *
 * The projection itself takes a `Root` and nothing else, so it is exercised here
 * against tree data built by the real loader: the same plain types the real tree
 * is made of, with the same memoization hazard, at no depth and at depth. That is
 * the whole projection, not a stand-in for it.
 *
 * The loader is used for a second reason, which is the two page-tree flags that
 * would break this navigation. They are read by the loader and not by the
 * projection, so every fixture here is a real `loader()` call carrying the site's
 * own `PAGE_TREE`, and the assertions about a folder's index lookup and about
 * `getNodeMeta` are about the installed `fumadocs-core` and the options the site
 * really passes, not about a reading of its documentation.
 */

const SITE = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

/** One authored page, the shape the tree builder reads. */
function page(file: string, title: string): { type: 'page'; path: string; data: PageData } {
  return { type: 'page', path: file, data: { title } }
}

/** One authored meta file: a folder's title, its order, and its index. */
function meta(file: string, data: MetaData) {
  return { type: 'meta' as const, path: file, data }
}

/** A loader over a fixture, with the options the routed tree is built with. */
function treeOf(files: StaticSource['files']) {
  return loader({ files }, { baseUrl: '/', pageTree: PAGE_TREE })
}

/** A folder of the tree, by its virtual path, for an assertion. */
function folder(tree: Root, at: string): Folder {
  const node = tree.children.find(
    (child): child is Folder => child.type === 'folder' && child.$ref?.folder === at,
  )
  if (!node) throw new Error(`no folder at ${at}`)
  return node
}

/** Two ordered sections at one level, the shape the site renders today. */
const flat = treeOf([
  meta('meta.json', { pages: ['docs', 'components'] }),
  page('docs/index.mdx', 'Guides'),
  page('docs/quickstart.mdx', 'Quickstart'),
  page('docs/architecture.mdx', 'Architecture'),
  meta('docs/meta.json', { pages: ['quickstart', 'architecture'] }),
  page('components/index.mdx', 'Components'),
  page('components/button.mdx', 'Button'),
  meta('components/meta.json', { pages: ['button'] }),
])

/**
 * A `docs` Section of three pages ordered by whatever it is given, so the tests
 * below differ only in the ordering and not in the content.
 */
function guides(pages: string[]) {
  return treeOf([
    meta('meta.json', { pages: ['docs'] }),
    page('docs/index.mdx', 'Guides'),
    page('docs/quickstart.mdx', 'Quickstart'),
    page('docs/brand.mdx', 'Brand policy'),
    meta('docs/meta.json', { pages }),
  ])
}

/** A folder of pages with no index page of its own. */
function widgets() {
  return treeOf([
    meta('meta.json', { pages: ['widgets'] }),
    page('widgets/button.mdx', 'Button'),
    meta('widgets/meta.json', { title: 'Widgets' }),
  ])
}

describe('the page tree the navigation is read from', () => {
  it('finds a folder index without an index key in its meta', () => {
    // `root` in a meta file marks a folder as a tree root, and the builder then
    // skips the automatic `index.mdx` lookup. A group heading is wired to
    // exactly that index, so this is the assertion that a Section's landing
    // page stays reachable.
    const docs = folder(flat.getPageTree(), 'docs')
    expect(docs.index?.url).toBe('/docs')
    expect(projectNav(flat.getPageTree())[0]?.url).toBe('/docs')
  })

  it('reads a folder meta through getNodeMeta', () => {
    // `noRef` strips `$ref` from every node, and `$ref` is the only handle
    // getNodeMeta has, so setting it makes the metadata accessor return nothing
    // for the whole tree without an error.
    const docs = folder(flat.getPageTree(), 'docs')
    expect(flat.getNodeMeta(docs)?.data).toMatchObject({ pages: ['quickstart', 'architecture'] })
  })

  it('carries neither flag', () => {
    expect(PAGE_TREE).not.toHaveProperty('noRef')
    expect(PAGE_TREE).not.toHaveProperty('root')
  })
})

describe('a page left out of an ordering', () => {
  it('keeps its exported route, so the build is the only place it can be caught', () => {
    const source = guides(['quickstart'])

    // The route survives. Nothing in the loader, in generateStaticParams or in
    // the export reports a problem: a page reachable by URL, absent from the
    // navigation, green build. `docs/index.mdx` is the Section landing page, so
    // its own slug is `docs` and not `docs/index`.
    expect(source.getPageByUrl('/docs/brand')?.data.title).toBe('Brand policy')
    expect(source.generateParams().map((params) => params.slug)).toEqual(
      expect.arrayContaining([['docs'], ['docs', 'quickstart'], ['docs', 'brand']]),
    )
    expect(folder(source.getPageTree(), 'docs').children).toHaveLength(1)
  })

  it('is refused by the projection, naming the file that should claim it', () => {
    expect(() => projectNav(guides(['quickstart']).getPageTree())).toThrow(/no ordering claims/)
    expect(() => projectNav(guides(['quickstart']).getPageTree())).toThrow(/docs\/brand\.mdx/)
    expect(() => projectNav(guides(['quickstart']).getPageTree())).toThrow(/pages array/)
  })

  it('is claimed again by naming it, which is the whole repair', () => {
    const source = guides(['quickstart', 'brand'])
    expect(source.getPageTree().fallback).toBeUndefined()
    expect(projectNav(source.getPageTree())[0]?.items.map((entry) => entry.type)).toEqual([
      'page',
      'page',
    ])
  })

  it('is claimed by an ellipsis as well, which is what the vocabulary offers', () => {
    const source = guides(['quickstart', '...'])
    expect(source.getPageTree().fallback).toBeUndefined()
    expect(projectNav(source.getPageTree())[0]?.items).toHaveLength(2)
  })
})

describe('the projection', () => {
  it('reads a group heading from the folder index, and never invents a route', () => {
    const sections = projectNav(flat.getPageTree())
    expect(sections.map((section) => [section.title, section.url])).toEqual([
      ['Guides', '/docs'],
      ['Components', '/components'],
    ])
  })

  it('renders a group with no index as a label, not a link', () => {
    const [section] = projectNav(widgets().getPageTree())
    expect(section?.url).toBeUndefined()
    expect(section?.title).toBe('Widgets')
    expect(section?.items).toEqual([{ type: 'page', title: 'Button', url: '/widgets/button' }])
  })

  it('recurses to any depth the tree holds', () => {
    const source = treeOf([
      meta('meta.json', { pages: ['components'] }),
      page('components/index.mdx', 'Components'),
      meta('components/meta.json', { pages: ['call-to-action'] }),
      page('components/call-to-action/index.mdx', 'Call to action'),
      meta('components/call-to-action/meta.json', { pages: ['button'] }),
      page('components/call-to-action/button.mdx', 'Button'),
    ])

    const [components] = projectNav(source.getPageTree())
    const [callToAction] = components?.items ?? []
    expect(callToAction?.type).toBe('group')
    if (callToAction?.type !== 'group') throw new Error('expected a group')
    expect([callToAction.title, callToAction.url]).toEqual([
      'Call to action',
      '/components/call-to-action',
    ])
    expect(callToAction.items).toEqual([
      { type: 'page', title: 'Button', url: '/components/call-to-action/button' },
    ])
  })

  it('keeps a page at the root of the tree reachable as a heading', () => {
    // `content/scratch.mdx` is a Section that never got a folder. Dropping it
    // would publish a route no navigation links, so it becomes a group whose
    // heading is its own route.
    const source = treeOf([meta('meta.json', { pages: ['scratch'] }), page('scratch.mdx', 'Scratch')])
    expect(projectNav(source.getPageTree())).toEqual([
      { type: 'group', id: expect.any(String), title: 'Scratch', url: '/scratch', items: [] },
    ])
  })

  it('carries a rule from a meta file rather than dropping it', () => {
    const source = treeOf([
      meta('meta.json', { pages: ['docs'] }),
      page('docs/index.mdx', 'Guides'),
      page('docs/quickstart.mdx', 'Quickstart'),
      meta('docs/meta.json', { pages: ['---Basics---', 'quickstart'] }),
    ])
    const [section] = projectNav(source.getPageTree())
    expect(section?.items.map((entry) => entry.type)).toEqual(['divider', 'page'])
    expect(section?.items[0]).toMatchObject({ type: 'divider', title: 'Basics' })
  })

  it('does not touch the tree it reads, so a later render sees the same order', () => {
    // `getPageTree()` is memoized and returned by identity, and the projection
    // runs once per rendered page. Sorting or splicing a node's own children
    // would reorder what the next page in the same process sees, so the tree is
    // snapshotted, projected twice, and compared.
    const tree = flat.getPageTree()
    const names = () =>
      tree.children.map((node) =>
        node.type === 'folder' ? node.children.map((child) => child.name) : node.name,
      )
    const before = names()

    const first = projectNav(tree)
    const second = projectNav(tree)
    expect(second).toEqual(first)

    // A projection is the reader's own copy: reordering it cannot reach the tree.
    if (first[0]?.items.length) first[0].items.reverse()
    expect(projectNav(tree)).toEqual(second)
    expect(names()).toEqual(before)
  })
})

describe('flattenNav', () => {
  it('reads a group heading and then its children, in reading order', () => {
    expect(flattenNav(projectNav(flat.getPageTree()))).toEqual([
      { title: 'Guides', url: '/docs' },
      { title: 'Quickstart', url: '/docs/quickstart' },
      { title: 'Architecture', url: '/docs/architecture' },
      { title: 'Components', url: '/components' },
      { title: 'Button', url: '/components/button' },
    ])
  })

  it('carries a group with no index as nothing of its own, and still walks into it', () => {
    expect(flattenNav(projectNav(widgets().getPageTree()))).toEqual([
      { title: 'Button', url: '/widgets/button' },
    ])
  })
})

describe('the authored content tree', () => {
  /** Every meta file the site authors, at whatever depth the tree holds. */
  const authored = (): { file: string; data: Record<string, unknown> }[] =>
    walk(path.join(SITE, 'content'))
      .filter((file) => path.basename(file) === 'meta.json')
      .map((file) => ({
        file: path.relative(SITE, file).split(path.sep).join('/'),
        data: JSON.parse(readFileSync(file, 'utf8')) as Record<string, unknown>,
      }))

  /** Every directory below `content/`, at whatever depth the tree holds. */
  const folders = (root = path.join(SITE, 'content')): string[] =>
    readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
      const full = path.join(root, entry.name)
      if (!entry.isDirectory()) return []
      return [path.relative(SITE, full).split(path.sep).join('/'), ...folders(full)]
    })

  it('gives every folder that holds a page an ordering', () => {
    // The authored side of the same rule the projection enforces: a folder with
    // no `pages` array is not a failure, but a folder that holds a page and
    // orders nothing is how a page ends up in the fallback collection.
    for (const folder of folders()) {
      const holds = walk(path.join(SITE, folder)).some((file) => file.endsWith('.mdx'))
      if (!holds) continue
      const entry = authored().find((meta) => meta.file === `${folder}/meta.json`)
      expect(entry, `${folder} holds a page and no meta.json`).toBeDefined()
      expect(Array.isArray(entry?.data.pages), `${folder}/meta.json declares no pages`).toBe(true)
    }
  })

  it('declares no root, which would take a folder index away', () => {
    // `root` marks a folder as a tree root, and the builder then skips the
    // automatic `index.mdx` lookup. Nothing reports it: the folder's pages stay
    // in the tree and the folder's landing page is simply no longer there for a
    // group heading to link to.
    expect(authored().filter((entry) => 'root' in entry.data).map((entry) => entry.file)).toEqual(
      [],
    )
  })

  it('declares only keys the meta schema keeps', () => {
    // `metaSchema` is a strip schema. A key it does not know is discarded rather
    // than rejected, so a meta file naming one reads as though it ordered
    // something and orders nothing. There is no `folders` key: a folder with
    // ordered children is spelled by naming the folder in its parent's array.
    const known = Object.keys(metaSchema.shape)
    for (const entry of authored()) {
      for (const key of Object.keys(entry.data)) expect(known).toContain(key)
    }
  })
})

/**
 * The three prose Sections, over the files the site actually authors.
 *
 * The content source is compiled through the macro, so the routed tree cannot be
 * built here. The files it would read can: every authored `.mdx` and every
 * authored `meta.json` is plain data on disk, so a real `loader()` call over them
 * with the site's own `PAGE_TREE` builds the same tree the build builds, minus
 * the catalogue's pages. That is what lets the prose Sections' order and their
 * labels be asserted here at all, and it is the same seam the fixtures above use,
 * pointed at the real tree instead of a stand-in.
 */
describe('the authored prose Sections', () => {
  /** The prose Sections: the authored folders under `content/`, by name. */
  const PROSE = ['docs', 'foundations', 'content'] as const

  const CONTENT = path.join(SITE, 'content')

  /** One authored page or meta file, in the shape the tree builder reads. */
  function authoredFiles(): StaticSource['files'] {
    const files: StaticSource['files'] = []
    for (const full of walk(CONTENT)) {
      const relative = path.relative(CONTENT, full).split(path.sep).join('/')
      if (full.endsWith('.mdx')) {
        const frontmatter = /^---\n([\s\S]*?)\n---/.exec(readFileSync(full, 'utf8'))?.[1] ?? ''
        const title = /^title:\s*(.+)$/m.exec(frontmatter)?.[1]?.trim() ?? ''
        files.push({ type: 'page', path: relative, data: { title } })
        continue
      }
      if (path.basename(relative) === 'meta.json') {
        files.push({
          type: 'meta',
          path: relative,
          data: JSON.parse(readFileSync(full, 'utf8')) as MetaData,
        })
      }
    }
    return files
  }

  /** A real tree over the authored files, and the navigation it projects. */
  function authoredNav() {
    const source = treeOf(authoredFiles())
    return { tree: source.getPageTree(), sections: projectNav(source.getPageTree()) }
  }

  /** Every page the prose Sections hold, by the route it is addressed by. */
  const authoredRoutes = () =>
    walk(CONTENT)
      .filter((file) => file.endsWith('.mdx'))
      .map((file) => {
        const relative = path.relative(CONTENT, file).split(path.sep).join('/').replace(/\.mdx$/, '')
        return relative.endsWith('/index') ? `/${relative.slice(0, -'/index'.length)}` : `/${relative}`
      })
      .sort()

  /** Every route the projected navigation links, in reading order. */
  const linked = (entries: { type: string; items?: unknown[] }[]): string[] =>
    flattenNav(entries as never).map((entry) => entry.url)

  it.each(PROSE)('orders %s from a meta file beside its pages', (section) => {
    const meta = JSON.parse(
      readFileSync(path.join(CONTENT, section, 'meta.json'), 'utf8'),
    ) as MetaData
    const pages = walk(path.join(CONTENT, section))
      .filter((file) => file.endsWith('.mdx') && !file.endsWith(`${path.sep}index.mdx`))
      .map((file) => path.basename(file, '.mdx'))
      .sort()

    // Both directions. A `pages` array is a whitelist, so a page it omits leaves
    // the primary tree while keeping its route, and a page it invents is a
    // routing target nothing can serve.
    expect([...(meta.pages ?? [])].sort()).toEqual(pages)
  })

  it.each(PROSE)('names %s in its meta file, not in its directory name', (section) => {
    const meta = JSON.parse(
      readFileSync(path.join(CONTENT, section, 'meta.json'), 'utf8'),
    ) as MetaData
    expect(typeof meta.title, `content/${section}/meta.json declares no title`).toBe('string')
    // The label the sidebar shows is the meta file's, and the directory name is
    // not what a reader sees: `docs` is "Guides" and `content` is "Content".
    const shown = authoredNav().sections.find((entry) => entry.url === `/${section}`)
    expect(shown?.title).toBe(meta.title)
  })

  it('publishes every authored page in the navigation, with nothing left over', () => {
    const { tree } = authoredNav()
    // Nothing in the fallback collection: that is the silent mode where a page
    // keeps its route and vanishes from the sidebar.
    expect(tree.fallback).toBeUndefined()

    const routes = linked(authoredNav().sections)
    for (const route of authoredRoutes()) {
      expect(routes, `${route} is authored and no navigation links it`).toContain(route)
    }
  })

  it('leaves the reader with the same order the meta files declare', () => {
    for (const section of PROSE) {
      const meta = JSON.parse(
        readFileSync(path.join(CONTENT, section, 'meta.json'), 'utf8'),
      ) as MetaData
      const expected = [`/${section}`, ...(meta.pages ?? []).map((slug) => `/${section}/${slug}`)]
      const routes = linked(authoredNav().sections)
      const at = routes.indexOf(expected[0] as string)
      expect(routes.slice(at, at + expected.length)).toEqual(expected)
    }
  })
})

/** Every file below a directory, at whatever depth the tree holds. */
function walk(root: string): string[] {
  return readdirSync(root).flatMap((name) => {
    const full = path.join(root, name)
    return statSync(full).isDirectory() ? walk(full) : [full]
  })
}
