import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { AppChrome } from '@/components/app-chrome'

/**
 * The shell's own composition, asserted at the DOM it renders. The two claims a
 * reader might expect here, that this repository owns no stylesheet and no client
 * boundary, are laws rather than this application's data, and a law is held by the
 * gate kit this repository names in its `prism-gates.json`, not restated in a test.
 */
describe('the console showcase', () => {
  it('composes the shell from data and copy only', () => {
    render(
      <AppChrome currentPath="/orders" trail="Orders">
        <div>Orders body</div>
      </AppChrome>,
    )
    expect(screen.getByText('Orders body')).toBeTruthy()
  })

  it('wears the wash at its quiet intensity behind the working surface', () => {
    const { container } = render(
      <AppChrome currentPath="/" trail="Overview">
        <div>Overview body</div>
      </AppChrome>,
    )
    // The wash is the package's own Component carrying its planes on veil steps;
    // this application's decision is the quiet intensity and the isolated wrapper,
    // and both are visible in the DOM the chrome renders.
    const wash = container.querySelector('[data-slot="aurora-wash"]')
    expect(wash).not.toBeNull()
    const planes = container.querySelectorAll('[data-slot="aurora-wash-plane"]')
    expect(planes.length).toBe(3)
    expect(planes[0].className).toContain('bg-primary/(--veil-soft)')
  })
})
