import { readFileSync } from 'node:fs'
import path from 'node:path'

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { FactList } from '../src/components/ui/fact-list'

import { inheritedValue } from './sheet-reader'

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

/**
 * The three-row fact list the company site's about page renders, with the value
 * that made the defect visible: an answer long enough to wrap, so the second line
 * started wherever the first one ended and the column read as ragged-left.
 */
const ABOUT = [
  { label: 'What it is', value: 'Atlas, digital twins; AlphaLens, market research for the Indian market; Prism, the shared design language.' },
  { label: 'Where it runs', value: 'India, then the Gulf' },
  { label: 'Since', value: '2023' },
]

describe('the value column of a fact list', () => {
  it('sets every value flush left, measured through the shipped sheet', () => {
    // The rendered alignment, resolved off the `dd` rather than read off the class
    // string, because `text-left` on the markup and `text-align: left` in the
    // stylesheet are two facts and the second is the one a reader sees.
    const { container } = render(<FactList facts={ABOUT} />)
    const values = [...container.querySelectorAll('dd')]

    expect(values).toHaveLength(3)
    for (const value of values) {
      expect(inheritedValue(value, 'text-align', 1440), `"${value.textContent?.slice(0, 24)}"`).toBe(
        'left',
      )
    }
  })

  it('has no numeric mode, so there is no column of figures for right alignment to serve', () => {
    // Asked and answered, because the answer decides the fix: right alignment is
    // correct in a column of figures and this Component has no way to ask for one.
    // Read from the module rather than from a prop list here, so a `numeric` prop
    // added later fails this rather than quietly making the default wrong for
    // every caller that never passes it.
    const source = readFileSync(
      path.join(import.meta.dirname, '..', 'src', 'components', 'ui', 'fact-list.tsx'),
      'utf8',
    )
    const code = source.replace(/\/\*[\s\S]*?\*\//g, '')

    expect(code).not.toMatch(/tabular-nums|font-mono|text-mono|font-mono/)
    expect(code).not.toMatch(/\bnumeric\b/)
    // And the alignment is one decision rather than two: the only alignment the
    // module writes is the one every value gets.
    expect([...code.matchAll(/text-(left|right|center|justify|start|end)/g)].map((m) => m[0])).toEqual(
      ['text-left'],
    )
  })

  it('still balances a wrapped value, because left alignment is not the whole decision', () => {
    const { container } = render(<FactList facts={ABOUT} />)
    for (const value of container.querySelectorAll('dd')) {
      expect(inheritedValue(value, 'text-wrap', 1440)).toBe('balance')
    }
  })
})
