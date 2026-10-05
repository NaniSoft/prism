import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { NotFoundPage } from '../src/pages/not-found-page'

import { fontSizePx, lengthPx } from './sheet-reader'

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

/**
 * The size relationship between the code and the sentence under it, measured.
 *
 * **The inversion is kept and only the sizes are claimed.** The code is the `h1`
 * because a not-found page whose `h1` is "Page not found" gives a search engine
 * and a screen reader nothing distinct to index, and the sentence is the `h2`
 * because it elaborates it. What is wrong in the shipped arrangement is that the
 * `h1` was set a rung below the `h2`: the largest thing a reader is looking at was
 * the smaller of the two, at 36 pixels against 24 in the built exports of the
 * consumer sites. So the claim here is not that the outline is right and it is not
 * that the sizes are named; it is that the code renders larger than the sentence at
 * every width, measured through the shipped sheet rather than read off a class
 * string, and that neither is below the step the ladder's own floor puts there.
 */
describe('the code and the sentence it explains', () => {
  const PAGE = (
    <NotFoundPage
      code="404"
      title="This page does not exist (yet)."
      description="The estate is fully mapped. This URL is not in it."
      linksLabel="Ways out"
      links={[{ label: 'Back to the landing', href: '/' }]}
    />
  )

  it('renders the code larger than the sentence, at 1440 and at 390', () => {
    const { container } = render(PAGE)
    const code = screen.getByRole('heading', { level: 1 })
    const sentence = screen.getByRole('heading', { level: 2 })

    for (const width of [1440, 390]) {
      expect(
        fontSizePx(code, width),
        `the code at ${width}`,
      ).toBeGreaterThan(fontSizePx(sentence, width))
    }
    expect(container.querySelector('h1')!.textContent).toBe('404')
  })

  it('sets the code at the ladder ceiling and the sentence one rung below it', () => {
    // The two steps, read out of the sheet's own root declarations rather than
    // named, so the claim is "Display over Title" and not "48 and 36".
    const { container } = render(PAGE)

    expect(fontSizePx(container.querySelector('h1')!, 390)).toBe(lengthPx('var(--text-5xl)'))
    expect(fontSizePx(container.querySelector('h1')!, 1440)).toBe(lengthPx('var(--text-6xl)'))
    expect(fontSizePx(container.querySelector('h2')!, 390)).toBe(lengthPx('var(--text-4xl)'))
    expect(fontSizePx(container.querySelector('h2')!, 1440)).toBe(lengthPx('var(--text-5xl)'))
  })

  it('makes the code the largest thing on the page, which is what a display element is', () => {
    // The whole claim, stated over every element the Page renders. A page whose
    // largest text is its explanation is a page with no display element, whatever
    // the outline says.
    const { container } = render(PAGE)
    const code = fontSizePx(container.querySelector('h1')!, 1440)

    for (const element of container.querySelectorAll('*')) {
      if (element.querySelector('*')) continue
      expect(fontSizePx(element, 1440), element.tagName).toBeLessThanOrEqual(code)
    }
  })
})
