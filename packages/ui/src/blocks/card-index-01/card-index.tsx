'use client'

import { XIcon } from 'lucide-react'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'

import { Button } from '../../components/ui/button'
import { Checkbox } from '../../components/ui/checkbox'
import { LiveRegion } from '../../components/ui/live-region'
import { Pagination, PaginationContent, PaginationItem } from '../../components/ui/pagination'
import { headingSizeClass, type HeadingLevel } from '../../components/ui/section'
import { cn } from '../../lib/utils'

/** One row of data. Identity comes from `getRowId`, not from the shape. */
export type CardIndex01Row = Record<string, unknown>

/**
 * Every string the block renders. Required because the block ships no copy of
 * its own: a selection summary, a per card name and an empty-state line are the
 * consumer's to write.
 */
export type CardIndex01Labels = {
  /** The header's selection control, naming the page it covers. */
  selectAll: string
  /**
   * The name of one card's selection control, in the caller's words.
   *
   * A function of the row rather than a string, because a checkbox announced as
   * "Select" on all forty cards is a checkbox no reader can tell from the one
   * below it. The name must name the record this checkbox ticks.
   */
  selectCard: (row: CardIndex01Row) => string
  /** The name of the region a card's own controls sit in, when they are supplied. */
  cardActions: string
  /**
   * The selection summary and the announced number for the page scope.
   *
   * It should say the page, in the caller's words, because "24 selected" over a
   * grid of twenty four cards is true and says nothing about whether there are
   * more: the page is the one population this Block can count for itself.
   */
  selectedCount: (count: number) => string
  /**
   * The selection summary and the announced number for the filter scope.
   *
   * Used when the caller reports that the whole matching population is selected
   * through `selectionScope`, and it takes the caller's own `count` rather than
   * the number of cards on screen.
   */
  selectedAllMatching: (count: number) => string
  /**
   * The sentence spoken when the selection empties.
   *
   * Not a count of zero: "0 selected" is a number the reader already heard and
   * says nothing about why the batch bar has gone. The emptying is its own
   * sentence.
   */
  clearedSelection: string
  /** The accessible name of the batch bar's dismiss control. */
  dismissSelection: string
  previous: string
  next: string
  /** Accessible name for one page control. */
  page: (page: number) => string
  /** Shown in the body when `rows` is empty and `emptyMessage` is not set. */
  empty: string
}

/**
 * Which population the current selection covers, because the two are announced
 * differently.
 *
 * A selection of everything on the page is one the block can count, so the page
 * arm needs nothing beyond the selection set and the block announces
 * `labels.selectedCount`. A selection of everything matching the current filter
 * is a population the block never fetched, so the filter arm carries the number
 * from the caller and the block announces `labels.selectedAllMatching` instead
 * of printing the page as if it were the total.
 *
 * It is the same union and the same rule `DataTable01` uses, because ticket 166
 * made one selection and announcement contract the record index family's, and
 * this Block is the index's second arrangement rather than a second index.
 */
export type CardIndex01SelectionScope =
  | { scope: 'page' }
  | {
      scope: 'filter'
      /**
       * How many records match the current filter, in the caller's own count.
       *
       * Required, and never derived from the cards: the block holds one page and
       * a count over that page says nothing about the population the reader
       * asked for.
       */
      count: number
    }

/** The props every arm of the block shares, selection aside. */
type CardIndex01SharedProps = {
  title?: ReactNode
  description?: ReactNode
  /** Heading level for the block's own heading. @defaultValue 'h2' */
  headingLevel?: HeadingLevel
  /** The cards for the current page, in the caller's own order. */
  rows: readonly CardIndex01Row[]
  /**
   * Returns a stable identity for a row.
   *
   * Required rather than optional, because paging moves a row's index, so an
   * index-keyed selection silently changes which records a batch action acts on.
   */
  getRowId: (row: CardIndex01Row) => string
  /**
   * The caller's own node for one card's body: the picture, the name and the
   * price.
   *
   * A node per card rather than a declared field list, because a picture, a name
   * and a price are three different value shapes and the read vocabulary this
   * package publishes (`ColumnKind`) describes a row of a table rather than the
   * anatomy of a card. The caller composes the card and the block owns the
   * arrangement, the selection and the announcement.
   */
  renderCard: (row: CardIndex01Row) => ReactNode
  /**
   * The caller's own controls for one card, drawn in a trailing region.
   *
   * A node per card rather than a declared action list, because a block ships no
   * behaviour and a control that looks like a command but carries none is a
   * control a reader can focus and cannot act on.
   */
  renderCardActions?: (row: CardIndex01Row) => ReactNode
  /**
   * How many cards sit in one row at the widest width.
   *
   * Layout, and the only density knob the block owns. The grid always falls to
   * one column at the narrowest width and to two at the small breakpoint, so a
   * card is never squeezed below the width its own picture needs.
   *
   * @defaultValue 3
   */
  columnsPerRow?: 2 | 3 | 4
  /** The current page, 1-based. */
  page?: number
  defaultPage?: number
  /** How many pages exist. At least 1. */
  pageCount: number
  onPageChange?: (page: number) => void
  /** Replaces the fallback empty line. */
  emptyMessage?: ReactNode
  labels: CardIndex01Labels
  /** Layout only. Changing a Prism-owned visual property from here is prohibited. */
  className?: string
}

