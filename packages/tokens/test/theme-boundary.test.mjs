/**
 * The pack boundary selector shape (ticket 87).
 *
 * `scripts/check-emitted-contract.mjs` and `test/emitted-contract.test.mjs` both
 * assert the emitted selector EQUALS `themeSelector(id, mode, THEME_SELECTOR_STYLE)`,
 * so they follow the switch automatically and cannot tell a correct switch from a
 * broken one. This suite pins the switch's OUTPUT for the shape the design system
 * publishes, so a future edit that drops an arm, reorders it, or quietly changes
 * one of the two untouched styles fails by name.
 *
 * What the dark arm has to be: a pack boundary with no mode class of its own has
 * to resolve that pack's values for the DOCUMENT's mode, in both modes. That is
 * the descendant form. The compound form is what a boundary holding a fixed mode
 * uses, and it is retained, so both arms ship in one comma-separated list.
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import { themeSelector, THEME_SELECTOR_STYLE, DEFAULT_THEME_SELECTOR_STYLE } from '../build/themes.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const PKG = path.join(HERE, '..')
const DIST = path.join(PKG, 'dist')

const readText = async (file) => (await readFile(file, 'utf8')).replace(/^\uFEFF/, '')

/**
 * The selector prelude of a `ds/css-vars` file: everything between the generated
 * banner and the declaration block's opening brace. Reading the whole prelude
 * rather than a single non-greedy line is what lets a selector LIST through
 * intact.
 */
function selectorOf(css) {
  const afterBanner = css.replace(/^\/\*[\s\S]*?\*\/\s*/, '')
  const open = afterBanner.indexOf('{')
  return open === -1 ? '' : afterBanner.slice(0, open).trim()
}

/** The declaration block of a `ds/css-vars` file. */
function blockOf(css) {
  const afterBanner = css.replace(/^\/\*[\s\S]*?\*\/\s*/, '')
  const open = afterBanner.indexOf('{')
  const close = afterBanner.lastIndexOf('}')
  return open === -1 || close === -1 ? '' : afterBanner.slice(open + 1, close)
}

const manifest = JSON.parse(await readText(path.join(DIST, 'themes.json')))
const packIds = manifest.map(({ id }) => id)

const stylesheet = (id, mode) => readText(path.join(DIST, 'themes', id, `${mode}.css`))

describe('pack boundary selector shape', () => {
  it('publishes at least one pack, so the assertions below are not vacuous', () => {
    expect(packIds.length).toBeGreaterThan(0)
  })

  it('keeps the light arm exactly the bare pack attribute, for every pack', async () => {
    for (const id of packIds) {
      const selector = selectorOf(await stylesheet(id, 'light'))
      expect(selector, `themes/${id}/light.css selector`).toBe(`[data-pack="${id}"]`)
    }
  })

  it('publishes the dark arm as one comma-separated list holding both forms, for every pack', async () => {
    for (const id of packIds) {
      const selector = selectorOf(await stylesheet(id, 'dark'))
      const arms = selector.split(',').map((arm) => arm.trim())

      /*
       * Both arms, in this order. The compound form is the boundary that holds a
       * fixed mode (a client can apply it); the descendant form is the boundary
       * that wears its ancestor's mode, which is the only shape a server can
       * render, because a server cannot know the reader's mode.
       */
      expect(arms, `themes/${id}/dark.css arms`).toEqual([
        `[data-pack="${id}"].dark`,
        `.dark [data-pack="${id}"]`,
      ])
    }
  })

  it('keeps both dark arms in ONE rule, so neither can lose to the other', async () => {
    for (const id of packIds) {
      const css = await stylesheet(id, 'dark')
      const afterBanner = css.replace(/^\/\*[\s\S]*?\*\/\s*/, '')

      /*
       * Specificity, by reasoning rather than by measurement: the two arms are
       * selector-list members of the SAME rule, so they carry the same
       * declaration block and an element matching both (`<html class="dark"
       * data-pack="blush">`) resolves to those declarations whichever arm is
       * counted, and the last declaration in a block wins anyway. There is
       * nothing to contest, which is the point of putting them in one rule: the
       * compound arm stays published for a fixed-mode boundary and the
       * descendant arm is added beside it rather than replacing it.
       */
      expect(afterBanner.split('{').length - 1, `themes/${id}/dark.css rule count`).toBe(1)
      expect(blockOf(css).trim().length, `themes/${id}/dark.css block`).not.toBe('')
    }
  })

  it('resolves a mode-less subtree to the document mode, in both modes', () => {
    /*
     * The two arms cover the two positions a boundary can take, expressed here
     * as the two element shapes. `themeSelector` is the single output switch, so
     * asserting on it is asserting on what the build interpolates into
     * `dist/themes/<id>/<mode>.css`.
     */
    for (const id of packIds) {
      // Dark document, mode-less subtree: the descendant arm carries the pack.
      expect(themeSelector(id, 'dark', THEME_SELECTOR_STYLE), id).toContain(
        `.dark [data-pack="${id}"]`,
      )
      // Light document, mode-less subtree: the bare attribute carries the pack.
      expect(themeSelector(id, 'light', THEME_SELECTOR_STYLE), id).toBe(`[data-pack="${id}"]`)
      // A fixed-mode dark boundary on a light document: the compound arm.
      expect(themeSelector(id, 'dark', THEME_SELECTOR_STYLE), id).toContain(`[data-pack="${id}"].dark`)
    }
  })

  it('leaves the two published selector styles byte-identical', () => {
    /*
     * The other two styles are capabilities the design system publishes, and
     * this ticket adds an arm rather than replacing one, so neither may move.
     * These are literal strings on purpose: deriving them from the switch would
     * make the assertion tautological.
     */
    const expected = {
      'root-attribute': { light: ':root[data-pack="sample"]', dark: '.dark[data-pack="sample"]' },
      'root-class': { light: '.prism-pack-sample', dark: '.dark.prism-pack-sample' },
    }

    for (const [style, modes] of Object.entries(expected)) {
      for (const [mode, want] of Object.entries(modes)) {
        expect(themeSelector('sample', mode, style), `${style} ${mode}`).toBe(want)
      }
    }

    // The switch default is still ticket 06's root-scoped template.
    expect(DEFAULT_THEME_SELECTOR_STYLE).toBe('root-attribute')
    expect(themeSelector('sample', 'light')).toBe(':root[data-pack="sample"]')
    expect(themeSelector('sample', 'dark')).toBe('.dark[data-pack="sample"]')
  })
})
