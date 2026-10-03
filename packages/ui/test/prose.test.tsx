import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Prose } from '../src/components/ui/prose'
import { Table, TableBody, TableCell, TableRow } from '../src/components/ui/table'
import { classesOf, shippedSheet, valueOf } from './sheet-reader'

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

/**
 * A table is the one block treatment that cannot be expressed as decoration, and
 * the reason is a rule in two specifications rather than a preference.
 *
 * **WHAT A CLASS-STRING ASSERTION DOES NOT PROVE, SAID HERE RATHER THAN IN A
 * FOOTNOTE.** jsdom resolves none of the cascade: it implements neither
 * `@layer` nor `var()`, and it does no layout at all, so nothing below can show
 * that a table scrolls at 320 pixels, or that it does not. What the first test
 * proves is that the Component states the treatment. What the second proves is
 * that the build emitted it and that the emitted selector carries the combinator
 * the treatment depends on. The behaviour those two make possible is a claim
 * about a browser, and `apps/site/e2e/display.spec.ts` is where a claim about a
 * browser is checked.
 *
 * The limits are narrow here in a way they are not elsewhere: the anonymous table
 * box the fixup rules generate is not in the DOM a test can query, and
 * `text-overflow` is not a thing jsdom lays out, so a test that tried to read
 * either back would be asserting on the absence of a feature rather than on the
 * presence of the fix.
 */
describe('a table in a run of prose', () => {
  it('makes the table a scroll container, because a table box cannot be one', () => {
    const { container } = render(
      <Prose>
        <table>
          <tbody>
            <tr>
              <td>one</td>
            </tr>
          </tbody>
        </table>
      </Prose>,
    )

    const root = container.querySelector('[data-slot="prose"]')!
    // The code fence's treatment, on the one block that needs its box type
    // changed to accept it. `display: block` first, because that is what makes
    // `overflow-x: auto` apply to the element at all.
    expect(root.className).toContain('[&>table]:block')
    expect(root.className).toContain('[&>table]:overflow-x-auto')
    expect(root.className).toContain('[&>table]:w-full')
  })

  it('reaches the cells of the table it made scrollable', () => {
    const { container } = render(
      <Prose>
        <table>
          <tbody>
            <tr>
              <td>one</td>
            </tr>
          </tbody>
        </table>
      </Prose>,
    )

    // The cell treatments stay descendant selectors, because a cell is inside a
    // table at any depth and the table wrapper the fixup adds is not in the DOM
    // the caller wrote.
    const root = container.querySelector('[data-slot="prose"]')!
    expect(root.className).toContain('[&_td]:px-3')
    expect(root.className).toContain('[&_th]:text-left')
  })

  it('names a direct child rather than any descendant, so a wrapped Table keeps its own', () => {
    const { container } = render(
      <Prose>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>one</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Prose>,
    )

    // `Table` brings a scroll container of its own and its `<table>` sits one
    // level down inside it, so this is the composition a descendant selector
    // would break: `display: block` there moves `caption-side` onto a block box
    // and stops the grid filling its wrapper. Nothing here can measure that, so
    // what is asserted is the narrower fact that the rule never reaches this
    // element at all.
    const table = container.querySelector('[data-slot="table"]')!
    expect(table.className).not.toContain('block')
    expect(table.className).toContain('w-full')
    expect(container.querySelector('[data-slot="table-container"]')?.className).toContain(
      'overflow-x-auto',
    )
  })
})

/**
 * The cascade over the artefact, because "the class is in the string" and "the
 * build emitted a rule for it" are two different facts and only the second one
 * is what a reader receives.
 *
 * Tailwind generates a utility from the class names it finds, so an arbitrary
 * variant that resolved to nothing would be silently absent from
 * `dist/styles.css` with the Component still carrying the class and every other
 * assertion in this file still green. `DESIGN.md` already records the same shape
 * for a variant the token gate cannot see.
 *
 * The parser is `sheet-reader`, the one this repository has, and it is used for
 * what it is good at and nothing more: which rule exists, in which layer, what it
 * declares, and what element its selector names at the end. It does no layout, so
 * none of this says the table scrolls.
 */

/** The element a selector's last compound names, which is what a variant targets. */
const targetOf = (selector: string): string =>
  selector.trim().split(/[\s>]+/).filter(Boolean).pop() ?? ''

/** The rules the build emitted for a variant naming `element`. */
const rulesFor = (element: string, variant: string) =>
  shippedSheet.rules.filter(
    (rule) =>
      targetOf(rule.selector) === element && classesOf(rule.selector).some((name) => name === variant),
  )

describe('the table scroll treatment in the emitted stylesheet', () => {
  const display = rulesFor('table', '[&>table]:block')
  const width = rulesFor('table', '[&>table]:w-full')
  const scroll = rulesFor('table', '[&>table]:overflow-x-auto')

  it('emits every declaration the treatment names, in the utility layer', () => {
    expect([display.length, width.length, scroll.length]).toEqual([1, 1, 1])
    expect([display[0].layer, width[0].layer, scroll[0].layer]).toEqual([
      'utilities',
      'utilities',
      'utilities',
    ])
    expect([valueOf(display[0], 'display'), valueOf(width[0], 'width'), valueOf(scroll[0], 'overflow-x')]).toEqual([
      'block',
      '100%',
      'auto',
    ])
  })

  it('emits the display change through a child combinator and not a descendant one', () => {
    // The one shape this treatment must not take, and the only thing the selector
    // text can tell a reader. Read from the sheet rather than from the source,
    // because a rule that was written and dropped by the build is not a hazard
    // and a rule that survived is.
    expect(display[0].selector).toMatch(/>\s*table$/)
    const descendant = shippedSheet.rules.filter(
      (rule) => targetOf(rule.selector) === 'table' && valueOf(rule, 'display') === 'block',
    )
    expect(descendant.filter((rule) => !/>\s*table$/.test(rule.selector))).toEqual([])
  })

  it('keeps the code fences own scroll rule, so the table joined it rather than replaced it', () => {
    expect(rulesFor('pre', '[&_pre]:overflow-x-auto').map((rule) => valueOf(rule, 'overflow-x'))).toEqual([
      'auto',
    ])
  })
})
