/**
 * The no-escape-hatch surface gate.
 *
 * Scans the emitted declarations the package promises, not its source, so it
 * checks the seam a consumer sees. It fails when:
 *
 *   1. any emitted `.d.ts` references a `@base-ui` module or type, including an
 *      internal file, because Base UI is never re-exported;
 *   2. a public entry exports a variant recipe (`cn`, a `*Variants` cva map);
 *   3. a public entry re-exports an upstream dependency's props object.
 *
 * Items 2 and 3 are about the public surface, so they are checked against the
 * files reachable through the package `exports` map. `cn` stays internal to
 * `dist/lib/utils` and no subpath exposes it; the toolchain still emits its
 * declaration, and that is not a surface.
 *
 * The reverse direction is asserted rather than skipped, in two places.
 *
 *   - A wildcard target that matches zero declarations is a finding naming the
 *     target. A `./components/*` that resolved to nothing used to leave items 2
 *     and 3 reading no file at all through that entry, and the run still
 *     printed its success line: the hole through which a published surface
 *     drifts from its source without a consumer failing first.
 *   - The internal side is a declared boundary, `INTERNAL`, compared in both
 *     directions. A new file under `dist/lib` is a finding naming it, and a
 *     declared internal declaration that is no longer emitted is a finding
 *     naming it as well. So "we chose not to check the reverse" is now "the
 *     reverse is checked, against this list, and the list is printed".
 *
 * Coverage is stated on every run: how many declarations were emitted, how many
 * the `exports` map reaches, how many are internal, and what the declared
 * internal boundary resolved to. The roots are this file's own location, never
 * `process.cwd()`.
 *
 * Run: node scripts/check-surface.mjs
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const PKG = path.join(HERE, '..')
const DIST = path.join(PKG, 'dist')

const manifest = JSON.parse(readFileSync(path.join(PKG, 'package.json'), 'utf8'))
const exportsField = manifest.exports ?? {}

const toPosix = (p) => p.split(path.sep).join('/')

function walk(dir) {
  let entries
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  } catch {
    return []
  }
  return entries.flatMap((entry) => {
    const full = path.join(dir, entry.name)
    return entry.isDirectory() ? walk(full) : [full]
  })
}

const allDts = walk(DIST).filter((file) => file.endsWith('.d.ts'))
const rel = (file) => toPosix(path.relative(PKG, file))

/** A condition object resolves through the first usable string target. */
function resolveTarget(value) {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object') {
    for (const condition of ['import', 'default', 'node', 'require']) {
      const target = resolveTarget(value[condition])
      if (target) return target
    }
    for (const nested of Object.values(value)) {
      const target = resolveTarget(nested)
      if (target) return target
    }
  }
  return null
}

function wildcardRegex(target) {
  const declaration = toPosix(target).replace(/^\.\//, '').replace(/\.js$/, '.d.ts')
  const escaped = declaration.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]+')
  return new RegExp(`^${escaped}$`)
}

/**
 * The declarations this design calls internal, which is the boundary rules 2 and
 * 3 are deliberately not applied across. Checked in both directions, so the set
 * is a stated decision a reader can argue with rather than a directory name the
 * walk happened to produce. `dist/lib/utils` is here because `cn` is the shared
 * class-merge helper no subpath exposes, and `dist/lib/rank` because the combobox
 * ranker is shared with no other Item and is no subpath of its own. `dist/lib/figure`
 * is here for the same reason and the same kind of thing: the geometry a figure in
 * this package is drawn from, shared by the Components that draw figures so that
 * two of them cannot hold two answers to where a label's ink box is. Adding a file
 * under `dist/lib` means either a new internal helper, which belongs in this list
 * with a reason, or a surface that is being kept off the map by accident.
 */
const INTERNAL = ['dist/lib/utils.d.ts', 'dist/lib/rank.d.ts', 'dist/lib/figure.d.ts']

const publicFiles = new Set()
const errors = []
const wildcards = []

for (const [key, value] of Object.entries(exportsField)) {
  const target = resolveTarget(value)
  if (!target || !target.endsWith('.js')) continue

  if (target.includes('*')) {
    const pattern = wildcardRegex(toPosix(target))
    let matched = 0
    for (const file of allDts) {
      if (pattern.test(rel(file))) {
        publicFiles.add(rel(file))
        matched += 1
      }
    }
    wildcards.push({ key, target, matched })
    if (matched === 0) {
      errors.push(
        `exports["${key}"] -> ${target} matches 0 emitted declaration(s), so items 2 and 3 ` +
          'read nothing through this entry and this run would otherwise report a clean surface',
      )
    }
    continue
  }

  const declaration = target.replace(/\.js$/, '.d.ts')
  if (!statSync(path.join(PKG, declaration), { throwIfNoEntry: false })) {
    errors.push(`exports["${key}"] -> ${target} has no emitted declaration at ${declaration}`)
    continue
  }
  publicFiles.add(declaration)
}

