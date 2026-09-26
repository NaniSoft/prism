import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { Switch } from './switch'

describe('Switch', () => {
  it('toggles on click', async () => {
    render(<Switch aria-label="Notifications" />)
    const control = screen.getByRole('switch', { name: 'Notifications' })
    await userEvent.click(control)
    expect(control).toBeChecked()
  })

  it('toggles with the Space key', async () => {
    render(<Switch aria-label="Notifications" />)
    const control = screen.getByRole('switch', { name: 'Notifications' })
    control.focus()
    await userEvent.keyboard(' ')
    expect(control).toBeChecked()
  })
})
