/**
 * Copies the agent surface into the static export.
 *
 * `llms.txt`, `llms-full.txt` and `prism-skill.md` land at the site root, and
 * the per-item Markdown mirror tree lands at `out/md/**`, where the Worker's
 * `.md` prefix rewrite serves it at `/<section>/<slug>.md`.
 *
 * `data.json` is deliberately not copied: the Worker bundles the store from the
 * package, keeping the corpus off the public asset surface.
 *
 * Run after `next build`: node scripts/copy-agent-surface.mjs
 */
import { cpSync, copyFileSync, existsSync, rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const SITE = path.join(HERE, '..')
const REPO = path.join(SITE, '..', '..')
const LLMS = path.join(REPO, 'packages', 'llms', 'dist')
const OUT = path.join(SITE, 'out')

/**
 * The agent-surface files this step publishes at the site root.
 *
 * Exported, and imported by `check-content-joins.mjs`, because the footer links
 * these URLs and that gate holds everything the published navigation links to a
 * route the site publishes. The copy step is the one place that decides what
 * lands at the root, so it owns the one list and the gate reads it from here
 * rather than keeping a second copy beside it; the gate asserts each file is in
 * the export before believing the route, which is the same treatment the live
 * routes get.
 */
export const AGENT_SURFACE_FILES = ['llms.txt', 'llms-full.txt', 'prism-skill.md']

function main() {
  if (!existsSync(OUT)) {
    console.error('error copy-agent-surface needs the export first: out/ is missing.')
    process.exit(1)
  }

  for (const file of AGENT_SURFACE_FILES) {
    const source = path.join(LLMS, file)
    if (!existsSync(source)) {
      console.error(
        `error copy-agent-surface: ${path.relative(REPO, source)} is missing. Run the prism-llms build.`,
      )
      process.exit(1)
    }
    copyFileSync(source, path.join(OUT, file))
  }

  const mirrorSource = path.join(LLMS, 'md')
  const mirrorTarget = path.join(OUT, 'md')
  if (existsSync(mirrorSource)) {
    rmSync(mirrorTarget, { recursive: true, force: true })
    cpSync(mirrorSource, mirrorTarget, { recursive: true })
  }

  // data.json is intentionally absent: the Worker bundles it.
  console.log(`agent-surface: ${AGENT_SURFACE_FILES.join(', ')} and md/** -> out/`)
}

/*
 * Runs when invoked and stays quiet when imported, because the content-joins
 * gate imports the list above and a module that copied files on import would
 * put a build step inside a read-only check.
 */
const invoked = process.argv[1] === undefined ? null : pathToFileURL(process.argv[1]).href
if (invoked === import.meta.url) main()
