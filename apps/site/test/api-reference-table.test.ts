/**
 * The API table's vocabulary, and the two things a reader of 270 pages gets wrong
 * without it.
 *
 * **The marker said nothing, said it backwards, and said it in a glyph.** An
 * optional prop was drawn with a bare `?`, and nothing on the page said what that
 * meant: a screen reader announced it as "question mark", and a reader who had
 * learned `*` from a Prism `Label`, where `*` means a field you must fill in, met
 * the same idea drawn the other way round with nothing to reconcile the two. The
 * mark has moved to the required prop, where the site's own convention already put
 * it, and the word a screen reader hears is now the word rather than a piece of
 * punctuation. `api-table.tsx` states the reasoning; this file holds it.
 *
 * **The table had no name.** Its column headers were `scope="col"` and correct,
 * which is half of naming a table, and the other half is absent: a reader listing
 * the tables on `accordion` found five of them and could not tell `AccordionItem`
 * from `AccordionTrigger` from the list alone. `Table`'s JSDoc asks for a caption
 * unless an adjacent heading names the table, and the heading above names the
 * SECTION. So each table is captioned with the Item and the part.
 *
 * **Why the real component and the real data.** `renderToStaticMarkup` over
 * `ApiTable` with `slug` read out of the catalogue, not a fixture: this is the
 * reference table for every Item, so the rows that decide the question are rows
 * `scripts/generate-api.mjs` really extracted from the emitted declarations. A prop
 * that turns optional is a change in this file's expectations and not something it
 * has to be told about, and `pretest` regenerates the data the test reads.
 *
 * **What jsdom cannot answer, stated once, and it is most of the accessibility
 * claim.** There is no accessibility tree here and no CSS engine, so this lane can
 * hold that the words are IN the markup, in the right cell, attached to the right
 * prop, and that the glyph that carries them visually is marked `aria-hidden`. It
 * cannot hold that `sr-only` actually hides the word, that a screen reader reads
 * ", required" as a pause rather than as "comma required", or that a table list
 * offers the caption as an entry. `apps/site/e2e/display.spec.ts` runs axe over a
 * real browser and is the lane that settles those; this lane is what keeps the
 * information in the document in the first place, which is the part that was
 * missing.
 */

import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { ApiTable } from '../src/components/api-table'

/** The table for an Item, as the export really writes it. */
function render(slug: string): string {
  return renderToStaticMarkup(createElement(ApiTable, { slug }))
}

/** The `<td>` whose first text node is the prop called `prop`. */
function cellFor(markup: string, prop: string): string {
  const rows = markup.match(/<tr class="border-border[^"]*">[\s\S]*?<\/tr>/g) ?? []
  for (const row of rows) {
    const cells = row.match(/<td[^>]*>[\s\S]*?<\/td>/g) ?? []
    const first = cells[0] ?? ''
    // The prop name is the first text in the cell and the mark follows it, so a
    // prefix match is the identity rather than a containment that would also match
    // a prop whose name is a prefix of another's.
    if (first.replace(/<[^>]*>/g, '').trimStart().startsWith(`${prop}`)) return first
  }
  throw new Error(
    `no row in the rendered table starts with the prop ${JSON.stringify(prop)}. ` +
      'The catalogue the table reads has changed, or this file is measuring a ' +
      'different table than the one it was written against.',
  )
}

describe('the API reference table', () => {
  it('says required and optional in words, not in punctuation', () => {
    const markup = render('progress')
    // `value` is required and `max` is optional in the emitted declaration, and
    // they are the two cases the marker used to get wrong.
    expect(cellFor(markup, 'value')).toContain('required')
    expect(cellFor(markup, 'max')).toContain('optional')
    // And the question mark is gone from the whole document. A glyph that no
    // legend explains is the defect, so its absence is the assertion rather than a
    // detail: a reader who meets "?" on a page again has found a regression.
    expect(markup).not.toContain('?')
  })

  it('hides the mark it shows and shows the word it hides', () => {
    const markup = render('progress')
    const required = cellFor(markup, 'value')
    // The `*` is for a reader who can see it, and is hidden from a reader who
    // cannot need it: hearing "asterisk" before "required" is a name with a
    // decoration on the end of it, which is the mistake `Label` documents at
    // length.
    expect(required).toContain('aria-hidden')
    expect(required).toContain('*')
    // `sr-only` on the word, and the word is the only thing an optional row has:
    // there is no glyph to hide there, so there is nothing that could be heard in
    // place of the word.
    const optional = cellFor(markup, 'max')
    expect(optional).toContain('sr-only')
    expect(optional).not.toContain('aria-hidden')
    expect(optional).not.toContain('*')
  })

  it('states what the mark means, once, in a sentence', () => {
    const markup = render('progress')
    const legend = markup.match(/<p class="text-muted-foreground text-sm">[\s\S]*?<\/p>/g) ?? []
    const said = legend.filter((line) => line.includes('marks a prop you have to pass'))
    expect(said).toHaveLength(1)
    // And its own `*` is hidden for the reason the cells' is, which is asserted
    // here rather than assumed: a legend that announces "asterisk marks a prop you
    // have to pass" is worse than no legend.
    expect(said[0]).toContain('aria-hidden')
    expect(said[0]).not.toContain('sr-only')
  })

  it('names every table, and the name says which part it is about', () => {
    // The compound case, because it is the one the adjacent heading does not
    // resolve: `accordion` has five exports, three of them have rows and so become
    // tables, and the heading above all three says the same two words.
    const markup = render('accordion')
    const captions = markup.match(/<caption[^>]*>([\s\S]*?)<\/caption>/g) ?? []
    expect(captions).toHaveLength(3)
    expect(captions.every((caption) => caption.includes('sr-only'))).toBe(true)
    const names = captions.map((caption) => caption.replace(/<[^>]*>/g, '').trim())
    expect(names).toContain('AccordionItem props')
    expect(names).toContain('AccordionContent props')
    // Distinct, because a table list offering five names of which two are the same
    // has been given a name that is not one.
    expect(new Set(names).size).toBe(names.length)
  })

  it('names the simple table with the one export it is about', () => {
    // The single-export case, where the section heading and the page title would
    // otherwise be the only names in play and neither belongs to the table.
    expect(render('progress')).toContain('<caption class="sr-only">Progress props</caption>')
  })

  it('draws no caption and no legend for an Item with no rows at all', () => {
    // `card` is six exports and none of them has a documented prop, so there is no
    // table to name. A caption on a table that does not exist, or a legend under no
    // table, is the shape this change could have left behind.
    const markup = render('card')
    expect(markup).toContain('Inherits')
    expect(markup).not.toContain('<caption')
    expect(markup).not.toContain('marks a prop you have to pass')
  })

  it('keeps the column headers scoped to their column', () => {
    // The half of naming a table that was already right, held here because the
    // caption was added beside it and the two together are the whole claim.
    const markup = render('progress')
    expect((markup.match(/<th scope="col"/g) ?? []).length).toBe(4)
    // And the caption is the first child, which the element requires and a reader
    // of the markup is entitled to assume.
    const table = /<table[^>]*>([\s\S]*?)<thead/.exec(markup)
    expect(table?.[1].trimStart().startsWith('<caption')).toBe(true)
  })
})