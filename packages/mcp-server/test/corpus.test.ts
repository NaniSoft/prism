import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { BUILT, BUILT_CORPUS } from '../src/generated/built.js'
import { renderChangelog, renderItemDoc, renderPage } from '../src/render.js'
import { BUNDLED_PATH, CORPUS_PATH, readCorpusRaw, readStore, readText } from './helpers.js'
import { STORE_SECTIONS } from '@nanisoft/prism-llms'

const store = readStore()

function sha256(path: URL): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex')
}

describe('the bundled corpus', () => {
  it('matches packages/llms/dist/data.json byte for byte', () => {
    expect(sha256(BUNDLED_PATH)).toBe(sha256(CORPUS_PATH))
  })

  it('parses through the inherited guard', () => {
    // The roster is not pinned to a number: it tracks the catalogue, and
    // `check-catalogue.mjs` owns the count and names any item that differs. What
    // this lane asserts is that the bundled corpus is whole and distinct, which
    // is the property a consumer of the tools actually depends on.
    expect(store.items.length).toBeGreaterThan(0)
    expect(new Set(store.items.map((item) => item.id)).size).toBe(store.items.length)
    // Prose pages plus the generated changelog routes.
    //
    // Asserted as a shape rather than as a total. The count moved from 24 to 28 when
    // the Patterns Section joined the Corpus, and a hardcoded total is a snapshot
    // that fails every time a Section is added while catching nothing about the
    // Corpus being right. The invariant worth holding is that every page belongs to a
    // Section the store declares, and that the ids are unique: a page filed under a
    // Section nobody published is a page an agent cannot ask for by Section, and a
    // duplicate id is two pages answering to one name.
    expect(store.pages.length).toBeGreaterThan(0)
    for (const page of store.pages) {
      expect(STORE_SECTIONS, `${page.id} is filed under an undeclared Section`).toContain(
        page.section,
      )
    }
    expect(new Set(store.pages.map((page) => page.id)).size).toBe(store.pages.length)
    // The Changelogs Section is the one that generates its routes rather than
    // reading them from files, so it is the one whose presence has to be earned: one
    // route per changelog, and no more.
    expect(store.pages.filter((page) => page.section === 'changelogs')).toHaveLength(
      store.changelogs.length,
    )
    expect(store.changelogs.length).toBeGreaterThan(0)
  })

  it('reaches every published package changelog through get_changelog', () => {
    for (const changelog of store.changelogs) {
      const result = renderChangelog(store, { package: changelog.package })
      expect(result.isError, `${changelog.package} is unreachable`).toBeFalsy()
      expect(readText(result)).toContain(changelog.text.trimEnd())
    }
  })

  it('stamps the corpus version the store carries', () => {
    expect(BUILT_CORPUS).toBe(store.version)
    if (BUILT !== undefined) expect(BUILT).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('reaches every catalogue item through get_item_doc', () => {
    for (const item of store.items) {
      const result = renderItemDoc(store, { name: item.name, kind: item.kind })
      expect(result.isError, `${item.kind} ${item.name} is unreachable`).toBeFalsy()
    }
  })

  it('reaches every documentation page through get_page', () => {
    for (const page of store.pages) {
      const result = renderPage(store, { url: page.url })
      expect(result.isError, `page ${page.url} is unreachable`).toBeFalsy()
    }
  })

  it('sees the same corpus through the raw payload', () => {
    expect(Object.keys(readCorpusRaw() as object)).toContain('items')
  })
})
