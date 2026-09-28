/**
 * A Category is a closed set of seven, and a Block or a Page has none.
 *
 * The claim this holds. CONTEXT.md defines the word: a Category is "one of the
 * seven role groups a Component is assigned to: Call to action, Forms and inputs,
 * Feedback, Layout, Data display, Typography and Miscellaneous", and it adds the
 * sentence "A Block or a Page has no category." DESIGN.md's Categories section
 * says the same and says the set is closed: "The set is closed. Assignment is by
 * the item's primary role, never by data type, file path or visual form. An eighth
 * category is added only when at least three components share a role no existing
 * category names, and a category that falls below two components is merged back.
 * Miscellaneous is the single fallback and is not a role. Blocks and Pages are
 * grouped by kind and have no category."
 *
 * Two failures hide in that, and they hide differently.
 *
 * The first is a Block or a Page with a category. It is invisible in review: the
 * site files a Block under a Category folder, the sidebar shows a group heading
 * above Blocks that have no role, and DESIGN.md's note that "an uneven tree here is
 * the taxonomy showing through" is exactly the kind of thing a well-meant tidy-up
 * destroys. The site's own `groupOf()` throws on it, so the failure is caught -
 * but only on the site, and only once the tree is built, and a package consumer
 * who reads `catalog.ts` sees a Block with a role group and believes it.
 *
 * The second is a Component with a category the closed set does not name. The
 * site's `categoryOf()` throws on that too, for the same reason and the same
 * delay. The rule "an eighth category is added only when at least three components
 * share a role no existing category names" is a decision to take in the open, and
 * a decision taken by typing an eighth string into a list is not a decision
 * anybody can see in a diff of the roster. It is visible here: the gate reads the
 * list out of `src/catalog.ts`, so a new string is a new line in this file's
 * findings, in a file whose header is the rule.
 *
 * What this gate does NOT assert, and why. It does not assert that a category
 * falls below two components, and it does not assert that every role name in the
 * source appears in the catalogue. Both are judgements about the roster rather
 * than facts about the tree, DESIGN.md states them as decisions to take rather
 * than invariants to check, and a gate that failed on them would be deleted the
 * first time somebody disagreed with a judgement it encoded.
 *
 * `src/catalog.ts` is TypeScript and this is a plain Node script, so the list is
 * read by a scan. A regex is defensible here, and unlike elsewhere in this
 * repository, because the declaration is a literal array of object literals whose
 * fields are string literals and `null`: there is no computed member, no spread
 * and no reference to another binding anywhere inside it. The reader throws on a
 * shape it did not expect rather than returning the members it recognised, because
 * "the roster is empty" and "the roster could not be read" are different answers
 * and only one of them is a green run.
 *
 * Coverage is asserted rather than assumed. The roots resolve from this file's own
 * location and never from `process.cwd()`, a root that resolves to nothing fails
 * the run naming both causes, a run that resolved every root and read no file
 * fails the run, and the closing lines state the roots, the files walked and read,
 * the entries classified, and the whole closed set with the count each member
 * holds. No report-only mode: a gate that reports and passes is a gate nobody runs.
 *
 * Run: node packages/ui/scripts/check-item-category.mjs
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const NAME = 'check-item-category'
const HERE = path.dirname(fileURLToPath(import.meta.url))

/** The package root, from this file's own location. Never `process.cwd()`. */
const PKG = path.join(HERE, '..')

/** Every root this gate reads, relative to the package root. */
const ROOTS = ['src/catalog.ts', 'src/components/ui', 'src/blocks', 'src/pages']

/**
 * The closed set, spelled here rather than imported.
 *
 * Spelled rather than imported because importing it would make this gate a
 * restatement of the file it checks: a ninth category added to `catalog.ts` would
 * be in the set this gate compares against, and the gate would pass on the change
 * it exists to make visible. The duplication is the assertion. A gate that reads
 * its expectations from the thing under test is a tautology, and this is the one
 * place in the package where a tautology would be invisible: the site's build
 * would still catch the mismatch, just later and in a different package.
 */
const CATEGORIES = [
  'Call to action',
  'Forms and inputs',
  'Feedback',
  'Layout',
  'Data display',
  'Typography',
  'Miscellaneous',
]

/** The kinds a Block and a Page are, and which therefore carry no category. */
const UNCATEGORISED_KINDS = new Set(['block', 'page'])

const COMPONENT_FILE = /\.tsx$/
const TEST_FILE = /\.test\.tsx$/

const rel = (file) => path.relative(PKG, file).split(path.sep).join('/')
const lineOf = (source, index) => source.slice(0, index).split('\n').length

