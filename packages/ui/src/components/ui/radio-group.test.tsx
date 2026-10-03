import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { RadioGroup, RadioGroupItem } from './radio-group'

function Example() {
  return (
    <RadioGroup aria-label="Plan" defaultValue="basic">
      <RadioGroupItem value="basic" aria-label="Basic" />
      <RadioGroupItem value="pro" aria-label="Pro" />
    </RadioGroup>
  )
}

describe('RadioGroup', () => {
  it('selects one item and moves the selection on click', async () => {
    render(<Example />)
    expect(screen.getByRole('radio', { name: 'Basic' })).toBeChecked()
    await userEvent.click(screen.getByRole('radio', { name: 'Pro' }))
    expect(screen.getByRole('radio', { name: 'Pro' })).toBeChecked()
  })

  it('moves the selection with the arrow keys', async () => {
    render(<Example />)
    screen.getByRole('radio', { name: 'Basic' }).focus()
    await userEvent.keyboard('{ArrowDown}')
    expect(screen.getByRole('radio', { name: 'Pro' })).toBeChecked()
  })

  it('keeps the coarse-pointer 44px target in the class contract', () => {
    render(<Example />)
    const className = screen.getByRole('radio', { name: 'Basic' }).className
    // The floor, as a step rather than a band: a band's fourteen pixels reach the
    // next item in a stacked group, where a step moves the group instead.
    expect(className).toContain('pointer-coarse:')
    expect(className).toContain('pointer-coarse:size-11')
    // And the desktop item is untouched.
    expect(className).toContain('size-4')
  })
})
