/**
 * What a reader with the setting on actually gets, read out of the stylesheet the
 * library ships.
 *
 * **This is the test that keeps `styles.css` and its own comment together.** The
 * comment at the foot of that file argues at length for what it does about reduced
 * motion, and for a long time the comment and the code were different documents:
 * the block named seven ambient classes and set `animation: none`, and every
 * `transition-*` in the package ran at full duration for a reader who had asked
 * for none. Nothing in jsdom can see that, because jsdom resolves neither
 * `@layer` nor `prefers-reduced-motion` nor `var()`, so `getComputedStyle` on an
 * element in this repository answers nothing about motion at all. The artifact can
 * see it: `dist/styles.css` is a file the build wrote, and a claim about the
 * cascade over that file is a claim with an answer.
 *
 * **Four things are asserted, and they are four different claims.** That the block
 * exists and is unconditional rather than a list of names. That it declares both
 * properties, because `animation: none` alone is the defect this file was written
 * for. That it is unlayered, because that is the only rank it has and a rule with
 * no rank loses to `.duration-slow` at equal specificity. And that it beats every
 * transition and animation rule in the shipped sheet, which is the last of the
 * four and the only one that needs the cascade comparator rather than a substring.
 *
 * **The limit is stated rather than hidden.** This reads the resting cascade of the
 * rules the build emitted. It does not open a browser, it does not composite a
 * frame, and it does not ask whether a stopped ring still reads as a spinner; that
 * last question is `spinner.tsx`'s own JSDoc and a reader's, and this file holds
 * the half that can be held mechanically.
 */
import { describe, expect, it } from 'vitest'

import {
  beats,
  layerRankOf,
  shippedSheet,
  specificityOf,
  valueOf,
  type Candidate,
} from './sheet-reader'

const { rules, layerRanks } = shippedSheet

/** The one condition the policy is stated under, as the build wrote it. */
const REDUCE = '(prefers-reduced-motion: reduce)'

const REDUCED = rules.filter((rule) => rule.media === REDUCE)

/**
 * Every rule the policy has to beat, and it is deliberately more than the ones it
 * names: the whole point is that a rule which loses is a rule that still runs.
 */
const MOTION_PROPERTIES = ['animation', 'transition', 'transition-property', 'transition-duration']

const COMPETING = rules.filter(
  (rule) =>
    rule.media !== REDUCE &&
    rule.declarations.some((entry) => MOTION_PROPERTIES.includes(entry.property)),
)

const rank = (rule: (typeof rules)[number]): Candidate => ({
  rule,
  specificity: specificityOf(rule.selector),
  layerRank: layerRankOf(rule, layerRanks),
})

/**
 * Every selector in the sheet that carries a reduced-motion variant.
 *
 * Read rather than grepped, because a selector only reaches a reader if it is a
 * rule the build emitted, and the class-name spelling is escaped in the output.
 */
const GUARDED_SELECTORS = rules
  .map((rule) => rule.selector)
  .filter((selector) => selector.includes('motion-safe\\:') || selector.includes('motion-reduce\\:'))

describe('the reduced-motion policy in the stylesheet the library ships', () => {
  it('states the policy under one condition and nothing else', () => {
    const motionConditions = [
      ...new Set(
        rules.map((rule) => rule.media).filter((condition) => condition?.includes('motion')),
      ),
    ]
    // Every conditional rule in the sheet that is about motion, so a policy split
    // across two conditions cannot pass by having half of it somewhere else.
    expect(motionConditions).toEqual([REDUCE])
  })

  it('declares both properties, and the second one is the defect this file is for', () => {
    // One rule, two declarations. The block that shipped set `animation` and named
    // seven classes, so every `transition-*` in the package ran at full duration for
    // a reader who had asked for none, and the comment above it claimed the opposite.
    // Asserting the two properties separately is what makes that a readable failure
    // rather than a mismatch on a selector string.
    expect(REDUCED).toHaveLength(1)
    const policy = REDUCED[0]
    expect(valueOf(policy, 'animation')).toBe('none')
    expect([policy.selector, valueOf(policy, 'transition')]).toEqual([policy.selector, 'none'])
  })

  it('states it on the universal selector rather than on a list of class names', () => {
    // A named list is the shape that cannot cover an animation nobody has written
    // yet, and two unbounded animations were outside it for as long as it existed.
    expect(REDUCED[0].selector).toBe('*, ::before, ::after')
  })

  it('is unlayered, because the layer is the rank it has', () => {
    // A `@layer utilities` rule at `*` is (0,0,0) and every Tailwind transition
    // utility is (0,1,0), so a layered policy would lose to the very declarations it
    // exists to stop. This is the assertion that would fail if the block were ever
    // tidied into a layer, and tidying it into a layer is the one edit that would
    // silently un-ship the policy.
    expect(REDUCED[0].layer).toBeNull()
    expect(layerRanks.has('utilities')).toBe(true)
  })

  it('beats every transition and animation rule in the sheet', () => {
    // The comparator, on the shipped artifact, which is the only place the claim is
    // checkable. A count comes first so a sheet that stopped emitting transition
    // rules could not pass by having nothing to beat.
    expect(COMPETING.length).toBeGreaterThan(0)
    const policy = REDUCED[0]
    const losers = COMPETING.filter((rule) => !beats(rank(policy), rank(rule)))
    expect(losers.map((rule) => `${rule.selector} ${rule.media ?? ''}`)).toEqual([])
  })

  it('leaves nothing for a call site to guard', () => {
    // No `motion-safe:` and no `motion-reduce:` utility reaches the sheet, because
    // no Component writes one any more. A guard that survived would be a class in
    // the shipped CSS that nothing renders, and it would be there because someone
    // had described it rather than used it.
    expect(GUARDED_SELECTORS).toEqual([])
  })
})
