'use client'

import { useState } from 'react'

import {
  StatefulTable,
  type StatefulTableChange,
  type StatefulTableColumnUnion,
  type StatefulTableState,
} from '@nanisoft/prism-ui/components/stateful-table'
import { Badge } from '@nanisoft/prism-ui/components/badge'

type Reading = { id: string; site: string; status: 'healthy' | 'degraded' | 'offline'; lastSeen: number }

/**
 * A deliberately awkward order: readings are ordered by how urgently they want
 * attention, not by their name or by their age, so the accessor is doing work the
 * cell's text cannot.
 */
const RANK: Record<Reading['status'], number> = { offline: 0, degraded: 1, healthy: 2 }

const STATUS: Record<Reading['status'], string> = {
  healthy: 'Healthy',
  degraded: 'Degraded',
  offline: 'Offline',
}

const ROWS: Reading[] = [
  { id: 'r-01', site: 'Northfield array', status: 'healthy', lastSeen: 4 },
  { id: 'r-02', site: 'Cement works', status: 'offline', lastSeen: 320 },
  { id: 'r-03', site: 'Harbour substation', status: 'degraded', lastSeen: 61 },
  { id: 'r-04', site: 'Weighbridge 3', status: 'healthy', lastSeen: 2 },
  { id: 'r-05', site: 'Ash pit', status: 'degraded', lastSeen: 140 },
  { id: 'r-06', site: 'Kiln 2', status: 'healthy', lastSeen: 7 },
  { id: 'r-07', site: 'Sorting office', status: 'offline', lastSeen: 900 },
  { id: 'r-08', site: 'Borehole A', status: 'healthy', lastSeen: 1 },
  { id: 'r-09', site: 'Conveyor head', status: 'degraded', lastSeen: 75 },
  { id: 'r-10', site: 'Gatehouse', status: 'healthy', lastSeen: 3 },
  { id: 'r-11', site: 'Store 4', status: 'offline', lastSeen: 480 },
  { id: 'r-12', site: 'Apron sensors', status: 'healthy', lastSeen: 5 },
]

const INITIAL: StatefulTableState = {
  sort: null,
  selection: [],
  hiddenColumns: [],
  page: 0,
}

const COLUMNS: StatefulTableColumnUnion<Reading>[] = [
  {
    id: 'site',
    header: 'Site',
    cell: (reading) => reading.site,
    // Sorts on the name the reader reads, through the platform's collator, so
    // casing and accents do not decide the order.
    sortable: true,
    accessor: (reading) => reading.site,
  },
  {
    id: 'status',
    header: 'Status',
    cell: (reading) => (
      <Badge
        variant={
          reading.status === 'healthy'
            ? 'success'
            : reading.status === 'degraded'
              ? 'warning'
              : 'destructive'
        }
      >
        {STATUS[reading.status]}
      </Badge>
    ),
    // Sorts on the product's own order of urgency. The cell says "Offline" and
    // "Degraded", and neither of those sorts where a reader wants them.
    sortable: true,
    accessor: (reading) => RANK[reading.status],
  },
  {
    id: 'lastSeen',
    header: 'Minutes since a reading',
    cell: (reading) => `${reading.lastSeen}`,
    sortable: true,
    accessor: (reading) => reading.lastSeen,
  },
]

/**
 * One table, four pieces of state, and a pager.
 *
 * Twelve rows at five to a page makes the page real rather than theoretical, and it
 * is where the header's select-all earns its keep: the control covers the page and
 * not the set, so selecting everything on page one and moving to page two leaves
 * page two untouched. Hide the minutes column from the disclosure and it comes back
 * where you left it.
 */
export default function StatefulTableDemo() {
  const [state, setState] = useState(INITIAL)

  return (
    <div className="flex w-full flex-col gap-4">
      <StatefulTable
        rows={ROWS}
        getRowId={(reading) => reading.id}
        columns={COLUMNS}
        state={state}
        onChange={(change: StatefulTableChange) => setState(change.state)}
        caption="Readings from the last twenty-four hours, five to a page."
        label="Estate readings"
        announceSort={(column, direction) => {
          const name = COLUMNS.find((entry) => entry.id === column)?.header
          const subject = typeof name === 'string' ? name : column
          if (direction === 'ascending') return `Sort ${subject} from lowest to highest`
          if (direction === 'descending') return `Sort ${subject} from highest to lowest`
          return 'Return to the order the server sent'
        }}
        selectAllLabel="Select every reading on this page"
        selectRowLabel={(rowKey) => `Select reading ${rowKey}`}
        columnsLabel="Columns"
        emptyLabel="No readings in this window."
        previousPageLabel="Previous"
        nextPageLabel="Next"
        pageLabel={(page, pages) => `Page ${page + 1} of ${pages}`}
        pageSize={5}
      />

      <p className="text-muted-foreground border-border text-sm border-t pt-4">
        {state.selection.length} selected. The four facts move as one value, so the
        page cannot outlive the sort that produced it: changing the order returns the
        reader to the first page rather than leaving them on a page number that meant
        something under the old one.
      </p>
    </div>
  )
}
