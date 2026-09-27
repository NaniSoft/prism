import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { MOVES, MD_SECTIONS, redirectFor, RUN_WORKER_FIRST, SECTIONS } from '../src/lib/sections'
import { handleRequest } from '../worker/index'
import { rewriteMdPathname } from '../worker/router'

/**
 * The routes that moved, as a set comparison in both directions, and the Worker
 * that serves them.
 *
 * **Why this is the highest-value test in the restructure.** Every other failure
 * this change can produce is a page that quietly disappeared, and the one a
 * reader or an agent actually hits after a route move is a cached URL that
 * dead-ends. A spot check of a few known moves passes while a moved route is left
 * behind, so the population here is the record of every route the site published
 * before the Sections moved, and both directions are compared: every route that
 * moved is redirected, and every redirect is for a route that moved and lands on
 * a route that exists.
 *
 * The record is a snapshot rather than a derived list, and that is the point. It
 * is the only surface that knows what *used* to be published; every other one
 * says what exists now, and a route that quietly stopped being published is
 * absent from all of them rather than wrong in any of them. The site's
 * `check` task reads the same file and the same manifest and reports the same
 * comparison as a gate, so a maintainer does not have to run the tests to learn
 * that a URL died.
 *
 * The Worker is driven through `handleRequest`, which is the entry a request
 * actually reaches, rather than through the predicate alone: a table that is
 * correct and never wired into the fetch handler redirects nothing, and that is
 * the same class of green build as a page the sidebar forgot.
 */

const SITE = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const SNAPSHOT = path.join(SITE, 'scripts', 'published-routes-before.json')
const WRANGLER = path.join(SITE, 'wrangler.jsonc')

/** The routes the site published before the Sections moved. */
const routesBefore: string[] = JSON.parse(readFileSync(SNAPSHOT, 'utf8'))

/** The redirect table, generated from the manifest over the snapshot. */
const table = routesBefore
  .map((from) => ({ from, to: redirectFor(from) }))
  .filter((entry): entry is { from: string; to: string } => entry.to !== null)

/** Every file below a directory, at whatever depth the tree holds. */
function walk(root: string): string[] {
  return readdirSync(root).flatMap((name) => {
    const full = path.join(root, name)
    return statSync(full).isDirectory() ? walk(full) : [full]
  })
}

/** The route a content file is addressed by, which is where it is filed. */
function routeOf(relative: string): string {
  const withoutExtension = relative.replace(/\.mdx?$/, '')
  if (withoutExtension.endsWith('/index')) return `/${withoutExtension.slice(0, -'/index'.length)}`
  return `/${withoutExtension}`
}

/**
 * The routes the site publishes now, derived the way the gate derives them: the
 * content tree, the App Router's own static routes, and the Catalogue's Item
 * routes with their Section landing pages.
 */
function publishedRoutes(): string[] {
  const routes = new Set<string>()
  for (const file of walk(path.join(SITE, 'content'))) {
    if (!file.endsWith('.mdx') && !file.endsWith('.md')) continue
    routes.add(routeOf(path.relative(path.join(SITE, 'content'), file).split(path.sep).join('/')))
  }
  const app = path.join(SITE, 'src', 'app')
  for (const file of walk(app)) {
    if (path.basename(file) !== 'page.tsx') continue
    const segments = path
      .relative(app, path.dirname(file))
      .split(path.sep)
      .filter((segment) => segment && segment !== '.')
    if (segments.some((segment) => segment.startsWith('['))) continue
    routes.add(`/${segments.join('/')}`)
  }
  for (const file of walk(path.join(SITE, 'items'))) {
    if (!file.endsWith('.mdx')) continue
    // Every Item is published at `<section>/<slug>`, which the document states in
    // its own frontmatter because an Item is filed under its Kind and Category
    // rather than under the Section a reader reaches it from.
    const declared = /^slug:\s*(.+?)\s*$/m.exec(
      readFileSync(file, 'utf8').replace(/\r\n/g, '\n'),
    )?.[1]
    if (declared) routes.add(`/${declared}`)
  }
  for (const section of SECTIONS.filter((entry) => !entry.prose)) {
    routes.add(`/${section.segment}`)
  }
  return [...routes].sort()
}

