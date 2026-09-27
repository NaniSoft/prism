import { describe, expect, it } from 'vitest'

import { findContentJoins, routeForFile } from '../scripts/content-joins.mjs'

/**
 * The content-join gate, proven shape-agnostic.
 *
 * Two fixtures carry the same content at two depths: `flat` is the tree the
 * site has today and `nested` is the tree it is moving to. Every join is
 * asserted against both, because a rule that only held for the flat tree would
 * pass vacuously now and break at the moment the tree moves. Each failure the
 * gate exists to catch is then proved to fail, on both shapes where it can.
 *
 * The ordering join is the newest of them and the reason a page cannot quietly
 * leave the navigation. A `pages` array in a meta file is a whitelist: a page
 * it omits keeps its route and disappears from the sidebar, with a green build.
 * The tree that would show it cannot be built outside the bundler that compiled
 * the macro, so the rule is stated over the two surfaces the gate already
 * reads, and the build's own refusal is proved in `nav.test.ts` instead.
 */

type Joins = Parameters<typeof findContentJoins>[0]

const groups = (findings: ReturnType<typeof findContentJoins>) => findings.map((f) => f.group)

const flat: Joins = {
  catalogue: [
    { name: 'Button', slug: 'button', kind: 'component' },
    { name: 'Hero01', slug: 'hero-01', kind: 'block' },
  ],
  sections: ['docs', 'foundations', 'content'],
  contentDirectories: ['content', 'docs', 'foundations'],
  contentFiles: [
    { route: '/content', file: 'content/content/index.mdx', index: true },
    { route: '/content/voice', file: 'content/content/voice.mdx', index: false },
    { route: '/docs', file: 'content/docs/index.mdx', index: true },
    { route: '/docs/quickstart', file: 'content/docs/quickstart.mdx', index: false },
    { route: '/foundations', file: 'content/foundations/index.mdx', index: true },
    { route: '/foundations/colors', file: 'content/foundations/colors.mdx', index: false },
  ],
  links: [{ file: 'content/docs/index.mdx', href: '/docs/quickstart' }],
  itemDocs: [
    { slug: 'button', file: 'items/component/button.mdx', demos: ['button-demo'] },
    { slug: 'hero-01', file: 'items/block/hero-01.mdx', demos: ['hero-demo'] },
  ],
  demoFiles: ['button-demo', 'hero-demo'],
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
    ],
  },
  routes: [
    '/',
    '/blocks',
    '/blocks/hero-01',
    '/components',
    '/components/button',
    '/content',
    '/content/voice',
    '/docs',
    '/docs/quickstart',
    '/foundations',
    '/foundations/colors',
  ],
  navHrefs: [
    '/blocks',
    '/blocks/hero-01',
    '/components',
    '/components/button',
    '/content',
    '/content/voice',
    '/docs',
    '/docs/quickstart',
    '/foundations',
    '/foundations/colors',
  ],
}

/** The same content with a Foundations page one and two folders deeper. */
const nested: Joins = {
  ...flat,
  contentFiles: [
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
  ],
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
  navHrefs: [
    ...flat.navHrefs,
    '/foundations/tokens',
    '/foundations/tokens/colors',
    '/foundations/tokens/contrast/ratios',
  ],
}

const shapes: [string, Joins][] = [
  ['a flat tree', flat],
  ['a nested tree', nested],
]

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
        { slug: 'ghost', file: 'items/component/ghost.mdx', demos: ['ghost-demo'] },
      ],
      demoFiles: [...joins.demoFiles, 'ghost-demo'],
    })
    expect(groups(findings)).toContain('catalogue')
    expect(findings.some((f) => f.message.includes("documents 'ghost'"))).toBe(true)
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
    const findings = findContentJoins({
      ...joins,
      navHrefs: [...joins.navHrefs, '/changelogs?category=Call%20to%20action'],
    })
    expect(groups(findings)).toContain('routes')
    expect(findings.some((f) => f.message.includes('routing tree does not produce'))).toBe(true)
  })

  it.each(shapes)('fails for %s when the published export carries no navigation', (_name, joins) => {
    const findings = findContentJoins({ ...joins, navHrefs: [] })
    expect(groups(findings)).toContain('routes')
    expect(findings.some((f) => f.message.includes('carries no navigation'))).toBe(true)
  })

  it.each(shapes)(
    'fails for %s when a content page is published but no ordering claims it',
    (_name, joins) => {
      const findings = findContentJoins({
        ...joins,
        navHrefs: joins.navHrefs.filter((href) => href !== '/docs/quickstart'),
      })
      expect(groups(findings)).toContain('routes')
      expect(findings.some((f) => f.message.includes('/docs/quickstart'))).toBe(true)
      expect(findings.some((f) => f.message.includes('reachable only by URL'))).toBe(true)
    },
  )

  it.each(shapes)(
    'fails for %s when a Catalogue Item page is published but no ordering claims it',
    (_name, joins) => {
      const findings = findContentJoins({
        ...joins,
        navHrefs: joins.navHrefs.filter((href) => href !== '/components/button'),
      })
      expect(groups(findings)).toContain('routes')
      expect(findings.some((f) => f.message.includes('/components/button'))).toBe(true)
      expect(findings.some((f) => f.message.includes('component button'))).toBe(true)
    },
  )

  it('reports the missing navigation once, not once per unpublished page', () => {
    // With no published navigation there is nothing to compare against, so the
    // reachability join stays silent and the one finding that does apply is the
    // one about the export carrying no navigation at all.
    const findings = findContentJoins({ ...flat, navHrefs: [] })
    expect(findings).toHaveLength(1)
    expect(findings[0]?.message).toContain('carries no navigation')
  })

  it('never reports an index file as a page the Corpus must carry', () => {
    // The three Section landing pages are routed and are not in the Corpus, so
    // the index files are the one authored file the join must leave alone.
    const indexRoutes = flat.contentFiles.filter((file) => file.index).map((file) => file.route)
    expect(indexRoutes).toEqual(['/content', '/docs', '/foundations'])
    expect(flat.corpus.pages.map((page) => page.url)).not.toContain('/docs')
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
