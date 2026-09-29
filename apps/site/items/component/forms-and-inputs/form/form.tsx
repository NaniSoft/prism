'use client'

import { useState } from 'react'

import {
  Form,
  FormControl,
  FormDescription,
  FormError,
  FormField,
  FormLabel,
} from '@nanisoft/prism-ui/components/form'

/** The record the fake server hands back, keyed the way the fields are named. */
type Errors = Record<string, string | string[]>

const ADDRESS_TAKEN = 'That address is already registered.'
const SHORT = 'A team name needs at least three characters.'

/**
 * A sign-up form whose "server" answers with a record of errors. The two halves
 * worth watching are that the error lands under the control that caused it, and
 * that it clears as data rather than by reloading.
 */
export default function FormDemo() {
  const [errors, setErrors] = useState<Errors>({})
  const [submitted, setSubmitted] = useState<string | null>(null)

  return (
    <Form
      errors={errors}
      onSubmit={(values) => {
        const found: Errors = {}
        const email = String(values.email ?? '')
        const team = String(values.team ?? '')
        if (!email.endsWith('@example.com')) found.email = 'Use an address at example.com.'
        if (email === 'taken@example.com') found.email = ADDRESS_TAKEN
        if (team.length > 0 && team.length < 3) found.team = SHORT

        setErrors(found)
        setSubmitted(Object.keys(found).length === 0 ? 'The account was created.' : null)
      }}
    >
      <FormField name="email">
        <FormLabel>Email</FormLabel>
        <FormControl type="email" required placeholder="taken@example.com to see the error" />
        <FormDescription>We never share it.</FormDescription>
        <FormError action={<>Already have an account?</>} />
      </FormField>

      <FormField name="team" validate={(value) => (typeof value === 'string' && value.length < 3 && value !== '' ? SHORT : null)}>
        <FormLabel>Team</FormLabel>
        <FormControl required />
        <FormError />
      </FormField>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="bg-primary text-primary-foreground inline-flex h-9 items-center rounded-md px-4 text-sm font-medium"
        >
          Create the account
        </button>
        {submitted === null ? null : (
          <span role="status" className="text-muted-foreground text-sm">
            {submitted}
          </span>
        )}
      </div>
    </Form>
  )
}
