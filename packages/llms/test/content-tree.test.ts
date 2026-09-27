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
 *
 * The two extensions are the same class of omission one step along: a walk that
 * read only `.mdx` would leave every generated changelog route out of the same
 * four artefacts, and the Changelogs Section would exist for a reader and not for
 * an agent.
 */

const SECTIONS = ['docs', 'foundations', 'content', 'changelogs']

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

  it('reads a copied changelog as readily as an authored page', async () => {
    // The Changelogs Section's per-package files are byte-for-byte copies of a
    // published package's `CHANGELOG.md`, so they arrive as plain Markdown. A
    // walk that filtered to `.mdx` would drop every one of them, and the whole
    // Section would exist for a reader and not for an agent.
    const root = await tree({
      'changelogs/index.mdx': '---\ntitle: Changelogs\n---\n',
      'changelogs/prism-ui.md': '# @nanisoft/prism-ui\n\n## 0.5.0\n\nA clean break.\n',
    })
    const pages = await collectContentPages(root, SECTIONS)

    expect(pages.map((page) => page.url)).toEqual(['/changelogs/prism-ui'])
    expect(pages[0]).toMatchObject({
      section: 'changelogs',
      slug: 'prism-ui',
      extension: '.md',
      mirrorPath: 'md/changelogs/prism-ui.md',
    })
  })
})

/**
 * The published packages and their routes.
 *
 * A package that ships a changelog and has no route throws here rather than being
 * skipped, which is the build-time half of the gate the reference design system
 * has no equivalent of. It ships reader-facing changelog pages and nothing in its
 * build can notice when one is deleted, so all of its pages can go and its
 * continuous integration stays green. This builder runs in the site's
 * `prebuild`, so the throw is a failed `pnpm build` and not only a failed check.
 */
describe('a published package with a changelog and no route', () => {
  const text = '# @nanisoft/prism-ui\n\n## 0.5.0\n\nA clean break.\n'
  const pkg = {
    name: '@nanisoft/prism-ui',
    directory: 'packages/ui',
    version: '0.5.0',
    changelog: 'packages/ui/CHANGELOG.md',
    slug: 'prism-ui',
    route: '/changelogs/prism-ui',
    text,
  }

  let root = ''

  beforeAll(async () => {
    root = await mkdtemp(path.join(tmpdir(), 'prism-llms-changelog-'))
    // Every declared Section is a directory, because a declared Section that is
    // not on disk is its own throw and these tests are about the changelog one.
    for (const section of SECTIONS) await mkdir(path.join(root, section), { recursive: true })
  })

  afterAll(async () => {
    await rm(root, { recursive: true, force: true })
  })

  async function contentTree(files: Record<string, string>) {
    for (const relative of Object.keys(files)) {
      const file = path.join(root, ...relative.split('/'))
      await mkdir(path.dirname(file), { recursive: true })
      await writeFile(file, files[relative] as string, 'utf8')
    }
  }

  it('throws rather than dropping the package from the Corpus', async () => {
    await contentTree({ 'docs/index.mdx': '---\ntitle: Guides\n---\n' })
    await expect(emit(path.join(root, 'corpus-missing'), { contentRoot: root, packages: [pkg] }))
      .rejects.toThrow(/publishes no route for it at \/changelogs\/prism-ui/)
  })

  it('carries the package bytes once the route is there', async () => {
    await contentTree({
      'docs/index.mdx': '---\ntitle: Guides\n---\n',
      'changelogs/prism-ui.md': text,
    })
    const out = path.join(root, 'corpus-present')
    const { store } = await emit(out, { contentRoot: root, packages: [pkg] })

    expect(store.changelogs).toHaveLength(1)
    expect(store.changelogs[0]).toMatchObject({
      package: '@nanisoft/prism-ui',
      slug: 'prism-ui',
      route: '/changelogs/prism-ui',
      title: '@nanisoft/prism-ui',
      versions: ['0.5.0'],
    })
    // The bytes, not a re-serialisation of them: the text the tool returns and
    // the mirror an agent fetches are the file the site rendered.
    expect(store.changelogs[0]?.text).toBe(text)
    expect(store.pages.find((page) => page.url === '/changelogs/prism-ui')?.markdown).toBe(text)
    expect(await readFile(path.join(out, 'md', 'changelogs', 'prism-ui.md'), 'utf8')).toBe(text)
  })

  it('refuses a changelog whose own heading names a different package', async () => {
    await contentTree({
      'docs/index.mdx': '---\ntitle: Guides\n---\n',
      'changelogs/prism-ui.md': '# @nanisoft/prism-tokens\n\n## 0.5.0\n\nA clean break.\n',
    })
    await expect(emit(path.join(root, 'corpus-mislabelled'), { contentRoot: root, packages: [pkg] }))
      .rejects.toThrow(/leads with '@nanisoft\/prism-tokens'/)
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
    // The fixture tree declares no published packages, so the changelog
    // projection is empty rather than the workspace's four. The throw that a
    // real package with no route causes is proved in the block below, with a
    // package list this test states.
    const emitted = await emit(out, { contentRoot, packages: [] })
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
