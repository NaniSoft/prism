'use client'

import { useState } from 'react'

import { Button } from '@nanisoft/prism-ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@nanisoft/prism-ui/components/card'
import { Steps, type Step } from '@nanisoft/prism-ui/components/steps'

const IMPORT: Step[] = [
  { label: 'Choose a source', description: 'A repository or an upload' },
  { label: 'Map the columns', description: 'Six fields we can read' },
  { label: 'Preview', description: 'Nothing has been written yet' },
  { label: 'Write', description: 'One transaction, or none' },
]

/**
 * The same sequence with the second step reached out of band.
 *
 * A reviewer approved a line on Friday, so step two is done even though the
 * reader is still on step three. That is the case `state` exists for: the
 * position and the state are two different facts, and a derived mark would draw a
 * claim the data contradicts. The reason is written into the step's description
 * so the rail stays a rail and the override is never the only record.
 */
const APPROVED: Step[] = [
  IMPORT[0] as Step,
  { ...(IMPORT[1] as Step), state: 'complete' as const, description: 'Approved by a reviewer on Friday' },
  IMPORT[2] as Step,
  IMPORT[3] as Step,
]

export default function StepsDemo() {
  const [at, setAt] = useState(2)
  const [approved, setApproved] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle as="h3">One rail, every position</CardTitle>
          <CardDescription>
            Move the reader and every mark moves with them, because the states are
            derived from the index rather than stated beside it. The rule between
            the steps is filled up to the current step and empty after it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Steps label="Import progress" steps={IMPORT} current={at} />

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              disabled={at === 0}
              onClick={() => setAt((value) => Math.max(0, value - 1))}
            >
              Back
            </Button>
            <Button
              variant="outline"
              disabled={at === IMPORT.length - 1}
              onClick={() => setAt((value) => Math.min(IMPORT.length - 1, value + 1))}
            >
              Forward
            </Button>
            <Button
              variant="outline"
              disabled={at === IMPORT.length}
              onClick={() => setAt(IMPORT.length)}
            >
              Past the end
            </Button>
          </div>

          <p className="text-muted-foreground mt-4 text-sm">
            The third control sets <code className="font-mono">current</code> one
            past the last step on purpose. It is clamped, so a stale value from a
            state that has not caught up lands on the nearest real step rather than
            on nothing. The rail is on item {Math.min(at, IMPORT.length - 1) + 1} of{' '}
            {IMPORT.length} and the figure carries that as{' '}
            <code className="font-mono">data-current</code>.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle as="h3">A step reached out of band</CardTitle>
          <CardDescription>
            The second step was approved on Friday while the reader sat on the
            third. Overriding the state of one step with{' '}
            <code className="font-mono">state</code> is the whole reason that prop
            exists; overriding every step would be replacing the rule with your
            own and gaining nothing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Steps
            label="Import progress with an approved step"
            steps={approved ? APPROVED : IMPORT}
            current={at}
          />

          <Button className="mt-6" variant="outline" onClick={() => setApproved((v) => !v)}>
            {approved ? 'Withdraw the approval' : 'Mark step two approved'}
          </Button>
        </CardContent>
      </Card>

      <p className="text-muted-foreground text-sm">
        Exactly one step is current and that is checked rather than described. Mark
        two steps <code className="font-mono">current</code> and the component
        throws rather than draw a rail with two answers to where the reader is;
        mark the step <code className="font-mono">current</code> points at as
        something else and it throws for the same reason, because the rail would
        then have none. A derivation on its own can never produce either, so the
        diagnostic only ever fires on a declaration the caller wrote.
      </p>
    </div>
  )
}
