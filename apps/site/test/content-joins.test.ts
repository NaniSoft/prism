import { describe, expect, it } from 'vitest'

import { findContentJoins, parseNav, routeForFile } from '../scripts/content-joins.mjs'

/**
 * The content-join gate, proven shape-agnostic.
 *
 * Two fixtures carry the same content at two depths: `flat` is the tree the
 * site has today and `nested` is the tree it is moving to. Every join is
 * asserted against both, because a rule that only held for the flat tree would
 * pass vacuously now and break at the moment the tree moves. Each failure the
 * gate exists to catch is then proved to fail, on both shapes where it can.
 *
 * The ordering join is one of them and the reason a page cannot quietly leave the
 * navigation. A `pages` array in a meta file is a whitelist: a page it omits
 * keeps its route and disappears from the sidebar, with a green build. The tree
 * that would show it cannot be built outside the bundler that compiled the
 * macro, so the rule is stated over the two surfaces the gate already reads, and
 * the build's own refusal is proved in `nav.test.ts` instead.
 *
 * The changelog joins are the newest, and they are the ones the reference design
 * system has no equivalent of: a published package holding a changelog and no
 * route is a finding there only because this gate says so, and the reference can
 * lose every one of its changelog pages with its continuous integration green.
 *
 * The route join is the one this restructure put in front of the reader. An Item's
 * page states the route it is published at, because it is filed under its Kind and
 * its Category while it is addressed by its Section, and a document that states
 * another one is a page the Corpus, the redirects and every cached agent
 * instruction do not point at. The build refuses it too, and both are asserted:
 * the build's refusal in `content-tree.test.ts`, the Corpus's side here, on both
 * shapes.
 *
 * The navigation is a tree here, not a list of hrefs, because the Category join
 * is about where an Item sits rather than whether it is linked at all. An Item
 * filed under a Category folder has to be rendered *inside* the group that
 * folder is for, and the label on that group has to be the Catalogue's word for
 * the Category. A flat list of hrefs cannot tell a reader in a group from a
 * reader beside one, so the gate reads the published markup as the tree it is.
 */

type Joins = Parameters<typeof findContentJoins>[0]
type NavBlock = Joins['navBlocks'][number]
type NavGroup = NavBlock['groups'][number]

const groups = (findings: ReturnType<typeof findContentJoins>) => findings.map((f) => f.group)

/** One navigation block, holding the groups the sidebar renders. */
const sidebar = (...groups: NavGroup[]): NavBlock => ({ hrefs: [], groups: [...groups, changelogs()] })

/** One Section in the sidebar: a heading with a route, and what it lists. */
const section = (
  label: string,
  url: string,
  hrefs: string[] = [],
  groups: NavGroup[] = [],
): NavGroup => ({ label, url, hrefs, groups })

/**
 * The Changelogs Section, appended to every fixture's sidebar.
 *
 * It is a function because the failing-case tests below each rebuild the whole
 * navigation to change one thing about it. A Section that had to be re-stated in
 * each of them is a Section one of them would eventually forget, which is the
 * omission the gate exists to catch rather than a mistake in a fixture.
 */
const changelogs = () => section('Changelogs', '/changelogs', ['/changelogs/prism-ui'])

/** The header row, which is a block of routes with no group of its own. */
const header: NavBlock = {
  hrefs: [
    '/',
    '/docs',
    '/foundations',
    '/components',
    '/blocks',
    '/pages',
    '/content',
    '/changelogs',
    '/themes',
  ],
  groups: [],
}

/**
 * The one published package the fixtures carry, in the four places it appears:
 * the workspace, the generated file on the content tree, the authored index and
 * the Corpus. Each of the four is a list that can be wrong on its own, and every
 * changelog join is a join between two of them, so a fixture carrying only one of
 * them would prove nothing.
 */
const CHANGELOG_TEXT = '# @nanisoft/prism-ui\n\n## 0.5.0\n\nThe first published line.\n'
const changelogPackage = {
  package: '@nanisoft/prism-ui',
  route: '/changelogs/prism-ui',
  file: 'packages/ui/CHANGELOG.md',
  text: CHANGELOG_TEXT,
}
const changelogFile = {
  route: '/changelogs/prism-ui',
  file: 'content/changelogs/prism-ui.md',
  text: CHANGELOG_TEXT,
}

