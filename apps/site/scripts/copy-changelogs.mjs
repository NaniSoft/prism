/**
 * Copies every published package's changelog into the content tree.
 *
 * One route per published package, at the path
 * `scripts/published-packages.mjs` names, and the file is the package's own
 * `CHANGELOG.md` byte for byte. Nothing here writes prose: a hand-authored
 * `changelogs/*.mdx` would make the changelog a third place to remember
 * alongside the changeset and the JSDoc, and a hand-maintained copy of a
 * changelog drifts from the bytes in the npm tarball while looking correct.
 *
 * The step is a task of its own in the site's `package.json`, and the corpus
 * build declares a task-graph edge onto it, so the copy runs before the corpus
 * is built on a cold machine with no warm cache. It reads checked-in files and
 * needs no package build, which is what lets it sit upstream of everything the
 * corpus reads. The order used to be the order of two steps in the shell line
 * `prebuild` runs, and the corpus package is also built on its own by the task
 * runner, so that line governed nothing: the corpus was built before the files
 * it asserts existed, and on a warm cache the failure never arrived. The
 * changelog pages are ordinary content pages on the existing pipeline rather
 * than a second publication path with its own step to forget.
 *
 * **The bytes are written as bytes.** The file is read as a buffer and written
 * back as a buffer, with no re-serialisation and no frontmatter, which is what
 * makes "the site's text and the package's text are the same bytes" a fact
 * about the build rather than a promise about it. The title a reader sees and
 * the entries an agent reads are derived from those bytes at read time; nothing
 * is injected into the file to make it render.
 *
 * **A route that cannot be written fails the build.** The step refuses rather
 * than skipping, because the failure this exists to prevent is the silent one:
 * a published package with a changelog and no route is exactly what the
 * reference design system ships, and its continuous integration is green
 * because nothing in it can notice. A package whose route this step cannot
 * produce is a build failure here, a finding in `check-content-joins.mjs`, and a
 * throw in the corpus builder, which is three doors on the same omission.
 *
 * Files it wrote on an earlier run and no longer owns are removed, so a package
 * that stops being published does not leave a page behind claiming to be one.
 * That removal is what makes the step idempotent rather than additive, and it
 * is why the gate can compare the tree against the workspace in both
 * directions.
 *
 * Run: pnpm copy-changelogs, or node scripts/copy-changelogs.mjs. The task
 * runner reaches the same script as the task `@nanisoft/site#copy-changelogs`.
 */
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  CHANGELOG_SECTION,
  changelogFile,
  changelogRoute,
  readPublishedChangelogs,
} from './published-packages.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const SITE = path.join(HERE, '..')
const REPO = path.join(SITE, '..', '..')
const CONTENT = path.join(SITE, 'content')

const packages = await readPublishedChangelogs(REPO)
if (packages.length === 0) {
  console.error(
    `copy-changelogs: no published package in the workspace holds a changelog, so the ` +
      `content/${CHANGELOG_SECTION} Section would have no route at all. Check the workspace globs ` +
      "and each package's `private` field rather than accepting an empty Section.",
  )
  process.exit(1)
}

const sectionDir = path.join(CONTENT, CHANGELOG_SECTION)
await mkdir(sectionDir, { recursive: true })

const written = []
for (const entry of packages) {
  const relative = changelogFile(entry.name)
  const target = path.join(CONTENT, ...relative.split('/'))
  const source = path.join(REPO, ...entry.changelog.split('/'))
  let bytes
  try {
    bytes = await readFile(source)
  } catch (cause) {
    console.error(
      `copy-changelogs: the published package ${entry.name} is discovered with a changelog at ` +
        `${entry.changelog} and that file cannot be read, so ${changelogRoute(entry.name)} cannot be ` +
        'published.',
    )
    throw cause
  }
  await writeFile(target, bytes)
  written.push(relative)
}

/**
 * Every generated file in the Section this run did not write, so a package that
 * stopped being published does not leave a route behind claiming to be one.
 *
 * Only the generated extension is a candidate. The authored half of the Section
 * is `.mdx` and is therefore never considered, which is what lets this step own
 * the folder's generated files without owning the folder.
 */
const stale = []
for (const name of await readdir(sectionDir).catch(() => [])) {
  if (!name.endsWith('.md')) continue
  if (written.includes(`${CHANGELOG_SECTION}/${name}`)) continue
  stale.push(path.join(sectionDir, name))
}
for (const file of stale) await rm(file, { force: true })

console.log(
  `changelogs: ${written.length} published package changelogs copied -> content/${CHANGELOG_SECTION} ` +
    `(${written.join(', ')})` +
    (stale.length > 0 ? `; ${stale.length} stale route(s) removed` : ''),
)
