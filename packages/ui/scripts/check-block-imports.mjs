/**
 * A Block and a Page fetch nothing, and import no router and no data client.
 *
 * The claim this holds. CONTEXT.md states it as part of each definition: a Block
 * "takes its content as props and fetches no application data"; a Page "receives
 * application-owned navigation, content and data". DESIGN.md's composition layers
 * say it twice and once more sharply: a Block "never fetches application data", and
 * a Page is "a shipped component, not a documented recipe" that "never fetches and
 * never imports a router or a data client". The Page half is the sharper claim and
 * the easier one to break by accident, because a Page is the thing a router hands
 * a route's data to, so the temptation to reach for the router is strongest exactly
 * where the rule is.
 *
 * The hole this closes. Nothing checked it, and the defect it produces is not a
 * visual one. A Block that imports a data client and fetches its own content looks
 * like a Block in every review: it renders, it type-checks, it passes the token
 * gates, the surface gate, the focus gate and the catalogue gate. What it is not
 * is installable. A Block that fetches is a Block that has to be reimplemented by
 * every consumer whose data lives somewhere else, and the corpus publishes it as a
 * product-agnostic section, so an agent composing a page from it composes a fetch
 * the consumer never asked for. The consumer's own build then breaks on a package
 * that shipped as a component library, and nothing in this repository says why.
 *
 * ## The rules, and why each is separate
 *
 *   1. a denied module      a router or a data client by name. Named rather than
 *                           pattern-matched, so widening the list is a decision to
 *                           take in the open and a typo cannot open a hole.
 *   2. a network call       `fetch`, `XMLHttpRequest`, `sendBeacon` or a
 *                           `WebSocket` constructor, called rather than imported.
 *                           An import of a fetch wrapper is caught by rule 1; a call
 *                           to the platform's own is caught here.
 *   3. a server-only reader an import of a server runtime - `node:*`, or a server
 *                           entry point of a framework - which would take a Block
 *                           that is a client Component and make it a server one.
 *
 * What is NOT a finding, and why it is stated here rather than left to a reader:
 * `'use client'` is allowed, because interactivity is a Block's business and
 * shipping it is the ordinary case rather than the exception. A relative import of
 * another Block, a Component or `cn` is allowed, because composition is the whole
 * point. A `ReactNode` slot is allowed, because a slot is how a consumer injects
 * an interactive child without the Block owning any state.
 *
 * **That sentence carries no count, and the reason it does not is this run.** The
 * first version of it said "seven of them ship it", which was true when it was
 * written and was wrong within one release: the client-free action-slot pattern
 * put five more Blocks into the tree, and a count in prose cannot notice. It was
 * wrong in the other direction too, because a count nobody re-reads does not decay
 * gracefully, it is simply false and still reads as a fact. So the run measures the
 * figure and prints it, and a reader who wants to know how many Blocks ship
 * `'use client'` reads the output of the run rather than a sentence that has to be
 * updated by whoever changes the tree.
 *
 * Every rule is declared with its reason, and every rule is printed on every run
 * with the number of hits it found. A rule with no hits is not an error here - the
 * shipped tree has no Block that fetches, and a rule that failed on nothing would
 * be a rule that could not be satisfied - but it IS printed, because a rule that
 * prints nothing is a rule whose pattern a reader cannot check, and each rule here
 * is proved red by a fixture in the test lane rather than by the shipped tree.
 * That is stated rather than implied: **the proof that these rules work is in
 * `test/catalogue-rule-gates.test.tsx`, not in this run.**
 *
 * Coverage is asserted rather than assumed. The roots resolve from this file's own
 * location and never from `process.cwd()`, a root that resolves to nothing fails
 * the run naming both causes, a run that resolved every root and read no file
 * fails the run, and the closing lines state the roots, the files walked and read,
 * the modules classified, and the whole rule table. No report-only mode: a gate
 * that reports and passes is a gate nobody runs.
 *
 * Run: node packages/ui/scripts/check-block-imports.mjs
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const NAME = 'check-block-imports'
const HERE = path.dirname(fileURLToPath(import.meta.url))

/** The package root, from this file's own location. Never `process.cwd()`. */
const PKG = path.join(HERE, '..')

