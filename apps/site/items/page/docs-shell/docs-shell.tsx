import { DocsShell, type DocsNavEntry } from '@nanisoft/prism-ui/pages/docs-shell'

/**
 * The shape the three consumer sites actually publish, taken from AlphaLens
 * because it is the one that exercises every part of the interface at once: a
 * status inside a section title, a rule between sections, and a section whose
 * own index is a page a reader lands on.
 */
const NAV: DocsNavEntry[] = [
  { type: 'page', title: 'AlphaLens', href: '#alphalens' },
  { type: 'divider', title: 'Data platform (live)' },
  {
    type: 'group',
    title: 'Data platform (live)',
    href: '#data-platform',
    items: [
      { type: 'page', title: 'Capture', href: '#capture' },
      { type: 'page', title: 'Storage', href: '#storage' },
      { type: 'page', title: 'Operations', href: '#platform-operations' },
    ],
  },
  { type: 'divider', title: 'Unified data contract (approved)' },
  {
    type: 'group',
    title: 'Unified data contract (approved)',
    href: '#data-contract',
    items: [
      { type: 'page', title: 'Data feed view', href: '#feed-view' },
      { type: 'page', title: 'Timestamps and symbols', href: '#timestamps' },
    ],
  },
  { type: 'divider', title: 'Research pipeline (designed)' },
  {
    // No `href`: this group is a label, because its folder holds no index page.
    type: 'group',
    title: 'Research pipeline (designed)',
    items: [
      { type: 'page', title: 'Anatomy', href: '#anatomy' },
      { type: 'page', title: 'NSE portability', href: '#nse-portability' },
    ],
  },
]

/** The headings inside this page. Your own pipeline knows them; Prism does not. */
const TOC: DocsNavEntry[] = [
  { type: 'page', title: 'The capture path', href: '#the-capture-path' },
  { type: 'page', title: 'What the store holds', href: '#what-the-store-holds' },
  { type: 'page', title: 'Where this is heading', href: '#where-this-is-heading' },
]

/** A documentation screen: the rail, the document, the contents and the pager. */
export default function DocsShellDemo() {
  return (
    <DocsShell
      title="Storage"
      description="Where a full chain of bars lands, and how it is partitioned."
      nav={NAV}
      toc={TOC}
      currentHref="#storage"
      navLabel="AlphaLens documentation"
      tocLabel="On this page"
      pagerLabel="AlphaLens pages"
      pagerLabels={{ previous: 'Previous', next: 'Next' }}
    >
      <p>
        The chain is written in columnar blocks, one per session per symbol, and
        nothing is rewritten to correct it. What lands is what the exchange sent.
      </p>
      <h2 id="the-capture-path">The capture path</h2>
      <p>
        A capture is a session and a symbol, never a whole day. A day is a
        partition over sessions, which is what makes a backtest cheap to repeat
        and expensive to store twice.
      </p>
      <h2 id="what-the-store-holds">What the store holds</h2>
      <ul>
        <li>Every strike, call and put, at the exchange clock.</li>
        <li>Open interest and the implied volatility of each strike.</li>
        <li>The index future and the spot it settled against.</li>
      </ul>
      <h2 id="where-this-is-heading">Where this is heading</h2>
      <p>
        The same path, ported to .NET, is designed rather than built. The stage it
        is at is in its title, because a stage of a pipeline is not a topic a
        reader may visit in any order.
      </p>
    </DocsShell>
  )
}
