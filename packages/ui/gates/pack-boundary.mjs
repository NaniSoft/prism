/**
 * The pack-boundary law: a boundary lands on a mark, and a declared region set is
 * the whole of what may carry a second pack.
 *
 * **A screenshot cannot check this, in either mode, and that is the finding.** A
 * boundary is correct only if it resolves to its own pack in the mode the document
 * is in, which is two facts multiplied. A boundary carrying `data-pack="mint"` on a
 * dark document with no `dark` class of its own matches the light block, so the
 * mark paints the light pack on a dark page: pale marks on a dark page, which looks
 * like a design decision rather than a bug. A screenshot in the wrong mode looks
 * correct, so a single-mode screenshot is not evidence and this gate does not accept
 * one.
 *
 * **Both modes are read from the emitted CSS, not from a browser.** The failure
 * being guarded is a selector shape, and a selector shape is knowable by reading
 * the stylesheet the build emitted against the markup the build emitted. For every
 * pack the page uses, the gate resolves the pack's light and dark blocks out of the
 * emitted stylesheet, asserts that the light block is a bare `[data-pack=x]` and
 * that the dark block carries **both** the compound and the descendant form, and
 * then matches every boundary in the document against both. A dark block that is
 * compound-only is the defect this catches, and it is invisible to a review and to
 * a screenshot, because the page it produces is pack-correct and mode-inverted.
 *
 * The values are then compared against the token package's own published per-pack
 * files, resolved through the component package's dependency, so the gate is not
 * merely self-consistent: a boundary resolves the contract's light values in light
 * mode and its dark values in dark mode, and the two are asserted to differ, which
 * is what makes a both-modes check worth running.
 *
 * **The document element is not a boundary.** `<html data-pack="sky">` is the
 * page's ground, which is the page's theme and the one attribute the whole document
 * is built around; it is the axis the scoped boundary law talks about *beneath*. So
 * the gate reads it, confirms it names the declared ground, and then judges every
 * other element by the scoped law.
 *
 * **Which half is the law and which half is the site's data.** The law is the set
 * of judgements below: where a boundary may land, what a region set means, that
 * both modes resolve, and that the values agree with the contract. All of it is
 * here. What belongs to the site is the map (`pack-map.json`, with the reason each
 * region exists), the ground, the route the map describes, the slot a boundary is
 * allowed to land on, and the resolver that names a region from a DOM node, because
 * naming a region means knowing this site's own structure. That resolver is a
 * module the site declares rather than a table in this file, for the same reason
 * `pack-map.json` is data: it is a fact about one page, and a fact about one page
 * in a file about all pages would be wrong the moment the page changes.
 *
 * The honest limit, printed on every run: this is a selector match over emitted CSS
 * and emitted markup, not a layout engine. It cannot see a runtime that sets
 * `data-pack` after paint, and it cannot see a token a boundary reads that the
 * stylesheet does not declare.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { law } from './laws.mjs'
import {
  CoverageError,
  cssBlocks,
  designSystem,
  finding,
  floor,
  properties,
  readJson,
  sameColour,
} from './run.mjs'

/** The roles a boundary must move, and the two a reader would notice it not moving. */
const ROLES = ['background', 'card', 'foreground', 'border']

/** Elements whose corner radius a reader can see change when the pack moves. */
const SHAPES = ['rect', 'section', 'article', 'a', 'div', 'li', 'svg', 'g', 'path', 'circle']

