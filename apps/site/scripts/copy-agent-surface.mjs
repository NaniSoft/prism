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
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const SITE = path.join(HERE, '..')
const REPO = path.join(SITE, '..', '..')
const LLMS = path.join(REPO, 'packages', 'llms', 'dist')
const OUT = path.join(SITE, 'out')

const FILES = ['llms.txt', 'llms-full.txt', 'prism-skill.md']

if (!existsSync(OUT)) {
  console.error('error copy-agent-surface needs the export first: out/ is missing.')
  process.exit(1)
}

for (const file of FILES) {
  const source = path.join(LLMS, file)
  if (!existsSync(source)) {
    console.error(`error copy-agent-surface: ${path.relative(REPO, source)} is missing. Run the prism-llms build.`)
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
console.log(`agent-surface: ${FILES.join(', ')} and md/** -> out/`)
