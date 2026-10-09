/**
 * The specification-union gate's own test, run against planted shapes.
 *
 * The property under test is not "the gate passes". It is that a shape this gate
 * exists to refuse turns it red, that a shape it is asking for stays green, and
 * that the shipped declarations and the shipped roster are a clean pair today. A
 * gate nobody has watched fail is indistinguishable from one that found nothing,
 * and this file is the watching.
 *
 * **The fixtures are the seam, not the source.** The gate reads
 * `dist/lib/spec.d.ts` and `dist/catalog.js`, so a case stages those two files
 * rather than planting anything in `packages/ui/src`. That is the reason
 * `no-legacy-line.test.mjs` gives for staging rather than dirtying the tree: a test
 * that had to break the repository to see a gate react would leave the break behind
 * for the next run, and it would be proving the gate against a tree nobody ships.
 *
 * **Both fixture files are the real emitted ones**, so a case is the shipped module
 * with one declaration replaced rather than a hand written approximation of it. A
 * fixture written from scratch proves the reader agrees with the author of the
 * fixture, which is a smaller claim than the one this gate makes.
 *
 * **The cases marked "green before this gate existed" are the ones that show the
 * gate has teeth.** Each is a shape that is either in the document the subject was
 * decided in or is the obvious next edit, and every one of them was accepted by
 * every gate in this repository while it stood: a specification type is not an Item,
 * has no slug, and no catalogue gate reads `src/lib` at all. The `Text` case is the
 * sharpest of them, because it is the name `DESIGN.md` itself writes when it names
 * the cell vocabulary, and this package ships that cell as `Typography`. The member
 * named a Component under a different name and every gate was green.
 *
 * Run: node --test "scripts/__tests__/spec-unions.test.mjs"
 */
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

const REPO = path.resolve(import.meta.dirname, '..', '..')
const PKG = path.join(REPO, 'packages', 'ui')
const GATE = path.join(PKG, 'scripts', 'check-spec-unions.mjs')

/** The two roots the gate declares, which are also the two files a fixture stages. */
const DECLARATION = 'dist/lib/spec.d.ts'
const ROSTER = 'dist/catalog.js'

/**
 * The real emitted files, read once.
 *
 * They have to exist, because the gate's seam is the emitted tree and a test that
 * fell back to a hand written copy would be testing the reader against itself. The
 * package's own `test` task declares its dependency on its own build for the same
 * reason the surface gate's does.
 */
function emitted(relative) {
  const file = path.join(PKG, relative)
  try {
    return readFileSync(file, 'utf8')
  } catch {
    throw new Error(
      `${file} does not exist.\n` +
        '  This suite drives the shipped gate against a staged copy of the emitted declaration and the\n' +
        '  emitted roster, because that is the seam the gate reads. Run the package build first:\n' +
        '  `pnpm --filter @nanisoft/prism-ui build`.',
    )
  }
}

const SHIPPED = emitted(DECLARATION)
const CATALOGUE = emitted(ROSTER)

/* ------------------------------------------------------------------ *
 * Patching the shipped declaration
 * ------------------------------------------------------------------ */

/**
 * The index just past the `;` that ends the declaration at `start`, with comments,
 * strings and brace depth skipped.
 *
 * A naive `indexOf(';')` truncates an object type at its first property, and every
 * property ends in one, so the fixture helper has to know where a declaration ends
 * the same way the gate's reader does.
 */
function endOfDeclaration(text, start) {
  let depth = 0
  let quote = null
  for (let i = start; i < text.length; i += 1) {
    const ch = text[i]
    if (quote !== null) {
      if (ch === '\\') {
        i += 1
        continue
      }
      if (ch === quote) quote = null
      continue
    }
    if (ch === '/' && text[i + 1] === '*') {
      const close = text.indexOf('*/', i + 2)
      i = close === -1 ? text.length : close + 1
      continue
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      quote = ch
      continue
    }
    if (ch === '{' || ch === '(' || ch === '[') depth += 1
    else if (ch === '}' || ch === ')' || ch === ']') depth -= 1
    else if (ch === ';' && depth === 0) return i
  }
  throw new Error('a declaration in the shipped fixture is not terminated')
}

/** One replaced declaration: a union of string literals, or an object type. */
const union = (name, members) => ({ name, body: members.map((member) => `'${member}'`).join(' | ') })

/** One replaced declaration written as an object type, one member per line. */
function object(name, members) {
  return { name, body: `{\n${members.map((member) => `    ${member}`).join('\n')}\n}` }
}