const flat: Joins = {
  catalogue: [
    { name: 'Button', slug: 'button', kind: 'component', category: 'Call to action' },
    { name: 'Hero01', slug: 'hero-01', kind: 'block', category: null },
  ],
  sections: ['docs', 'foundations', 'content', 'changelogs'],
  contentDirectories: ['changelogs', 'content', 'docs', 'foundations'],
  contentFiles: [
    { route: '/changelogs', file: 'content/changelogs/index.mdx', index: true },
    { route: '/changelogs/prism-ui', file: 'content/changelogs/prism-ui.md', index: false },
    { route: '/content', file: 'content/content/index.mdx', index: true },
    { route: '/content/voice', file: 'content/content/voice.mdx', index: false },
    { route: '/docs', file: 'content/docs/index.mdx', index: true },
    { route: '/docs/quickstart', file: 'content/docs/quickstart.mdx', index: false },
    { route: '/foundations', file: 'content/foundations/index.mdx', index: true },
    { route: '/foundations/colors', file: 'content/foundations/colors.mdx', index: false },
  ],
  links: [
    { file: 'content/docs/index.mdx', href: '/docs/quickstart' },
    { file: 'content/changelogs/index.mdx', href: '/changelogs/prism-ui' },
  ],
  itemDocs: [
    {
      slug: 'button',
      kind: 'component',
      file: 'items/component/button.mdx',
      group: [],
      route: '/components/button',
      demo: 'button-demo',
      demos: ['button-demo'],
    },
    {
      slug: 'hero-01',
      kind: 'block',
      file: 'items/block/hero-01.mdx',
      group: [],
      route: '/blocks/hero-01',
      demo: 'hero-demo',
      demos: ['hero-demo'],
    },
  ],
  demoFiles: ['button-demo', 'hero-demo'],
  changelogPackages: [changelogPackage],
  changelogFiles: [changelogFile],
  changelogIndex: ['/changelogs/prism-ui'],
  corpus: {
    items: [
      { slug: 'button', kind: 'component', url: '/components/button' },
      { slug: 'hero-01', kind: 'block', url: '/blocks/hero-01' },
    ],
    pages: [
      { section: 'content', slug: 'voice', url: '/content/voice', mirror: '/content/voice.md' },
      { section: 'docs', slug: 'quickstart', url: '/docs/quickstart', mirror: '/docs/quickstart.md' },
      {
        section: 'foundations',
        slug: 'colors',
        url: '/foundations/colors',
        mirror: '/foundations/colors.md',
      },
      {
        section: 'changelogs',
        slug: 'prism-ui',
        url: '/changelogs/prism-ui',
        mirror: '/changelogs/prism-ui.md',
      },
    ],
    changelogs: [
      { package: '@nanisoft/prism-ui', route: '/changelogs/prism-ui', versions: ['0.5.0'] },
    ],
  },
  routes: [
    '/',
    '/blocks',
    '/blocks/hero-01',
    '/changelogs',
    '/changelogs/prism-ui',
    '/components',
    '/components/button',
    '/content',
    '/content/voice',
    '/docs',
    '/docs/quickstart',
    '/foundations',
    '/foundations/colors',
    '/pages',
    '/themes',
  ],
  navBlocks: [
    header,
    sidebar(
      section('Guides', '/docs', ['/docs/quickstart']),
      section('Foundations', '/foundations', ['/foundations/colors']),
      section('Content', '/content', ['/content/voice']),
      section('Components', '/components', ['/components/button']),
      section('Blocks', '/blocks', ['/blocks/hero-01']),
    ),
  ],
}

