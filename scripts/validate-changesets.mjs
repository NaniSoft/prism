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
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const CHANGESET_DIR = path.join(ROOT, '.changeset')
const BUMPS = new Set(['major', 'minor', 'patch'])

/** Every workspace package name, so a changeset cannot name a package that does not exist. */
function workspacePackageNames() {
  const names = new Set()
  const read = (dir) => {
    const file = path.join(dir, 'package.json')
    if (!existsSync(file)) return
    const pkg = JSON.parse(readFileSync(file, 'utf8'))
    if (pkg.name) names.add(pkg.name)
  }

  read(ROOT)
  for (const group of ['packages', 'apps']) {
    const base = path.join(ROOT, group)
    if (!existsSync(base)) continue
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

const files = existsSync(CHANGESET_DIR)
  ? readdirSync(CHANGESET_DIR).filter((name) => name.endsWith('.md') && name !== 'README.md')
  : []

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
  console.error(`\nchangesets: ${errors.length} violation(s)`)
  process.exit(1)
}

console.log(
  files.length === 0
    ? 'changesets: no changesets found'
    : `changesets: ${files.length} valid (${files.join(', ')})`,
)
