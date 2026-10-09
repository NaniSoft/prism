/**
 * The specification module's closed unions, held against the roster, and the
 * specification types, held against what a consumer may not put in one.
 *
 * ## Why this gate exists, and why it is not the catalogue seam
 *
 * `FieldSpec`, `ColumnSpec`, `RelationSpec`, `MetricSpec` and `EventSpec` are typed
 * declarations rather than Items. A type has no slug, no kind, no documentation
 * page, no Demo and no corpus entry, so `check-catalogue.mjs` does not read the
 * module at all: its roots are `src/components/ui`, `src/blocks`, `src/pages`,
 * `src/live`, `src/catalog.ts`, `registry.json` and `package.json`, and not one of
 * them reaches `src/lib`. A union member naming a control this package does not ship
 * would therefore pass every gate in this repository, be published through
 * `@nanisoft/prism-ui/spec`, and reach a consumer who has no way to draw it.
 *
 * So the seam is one step lower, and it is the step a consumer reads: the emitted
 * declaration. `dist/lib/spec.d.ts` is what the declaration build wrote, preserved
 * with its JSDoc, and it is the file a consumer's editor and a corpus both resolve.
 * Reading the source instead would answer a different question, because a source
 * reader sees the author's spelling of a union rather than the one that shipped.
 *
 * ## The claim
 *
 * A closed union is legitimate only when its members are things this package already
 * ships. That is the whole argument for `FieldKind`, `ColumnKind` and `RelationKind`
 * being closed, and it is a claim about a list, so it needs a gate the way the closed
 * set of seven Categories needs one.
 *
 *   1. `unknown-member`     a union member naming something the roster does not
 *                           hold, whether because nothing by that name ships or
 *                           because the Component ships under another name. Both are
 *                           the same defect at this seam: a caller can pass it and
 *                           nothing draws it.
 *   2. `overlapping-union`  a member two of the three unions both claim. A field is
 *                           an input and a column is a cell, so a member in both lets
 *                           a caller ask for a money field as a table cell and
 *                           receive a control inside a table.
 *   3. `duplicate-member`   a member one union claims twice, which is a vocabulary
 *                           with two answers to one question.
 *   4. `forbidden-member`   a member carrying a validator, a rule, a schema or a
 *                           pattern. Validation is the consumer's, entirely, and the
 *                           point of the type is that it cannot hold one: a validator
 *                           function is also what would make the specification
 *                           unserialisable, take it out of the corpus, and make every
 *                           Block carrying one a client Component for a feature it
 *                           was never going to own.
 *   5. `asserted-claim`     a member asserting immutability, retention, or a time
 *                           axis. All three were refused by name: a Block has no
 *                           authority over the store behind it, so a seal, a window
 *                           and a scale are three claims Prism cannot keep, and a
 *                           trail draws a moment and never a length.
 *
 * Two further rules are specific to one type each, because each is a decision about
 * that type rather than a law about the module:
 *
 *   6. `event-vocabulary`   `EventSpec` carrying a `kind`. No enumeration of what a
 *                           consumer's product calls a thing that happened is this
 *                           package's to publish, and a member here would promise
 *                           that every consumer's world is this one. The word goes in
 *                           `action`.
 *   7. `relation-depth`     a direct member of `RelationSpec` whose own type names
 *                           `RelationSpec`. The bound is one ring and it belongs in
 *                           the type rather than in a convention somebody is asked to
 *                           remember.
 *
 * ## The one exemption, and it is printed
 *
 * `slot` is the arm each of the three unions carries for the caller's own control,
 * cell or arrangement. It names no Component by construction, and it is the escape
 * the findings point at, so it is exempt by name and the exemption prints on every
 * run with the count each union carries. It is one word rather than a rule, because a
 * wider exemption would be a second vocabulary.
 *
 * ## What this gate does NOT read, and why that is a scope decision
 *
 *   - `src/lib/spec.ts`, the source. The emitted declaration is the seam, and a gate
 *     reading both would be two gates that could disagree about which one shipped.
 *   - The rest of `dist/`. Only the specification module's declaration and the
 *     emitted roster are subjects here; `check-surface.mjs` reads the whole emitted
 *     tree for a different claim.
 *   - `src/catalog.ts`. The roster is read out of `dist/catalog.js`, which is the
 *     same list the emitted package ships.
 *   - Any Item document, and therefore every sentence published about a
 *     specification. A type has no Item page, so there is nothing to read.
 *   - **The law that there is one shape per concept.** A second declaration of the
 *     field, column, relation, metric or event shape would be named differently from
 *     the first, so the rule that would catch it is a hand maintained list, and a
 *     hand maintained list is the shape `docs/quality-gates.md` already refuses. That
 *     law is held by the authoring and by review, and it is printed below so a clean
 *     run is not read as more than it is.
 *
 * ## Coverage is asserted, not assumed
 *
 * Roots resolve from this file's own location and never from `process.cwd()`, so the
 * working directory cannot change what is read. A root that resolves to nothing fails
 * the run naming both causes. A run that resolved every root and read no type alias
 * fails. A union or a specification this gate was configured to read and did not find
 * fails, because "the roster is empty" and "the roster could not be read" are
 * different answers and only one of them is a green run. The closing lines state the
 * roots, the files read, the roster by kind, every union with the members it carries,
 * every specification with the members it carries, the exemption, and the rule table.
 *
 * Run: node packages/ui/scripts/check-spec-unions.mjs [--pkg=<dir>]
 */
import { readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const NAME = 'check-spec-unions'
const HERE = path.dirname(fileURLToPath(import.meta.url))

/** The package root under test. `--pkg=` wins; otherwise this file's own parent. */
const PKG = path.resolve(packageArgument(process.argv.slice(2)) ?? path.join(HERE, '..'))

/**
 * Every root this gate reads, relative to the package root, each with what it is for.
 *
 * Two, and the second is a roster rather than a subject. `spec.d.ts` is the emitted
 * declaration of the specification module: the union members, the member names and
 * the member types all come from it, because that is the file a consumer's editor
 * resolves. `catalog.js` is the emitted roster, so the comparison is against the list
 * this package actually ships rather than against a list somebody keeps beside it.
 */
const ROOTS = [
  { relative: 'dist/lib/spec.d.ts', what: 'the emitted declaration of the specification module' },
  { relative: 'dist/catalog.js', what: 'the emitted Component, Block, Page and live roster' },
]

/**
 * The three closed unions, and what a member of each has to be.
 *
 * The population is one package's own declarations, so this gate is a gate of this
 * repository rather than one of the consumer kit: four downstream repositories hold
 * data, not the vocabulary Prism closes.
 */
const UNIONS = [
  {
    name: 'FieldKind',
    layer: 'a write form, a wizard and a settings region',
    member: 'an input Component this package ships',
    reason:
      "a field names a control a reader fills, so every member is either " +
      "an input Component this package ships or the slot arm for the caller's own control",
  },
  {
    name: 'ColumnKind',
    layer: 'a record index',
    member: 'a reading Component this package ships',
    reason:
      'a column names a value a reader reads, so every member is either ' +
      "a reading Component this package ships or the slot arm for the caller's own cell",
  },
  {
    name: 'RelationKind',
    layer: 'a record detail',
    member: 'a collection arrangement this package already draws',
    reason:
      'a relation names a collection of other records, so every member is either a ' +
      "collection arrangement this package already draws or the slot arm for the caller's own",
  },
]

/**
 * The five specifications, named so the run can print what it read.
 *
 * The two rules that are specific to one type, `kind` on an event and the depth of a
 * relation, name their own type. The two that apply to every member are applied to
 * every type alias in the declaration instead, because this module holds nothing but
 * the specifications and a list of type names here would itself be a list somebody
 * maintains.
 */
const SPECIFICATIONS = ['FieldSpec', 'ColumnSpec', 'RelationSpec', 'MetricSpec', 'EventSpec']

/** The one member of each union that names nothing in the roster, and why. */
const SLOT = 'slot'

/**
 * The four things a specification may not carry, by name.
 *
 * Named rather than pattern matched, for the reason `check-block-imports.mjs` gives:
 * a pattern here is a hole with a regular expression in it, and widening the list is a
 * decision to take in the open where a diff shows it. `required` is deliberately not
 * in it, because requiredness is a rendering fact and an HTML fact rather than a rule.
 */
const FORBIDDEN = [
  {
    id: 'forbidden-member',
    name: 'a validator',
    words: ['validate', 'validator', 'validation', 'validateOn', 'onValidate'],
    reason:
      "validation is the consumer's, entirely, and a Block ships no behaviour, so evaluating a rule is " +
      'behaviour. A validator function is also what would make the specification unserialisable, which ' +
      'would take it out of the corpus and out of a store an agent reads.',
  },
  {
    id: 'forbidden-member',
    name: 'a rule',
    words: ['rule', 'rules', 'constraint', 'constraints', 'condition', 'conditions'],
    reason:
      'a rule on a Prism type is a rule this package would then have to evaluate, hold and migrate, and ' +
      "the consumer who wrote the values is the one who knows the rule.",
  },
  {
    id: 'forbidden-member',
    name: 'a schema',
    words: ['schema', 'definition', 'spec', 'specs'],
    reason:
      'a schema is a whole second declaration of the same typed value, which is the failure the module was ' +
      'created to end. A member named for the thing is not a schema of it.',
  },
  {
    id: 'forbidden-member',
    name: 'a pattern',
    words: ['pattern', 'patternName', 'regex', 'regexp', 'mask', 'inputMask'],
    reason:
      'a pattern is a constraint expressed as text, and holding one here would be holding the constraint the ' +
      'rule above refuses by a different spelling.',
  },
]

/**
 * The three claims a specification may not make on a consumer's behalf.
 *
 * `at` is deliberately absent and `duration`, `scale` and `range` are deliberately
 * present: a trail draws the moment it was handed and never a length, so the moment is
 * allowed and everything that would turn the moment into an axis is not.
 */
const CLAIMS = [
  {
    id: 'asserted-claim',
    name: 'immutability',
    words: [
      'immutable',
      'immutability',
      'seal',
      'sealed',
      'signature',
      'signed',
      'verified',
      'verification',
      'tamperEvident',
      'admissible',
      'hash',
    ],
    reason:
      'a Block has no authority over the store behind it, so a lock or a badge drawn from a member here is ' +
      'a claim Prism cannot keep. A consumer whose domain requires immutability enforces it in its own store ' +
      'and shows what the store says.',
  },
  {
    id: 'asserted-claim',
    name: 'retention',
    words: [
      'retention',
      'retained',
      'retain',
      'retentionWindow',
      'window',
      'ttl',
      'expires',
      'expiry',
      'archive',
      'archived',
      'purge',
      'legalHold',
    ],
    reason:
      'a log outlives the screen that shows it, so the window, the archive, the purge and the legal hold are ' +
      'properties of a store rather than of a drawing.',
  },
  {
    id: 'asserted-claim',
    name: 'a time axis',
    words: ['duration', 'elapsed', 'scale', 'range', 'axis', 'start', 'end', 'startAt', 'endAt', 'from', 'to'],
    reason:
      "a vertical arrangement's only spatial claim is order, so a trail draws a moment and never a length. A " +
      "bar's length is a claim about a difference between two moments the caller holds, which is arithmetic " +
      'over a range this package never fetched.',
  },
]

/** The member `EventSpec` may not carry, and the type it is read on. */
const EVENT_VOCABULARY = { type: 'EventSpec', member: 'kind' }

/** The bound on relation depth, read on the direct body of one type. */
const RELATION_DEPTH = { type: 'RelationSpec', forbidden: 'RelationSpec' }

/* ------------------------------------------------------------------ *
 * Reading
 * ------------------------------------------------------------------ */

/** `--pkg=<dir>` names the package root; anything else leaves this file's own parent. */
function packageArgument(argv) {
  const flag = argv.find((argument) => argument.startsWith('--pkg='))
  return flag === undefined ? null : path.resolve(flag.slice('--pkg='.length))
}

const lineOf = (source, index) => source.slice(0, index).split('\n').length

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
      '  (2) the root does not exist, and for a root under dist/ that means the package has not been built.\n' +
      '  A gate that read nothing and reported zero findings is the failure this replaces, so an\n' +
      '  unresolved root fails the run rather than emptying it.',
  )
}

