import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Kbd } from './kbd'

describe('Kbd', () => {
  it('renders a keyboard-key element with its label', () => {
    render(<Kbd>Ctrl</Kbd>)
    const key = screen.getByText('Ctrl')
    expect(key.tagName).toBe('KBD')
  })
})
