/**
 * The pull request release preview.
 *
 * Reads `.changeset/*.md` directly through the changesets programmatic API and
 * renders a Markdown table of what merging the pull request would release. The
 * plan comes from `@changesets/assemble-release-plan`, the same function
 * `changesets/action` uses, so the linked pair and internal dependency
 * propagation are exact rather than approximated.
 *
 * This deliberately does not parse `changeset status` output: that is a fragile
 * dependency on human-formatted, emoji-bearing text.
 *
 * Private packages (only `@nanisoft/site`) are filtered from the table.
 *
 * Usage:
 *   node scripts/release-preview.mjs [--base <git ref>]
 *
 * `--base` enables the missing-changeset warning: when a pull request changes
 * files in a published package and adds no changeset, the preview says so.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { assembleReleasePlan } from '@changesets/assemble-release-plan'
import { readChangesets } from '@changesets/read'

const ROOT = process.cwd()
const BUMP_ORDER = { major: 0, minor: 1, patch: 2 }

/** The workspace packages in the shape `@changesets/assemble-release-plan` expects. */
function loadPackages(root) {
  const read = (dir, relativeDir) => {
    const packageJson = JSON.parse(readFileSync(path.join(dir, 'package.json'), 'utf8'))
    return { packageJson, dir, relativeDir }
  }

  const rootPackage = read(root, '.')
  const packages = []
  for (const group of ['packages', 'apps']) {
    const base = path.join(root, group)
    if (!existsSync(base)) continue
    for (const entry of readdirSync(base, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue
      const dir = path.join(base, entry.name)
      if (existsSync(path.join(dir, 'package.json'))) packages.push(read(dir, `${group}/${entry.name}`))
    }
  }

  return {
    tool: { type: 'pnpm' },
    packages,
    rootPackage,
    rootDir: root,
  }
}

function loadConfig(root) {
  const raw = JSON.parse(readFileSync(path.join(root, '.changeset', 'config.json'), 'utf8'))
  return {
    changelog: false,
    commit: false,
    fixed: [],
    linked: [],
    access: 'restricted',
    baseBranch: 'main',
    updateInternalDependencies: 'patch',
    bumpVersionsWithWorkspaceProtocolOnly: false,
    ignore: [],
    privatePackages: { version: true, tag: false },
    snapshot: { useCalculatedVersion: false, prereleaseTemplate: null },
    ___experimentalUnsafeOptions_WILL_CHANGE_IN_PATCH: {
      onlyUpdatePeerDependentsWhenOutOfRange: false,
      updateInternalDependents: 'out-of-range',
    },
    ...raw,
  }
}

function loadPreState(root) {
  const file = path.join(root, '.changeset', 'pre.json')
  if (!existsSync(file)) return undefined
  return JSON.parse(readFileSync(file, 'utf8'))
}

function changedFiles(base) {
  if (!base) return null
  try {
    const out = execFileSync('git', ['diff', '--name-only', `${base}...HEAD`], {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
    return out
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
  } catch {
    return null
  }
}

function render(releases, packages, base) {
  const lines = ['## Release preview', '']

  if (releases.length === 0) {
    lines.push('Merging this pull request would not release any published package.')
  } else {
    lines.push('Merging this pull request would publish:')
    lines.push('')
    lines.push('| Package | Bump | From | To |')
    lines.push('| --- | --- | --- | --- |')
    for (const release of releases) {
      lines.push(
        `| \`${release.name}\` | ${release.type} | ${release.oldVersion} | ${release.newVersion} |`,
      )
    }
  }

  const files = changedFiles(base)
  if (files) {
    const published = packages.packages.filter((pkg) => !pkg.packageJson.private)
    const touched = new Set()
    for (const file of files) {
      const posix = file.split(path.sep).join('/')
      for (const pkg of published) {
        const dir = pkg.relativeDir
        if (posix === `${dir}/package.json` || posix.startsWith(`${dir}/`)) touched.add(pkg.packageJson.name)
      }
    }

    if (touched.size > 0 && releases.length === 0) {
      lines.push('')
      lines.push(
        `> **No changeset found.** This pull request changes \`${[...touched].sort().join('`, `')}\` but adds no changeset. Run \`pnpm changeset\` and commit the result.`,
      )
    }
  }

  return `${lines.join('\n')}\n`
}

const baseIndex = process.argv.indexOf('--base')
const base = baseIndex === -1 ? undefined : process.argv[baseIndex + 1]

try {
  const packages = loadPackages(ROOT)
  const config = loadConfig(ROOT)
  const changesets = await readChangesets(ROOT)
  const preState = loadPreState(ROOT)
  const plan = assembleReleasePlan(changesets, packages, config, preState)
  const privateNames = new Set(
    packages.packages.filter((pkg) => pkg.packageJson.private).map((pkg) => pkg.packageJson.name),
  )
  const releases = plan.releases
    .filter((release) => release.type !== 'none')
    .filter((release) => !privateNames.has(release.name))
    .sort(
      (a, b) =>
        (BUMP_ORDER[a.type] ?? 9) - (BUMP_ORDER[b.type] ?? 9) || a.name.localeCompare(b.name),
    )

  process.stdout.write(render(releases, packages, base))
} catch (cause) {
  process.stdout.write(
    `## Release preview\n\nThe preview could not be computed.\n\n\`\`\`\n${cause.message}\n\`\`\`\n`,
  )
}