/**
 * The exclusions, declared rather than discovered: the one place a file under a
 * scanned root is not read, and the reason. Each is printed on every run with the
 * files it resolved to, and an exclusion that resolves to nothing is a finding.
 */
const EXCLUSIONS = [
  {
    name: 'a co-located test',
    match: TEST_FILE,
    reason:
      'a test file beside a Component, not a Component. `check-catalogue.mjs` applies the same rule, so both read the same set.',
  },
]

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
    if (statSync(child).isDirectory()) files.push(...walkRoot(child, `${relative}/${name}`).files)
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

/* ------------------------------------------------------------------ *
 * Reading the roster
 * ------------------------------------------------------------------ */

/** The index of the `}` that closes the `{` at `start`, comments and strings skipped. */
function closingBrace(text, start) {
  let depth = 0
  let quote = null
  for (let i = start; i < text.length; i += 1) {
    const ch = text[i]
    if (quote !== null) {
      if (ch === quote && text[i - 1] !== '\\') quote = null
      continue
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      quote = ch
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

/**
 * One member's value as text, or `null` for the literal `null`.
 *
 * A member this reader does not recognise is a finding rather than a skipped
 * member, because a shorter list passing as a smaller roster is the failure this
 * whole gate was written against.
 */
function memberValue(body, key) {
  const pattern = new RegExp(`(?:^|[\\s{,])${key}\\s*:\\s*`, 'g')
  const match = pattern.exec(body)
  if (match === null) {
    throw new Error(`an entry has no "${key}", so the roster this gate reads is not the roster that was authored`)
  }
  const from = match.index + match[0].length
  if (body.startsWith('null', from)) return { value: null, at: from }
  const quote = body[from]
  if (quote !== "'" && quote !== '"') {
    throw new Error(
      `an entry declares "${key}" as a ${quote ?? 'nothing'}, which is not a string literal or null, so the ` +
        'entry is not one this gate can compare',
    )
  }
  const end = body.indexOf(quote, from + 1)
  if (end === -1) throw new Error(`an entry declares "${key}" as an unterminated string`)
  return { value: body.slice(from + 1, end), at: from }
}

/** The `catalog` array, read as the four members this gate compares. */
function readCatalogue(text, display) {
  const declaration = /export\s+const\s+catalog\b[^=]*=\s*\[/.exec(text)
  if (declaration === null) {
    throw new Error(
      `${display}: declares no \`export const catalog\` array literal, so the roster could not be read at all. A ` +
        'reader that finds nothing fails here rather than reporting an empty roster.',
    )
  }
  const from = declaration.index + declaration[0].length
  const entries = []
  let i = from
  while (i < text.length) {
    const ch = text[i]
    if (/\s/.test(ch) || ch === ',') {
      i += 1
      continue
    }
    if (ch === ']') break
    if (ch !== '{') {
      throw new Error(
        `${display}: the catalog array holds a ${JSON.stringify(ch)} where an object literal was expected`,
      )
    }
    const end = closingBrace(text, i)
    if (end === -1) throw new Error(`${display}: an unterminated object literal in the catalog array`)
    const body = text.slice(i + 1, end)
    const name = memberValue(body, 'name').value
    const kind = memberValue(body, 'kind').value
    const category = memberValue(body, 'category').value
    if (name === null || kind === null) {
      throw new Error(`${display}: the entry "${String(name)}" has a null name or kind, which is not a roster entry`)
    }
    entries.push({ name, kind, category, at: i })
    i = end + 1
  }
  if (entries.length === 0) {
    throw new Error(
      `${display}: the \`catalog\` array is empty, so there is no roster to hold to the closed set of ` +
        'Categories. An empty roster fails because a roster that cannot be read and a roster with nothing in ' +
        'it are not the same fact.',
    )
  }
  return entries
}

/* ------------------------------------------------------------------ *
 * The run
 * ------------------------------------------------------------------ */

/** The one root that is a file rather than a directory, named and checked. */
function resolveCatalogueFile(all) {
  const found = all.find((result) => result.relative === 'src/catalog.ts')
  if (found === undefined || !found.exists) {
    throw new Error(`${NAME}: src/catalog.ts did not resolve, so the roster could not be read`)
  }
  return path.join(PKG, 'src', 'catalog.ts')
}

const results = ROOTS.map((relative) => ({
  relative,
  ...walkRoot(path.join(PKG, relative), relative),
}))
assertRootsResolve(results)

const findings = []
const resolved = new Map(EXCLUSIONS.map((rule) => [rule, []]))
const counts = new Map(CATEGORIES.map((name) => [name, 0]))
const catalogueFile = resolveCatalogueFile(results)
const catalogueText = readFileSync(catalogueFile, 'utf8')
let filesRead = 1
const entries = readCatalogue(catalogueText, 'src/catalog.ts')

for (const entry of entries) {
  const line = lineOf(catalogueText, entry.at)
  if (entry.kind === 'component') {
    if (entry.category === null) {
      findings.push(
        `src/catalog.ts:${line}  [uncategorised-component]  "${entry.name}" is a Component with no Category, so ` +
          'it has no folder to nest under and would be filed in no group at all. Every Component belongs to one ' +
          `of the seven: ${CATEGORIES.join(', ')}.`,
      )
      continue
    }
    if (!CATEGORIES.includes(entry.category)) {
      findings.push(
        `src/catalog.ts:${line}  [unknown-category]  "${entry.name}" is filed under the Category ` +
          `"${entry.category}", which is not one of the seven. The set is closed, and an eighth is a decision to ` +
          `take in the open: the seven are ${CATEGORIES.join(', ')}.`,
      )
      continue
    }
    counts.set(entry.category, (counts.get(entry.category) ?? 0) + 1)
    continue
  }
  if (UNCATEGORISED_KINDS.has(entry.kind) && entry.category !== null) {
    findings.push(
      `src/catalog.ts:${line}  [categorised-${entry.kind}]  "${entry.name}" is a ${entry.kind} filed under the ` +
        `Category "${entry.category}". A Block and a Page have no Category, and the taxonomy says so in two ` +
        'places; a group heading above them in the sidebar is a role they do not have.',
    )
  }
}

/*
 * Every module under the three source roots is read, so a run that resolved the
 * roots and read nothing else is a failure rather than a pass. Nothing in the tree
 * is judged here - the kind comes from the catalogue and the agreement between the
 * two is `check-catalogue.mjs` - but the files are opened, because "I read the
 * catalogue" and "I read the tree" are different claims.
 */
for (const result of results) {
  if (result.relative === 'src/catalog.ts') continue
  for (const file of result.files) {
    const name = path.basename(file)
    const exclusion = EXCLUSIONS.find((rule) => rule.match.test(name))
    if (exclusion !== undefined) {
      resolved.get(exclusion).push(rel(file))
      continue
    }
    if (!COMPONENT_FILE.test(name)) continue
    filesRead += 1
  }
}

assertFilesRead(filesRead)

for (const rule of EXCLUSIONS) {
  if (resolved.get(rule).length === 0) {
    findings.push(
      `  [stale-exclusion]  the declared exclusion "${rule.name}" resolved to no file, so it is a rule that ` +
        'fires on nothing. Remove it or say what it now covers.',
    )
  }
}

const walked = results.reduce((total, result) => total + result.files.length, 0)
for (const finding of findings) console.error(`error ${finding}`)

console.log(
  `\n${NAME}: ${findings.length} finding(s) across ${entries.length} catalogue entr(ies) and ` +
    `${filesRead} file(s) read`,
)
console.log(
  `${NAME}: coverage ${results.length} root(s) resolved, ` +
    `${results.filter((result) => !result.exists).length} unresolved; ${walked} file(s) walked, ` +
    `${filesRead} file(s) read`,
)
console.log(`${NAME}: the closed set of Categories, and what each holds today:`)
for (const name of CATEGORIES) {
  console.log(`${NAME}:   ${name}: ${counts.get(name) ?? 0} Component(s)`)
}
for (const rule of EXCLUSIONS) {
  const hit = resolved.get(rule)
  console.log(`${NAME}: excluded, ${rule.name}: ${hit.length} file(s)`)
  console.log(`          because ${rule.reason}`)
}
console.log(
  `${NAME}: a category that falls below two Components is merged back, and that is a decision about the\n` +
    '  roster rather than a fact about the tree, so it is stated above as a count and not asserted here.',
)

if (findings.length > 0) {
  console.error(
    `\nThe set of Categories is closed and a Block or a Page has none. A category outside the seven is a\n` +
      'decision about the taxonomy taken by typing a string into a list, and a category on a Block is a role\n' +
      'the Block does not have showing up as a group heading in every sidebar that renders the tree.',
  )
  process.exit(1)
}

console.log(
  `${NAME}: every Component is filed under one of the seven closed Categories and every Block and Page under\n` +
    '  none, so the documentation tree is the taxonomy and not a tidy-up of it.',
)
