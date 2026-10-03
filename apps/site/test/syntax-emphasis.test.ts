/**
 * The syntax theme's emphasis, and whether any of it reaches a reader.
 *
 * **The defect this is for shipped, in a file whose comment said the opposite.**
 * The shiki theme has declared `fontStyle: 'italic'` for a comment and
 * `fontStyle: 'bold'` for a keyword since it was written, and the module header
 * above it says so in prose: keywords at bold weight, comments in italic. The
 * mapper read each token into a text and a colour and dropped the third field, so
 * neither the italic comments nor the bold keywords had ever rendered, and the
 * header described an output the code did not produce. Every code panel on this
 * site was three inks and no weight.
 *
 * **Why the two halves are in one test rather than two.** A mapper that drops a
 * field and a panel that ignores a field are the same defect seen from two ends,
 * and each half alone can pass while the other is broken: a test over the token
 * model says nothing about the document, and a test over the document would have
 * to re-tokenise to know what it was looking at. So the real `highlight()` produces
 * the model, the real `CodePanel` draws it, and `renderToStaticMarkup` is the seam
 * between them. Neither end is stubbed, which means a change to the theme, the
 * mapper or the panel is a change to what this measures rather than something this
 * file has to be told about.
 *
 * **The bitmask, and why the numbers are not in the assertions.** shiki's
 * `ThemedToken.fontStyle` is a numeric `FontStyle` enum, and with
 * `defaultColor: false` the token carries the number and no `htmlStyle`: the
 * `font-style: italic` string only exists inside shiki's own HTML renderer, which
 * this site does not call. Asserting on the number would be asserting the
 * mapper's private reading of an upstream enum. So every expectation here is the
 * OUTCOME, on the DOM, for a token whose role is known from the source that was
 * highlighted, and the whole token row is asserted so a role that trades places
 * with another one fails rather than passing.
 *
 * **The limits, at the end rather than in a footnote.** Three of them, and none is
 * a caveat about the answer.
 *
 *   - This lane has no `apps/site/out`; it runs before `pnpm build`. So nothing
 *     here reads an exported document, and `pnpm check` is the lane that reads the
 *     export the reader receives.
 *   - It cannot see a synthesised oblique. The panel is set in `--font-mono`, which
 *     names no shipped face, so a browser draws that italic by slanting the
 *     reader's own monospaced face. Whether that reads well is a question for
 *     `apps/site/e2e/display.spec.ts`, which is a real browser.
 *   - It cannot see contrast. `font-style` and `font-weight` carry no luminance, so
 *     `scripts/check-contrast.mjs` reads the same pairs either way and neither
 *     asserts nor forbids anything here. The two inks are unchanged and remain
 *     measured against the ground they paint on.
 */

import { readFileSync } from 'node:fs'

import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { CodePanel } from '../src/components/code-panel'
import { highlight, type HighlightedToken } from '../src/lib/highlight'

/**
 * Three lines chosen for the roles the theme separates.
 *
 * A comment, a keyword, an assignment operator and a numeric literal, each on a
 * line with something else on it, because the operator is the interesting third
 * case: TextMate scopes it `keyword.operator`, so the theme's own `keyword` list
 * makes it bold, and it is not a word. A test that chose only `const` and `//`
 * would pass a theme that emboldened words and nothing else.
 */
const SOURCE = ['// the ledger settles', 'export const total = 42', 'const label = total'].join('\n')

/** The panel `CodePanel` really draws for `SOURCE`, as static markup. */
async function panel(): Promise<string> {
  const lines = await highlight(SOURCE)
  return renderToStaticMarkup(createElement(CodePanel, { filename: 'ledger.tsx', lines }))
}

/** The opening tag of the single `<span>` in `markup` whose content is `text`. */
function spanWrapping(markup: string, text: string): string {
  const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = new RegExp(`<span style="([^"]*)">${escaped}</span>`).exec(markup)
  if (match === null) {
    throw new Error(
      `no <span> in the rendered panel wraps ${JSON.stringify(text)} on its own. ` +
        'The token text is the identity of a token, so a renderer that split it has ' +
        'changed what this file is measuring.',
    )
  }
  return match[1]
}

