/**
 * The old line cannot be reintroduced without the build failing.
 *
 * Five patterns, each bound to the surface it can legitimately appear on. A
 * pattern that ran on every surface would be a pattern that fired on a
 * dependency name in a changelog, so the surface is part of the rule rather
 * than a comment beside it:
 *
 *   1. package specifier   a vendor package name in a `package.json` dependency
 *                          block, and the same name REACHABLE from an importer
 *                          through the lockfile read as a graph;
 *   2. the bare export     a module specifier naming the old line's packages in
 *                          source, including the one export reachable with no
 *                          subpath at all (`from 'antd'`), which a pattern
 *                          anchored on `from 'antd/` misses;
 *   3. the namespaces      the `--prism-` custom-property namespace and the
 *                          `prism-<pack>-<mode>` ruleset class the old line
 *                          emitted;
 *   4. the artefacts       the paths the old line shipped (`antd-vars.css`,
 *                          `bake-antd-css.mjs`), checked on the text that
 *                          names them AND on whether a file exists there,
 *                          because a file that exists is stronger evidence than
 *                          a line that mentions it;
 *   5. the vendor name     `Ant Design` in prose, where a historical record may
 *                          say what the old line was and a living instruction
 *                          may not, because it instructs rather than records.
 *
 * Family 5 is discharged by a CLOSED allowlist keyed on convention rather than
 * on path: a `CHANGELOG.md`, a `MIGRATION.md`, anything under `docs/adr/`, and
 * any path carrying a `history` or `archive` segment. Every discharge is
 * printed on every run with the file, the line, the matched text and the
 * convention that excused it, because a rule that fires on nothing is
 * indistinguishable from a rule that found nothing to say.
 *
 * The lockfile is read as a dependency graph and never grepped. Two failures
 * make that non-negotiable. A base64 integrity hash contains characters a
 * package-specifier pattern admits, so a grep over `pnpm-lock.yaml` fires on a
 * hash of an unrelated package; and deleting a dependency line does not empty a
 * tree when another package still declares the package, so the answer is
 * reachability from the importers, not the presence of a string. The parser
 * below reads `importers:`, `packages:` and `snapshots:` and never reads the
 * value of a `resolution:`, which is where the hashes are.
 *
 * Coverage is asserted, not assumed, and the ROOTS list is a single declared
 * constant so the surface can be widened in one edit. A root that resolves to
 * nothing fails the run naming both causes; a run that reads no file fails the
 * run; and the final line states the files read, the roots resolved, the roots
 * unresolved, the files skipped as historical records and the finding count.
 *
 * Scope: this repository. The four sites that still carry the old line are
 * separate repositories and are not migrated yet, so a gate pointed at them
 * would be red on the day it landed and would be switched off within a week.
 * `--repo=` exists so the same file can be pointed at a sibling once that
 * sibling is migrated; ROOTS is what a sibling would widen.
 *
 * Run: node scripts/check-no-legacy-line.mjs [--repo=<dir>]
 */
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  assertFilesRead,
  assertRootsResolve,
  coverageOf,
  relativePosix,
  walkRoots,
} from './lib/walk.mjs'

const NAME = 'check-no-legacy-line'
const HERE = path.dirname(fileURLToPath(import.meta.url))

/** The repository under test. `--repo=` wins; otherwise this file's own parent. */
const REPO_ROOT = path.resolve(repoArgument(process.argv.slice(2)) ?? path.join(HERE, '..'))

/**
 * Every surface the gate reads, in one place.
 *
 * Six manifests and the lockfile are the dependency surfaces (family 1), the
 * package source trees are the specifier and namespace surfaces (families 2 and
 * 3), every root document and the repository configuration are the artefact and
 * prose surfaces (families 4 and 5). Widening this list is the only edit a
 * sibling repository needs.
 */
