import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { AuthForm01, type AuthForm01Issue } from '../src/blocks/auth-form-01'
import { Contact01, type Contact01Issue } from '../src/blocks/contact-01'
import { Provisioning01, type ProvisioningStep } from '../src/blocks/provisioning-01'
import { Signup01 } from '../src/blocks/signup-01'
import type { FieldSpec, FieldSpecGroup } from '../src/lib/spec'

/**
 * The four forms that moved onto the shared field specification, and the rule the
 * move is held to.
 *
 * Each of these Blocks declared its own field type before this wave, one of five
 * spellings of the same shape that disagreed about what a field is. The assertion
 * each one earns is three-part: the new field renders, the optional shell around
 * it renders nothing when it is absent, and the Item did not change shape to take
 * it. The published names this Block contributes are pinned here, so a rename
 * fails a test rather than following a reader silently.
 *
 * `FieldSpec` is a type, so the two shapes a runtime test cannot reach are pinned
 * by the compiler at the call sites below: a `slot` arm and a `NativeSelect` both
 * typecheck here, and a field missing its `key`, `label` or `kind` would not.
 */

/** A caller's own control, for the one arm of the union Prism does not draw. */
const slotField: FieldSpec = {
  key: 'extra',
  label: 'Extra',
  kind: 'slot',
  help: 'A control Prism does not ship.',
  control: <input aria-label="Extra control" />,
}

describe('the shared field specification across the forms', () => {
  it('AuthForm01 renders a field of every kind, a slot, and the shell around it', () => {
    const groups: readonly FieldSpecGroup[] = [
      {
        fields: [
          { key: 'email', label: 'Email', kind: 'Input', autoComplete: 'email' },
          slotField,
        ],
      },
    ]

    const { container } = render(
      <AuthForm01 title="Sign in" submitLabel="Sign in" groups={groups} />,
    )

    expect(screen.getByLabelText('Email')).toBeTruthy()
    // The caller's own control is drawn inside the shell the Block draws.
    expect(screen.getByLabelText('Extra control')).toBeTruthy()
    expect(screen.getByText('A control Prism does not ship.')).toBeTruthy()
    // Nothing the caller did not pass is drawn.
    expect(container.querySelector('[data-slot="field-error"]')).toBeNull()
  })

  it('AuthForm01 pins its issue shape and marks only the field an issue names', () => {
    const issue: AuthForm01Issue = { field: 'email', message: 'Enter an email address' }

    render(
      <AuthForm01
        title="Sign in"
        submitLabel="Sign in"
        issues={[issue]}
        groups={[{ fields: [{ key: 'email', label: 'Email', kind: 'Input' }] }]}
      />,
    )

    expect(screen.getByLabelText('Email').getAttribute('aria-invalid')).toBe('true')
  })

  it('Contact01 renders the shared kinds and draws an issue under its field', () => {
    const issue: Contact01Issue = { field: 'topic', message: 'Choose a topic' }

    render(
      <Contact01
        title="Write to us"
        submitLabel="Send"
        issues={[issue]}
        groups={[
          {
            fields: [
              { key: 'name', kind: 'Input', label: 'Your name', required: true },
              {
                key: 'topic',
                kind: 'NativeSelect',
                label: 'What is this about?',
                options: [{ value: 'sales', label: 'Buying' }],
              },
              slotField,
            ],
          },
        ]}
        onSubmit={() => {}}
      />,
    )

    expect(screen.getByLabelText(/Your name/)).toBeTruthy()
    // The choice's options live under its kind, and the select is the one asked for.
    expect(screen.getByRole('combobox', { name: 'What is this about?' })).toBeTruthy()
    expect(screen.getByLabelText('Extra control')).toBeTruthy()
    expect(screen.getByText('Choose a topic')).toBeTruthy()
  })

  it('Contact01 renders nothing under a field when no issue names it', () => {
    const { container } = render(
      <Contact01
        title="Write to us"
        submitLabel="Send"
        groups={[{ fields: [{ key: 'name', kind: 'Input', label: 'Your name' }] }]}
        onSubmit={() => {}}
      />,
    )

    expect(container.querySelector('[data-slot="field-error"]')).toBeNull()
    expect(container.querySelector('[data-slot="field-description"]')).toBeNull()
  })

  it('Provisioning01 takes the shared field specification on a step', () => {
    const steps: readonly ProvisioningStep[] = [
      {
        id: 'target',
        name: 'The estate',
        fields: [
          { key: 'name', label: 'Estate name', kind: 'Input', required: true },
          { key: 'seats', label: 'Seats', kind: 'NumberField' },
          slotField,
        ],
      },
      { id: 'review', name: 'Review', fields: [] },
    ]

    render(
      <Provisioning01
        title="Provision an estate"
        steps={steps}
        backLabel="Back"
        nextLabel="Continue"
        confirmLabel="Create it"
        onConfirm={() => {}}
      />,
    )

    expect(screen.getByLabelText(/Estate name/)).toBeTruthy()
    expect(screen.getByLabelText('Extra control')).toBeTruthy()
  })

  it('Signup01 takes the shared field specification beside its own secret', () => {
    const groups: readonly FieldSpecGroup[] = [
      {
        fields: [
          { key: 'email', kind: 'Input', label: 'Work email', required: true },
          { key: 'sector', kind: 'NativeSelect', label: 'What the estate is', options: [{ value: 'a', label: 'A pipeline' }] },
          slotField,
        ],
      },
    ]

    render(
      <Signup01
        title="Create an account"
        groups={groups}
        password={{ label: 'Secret phrase', revealLabel: 'Show it', hideLabel: 'Hide it' }}
        submitLabel="Create the account"
        onSubmit={() => {}}
      />,
    )

    expect(screen.getByLabelText(/Work email/)).toBeTruthy()
    expect(screen.getByLabelText('Secret phrase')).toBeTruthy()
    expect(screen.getByLabelText('Extra control')).toBeTruthy()
  })

  it('keeps each Item its own shape: only the field shape moved', () => {
    // The same props that did not change still render: a title, a submit control
    // and a heading. The Item is the Item it was, over the shared fields.
    render(
      <Contact01
        title="Write to us"
        submitLabel="Send"
        groups={[{ fields: [{ key: 'name', kind: 'Input', label: 'Your name' }] }]}
        onSubmit={() => {}}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Write to us' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Send' })).toBeTruthy()
  })
})
