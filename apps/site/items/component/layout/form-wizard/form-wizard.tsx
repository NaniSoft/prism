'use client'

import { useState } from 'react'

import { Button } from '@nanisoft/prism-ui/components/button'
import { Checkbox } from '@nanisoft/prism-ui/components/checkbox'
import { Field, FieldError, FieldLabel } from '@nanisoft/prism-ui/components/field'
import { Input } from '@nanisoft/prism-ui/components/input'
import {
  FormWizard,
  type FormWizardIssue,
  type FormWizardStep,
} from '@nanisoft/prism-ui/components/form-wizard'

const NAMES = {
  organisation: 'What is this workspace called?',
  region: 'Where is its data held?',
  retention: 'How long is a reading kept?',
} as const

/**
 * Three steps, and the asymmetry is the whole demonstration.
 *
 * Step one refuses a forward move while its field is empty, and the refusal takes
 * focus. Step three has no field at all and therefore no gate, so forward is
 * allowed straight away. Back is available at every step including the first, where
 * it is inert rather than absent.
 */
export default function FormWizardDemo() {
  const [at, setAt] = useState(0)
  const [name, setName] = useState('')
  const [region, setRegion] = useState('eu-west')
  const [retain, setRetain] = useState('90')
  const [terms, setTerms] = useState(false)
  const [nameError, setNameError] = useState<string | null>(null)
  const [termsError, setTermsError] = useState<string | null>(null)
  const [finished, setFinished] = useState(false)

  const steps: FormWizardStep[] = [
    {
      id: 'organisation',
      label: 'Organisation',
      description: NAMES.organisation,
      validate: (form) => {
        const value = String(new FormData(form).get('workspace-name') ?? '').trim()
        if (value !== '') {
          setNameError(null)
          return []
        }
        setNameError('Enter a name for the workspace.')
        return [{ field: 'workspace-name', message: 'Enter a name for the workspace.' }]
      },
      children: (
        <Field>
          <FieldLabel htmlFor="workspace-name">Workspace name</FieldLabel>
          <Input
            id="workspace-name"
            name="workspace-name"
            value={name}
            aria-invalid={nameError !== null || undefined}
            onChange={(event) => setName(event.target.value)}
          />
          {nameError === null ? null : <FieldError>{nameError}</FieldError>}
        </Field>
      ),
    },
    {
      id: 'region',
      label: 'Region',
      description: NAMES.region,
      children: (
        <Field>
          <FieldLabel htmlFor="workspace-region">Data region</FieldLabel>
          <Input
            id="workspace-region"
            name="workspace-region"
            value={region}
            onChange={(event) => setRegion(event.target.value)}
          />
        </Field>
      ),
    },
    {
      id: 'retention',
      label: 'Retention',
      description: NAMES.retention,
      // This step asks for nothing it can check locally, so it has no rule of its
      // own. The sequence-level rule below is the one that refuses, and it refuses
      // on terms accepted two screens ago, which is exactly the check no single step
      // can make.
      children: (
        <Field>
          <FieldLabel htmlFor="workspace-retain">Days a reading is kept</FieldLabel>
          <Input
            id="workspace-retain"
            name="workspace-retain"
            value={retain}
            onChange={(event) => setRetain(event.target.value)}
          />
          <label className="mt-4 flex items-center gap-2 text-sm">
            <Checkbox
              checked={terms}
              onCheckedChange={(checked) => {
                setTerms(checked)
                if (checked) setTermsError(null)
              }}
            />
            I have read the processing terms
          </label>
          {termsError === null ? null : <FieldError>{termsError}</FieldError>}
        </Field>
      ),
    },
  ]

  return (
    <div className="flex max-w-measure-narrow flex-col gap-6">
      <FormWizard
        steps={steps}
        current={at}
        onStepChange={(next, direction) => {
          setAt(next)
          // The last step's control submits rather than advances, so the index does
          // not move and the only way to tell the two apart is the direction the
          // callback was given. That is why the callback takes one.
          if (direction === 'forward' && next === steps.length - 1) setFinished(true)
        }}
        validate={(_index, form): readonly FormWizardIssue[] => {
          void form
          if (terms) {
            setTermsError(null)
            return []
          }
          setTermsError('Accept the processing terms before finishing.')
          return [
            {
              field: 'workspace-retain',
              message: 'Accept the processing terms before finishing.',
            },
          ]
        }}
        backLabel="Back"
        nextLabel="Continue"
        finishLabel="Create workspace"
        blockedLabel="This step is not finished"
        progressLabel="Workspace setup"
        issueLabel={(field) => (field === 'workspace-retain' ? 'Retention' : 'Workspace name')}
        instructionsLabel="Continue moves forward to the next step and is checked before it goes. Back is always available, including on the first step, where it does nothing."
      />

      {finished ? (
        <div className="flex flex-col items-start gap-3 border-t pt-4">
          <p className="text-sm">
            The workspace would now be created as <strong>{name}</strong> in{' '}
            <strong>{region}</strong>, keeping a reading for {retain} days.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setAt(0)
              setFinished(false)
              setTerms(false)
            }}
          >
            Start again
          </Button>
        </div>
      ) : (
        <p className="text-muted-foreground border-border text-sm border-t pt-4">
          Step one refuses a forward move while its field is empty. Step three has no
          field of its own to check, so forward is allowed straight away until the
          sequence-level rule refuses, which it does about a term accepted two
          screens earlier.
        </p>
      )}
    </div>
  )
}
