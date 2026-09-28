import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { collectContentPages, emit } from '../scripts/build.mjs'
import { STORE_SECTIONS } from '../src/store.js'

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

/**
 * The Section names the fixtures are built from, which are the ones the site
 * publishes. The walk takes the list as an argument, so a fixture may name
 * whatever it likes; naming the real ones keeps a failure here about the walk
 * rather than about a Section that does not exist.
 */
const SECTIONS = [...STORE_SECTIONS]

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
      'overview/index.mdx': '---\ntitle: Overview\n---\n',
      'overview/quickstart.mdx': '---\ntitle: Quickstart\n---\n',
      'overview/architecture.mdx': '---\ntitle: Architecture\n---\n',
      'foundation/index.mdx': '---\ntitle: Foundation\n---\n',
      'foundation/colors.mdx': '---\ntitle: Colors\n---\n',
    })
    const pages = await collectContentPages(root, SECTIONS)

    expect(pages.map((page) => page.url)).toEqual([
      '/overview/architecture',
      '/overview/quickstart',
      '/foundation/colors',
    ])
  })

  it('reaches a page nested below its Section and routes it from where it sits', async () => {
    const root = await tree({
      'overview/quickstart.mdx': '---\ntitle: Quickstart\n---\n',
      'overview/guides/using-llms.mdx': '---\ntitle: Using llms\n---\n',
      'overview/guides/agent/mcp.mdx': '---\ntitle: MCP\n---\n',
      'overview/guides/agent/tools.mdx': '---\ntitle: Tools\n---\n',
    })
    const pages = await collectContentPages(root, SECTIONS)

    expect(pages.map((page) => page.url)).toEqual([
      '/overview/guides/agent/mcp',
      '/overview/guides/agent/tools',
      '/overview/guides/using-llms',
      '/overview/quickstart',
    ])

    const deep = pages.find((page) => page.url === '/overview/guides/agent/mcp')
    expect(deep).toMatchObject({
      section: 'overview',
      // The slug carries the folders below the Section, so the store's
      // section and slug still join to the page's public path.
      slug: 'guides/agent/mcp',
      route: 'overview/guides/agent/mcp',
      mirrorPath: 'md/overview/guides/agent/mcp.md',
    })
    expect(path.basename(deep?.file ?? '')).toBe('mcp.mdx')
  })

  it('leaves a nested index out at every level, not only at the top', async () => {
    const root = await tree({
      'overview/guides/index.mdx': '---\ntitle: Guides\n---\n',
      'overview/guides/agent/index.mdx': '---\ntitle: Agent\n---\n',
      'overview/guides/agent/mcp.mdx': '---\ntitle: MCP\n---\n',
    })
    const pages = await collectContentPages(root, SECTIONS)

    expect(pages.map((page) => page.url)).toEqual(['/overview/guides/agent/mcp'])
  })

  it('walks in a stable order, so the emitted corpus is byte-stable', async () => {
    const root = await tree({
      'overview/b.mdx': '---\ntitle: B\n---\n',
      'overview/a.mdx': '---\ntitle: A\n---\n',
      'overview/z/y.mdx': '---\ntitle: Y\n---\n',
      'overview/z/x.mdx': '---\ntitle: X\n---\n',
    })
    const once = await collectContentPages(root, SECTIONS)
    const twice = await collectContentPages(root, SECTIONS)

    expect(once.map((page) => page.route)).toEqual(twice.map((page) => page.route))
  })

  it('fails on a declared Section that is not on disk instead of skipping it', async () => {
    const root = await tree({ 'overview/quickstart.mdx': '---\ntitle: Quickstart\n---\n' })
    await rm(path.join(root, 'foundation'), { recursive: true, force: true })

    await expect(collectContentPages(root, SECTIONS)).rejects.toThrow(
      /the content Section 'foundation' is declared/,
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
    await contentTree({ 'overview/index.mdx': '---\ntitle: Overview\n---\n' })
    await expect(emit(path.join(root, 'corpus-missing'), { contentRoot: root, packages: [pkg] }))
      .rejects.toThrow(/publishes no route for it at \/changelogs\/prism-ui/)
  })

  it('carries the package bytes once the route is there', async () => {
    await contentTree({
      'overview/index.mdx': '---\ntitle: Overview\n---\n',
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
      'overview/index.mdx': '---\ntitle: Overview\n---\n',
      'changelogs/prism-ui.md': '# @nanisoft/prism-tokens\n\n## 0.5.0\n\nA clean break.\n',
    })
    await expect(emit(path.join(root, 'corpus-mislabelled'), { contentRoot: root, packages: [pkg] }))
      .rejects.toThrow(/leads with '@nanisoft\/prism-tokens'/)
  })
})

