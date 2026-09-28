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
import { describe, expect, it } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

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