/** The shipped declaration with each named declaration replaced in turn. */
function declarationWith(...patches) {
  let text = SHIPPED
  for (const patch of patches) {
    const start = text.indexOf(`export type ${patch.name} =`)
    if (start === -1) throw new Error(`the shipped fixture declares no ${patch.name}`)
    const body = start + `export type ${patch.name} =`.length
    text = `${text.slice(0, body)} ${patch.body}${text.slice(endOfDeclaration(text, body))}`
  }
  return text
}

/* ------------------------------------------------------------------ *
 * Running
 * ------------------------------------------------------------------ */

function stage(files, { withGate = false } = {}) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'prism-spec-unions-'))
  if (withGate) {
    const scripts = path.join(dir, 'scripts')
    mkdirSync(scripts, { recursive: true })
    copyFileSync(GATE, path.join(scripts, 'check-spec-unions.mjs'))
  }
  for (const [relative, source] of Object.entries(files)) {
    const full = path.join(dir, relative)
    mkdirSync(path.dirname(full), { recursive: true })
    writeFileSync(full, source)
  }
  return dir
}

/** Run the shipped gate against a staged package and hand the result back. */
function over(dir) {
  return spawnSync(process.execPath, [GATE, `--pkg=${dir}`], { encoding: 'utf8', cwd: REPO })
}

