import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { describe, expect, it, vi } from 'vitest'

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '../src/components/ui/input-group'

/**
 * Related controls drawn as one field.
 *
 * The claims under test are the ones a screenshot cannot hold: that the control in
 * the middle has no border of its own, so the group is one field rather than three
 * boxes; that the frame answers the focus and the control keeps a full-strength
 * ring, so there is one indicator and it is drawn on the thing being operated; and
 * that an addon drops only the edge it shares with the control, so a joined field
 * has no seam down the middle of it.
 */
const withAddons = (
  <InputGroup>
    <InputGroupAddon position="prefix">kg</InputGroupAddon>
    <InputGroupInput aria-label="Weight" />
    <InputGroupButton aria-label="Clear the weight">x</InputGroupButton>
  </InputGroup>
)

describe('InputGroup', () => {
  it('draws one border, on the group, and not a second one inside it', () => {
    const { container } = render(withAddons)
    const group = container.querySelector<HTMLElement>('[data-slot="input-group"]')
    const control = container.querySelector<HTMLElement>('[data-slot="input-group-input"]')

    expect(group?.className).toMatch(/border\b/)
    // A bordered control inside a bordered group draws a border inside a border, and
    // the two lines are a seam down the middle of one field.
    expect(control?.className).toMatch(/border-0/)
    expect(control?.className).toMatch(/shadow-none/)
  })

  it('answers the focus on the frame and leaves the ring on the control', () => {
    const { container } = render(withAddons)
    const group = container.querySelector<HTMLElement>('[data-slot="input-group"]')
    const control = container.querySelector<HTMLElement>('[data-slot="input-group-input"]')

    // The frame is a div: it is never focused and it has nothing to ring. It turns
    // its border to the ring token when anything inside it has focus.
    expect(group?.className).toMatch(/focus-within:border-ring/)
    // The control is the element that actually has focus, so it keeps `Input`'s own
    // ring, at full strength rather than at the half alpha that fails 3:1.
    expect(control?.className).toMatch(/focus-visible:ring-\[3px\]/)
  })

  it('keeps the control focusable and the addons out of the tab order', async () => {
    const user = userEvent.setup()
    render(withAddons)
    const control = screen.getByRole('textbox', { name: 'Weight' })

    await user.click(control)
    expect(document.activeElement).toBe(control)

    // The addon is not a control. A reader tabbing through the form steps over the
    // symbol and lands on the number, not on the symbol.
    const addon = document.querySelector('[data-slot="input-group-addon"]')
    expect(addon?.tagName).toBe('DIV')
    expect(addon?.getAttribute('tabindex')).toBeNull()
  })

  it('drops only the edge an addon shares with the control', () => {
    const { container } = render(withAddons)
    const prefix = container.querySelector<HTMLElement>(
      '[data-slot="input-group-addon"][data-position="prefix"]',
    )
    const suffix = container.querySelector<HTMLElement>(
      '[data-slot="input-group-button"][data-position="suffix"]',
    )

    // Two borders on the same line read as a seam. The outer edge is kept because
    // the group's own border does not reach the corner the addon rounds.
    expect(prefix?.className).toMatch(/border-e-0/)
    expect(prefix?.className).not.toMatch(/border-s-0/)
    expect(suffix?.className).toMatch(/border-s-0/)
    expect(suffix?.className).not.toMatch(/border-e-0/)
  })

  it('runs an operable part as a real button that takes its name from the caller', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <InputGroup>
        <InputGroupInput aria-label="Search" />
        <InputGroupButton aria-label="Clear the search" onClick={onClick} />
      </InputGroup>,
    )
    const button = screen.getByRole('button', { name: 'Clear the search' })

    await user.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
    // The words are a prop because a Component that chose them would ship English
    // into every consumer's product, and an icon-only part with no name is a
    // control no screen reader can announce.
    expect(button.className).toMatch(/focus-visible:ring-\[3px\]/)
  })

  it('does not submit the form when an operable part is pressed', async () => {
    const user = userEvent.setup()
    render(
      <form>
        <InputGroup>
          <InputGroupInput aria-label="Search" />
          <InputGroupButton aria-label="Clear the search" />
        </InputGroup>
      </form>,
    )
    await user.click(screen.getByRole('button', { name: 'Clear the search' }))
    // An operable part inside a field is a button and says so, or a reader who
    // activates it submits the form they were only editing.
    expect(screen.getByRole('button', { name: 'Clear the search' }).getAttribute('type')).toBe(
      'button',
    )
  })

  it('dims the whole field when the control inside it is disabled', () => {
    const { container } = render(
      <InputGroup>
        <InputGroupAddon position="prefix">kg</InputGroupAddon>
        <InputGroupInput aria-label="Weight" disabled />
      </InputGroup>,
    )
    const group = container.querySelector<HTMLElement>('[data-slot="input-group"]')
    // The frame cannot be disabled itself: a `div` cannot take the attribute, and
    // setting it would disable a control the reader never touched. It watches the
    // control instead, so a disabled control dims the field it belongs to.
    expect(group?.className).toMatch(/has-\[input:disabled\]:opacity-50/)
    expect(screen.getByRole('textbox', { name: 'Weight' })).toBeDisabled()
  })

  it('renders an empty field as an empty control, with nothing to announce', () => {
    const { container } = render(
      <InputGroup>
        <InputGroupInput aria-label="Weight" value="" onChange={() => {}} />
      </InputGroup>,
    )
    const control = container.querySelector<HTMLInputElement>('[data-slot="input-group-input"]')
    expect(control?.value).toBe('')
    expect(container.querySelector('[data-slot="input-group-addon"]')).toBeNull()
  })

  it('has no accessibility violations when it is on the page', async () => {
    const { container } = render(withAddons)
    const results = await axe.run(container, {
      rules: {
        'color-contrast': { enabled: false },
        region: { enabled: false },
      },
    })
    expect(results.violations).toEqual([])
  })
})
