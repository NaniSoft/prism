import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

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
 */

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

    // The rail carries every destination the tree holds, and nothing else.
    const rail = screen.getByRole('navigation', { name: LABELS.navLabel })
    expect(within(rail).getAllByRole('link'), name).toHaveLength(all.length)

    // The contents rail carries the consumer's own outline.
    const contents = screen.getByRole('navigation', { name: LABELS.tocLabel })
    expect(within(contents).getAllByRole('link'), name).toHaveLength(TOC.length)

    // The pager renders both halves, derived from the tree and the address.
    const pager = screen.getByRole('navigation', { name: LABELS.pagerLabel })
    expect(within(pager).getAllByRole('link'), name).toHaveLength(2)

    // And the document, at the measure the system owns.
    expect(container.querySelector('[data-slot="docs-article"]'), name).toBeTruthy()
    expect(container.querySelector('[data-slot="prose"]'), name).toBeTruthy()
  })

  it('carries the current page in the rail for every site', () => {
    for (const [name, nav] of SITES) {
      const target = destinationsOf(nav)[3] as { href: string }
      const { unmount } = render(
        <DocsShell {...LABELS} nav={nav} toc={TOC} currentHref={target.href}>
          {BODY}
        </DocsShell>,
      )
      const marked = document.querySelectorAll('[aria-current="page"]')
      expect(marked, name).toHaveLength(1)
      expect(marked[0]?.getAttribute('href'), name).toBe(target.href)
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
    render(
      <DocsShell {...LABELS} nav={statusSection} currentHref="/docs/research-pipeline/anatomy">
        {BODY}
      </DocsShell>,
    )

    const rail = screen.getByRole('navigation', { name: LABELS.navLabel })
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
    expect(screen.queryByRole('button')).toBeNull()
    expect(container.querySelector('[aria-expanded]')).toBeNull()
    expect(container.querySelector('[aria-controls]')).toBeNull()
    expect(container.querySelector('[aria-pressed]')).toBeNull()
    expect(container.querySelector('[aria-haspopup]')).toBeNull()
    expect(container.querySelector('summary')).toBeNull()
    expect(container.querySelector('details')).toBeNull()
    expect(container.querySelector('select')).toBeNull()
    expect(container.querySelector('input')).toBeNull()

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
      // would be a number a reader can act on, and the Page ships none.
      const rail = screen.getByRole('navigation', { name: LABELS.navLabel })
      expect(rail.textContent, name).not.toMatch(/\d/)
      expect(container.textContent, name).not.toMatch(/collapse|expand|sort/i)
      unmount()
    }
  })
})

describe('a group with no index', () => {
  it('renders as a label rather than a link a reader can follow nowhere', () => {
    render(
      <DocsShell {...LABELS} nav={ATLAS} currentHref="/docs/architecture/query">
        {BODY}
      </DocsShell>,
    )

    // Every one of Atlas's four sections has no index, so every one is a label.
    const labels = document.querySelectorAll('[data-slot="docs-nav-label"]')
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
    render(
      <DocsShell {...LABELS} nav={NEXUS} currentHref="/docs/architecture/system-overview">
        {BODY}
      </DocsShell>,
    )

    // Nexus's sections all have an index, so all six are links rather than
    // labels, filed in the order its own meta.json names them.
    expect(document.querySelectorAll('[data-slot="docs-nav-label"]')).toHaveLength(0)
    const headings = [...document.querySelectorAll('[data-slot="docs-nav-heading"]')]
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
    const { rerender } = render(
      <DocsShell {...LABELS} nav={NEXUS} currentHref="/docs/architecture/system-overview">
        {BODY}
      </DocsShell>,
    )
    // A page inside a section marks the page, and only the page.
    expect(document.querySelectorAll('[aria-current="page"]')).toHaveLength(1)
    expect(document.querySelector('[aria-current="page"]')?.getAttribute('data-slot')).toBe('docs-nav-link')

    rerender(
      <DocsShell {...LABELS} nav={NEXUS} currentHref="/docs/architecture">
        {BODY}
      </DocsShell>,
    )
    expect(document.querySelectorAll('[aria-current="page"]')).toHaveLength(1)
    expect(document.querySelector('[aria-current="page"]')?.getAttribute('data-slot')).toBe('docs-nav-heading')
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
    const active = [...container.querySelectorAll('[data-slot="docs-nav-label"]')].filter((element) =>
      element.className.includes('text-foreground'),
    )
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
    render(
      <DocsShell {...LABELS} nav={NEXUS} toc={contents} currentHref="/docs/introduction">
        {BODY}
      </DocsShell>,
    )

    // The rail, in the tree's order and not alphabetised.
    const rail = screen.getByRole('navigation', { name: LABELS.navLabel })
    const headings = [...rail.querySelectorAll('[data-slot="docs-nav-heading"]')].map(
      (element) => element.textContent,
    )
    expect(headings).toEqual(['Concepts', 'Architecture', 'Configuration', 'Operations', 'Guides', 'Reference'])

    // The contents, in the consumer's order and not sorted either. Alphabetical
    // would have put Field reference first and Overview last; the consumer put
    // Runbook first and Overview last, and the Page kept both.
    const toc = screen.getByRole('navigation', { name: LABELS.tocLabel })
    expect([...within(toc).getAllByRole('link')].map((link) => link.textContent)).toEqual([
      'Runbook',
      'Field reference',
      'Overview',
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
    render(
      <DocsShell {...LABELS} nav={deep} currentHref="/docs/deep">
        {BODY}
      </DocsShell>,
    )

    // One renderer, read at four levels: the depth comes off the list, not out of
    // a fixed shape, so a tree deeper than any of the three is still the same code.
    const rail = screen.getByRole('navigation', { name: LABELS.navLabel })
    const lists = rail.querySelectorAll('[data-slot="docs-nav-list"]')
    expect([...lists].map((list) => list.getAttribute('data-depth'))).toEqual(['0', '1', '2', '3', '4'])
    // Four labels and one page, and none of the four labels is a link.
    expect(rail.querySelectorAll('[data-slot="docs-nav-label"]')).toHaveLength(4)
    expect(within(rail).getAllByRole('link')).toHaveLength(1)
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

describe('the rail is bounded in height', () => {
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
      const classes = container.querySelector(`[data-slot="${slot}"] nav`)!.className
      // Bounded, sticky, and scrolling inside the bound rather than growing past
      // it. The honest limit: jsdom loads no stylesheet, so this asserts the
      // shipped class contract and cannot measure a layout. The cascade lane that
      // would resolve it is named and unbuilt in DESIGN.md.
      expect(classes, slot).toContain('max-h-')
      expect(classes, slot).toContain('100svh')
      expect(classes, slot).toContain('overflow-y-auto')
      expect(classes, slot).toContain('sticky')
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
      const classes = container.querySelector('[data-slot="docs-rail"] nav')!.className
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

    const dividers = container.querySelectorAll('[data-slot="docs-nav-divider"]')
    expect(dividers).toHaveLength(2)
    for (const rule of dividers) {
      expect(rule.textContent).toBe('')
      expect(rule.querySelector('*')).toBeNull()
    }
  })

  it('names each region from a prop, so a site can file them its own way', () => {
    render(
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
    // reaches each one rather than meeting three anonymous lists of links.
    expect(screen.getByRole('navigation', { name: 'Nexus documentation' })).toBeTruthy()
    expect(screen.getByRole('navigation', { name: 'On this page' })).toBeTruthy()
    expect(screen.getByRole('navigation', { name: 'Nexus pages' })).toBeTruthy()
  })
})