/** Stage the shipped pair, patch it, run, and clean up. */
function check(declaration) {
  const files = { [ROSTER]: CATALOGUE, [DECLARATION]: SHIPPED }
  if (declaration !== null) files[DECLARATION] = declaration
  const dir = stage(files)
  try {
    return over(dir)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

/* ------------------------------------------------------------------ *
 * The cases
 * ------------------------------------------------------------------ */

/**
 * The shapes that must turn the run red.
 *
 * The first four are the four the ticket names: a member naming something this
 * package does not ship, a member naming it under another name, a member two unions
 * both claim, and a member carrying a rule of any kind. The rest are the decisions
 * those four came from, one case each.
 */
const FIRES = [
  {
    name: 'a union member naming a Component this package does not ship',
    rule: 'unknown-member, against the emitted roster',
    was: 'green before this gate existed',
    declaration: declarationWith(union('ColumnKind', ['Price', 'Gantt', 'slot'])),
    says: ['[unknown-member]', 'ColumnKind carries "Gantt"', 'nothing draws it'],
  },
  {
    name: 'a member naming a Component this package ships under another name',
    rule: 'unknown-member, for the other of the two causes the same rule answers',
    // `Text` is the name `DESIGN.md` writes when it names the cell vocabulary, and
    // this package ships that cell as `Typography`. At the seam the two causes are
    // one defect: a caller can pass it and nothing draws it.
    was: 'green before this gate existed, and it is in the document the decision was written in',
    declaration: declarationWith(union('ColumnKind', ['Text', 'Price', 'slot'])),
    says: ['[unknown-member]', 'ColumnKind carries "Text"'],
  },
  {
    name: 'a field union member that is also a column union member',
    rule: 'overlapping-union, over every pair of the three unions',
    was: 'green before this gate existed',
    declaration: declarationWith(
      union('FieldKind', ['Input', 'MoneyField', 'slot']),
      union('ColumnKind', ['MoneyField', 'Price', 'slot']),
    ),
    says: ['[overlapping-union]', '"MoneyField" is a member of both', 'FieldKind', 'ColumnKind'],
  },
  {
    name: 'a specification member carrying a validator',
    rule: 'forbidden-member, the validator table',
    was: 'green before this gate existed',
    declaration: declarationWith(
      object('FieldSpec', [
        'key: string;',
        'label: string;',
        'validate?: (value: string) => string | undefined;',
      ]),
    ),
    says: ['[forbidden-member]', 'carries the member "validate"', 'a validator'],
  },
  {
    name: 'a specification member carrying a constraint object',
    rule: 'forbidden-member, the rule table',
    was: 'green before this gate existed',
    declaration: declarationWith(
      object('ColumnSpec', ['key: string;', 'header: string;', 'constraints?: { min: number };']),
    ),
    says: ['[forbidden-member]', 'carries the member "constraints"', 'a rule'],
  },
  {
    name: 'a specification member carrying a schema',
    rule: 'forbidden-member, the schema table',
    was: 'green before this gate existed',
    declaration: declarationWith(object('MetricSpec', ['key: string;', 'label: string;', 'schema?: unknown;'])),
    says: ['[forbidden-member]', 'carries the member "schema"', 'a schema'],
  },
  {
    name: 'a specification member carrying a regular expression',
    rule: 'forbidden-member, the pattern table',
    was: 'green before this gate existed',
    declaration: declarationWith(object('EventSpec', ['key: string;', 'at: number;', 'pattern?: string;'])),
    says: ['[forbidden-member]', 'carries the member "pattern"', 'a pattern'],
  },
  {
    name: 'an event that grew a kind, which is a vocabulary of what happened',
    rule: 'event-vocabulary, on EventSpec alone',
    was: 'green before this gate existed',
    declaration: declarationWith(
      object('EventSpec', [
        'key: string;',
        'at: number | string;',
        'actor: string;',
        'action: string;',
        'kind?: "scan" | "sign-in" | "permission";',
      ]),
    ),
    says: ['[event-vocabulary]', 'EventSpec carries a', '"kind" member', "every consumer's"],
  },
  {
    name: 'a specification member asserting immutability',
    rule: 'asserted-claim, the immutability table',
    was: 'green before this gate existed',
    declaration: declarationWith(object('EventSpec', ['key: string;', 'at: number;', 'sealed?: boolean;'])),
    says: ['[asserted-claim]', 'carries the member "sealed"', 'asserts immutability'],
  },
  {
    name: 'a specification member asserting a retention window',
    rule: 'asserted-claim, the retention table',
    was: 'green before this gate existed',
    declaration: declarationWith(
      object('EventSpec', ['key: string;', 'at: number;', 'retentionWindow?: string;']),
    ),
    says: ['[asserted-claim]', 'carries the member "retentionWindow"', 'asserts retention'],
  },
  {
    name: 'a specification member asserting a time axis',
    rule: 'asserted-claim, the time axis table',
    was: 'green before this gate existed',
    declaration: declarationWith(object('EventSpec', ['key: string;', 'at: number;', 'duration?: number;'])),
    says: ['[asserted-claim]', 'carries the member "duration"', 'asserts a time axis'],
  },
  {
    name: 'a relation that holds a relation, which is the depth the type exists to bound',
    rule: 'relation-depth, read on the direct body of RelationSpec',
    was: 'green before this gate existed',
    declaration: declarationWith(
      object('RelationSpec', [
        'key: string;',
        'label: string;',
        'kind: RelationKind;',
        'members: readonly unknown[];',
        'children: readonly RelationSpec[];',
      ]),
    ),
    says: ['[relation-depth]', 'so a relation holds a relation', 'children'],
  },
  {
    name: 'a union member claimed twice, which is two answers to one question',
    rule: 'duplicate-member',
    was: 'green before this gate existed',
    declaration: declarationWith(union('RelationKind', ['Table', 'Table', 'slot'])),
    says: ['[duplicate-member]', '"Table" is a member of RelationKind twice'],
  },
]

/** The shapes that must stay green, each with the rule whose removal would redden it. */
const SILENT = [
  {
    name: 'the shipped declarations over the shipped roster',
    rule: 'nothing: this is the pair the package actually ships',
    declaration: null,
  },
  {
    name: 'a union carrying nothing but the slot arm',
    rule: 'the one exemption, which is printed on every run',
    declaration: declarationWith(
      union('FieldKind', ['slot']),
      union('ColumnKind', ['slot']),
      union('RelationKind', ['slot']),
    ),
  },
  {
    name: 'a member naming a Block rather than a Component',
    rule: 'the roster is read across all four Kinds, not only over Components',
    declaration: declarationWith(union('RelationKind', ['ActivityFeed01', 'slot'])),
  },
  {
    name: 'a requiredness member, which is a rendering fact and not a rule',
    rule: 'the forbidden-member tables, which deliberately do not name `required`',
    declaration: declarationWith(
      object('FieldSpec', [
        'key: string;',
        'label: string;',
        'kind: FieldKind;',
        'required?: boolean;',
        'disabled?: boolean;',
        'help?: string;',
      ]),
    ),
  },
  {
    name: 'a moment on an event, which is the one time member a trail is allowed',
    rule: 'the asserted-claim tables, which deliberately do not name `at`',
    declaration: declarationWith(
      object('EventSpec', ['key: string;', 'at: number | string;', 'actor: string;', 'action: string;']),
    ),
  },
  {
    name: "a relation whose members are the caller's own typed data",
    rule: 'the relation-depth rule, which reads the direct body and nothing else',
    declaration: declarationWith(
      object('RelationSpec', [
        'key: string;',
        'label: string;',
        'kind: RelationKind;',
        'members: readonly unknown[];',
      ]),
    ),
  },
  {
    name: "a caller's own formatted figure, which is why no formatter callback is refused here",
    rule: 'nothing: composed text is data an agent can read and a function is not',
    declaration: declarationWith(object('MetricSpec', ['key: string;', 'label: string;', 'value: string;'])),
  },
]

test('the gate passes over the package it is checked into', () => {
  const result = spawnSync(process.execPath, [GATE], { encoding: 'utf8', cwd: REPO })

  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout, /0 finding\(s\)/)
  // The negative controls that make the clean run mean something. A run that read no
  // type alias, or a roster of nothing, prints a success line shaped like this one
  // and is caught by the two cases at the foot of this file; these are the lines
  // that say the readers matched this time rather than that a rule was deleted.
  assert.match(result.stdout, /3 union\(s\), 5 specification\(s\) and [1-9]\d* type alias\(es\) read/)
  assert.match(result.stdout, /roster \d+ entr\(ies\) \(component: [1-9]\d*/)
  // Every member of every union is printed, so a union that emptied itself would
  // show here as a shorter list rather than as a finding.
  assert.match(result.stdout, /FieldKind \(a write form, a wizard and a settings region\): [1-9]\d* member\(s\)/)
  assert.match(result.stdout, /exempted, the slot arm: FieldKind: 1, ColumnKind: 1, RelationKind: 1/)
  // Each refusal prints a count, and each is zero on a clean tree.
  assert.match(result.stdout, /forbidden-member, a validator: 0 member\(s\)/)
  assert.match(result.stdout, /asserted-claim, a time axis: 0 member\(s\)/)
  assert.match(result.stdout, /event-vocabulary, a kind on EventSpec: 0 member\(s\)/)
  assert.match(result.stdout, /relation-depth, a RelationSpec inside RelationSpec: 0 member\(s\)/)
  // And the run says what it did not read, which is the other half of coverage.
  assert.match(result.stdout, /what this run did NOT read/)
  assert.match(result.stdout, /the law that there is ONE shape per concept/)
})

for (const { name, rule, was, declaration, says } of FIRES) {
  test(`it reports ${name}`, () => {
    const result = check(declaration)
    assert.equal(result.status, 1, `expected a finding, got:\n${result.stdout}`)
    for (const phrase of says) {
      assert.ok(
        result.stderr.includes(phrase),
        `expected ${JSON.stringify(phrase)} in:\n${result.stderr}`,
      )
    }
    assert.match(result.stdout, /1 finding\(s\)/)
    assert.ok(rule.length > 0, 'a firing case names the rule that turns it red')
    assert.ok(was.length > 0, 'a firing case records that it was green before the gate existed')
  })
}

for (const { name, rule, declaration } of SILENT) {
  test(`it accepts ${name}`, () => {
    const result = check(declaration)
    assert.equal(result.status, 0, `expected no finding, got:\n${result.stderr}`)
    assert.match(result.stdout, /0 finding\(s\)/)
    assert.ok(rule.length > 0, 'a silent case names the rule that would redden it')
  })
}

test('a package that has not been built fails the run rather than emptying it', () => {
  // Both roots are under `dist/`, so the common cause is a build that has not run.
  // Reporting zero findings over a missing declaration would be the exact claim this
  // gate exists to replace.
  const dir = stage({ [ROSTER]: CATALOGUE })
  try {
    const result = over(dir)
    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /configured root does not resolve/)
    assert.match(result.stderr, /the package has not been built/)
    assert.doesNotMatch(result.stdout, /0 finding\(s\)/)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('a declaration with none of the types this gate holds fails rather than checking nothing', () => {
  // The module emptied out, or a declaration build stopped emitting it. Either way
  // the run would otherwise check zero unions and zero specifications and print a
  // success line, so the first name it cannot find is the whole of the message.
  const result = check('export type Nothing = {\n    a: string;\n};\n')
  assert.notEqual(result.status, 0)
  assert.match(result.stderr, /declares no `FieldKind`/)
  assert.match(result.stderr, /quietly checking fewer things/)
})

test('a union that stopped being a union of literals fails rather than reading as empty', () => {
  const result = check(declarationWith(union('RelationKind', [])))
  assert.notEqual(result.status, 0)
  assert.match(result.stderr, /declares no string literal member/)
})

test('the gate reads its package root from its own location, and it is the shipped script', () => {
  // The prior art `catalogue-rule-gates.test.tsx` and `surface-gate.test.tsx` both
  // set: the script is copied rather than reimplemented, and what runs is the file
  // the package's own `check` chain runs. The fixture is a planted defect and the
  // gate is run from a working directory that is not the package either, so a run
  // that resolved its roots from `process.cwd()` could not read them at all.
  const dir = stage(
    {
      [ROSTER]: CATALOGUE,
      [DECLARATION]: declarationWith(union('ColumnKind', ['Price', 'Gantt', 'slot'])),
    },
    { withGate: true },
  )
  try {
    const result = spawnSync(process.execPath, [path.join(dir, 'scripts', 'check-spec-unions.mjs')], {
      cwd: os.tmpdir(),
      encoding: 'utf8',
    })
    assert.equal(result.status, 1, result.stdout)
    assert.match(result.stderr, /ColumnKind carries "Gantt"/)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})
