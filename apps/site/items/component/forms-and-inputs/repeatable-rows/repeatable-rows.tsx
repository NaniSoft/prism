'use client'

import { useState } from 'react'

import { Field, FieldLabel } from '@nanisoft/prism-ui/components/field'
import { Input } from '@nanisoft/prism-ui/components/input'
import { RepeatableRows } from '@nanisoft/prism-ui/components/repeatable-rows'

/**
 * A row object, held in this Demo's own state and never rebuilt.
 *
 * The identity is the point. `RepeatableRows` keys each row against the object
 * itself, so the rows have to be the same objects across renders. Rebuilding them
 * with a spread on every render would hand over a new object each time and every
 * row would remount on every keystroke, which is the cost the prop documents and
 * the arrangement this Demo avoids by keeping the array in state.
 */
type Stop = {
  id: string
  place: string
  reason: string
}

/**
 * Two editable rows, an add control and a remove control on each.
 *
 * The thing to try is removing the first row while the cursor is in the second
 * row's field, and then removing a row in the middle of a set of three. Focus
 * moves to a neighbour every time, the visible position renumbers below the
 * removal, and the `htmlFor` on each label keeps pointing at its own control
 * because the generated id follows the row rather than the position.
 */
export default function RepeatableRowsDemo() {
  const [stops, setStops] = useState<Stop[]>([
    { id: 'a', place: 'Kings Cross', reason: 'Signal failure reported by two drivers.' },
    { id: 'b', place: 'Cricklewood', reason: 'Points operator called it in.' },
  ])
  // A counter rather than a module-level variable, so two instances of this Demo
  // on one page cannot mint the same id. The row objects it creates are held in
  // state and never rebuilt, which is the requirement the `rows` prop states.
  const [serial, setSerial] = useState(2)

  const update = (id: string, patch: Partial<Stop>) => {
    setStops((current) =>
      current.map((stop) => (stop.id === id ? { ...stop, ...patch } : stop)),
    )
  }

  return (
    <div className="flex max-w-measure flex-col gap-8">
      <RepeatableRows
        label="Stops on this run"
        rows={stops}
        onAdd={() => {
          const id = `stop-${serial + 1}`
          setSerial(serial + 1)
          setStops((current) => [...current, { id, place: '', reason: '' }])
        }}
        onRemove={(row) => setStops((current) => current.filter((stop) => stop !== row))}
        addLabel="Add stop"
        rowLabel={(index) => `Stop ${index + 1}`}
        removeLabel={(index) => `Remove stop ${index + 1}`}
      >
        {(stop, { fieldId }) => (
          <Field className="min-w-48 flex-1">
            <FieldLabel htmlFor={fieldId}>Where</FieldLabel>
            <Input
              id={fieldId}
              value={stop.place}
              onChange={(event) => update(stop.id, { place: event.target.value })}
            />
          </Field>
        )}
      </RepeatableRows>

      <p className="text-muted-foreground text-sm">
        The `fieldId` in the render prop is generated per row and follows the row,
        not its position, so a label pointing at it survives every removal above
        it. The position in the visible label of a row does renumber, and it is
        the same string the region of that row is named by, so the two cannot
        disagree.
      </p>
    </div>
  )
}
