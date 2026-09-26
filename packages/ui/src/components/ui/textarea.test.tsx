import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { Textarea } from './textarea'

describe('Textarea', () => {
  it('is a textbox that accepts multi-line text', async () => {
    render(<Textarea aria-label="Notes" />)
    const textarea = screen.getByRole('textbox', { name: 'Notes' })
    await userEvent.type(textarea, 'first line')
    expect(textarea).toHaveValue('first line')
  })
})