const ROOTS = [
  // the workspace manifests
  'package.json',
  'apps/site/package.json',
  'packages/tokens/package.json',
  'packages/ui/package.json',
  'packages/llms/package.json',
  'packages/mcp-server/package.json',
  // the lockfile, read as a graph
  'pnpm-lock.yaml',
  // the repository configuration
  'pnpm-workspace.yaml',
  'turbo.json',
  '.gitignore',
  // the root documents
  'README.md',
  'DESIGN.md',
  'PRODUCT.md',
  'CONTEXT.md',
  'AGENTS.md',
  'CONTRIBUTING.md',
  'MIGRATION.md',
  'THIRD-PARTY-NOTICES.md',
  // the published package documents
  'packages/tokens/CHANGELOG.md',
  'packages/tokens/README.md',
  'packages/ui/CHANGELOG.md',
  'packages/ui/README.md',
  'packages/llms/CHANGELOG.md',
  'packages/llms/README.md',
  'packages/mcp-server/CHANGELOG.md',
  'packages/mcp-server/README.md',
  // the site
  'apps/site/src',
  'apps/site/content',
  'apps/site/items',
  'apps/site/scripts',
  'apps/site/test',
  'apps/site/e2e',
  'apps/site/worker',
  // the library packages
  'packages/tokens/src',
  'packages/tokens/build',
  'packages/tokens/scripts',
  'packages/tokens/test',
  'packages/ui/src',
  'packages/ui/scripts',
  'packages/ui/test',
  'packages/ui/public',
  'packages/llms/src',
  'packages/llms/scripts',
  'packages/llms/test',
  'packages/mcp-server/src',
  'packages/mcp-server/scripts',
  'packages/mcp-server/test',
  // the repository's own scripts, the agent surface and CI
  'scripts',
  'docs',
  '.github',
  '.changeset',
]

/**
 * Roots that are read when they exist and are not a failure when they do not.
 *
 * A required root that is absent fails the run, which is right for a source tree
 * and wrong for a build output. The per-package `THIRD-PARTY-NOTICES.md` files
 * are gitignored and written by `stage-package-files.mjs` at `prepack`, so they
 * exist in a developer's tree after a publish rehearsal and do not exist in a
 * clean checkout or in CI. Listing them as required made the gate pass locally
 * and fail in CI, which is the coverage-is-assumed failure in its purest form: the
 * run had read a file the reader could not reproduce.
 *
 * They stay listed because they are a surface worth reading when present. A
 * notices file is generated from what is actually installed, so a vendor named
 * there means a dependency really is present, and a finding in a file that
 * happens to be absent must not be the reason a run is trusted less.
 *
 * Every optional root and whether it resolved prints on every run, because a root
 * that silently reads nothing is a root whose coverage nobody can state.
 */
const OPTIONAL_ROOTS = [
  'packages/tokens/THIRD-PARTY-NOTICES.md',
  'packages/ui/THIRD-PARTY-NOTICES.md',
  'packages/llms/THIRD-PARTY-NOTICES.md',
  'packages/mcp-server/THIRD-PARTY-NOTICES.md',
]

/**
 * `.gitignore` has no extension, so it is named in the filter rather than
 * dropped: a `.gitignore` line naming an old artefact is one of the ways the
 * old line is still wired in.
 */
const EXT = /\.(tsx?|jsx?|mjs|css|json|jsonc|md|mdx|ya?ml)$|\.gitignore$/

/** The lockfile is a graph input. Text-scanning it is the failure this avoids. */
const LOCKFILE = 'pnpm-lock.yaml'

/**
 * Absolute, because a relative comparison depends on the working directory and
 * a gate that stops excluding itself is a gate nobody notices failing. The
 * gate's own rule table, its own test and its own fixture cases all spell the
 * vendor name, so all three are excluded from the text rules and all three are
 * printed on every run.
 */
