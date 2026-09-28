/**
 * The published packages, and the route each one's changelog is published at.
 *
 * Three consumers read it, and that is the whole reason it is one module:
 *
 *   - `apps/site/scripts/copy-changelogs.mjs`, which copies each published
 *     package's own `CHANGELOG.md` to the route this module names;
 *   - `apps/site/scripts/check-content-joins.mjs`, which asserts the join the
 *     reference design system has no gate for: a published package holding a
 *     changelog and no route is a finding, and a route whose bytes are not the
 *     package's bytes is a second finding;
 *   - `packages/llms/scripts/build.mjs`, which projects the same files into the
 *     Store as `changelogs`, the field the ninth read-only tool answers from.
 *
 * The corpus package reaches across for this exactly as it reaches across for
 * `item-content.mjs`: the rule is about the site's content tree, so it lives
 * beside the site's other content rules rather than being restated per consumer,
 * where two of the three would eventually disagree about what a package is or
 * what a route is.
 *
 * **Discovery is the workspace, not a list.** The package globs come out of
 * `pnpm-workspace.yaml` and the published set out of each package's own
 * `private` field, so publishing a package is a change to that package and
 * nothing else. A hand-kept array would make "one route per published package"
 * true only for the packages someone remembered, and a new package would ship
 * with no route and a green build, which is the omission this ticket exists to
 * close.
 *
 * **The route is the unscoped package name.** `@nanisoft/prism-ui` publishes at
 * `/changelogs/prism-ui`. The scope is one string for every package in this
 * workspace, so carrying it in forty route names would be a way for the two to
 * disagree. A name that is not a safe route segment throws rather than producing
 * a route that needs quoting, because a route nobody can type is not a route.
 *
 * **The text is bytes.** `readPublishedChangelogs()` reads each file as UTF-8
 * text only so a caller can compare and slice it; the copy step writes the
 * buffer it read, so the published file is the package's file rather than a
 * re-serialisation of it. That is what makes the site's text and the bytes in
 * the npm tarball the same bytes, which is the entire reason the changelog is
 * rendered from the generated file rather than maintained beside it.
 */
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'

/** The top-level content Section the changelogs are published under. */
export const CHANGELOG_SECTION = 'changelogs'

/** The file a published package's changelog is copied to, and read back from. */
const CHANGELOG_FILE = 'CHANGELOG.md'
const PUBLISHED_EXTENSION = '.md'

/**
 * The workspace package globs, read out of `pnpm-workspace.yaml`.
 *
 * The globs are read rather than restated because they are a fact about the
 * workspace that already exists in one file, and a second copy of it is a list
 * that drifts. Only the one-level `dir/*` form is supported, and anything else
 * throws: a glob this reader silently skipped would drop every package under it
 * out of the published set, which is the failure by omission the whole module
 * is written against.
 */
async function readWorkspaceGlobs(repoRoot) {
  const file = path.join(repoRoot, 'pnpm-workspace.yaml')
  let text
  try {
    text = await readFile(file, 'utf8')
  } catch (cause) {
    throw new Error(`published-packages: cannot read ${file}, so no package is published here`, {
      cause,
    })
  }
  const globs = []
  let inPackages = false
  for (const line of text.split(/\r?\n/)) {
    if (/^packages:\s*$/.test(line)) {
      inPackages = true
      continue
    }
    if (inPackages && /^\S/.test(line)) inPackages = false
    if (!inPackages) continue
    const match = /^\s+-\s+['"]?([^'"]+?)['"]?\s*$/.exec(line)
    if (match) globs.push(match[1])
  }
  if (globs.length === 0) {
    throw new Error(`published-packages: ${file} declares no package globs, so no package is published`)
  }
  return globs
}

/** The directories one workspace glob names, name sorted and free of duplicates. */
async function directoriesFor(repoRoot, glob) {
  const match = /^([^/]+)\/\*$/.exec(glob)
  if (match === null) {
    throw new Error(
      `published-packages: the workspace glob '${glob}' is not the one-level 'dir/*' form this ` +
        'reader supports. Widening this reader is the fix; ignoring the glob would drop every ' +
        'package under it from the published set.',
    )
  }
  const parent = path.join(repoRoot, match[1])
  // A glob whose directory is not there throws rather than yielding nothing. An
  // empty result is indistinguishable from a workspace with no packages, and
  // that is the one answer here that must never be invented.
  const entries = await readdir(parent, { withFileTypes: true }).catch((cause) => {
    throw new Error(
      `published-packages: the workspace glob '${glob}' names ${parent}, which cannot be read, so ` +
        'nothing under it can be known to be published',
      { cause },
    )
  })
  const names = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name)
  return [...new Set(names)].sort().map((name) => path.join(parent, name))
}

/**
 * The route segment a published package's changelog is published at: its name
 * without the scope.
 *
 * @param {string} name the published npm name
 * @returns {string}
 */
export function changelogSlug(name) {
  const slug = name.startsWith('@') ? (name.split('/')[1] ?? '') : name
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error(
      `published-packages: the package name '${name}' yields the route segment '${slug}', which is ` +
        'not a lowercase hyphenated segment. A route nobody can type is not a route, so the ' +
        'changelog rule refuses the name rather than quoting it.',
    )
  }
  return slug
}

/** The route a published package's changelog is addressed by. */
export function changelogRoute(name) {
  return `/${CHANGELOG_SECTION}/${changelogSlug(name)}`
}

