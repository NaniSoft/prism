import { describe, expect, it } from 'vitest'

import { NO_INVENTION_RULE } from '../src/rules.js'
import {
  renderItemDoc,
  renderItemProps,
  renderItemSource,
  renderListPages,
  renderPage,
  renderThemeDoc,
} from '../src/render.js'
import { emptyTokens, makeItem, readStore, readText } from './helpers.js'

const store = readStore()

describe('get_item_props', () => {
  it('renders the native seam line for a native-backed component', () => {
    const result = renderItemProps(store, { name: 'Input' })
    const body = readText(result)
    expect(result.isError).toBeFalsy()
    expect(body).toContain('Extends: the native `<input>` element.')
    expect(body).toContain('This is the complete public Prism API for `Input`')
  })

  it('renders the no-own-props seam line verbatim from the spec', () => {
    const seam =
      '_No additional props beyond the internal Base UI `Select` primitive._'
    const synthetic = {
      version: '1.0.0',
      items: [makeItem({ name: 'Select', kind: 'component', props: `## Props\n\n${seam}` })],
      pages: [],
      tokens: emptyTokens(),
    }
    const body = readText(renderItemProps(synthetic, { name: 'Select' }))
    expect(body).toContain(seam)
  })

  it('renders the composition section for a block', () => {
    const body = readText(renderItemProps(store, { name: 'Hero01' }))
    expect(body).toContain('## Composition')
    expect(body).toContain('has no own props')
  })
})

describe('get_item_source', () => {
  it('returns the verbatim demo plus the public import line', () => {
    const button = store.items.find((item) => item.name === 'Button')
    const body = readText(renderItemSource(store, { name: 'Button' }))
    expect(body).toContain('```tsx')
    expect(body).toContain(button?.importLine ?? '')
    expect(body).toContain(button?.example?.code.replace(/\n$/, '') ?? '')
    expect(body).toContain('This demo is self-contained')
  })

  it('errors and points at get_item_doc when there is no demo', () => {
    const synthetic = {
      version: '1.0.0',
      items: [makeItem({ name: 'Ghost', kind: 'component' })],
      pages: [],
      tokens: emptyTokens(),
    }
    const result = renderItemSource(synthetic, { name: 'Ghost' })
    expect(result.isError).toBe(true)
    expect(readText(result)).toContain('get_item_doc')
  })
})

describe('get_theme_doc', () => {
  it('answers the default semantic set with the selection mechanism', () => {
    const body = readText(renderThemeDoc(store, {}))
    expect(body).toContain('# Prism theme: default / light')
    expect(body).toContain('--background: #ffffff')
    expect(body).toContain('default, blush, mint, lavender, sky, peach')
    expect(body).toContain('`data-pack="<id>"` on `<html>`')
    expect(body).toContain(NO_INVENTION_RULE)
  })

  it('answers an explicit pack and mode', () => {
    const body = readText(renderThemeDoc(store, { pack: 'blush', mode: 'dark' }))
    expect(body).toContain('# Prism theme: blush / dark')
    expect(body).toContain('--background: #1b1718')
    expect(body).not.toContain('# Prism theme: default / light')
  })

  it('answers each bound scale', () => {
    expect(readText(renderThemeDoc(store, { group: 'motion' }))).toContain(
      '--duration-fast: 80ms (binding: --transition-duration-fast)',
    )
    expect(readText(renderThemeDoc(store, { group: 'typography' }))).toContain('--font-sans')
    expect(readText(renderThemeDoc(store, { group: 'spacing' }))).toContain('--spacing:')
    expect(readText(renderThemeDoc(store, { group: 'shadow' }))).toContain('--shadow-md')
    expect(readText(renderThemeDoc(store, { group: 'breakpoint' }))).toContain('--breakpoint-xl: initial')
    expect(readText(renderThemeDoc(store, { group: 'container' }))).toContain('--container-measure')
  })

  it('answers the semantic group explicitly and errors on an unknown mode', () => {
    const semantic = readText(renderThemeDoc(store, { group: 'semantic' }))
    expect(semantic).toContain('# Prism theme: default / light')
    expect(semantic).toContain('--background: #ffffff')
    const mode = renderThemeDoc(store, { mode: 'twilight' })
    expect(mode.isError).toBe(true)
    expect(readText(mode)).toContain('Valid modes')
  })

  it('errors with the valid values for an unknown pack or group', () => {
    const pack = renderThemeDoc(store, { pack: 'nope' })
    expect(pack.isError).toBe(true)
    expect(readText(pack)).toContain('Valid packs')
    const group = renderThemeDoc(store, { group: 'nope' })
    expect(group.isError).toBe(true)
    expect(readText(group)).toContain('Valid groups')
  })
})

describe('list_pages and get_page', () => {
  it('lists the non-item page lanes', () => {
    const body = readText(renderListPages(store))
    expect(body).toContain('# Prism pages - 20 pages')
    expect(body).toContain('## Guides')
    expect(body).toContain('**Quickstart**')
  })

  it('reads a page by canonical URL and by its mirror', () => {
    expect(readText(renderPage(store, { url: '/docs/quickstart' }))).toContain('# Quickstart')
    expect(readText(renderPage(store, { url: '/docs/quickstart.md' }))).toContain('# Quickstart')
  })

  it('points a catalogue item URL at get_item_doc', () => {
    const result = renderPage(store, { url: '/components/button' })
    expect(result.isError).toBe(true)
    expect(readText(result)).toContain('get_item_doc')
  })

  it('misses an unknown page with a browse pointer', () => {
    const result = renderPage(store, { url: '/docs/nope' })
    expect(result.isError).toBe(true)
    expect(readText(result)).toContain('list_pages')
  })
})

describe('lookup', () => {
  it('is case-insensitive by name and slug', () => {
    expect(readText(renderItemDoc(store, { name: 'bUtToN' }))).toContain('# Button')
    expect(readText(renderItemDoc(store, { name: 'BUTTON' }))).toContain('# Button')
  })

  it('disambiguates a name shared across kinds', () => {
    const synthetic = {
      version: '1.0.0',
      items: [
        makeItem({ name: 'Card', kind: 'component' }),
        makeItem({ name: 'Card', kind: 'block' }),
      ],
      pages: [],
      tokens: emptyTokens(),
    }
    const ambiguous = renderItemDoc(synthetic, { name: 'Card' })
    expect(ambiguous.isError).toBe(true)
    expect(readText(ambiguous)).toContain('more than one kind')
    const resolved = renderItemDoc(synthetic, { name: 'Card', kind: 'component' })
    expect(resolved.isError).toBeFalsy()
    expect(readText(resolved)).toContain('# Card')
  })
})
