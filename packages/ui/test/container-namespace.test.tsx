/**
 * What a consumer's stylesheet declares about width, read out of the artefact they
 * import.
 *
 * **This is the test form of a question `scripts/check-elevation-layout.mjs` cannot
 * answer, and both exist on purpose.** The elevation gate reads source and asks
 * whether a width a Component writes is a name this repository authors. It cannot
 * see what the framework did with that name: a Tailwind that resolved nothing, a
 * variable the build dropped, a `@theme static` close written after the entries it
 * was meant to precede. Those are all facts about `dist/styles.css` and only about
 * `dist/styles.css`. `packages/ui/scripts/check-container-namespace.mjs` is the gate
 * over the same artefact, so a change to either is caught before a release; this
 * file is here so the fact sits next to `reduced-motion.test.tsx` and
 * `progress-origin.test.tsx`, which are the other two built-sheet facts a reader of
 * this package will come looking for, and so `sheet-reader` is exercised over a
 * `:root` block of custom properties rather than only over utility rules.
 *
 * **The defect was invisible because nothing rendered differently.** The token
 * package authored three containers, Tailwind ships thirteen of its own, and until
 * the token build closed the namespace both shipped. Its largest step was 72rem
 * beside `--container-page`, its fifth was 42rem beside `--container-measure` and
 * its fourth was 36rem beside `--container-measure-narrow`: three pairs with one
 * value and two names, so a retune of the authored token would have moved every
 * surface reaching it one way and left every surface reaching it the other way
 * exactly where it was. jsdom resolves neither `var()` nor `@layer`, so nothing
 * rendered differently, and every other gate was green.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { shippedSheet } from './sheet-reader'

const { rules } = shippedSheet

const PKG = path.resolve(import.meta.dirname, '..')
const LAYOUT_TOKENS = path.join(
  PKG,
  '..',
  'tokens',
  'src',
  'foundation',
  'layout.tokens.json',
)

/**
 * The authored container names, read from the token source rather than listed here.
 *
 * A list beside this file would be a second record of a decision the token source
 * owns, which is the same shape as the bug.
 */
const AUTHORED = Object.keys(
  JSON.parse(readFileSync(LAYOUT_TOKENS, 'utf8')).container ?? {},
).filter((name) => !name.startsWith('$'))

/** Tailwind's own steps, read from the installed framework rather than restated. */
const TAILWIND_STEPS = [
  ...readFileSync(require.resolve('tailwindcss/theme.css'), 'utf8').matchAll(/^\s*--container-([\w-]+):/gm),
].map((match) => match[1])

/** The rule the build writes the theme variables into. */
const themeRule = rules.find(
  (rule) => rule.layer === 'theme' && rule.declarations.some((entry) => entry.property.startsWith('--container-')),
)

/** Every `--container-*` the theme block declares, as name and value. */
const declared = (themeRule?.declarations ?? [])
  .filter((entry) => entry.property.startsWith('--container-'))
  .map((entry) => [entry.property.slice('--container-'.length), entry.value])

describe('the container namespace in the stylesheet the library ships', () => {
  it('declares exactly the containers the token source authors, and nothing else', () => {
    expect(themeRule).toBeDefined()
    expect(declared.map(([name]) => name).sort()).toEqual([...AUTHORED].sort())
  })

  it('declares no step of Tailwind\'s own container namespace', () => {
    // The three that collided were `6xl`, `2xl` and `xl`, and all thirteen are
    // checked because a retune of the dependency is the event this exists for: a
    // hand-kept list of three would have been the third copy of a list the gate
    // above already reads from the framework.
    expect(TAILWIND_STEPS.length).toBeGreaterThan(0)
    const shipped = declared.map(([name]) => name)
    expect(shipped.filter((name) => TAILWIND_STEPS.includes(name))).toEqual([])
  })

  it('has no rule reading a Tailwind step, so no retired class survives in prose', () => {
    // Tailwind's extractor reads this package's source comments as well as its code,
    // so a JSDoc block that names the retired page column is a utility the sheet
    // emits. This is the assertion that would notice.
    const reads = new Set<string>()
    for (const rule of rules) {
      for (const entry of rule.declarations) {
        for (const match of entry.value.matchAll(/var\(--container-([\w-]+)\)/g)) {
          if (TAILWIND_STEPS.includes(match[1])) reads.add(match[1])
        }
      }
    }
    expect([...reads].sort()).toEqual([])
  })

  it('emits a `max-width` utility for each authored container, reading its own variable', () => {
    const byName = new Map(
      rules
        .filter((rule) => rule.declarations.some((entry) => entry.property === 'max-width'))
        .map((rule) => [rule.selector, rule.declarations.find((entry) => entry.property === 'max-width')!.value]),
    )
    const missing = AUTHORED.filter((name) => !byName.has(`.max-w-${name}`))
    expect(missing).toEqual([])
    for (const name of AUTHORED) {
      expect([name, byName.get(`.max-w-${name}`)]).toEqual([name, `var(--container-${name})`])
    }
  })

  it('emits no utility for the step that used to spell the page column', () => {
    // Named rather than looped, because this is the pair the whole change is about
    // and a reader should be able to see that one line and know why the file exists.
    const selectors = rules.map((rule) => rule.selector)
    expect(selectors.filter((selector) => selector === '.max-w-6xl')).toEqual([])
  })
})
