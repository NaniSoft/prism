'use client'

import { useId, useState, type ReactNode } from 'react'

import { Label } from '../../components/ui/label'
import { headingSizeClass, type HeadingLevel } from '../../components/ui/section'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import { fieldText, renderControl, SELF_LABELLED, type FieldContext } from '../../lib/field-render'
import type { FieldKind, FieldSpec } from '../../lib/spec'
import { cn } from '../../lib/utils'

/**
 * One edit a reader made in place.
 *
 * `rowId` is the record's stable identity from `getRowId` and never its position,
 * because a row's index moves the moment the caller re-sorts or re-pages and a
 * change keyed by a position would be applied to the wrong record. `key` is the
 * column's own `key` and never the words of its header, for the reason the field
 * specification gives: a key built from a label's words breaks the moment the label
 * is translated. `value` is whatever the control reported, in the shape that arm
 * reports it.
 */
export type RecordGrid01Change = {
  /** The record's stable identity, from `getRowId`. */
  rowId: string
  /** The edited column's own `key`, and never the words of its header. */
  key: string
  /** The value the control reported, in the shape that control reports it. */
  value: unknown
}

/**
 * Every string the grid renders. Required because the Block ships no copy of its
 * own, and an empty grid still has a sentence to say.
 */
export type RecordGrid01Labels = {
  /** Shown in the body when `rows` is empty and `emptyMessage` is not set. */
  empty: string
}

/** The props a `RecordGrid01` accepts. */
export type RecordGrid01Props = {
  /** The grid's own heading, absent for a grid that needs none. */
  title?: ReactNode
  /** One line under the heading saying what editing here does. */
  description?: ReactNode
  /**
   * Heading level for the grid's own heading. See `HeadingLevel`.
   *
   * @defaultValue 'h2'
   */
  headingLevel?: HeadingLevel
  /** Names the grid for assistive technology when no heading does. */
  caption?: ReactNode
  /**
   * The columns, as the shared field specification.
   *
   * `key`, `label` and `kind` are required on each one, and the whole list is
   * drawn in the order it is written. The header of a column is its `label` and
   * the control under it is the one its `kind` names, so the words a consumer
   * learns on a write form are the words on a grid.
   */
  columns: readonly FieldSpec[]
  /** The rows for the grid. The Block renders them; it never fetches or reorders. */
  rows: readonly Record<string, unknown>[]
  /**
   * Returns a stable identity for a row.
   *
   * Required rather than optional, because paging and re-sorting move a row's
   * index, and a change reported against a position would be written to the wrong
   * record.
   */
  getRowId: (row: Record<string, unknown>) => string
  /**
   * Called with every edit, as the cell it happened in.
   *
   * Required, because a control that edits a value with nowhere to report it is a
   * control a reader can type into and nothing can hear. The Block holds the
   * in-progress values so a cell redraws as it is typed, and it reports each one
   * through here rather than submitting a form.
   */
  onCellChange: (change: RecordGrid01Change) => void
  /** Replaces the fallback empty line. */
  emptyMessage?: ReactNode
  labels: RecordGrid01Labels
  /** Layout only. Changing a Prism-owned visual property from here is prohibited. */
  className?: string
}

