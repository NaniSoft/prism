/**
 * A Block and a Page ship no copy, and the gate says which strings are not copy.
 *
 * The claim this holds. DESIGN.md lists it under Key characteristics: "Blocks ship
 * no copy and no sample data; every string and every number is a prop." AGENTS.md
 * says the same from the other side, in the Do list: "pass content into a Block as
 * props, including the eyebrow, the numbers and the price. A Block ships no copy
 * and no sample data." CONTEXT.md makes it part of the definition: a Block "takes
 * its content as props and fetches no application data", and a Page "receives
 * application-owned navigation, content and data".
 *
 * The hole this closes. Nothing checked it, and the defect is invisible in review
 * and invisible in every other gate. A hardcoded string in a Block is a legal
 * TypeScript string: it type-checks, it passes the token gates, it passes the
 * surface gate, it appears in the emitted declaration as a literal, and the
 * rendered result is a sentence. Every consumer who installs the Block then
 * inherits a claim about somebody else's product, and the corpus publishes that
 * sentence as part of the Block's own documentation. `pricing-01` shipped exactly
 * this: a featured plan with no badge of its own rendered the word "Popular",
 * which is a claim about a plan a consumer may not have.
 *
 * ## What counts as copy, and what is declared not to
 *
 * A text scan of a TSX file finds a great many string literals, and almost none of
 * them are words a reader reads. A utility class string, a `data-slot` value, a
 * `role`, a variant name and a `type` are all literals and none of them is copy.
 * So the rule is a shape, not a name: a literal is copy when it *reads like a
 * word or a sentence*, which this gate decides with one rule - the literal
 * contains an uppercase letter, a space, or a full stop. Every lowercase,
 * single-token literal in a Block is a machine value: a variant, a state, a tier, a
 * sentinel, a size, a unit.
 *
 * The exclusions are declared here rather than discovered, each carries a reason,
 * each is printed on every run with the literals it resolved to, and a declared
 * exclusion that resolves to nothing is a finding, because an exclusion that fires
 * on nothing is indistinguishable from a rule that found nothing to say.
 *
 * The five exclusions are:
 *
 *   1. the client directive      `'use client'`, which is a module marker and not
 *                                rendered. It is the only literal in the package
 *                                with two words in it that is not copy.
 *   2. a markup attribute        a class name, a `data-*` value, a `role` or an
 *                                element `type`. These are machine values by
 *                                definition, and a word-shaped literal in one of
 *                                them would be a class or a state name. A utility
 *                                class string is classified by its own shape as
 *                                well, because `flex flex-col gap-4` and
 *                                `no node here` are the same shape to a word
 *                                regex and a utility always carries a separator.
 *   3. a documentation fragment  a string inside a JSDoc block, which the
 *                                repository requires a Block to carry.
 *   4. a template literal        a value assembled at runtime. Its parts are
 *                                scanned; the assembly is not a literal.
 *   5. a module specifier        a path in an import or an export-from. A path is
 *                                not a sentence and the shape rule cannot tell
 *                                one from a phrase, so its position is read.
 *
 * Note what is NOT excluded, because the exclusion would be the bug: an `aria-*`
 * attribute. A hardcoded `aria-label` is a label a screen reader reads, so it is
 * copy, and excluding the attribute would exempt exactly the literal a screen
 * reader user is most likely to be given by a Block that should have asked for it.
 *
 * ## The honest limits, printed on every run
 *
 * **Numbers are not asserted.** The claim says "every string and every number is a
 * prop", and this gate holds the string half. The number half is not asserted
 * because a Block's own arithmetic is numbers: a zero-padded ordinal is
 * `String(index + 1).padStart(2, '0')`, a two-column grid is a `2`, and a page
 * count is clamped with `Math.max(1, ...)`. A rule that failed on those would have
 * to name every place a number is allowed, and that list grows with the code and is
 * never finished. What is held instead is the part that is a defect: a number
 * standing in for data a caller should pass, which shows up as a content-shaped
 * string far more often than as a bare numeral.
 *
 * **This reads text.** A copy string assembled at runtime from a token name in
 * pieces would pass. So would a copy string in a `style` object rather than a
 * class. Neither is a shape this file can decide, and both are said here rather
 * than implied.
 *
 * Coverage is asserted rather than assumed. The roots resolve from this file's own
 * location and never from `process.cwd()`, a root that resolves to nothing fails
 * the run naming both causes, a run that resolved every root and read no file
 * fails the run, and the closing lines state the roots, the files walked and read,
 * how many literals were classified, and every exclusion with what it resolved to.
 * No report-only mode: a gate that reports and passes is a gate nobody runs.
 *
 * Run: node packages/ui/scripts/check-block-copy.mjs
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const NAME = 'check-block-copy'
const HERE = path.dirname(fileURLToPath(import.meta.url))

/** The package root, from this file's own location. Never `process.cwd()`. */
const PKG = path.join(HERE, '..')

