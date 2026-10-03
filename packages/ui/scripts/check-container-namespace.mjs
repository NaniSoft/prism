/**
 * The shipped stylesheet's container namespace, and every width in it that resolves.
 *
 * **THE DEFECT THIS EXISTS TO END WAS INVISIBLE IN SOURCE.** The token package
 * authored three containers and Tailwind ships thirteen of its own, and until the
 * token build closed the namespace the shipped `dist/styles.css` carried both.
 * Three of Tailwind's steps were numerically identical to an authored width: its
 * largest was 72rem beside `--container-page`, its fifth was 42rem beside
 * `--container-measure`, its fourth was 36rem beside `--container-measure-narrow`.
 * Nothing rendered differently, so nothing failed and every gate in this repository
 * was green. The cost was latent and exact: a retune of `--container-page` would
 * have moved every surface reaching the page column by one spelling and left every
 * surface reaching it by the other precisely where it was, and no gate would have
 * fired because each of them was holding a value rather than asking whether a name
 * resolves.
 *
 * **SO THIS GATE READS THE ARTEFACT, AND THE SOURCE CHECKS LIVE SOMEWHERE ELSE.**
 * No scan of `packages/ui/src` can tell whether a framework resolved a class, which
 * is why `scripts/check-elevation-layout.mjs` answers "is this name one we author"
 * over the source and this answers "does the sheet a consumer imports agree". The
 * two are not the same question and neither subsumes the other: a source that names
 * a container correctly still ships nothing if the build dropped the variable, and a
 * sheet that carries a Tailwind step is invisible to a gate that reads no CSS.
 *
 *   1. The `@layer theme` block in `dist/styles.css` declares exactly the container
 *      names the token source authors, as `--container-<name>`, and nothing else.
 *   2. No declaration in the whole sheet names one of Tailwind's own steps. The
 *      steps are read out of the INSTALLED `tailwindcss/theme.css` rather than
 *      listed here, because the thing being defended against is that list and a
 *      hand-kept copy of it is the second copy this gate exists to prevent. A
 *      Tailwind that adds a step is therefore covered without an edit, and a
 *      Tailwind that cannot be resolved fails the run rather than quietly checking
 *      an empty set.
 *   3. No rule in the sheet reads `var(--container-<step>)`. That is the half that
 *      catches a retired class name surviving in a JSDoc block, because Tailwind's
 *      extractor reads this package's comments and a class quoted in prose is a
 *      class the sheet emits.
 *   4. Every container width this package's own source writes is emitted as a
 *      utility that reads its variable. A retune that renamed `--container-page`
 *      would leave `Section`'s class resolving to a variable nothing declares, and
 *      every surface reaching the page column through it would go full width.
 *
 * **AND THE TOKEN BUILD HAS TO SAY SO.** The close is a `--container-*: initial` in
 * the `@theme static` block, and Tailwind resolves a theme in source order, so the
 * same declaration written after the authored entries would clear all eight and
 * ship no container at all. That half is read from the token package's own emitted
 * `theme.css` rather than inferred from the sheet: the sheet cannot distinguish
 * "the close ran and the authored entries came after" from "the close never ran and
 * no utility happened to need a step", and only one of those two is a working
 * stylesheet.
 *
 * Coverage is asserted: a missing artefact fails the run rather than emptying it,
 * an authored container no surface uses is a finding rather than dead CSS, and
 * every run prints what it read and what it compared against.
 *
 * Run: pnpm --filter @nanisoft/prism-ui check:container-namespace
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const NAME = 'container-namespace'
const HERE = path.dirname(fileURLToPath(import.meta.url))
const PKG = path.join(HERE, '..')
const REPO = path.join(PKG, '..', '..')

/** The artefact a consumer imports. `turbo.json` builds this package before its checks. */
const SHIPPED = path.join(PKG, 'dist', 'styles.css')
/** The token package's emitted theme, which is where the close is declared. */
const TOKEN_THEME = path.join(REPO, 'packages', 'tokens', 'dist', 'theme.css')
/** The authored names, read from the source rather than from a build output. */
const LAYOUT_TOKENS = path.join(REPO, 'packages', 'tokens', 'src', 'foundation', 'layout.tokens.json')
/** This package's own class strings, for the call sites that have to resolve. */
const SOURCE = path.join(PKG, 'src')

const rel = (file) => path.relative(REPO, file).split(path.sep).join('/')

const failures = []
const fail = (message) => failures.push(message)

/* ── Reading the artefacts ─────────────────────────────────────────────────── */

function requireFile(file, what) {
  if (!existsSync(file)) {
    console.error(
      `${NAME}: ${rel(file)} does not exist, so this run has nothing to check. ${what}\n` +
        '  Run the build first: this gate reads the stylesheet a consumer installs, and a stylesheet\n' +
        '  that was never built cannot be checked.',
    )
    process.exit(1)
  }
  return readFileSync(file, 'utf8')
}