/**
 * The record index as pictures, which owns a set of row keys and reports every
 * change.
 *
 * The two arms make the contract the type's: a selectable index must be handed
 * the callback that reports a change and the node the batch bar holds, and a
 * plain grid may be handed neither, because a tick with nowhere to report is a
 * checkbox that changes nothing a caller can hear. It is the same union
 * `DataTable01` declares, because ticket 166 made one selection contract the
 * record index family's.
 */
export type CardIndex01Props =
  | (CardIndex01SharedProps & {
      selectable?: false
      selectedIds?: never
      defaultSelectedIds?: never
      onSelectedIdsChange?: never
      batchActions?: never
      selectionScope?: never
    })
  | (CardIndex01SharedProps & {
      selectable: true
      /** The selected keys, controlled. Omit it and the block holds the set. */
      selectedIds?: readonly string[]
      /** The selected keys the in-heart set starts from. */
      defaultSelectedIds?: readonly string[]
      /**
       * Called with the whole set after every change, whether or not the caller
       * is listening, so mirroring it costs one line and ignoring it costs zero.
       */
      onSelectedIdsChange: (ids: string[]) => void
      /**
       * The caller's own controls for the batch bar, mounted only while a
       * selection exists. The block draws the frame, the count and the dismiss
       * and places this node; it never draws a command of its own.
       */
      batchActions: ReactNode
      /**
       * Which population the selection covers. Absent means the page.
       *
       * The caller reports it when its own selection is the whole matching
       * population rather than the rows on screen, and passes that population's
       * count on the filter arm.
       */
      selectionScope?: CardIndex01SelectionScope
    })

/** The page numbers to show, with `ellipsis` where a run is held back. */
function pageWindow(page: number, pageCount: number): Array<number | 'ellipsis'> {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1)
  }
  const pages: Array<number | 'ellipsis'> = [1]
  const start = Math.max(2, page - 1)
  const end = Math.min(pageCount - 1, page + 1)
  if (start > 2) pages.push('ellipsis')
  for (let value = start; value <= end; value += 1) pages.push(value)
  if (end < pageCount - 1) pages.push('ellipsis')
  pages.push(pageCount)
  return pages
}

/** The grid track count at the widest width, as the one static class per arm. */
function gridClass(columnsPerRow: 2 | 3 | 4): string {
  if (columnsPerRow === 2) return 'grid grid-cols-1 gap-4 sm:grid-cols-2'
  if (columnsPerRow === 4) return 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'
  return 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'
}

