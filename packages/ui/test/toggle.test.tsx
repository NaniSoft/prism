import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import axe from 'axe-core'

import { Toggle } from '../src/components/ui/toggle'
import { Switch } from '../src/components/ui/switch'
import { Checkbox } from '../src/components/ui/checkbox'

/**
 * A two-state button: it is pressed or it is not.
 *
 * The claims under test are the ones that make this a Toggle and not a Switch, and
 * the ones that a screenshot cannot check. A Toggle carries `aria-pressed` and a
 * Switch carries `aria-checked`; they are different roles with different
 * consequences, and a control that quietly drifts from one to the other tells a
 * screen reader the wrong thing about whether a setting is on. The pressed state
 * has to survive being pressed and unpressed, has to be reported as controlled
 * when the caller owns it, and has to name itself when it has no visible text.
 */
describe('the Toggle', () => {
  it('is a pressed button, which is a different role from a switched control', () => {
    render(<Toggle aria-label="Bold">B</Toggle>)
    const control = screen.getByRole('button', { name: 'Bold' })
    // `aria-pressed` is what makes it a toggle rather than a button that changes
    // colour. A Switch says `aria-checked`, and swapping one for the other is the
    // drift this test exists to catch.
    expect(control).toHaveAttribute('aria-pressed', 'false')
    expect(control).not.toHaveAttribute('aria-checked')
    expect(control.tagName).toBe('BUTTON')
  })

  it('flips its pressed state on activation and reports it', async () => {
    const onPressedChange = vi.fn()
    const user = userEvent.setup()
    render(
      <Toggle aria-label="Bold" onPressedChange={onPressedChange}>
        B
      </Toggle>,
    )
    const control = screen.getByRole('button', { name: 'Bold' })
    await user.click(control)
    expect(control).toHaveAttribute('aria-pressed', 'true')
    expect(onPressedChange).toHaveBeenLastCalledWith(true)
    await user.click(control)
    expect(control).toHaveAttribute('aria-pressed', 'false')
    expect(onPressedChange).toHaveBeenLastCalledWith(false)
  })

  it('starts pressed when the caller says so', () => {
    render(
      <Toggle aria-label="Bold" defaultPressed>
        B
      </Toggle>,
    )
    expect(screen.getByRole('button', { name: 'Bold' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('does not move when the caller owns the state and has not moved it', async () => {
    const onPressedChange = vi.fn()
    const user = userEvent.setup()
    render(
      <Toggle aria-label="Bold" pressed={false} onPressedChange={onPressedChange}>
        B
      </Toggle>,
    )
    const control = screen.getByRole('button', { name: 'Bold' })
    await user.click(control)
    // A controlled control reports the request and waits. Flipping its own
    // attribute anyway is the defect a controlled input has when it keeps a copy
    // of the value, because the caller's state and the rendered state then
    // disagree and the reader sees a setting that is not the one in the model.
    expect(onPressedChange).toHaveBeenCalledWith(true)
    expect(control).toHaveAttribute('aria-pressed', 'false')
  })

  it('takes its name from its own text when the caller passes none', () => {
    render(<Toggle>B</Toggle>)
    // An icon row is three glyphs, so a name is a prop for the caller to pass.
    // A Toggle with visible text takes that text, and this is the one shape where
    // the Component has nothing to ask for.
    expect(screen.getByRole('button', { name: 'B' })).toBeTruthy()
  })

  it('sets its own ink on both state surfaces, so a pressed control is never the wrong one', () => {
    const { container } = render(<Toggle aria-label="Bold">B</Toggle>)
    const classes = container.querySelector('[data-slot="toggle"]')?.className ?? ''
    // The rule a variant map is held to, asserted here because these are state
    // utilities rather than a variant map and the gate does not read them: a
    // pressed surface with an inherited ink is the same control on the page ground
    // and a different one inside a Block, which measured 1.01:1 in lavender dark
    // when a Button's outline variant did it.
    expect(classes).toContain('data-[pressed]:bg-accent')
    expect(classes).toContain('data-[pressed]:text-accent-foreground')
    expect(classes).toContain('hover:bg-accent')
    expect(classes).toContain('hover:text-accent-foreground')
  })

  it('draws its focus ring at full strength', () => {
    const { container } = render(<Toggle aria-label="Bold">B</Toggle>)
    const classes = container.querySelector('[data-slot="toggle"]')?.className ?? ''
    // `outline-none` without this is the silent failure the focus-indicator gate
    // exists for: every token gate still passes, because the alpha is applied in
    // the class rather than in the token.
    expect(classes).toContain('outline-none')
    expect(classes).toContain('focus-visible:ring-ring')
    expect(classes).toContain('focus-visible:ring-[3px]')
    expect(classes).not.toContain('focus-visible:ring-ring/50')
  })

  it('is operable with the keyboard, as a button is', async () => {
    const onPressedChange = vi.fn()
    const user = userEvent.setup()
    render(
      <Toggle aria-label="Bold" onPressedChange={onPressedChange}>
        B
      </Toggle>,
    )
    await user.tab()
    // A Toggle is a native button, so Space and Enter both press it and Tab
    // reaches it, with no key handling of this Component's own to get wrong.
    expect(screen.getByRole('button', { name: 'Bold' })).toHaveFocus()
    await user.keyboard('{ }')
    expect(onPressedChange).toHaveBeenLastCalledWith(true)
  })

  it('ignores interaction when it is disabled', async () => {
    const onPressedChange = vi.fn()
    const user = userEvent.setup()
    render(
      <Toggle aria-label="Bold" disabled onPressedChange={onPressedChange}>
        B
      </Toggle>,
    )
    const control = screen.getByRole('button', { name: 'Bold' })
    await user.click(control)
    expect(onPressedChange).not.toHaveBeenCalled()
    expect(control).toBeDisabled()
  })

  it('is a different role from the Switch and the Checkbox it sits beside', () => {
    render(
      <>
        <Toggle aria-label="Preview changes">Preview</Toggle>
        <Switch aria-label="Live updates" />
        <Checkbox aria-label="Include drafts" />
      </>,
    )
    // The three controls a caller is most often confused about, asserted side by
    // side so the distinction is a fact about the package rather than a sentence
    // in a documentation file. A Switch takes effect at once and says so with
    // `aria-checked`; a Checkbox is a form value that submits; a Toggle is a
    // pressed state the caller holds.
    expect(screen.getByRole('button', { name: 'Preview changes' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    expect(screen.getByRole('switch', { name: 'Live updates' })).toBeTruthy()
    expect(screen.getByRole('checkbox', { name: 'Include drafts' })).toBeTruthy()
    expect(screen.queryByRole('switch', { name: 'Preview changes' })).toBeNull()
  })

  it('has no accessibility violations when it is on the page', async () => {
    const { container } = render(
      <Toggle aria-label="Bold" defaultPressed>
        B
      </Toggle>,
    )
    const results = await axe.run(container, {
      rules: {
        'color-contrast': { enabled: false },
        region: { enabled: false },
      },
    })
    expect(results.violations).toEqual([])
  })
})
