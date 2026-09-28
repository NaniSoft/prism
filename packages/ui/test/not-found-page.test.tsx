import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { NotFoundPage } from '../src/pages/not-found-page'

/**
 * The claims under test are the two the three hand-written screens in the NaniSoft
 * sites each got differently: the code is the page's `h1` and the sentence is
 * not, and the ways out are native links with a destination a reader can see
 * before following. A reader who has just followed a link that went nowhere is
 * the one reader for whom that matters.
 */
describe('a not-found screen', () => {
  it('makes the code the h1 and the sentence a heading beneath it', () => {
    render(
      <NotFoundPage
        code="404"
        title="No node here."
        description="The estate is fully mapped. This URL is not in it."
        linksLabel="Ways out"
        links={[{ label: 'Back to the landing', href: '/' }]}
      />,
    )

    const headings = screen.getAllByRole('heading')
    expect(headings[0]?.tagName).toBe('H1')
    expect(headings[0]?.textContent).toBe('404')
    expect(headings[1]?.tagName).toBe('H2')
    expect(headings[1]?.textContent).toBe('No node here.')
  })

  it('makes each way out a native link with the destination on it', () => {
    render(
      <NotFoundPage
        code="404"
        title="Gone."
        linksLabel="Ways out"
        links={[
          { label: 'Read the docs', href: '/docs' },
          { label: 'Back to the landing', href: '/' },
        ]}
      />,
    )

    expect(screen.getByRole('link', { name: 'Read the docs' })).toHaveAttribute('href', '/docs')
    expect(screen.getByRole('navigation', { name: 'Ways out' })).toBeTruthy()
  })

  it('ships no code, no sentence and no link of its own', () => {
    const { container } = render(
      <NotFoundPage
        code="404"
        title="Gone."
        linksLabel="Ways out"
        links={[{ label: 'Read the docs', href: '/docs' }]}
      />,
    )
    // One code, one sentence, one link: every word on the page came from a prop.
    expect(container.textContent).toBe('404Gone.Read the docs')
  })

  it('renders without a description and without a slot, because both are optional', () => {
    render(<NotFoundPage code="404" title="Gone." links={[]} linksLabel="Ways out" />)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('404')
    expect(screen.queryByRole('navigation', { name: 'Ways out' })).toBeNull()
  })
})
