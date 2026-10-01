/**
 * Every catalogue Item carries a documentation comment, and the gate says which
 * one.
 *
 * The claim this holds. AGENTS.md: "JSDoc on the exported component is the
 * documentation source. It is preserved into the emitted declarations, which the
 * corpus reads. A component with no JSDoc block has no corpus entry." DESIGN.md
 * says the same thing about the authoring contract, and then adds the part that
 * makes it mechanical: the declaration build preserves the comment into the
 * emitted `.d.ts`, and the emitted `.d.ts` is what the corpus reads. So a JSDoc
 * block is not decoration on a Component. It is the only path from a Component to
 * the published prose, and a Component without one is a Component whose interface
 * an agent cannot see.
 *
 * The hole this closes. Nothing checked it. The catalogue gate compares three
 * lists and says nothing about whether the modules in them are documented; the
 * corpus builder throws when an Item has no *documentation file*, which is the
 * MDX on the site and not the JSDoc in the package. So a Component could be
 * authored, catalogued, registered, installed, documented on the site and present
 * in `llms.txt`, and its own interface would be absent from the published spec,
 * with a green build. The corpus would render the seam line - "_No additional
 * props are declared for this item._" - for a Component that declares nine.
 *
 * What the rule is, precisely. A Component is one `.tsx` file under
 * `src/components/ui`; a Block or a Page is one directory under its own root, and
 * the module inside it that carries the item's own `export function`. The JSDoc
 * block must be the one immediately preceding that function, because "immediately
 * preceding" is the only reading a TypeScript declaration emitter agrees with: a
 * comment three functions away is not attached to this one in the emitted `.d.ts`
 * and the corpus will not see it.
 *
 * A file may hold several exports. Compound parts and helpers are not required to
 * be documented - the rule is about the Item, and a rule about every function in
 * a 500-line Block would be a rule about verbosity. The Item is named by the
 * catalogue's `exports`, and this gate finds the file rather than reading the
 * catalogue, so the Item is found as the one exported function whose name the
 * file's own module is named for. Where a file exports exactly one item function
 * that is unambiguous; where it exports none, that is a finding, because an Item
 * module that exports no item is a module nothing can import.
 *
 * The two exclusions are declared here rather than discovered, both carry a
 * reason, both are printed on every run with the files they resolved to, and a
 * declared exclusion that resolves to nothing is a finding. The first is a test
 * file, which is not an Item. The second is a re-export module - a Block's
 * `index.tsx` is a line of `export { ... } from './x'`, and the documentation is
 * on the function it forwards to, so a re-export module is not the place to look
 * for it.
 *
 * Coverage is asserted rather than assumed. The roots resolve from this file's own
 * location and never from `process.cwd()`, a root that resolves to nothing fails
 * the run naming both causes, a run that resolved every root and read no file
 * fails the run, and the closing lines state the roots, the files walked, the
 * files read, how many Items were found, and both exclusions. No report-only mode:
 * a gate that reports and passes is a gate nobody runs.
 *
 * Run: node packages/ui/scripts/check-item-docs.mjs
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const NAME = 'check-item-docs'
const HERE = path.dirname(fileURLToPath(import.meta.url))

/** The package root, from this file's own location. Never `process.cwd()`. */
const PKG = path.join(HERE, '..')

/**
 * Every root this gate reads, relative to the package root.
 *
 * The catalogue is not one of them. The rule is about the modules, and the
 * catalogue's own agreement with the disk is `check-catalogue.mjs`'s job: a gate
 * that read the list it is checking would be able to pass by checking nothing,
 * because an entry with no module is not an Item with no documentation, it is a
 * different failure with its own message.
 */
const ROOTS = ['src/components/ui', 'src/blocks', 'src/pages']

/** A Component is one `.tsx` file, and its own test file is not a Component. */
const COMPONENT_FILE = /\.tsx$/
const TEST_FILE = /\.test\.tsx$/

/** A Block's or a Page's directory holds `index.tsx` and the module it forwards to. */
const REEXPORT_MODULE = /^index\.tsx$/

/**
 * The whole exclusion list, each entry with the reason it is not an Item.
 *
 * Keys are file names rather than patterns, so widening what is exempt is a
 * decision to take in the open rather than something a new file shape does by
 * itself.
 */
const EXCLUSIONS = [
  {
    name: 'a co-located test',
    match: TEST_FILE,
    reason:
      'a test file beside a Component, not a Component. `check-catalogue.mjs` applies the same rule, so both read the same set.',
  },
  {
    name: 'a re-export module',
    match: REEXPORT_MODULE,
    reason:
      'a Block or a Page index, which is one `export { ... } from` line. The documentation is on the function it forwards to, and the declaration emitter follows the same hop the corpus builder does.',
  },
]

