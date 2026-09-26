import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Progress } from './progress'

describe('Progress', () => {
  it('reports its position through ARIA', () => {
    render(<Progress value={40} aria-label="Upload" />)
    expect(screen.getByRole('progressbar', { name: 'Upload' })).toHaveAttribute('aria-valuenow', '40')
  })

  it('omits a value when the task length is unknown', () => {
    render(<Progress value={null} aria-label="Upload" />)
    expect(screen.getByRole('progressbar', { name: 'Upload' })).not.toHaveAttribute('aria-valuenow')
  })
})