/** The same content with a Foundations page one and two folders deeper. */
const nested: Joins = {
  ...flat,
  contentFiles: [
    { route: '/changelogs', file: 'content/changelogs/index.mdx', index: true },
    { route: '/changelogs/prism-ui', file: 'content/changelogs/prism-ui.md', index: false },
    { route: '/content', file: 'content/content/index.mdx', index: true },
    { route: '/content/voice', file: 'content/content/voice.mdx', index: false },
    { route: '/docs', file: 'content/docs/index.mdx', index: true },
    { route: '/docs/quickstart', file: 'content/docs/quickstart.mdx', index: false },
    { route: '/foundations', file: 'content/foundations/index.mdx', index: true },
    { route: '/foundations/tokens', file: 'content/foundations/tokens/index.mdx', index: true },
    {
      route: '/foundations/tokens/colors',
      file: 'content/foundations/tokens/colors.mdx',
      index: false,
    },
    {
      route: '/foundations/tokens/contrast/ratios',
      file: 'content/foundations/tokens/contrast/ratios.mdx',
      index: false,
    },
  ],
  links: [
    { file: 'content/docs/index.mdx', href: '/docs/quickstart' },
    { file: 'content/foundations/index.mdx', href: '/foundations/tokens' },
    { file: 'content/foundations/tokens/index.mdx', href: '/foundations/tokens/colors' },
    { file: 'content/changelogs/index.mdx', href: '/changelogs/prism-ui' },
  ],
  // A Component filed in its own folder, under its Category, which is the shape
  // the tree is moving to and the one the Category join exists for.
  itemDocs: [
    {
      slug: 'button',
      kind: 'component',
      file: 'items/component/call-to-action/button/button.mdx',
      group: ['call-to-action'],
      route: '/components/button',
      demo: 'button',
      demos: ['button'],
    },
    {
      slug: 'hero-01',
      kind: 'block',
      file: 'items/block/hero-01.mdx',
      group: [],
      route: '/blocks/hero-01',
      demo: 'hero-demo',
      demos: ['hero-demo'],
    },
  ],
  demoFiles: ['button', 'hero-demo'],
  corpus: {
    ...flat.corpus,
    pages: [
      ...flat.corpus.pages.filter((page) => page.section !== 'foundations'),
      {
        section: 'foundations',
        slug: 'tokens/colors',
        url: '/foundations/tokens/colors',
        mirror: '/foundations/tokens/colors.md',
      },
      {
        section: 'foundations',
        slug: 'tokens/contrast/ratios',
        url: '/foundations/tokens/contrast/ratios',
        mirror: '/foundations/tokens/contrast/ratios.md',
      },
    ],
  },
  routes: [
    ...flat.routes,
    '/foundations/tokens',
    '/foundations/tokens/colors',
    '/foundations/tokens/contrast/ratios',
  ],
  navBlocks: [
    header,
    sidebar(
      section('Guides', '/docs', ['/docs/quickstart']),
      section('Foundations', '/foundations', ['/foundations/colors'], [
        section('Tokens', '/foundations/tokens', ['/foundations/tokens/colors'], [
          section('Contrast', '', ['/foundations/tokens/contrast/ratios']),
        ]),
      ]),
      section('Content', '/content', ['/content/voice']),
      section('Components', '/components', [], [
        section('Call to action', '', ['/components/button']),
      ]),
      section('Blocks', '/blocks', ['/blocks/hero-01']),
    ),
  ],
}

const shapes: [string, Joins][] = [
  ['a flat tree', flat],
  ['a nested tree', nested],
]

/** The joins with one route added to the published navigation. */
function linked(joins: Joins, href: string): Joins {
  return {
    ...joins,
    navBlocks: joins.navBlocks.map((block, at) =>
      at === 0 ? { ...block, hrefs: [...block.hrefs, href] } : block,
    ),
  }
}

/** The joins with one route dropped from the published navigation. */
function unlinked(joins: Joins, href: string): Joins {
  return {
    ...joins,
    navBlocks: joins.navBlocks.map((block) => ({
      hrefs: block.hrefs.filter((entry) => entry !== href),
      groups: block.groups.map((group) => unlinkGroup(group, href)),
    })),
  }
}

function unlinkGroup(group: NavGroup, href: string): NavGroup {
  return {
    ...group,
    hrefs: group.hrefs.filter((entry) => entry !== href),
    groups: group.groups.map((nestedGroup) => unlinkGroup(nestedGroup, href)),
  }
}

