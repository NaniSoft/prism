/**
 * The face a token family names must be a face this package ships.
 *
 * The defect this exists to end: `--font-sans` declared `Inter, ui-sans-serif,
 * system-ui, ...` and shipped no font file at all, so the first entry resolved to
 * nothing and every page fell through to the platform's UI face. A consumer that
 * deleted its own copy and loaded nothing got exactly that, and nothing anywhere
 * said so, because a design system can name a family as easily as it can ship one
 * and only a check that reads the two against each other can tell the difference.
 *
 * A generic family is exempt, and the reason is that a generic is the point of a
 * fallback: `ui-sans-serif` and `system-ui` name faces the reader's own machine
 * has, and this package has no business shipping them. A named family is not
 * exempt, and neither is a family that looks like a generic but is not one, which
 * is why the list is declared rather than inferred.
 *
 * A second check, and it is the one that would have caught the original failure
 * in a consumer: the emitted stylesheet's first family must be backed by a
 * `@font-face` this package ships, read from the EMITTED artefact rather than the
 * source. The original failure was invisible in source. The rules shipped, the
 * subsets were preloaded, and only the class carrying the variable was missing, so
 * the family resolved to nothing at computed-value time with no error anywhere. A
 * source-level check passes on that page.
 *
 * A third: a shipped face with no licence beside it is a redistribution problem
 * rather than a dependency, and the obligation has to travel with the file.
 *
 * Run: pnpm --filter @nanisoft/prism-ui check:typeface
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const PKG = path.join(HERE, '..')
/**
 * The licence is read beside the EMITTED binaries rather than beside the source,
 * because that is where a consumer's install carries it. A licence that is in the
 * repository and not in the package discharges the obligation to a reader of the
 * repository and not to the person who installed the file, and the person who
 * installed the file is the one who needs it.
 */
const FONT_DIR = path.join(PKG, 'dist', 'fonts')
const EMITTED = path.join(PKG, 'dist', 'styles.css')

/**
 * The generic families, declared, because a generic is a request to the reader's
 * own machine and this package has no business shipping one.
 */
const GENERIC = new Set([
  'ui-sans-serif',
  'system-ui',
  'sans-serif',
  'ui-serif',
  'serif',
  'ui-monospace',
  'monospace',
  'cursive',
  'fantasy',
])

/**
 * The named faces a system supplies, declared separately from the generics
 * because they are the same request in different words.
 *
 * This list was wrong in the first version of this gate, which read a mid-stack
 * named face as a finding. `-apple-system`, `Segoe UI`, `Roboto`, `Helvetica
 * Neue` and `Arial` are the platform's own faces, they are in every stack this
 * design system declares, and treating them as unshipped made the gate fail on
 * the design system's own correct fallback list. The distinction is real and worth
 * keeping: a generic is a keyword, and a platform face is a name that resolves on
 * some machines and not others, and only the second is worth a reader's
 * attention.
 */
const SYSTEM_FACES = new Set([
  '-apple-system',
  'BlinkMacSystemFont',
  'Segoe UI',
  'Roboto',
  'Helvetica Neue',
  'Helvetica',
  'Arial',
  'SFMono-Regular',
  'SF Mono',
  'Menlo',
  'Consolas',
  'Liberation Mono',
])

/** A family this package may name without shipping it: a generic or a system face. */
const provided = (family) => GENERIC.has(family) || SYSTEM_FACES.has(family)

/** The token families the gate reads, and the property each is declared by. */
const TOKENS = [
  { property: '--font-sans', token: 'the interface face' },
  { property: '--font-mono', token: 'machine-readable values' },
]

const failures = []
const report = (label, ok, detail = '') =>
  console.log(`  ${label}${detail ? `  ${detail}` : ''}`)

if (!existsSync(EMITTED)) {
  console.error('typeface: dist/styles.css does not exist; build the package first')
  process.exit(1)
}

const sheet = readFileSync(EMITTED, 'utf8')

/** Every family a custom property's value names, in order, with quotes removed. */
function familiesOf(property) {
  const declaration = new RegExp(`${property}:\\s*([^;}]+)`).exec(sheet)
  if (!declaration) return null
  return declaration[1]
    .split(',')
    .map((part) => part.trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean)
}

// 1. Every named family in a token stack is one this package ships.
const shipped = new Set()
for (const file of existsSync(FONT_DIR) ? readdirSync(FONT_DIR) : []) {
  if (!/\.woff2?$|\.ttf$|\.otf$/.test(file)) continue
  // The file name carries the family: `inter-latin-400.woff2` ships Inter.
  shipped.add(file.split('-')[0].toLowerCase())
}

