import type { ReactNode } from 'react'

import { Section, SectionHeading, type HeadingLevel } from '../../components/ui/section'
import { Status, type StatusTone } from '../../components/ui/status'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import { cn } from '../../lib/utils'

/**
 * The four states a mapped field can be in, and the tone each one draws.
 *
 * The states are the caller's, the tone is this Block's, and the split is the
 * whole design for the same reason it is the design in `StatusLedger01`: a tone
 * is a colour and colour is not information a reader can act on, while the words
 * are the information and the words belong to the product. Out loud, because a
 * caller picking a state needs to know what they are picking: `mapped` is a field
 * that lands in the target under the same name, `unmapped` is one with no
 * counterpart there yet, `transformed` is one that lands under a different name
 * or in a different shape, and `excluded` is one deliberately not carried across
 * at all. Four, and the fifth would be the one that splits a state that does not
 * need splitting, which is a colour a reader has to learn and a word a maintainer
 * has to keep true.
 */
export type FieldMapState = 'mapped' | 'unmapped' | 'transformed' | 'excluded'

/**
 * The tone each state is drawn in, from the semantic contract and no other.
 *
 * `mapped` is `success` because it is the one state that means the work is done.
 * `unmapped` is `warning` rather than `destructive` on purpose: an unmapped field
 * is a thing to do, not a fault, and a table of thirty rows where four are amber
 * is a table with four tasks in it, while the same four in red reads as four
 * breakages and sends a reader looking for an incident that is not happening.
 * `transformed` is `info`, which is the contract's cool role that means not an
 * alarm, and `excluded` is `neutral`, because a field somebody chose to leave
 * behind is not in dispute and must not be drawn as though it were.
 */
const STATE_TONE: Record<FieldMapState, StatusTone> = {
  mapped: 'success',
  unmapped: 'warning',
  transformed: 'info',
  excluded: 'neutral',
}

/**
 * The columns of the detail table a caller can name, beyond the two systems.
 *
 * `source` and `target` are deliberately not members. See `FieldMapColumnId`.
 */
export type FieldMapColumnId = 'required' | 'type' | 'transform' | 'state' | 'note'

/**
 * One of the caller's own columns: which part of the row fills the cell, and
 * what the column is called in the caller's own words.
 *
 * The shape follows `DataTableColumn` with the `cell` function dropped, and the
 * reason is worth stating because it is the one place this Block and that one
 * look alike and are not the same. `DataTable01` takes a render function per
 * column because it has no idea what a row contains. This Block knows the seven
 * fields a row has, so a caller that could write a `cell` function could draw
 * this table without this Block, and shipping the function would have been an
 * invitation to do exactly that. What is left is the part that is genuinely the
 * caller's: the name of the column, its order, and where it sits.
 */
export type FieldMapColumn = {
  /** Which part of the row fills the cell. */
  id: FieldMapColumnId
  /** The column heading, in the caller's own words. */
  header: ReactNode
  /** Layout classes for the column, for alignment or a fixed width. */
  className?: string
}

/**
 * One row: a field at the source, what it becomes at the target, and the facts
 * about the move.
 */
export type FieldMapRow = {
  /** A stable key for the row. */
  id: string
  /**
   * The field's name at the source, exactly as the source system spells it. It
   * is the row's identity, so it is the row head, and it is set in the mono face
   * because a field name is a name in an alphabet a machine reads.
   */
  source: string
  /**
   * The field's name at the target. Omit it for a field with no counterpart
   * there yet, and the cell renders `unmappedLabel` rather than a dash.
   */
  target?: string
  /**
   * Whether the target will not accept the row without it. Omit it for a field
   * whose requiredness has not been decided, and the cell renders nothing rather
   * than guessing either way.
   */
  required?: boolean
  /** The field's type at the source, in the source system's own words. */
  type?: string
  /** What has to happen to the value on the way across. */
  transform?: ReactNode
  /** Anything else the reader needs before acting on the row. */
  note?: ReactNode
  /**
   * The state the field is in. Omit it and the row's own data settles it, which
   * is a restatement rather than a claim: a field with a target has been mapped
   * and a field without one has not.
   */
  state?: FieldMapState
}

