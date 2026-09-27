import { describe, expect, it } from 'vitest'

import { buildCatalog, type CatalogKind } from '@nanisoft/prism-ui/catalog'

import { catalogueSource, KINDS, SECTIONS } from '../src/lib/catalogue'

/**
 * The generated catalogue order, and the routing tree it orders.
 *
 * The site's routing tree cannot be built in this lane, because the macro module
 * `defineDocs` compiles through is a stub that throws unless the bundler plugin
 * compiled it. The generated source can be read, though: it is a plain
 * `StaticSource`, built by `buildCatalog()` and nothing else, and it is the
 * thing the ordering could fall behind. So the Catalogue is read here through
 * its own tooling entry point and the emitted files are compared to it.
 *
 * The comparison is equality, not containment. A hand-written `pages` array that
 * happened to list every slug would pass a containment check and still be a
 * second list with a build that has to be trusted; equality fails the moment the
 * Catalogue and the ordering disagree in either direction, which is the only
 * property that makes the array safe to be a whitelist.
 */

const files = catalogueSource.files
const catalogue = buildCatalog()

const orderFor = (kind: CatalogKind) => {
  const file = files.find(
    (entry) => entry.type === 'meta' && entry.path === `${SECTIONS[kind].segment}/meta.json`,
  )
  if (!file || file.type !== 'meta') throw new Error(`no generated order for ${kind}`)
  return file.data.pages ?? []
}

describe('the generated catalogue order', () => {
  it.each(KINDS)('is the %s section of the Catalogue, in the Catalogue order', (kind) => {
    expect(orderFor(kind)).toEqual(
      catalogue.filter((item) => item.kind === kind).map((item) => item.slug),
    )
  })

  it.each(KINDS)('claims every %s and invents none', (kind) => {
    const order = orderFor(kind)
    const slugs = catalogue.filter((item) => item.kind === kind).map((item) => item.slug)
    expect(order).toHaveLength(slugs.length)
    expect(new Set(order).size).toBe(order.length)
    for (const slug of order) expect(slugs).toContain(slug)
  })

  it.each(KINDS)('leaves the %s Section index to the folder lookup', (kind) => {
    // Naming the index page in the ordering would take the folder's automatic
    // `index.mdx` lookup away, which is the route a group heading links to, and
    // would list the landing page as a child of itself.
    const segment = SECTIONS[kind].segment
    expect(orderFor(kind)).not.toContain(segment)
    expect(
      files.some((file) => file.type === 'page' && file.path === `${segment}/index.mdx`),
    ).toBe(true)
  })

  it('claims every Item exactly once across the three Sections', () => {
    const claimed = KINDS.flatMap((kind) => orderFor(kind))
    expect(claimed).toHaveLength(catalogue.length)
    expect(new Set(claimed).size).toBe(catalogue.length)
  })
})

describe('the generated routing tree', () => {
  it('emits one page per Item plus one Section index per Kind', () => {
    const pages = files.filter((file) => file.type === 'page')
    expect(pages).toHaveLength(catalogue.length + KINDS.length)
  })

  it('claims no virtual path twice, which resolves by write order otherwise', () => {
    const paths = files.map((file) => file.path)
    expect(new Set(paths).size).toBe(paths.length)
  })

  it('carries a meta file only for a Section that has an index to look up', () => {
    for (const file of files) {
      if (file.type !== 'meta') continue
      const segment = file.path.replace(/\/meta\.json$/, '')
      expect(
        files.some((entry) => entry.type === 'page' && entry.path === `${segment}/index.mdx`),
      ).toBe(true)
    }
  })
})
