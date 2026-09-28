/**
 * The Prism changeset validator.
 *
 * Enforces the four adopted conventions from ticket 16 section 6 and
 * `CONTRIBUTING.md`. The rules are deliberately the small set that protects a
 * changelog a reader can parse, not the full plasma set. The dropped rules
 * (title must not be a markdown heading, title must not start with a list
 * marker, bodies must not use markdown lists, headings must start at h1) reject
 * ordinary careful writing and get worked around.
 *
 * Run: pnpm changeset:validate
 *
 * Where the empty result used to hide, decided from the code rather than from
 * the ticket's description of it. This gate prints the neutral
 * `no changesets found` and exits 0 when `.changeset/` holds no changesets, so
 * the positive false claim was not in that line. The claim that was false was
 * the run itself, and it was made in two places:
 *
 *   1. `ROOT` was `process.cwd()`, so the validator run from any directory
 *      other than the repository root read no changesets and no workspace
 *      manifest and printed the same line a clean run prints;
 *   2. `existsSync(CHANGESET_DIR) ? readdirSync(...) : []` made a MISSING
 *      `.changeset/` directory indistinguishable from an empty one, so a
 *      validator pointed at a tree that is not this repository reported
 *      "nothing to do" on the release path.
 *
 * Both are gone: the roots are resolved from this file's own location, a root
 * that does not resolve fails with both causes named, and the final line states
 * what was read. This gate guards the release path (the Gates composite action
 * runs it in `ci.yml` and in `publish.yml`), which is why a run that read
 * nothing was worth this much.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { assertRootsResolve, resolveRoot } from './lib/walk.mjs'

const NAME = 'changesets'
const HERE = path.dirname(fileURLToPath(import.meta.url))

/** The repository root, from this file's own location. Never `process.cwd()`. */
const ROOT = path.resolve(HERE, '..')
const CHANGESET_DIR = resolveRoot(ROOT, '.changeset')
const BUMPS = new Set(['major', 'minor', 'patch'])

/** The workspace groups whose members this validator holds names for. */
const GROUPS = ['packages', 'apps']

/**
 * Every configured root, resolved once. A root that does not resolve is a
 * failure rather than an empty result, so a missing `.changeset/` cannot be
 * reported as a repository with nothing to release.
 */
const ROOT_RESULTS = ['.changeset', ...GROUPS].map((relative) => {
  const absolute = resolveRoot(ROOT, relative)
  return { relative, absolute, files: [], exists: existsSync(absolute) }
})

// Coverage first: a root that does not resolve stops the run before it reads
// anything, so the failure cannot be reported as a clean empty result.
try {
  assertRootsResolve(ROOT_RESULTS, {
    scriptName: NAME,
    hint: "run this repository's validator, from the repository root or via `pnpm changeset:validate`",
  })
} catch (failure) {
  console.error(`\n${failure.message}`)
  process.exit(1)
}

let manifests = 0

/** Every workspace package name, so a changeset cannot name a package that does not exist. */
function workspacePackageNames() {
  const names = new Set()
  const read = (dir) => {
    const file = path.join(dir, 'package.json')
    if (!existsSync(file)) return
    const pkg = JSON.parse(readFileSync(file, 'utf8'))
    if (pkg.name) {
      names.add(pkg.name)
      manifests += 1
    }
  }

  read(ROOT)
  for (const group of GROUPS) {
    const base = resolveRoot(ROOT, group)
    for (const entry of readdirSync(base, { withFileTypes: true })) {
      if (entry.isDirectory()) read(path.join(base, entry.name))
    }
  }
  return names
}

/** The frontmatter is a flat map of package name to bump; anything else is malformed. */
function parseFrontmatter(text) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text)
  if (!match) return { error: 'missing frontmatter' }

  const releases = []
  for (const raw of match[1].split(/\r?\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const parsed = /^['"]?([^'":]+?)['"]?\s*:\s*(\S+)$/.exec(line)
    if (!parsed) return { error: `frontmatter is not a package-to-bump map: ${line}` }
    releases.push({ name: parsed[1].trim(), type: parsed[2].trim() })
  }
  if (releases.length === 0) return { error: 'frontmatter declares no releases' }
  return { releases, rest: text.slice(match[0].length) }
}

/** The title is the first non-empty line that is not an HTML comment. */
function splitSummary(rest) {
  const lines = rest.split(/\r?\n/)
  const index = lines.findIndex((line) => line.trim() && !line.trim().startsWith('<!--'))
  if (index === -1) return { title: '', body: '' }
  const title = lines[index].trim()
  const body = lines
    .slice(index + 1)
    .join('\n')
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim()
  return { title, body }
}

const files = readdirSync(CHANGESET_DIR).filter(
  (name) => name.endsWith('.md') && name !== 'README.md',
)

const names = workspacePackageNames()
const errors = []

for (const name of files.sort()) {
  const relative = path.join('.changeset', name)
  const text = readFileSync(path.join(CHANGESET_DIR, name), 'utf8')
  const front = parseFrontmatter(text)
  if (front.error) {
    errors.push({ relative, message: front.error })
    continue
  }

  for (const release of front.releases) {
    if (!names.has(release.name)) {
      errors.push({ relative, message: `unknown workspace package: ${release.name}` })
    }
    if (!BUMPS.has(release.type)) {
      errors.push({ relative, message: `invalid bump for ${release.name}: ${release.type}` })
    }
  }

  const { title, body } = splitSummary(front.rest)
  if (!title) {
    errors.push({ relative, message: 'missing a title' })
  } else {
    if (title.length > 100) {
      errors.push({ relative, message: `title is ${title.length} characters (maximum 100)` })
    }
    if (title.endsWith('.')) {
      errors.push({ relative, message: 'title must not end with a period' })
    }
    if (title.startsWith('**BREAKING:**')) {
      errors.push({ relative, message: 'title must not start with **BREAKING:**' })
    }
  }

  const hasMajor = front.releases.some((release) => release.type === 'major')
  const hasMinor = front.releases.some((release) => release.type === 'minor')
  if (hasMajor) {
    if (!body) {
      errors.push({ relative, message: 'a major requires a body' })
    } else if (!/^#{1,6}\s+Migration\b/m.test(body)) {
      errors.push({ relative, message: 'a major requires a # Migration section' })
    }
  } else if (hasMinor && !body) {
    errors.push({ relative, message: 'a minor requires a body' })
  }
}

if (errors.length > 0) {
  for (const error of errors) {
    console.error(`  ${error.relative}: ${error.message}`)
  }
  console.error(`\nchangesets: ${errors.length} violation(s) in ${files.length} changeset(s)`)
  process.exit(1)
}

/**
 * Zero changesets is a legitimate state, so it does not fail. What must not
 * happen is a run that validated nothing printing a line a reader takes for a
 * validated result, so the empty case says what it did and did not read, and
 * the covered case says the same.
 */
const coverage = `${files.length} changeset(s) and ${manifests} workspace manifest(s) from ` +
  `${ROOT_RESULTS.length} resolved root(s), 0 unresolved`

console.log(
  files.length === 0
    ? `changesets: none found, so nothing was validated; read ${coverage}`
    : `changesets: ${files.length} valid (${files.join(', ')}); read ${coverage}`,
)