/**
 * The layout each detail column gets when the caller says nothing.
 *
 * Only the two prose columns are told to wrap, and the reason is that the
 * component they come from sets every cell to `whitespace-nowrap` so a table of
 * numbers lines up. A transformation is a sentence and a note is a sentence, and
 * a table that scrolls a sentence sideways to keep it on one line is a table
 * nobody reads a whole row of. The three short columns keep the default, because
 * a required mark, a type name and a state are all things that are better on one
 * line than wrapped across two.
 */
const COLUMN_CELL: Record<FieldMapColumnId, string> = {
  required: '',
  type: '',
  transform: 'whitespace-normal',
  state: '',
  note: 'whitespace-normal',
}

/**
 * The props a FieldMap01 takes.
 *
 * Every string is a prop and the Block ships none. There is no source system, no
 * target system, no set of states, no column headings and no wording for a field
 * that has not been mapped yet, and the absence of the first two is the sharpest
 * version of the rule: a mapping table is a document about two named systems, and
 * a Block that named either of them would hand every consumer a table about
 * somebody else's estate.
 */
export type FieldMap01Props = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: string
  /** The section title. Required, because a table with no heading is an orphan. */
  title: ReactNode
  /** One or two sentences under the title. */
  description?: ReactNode
  /**
   * The caller's own columns, in the order they should be read.
   *
   * The two system columns are not in this list and cannot be: the Block renders
   * those itself from `sourceLabel` and `targetLabel`, so a `columns` entry that
   * named one of them would be an entry the table ignores, which is a list whose
   * contents are not the table. Everything else this Block knows how to fill is
   * named here, and a caller who wants two of them can have both.
   */
  columns: readonly FieldMapColumn[]
  /** The rows, in the order a reader should act on them. Order is the caller's. */
  rows: readonly FieldMapRow[]
  /**
   * The name of the source system, and the heading over the first column.
   *
   * Required, and required together with `targetLabel` rather than on its own,
   * because the two columns are the two systems. See the Component JSDoc.
   */
  sourceLabel: string
  /**
   * The name of the target system, and the heading over the second column.
   *
   * Required for the same reason and in the same breath.
   */
  targetLabel: string
  /**
   * The words for a state, given the state and the field it belongs to.
   *
   * Required rather than optional because the Block always resolves a state, and
   * an unresolved state would be a dot with no sentence beside it.
   */
  stateLabel: (state: FieldMapState, source: string) => string
  /**
   * The words for whether the target will not accept the row without the field.
   *
   * Required rather than optional for the same reason `stateLabel` is: the cell
   * is a mark plus a sentence, and the mark alone is a coloured dot that a
   * reader who cannot see the tone has learned nothing from.
   */
  requiredLabel: (required: boolean) => string
  /**
   * What the target cell says for a field that has no counterpart there yet.
   *
   * Required, and a slot rather than a string, because the two answers are not the
   * same sentence: one is a task waiting to be done and the other is a decision
   * that was made. The cell renders this rather than a dash because a mapping
   * table is a document somebody acts on, and an empty cell is a thing to do
   * while a dash is a piece of typography.
   */
  unmappedLabel: ReactNode
  /**
   * Heading level for the section title. @defaultValue 'h2'
   *
   * See `HeadingLevel`.
   */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Block. Changing a Prism-owned visual
   * property from here is prohibited.
   */
  className?: string
}

