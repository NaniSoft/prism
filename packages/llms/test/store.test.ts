import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { parsePrismDocsStore } from '../src/store.js'

/**
 * The emitted store, validated through the same runtime guard the check gate
 * and the MCP factory door use. `pretest` builds the corpus first.
 */
const raw: unknown = JSON.parse(readFileSync(new URL('../dist/data.json', import.meta.url), 'utf8'))
const store = parsePrismDocsStore(raw)

describe('the emitted PrismDocsStore', () => {
  it('carries the version and the six-section corpus', () => {
    expect(store.version).toMatch(/^\d+\.\d+\.\d+/)
    expect(store.items).toHaveLength(42)
    expect(store.pages.length).toBeGreaterThan(0)
    expect(store.tokens.packs).toHaveLength(6)
    expect(store.tokens.themes).toHaveLength(12)
  })

  it('projects the closed kind union', () => {
    const kinds = new Set(store.items.map((item) => item.kind))
    expect([...kinds].sort()).toEqual(['block', 'component', 'page'])
  })

  it('keeps a Component kind from widening to string at compile time', () => {
    const first = store.items[0]
    if (!first) throw new Error('no items')
    // @ts-expect-error kind is the closed union, so 'widget' has no overlap
    if (first.kind === 'widget') throw new Error('unreachable')
  })
})

describe('parsePrismDocsStore', () => {
  it('rejects an unknown kind with the offending path', () => {
    const document = JSON.parse(readFileSync(new URL('../dist/data.json', import.meta.url), 'utf8'))
    document.items[12].kind = 'widget'
    expect(() => parsePrismDocsStore(document)).toThrow(/items\[12\]\.kind/)
  })

  it('rejects a non-string kind', () => {
    const document = JSON.parse(readFileSync(new URL('../dist/data.json', import.meta.url), 'utf8'))
    document.items[3].kind = 42
    expect(() => parsePrismDocsStore(document)).toThrow(/items\[3\]\.kind/)
  })

  it('rejects a missing kind', () => {
    const document = JSON.parse(readFileSync(new URL('../dist/data.json', import.meta.url), 'utf8'))
    delete document.items[0].kind
    expect(() => parsePrismDocsStore(document)).toThrow(/items\[0\]\.kind/)
  })

  it('rejects a structurally valid document whose kind is widened to string', () => {
    expect(() => parsePrismDocsStore({ version: '1.0.0', items: [{ kind: 'widget' }], pages: [], tokens: {} })).toThrow(
      /items\[0\]\.kind/,
    )
  })
})
