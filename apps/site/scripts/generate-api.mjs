/**
 * Derives the per-item API tables from the emitted declarations.
 *
 * The source of truth is `packages/ui/dist/**\/*.d.ts`, never the demo and never
 * the source `.tsx`. Ticket 11's controls rule holds: a reported default is the
 * component's default (from a JSDoc `@defaultValue`) or `-`, and is never
 * inferred from a demo.
 *
 * The extractor is deliberately small and lexical, matching the emitted
 * declaration shapes this repository produces: a named props type, an inline
 * props object, `ComponentProps<'tag'>`, and a `VariantProps<typeof x>` where
 * `x` is a `cva` recipe. Anything it cannot expand is recorded as an inherited
 * note rather than omitted, so the table never claims a component has no props.
 *
 * Run: node scripts/generate-api.mjs
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { buildCatalog } from '@nanisoft/prism-ui/catalog'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const SITE = path.join(HERE, '..')
const REPO = path.join(SITE, '..', '..')
const DIST = path.join(REPO, 'packages', 'ui', 'dist')
const OUT_DIR = path.join(SITE, 'src', 'generated')
const OUT = path.join(OUT_DIR, 'api.json')

const MAX_ROWS = 40

function matchBraces(text, openIndex) {
  let depth = 0
  for (let i = openIndex; i < text.length; i += 1) {
    const ch = text[i]
    if (ch === '/' && text[i + 1] === '*') {
      const end = text.indexOf('*/', i + 2)
      i = end < 0 ? text.length : end + 1
      continue
    }
    if (ch === '/' && text[i + 1] === '/') {
      const end = text.indexOf('\n', i + 2)
      i = end < 0 ? text.length : end
      continue
    }
    if (ch === '{') depth += 1
    else if (ch === '}') {
      depth -= 1
      if (depth === 0) return i
    }
  }
  return -1
}

function splitTopLevel(body) {
  const parts = []
  let depth = 0
  let angle = 0
  let quote = null
  let current = ''
  for (let i = 0; i < body.length; i += 1) {
    const ch = body[i]

    // A block comment is copied through so `stripJsdoc` can read it, but its
    // contents must not affect depth or quotes: JSDoc prose contains apostrophes
    // and colons that would otherwise be mistaken for syntax.
    if (!quote && ch === '/' && body[i + 1] === '*') {
      const end = body.indexOf('*/', i + 2)
      const stop = end < 0 ? body.length : end + 2
      current += body.slice(i, stop)
      i = stop - 1
      continue
    }
    if (!quote && ch === '/' && body[i + 1] === '/') {
      const end = body.indexOf('\n', i + 2)
      const stop = end < 0 ? body.length : end
      current += body.slice(i, stop)
      i = stop - 1
      continue
    }

    if (quote) {
      current += ch
      if (ch === quote && body[i - 1] !== '\\') quote = null
      continue
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch
      current += ch
      continue
    }
    if (ch === '(' || ch === '{' || ch === '[') depth += 1
    else if (ch === ')' || ch === '}' || ch === ']') depth -= 1
    else if (ch === '<') angle += 1
    else if (ch === '>') angle = Math.max(0, angle - 1)

    if (ch === ';' && depth <= 0 && angle === 0) {
      parts.push(current)
      current = ''
      continue
    }
    current += ch
  }
  if (current.trim()) parts.push(current)
  return parts
}

function stripJsdoc(text) {
  let description = ''
  let defaultValue = null
  let rest = text
  const match = /\/\*\*([\s\S]*?)\*\//.exec(text)
  if (match) {
    rest = text.slice(match.index + match[0].length)
    const lines = match[1]
      .split('\n')
      .map((line) => line.replace(/^\s*\*?\s?/, '').trim())
      .filter(Boolean)
    const defaultLine = lines.find((line) => /^@defaultValue?\b/i.test(line))
    if (defaultLine) defaultValue = defaultLine.replace(/^@defaultValue?\s*/i, '').trim()
    description = lines
      .filter((line) => !line.startsWith('@'))
      .join(' ')
      .trim()
  }
  return { description, defaultValue, rest: rest.trim() }
}

function parseMembers(body) {
  const rows = []
  for (const part of splitTopLevel(body)) {
    const trimmed = part.trim()
    if (!trimmed) continue
    const { description, defaultValue, rest } = stripJsdoc(trimmed)
    const member = /^([A-Za-z_$][\w$]*)\s*(\?)?\s*:\s*([\s\S]+)$/.exec(rest)
    if (!member) continue
    rows.push({
      name: member[1],
      type: member[3].replace(/;\s*$/, '').trim(),
      required: !member[2],
      default: defaultValue ?? '-',
      description,
    })
    if (rows.length >= MAX_ROWS) break
  }
  return rows
}

