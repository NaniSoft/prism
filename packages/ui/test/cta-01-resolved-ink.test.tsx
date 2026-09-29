/**
 * The resolved ink of a control on a filled surface, in every pack and mode.
 *
 * The defect this exists to end was found by resolving computed values in a real
 * browser, because the class name said nothing and the token gate said nothing. The
 * token gate measures pairs, and `foreground` on `background` was already 4.5:1 in
 * all twelve combinations; what shipped was a variant that set a fill and left its
 * ink inherited, so inside `Cta01`'s filled band the second action was
 * `--background` behind `--primary-foreground` and measured 1.01:1 in lavender
 * dark. A screenshot review confirms it in light mode, which is how a control that
 * is focusable, announced and unreadable survives a design review.
 *
 * **This test asserts the resolved pair, not the class name.** A class name is a
 * promise about which token will be looked up; the pair is what a reader gets. The
 * two diverge exactly here, so a test written over class names would have passed
 * against the broken button.
 *
 * Resolution is done from the emitted token CSS, one pack and mode at a time, the
 * same files the stylesheet imports. So the numbers here are the numbers a browser
 * computes for these variables, not a restatement of what this test believes them
 * to be.
 */
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { Cta01 } from '../src/blocks/cta-01'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const PKG = path.join(HERE, '..')
const TOKENS = path.join(PKG, 'node_modules', '@nanisoft', 'prism-tokens', 'dist')

/** The five packs plus the base, and both modes. Twelve combinations. */
const PACKS = ['', 'blush', 'mint', 'lavender', 'sky', 'peach']
const MODES = ['light', 'dark']
const MINIMUM = 4.5

const luminance = (hex: string): number => {
  const channel = (value: number): number => {
    const c = value / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  const n = Number.parseInt(hex.replace('#', ''), 16)
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255)
}

const ratio = (a: string, b: string): number => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

/** The value of one custom property in one pack and mode, from the emitted CSS. */
function token(pack: string, mode: string, name: string): string {
  // `base` is a label, not a directory. The neutral default sits at the root of
  // the token dist and the five pastel packs sit under `themes/`, so the base pack
  // has to be spelled either as the empty string or as the word `base` and the
  // first version of this test accepted only the first, which made the two
  // parameters disagree about what a pack is called. It is settled here rather
  // than at the call sites so a test name can read `base` and still resolve.
  const directory = !pack || pack === 'base' ? '' : path.join('themes', pack)
  const file = path.join(TOKENS, directory, `${mode}.css`)
  if (!existsSync(file)) throw new Error(`no emitted token sheet at ${file}`)
  const declaration = new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{3,8})`).exec(readFileSync(file, 'utf8'))
  if (!declaration) throw new Error(`${mode} of ${pack || 'the base pack'} declares no --${name}`)
  return declaration[1]
}

describe('a control on a filled surface', () => {
  it('reads twelve pack and mode combinations rather than the pack it was found in', () => {
    expect(PACKS.length * MODES.length).toBe(12)
  })

  it.each(PACKS.flatMap((pack) => MODES.map((mode) => [pack || 'base', mode])))(
    'Cta01 second action is legible in %s %s',
    (pack, mode) => {
      // The band: `bg-primary text-primary-foreground`, which is what makes the
      // band's ink an inheritance rather than the page's.
      const bandFill = token(pack, mode, 'primary')
      const bandInk = token(pack, mode, 'primary-foreground')
      expect(ratio(bandFill, bandInk)).toBeGreaterThanOrEqual(MINIMUM)

      // The second action, defaulted: `outline` is `bg-background text-foreground`.
      // Its ink is stated rather than inherited, which is the whole fix, so the
      // pair to measure is the button's own fill against its own ink. Lowest
      // measured across all twelve is 13.59:1, so the ceiling here has room.
      const actionFill = token(pack, mode, 'background')
      const actionInk = token(pack, mode, 'foreground')
      expect(ratio(actionFill, actionInk)).toBeGreaterThanOrEqual(MINIMUM)
    },
  )

  it('pins the blast radius, which is seven of twelve and not one', () => {
    // The pair the shipped button drew: the action's own `--background` fill
    // behind the band's inherited `--primary-foreground` ink. Measured rather than
    // assumed, because the assumption is the mistake this ticket was filed on.
    //
    // It is not one combination. The five pastel packs are fine in light mode and
    // unreadable in dark, and the base pack fails in BOTH, because its
    // `--primary` is white in light mode, so an outline action on the band was
    // `#ffffff` behind `#ffffff` at 1.00:1. The base pack is the one every site
    // starts from, so the single screenshot the ticket was filed from understated
    // this by six combinations.
    const collapsed = []
    for (const pack of PACKS) {
      for (const mode of MODES) {
        const inherited = ratio(token(pack, mode, 'background'), token(pack, mode, 'primary-foreground'))
        if (inherited < MINIMUM) collapsed.push(`${pack || 'base'} ${mode}`)
      }
    }

    expect(collapsed).toEqual([
      'base light',
      'base dark',
      'blush dark',
      'mint dark',
      'lavender dark',
      'sky dark',
      'peach dark',
    ])

    // And the same twelve, measured against the stated ink, are all legible. If a
    // future pack ever breaks this, this assertion is where it shows up.
    for (const pack of PACKS) {
      for (const mode of MODES) {
        expect(
          ratio(token(pack, mode, 'background'), token(pack, mode, 'foreground')),
          `${pack || 'base'} ${mode}`,
        ).toBeGreaterThanOrEqual(MINIMUM)
      }
    }
  })

  it('states the ink, so the shipped pair is the one that is measured', () => {
    // The class-name half, kept alongside the resolution half on purpose. The
    // resolution above is what catches the defect; this is what says which string
    // the resolution was performed on, so the two cannot drift apart silently.
    for (const file of ['cta-link.tsx', 'button.tsx']) {
      const source = readFileSync(path.join(PKG, 'src', 'components', 'ui', file), 'utf8')
      const outline = /outline:\s*\n?\s*'([^']*)'/.exec(source)?.[1]
      expect(outline, `${file} declares an outline variant`).toBeTruthy()
      expect(outline, `${file}'s outline sets a fill`).toMatch(/\bbg-background\b/)
      expect(outline, `${file}'s outline states its own ink`).toMatch(/\btext-foreground\b/)
    }
  })
})