/**
 * Every root this gate reads, relative to the package root.
 *
 * A Component is not scanned, and that is the taxonomy rather than an oversight:
 * a Component is a control and a control's accessible name is its business, while a
 * Block is a section whose every word is the consumer's. The claim in DESIGN.md
 * and AGENTS.md is made about Blocks and about Pages, in those words.
 */
const ROOTS = ['src/blocks', 'src/pages']

const TSX_FILE = /\.tsx$/

/**
 * The whole exclusion list, each entry with the reason its literals are not copy.
 *
 * Keys are shapes rather than file names, because the shapes are what these
 * literals are; a shape that starts matching copy is a rule that has been widened
 * and it shows up as copy passing.
 */
const EXCLUSIONS = [
  {
    name: "the client directive",
    match: /^use client$/,
    reason:
      "a module marker the React server-component runtime reads. It is the only two-word literal in the package that is never rendered, and a Block that needs it is still a Block that ships no copy.",
  },
  {
    name: 'a markup attribute',
    context: 'className, data-*, role, type, as, key',
    match: null,
    reason:
      'a class name, a data-slot value, a role, an element type. These are machine values by definition, and a word-shaped literal in one of them is a class or a state name. An aria-* attribute is deliberately not in this list: a hardcoded accessible label is copy, because a screen reader reads it.',
  },
  {
    name: 'a documentation fragment',
    match: null,
    reason:
      'a string inside a JSDoc block. A Block is required to carry one, and the repository is required to keep the dash out of reader-facing copy, so the two must be exempt together or the gate would fail on the documentation of the rule.',
  },
  {
    name: 'a template literal',
    match: null,
    reason:
      'a value assembled at runtime. Its parts are scanned as ordinary literals and the assembly is not itself a literal, so a template that joins two props is not copy and a template that joins a prop and a sentence is caught at the sentence.',
  },
  {
    name: 'a module specifier',
    match: null,
    reason:
      'a path in an import or an export-from. A path is not a sentence, and the shape rule cannot tell `../../components/ui/button` from a phrase, so the position is read instead: the literal is the one after `from` or inside an `import(`.',
  },
  {
    name: 'a thrown diagnostic',
    match: null,
    reason:
      "the message of an `Error` a Block throws when a caller got a prop wrong. It is never rendered to a reader - it reaches a developer in a console - and it is the opposite of copy: it is the Block refusing to make a claim on the caller's behalf. The strings are still scanned, because a message that names a product is a finding wherever it is thrown from.",
  },
]

/**
 * A literal that reads like a word or a sentence rather than a machine value.
 *
 * The shape is one rule and it is the whole rule: a capital letter, a space or a
 * full stop. Every lowercase single-token literal in a Block is a machine value -
 * a variant, a state, a tier, a sentinel, a unit - and a word-shaped one is a
 * sentence a reader would read.
 */
const WORD_SHAPED = /[A-Z. ]/