/**
 * The record index as a grid of picture cards a reader compares and acts on.
 *
 * **It is the record index's second arrangement, and the job-identity test is
 * what settles it.** A reader here is doing the index's job, deciding which
 * record to act on, and the difference from `DataTable01` is the arrangement
 * rather than the content: records are compared as pictures rather than
 * across columns, so a screen that wants this has not found the index with one
 * more prop, it has found the picture arrangement. `DESIGN.md` names it as an
 * arrangement that forces a second Item, and this is that Item. A card carries
 * the caller's own picture, name and price through `renderCard`, and per card
 * actions through `renderCardActions`.
 *
 * **It shares the record index's selection and announcement contract.** The
 * same `selectable` union, the same held set, the same three-state header
 * control, the same polite `LiveRegion` carrying a count, the same batch bar
 * that mounts only while the set is non-empty, and the same `selectionScope`
 * that distinguishes a page-wide selection from a filter-wide one, all because
 * ticket 166 made one contract the law for the index family. The count is
 * announced once, politely, and never assertively; when the set empties the
 * region speaks its own sentence rather than a count of zero; and the visible
 * summary and the announced count are the same string.
 *
 * **It draws the page of cards it was handed, and it fetches nothing.** It sorts
 * nothing, filters nothing and slices nothing, and every control in the footer
 * is a report. It owns no action, batch or per card, so it owns no confirmation
 * dialog, no toast and no undo; the batch bar is the Block's region and the
 * caller's controls, and the dismiss is the Block's one control because its
 * whole body is a call on the set the Block already holds.
 *
 * **The card is the caller's composition, and the arrangement is the Block's.**
 * A picture, a name and a price are three different value shapes, and the read
 * vocabulary this package publishes (`ColumnSpec` and `ColumnKind`) describes a
 * value a reader reads in a table rather than the anatomy of a card. So the card
 * body is one node per record and the picture, the name and the price are the
 * caller's own composition, exactly as a per card action is. The Block owns the
 * grid, the selection set, the count, the batch bar and the page boundary, which
 * is the whole of what makes this an index rather than a list of pictures.
 */
