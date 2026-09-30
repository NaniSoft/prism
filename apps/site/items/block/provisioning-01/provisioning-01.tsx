'use client'

import { useState } from 'react'

import { Alert, AlertDescription } from '@nanisoft/prism-ui/components/alert'
import {
  Provisioning01,
  type Provisioning01Status,
  type ProvisioningStep,
  type ProvisioningValue,
} from '@nanisoft/prism-ui/blocks/provisioning-01'

/**
 * A run with a real second step, a real select and a review step that has no
 * fields at all, which is the shape a checkout has and the reason the last step
 * is a review rather than an empty form.
 *
 * The array is annotated rather than left to inference because the third step
 * holds a different set of fields from the first two, and an inferred union of
 * three object shapes would make every field on every step optional. Annotating it
 * is also what a real product does, because the caller declaring its steps as data
 * is the whole point of the prop.
 */
const STEPS: readonly ProvisioningStep[] = [
  {
    id: 'target',
    name: 'The estate',
    fields: [
      {
        id: 'name',
        label: 'Estate name',
        type: 'text' as const,
        required: true,
        placeholder: 'One word your team will recognise',
        description: 'Used in every log line and in the address bar.',
      },
      {
        id: 'region',
        label: 'Region',
        type: 'select' as const,
        required: true,
        description: 'Where the data lands. It cannot be moved afterwards.',
        options: [
          { value: 'eu-west-2', label: 'London' },
          { value: 'eu-central-1', label: 'Frankfurt' },
          { value: 'us-east-1', label: 'Virginia' },
        ],
      },
    ],
  },
  {
    id: 'access',
    name: 'Access',
    fields: [
      {
        id: 'owner',
        label: 'Owner address',
        type: 'email' as const,
        required: true,
        autoComplete: 'email',
        description: 'The only person who can delete the estate.',
      },
      {
        id: 'window',
        label: 'Preferred maintenance window',
        type: 'text' as const,
        required: false,
        placeholder: 'Sunday 02:00 UTC',
      },
      {
        id: 'notes',
        label: 'Anything we should know',
        type: 'textarea' as const,
        required: false,
      },
    ],
  },
  {
    id: 'review',
    name: 'Review',
    description: 'Check the two steps above, then create the estate.',
    // No fields on the review step. This is the shape the Block is built for: an
    // empty list draws the step's description and the control that commits, and
    // does not draw an empty form a reader cannot fill.
    fields: [],
  },
]

/**
 * The same run with the outcomes written out, so the four states of `status` are
 * visible rather than described. Every sentence in the list is this Demo's, which
 * is the point: Prism holds no outcome sentence of its own and a consumer that
 * installs this Block owns every one of them.
 */
const OUTCOMES: Record<string, Provisioning01Status> = {
  working: { state: 'working', message: 'Creating the region, the bucket and the owner record.' },
  done: { state: 'done', message: 'The estate exists. Three resources were created.' },
  error: {
    state: 'error',
    message: 'The bucket could not be created because the name is already taken in that region.',
  },
}

export default function Provisioning01Demo() {
  const [status, setStatus] = useState<Provisioning01Status | undefined>(undefined)
  const [committed, setCommitted] = useState<ProvisioningValue | null>(null)

  if (committed !== null) {
    return (
      <div className="flex flex-col gap-6">
        <Alert>
          <AlertDescription>
            The run was committed and this Demo is holding what the Block handed over. Those are the keys
            the caller declared, and the values are whatever the reader typed. Nothing was sent anywhere:
            the Block gathers and hands over, and the transport is the caller&apos;s.
          </AlertDescription>
        </Alert>
        <pre className="bg-muted overflow-x-auto rounded-md p-4 font-mono text-xs">
          {JSON.stringify(committed, null, 2)}
        </pre>
        <div>
          <button
            type="button"
            onClick={() => {
              setCommitted(null)
              setStatus(undefined)
            }}
            className="border-input rounded-md border px-3 py-1.5 text-sm"
          >
            Start the run again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Provisioning01
        headingLevel="h3"
        eyebrow="Nexus"
        title="Provision an estate"
        description="Three steps, and the last one has no fields on it. It is the review, and what it carries is the control that commits."
        steps={STEPS}
        backLabel="Back"
        nextLabel="Continue"
        confirmLabel="Create the estate"
        terms="This creates a region, a bucket and an owner record, and it bills from the moment the region lands. Deleting the estate removes the data after a thirty day grace period."
        status={status}
        onConfirm={(value) => {
          setStatus(OUTCOMES.done)
          setCommitted(value)
        }}
      />

      {/*
        The outcomes, as three controls rather than a simulated run. The sentences
        are this Demo's, not the Block's, and a reader who wants to see what a
        refused run looks like needs a way to put one on the page.
      */}
      <div className="flex flex-wrap items-center gap-2">
        {(['working', 'done', 'error'] as const).map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={status?.state === key}
            onClick={() => setStatus(OUTCOMES[key])}
            className={
              status?.state === key
                ? 'border-primary bg-accent text-accent-foreground rounded-md border px-3 py-1.5 text-sm'
                : 'border-input rounded-md border px-3 py-1.5 text-sm'
            }
          >
            {key === 'working' ? 'Show a run in flight' : null}
            {key === 'done' ? 'Show a finished run' : null}
            {key === 'error' ? 'Show a refused run' : null}
          </button>
        ))}
      </div>
    </div>
  )
}
