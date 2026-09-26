/**
 * Stages the repository-level legal files into a package before it is packed.
 *
 * npm always includes a package's own `LICENSE` and `README.md` in the tarball,
 * but it cannot reach a file outside the package directory, so the root
 * `LICENSE` and `THIRD-PARTY-NOTICES.md` have to be copied in. `prepack` runs on
 * both `pnpm pack` and `pnpm publish`, so the dry-run rehearsal and the real
 * publish see the same files. The copies are gitignored.
 *
 * Run automatically by each package's `prepack` script:
 *   node ../../scripts/stage-package-files.mjs
 */
import { copyFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const TARGET = process.cwd()
const FILES = ['LICENSE', 'THIRD-PARTY-NOTICES.md']

for (const file of FILES) {
  const source = path.join(ROOT, file)
  const destination = path.join(TARGET, file)
  if (source === destination) continue
  if (!existsSync(source)) {
    console.error(`error stage-package-files: ${file} is missing at the repository root.`)
    process.exit(1)
  }
  copyFileSync(source, destination)
}

console.log(`publish-files: staged ${FILES.join(', ')} -> ${path.relative(ROOT, TARGET) || '.'}`)