const SELF_EXCLUDED = [
  path.join(REPO_ROOT, 'scripts', 'check-no-legacy-line.mjs'),
  path.join(REPO_ROOT, 'scripts', '__tests__', 'no-legacy-line.test.mjs'),
  path.join(REPO_ROOT, 'scripts', 'fixtures', 'no-legacy-line'),
]

// ---------------------------------------------------------------- the vendor

/** The old line was built on Ant Design. */
const VENDOR_PROSE = 'Ant Design'

/**
 * A package name is matched, never a substring of one. `antd` is the root
 * package, `@ant-design/*` the scope it publishes under. Anchoring is what
 * makes the lockfile argument work at all: a hash that happens to spell `antd`
 * is never a package name, because the parser only ever reads a name from a
 * mapping key.
 */
const isVendorPackage = (name) => name === 'antd' || name.startsWith('@ant-design/')

// ------------------------------------------------- family 1, the dependency

/**
 * The `package.json` blocks that declare a dependency. `overrides` and
 * `resolutions` are here because they are where the old line would be pinned
 * back without any importer depending on it.
 */
const DEPENDENCY_BLOCKS = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies',
  'overrides',
  'resolutions',
  'pnpm.overrides',
  'pnpm.resolutions',
]

/** The `scripts` and `test` trees of this gate must not lint as loose JSON. */
function parseManifest(text, file, findings) {
  let pkg
  try {
    pkg = JSON.parse(text)
  } catch (cause) {
    findings.push({
      family: 'manifest-unreadable',
      file,
      line: 0,
      text: cause.message,
      message: `this manifest is not valid JSON, so its dependency blocks were not read: ${cause.message}`,
    })
    return null
  }
  return pkg
}

const at = (object, dotted) =>
  dotted.split('.').reduce((value, key) => (value == null ? undefined : value[key]), object)

/** A dependency key naming the old line, in any block that declares one. */
function vendorDependenciesIn(pkg) {
  const found = []
  for (const block of DEPENDENCY_BLOCKS) {
    const declared = at(pkg, block)
    if (!declared || typeof declared !== 'object') continue
    for (const name of Object.keys(declared)) {
      if (isVendorPackage(name)) found.push({ block, name })
    }
  }
  return found
}

// ------------------------------------- family 1, reachability in the lockfile

/**
 * Split a `name@version(peer@1)(peer2@2)` key at the `@` that is outside every
 * parenthesised peer suffix. `lastIndexOf` does not work: the peer suffixes are
 * full of `@`, and `@babel/core@8.0.6(supports-color@10.2.2)` has its last `@`
 * inside a suffix.
 */
function splitPackageKey(key) {
  let depth = 0
  for (let i = 1; i < key.length; i += 1) {
    const char = key[i]
    if (char === '(') depth += 1
    else if (char === ')') depth -= 1
    else if (char === '@' && depth === 0) return [key.slice(0, i), key.slice(i + 1)]
  }
  return [key, '']
}

/**
 * Trim, THEN strip the quotes a YAML writer adds. The order matters: pnpm
 * quotes every scoped key (`'@ant-design/nextjs-registry@1.0.2':`) and the line
 * carries a leading indent, so a strip-then-trim unquote leaves the quotes on
 * and a scoped package is read as a name that begins with an apostrophe, which
 * no rule can match. Trimming first is what makes the scoped half of the
 * vendor's namespace reachable at all.
 */
const unquote = (value) => value.trim().replace(/^'(.*)'$/, '$1').trim()

/** The indentation a line is written at, which is how the sections are found. */
const indentOf = (line) => line.length - line.trimStart().length

/**
 * Parse the lockfile into the three things reachability needs, and into nothing
 * else. The `packages:` section is read for its KEYS only: the `resolution:`
 * value on the following line is where the base64 integrity hashes are, and
 * reading it is precisely the grep this module exists to refuse to do.
 */
