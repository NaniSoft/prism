import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Separator } from './separator'

describe('Separator', () => {
  it('is hidden from assistive technology when decorative', () => {
    render(<Separator />)
    expect(screen.queryByRole('separator')).not.toBeInTheDocument()
  })

  it('exposes an ARIA separator with its orientation when it carries meaning', () => {
    render(<Separator decorative={false} orientation="vertical" />)
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical')
  })
})
