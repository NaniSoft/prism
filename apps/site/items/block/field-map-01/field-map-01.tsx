import { FieldMap01, type FieldMapColumn, type FieldMapState } from '@nanisoft/prism-ui/blocks/field-map-01'

/**
 * A mapping in the direction a pipeline actually runs, with all four states
 * present.
 *
 * The four states are the point of this Demo rather than the rows. `mapped` is
 * the field that lands under the same name, `transformed` is the one that is
 * reshaped on the way in, `unmapped` is the row that renders the caller's own
 * sentence in place of a cell, and `excluded` is the one that was deliberately
 * left behind. A Demo that showed only the first two would show a table with
 * nothing to do.
 */
const COLUMNS: FieldMapColumn[] = [
  { id: 'required', header: 'Required at the target' },
  { id: 'type', header: 'Type at the source' },
  { id: 'transform', header: 'Transformation' },
  { id: 'state', header: 'State' },
  { id: 'note', header: 'Note' },
]

/** The words for a state, written per row rather than per state. */
function stateLabel(state: FieldMapState, source: string): string {
  if (state === 'mapped') return `${source} lands under the same name`
  if (state === 'unmapped') return `${source} has no counterpart in the target yet`
  if (state === 'transformed') return `${source} is reshaped on the way in`
  return `${source} is deliberately not carried across`
}

/** The cells of the mapping, in the order they are read. */
const ROWS = [
  {
    id: 'account-id',
    source: 'Account.Id',
    target: 'account_id',
    required: true,
    type: 'string(18)',
    transform: 'Strip the 15-character prefix Salesforce puts on every id.',
    state: 'transformed' as const,
  },
  {
    id: 'close-date',
    source: 'Account.CloseDate',
    target: 'closed_on',
    required: false,
    type: 'date',
    transform: 'Read as a calendar date in the account’s own timezone, then stored as UTC midnight.',
    state: 'transformed' as const,
  },
  {
    id: 'name',
    source: 'Account.Name',
    target: 'buyer_name',
    type: 'string(255)',
    note: 'The only field the two systems spell the same way by accident.',
  },
  {
    id: 'last-task',
    source: 'Account.LastTaskDate',
    type: 'datetime',
    note: 'Held back until the team decides whether a closed task is a close date.',
  },
  {
    id: 'annual-revenue',
    source: 'Account.AnnualRevenue',
    type: 'currency(18,2)',
    transform: 'Converted to minor units, so the target never holds a float.',
    state: 'excluded' as const,
    note: 'The source value is unreconciled for nine per cent of accounts.',
  },
]

/** The mapping, and the same mapping with the two remaining columns dropped. */
export default function FieldMap01Demo() {
  return (
    <>
      <FieldMap01
        headingLevel="h3"
        eyebrow="Preview"
        title="How a customer becomes a row in the warehouse"
        description="Both names are yours. The direction of the migration is the claim this table makes, and a generic destination heading is how a migration gets run backwards."
        sourceLabel="Salesforce"
        targetLabel="Warehouse, public.buyers"
        columns={COLUMNS}
        rows={ROWS}
        stateLabel={stateLabel}
        requiredLabel={(required) =>
          required ? 'The target will not accept the row without it' : 'Optional'
        }
        unmappedLabel="No counterpart in the target yet. This row is a task."
      />
      <FieldMap01
        headingLevel="h3"
        eyebrow="Preview"
        title="The other direction, with two columns dropped"
        description="The columns are the caller’s, in the caller’s order. The two system columns are always first and cannot be renamed from the list."
        sourceLabel="Warehouse, public.buyers"
        targetLabel="Operator view"
        columns={[{ id: 'type', header: 'Type in the warehouse' }, { id: 'state', header: 'State' }]}
        rows={ROWS.filter((row) => 'state' in row)}
        stateLabel={stateLabel}
        requiredLabel={(required) => (required ? 'Required by the view' : 'Optional')}
        unmappedLabel="Not exposed by the view."
      />
    </>
  )
}
