'use client'

import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon } from 'lucide-react'
import { useId, useState, type ComponentProps, type ReactNode } from 'react'

import { cn } from '../../lib/utils'

/** Which way a column is sorted, and `none` for a column that is not. */
export type TableSortDirection = 'none' | 'ascending' | 'descending'

/** What activating a header will do, given where the column is now. */
export type TableSortAnnouncement = (direction: TableSortDirection) => string

/** The props the TableSort accepts. */
export interface TableSortProps extends Omit<ComponentProps<'th'>, 'children'> {
  /**
   * The column's name, and the visible text of the header.
   *
   * It is a `th` with `scope="col"` rather than a `button` dressed as a header,
   * because the header is what a screen reader announces while a reader is moving
   * across the table, and a header that is not a header is a row of buttons above a
   * grid with no column names in it.
   */
  children?: ReactNode
  /** The column this header sorts. */
  column: string
  /** The direction the column is currently sorted in. @defaultValue 'none' */
  direction?: TableSortDirection
  /**
   * Called with the direction the column will be in after this activation.
   *
   * The caller owns the sort and the rows, because a Component cannot sort an
   * arbitrary set of records: it does not know what the column means, whether it
   * is a number or a date or a name, or what the original order was. So the
   * header reports the direction and the caller's table reorders.
   */
  onDirectionChange?: (direction: TableSortDirection) => void
  /**
   * The words read for what activating the header will do.
   *
   * Required, and required as a **function of the next direction** rather than as
   * a string, because the announcement has to say what *will* happen, not what is.
   * A header that announces "sorted ascending" when it is already ascending tells
   * a reader nothing about the press they are about to make, and one that
   * announces "sort" says nothing about which way. The words are the caller's for
   * the reason every other reader-facing string in this package is: a shared
   * library cannot know whether the word for this is "sort", "trier" or
   * "sortieren", and a sentence it chose would be inherited by every consumer in
   * a language they did not write.
   */
  announce: TableSortAnnouncement
  /** Whether this header ignores user interaction. */
  disabled?: boolean
  /** Layout only. */
  className?: string
}

/** The direction a click on a header in `from` produces. */
function nextDirection(from: TableSortDirection): TableSortDirection {
  // Unsorted, then ascending, then descending, then unsorted again.
  //
  // Returning to `none` is the decision worth making, and it is why the cycle has
  // three states rather than two. A reader who has sorted a column to find the
  // extreme and no longer cares has to get the original order back, and the only
  // route to it is a third click on the header they already know. A two-state
  // control makes that order unreachable from the control, which means the caller
  // has to invent a second affordance for it, and a second affordance is a second
  // thing a reader has to find. So the cycle closes.
  if (from === 'none') return 'ascending'
  if (from === 'ascending') return 'descending'
  return 'none'
}

/** The mark each state draws, which is a shape and not only a colour. */
const MARK: Record<TableSortDirection, ReactNode> = {
  // The unsorted mark is the two-headed one, because it says "this column can be
  // ordered either way" rather than "this column is ordered". A single upward
  // arrow on an unsorted column claims an order that is not in force.
  none: <ChevronsUpDownIcon className="size-3.5" />,
  ascending: <ArrowUpIcon className="size-3.5" />,
  descending: <ArrowDownIcon className="size-3.5" />,
}

/**
 * The sortable header affordance for a `Table`.
 *
 * **`aria-sort` belongs on the `th`, and this is a `th`.** Not a `button` inside a
 * `th`, and not a `th` with a `role="button"` on it. A column header is what a
 * screen reader announces while a reader is moving across a table, and the sort
 * state is a property of that header rather than of a control inside it, so
 * `aria-sort` sits on the cell where the reader is told about it. It is set on
 * exactly one header at a time, which is the rule: two columns both reporting
 * `aria-sort` is a table claiming to be ordered two ways at once, and a reader
 * comparing the two hears a contradiction.
 *
 * **The announcement says what will happen, not what is.** That is the decision
 * this Component is built around, and it is why `announce` is a function of the
 * next direction rather than a string. A reader who is about to press a header
 * needs to know what the press will do, and the honest way to say it depends on
 * the column's current state: on an unsorted column the press sorts ascending, on
 * an ascending one it reverses, on a descending one it returns the original
 * order. One string cannot be right for all three, and a string chosen for one of
 * them is wrong for the other two in a way the reader cannot detect.
 *
 * **Two clicks to descending, three back to unsorted, and the third is the point.**
 * The cycle is `none`, `ascending`, `descending`, and back to `none`, and the last
 * step is a decision rather than an omission. A reader who has sorted to find the
 * largest value and no longer cares has to be able to get the original order back
 * from the control they already know, because any other route is a second
 * affordance this package would then have to document. The announcement prop
 * exists so a caller can say what that third press does in their own words, which
 * is the one sentence in the whole interaction Prism cannot write for them.
 *
 * **The sort is the caller's.** A Component cannot sort an arbitrary set of
 * records: it does not know whether the column is a number, a date or a name, it
 * does not know the locale a name sorts in, and it does not know the original
 * order it would have to restore. So this header owns the state it displays and
 * reports the direction, and the caller's table reorders the rows.
 *
 * **The mark is a shape as well as a colour.** An unsorted column carries the
 * two-headed mark, an ascending one an up arrow and a descending one a down
 * arrow, and the mark is `aria-hidden` because the state is already on the cell in
 * `aria-sort` and a reader is not told twice. A reader who cannot separate the
 * three marks still gets the state from the attribute, which is the same order the
 * whole package keeps: the attribute is the fact and the drawing is the reminder.
 *
 * It is a client Component, because a header that reports a direction and holds
 * the announcement is holding state and attaching a handler.
 */
