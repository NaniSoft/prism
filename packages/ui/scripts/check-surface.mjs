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

const publicFiles = new Set()
const errors = []

for (const [key, value] of Object.entries(exportsField)) {
  const target = resolveTarget(value)
  if (!target || !target.endsWith('.js')) continue

  if (target.includes('*')) {
    const pattern = wildcardRegex(toPosix(target))
    for (const file of allDts) {
      if (pattern.test(rel(file))) publicFiles.add(rel(file))
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

if (allDts.length === 0) {
  errors.push('dist has no emitted declarations; run the build before this gate')
}

if (errors.length) {
  for (const error of errors) console.error(`error ${error}`)
  console.error(`\nsurface: ${errors.length} violation(s) across ${publicFiles.size} public declaration(s)`)
  process.exit(1)
}

console.log(
  `surface: ${allDts.length} emitted declaration(s), ${publicFiles.size} public, no Base UI, no variant recipes`,
)