/**
 * Blanks comments in place without moving a line, so a rule about a member name does
 * not fire on a JSDoc block that explains why a member is absent. Every one of these
 * declarations carries several, and they quote the refused words on purpose.
 */
function maskComments(source) {
  const out = source.split('')
  const blank = (from, to) => {
    for (let k = from; k < to && k < out.length; k += 1) {
      if (out[k] !== '\n' && out[k] !== '\r') out[k] = ' '
    }
  }
  let i = 0
  while (i < source.length) {
    const block = source.indexOf('/*', i)
    const line = source.indexOf('//', i)
    if (block !== -1 && (line === -1 || block < line)) {
      const close = source.indexOf('*/', block + 2)
      blank(block + 2, close === -1 ? source.length : close)
      i = close === -1 ? source.length : close + 2
      continue
    }
    if (line !== -1) {
      const end = source.indexOf('\n', line)
      blank(line, end === -1 ? source.length : end)
      i = end === -1 ? source.length : end
      continue
    }
    break
  }
  return out.join('')
}

/** The index of the `;` that ends a declaration, or -1. Depth and strings aware. */
function endOfDeclaration(text, from) {
  let depth = 0
  let quote = null
  for (let i = from; i < text.length; i += 1) {
    const ch = text[i]
    if (quote !== null) {
      if (ch === '\\') {
        i += 1
        continue
      }
      if (ch === quote) quote = null
      continue
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      quote = ch
      continue
    }
    if (ch === '{' || ch === '(' || ch === '[' || ch === '<') depth += 1
    else if (ch === '}' || ch === ')' || ch === ']' || ch === '>') depth -= 1
    else if (ch === ';' && depth === 0) return i
  }
  return -1
}

