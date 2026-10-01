'use client'

import { ArchiveIcon, DownloadIcon, MailIcon } from 'lucide-react'
import { useState } from 'react'

import { SelectionToolbar } from '@nanisoft/prism-ui/components/selection-toolbar'

const ROWS = [
  { id: 'inv-1042', name: 'Invoice 1042' },
  { id: 'inv-1043', name: 'Invoice 1043' },
  { id: 'inv-1044', name: 'Invoice 1044' },
  { id: 'inv-1045', name: 'Invoice 1045' },
]

/**
 * A row of invoices, some of them selected, and a toolbar that exists only while
 * something is.
 *
 * The demo holds the selection because the Component refuses to: it does not read
 * what is selected and it does not clear it, so the count, the words and the
 * dismissal are all the caller's. Passing no label is what makes the toolbar go
 * away, which is the whole of the appearing half. The third command is unavailable
 * rather than removed, so the row keeps its width and the reader learns the
 * command exists instead of finding a gap where it was.
 */
export default function SelectionToolbarDemo() {
  const [selected, setSelected] = useState<readonly string[]>(['inv-1042', 'inv-1043'])
  const [ran, setRan] = useState<string | null>(null)

  const toggle = (id: string) => {
    setRan(null)
    setSelected((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    )
  }

  return (
    <div className="flex max-w-measure-narrow flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-foreground text-sm leading-none font-medium">Invoices</span>
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground text-sm"
          onClick={() => {
            setRan(null)
            setSelected(ROWS.map((row) => row.id))
          }}
        >
          Select all four
        </button>
      </div>

      <ul className="divide-border divide-y rounded-md border">
        {ROWS.map((row) => (
          <li key={row.id} className="flex items-center gap-3 px-3 py-2">
            <input
              id={`selection-toolbar-${row.id}`}
              type="checkbox"
              checked={selected.includes(row.id)}
              onChange={() => toggle(row.id)}
            />
            <label htmlFor={`selection-toolbar-${row.id}`} className="text-sm">
              {row.name}
            </label>
          </li>
        ))}
      </ul>

      <SelectionToolbar
        label={
          selected.length === 0
            ? null
            : `${selected.length} ${selected.length === 1 ? 'invoice' : 'invoices'} selected`
        }
        commands={[
          {
            id: 'archive',
            label: 'Archive the selected invoices',
            icon: <ArchiveIcon aria-hidden="true" />,
            onRun: () => setRan('Archive'),
          },
          {
            id: 'download',
            label: 'Download the selected invoices',
            icon: <DownloadIcon aria-hidden="true" />,
            onRun: () => setRan('Download'),
          },
          {
            id: 'mail',
            label: 'Email the selected invoices',
            icon: <MailIcon aria-hidden="true" />,
            onRun: () => setRan('Email'),
            disabled: true,
          },
        ]}
        dismissLabel="Clear the selection"
        onDismiss={() => {
          setRan(null)
          setSelected([])
        }}
      />

      <p className="text-muted-foreground text-sm">
        {selected.length === 0
          ? 'Nothing is selected, so the toolbar renders nothing at all rather than an empty row.'
          : (ran ??
            'The toolbar is one tab stop: the arrow keys walk the commands, Home and End reach the ends, and the dismiss control on the far right is the way back to no selection.')}
      </p>
    </div>
  )
}