/**
 * The editable record grid: many records as a grid whose cells are edited in place.
 *
 * **It is a write, and it is a different job from the record index.** `DataTable01`
 * draws the rows it was handed and reports what a reader asked for: a sort, a
 * filter, a page, a selection. Nothing in it changes a value. This Block's whole
 * contract is the opposite: each cell is a control, a reader types into it, and the
 * Block reports the edit. `DESIGN.md` rules that a grid edited in place is a write
 * and not the index with one more prop, and this is that write as its own Item.
 *
 * **Its columns are the shared field specification, and that is the decision the
 * closed unions forced.** A cell that writes is a control, and the only vocabulary
 * this package publishes for a control is `FieldSpec`. `ColumnKind` is the
 * vocabulary for a value a reader reads, and it is held disjoint from `FieldKind`
 * by `scripts/check-spec-unions.mjs`: a cell that writes named on `ColumnKind`
 * would either draw a field Component inside a table the index owns or name
 * something no Component answers to, and the gate reports both. So a write grid
 * takes the field union, and the fact that it needs to is the gate saying the job
 * is a different one. A column's `label` is its header and its `kind` is the
 * control drawn under it, so a grid column and a form field are one declaration.
 *
 * **It holds the in-progress values and reports every change.** This is the same
 * kind of held value the record index keeps for its selection set: a set of values
 * the caller handed for the rows about to be drawn, which a reader edits and the
 * Block redraws from. It fetches nothing, sorts nothing, filters nothing and pages
 * nothing, and it never derives a value from application state. A caller that wants
 * the edits mirrored writes one line in `onCellChange`; the values a cell shows are
 * the caller's row value until the reader edits that cell, and the reader's value
 * after.
 *
 * **The controls are the ones this package ships, drawn by the same renderer a form
 * uses.** `renderControl` is the one place a `FieldKind` becomes a control, so a
 * cell and a form field draw the same Component and a kind added to the union fails
 * the compiler in one place rather than two. The arms that hold a value and report a
 * change through the shared context are the editable ones (`Input`, `Textarea`,
 * `NumberField`, `MoneyField`, `SearchField`, `PasswordField`, `NativeSelect`,
 * `ToggleGroup`, `Toggle`, `Switch`, `Calendar`, `Dropzone`, `FileUpload`,
 * `ImageListField`, `RepeatableRows`); an arm that submits through a form element
 * it owns rather than reporting through the context (`Select`, `Combobox`,
 * `DatePicker`, `Slider` and their kin) is drawn and reaches no report, and that is
 * the honest limit of a Block that ships no form of its own. A caller who needs one
 * of those brings their own control through the `slot` arm, which the renderer
 * places in the cell.
 *
 * **The grid names every cell's control, and it is the columns that name them.**
 * A column's header carries its visible label, so a cell draws a control the reader
 * can see named; the control itself is given the column's own words as an
 * assistive-technology name where the Component does not carry its own, and the
 * table's own row and column structure is what says which record a cell belongs to.
 * The table takes its accessible name from its caption when the caller brings one
 * and from the heading otherwise, which is the same rule `DataTable01` follows and
 * the same reason: a table a reader reaches without a name is a table every cell
 * announces as untitled.
 *
 * **It owns no command.** There is no save button, no delete, no bulk action and no
 * confirmation: every edit is reported the moment it is made, and what to do with it
 * is the caller's. A caller who wants a save adds their own control beside the grid,
 * in the product's own copy and on its own store, rather than asking this Block to
 * hold a draft the caller cannot see.
 *
 * **Nothing here is a rule.** The grid draws the mark for a `required` column and
 * sets the attribute, and it never checks a value against it: validation is the
 * consumer's, entirely, and evaluating a rule is behaviour a Block does not own.
 */
export function RecordGrid01(props: RecordGrid01Props) {
  const {
    title,
    description,
    headingLevel = 'h2',
    caption,
    columns,
    rows,
    getRowId,
    onCellChange,
    emptyMessage,
    labels,
    className,
  } = props

  const Heading = headingLevel
  const headingId = useId()
  const prefix = useId()
  const [edited, setEdited] = useState<Record<string, Record<string, unknown>>>({})

  const valueFor = (rowId: string, row: Record<string, unknown>, field: FieldSpec): unknown => {
    const rowEdits = edited[rowId]
    if (rowEdits !== undefined && Object.prototype.hasOwnProperty.call(rowEdits, field.key)) {
      return rowEdits[field.key]
    }
    const rowValue = row[field.key]
    return rowValue === undefined ? field.defaultValue : rowValue
  }

  const setCell = (rowId: string) => (key: string, value: unknown) => {
    setEdited((previous) => ({
      ...previous,
      [rowId]: { ...(previous[rowId] ?? {}), [key]: value },
    }))
    onCellChange({ rowId, key, value })
  }

  return (
    <div data-slot="record-grid-01" className={cn('flex flex-col gap-4', className)}>
      {title || description ? (
        <div data-slot="record-grid-01-header" className="flex flex-col gap-1">
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

      <div className="border-border overflow-hidden rounded-xl border">
        <Table aria-labelledby={caption === undefined && title ? headingId : undefined}>
          {caption ? <TableCaption>{caption}</TableCaption> : null}
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key}>{column.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length ? (
              rows.map((row) => {
                const rowId = getRowId(row)
                return (
                  <TableRow key={rowId} data-slot="record-grid-01-row">
                    {columns.map((column, columnIndex) => {
                      const kind = column.kind.toLowerCase() as Lowercase<FieldKind>
                      const id = `${prefix}-${rowId}-${columnIndex}`
                      const labelId = `${id}-label`
                      const ctx: FieldContext = {
                        id,
                        labelId,
                        describedBy: undefined,
                        invalid: false,
                        text: fieldText(column),
                        values: { [column.key]: valueFor(rowId, row, column) },
                        setValue: setCell(rowId),
                        controlled: true,
                      }
                      return (
                        <TableCell key={column.key} data-slot="record-grid-01-cell">
                          {SELF_LABELLED.has(kind) ? null : (
                            <Label id={labelId} htmlFor={id} required={column.required} className="sr-only">
                              {column.label}
                            </Label>
                          )}
                          {renderControl(column, ctx)}
                          {column.help === undefined ? null : (
                            <span className="sr-only">{column.help}</span>
                          )}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={Math.max(1, columns.length)}
                  className="text-muted-foreground h-24 text-center"
                >
                  {emptyMessage ?? labels.empty}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default RecordGrid01