/**
 * A source-to-target field mapping: what a field is called on one side, what it
 * becomes on the other, whether it is required, what type it is, and what has to
 * happen to the value.
 *
 * **This is the artefact a pipeline and an estate both produce, and it is why the
 * Block is a Block rather than a component.** A component is a control with one
 * job. This is a section: a heading, a paragraph of why the table is here, and a
 * document a reader works down row by row, and it composes `Section`,
 * `SectionHeading`, `Status` and the `Table` parts. A consumer whose data is a
 * mapping and a consumer whose data is a data dictionary are drawing the same
 * table, and the difference between their two tables is the names in two cells.
 *
 * **The two system names are required together, and the reason is that the two
 * columns are the two systems.** A mapping table's whole content is the
 * correspondence between one named thing and another, and a header that says
 * "Source" on the left and "Destination" on the right has thrown both names away
 * and replaced them with the shape of the operation. That table is not useless,
 * it is worse than useless, because it reads correctly in the deployment where
 * the two systems happen to be obvious and is misread in every deployment where
 * they are not, and nobody catches it because the table looks finished. A reader
 * holding "Customer__c" on the left and "buyer_ref" on the right, with no system
 * named, has to guess which way the migration runs, and a migration run backwards
 * is the single most expensive mistake this document can cause. So the Block asks
 * for both names, asks for them together, and refuses one without the other: a
 * table with a source name and a generic destination name is the half-answered
 * case, and it is worse than a compile error because it renders. Prism will not
 * name either system itself, because Prism does not know whether the consumer is
 * moving from a CRM into a warehouse or out of one into a CRM, and printing the
 * wrong pair in the other direction would be a confident answer to a question it
 * cannot see.
 *
 * **The four states use the `Status` tones, and the words are the caller's
 * through a required `stateLabel`.** Out loud, because a caller choosing a state
 * needs to know what the colours mean before they choose: `mapped` lands in the
 * target under the same name and is drawn `success`, `unmapped` has no
 * counterpart there yet and is drawn `warning`, `transformed` lands under a
 * different name or in a different shape and is drawn `info`, and `excluded` was
 * deliberately left behind and is drawn `neutral`. Every one of those dots is
 * `aria-hidden` and the words beside it are not, so a reader who cannot separate
 * `warning` from `destructive` still reads which is which, which is also why the
 * state list can stay as small as it is. `stateLabel` takes the field's name as
 * well as the state, because a mapping table is read one row at a time and a
 * reader who has navigated to a cell needs to know which field they are in, and
 * because the honest sentence is per row in most of them: "not carried across",
 * "renamed on the way in", "held back pending a decision about the buyer".
 *
 * **A row with no target renders the caller's `unmappedLabel`, and that is the
 * decision this Block is most particular about.** The obvious thing in an empty
 * table cell is a dash, and the dash is wrong here for a reason that has nothing
 * to do with taste. A mapping table is a document somebody acts on: it is the
 * thing an engineer reads before a migration and a reviewer reads during one, and
 * a field with no counterpart is a task, not an absence. An em dash says the
 * author had nothing to say, and the reader who believes it files the row as done.
 * The caller's own words say what the row actually is, which is either a thing
 * still to be done or a decision already taken, and those are opposite actions on
 * the same empty cell. A slot rather than a string, because the two sentences are
 * not variants of one.
 *
 * **The two system columns are not in `columns`, and that is a closed set rather
 * than an omission.** `columns` names the caller's own headings for the rest of
 * the table and the order they are read in, which is genuinely the caller's
 * decision. The two system headings are not, because the Block already has them
 * in `sourceLabel` and `targetLabel` and a list that could also name them would
 * be a list with two entries the table ignores. A caller who has to look at a
 * list and ask which of its entries is being dropped has been handed a list that
 * does not describe the thing, and the type here is how that is prevented rather
 * than a comment asking them to be careful.
 *
 * **It is a real table, and that is the accessibility claim.** The header cells
 * are `<th scope="col">` and the field name is a `<th scope="row">`, so a reader
 * navigating by cell hears which column and which field every value belongs to,
 * and a reader moving by row hears the field before the values under it. The
 * alternative was a grid of `div`s with `role="presentation"` and a caption, and
 * it is the arrangement most hand-written mapping tables use, because it is easier
 * to make responsive. What it costs is that the correspondence between a value
 * and its field is then a position, and a position is the one thing a screen
 * reader, a crawler and a print stylesheet cannot read.
 *
 * It is a server Component: no hook, no state, no client code and no router. The
 * table is markup, so a mapping document costs a consumer nothing in client
 * JavaScript and reads identically with scripting off.
 */
