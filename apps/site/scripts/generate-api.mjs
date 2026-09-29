/**
 * Derives the per-item API tables from the emitted declarations.
 *
 * The source of truth is `packages/ui/dist/**\/*.d.ts`, never the demo and never
 * the source `.tsx`, and the parsing is `@nanisoft/prism-llms/extractor`, the
 * one extractor the corpus also uses. This script is only the file walk and the
 * JSON projection: one extractor, two renderers.
 *
 * Ticket 11's controls rule holds: a reported default is the component's default
 * (from a JSDoc `@defaultValue`) or `-`, and is never inferred from a demo.
 *
 * Run: node scripts/generate-api.mjs
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { buildCatalog } from '@nanisoft/prism-ui/catalog'
import { extractExports } from '@nanisoft/prism-llms/extractor'

import { readDeclarations as readDeclarationText } from './declaration-resolution.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const SITE = path.join(HERE, '..')
const REPO = path.join(SITE, '..', '..')
const DIST = path.join(REPO, 'packages', 'ui', 'dist')
const OUT_DIR = path.join(SITE, 'src', 'generated')
const OUT = path.join(OUT_DIR, 'api.json')

function dtsPath(source) {
  const relative = source.replace(/^src\//, '').replace(/\.tsx?$/, '.d.ts')
  return path.join(DIST, relative)
}

/**
 * Reads a declaration file plus anything it re-exports from a relative path.
 *
 * The walk itself lives in `declaration-resolution.mjs`, shared with the corpus
 * builder. It used to live here, and the two copies drifted: when the emitted
 * declarations began carrying file extensions, both stopped resolving anything and
 * every Item whose declaration lives in a sibling published no props at all.
 */
async function readDeclarations(file) {
  return readDeclarationText(file)
}

const catalogue = buildCatalog()
const output = {}
const warnings = []

for (const item of catalogue) {
  const file = dtsPath(item.source)
  let text = ''
  try {
    text = await readDeclarations(file)
  } catch {
    warnings.push(`${item.slug}: no emitted declaration at ${path.relative(REPO, file)}`)
    output[item.slug] = {
      exports: item.exports.map((name) => ({ name, rows: [], inherited: [] })),
    }
    continue
  }

  const exported = extractExports(text, item.exports)
  output[item.slug] = {
    exports: exported.map((entry) => ({
      name: entry.typeName,
      rows: entry.props.map((prop) => ({
        name: prop.name,
        type: prop.typeText,
        required: prop.required,
        default: prop.defaultValue ?? '-',
        description: prop.description ?? '',
      })),
      inherited: entry.extendsType ? [entry.extendsType] : [],
    })),
  }
}

await mkdir(OUT_DIR, { recursive: true })
await writeFile(OUT, `${JSON.stringify(output, null, 2)}\n`, 'utf8')

const rowCount = Object.values(output).reduce(
  (sum, entry) => sum + entry.exports.reduce((inner, part) => inner + part.rows.length, 0),
  0,
)
console.log(
  `api: ${catalogue.length} items, ${rowCount} generated rows -> ${path.relative(SITE, OUT)}`,
)
for (const warning of warnings) console.warn(`warn  ${warning}`)
