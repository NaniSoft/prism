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
 * A fourth, added because this gate had no model for it and reported a correct
 * mechanism as a defect. A metric-adjusted fallback is an `@font-face` reading
 * `local(...)` with `size-adjust`, `ascent-override`, `descent-override` and
 * `line-gap-override` on it, and it names a family of its own rather than shipping
 * a file. This gate inferred the shipped families from the file names in
 * `dist/fonts`, so it called that family a mid-stack name resolving nowhere, and
 * its own source check called the rule a face with no `src`. Both halves were
 * wrong. The gate now reads the families the emitted sheet declares, exempts a
 * `local()` face from the file check while requiring all four descriptors of it,
 * and fails a fallback face no token names, because a hand-written set of metric
 * numbers that no stack reaches is the shape that rots.
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

/**
 * A family the emitted stylesheet actually publishes: a file this package copies,
 * or an `@font-face` this package declares. The second half is what a
 * `local()`-backed fallback needs, because it ships no file and would otherwise be
 * reported as a mid-stack name that resolves nowhere, which is exactly the
 * behaviour it was added to replace.
 */
const backs = (family) =>
  shipped.has(family.toLowerCase()) || declared.has(family.toLowerCase()) || provided(family)

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

/**
 * Every `@font-face` the emitted sheet declares, read out of the artefact.
 *
 * Two shapes, and the second one is why this reads the rules rather than the
 * directory listing. A face backed by a file names one on disk, and the family is
 * then inferred from the file name, which is a proxy: `inter-latin-400.woff2`
 * implies `Inter` by convention and nothing enforces the convention. A face
 * backed by `local()` names no file at all, and that is the shape a
 * metric-adjusted fallback takes:
 *
 *     @font-face {
 *       font-family: 'Inter Fallback';
 *       src: local('Arial');
 *       size-adjust: 107.89%;
 *       ascent-override: 89.79%;
 *       descent-override: 22.36%;
 *       line-gap-override: 0%;
 *     }
 *
 * The four descriptors are the whole of the technique and they need no build tool,
 * so a package that ships a face can and should ship the fallback that makes the
 * swap window occupy the real face's line box. This gate read the stylesheet and
 * could not see it: the rule declared no `src` it could resolve, so it was
 * reported as a face with no source, and the family it declared was then called a
 * mid-stack name that resolves nowhere. Both halves were wrong about a mechanism
 * the gate had no model for, and a rule that reports a correct mechanism as a
 * defect gets switched off within a week.
 */