export function parseLockfile(text) {
  const importers = new Map()
  const snapshots = new Map()
  const declared = new Set()

  let section = null
  let importer = null
  let snapshot = null
  let depBlock = null
  let pending = null

  // Normalise the line ending FIRST. A CRLF checkout leaves a `\r` on the end
  // of every line, and `line.replace(/:.*/, '')` then yields `importers\r`
  // rather than `importers`, so no section ever matches and the whole graph
  // comes back empty. An empty graph finds nothing and reports a clean pass, so
  // this is the difference between a gate and a gate that is switched off.
  for (const line of text.replace(/\r\n/g, '\n').split('\n')) {
    if (line.trim() === '') continue
    const indent = indentOf(line)

    if (indent === 0) {
      section = line.replace(/:.*/, '')
      importer = null
      snapshot = null
      depBlock = null
      pending = null
      continue
    }

    if (section === 'importers') {
      if (indent === 2) {
        importer = unquote(line.trim().replace(/:$/, ''))
        importers.set(importer, new Map())
      } else if (indent === 4) {
        depBlock = line.trim().replace(/:$/, '')
      } else if (indent === 6) {
        pending = unquote(line.trim().replace(/:$/, ''))
      } else if (indent === 8) {
        // The resolved `version:` is the seed of the walk. A `link:` version is a
        // workspace edge and has no snapshot, so it seeds nothing: the linked
        // package is itself an importer and is walked from there.
        if (!line.trim().startsWith('version:') || pending == null) continue
        const version = unquote(line.trim().slice('version:'.length))
        if (version.startsWith('link:')) continue
        importers.get(importer).set(`${depBlock ?? 'dependencies'}/${pending}`, `${pending}@${version}`)
      }
      continue
    }

    if (section === 'packages') {
      if (indent === 2) declared.add(unquote(line.trim().replace(/:(\s*\{\})?$/, '')))
      continue
    }

    if (section === 'snapshots') {
      if (indent === 2) {
        snapshot = unquote(line.trim().replace(/:(\s*\{\})?$/, ''))
        if (!snapshots.has(snapshot)) snapshots.set(snapshot, new Map())
      } else if (indent === 4) {
        depBlock = line.trim().replace(/:$/, '')
      } else if (indent === 6) {
        const colon = line.indexOf(':')
        const name = unquote(line.slice(0, colon))
        const version = unquote(line.slice(colon + 1))
        snapshots.get(snapshot).set(`${depBlock ?? 'dependencies'}/${name}`, `${name}@${version}`)
      }
    }
  }

  return { importers, snapshots, declared }
}

/**
 * Every vendor package reachable from an importer, with the chain that reaches
 * it. The walk starts at every importer's direct dependencies and follows
 * `snapshots:` edges, so a vendor package is found however deep it sits and
 * however few manifests mention it. Deleting a dependency line from one
 * manifest does not empty the answer while another importer still reaches it.
 */
export function reachableVendors(lock) {
  const found = new Map()
  for (const [importer, direct] of lock.importers) {
    // The frontier holds nodes, and a node's parent is the NODE it was reached
    // from rather than its key, so the chain is rebuilt by walking parent
    // references instead of by looking a key up in a map and re-splitting it.
    const queue = [...direct.values()].map((key) => ({ key, parent: null }))
    const seen = new Set()

    while (queue.length > 0) {
      const node = queue.shift()
      if (seen.has(node.key)) continue
      seen.add(node.key)

      const [name] = splitPackageKey(node.key)
      if (isVendorPackage(name) && !found.has(name)) {
        const chain = [name]
        for (let cursor = node.parent; cursor; cursor = cursor.parent) {
          chain.unshift(splitPackageKey(cursor.key)[0])
        }
        found.set(name, { importer, chain: [importer, ...chain] })
      }

      for (const target of lock.snapshots.get(node.key)?.values() ?? []) {
        queue.push({ key: target, parent: node })
      }
    }
  }
  return found
}

// --------------------------------------------------------- family 2, sources