describe('the content-join gate', () => {
  it.each(shapes)('holds for %s', (_name, joins) => {
    expect(findContentJoins(joins)).toEqual([])
  })

  it.each(shapes)('fails for %s when a Catalogue Item has no content folder', (_name, joins) => {
    const findings = findContentJoins({
      ...joins,
      itemDocs: joins.itemDocs.filter((doc) => doc.slug !== 'button'),
    })
    expect(groups(findings)).toContain('catalogue')
    expect(findings[0]?.message).toContain('Button (component) has no documentation file')
  })

  it.each(shapes)('fails for %s when a content folder has no Catalogue Item', (_name, joins) => {
    const findings = findContentJoins({
      ...joins,
      itemDocs: [
        ...joins.itemDocs,
        {
          slug: 'ghost',
          kind: 'component',
          file: 'items/component/ghost.mdx',
          group: [],
          route: '/components/ghost',
          demo: 'ghost-demo',
          demos: ['ghost-demo'],
        },
      ],
      demoFiles: [...joins.demoFiles, 'ghost-demo'],
    })
    expect(groups(findings)).toContain('catalogue')
    expect(findings.some((f) => f.message.includes("documents 'ghost'"))).toBe(true)
  })

  it.each(shapes)(
    "fails for %s when a document is filed under the wrong Kind",
    (_name, joins) => {
      // An Item page is filed under its Kind and published at its Section, so the
      // two are read from the same document. A document filed under another Kind
      // is filed under a Section the Catalogue does not publish it in.
      const findings = findContentJoins({
        ...joins,
        itemDocs: joins.itemDocs.map((doc) =>
          doc.slug === 'button' ? { ...doc, kind: 'block' } : doc,
        ),
      })
      expect(groups(findings)).toContain('catalogue')
      expect(findings.some((f) => f.message.includes("sits in the 'block' folder"))).toBe(true)
    },
  )

  it.each(shapes)('fails for %s when a document states no route', (_name, joins) => {
    // Without one, the page is addressed by the folder it is filed in, which for a
    // Component filed under its Category is not the address the Corpus advertises.
    // The build refuses it, and this is the same join from the Corpus's side.
    const findings = findContentJoins({
      ...joins,
      itemDocs: joins.itemDocs.map((doc) => (doc.slug === 'button' ? { ...doc, route: null } : doc)),
    })
    expect(groups(findings)).toContain('route')
    expect(findings.some((f) => f.message.includes('states no route'))).toBe(true)
  })

  it.each(shapes)('fails for %s when a document states another route', (_name, joins) => {
    // A published-surface change nothing downstream notices: the build publishes
    // the page where the document says and every tool keeps resolving the
    // Catalogue's address.
    const findings = findContentJoins({
      ...joins,
      itemDocs: joins.itemDocs.map((doc) =>
        doc.slug === 'button' ? { ...doc, route: '/components/buttons' } : doc,
      ),
    })
    expect(groups(findings)).toContain('route')
    expect(
      findings.some(
        (f) => f.message.includes('/components/buttons') && f.message.includes('/components/button'),
      ),
    ).toBe(true)
  })

  it.each(shapes)('fails for %s when a declared Section is not on disk', (_name, joins) => {
    const findings = findContentJoins({
      ...joins,
      contentDirectories: joins.contentDirectories.filter((name) => name !== 'foundations'),
    })
    expect(groups(findings)).toContain('section')
    expect(findings.some((f) => f.message.includes("Section 'foundations' is declared"))).toBe(true)
  })

  it.each(shapes)('fails for %s when a content directory is no declared Section', (_name, joins) => {
    const findings = findContentJoins({
      ...joins,
      contentDirectories: [...joins.contentDirectories, 'scratch'],
    })
    expect(groups(findings)).toContain('section')
    expect(findings.some((f) => f.message.includes('content/scratch'))).toBe(true)
  })

  it.each(shapes)("fails for %s when an Item's Demo is not beside its documentation", (_name, joins) => {
    const findings = findContentJoins({
      ...joins,
      itemDocs: joins.itemDocs.map((doc) =>
        doc.slug === 'button' ? { ...doc, demos: ['button-demo-v2'] } : doc,
      ),
    })
    expect(groups(findings)).toContain('demo')
    expect(findings.some((f) => f.message.includes("names the demo 'button-demo-v2'"))).toBe(true)
  })

  it('fails when a document names a Demo that is not the one beside it', () => {
    // The Demo left behind in a second directory while the documentation moved.
    // The name still resolves to a file, so the file-exists check passes and the
    // Item renders from a directory nobody declared it in.
    const findings = findContentJoins({
      ...nested,
      itemDocs: nested.itemDocs.map((doc) =>
        doc.slug === 'button' ? { ...doc, demos: ['hero-demo'] } : doc,
      ),
    })
    expect(groups(findings)).toContain('demo')
    expect(
      findings.some((f) => f.message.includes('the document and its Demo have come apart')),
    ).toBe(true)
  })

  it('fails when a document has no Demo beside it at all', () => {
    const findings = findContentJoins({
      ...nested,
      itemDocs: nested.itemDocs.map((doc) => (doc.slug === 'button' ? { ...doc, demo: null } : doc)),
      demoFiles: nested.demoFiles.filter((demo) => demo !== 'button'),
    })
    expect(groups(findings)).toContain('demo')
    expect(findings.some((f) => f.message.includes("names the demo 'button'"))).toBe(true)
  })

  it.each(shapes)('fails for %s when a demo file is claimed by no Item', (_name, joins) => {
    const findings = findContentJoins({ ...joins, demoFiles: [...joins.demoFiles, 'orphan-demo'] })
    expect(groups(findings)).toContain('demo')
    expect(findings.some((f) => f.message.includes('claimed by no Item'))).toBe(true)
  })

  it.each(shapes)('fails for %s when a content file is deleted under the Corpus', (_name, joins) => {
    const first = joins.contentFiles.find((file) => !file.index)
    const findings = findContentJoins({
      ...joins,
      contentFiles: joins.contentFiles.filter((file) => file.route !== first?.route),
    })
    expect(groups(findings)).toContain('corpus')
    expect(findings.some((f) => f.message.includes('holds no file at that route'))).toBe(true)
  })

  it.each(shapes)('fails for %s when the Corpus does not carry a content page', (_name, joins) => {
    const first = joins.contentFiles.find((file) => !file.index)
    const findings = findContentJoins({
      ...joins,
      corpus: {
        ...joins.corpus,
        pages: joins.corpus.pages.filter((page) => page.url !== first?.route),
      },
    })
    expect(groups(findings)).toContain('corpus')
    expect(findings.some((f) => f.message.includes('in the tree but not in the Corpus'))).toBe(true)
  })

  it.each(shapes)('fails for %s when the Corpus lists a page the tree lost', (_name, joins) => {
    const findings = findContentJoins({
      ...joins,
      corpus: {
        ...joins.corpus,
        pages: [
          ...joins.corpus.pages,
          {
            section: 'docs',
            slug: 'deleted',
            url: '/docs/deleted',
            mirror: '/docs/deleted.md',
          },
        ],
      },
    })
    expect(groups(findings)).toContain('corpus')
    expect(findings.some((f) => f.message.includes('holds no file at that route'))).toBe(true)
  })

  it.each(shapes)('fails for %s when a link resolves to no route', (_name, joins) => {
    const findings = findContentJoins({
      ...joins,
      links: [...joins.links, { file: 'content/docs/index.mdx', href: '/docs/colours' }],
    })
    expect(groups(findings)).toContain('links')
    expect(findings.some((f) => f.message.includes('links /docs/colours'))).toBe(true)
  })

  it.each(shapes)('fails for %s when the navigation links a route nothing produces', (_name, joins) => {
    // A link carrying a query the tree does not produce. It is not a changelog
    // route: the Changelogs Section is a real route now, so a query pointed at it
    // would resolve and prove nothing.
    const findings = findContentJoins(linked(joins, '/docs/architecture?tab=usage'))
    expect(groups(findings)).toContain('routes')
    expect(findings.some((f) => f.message.includes('routing tree does not produce'))).toBe(true)
  })

  it.each(shapes)('fails for %s when the published export carries no navigation', (_name, joins) => {
    const findings = findContentJoins({ ...joins, navBlocks: [] })
    expect(groups(findings)).toContain('routes')
    expect(findings.some((f) => f.message.includes('carries no navigation'))).toBe(true)
  })

  it.each(shapes)(
    'fails for %s when a content page is published but no ordering claims it',
    (_name, joins) => {
      const findings = findContentJoins(unlinked(joins, '/docs/quickstart'))
      expect(groups(findings)).toContain('routes')
      expect(findings.some((f) => f.message.includes('/docs/quickstart'))).toBe(true)
      expect(findings.some((f) => f.message.includes('reachable only by URL'))).toBe(true)
    },
  )

  it.each(shapes)(
    'fails for %s when a Catalogue Item page is published but no ordering claims it',
    (_name, joins) => {
      const findings = findContentJoins(unlinked(joins, '/components/button'))
      expect(groups(findings)).toContain('routes')
      expect(findings.some((f) => f.message.includes('/components/button'))).toBe(true)
      expect(findings.some((f) => f.message.includes('component button'))).toBe(true)
    },
  )

  it('fails when an Item filed in a Category folder is published with no group', () => {
    // The tree did not nest it, so the reader sees the Item beside the Categories
    // rather than inside one, and the folder says it belongs in one.
    const findings = findContentJoins({
      ...nested,
      navBlocks: [
        header,
        sidebar(
          section('Guides', '/docs', ['/docs/quickstart']),
          section('Foundations', '/foundations', ['/foundations/colors'], [
            section('Tokens', '/foundations/tokens', ['/foundations/tokens/colors'], [
              section('Contrast', '', ['/foundations/tokens/contrast/ratios']),
            ]),
          ]),
          section('Content', '/content', ['/content/voice']),
          section('Components', '/components', ['/components/button']),
          section('Blocks', '/blocks', ['/blocks/hero-01']),
        ),
      ],
    })
    expect(groups(findings)).toContain('category')
    expect(findings.some((f) => f.message.includes('with no group'))).toBe(true)
  })

  it('fails when an Item is published under a group that is not its Category', () => {
    const findings = findContentJoins({
      ...nested,
      navBlocks: [
        header,
        sidebar(
          section('Guides', '/docs', ['/docs/quickstart']),
          section('Foundations', '/foundations', ['/foundations/colors'], [
            section('Tokens', '/foundations/tokens', ['/foundations/tokens/colors'], [
              section('Contrast', '', ['/foundations/tokens/contrast/ratios']),
            ]),
          ]),
          section('Content', '/content', ['/content/voice']),
          section('Components', '/components', [], [
            section('Feedback', '', ['/components/button']),
          ]),
          section('Blocks', '/blocks', ['/blocks/hero-01']),
        ),
      ],
    })
    expect(groups(findings)).toContain('category')
    expect(
      findings.some((f) => f.message.includes("under 'Feedback'") && f.message.includes('Call to action')),
    ).toBe(true)
  })

  it('fails when a Category group lists something that is not a Component of it', () => {
    const findings = findContentJoins({
      ...nested,
      navBlocks: [
        header,
        sidebar(
          section('Guides', '/docs', ['/docs/quickstart']),
          section('Foundations', '/foundations', ['/foundations/colors'], [
            section('Tokens', '/foundations/tokens', ['/foundations/tokens/colors'], [
              section('Contrast', '', ['/foundations/tokens/contrast/ratios']),
            ]),
          ]),
          section('Content', '/content', ['/content/voice']),
          section('Components', '/components', [], [
            section('Call to action', '', ['/components/button', '/docs/quickstart']),
          ]),
          section('Blocks', '/blocks', ['/blocks/hero-01']),
        ),
      ],
    })
    expect(groups(findings)).toContain('category')
    expect(findings.some((f) => f.message.includes('not a Catalogue Item'))).toBe(true)
  })

  it('fails when a Category group lists a Component of another Category', () => {
    // The Catalogue says this is a Block with no Category. A group named for a
    // Category claims it anyway, and a reader is told it is one.
    const findings = findContentJoins({
      ...nested,
      navBlocks: [
        header,
        sidebar(
          section('Guides', '/docs', ['/docs/quickstart']),
          section('Foundations', '/foundations', ['/foundations/colors'], [
            section('Tokens', '/foundations/tokens', ['/foundations/tokens/colors'], [
              section('Contrast', '', ['/foundations/tokens/contrast/ratios']),
            ]),
          ]),
          section('Content', '/content', ['/content/voice']),
          section('Components', '/components', [], [
            section('Call to action', '', ['/components/button', '/blocks/hero-01']),
          ]),
          section('Blocks', '/blocks', ['/blocks/hero-01']),
        ),
      ],
    })
    expect(groups(findings)).toContain('category')
    expect(
      findings.some((f) => f.message.includes("group 'Call to action' lists /blocks/hero-01")),
    ).toBe(true)
  })

  it('reports the missing navigation once, not once per unpublished page', () => {
    // With no published navigation there is nothing to compare against, so the
    // reachability join stays silent and the one finding that does apply is the
    // one about the export carrying no navigation at all.
    const findings = findContentJoins({ ...flat, navBlocks: [] })
    expect(findings).toHaveLength(1)
    expect(findings[0]?.message).toContain('carries no navigation')
  })

  it('never reports an index file as a page the Corpus must carry', () => {
    // The three Section landing pages are routed and are not in the Corpus, so
    // the index files are the one authored file the join must leave alone.
    const indexRoutes = flat.contentFiles.filter((file) => file.index).map((file) => file.route)
    expect(indexRoutes).toEqual(['/changelogs', '/content', '/docs', '/foundations'])
    expect(flat.corpus.pages.map((page) => page.url)).not.toContain('/docs')
  })
})