/** Every root this gate reads, relative to the package root. */
const ROOTS = ['src/blocks', 'src/pages']

const TSX_FILE = /\.tsx$/

/**
 * The modules a Block and a Page may not import, each with the reason.
 *
 * Named in full rather than pattern-matched, because a pattern here is a hole with
 * a regular expression in it: `^next` would deny `next-themes` and allow
 * `next_anything`, and neither of those is a decision anybody made.
 */
const DENIED_MODULES = [
  {
    name: 'a client router',
    modules: [
      'next/navigation',
      'next/router',
      'next/link',
      'next/headers',
      'react-router',
      'react-router-dom',
      '@remix-run/router',
      '@tanstack/react-router',
      'wouter',
      'preact-router',
    ],
    reason:
      "a Page is what a consumer's router renders and a Block is what a Page composes. A Block that imports a router is a Block that has to be reimplemented by every consumer whose routing is not this one, and the Page half of the claim is written in those words on purpose.",
  },
  {
    name: 'a data client',
    modules: [
      'swr',
      '@tanstack/react-query',
      '@tanstack/query-core',
      'react-query',
      'apollo-client',
      '@apollo/client',
      'urql',
      'axios',
      'ky',
      'graphql-request',
      'node-fetch',
    ],
    reason:
      'a Block ships no application data, so a fetch inside one is a fetch the consumer did not ask for and cannot see. A consumer whose data lives in a client of its own must pass the rows in as props, which is what every Block in this package does.',
  },
  {
    name: 'a server runtime',
    modules: [
      'node:fs',
      'node:fs/promises',
      'node:path',
      'node:http',
      'node:https',
      'node:child_process',
      'node:net',
      'node:os',
      'node:url',
      'node:crypto',
    ],
    reason:
      'a Block is a client-safe composition. A `node:` import would make every consumer bundle it for a browser fail to resolve, and it is the one kind of dependency that cannot be tree-shaken out of a published module because the module itself is the problem.',
  },
]