describe('the syntax theme', () => {
  it('asks for an italic comment and no other emphasis on its line', async () => {
    expect((await highlight(SOURCE))[0].tokens).toEqual([
      { text: '// the ledger settles', colour: 'var(--muted-foreground)', italic: true },
    ] satisfies HighlightedToken[])
  })

  it('asks for a bold keyword and an upright literal beside it', async () => {
    // The whole row, not a token. A mapper that gave every token the comment's
    // slant would satisfy an assertion on the comment alone, and a mapper that
    // swapped the two roles would satisfy one assertion on either, so the row is
    // what holds them apart.
    expect((await highlight(SOURCE))[1].tokens).toEqual([
      { text: 'export', colour: 'var(--brand-ink)', bold: true },
      { text: ' ', colour: 'var(--foreground)' },
      { text: 'const', colour: 'var(--brand-ink)', bold: true },
      { text: ' total ', colour: 'var(--foreground)' },
      { text: '=', colour: 'var(--brand-ink)', bold: true },
      { text: ' ', colour: 'var(--foreground)' },
      { text: '42', colour: 'var(--brand-ink)' },
    ] satisfies HighlightedToken[])
  })

  it('leaves an identifier upright and gives no token both emphases', async () => {
    // The negative half, and the reason the flags are absent rather than false: a
    // mapper that emitted `italic: false` on everything would put `font-style:
    // normal` on every token in the export, which is a claim the theme never made.
    const lines = await highlight(SOURCE)
    const identifiers = lines[2].tokens.filter((token) => [' label ', ' total'].includes(token.text))
    expect(identifiers.map((token) => token.text)).toEqual([' label ', ' total'])
    for (const token of identifiers) {
      expect(
        'italic' in token || 'bold' in token,
        `${JSON.stringify(token.text)} is an identifier and the theme gives it neither`,
      ).toBe(false)
    }
    // Across every token of every line: the italic belongs to comments and nothing
    // else, and no role in the theme carries both at once. A mapper that OR-ed the
    // mask into one flag would satisfy each assertion above and fail this.
    const all = lines.flatMap((line) => line.tokens)
    expect(all.filter((token) => token.italic).map((token) => token.text)).toEqual([
      '// the ledger settles',
    ])
    expect(all.filter((token) => token.italic && token.bold)).toEqual([])
  })

  it('draws the emphasis on the document rather than leaving it in the model', async () => {
    const markup = await panel()
    const comment = spanWrapping(markup, '// the ledger settles')
    const keyword = spanWrapping(markup, 'export')
    const literal = spanWrapping(markup, '42')
    const identifier = spanWrapping(markup, ' total ')

    expect(comment).toContain('font-style:italic')
    expect(comment).not.toContain('font-weight')
    expect(keyword).toContain('font-weight:bold')
    expect(keyword).not.toContain('font-style')
    // Unemphasised tokens carry neither, so the absence is in the export rather
    // than something a stylesheet has to be consulted to learn.
    expect(literal).not.toContain('font-style')
    expect(literal).not.toContain('font-weight')
    expect(identifier).not.toContain('font-style')
    expect(identifier).not.toContain('font-weight')
    // And the ink still rides on the same declaration, which is what lets the
    // panel re-theme with the pack.
    expect(comment).toContain('color:var(--muted-foreground)')
    expect(keyword).toContain('color:var(--brand-ink)')
  })

  it('leaves no retired shiki custom property and no literal colour in the export', async () => {
    // The second half of the dual-theme question. This theme is expressed in Prism
    // custom properties and the call site passes `defaultColor: false`, which is
    // what stops shiki wrapping a token in a light and a dark pair. When it did
    // wrap them, every token carried `--shiki-light` and `--shiki-dark` holding a
    // literal hex, which is the exact thing the theme's own header says cannot
    // happen: there is no second answer to what a keyword is. That mechanism is
    // retired, so a single surviving mention is a finding, and a hex value is the
    // same failure wearing a different hat.
    const markup = await panel()
    expect(markup.match(/--shiki-[a-z-]+/g) ?? []).toEqual([])
    expect(markup.match(/#[0-9a-fA-F]{3,8}\b/g) ?? []).toEqual([])
  })

  it('declares the emphasis on the scopes the theme names and reads both of them', async () => {
    // The theme is the authority for a token's role, so a scope that stops being
    // italic or stops being bold is a change to what a reader sees. Read from the
    // source, because the source is what a reader of this repository reads.
    const source = readFileSync(new URL('../src/lib/highlight.ts', import.meta.url), 'utf8')
    expect(source).toContain("fontStyle: 'italic'")
    expect(source).toContain("fontStyle: 'bold'")
    // And the mapper reads both axes rather than one. A mapper that read the mask
    // and used one bit would pass every assertion above and fail this.
    expect(source).toMatch(/mask & ITALIC/)
    expect(source).toMatch(/mask & BOLD/)
  })
})