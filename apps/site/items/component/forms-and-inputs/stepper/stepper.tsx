'use client'

import { useState } from 'react'

import { Stepper } from '@nanisoft/prism-ui/components/stepper'

/**
 * The pair at three positions, so the boundary state is visible rather than
 * described.
 *
 * The first is stopped at its maximum, which is the state the whole Component
 * exists to draw: the increment is dimmed and out of the tab order, and the
 * decrement is live. The second moves in steps of five. The third is read-only,
 * where both halves are refused rather than one, because a half-stepper over a
 * value nobody may change has no way to tell the reader which half is wrong.
 */
export default function StepperDemo() {
  const [seats, setSeats] = useState(8)
  const [copies, setCopies] = useState(12)
  const [printed, setPrinted] = useState(3)

  return (
    <div className="flex max-w-measure-narrow flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <span className="text-foreground text-sm leading-none font-medium">Seats on the plan</span>
        <Stepper
          value={seats}
          onValueChange={setSeats}
          label="Seats on the plan"
          labels={{
            increment: 'Increase the number of seats',
            decrement: 'Decrease the number of seats',
          }}
          min={1}
          max={8}
        />
        <span className="text-muted-foreground text-sm">
          Holding {seats}, at the top of a range of eight. The increment is unavailable and
          says so by being unavailable rather than by doing nothing when pressed.
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-foreground text-sm leading-none font-medium">Printed copies</span>
        <Stepper
          value={copies}
          onValueChange={setCopies}
          label="Printed copies"
          labels={{
            increment: 'Add five printed copies',
            decrement: 'Remove five printed copies',
          }}
          min={0}
          max={100}
          step={5}
        />
        <span className="text-muted-foreground text-sm">
          Holding {copies}, in steps of five. The pair clamps and does not snap to the step
          grid, so a value somebody typed elsewhere moves by one step from where it is.
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-foreground text-sm leading-none font-medium">Printed edition</span>
        <Stepper
          value={printed}
          onValueChange={setPrinted}
          readOnly
          label="Printed edition"
          labels={{
            increment: 'Increase the printed edition',
            decrement: 'Decrease the printed edition',
          }}
          min={0}
          max={10}
        />
        <span className="text-muted-foreground text-sm">
          Read-only at {printed}. Both halves are refused, because a live half beside a dead
          one is a control with no way to say which half is the wrong one.
        </span>
      </div>
    </div>
  )
}