function readFaces() {
  return [...sheet.matchAll(/@font-face\s*\{([^{}]*)\}/g)].map((match) => {
    const body = match[1]
    const local = /src:\s*local\((['"]?)([^'")]+)\1\)/.exec(body)
    return {
      body,
      family: (/font-family:\s*['"]?([^;'"}]+)/.exec(body)?.[1] ?? '').trim(),
      style: (/font-style:\s*([\w-]+)/.exec(body)?.[1] ?? 'normal').trim(),
      weight: (/font-weight:\s*([\d\s]+)/.exec(body)?.[1] ?? '').trim(),
      file: /url\(['"]?([^'")]+)/.exec(body)?.[1] ?? null,
      local: local ? local[2].trim() : null,
    }
  })
}

const FACES = readFaces()

/** The family every `@font-face` in the artefact declares, lowercased. */
const declared = new Set(FACES.map((face) => face.family.toLowerCase()).filter(Boolean))

/**
 * The four descriptors a metric-adjusted fallback is made of, and the check that
 * a face declaring them is actually adjusting something.
 */
const METRIC_DESCRIPTORS = [
  'size-adjust',
  'ascent-override',
  'descent-override',
  'line-gap-override',
]

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
// Declared by the sheet rather than inferred from a file name, so a family this
// package publishes as a rule is backed whether or not a file carries its name.
for (const family of [...declared].sort()) {
  if (shipped.has(family)) continue
  report(`  ${family}`, true, 'declared by the sheet, not backed by a file: the metric-adjusted fallback')
}

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
  const backed = backs(first)
  report(`  ${property} (${token})`, true, `${first} + ${rest.length} fallback(s)`)
  if (!backed) {
    failures.push(
      `${property} names "${first}" first and neither this package nor the reader's machine ` +
        `provides it, so the head of the stack resolves to nothing and the page renders in the ` +
        `fallback. Ship the face, or name a family the platform provides.`,
    )
  }
  for (const family of rest) {
    if (backs(family)) continue
    failures.push(
      `${property} names "${family}" mid-stack, which neither this package nor the reader's ` +
        `machine provides; a family that resolves nowhere is a name that costs a round trip and ` +
        `picks nothing.`,
    )
  }
}

/**
 * A fallback face earns its place in a stack, and this is where it is checked.
 *
 * A `local()`-backed rule that no token names is dead CSS a reader never reaches,
 * and it is the shape most likely to rot: the four descriptors are hand-written
 * numbers, so a face left behind by a retune is indistinguishable from one still in
 * use. Naming it is also the only thing that keeps it adjacent to the face it
 * measures, which is the relationship the technique exists for.
 */
const namedSomewhere = new Set(
  TOKENS.flatMap(({ property }) => familiesOf(property) ?? []).map((family) => family.toLowerCase()),
)
for (const face of FACES) {
  if (face.local === null) continue
  if (!namedSomewhere.has(face.family.toLowerCase())) {
    failures.push(
      `the metric-adjusted fallback "${face.family}" is declared as an @font-face but no font ` +
        `token names it, so nothing ever reaches it. Name it in --font-sans, immediately after ` +
        `the face it measures, or delete the rule.`,
    )
  }
}

// 3. The @font-face rules in the emitted sheet point at files that exist, with a
//    RELATIVE source. An absolute path or a web-root path resolves against the
//    consumer's origin, which is how the old line's face failed silently in all
//    four repositories.
console.log('\ntypeface: every @font-face source resolves from the package')
let faces = 0
for (const face of FACES) {
  faces += 1
  if (face.local !== null) {
    const missing = METRIC_DESCRIPTORS.filter(
      (descriptor) => !new RegExp(`${descriptor}:`).test(face.body),
    )
    if (missing.length > 0) {
      failures.push(
        `the @font-face for "${face.family}" reads local('${face.local}') and adjusts nothing: ` +
          `it is missing ${missing.join(', ')}. A local face with no metric descriptors is the ` +
          `platform's own face under a name, which is the fallback the adjustment exists to fix.`,
      )
      continue
    }
    report(`  ${face.family}`, true, `local('${face.local}') with the four metric descriptors`)
    continue
  }
  if (!face.file) {
    failures.push('an @font-face rule declares no src')
    continue
  }
  if (face.file.startsWith('/') || /^[a-z]+:\/\//i.test(face.file)) {
    failures.push(
      `@font-face src "${face.file}" is an absolute or web-root path; it resolves against the ` +
        `consumer's origin, not the package, and fails silently in every repository.`,
    )
    continue
  }
  const onDisk = path.join(path.dirname(EMITTED), face.file)
  if (!existsSync(onDisk)) {
    failures.push(`@font-face src "${face.file}" does not exist next to the emitted stylesheet`)
    continue
  }
  const at = face.weight ? `weight ${face.weight}` : `weight ?`
  const style = face.style === 'normal' ? '' : ` ${face.style}`
  report(
    `  ${at}${style}`,
    true,
    `${path.basename(face.file)}, ${(statSync(onDisk).size / 1024).toFixed(1)} KB`,
  )
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
  `typeface: every token family is a face this package publishes or a system generic, ` +
    `${faces} @font-face rule(s) resolve from the package, and the licence ships beside the binary`,
)