/** The index of the `}` closing the `{` at `start`, strings and comments skipped. */
function endOfObject(text, start) {
  const masked = maskComments(text)
  let depth = 0
  let quote = null
  for (let i = start; i < masked.length; i += 1) {
    const ch = masked[i]
    if (quote !== null) {
      if (ch === '\\') {
        i += 1
        continue
      }
      if (ch === quote) quote = null
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
 * Every type alias in a declaration, as `{ name, body, at }`, exported or not.
 *
 * A local alias is read as well as an exported one because the declaration build puts
 * the shell every field shares in exactly such a type, and a reader that took only the
 * exported names would hold the arms and not the members all of them carry.
 */
function readAliases(masked, display) {
  const aliases = []
  const declaration = /(^|\n)[ \t]*(?:export\s+)?(?:declare\s+)?type\s+([A-Za-z_$][\w$]*)\s*=/g
  for (const match of masked.matchAll(declaration)) {
    const from = match.index + match[0].length
    const end = endOfDeclaration(masked, from)
    if (end === -1) {
      throw new Error(
        `${NAME}: ${display}: the type alias "${match[2]}" is not terminated, so this run cannot tell where its\n` +
          '  body ends. A reader that guessed would report the next declaration\'s members as its own.',
      )
    }
    aliases.push({ name: match[2], body: masked.slice(from, end), at: lineOf(masked, from) })
  }
  return aliases
}

/**
 * The members of a union alias: every string literal in its body.
 *
 * A union of literals is the only shape a closed union may take here, so a body with
 * no literal is a failure rather than an empty list. A closed union is the whole
 * argument for the type being closed, and an alias that stopped being one would
 * otherwise read as a union with nothing in it.
 */
function unionMembers(alias, display) {
  const members = []
  for (const match of alias.body.matchAll(/(['"])((?:(?!\1)[^\\]|\\.)*)\1/g)) {
    members.push({ value: match[2], at: lineOf(alias.body, match.index) })
  }
  if (members.length === 0) {
    throw new Error(
      `${NAME}: ${display}:${alias.at}  the union "${alias.name}" declares no string literal member, so it is not\n` +
        '  the closed union this gate reads. A closed union is what makes it closed, so an alias that is not one fails\n' +
        '  here rather than reading as an empty one.',
    )
  }
  return members
}

/**
 * The members of a type: the property names its body declares, with the type each one
 * is declared as.
 *
 * Read by shape rather than by a full parse, and the shape is narrow on purpose. Every
 * arm of these specifications is an object literal type in which each property is a
 * line of its own, and the declaration build writes one property per line, so a
 * property is an identifier at the start of an indented line, a colon, and the rest of
 * that line. A nested type's own members are read as members of whichever alias
 * declares them, which is what makes a rule reach the shell aliases as well as the
 * five specifications.
 */
const PROPERTY = /^([ \t]+)([A-Za-z_$][\w$]*)\??\s*:[ \t]*(.*)$/gm

function members(alias) {
  const found = []
  for (const match of alias.body.matchAll(PROPERTY)) {
    found.push({
      name: match[2],
      declared: match[3],
      at: alias.at + lineOf(alias.body, match.index) - 1,
    })
  }
  return found
}

/**
 * The roster, read out of the emitted catalogue.
 *
 * Each entry is one object literal whose `name` and `kind` are string literals, and
 * the array is walked by brace balance with strings skipped rather than by matching
 * over the whole file, so a `name` inside a description cannot be read as an entry. A
 * member this reader cannot find is a failure rather than a skipped entry, because a
 * shorter roster passing as a smaller one is the failure the rule exists against.
 */
function readRoster(text, display) {
  const declaration = /export\s+const\s+catalog\b[^=]*=\s*\[/.exec(text)
  if (declaration === null) {
    throw new Error(
      `${NAME}: ${display} declares no \`export const catalog\` array, so the roster could not be read at all. A\n` +
        '  reader that finds nothing fails here rather than reporting an empty roster, because an empty roster and\n' +
        '  an unread roster are different facts and only one of them is a green run.',
    )
  }
  const entries = []
  let i = declaration.index + declaration[0].length
  while (i < text.length) {
    const ch = text[i]
    if (ch === ']') break
    if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r' || ch === ',') {
      i += 1
      continue
    }
    if (ch !== '{') {
      throw new Error(
        `${NAME}: ${display}: the catalog array holds a ${JSON.stringify(ch)} where an object literal was expected`,
      )
    }
    const end = endOfObject(text, i)
    if (end === -1) throw new Error(`${NAME}: ${display}: an unterminated object literal in the catalog array`)
    const body = text.slice(i + 1, end)
    const name = stringMember(body, 'name', display)
    const kind = stringMember(body, 'kind', display)
    if (name === null || kind === null) {
      throw new Error(
        `${NAME}: ${display}: the entry ${JSON.stringify(String(name))} has a null name or kind, which is not a roster entry`,
      )
    }
    entries.push({ name, kind })
    i = end + 1
  }
  if (entries.length === 0) {
    throw new Error(
      `${NAME}: ${display}: the \`catalog\` array is empty, so there is no roster to hold the closed unions\n` +
        '  against. An empty roster fails, because a roster that cannot be read and a roster with nothing in it\n' +
        '  are not the same fact.',
    )
  }
  return entries
}

/** One member's string value on its own line, or null for the literal `null`. */
function stringMember(body, key, display) {
  const pattern = new RegExp(`(?:^|[\\n\\r])\\s*${key}\\s*:\\s*`, 'g')
  const match = pattern.exec(body)
  if (match === null) {
    throw new Error(
      `${NAME}: ${display}: an entry has no "${key}", so the roster this gate reads is not the roster that shipped`,
    )
  }
  const from = match.index + match[0].length
  if (body.startsWith('null', from)) return null
  const quote = body[from]
  if (quote !== "'" && quote !== '"') {
    throw new Error(
      `${NAME}: ${display}: an entry declares "${key}" as ${
        quote === undefined ? 'nothing' : JSON.stringify(quote)
      }, which is not a string literal or null, so the entry is not one this gate can compare`,
    )
  }
  const end = body.indexOf(quote, from + 1)
  if (end === -1) throw new Error(`${NAME}: ${display}: an entry declares "${key}" as an unterminated string`)
  return body.slice(from + 1, end)
}

/* ------------------------------------------------------------------ *
 * The run
 * ------------------------------------------------------------------ */

const results = ROOTS.map((root) => {
  const absolute = path.resolve(PKG, root.relative)
  let exists = true
  try {
    statSync(absolute)
  } catch {
    exists = false
  }
  return { ...root, absolute, exists }
})
assertRootsResolve(results)

const findings = []
const counts = new Map()
const hit = (id) => counts.set(id, (counts.get(id) ?? 0) + 1)
const say = (line) => console.log(`${NAME}: ${line}`)
const sayUnder = (line) => console.log(`          ${line}`)

const [specRoot, rosterRoot] = results

/* The roster. */
const entries = readRoster(readFileSync(rosterRoot.absolute, 'utf8'), rosterRoot.relative)
const roster = new Set(entries.map((entry) => entry.name))
const byKind = entries.reduce((table, entry) => {
  table.set(entry.kind, (table.get(entry.kind) ?? 0) + 1)
  return table
}, new Map())

/* The declaration. */
const specMasked = maskComments(readFileSync(specRoot.absolute, 'utf8'))
const aliases = readAliases(specMasked, specRoot.relative)
if (aliases.length === 0) {
  throw new Error(
    `${NAME}: ${specRoot.relative} declares no type alias at all, so there is no specification to read. An empty\n` +
      '  read is the failure this run replaces, so it fails rather than reporting zero findings.',
  )
}
const byName = new Map(aliases.map((alias) => [alias.name, alias]))

for (const name of [...UNIONS.map((union) => union.name), ...SPECIFICATIONS]) {
  if (byName.has(name)) continue
  throw new Error(
    `${NAME}: ${specRoot.relative} declares no \`${name}\`, so a type this gate was configured to hold could not be\n` +
      '  read. A declaration that stopped being declared is a change to what this gate checks, and it fails here\n' +
      '  rather than quietly checking fewer things.',
  )
}

/* 1, 2 and 3. Every member of every union, against the roster and against the others. */
const membersByUnion = new Map()
for (const union of UNIONS) {
  const alias = byName.get(union.name)
  const found = unionMembers(alias, specRoot.relative)
  membersByUnion.set(union.name, found)
  const seen = new Set()
  for (const member of found) {
    if (member.value === SLOT) continue
    if (seen.has(member.value)) {
      hit('duplicate-member')
      findings.push(
        `${specRoot.relative}:${member.at}  [duplicate-member]  "${member.value}" is a member of ${union.name} twice,\n` +
          '  so the vocabulary has two answers to one question and the one the compiler narrows on is the first.',
      )
      continue
    }
    seen.add(member.value)
    if (roster.has(member.value)) continue
    hit('unknown-member')
    findings.push(
      `${specRoot.relative}:${member.at}  [unknown-member]  ${union.name} carries "${member.value}", which the\n` +
        `  roster does not hold: every member is ${union.member}. The roster holds ${roster.size} entr(ies) and no name by\n` +
        '  that one. Either nothing ships under that name or the Component ships under another, and at this seam the two\n' +
        "  are the same defect: a caller can pass it and nothing draws it. Fix the member's spelling or add the Component.",
    )
  }
}

for (let a = 0; a < UNIONS.length; a += 1) {
  for (let b = a + 1; b < UNIONS.length; b += 1) {
    const left = UNIONS[a]
    const right = UNIONS[b]
    const theirs = new Map(membersByUnion.get(right.name).map((member) => [member.value, member]))
    for (const member of membersByUnion.get(left.name)) {
      if (member.value === SLOT || theirs.has(member.value) === false) continue
      hit('overlapping-union')
      findings.push(
        `${specRoot.relative}:${member.at}  [overlapping-union]  "${member.value}" is a member of both\n` +
          `  ${left.name} (${left.layer}) and ${right.name} (${right.layer}). ${left.reason.charAt(0).toUpperCase()}${left.reason.slice(1)},\n` +
          `  and a member in both unions lets a caller ask for a ${left.name} where a ${right.name} belongs and receive\n` +
          '  one inside the other.',
      )
    }
  }
}

/* 4 and 5. Every member of every alias in the module, against four refusals and three claims. */
const ALL_MEMBERS = aliases.flatMap((alias) => members(alias).map((member) => ({ ...member, alias: alias.name })))
if (ALL_MEMBERS.length === 0) {
  throw new Error(
    `${NAME}: ${specRoot.relative} declares ${aliases.length} type alias(es) and not one member between them, so no rule\n` +
      '  below had anything to read. A reader that stopped matching is indistinguishable from a rule that was deleted.',
  )
}

for (const member of ALL_MEMBERS) {
  for (const rule of FORBIDDEN) {
    if (rule.words.includes(member.name) === false) continue
    hit(rule.id)
    findings.push(
      `${specRoot.relative}:${member.at}  [${rule.id}]  ${member.alias} carries the member "${member.name}", which is\n` +
        `  ${rule.name}. ${rule.reason}`,
    )
  }
  for (const claim of CLAIMS) {
    if (claim.words.includes(member.name) === false) continue
    hit(claim.id)
    findings.push(
      `${specRoot.relative}:${member.at}  [${claim.id}]  ${member.alias} carries the member "${member.name}", which\n` +
        `  asserts ${claim.name}. ${claim.reason}`,
    )
  }
}

/* 6. An event names no vocabulary of what happened. */
for (const member of members(byName.get(EVENT_VOCABULARY.type))) {
  if (member.name !== EVENT_VOCABULARY.member) continue
  hit('event-vocabulary')
  findings.push(
    `${specRoot.relative}:${member.at}  [event-vocabulary]  ${EVENT_VOCABULARY.type} carries a\n` +
      `  "${EVENT_VOCABULARY.member}" member, which would enumerate what a thing that happened can be. No such\n` +
      "enumeration is this package's to publish: a member on a Prism type would be promising that every consumer's\n" +
      "world is this one. A closed union is legitimate only when its members are things this package ships, and an\n" +
      'event\'s kind is not one of them. The word goes in "action", or the caller composes a Status into "detail".',
  )
}

/* 7. A relation is one ring deep, and the bound is in the type rather than in a convention. */
const relation = byName.get(RELATION_DEPTH.type)
const selfReference = new RegExp(`\\b${RELATION_DEPTH.forbidden}\\b`)
for (const member of members(relation)) {
  if (selfReference.test(member.declared) === false) continue
  hit('relation-depth')
  findings.push(
    `${specRoot.relative}:${member.at}  [relation-depth]  ${RELATION_DEPTH.type} declares "${member.name}" as\n` +
      `  ${JSON.stringify(member.declared.trim())}, so a relation holds a relation. The bound is one ring and it belongs in\n` +
      '  the type rather than in a convention somebody is asked to remember: a record whose related records have their\n' +
      '  own is a graph the consumer walks and this package draws one ring of. A descendant is reached by a link the\n' +
      '  caller passes, not by depth.',
  )
}

for (const finding of findings) console.error(`error ${finding}`)

const found = (id) => counts.get(id) ?? 0

say('')
say(
  `${findings.length} finding(s) across ${UNIONS.length} union(s), ${SPECIFICATIONS.length} specification(s) and ` +
    `${aliases.length} type alias(es) read`,
)
say(
  `coverage ${results.length} root(s) resolved, ${results.filter((result) => !result.exists).length} unresolved, ` +
    `${results.length} file(s) read; roster ${roster.size} entr(ies) (` +
    `${[...byKind].map(([kind, count]) => `${kind}: ${count}`).join(', ')})`,
)
say('the roster and the unions, which is the claim: a member is a thing this package already ships')
for (const union of UNIONS) {
  const foundMembers = membersByUnion.get(union.name)
  say(`  ${union.name} (${union.layer}): ${foundMembers.length} member(s)`)
  sayUnder(`every member is ${union.member}, or the slot arm`)
  sayUnder(foundMembers.map((member) => member.value).join(', '))
}
const slotLine = UNIONS.map(
  (union) =>
    `${union.name}: ${membersByUnion.get(union.name).filter((member) => member.value === SLOT).length}`,
).join(', ')
say(`exempted, the slot arm: ${slotLine}`)
sayUnder('because it names no Component by construction, and it is the escape the findings point at.')
sayUnder('It is one word rather than a rule, because a wider exemption would be a second vocabulary.')
say('the specifications, and the members each one was held against')
for (const name of SPECIFICATIONS) {
  const alias = byName.get(name)
  const own = [...new Set(members(alias).map((member) => member.name))]
  say(`  ${name} (line ${alias.at}): ${own.length} member(s) of its own`)
  sayUnder(own.join(', '))
}
const shells = aliases.filter(
  (alias) => SPECIFICATIONS.includes(alias.name) === false && UNIONS.some((union) => union.name === alias.name) === false,
)
say(
  `  and ${shells.length} further type alias(es) in the declaration, which are not one of the five and are held\n` +
    '    against the same rules:',
)
for (const alias of shells) {
  const own = [...new Set(members(alias).map((member) => member.name))]
  say(`    ${alias.name} (line ${alias.at}): ${own.length} member(s): ${own.join(', ')}`)
}
say('the rule table, and what each rule found')
for (const rule of FORBIDDEN) {
  say(`  ${rule.id}, ${rule.name}: ${found(rule.id)} member(s) in the emitted declaration`)
  sayUnder(`because ${rule.reason}`)
}
for (const claim of CLAIMS) {
  say(`  ${claim.id}, ${claim.name}: ${found(claim.id)} member(s) in the emitted declaration`)
  sayUnder(`because ${claim.reason}`)
}
say(
  `  event-vocabulary, a ${EVENT_VOCABULARY.member} on ${EVENT_VOCABULARY.type}: ` +
    `${found('event-vocabulary')} member(s)`,
)
sayUnder("because no enumeration of what a consumer calls a thing that happened is this package's to publish.")
say(
  `  relation-depth, a ${RELATION_DEPTH.forbidden} inside ${RELATION_DEPTH.type}: ` +
    `${found('relation-depth')} member(s)`,
)
sayUnder('because the bound is one ring and it belongs in the type rather than in a convention.')
say(`  unknown-member, a union member the roster does not hold: ${found('unknown-member')} member(s)`)
say(`  overlapping-union, one member in two of the three unions: ${found('overlapping-union')} pair(s)`)
say(`  duplicate-member, one member claimed twice in one union: ${found('duplicate-member')} member(s)`)
say('what this run did NOT read, and why that is a scope decision rather than an omission')
say('  src/lib/spec.ts, the source: the emitted declaration is the seam a consumer reads, and a gate reading both')
say('    would be two gates that could disagree about which one shipped.')
say("  the rest of dist/: only the specification module's declaration and the roster are subjects here.")
say('  src/catalog.ts: the roster is read out of dist/catalog.js, which is the list this package ships.')
say('  any Item document: a specification type has no slug, no page, no Demo and no corpus entry, so there is')
say('    nothing published about one for this gate to check, and a sentence in a document is not decidable anyway.')
say('  the law that there is ONE shape per concept. It is not gated: a second declaration would be named')
say('    differently from the first, so the rule that would catch it is a hand maintained list, which is the shape')
say('    docs/quality-gates.md already refuses. That law is held by the authoring and by review, so a clean run')
say('    here is not evidence of it.')

if (findings.length > 0) {
  console.error(
    `\nA closed union is legitimate only when its members are things this package already ships, and a specification is\n` +
      "plain data that carries no rule and makes no claim about a consumer's store. Both are one word away from being\n" +
      'untrue, neither is visible in review, and a member that drifts fails here rather than reaching a caller who has\n' +
      'no way to draw it.',
  )
  process.exit(1)
}

say('')
say(
  'every union member names a Component or a collection arrangement this package ships, the three unions are disjoint,',
)
say(
  '  and no specification carries a rule, a validator, a schema, a pattern, an immutability claim, a retention window',
)
say('  or a time axis.')
