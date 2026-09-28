/**
 * The links law, and the one gate that outlived the migration.
 *
 * Four kinds of destination, four different failures, and only two of them are
 * things this gate can decide:
 *
 *   1. An `href` beginning with `/` must equal an emitted route. This is the one
 *      that breaks quietly, because a broken internal link renders exactly like a
 *      working one and a crawler finds it a month later.
 *   2. An `href` beginning with `#` must name an `id` the same document emits, so
 *      a rebuilt section cannot orphan a deep link.
 *   3. An `href` beginning with `mailto:` or `tel:` is a destination the reader's
 *      own client handles, and is listed rather than resolved.
 *   4. An absolute `href` to another origin is a destination off this site, and is
 *      listed rather than resolved. This gate cannot know that a sibling site
 *      exists, and a check that guessed would be a check that reported a network
 *      failure as a content failure.
 *
 * Extraction goes through a document parser rather than a regular expression.
 * Two titles on one of these sites serialise an ampersand, and a regex would
 * store the escaped form and then report it as a permanent difference against
 * itself.
 *
 * **An exemption list is a finding when it matches nothing.** A consumer that
 * declares a destination it knows is broken has to say why, and the declaration
 * is site data rather than a law: it is one site's content defect. What is a law
 * is that the declaration must match a real destination on this build, because an
 * exemption list that outlives its cause is a lie and a gate that accepts a new
 * link because the list is long enough to seem plausible is not a gate.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

import { law } from './laws.mjs'
import { CoverageError, finding, floor } from './run.mjs'

/**
 * The document parser, resolved from the consumer's own dependency.
 *
 * The consumer owns its parser because the consumer's tests already do; a gate
 * that carried its own would add a copy of jsdom to four repositories so that
 * four gates could read four documents.
 */
function loadParser(root) {
  try {
    return createRequire(path.join(root, 'package.json'))('jsdom').JSDOM
  } catch (cause) {
    throw new CoverageError(
      `jsdom does not resolve from this repository (${cause.message}), so no document can be parsed\n` +
        '  and every destination in this run would be unanswerable.',
    )
  }
}

/** Every emitted HTML file under `outDir`, as `[absolute path, route]` pairs, sorted. */
export function emittedRoutes(root, outDir) {
  const out = path.join(root, outDir)
  if (!existsSync(out)) {
    throw new CoverageError(
      `${outDir} does not resolve, so there is no export to read and a reader's destinations cannot be\n` +
        '  checked at all. Run the build first.',
    )
  }
  const files = []
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (entry.name.endsWith('.html')) {
        const relative = path.relative(out, full).split(path.sep).join('/')
        files.push([full, relative === 'index.html' ? '/' : `/${relative.replace(/\.html$/, '')}`])
      }
    }
  }
  walk(out)
  return files
}

export function run({ root, config }) {
  const l = law('links')
  const outDir = config.outDir ?? 'out'
  const minRoutes = config.minRoutes ?? 6
  const minAnchors = config.minAnchors ?? 0
  const knownBroken = config.knownBroken ?? {}

  const JSDOM = loadParser(root)
  const files = emittedRoutes(root, outDir)
  floor('route(s) read', files.length, minRoutes)

  const emitted = new Set(files.map(([, route]) => route))
  const resolves = (target) => {
    const wanted = target.replace(/\/$/, '') || '/'
    return emitted.has(wanted) || emitted.has(`${wanted}/`)
  }

  const findings = []
  const internal = new Set()
  const fragments = new Set()
  const external = new Set()
  const schemes = new Set()
  const discharged = new Set()
  let anchors = 0

  for (const [file, route] of files) {
    const document = new JSDOM(readFileSync(file, 'utf8')).window.document
    const ids = new Set([...document.querySelectorAll('[id]')].map((element) => element.id))
    for (const anchor of document.querySelectorAll('a[href]')) {
      anchors += 1
      const href = anchor.getAttribute('href') ?? ''
      if (href === '') {
        findings.push(
          finding(route, 'empty-destination', 'an anchor with no href is a shape a reader has to guess at.'),
        )
      } else if (href.startsWith('/')) {
        internal.add(href)
        const target = href.split('#')[0] || route
        const known = knownBroken[target]
        if (known) {
          discharged.add(target)
        } else if (!resolves(target)) {
          findings.push(
            finding(
              route,
              'internal-destination',
              `"${href}" is not an emitted route. Every address a reader has ever used has to keep\n` +
                '      working, and a link that renders is a link nobody notices is broken.',
            ),
          )
        }
        if (href.includes('#')) fragments.add(`${target}${href.slice(href.indexOf('#'))}`)
      } else if (href.startsWith('#')) {
        fragments.add(`${route}${href}`)
        if (!ids.has(href.slice(1))) {
          findings.push(
            finding(route, 'fragment', `"${href}" names an id this document does not emit.`),
          )
        }
      } else if (/^(mailto:|tel):/.test(href)) {
        schemes.add(`${href.split(':')[0]}:`)
      } else if (/^https?:\/\//.test(href)) {
        external.add(new URL(href).host)
      } else {
        findings.push(
          finding(route, 'unclassified-destination', `"${href}" is neither internal, a fragment nor absolute.`),
        )
      }
    }
  }

  floor('anchor(s) read', anchors, minAnchors)

  for (const [destination] of Object.entries(knownBroken)) {
    if (discharged.has(destination)) continue
    findings.push(
      finding(
        destination,
        'stale-exemption',
        `this destination is declared as known-broken and this build emits no link to it. An exemption\n` +
          '      that fires on nothing is indistinguishable from a rule that found nothing, so close it and\n' +
          '      delete the entry in the same commit.',
      ),
    )
  }

  const notes = [
    `${l.id}: ${findings.length} finding(s) across ${files.length} route(s) and ${anchors} anchor(s) read;` +
      ` floors ${minRoutes} route(s), ${minAnchors} anchor(s)`,
    `${l.id}: ${emitted.size} emitted route(s): ${[...emitted].sort().join(', ')}`,
    `${l.id}: destinations resolved on this site: ${[...internal].sort().join(', ') || 'none'}`,
    `${l.id}: fragments resolved: ${[...fragments].sort().join(', ') || 'none'}`,
    `${l.id}: destinations off this site, listed and not resolved: ${[...external].sort().join(', ') || 'none'}`,
  ]
  if (schemes.size > 0) {
    notes.push(`${l.id}: reader-handled schemes, listed and not resolved: ${[...schemes].sort().join(', ')}`)
  }
  notes.push(
    `${l.id}: an off-site host is listed, not resolved. This gate cannot know that another origin exists, and a\n` +
      '      network failure reported as a content failure is a check that teaches people to ignore it.',
  )
  for (const [destination] of Object.entries(knownBroken)) {
    const state = discharged.has(destination) ? 'and still linked' : 'AND NO LONGER LINKED'
    notes.push(`${l.id}:   declared broken, ${state}: ${destination}`)
  }

  return { law: l, findings, notes }
}
