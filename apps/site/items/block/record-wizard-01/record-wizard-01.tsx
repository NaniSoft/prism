'use client'

import { useState } from 'react'

import { RecordWizard01 } from '@nanisoft/prism-ui/blocks/record-wizard-01'
import type { RecordForm01Issue } from '@nanisoft/prism-ui/blocks/record-form-01'
import type { FieldSpecGroup } from '@nanisoft/prism-ui/spec'

/**
 * Three steps over the shared field specification, with the step index held right
 * here where the Block drew it.
 *
 * The steps are `FieldSpecGroup` values with a stable `id` and a string `label`, so
 * the rail label and the step heading are one word. The values are the caller's from
 * the first keystroke, and the only rule in the Demo is the identity step's required
 * name, drawn as an issue under the control rather than as a refusal the consumer
 * cannot honour.
 */
const STEPS: readonly FieldSpecGroup[] = [
  {
    id: 'identity',
    label: 'Identity',
    description: 'What the workspace is called and who owns it.',
    fields: [
      {
        key: 'name',
        label: 'Workspace name',
        kind: 'Input',
        placeholder: 'Northwind',
        help: 'Shown in the workspace switcher.',
      },
      {
        key: 'owner',
        label: 'Owner',
        kind: 'Combobox',
        placeholder: 'Find a person',
        options: [
          { value: 'ada', label: 'Ada Lovelace' },
          { value: 'grace', label: 'Grace Hopper' },
        ],
      },
    ],
  },
  {
    id: 'billing',
    label: 'Billing',
    fields: [
      { key: 'seats', label: 'Seats', kind: 'NumberField', defaultValue: 5 },
      {
        key: 'budget',
        label: 'Monthly budget',
        kind: 'MoneyField',
        currency: 'USD',
        locale: 'en-US',
        defaultValue: 250,
      },
    ],
  },
  {
    id: 'review',
    label: 'Review',
    description: 'Check what you entered, then create the workspace.',
    fields: [
      {
        key: 'notifications',
        label: 'Email me about usage',
        kind: 'Switch',
      },
    ],
  },
]

export default function RecordWizard01Demo() {
  const [step, setStep] = useState(0)
  const [values, setValues] = useState<Record<string, unknown>>({
    name: 'Northwind',
    seats: 5,
  })
  const [issues, setIssues] = useState<readonly RecordForm01Issue[]>([])
  const [created, setCreated] = useState(false)

  return (
    <div className="flex max-w-measure flex-col gap-4">
      <p className="text-muted-foreground text-sm">
        The step index is held outside the Block. Back, the forward control and the
        rail are shipped by the wizard, and the identity step refuses to be left
        forwards without a name. The forward control on the last step is the finish
        signal.
      </p>
      <p className="text-muted-foreground text-sm">
        {created ? 'Workspace created.' : `Step ${step + 1} of ${STEPS.length}.`}
      </p>

      <RecordWizard01
        steps={STEPS}
        current={step}
        onStepChange={(index, direction) => {
          if (direction === 'forward' && step === 0 && String(values.name ?? '').trim() === '') {
            setIssues([{ field: 'name', message: 'A workspace needs a name.' }])
            return
          }
          setIssues([])
          if (direction === 'forward' && step === STEPS.length - 1) {
            setCreated(true)
            return
          }
          setCreated(false)
          setStep(index)
        }}
        values={values}
        onValueChange={(key, value) => setValues((held) => ({ ...held, [key]: value }))}
        issues={issues}
        backLabel="Back"
        nextLabel="Next"
        finishLabel="Create workspace"
        blockedLabel="Before you continue"
        progressLabel="New workspace steps"
        issueLabel={(field) => field}
        instructionsLabel="Going back is always allowed. The forward control checks this step."
      />
    </div>
  )
}