/** The content-relative file a published package's changelog is copied to. */
export function changelogFile(name) {
  return `${CHANGELOG_SECTION}/${changelogSlug(name)}${PUBLISHED_EXTENSION}`
}

/**
 * @typedef {object} PublishedPackage
 * @property {string} name the published npm name
 * @property {string} directory the repository-relative directory it lives in
 * @property {string} version the version its own `package.json` declares
 * @property {string} changelog the repository-relative `CHANGELOG.md`, or '' when it has none
 * @property {string} slug the route segment its changelog is published at
 * @property {string} route the route its changelog is addressed by
 * @property {string} text the changelog's text, '' when the package has none
 */

/**
 * Every published package in the workspace, with the route its changelog belongs
 * at, name sorted so every consumer sees the same order.
 *
 * A package is published when its own `package.json` does not say `private`. The
 * site is private and therefore absent, which is the right answer: it is not on
 * npm, so it has no tarball whose bytes a reader could be shown instead.
 *
 * @param {string} repoRoot
 * @returns {Promise<PublishedPackage[]>}
 */
export async function discoverPublishedPackages(repoRoot) {
  const found = []
  const seen = new Set()
  for (const glob of await readWorkspaceGlobs(repoRoot)) {
    for (const directory of await directoriesFor(repoRoot, glob)) {
      const manifestFile = path.join(directory, 'package.json')
      let manifest
      try {
        manifest = JSON.parse(await readFile(manifestFile, 'utf8'))
      } catch (cause) {
        // A directory under a workspace glob with no `package.json` is not a
        // package, and pnpm treats it the same way, so that case is skipped. A
        // manifest that is there and cannot be read is not that: it is a
        // package that has just become invisible to the published set, which is
        // the exact omission this module exists to prevent, so it throws.
        if (cause?.code !== 'ENOENT') {
          throw new Error(
            `published-packages: ${manifestFile} cannot be read, so whether it is published is ` +
              'unknown and no route can be promised for it',
            { cause },
          )
        }
        continue
      }
      const name = manifest?.name
      if (typeof name !== 'string' || name.length === 0) continue
      if (manifest.private === true) continue
      if (seen.has(name)) continue
      seen.add(name)
      // Read as a buffer and decoded separately by the callers that want text,
      // so the copy step can write back the bytes it read rather than a
      // re-serialisation of them. `null` here means the package ships no
      // changelog at all, which is reported as an empty path rather than as an
      // empty string of text, so a caller cannot mistake it for an empty file.
      const changelogPath = path.join(directory, CHANGELOG_FILE)
      const bytes = await readFile(changelogPath).catch(() => null)
      found.push({
        name,
        directory: toPosix(path.relative(repoRoot, directory)),
        version: typeof manifest.version === 'string' ? manifest.version : '',
        changelog: bytes === null ? '' : toPosix(path.relative(repoRoot, changelogPath)),
        slug: changelogSlug(name),
        route: changelogRoute(name),
        text: bytes === null ? '' : bytes.toString('utf8'),
      })
    }
  }
  return found.sort((a, b) => a.name.localeCompare(b.name))
}

/** A forward-slashed path, so a discovered entry prints the same on every OS. */
function toPosix(file) {
  return file.split(path.sep).join('/')
}

/**
 * The published packages that hold a changelog, which is the set that owes the
 * site a route.
 *
 * A package with a missing or empty `CHANGELOG.md` is not a finding: it has
 * published nothing to record, and inventing an empty route for it would put a
 * page in the Corpus that says nothing.
 *
 * @param {string} repoRoot
 * @returns {Promise<PublishedPackage[]>}
 */
export async function readPublishedChangelogs(repoRoot) {
  return (await discoverPublishedPackages(repoRoot)).filter((entry) => entry.text.trim().length > 0)
}

/**
 * @typedef {object} ChangelogRelease
 * @property {string} version the version heading, `## 0.5.0`
 * @property {string} body the entry beneath it, verbatim
 */

/**
 * @typedef {object} Changelog
 * @property {string} title the file's own first heading, `# @nanisoft/prism-ui`
 * @property {ChangelogRelease[]} releases every version entry, in file order
 */

/**
 * A changelog file's own title and its version entries, in the file's order.
 *
 * The heading level is what the changesets generator writes, and no re-levelling
 * is applied to it: the file is rendered whole and re-levelling it would be
 * another transformation between the package's bytes and the reader's.
 *
 * The title is read because it is the page's title, and the gate asserts it
 * names the package the route was derived from. A package whose changelog leads
 * with a different heading is a finding rather than a page whose sidebar entry
 * disagrees with its heading.
 *
 * @param {string} text
 * @returns {Changelog}
 */
export function splitChangelog(text) {
  const lines = text.replace(/\r\n/g, '\n').split('\n')
  const title = (lines.find((line) => /^#\s+\S/.test(line)) ?? '').replace(/^#\s+/, '').trim()
  const releases = []
  let current
  for (const line of lines) {
    const heading = /^##\s+(.+?)\s*$/.exec(line)
    if (heading) {
      current = { version: heading[1] ?? '', body: [] }
      releases.push(current)
      continue
    }
    if (current) current.body.push(line)
  }
  return {
    title,
    releases: releases.map((release) => ({
      version: release.version,
      body: release.body.join('\n').replace(/^\n+/, '').replace(/\s+$/, ''),
    })),
  }
}