const rel = (file) => path.relative(PKG, file).split(path.sep).join('/')
const lineOf = (source, index) => source.slice(0, index).split('\n').length

/**
 * The walker is local rather than imported, for the reason
 * `check-catalogue.mjs` states in full: `scripts/` is not in this package's
 * `files`, so a shared module would ship in no tarball and fail to resolve for
 * anyone who ran the gate from an installed copy.
 *
 * Symbolic links are not followed. A linked directory is reported as a file, so a
 * link cycle cannot make the walk run forever.
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
    if (statSync(child).isDirectory()) {
      const nested = walkRoot(child)
      if (!nested.exists) return nested
      files.push(...nested.files)
    } else {
      files.push(child)
    }
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
      '  This is not a missing-directory problem: the roots are there and they are empty, or the\n' +
      '  read was short-circuited before it began.\n' +
      '  Reporting zero findings over zero files is the failure this replaces, so an empty read\n' +
      '  fails the run.',
  )
}

/**
 * Blanks the body of a comment without moving a single line and without touching
 * the delimiters, so a line number in a finding still points at the line a reader
 * has to edit and a comment's closing delimiter survives to be measured against.
 * `check-vector-ink.mjs` masks for the same reason: a text scan reads prose, and a
 * JSDoc block that quotes an `export function` in order to explain itself is a
 * description, not a declaration.
 */
function maskComments(source) {
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
    if (next === -1 && line === -1) break
    if (next !== -1 && (line === -1 || next < line)) {
      const close = source.indexOf('*/', next + 2)
      const end = close === -1 ? source.length : close + 2
      // The delimiters survive: the gap between a comment and an export is
      // measured on the text, and a mask that removed them would make every
      // documented declaration look undocumented.
      blank(next + 2, close === -1 ? source.length : close)
      i = end
      continue
    }
    let end = source.indexOf('\n', line)
    if (end === -1) end = source.length
    blank(line, end)
    i = end
  }
  return out.join('')
}

/**
 * Every function declaration a module exports, with the index of its `export`.
 *
 * Four spellings, because this package uses all four and the declaration
 * emitter accepts all four: `export function X`, `export default function X`, a
 * plain `function X` closed by an `export { ... X ... }` statement at the foot of
 * the module, which is what every Component here does, and a generic one of those
 * three written `function X<T>`. Missing the third would report thirty-four
 * Components as having no declaration, which is a gate that fires on everything
 * and is therefore indistinguishable from one that works.
 *
 * **The fourth was missing until 2026-09 and it cost a real API, which is the
 * reason it is written down rather than left as a pattern.** `RepeatableRows` is a
 * Component over a list of row objects, so its natural signature is generic in the
 * row type, and `function RepeatableRows<TRow extends object>(...)` matched
 * nothing here: the pattern wanted an open parenthesis straight after the name. The
 * gate did not fail, which is the dangerous part. It reported the module as
 * declaring no Item at all, so a Component with a JSDoc block and a full MDX page
 * was invisible to the one gate whose job is to say a Component is undocumented.
 * The fix the subagent reached for instead was to drop the type parameter and
 * instantiate the interface inside the body, which works and which costs the caller
 * inference on the render prop's row. That is the trade this pattern is here to
 * prevent, so the pattern is widened rather than the Component narrowed.
 *
 * The widening is a widening and not a relaxation. The gate's law is that an
 * exported declaration without a JSDoc block has no corpus entry, and a generic
 * declaration is as much an exported declaration as a plain one; the gate could
 * see the plain one and not the generic one, so it was enforcing the law over a
 * subset of the tree. The cost is that the pattern now also matches a type
 * parameter list on a helper that is not an Item, and such a helper would be
 * reported as a declaration with no JSDoc, which is a false finding rather than a
 * missed one. A false finding is the cheaper of the two to live with, and the
 * header comment above is what a reader needs to see to understand why.
 */
function itemFunctions(source) {
  const found = []
  const exported = new Set()
  for (const statement of source.matchAll(/export\s*\{([^}]*)\}/g)) {
    for (const raw of (statement[1] ?? '').split(',') ) {
      const name = raw.trim().split(/\s+as\s+/)[0]?.trim()
      if (name) exported.add(name)
    }
  }

  for (const match of source.matchAll(
    /(export\s+(?:default\s+)?|)(function\s+)([A-Za-z0-9_$]+)(?:\s*<[^>()]*>)?\s*\(/g,
  )) {
    const isExported = match[1] !== '' || exported.has(match[3] ?? '')
    if (!isExported) continue
    found.push({ name: match[3] ?? '', index: match.index })
  }
  return found
}

