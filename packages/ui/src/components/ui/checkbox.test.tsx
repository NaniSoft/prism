import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { Checkbox } from './checkbox'

describe('Checkbox', () => {
  it('toggles on click', async () => {
    render(<Checkbox aria-label="Accept terms" />)
    const box = screen.getByRole('checkbox', { name: 'Accept terms' })
    await userEvent.click(box)
    expect(box).toBeChecked()
  })

  it('toggles with the Space key', async () => {
    render(<Checkbox aria-label="Accept terms" />)
    const box = screen.getByRole('checkbox', { name: 'Accept terms' })
    box.focus()
    await userEvent.keyboard(' ')
    expect(box).toBeChecked()
  })

  it('announces the mixed state', () => {
    render(<Checkbox aria-label="Select all" indeterminate />)
    expect(screen.getByRole('checkbox', { name: 'Select all' })).toHaveAttribute(
      'aria-checked',
      'mixed',
    )
  })

  it('keeps the coarse-pointer 44px target in the class contract', () => {
    render(<Checkbox aria-label="Accept terms" />)
    const className = screen.getByRole('checkbox', { name: 'Accept terms' }).className
    // The floor, as a step rather than a band, so the row grows with the box and
    // nothing within a band of the control is swallowed. See `todo-01`, whose rows
    // are stacked against a shared border.
    expect(className).toContain('pointer-coarse:')
    expect(className).toContain('pointer-coarse:size-11')
    // And the desktop box is untouched: a form checkbox is a document control, and
    // a 44px square in a column of fields is not one.
    expect(className).toContain('size-4')
  })
})