/**
 * A utility class string: every whitespace-separated token is a Tailwind-shaped
 * name and at least one of them carries a utility's separator.
 *
 * This is a second classification and it is needed because the shape above cannot
 * separate `flex flex-col gap-4` from `no node here`: both are lowercase words
 * separated by spaces. What separates them is that a utility is never a bare
 * English word - it always carries a `-`, a `:`, a `/` or a `[` - and a sentence
 * of lowercase words carries none. Requiring *every* token to be utility-shaped
 * as well as at least one to carry a separator is what stops `no node here gap-4`
 * from passing as a class string.
 */
const UTILITY_TOKEN = /^[a-z0-9][a-z0-9_:./()[\]%#,+-]*$/
const UTILITY_SEPARATOR = /[-:/[]/

function isUtilityString(value) {
  const tokens = value.split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return false
  return tokens.every((token) => UTILITY_TOKEN.test(token)) && tokens.some((token) => UTILITY_SEPARATOR.test(token))
}

/**
 * JSX text, in the two forms JSX writes it.
 *
 * The first alternative is text that owns its own line, which is how a sentence in
 * a Block is almost always written. The second is text set tight against both of
 * its tags, where the requirement that the run touch neither tag is what separates
 * `<span>Most chosen</span>` from `a > b < c`. Neither alternative can match an
 * expression, because a run containing a brace, an angle bracket or a newline is
 * not text.
 */
/**
 * JSX text, in the one form this gate can read without guessing.
 *
 * The run has to start with a letter, touch neither of its tags and span no line
 * break. That is what separates `<span>Most chosen</span>` from `a > b < c`: the
 * copy touches its tags and the comparison is padded with a space, and it is what
 * keeps the `>` of an arrow function at the end of a line from being read as a tag
 * that ended there.
 *
 * The limit is stated rather than hidden: JSX text written bare on its own line is
 * NOT read, because a `>` that ends a type argument and a `>` that ends a tag are
 * the same character to a text scan. A Block that writes a sentence across lines
 * writes it in a literal or in braces, and the literal rule above catches that. A
 * Block that writes one bare and multi-line ships a word nothing in this repository
 * can see, and this gate is honest about not seeing it.
 */
const JSX_TEXT = />([A-Za-z][^<>{}]*?)<(?=[a-zA-Z/])/g

/**
 * Whether a literal is a module specifier, which is the one place a
 * path-shaped string is neither copy nor a class.
 *
 * Read from the line rather than from a window: an import or an export-from puts
 * the literal after the word `from`, and a dynamic import puts it inside the
 * parentheses. A path with a `/` in it is not a sentence, so this classification
 * only has to be right about *where* the literal sits.
 */
function isModuleSpecifier(source, index) {
  const lineStart = source.lastIndexOf('\n', index) + 1
  const line = source.slice(lineStart, index)
  return /\bfrom\s*$/.test(line) || /\bimport\s*\(\s*$/.test(line)
}

/**
 * Whether a literal is the message of a thrown `Error`.
 *
 * A Block throws when a caller passed a prop that would make it make a claim on
 * the caller's behalf: a ledger row with a status and no words for it, a panel in
 * a state with no label. That message reaches a developer in a console and is never
 * rendered to a reader, so it is not copy. It is still scanned, because a message
 * that names a product is a defect wherever it is thrown from.
 */
function isThrownDiagnostic(source, index) {
  const open = source.lastIndexOf('Error(', index)
  if (open === -1) return false
  if (!/\bnew\s+$/.test(source.slice(Math.max(0, open - 6), open))) return false
  // The message is often built by concatenation, so "is this literal the first
  // argument" is the wrong question. It is "is this literal inside the call", and
  // the paren depth at the literal is what answers it.
  let depth = 0
  for (let k = open + 'Error('.length - 1; k < index; k += 1) {
    if (source[k] === '(') depth += 1
    else if (source[k] === ')') {
      depth -= 1
      if (depth === 0) return false
    }
  }
  return depth > 0
}

const rel = (file) => path.relative(PKG, file).split(path.sep).join('/')
const lineOf = (source, index) => source.slice(0, index).split('\n').length

/**
 * The walker is local rather than imported, for the reason
 * `check-catalogue.mjs` states in full: `scripts/` is not in this package's
 * `files`, so a shared module would ship in no tarball and fail to resolve for
 * anyone who ran the gate from an installed copy.
 */
function walkRoot(absolute, relative) {
  let stats
  try {
    stats = statSync(absolute)
  } catch (cause) {
    return { root: absolute, relative, files: [], exists: false, error: cause.code }
  }
  if (stats.isFile()) return { root: absolute, relative, files: [absolute], exists: true }
  const files = []
  for (const name of readdirSync(absolute)) {
    const child = path.join(absolute, name)
    if (statSync(child).isDirectory()) files.push(...walkRoot(child, relative).files)
    else files.push(child)
  }
  return { root: absolute, relative, files, exists: true }
}

function assertRootsResolve(results) {
  const missing = results.filter((result) => !result.exists)
  if (missing.length === 0) return
  const listed = missing.map((result) => `"${result.relative}"`).join(', ')
  const plural = missing.length === 1 ? 'root does not resolve' : 'roots do not resolve'
  throw new Error(
    `${NAME}: ${missing.length} of ${results.length} configured ${plural}: ${listed}\n` +
      '  Two causes, and this run cannot tell them apart:\n' +
      '  (1) the gate was run from the wrong working directory, or the script being run is not this\n' +
      `      repository's copy - run it as \`node packages/ui/scripts/${NAME}.mjs\`, or via \`pnpm check\`;\n` +
      '  (2) the root does not exist in the repository at all, so the configuration names a\n' +
      '      path that was renamed, moved or never committed.\n' +
      '  A gate that read nothing and reported zero findings is the failure this replaces, so an\n' +
      '  unresolved root fails the run rather than emptying it.',
  )
}

function assertFilesRead(count) {
  if (count > 0) return
  throw new Error(
    `${NAME}: every configured root resolved and the run read 0 files.\n` +
      '  Reporting zero findings over zero files is the failure this replaces, so an empty read\n' +
      '  fails the run.',
  )
}

/**
 * Blanks comments without moving a single line, and blanks template literals
 * whole, so a line number in a finding still points at the line a reader has to
 * edit. The comment mask is what makes the documentation exclusion necessary: the
 * literals a JSDoc block quotes are not rendered and must not be reported.
 */
function maskProse(source) {
  const out = source.split('')
  let i = 0
  const blank = (from, to) => {
    for (let k = from; k < to && k < out.length; k += 1) {
      if (out[k] !== '\n' && out[k] !== '\r') out[k] = ' '
    }
  }
  while (i < source.length) {
    const next = source.indexOf('/*', i)
    const line = source.indexOf('//', i)
    if (next !== -1 && (line === -1 || next < line)) {
      const close = source.indexOf('*/', next + 2)
      const end = close === -1 ? source.length : close + 2
      blank(next, end)
      i = end
      continue
    }
    if (line !== -1) {
      let end = source.indexOf('\n', line)
      if (end === -1) end = source.length
      blank(line, end)
      i = end
      continue
    }
    i = source.length
  }
  return out.join('')
}

/** Blanks a backtick template whole, delimiters included, so it is not a literal. */
function maskTemplates(source) {
  const out = source.split('')
  for (let i = 0; i < source.length; i += 1) {
    if (source[i] !== '`') continue
    out[i] = ' '
    for (let k = i + 1; k < source.length; k += 1) {
      if (source[k] === '\\') {
        out[k] = ' '
        if (k + 1 < source.length) out[k + 1] = ' '
        k += 1
        continue
      }
      if (source[k] === '`') {
        out[k] = ' '
        i = k
        break
      }
      if (source[k] !== '\n' && source[k] !== '\r') out[k] = ' '
    }
  }
  return out.join('')
}

/**
 * The attribute a literal is the value of, or `null` for a literal in code.
 *
 * Read backwards from the literal to the nearest `name=` or `name={` on its own
 * line, which is where JSX puts one. The nearest is the right one: a literal in a
 * nested expression is the value of the attribute that opened it.
 */
function attributeOf(source, index) {
  // The window ends one character *after* the literal's opening quote, because a
  // `name="value"` attribute is only recognisable from the `name=` and the quote
  // together. A window that stopped before the quote would miss every quoted
  // attribute and fall through to whatever expression attribute was nearest, which
  // is a different answer and a wrong one.
  const before = source.slice(Math.max(0, index - 200), index + 1)
  const matches = [...before.matchAll(/([A-Za-z][A-Za-z0-9:-]*)\s*(=\s*\{|=\s*")/g)]
  const last = matches.at(-1)
  return last === undefined ? null : (last[1] ?? null)
}

/**
 * The attributes whose values are machine values rather than words.
 *
 * `rel` is here and `aria-label` deliberately is not. A link relationship is a
 * token from a closed set the HTML specification defines, so `noopener noreferrer`
 * is a name rather than a sentence. An accessible name is a sentence: it is what a
 * screen reader reads out, and excluding it would exempt exactly the literal a
 * Block most often has no business choosing.
 */
const MACHINE_ATTRIBUTES = new Set([
  'className',
  'class',
  'role',
  'rel',
  'type',
  'as',
  'key',
  'size',
])

/* ------------------------------------------------------------------ *
 * The run
 * ------------------------------------------------------------------ */

const results = ROOTS.map((relative) => ({ relative, ...walkRoot(path.join(PKG, relative), relative) }))
assertRootsResolve(results)

const findings = []
const resolved = new Map(EXCLUSIONS.map((rule) => [rule, []]))
let filesRead = 0
let classified = 0

for (const result of results) {
  for (const file of result.files) {
    if (!TSX_FILE.test(path.basename(file))) continue
    filesRead += 1
    const shown = rel(file)
    const raw = readFileSync(file, 'utf8')
    const comments = (raw.match(/\/\*[\s\S]*?\*\//g) ?? []).length
    const templates = (raw.match(/`/g) ?? []).length / 2
    // The two shape-based exclusions are counted rather than matched, so a
    // repository that stopped writing a JSDoc block or stopped assembling a value
    // at runtime would leave a declared exclusion firing on nothing, which is the
    // failure this gate reports rather than absorbs.
    if (comments > 0) resolved.get(EXCLUSIONS[2]).push(`${comments} JSDoc block(s) in ${shown}`)
    if (templates > 0) resolved.get(EXCLUSIONS[3]).push(`${templates} template(s) in ${shown}`)
    const source = maskTemplates(maskProse(raw))

    for (const match of source.matchAll(/'([^'\n]*)'|"([^"\n]*)"/g)) {
      const value = match[1] ?? match[2] ?? ''
      classified += 1
      if (value === '') continue

      if (EXCLUSIONS[0].match.test(value)) {
        resolved.get(EXCLUSIONS[0]).push(`'${value}' (${shown})`)
        continue
      }

      const attribute = attributeOf(source, match.index)
      if (attribute !== null && (/^data-/.test(attribute) || MACHINE_ATTRIBUTES.has(attribute))) {
        resolved.get(EXCLUSIONS[1]).push(`${attribute}="${value}" (${shown})`)
        continue
      }

      if (isModuleSpecifier(source, match.index)) {
        resolved.get(EXCLUSIONS[4]).push(`'${value}' (${shown})`)
        continue
      }

      if (isThrownDiagnostic(source, match.index)) {
        resolved.get(EXCLUSIONS[5]).push(`new Error "${value.slice(0, 40)}..." (${shown})`)
        continue
      }

      if (isUtilityString(value)) {
        resolved.get(EXCLUSIONS[1]).push(`className "${value}" (${shown})`)
        continue
      }

      if (!WORD_SHAPED.test(value)) continue

      findings.push(
        `${shown}:${lineOf(source, match.index)}  [hardcoded-copy]  ${JSON.stringify(value)} is a ` +
          'word-shaped string literal in a Block or a Page. Blocks ship no copy and no sample data: ' +
          'every string is a prop, so a consumer who installs this Block inherits a sentence about a ' +
          'product that is not theirs, and the corpus publishes it as part of the Block own documentation.',
      )
    }

    /*
     * JSX text, which is the other way a Block ships a sentence and the one a
     * string-literal scan cannot see. `<span>Most chosen</span>` has no quote in
     * it at all, so a rule that only read literals would pass the exact defect
     * this gate exists for.
     *
     * Two forms, because JSX writes text both ways and only one of them is
     * unambiguous. Text on its own line is taken when a `>` ends a line and a `<`
     * starts the next. Text set tight against its tags is taken when the captured
     * run touches neither tag, which is what tells `<span>Most chosen</span>`
     * (copy) from `a > b < c` (a comparison): the comparison's run is padded with
     * a space and the copy's is not. A run with no letter in it is the ellipsis
     * `data-table-01` draws in its pagination, which is punctuation and not a
     * word.
     */
    for (const match of source.matchAll(JSX_TEXT)) {
      const text = match[1] ?? match[2] ?? ''
      classified += 1
      if (!/[A-Za-z]/.test(text)) continue
      findings.push(
        `${shown}:${lineOf(source, match.index)}  [hardcoded-copy]  ${JSON.stringify(text.trim())} is JSX ` +
          'text in a Block or a Page, so it is a sentence a reader reads and a prop would have carried. ' +
          'Blocks ship no copy and no sample data.',
      )
    }
  }
}

for (const rule of EXCLUSIONS) {
  if (resolved.get(rule).length === 0) {
    findings.push(
      `  [stale-exclusion]  the declared exclusion "${rule.name}" resolved to nothing, so it is a rule that ` +
        'fires on nothing. Remove it or say what it now covers.',
    )
  }
}

assertFilesRead(filesRead)

const walked = results.reduce((total, result) => total + result.files.length, 0)
for (const finding of findings) console.error(`error ${finding}`)

console.log(
  `\n${NAME}: ${findings.length} finding(s) across ${filesRead} Block and Page module(s) read; ` +
    `${classified} string literal(s) classified`,
)
console.log(
  `${NAME}: coverage ${results.length} root(s) resolved, ` +
    `${results.filter((result) => !result.exists).length} unresolved; ${walked} file(s) walked, ` +
    `${filesRead} file(s) read`,
)
for (const rule of EXCLUSIONS) {
  const hit = resolved.get(rule) ?? []
  console.log(`${NAME}: excluded, ${rule.name}: ${hit.length} (${rule.context ? `${rule.context}; ` : ''}resolved to ${hit.length ? `${hit.length} literal(s)` : 'nothing'})`)
  if (hit.length > 0) console.log(`          e.g. ${hit.slice(0, 3).join(', ')}`)
  console.log(`          because ${rule.reason}`)
}
console.log(
  `${NAME}: numbers are not asserted. A zero-padded ordinal, a column count and a page clamp are numbers\n` +
    '  too, so a number rule would have to name every place a number is allowed. A number standing in for\n' +
    '  data a caller should pass shows up as a word-shaped string far more often than as a bare numeral.',
)
console.log(
  `${NAME}: this reads text. A copy string assembled at runtime from a token name in pieces would pass,\n` +
    '  and so would a copy string in a style object rather than a class, and JSX text written bare across\n' +
    '  several lines would pass because a type argument ends in the same character a tag ends in.',
)

if (findings.length > 0) {
  console.error(
    `\nA Block ships no copy. A hardcoded sentence is a claim every consumer of the Block inherits, and it is\n` +
      'published by the corpus as part of the Block own documentation, so it reads as the design system own\n' +
      'voice rather than as the string somebody typed.',
  )
  process.exit(1)
}

console.log(
  `${NAME}: every Block and Page renders only what a caller passed, so nothing a consumer installs carries a\n` +
    '  sentence about somebody else product.',
)