const shipped = requireFile(SHIPPED, 'Run `pnpm build` first.')
const tokenTheme = requireFile(TOKEN_THEME, 'Run `pnpm --filter @nanisoft/prism-tokens build` first.')

/** The index just past the `}` closing the `{` at `open`, or -1. */
function closingBrace(source, open) {
  let depth = 0
  for (let i = open; i < source.length; i += 1) {
    if (source[i] === '{') depth += 1
    else if (source[i] === '}') {
      depth -= 1
      if (depth === 0) return i
    }
  }
  return -1
}

/** The body of the first at-rule block named `name`, or null. */
function atRuleBody(source, name) {
  const at = source.indexOf(name)
  if (at === -1) return null
  const open = source.indexOf('{', at)
  if (open === -1) return null
  const close = closingBrace(source, open)
  return close === -1 ? null : source.slice(open + 1, close)
}

/* ── The two authorities ───────────────────────────────────────────────────── */

/**
 * The container names this repository authors, from the token source.
 *
 * Source rather than `dist`, for the reason `check-breakpoint-variants.mjs` gives
 * for its screens: a gate whose subject is the authored scale cannot be answered by
 * a build output a warm cache may have left behind.
 */
const authored = Object.keys(JSON.parse(readFileSync(LAYOUT_TOKENS, 'utf8')).container ?? {}).filter(
  (name) => !name.startsWith('$'),
)
if (authored.length === 0) {
  console.error(
    `${NAME}: the authored \`container\` group in ${rel(LAYOUT_TOKENS)} is empty, so every width in the\n` +
      '  sheet would read as un-authored. This run has no authority to judge against and fails rather\n' +
      '  than reporting every name it finds.',
  )
  process.exit(1)
}

/**
 * Tailwind's own container steps, read out of the installed default theme.
 *
 * Read rather than listed, because this gate's subject is that list and a copy of it
 * beside this script is a second thing to keep in step with a dependency. Resolution
 * failing is a failure rather than an empty set, because an empty set makes every
 * assertion below pass for the wrong reason.
 */
let tailwindSteps = []
try {
  const require = createRequire(import.meta.url)
  const defaultTheme = require.resolve('tailwindcss/theme.css')
  const theme = readFileSync(defaultTheme, 'utf8')
  tailwindSteps = [...theme.matchAll(/^\s*--container-([\w-]+):/gm)].map((match) => match[1]).sort()
  if (tailwindSteps.length === 0) throw new Error('no --container-* declaration in it')
} catch (cause) {
  console.error(
    `${NAME}: Tailwind's default theme did not resolve, so this run has no list of the steps it is\n` +
      `  defending against and every assertion about them would pass for the wrong reason.\n  ${cause.message}`,
  )
  process.exit(1)
}

/** Tailwind's step names are a different namespace from ours, and one overlaps in spelling. */
const retired = tailwindSteps.filter((step) => !authored.includes(step))

/* ── 1. The sheet's theme block declares exactly the authored names ─────────── */

const themeLayer = atRuleBody(shipped, '@layer theme')
if (themeLayer === null) {
  fail('the shipped stylesheet declares no `@layer theme` block, so its theme variables are unreadable here')
}

const declarationsIn = (body) =>
  [...(body ?? '').matchAll(/--([\w*-]+)\s*:\s*([^;]+);/g)].map((match) => [match[1], match[2].trim()])

const themeDecls = declarationsIn(themeLayer)
const shippedContainers = themeDecls
  .filter(([name]) => name.startsWith('container-'))
  .map(([name, value]) => [name.slice('container-'.length), value])

const shippedNames = shippedContainers.map(([name]) => name).sort()
const authoredSorted = [...authored].sort()
if (JSON.stringify(shippedNames) !== JSON.stringify(authoredSorted)) {
  const missing = authoredSorted.filter((name) => !shippedNames.includes(name))
  const extra = shippedNames.filter((name) => !authoredSorted.includes(name))
  fail(
    `the shipped \`@layer theme\` declares [${shippedNames.join(', ') || 'nothing'}] and the token source ` +
      `authors [${authoredSorted.join(', ')}]` +
      (missing.length ? `; not emitted: ${missing.join(', ')}` : '') +
      (extra.length ? `; emitted without an authored source entry: ${extra.join(', ')}` : ''),
  )
}

/* ── 2. No Tailwind step survives in the sheet ──────────────────────────────── */

const declaredSteps = themeDecls
  .map(([name]) => name)
  .filter((name) => name.startsWith('container-'))
  .map((name) => name.slice('container-'.length))
  .filter((step) => retired.includes(step))
  .sort()
for (const step of declaredSteps) {
  fail(
    `the shipped stylesheet declares \`--container-${step}\`, which is Tailwind's own step rather than a ` +
      'name this repository authors, so two spellings of a width are shipping at once',
  )
}

