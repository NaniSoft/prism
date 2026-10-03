/**
 * The cascade primitives every built-stylesheet test in this package rests on.
 *
 * **They are asserted here rather than in one of the callers because there are now
 * two callers.** `progress-origin.test.tsx` held them inline, and
 * `reduced-motion.test.tsx` needs the same four things to say anything about the
 * policy the stylesheet ships. A second copy would be a second implementation that
 * could be wrong in a different direction, and the wrongness would be invisible
 * because each copy would agree with itself.
 *
 * **What each case below is for.** A specificity table with no known answers is a
 * plausible-looking function, and a cascade comparator with no known answers is a
 * plausible-looking function that could be reversed. The cases are the cheapest
 * possible way to find out which, and they are here rather than in a comment
 * because a comment cannot fail.
 *
 * Run: pnpm --filter @nanisoft/prism-ui test
 */
import { describe, expect, it } from 'vitest'

import {
  beats,
  classesOf,
  compareSpecificity,
  layerRankOf,
  parseSheet,
  shippedSheet,
  specificityOf,
  type Candidate,
  type Specificity,
} from './sheet-reader'

describe('the primitives every built-stylesheet test rests on', () => {
  it('counts specificity the way the specification does', () => {
    const cases: [string, Specificity][] = [
      ['.origin-left', [0, 1, 0]],
      // `:where()` contributes nothing, so the variant ties the bare utility rather
      // than beating it. If it beat it, the tie-break `progress-origin.test.tsx` is
      // about would not be a tie-break at all and the bare origin could never win
      // anywhere.
      ['.rtl\\:origin-right:where(:dir(rtl), [dir="rtl"], [dir="rtl"] *)', [0, 1, 0]],
      // The two halves of `[dir="rtl"] *` are one compound, not two, which is what a
      // whitespace split inside the `:where()` argument would get wrong.
      ['.a:where([dir="rtl"] *)', [0, 1, 0]],
      // `:is()` contributes its most specific argument, so a type inside it counts.
      ['.a:is(.b c)', [0, 2, 1]],
      [':root', [0, 1, 0]],
      ['#a .b c', [1, 1, 1]],
      [':where(.a, #b)', [0, 0, 0]],
      [':is(.a, #b)', [1, 0, 0]],
      // The universal selector, and the reason the reduced-motion rule needs its
      // layer rather than its specificity to win.
      ['*', [0, 0, 0]],
      ['::before', [0, 0, 1]],
      ['*, ::before, ::after', [0, 0, 1]],
    ]
    for (const [selector, expected] of cases) {
      expect([selector, specificityOf(selector)]).toEqual([selector, expected])
    }
  })

  it('reads a class name the way the browser does, escapes and all', () => {
    expect(classesOf('.rtl\\:origin-right:where(:dir(rtl), [dir="rtl"], [dir="rtl"] *)')).toEqual([
      'rtl:origin-right',
    ])
    expect(classesOf('.origin-left')).toEqual(['origin-left'])
    // An arbitrary value is a class name too, and it is not one of the indicator's.
    expect(classesOf('.origin-\\(--transform-origin\\)')).toEqual(['origin-(--transform-origin)'])
    // The universal selector names no class at all, which is what keeps a rule
    // written on `*` from being read as one that names the element under test.
    expect(classesOf('*')).toEqual([])
    expect(classesOf('*, ::before, ::after')).toEqual([])
  })

  it('resolves layer, then specificity, then position', () => {
    const candidate = (layerRank: number, specificity: Specificity, offset: number): Candidate => ({
      rule: { layer: null, media: null, selector: '.a', declarations: [], offset },
      specificity,
      layerRank,
    })
    // Unlayered beats layered whatever the specificity says. This is the half that
    // makes the reduced-motion policy reachable at `*`.
    expect(
      beats(candidate(Number.POSITIVE_INFINITY, [0, 0, 0], 1), candidate(4, [9, 9, 9], 10_000)),
    ).toBe(true)
    expect(
      beats(candidate(4, [9, 9, 9], 10_000), candidate(Number.POSITIVE_INFINITY, [0, 0, 0], 1)),
    ).toBe(false)
    // Specificity beats position, which is the half that would hide a mistake here.
    expect(beats(candidate(4, [0, 2, 0], 1), candidate(4, [0, 1, 0], 10_000))).toBe(true)
    // At equal specificity the later one wins, and only because of where it sits.
    expect(beats(candidate(4, [0, 1, 0], 10), candidate(4, [0, 1, 0], 9))).toBe(true)
    expect(beats(candidate(4, [0, 1, 0], 9), candidate(4, [0, 1, 0], 10))).toBe(false)
  })

  it('ranks an unlayered rule above every layer in the shipped sheet', () => {
    // `layerRankOf` is the primitive, and the shipped sheet is the fact it is used
    // on. Tailwind's utilities are the highest layer this project emits, so an
    // unlayered rule has to outrank all of them.
    const ranks = shippedSheet.layerRanks
    expect(ranks.size).toBeGreaterThan(0)
    const unlayered = layerRankOf(
      { layer: null, media: null, selector: '*', declarations: [], offset: 0 },
      ranks,
    )
    for (const name of ranks.keys()) {
      expect([name, unlayered > layerRankOf({ layer: name, media: null, selector: '*', declarations: [], offset: 0 }, ranks)]).toEqual([
        name,
        true,
      ])
    }
  })

  it('descends into a media condition and skips the at-rules it cannot judge', () => {
    const { rules } = parseSheet(`
      @layer utilities {
        .bare { color: red; }
        @media (width >= 40rem) { .wide { color: blue; } }
        @supports (color: color-mix(in oklab, red, blue)) { .mixed { color: green; } }
      }
      @media (prefers-reduced-motion: reduce) {
        * { animation: none; }
      }
    `)
    const named = rules.map((rule) => [rule.selector, rule.layer, rule.media])
    expect(named).toEqual([
      ['.bare', 'utilities', null],
      ['.wide', 'utilities', '(width >= 40rem)'],
      ['*', null, '(prefers-reduced-motion: reduce)'],
    ])
  })

  it('compares two specificities symmetrically', () => {
    expect(compareSpecificity([0, 1, 0], [0, 1, 0])).toBe(0)
    expect(compareSpecificity([1, 0, 0], [0, 9, 9])).toBe(1)
    expect(compareSpecificity([0, 9, 9], [1, 0, 0])).toBe(-1)
  })
})