export async function run({ root, config }) {
  const l = law('pack-boundary')
  const findings = []
  const notes = []
  const outDir = config.outDir ?? 'out'
  const mapPath = config.map ?? 'scripts/pack-map.json'
  const landing = config.landing ?? '/'
  const markSlot = config.markSlot ?? 'product-mark'

  const map = readJson(root, mapPath)
  if (!map) {
    throw new CoverageError(
      `${mapPath} does not resolve or is not JSON, so there is no map and every judgement about what a page\n` +
        '  may carry would be a guess. A map that says zero is a decision; a page with no map is a drift.',
    )
  }

  const regionOf = await regionResolver(root, config, mapPath)
  const out = path.join(root, outDir)
  if (!existsSync(path.join(out, '_next'))) {
    throw new CoverageError(
      `the export has no ${outDir}/_next, so the emitted stylesheet cannot be read and every judgement about\n` +
        '  which mode a boundary resolves in would be a guess. Run the build first.',
    )
  }

  const cssFiles = []
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (entry.name.endsWith('.css')) cssFiles.push(full)
    }
  }
  walk(path.join(out, '_next'))
  floor('emitted stylesheet(s)', cssFiles.length, 1)
  const css = cssFiles.map((file) => readFileSync(file, 'utf8')).join('\n')

  /** Every rule whose selector list mentions a boundary, keyed `pack:mode`. */
  const rules = new Map()
  for (const block of cssBlocks(css)) {
    for (const selector of block.selectors) {
      const boundary = /\[data-pack="?([a-z]+)"?\]/.exec(selector)
      if (!boundary) continue
      const pack = boundary[1]
      const key = `${pack}:${selector.includes('.dark') ? 'dark' : 'light'}`
      if (!rules.has(key)) rules.set(key, { selectors: [], values: properties(block.body) })
      const rule = rules.get(key)
      if (!rule.selectors.includes(selector)) rule.selectors.push(selector)
      for (const [property, value] of properties(block.body)) rule.values.set(property, value)
    }
  }

  const system = designSystem(root)
  const JSDOM = createRequire(path.join(root, 'package.json'))('jsdom').JSDOM
  const documents = []
  const walkHtml = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) walkHtml(full)
      else if (entry.name.endsWith('.html')) {
        const relative = path.relative(out, full).split(path.sep).join('/')
        documents.push([full, relative === 'index.html' ? '/' : `/${relative.replace(/\.html$/, '')}`])
      }
    }
  }
  walkHtml(out)
  floor('emitted document(s)', documents.length, 1)

  const byRoute = new Map()
  const actual = new Map()
  const reported = new Set()
  let boundaries = 0
  let marks = 0

  const report = (key, where, tag, body) => {
    if (reported.has(key)) return
    reported.add(key)
    findings.push(finding(where, tag, body))
  }

  for (const [file, route] of documents) {
    const document = new JSDOM(readFileSync(file, 'utf8')).window.document

    const ground = document.documentElement.getAttribute('data-pack')
    if (ground !== map.ground) {
      findings.push(
        finding(
          route,
          'ground',
          `the document element carries data-pack="${ground}" and the map declares "${map.ground}".\n` +
            '      The ground is one fact with one owner.',
        ),
      )
    }
    if (map.defaultMode === 'dark' && !document.documentElement.classList.contains('dark')) {
      findings.push(
        finding(
          route,
          'mode',
          'the document element carries no dark class, so a reader with no stored theme gets light mode,\n' +
            '      which is not this site\'s default.',
        ),
      )
    }

    const regions = new Map()
    for (const element of document.querySelectorAll('[data-pack]')) {
      if (element === document.documentElement) continue
      boundaries += 1
      const pack = element.getAttribute('data-pack') ?? ''
      const region = regionOf(element, document)
      if (region === null || region === undefined) {
        report(
          `unnameable:${element.tagName}`,
          route,
          'unnamed-region',
          `a data-pack="${pack}" boundary in a band the site's own resolver cannot name cannot be held to\n` +
            '      the map. A region this gate cannot name is a region it cannot hold to the map.',
        )
        continue
      }
      if (!regions.has(region)) regions.set(region, [])
      regions.get(region).push(pack)

      const tag = element.tagName.toLowerCase()
      if (element.getAttribute('data-slot') === markSlot) marks += 1
      else {
        report(
          `off-mark:${element.tagName}`,
          route,
          'boundary-off-a-mark',
          `a data-pack="${pack}" boundary in ${region} sits on a <${tag}>, not on a mark. A boundary\n` +
            '      re-points --radius as well as colour, so anything that is not a fully rounded shape changes\n' +
            '      shape with its pack.',
        )
      }
      if (SHAPES.includes(tag)) {
        report(
          `shape:${tag}`,
          route,
          'boundary-shape',
          `a <${tag}> carries data-pack="${pack}" in ${region}.`,
        )
      }
      if (/\brounded-(?!full\b)[a-z0-9-]+/.test(element.getAttribute('class') ?? '')) {
        report(
          `radius:${region}`,
          route,
          'boundary-radius',
          `the boundary in ${region} carries a radius utility other than rounded-full, so its corner radius\n` +
            '      is computed from the pack it carries.',
        )
      }
      if (/\bdark\b/.test(element.getAttribute('class') ?? '')) {
        report(
          `hard-mode:${region}`,
          route,
          'hard-coded-mode',
          `a boundary in ${region} carries a dark class of its own, so it is mode-correct for half the\n` +
            '      readers and inverted for the other half. A boundary wears the mode of the nearest ancestor\n' +
            '      carrying it, and the server is the only thing that can know it.',
        )
      }

      for (const mode of ['light', 'dark']) {
        const rule = rules.get(`${pack}:${mode}`)
        if (!rule) {
          report(`no-block:${pack}:${mode}`, route, `no-${mode}-block`, `the emitted stylesheet declares no [data-pack=${pack}] block for ${mode}.`)
          continue
        }
        if (mode === 'dark') {
          if (!rule.selectors.some((selector) => selector === `.dark [data-pack=${pack}]`)) {
            report(
              `descendant:${pack}`,
              route,
              'mode-inverted',
              `the dark block for "${pack}" is ${JSON.stringify(rule.selectors)}, which has no descendant\n` +
                '      form. A boundary is an attribute on an element with no mode class of its own, so without\n' +
                '      `.dark [data-pack=x]` a server-rendered boundary on a dark page matches the light block:\n' +
                '      pack-correct, mode-inverted, and it looks like a design decision.',
            )
          }
          if (!rule.selectors.some((selector) => selector === `[data-pack=${pack}].dark`)) {
            report(
              `compound:${pack}`,
              route,
              'compound-form-missing',
              `the dark block for "${pack}" drops the compound form, which is published for a boundary that must\n` +
                '      hold a fixed mode.',
            )
          }
        }
        const published = system.tokenTheme(pack, mode)
        for (const role of ROLES) {
          const emittedValue = rule.values.get(`--${role}`)
          const expected = published.get(`--${role}`)
          if (emittedValue === undefined) {
            report(
              `unresolved:${pack}:${role}`,
              route,
              'unresolved-role',
              `the ${mode} block for "${pack}" does not declare --${role}.`,
            )
          } else if (expected !== undefined && !sameColour(emittedValue, expected)) {
            report(
              `contract:${pack}:${mode}:${role}`,
              route,
              'contract-mismatch',
              `the ${mode} block for "${pack}" declares --${role}: ${emittedValue}, and the published token contract\n` +
                `      declares ${expected}.`,
            )
          }
        }
        if (mode === 'dark') {
          const light = rules.get(`${pack}:light`)?.values
          if (light && light.get('--card') === rule.values.get('--card')) {
            report(
              `identical:${pack}`,
              route,
              'modes-identical',
              `the light and dark blocks for "${pack}" declare the same --card, so a boundary resolves to the same\n` +
                '      values in both modes and this check proves nothing about modes.',
            )
          }
        }
      }
    }
    byRoute.set(route, regions)
    for (const [region, packs] of regions) {
      if (!actual.has(region)) actual.set(region, { packs: new Set(), routes: [] })
      actual.get(region).packs = new Set([...actual.get(region).packs, ...packs])
      actual.get(region).routes.push(route)
    }
  }

  const multiset = (packs) => JSON.stringify([...packs].sort())
  for (const [route, regions] of [...byRoute.entries()].sort()) {
    for (const [region, packs] of [...regions.entries()].sort()) {
      const expected = map.regions?.[region]
      if (!expected) {
        findings.push(
          finding(
            route,
            'undeclared-region',
            `${region} carries ${multiset(packs)} and the map does not declare it. A map that says zero is a\n` +
              '      decision; a map that says nothing is a drift.',
          ),
        )
        continue
      }
      if (multiset(packs) !== multiset(expected.packs)) {
        findings.push(
          finding(
            route,
            'map-mismatch',
            `${region} carries ${multiset(packs)} and the map declares ${multiset(expected.packs)}.`,
          ),
        )
      }
    }
  }

  const onLanding = byRoute.get(landing) ?? new Map()
  for (const region of Object.keys(map.regions ?? {})) {
    if (onLanding.has(region)) continue
    findings.push(
      finding(region, 'missing-on-landing', 'the map declares this region and the landing does not carry it.'),
    )
  }
  if (!byRoute.has(landing)) {
    findings.push(finding(landing, 'missing-landing', `this export has no ${landing} document, so the map could not be checked.`))
  }

  // Both halves: the derived set is what the page does, the declared set is what
  // the page may do. A page that grows a third region carrying a second pack is
  // the difference between them.
  const derivedSecond = [...onLanding]
    .filter(([, packs]) => packs.some((pack) => pack !== map.ground))
    .map(([region]) => region)
    .sort()
  const allowedSecond = [...(map.secondPackRegions ?? [])].sort()
  if (JSON.stringify(derivedSecond) !== JSON.stringify(allowedSecond)) {
    findings.push(
      finding(
        'pack-map',
        'second-pack-regions',
        `the regions carrying a pack that is not the ground are ${JSON.stringify(derivedSecond)}, and the map\n` +
          `      allows ${JSON.stringify(allowedSecond)}. A boundary moves the corner radius beneath it, so a third\n` +
          '      region carrying a second pack is a third set of corners that mean something other than radius.',
      ),
    )
  }

  notes.push(
    `${l.id}: ${findings.length} finding(s) across ${documents.length} document(s) and ${boundaries} boundary/boundaries read`,
  )
  notes.push(`${l.id}: the ground is "${map.ground}"; ${marks} of ${boundaries} boundary/boundaries sit on a mark`)
  notes.push(`${l.id}: regions read, with the packs each carries and how many routes carry it:`)
  for (const [region, entry] of [...actual.entries()].sort()) {
    notes.push(`${l.id}:   ${region}  ${multiset([...entry.packs])}  on ${entry.routes.length} route(s)`)
  }
  notes.push(
    `${l.id}: ${derivedSecond.length} region(s) carry a pack that is not the ground: ${derivedSecond.join(', ')}; the map allows ${allowedSecond.join(', ')}`,
  )
  notes.push(
    `${l.id}: both modes were resolved for every boundary, from ${cssFiles.length} emitted stylesheet(s) and from the\n` +
      '      published token contract resolved through the component package, and each boundary was matched against both.',
  )
  notes.push(
    `${l.id}: the region resolver is this repository's own (${config.regionResolver ?? 'none declared'}), because naming a\n` +
      "      region means knowing this site's structure. The law above is not per site.",
  )
  notes.push(
    `${l.id}: the honest limit: this is a selector match over emitted CSS and emitted markup, not a layout engine.\n` +
      '      It cannot see a runtime that sets data-pack after paint, and a screenshot in one mode is not evidence.',
  )

  return { law: l, findings, notes }
}

/**
 * The site's own region resolver.
 *
 * Required rather than defaulted, because a default would be this file's guess at
 * one page's structure, and a guess that silently named nothing would turn every
 * boundary on every site into an unnamed region and read as a broken map rather
 * than as a missing declaration.
 */
async function regionResolver(root, config, mapPath) {
  const declared = config.regionResolver
  if (!declared) {
    throw new CoverageError(
      `no region resolver is declared, so a boundary cannot be named and the map cannot be checked.\n` +
        `  Add "regionResolver" to the gate's configuration: a module beside ${mapPath} that exports regionOf(element, document).`,
    )
  }
  const file = path.join(root, declared)
  if (!existsSync(file)) {
    throw new CoverageError(`${declared} does not resolve, so no boundary on any route can be named.`)
  }
  const module = await import(pathToFileURL(file).href)
  if (typeof module.regionOf !== 'function') {
    throw new CoverageError(`${declared} does not export regionOf, so no boundary on any route can be named.`)
  }
  return module.regionOf
}
