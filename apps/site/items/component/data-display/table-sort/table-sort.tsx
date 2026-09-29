'use client'

import { useState } from 'react'

import { TableSort, type TableSortDirection } from '@nanisoft/prism-ui/components/table-sort'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@nanisoft/prism-ui/components/table'
import { Badge } from '@nanisoft/prism-ui/components/badge'

/**
 * A table whose rows really reorder, because a sort control that does not sort is
 * a control a reader has already learned to distrust.
 *
 * The announcement is the thing to read while clicking: the first click on Spend
 * says it will sort oldest first, the second says newest first, and the third says
 * it removes the sort. Three different sentences for three presses of the same
 * button, which is the whole reason `announce` is a function of the next direction.
 */
type Spend = {
  id: string
  month: string
  spend: number
  note: string
  state: 'ok' | 'warn'
}

const ROWS: Spend[] = [
  { id: 'jan', month: 'January', spend: 4820, note: 'Two retries', state: 'warn' },
  { id: 'feb', month: 'February', spend: 5140, note: '', state: 'ok' },
  { id: 'mar', month: 'March', spend: 3990, note: 'One retry', state: 'ok' },
  { id: 'apr', month: 'April', spend: 6270, note: '', state: 'ok' },
  { id: 'may', month: 'May', spend: 5510, note: 'Three retries', state: 'warn' },
]

/** The three sentences, which is the copy a caller has to write. */
const announce = (direction: TableSortDirection) => {
  if (direction === 'ascending') return 'Sorts lowest first'
  if (direction === 'descending') return 'Sorts highest first'
  return 'Removes the sort and restores the original order'
}

/** The table, the sort, and the rows in the order the reader asked for. */
export default function TableSortDemo() {
  const [column, setColumn] = useState<'spend' | 'month'>('spend')
  const [direction, setDirection] = useState<TableSortDirection>('none')

  // The rows are the caller's to order, and the sort is by id as the tie-break so
  // duplicate values do not reorder unpredictably between presses.
  const sorted = [...ROWS].sort((a, b) => {
    if (direction === 'none') return 0
    const left = column === 'spend' ? a.spend : a.month
    const right = column === 'spend' ? b.spend : b.month
    const order = left < right ? -1 : left > right ? 1 : 0
    const flip = direction === 'ascending' ? order : -order
    return flip !== 0 ? flip : a.id.localeCompare(b.id)
  })

  return (
    <div className="max-w-measure-wide">
      <Table>
        <TableCaption>Spend by month, in the order the reader chose</TableCaption>
        <TableHeader>
          <TableSort
            column="month"
            direction={column === 'month' ? direction : 'none'}
            onDirectionChange={(next) => {
              setColumn('month')
              setDirection(next)
            }}
            announce={announce}
          >
            Month
          </TableSort>
          <TableSort
            column="spend"
            direction={column === 'spend' ? direction : 'none'}
            onDirectionChange={(next) => {
              setColumn('spend')
              setDirection(next)
            }}
            announce={announce}
          >
            Spend
          </TableSort>
          <TableHead>Notes</TableHead>
        </TableHeader>
        <TableBody>
          {sorted.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.month}</TableCell>
              <TableCell className="tabular-nums">{row.spend.toLocaleString()}</TableCell>
              <TableCell>
                {row.note === '' ? null : (
                  <Badge variant={row.state === 'warn' ? 'warning' : 'secondary'}>
                    {row.note}
                  </Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