export function CardIndex01(props: CardIndex01Props) {
  const {
    title,
    description,
    headingLevel = 'h2',
    rows,
    getRowId,
    renderCard,
    renderCardActions,
    columnsPerRow = 3,
    page: pageProp,
    defaultPage = 1,
    pageCount,
    onPageChange,
    emptyMessage,
    labels,
    className,
  } = props

  const Heading = headingLevel
  const headingId = useId()
  const isSelectable = props.selectable === true
  const [internalSelected, setInternalSelected] = useState<string[]>(() => [
    ...(props.defaultSelectedIds ?? []),
  ])
  const [internalPage, setInternalPage] = useState(defaultPage)

  const selected = isSelectable
    ? props.selectedIds === undefined
      ? internalSelected
      : [...props.selectedIds]
    : []
  const page = pageProp ?? internalPage
  const clampPage = (value: number) => Math.min(Math.max(1, value), Math.max(1, pageCount))
  const currentPage = clampPage(page)

  const hasCardActions = renderCardActions !== undefined
  const scope = isSelectable ? props.selectionScope : undefined
  const filterScope = scope?.scope === 'filter' ? scope : undefined
  // A filter-wide selection is a selection even though its keys are not on
  // screen, so the bar mounts and the region speaks from the scope rather than
  // from the page's keys. The number is the caller's and is never the rows on
  // screen.
  const selectionActive = isSelectable && (filterScope !== undefined || selected.length > 0)
  const selectionSummary =
    filterScope !== undefined
      ? labels.selectedAllMatching(filterScope.count)
      : labels.selectedCount(selected.length)

  const rowIds = rows.map(getRowId)
  const allSelected =
    filterScope !== undefined || (rowIds.length > 0 && rowIds.every((id) => selected.includes(id)))
  const someSelected = filterScope !== undefined || rowIds.some((id) => selected.includes(id))

  // The emptying sentence. A live region speaks when its text changes, and the
  // sequence where the selection falls to nothing is the one the reader has to
  // be told about because the batch bar they were about to use disappears with
  // it. The previous presence is ref-held, so the render that reaches nothing
  // still knows there was a selection and can speak the sentence rather than the
  // absence of one.
  const previousActive = useRef(selectionActive)
  useEffect(() => {
    previousActive.current = selectionActive
  }, [selectionActive])
  const announcement = selectionActive
    ? selectionSummary
    : previousActive.current
      ? labels.clearedSelection
      : null

  function changeSelection(ids: string[]) {
    if (isSelectable === false) return
    if (props.selectedIds === undefined) setInternalSelected(ids)
    props.onSelectedIdsChange?.(ids)
  }

  function clearSelection() {
    changeSelection([])
  }

  function toggleAll(checked: boolean) {
    if (checked) {
      changeSelection([...new Set([...selected, ...rowIds])])
    } else {
      changeSelection(selected.filter((id) => !rowIds.includes(id)))
    }
  }

  function toggleRow(id: string, checked: boolean) {
    changeSelection(checked ? [...selected, id] : selected.filter((item) => item !== id))
  }

  function changePage(next: number) {
    const clamped = clampPage(next)
    if (pageProp === undefined) setInternalPage(clamped)
    onPageChange?.(clamped)
  }

  return (
    <div data-slot="card-index-01" className={cn('flex flex-col gap-4', className)}>
      {title || description ? (
        <div data-slot="card-index-01-header" className="flex flex-col gap-1">
          {title ? (
            <Heading
              id={headingId}
              className={cn('font-semibold tracking-tight text-balance', headingSizeClass(Heading))}
            >
              {title}
            </Heading>
          ) : null}
          {description ? (
            <p className="text-muted-foreground text-sm">{description}</p>
          ) : null}
        </div>
      ) : null}

      {selectionActive ? (
        <div
          data-slot="card-index-01-batch-bar"
          role="toolbar"
          aria-label={selectionSummary}
          className="bg-card flex w-full items-center gap-1 rounded-md border p-1"
        >
          <span className="text-muted-foreground px-2 text-sm font-medium">
            {selectionSummary}
          </span>
          <div className="flex flex-1 flex-wrap items-center gap-2">
            {props.selectable === true ? props.batchActions : null}
          </div>
          <Button
            data-slot="card-index-01-dismiss"
            type="button"
            variant="ghost"
            size="sm"
            aria-label={labels.dismissSelection}
            onClick={clearSelection}
          >
            <XIcon aria-hidden="true" />
          </Button>
        </div>
      ) : null}

      {/*
       * One polite live region, never assertive: a selection change fires once
       * per keypress while a reader is arrowing down the grid and the count is
       * not an emergency. It carries the count rather than a list of labels, and
       * the empty case is its own sentence.
       */}
      <LiveRegion data-slot="card-index-01-announcement" politeness="polite" className="sr-only">
        {announcement}
      </LiveRegion>

      {isSelectable ? (
        <div data-slot="card-index-01-select-all" className="flex items-center gap-2">
          <Checkbox
            checked={allSelected}
            indeterminate={!allSelected && someSelected}
            onCheckedChange={toggleAll}
            aria-label={labels.selectAll}
          />
        </div>
      ) : null}

      {rows.length ? (
        <ul data-slot="card-index-01-grid" className={gridClass(columnsPerRow)}>
          {rows.map((row) => {
            const id = getRowId(row)
            const isSelected = selected.includes(id)
            return (
              <li
                key={id}
                data-slot="card-index-01-card"
                data-state={isSelected ? 'selected' : undefined}
                className="bg-card flex flex-col gap-3 rounded-xl border p-3"
              >
                {isSelectable || hasCardActions ? (
                  <div className="flex items-start justify-between gap-2">
                    {isSelectable ? (
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => toggleRow(id, checked)}
                        aria-label={labels.selectCard(row)}
                      />
                    ) : (
                      <span />
                    )}
                    {hasCardActions ? (
                      <div role="group" aria-label={labels.cardActions} className="flex items-center gap-1">
                        {renderCardActions?.(row)}
                      </div>
                    ) : null}
                  </div>
                ) : null}
                <div className="min-w-0 flex-1">{renderCard(row)}</div>
              </li>
            )
          })}
        </ul>
      ) : (
        <div
          data-slot="card-index-01-empty"
          className="text-muted-foreground border-border flex h-24 items-center justify-center rounded-xl border text-center text-sm"
        >
          {emptyMessage ?? labels.empty}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        {selectionActive ? (
          <span className="text-muted-foreground text-sm">{selectionSummary}</span>
        ) : (
          <span />
        )}

        <Pagination className="mx-0 w-auto justify-end">
          <PaginationContent>
            <PaginationItem>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={currentPage <= 1}
                aria-label={labels.previous}
                onClick={() => changePage(currentPage - 1)}
              >
                {labels.previous}
              </Button>
            </PaginationItem>
            {pageWindow(currentPage, Math.max(1, pageCount)).map((item, index) =>
              item === 'ellipsis' ? (
                <PaginationItem key={`ellipsis-${index}`}>
                  <span aria-hidden="true" className="text-muted-foreground px-2">
                    ...
                  </span>
                </PaginationItem>
              ) : (
                <PaginationItem key={item}>
                  <Button
                    type="button"
                    variant={item === currentPage ? 'outline' : 'ghost'}
                    size="icon"
                    aria-label={labels.page(item)}
                    aria-current={item === currentPage ? 'page' : undefined}
                    onClick={() => changePage(item)}
                  >
                    {item}
                  </Button>
                </PaginationItem>
              ),
            )}
            <PaginationItem>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={currentPage >= Math.max(1, pageCount)}
                aria-label={labels.next}
                onClick={() => changePage(currentPage + 1)}
              >
                {labels.next}
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}

export default CardIndex01
