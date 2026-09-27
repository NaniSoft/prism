import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { collectContentPages, emit } from '../scripts/build.mjs'

/**
 * The content walk, which is the fix.
 *
 * Every test here fails if the recursion is removed, because each one puts a
 * page below its Section's top directory and then asks the Corpus what exists.
 * A walk that reads one directory answers with fewer pages every time, which is
 * exactly the omission that took a nested page out of `llms.txt`,
 * `llms-full.txt`, the Store and every tool while the build stayed green.
 */

const SECTIONS = ['docs', 'foundations', 'content']

/** A temporary content root, so the site's real tree is never touched. */
async function contentTree(files: Record<string, string>): Promise<string> {
  const root = await mkdtemp(path.join(tmpdir(), 'prism-llms-tree-'))
  for (const section of SECTIONS) {
    await mkdir(path.join(root, section), { recursive: true })
  }
  for (const [relative, body] of Object.entries(files)) {
    const file = path.join(root, ...relative.split('/'))
    await mkdir(path.dirname(file), { recursive: true })
    await writeFile(file, body, 'utf8')
  }
  return root
}

const roots: string[] = []
const tree = async (files: Record<string, string>) => {
  const root = await contentTree(files)
  roots.push(root)
  return root
}

afterAll(async () => {
  for (const root of roots) await rm(root, { recursive: true, force: true })
})

describe('collectContentPages', () => {
  it('reads a flat Section and leaves its index out', async () => {
    const root = await tree({
      'docs/index.mdx': '---\ntitle: Guides\n---\n',
      'docs/quickstart.mdx': '---\ntitle: Quickstart\n---\n',
      'docs/architecture.mdx': '---\ntitle: Architecture\n---\n',
      'foundations/index.mdx': '---\ntitle: Foundations\n---\n',
      'foundations/colors.mdx': '---\ntitle: Colors\n---\n',
    })
    const pages = await collectContentPages(root, SECTIONS)

    expect(pages.map((page) => page.url)).toEqual([
      '/docs/architecture',
      '/docs/quickstart',
      '/foundations/colors',
    ])
  })

  it('reaches a page nested below its Section and routes it from where it sits', async () => {
    const root = await tree({
      'docs/quickstart.mdx': '---\ntitle: Quickstart\n---\n',
      'docs/guides/using-llms.mdx': '---\ntitle: Using llms\n---\n',
      'docs/guides/agent/mcp.mdx': '---\ntitle: MCP\n---\n',
      'docs/guides/agent/tools.mdx': '---\ntitle: Tools\n---\n',
    })
    const pages = await collectContentPages(root, SECTIONS)

    expect(pages.map((page) => page.url)).toEqual([
      '/docs/guides/agent/mcp',
      '/docs/guides/agent/tools',
      '/docs/guides/using-llms',
      '/docs/quickstart',
    ])

    const deep = pages.find((page) => page.url === '/docs/guides/agent/mcp')
    expect(deep).toMatchObject({
      section: 'docs',
      // The slug carries the folders below the Section, so the store's
      // section and slug still join to the page's public path.
      slug: 'guides/agent/mcp',
      route: 'docs/guides/agent/mcp',
      mirrorPath: 'md/docs/guides/agent/mcp.md',
    })
    expect(path.basename(deep?.file ?? '')).toBe('mcp.mdx')
  })

  it('leaves a nested index out at every level, not only at the top', async () => {
    const root = await tree({
      'docs/guides/index.mdx': '---\ntitle: Guides\n---\n',
      'docs/guides/agent/index.mdx': '---\ntitle: Agent\n---\n',
      'docs/guides/agent/mcp.mdx': '---\ntitle: MCP\n---\n',
    })
    const pages = await collectContentPages(root, SECTIONS)

    expect(pages.map((page) => page.url)).toEqual(['/docs/guides/agent/mcp'])
  })

  it('walks in a stable order, so the emitted corpus is byte-stable', async () => {
    const root = await tree({
      'docs/b.mdx': '---\ntitle: B\n---\n',
      'docs/a.mdx': '---\ntitle: A\n---\n',
      'docs/z/y.mdx': '---\ntitle: Y\n---\n',
      'docs/z/x.mdx': '---\ntitle: X\n---\n',
    })
    const once = await collectContentPages(root, SECTIONS)
    const twice = await collectContentPages(root, SECTIONS)

    expect(once.map((page) => page.route)).toEqual(twice.map((page) => page.route))
  })

  it('fails on a declared Section that is not on disk instead of skipping it', async () => {
    const root = await tree({ 'docs/quickstart.mdx': '---\ntitle: Quickstart\n---\n' })
    await rm(path.join(root, 'foundations'), { recursive: true, force: true })

    await expect(collectContentPages(root, SECTIONS)).rejects.toThrow(
      /the content Section 'foundations' is declared/,
    )
  })
})

describe('emit, with the content walk reading a nested tree', () => {
  let out = ''
  let contentRoot = ''
  let store: Awaited<ReturnType<typeof emit>>['store']

  beforeAll(async () => {
    const root = await tree({
      'docs/index.mdx': '---\ntitle: Guides\n---\n\nThe index.\n',
      'docs/quickstart.mdx': '---\ntitle: Quickstart\ndescription: The first page.\n---\n\nStart here.\n',
      'docs/guides/agent/mcp.mdx':
        '---\ntitle: MCP\ndescription: The read-only tools.\n---\n\nTools an agent calls.\n',
    })
    contentRoot = root
    out = path.join(root, 'corpus')
    const emitted = await emit(out, { contentRoot })
    store = emitted.store as typeof store
  })

  it('links the nested page in llms.txt', async () => {
    const llmsTxt = await readFile(path.join(out, 'llms.txt'), 'utf8')
    expect(llmsTxt).toContain(
      '- [MCP](https://prism.nanisoft.com/docs/guides/agent/mcp.md): The read-only tools.',
    )
  })

  it('carries the nested page in full in llms-full.txt', async () => {
    const full = await readFile(path.join(out, 'llms-full.txt'), 'utf8')
    expect(full).toContain('Tools an agent calls.')
  })

  it('writes the nested mirror at the path its position in the tree implies', async () => {
    const mirror = await readFile(path.join(out, 'md', 'docs', 'guides', 'agent', 'mcp.md'), 'utf8')
    expect(mirror).toContain('# MCP')
  })

  it('puts the nested page in the store under the fields the tools match on', () => {
    const page = store?.pages.find((entry) => entry.url === '/docs/guides/agent/mcp')
    expect(page).toMatchObject({
      id: 'docs/guides/agent/mcp',
      slug: 'guides/agent/mcp',
      section: 'docs',
      // `get_page` resolves on `url` and `mirror`, so both carry the tree path.
      url: '/docs/guides/agent/mcp',
      mirror: '/docs/guides/agent/mcp.md',
    })
  })

  it('keeps the flat pages it reached before, and the index pages it always left out', () => {
    const urls = store?.pages.map((entry) => entry.url)
    expect(urls).toContain('/docs/quickstart')
    expect(urls).not.toContain('/docs')
  })
})