const published = publishedRoutes()
const moved = routesBefore.filter((route) => !published.includes(route)).sort()
const redirects = new Map(table.map((entry) => [entry.from, entry.to]))

/** A Worker whose asset binding reports what it was asked for, or throws. */
function env(onAsset: (url: string) => void) {
  return {
    ASSETS: {
      fetch: (request: Request) => {
        onAsset(new URL(request.url).pathname)
        return Promise.resolve(new Response('asset', { status: 200 }))
      },
    },
  }
}

const ctx = { waitUntil() {}, passThroughOnException() {} } as unknown as ExecutionContext

describe('the redirect table', () => {
  it('serves every route that moved, and nothing else', () => {
    // Both directions as set comparisons. Forward: a moved route with no
    // redirect is a bookmark that dead-ends, which is the one failure an agent
    // holding a cached index actually hits. Reverse: a redirect for a route that
    // still exists sends a reader who did not ask to be moved somewhere else.
    const unserved = moved.filter((route) => !redirects.has(route))
    expect(unserved, 'a route that moved and is not redirected').toEqual([])
    const invented = table.filter((entry) => !moved.includes(entry.from))
    expect(invented, 'a redirect for a route that did not move').toEqual([])
    expect(moved.length).toBeGreaterThan(0)
  })

  it('points only at routes the site publishes', () => {
    for (const [from, to] of redirects) {
      expect(published, `${from} redirects to ${to}, which is not published`).toContain(to)
    }
  })

  it('takes one hop and never a chain', () => {
    for (const [from, to] of redirects) {
      expect(to, `${from} redirects to itself`).not.toBe(from)
      expect(redirects.has(to), `${from} redirects to ${to}, which is itself redirected`).toBe(false)
    }
  })

  it('moves a renamed page to the page that exists, not to its Section', () => {
    // The predecessor page is about using LLMs and keeps its old URL resolving.
    // Redirecting it to the Section landing page would resolve the link and
    // still dead-end the reader, one click later, on a page that does not
    // mention it.
    expect(redirects.get('/docs/agent-workflow')).toBe('/overview/using-llms')
    expect(published).toContain('/overview/using-llms')
  })

  it('moves every Section prefix and the route that joined one', () => {
    for (const move of MOVES) {
      expect(redirectFor(move.from), `${move.from} does not redirect`).toBe(move.to)
      expect(redirectFor(`${move.from}/quickstart`)).toBe(`${move.to}/quickstart`)
    }
  })

  it('redirects nothing that did not move', () => {
    for (const route of ['/', '/components/button', '/overview/quickstart', '/foundation/themes']) {
      expect(redirectFor(route), `${route} is published and is redirected`).toBeNull()
    }
  })
})