/* ── 3. No rule reads a Tailwind step ──────────────────────────────────────── */

const stepReads = new Set()
for (const match of shipped.matchAll(/var\(--container-([\w-]+)\)/g)) {
  if (retired.includes(match[1])) stepReads.add(match[1])
}
for (const step of [...stepReads].sort()) {
  fail(
    `the shipped stylesheet has a rule reading \`var(--container-${step})\`, which nothing declares now that ` +
      'the namespace is closed. Tailwind extracts this package\'s source comments as well as its code, so ' +
      'this is the signature of a retired class name written down in prose.',
  )
}

/* ── 4. The close is declared, and it is declared before the authored entries ─ */

const staticBody = atRuleBody(tokenTheme, '@theme static') ?? ''
const closeAt = staticBody.search(/^\s*--container-\*:\s*initial;/m)
const firstAuthoredAt = staticBody.search(/^\s*--container-(?![\s*])/m)
if (closeAt === -1) {
  fail(
    `${rel(TOKEN_THEME)} does not close the container namespace. Tailwind ships ${tailwindSteps.length} ` +
      'steps of its own and the sheet above is clean only because they resolved to nothing; without the ' +
      'close the next build that uses one of them ships it.',
  )
} else if (firstAuthoredAt !== -1 && closeAt > firstAuthoredAt) {
  fail(
    `${rel(TOKEN_THEME)} writes \`--container-*: initial\` after an authored \`--container-*\` entry, which ` +
      'clears the authored widths as well as Tailwind\'s steps and ships no container at all',
  )
}

/* ── 5. Every width this package writes resolves in the sheet ───────────────── */

/** Every source file under `dir`, recursive. */
function walk(dir) {
  const found = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) found.push(...walk(full))
    else if (/\.(tsx?|jsx?)$/.test(entry.name)) found.push(full)
  }
  return found
}

/** Blank comments, so a class named in a JSDoc block is not read as a call site. */
const blankComments = (source) => source.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))

const utilities = new Map()
for (const match of shipped.matchAll(/\.((?:max-)?w-[^\s,{]+)\s*\{([^}]*)\}/g)) {
  utilities.set(match[1].replace(/\\(.)/g, '$1'), match[2])
}

const used = new Set()
let sourceFiles = 0
for (const file of walk(SOURCE)) {
  sourceFiles += 1
  const source = blankComments(readFileSync(file, 'utf8'))
  for (const match of source.matchAll(/(?:^|[\s"'`:])((?:[a-z][\w-]*:)*)((?:max-)?w-[^\s"'`]+)/g)) {
    const name = match[2].slice(match[2].indexOf('w-') + 2)
    if (!authored.includes(name)) continue
    used.add(name)
    const body = utilities.get(match[2]) ?? utilities.get(`sm:${match[2]}`)
    if (body === undefined) {
      fail(
        `${rel(file)}: \`${match[2]}\` names \`--container-${name}\`, which the token source authors, but the ` +
          'shipped stylesheet emits no rule for it',
      )
      continue
    }
    if (!body.includes(`var(--container-${name})`)) {
      fail(`${rel(file)}: \`${match[2]}\` is emitted as \`${body.trim()}\` rather than reading \`--container-${name}\``)
    }
  }
}

const unused = authoredSorted.filter((name) => !used.has(name))
for (const name of unused) {
  fail(
    `--container-${name} is authored and emitted and no surface in ${rel(SOURCE)} writes it, so it is a token ` +
      'nobody reaches. Either a surface should name it or it should not be authored.',
  )
}

/* ── Report ────────────────────────────────────────────────────────────────── */

console.log(`${NAME}: the shipped stylesheet, read from ${rel(SHIPPED)}`)
console.log(
  `  @layer theme declares ${shippedContainers.length} container variable(s): ` +
    shippedContainers.map(([name, value]) => `${name} ${value}`).join(', '),
)
console.log(
  `  authored in ${rel(LAYOUT_TOKENS)}: ${authoredSorted.join(', ')}; ` +
    `Tailwind's own ${tailwindSteps.length} step(s), read from the installed default theme: ${tailwindSteps.join(', ')}`,
)
console.log(
  `  close: ${closeAt === -1 ? 'ABSENT' : `--container-*: initial at offset ${closeAt} of ${rel(TOKEN_THEME)}`}; ` +
    `${used.size} of ${authoredSorted.length} authored container(s) reached by a call site in ${sourceFiles} file(s)`,
)

if (failures.length > 0) {
  console.error(`\n${NAME}: ${failures.length} failure(s)`)
  for (const failure of failures) console.error(`  - ${failure}`)
  process.exit(1)
}

console.log(
  `${NAME}: every container width this package writes resolves to an authored token, and none of\n` +
    `  Tailwind's ${tailwindSteps.length} own steps is declared or read in the shipped sheet.`,
)
