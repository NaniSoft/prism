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
})