/**
 * The Changelogs joins, on both shapes.
 *
 * Each failure here is one the reference design system cannot detect, because it
 * publishes reader-facing changelog pages with nothing in its build that knows a
 * package owes a route. The joins are between four surfaces that can each be
 * wrong alone: the workspace, the generated file, the authored index and the
 * Corpus.
 */
describe('the Changelogs joins', () => {
  it.each(shapes)(
    'fails for %s when a published package holds a changelog and no route',
    (_name, joins) => {
      const findings = findContentJoins({ ...joins, changelogFiles: [] })
      expect(groups(findings)).toContain('changelog')
      expect(
        findings.some(
          (f) =>
            f.message.includes('the published package @nanisoft/prism-ui ships a changelog') &&
            f.message.includes('publishes no route for it at /changelogs/prism-ui'),
        ),
      ).toBe(true)
    },
  )

  it.each(shapes)(
    'fails for %s when the generated route is not the package bytes',
    (_name, joins) => {
      // A hand-edited copy, or a copy step that did not run. The page renders,
      // the route exists, the Corpus carries it, and every one of those is true
      // of text that is not what was published.
      const findings = findContentJoins({
        ...joins,
        changelogFiles: joins.changelogFiles.map((entry) => ({
          ...entry,
          text: entry.text.replace('The first published line.', 'Something else entirely.'),
        })),
      })
      expect(groups(findings)).toContain('changelog')
      expect(findings.some((f) => f.message.includes('is not byte for byte'))).toBe(true)
    },
  )

  it.each(shapes)('fails for %s when the route is a hand-authored page', (_name, joins) => {
    const findings = findContentJoins({
      ...joins,
      changelogFiles: joins.changelogFiles.map((entry) => ({
        ...entry,
        file: entry.file.replace(/\.md$/, '.mdx'),
      })),
    })
    expect(groups(findings)).toContain('changelog')
    expect(findings.some((f) => f.message.includes('hand-authored page'))).toBe(true)
  })

  it.each(shapes)(
    'fails for %s when the file names a different package than the route',
    (_name, joins) => {
      const findings = findContentJoins({
        ...joins,
        changelogFiles: joins.changelogFiles.map((entry) => ({
          ...entry,
          text: entry.text.replace('@nanisoft/prism-ui', '@nanisoft/prism-tokens'),
        })),
      })
      expect(groups(findings)).toContain('changelog')
      expect(findings.some((f) => f.message.includes('named for a different package'))).toBe(true)
    },
  )

  it.each(shapes)(
    'fails for %s when a route is published that no package claims',
    (_name, joins) => {
      const findings = findContentJoins({
        ...joins,
        changelogFiles: [
          ...joins.changelogFiles,
          { route: '/changelogs/ghost', file: 'content/changelogs/ghost.md', text: '# ghost\n' },
        ],
      })
      expect(groups(findings)).toContain('changelog')
      expect(findings.some((f) => f.message.includes('no package in the workspace claims'))).toBe(
        true,
      )
    },
  )

  it.each(shapes)(
    'fails for %s when the index does not link a published package',
    (_name, joins) => {
      const findings = findContentJoins({ ...joins, changelogIndex: [] })
      expect(groups(findings)).toContain('changelog')
      expect(findings.some((f) => f.message.includes('the Changelogs index does not link'))).toBe(
        true,
      )
    },
  )

  it.each(shapes)(
    'fails for %s when the index links a route no package publishes',
    (_name, joins) => {
      const findings = findContentJoins({
        ...joins,
        changelogIndex: [...joins.changelogIndex, '/changelogs/prism-tokens'],
      })
      expect(groups(findings)).toContain('changelog')
      expect(findings.some((f) => f.message.includes('which no published package claims'))).toBe(
        true,
      )
    },
  )

  it.each(shapes)(
    'fails for %s when the Corpus carries no changelog for a published package',
    (_name, joins) => {
      const findings = findContentJoins({
        ...joins,
        corpus: { ...joins.corpus, changelogs: [] },
      })
      expect(groups(findings)).toContain('changelog')
      expect(findings.some((f) => f.message.includes('carries no changelog entry'))).toBe(true)
    },
  )

  it.each(shapes)(
    'fails for %s when the Corpus names a different package than the workspace',
    (_name, joins) => {
      const findings = findContentJoins({
        ...joins,
        corpus: {
          ...joins.corpus,
          changelogs: joins.corpus.changelogs.map((entry) => ({
            ...entry,
            package: '@nanisoft/prism-tokens',
          })),
        },
      })
      expect(groups(findings)).toContain('changelog')
      expect(findings.some((f) => f.message.includes('the workspace publishes it as'))).toBe(true)
    },
  )

  it.each(shapes)(
    'fails for %s when the Corpus carries a changelog no package publishes',
    (_name, joins) => {
      const findings = findContentJoins({
        ...joins,
        corpus: {
          ...joins.corpus,
          changelogs: [
            ...joins.corpus.changelogs,
            { package: '@nanisoft/prism-ghost', route: '/changelogs/ghost', versions: ['1.0.0'] },
          ],
        },
      })
      expect(groups(findings)).toContain('changelog')
      expect(findings.some((f) => f.message.includes('an agent can be told about a package'))).toBe(
        true,
      )
    },
  )

  it.each(shapes)(
    'fails for %s when the Section has no authored index for the upgrade notes',
    (_name, joins) => {
      const findings = findContentJoins({
        ...joins,
        contentFiles: joins.contentFiles.filter((file) => file.route !== '/changelogs'),
      })
      expect(groups(findings)).toContain('changelog')
      expect(findings.some((f) => f.message.includes('no index.mdx'))).toBe(true)
    },
  )
})

