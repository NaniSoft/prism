/**
 * The heading ladder, measured against the authored type scale rather than against
 * a table written beside this file.
 *
 * **Why this file is not `section.test.tsx` reading `headingSizeClass` and calling
 * it a day.** That file restates the table on purpose, so a retune of
 * `HEADING_SIZE` that nobody also restated here fails. Restating is the right shape
 * for catching an unconsidered edit, and it is the wrong shape for the question this
 * file asks, which is whether the table still walks the scale: a restated table and
 * the authored scale can only be compared by restating the scale too, and that third
 * copy is the one that rots. So the scale is read out of
 * `packages/tokens/src/foundation/base.tokens.json` at run time, the way
 * `scripts/check-heading-scale.mjs` reads it, and the ladder is derived from the two
 * together.
 *
 * **The gap this covers, and it is a real one.** The gate asks whether the steps
 * fall and whether the top two differ, and it does not ask whether each step is the
 * one immediately below the step above it. A table that skipped a rung passes it:
 * `h1` at `4xl`, `h2` at `2xl` and the rest descending is descending, it reaches the
 * ceiling, it floors at or above Body, and it renders a page `h1` at 2.25rem over an
 * `h2` at 1.5rem, which is the defect this whole ladder was widened to remove. That
 * is the table the display steps were added to make impossible, and nothing in the
 * tree would have reported it.
 *
 * **What this file is not.** It measures no pixels and opens no browser. jsdom
 * applies no stylesheet, so every claim here is about the step a heading names and
 * the value the token source gives that step.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { headingSizeClass, type HeadingLevel } from '../src/components/ui/section'

const PKG = path.resolve(import.meta.dirname, '..')
const BASE_TOKENS = path.join(PKG, '..', 'tokens', 'src', 'foundation', 'base.tokens.json')

/**
 * The step `DESIGN.md` gives Body, held rather than read.
 *
 * The same limit `scripts/check-heading-scale.mjs` states: "Body is 400 at `lg`" is
 * a sentence in a document and not a field in the token source. The value behind it
 * is read, so a retune of `lg` moves the comparison rather than leaving it pinned.
 */
const BODY_STEP = 'lg'

/** The six levels in outline order. */
const LEVELS: HeadingLevel[] = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']

/**
 * Every authored `text` step, smallest first, as name and rem.
 *
 * Read rather than listed, for the reason in this file's header. `$description` and
 * `$type` are the group's own metadata and `mono` is a machine annotation rather
 * than a rung, so both are excluded from the ladder below rather than from the set
 * of authored names.
 */
const AUTHORED: { name: string; rem: number }[] = Object.entries(
  (JSON.parse(readFileSync(BASE_TOKENS, 'utf8')).text ?? {}) as Record<
    string,
    { $value: { value: number } }
  >,
)
  .filter(([name]) => !name.startsWith('$'))
  .map(([name, token]) => ({ name, rem: token.$value.value }))
  .sort((a, b) => a.rem - b.rem)

const byName = new Map(AUTHORED.map((step) => [step.name, step]))
const body = byName.get(BODY_STEP)

if (body === undefined) {
  throw new Error(
    `The token source authors no \`text\` step named \`${BODY_STEP}\`, so the floor of the ladder has ` +
      'nothing to be measured against.',
  )
}

/**
 * The ladder's rungs: every authored step a heading may take, smallest first.
 *
 * A rung is a step at or above Body. That is the whole of the rule the scale states
 * about headings, and deriving the list rather than writing it means a step added to
 * the token source above the ceiling widens this file's claim instead of leaving it
 * describing the tree it happened to be run against.
 */
const RUNGS = AUTHORED.filter((step) => step.rem >= body.rem).map((step) => step.rem)

/** The step name a rendered class names, or undefined when it names none. */
function stepName(classes: string, prefix: 'base' | 'sm'): string | undefined {
  const utility = classes
    .split(/\s+/)
    .find((entry) => (prefix === 'sm' ? entry.startsWith('sm:text-') : entry.startsWith('text-')))
  return utility?.slice(utility.lastIndexOf('text-') + 'text-'.length)
}

/**
 * The ladder, as a rung index per level rather than as a rem.
 *
 * An index is what "one step down" means, and a rem is not: the scale's gaps are a
 * fifth and a quarter and a third in three different places, so subtracting two
 * rems and calling the result a step would be arithmetic that only holds for a
 * scale built on one ratio.
 */
const LADDER = LEVELS.map((level) => {
  const classes = headingSizeClass(level)
  const base = stepName(classes, 'base')
  const atSm = stepName(classes, 'sm')
  return {
    level,
    classes,
    base: base === undefined ? undefined : RUNGS.indexOf(byName.get(base)!.rem),
    atSm: atSm === undefined ? undefined : RUNGS.indexOf(byName.get(atSm)!.rem),
  }
})