/**
 * A module specifier naming the old line, in any of the positions a specifier
 * can take: a named or bare `import`, a re-`export`, a dynamic `import()` and a
 * CommonJS `require`. The bare root is the case a pattern anchored on a
 * subpath misses, and the subpaths and the scope are the same rule.
 */
const MODULE_SPECIFIER =
  /(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+|\brequire\s*\(\s*)['"](?:antd(?:\/[^'"]*)?|@ant-design\/[^'"]*)['"]/

// ------------------------------------------------------ family 3, namespaces

/**
 * The old line's two namespaces, and the evidence that scoping them to a
 * narrower surface is unnecessary: the current tree contains NO `--prism-`
 * custom property and NO `prism-<pack>-<mode>` ruleset class anywhere, because
 * the new line emits unprefixed token properties (`--background`,
 * `--primary`, `--radius-lg`) and selects a pack and a mode with
 * `[data-pack="blush"]` and `.dark`. The rules are therefore global over the
 * text surfaces, which is only safe because that was measured, not assumed.
 */
const CUSTOM_PROPERTY = /--prism-[a-z0-9-]*/
const RULESET_CLASS = /\bprism-[a-z0-9]+(?:-[a-z0-9]+)*-(?:light|dark)\b/

// -------------------------------------------------------- family 4, artefacts

/** The files the old line shipped. */
const ARTEFACTS = ['antd-vars.css', 'bake-antd-css.mjs']

/**
 * Where the old line put them, checked for existence. The text rules catch a
 * `.gitignore` line that names one; this catches the file itself, including a
 * file the extension filter would not have read.
 */
const ARTEFACT_LOCATIONS = [
  'app/antd-vars.css',
  'apps/site/app/antd-vars.css',
  'apps/site/src/app/antd-vars.css',
  'apps/site/src/styles/antd-vars.css',
  'packages/ui/app/antd-vars.css',
  'scripts/bake-antd-css.mjs',
  'apps/site/scripts/bake-antd-css.mjs',
  'packages/ui/scripts/bake-antd-css.mjs',
]

// ------------------------------------------------- family 5, prose, allowlist

/**
 * The vendor's name in prose, in its three spellings. `\bantd\b` is the one
 * that matters: it is the spelling a living instruction would use.
 */
const VENDOR_PROSE_PATTERNS = [/\bant[\s-]design\b/i, /\bantd\b/, /@ant-design\//]

/**
 * A CLOSED allowlist of historical-record conventions. Keyed on the convention
 * a path follows rather than on the paths that happen to follow it today, so a
 * new `CHANGELOG.md` or a new `docs/adr/` file is discharged without an edit
 * and a new document type is not.
 *
 * Deliberately absent: `THIRD-PARTY-NOTICES.md`. A notices file is generated
 * from what is actually installed, so a vendor named there means a dependency
 * really is installed, which is a finding and not a record.
 */
const HISTORICAL_RECORD_CONVENTIONS = [
  {
    id: 'changelog',
    why: 'a changelog records what a release shipped, including what it stopped shipping',
    test: (file) => path.posix.basename(file) === 'CHANGELOG.md',
  },
  {
    id: 'migration-note',
    why: 'a migration note records the old-to-new mapping, so it must name the old line to do its job',
    test: (file) => path.posix.basename(file) === 'MIGRATION.md',
  },
  {
    id: 'architecture-decision',
    why: 'a decision record states the option taken and the option rejected, which is the old line by name',
    test: (file) => file === 'docs/adr' || file.startsWith('docs/adr/'),
  },
  {
    id: 'history-segment',
    why: 'a `history` segment is the repository convention for filed records',
    test: (file) => file.split('/').includes('history'),
  },
  {
    id: 'archive-segment',
    why: 'an `archive` segment is the repository convention for filed records',
    test: (file) => file.split('/').includes('archive'),
  },
]

/** The first convention a path follows, or null. Order is the printed order. */
const historicalRecordFor = (file) =>
  HISTORICAL_RECORD_CONVENTIONS.find((convention) => convention.test(file)) ?? null

// ------------------------------------------------------------------- running

function repoArgument(args) {
  const flag = args.find((argument) => argument.startsWith('--repo='))
  return flag ? flag.slice('--repo='.length) : null
}

const isSelf = (file) =>
  SELF_EXCLUDED.some((excluded) => file === excluded || file.startsWith(`${excluded}${path.sep}`))

/** A NUL byte is the cheapest binary test, and a binary is not prose. */
const isBinary = (text) => text.includes('\u0000')

const findings = []
const discharges = []
const historicalFiles = new Set()
let filesRead = 0
let binarySkipped = 0

const results = walkRoots(REPO_ROOT, ROOTS, { extensions: EXT })

try {
  assertRootsResolve(results, { scriptName: NAME })
  assertFilesRead(results, { scriptName: NAME, extensions: EXT })
} catch (failure) {
  console.error(`\n${failure.message}`)
  process.exit(1)
}

/*
 * Optional roots are walked after the required ones have already proved the run
 * read something, so an optional root that is absent cannot be the reason a run
 * passed over nothing. A manifest dependency and a lockfile edge are checked
 * separately and do not depend on any of these roots resolving. A root that
 * resolved is scanned exactly like a required one.
 */
const optionalResults = walkRoots(REPO_ROOT, OPTIONAL_ROOTS, { extensions: EXT })
const optionalResolved = optionalResults.filter((result) => result.exists)
/*
 * Keyed on the walker's `relative`, not its `root`. `root` is absolute and
 * platform-separated while the declared list is repository-relative and
 * forward-slashed, so comparing them matched nothing and every optional root
 * reported itself read whether or not it existed. A status line that cannot
 * report absence is the coverage claim this gate exists to make, so the test
 * below drives a tree where the files are genuinely missing.
 */
const optionalUnresolved = optionalResults.filter((r) => !r.exists).map((r) => r.relative)
const scanned = [...results, ...optionalResolved]

for (const result of scanned) {
  for (const full of result.files) {
    if (isSelf(full)) continue

    const file = relativePosix(REPO_ROOT, full)
    const text = readFileSync(full, 'utf8')
    filesRead += 1

    if (isBinary(text)) {
      binarySkipped += 1
      continue
    }

    // Family 1. The manifest is parsed, not grepped, so a dependency key is the
    // only thing this can match and a base64 hash in a neighbouring field
    // cannot.
    if (path.posix.basename(file) === 'package.json') {
      const pkg = parseManifest(text, file, findings)
      for (const { block, name } of vendorDependenciesIn(pkg ?? {})) {
        findings.push({
          family: 'manifest-dependency',
          file,
          line: 0,
          text: name,
          message: `\`${block}\` declares \`${name}\`; the old line is not a dependency of this repository`,
        })
      }
    }

    // Family 1. The lockfile is a graph, read once, and never text-scanned.
    if (file === LOCKFILE) {
      const lock = parseLockfile(text)
      for (const [name, { importer, chain }] of reachableVendors(lock)) {
        findings.push({
          family: 'lockfile-reachability',
          file,
          line: 0,
          text: name,
          message: `\`${name}\` is reachable from importer \`${importer}\`: ${chain.join(' -> ')}`,
        })
      }
      continue
    }

    const convention = historicalRecordFor(file)
    const lines = text.split('\n')

    lines.forEach((line, index) => {
      const at0 = index + 1
      const report = (family, match, message) => {
        const record = { family, file, line: at0, text: line.trim(), match, message }
        if (convention) {
          historicalFiles.add(file)
          discharges.push({ ...record, convention })
          return
        }
        findings.push(record)
      }

      // Family 2.
      const specifier = line.match(MODULE_SPECIFIER)
      if (specifier) {
        report(
          'module-specifier',
          specifier[0],
          "a module specifier naming the old line's package; a consumer installs `@nanisoft/prism-ui`",
        )
      }

      // Family 3.
      const property = line.match(CUSTOM_PROPERTY)
      if (property) {
        report(
          'custom-property',
          property[0],
          "the old line's custom-property namespace; the current contract is unprefixed (`--background`)",
        )
      }
      const ruleset = line.match(RULESET_CLASS)
      if (ruleset) {
        report(
          'ruleset-class',
          ruleset[0],
          "the old line's ruleset class; a pack and a mode are `[data-pack]` and `.dark` today",
        )
      }

      // Family 4, by text. This is what a `.gitignore` line naming an artefact
      // is.
      for (const artefact of ARTEFACTS) {
        if (line.includes(artefact)) {
          report(
            'artefact-path-name',
            artefact,
            `a line naming the old line's artefact \`${artefact}\``,
          )
        }
      }

      // Family 5. Prose only: a module specifier in a code comment is family 2
      // and a namespace in a stylesheet is family 3, so this runs on the
      // documents and on nothing else.
      if (/\.(md|mdx)$/.test(file)) {
        for (const pattern of VENDOR_PROSE_PATTERNS) {
          const prose = line.match(pattern)
          if (prose) {
            report(
              'vendor-name',
              prose[0],
              `prose names ${VENDOR_PROSE}; a living instruction does not name the old line, a historical record may`,
            )
          }
        }
      }
    })
  }
}

// Family 4, by existence. A file that is there is stronger evidence than a line
// that mentions it, so this runs over paths rather than over content and is not
// discharged by the historical-record allowlist: a record says a file used to
// exist, it cannot make it exist again.
for (const location of ARTEFACT_LOCATIONS) {
  if (!existsSync(path.join(REPO_ROOT, location))) continue
  findings.push({
    family: 'artefact-path-exists',
    file: location,
    line: 0,
    text: path.posix.basename(location),
    message: `the old line's artefact exists at \`${location}\``,
  })
}

const coverage = coverageOf(results)

for (const finding of findings) {
  console.error(`  ${finding.file}:${finding.line}  [${finding.family}]  ${finding.message}`)
  if (finding.line > 0 && finding.text) console.error(`      ${finding.text}`)
}

for (const discharge of discharges) {
  console.log(
    `  ${discharge.file}:${discharge.line}  [${discharge.family}]  DISCHARGED by convention \`${discharge.convention.id}\``,
  )
  console.log(`      ${discharge.text}`)
  console.log(`      matched ${discharge.match}, excused because ${discharge.convention.why}`)
}

console.log(
  `\n${NAME}: ${findings.length} finding(s) in ${filesRead} file(s) read across ` +
    `${coverage.roots} root(s) (${coverage.unresolved} unresolved), ` +
    `${historicalFiles.size} file(s) skipped as historical record(s), ` +
    `${discharges.length} discharge(s)` +
    (binarySkipped > 0 ? `, ${binarySkipped} binary file(s) skipped` : ''),
)
console.log(`${NAME}: read as a graph, never grepped: ${LOCKFILE}`)
console.log(
  `${NAME}: excluded from the text rules: ${SELF_EXCLUDED.map((file) => relativePosix(REPO_ROOT, file)).join(', ')}`,
)
console.log(
  `${NAME}: optional root(s), read when present and not a failure when absent: ` +
    OPTIONAL_ROOTS.map((root) => {
      const resolved = optionalUnresolved.includes(root) ? 'absent' : 'read'
      return `${root} (${resolved})`
    }).join(', '),
)

if (findings.length > 0) {
  console.error(
    `\nThe old line is not coming back. Consume \`@nanisoft/prism-ui\`, the unprefixed token ` +
      `properties, and \`[data-pack]\` with \`.dark\`. A document that needs to say what the old ` +
      `line was belongs in one of the historical-record conventions, which are printed above.`,
  )
  process.exit(1)
}