describe('parseNav', () => {
  // The published shape, trimmed to one Section with a group inside it and the
  // header row above it. Written out rather than read from `out/`, because the
  // test lane does not depend on a build having run.
  const published = `<nav aria-label="Main" class="hidden">
  <a href="/">Overview</a><a href="/components">Components</a>
</nav>
<nav aria-label="Documentation" class="flex flex-col gap-8">
  <div class="flex flex-col gap-2">
    <a class="font-semibold" href="/components">Components</a>
    <ul class="flex flex-col gap-1 border-l">
      <li><a href="/components/badge">Badge</a></li>
      <li>
        <div class="flex flex-col gap-2">
          <span class="font-semibold">Data display</span>
          <ul class="flex flex-col gap-1 border-l">
            <li><a href="/components/card">Card</a></li>
            <li><a href="/components/table">Table</a></li>
          </ul>
        </div>
      </li>
    </ul>
  </div>
  <div class="flex flex-col gap-2">
    <span class="font-semibold">Miscellaneous</span>
    <ul class="flex flex-col gap-1 border-l">
      <li><a href="/components/typography">Typography</a></li>
    </ul>
  </div>
</nav>`

  it('reads a block with no list as routes at its own level', () => {
    const [first] = parseNav(published)
    expect(first).toEqual({ hrefs: ['/', '/components'], groups: [] })
  })

  it('reads a group, its heading route and the routes listed in it', () => {
    const [, sidebarBlock] = parseNav(published)
    const [components, miscellaneous] = sidebarBlock.groups
    expect([components.label, components.url]).toEqual(['Components', '/components'])
    expect(components.hrefs).toEqual(['/components/badge'])
  })

  it('reads a group with no route as a label, and keeps its children out of its own routes', () => {
    const [, sidebarBlock] = parseNav(published)
    const miscellaneousGroup = sidebarBlock.groups[1]
    expect([miscellaneousGroup.label, miscellaneousGroup.url]).toEqual(['Miscellaneous', null])
    expect(miscellaneousGroup.hrefs).toEqual(['/components/typography'])
  })

  it('reads a nested group rather than flattening it into its parent', () => {
    const [, sidebarBlock] = parseNav(published)
    const [dataDisplay] = sidebarBlock.groups[0].groups
    expect([dataDisplay.label, dataDisplay.url]).toEqual(['Data display', null])
    expect(dataDisplay.hrefs).toEqual(['/components/card', '/components/table'])
    // The nested routes are reachable but are not the outer group's own list,
    // which is the whole difference between a reader inside a group and one
    // beside it.
    expect(sidebarBlock.groups[0].hrefs).toEqual(['/components/badge'])
  })

  it('finds nothing in a page with no navigation', () => {
    expect(parseNav('<main>no navigation here</main>')).toEqual([])
  })
})

describe('routeForFile', () => {
  it('gives an index file its folder and every other file its own path', () => {
    expect(routeForFile('index')).toBe('/')
    expect(routeForFile('docs/index')).toBe('/docs')
    expect(routeForFile('docs/quickstart')).toBe('/docs/quickstart')
  })

  it('applies the same rule at any depth', () => {
    expect(routeForFile('foundations/tokens/index')).toBe('/foundations/tokens')
    expect(routeForFile('foundations/tokens/colors')).toBe('/foundations/tokens/colors')
    expect(routeForFile('components/call-to-action/button/button')).toBe(
      '/components/call-to-action/button/button',
    )
  })
})