function TableSort({
  children,
  column,
  direction = 'none',
  onDirectionChange,
  announce,
  disabled = false,
  className,
  ...props
}: TableSortProps) {
  // Uncontrolled use is a state the header keeps for itself, so a caller who wants
  // to read the sort back has a `direction` to pass. The two together are the
  // usual React shape, and the state is a convenience rather than the contract:
  // `onDirectionChange` is the contract.
  const [uncontrolled, setUncontrolled] = useState<TableSortDirection>('none')
  const active = direction === 'none' && onDirectionChange === undefined ? uncontrolled : direction
  const next = nextDirection(active)
  // The id that ties the announcement to the button. Generated rather than
  // derived from the column, because two tables on a page may sort the same column
  // and an id built from its name would collide, leaving both headers describing
  // each other.
  const descriptionId = useId()

  return (
    <th
      data-slot="table-sort"
      data-column={column}
      data-direction={active}
      scope="col"
      // `aria-sort` is on the cell, and only where the sort is in force. A header
      // with no sort in force states nothing at all rather than "none", because
      // "none" is the default value and stating it on every header of every
      // unsorted table is a claim on each of them that the reader must evaluate
      // and reject.
      aria-sort={active === 'none' ? undefined : active}
      className={cn('p-0', className)}
      {...props}
    >
      {/*
       * The words for what pressing this header will do, outside the button and
       * pointed at by `aria-describedby`.
       *
       * A description and not more name, and that is the decision. Appended to the
       * label inside the button, the sentence becomes part of the name, so a reader
       * hears "Spend, sort ascending" as one string and the column's own name is no
       * longer a name they can scan for. As a description, the reader hears the
       * column, then the control, then what the press will do, which is the order
       * in which they can use it.
       */}
      <span id={descriptionId} data-slot="table-sort-announcement" className="sr-only">
        {announce(next)}
      </span>
      <button
        type="button"
        data-slot="table-sort-button"
        aria-describedby={descriptionId}
        disabled={disabled}
        onClick={() => {
          if (onDirectionChange === undefined) setUncontrolled(next)
          onDirectionChange?.(next)
        }}
        className={cn(
          'text-muted-foreground hover:text-foreground flex h-10 w-full items-center gap-1.5 px-2 text-left align-middle text-sm font-medium whitespace-nowrap outline-none',
          'transition-colors duration-fast ease-out',
          'focus-visible:ring-ring focus-visible:ring-[3px]',
          'disabled:pointer-events-none disabled:opacity-50',
          // The sorted column says so in the foreground ink rather than the muted
          // one, which is a second channel on top of the arrow and the attribute:
          // a reader who can see neither the arrow nor the attribute still sees
          // which column is ordered.
          active === 'none' ? '' : 'text-foreground',
        )}
      >
        <span data-slot="table-sort-label" className="truncate">
          {children}
        </span>
        {/*
         * The mark. It is `aria-hidden` because the state is already on the cell in
         * `aria-sort` and a reader is not told the same thing twice, and it is a
         * shape as well as a colour so a reader who cannot separate the three
         * marks still gets the state from the attribute.
         */}
        <span
          data-slot="table-sort-mark"
          aria-hidden="true"
          className="ml-auto inline-flex shrink-0 items-center"
        >
          {MARK[active]}
        </span>
      </button>
    </th>
  )
}

export { TableSort }
