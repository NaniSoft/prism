import { readFileSync } from 'node:fs'
import path from 'node:path'

import { render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { DocsShell, type DocsNavEntry } from '../src/pages/docs-shell'

/**
 * The trees under test are the three consumer sites' own, transcribed from their
 * `content/docs/**\/meta.json` ordering files and from the files those orderings
 * name, rather than invented for the test. Each is here because its shape is the
 * reason the Page takes the tree as data:
 *
 *   Nexus     six sections, twenty-seven pages, every section named for a
 *             documentation genre and every folder holding an index. Seven
 *             top-level entries once the root introduction is counted.
 *   AlphaLens six sections, twenty-seven pages, named for subject matter rather
 *             than for a genre, a status inside three of the titles, and six
 *             rules between the sections.
 *   Atlas     four sections, nineteen pages, named for a documentation genre,
 *             and NOT ONE of them holding an index. One of them holds nine pages
 *             under a single heading.
 *
 * A folder's `index.mdx` is the section's own route, so it sits on the group and
 * is not repeated as a child. Every count below is asserted rather than
 * described, so a tree that drifts fails the test rather than the comment.
 *
 * **Every navigation in this Page is in the document twice, and that is the shape
 * rather than an accident of the test.** The tree is rendered once in the rail
 * the `lg` frame draws and once in the disclosure the narrow frame draws, and
 * exactly one of the two is displayed at any width: the rail's aside is
 * `hidden lg:block` and the disclosure is `lg:hidden`, so the other is
 * `display: none`. jsdom loads no stylesheet and evaluates no media query, so both
 * are in the DOM here, which means an unscoped `getByRole('navigation')` finds
 * two of everything and an unscoped `querySelectorAll` counts twice.
 *
 * So the helpers below are how a test says which arrangement it is asserting, and
 * `bothRenderings` is how it asserts that the two agree. Neither is a workaround:
 * a Page that rendered the tree once could not be both a sticky rail and a
 * disclosure without a client boundary, and the alternative was asserted rather
 * than assumed when it was chosen.
 */

const REPO = path.resolve(import.meta.dirname, '..', '..', '..')

const page = (title: string, href: string): DocsNavEntry => ({ type: 'page', title, href })
const divider = (title: string): DocsNavEntry => ({ type: 'divider', title })

/** Nexus: `content/docs`, six folders each with an index, plus the root page. */
const NEXUS: DocsNavEntry[] = [
  page('Introduction', '/docs/introduction'),
  {
    type: 'group',
    title: 'Concepts',
    href: '/docs/concepts',
    items: [
      page('The factory model', '/docs/concepts/the-factory-model'),
      page('Worker containers', '/docs/concepts/worker-containers'),
      page('Orchestration', '/docs/concepts/orchestration'),
      page('Kanban and the human feedback loop', '/docs/concepts/kanban-and-the-human-feedback-loop'),
      page('Multi-project processing', '/docs/concepts/multi-project-processing'),
    ],
  },
  {
    type: 'group',
    title: 'Architecture',
    href: '/docs/architecture',
    items: [
      page('System overview', '/docs/architecture/system-overview'),
      page('Orchestration layer', '/docs/architecture/orchestration-layer'),
      page('Worker container lifecycle', '/docs/architecture/worker-container-lifecycle'),
      page('Kanban service', '/docs/architecture/kanban-service'),
      page('Observability and error handling', '/docs/architecture/observability-and-error-handling'),
    ],
  },
  {
    type: 'group',
    title: 'Configuration',
    href: '/docs/configuration',
    items: [
      page('The configuration model', '/docs/configuration/the-configuration-model'),
      page('The factories layout', '/docs/configuration/the-factories-layout'),
      page('Secrets and token scopes', '/docs/configuration/secrets-and-token-scopes'),
      page('Rootless Docker', '/docs/configuration/rootless-docker'),
    ],
  },
  {
    type: 'group',
    title: 'Operations',
    href: '/docs/operations',
    items: [page('Deployment', '/docs/operations/deployment'), page('Testing strategy', '/docs/operations/testing-strategy')],
  },
  {
    type: 'group',
    title: 'Guides',
    href: '/docs/guides',
    items: [
      page('Writing an issue the factory can build', '/docs/guides/writing-an-issue-the-factory-can-build'),
      page('Reviewing agent work on the kanban', '/docs/guides/reviewing-agent-work-on-the-kanban'),
    ],
  },
  {
    type: 'group',
    title: 'Reference',
    href: '/docs/reference',
    items: [page('Configuration schema', '/docs/reference/configuration-schema'), page('Glossary', '/docs/reference/glossary')],
  },
]

/** AlphaLens: six sections separated by rules, three titles carrying a status. */
const ALPHALENS: DocsNavEntry[] = [
  page('AlphaLens', '/docs'),
  divider('Data platform (live)'),
  {
    type: 'group',
    title: 'Data platform (live)',
    href: '/docs/data-platform',
    items: [
      page('Capture', '/docs/data-platform/capture'),
      page('Storage', '/docs/data-platform/storage'),
      page('Operations', '/docs/data-platform/operations'),
      page('The .NET port', '/docs/data-platform/dotnet-port'),
    ],
  },
  divider('Unified data contract (approved)'),
  {
    type: 'group',
    title: 'Unified data contract (approved)',
    href: '/docs/data-contract',
    items: [
      page('Data feed view', '/docs/data-contract/data-feed-view'),
      page('Timestamps and symbols', '/docs/data-contract/timestamps-and-symbols'),
      page('External sources', '/docs/data-contract/external-sources'),
      page('Error posture', '/docs/data-contract/error-posture'),
      page('Known gaps', '/docs/data-contract/known-gaps'),
    ],
  },
  divider('Research pipeline (designed)'),
  {
    type: 'group',
    title: 'Research pipeline (designed)',
    href: '/docs/research-pipeline',
    items: [page('Anatomy', '/docs/research-pipeline/anatomy'), page('NSE portability', '/docs/research-pipeline/nse-portability')],
  },
  divider('Research directions'),
  {
    type: 'group',
    title: 'Research directions',
    href: '/docs/research-directions',
    items: [
      page('Backtesting', '/docs/research-directions/backtesting'),
      page('Discovery', '/docs/research-directions/discovery'),
      page('Validation', '/docs/research-directions/validation'),
    ],
  },
  divider('Engineering story'),
  {
    type: 'group',
    title: 'Engineering story',
    href: '/docs/engineering-story',
    items: [
      page('Spike', '/docs/engineering-story/spike'),
      page('Production', '/docs/engineering-story/production'),
      page('Port', '/docs/engineering-story/port'),
      page('Contract', '/docs/engineering-story/contract'),
    ],
  },
  divider('Reference'),
  {
    type: 'group',
    title: 'Reference',
    href: '/docs/reference',
    items: [page('Feed fields', '/docs/reference/feed-fields'), page('Glossary', '/docs/reference/glossary')],
  },
]

/** Atlas: four sections and no index in any of them. */
const ATLAS: DocsNavEntry[] = [
  page('Introduction', '/docs/introduction'),
  {
    type: 'group',
    title: 'Architecture',
    items: [
      page('Platform flow', '/docs/architecture/platform-flow'),
      page('Orchestration', '/docs/architecture/orchestration'),
      page('Transform', '/docs/architecture/transform'),
      page('Storage and catalog', '/docs/architecture/storage-and-catalog'),
      page('Query', '/docs/architecture/query'),
      page('In-house components', '/docs/architecture/in-house-components'),
      page('Observability', '/docs/architecture/observability'),
      page('Delivery', '/docs/architecture/delivery'),
      page('Authorization and secrets', '/docs/architecture/authorization-and-secrets'),
    ],
  },
  {
    type: 'group',
    title: 'Concepts',
    items: [
      page('The twin', '/docs/concepts/the-twin'),
      page('The lakehouse path', '/docs/concepts/the-lakehouse-path'),
      page('Traversal and policy', '/docs/concepts/traversal-and-policy'),
      page('The component model', '/docs/concepts/the-component-model'),
    ],
  },
  {
    type: 'group',
    title: 'Guides',
    items: [
      page('Access traversal', '/docs/guides/access-traversal'),
      page('Reading one finding, three ways', '/docs/guides/reading-one-finding-three-ways'),
      page('Exploring the playground', '/docs/guides/exploring-the-playground'),
    ],
  },
  {
    type: 'group',
    title: 'Reference',
    items: [page('Integration ledger', '/docs/reference/integration-ledger'), page('Glossary', '/docs/reference/glossary')],
  },
]

const BODY = (
  <>
    <p>First paragraph.</p>
    <h2>A heading</h2>
    <p>Second paragraph.</p>
  </>
)

const LABELS = {
  navLabel: 'Documentation',
  tocLabel: 'On this page',
  pagerLabel: 'Documentation pages',
  pagerLabels: { previous: 'Previous', next: 'Next' },
}

const TOC: DocsNavEntry[] = [
  page('Overview', '#overview'),
  page('Usage', '#usage'),
  page('Guidelines', '#guidelines'),
]

/**
 * Every address a tree offers a reader, in the order the tree files them.
 *
 * A section's own index counts, because it is a page a reader lands on, and a
 * rule counts for nothing because it is not a destination at all. This is the
 * order the pager walks, so it is one function and the two cannot disagree.
 */
function destinationsOf(entries: readonly DocsNavEntry[]): DocsNavEntry[] {
  const out: DocsNavEntry[] = []
  const walk = (list: readonly DocsNavEntry[]) => {
    for (const entry of list) {
      if (entry.type === 'page') {
        out.push(entry)
        continue
      }
      if (entry.type === 'divider') continue
      if (entry.href !== undefined) out.push(page(entry.title, entry.href))
      walk(entry.items)
    }
  }
  walk(entries)
  return out
}

/** The sections at the top of a tree, which is what a rule separates. */
const sectionsOf = (entries: readonly DocsNavEntry[]) =>
  entries.filter((entry) => entry.type === 'group').length

/* ------------------------------------------------------------------ *
 * Which arrangement a test is asserting
 * ------------------------------------------------------------------ */

/** The navigation the `lg` frame draws, as a scoped query rather than a role. */
const railOf = (container: HTMLElement) =>
  container.querySelector('[data-slot="docs-rail"] nav') as HTMLElement

/** The contents rail the `lg` frame draws. */
const contentsOf = (container: HTMLElement) =>
  container.querySelector('[data-slot="docs-contents"] nav') as HTMLElement

/** The narrow arrangement: the region holding the disclosures. */
const compactOf = (container: HTMLElement) =>
  container.querySelector('[data-slot="docs-nav-compact"]') as HTMLElement

/** Every anchor inside a region, in document order. */
const linksIn = (region: HTMLElement) => [...region.querySelectorAll('a')]

/**
 * Both renderings of one navigation, matched on its accessible name rather than
 * on its position, so a test can assert the two are the same list rather than
 * than one of them happens to be.
 *
 * The name is compared in JavaScript rather than through an attribute selector
 * because it is a caller-supplied string and a selector would have to be escaped
 * against a value this file does not own. The narrow arrangement comes first in
 * the document, so `[0]` is the disclosure and `[1]` is the rail; a test that means
 * one of them should say so by name, which is what `narrowOf` is for.
 */
const bothRenderings = (container: HTMLElement, label: string) =>
  [...container.querySelectorAll('nav')].filter((nav) => nav.getAttribute('aria-label') === label)

/** One rendering, the one the narrow frame draws, named rather than indexed. */
const narrowOf = (container: HTMLElement, label: string) =>
  bothRenderings(compactOf(container), label)

/**
 * The three trees by name, for the assertions that run over all of them.
 *
 * Typed rather than inferred: `as const` would make each row a readonly tuple,
 * and `for (const [name, nav] of SITES)` would then destructure `nav` as a union
 * of one tuple and a tuple of one, which is not the array it is.
 */
const SITES: Array<[string, DocsNavEntry[]]> = [
  ['Nexus', NEXUS],
  ['AlphaLens', ALPHALENS],
  ['Atlas', ATLAS],
]

describe('the three consumer documentation trees', () => {
  it('holds every tree inside the stated range of pages and sections', () => {
    // The page counts are the .mdx files on disk, and the ticket's range is
    // nineteen to twenty-seven.
    expect(destinationsOf(NEXUS)).toHaveLength(27)
    expect(destinationsOf(ALPHALENS)).toHaveLength(27)
    expect(destinationsOf(ATLAS)).toHaveLength(19)

    // Two of the three file six sections, which is the ticket's "six or seven
    // sections" once the root page above them is counted. Atlas files four, and
    // that is the discrepancy the closing report carries rather than a number to
    // pad up to.
    expect(sectionsOf(NEXUS)).toBe(6)
    expect(sectionsOf(ALPHALENS)).toBe(6)
    expect(sectionsOf(ATLAS)).toBe(4)

    // Nexus is the seven-deep one: six sections under a root introduction.
    expect(NEXUS).toHaveLength(7)
    // AlphaLens puts nine pages under one heading and no section has an index.
    expect(ATLAS.filter((entry) => entry.type === 'group').every((group) => group.href === undefined)).toBe(true)
  })

  it.each(SITES)('renders the navigation, the contents and the pager for %s', (name, nav) => {
    const all = destinationsOf(nav)
    // A page in the middle, so the pager has a neighbour on both sides.
    const middle = all[Math.floor(all.length / 2)] as { href: string }

    const { container } = render(
      <DocsShell {...LABELS} nav={nav} toc={TOC} currentHref={middle.href}>
        {BODY}
      </DocsShell>,
    )

    // The rail carries every destination the tree holds, and nothing else. Read
    // out of the `lg` aside rather than by role, because the narrow arrangement
    // renders the same tree inside its disclosure and a role query finds both.
    expect(linksIn(railOf(container)), name).toHaveLength(all.length)

    // The contents rail carries the consumer's own outline.
    expect(linksIn(contentsOf(container)), name).toHaveLength(TOC.length)

    // The pager renders both halves, derived from the tree and the address, and
    // it is the one navigation on this Page that is drawn once.
    const pager = screen.getByRole('navigation', { name: LABELS.pagerLabel })
    expect(within(pager).getAllByRole('link'), name).toHaveLength(2)

    // And the document, at the measure the system owns.
    expect(container.querySelector('[data-slot="docs-article"]'), name).toBeTruthy()
    expect(container.querySelector('[data-slot="prose"]'), name).toBeTruthy()
  })

  it('renders the same tree in both arrangements, so the narrow one is not a second list', () => {
    for (const [site, tree] of SITES) {
      const { container, unmount } = render(
        <DocsShell {...LABELS} nav={tree} toc={TOC} currentHref="/docs/introduction">
          {BODY}
        </DocsShell>,
      )

      // One rendering in the rail and one behind the disclosure, and they are the
      // same addresses in the same order. A second list that drifted from the
      // first would be a navigation a reader could be sent down by nothing.
      const navs = bothRenderings(container, LABELS.navLabel)
      expect(navs, site).toHaveLength(2)
      const addresses = navs.map((region) => linksIn(region).map((link) => link.getAttribute('href')))
      expect(addresses[1], site).toEqual(addresses[0])

      // The contents rail is drawn in both arrangements on the same terms.
      const contents = bothRenderings(container, LABELS.tocLabel)
      expect(contents, site).toHaveLength(2)
      const outline = contents.map((region) => linksIn(region).map((link) => link.textContent))
      expect(outline[1], site).toEqual(outline[0])
      unmount()
    }
  })

  it('carries the current page in the rail for every site', () => {
    for (const [name, nav] of SITES) {
      const target = destinationsOf(nav)[3] as { href: string }
      const { container, unmount } = render(
        <DocsShell {...LABELS} nav={nav} toc={TOC} currentHref={target.href}>
          {BODY}
        </DocsShell>,
      )
      // Exactly one mark in each arrangement, and the same address in both, so a
      // reader does not see the page marked twice and no arrangement forgets it.
      for (const region of bothRenderings(container, LABELS.navLabel)) {
        const marked = region.querySelectorAll('[aria-current="page"]')
        expect(marked, name).toHaveLength(1)
        expect(marked[0]?.getAttribute('href'), name).toBe(target.href)
      }
      unmount()
    }
  })
})

describe('a section is a label and not a control', () => {
  const statusSection: DocsNavEntry[] = [
    {
      type: 'group',
      title: 'Research pipeline (designed)',
      href: '/docs/research-pipeline',
      items: [page('Anatomy', '/docs/research-pipeline/anatomy'), page('NSE portability', '/docs/research-pipeline/nse-portability')],
    },
  ]

  it('renders a title carrying a status as one label, with the status inside it', () => {
    const { container } = render(
      <DocsShell {...LABELS} nav={statusSection} currentHref="/docs/research-pipeline/anatomy">
        {BODY}
      </DocsShell>,
    )

    const rail = railOf(container)
    const heading = rail.querySelector('[data-slot="docs-nav-heading"]')!
    // The whole string, once, with nothing inside it. The Page reads no
    // parentheses and splits no status out of a caller's title, because a status
    // in the title is part of the title and a reader is owed the whole of it.
    expect(heading.textContent).toBe('Research pipeline (designed)')
    expect(heading.querySelectorAll('*')).toHaveLength(0)
  })

  it('gives that label no control affordance of any kind', () => {
    const { container } = render(
      <DocsShell {...LABELS} nav={statusSection} currentHref="/docs/research-pipeline/anatomy">
        {BODY}
      </DocsShell>,
    )

    // No control: nothing focusable, nothing operable, nothing holding a state a
    // reader could change. A collapsible or a sortable heading would tell a
    // reader that a pipeline stage is an independent topic in any order, which is
    // the one misreading the information architecture exists to prevent.
    //
    // Read out of the group's own row rather than out of the whole document,
    // because the Page does draw a disclosure for the narrow frame and that
    // disclosure is a control a reader operates. It is a control on the Page, over
    // the whole navigation, and it is the opposite of a control on a stage: it
    // says nothing about whether a pipeline stage is a topic. The claim under
    // test is about the stage, so the assertion is scoped to the stage.
    const stage = container.querySelector('[data-slot="docs-nav-group"]') as HTMLElement
    expect(stage.querySelector('button')).toBeNull()
    expect(stage.querySelector('[aria-expanded]')).toBeNull()
    expect(stage.querySelector('[aria-controls]')).toBeNull()
    expect(stage.querySelector('[aria-pressed]')).toBeNull()
    expect(stage.querySelector('[aria-haspopup]')).toBeNull()
    expect(stage.querySelector('summary')).toBeNull()
    expect(stage.querySelector('details')).toBeNull()
    expect(stage.querySelector('select')).toBeNull()
    expect(stage.querySelector('input')).toBeNull()

    // And the element holding the title carries nothing that could be operated:
    // the title is words, so the row holding it is words too.
    const title = railOf(container).querySelector(
      '[data-slot="docs-nav-heading"], [data-slot="docs-nav-label"]',
    ) as HTMLElement
    expect(title.childElementCount).toBe(0)

    // A status is a word, so it is rendered as a word and never as a Badge. A
    // pill beside the heading would be a second rendering of the same fact and
    // would read as a state the rail tracks rather than one the author wrote.
    expect(container.querySelector('[data-slot="badge"]')).toBeNull()
  })

  it('carries no count beside any section, in any of the three trees', () => {
    for (const [name, nav] of SITES) {
      const { container, unmount } = render(
        <DocsShell {...LABELS} nav={nav} toc={TOC} currentHref="/docs/introduction">
          {BODY}
        </DocsShell>,
      )
      // Every word in the rail is the caller's word. A count beside a heading
      // would be a number a reader can act on, and the Page ships none. The
      // dropped-entry tally is not a word a reader meets: it is on the `<nav>` as
      // a data attribute, which is asserted separately and is never rendered.
      for (const region of [
        railOf(container),
        contentsOf(container),
        ...bothRenderings(container, LABELS.navLabel),
        ...bothRenderings(container, LABELS.tocLabel),
      ]) {
        expect(region.textContent, name).not.toMatch(/\d/)
      }
      expect(container.textContent, name).not.toMatch(/collapse|expand|sort/i)
      unmount()
    }
  })
})

describe('a group with no index', () => {
  it('renders as a label rather than a link a reader can follow nowhere', () => {
    const { container } = render(
      <DocsShell {...LABELS} nav={ATLAS} currentHref="/docs/architecture/query">
        {BODY}
      </DocsShell>,
    )

    // Every one of Atlas's four sections has no index, so every one is a label.
    const labels = railOf(container).querySelectorAll('[data-slot="docs-nav-label"]')
    expect(labels).toHaveLength(4)
    expect([...labels].map((element) => element.textContent)).toEqual([
      'Architecture',
      'Concepts',
      'Guides',
      'Reference',
    ])
    for (const label of labels) {
      expect(label.tagName).toBe('SPAN')
      expect(label.closest('a')).toBeNull()
    }
  })

  it('publishes no anchor with a missing or empty destination anywhere in the frame', () => {
    for (const [name, nav] of SITES) {
      const { container, unmount } = render(
        <DocsShell {...LABELS} nav={nav} toc={TOC} currentHref="/docs/introduction">
          {BODY}
        </DocsShell>,
      )

      // The defect this replaces: an anchor with no href is focusable, announces
      // itself as a link, and resolves to the current page. All three sites write
      // `url: node.index?.url ?? ''` in their own adapter today, and two of them
      // carry a stylesheet rule that styles the result back into a label.
      for (const anchor of container.querySelectorAll('a')) {
        expect(anchor.getAttribute('href'), `${name} ${anchor.textContent}`).toBeTruthy()
      }
      unmount()
    }
  })

  it('links the label when the group does have an index', () => {
    const { container } = render(
      <DocsShell {...LABELS} nav={NEXUS} currentHref="/docs/architecture/system-overview">
        {BODY}
      </DocsShell>,
    )

    // Nexus's sections all have an index, so all six are links rather than
    // labels, filed in the order its own meta.json names them.
    expect(railOf(container).querySelectorAll('[data-slot="docs-nav-label"]')).toHaveLength(0)
    const headings = [...railOf(container).querySelectorAll('[data-slot="docs-nav-heading"]')]
    expect(headings.map((element) => element.textContent)).toEqual([
      'Concepts',
      'Architecture',
      'Configuration',
      'Operations',
      'Guides',
      'Reference',
    ])
  })

  it('marks the section current when its own index is the page, and the page when it is not', () => {
    const { container, rerender } = render(
      <DocsShell {...LABELS} nav={NEXUS} currentHref="/docs/architecture/system-overview">
        {BODY}
      </DocsShell>,
    )
    // A page inside a section marks the page, and only the page.
    const first = railOf(container).querySelectorAll('[aria-current="page"]')
    expect(first).toHaveLength(1)
    expect(first[0]?.getAttribute('data-slot')).toBe('docs-nav-link')

    rerender(
      <DocsShell {...LABELS} nav={NEXUS} currentHref="/docs/architecture">
        {BODY}
      </DocsShell>,
    )
    const second = railOf(container).querySelectorAll('[aria-current="page"]')
    expect(second).toHaveLength(1)
    expect(second[0]?.getAttribute('data-slot')).toBe('docs-nav-heading')
  })

  it('still shows a reader they are inside a label-only section', () => {
    const { container } = render(
      <DocsShell {...LABELS} nav={ATLAS} currentHref="/docs/architecture/query">
        {BODY}
      </DocsShell>,
    )

    // A label has no route to answer with, so it asks its children. Without this
    // a reader two levels into Atlas's tree would meet four identical muted
    // headings and no indication which one they were in.
    const active = [...railOf(container)
      .querySelectorAll('[data-slot="docs-nav-label"]')]
      .filter((element) => element.className.includes('text-foreground'))
    expect(active).toHaveLength(1)
    expect(active[0]?.textContent).toBe('Architecture')
  })
})

describe('the pager is derived from the navigation', () => {
  const tree: DocsNavEntry[] = [
    {
      type: 'group',
      title: 'Concepts',
      href: '/docs/concepts',
      items: [
        page('The factory model', '/docs/concepts/the-factory-model'),
        page('Worker containers', '/docs/concepts/worker-containers'),
      ],
    },
    {
      type: 'group',
      title: 'Guides',
      href: '/docs/guides',
      items: [page('Access traversal', '/docs/guides/access-traversal')],
    },
  ]

  it('walks the tree in the order the consumer filed it', () => {
    render(
      <DocsShell {...LABELS} nav={tree} currentHref="/docs/concepts/worker-containers">
        {BODY}
      </DocsShell>,
    )

    const pager = screen.getByRole('navigation', { name: LABELS.pagerLabel })
    const [back, forward] = within(pager).getAllByRole('link')
    expect(back).toHaveAttribute('href', '/docs/concepts/the-factory-model')
    expect(back).toHaveTextContent('The factory model')
    expect(forward).toHaveAttribute('href', '/docs/guides')
    expect(forward).toHaveTextContent('Guides')
  })

  it('is derived from the address, so one tree serves every page', () => {
    const { rerender } = render(
      <DocsShell {...LABELS} nav={tree} currentHref="/docs/concepts/the-factory-model">
        {BODY}
      </DocsShell>,
    )
    const first = screen.getByRole('navigation', { name: LABELS.pagerLabel })
    expect(within(first).getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual([
      '/docs/concepts',
      '/docs/concepts/worker-containers',
    ])
    const firstText = first.textContent

    rerender(
      <DocsShell {...LABELS} nav={tree} currentHref="/docs/guides/access-traversal">
        {BODY}
      </DocsShell>,
    )
    const last = screen.getByRole('navigation', { name: LABELS.pagerLabel })
    // The last page of the tree reaches back to its own section's index, because
    // a section's index is a page a reader lands on and the tree files it first.
    expect(within(last).getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual(['/docs/guides'])

    // The same navigation, two addresses, two different pagers, and the caller
    // passed no neighbours on either render.
    expect(last.textContent).not.toBe(firstText)
  })

  it('renders one half at each end rather than a link to nothing', () => {
    const { rerender } = render(
      <DocsShell {...LABELS} nav={tree} currentHref="/docs/concepts">
        {BODY}
      </DocsShell>,
    )
    let pager = screen.getByRole('navigation', { name: LABELS.pagerLabel })
    expect(within(pager).getAllByRole('link')).toHaveLength(1)
    expect(pager.textContent).toContain('Next')
    expect(pager.textContent).not.toContain('Previous')

    rerender(
      <DocsShell {...LABELS} nav={tree} currentHref="/docs/guides/access-traversal">
        {BODY}
      </DocsShell>,
    )
    pager = screen.getByRole('navigation', { name: LABELS.pagerLabel })
    expect(within(pager).getAllByRole('link')).toHaveLength(1)
    expect(pager.textContent).toContain('Previous')
    expect(pager.textContent).not.toContain('Next')
  })

  it('renders no pager at all for an address that is not in the tree', () => {
    render(
      <DocsShell {...LABELS} nav={tree} currentHref="/docs/not-in-the-tree">
        {BODY}
      </DocsShell>,
    )

    // Two empty halves above a rule is a reader being told the page has no
    // neighbours by a page nobody asked.
    expect(screen.queryByRole('navigation', { name: LABELS.pagerLabel })).toBeNull()
  })

  it('never makes a label-only section one of the two neighbours', () => {
    const { rerender } = render(
      <DocsShell {...LABELS} nav={ATLAS} currentHref="/docs/architecture/platform-flow">
        {BODY}
      </DocsShell>,
    )
    // "Architecture" is a label and not a page, so the first page of the first
    // section reaches back to the root introduction and forward to the second
    // page. A section that were a destination would appear here as a neighbour,
    // and a reader would be sent to a route that resolves to nothing.
    let pager = screen.getByRole('navigation', { name: LABELS.pagerLabel })
    expect(within(pager).getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual([
      '/docs/introduction',
      '/docs/architecture/orchestration',
    ])

    // And the last page of a section steps to the first page of the next, over
    // the boundary the label draws.
    rerender(
      <DocsShell {...LABELS} nav={ATLAS} currentHref="/docs/architecture/authorization-and-secrets">
        {BODY}
      </DocsShell>,
    )
    pager = screen.getByRole('navigation', { name: LABELS.pagerLabel })
    expect(within(pager).getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual([
      '/docs/architecture/delivery',
      '/docs/concepts/the-twin',
    ])
  })

  it('crosses a rule in the tree, because a rule is not a page', () => {
    const all = destinationsOf(ALPHALENS)
    // The last page of Engineering story, which is the page on the near side of
    // the rule AlphaLens puts above its Reference section. Its successor is the
    // section's own index, so the pager steps across the rule rather than to it.
    const beforeRule = all[all.length - 4] as { href: string }
    expect(beforeRule.href).toBe('/docs/engineering-story/contract')

    render(
      <DocsShell {...LABELS} nav={ALPHALENS} currentHref={beforeRule.href}>
        {BODY}
      </DocsShell>,
    )
    // The pager steps across the rule to the next real page. The rule's own
    // title is not a destination anywhere in it, so a reader is never sent to a
    // rule and never finds nothing there.
    const pager = screen.getByRole('navigation', { name: LABELS.pagerLabel })
    expect(within(pager).getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual([
      '/docs/engineering-story/port',
      '/docs/reference',
    ])
  })

  it('takes the two orders the consumer supplies and imposes neither', () => {
    // The rail order and the contents order are different facts about the same
    // page, and a site that files its rail as a pipeline and its contents as a
    // reference has both in one render.
    const contents: DocsNavEntry[] = [
      page('Runbook', '#runbook'),
      page('Field reference', '#field-reference'),
      page('Overview', '#overview'),
    ]
    const { container } = render(
      <DocsShell {...LABELS} nav={NEXUS} toc={contents} currentHref="/docs/introduction">
        {BODY}
      </DocsShell>,
    )

    // The rail, in the tree's order and not alphabetised.
    const headings = [...railOf(container).querySelectorAll('[data-slot="docs-nav-heading"]')].map(
      (element) => element.textContent,
    )
    expect(headings).toEqual(['Concepts', 'Architecture', 'Configuration', 'Operations', 'Guides', 'Reference'])

    // The contents, in the consumer's order and not sorted either. Alphabetical
    // would have put Field reference first and Overview last; the consumer put
    // Runbook first and Overview last, and the Page kept both.
    expect(linksIn(contentsOf(container)).map((link) => link.textContent)).toEqual([
      'Runbook',
      'Field reference',
      'Overview',
    ])
  })
})

/**
 * The tree the reported defect was reproduced with, transcribed from the probe: a
 * page whose address is the empty string and a page whose words are the empty
 * string, with an address either side of each so the pager has neighbours to hand
 * to whatever comes next.
 */
const MALFORMED: DocsNavEntry[] = [
  page('First', '/docs/first'),
  page('Empty href', ''),
  page('', '/docs/nameless'),
  page('Last', '/docs/last'),
]

/**
 * The same tree with the unaddressable row removed, which is what a consumer sees
 * once they have taken the Page's advice about it. The nameless row is still in
 * it, because a blank title is not refused: it is dropped, and the two are
 * answered differently on purpose.
 */
const NAMELESS: DocsNavEntry[] = [
  page('First', '/docs/first'),
  page('', '/docs/nameless'),
  page('Last', '/docs/last'),
]

/**
 * React logs a render-phase error before rethrowing it, and the log is not the
 * assertion. It is silenced for the refusal tests so the run's output says what
 * passed rather than what React said on the way past.
 */
afterEach(() => {
  vi.restoreAllMocks()
})

function mount(tree: DocsNavEntry[], currentHref: string) {
  return () =>
    render(
      <DocsShell {...LABELS} nav={tree} toc={TOC} currentHref={currentHref}>
        {BODY}
      </DocsShell>,
    )
}

function mounting(tree: DocsNavEntry[], currentHref: string) {
  vi.spyOn(console, 'error').mockImplementation(() => {})
  return mount(tree, currentHref)
}

describe('a page entry with no address', () => {
  it('is refused at the boundary, naming the entry and the tree', () => {
    // `href: string` admits `''`, and the only type that refuses it is a branded
    // one, which would put an `as` in every consumer's adapter for three sites
    // this Page is published to. So the type admits it and the Page refuses it.
    // The refusal names the entry because a message that says "an href is
    // required" sends a developer looking at the prop rather than at the row.
    const render1 = mounting(MALFORMED, '/docs/first')

    let thrown: unknown
    try {
      render1()
    } catch (failure) {
      thrown = failure
    }
    expect(String(thrown)).toMatch(/docs-shell/)
    expect(String(thrown)).toMatch(/nav/)
    expect(String(thrown)).toContain('Empty href')
  })

  it('is refused when it is blank rather than empty, because a space is not a route', () => {
    const render1 = mounting(
      [page('First', '/docs/first'), page('Blank href', '   '), page('Last', '/docs/last')],
      '/docs/first',
    )

    expect(render1).toThrow(/Blank href/)
  })

  it('is refused two levels down, because depth is not a defence', () => {
    // The pass walks the whole tree before anything renders, so the entry inside
    // a group is named rather than skipped.
    const render1 = mounting(
      [
        page('First', '/docs/first'),
        {
          type: 'group',
          title: 'Concepts',
          href: '/docs/concepts',
          items: [page('Deep', '/docs/concepts/deep'), page('Also empty', '')],
        },
      ],
      '/docs/first',
    )

    expect(render1).toThrow(/Also empty/)
  })

  it('is refused in the contents rail too, because it is a tree of the same shape', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const render1 = () =>
      render(
        <DocsShell
          {...LABELS}
          nav={NEXUS}
          toc={[page('Overview', '#overview'), page('Broken', '')]}
          currentHref="/docs/introduction"
        >
          {BODY}
        </DocsShell>,
      )

    expect(render1).toThrow(/toc/)
  })

  it('renders nothing at all rather than half a page', () => {
    const render1 = mounting(MALFORMED, '/docs/first')

    expect(render1).toThrow(/Empty href/)
    // The refusal happens before any of the tree renders, so the frame is not
    // half drawn with the bad row in it. A page that rendered everything else
    // would be a page still publishing the defect it just reported.
    expect(document.querySelector('[data-slot="docs-shell"]')).toBeNull()
  })
})

describe('an entry with no words', () => {
  it('renders no row for it at all, rather than a row of nothing', () => {
    const { container } = mount(NAMELESS, '/docs/nameless')()

    // The measured defect: `<li data-slot="docs-nav-page"><span
    // data-slot="docs-nav-label"></span></li>`, 102 of them across 25 of one
    // consumer's 31 documentation pages, because that site maps a heading whose
    // title arrives as a React element to `''`. The Page rendered the blank row, so
    // the Page is what has to refuse it.
    //
    // A row of nothing is not a destination and it is not a label either, because
    // a label is words. Asserted as the absence of the `<li>` and of the empty
    // `docs-nav-label` inside it, because either one alone would let the other
    // back in.
    const rows = railOf(container).querySelectorAll('[data-slot="docs-nav-page"]')
    expect([...rows].map((row) => row.textContent)).toEqual(['First', 'Last'])
    expect(
      [...railOf(container).querySelectorAll('[data-slot="docs-nav-label"]')].filter(
        (label) => label.textContent === '',
      ),
    ).toEqual([])
    expect([...railOf(container).querySelectorAll('li:empty')]).toEqual([])

    // And the same in the narrow arrangement, because it renders the same tree
    // and a fix that reached one copy of the navigation would not be a fix.
    for (const region of bothRenderings(container, LABELS.navLabel)) {
      expect([...region.querySelectorAll('li:empty')]).toEqual([])
      expect(
        [...region.querySelectorAll('[data-slot="docs-nav-label"]')].filter(
          (label) => label.textContent === '',
        ),
      ).toEqual([])
    }
  })

  it('counts what it dropped on the rail, because a row that did not draw is a fact', () => {
    const { container } = mount(NAMELESS, '/docs/nameless')()

    // `Diagram` answers a dropped relation with `data-unresolved-relations` on the
    // element rather than in a console, and a caller reads the element. So the
    // count is on the `<nav>`, on both arrangements, and it is zero when nothing
    // was dropped rather than absent.
    for (const region of bothRenderings(container, LABELS.navLabel)) {
      expect(region.getAttribute('data-unnamed-entries')).toBe('1')
    }

    // Zero on a clean tree, and stated, so a consumer watching the attribute can
    // tell "nothing was wrong" from "the Page stopped counting".
    const { container: clean } = mount(ATLAS, '/docs/introduction')()
    for (const region of bothRenderings(clean, LABELS.navLabel)) {
      expect(region.getAttribute('data-unnamed-entries')).toBe('0')
    }
  })

  it('counts every tree it dropped from, at any depth, in one number', () => {
    const tree: DocsNavEntry[] = [
      page('First', '/docs/first'),
      page('', '/docs/nameless'),
      {
        type: 'group',
        title: '   ',
        items: [page('', '/docs/nameless/deep'), page('Deep', '/docs/concepts/deep')],
      },
      { type: 'group', title: '', items: [] },
      page('Last', '/docs/last'),
    ]
    const { container } = mount(tree, '/docs/first')()

    // Four: the nameless page, the blank-titled group's missing heading, the
    // nameless page inside it, and the group that had neither words nor pages. A
    // counter that only walked the top level would say one.
    expect(railOf(container).getAttribute('data-unnamed-entries')).toBe('4')
  })

  it('drops the label of a group it cannot name while keeping the pages under it', () => {
    const tree: DocsNavEntry[] = [
      page('First', '/docs/first'),
      {
        type: 'group',
        title: '',
        href: '/docs/concepts',
        items: [page('Deep', '/docs/concepts/deep')],
      },
      page('Last', '/docs/last'),
    ]
    const { container } = mount(tree, '/docs/first')()

    // The heading went missing, not the section. Dropping the whole entry would
    // delete a page the reader can reach by every other route, so the group stays
    // and draws its pages with no heading above them.
    const rail = railOf(container)
    expect(rail.querySelectorAll('[data-slot="docs-nav-heading"]')).toHaveLength(0)
    expect([...rail.querySelectorAll('[data-slot="docs-nav-label"]')]).toEqual([])
    expect(linksIn(rail).map((link) => link.getAttribute('href'))).toEqual([
      '/docs/first',
      '/docs/concepts/deep',
      '/docs/last',
    ])
    // The group is still a `<li>` and it is not empty, because it holds its list.
    const group = rail.querySelector('[data-slot="docs-nav-group"]') as HTMLElement
    expect(group.querySelector('ul')).toBeTruthy()
    expect([...group.querySelectorAll('li:empty')]).toEqual([])
  })

  it('leaves the frame with no anchor of no name and no address', () => {
    // The probe's two assertions, restated as the outcome rather than the bug:
    // anchors rendered with an empty `href`, and links with no accessible name.
    const { container } = mount(NAMELESS, '/docs/nameless')()

    expect([...container.querySelectorAll('a')].filter((a) => !a.getAttribute('href'))).toEqual([])
    expect([...container.querySelectorAll('a')].filter((a) => a.textContent === '')).toEqual([])
  })

  it('keeps the entry out of the pager, so one bad row cannot become two', () => {
    // The reported second failure: the empty `href` propagated into the derived
    // pager, so a `Next` link was published carrying the text of whichever entry
    // happened to follow it. Derivation asks the same question the rail asks, so
    // the pager steps over the row rather than publishing it a second time.
    const { container } = mount(NAMELESS, '/docs/first')()

    const pager = screen.getByRole('navigation', { name: LABELS.pagerLabel })
    expect(within(pager).getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual([
      '/docs/last',
    ])
    for (const anchor of container.querySelectorAll('[data-slot="docs-pager"] a')) {
      expect(anchor.getAttribute('href')).toBeTruthy()
      expect(anchor.textContent).not.toBe('')
    }
  })

  it('leaves the reader on the document rather than stranded, and says what the pager loses', () => {
    // Dropping a row is not dropping a page, and this is the whole of what the
    // Page can promise about the page it just declined to draw.
    //
    // The pager is derived from the same rule that dropped the row, so a page the
    // Page cannot name has no pager either: it is not in the flat list the pager
    // walks, so there is no "at" to take a neighbour from. That was already true
    // before the row was dropped, and it is stated here rather than left as the
    // thing a reader finds out. What the Page still owes such a reader is a
    // document, and a way out of it that is not the pager.
    const { container } = mount(NAMELESS, '/docs/nameless')()

    expect(container.querySelector('[data-slot="docs-article"]')).toBeTruthy()
    expect(screen.queryByRole('navigation', { name: LABELS.pagerLabel })).toBeNull()
    // The whole tree is still there to leave by, in both arrangements.
    expect(linksIn(railOf(container)).map((link) => link.getAttribute('href'))).toEqual([
      '/docs/first',
      '/docs/last',
    ])
    expect(linksIn(narrowOf(container, LABELS.navLabel)[0]!).map((link) => link.getAttribute('href'))).toEqual([
      '/docs/first',
      '/docs/last',
    ])

    // And a page the Page CAN name on a tree that also holds one it cannot is
    // unaffected: the pager steps over the unnameable page to its real
    // neighbours rather than publishing it.
    const { container: named } = mount(NAMELESS, '/docs/last')()
    const pager = screen.getByRole('navigation', { name: LABELS.pagerLabel })
    expect(within(pager).getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual([
      '/docs/first',
    ])
    expect(named.querySelector('[data-slot="docs-article"]')).toBeTruthy()
  })

  it('renders a nameless group with a real index as no heading, and drops its index from the pager', () => {
    const tree: DocsNavEntry[] = [
      page('First', '/docs/first'),
      {
        type: 'group',
        title: '',
        href: '/docs/concepts',
        items: [page('Deep', '/docs/concepts/deep')],
      },
      page('Last', '/docs/last'),
    ]
    const { container } = mount(tree, '/docs/first')()

    // The index page exists, but a destination with no words is announced as
    // "link" and nothing else. It is not a neighbour either: a pager link built
    // from it would be the same nameless link a second time. So the pager steps
    // from First over the group to the page inside it.
    expect(container.querySelectorAll('[data-slot="docs-nav-heading"]')).toHaveLength(0)
    const pager = screen.getByRole('navigation', { name: LABELS.pagerLabel })
    expect(within(pager).getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual([
      '/docs/concepts/deep',
    ])
  })

  it('keeps a rule with no words, because a rule is drawn rather than named', () => {
    // The one entry with no words that still renders something. A divider's whole
    // content is a hairline and a title; with no title it is a hairline, which is
    // ink a reader can see rather than a blank row. So it is not counted as a drop
    // and it is not an empty `<li>` in the sense this Page refuses.
    const tree: DocsNavEntry[] = [
      page('First', '/docs/first'),
      divider(''),
      page('Last', '/docs/last'),
    ]
    const { container } = mount(tree, '/docs/first')()

    const rule = railOf(container).querySelector('[data-slot="docs-nav-divider"]') as HTMLElement
    expect(rule).toBeTruthy()
    expect(rule.className).toContain('border-t')
    expect(railOf(container).getAttribute('data-unnamed-entries')).toBe('0')
  })
})

describe('an empty address on a group', () => {
  it('is the same answer as omitting it, which is how the sites already spell it', () => {
    // All three consumer adapters write `url: node.index?.url ?? ''`, so an empty
    // string on a group is a documented state rather than a fault, and reading it
    // as the absence is what makes their two dead stylesheet rules dead rather
    // than load-bearing. Only the page arm has nothing to render in place of the
    // link, so only the page arm is refused.
    const tree: DocsNavEntry[] = [
      page('First', '/docs/first'),
      {
        type: 'group',
        title: 'Architecture',
        href: '',
        items: [page('Query', '/docs/architecture/query')],
      },
      page('Last', '/docs/last'),
    ]
    const { container } = mount(tree, '/docs/first')()

    const rail = railOf(container)
    expect(
      [...rail.querySelectorAll('[data-slot="docs-nav-label"]')].map((label) => label.textContent),
    ).toEqual(['Architecture'])
    expect(rail.querySelectorAll('[data-slot="docs-nav-heading"]')).toHaveLength(0)
    for (const anchor of container.querySelectorAll('a')) {
      expect(anchor.getAttribute('href'), anchor.textContent ?? '').toBeTruthy()
    }
  })

  it('does not make the section claim to hold the current page on its own account', () => {
    // A blank address handed to the prefix test matches every absolute address on
    // the site, so every label-only section would claim to be the current one.
    const tree: DocsNavEntry[] = [
      page('Introduction', '/docs/introduction'),
      {
        type: 'group',
        title: 'Architecture',
        href: '',
        items: [page('Platform flow', '/docs/architecture/platform-flow')],
      },
    ]
    const { container } = mount(tree, '/docs/architecture/platform-flow')()

    // The reader is still inside it, and it still says so, through its children.
    const active = [...railOf(container)
      .querySelectorAll('[data-slot="docs-nav-label"]')]
      .filter((element) => element.className.includes('text-foreground'))
    expect(active).toHaveLength(1)
    expect(active[0]?.textContent).toBe('Architecture')
  })

  it('is not one of the two neighbours either', () => {
    const tree: DocsNavEntry[] = [
      page('First', '/docs/first'),
      {
        type: 'group',
        title: 'Architecture',
        href: '',
        items: [page('Query', '/docs/architecture/query')],
      },
      page('Last', '/docs/last'),
    ]
    mount(tree, '/docs/architecture/query')()

    // A label is not a page, which was already true for an absent `href` and is
    // now true for the empty string the three adapters actually write. The pager
    // steps over the section to reach it, in both directions at once.
    const pager = screen.getByRole('navigation', { name: LABELS.pagerLabel })
    expect(within(pager).getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual([
      '/docs/first',
      '/docs/last',
    ])
  })
})
describe('one Page, three sites', () => {
  it('renders all three trees through the one export with no per-site arm', () => {
    for (const [name, nav] of SITES) {
      const { container, unmount } = render(
        <DocsShell {...LABELS} nav={nav} toc={TOC} currentHref="/docs/introduction">
          {BODY}
        </DocsShell>,
      )

      // The same four regions, whatever the tree looks like.
      expect(container.querySelector('[data-slot="docs-shell"]'), name).toBeTruthy()
      expect(container.querySelector('[data-slot="docs-rail"]'), name).toBeTruthy()
      expect(container.querySelector('[data-slot="docs-article"]'), name).toBeTruthy()
      expect(container.querySelector('[data-slot="docs-contents"]'), name).toBeTruthy()
      unmount()
    }
  })

  it('nests to the depth the tree states rather than to a fixed two levels', () => {
    const deep: DocsNavEntry[] = [
      {
        type: 'group',
        title: 'One',
        items: [
          {
            type: 'group',
            title: 'Two',
            items: [
              {
                type: 'group',
                title: 'Three',
                items: [
                  {
                    type: 'group',
                    title: 'Four',
                    items: [page('Deep page', '/docs/deep')],
                  },
                ],
              },
            ],
          },
        ],
      },
    ]
    const { container } = render(
      <DocsShell {...LABELS} nav={deep} currentHref="/docs/deep">
        {BODY}
      </DocsShell>,
    )

    // One renderer, read at four levels: the depth comes off the list, not out of
    // a fixed shape, so a tree deeper than any of the three is still the same code.
    for (const rail of bothRenderings(container, LABELS.navLabel)) {
      const lists = rail.querySelectorAll('[data-slot="docs-nav-list"]')
      expect([...lists].map((list) => list.getAttribute('data-depth'))).toEqual([
        '0',
        '1',
        '2',
        '3',
        '4',
      ])
      // Four labels and one page, and none of the four labels is a link.
      expect(rail.querySelectorAll('[data-slot="docs-nav-label"]')).toHaveLength(4)
      expect(linksIn(rail)).toHaveLength(1)
    }
  })

  it('renders with a rail and with no rail, because both are trees', () => {
    const { container, rerender } = render(
      <DocsShell {...LABELS} nav={NEXUS} currentHref="/docs/introduction">
        {BODY}
      </DocsShell>,
    )
    expect(container.querySelector('[data-slot="docs-rail"]')).toBeTruthy()

    // A documentation site with one page has a documentation screen and no rail,
    // and a rail of nothing is a column of nothing.
    rerender(
      <DocsShell {...LABELS} currentHref="/docs/only">
        {BODY}
      </DocsShell>,
    )
    expect(container.querySelector('[data-slot="docs-rail"]')).toBeNull()
    expect(container.querySelector('[data-slot="docs-article"]')).toBeTruthy()
  })
})

describe('the rail is bounded in height, and the bound is visible', () => {
  it('caps both rails against the viewport, because one tree is half again as tall', () => {
    // The measurement behind it, asserted rather than described: Atlas files four
    // sections and AlphaLens files six, so the taller rail is fifty percent
    // taller, and a rail that grew with the tree would put the document below the
    // fold on arrival.
    expect(sectionsOf(ATLAS)).toBe(4)
    expect(sectionsOf(ALPHALENS)).toBe(6)
    expect(sectionsOf(ALPHALENS) / sectionsOf(ATLAS)).toBe(1.5)

    const { container } = render(
      <DocsShell {...LABELS} nav={ALPHALENS} toc={TOC} currentHref="/docs/data-contract/known-gaps">
        {BODY}
      </DocsShell>,
    )

    for (const slot of ['docs-rail', 'docs-contents']) {
      const region = container.querySelector(`[data-slot="${slot}"]`) as HTMLElement
      // Sticky on a wrapper that is not the scroll region, and the scroll region
      // inside it. The split is the affordance's: the wrapper is what travels, so
      // the fade can be pinned to its foot while the region scrolls under it. The
      // wrapper's tag is asserted as well as its classes, because the tree before
      // the fix put the sticky classes on the `<nav>` itself and a classes-only
      // assertion passed on it by reading the scroll region as the wrapper.
      //
      // The honest limit: jsdom loads no stylesheet, so this asserts the shipped
      // class contract and cannot measure a layout. The cascade lane that would
      // resolve it is named and unbuilt in DESIGN.md.
      const wrapper = region.firstElementChild as HTMLElement
      expect(wrapper.tagName, slot).toBe('DIV')
      expect(wrapper.className, slot).toContain('sticky')
      expect(wrapper.className, slot).toContain('top-20')

      const scroller = wrapper.querySelector(':scope > nav') as HTMLElement
      expect(scroller, slot).toBeTruthy()
      expect(scroller.className, slot).toContain('max-h-')
      expect(scroller.className, slot).toContain('100svh')
      expect(scroller.className, slot).toContain('overflow-y-auto')
      // The scroll region itself is not sticky, because the sticky wrapper is
      // what pins and a sticky scroll region cannot be measured against a wrapper
      // that is already pinned.
      expect(scroller.className, slot).not.toContain('sticky')
    }
  })

  it('marks the cut at the foot of each rail, because a bound nobody can see is not one', () => {
    // The measured defect: 912 and 1318 pixels of content in a 568 pixel box, so
    // 344 and 750 pixels of a primary documentation navigation sat below the fold
    // with `mask-image: none`, no persistent scrollbar, no fade and no count. The
    // affordance is what the reader looks at to know the fold is a fold.
    const { container } = render(
      <DocsShell {...LABELS} nav={ALPHALENS} toc={TOC} currentHref="/docs/data-contract/known-gaps">
        {BODY}
      </DocsShell>,
    )

    for (const slot of ['docs-rail', 'docs-contents']) {
      const fade = container.querySelector(`[data-slot="${slot}"] [data-slot="docs-rail-fade"]`)
      expect(fade, slot).toBeTruthy()
      const classes = (fade as HTMLElement).className

      // A gradient on the page ground, so the cut reads as the content continuing
      // rather than as the last row having been sliced.
      expect(classes, slot).toContain('bg-gradient-to-t')
      expect(classes, slot).toContain('from-background')
      expect(classes, slot).toContain('to-transparent')
      // Pinned to the foot of the region, so it does not travel with the content.
      expect(classes, slot).toContain('absolute')
      expect(classes, slot).toContain('bottom-0')
      // Height, so the fade is a band rather than the whole rail.
      expect(classes, slot).toMatch(/\bh-\d+\b/)
    }
  })

  it('reserves the band the fade covers, so the last row is legible once scrolled to the end', () => {
    // Without the padding the gradient washes the bottom of the last row
    // permanently, which is the usual cost of a fade and the reason the padding is
    // part of the answer. Asserted as the two agreeing on a height, because the
    // relationship is the whole of it and two numbers written here could drift.
    const { container } = render(
      <DocsShell {...LABELS} nav={ALPHALENS} toc={TOC} currentHref="/docs/data-contract/known-gaps">
        {BODY}
      </DocsShell>,
    )

    for (const slot of ['docs-rail', 'docs-contents']) {
      const region = container.querySelector(`[data-slot="${slot}"]`) as HTMLElement
      const band = /pb-(\d+)/.exec(region.querySelector('nav')!.className)?.[1]
      const height = /\bh-(\d+)/.exec(
        region.querySelector('[data-slot="docs-rail-fade"]')!.className,
      )?.[1]
      expect(band, slot).toBeTruthy()
      expect(height, slot).toBe(band)
    }
  })

  it('costs a keyboard and a screen-reader reader nothing', () => {
    const { container } = render(
      <DocsShell {...LABELS} nav={ALPHALENS} toc={TOC} currentHref="/docs/data-contract/known-gaps">
        {BODY}
      </DocsShell>,
    )

    const fades = [...container.querySelectorAll('[data-slot="docs-rail-fade"]')]
    // Asserted as a count first, because a `for` loop over an empty list asserts
    // nothing at all: the tree before the fix had no fade and this test passed on
    // it by having nothing to look at.
    expect(fades).toHaveLength(2)

    for (const fade of fades) {
      // Announced as nothing: hidden from assistive technology, no text, no role,
      // no name, and outside every list so it cannot be read as a row.
      expect(fade.getAttribute('aria-hidden')).toBe('true')
      expect(fade.textContent).toBe('')
      expect(fade.getAttribute('role')).toBeNull()
      expect(fade.closest('ul')).toBeNull()
      expect(fade.closest('li')).toBeNull()
      // Never takes a press off the row under it, and never a Tab stop.
      expect(fade.className).toContain('pointer-events-none')
      expect(fade.querySelector('a, button, summary, [tabindex]')).toBeNull()
    }

    // And the reader still reaches every entry. The region scrolls on its own, so
    // the arrow keys walk all thirty-one rows and Tab walks all thirty-one links,
    // which is the claim an affordance has to leave alone to be free.
    for (const rail of bothRenderings(container, LABELS.navLabel)) {
      expect(linksIn(rail)).toHaveLength(destinationsOf(ALPHALENS).length)
    }
  })

  it('keeps the rail scrolling inside its bound, because the fade marks a region rather than replacing one', () => {
    // The affordance must not have cost the thing the bound exists for. The
    // independent scroll is what makes the rail sticky and usable on a long
    // document, so it is asserted rather than assumed.
    const { container } = render(
      <DocsShell {...LABELS} nav={ALPHALENS} toc={TOC} currentHref="/docs/data-contract/known-gaps">
        {BODY}
      </DocsShell>,
    )

    for (const slot of ['docs-rail', 'docs-contents']) {
      const region = container.querySelector(`[data-slot="${slot}"]`) as HTMLElement
      const scroller = region.querySelector('nav') as HTMLElement
      expect(scroller.className, slot).toContain('overflow-y-auto')
      // The fade is outside the scroller, so nothing about it can scroll with the
      // content, and the region itself is still the thing that scrolls.
      expect(region.querySelector('nav [data-slot="docs-rail-fade"]'), slot).toBeNull()
      expect(
        region.firstElementChild?.lastElementChild?.getAttribute('data-slot'),
        slot,
      ).toBe('docs-rail-fade')
      expect(scroller.className, slot).not.toContain('overflow-hidden')
    }
  })

  it('binds the short tree the same way as the tall one', () => {
    // A bound that varied with the tree would be a bound computed from a prop,
    // and then the nineteen-page tree and the twenty-seven-page tree would not be
    // the same component.
    const boundsOf = (nav: readonly DocsNavEntry[]) => {
      const { container, unmount } = render(
        <DocsShell {...LABELS} nav={nav} toc={TOC} currentHref="/docs/introduction">
          {BODY}
        </DocsShell>,
      )
      const classes = (
        container.querySelector('[data-slot="docs-rail"] nav') as HTMLElement
      ).className
      unmount()
      return classes
    }

    expect(boundsOf(ATLAS)).toBe(boundsOf(ALPHALENS))
    expect(boundsOf(NEXUS)).toBe(boundsOf(ALPHALENS))
  })
})

describe('the Page ships no copy of its own', () => {
  it('renders only the words the caller passed', () => {
    const { container } = render(
      <DocsShell
        title="Timestamps and symbols"
        description="Every bar carries the exchange clock it was stamped on."
        nav={NEXUS}
        toc={TOC}
        currentHref="/docs/concepts/orchestration"
        {...LABELS}
      >
        {BODY}
      </DocsShell>,
    )

    // The title, the standfirst, the caller's headings, the caller's own labels
    // and the two pager words. Nothing else, and in particular no word a reader
    // would attribute to the design system rather than to the site.
    expect(container.textContent).toContain('Timestamps and symbols')
    expect(container.textContent).toContain('Every bar carries the exchange clock it was stamped on.')
    expect(container.textContent).not.toMatch(/Prism|documentation page|section navigation/i)
  })

  it('makes the title the only h1, and lets a document with no title own its own', () => {
    const { container, rerender } = render(
      <DocsShell title="Orchestration" {...LABELS} nav={NEXUS}>
        {BODY}
      </DocsShell>,
    )
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Orchestration')

    // One of the three sites lets the document's own Markdown own the heading,
    // and the Page renders no empty one to fill the gap.
    rerender(
      <DocsShell {...LABELS} nav={NEXUS}>
        <h1>Orchestration</h1>
        {BODY}
      </DocsShell>,
    )
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(container.querySelector('[data-slot="docs-article"] header')).toBeNull()
  })

  it('renders a rule with no words as a rule rather than an empty label', () => {
    const { container } = render(
      <DocsShell
        {...LABELS}
        nav={[divider(''), page('One', '/one'), divider(''), page('Two', '/two')]}
        currentHref="/one"
      >
        {BODY}
      </DocsShell>,
    )

    // Two rules in each of the two arrangements, and no words in any of them.
    for (const rail of bothRenderings(container, LABELS.navLabel)) {
      const dividers = rail.querySelectorAll('[data-slot="docs-nav-divider"]')
      expect(dividers).toHaveLength(2)
      for (const rule of dividers) {
        expect(rule.textContent).toBe('')
        expect(rule.querySelector('*')).toBeNull()
      }
    }
  })

  it('names each region from a prop, so a site can file them its own way', () => {
    const { container } = render(
      <DocsShell
        {...LABELS}
        navLabel="Nexus documentation"
        tocLabel="On this page"
        pagerLabel="Nexus pages"
        nav={NEXUS}
        toc={TOC}
        currentHref="/docs/introduction"
      >
        {BODY}
      </DocsShell>,
    )

    // Three regions, three distinct names, so a reader who navigates by landmark
    // reaches each one rather than meeting three anonymous lists of links. Two of
    // them are drawn in both arrangements and carry the name in both.
    expect(bothRenderings(container, 'Nexus documentation')).toHaveLength(2)
    expect(bothRenderings(container, 'On this page')).toHaveLength(2)
    expect(screen.getAllByRole('navigation', { name: 'Nexus pages' })).toHaveLength(1)
  })
})

describe('the navigation below `lg`', () => {
  const middleOf = (tree: readonly DocsNavEntry[]) => {
    const all = destinationsOf(tree)
    return (all[Math.floor(all.length / 2)] as { href: string }).href
  }

  it('reaches both navigations, because a reader at 768 or 1024 had nothing but Previous and Next', () => {
    // The gap: both rails were `hidden` below `lg`, so the only navigation left
    // inside the article was the two-item pager at its foot. On a thirty-one
    // document reference that is no contents, no on-this-page and no way to a
    // sibling page except two links.
    const { container } = render(
      <DocsShell {...LABELS} nav={ALPHALENS} toc={TOC} currentHref={middleOf(ALPHALENS)}>
        {BODY}
      </DocsShell>,
    )

    const compact = compactOf(container)
    expect(compact).toBeTruthy()
    // Hidden at `lg` and above, which is what makes the duplicated tree one tree.
    expect(compact.className).toContain('lg:hidden')

    // The whole tree is in the document, reachable, in the narrow arrangement.
    expect(linksIn(narrowOf(container, LABELS.navLabel)[0]!)).toHaveLength(
      destinationsOf(ALPHALENS).length,
    )
    expect(linksIn(narrowOf(container, LABELS.tocLabel)[0]!)).toHaveLength(TOC.length)

    // And the pager still is, so the narrow frame is strictly more than it was.
    expect(
      within(screen.getByRole('navigation', { name: LABELS.pagerLabel })).getAllByRole('link'),
    ).toHaveLength(2)
  })

  it('puts each tree behind a native disclosure that needs no client boundary', () => {
    const { container } = render(
      <DocsShell {...LABELS} nav={ALPHALENS} toc={TOC} currentHref={middleOf(ALPHALENS)}>
        {BODY}
      </DocsShell>,
    )

    const disclosures = [...compactOf(container).querySelectorAll('details')]
    expect(disclosures).toHaveLength(2)
    for (const disclosure of disclosures) {
      // `<details>` is the disclosure the platform holds the state for. There is
      // no `open` in the markup, so a reader at 768 lands on the document rather
      // than thirteen hundred pixels of navigation above it, and the state is a
      // real expanded state on a real control rather than a `aria-expanded` this
      // Page would have to keep in step with something.
      expect(disclosure.hasAttribute('open')).toBe(false)
      // The summary is the first child, which is what makes it the summary.
      expect(disclosure.firstElementChild?.tagName).toBe('SUMMARY')
      // No control inside the control: the links are siblings of the summary, not
      // descendants, so a press on a link resolves against the link alone.
      expect(disclosure.querySelector('summary a, summary button')).toBeNull()
      // And nothing suppressed the platform's own marker or its focus ring.
      const summary = disclosure.querySelector('summary') as HTMLElement
      expect(summary.className).not.toMatch(/outline-none|ring-0/)
      expect(summary.className).toContain('cursor-pointer')
      expect(summary.className).toMatch(/\bpy-\d+\b/)
    }
  })

  it('names each disclosure from the prop that already named its region', () => {
    // A Page ships no reader-facing copy, so the control cannot say "Navigation"
    // or "Menu": the two words it needs are the two the caller already passed to
    // name these two navigations for a screen reader. One word, one language, one
    // place to change it.
    const { container } = render(
      <DocsShell {...LABELS} nav={ALPHALENS} toc={TOC} currentHref={middleOf(ALPHALENS)}>
        {BODY}
      </DocsShell>,
    )

    const summaries = [...compactOf(container).querySelectorAll('summary')].map(
      (summary) => summary.textContent,
    )
    expect(summaries).toEqual([LABELS.navLabel, LABELS.tocLabel])
  })

  it('ships no client boundary, because the disclosure is markup', () => {
    // Read from the SOURCE, not from `dist/`. A `'use client'` line is written in
    // the source and the build does not add one, so the emitted module proves
    // nothing extra, and `dist/` is this package's own build output.
    const source = readFileSync(
      path.join(REPO, 'packages', 'ui', 'src', 'pages', 'docs-shell', 'docs-shell.tsx'),
      'utf8',
    )
    // The same classification `check-client-budget.mjs` uses, so a directive added
    // here would put the Page on the client roster.
    expect(/^['"]use client['"]/m.test(source)).toBe(false)
    // No hook, no context and no event handler: the disclosure is the platform's,
    // so there is nothing for any of the three to hold.
    expect(
      /from ['"]react['"].*\buse(State|Effect|Memo|Callback|Ref|Reducer|Context|SyncExternalStore)\b/.test(
        source,
      ),
    ).toBe(false)
    expect(/createContext|\buseContext\b/.test(source)).toBe(false)
    expect(/\bon(?:Click|Change|Input|Toggle)\b/.test(source)).toBe(false)
    // And no runtime token read: every colour on this Page is a semantic utility,
    // so nothing here resolves a value out of the cascade at runtime.
    expect(/getComputedStyle|getPropertyValue/.test(source)).toBe(false)
  })
})
