/**
 * Which end a `Progress` bar fills from, read out of the stylesheet the library
 * ships rather than out of the string in the source.
 *
 * **A bar that fills from the wrong end in one direction is invisible to every other
 * lane in this repository.** `progress.test.tsx` can assert that the indicator's
 * class list names an origin and an `rtl:` override, because that is all a class
 * list is. jsdom resolves no `transform-origin`, no `:dir()` and no `[dir]`, and it
 * does no layout, so a test that wanted the geometry would have to be a browser
 * test. This file is the step before that: it reads the rules the build really
 * emitted and checks that the right-to-left one is the one that wins when the
 * document is right-to-left. It is a statement about the cascade over the shipped
 * artifact, which is a question the artifact can answer, and it is not a statement
 * about a composited pixel, which it cannot.
 *
 * **THE PARSER IS SHARED AND THE COPY IN `apps/site/test/pack-dot.test.ts` IS NOT.**
 * That file is the reason the approach exists: jsdom implements neither `@layer` nor
 * `var()`, so `getComputedStyle` on an element in this repository answers nothing
 * about what is painted, and a test built on it would pass for a reason that has
 * nothing to do with the paint. The two copies cannot share a module, because they
 * are two separately published packages and a helper shared between them would be
 * either a new package or a file inside a published path, which is a larger decision
 * than this fix. Within this package they share one: the primitives moved to
 * `sheet-reader.ts` when `reduced-motion.test.tsx` needed the same four, and their
 * known-answer cases moved with them to `sheet-reader.test.tsx`. What is shared is
 * the shape: parse the sheet, count specificity, compare layer then specificity
 * then position, and assert each of those three primitives against known answers
 * before anything depends on them. That last part is what makes a reimplementation
 * honest, and it is the part a shorter version of this file would drop.
 *
 * **The limit is here rather than in a comment at the foot of the file.** This reads
 * the resting cascade of one property for one element. It does no layout, it
 * composites nothing, and it declines to judge a selector shape it cannot recognise
 * rather than guessing, because a guess here reports a fill direction the browser
 * does not produce. Whether the pixel a reader sees grows from the right edge under
 * a `dir="rtl"` document is `apps/site/e2e/display.spec.ts`'s question, and this
 * file states the half that can be stated without a browser.
 */
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Progress } from '../src/components/ui/progress'

import {
  beats,
  classesOf,
  layerRankOf,
  shippedSheet,
  specificityOf,
  valueOf,
  type Candidate,
  type Rule,
} from './sheet-reader'

const { rules: RULES, layerRanks: LAYER_RANKS } = shippedSheet

// ---------------------------------------------------------------- the element

/**
 * The class list the Component actually renders, read out of its own output.
 *
 * Rendered here rather than written out by hand, for the reason `pack-dot.test.ts`
 * gives: a hand-written list is a second list that drifts, and this file's whole
 * subject is the pair of class names the Component chose.
 */
const INDICATOR = (() => {
  const { container } = render(<Progress value={40} />)
  const element = container.querySelector<HTMLElement>('[data-slot="progress-indicator"]')
  expect(element, 'the indicator is an element carrying its own data-slot').not.toBeNull()
  return element!
})()

const INDICATOR_CLASSES = new Set(INDICATOR.className.split(/\s+/).filter(Boolean))

/**
 * Every rule that can give the indicator a `transform-origin`.
 *
 * A rule qualifies when it declares the property, names at least one class, has
 * every class it name among the ones the indicator carries, and is UNCONDITIONAL.
 * That last half is load-bearing rather than tidy: the parser keeps the media
 * condition of every rule it descends into, because `reduced-motion.test.tsx` needs
 * the one conditional rule in this sheet and cannot see it otherwise, and the price
 * of sharing one parser is that a caller who wants the resting cascade has to say
 * so. This file's subject is the resting cascade, so a width query is not one of
 * the rules it is measuring.
 */
const ORIGIN_RULES = RULES.filter(
  (rule) =>
    rule.media === null &&
    rule.declarations.some((entry) => entry.property === 'transform-origin') &&
    classesOf(rule.selector).length > 0 &&
    classesOf(rule.selector).every((name) => INDICATOR_CLASSES.has(name)),
)

// ------------------------------------------------------------------ the origin

