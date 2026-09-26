import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { Input } from './input'

describe('Input', () => {
  it('is a textbox that accepts typed text', async () => {
    render(<Input aria-label="Search" />)
    const input = screen.getByRole('textbox', { name: 'Search' })
    await userEvent.type(input, 'tokens')
    expect(input).toHaveValue('tokens')
  })

  it('marks a rejected value through aria-invalid', () => {
    render(<Input aria-label="Email" aria-invalid />)
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveAttribute('aria-invalid', 'true')
  })
})