/**
 * The half that measures the pair the Block actually asks for.
 *
 * Everything above measures a pair this test *believes* the defaults resolve to.
 * That belief is the thing this file could not previously check: a test that
 * hardcodes `background` against `foreground` passes whether the Block defaults
 * its second action to `outline` or to something whose fill is the band's, so it
 * is green on a Block that has stopped asking for the pair it is holding to
 * 4.5:1. The defect was found in a browser for the same reason: the class name
 * and the pair are two different claims and only one of them is on the page.
 *
 * So these render the Block, read the utilities off the anchors it produced, map
 * each to the token it names, and resolve those tokens from the emitted CSS. The
 * assertion is still on the resolved pair, never on the class string: the class
 * string is read here as *input*, and what is asserted is the colour.
 */
describe('the defaults Cta01 ships', () => {
  it('resolves both actions to a legible pair, and to a fill the band is not', () => {
    const { container } = render(
      <Cta01
        title="Ship it"
        action={{ label: 'Start a trial', href: '/start' }}
        secondaryAction={{ label: 'Read the guides', href: '/guides' }}
      />,
    )

    const links = [...container.querySelectorAll('a')]
    expect(links, 'the band carries both actions').toHaveLength(2)

    // The band is the `bg-primary` surface whose ink every control inside it
    // would inherit. A defaulted action whose own fill is that fill has no edge
    // against the band, so the band is read the same way the two actions are.
    const bandFill = ownFill(container.querySelector('[class*="bg-primary"]')!)
    expect(bandFill, 'the band states its own fill').toBe('primary')

    for (const pack of PACKS) {
      for (const mode of MODES) {
        const where = `${pack || 'base'} ${mode}`
        for (const link of links) {
          const fill = ownFill(link)
          const ink = ownInk(link)

          // Both halves stated. An absent ink is the shipped defect: the control
          // then takes the band's `--primary-foreground`, and the pair measured
          // is a fill against an ink the Block never asked for. `stated` is what
          // narrows the pair for the ratio below, so the assertion and the
          // narrowing are one function rather than an assertion and a hope.
          const stated = (value: string | null, what: string): string => {
            expect(value, `${where}: ${label(link)} states ${what}`).toBeTruthy()
            return value as string
          }
          const fillToken = stated(fill, 'its own fill')
          const inkToken = stated(ink, 'its own ink')

          const r = ratio(token(pack, mode, fillToken), token(pack, mode, inkToken))
          expect(r, `${where}: ${label(link)} is ${fillToken} on ${inkToken}`).toBeGreaterThanOrEqual(
            MINIMUM,
          )

          // The shape half. `default` resolves to `--primary` behind
          // `--primary-foreground`, which clears the text threshold and is still a
          // control with no edge, so a legible ratio is not sufficient on its own.
          expect(fillToken, `${where}: ${label(link)} is a fill the band is not`).not.toBe(bandFill)
        }
      }
    }
  })
})

/** The visible text of an anchor, for a failure message. */
const label = (link: Element): string => link.textContent?.trim() ?? '(no label)'

/** The token an element fills itself with, ignoring a fill on a pseudo-state. */
const ownFill = (element: Element): string | null => {
  const own = [...element.classList].filter((u) => /^bg-/.test(u) && !/^(hover|focus|active|group|peer)-/.test(u))
  return own.length === 0 ? null : own[0].slice('bg-'.length)
}

/** The token an element inks itself with, ignoring an ink on a pseudo-state. */
const ownInk = (element: Element): string | null => {
  const own = [...element.classList].filter(
    (u) => /^text-/.test(u) && !/^(hover|focus|active|group|peer)-/.test(u) && INK.test(u),
  )
  return own.length === 0 ? null : own[0].slice('text-'.length)
}

/**
 * The inks a control may state for itself, which is the same closed set
 * `check-variant-ink.mjs` accepts. It is restated rather than imported because
 * the gate is not on the test lane's module graph, and a control that states
 * `text-balance` or `text-sm` states a size rather than an ink, so the test has
 * to be able to tell the two apart.
 */
const INK = /^text-(foreground|primary-foreground|secondary-foreground|accent-foreground|muted-foreground|destructive-foreground|success-foreground|warning-foreground|popover-foreground|card-foreground|sidebar-foreground|sidebar-primary-foreground|sidebar-accent-foreground|inherit|current|white|black)$/