export function FieldMap01({
  eyebrow,
  title,
  description,
  columns,
  rows,
  sourceLabel,
  targetLabel,
  stateLabel,
  requiredLabel,
  unmappedLabel,
  headingLevel = 'h2',
  className,
}: FieldMap01Props) {
  if (!sourceLabel || !targetLabel) {
    throw new Error(
      'FieldMap01: one of the two system names was not passed, so one of the two columns would carry a ' +
        'generic heading over a table whose whole content is the correspondence between two named ' +
        'systems. Pass the name of the source and the name of the target, together.',
    )
  }

  if (rows.length === 0) return null

  /**
   * The cell one column draws for one row.
   *
   * A switch rather than a map of render functions, because a map keyed by
   * column id would be a second recipe of the kind this package keeps off the
   * public surface, and a switch over five cases is the same table with the
   * strings in the same file as the drawing that uses them.
   */
  function cellOf(id: FieldMapColumnId, row: FieldMapRow): ReactNode {
    switch (id) {
      case 'required':
        if (row.required === undefined) return null
        return (
          <Status
            size="sm"
            tone={row.required ? 'info' : 'neutral'}
            label={requiredLabel(row.required)}
          />
        )
      case 'type':
        return row.type === undefined ? null : <span className="font-mono text-xs">{row.type}</span>
      case 'transform':
        return row.transform ?? null
      case 'state': {
        const state = stateOf(row)
        return <Status size="sm" tone={STATE_TONE[state]} label={stateLabel(state, row.source)} />
      }
      case 'note':
        return row.note ?? null
    }
  }

  return (
    <Section>
      <SectionHeading
        as={headingLevel}
        align="left"
        eyebrow={eyebrow}
        title={title}
        description={description}
        className="mb-10"
      />

      <div data-slot="field-map" className={cn('border-border rounded-xl border', className)}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">{sourceLabel}</TableHead>
              <TableHead scope="col">{targetLabel}</TableHead>
              {columns.map((column) => (
                <TableHead key={column.id} scope="col" className={column.className}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id} data-slot="field-map-row" data-state={stateOf(row)}>
                {/*
                  The row head, and the one place in this Block where a `<th>` is
                  not a column. A reader who has navigated into a cell needs to
                  know which field it belongs to, and that is what a row head is
                  for; the field name is also the row's identity, so it is drawn in
                  the mono face because it is a name in a machine's alphabet.
                */}
                <TableHead scope="row" className="font-mono text-xs font-medium">
                  {row.source}
                </TableHead>

                <TableCell className="font-mono text-xs">
                  {row.target ?? (
                    <span data-slot="field-map-unmapped" className="text-muted-foreground font-sans">
                      {unmappedLabel}
                    </span>
                  )}
                </TableCell>

                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    className={cn(COLUMN_CELL[column.id], column.className)}
                  >
                    {cellOf(column.id, row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Section>
  )
}

/**
 * The state a row is in when the caller did not say.
 *
 * A restatement of the row's own data rather than a judgement about it: a field
 * with a target name has been mapped, and a field without one has not. That is
 * why the derivation is safe to make, and it is why the two states it produces
 * are the two the data itself settles. It is not safe for the other two, which is
 * the whole reason `state` exists: a transformation is invisible in the data,
 * because a field called `close_date` in one system and `closed_at` in the other
 * looks exactly like a rename until somebody says it, and a field that was
 * deliberately not carried across looks exactly like one somebody forgot. Both
 * have to be stated, and a Block that inferred either would be inventing a
 * decision on the reader's behalf.
 */
function stateOf(row: FieldMapRow): FieldMapState {
  if (row.state !== undefined) return row.state
  return row.target === undefined ? 'unmapped' : 'mapped'
}

export default FieldMap01