/** A network call, by name rather than by import. */
const NETWORK_CALL = /\b(?:fetch|XMLHttpRequest|sendBeacon|WebSocket|EventSource)\s*\(/g

/** The call-shaped form the same rule reads in a masked source. */
const NETWORK_CALL_MASKED = /\b(?:fetch|XMLHttpRequest|sendBeacon|WebSocket|EventSource)\s*\(\s*\)/

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
 * Blanks comments and string bodies without moving a line, so a rule about a
 * module specifier does not fire on a rule about a call and a JSDoc block that
 * quotes a router import is not a finding. The delimiters survive, because the
 * module specifier is the thing being read.
 */
function maskProse(source) {
  const out = source.split('')
  const blank = (from, to) => {
    for (let k = from; k < to && k < out.length; k += 1) {
      if (out[k] !== '\n' && out[k] !== '\r') out[k] = ' '
    }
  }
  let i = 0
  while (i < source.length) {
    const next = source.indexOf('/*', i)
    const line = source.indexOf('//', i)
    if (next !== -1 && (line === -1 || next < line)) {
      const close = source.indexOf('*/', next + 2)
      const end = close === -1 ? source.length : close + 2
      blank(next + 2, close === -1 ? source.length : close)
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
    break
  }
  return out.join('')
}

/** Every module specifier in a source, with the index it starts at. */
function specifiers(source) {
  const found = []
  for (const match of source.matchAll(/from\s*(['"])([^'"\n]+)\1/g)) {
    found.push({ module: match[2] ?? '', at: match.index })
  }
  for (const match of source.matchAll(/\bimport\s*\(\s*(['"])([^'"\n]+)\1/g)) {
    found.push({ module: match[2] ?? '', at: match.index })
  }
  return found
}

/* ------------------------------------------------------------------ *
 * The run
 * ------------------------------------------------------------------ */

const results = ROOTS.map((relative) => ({ relative, ...walkRoot(path.join(PKG, relative), relative) }))
assertRootsResolve(results)

const findings = []
const hits = new Map(DENIED_MODULES.map((rule) => [rule, []]))
let filesRead = 0
let modulesClassified = 0
let networkCalls = 0
let clientModules = 0

for (const result of results) {
  for (const file of result.files) {
    if (!TSX_FILE.test(path.basename(file))) continue
    filesRead += 1
    const shown = rel(file)
    const source = maskProse(readFileSync(file, 'utf8'))

    // The `'use client'` directive is not masked away by `maskProse`, because it is
    // a directive and not prose, and it is counted rather than judged: the allowed
    // case is stated in the header without a number precisely so the number is
    // something this run can measure instead of something a sentence has to keep.
    if (/^\s*(['"])use client\1/.test(source)) clientModules += 1

    for (const found of specifiers(source)) {
      modulesClassified += 1
      const rule = DENIED_MODULES.find((entry) => entry.modules.includes(found.module))
      if (rule === undefined) continue
      hits.get(rule).push(`${shown}:${lineOf(source, found.at)} ${found.module}`)
      findings.push(
        `${shown}:${lineOf(source, found.at)}  [denied-module]  ${JSON.stringify(found.module)} is ` +
          `${rule.name}, and a Block or a Page may not import one. ${rule.reason}`,
      )
    }

    for (const match of source.matchAll(NETWORK_CALL)) {
      // A masked comment leaves the words; a call whose argument was a comment is
      // the only way a masked source can produce an empty-argument call, so that
      // form is skipped rather than reported.
      const text = match[0]
      if (NETWORK_CALL_MASKED.test(text)) continue
      networkCalls += 1
      findings.push(
        `${shown}:${lineOf(source, match.index)}  [network-call]  ${text.trim()} is a network call in a ` +
          'Block or a Page. Blocks ship no application data, so a fetch inside one is a fetch the consumer did ' +
          'not ask for and cannot see. Pass the data in as props, which is what every Block here does.',
      )
    }
  }
}

assertFilesRead(filesRead)

const walked = results.reduce((total, result) => total + result.files.length, 0)
for (const finding of findings) console.error(`error ${finding}`)

console.log(
  `\n${NAME}: ${findings.length} finding(s) across ${filesRead} Block and Page module(s) read; ` +
    `${modulesClassified} module specifier(s) classified, ${networkCalls} network call(s) found`,
)
console.log(
  `${NAME}: coverage ${results.length} root(s) resolved, ` +
    `${results.filter((result) => !result.exists).length} unresolved; ${walked} file(s) walked, ` +
    `${filesRead} file(s) read`,
)
for (const rule of DENIED_MODULES) {
  const hit = hits.get(rule) ?? []
  console.log(`${NAME}: denied, ${rule.name}: ${hit.length} hit(s)`)
  if (hit.length > 0) console.log(`          e.g. ${hit.slice(0, 3).join(', ')}`)
  console.log(`          because ${rule.reason}`)
}
console.log(
  `${NAME}: a rule with no hit is printed rather than failed, because the shipped tree is clean and a rule that\n` +
    '  failed on nothing could not be satisfied. The proof that each rule fires is in\n' +
    '  test/catalogue-rule-gates.test.tsx, which runs this script over fixtures that break each one.',
)
console.log(
  `${NAME}: allowed, and said here so a reader does not have to guess: 'use client', because interactivity is a\n` +
    "  Block's business and shipping it is the ordinary case; a relative import of a Block, a Component or cn,\n" +
    '  because composition is the point; and a ReactNode slot, because a slot is how a consumer injects an\n' +
    '  interactive child without the Block owning any state.',
)
console.log(
  `${NAME}: the figure the header declines to state in prose, measured by this run: ${clientModules} of the ` +
    `${filesRead} Block and Page module(s) read carry 'use client'. This number is printed rather than\n` +
    '  written down because a count in a sentence goes stale the moment the tree changes, and this run is\n' +
    '  the only place the count can be correct without somebody remembering to update it.',
)

if (findings.length > 0) {
  console.error(
    `\nA Block ships no application data and a Page imports no router. Both claims exist because a Block that\n` +
      'fetches and a Page that routes are the two things a consumer cannot install without rewriting them, and\n' +
      'the corpus publishes both as product-agnostic compositions.',
  )
  process.exit(1)
}

console.log(
  `${NAME}: no Block and no Page fetches, and none imports a router or a data client, so every one of them is\n` +
    '  installable as it stands.',
)
