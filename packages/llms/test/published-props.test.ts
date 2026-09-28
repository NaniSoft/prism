import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { emit } from '../scripts/build.mjs'
import { extractExports } from '../src/extractor.js'

/**
 * The published props of every Page, read off a corpus this test emits itself.
 *
 * The claim under test is that the corpus tells an agent what a Page's own
 * interface is. It is checked against the real build rather than against the
 * extractor alone, because the defect this replaces was not in the extractor.
 * `readDeclarations()` walked the `from '...'` occurrences of an `index.tsx` and
 * appended the sibling's declaration once per occurrence, so an `index.tsx` that
 * re-exports a value and then re-exports a type from the same sibling put that
 * sibling's `.d.ts` into the text twice. The extractor's `findTypeBodies` scans
 * from the FIRST `type` declaration it matches to the first terminator that
 * closes nothing it opened, so the second copy lay inside the first copy's scan:
 * every prop was published twice, and the named types that sit between them were
 * swept into the Page's own rows.
 *
 * The published result said `DocsShell` takes `type`, `items`, `previous` and
 * `next`, which are members of its navigation union and its pager labels and not
 * props of the Page at all. A consumer reading the surface would compose a
 * documentation screen out of four props that do not exist and would find the
 * thirteen that do listed twice.
 *
 * Nothing else in the repository could see it. Every other Page keeps its
 * declaration in its own `index.tsx`, so its emitted `index.d.ts` is one module
 * and the loop finds one sibling and reads it once.
 */

let outDir: string
let store: { items: Array<{ slug: string; props?: string; composition?: string }> }

beforeAll(async () => {
  outDir = await mkdtemp(path.join(tmpdir(), 'prism-llms-props-'))
  await emit(outDir)
  store = JSON.parse(await readFile(path.join(outDir, 'data.json'), 'utf8'))
}, 180_000)

afterAll(async () => {
  await rm(outDir, { recursive: true, force: true })
})

/** The prop names the corpus published for one item, in order. */
function published(slug: string): string[] {
  const item = store.items.find((entry) => entry.slug === slug)
  expect(item, `the store holds no item for ${slug}`).toBeTruthy()
  return [...(item?.props ?? '').matchAll(/^\*\*`([A-Za-z0-9_$]+)`\*\*/gm)].map((match) => match[1] ?? '')
}

const PAGES = [
  'marketing-page',
  'dashboard-page',
  'settings-page',
  'auth-page',
  'not-found-page',
  'blog-post-page',
  'docs-shell',
]

describe('the published props of every Page', () => {
  it('names each prop exactly once', () => {
    for (const slug of PAGES) {
      const names = published(slug)
      const seen = new Set<string>()
      const twice = names.filter((name) => (seen.has(name) ? true : (seen.add(name), false)))
      // A duplicated prop is a declaration read twice, and it tells a consumer
      // the same field can be given two different types.
      expect(twice, `${slug} publishes a prop twice: ${twice.join(', ')}`).toEqual([])
    }
  })

  it('publishes DocsShell props that are all its own', () => {
    // The thirteen the Page declares, and nothing else. `type`, `items`,
    // `previous` and `next` are members of DocsNavGroup and DocsPagerLabels, and
    // a Page's row set that holds them is a Page documented as taking props it
    // does not have.
    expect(published('docs-shell')).toEqual([
      'title',
      'description',
      'nav',
      'toc',
      'currentHref',
      'navLabel',
      'tocLabel',
      'pagerLabel',
      'pagerLabels',
      'children',
      'header',
      'footer',
      'className',
    ])
  })

  it('publishes the same shape for a Page that keeps its declaration in one file', () => {
    // The control. `not-found-page` and `blog-post-page` hold their types in
    // their own `index.tsx`, so their emitted `index.d.ts` is one module and the
    // sibling-reading loop has nothing to duplicate. If this ever failed while
    // the DocsShell assertions passed, the two would have stopped being the same
    // code path and only one of them would still be a test.
    expect(published('not-found-page')).toEqual([
      'code',
      'title',
      'description',
      'links',
      'linksLabel',
      'children',
      'className',
    ])
    expect(published('blog-post-page')).toEqual([
      'title',
      'description',
      'date',
      'dateTime',
      'author',
      'tags',
      'readingTime',
      'children',
      'previous',
      'next',
      'trailLabels',
      'trailLabel',
      'indexLink',
      'footer',
      'className',
    ])
  })

  it('publishes a composition section that names each composed export once', () => {
    const item = store.items.find((entry) => entry.slug === 'docs-shell')
    // The composition names what the Page is made of. A sibling read twice
    // names its imports twice, which is the same defect on the other half of the
    // section, and this is the half a consumer reads to learn what a Page is.
    const rows = [...(item?.composition ?? '').matchAll(/^\*\*`exports`\*\*/gm)]
    expect(rows).toHaveLength(1)
  })
})

describe('the extractor a doubled declaration used to defeat', () => {
  it('publishes the same props whether or not the declaration is doubled', () => {
    // The precondition of the bug, asserted rather than described. The reader
    // used to append a sibling's declaration once per `from '...'` occurrence,
    // so an `index.tsx` with a value re-export and a type re-export from the same
    // sibling put it in the text twice, and the second copy lay inside the first
    // copy's scan. The extractor's own scan is what stopped the repetition, and
    // the reader's set is what stopped the wasted read: either alone is enough
    // for this assertion, and the corpus assertions above are what hold the
    // whole build to it.
    const declaration = [
      'export type PageProps = {',
      '    title: string;',
      '    nav: readonly Entry[];',
      '};',
      'export type Entry = {',
      "    type: 'page';",
      '    title: string;',
      '    href: string;',
      '};',
      'declare function Page(props: PageProps): unknown;',
    ].join('\n')

    const once = extractExports(declaration, ['Page'])[0]?.props.map((prop) => prop.name) ?? []
    const twice =
      extractExports(`${declaration}\n${declaration}`, ['Page'])[0]?.props.map((prop) => prop.name) ?? []

    expect(once).toEqual(['title', 'nav'])
    // Every prop once, and the union's own members not among them: a Page's row
    // set holding `type` and `href` is a Page documented as taking props it does
    // not have.
    expect(twice).toEqual(['title', 'nav'])
  })
})