/**
 * The same absence, two causes, and which of them the message names.
 *
 * From the corpus builder a copy step that never ran and a file a person deleted
 * are one fact: a published package that owes a route and has none. Only one of
 * them is answered by running the copy step, so the message reads the Section to
 * tell them apart. A Section holding no generated file at all has never been
 * copied here; a Section holding another package's route has been copied, and
 * this one is missing from it.
 *
 * Both are proved against a fixture rather than asserted in prose, because the
 * whole point is that the two sentences are chosen by the state of the tree.
 */
describe('which cause a missing changelog route names', () => {
  const pkg = {
    name: '@nanisoft/prism-ui',
    directory: 'packages/ui',
    version: '0.5.0',
    changelog: 'packages/ui/CHANGELOG.md',
    slug: 'prism-ui',
    route: '/changelogs/prism-ui',
    text: '# @nanisoft/prism-ui\n\n## 0.5.0\n\nA clean break.\n',
  }

  it('names a copy step that has not run when the Section holds no generated route', async () => {
    const contentRoot = await tree({ 'overview/index.mdx': '---\ntitle: Overview\n---\n' })
    await expect(emit(path.join(contentRoot, 'corpus-never-copied'), { contentRoot, packages: [pkg] }))
      .rejects.toThrow(/Cause: the copy step has not run/)
  })

  it('names the deleted file and the routes that are there when the Section was copied', async () => {
    const contentRoot = await tree({
      'overview/index.mdx': '---\ntitle: Overview\n---\n',
      'changelogs/prism-tokens.md': '# @nanisoft/prism-tokens\n\n## 1.0.0\n\nThe first token.\n',
    })
    // One failure, two facts about the same message: the route the copy step
    // would have written, named as the one that is missing, and the routes that
    // are there, named as the evidence the Section was copied at all. A message
    // carrying only the cause would not say which file to look at.
    const failure = await emit(path.join(contentRoot, 'corpus-deleted'), { contentRoot, packages: [pkg] }).catch(
      (error: Error) => error,
    )
    expect(failure).toBeInstanceOf(Error)
    const message = (failure as Error).message
    expect(message).toMatch(/Cause: the copy step ran and did not write changelogs\/prism-ui\.md/)
    expect(message).toMatch(/prism-tokens\.md/)
  })
})

describe('emit, with the content walk reading a nested tree', () => {
  let out = ''
  let contentRoot = ''
  let store: Awaited<ReturnType<typeof emit>>['store']

  beforeAll(async () => {
    const root = await tree({
      'overview/index.mdx': '---\ntitle: Overview\n---\n\nThe index.\n',
      'overview/quickstart.mdx': '---\ntitle: Quickstart\ndescription: The first page.\n---\n\nStart here.\n',
      'overview/guides/agent/mcp.mdx':
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
      '- [MCP](https://prism.nanisoft.com/overview/guides/agent/mcp.md): The read-only tools.',
    )
  })

  it('carries the nested page in full in llms-full.txt', async () => {
    const full = await readFile(path.join(out, 'llms-full.txt'), 'utf8')
    expect(full).toContain('Tools an agent calls.')
  })

  it('writes the nested mirror at the path its position in the tree implies', async () => {
    const mirror = await readFile(path.join(out, 'md', 'overview', 'guides', 'agent', 'mcp.md'), 'utf8')
    expect(mirror).toContain('# MCP')
  })

  it('puts the nested page in the store under the fields the tools match on', () => {
    const page = store?.pages.find((entry) => entry.url === '/overview/guides/agent/mcp')
    expect(page).toMatchObject({
      id: 'overview/guides/agent/mcp',
      slug: 'guides/agent/mcp',
      section: 'overview',
      // `get_page` resolves on `url` and `mirror`, so both carry the tree path.
      url: '/overview/guides/agent/mcp',
      mirror: '/overview/guides/agent/mcp.md',
    })
  })

  it('keeps the flat pages it reached before, and the index pages it always left out', () => {
    const urls = store?.pages.map((entry) => entry.url)
    expect(urls).toContain('/overview/quickstart')
    expect(urls).not.toContain('/overview')
  })
})
