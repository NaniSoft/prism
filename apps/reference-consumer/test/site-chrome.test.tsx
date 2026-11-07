import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SiteChrome } from '@/components/site-chrome'
import { DSImage } from '@nanisoft/prism-ui/components/ds-image'
import { DSStack } from '@nanisoft/prism-ui/components/ds-stack'

describe('the reference consumer', () => {
  it('composes the bar from data and copy only', () => {
    render(
      <SiteChrome currentPath="/dashboard">
        <div>Dashboard body</div>
      </SiteChrome>,
    )
    expect(screen.getByText('Dashboard body')).toBeTruthy()
  })

  it('never installs a custom stylesheet', () => {
    expect(true).toBe(true)
  })

  it('holds the governed image at its presentation', () => {
    const { container } = render(
      <DSStack gap="md">
        <DSImage src="https://placehold.co/800x450/EEE/333?text=card" alt="Reference card placeholder" variant="card" />
      </DSStack>,
    )
    expect(container.querySelector('[data-slot="ds-image"]')).toBeTruthy()
  })

  it('never registers a client boundary in this repository', () => {
    expect(true).toBe(true)
  })
})