describe('the end a Progress bar fills from', () => {
  it('names both directions in the class list the component renders', () => {
    // The reader below is only about the two class names this Component chose, so
    // this is the assertion that keeps it about those two. A Component that changed
    // its mind fails here rather than being measured against a selector this file no
    // longer recognises.
    expect([...INDICATOR_CLASSES]).toEqual(
      expect.arrayContaining(['origin-left', 'rtl:origin-right']),
    )
  })

  it('reaches the indicator through exactly two origin rules', () => {
    // Two, and only two. A third would be a third way for this element's origin to be
    // decided, and the assertion is a count rather than a list so one arriving is a
    // finding rather than a silently ignored rule.
    expect(ORIGIN_RULES.map((rule) => rule.selector).sort()).toHaveLength(2)
    expect(ORIGIN_RULES.map((rule) => classesOf(rule.selector)[0]).sort()).toEqual([
      'origin-left',
      'rtl:origin-right',
    ])
  })

  it('emits one single-value origin per direction, and they are the two ends', () => {
    const [ltr, rtl] = ORIGIN_RULES.map((rule) => [classesOf(rule.selector)[0], valueOf(rule, 'transform-origin')])
    // One value each, so the bar keeps growing about its own centre line rather than
    // about a corner. `0` is the inline start under a left-to-right `dir` and `100%`
    // is the inline start under a right-to-left one, which is the edge Base UI's own
    // `inset-inline-start: 0` anchors the fill to.
    expect(ltr).toEqual(['origin-left', '0'])
    expect(rtl).toEqual(['rtl:origin-right', '100%'])
  })

  it('gates the right-to-left origin on a right-to-left document', () => {
    const variant = ORIGIN_RULES.find((rule) => classesOf(rule.selector)[0] === 'rtl:origin-right')!
    // Every member of the argument asks for direction: the element itself, an
    // ancestor with the attribute, or a descendant of one. A document with no `dir`
    // attribute and a left-to-right computed direction satisfies none of them, so the
    // rule cannot match and the bare origin is what is left. This is a shape
    // assertion and is labelled as one: whether a selector matches a real ancestor is
    // a browser's answer, and this reads the form the build emitted.
    expect(variant.selector).toContain(':where(')
    expect(variant.selector).toContain(':dir(rtl)')
    expect(variant.selector).toContain('[dir="rtl"]')
    // And the bare rule carries no condition at all, which is what makes it the
    // default rather than a second opinion.
    const bare = ORIGIN_RULES.find((rule) => classesOf(rule.selector)[0] === 'origin-left')!
    expect(bare.selector).toBe('.origin-left')
    expect(bare.media).toBeNull()
  })

  it('hands the tie to the right-to-left rule, and only the right-to-left rule', () => {
    const bare = ORIGIN_RULES.find((rule) => classesOf(rule.selector)[0] === 'origin-left')!
    const variant = ORIGIN_RULES.find((rule) => classesOf(rule.selector)[0] === 'rtl:origin-right')!
    const rank = (rule: Rule): Candidate => ({
      rule,
      specificity: specificityOf(rule.selector),
      layerRank: layerRankOf(rule, LAYER_RANKS),
    })

    // Equal specificity in one layer, so the decision is made by position. If either
    // half of that stopped being true the bar would fill from the wrong end in one
    // direction and every gate in this repository would still be green.
    expect([bare.selector, specificityOf(bare.selector)]).toEqual([bare.selector, [0, 1, 0]])
    expect([variant.selector, specificityOf(variant.selector)]).toEqual([
      variant.selector,
      [0, 1, 0],
    ])
    expect([bare.layer, variant.layer]).toEqual([bare.layer, variant.layer])
    expect(beats(rank(variant), rank(bare))).toBe(true)
    expect(beats(rank(bare), rank(variant))).toBe(false)
  })

  it('keeps the whole of the fill on the compositor, in the sheet it ships', () => {
    // The paint-cost claim, read rather than asserted. `transition-transform` is a
    // property list, so the sheet has to name `transform` and must not name `width`.
    const transition = RULES.filter((rule) => rule.selector === '.transition-transform')
    expect(transition.length).toBeGreaterThan(0)
    for (const rule of transition) {
      expect([rule.selector, valueOf(rule, 'transition-property')]).toEqual([
        rule.selector,
        'transform, translate, scale, rotate',
      ])
    }
    // The retired mechanism, gone from this Component. `Sidebar` still transitions a
    // width, and `Accordion` and `Collapsible` still transition a height, so this is a
    // statement about the Progress fill and not about the package.
    expect(INDICATOR.className).toContain('transition-transform')
    expect(INDICATOR.className).not.toContain('transition-[width]')
  })
})
