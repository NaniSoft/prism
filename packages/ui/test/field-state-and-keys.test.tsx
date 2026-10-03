/**
 * State and event handling: what a control says about itself and which keys it takes.
 *
 * Four findings, and they share one shape: each was correct in isolation and wrong in
 * composition. A `Carousel` whose key handler sat on its region ate the arrow keys of
 * a field inside a slide. A `NumberField` drew a unit and hid it while documenting a
 * route to describe it that the props did not carry. A `Button` inherited the HTML
 * default of `submit` and sat in whatever form a consumer put it in. And
 * `AuthForm01` marked every field invalid whenever the form had an error, so a
 * correctly filled field was announced wrong.
 *
 * **What jsdom can hold here.** All four are about attributes and about which
 * handler answers a key, and both of those are in the DOM. The arrow test fires a
 * real key at a real input and reads which region moved, which is the whole of the
 * carousel finding.
 *
 * **What jsdom cannot hold.** There is no accessibility tree, so `aria-invalid` here
 * proves the attribute is present and not that a reader hears "invalid" before the
 * field's name. There is no CSS engine either, so nothing in this file says anything
 * about what any of it looks like. The `Button` assertion is the sharpest limit: it
 * holds the attribute, and a real submit is a browser behaviour on a real form.
 */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { AuthForm01 } from '../src/blocks/auth-form-01/auth-form'
import { SettingsNotifications01 } from '../src/blocks/settings-notifications-01/settings-notifications'
import { Button } from '../src/components/ui/button'
import { Carousel, type CarouselSlide } from '../src/components/ui/carousel'
import { NumberField } from '../src/components/ui/number-field'

const position = (index: number, total: number) => `Slide ${index} of ${total}`

/**
 * The caption field sits in the FIRST slide on purpose. A carousel hides the slides
 * it is not showing from assistive technology, so a field in slide two is inside an
 * `aria-hidden` subtree and no role query can reach it. The finding is about the key
 * bubbling out of a field, and the first slide is where a reader meets one.
 */
const SLIDES: CarouselSlide[] = [
  { id: 'a', label: 'The first slide', children: <input aria-label="Slide caption" /> },
  { id: 'b', label: 'The second slide', children: <p>Second</p> },
  { id: 'c', label: 'The third slide', children: <p>Third</p> },
]

describe('the Carousel', () => {
  it('moves with the arrow keys when one of its own controls has the key', async () => {
    const user = userEvent.setup()
    render(<Carousel label="Gallery" slides={SLIDES} position={position} />)

    // Focus arrives by Tab, on the enabled control, which is the case that happens.
    await user.tab()
    await user.tab()
    await user.keyboard('{ArrowRight}')

    expect(screen.getByText('Slide 2 of 3')).toBeTruthy()
  })

  it('leaves the arrow keys to a field inside a slide', async () => {
    const user = userEvent.setup()
    render(<Carousel label="Gallery" slides={SLIDES} position={position} />)

    const field = screen.getByRole('textbox', { name: 'Slide caption' })
    await user.click(field)
    await user.keyboard('ab{ArrowRight}')

    // The caret moved and the carousel did not. The handler sits on the region, so
    // every key inside a slide reached it, and it called `preventDefault()`
    // unconditionally, which is what stopped the caret moving in a real browser.
    expect(field).toHaveValue('ab')
    expect(screen.getByText('Slide 1 of 3')).toBeTruthy()
  })

  it('leaves Home and End to a field as well, because they are the value own keys', async () => {
    const user = userEvent.setup()
    render(<Carousel label="Gallery" slides={SLIDES} position={position} />)

    const field = screen.getByRole('textbox', { name: 'Slide caption' })
    await user.click(field)
    await user.keyboard('abc{Home}{End}')

    expect(field).toHaveValue('abc')
    expect(screen.getByText('Slide 1 of 3')).toBeTruthy()
  })
})

describe('the Number field', () => {
  it('carries the caller own description, which is the only route to the unit', () => {
    const { container } = render(
      <>
        <p id="weight-help">Enter the parcel weight in kilograms</p>
        <NumberField
          labels={{ increment: 'More', decrement: 'Less' }}
          aria-label="Parcel weight"
          aria-describedby="weight-help"
          unit="kg"
        />
      </>,
    )

    const input = container.querySelector('[data-slot="number-field-input"]')
    expect(input?.getAttribute('aria-describedby')).toBe('weight-help')
    // The drawn unit stays hidden, because a reference already says it once and two
    // announcements of the same word is one too many.
    const unit = container.querySelector('[data-slot="number-field-unit"]')
    expect(unit?.getAttribute('aria-hidden')).toBe('true')
  })

  it('writes no description when the caller passes none', () => {
    const { container } = render(
      <NumberField labels={{ increment: 'More', decrement: 'Less' }} aria-label="Delay" unit="ms" />,
    )
    const input = container.querySelector('[data-slot="number-field-input"]')
    expect(input?.hasAttribute('aria-describedby')).toBe(false)
  })
})

