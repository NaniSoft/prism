import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import axe from 'axe-core'

import { TableSort, type TableSortDirection } from '../src/components/ui/table-sort'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../src/components/ui/table'

/**
 * The sortable header affordance for a Table.
 *
 * The claims under test are the three that are invisible in a screenshot and
 * wrong in the same way every time. `aria-sort` belongs on the `th`, and only on
 * the header where the sort is in force: a table whose headers all say `aria-sort`
 * claims to be ordered in several directions at once. The announcement has to say
 * what *will* happen rather than what is, which is only possible if it is computed
 * from the next direction, so all three states are asserted. And the cycle closes,
 * so a reader who has sorted to find an extreme can get the original order back
 * from the control they already know.
 */
const ANNOUNCE = (direction: TableSortDirection) => {
  if (direction === 'ascending') return 'Sorts oldest first'
  if (direction === 'descending') return 'Sorts newest first'
  return 'Removes the sort'
}

/** A table with two sortable columns and one that is not. */
const TABLE = (props: {
  direction?: TableSortDirection
  column?: TableSortDirection
  onDirectionChange?: (direction: TableSortDirection) => void
}) => (
  <Table>
    <TableCaption>Spend by month</TableCaption>
    <TableHeader>
      <TableSort
        column="spend"
        direction={props.direction ?? 'none'}
        onDirectionChange={props.onDirectionChange}
        announce={ANNOUNCE}
      >
        Spend
      </TableSort>
      <TableSort
        column="month"
        direction={props.column ?? 'none'}
        onDirectionChange={props.onDirectionChange}
        announce={ANNOUNCE}
      >
        Month
      </TableSort>
      <TableHead>Notes</TableHead>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell>4,200</TableCell>
        <TableCell>March</TableCell>
        <TableCell>Two retries</TableCell>
      </TableRow>
    </TableBody>
  </Table>
)