describe('the Worker', () => {
  it('answers every moved route with a permanent redirect to where it lives', async () => {
    // Through `handleRequest`, which is the entry a request reaches, so a table
    // that is correct and never wired into the fetch handler cannot pass.
    for (const [from, to] of redirects) {
      const touched: string[] = []
      const response = await handleRequest(
        new Request(`https://prism.nanisoft.com${from}`),
        env((url) => touched.push(url)),
        ctx,
      )
      expect(response.status, `${from} is not redirected`).toBe(301)
      expect(response.headers.get('location')).toBe(`https://prism.nanisoft.com${to}`)
      // The asset binding is never reached, which is the other half: a redirect
      // served from an asset is a redirect that does not happen.
      expect(touched, `${from} fell through to the asset binding`).toEqual([])
    }
  })

  it('leaves a query and a fragment on the redirect', async () => {
    // A link with either names the same page, and dropping them would silently
    // change what a reader or an agent asked for.
    const response = await handleRequest(
      new Request('https://prism.nanisoft.com/docs/quickstart?x=1#install'),
      env(() => {}),
      ctx,
    )
    expect(response.status).toBe(301)
    expect(response.headers.get('location')).toBe(
      'https://prism.nanisoft.com/overview/quickstart?x=1#install',
    )
  })

  it('serves a route that did not move from the asset binding', async () => {
    const touched: string[] = []
    const response = await handleRequest(
      new Request('https://prism.nanisoft.com/components/button'),
      env((url) => touched.push(url)),
      ctx,
    )
    expect(response.status).toBe(200)
    expect(touched).toEqual(['/components/button'])
  })

  it('rewrites the mirror of every Section, and only a Section', () => {
    // The stale-prefix hazard, in the direction that costs a 404: the Changelogs
    // Section is advertised in `llms.txt` as `/changelogs/prism-ui.md` and a
    // mirror prefix list that omits it answers 404 on a machine-readable surface.
    for (const section of SECTIONS) {
      expect(rewriteMdPathname(`/${section.segment}/a-page.md`)).toBe(
        `/md/${section.segment}/a-page.md`,
      )
    }
    // A file at the root, and a segment no Section claims, are the two shapes
    // that are not a mirrored document.
    expect(rewriteMdPathname('/llms.txt')).toBeNull()
    expect(rewriteMdPathname('/old-section/a-page.md')).toBeNull()
    expect(rewriteMdPathname('/overview.md')).toBeNull()
    expect(MD_SECTIONS).toEqual(SECTIONS.map((section) => section.segment))
  })
})

describe('the first-run prefix list', () => {
  it('is what the manifest requires, as a set', () => {
    // Asset serving answers before the Worker runs, so a prefix missing from
    // `run_worker_first` means a mirrored document answers 404 and a moved route
    // answers the 404 page. Both directions: an unlisted requirement is a 404,
    // and a listed extra is a Worker invocation that buys nothing.
    const wrangler = JSON.parse(readFileSync(WRANGLER, 'utf8')) as {
      assets: { run_worker_first: string[] }
    }
    expect([...wrangler.assets.run_worker_first].sort()).toEqual([...RUN_WORKER_FIRST].sort())
  })

  it('invokes the Worker first for every mirror the Corpus writes', () => {
    // The Corpus writes one mirror per page at `md/<segment>/<slug>.md` for every
    // Section, so every Section segment needs a prefix. Stated from the manifest
    // rather than from the emitted corpus so the assertion does not depend on a
    // build artefact this lane does not own; the corpus's own gate fails on a
    // mirror it does not write.
    for (const section of SECTIONS) {
      expect(RUN_WORKER_FIRST).toContain(`/${section.segment}/*.md`)
    }
  })
})

describe('the manifest itself', () => {
  it('imports nothing, so the header row costs no module graph', () => {
    // The header's row is rendered by a client component. This module is in that
    // bundle, so an import here is the docs library in the browser, and the cost
    // would be invisible in every other test.
    const source = readFileSync(path.join(SITE, 'src', 'lib', 'sections.ts'), 'utf8')
    const imports = [...source.matchAll(/^\s*import\s.+$/gm)].map((match) => match[0].trim())
    expect(imports).toEqual([])
  })

  it('declares the seven Sections once each, prose first', () => {
    expect(SECTIONS.map((section) => section.segment)).toEqual([
      'overview',
      'foundation',
      'content',
      'components',
      'blocks',
      'pages',
      'changelogs',
    ])
    expect(new Set(SECTIONS.map((section) => `${section.segment}`)).size).toBe(SECTIONS.length)
    // The plurality rule, read off the data rather than restated: the three prose
    // Sections are singular and the four that hold many Items are plural.
    for (const section of SECTIONS) {
      expect(section.segment.endsWith('s'), `${section.segment} is plural`).toBe(!section.prose)
    }
  })
})
