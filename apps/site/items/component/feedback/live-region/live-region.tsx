'use client'

import { useState } from 'react'

import { Button } from '@nanisoft/prism-ui/components/button'
import { LiveRegion } from '@nanisoft/prism-ui/components/live-region'

/**
 * A result count that updates while a filter runs, which is the everyday case the
 * Component exists for: the number changes, the reader did not ask for it, and
 * nothing else on the page says so.
 */
export default function LiveRegionDemo() {
  const [filter, setFilter] = useState('')
  const [busy, setBusy] = useState(false)
  const rows = ['Aluminium sheet', 'Aluminium billet', 'Brass rod', 'Copper tube']
  const matched = rows.filter((row) => row.toLowerCase().includes(filter.toLowerCase()))

  return (
    <div className="flex max-w-measure-narrow flex-col gap-4">
      <div className="flex items-center gap-2">
        <label htmlFor="live-region-filter" className="text-sm font-medium">
          Filter
        </label>
        <input
          id="live-region-filter"
          value={filter}
          onChange={(event) => {
            setFilter(event.target.value)
            setBusy(true)
          }}
          onBlur={() => setBusy(false)}
          className="border-input bg-background h-9 rounded-md border px-3 text-sm"
        />
        <Button size="sm" variant="outline" onClick={() => setBusy(false)}>
          Done
        </Button>
      </div>
      {/*
       * The count is inside the region so the announcement and the visible number
       * are the same string. Two sources of truth is the failure a reader notices
       * when they disagree.
       */}
      <LiveRegion busy={busy} label="Filter results">
        <p className="text-sm">
          {matched.length} {matched.length === 1 ? 'result' : 'results'}
        </p>
      </LiveRegion>
      <ul className="flex flex-col gap-1 text-sm">
        {matched.map((row) => (
          <li key={row}>{row}</li>
        ))}
      </ul>
    </div>
  )
}
