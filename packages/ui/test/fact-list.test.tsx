import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { FactList } from '../src/components/ui/fact-list'

/**
 * A fact list is a description list, so the claims under test are the ones a
 * grid of `div`s would fail: the element is a `dl` with `dt` and `dd` inside it,
 * a value with a destination is an anchor with a real `href`, and a set with no
 * facts renders nothing rather than an empty frame.
 */
describe('a list of named facts', () => {
  it('is a description list, so the term is announced before the value', () => {
    const { container } = render(
      <FactList facts={[{ label: 'Version', value: '0.5.1' }]} label="Release" />,
    )

    const root = container.querySelector('[data-slot="fact-list"]')!
    expect(root.tagName).toBe('DL')
    expect(root.querySelectorAll('dt')).toHaveLength(2)
    expect(root.querySelectorAll('dd')).toHaveLength(1)
    expect(screen.getByText('Version').tagName).toBe('DT')
    expect(screen.getByText('0.5.1').tagName).toBe('DD')
  })

  it('makes a value with a destination a real link', () => {
    render(
      <FactList
        facts={[
          { label: 'Changelog', value: 'Read it', href: '/changelogs/prism-ui', newTab: true },
        ]}
      />,
    )

    const link = screen.getByRole('link', { name: 'Read it' })
    expect(link).toHaveAttribute('href', '/changelogs/prism-ui')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('renders nothing at all when there is no fact to state', () => {
    const { container } = render(<FactList facts={[]} label="Release" />)
    expect(container.querySelector('[data-slot="fact-list"]')).toBeNull()
    expect(container.firstChild).toBeNull()
  })
})
