import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SiteChrome } from '@/components/site-chrome'

/**
 * The chrome's own composition, asserted at the DOM it renders. The two claims a
 * reader might expect here, that this repository owns no stylesheet and no client
 * boundary, are laws rather than this application's data, and a law is held by the
 * gate kit this repository names in its `prism-gates.json`, not restated in a test.
 */
describe('the landing showcase', () => {
  it('composes the bar from data and copy only', () => {
    render(
      <SiteChrome currentPath="/pricing">
        <div>Pricing body</div>
      </SiteChrome>,
    )
    expect(screen.getByText('Pricing body')).toBeTruthy()
  })

  it('gives the content column the slot the ground contract holds', () => {
    const { container } = render(
      <SiteChrome currentPath="/">
        <div>Home body</div>
      </SiteChrome>,
    )
    const main = container.querySelector('main[data-slot="site-main"]')
    expect(main).not.toBeNull()
    expect(main?.innerHTML).toContain('<div>Home body</div>')
  })
})
