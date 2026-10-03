'use client'

import { useState } from 'react'

import { DataToolbar, DataToolbarGroup } from '@nanisoft/prism-ui/components/data-toolbar'
import { Button } from '@nanisoft/prism-ui/components/button'
import { NativeSelect } from '@nanisoft/prism-ui/components/native-select'
import { Input } from '@nanisoft/prism-ui/components/input'
import { ToggleGroup, ToggleGroupItem } from '@nanisoft/prism-ui/components/toggle-group'
import { Badge } from '@nanisoft/prism-ui/components/badge'

/**
 * The row in both of its states, and the one decision that separates them.
 *
 * The default is a plain `div`, so a reader tabs through the row one control at a
 * time. Turning the role on makes the whole row one control the arrow keys move
 * within, which is right for a set of peer controls and wrong for a row that is
 * mostly a search box. Both are shown here so the difference is visible rather
 * than described.
 */
export default function DataToolbarDemo() {
  const [toolbar, setToolbar] = useState(false)
  const [view, setView] = useState<readonly string[]>(['rows'])
  const [query, setQuery] = useState('')

  return (
    <div className="flex max-w-page flex-col gap-4">
      <DataToolbar
        {...(toolbar ? { role: 'toolbar' as const, 'aria-label': 'Collector table' } : null)}
        search={
          <Input
            className="w-56"
            placeholder="Search collectors"
            aria-label="Search collectors"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        }
        filters={
          <>
            <NativeSelect size="sm" aria-label="Region" className="w-36">
              <option value="all">Every region</option>
              <option value="eu">Europe</option>
              <option value="us">North America</option>
            </NativeSelect>
            <NativeSelect size="sm" aria-label="Status" className="w-32">
              <option value="all">Any status</option>
              <option value="healthy">Healthy</option>
              <option value="down">Down</option>
            </NativeSelect>
          </>
        }
        view={
          <ToggleGroup aria-label="View" value={view} onValueChange={setView}>
            <ToggleGroupItem value="rows">Rows</ToggleGroupItem>
            <ToggleGroupItem value="cards">Cards</ToggleGroupItem>
          </ToggleGroup>
        }
        actions={
          <>
            <Badge variant="secondary">14 of 40</Badge>
            <Button size="sm">Add</Button>
          </>
        }
      >
        {query === '' ? null : (
          <DataToolbarGroup>
            <span className="text-muted-foreground text-xs">No match yet</span>
          </DataToolbarGroup>
        )}
      </DataToolbar>

      <div className="flex flex-wrap items-center gap-4">
        <Button size="sm" variant="outline" onClick={() => setToolbar((value) => !value)}>
          {toolbar ? 'Remove the toolbar role' : 'Give the row a toolbar role'}
        </Button>
        <span className="text-muted-foreground text-xs">View: {view[0] ?? 'none'}</span>
      </div>
    </div>
  )
}
