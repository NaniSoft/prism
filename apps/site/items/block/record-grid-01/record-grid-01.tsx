'use client'

import { useState } from 'react'

import {
  RecordGrid01,
  type RecordGrid01Change,
  type RecordGrid01Labels,
} from '@nanisoft/prism-ui/blocks/record-grid-01'
import type { FieldSpec } from '@nanisoft/prism-ui/spec'

const COLUMNS: readonly FieldSpec[] = [
  { key: 'title', label: 'Issue', kind: 'Input' },
  {
    key: 'status',
    label: 'Status',
    kind: 'NativeSelect',
    options: [
      { value: 'todo', label: 'To do' },
      { value: 'doing', label: 'In progress' },
      { value: 'done', label: 'Done' },
    ],
  },
  { key: 'owner', label: 'Owner', kind: 'Input' },
  { key: 'estimate', label: 'Estimate', kind: 'NumberField' },
  { key: 'urgent', label: 'Urgent', kind: 'Switch' },
]

const ROWS: readonly Record<string, unknown>[] = [
  { key: 'ISSUE-221', title: 'Close the coverage gaps', status: 'doing', owner: 'Ada', estimate: 5, urgent: true },
  { key: 'ISSUE-222', title: 'Retire the date view', status: 'todo', owner: 'Grace', estimate: 3, urgent: false },
  { key: 'ISSUE-223', title: 'Audit the record index', status: 'done', owner: 'Alan', estimate: 2, urgent: false },
]

const LABELS: RecordGrid01Labels = {
  empty: 'No issues match the current filter.',
}

/**
 * Many records edited in place, wired to local state.
 *
 * Every edit is reported as the row identity and the column key, which is the
 * whole of the Block's write contract: it holds the in-progress values so a cell
 * redraws as it is typed, and the caller decides what to do with each change.
 */
export default function RecordGrid01Demo() {
  const [last, setLast] = useState<RecordGrid01Change | null>(null)

  return (
    <div className="flex max-w-measure flex-col gap-4">
      <p className="text-muted-foreground text-sm">
        Each cell is a control drawn from the shared field specification. Editing one
        reports the row identity and the column key; the Block holds no rule and no
        save.
      </p>
      <p className="text-muted-foreground text-sm">
        {last === null
          ? 'Nothing edited yet.'
          : `Edited ${last.key} on ${last.rowId} to ${String(last.value)}.`}
      </p>

      <RecordGrid01
        title="Issues"
        description="Bulk edit the issues matching the current filter."
        headingLevel="h3"
        columns={COLUMNS}
        rows={ROWS}
        getRowId={(row) => String(row.key)}
        onCellChange={setLast}
        labels={LABELS}
      />
    </div>
  )
}
