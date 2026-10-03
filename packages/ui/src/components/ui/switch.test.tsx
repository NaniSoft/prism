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

  it('takes the coarse-pointer 44px floor as a band and leaves the pill alone', () => {
    render(<Switch aria-label="Notifications" />)
    const className = screen.getByRole('switch', { name: 'Notifications' }).className
    expect(className).toContain('pointer-coarse:before:h-11')
    expect(className).toContain('pointer-coarse:before:w-11')
    expect(className).toContain('pointer-coarse:before:-translate-x-1/2')
    expect(className).toContain('pointer-coarse:before:-translate-y-1/2')
    // A band and not a step, so the pill is 20 by 36 on every pointer. A step would
    // have had to be 44 square, which is not a switch, or wider, which moves the
    // thumb's `translate-x-4` travel with the box.
    expect(className).not.toMatch(/pointer-coarse:(?:size|h|w|min-w)-/)
    expect(className).toContain('h-5 w-9')
  })
})