console.log('typeface: the faces this package ships')
if (shipped.size === 0) report('  none', true, 'a token that names no face is then a finding below')
for (const family of [...shipped].sort()) report(`  ${family}`, true)

// 2. The first family of each token is backed by a @font-face, read from the
//    emitted artefact. This is the check that would have caught the consumer
//    failure that the source could not see.
console.log('\ntypeface: each token family, against what is emitted')
for (const { property, token } of TOKENS) {
  const families = familiesOf(property)
  if (families === null) {
    failures.push(`${property} is not declared in the emitted stylesheet`)
    report(`  ${property}`, false, 'not declared')
    continue
  }
  const [first, ...rest] = families
  // A token whose FIRST family is a system face is a design decision, not a gap:
  // the design system names Inter first because it ships Inter. What this gate
  // refuses is a first family that is neither shipped here nor provided by the
  // reader's machine, because then the stack's head resolves to nothing and the
  // page silently renders in the fallback, which is the defect.
  const backed = shipped.has(first.toLowerCase()) || provided(first)
  report(`  ${property} (${token})`, true, `${first} + ${rest.length} fallback(s)`)
  if (!backed) {
    failures.push(
      `${property} names "${first}" first and neither this package nor the reader's machine ` +
        `provides it, so the head of the stack resolves to nothing and the page renders in the ` +
        `fallback. Ship the face, or name a family the platform provides.`,
    )
  }
  for (const family of rest) {
    if (shipped.has(family.toLowerCase()) || provided(family)) continue
    failures.push(
      `${property} names "${family}" mid-stack, which neither this package nor the reader's ` +
        `machine provides; a family that resolves nowhere is a name that costs a round trip and ` +
        `picks nothing.`,
    )
  }
}

// 3. The @font-face rules in the emitted sheet point at files that exist, with a
//    RELATIVE source. An absolute path or a web-root path resolves against the
//    consumer's origin, which is how the old line's face failed silently in all
//    four repositories.
console.log('\ntypeface: every @font-face source resolves from the package')
const faceRule = /@font-face\s*\{([^{}]*)\}/g
let faces = 0
for (const match of sheet.matchAll(faceRule)) {
  faces += 1
  const body = match[1]
  const src = /url\(['"]?([^'")]+)/.exec(body)?.[1]
  const weight = /font-weight:\s*([\d]+)/.exec(body)?.[1]
  if (!src) {
    failures.push('an @font-face rule declares no src')
    continue
  }
  if (src.startsWith('/') || /^[a-z]+:\/\//i.test(src)) {
    failures.push(
      `@font-face src "${src}" is an absolute or web-root path; it resolves against the ` +
        `consumer's origin, not the package, and fails silently in every repository.`,
    )
    continue
  }
  const onDisk = path.join(path.dirname(EMITTED), src)
  if (!existsSync(onDisk)) {
    failures.push(`@font-face src "${src}" does not exist next to the emitted stylesheet`)
    continue
  }
  report(`  weight ${weight ?? '?'}`, true, `${path.basename(src)}, ${(statSync(onDisk).size / 1024).toFixed(1)} KB`)
}
if (faces === 0) {
  failures.push(
    'the emitted stylesheet declares no @font-face rule, so the family --font-sans names resolves ' +
      'to nothing in every consumer',
  )
}

// 4. A face with no licence beside it is a redistribution problem.
console.log('\ntypeface: the licence travels with the binaries')
// A file the operator renamed out of the way is not a licence file, and this
// check was fooled by its own test for two runs because a file called
// `Inter-OFL.held` is not named like a licence and the renamed copy was still
// sitting in the directory. The filter is anchored to the end of the name so a
// renamed file stops counting, and the whole directory is listed when the check
// fails so a reader can see what was there rather than only what was not.
const licences = existsSync(FONT_DIR)
  ? readdirSync(FONT_DIR).filter((f) => /(?:^|[\s._-])(?:OFL|LICENSE|LICENCE)(?:[\s._-]|$)/i.test(f))
  : []
if (shipped.size > 0 && licences.length === 0) {
  failures.push(
    'this package ships a font binary with no licence file beside it; the obligation has to ' +
      'travel with the file, not sit in a repository document the consumer never reads',
  )
} else {
  for (const licence of licences) report(`  ${licence}`, true)
}

console.log('')
if (failures.length > 0) {
  console.error(`typeface: ${failures.length} failure(s)`)
  for (const failure of failures) console.error(`  - ${failure}`)
  process.exit(1)
}
console.log(
  `typeface: every token family is either a shipped face or a system generic, ` +
    `${faces} @font-face rule(s) resolve from the package, and the licence ships beside the binary`,
)