describe('the Button', () => {
  it('is type="button" unless the caller says otherwise', () => {
    render(<Button>Cancel</Button>)
    // The HTML default for a button with no type is submit, so a Prism Button in a
    // consumer form submitted it. This is the attribute, not a form round trip; the
    // round trip is the browser's and is not in this lane.
    expect(screen.getByRole('button', { name: 'Cancel' }).getAttribute('type')).toBe('button')
  })

  it('still submits when a caller asks it to', () => {
    render(<Button type="submit">Save</Button>)
    expect(screen.getByRole('button', { name: 'Save' }).getAttribute('type')).toBe('submit')
  })
})

const AUTH_FIELDS = [
  { id: 'email', label: 'Email', type: 'email' as const, description: 'Work address' },
  { id: 'password', label: 'Password', type: 'password' as const },
]

describe('the Auth form', () => {
  it('marks no field at all when the caller has not said which one the error is about', () => {
    render(
      <AuthForm01
        title="Sign in"
        submitLabel="Sign in"
        error="Those credentials do not match"
        fields={AUTH_FIELDS}
      />,
    )

    // Bad credentials, a locked account and a rate limit are all things no field is
    // wrong about, so the message is in an Alert that announces itself and no control
    // claims to be invalid. Before the fix both fields carried `aria-invalid`.
    for (const name of ['Email', 'Password']) {
      expect(screen.getByLabelText(name).hasAttribute('aria-invalid')).toBe(false)
    }
  })

  it('marks only the field the caller named', () => {
    render(
      <AuthForm01
        title="Sign in"
        submitLabel="Sign in"
        error="Enter an email address"
        fields={AUTH_FIELDS.map((field) => ({
          ...field,
          errorId: field.id === 'email' ? 'email' : undefined,
        }))}
      />,
    )

    expect(screen.getByLabelText('Email').getAttribute('aria-invalid')).toBe('true')
    // And the correctly filled one is not announced invalid, which was the finding.
    expect(screen.getByLabelText('Password').hasAttribute('aria-invalid')).toBe(false)
  })

  it('points each field at its own description', () => {
    render(<AuthForm01 title="Sign in" submitLabel="Sign in" fields={AUTH_FIELDS} />)

    const email = screen.getByLabelText('Email')
    const describedBy = email.getAttribute('aria-describedby')
    expect(describedBy).not.toBeNull()
    expect(document.getElementById(describedBy as string)?.textContent).toBe('Work address')
    // The field with no description writes no reference, rather than an empty one.
    expect(screen.getByLabelText('Password').hasAttribute('aria-describedby')).toBe(false)
  })
})

describe('the Settings notifications block', () => {
  it('describes a switch by its own description as well as by the section note', () => {
    const { container } = render(
      <SettingsNotifications01
        title="Notifications"
        channels={[
          {
            id: 'email',
            name: 'Email',
            events: [
              {
                id: 'deploy',
                label: 'Deploy finished',
                on: true,
                description: 'When a deploy completes',
              },
            ],
          },
        ]}
        onToggle={vi.fn()}
        updateLabel={(_channel, event, on) => `${on ? 'Turn on' : 'Turn off'} ${event.label}`}
        empty="No channels"
      />,
    )

    const control = container.querySelector('[role="switch"]')
    const describedBy = control?.getAttribute('aria-describedby')
    // The description was drawn under the label and never announced, because it
    // carried no id and the switch pointed at nothing.
    expect(describedBy).not.toBeNull()
    expect(describedBy?.split(' ')).toHaveLength(1)
    expect(document.getElementById(describedBy as string)?.textContent).toBe('When a deploy completes')
  })

  it('carries both the description and the note on a read-only control', () => {
    const { container } = render(
      <SettingsNotifications01
        title="Notifications"
        channels={[
          {
            id: 'email',
            name: 'Email',
            events: [
              {
                id: 'password',
                label: 'Password resets',
                on: true,
                required: true,
                requiredLabel: 'Always on',
                description: 'When a reader resets their password',
              },
            ],
          },
        ]}
        disabledLabel="Your workspace cannot run without these"
        empty="No channels"
      />,
    )

    const control = container.querySelector('[role="switch"]')
    const parts = (control?.getAttribute('aria-describedby') ?? '').split(' ')
    expect(parts).toHaveLength(2)
    expect(parts.map((part) => document.getElementById(part)?.textContent)).toEqual([
      'When a reader resets their password',
      'Your workspace cannot run without these',
    ])
  })
})
