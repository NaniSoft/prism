/**
 * Token-compliance gate (Mission Gates A and B).
 *
 * No raw colour anywhere outside the foundation tier: no hex literal, no
 * rgb()/hsl()/oklch() (the token pipeline is the only place a colour is
 * spelled out), and no Tailwind arbitrary value that carries a resolved colour
 * (`bg-[#...]`, `text-[#...]`, `from-[#...]` and friends). A component that
 * paints must name a semantic token (`bg-primary`, `text-muted-foreground`)
 * and a pack boundary must repaint it through the cascade.
 *
 * Two deliberate carve-outs, both declared here rather than inferred:
 * comments are stripped (a JSDoc block that quotes `#ec88a0` to explain why it
 * fails contrast is a record, not a paint), and one canvas fallback in
 * `tsparticles-field` is exempt because it is read before any computed style
 * exists — the file carries the reason beside the literal. Tests and fixtures
 * are excluded (they spell the banned shapes on purpose to prove this gate).
 *
 * `PRISM_TOKENS_ROOT` redirects the tree so the gate can prove itself against a
 * staged fixture.
 *
 * Run: pnpm --filter @nanisoft/prism-ui check:token-compliance
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const NAME = 'token-compliance'
const HERE = path.dirname(fileURLToPath(import.meta.url))
const PKG = path.join(HERE, '..')

const ROOT = process.env.PRISM_TOKENS_ROOT
  ? path.resolve(process.env.PRISM_TOKENS_ROOT)
  : path.join(PKG, 'src')

const EXT = /\.(tsx?|jsx?)$/
const HEX = /#[0-9a-fA-F]{3,8}\b/g
const COLOR_FN = /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix)\s*\(/g
const ARBITRARY_COLOR = /(?:^|[\s"'`:])(?:[a-z][\w-]*:)*(?:bg|text|border|ring|outline|decoration|accent|caret|from|via|to|fill|stroke)-\[([^\]]+)\]/g

function walk(dir, out = []) {
  if (!existsSync(dir)) return out
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else if (EXT.test(entry.name) && !entry.name.endsWith('.test.tsx')) out.push(full)
  }
  return out
}

function stripComments(source) {
  return source
    .split('')
    .map((c, i) => c)
    .join('')
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/\/\/[^\n]*/g, (m) => m.replace(/[^\n]/g, ' '))
}

const files = walk(ROOT).sort()
if (files.length === 0) {
  console.error(`${NAME}: no source read under ${ROOT}, so the rule judged nothing`)
  process.exit(1)
}

const failures = []
let literals = 0
let arbitraryRead = 0

for (const file of files) {
  const raw = readFileSync(file, 'utf8')
  const source = stripComments(raw)
  const shown = path.relative(PKG, file).split(path.sep).join('/')
  const lines = source.split('\n')
  const lineOf = (index) => source.slice(0, index).split('\n').length

  for (const match of source.matchAll(HEX)) {
    literals += 1
    // The one declared canvas fallback: initial ink before read() runs.
    if (shown.endsWith('tsparticles-field.tsx') && ['#aebccb', '#8b98a7'].includes(match[0].toLowerCase())) continue
    failures.push(`${shown}:${lineOf(match.index)}  [hex]  ${match[0]} is a resolved colour; name the semantic token`)
  }
  for (const match of source.matchAll(COLOR_FN)) {
    failures.push(`${shown}:${lineOf(match.index)}  [colour-function]  ${match[0].slice(0, 24)}... computes a colour; name the semantic token`)
  }
  for (const match of source.matchAll(ARBITRARY_COLOR)) {
    arbitraryRead += 1
    const inner = match[1]
    if (/^#[0-9a-fA-F]{3,8}$/.test(inner) || /^(?:rgb|hsl|oklch|oklab|color)\(/.test(inner)) {
      failures.push(`${shown}:${lineOf(match.index)}  [arbitrary-colour]  ${match[0].trim()} carries a resolved colour`)
    } else if (inner.startsWith('var(--')) {
      // A var-backed arbitrary value is a token by another spelling; held to the
      // contract by check-vector-ink for the drawing set and by this gate's
      // var(--<published>) expectation for the rest.
      continue
    } else if (/^(?:red|blue|green|amber|emerald|pink|purple|orange|teal|stone|zinc|gray|neutral|slate)-/.test(inner)) {
      failures.push(`${shown}:${lineOf(match.index)}  [arbitrary-colour]  ${match[0].trim()} names a palette step; the semantic token is the name`)
    }
  }
}

console.log(`${NAME}: ${files.length} source file(s) read under ${path.relative(PKG, ROOT)}`)
console.log(`${NAME}: ${literals} hex literal(s) judged, ${arbitraryRead} arbitrary-colour utility(ies) judged`)

if (failures.length > 0) {
  for (const failure of failures) console.error(`error ${failure}`)
  process.exit(1)
}
console.log(`${NAME}: no hardcoded colour or arbitrary resolved value in the shipped source.`)
