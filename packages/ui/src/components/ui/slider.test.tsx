import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { Slider } from './slider'

describe('Slider', () => {
  it('exposes its value through ARIA', () => {
    render(<Slider defaultValue={20} aria-label="Volume" />)
    expect(screen.getByRole('slider', { name: 'Volume' })).toHaveAttribute('aria-valuenow', '20')
  })

  it('changes its value with the arrow keys', async () => {
    render(<Slider defaultValue={20} aria-label="Volume" />)
    const thumb = screen.getByRole('slider', { name: 'Volume' })
    thumb.focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(thumb).toHaveAttribute('aria-valuenow', '21')
  })
})