function findTypeBody(text, name) {
  const re = new RegExp(`(?:export\\s+)?(?:type|interface)\\s+${name}\\b[^{;]*\\{`)
  const match = re.exec(text)
  if (!match) return null
  const open = match.index + match[0].length - 1
  const close = matchBraces(text, open)
  if (close < 0) return null
  return text.slice(open + 1, close)
}

function findFunctionParams(text, name) {
  const re = new RegExp(`declare\\s+function\\s+${name}\\s*\\(`)
  const match = re.exec(text)
  if (!match) return null
  const start = match.index + match[0].length
  let depth = 1
  let quote = null
  let i = start
  for (; i < text.length; i += 1) {
    const ch = text[i]
    if (quote) {
      if (ch === quote && text[i - 1] !== '\\') quote = null
      continue
    }
    if (ch === '"' || ch === "'" || ch === '`') quote = ch
    else if (ch === '(') depth += 1
    else if (ch === ')') {
      depth -= 1
      if (depth === 0) break
    }
  }
  return text.slice(start, i)
}

function annotationOf(params) {
  let depth = 0
  let angle = 0
  let quote = null
  for (let i = 0; i < params.length; i += 1) {
    const ch = params[i]
    if (quote) {
      if (ch === quote && params[i - 1] !== '\\') quote = null
      continue
    }
    if (ch === '"' || ch === "'" || ch === '`') quote = ch
    else if (ch === '(' || ch === '{' || ch === '[') depth += 1
    else if (ch === ')' || ch === '}' || ch === ']') depth -= 1
    else if (ch === '<') angle += 1
    else if (ch === '>') angle = Math.max(0, angle - 1)
    else if (ch === ':' && depth === 0 && angle === 0) return params.slice(i + 1).trim()
  }
  return null
}

function variantRows(text, recipeName) {
  const re = new RegExp(
    `declare const ${recipeName}\\s*:\\s*\\(props\\?:\\s*\\(\\{([\\s\\S]*?)\\}\\s*&`,
  )
  const match = re.exec(text)
  return match ? parseMembers(match[1]) : []
}

function resolveAnnotation(annotation, text) {
  if (!annotation) return { rows: [], inherited: [] }

  const named = /^[A-Za-z_$][\w$]*$/.test(annotation) ? findTypeBody(text, annotation) : null
  if (named) return { rows: parseMembers(named), inherited: [] }

  if (annotation.startsWith('{')) {
    const close = matchBraces(annotation, 0)
    if (close > 0) return { rows: parseMembers(annotation.slice(1, close)), inherited: [] }
  }

  const rows = []
  const inherited = []

  const recipe = /VariantProps<typeof (\w+)>/.exec(annotation)
  if (recipe) rows.push(...variantRows(text, recipe[1]))

  const componentProps = /ComponentProps<'([^']+)'>/.exec(annotation)
  if (componentProps) inherited.push(`React.ComponentProps<'${componentProps[1]}'>`)

  if (rows.length === 0 && inherited.length === 0) {
    inherited.push(annotation.replace(/\s+/g, ' ').slice(0, 200))
  }

  return { rows, inherited }
}

function dtsPath(source) {
  const relative = source.replace(/^src\//, '').replace(/\.tsx?$/, '.d.ts')
  return path.join(DIST, relative)
}

/**
 * Reads a declaration file plus anything it re-exports from a relative path.
 *
 * A block's `index.tsx` re-exports from `./hero`, so the function declaration
 * lives in a sibling file. Following the relative re-export one hop is enough
 * for the shapes this repository emits.
 */
async function readDeclarations(file) {
  const text = await readFile(file, 'utf8')
  const dir = path.dirname(file)
  const parts = [text]
  for (const match of text.matchAll(/from\s+['"](\.[^'"]+)['"]/g)) {
    const base = path.resolve(dir, match[1])
    for (const candidate of [`${base}.d.ts`, `${base}.d.mts`, path.join(base, 'index.d.ts')]) {
      try {
        parts.push(await readFile(candidate, 'utf8'))
        break
      } catch {
        // try the next shape
      }
    }
  }
  return parts.join('\n')
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

  const exports = item.exports.map((name) => {
    const params = findFunctionParams(text, name)
    if (params === null) {
      warnings.push(`${item.slug}: no declaration for export "${name}"`)
      return { name, rows: [], inherited: [] }
    }
    const { rows, inherited } = resolveAnnotation(annotationOf(params), text)
    return { name, rows, inherited }
  })

  output[item.slug] = { exports }
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
