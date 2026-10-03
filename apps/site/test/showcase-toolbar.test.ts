/**
 * The showcase toolbar's markup, which is the half of it this lane can hold.
 *
 * **Why this file exists at all when the finding was a keyboard one.** `apps/site`
 * has no jsdom lane: `vitest.config.ts` is `environment: 'node'` and collects only
 * `.ts`, so there is no `render`, no `fireEvent` and no `userEvent` here.
 * `renderToStaticMarkup` is this lane's own tool, and what it can prove is that the
 * attributes and the roles are in the document. That is not nothing: before the fix
 * the mode radio carried no `tabIndex` at all, so it was in the tab order
 * unconditionally, and its only name was a `title` on a glyph the markup marks
 * `aria-hidden`. Both of those are visible in a string.
 *
 * **What it cannot prove, and it is the whole of the finding.** Nothing here fires a
 * key. The `onKeyDown` that opens the popup, moves the highlight, closes on Escape
 * and hands focus back to the trigger is asserted by reading it, not by running it,
 * and `apps/site/e2e/display.spec.ts` over a real browser is the lane that settles
 * it. This lane is what keeps the tab order and the names in the document, which is
 * the part that was missing.
 *
 * **The three controls, and what each is asserted on.** The pack trigger is a
 * combobox that points at its listbox only while it is open. The mode and width rows
 * are radiogroups whose single Tab stop is on the checked member, which is the same
 * rule `ToggleGroup` applies. And every member of the mode row is named in words
 * rather than by a tooltip.
 */
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { ShowcaseToolbar } from '../src/components/showcase-toolbar'

function render(props: Partial<Parameters<typeof ShowcaseToolbar>[0]> = {}): string {
  return renderToStaticMarkup(
    createElement(ShowcaseToolbar, {
      pack: 'prism',
      onPack: () => undefined,
      mode: 'light',
      onMode: () => undefined,
      width: 'auto',
      onWidth: () => undefined,
      showResolution: true,
      ...props,
    }),
  )
}

describe('the showcase toolbar', () => {
  it('points the pack trigger at its listbox only while the listbox is there', () => {
    const closed = render()
    // `aria-expanded="false"` and no `aria-controls`: there is no popup, so there is
    // nothing to control. The id is generated per instance, so it is asserted by its
    // presence rather than by its value.
    expect(closed).toContain('role="combobox"')
    expect(closed).toContain('aria-expanded="false"')
    expect(closed).not.toContain('aria-controls')
    expect(closed).not.toContain('role="listbox"')
  })

  it('holds one tab stop per radio row, on the checked member', () => {
    const markup = render({ mode: 'dark', width: '834' })

    // Two members on the mode row and four on the width row, and two tab stops. Before
    // the fix every member was in the tab order, so a reader tabbed six times to cross
    // a bar of six controls and none of the arrows did anything.
    const radios = markup.match(/<button[^>]*role="radio"[^>]*>/g) ?? []
    expect(radios).toHaveLength(6)
    expect(radios.filter((tag) => tag.includes('tabindex="0"'))).toHaveLength(2)

    // And the stops are on the answers rather than on the first member of each row,
    // which is what a keyboard reader arriving from the preview needs.
    const checked = radios.filter((tag) => tag.includes('aria-checked="true"'))
    expect(checked).toHaveLength(2)
    for (const tag of checked) expect(tag).toContain('tabindex="0"')

    // Dark is the second of the two modes, so the mode row's stop is not its first
    // member: this is what would fail if the stop were simply `index === 0`.
    expect(markup).toContain('aria-label="Preview mode"')
    expect(markup).toContain('aria-label="Preview width"')
    expect(
      markup.indexOf('aria-label="Show the preview in dark mode"'),
    ).toBeGreaterThan(markup.indexOf('aria-label="Show the preview in light mode"'))
  })

  it('names every member of the mode row in words, not by a tooltip', () => {
    const markup = render()
    // A `title` is the last thing the accname algorithm reaches for, and the glyph
    // beside it is `aria-hidden`, so before this the row announced as two unnamed
    // radios.
    const labels = markup.match(/role="radio"[^>]*aria-label="[^"]+"/g) ?? []
    expect(labels).toHaveLength(2)
    expect(markup).toContain('aria-label="Show the preview in light mode"')
    expect(markup).toContain('aria-label="Show the preview in dark mode"')
  })

  it('draws no popup and no tab stops of its own when there is one radio', () => {
    const markup = render({ showResolution: false })
    expect(markup.match(/role="radio"/g) ?? []).toHaveLength(2)
    expect(markup.match(/tabindex="0"/g) ?? []).toHaveLength(1)
    expect(markup).not.toContain('aria-label="Preview width"')
  })
})
