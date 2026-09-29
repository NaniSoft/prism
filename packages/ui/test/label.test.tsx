import { render, screen } from '@testing-library/react'
import axe from 'axe-core'
import { describe, expect, it } from 'vitest'

import { Input } from '../src/components/ui/input'
import { Label } from '../src/components/ui/label'

/**
 * The accessible name of a control, on its own.
 *
 * The claims under test are the ones a screenshot cannot hold. The mark that shows
 * a field is required is decoration and is not announced, because the control's own
 * `required` is what is announced and a glyph read as part of the name is a name
 * with a decoration on the end of it. The mark is also the caller's, because the
 * convention is the reader's. And the label dims with a control that is
 * unavailable, because a label at full strength over a greyed field reads as a
 * field that has merely been styled.
 */
const label = (container: HTMLElement) =>
  container.querySelector<HTMLElement>('[data-slot="label"]')

describe('Label', () => {
  it('names the control it points at, so the name is attached rather than adjacent', () => {
    render(
      <>
        <Label htmlFor="email">Email</Label>
        <Input id="email" />
      </>,
    )
    // Adjacent text is not a name: it is read by nobody when the reader tabs to the
    // control. Asserting that the text is present would pass on a label with no
    // `for`, which is a caption.
    expect(screen.getByLabelText('Email')).toBe(screen.getByRole('textbox'))
  })

  it('carries no association of its own when nothing points a control at it', () => {
    const { container } = render(<Label>Not for a control</Label>)
    // A label with no `for` is a caption, and it must not be mistaken for a name.
    expect(label(container)?.getAttribute('for')).toBeNull()
    expect(screen.queryByRole('textbox')).toBeNull()
  })

  it('draws a required mark that is not announced, because the control is what is', () => {
    const { container } = render(
      <>
        <Label htmlFor="email" required>
          Email
        </Label>
        <Input id="email" required />
      </>,
    )
    const mark = container.querySelector('[data-slot="label-required"]')
    expect(mark).toBeTruthy()
    expect(mark?.getAttribute('aria-hidden')).toBe('true')
    // The name a reader hears is the name, not the name plus a glyph.
    expect(screen.getByRole('textbox')).toHaveAccessibleName('Email')
    // And the form is what enforces it.
    expect(screen.getByRole('textbox')).toBeRequired()
  })

  it('takes the required mark the caller chose, because the convention is theirs', () => {
    const { container } = render(
      <Label htmlFor="email" required requiredText="(required)">
        Email
      </Label>,
    )
    // An asterisk, a word, a dagger or nothing at all are all conventions, and this
    // package does not get to pick the reader's.
    expect(container.querySelector('[data-slot="label-required"]')?.textContent).toBe(
      '(required)',
    )
    expect(container.textContent).not.toContain('*')
  })

  it('carries no mark at all on a field that is not required', () => {
    const { container } = render(<Label htmlFor="email">Email</Label>)
    // Asserting the absence matters as much as the presence: a mark on every field
    // is a mark that means nothing.
    expect(container.querySelector('[data-slot="label-required"]')).toBeNull()
    expect(label(container)?.getAttribute('data-required')).toBeNull()
  })

  it('dims with a control that is unavailable', () => {
    const { container } = render(
      <>
        <Label htmlFor="email" disabled>
          Email
        </Label>
        <Input id="email" disabled />
      </>,
    )
    // A label at full strength over a greyed field reads as a field that has merely
    // been styled, and the two states should not disagree.
    expect(label(container)?.className).toMatch(/text-muted-foreground/)
    expect(label(container)?.getAttribute('data-disabled')).toBe('true')
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('has no accessibility violations when it is on the page', async () => {
    const { container } = render(
      <>
        <Label htmlFor="email" required>
          Email
        </Label>
        <Input id="email" required />
        <Label htmlFor="notes" disabled>
          Notes
        </Label>
        <Input id="notes" disabled />
      </>,
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
