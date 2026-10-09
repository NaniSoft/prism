'use client'

import { useState } from 'react'

import { IndexDetail01 } from '@nanisoft/prism-ui/blocks/index-detail-01'
import { NothingChosen01 } from '@nanisoft/prism-ui/blocks/nothing-chosen-01'

/**
 * A split with the selection held right here, and nothing in the Block that could
 * hold it.
 *
 * The index pane is the caller's own list of buttons. Activating one reports its
 * id, and this Demo's own read of that report is the whole of what connects the two
 * panes: the record the reader chose is passed into the detail pane below. At rest
 * the detail pane is the caller's `NothingChosen01`, which is the one Prism state a
 * caller places there by name.
 */
const RECORDS = [
  { id: 'inv-1042', customer: 'Northwind', amount: '$1,200.00', state: 'Open' },
  { id: 'inv-1043', customer: 'Contoso', amount: '$860.00', state: 'Paid' },
  { id: 'inv-1044', customer: 'Fabrikam', amount: '$2,410.00', state: 'Overdue' },
]

export default function IndexDetail01Demo() {
  const [open, setOpen] = useState<string | null>(null)
  const record = RECORDS.find((entry) => entry.id === open) ?? null

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground text-sm">
        The tracks hold their ratio, so clicking a row does not move the list. The
        detail pane changes only because this Demo reads the selection callback and
        passes the record in.
      </p>

      <IndexDetail01
        index={
          <ul className="divide-border divide-y overflow-hidden rounded-xl border">
            {RECORDS.map((entry) => {
              const current = entry.id === open
              return (
                <li key={entry.id}>
                  <button
                    type="button"
                    onClick={() => setOpen(entry.id)}
                    aria-current={current ? 'true' : undefined}
                    className={
                      current
                        ? 'bg-accent text-accent-foreground w-full px-4 py-3 text-left'
                        : 'hover:bg-accent/50 w-full px-4 py-3 text-left'
                    }
                  >
                    <span className="block text-sm font-medium">{entry.customer}</span>
                    <span className="text-muted-foreground block font-mono text-xs">{entry.id}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        }
        detail={
          record === null ? (
            <NothingChosen01
              title="Select an invoice"
              body="Its lines, its history and the actions you can take appear here."
            />
          ) : (
            <div className="rounded-xl border p-6">
              <p className="font-mono text-xs text-muted-foreground">{record.id}</p>
              <p className="text-lg font-semibold tracking-tight">{record.customer}</p>
              <dl className="mt-4 grid grid-cols-[auto_minmax(0,1fr)] gap-x-8 gap-y-2 text-sm">
                <dt className="text-muted-foreground font-medium">Amount</dt>
                <dd className="tabular-nums">{record.amount}</dd>
                <dt className="text-muted-foreground font-medium">State</dt>
                <dd>{record.state}</dd>
              </dl>
            </div>
          )
        }
      />
    </div>
  )
}