/* ------------------------------------------------------------------ *
 * The run
 * ------------------------------------------------------------------ */

const results = ROOTS.map((relative) => ({ relative, ...walkRoot(path.join(PKG, relative), relative) }))
assertRootsResolve(results)

const resolved = new Map(EXCLUSIONS.map((rule) => [rule, []]))
const findings = []
let filesRead = 0
let itemsFound = 0

for (const result of results) {
  for (const file of result.files) {
    const name = path.basename(file)
    const exclusion = EXCLUSIONS.find((rule) => rule.match.test(name))
    if (exclusion !== undefined) {
      resolved.get(exclusion).push(`${rel(file)} (${result.relative})`)
      continue
    }
    if (!COMPONENT_FILE.test(name)) continue

    filesRead += 1
    const shown = rel(file)
    const raw = readFileSync(file, 'utf8')
    const source = maskComments(raw)

    const item = itemFunctions(source)
    if (item.length === 0) {
      findings.push(
        `${shown}  [no-item]  the module declares no exported function, so it is a module nothing can ` +
          'import as an Item and there is no declaration for the corpus to read.',
      )
      continue
    }

    for (const declared of item) {
      itemsFound += 1

      // "Immediately preceding" is the whole rule, and it is measured the way a
      // declaration emitter measures it: the nearest non-whitespace character
      // before the declaration must be the end of a block comment. Searching
      // backwards for the last comment anywhere above would be a different rule
      // and a weaker one - it would accept a comment that documents the
      // declaration two functions above, which is exactly the shape that reaches
      // an emitted `.d.ts` with no comment on it.
      const before = source.slice(0, declared.index)
      const trimmed = before.replace(/\s+$/, '')
      const attached = trimmed.endsWith('*/')
      if (!attached) {
        const gap = trimmed.slice(Math.max(0, trimmed.length - 60))
        findings.push(
          `${shown}:${lineOf(source, declared.index)}  [no-attached-doc]  ${declared.name} carries no ` +
            'documentation comment immediately before it. The declaration build preserves a JSDoc block ' +
            'into the emitted .d.ts and the corpus reads it from there, so an Item with no attached block ' +
            `has no published interface. The text before it ends: ${JSON.stringify(gap)}`,
        )
      }
    }
  }
}

for (const rule of EXCLUSIONS) {
  if (resolved.get(rule).length === 0) {
    findings.push(
      `  [stale-exclusion]  the declared exclusion "${rule.name}" resolved to no file, so it is a rule that ` +
        'fires on nothing. Remove it or say what it now covers.',
    )
  }
}

assertFilesRead(filesRead)

const walked = results.reduce((total, result) => total + result.files.length, 0)
for (const finding of findings) console.error(`error ${finding}`)

console.log(
  `\n${NAME}: ${findings.length} finding(s) across ${itemsFound} Item declaration(s) in ${filesRead} file(s) read`,
)
console.log(
  `${NAME}: coverage ${results.length} root(s) resolved, ` +
    `${results.filter((result) => !result.exists).length} unresolved; ${walked} file(s) walked, ` +
    `${filesRead} file(s) read`,
)
for (const rule of EXCLUSIONS) {
  const hit = resolved.get(rule)
  const files = hit.map((entry) => entry.split(' ')[0])
  console.log(
    `${NAME}: excluded, ${rule.name}: ${files.length} file(s)${files.length ? `: ${files.slice(0, 5).join(', ')}${files.length > 5 ? ', ...' : ''}` : ''}`,
  )
  console.log(`          because ${rule.reason}`)
}
console.log(
  `${NAME}: the scanned set is the source tree, not the catalogue. A module on disk with no catalogue\n` +
    '  entry, or an entry with no module, is `check-catalogue.mjs` finding and this gate has no opinion.',
)

if (findings.length > 0) {
  console.error(
    `\nA documentation comment is the only path from an Item to its published interface. It is preserved\n` +
      'into the emitted declaration and the corpus reads it from there, so an Item with no comment is an\n' +
      'Item whose props no reader and no agent can see.',
  )
  process.exit(1)
}

console.log(
  `${NAME}: every Item declaration carries an attached documentation comment, so every Item's interface\n` +
    '  reaches the emitted declaration and the corpus with it.',
)
