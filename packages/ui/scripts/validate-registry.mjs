/**
 * Validates registry.json against the filesystem and the shadcn registry schema.
 *
 * Catches the failure mode that quietly rots a registry: an item that references a
 * file that was renamed or moved, so the docs site renders fine but `shadcn add`
 * 404s for a real user.
 */
import { readFile, access } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const PKG = path.join(HERE, '..')

// Optional argument so the validator can be pointed at a fixture in tests.
const target = process.argv[2] ? path.resolve(process.argv[2]) : path.join(PKG, 'registry.json')

const errors = []
const warn = []

let registry
try {
  // Strip a UTF-8 BOM: Windows editors add one and JSON.parse rejects it.
  registry = JSON.parse((await readFile(target, 'utf8')).replace(/^\uFEFF/, ''))
} catch (cause) {
  console.error(`error ${path.relative(process.cwd(), target)}: not valid JSON — ${cause.message}`)
  process.exit(1)
}

const exists = async (p) => {
  try {
    await access(path.join(PKG, p))
    return true
  } catch {
    return false
  }
}

if (!registry.name) errors.push('registry.json: missing top-level "name"')
if (!registry.$schema) warn.push('registry.json: missing "$schema"')

if (!Array.isArray(registry.items) || registry.items.length === 0) {
  errors.push('registry.json: "items" must be a non-empty array')
}

const seen = new Set()

/**
 * Field allowlists mirroring https://ui.shadcn.com/schema/registry-item.json.
 *
 * shadcn's own validator rejects unknown fields, but the error it prints ("Invalid
 * registry file found") does not say which one. Checking here turns a silent
 * build failure into a named field. `registryBase` in particular looks plausible
 * and is not in the published schema.
 */
const ITEM_FIELDS = new Set([
  'name', 'type', 'description', 'title', 'author',
  'dependencies', 'devDependencies', 'registryDependencies',
  'files', 'tailwind', 'cssVars', 'css', 'envVars',
  'meta', 'docs', 'categories', 'extends',
  'style', 'iconLibrary', 'baseColor', 'theme', 'font',
])

const FILE_FIELDS = new Set(['path', 'content', 'type', 'target'])

const ITEM_TYPES = new Set([
  'registry:lib', 'registry:block', 'registry:component', 'registry:ui',
  'registry:hook', 'registry:theme', 'registry:page', 'registry:file',
  'registry:style', 'registry:base', 'registry:font', 'registry:item',
])

for (const [index, item] of (registry.items ?? []).entries()) {
  const where = `items[${index}]${item?.name ? ` (${item.name})` : ''}`

  for (const key of Object.keys(item ?? {})) {
    if (!ITEM_FIELDS.has(key)) {
      errors.push(`${where}: unknown field "${key}" (not in the shadcn registry-item schema)`)
    }
  }

  if (!item.name) errors.push(`${where}: missing "name"`)
  if (seen.has(item.name)) errors.push(`${where}: duplicate name "${item.name}"`)
  seen.add(item.name)

  for (const field of ['title', 'description', 'type']) {
    if (!item[field]) errors.push(`${where}: missing "${field}"`)
  }

  if (item.type && !ITEM_TYPES.has(item.type)) {
    errors.push(`${where}: invalid type "${item.type}"`)
  }

  if (item.categories !== undefined) {
    if (!Array.isArray(item.categories)) {
      errors.push(`${where}: "categories" must be an array of strings, got ${typeof item.categories}`)
    } else if (item.categories.some((c) => typeof c !== 'string')) {
      errors.push(`${where}: "categories" must contain only strings`)
    }
  }

  if (!Array.isArray(item.files) || item.files.length === 0) {
    errors.push(`${where}: "files" must be a non-empty array`)
    continue
  }

  for (const [fIndex, file] of item.files.entries()) {
    const fWhere = `${where}.files[${fIndex}]`

    for (const key of Object.keys(file ?? {})) {
      if (!FILE_FIELDS.has(key)) {
        errors.push(`${fWhere}: unknown field "${key}"`)
      }
    }

    if (!file.path) {
      errors.push(`${fWhere}: missing "path"`)
      continue
    }
    if (!(await exists(file.path))) {
      errors.push(`${fWhere}: path "${file.path}" does not exist on disk`)
    }

    // The schema requires both, and shadcn's own error does not say which is at
    // fault — an entry without `type` fails the build with a bare "Invalid
    // registry file found".
    if (!file.type) {
      errors.push(`${fWhere}: missing "type" (required by the registry-item schema)`)
    } else if (!ITEM_TYPES.has(file.type)) {
      errors.push(`${fWhere}: invalid type "${file.type}"`)
    }

    if (!file.target) {
      errors.push(`${fWhere}: missing "target"`)
    } else if (!file.target.startsWith('components/') && !file.target.startsWith('lib/')) {
      warn.push(`${fWhere}: unusual target "${file.target}"`)
    }
  }
}

// Every file a block ships should also be reachable, so consumers can pull
// a single item without a partial install.
const covered = new Set()
for (const item of registry.items ?? []) {
  for (const file of item.files ?? []) covered.add(file.path)
}
for (const file of covered) {
  const owned = (registry.items ?? []).some((item) =>
    (item.files ?? []).some((f) => f.path === file),
  )
  if (!owned) warn.push(`file "${file}" is not referenced by any item`)
}

for (const w of warn) console.warn(`warn  ${w}`)
for (const e of errors) console.error(`error ${e}`)

if (errors.length) {
  console.error(`\nregistry: ${errors.length} error(s), ${warn.length} warning(s)`)
  process.exit(1)
}

console.log(`registry: ${registry.items.length} items OK (${warn.length} warning(s))`)
