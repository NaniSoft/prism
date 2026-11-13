/**
 * Copies the two showcase apps into the static export.
 *
 * Each showcase app is a separate consumer with its own gate chain, its own
 * build and its own base path, and the site publishes it as static assets under
 * `out/showcase/**`, where the Worker serves it asset-first at
 * `prism.nanisoft.com/showcase/<name>`. The app's own export already carries
 * the base path in every address it emits, so the copy is byte for byte and no
 * rewriting happens here.
 *
 * Run after `next build` and after both apps' builds: node scripts/copy-showcase.mjs
 * The turbo task graph builds the apps before this package's build, so a plain
 * `pnpm build` at the repository root produces a complete export.
 */
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const SITE = path.join(HERE, '..')
const REPO = path.join(SITE, '..', '..')
const APPS = path.join(REPO, 'apps')
const OUT = path.join(SITE, 'out')

/**
 * The showcase apps this step publishes, and the sub-path each is hosted at.
 *
 * Exported, and imported by `check-content-joins.mjs`, because the landing page
 * links both routes and that gate holds everything the published navigation
 * links to a route the site publishes. The copy step is the one place that
 * decides what lands under `out/showcase`, so it owns the one list and the gate
 * reads it from here rather than keeping a second copy beside it; the gate
 * asserts each app's entry document is in the export before believing the
 * route, which is the same treatment the agent surface and the live routes get.
 */
export const SHOWCASE_APPS = [
  { directory: 'showcase-landing', route: '/showcase/landing' },
  { directory: 'showcase-admin', route: '/showcase/admin' },
]

/** The showcase routes the export publishes, derived, never a second list. */
export const SHOWCASE_ROUTES = SHOWCASE_APPS.map((app) => app.route)

function main() {
  if (!existsSync(OUT)) {
    console.error('error copy-showcase needs the export first: out/ is missing.')
    process.exit(1)
  }

  rmSync(path.join(OUT, 'showcase'), { recursive: true, force: true })
  for (const app of SHOWCASE_APPS) {
    const source = path.join(APPS, app.directory, 'out')
    if (!existsSync(path.join(source, 'index.html'))) {
      console.error(
        `error copy-showcase: apps/${app.directory}/out holds no export, so ${app.route} would be a 404\n` +
          `  this step publishes. Run pnpm --filter @nanisoft/${app.directory} build first.`,
      )
      process.exit(1)
    }
    const target = path.join(OUT, ...app.route.split('/').filter(Boolean))
    mkdirSync(path.dirname(target), { recursive: true })
    cpSync(source, target, { recursive: true })
  }

  console.log(`showcase: ${SHOWCASE_APPS.map((app) => `${app.directory} -> ${app.route}`).join(', ')}`)
}

/*
 * Runs when invoked and stays quiet when imported, because the content-joins
 * gate imports the list above and a module that copied files on import would
 * put a build step inside a read-only check.
 */
const invoked = process.argv[1] === undefined ? null : pathToFileURL(process.argv[1]).href
if (invoked === import.meta.url) main()
