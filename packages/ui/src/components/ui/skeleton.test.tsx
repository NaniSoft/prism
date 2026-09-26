import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Skeleton } from './skeleton'

describe('Skeleton', () => {
  it('is hidden from assistive technology while it stands in for content', () => {
    const { container } = render(<Skeleton />)
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull()
  })
})
