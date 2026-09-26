import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from './field'
import { Input } from './input'

describe('Field', () => {
  it('attaches the label to the control and the description to it', () => {
    render(
      <Field>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <Input id="email" aria-describedby="email-help" />
        <FieldDescription id="email-help">We never share it.</FieldDescription>
      </Field>,
    )
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveAccessibleDescription('We never share it.')
  })

  it('announces an error message when the field is invalid', () => {
    render(<FieldError>Enter a valid address.</FieldError>)
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid address.')
  })

  it('groups related fields as a named group', () => {
    render(
      <FieldGroup aria-label="Billing address">
        <Field>
          <FieldLabel htmlFor="city">City</FieldLabel>
          <Input id="city" />
        </Field>
      </FieldGroup>,
    )
    expect(screen.getByRole('group', { name: 'Billing address' })).toBeInTheDocument()
  })
})