/** Every exported name in a declaration file, including `export { ... }` lists. */
function exportedNames(source) {
  const names = new Set()
  const declarations =
    /export\s+(?:declare\s+)?(?:const|let|var|function|class|type|interface|enum)\s+([A-Za-z_$][\w$]*)/g
  for (const match of source.matchAll(declarations)) names.add(match[1])

  const lists = /export\s+(?:type\s+)?\{([^}]*)\}/g
  for (const match of source.matchAll(lists)) {
    for (const part of match[1].split(',')) {
      const name = part.trim().split(/\s+as\s+/).pop()
      if (name) names.add(name)
    }
  }
  return names
}

const upstreamReexport = /export\s+(?:type\s+)?\{([^}]*)\}\s*from\s*['"]([^'"]+)['"]/g

/* 1. Base UI never crosses the seam, on any emitted declaration. */
for (const file of allDts) {
  const source = readFileSync(file, 'utf8')
  if (/@base-ui/.test(source)) {
    errors.push(`${rel(file)}: references a @base-ui module or type`)
  }
}

/* 2 and 3. Variant recipes and upstream props never reach the public surface. */
for (const file of [...publicFiles].sort()) {
  const source = readFileSync(path.join(PKG, file), 'utf8')

  for (const name of exportedNames(source)) {
    if (name === 'cn' || /Variants?$/.test(name)) {
      errors.push(`${file}: exports the internal variant recipe "${name}"`)
    }
  }

  for (const match of source.matchAll(upstreamReexport)) {
    const specifier = match[2]
    if (specifier.startsWith('.')) continue
    const names = match[1]
      .split(',')
      .map((part) => part.trim().split(/\s+as\s+/).pop())
      .filter(Boolean)
    if (names.some((name) => /Props$/.test(name))) {
      errors.push(
        `${file}: re-exports the upstream props object (${names.join(', ')}) from "${specifier}"`,
      )
    }
  }
}

/* 4. The internal side, in both directions, against a boundary that is printed. */
const internalFiles = allDts.map(rel).filter((file) => file.startsWith('dist/lib/')).sort()

for (const file of internalFiles) {
  if (!INTERNAL.includes(file)) {
    errors.push(
      `${file}: is internal (under dist/lib) but is not declared in INTERNAL. Declare it with a ` +
        'reason, or move it out of dist/lib so items 2 and 3 read it',
    )
  }
}

for (const file of INTERNAL) {
  if (!internalFiles.includes(file)) {
    errors.push(
      `${file}: is declared internal in INTERNAL but no declaration is emitted for it. The ` +
        'internal boundary changed; update INTERNAL in this gate rather than leaving it stale',
    )
  }
}

if (allDts.length === 0) {
  errors.push('dist has no emitted declarations; run the build before this gate')
}

const report = errors.length ? console.error : console.log

if (errors.length) {
  for (const error of errors) console.error(`error ${error}`)
  report('')
}

report(
  `surface: ${allDts.length} emitted declaration(s), ${publicFiles.size} public, ` +
    `${internalFiles.length} internal, no Base UI, no variant recipes`,
)
for (const entry of wildcards) {
  report(`surface: exports["${entry.key}"] -> ${entry.target} matched ${entry.matched} declaration(s)`)
}
report(
  `surface: internal boundary asserted in both directions: ${INTERNAL.join(', ') || '(none declared)'}` +
    `${internalFiles.length === 0 ? ' (no internal declaration was emitted)' : ''}`,
)
const unclassified = allDts
  .map(rel)
  .filter((file) => !publicFiles.has(file) && !internalFiles.includes(file))
report(
  `surface: ${unclassified.length} further declaration(s) the exports map does not reach and the ` +
    'internal boundary does not name, so item 1 reads them and items 2 and 3 do not; every emitted ' +
    'declaration is in one of the three columns',
)

if (errors.length) {
  report('')
  report(`surface: ${errors.length} violation(s) across ${publicFiles.size} public declaration(s)`)
  process.exit(1)
}
