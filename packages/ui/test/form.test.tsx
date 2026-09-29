import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { describe, expect, it, vi } from 'vitest'

import {
  Form,
  FormControl,
  FormDescription,
  FormError,
  FormField,
  FormLabel,
} from '../src/components/ui/form'

/**
 * The form binding: a form, its fields, and the errors that came back from it.
 *
 * The claim under test is the one `Field` deliberately does not make. `Field` is a
 * layout that generates no id, so a form built from it has eleven hand-written ids
 * and eleven hand-written `aria-describedby` links, none visible and all load
 * bearing. So these tests assert that the generated ones resolve: the label reaches
 * the control, the description is announced with it, and a server error lands under
 * the control that caused it, in a live region that carries the recovery with it.
 *
 * The second claim is that the errors clear as data. A form that keeps showing the
 * server's complaint after the reader has fixed the field is a form that cannot be
 * satisfied, and the only way to clear it is to reload the page.
 */
type Props = Partial<Parameters<typeof Form>[0]>

const Signup = ({
  errors,
  onSubmit,
  onInvalidAction,
}: {
  errors?: Props['errors']
  onSubmit?: Props['onSubmit']
  onInvalidAction?: () => void
}) => (
  <Form errors={errors} onSubmit={onSubmit}>
    <FormField name="email">
      <FormLabel>Email</FormLabel>
      <FormControl type="email" required />
      <FormDescription>We never share it.</FormDescription>
      <FormError action={<a href="#change">Change the address</a>}>ignored</FormError>
    </FormField>
    <FormField name="team">
      <FormLabel>Team</FormLabel>
      <FormControl />
      <FormError />
    </FormField>
    <button type="submit">Create the account</button>
    {onInvalidAction === undefined ? null : <span data-slot="never">{String(onInvalidAction())}</span>}
  </Form>
)

const fieldFor = (name: string) =>
  screen.getByRole('textbox', { name }).closest('[data-slot="form-field"]')

/** The alert region of the field whose control is named `name`. */
const alertFor = (name: string) =>
  fieldFor(name)?.querySelector<HTMLElement>('[data-slot="form-error"]')

describe('Form', () => {
  it('generates the ids a layout cannot, so the label names the control', () => {
    render(<Signup />)
    // `Field` leaves the control's id to the caller. Here the label reaches the
    // control without the caller writing an id, which is the whole of what this
    // module adds over the layout.
    expect(screen.getByLabelText('Email')).toBeTruthy()
    expect(screen.getByRole('textbox', { name: 'Email' })).toBeTruthy()
  })

  it('announces the description with the control rather than leaving it on the page', () => {
    render(<Signup />)
    // A description that is only adjacent is read by nobody. Asserting the text is
    // present would pass on a `<p>` with no link to the field at all.
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveAccessibleDescription(
      'We never share it.',
    )
  })

  it('lands a server error under the control that caused it', () => {
    render(<Signup errors={{ email: 'That address is already registered.' }} />)

    const alert = alertFor('Email')
    expect(alert).toHaveTextContent('That address is already registered.')
    expect(alert).toHaveAttribute('role', 'alert')
    // Under the right control: the field's name is the key the error arrived under,
    // so the reader is told about it where they have to fix it rather than in a
    // banner above the form, and the field that did not fail says nothing.
    expect(alertFor('Team')?.textContent).toBe('')
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveAttribute(
      'aria-invalid',
      'true',
    )
    expect(screen.getByRole('textbox', { name: 'Team' })).not.toHaveAttribute('aria-invalid')
  })

  it('puts the recovery in the same announced region as the problem', () => {
    render(<Signup errors={{ email: 'That address is already registered.' }} />)
    // "That address is already registered" with nothing after it is a dead end, and
    // the reader is left to guess whether to sign in instead. The recovery is
    // announced with the problem rather than being something to go and find.
    expect(alertFor('Email')?.textContent).toContain('Change the address')
  })

  it('keeps the alert region in the document while the field is valid', () => {
    render(<Signup />)
    // A live region inserted at the same moment as its content is not announced by
    // every screen reader. The region is therefore present and empty, and the price
    // of that is one empty node per field.
    expect(alertFor('Email')).toBeTruthy()
    expect(alertFor('Email')?.textContent).toBe('')
    expect(screen.getByRole('textbox', { name: 'Email' })).not.toHaveAttribute('aria-invalid')
  })

  it('clears the errors when the record clears, without anything being reloaded', () => {
    const { rerender } = render(
      <Signup errors={{ email: 'That address is already registered.' }} />,
    )
    expect(alertFor('Email')).toHaveTextContent('That address is already registered.')

    rerender(<Signup errors={{}} />)
    // A form that keeps showing the server's complaint after the reader has fixed
    // the field is a form that cannot be satisfied. The recovery goes with it, so
    // there is no invitation to change an address that no longer needs changing.
    expect(alertFor('Email')?.textContent).toBe('')
    expect(screen.getByRole('textbox', { name: 'Email' })).not.toHaveAttribute('aria-invalid')
  })

  it('reports a field rule the caller supplied, in the caller own words', async () => {
    const user = userEvent.setup()
    render(
      <Form>
        <FormField
          name="team"
          validate={(value) => (typeof value === 'string' && value.length > 0 ? null : 'Name the team.')}
        >
          <FormLabel>Team</FormLabel>
          <FormControl />
          <FormError />
        </FormField>
        <button type="submit">Create the account</button>
      </Form>,
    )

    await user.click(screen.getByRole('button', { name: 'Create the account' }))
    // The sentence is the caller's, because it is a sentence about their product's
    // rules and this package does not know what any of them are.
    expect(screen.getByRole('alert')).toHaveTextContent('Name the team.')
  })

  it('submits the field values as data, without navigating', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<Signup onSubmit={onSubmit} />)

    await user.type(screen.getByRole('textbox', { name: 'Email' }), 'a@example.com')
    await user.click(screen.getByRole('button', { name: 'Create the account' }))

    // A server action goes here, and nothing goes to the browser unless the caller
    // sends it.
    expect(onSubmit).toHaveBeenCalledTimes(1)
    const values = onSubmit.mock.calls[0]?.[0] as Record<string, unknown>
    expect(values.email).toBe('a@example.com')
  })

  it('does not submit a required field the reader left empty', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<Signup onSubmit={onSubmit} />)

    await user.click(screen.getByRole('button', { name: 'Create the account' }))
    // The binding reports validity on the field rather than in a bubble over it, so
    // it has to be the thing that stops the submission too.
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('has no accessibility violations with a server error on the page', async () => {
    const { container } = render(
      <Signup errors={{ email: 'That address is already registered.' }} />,
    )
    const results = await axe.run(container, {
      rules: {
        'color-contrast': { enabled: false },
        region: { enabled: false },
      },
    })
    expect(results.violations).toEqual([])
  })

  it('has no accessibility violations while the form is clean', async () => {
    const { container } = render(<Signup />)
    const results = await axe.run(container, {
      rules: {
        'color-contrast': { enabled: false },
        region: { enabled: false },
      },
    })
    expect(results.violations).toEqual([])
  })
})
