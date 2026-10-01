'use client'

import { useState } from 'react'

import {
  FormDialog,
  type FormDialogIssue,
  type FormDialogPhase,
} from '@nanisoft/prism-ui/components/form-dialog'
import { Button } from '@nanisoft/prism-ui/components/button'
import { Field, FieldDescription, FieldError, FieldLabel } from '@nanisoft/prism-ui/components/field'
import { Input } from '@nanisoft/prism-ui/components/input'
import { NativeSelect } from '@nanisoft/prism-ui/components/native-select'

/**
 * A modal that checks itself before it asks a network, and keeps the reader where
 * they were when it refuses.
 *
 * Submit with the name empty and the refusal is local: the summary takes focus, the
 * two fields are listed under it with their own labels, and no request goes out.
 * Fill it in and the submission is simulated, so the running and refused positions
 * are reachable without a server.
 */
export default function FormDialogDemo() {
  const [open, setOpen] = useState(false)
  const [phase, setPhase] = useState<FormDialogPhase>('idle')
  const [issues, setIssues] = useState<readonly FormDialogIssue[]>([])

  return (
    <div className="flex max-w-measure-narrow flex-col items-start gap-4">
      <Button onClick={() => setOpen(true)}>Create an environment</Button>

      <FormDialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) {
            setPhase('idle')
            setIssues([])
          }
        }}
        trigger="Create an environment"
        phase={phase}
        title="Create an environment"
        description="The environment is created in the region you pick and starts empty."
        idleLabel="Create environment"
        invalidLabel="Create environment"
        submittingLabel="Creating"
        failedLabel="Environment not created"
        errorSummaryLabel="The environment was not created"
        fieldLabel={(field) => (field === 'name' ? 'Environment name' : 'Region')}
        validate={(values): readonly FormDialogIssue[] => {
          const found: FormDialogIssue[] = []
          const name = String(values.get('name') ?? '').trim()
          if (name === '') {
            found.push({ field: 'name', message: 'Enter a name for the environment.' })
          } else if (name.length > 32) {
            found.push({ field: 'name', message: 'Use 32 characters or fewer.' })
          }
          if (!String(values.get('region') ?? '')) {
            found.push({ field: 'region', message: 'Choose the region to create it in.' })
          }
          return found
        }}
        issues={issues}
        onSubmit={(form) => {
          setPhase('submitting')
          const name = new FormData(form).get('name')
          setIssues([])
          // A stand-in for the request, so the running and refused positions are
          // reachable from a Demo with no network behind it.
          setTimeout(() => {
            if (name === 'taken') {
              setPhase('failed')
              setIssues([
                { field: 'name', message: 'An environment with that name already exists.' },
              ])
              return
            }
            setPhase('idle')
            setOpen(false)
          }, 900)
        }}
        cancelLabel="Cancel"
      >
        <Field>
          <FieldLabel htmlFor="fd-name">Environment name</FieldLabel>
          <Input
            id="fd-name"
            name="name"
            placeholder="production-eu"
            aria-invalid={issues.some((issue) => issue.field === 'fd-name') || undefined}
          />
          <FieldDescription>Letters, numbers and hyphens.</FieldDescription>
          {issues.some((issue) => issue.field === 'fd-name') ? (
            <FieldError>
              {issues.find((issue) => issue.field === 'fd-name')?.message}
            </FieldError>
          ) : null}
        </Field>

        <Field>
          <FieldLabel htmlFor="fd-region">Region</FieldLabel>
          <NativeSelect id="fd-region" name="region" defaultValue="">
            <option value="">Choose a region</option>
            <option value="eu-west">eu-west</option>
            <option value="eu-central">eu-central</option>
            <option value="us-east">us-east</option>
          </NativeSelect>
          {issues.some((issue) => issue.field === 'fd-region') ? (
            <FieldError>
              {issues.find((issue) => issue.field === 'fd-region')?.message}
            </FieldError>
          ) : null}
        </Field>
      </FormDialog>

      <p className="text-muted-foreground text-sm">
        Name an environment <code>taken</code> to see the refused position. Leave the
        name empty to see the local refusal, which never reaches a request.
      </p>
    </div>
  )
}
