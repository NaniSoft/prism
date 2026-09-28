import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { parsePrismDocsStore, STORE_SECTIONS, STORE_SECTION_TITLES } from '../src/store.js'

/**
 * The emitted store, validated through the same runtime guard the check gate
 * and the MCP factory door use. `pretest` builds the corpus first.
 */
const raw: unknown = JSON.parse(readFileSync(new URL('../dist/data.json', import.meta.url), 'utf8'))
const store = parsePrismDocsStore(raw)

describe('the emitted PrismDocsStore', () => {
  it('carries the version, the seven-section corpus and the package changelogs', () => {
    expect(store.version).toMatch(/^\d+\.\d+\.\d+/)
    // The item roster is NOT pinned to a number here. It tracks the catalogue,
    // and a literal would fail on every new item, so the response would be to
    // edit this test, which is how a count in a test stops meaning anything.
    // `check-catalogue.mjs` owns the roster: it compares the source tree, the
    // catalogue and the registry in both directions and names any item that
    // differs. What this lane asserts is the property the store itself owes,
    // which is that its items are whole and distinct.
    expect(store.items.length).toBeGreaterThan(0)
    expect(new Set(store.items.map((item) => item.slug)).size).toBe(store.items.length)
    for (const item of store.items) {
      expect(item.slug, JSON.stringify(item)).not.toBe('')
      expect(item.kind, item.slug).not.toBe('')
      expect(item.url, item.slug).toMatch(/^\//)
    }
    expect(store.pages.length).toBeGreaterThan(0)
    // The two token vocabularies ARE closed sets the token package owns, so a
    // literal is the right assertion for them: five packs plus the base, and a
    // pack per mode.
    expect(store.tokens.packs).toHaveLength(6)
    expect(store.tokens.themes).toHaveLength(12)
    // One entry per published package that ships a changelog, discovered from
    // the workspace rather than listed, so the field cannot be quietly empty
    // while the packages exist.
    expect(store.changelogs.length).toBeGreaterThan(0)
    for (const changelog of store.changelogs) {
      expect(changelog.route).toBe(`/changelogs/${changelog.slug}`)
      expect(changelog.title).toBe(changelog.package)
      expect(changelog.versions).toEqual(changelog.releases.map((release) => release.version))
      expect(changelog.text).toContain(`# ${changelog.package}`)
    }
  })

  it('names every content Section it walks', () => {
    // The Section list and the label map are two declarations that have to agree,
    // and a Section with no label would be grouped under an invented name in
    // `llms.txt` and omitted from `list_pages`. The map is typed as
    // `Record<StoreSection, string>`, so the compiler catches the other
    // direction; this catches a map that grew a key nothing walks.
    expect(Object.keys(STORE_SECTION_TITLES).sort()).toEqual([...STORE_SECTIONS].sort())
    expect(store.pages.some((page) => page.section === 'changelogs')).toBe(true)
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

  it('rejects a changelog whose version list disagrees with its own entries', () => {
    // Two views of one reading of the file. A store that carried them out of step
    // would answer `get_changelog` for a version it cannot hand back, and the
    // only place that would not notice is the call site.
    const document = JSON.parse(readFileSync(new URL('../dist/data.json', import.meta.url), 'utf8'))
    document.changelogs[0].versions = ['9.9.9']
    expect(() => parsePrismDocsStore(document)).toThrow(/changelogs\[0\]\.versions/)
  })

  it('rejects a missing changelogs field, because the tool reads it', () => {
    const document = JSON.parse(readFileSync(new URL('../dist/data.json', import.meta.url), 'utf8'))
    delete document.changelogs
    expect(() => parsePrismDocsStore(document)).toThrow(/changelogs/)
  })

  it('rejects a structurally valid document whose kind is widened to string', () => {
    expect(() => parsePrismDocsStore({ version: '1.0.0', items: [{ kind: 'widget' }], pages: [], tokens: {} })).toThrow(
      /items\[0\]\.kind/,
    )
  })
})