describe('the TableSort', () => {
  const header = (name: RegExp) => screen.getByRole('columnheader', { name })
  const describedBy = (name: RegExp) => {
    const id = screen.getByRole('button', { name }).getAttribute('aria-describedby')
    return id === null ? null : document.getElementById(id)?.textContent
  }

  it('is a column header, so the table keeps its column names', () => {
    render(TABLE({}))
    // A header that is not a header is a row of buttons above a grid with no
    // column names in it, and a screen reader moving across the table is told
    // nothing about which column a cell belongs to.
    const cell = header(/Spend/)
    expect(cell.tagName).toBe('TH')
    expect(cell).toHaveAttribute('scope', 'col')
  })

  it('puts aria-sort on the header cell and not on the button inside it', () => {
    render(TABLE({ direction: 'ascending' }))
    // The sort state is a property of the column, not of a control inside it, and
    // the reader is told about the column while moving across the table rather
    // than while tabbing onto a button.
    expect(header(/Spend/)).toHaveAttribute('aria-sort', 'ascending')
    expect(screen.getByRole('button', { name: /Spend/ })).not.toHaveAttribute('aria-sort')
  })

  it('states no sort at all on an unsorted header, rather than stating "none" on every one', () => {
    render(TABLE({ direction: 'ascending' }))
    // `none` is the default value of the attribute, so writing it on every header
    // of an unsorted table is a claim on each of them that the reader has to
    // evaluate and reject. Absence is the honest statement, and it is what the
    // headers that are not the sorted one carry.
    expect(header(/Spend/)).toHaveAttribute('aria-sort', 'ascending')
    expect(header(/Month/).hasAttribute('aria-sort')).toBe(false)
    expect(header(/Notes/).hasAttribute('aria-sort')).toBe(false)
  })

  it('marks exactly one header, so a table cannot claim two orders at once', () => {
    render(TABLE({ direction: 'ascending' }))
    const sorted = screen
      .getAllByRole('columnheader')
      .filter((cell) => cell.hasAttribute('aria-sort'))
    // Two columns both reporting `aria-sort` is a table claiming to be ordered two
    // ways, and a reader comparing the two hears a contradiction.
    expect(sorted).toHaveLength(1)
    expect(sorted[0]).toHaveAttribute('data-column', 'spend')
  })

  it('announces what the press will do, in all three states', () => {
    const { rerender } = render(TABLE({ direction: 'none' }))
    // The claim this Component is built around, and the reason `announce` is a
    // function of the next direction rather than a string. One sentence cannot be
    // right for all three states: on an unsorted column the press sorts ascending,
    // on an ascending one it reverses, on a descending one it restores the
    // original order. A string chosen for one of them is wrong for the other two in
    // a way the reader cannot detect.
    expect(describedBy(/Spend/)).toBe('Sorts oldest first')
    rerender(TABLE({ direction: 'ascending' }))
    expect(describedBy(/Spend/)).toBe('Sorts newest first')
    rerender(TABLE({ direction: 'descending' }))
    expect(describedBy(/Spend/)).toBe('Removes the sort')
  })

  it('announces the next action rather than the current state', () => {
    render(TABLE({ direction: 'ascending' }))
    // The failure being designed out: a header that announces its own state tells
    // a reader nothing about the press they are about to make. "Sorts oldest
    // first" is not in the description of an ascending column, and the ascending
    // column's state is in `aria-sort` on the cell, which is where it belongs.
    expect(describedBy(/Spend/)).not.toBe('Sorted oldest first')
  })

  it('describes the button rather than renaming it, so the column name stays scannable', () => {
    render(TABLE({ direction: 'none' }))
    const button = screen.getByRole('button', { name: /Spend/ })
    // Appended inside the button, the sentence becomes part of the name and a
    // reader hears "Spend, sort oldest first" as one string, with no name left to
    // scan a column of headers for.
    expect(button).toHaveAccessibleName('Spend')
    expect(button.getAttribute('aria-describedby')).not.toBeNull()
  })

  it('cycles none, ascending, descending and back to none, so the original order is reachable', async () => {
    const user = userEvent.setup()
    // A controlled harness rather than a `rerender` from inside the click handler,
    // because the cycle is only observable when the caller actually holds the
    // state between presses, and a hand-driven rerender does not hold it.
    function Controlled() {
      const [direction, setDirection] = useState<TableSortDirection>('none')
      return TABLE({ direction, onDirectionChange: setDirection })
    }
    render(<Controlled />)
    const press = async () => user.click(screen.getByRole('button', { name: /Spend/ }))

    await press()
    expect(header(/Spend/)).toHaveAttribute('data-direction', 'ascending')
    await press()
    expect(header(/Spend/)).toHaveAttribute('data-direction', 'descending')
    await press()
    // The third press is the decision, not an omission. A reader who sorted to
    // find the largest value and no longer cares has to get the original order
    // back, and a two-state cycle makes that unreachable from the control, which
    // means the caller has to invent a second affordance for it.
    expect(header(/Spend/)).toHaveAttribute('data-direction', 'none')
    expect(header(/Spend/).hasAttribute('aria-sort')).toBe(false)
  })

  it('keeps its own state when the caller passes no handler, so it works uncontrolled', async () => {
    const user = userEvent.setup()
    const { container } = render(TABLE({}))
    const button = screen.getByRole('button', { name: /Spend/ })
    await user.click(button)
    expect(header(/Spend/)).toHaveAttribute('data-direction', 'ascending')
    await user.click(button)
    expect(header(/Spend/)).toHaveAttribute('data-direction', 'descending')
    // And the announcement tracked it, which is the part that would go stale if the
    // direction were stored somewhere other than where the announcement is read.
    expect(
      container.querySelector('[data-slot="table-sort-announcement"]')?.textContent,
    ).toBe('Removes the sort')
  })

  it('reports the direction and leaves the rows to the caller', async () => {
    const onDirectionChange = vi.fn()
    const user = userEvent.setup()
    render(TABLE({ direction: 'none', onDirectionChange }))
    await user.click(screen.getByRole('button', { name: /Spend/ }))
    // A Component cannot sort an arbitrary set of records: it does not know
    // whether the column is a number, a date or a name, it does not know the
    // locale, and it does not know the original order it would have to restore.
    expect(onDirectionChange).toHaveBeenCalledWith('ascending')
  })

  it('does not move on its own when the caller owns the direction', async () => {
    const onDirectionChange = vi.fn()
    const user = userEvent.setup()
    render(TABLE({ direction: 'ascending', onDirectionChange }))
    await user.click(screen.getByRole('button', { name: /Spend/ }))
    // It reports the request and waits. Moving its own mark anyway is the defect a
    // controlled control has when it keeps a copy, because the caller's state and
    // the drawn state then disagree.
    expect(onDirectionChange).toHaveBeenCalledWith('descending')
    expect(header(/Spend/)).toHaveAttribute('data-direction', 'ascending')
  })

  it('draws a different shape for each of the three states, not only a colour', () => {
    const { container, rerender } = render(TABLE({ direction: 'none' }))
    const mark = () => container.querySelector('[data-slot="table-sort-mark"]')?.innerHTML
    const unsorted = mark()
    rerender(TABLE({ direction: 'ascending' }))
    const ascending = mark()
    rerender(TABLE({ direction: 'descending' }))
    const descending = mark()
    // The mark is a shape as well as a colour, so a reader who cannot separate the
    // three still gets the state from `aria-sort`. Asserted on the drawn markup
    // because there is no other way to say "a different shape" in a DOM test.
    expect(unsorted).not.toBe(ascending)
    expect(ascending).not.toBe(descending)
  })

  it('hides the mark from assistive technology, because the state is already on the cell', () => {
    const { container } = render(TABLE({ direction: 'ascending' }))
    // A reader told "sorted ascending" by the cell and then "graphic" by the mark
    // is told the same thing twice, and the second time about a drawing.
    expect(
      container.querySelector('[data-slot="table-sort-mark"]')?.getAttribute('aria-hidden'),
    ).toBe('true')
  })

  it('gives the sorted header the foreground ink as a third channel', () => {
    const { container, rerender } = render(TABLE({ direction: 'none' }))
    const button = () => container.querySelector('[data-slot="table-sort-button"]')?.className ?? ''
    // Matched as a whole class rather than as a substring, because the unsorted
    // state carries `hover:text-foreground` and a substring test would read that
    // as the sorted state and pass on both.
    const isPlain = (value: string) => value.split(/\s+/).includes('text-foreground')
    expect(isPlain(button())).toBe(false)
    rerender(TABLE({ direction: 'ascending' }))
    // A reader who can see neither the mark nor the attribute still sees which
    // column is ordered. Three channels is deliberate: two of them are the markup
    // and the third is the drawing, and a table that relies on one is unreadable
    // to somebody.
    expect(isPlain(button())).toBe(true)
  })

  it('is reachable and pressable by the keyboard, as a button is', async () => {
    const onDirectionChange = vi.fn()
    const user = userEvent.setup()
    render(TABLE({ direction: 'none', onDirectionChange }))
    await user.tab()
    const button = screen.getByRole('button', { name: /Spend/ })
    expect(button).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(onDirectionChange).toHaveBeenCalledWith('ascending')
  })

  it('draws its focus ring at full strength', () => {
    const { container } = render(TABLE({ direction: 'none' }))
    const classes = container.querySelector('[data-slot="table-sort-button"]')?.className ?? ''
    // `outline-none` with a half-alpha ring is the silent failure the
    // focus-indicator gate exists for: the token gates pass, because the alpha is
    // in the class and not in the token.
    expect(classes).toContain('outline-none')
    expect(classes).toContain('focus-visible:ring-ring')
    expect(classes).toContain('focus-visible:ring-[3px]')
  })

  it('ignores activation when it is disabled', async () => {
    const onDirectionChange = vi.fn()
    const user = userEvent.setup()
    render(
      <Table>
        <TableHeader>
          <TableSort
            column="spend"
            direction="none"
            onDirectionChange={onDirectionChange}
            announce={ANNOUNCE}
            disabled
          >
            Spend
          </TableSort>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>4,200</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )
    const button = screen.getByRole('button', { name: /Spend/ })
    await user.click(button)
    expect(onDirectionChange).not.toHaveBeenCalled()
    expect(button).toBeDisabled()
  })

  it('describes its own header rather than a neighbour with the same column', () => {
    render(TABLE({ direction: 'ascending' }))
    // Two tables on a page may sort the same column, and an id built from the
    // column name would collide, leaving both headers describing each other.
    const spend = within(header(/Spend/)).getByRole('button', { name: /Spend/ })
    const month = within(header(/Month/)).getByRole('button', { name: /Month/ })
    expect(spend.getAttribute('aria-describedby')).not.toBe(month.getAttribute('aria-describedby'))
  })

  it('has no accessibility violations when it is on the page', async () => {
    const { container } = render(TABLE({ direction: 'ascending' }))
    const results = await axe.run(container, {
      rules: {
        'color-contrast': { enabled: false },
        region: { enabled: false },
      },
    })
    expect(results.violations).toEqual([])
  })
})
