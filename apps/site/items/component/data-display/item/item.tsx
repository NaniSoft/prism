'use client'

import { useState } from 'react'

import { Item, type ItemEntry } from '@nanisoft/prism-ui/components/item'
import { Button } from '@nanisoft/prism-ui/components/button'
import { Badge } from '@nanisoft/prism-ui/components/badge'

/**
 * The three shapes worth showing, and the difference between them.
 *
 * The first is the full anatomy: media, a name, a description, a value and an
 * action. The second is the sparse one, with every optional part omitted, because
 * a reserved gap is a gap the reader looks for something in. The third has no
 * destination at all, which is the row a caller reaches for when a list is
 * read-only and the temptation is to put the only link in the actions.
 */
const PACKAGES: ItemEntry[] = [
  {
    id: 'tokens',
    media: <span className="text-xs font-medium">TK</span>,
    title: 'Prism Tokens',
    description: 'Foundation and semantic tokens, and the CSS variable contract',
    meta: '0.9.0',
    href: '/packages/tokens',
    actions: (
      <Button size="sm" variant="outline">
        Open
      </Button>
    ),
    selected: true,
  },
  {
    id: 'ui',
    media: <span className="text-xs font-medium">UI</span>,
    title: 'Prism UI',
    description: 'Components, Blocks and Pages, and the consumer gate kit',
    meta: '0.9.0',
    href: '/packages/ui',
    actions: (
      <Button size="sm" variant="outline">
        Open
      </Button>
    ),
  },
  {
    id: 'llms',
    media: <span className="text-xs font-medium">LM</span>,
    title: 'Prism LLMs',
    description: 'The generated corpus and the store the agent surface reads',
    meta: '0.4.1',
    href: '/packages/llms',
    actions: (
      <Button size="sm" variant="outline">
        Open
      </Button>
    ),
  },
]

/** A row with no destination, so the list is a report and not a set of links. */
const RUNS: ItemEntry[] = [
  {
    id: 'run-1841',
    media: <Badge variant="success">Done</Badge>,
    title: 'Build #1841',
    description: '4 packages, 0 failures',
    meta: '38s',
  },
  {
    id: 'run-1842',
    media: <Badge variant="warning">Running</Badge>,
    title: 'Build #1842',
    description: '2 of 4 packages',
    meta: '12s',
  },
  {
    id: 'run-1840',
    media: <Badge variant="destructive">Failed</Badge>,
    title: 'Build #1840',
    description: 'Tokens build, contrast gate',
    meta: '9s',
  },
]

/** The rows, and the switch between the full anatomy and the sparse one. */
export default function ItemDemo() {
  const [sparse, setSparse] = useState(false)
  const [selected, setSelected] = useState('tokens')

  const rows: ItemEntry[] = PACKAGES.map((entry) =>
    sparse
      ? { id: entry.id, title: entry.title, href: entry.href }
      : { ...entry, selected: entry.id === selected },
  )

  return (
    <div className="flex max-w-measure-wide flex-col gap-6">
      <ul aria-label="Packages" className="border-border divide-border divide-y rounded-md border">
        {rows.map((entry) => (
          <li key={entry.id}>
            <Item
              entry={{
                ...entry,
                actions: (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelected(entry.id)}
                  >
                    {entry.id === selected ? 'Selected' : 'Select'}
                  </Button>
                ),
              }}
            />
          </li>
        ))}
      </ul>

      <ul aria-label="Recent builds" className="border-border divide-border divide-y rounded-md border">
        {RUNS.map((entry) => (
          <li key={entry.id}>
            <Item entry={entry} />
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => setSparse((value) => !value)}
        className="text-muted-foreground hover:text-foreground self-start text-sm underline underline-offset-4"
      >
        {sparse ? 'Show every part' : 'Show a name and a link only'}
      </button>
    </div>
  )
}
