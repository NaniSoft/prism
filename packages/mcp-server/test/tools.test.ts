import { describe, expect, it } from 'vitest'

import { NO_INVENTION_RULE } from '../src/rules.js'
import {
  renderChangelog,
  renderItemDoc,
  renderItemProps,
  renderItemSource,
  renderListPages,
  renderPage,
  renderThemeDoc,
} from '../src/render.js'
import { emptyStore, emptyTokens, makeItem, readStore, readText } from './helpers.js'
import { STORE_SECTION_TITLES } from '@nanisoft/prism-llms'

const store = readStore()

/**
 * The versions a published package's changelog records, newest first.
 *
 * Read from the Store rather than written into a test: the corpus carries the
 * package's own changelog, so the set of versions it records is a fact about the
 * build and not a constant a release has to be taught about. The Store's own
 * guard already refuses a document whose `versions` and `releases` disagree, so
 * this list and the entries under it are one reading.
 */
function recordedVersions(name: string): readonly string[] {
  const changelog = store.changelogs.find((entry) => entry.package === name)
  if (changelog === undefined) {
    throw new Error(`the corpus carries no changelog for ${name}, so nothing can read its versions`)
  }
  return changelog.versions
}

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
      changelogs: [],
      tokens: emptyTokens(),
    }
    const body = readText(renderItemProps(synthetic, { name: 'Select' }))
    expect(body).toContain(seam)
  })

  it('renders both sections for a block, and no longer denies the props it publishes', () => {
    // A Block and a Page publish an interface section AND a composition section.
    // The tool used to read the first and report the second as "has no own
    // props", which is the same lie the published surface existed to remove: the
    // store carried both and the tool described one and denied the other. The
    // assertion on the absence is the load-bearing half: a refactor that
    // restores the sentence fails here even if the composition is still printed.
    const body = readText(renderItemProps(store, { name: 'Hero01' }))
    expect(body).toContain('## Props')
    expect(body).toContain('## Composition')
    expect(body).toContain('props and composition')
    expect(body).not.toContain('has no own props')
  })

  it('renders the composition alone when no interface section is recorded', () => {
    // The both-present branch must not swallow the one-present case, or a future
    // block that records no props would report nothing at all.
    const compositionOnly = {
      ...store,
      items: store.items.map((item) =>
        item.name === 'Hero01' ? { ...item, props: undefined } : item,
      ),
    }
    const body = readText(renderItemProps(compositionOnly, { name: 'Hero01' }))
    expect(body).toContain('## Composition')
    expect(body).not.toContain('## Props')
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
      changelogs: [],
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
    // The selection guidance is a contract, and it was wrong: it told an agent
    // the attribute belongs on `<html>` while the token block printed below it
    // listed the pack's radius, which a subtree also picks up. A reader acting
    // on that string would place a boundary where none is needed and conclude a
    // subtree cannot carry one. The preamble now says the attribute works on any
    // element, says the boundary wears its ancestor's mode, and says it moves the
    // radius too.
    expect(body).toContain('`data-pack="<id>"` on any element makes that element and its subtree a theme boundary')
    expect(body).toContain('It wears the mode of the nearest ancestor carrying `.dark`')
    expect(body).toContain('A boundary also moves the pack corner radius')
    // The wrong form must not survive a refactor that re-adds it.
    expect(body).not.toContain('`data-pack="<id>"` on `<html>`')
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
  it('lists the non-item page lanes, including the Changelogs', () => {
    const body = readText(renderListPages(store))
    // Every group is read from the Store's own Sections rather than from a list of
    // the three prose Sections, so a Section added to the store appears here without
    // this test being edited.
    //
    // The header's count is asserted against the store rather than written down. It
    // was `24 pages` in a literal, and moved to 28 when the Patterns Section joined
    // the Corpus: a hardcoded total fails on every Section added and catches nothing
    // about the listing being right. What matters is that the number an agent reads
    // is the number of pages there are, because a header that disagrees with its own
    // list is the one thing an agent cannot check for itself.
    expect(body).toContain(`# Prism pages - ${store.pages.length} pages`)
    expect(body).toContain('## Overview')
    expect(body).toContain('## Foundation')
    expect(body).toContain('**Quickstart**')
    expect(body).toContain('## Changelogs')
    expect(body).toContain('`/changelogs/prism-ui`')
    // And every Section the store declares has a group, in the order it declares
    // them, so the last one an agent reads is the last Section published.
    const groups = [...body.matchAll(/^## (.+)$/gm)].map((match) => match[1] ?? '')
    expect(groups).toEqual(Object.values(STORE_SECTION_TITLES))
  })

  it('reads a page by canonical URL and by its mirror', () => {
    expect(readText(renderPage(store, { url: '/overview/quickstart' }))).toContain('# Quickstart')
    expect(readText(renderPage(store, { url: '/overview/quickstart.md' }))).toContain('# Quickstart')
  })

  it('reads a changelog route as the package bytes, through get_page too', () => {
    // `get_changelog` is the tool for a changelog, and `get_page` reaches the
    // same bytes because the page and the changelog are one generated file. A
    // route is a route: the Section joining the Corpus is a parameter on the
    // existing tools rather than a rename of them.
    const ui = store.changelogs.find((entry) => entry.package === '@nanisoft/prism-ui')
    const body = readText(renderPage(store, { url: '/changelogs/prism-ui' }))
    expect(body).toContain(ui?.text ?? '')
    expect(body).toContain('## 0.5.0')
  })

  it('points a catalogue item URL at get_item_doc', () => {
    const result = renderPage(store, { url: '/components/button' })
    expect(result.isError).toBe(true)
    expect(readText(result)).toContain('get_item_doc')
  })

  it('misses an unknown page with a browse pointer', () => {
    const result = renderPage(store, { url: '/overview/nope' })
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
      changelogs: [],
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

describe('get_changelog', () => {
  it('returns the package bytes, not a summary of them', () => {
    // The whole reason the ninth tool exists. A published breaking change has to
    // be discoverable by an agent, and a summary is the one thing that drifts
    // the moment a release is published.
    const ui = store.changelogs.find((entry) => entry.package === '@nanisoft/prism-ui')
    const body = readText(renderChangelog(store, { package: '@nanisoft/prism-ui' }))
    expect(body).toContain(ui?.text.trimEnd() ?? '')
    expect(body).toContain('clean break')
    expect(body).toContain('`/changelogs/prism-ui`')
    expect(body).toContain('`/changelogs/prism-ui.md`')
  })

  it('accepts the unscoped name and the route segment, case-insensitively', () => {
    for (const name of ['prism-ui', 'PRISM-UI', '@nanisoft/prism-ui', ' @nanisoft/prism-ui ']) {
      const result = renderChangelog(store, { package: name })
      expect(result.isError, name).toBeFalsy()
      expect(readText(result)).toContain('@nanisoft/prism-ui - changelog')
    }
  })

  it('returns one version entry, and lists what else there is', () => {
    const body = readText(renderChangelog(store, { package: '@nanisoft/prism-ui', version: '0.5.0' }))
    const release = store.changelogs
      .find((entry) => entry.package === '@nanisoft/prism-ui')
      ?.releases.find((entry) => entry.version === '0.5.0')
    expect(body).toContain('# @nanisoft/prism-ui - 0.5.0')
    expect(body).toContain(release?.body ?? '')
  })

  it('names the versions it records when none is asked for', () => {
    // The Store's own version list, newest first as the generator writes it, so
    // the assertion is the presentation rather than today's number. A release
    // that adds an entry to a changelog is picked up here without an edit.
    const recorded = recordedVersions('@nanisoft/prism-llms')
    const body = readText(renderChangelog(store, { package: '@nanisoft/prism-llms' }))
    expect(recorded.length).toBeGreaterThan(0)
    expect(body).toContain(`Versions, newest first as the file records them: ${recorded.join(', ')}.`)
  })

  it('misses an unknown package with the whole published set, not a guess', () => {
    const result = renderChangelog(store, { package: '@nanisoft/prism-nope' })
    expect(result.isError).toBe(true)
    const body = readText(result)
    expect(body).toContain('`@nanisoft/prism-llms`')
    expect(body).toContain('`@nanisoft/prism-ui`')
    expect(body).toContain('`/changelogs/prism-tokens`')
  })

  it('misses an unknown version with the versions the file does record', () => {
    // The predecessor line is not in this system's changelog, so a request for
    // it is a miss that says what is there rather than a fabricated history. The
    // version asked for is still a literal, because the property under test is
    // that a version the file does not carry misses; the versions it answers
    // with are read from the Store rather than written here.
    const recorded = recordedVersions('@nanisoft/prism-ui')
    const absent = '0.4.0'
    expect(recorded).not.toContain(absent)
    const result = renderChangelog(store, { package: '@nanisoft/prism-ui', version: absent })
    expect(result.isError).toBe(true)
    expect(readText(result)).toContain(`It records: ${recorded.join(', ')}.`)
  })

  it('answers for every published package the corpus carries', () => {
    expect(store.changelogs.length).toBeGreaterThan(0)
    for (const entry of store.changelogs) {
      const result = renderChangelog(store, { package: entry.package })
      expect(result.isError, entry.package).toBeFalsy()
      expect(readText(result)).toContain(entry.title)
    }
  })

  it('says so when the build carries no changelog at all', () => {
    const result = renderChangelog(emptyStore(), { package: '@nanisoft/prism-ui' })
    expect(result.isError).toBe(true)
    expect(readText(result)).toContain('no package changelogs')
  })
})
