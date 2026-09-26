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
})