/** The rem a rung index resolves to, for the one claim that is about values. */
const remAt = (index: number | undefined) => (index === undefined ? undefined : RUNGS[index])

describe('the heading ladder walks the authored scale', () => {
  it('reads the scale rather than a copy of it, so this file cannot rot quietly', () => {
    // The premise of every claim below, asserted so a token source that lost its
    // `text` group fails here with a reason rather than passing a comparison
    // between two empty sets.
    expect(AUTHORED.length).toBeGreaterThan(0)
    expect(body?.rem).toBe(1.125)
    expect(RUNGS.at(-1)).toBe(3.75)
  })

  it('names only steps the token source authors, at both widths', () => {
    for (const row of LADDER) {
      expect(stepName(row.classes, 'base'), `${row.level} base step`).toBeDefined()
      expect(stepName(row.classes, 'sm'), `${row.level} sm step`).toBeDefined()
      expect(byName.has(stepName(row.classes, 'base')!), `${row.level} base`).toBe(true)
      expect(byName.has(stepName(row.classes, 'sm')!), `${row.level} sm`).toBe(true)
    }
  })

  it('starts at the largest authored step, so the ceiling is reachable and not passed', () => {
    // The ceiling is reached at `sm`, because every rung is a pair and the largest
    // authored step is the `sm` half of the top one. A table that pinned the base
    // at the ceiling would have had nothing to grow into.
    expect(remAt(LADDER[0].atSm)).toBe(RUNGS.at(-1))
    expect(remAt(LADDER[0].base)).toBe(RUNGS.at(-2))
    for (const row of LADDER) {
      expect(row.base, `${row.level} base`).toBeLessThanOrEqual(LADDER[0].base!)
      expect(row.atSm, `${row.level} sm`).toBeLessThanOrEqual(LADDER[0].atSm!)
    }
  })

  it('descends one authored step per level, with no rung skipped', () => {
    // The rule the gate does not hold. A table that skipped a rung still descends,
    // still reaches the ceiling and still floors at or above Body, so it passes
    // every rule the gate states and renders a page h1 barely above its own h2.
    for (let i = 1; i < LADDER.length; i += 1) {
      expect(LADDER[i].base, `${LADDER[i].level} against ${LADDER[i - 1].level}`).toBe(
        LADDER[i - 1].base! - 1,
      )
    }
  })

  it('steps up exactly one authored step at sm at every level', () => {
    // Every rung of this ladder is a pair, a base step and one step up at `sm`.
    // Without this a ceiling could be authored with no width to grow into and the
    // display role would be the one heading in the system that does not respond.
    for (const row of LADDER) {
      expect(row.atSm, `${row.level} at sm against its base`).toBe(row.base! + 1)
    }
  })

  it('floors at or above the step Body is set at, and holds there rather than below', () => {
    const floor = LADDER.at(-1)!
    expect(remAt(floor.base)).toBeGreaterThanOrEqual(body!.rem)
    expect(floor.base).toBe(0)
    for (const row of LADDER) {
      expect(remAt(row.base), `${row.level} against Body`).toBeGreaterThanOrEqual(body!.rem)
    }
  })

  it('separates a page h1 from the h2 under it by more than any gap below it', () => {
    // The defect, stated as a measurement. Every rung gap in this scale is one
    // fifth or one quarter; the gap at the top is four thirds, and that is the only
    // reason the page's claim and the sections under it read as different roles.
    const gap = (above: number, below: number) => Number((above / below).toFixed(4))
    const topGap = gap(remAt(LADDER[0].base)!, remAt(LADDER[1].base)!)
    for (let i = 2; i < LADDER.length; i += 1) {
      const other = gap(remAt(LADDER[i - 1].base)!, remAt(LADDER[i].base)!)
      expect(topGap, `against the gap between ${LADDER[i - 1].level} and ${LADDER[i].level}`)
        .toBeGreaterThan(other)
    }
  })

  it('uses every rung the scale authors at or above Body, across both widths', () => {
    // The arithmetic behind the ladder, stated rather than counted: the base steps
    // run from the ceiling down to the floor and the `sm` steps run one above each
    // of those, so between them the table consumes every authored step a heading
    // is allowed to take and no rung is left orphaned by the ceiling.
    const used = new Set(LADDER.flatMap((row) => [row.base, row.atSm]))
    expect(used.size).toBe(RUNGS.length)
    for (let rung = 0; rung < RUNGS.length; rung += 1) {
      expect([...used].sort((a, b) => a! - b!)).toContain(rung)
    }
    expect(new Set(LADDER.map((row) => row.base)).size).toBe(LEVELS.length)
  })
})
