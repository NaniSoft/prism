import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Prose } from '../src/components/ui/prose'

/**
 * A run of prose is the one Component that styles content it did not write, so
 * the claim under test is the one a `.prose` class would quietly fail: the
 * treatments are child selectors, which means the caller's own plain elements
 * are the ones styled, and a caller writing Prism's own `Heading` gets the same
 * result because both spellings converge on the same element.
 */
describe('a run of prose', () => {
  it('sets the reading measure by default and drops it on request', () => {
    const { container, rerender } = render(
      <Prose>
        <p>Body.</p>
      </Prose>,
    )

    expect(container.querySelector('[data-slot="prose"]')?.className).toContain('max-w-measure')

    rerender(
      <Prose fullWidth>
        <p>Body.</p>
      </Prose>,
    )
    expect(container.querySelector('[data-slot="prose"]')?.className).toContain('max-w-none')
  })

  it('styles the callers own elements rather than wrapping each block', () => {
    const { container } = render(
      <Prose>
        <h2>A heading</h2>
        <p>A paragraph.</p>
        <ul>
          <li>A bullet.</li>
        </ul>
      </Prose>,
    )

    const root = container.querySelector('[data-slot="prose"]')!
    // No wrapper elements: the children are the callers own tags, and the
    // treatments are child selectors on the root.
    expect(root.children).toHaveLength(3)
    expect(root.children[0]?.tagName).toBe('H2')
    expect(root.className).toContain('[&_h2]:text-2xl')
    expect(root.className).toContain('[&_ul]:list-disc')
  })

  it('leaves a run of text alone when it is given no blocks', () => {
    const { container } = render(<Prose>Just words.</Prose>)
    expect(container.querySelector('[data-slot="prose"]')?.textContent).toBe('Just words.')
  })
})
