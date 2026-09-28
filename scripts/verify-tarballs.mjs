/**
 * The published-tarball verifier.
 *
 * `publint` is the floor and runs at publish. This goes above it: it packs each
 * publishable workspace package, lists the tarball, and asserts the file list, the
 * repository metadata, that no source or test file leaked, that the legal files
 * and the consumer artifacts are present, and (in the publish modes) that the
 * version corresponds to a tag.
 *
 * Modes:
 *   --mode=verify      pack and assert contents only. CI runs this on every pull
 *                      request and push.
 *   --mode=prepublish  additionally assert the registry agrees the publish moves
 *                      forward: no tag exists for the version, so publishing will
 *                      create one, and the version is above whatever the registry
 *                      currently serves as `latest`, so publishing it under
 *                      `latest` moves the tag rather than dragging it back.
 *   --mode=postpublish additionally assert the tag now exists on the remote, so a
 *                      silent no-op publish fails the job.
 *
 * Run: pnpm release:verify
 */
import { execFileSync, execSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const ROOT = process.cwd()
const MODE = (process.argv.find((arg) => arg.startsWith('--mode=')) ?? '--mode=verify').slice(
  '--mode='.length,
)
const REPOSITORY_URL = 'git+https://github.com/NaniSoft/prism.git'
// A registry that hangs must fail the lane rather than hang it, so every lookup
// is bounded. The release already depends on the registry being up; this is
// about how long that gets to take, not about whether it is up.
const REGISTRY_TIMEOUT_MS = 20_000

if (!['verify', 'prepublish', 'postpublish'].includes(MODE)) {
  console.error(`verify-tarballs: unknown mode "${MODE}"`)
  process.exit(1)
}

/** Publishable packages, in the shape { name, version, dir, relativeDir }. */
function publishablePackages() {
  const packages = []
  const base = path.join(ROOT, 'packages')
  for (const entry of readdirSync(base, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const dir = path.join(base, entry.name)
    const manifestPath = path.join(dir, 'package.json')
    if (!existsSync(manifestPath)) continue
    const packageJson = JSON.parse(readFileSync(manifestPath, 'utf8'))
    if (packageJson.private) continue
    packages.push({
      name: packageJson.name,
      version: packageJson.version,
      dir,
      relativeDir: `packages/${entry.name}`,
    })
  }
  return packages.sort((a, b) => a.name.localeCompare(b.name))
}

const ARTIFACTS = {
  '@nanisoft/prism-ui': ['dist/styles.css'],
  '@nanisoft/prism-llms': ['dist/data.json'],
}

const LEAK_PATTERNS = [
  { pattern: /(^|\/)src\//, message: 'source file leaked' },
  { pattern: /\.test\./, message: 'test file leaked' },
  { pattern: /\.spec\./, message: 'spec file leaked' },
  { pattern: /(^|\/)__tests__\//, message: 'test directory leaked' },
  { pattern: /(^|\/)tsconfig[^/]*\.json$/, message: 'tsconfig leaked' },
  { pattern: /(^|\/)registry\.json$/, message: 'internal registry leaked' },
  { pattern: /(^|\/)components\.json$/, message: 'internal registry config leaked' },
  { pattern: /(^|\/)public\/r\//, message: 'internal registry output leaked' },
  { pattern: /(^|\/)\.turbo\//, message: 'turbo cache leaked' },
  { pattern: /(^|\/)\.generated\//, message: 'generated staging leaked' },
]

function pack(pkg, destination) {
  const command = `pnpm pack --pack-destination "${destination}"`
  execSync(command, {
    cwd: pkg.dir,
    stdio: ['ignore', 'pipe', 'inherit'],
  })
  const tarball = readdirSync(destination).find((name) => name.endsWith('.tgz'))
  if (!tarball) throw new Error('pnpm pack produced no tarball')
  return path.join(destination, tarball)
}

function listTarball(tarball) {
  const out = execFileSync('tar', ['-tzf', tarball], { encoding: 'utf8' })
  return out
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
}

function readTarballJson(tarball, entry) {
  const out = execFileSync('tar', ['-xzOf', tarball, entry], { encoding: 'utf8' })
  return JSON.parse(out)
}

function git(command) {
  try {
    return execFileSync('git', command, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
  } catch {
    return ''
  }
}

/**
 * The version the registry currently serves as `latest`, or null when the
 * package has never been published.
 *
 * A registry that cannot be asked is a different answer from a package nobody
 * has claimed, and the caller must not read the second as the first: one means
 * there is nothing to regress and the other means the invariant could not be
 * established. Failing on the second is the point.
 */
const UNREACHABLE = Symbol('registry unreachable')

/**
 * The version the registry currently serves as `latest`, or null when the
 * package has never been published.
 *
 * This asks the registry over HTTP rather than shelling out to `npm view`. The
 * npm entry point is a `.cmd` shim on Windows, a shim is not something a child
 * process can spawn without a shell, and a shell would buy that at the price of
 * a check that behaves differently on the machine it was written on than in the
 * lane that actually runs it. The registry's own endpoint answers the same
 * question identically in both places, and answers it in one request.
 */
async function registryLatest(name) {
  try {
    const response = await fetch(`https://registry.npmjs.org/${name.replace('/', '%2F')}`, {
      signal: AbortSignal.timeout(REGISTRY_TIMEOUT_MS),
    })
    // 404 is the registry saying nobody has claimed this name, which is a fact
    // about the package rather than a failure to learn it.
    if (response.status === 404) return null
    if (!response.ok) return UNREACHABLE
    const body = await response.json()
    return body?.['dist-tags']?.latest ?? null
  } catch {
    return UNREACHABLE
  }
}

/**
 * Is `a` above `b`, as the dist-tag question needs? Build metadata is ignored,
 * which semver requires.
 *
 * Returns null rather than a guess when either side is not a plain release, so
 * the caller can report a version it could not read instead of ordering two
 * prereleases by string comparison and calling that semver. Nothing in this
 * repository publishes a prerelease, so the honest answer is the rare one.
 */
function ordersAfter(a, b) {
  const parse = (value) => /^(\d+)\.(\d+)\.(\d+)$/.exec(String(value).trim())
  if (!parse) return null
  const left = parse(a).slice(1).map(Number)
  const right = parse(b).slice(1).map(Number)
  for (let index = 0; index < 3; index += 1) {
    if (left[index] !== right[index]) return left[index] > right[index]
  }
  return null
}

const failures = []

for (const pkg of publishablePackages()) {
  const temp = mkdtempSync(path.join(os.tmpdir(), 'prism-pack-'))
  try {
    const tarball = pack(pkg, temp)
    const entries = listTarball(tarball)
    const files = entries.filter((entry) => entry.startsWith('package/')).map((entry) => entry.slice('package/'.length))
    const problems = []

    const has = (file) => files.includes(file)
    const hasPrefix = (prefix) => files.some((file) => file.startsWith(prefix))

    if (!has('package.json')) problems.push('missing package.json')
    if (!has('README.md')) problems.push('missing README.md')
    if (!has('LICENSE')) problems.push('missing LICENSE')
    if (!has('THIRD-PARTY-NOTICES.md')) problems.push('missing THIRD-PARTY-NOTICES.md')
    if (!hasPrefix('dist/')) problems.push('missing dist/')

    for (const artifact of ARTIFACTS[pkg.name] ?? []) {
      if (!has(artifact)) problems.push(`missing ${artifact}`)
    }

    for (const file of files) {
      for (const leak of LEAK_PATTERNS) {
        if (leak.pattern.test(file)) problems.push(`${leak.message}: ${file}`)
      }
    }

    const packed = readTarballJson(tarball, 'package/package.json')
    const repository = packed.repository ?? {}
    if (repository.url !== REPOSITORY_URL) {
      problems.push(`repository.url is ${JSON.stringify(repository.url)}, expected ${REPOSITORY_URL}`)
    }
    if (repository.directory !== pkg.relativeDir) {
      problems.push(
        `repository.directory is ${JSON.stringify(repository.directory)}, expected ${pkg.relativeDir}`,
      )
    }

    const tag = `${pkg.name}@${pkg.version}`
    if (MODE === 'prepublish') {
      // A version the registry already has is one this release is not publishing.
      // The publisher only sends what it bumped, so an unchanged package arrives
      // here carrying the version it is already live at, and failing it would fail
      // every release for a package that has nothing to release. So this is
      // reported and stepped over rather than treated as a fault.
      //
      // It is not the check that catches a version collision, and it is worth
      // saying why it never was. A spent version was published by some earlier
      // line, so `latest` has since been at least that version, which means a
      // spent version is always at or below the tag and the regression check
      // below catches it on its own. The two checks are not the same assertion
      // and the second subsumes the first; the first used to be the only one, and
      // it was the only one that could not see a package legitimately standing
      // still.
      const latest = await registryLatest(pkg.name)
      // The skip is only about the version assertions. A package that is already
      // live still has to pass every content check, because those describe the
      // tarball rather than the release, and a tarball with a leaked source file
      // is a fault whether or not this run publishes it.
      const notBeingPublished = latest !== null && latest === pkg.version
      if (notBeingPublished) {
        console.log(`  skip ${pkg.name}@${pkg.version} (already the published latest; this release does not bump it)`)
      } else if (git(['tag', '--list', tag])) {
        console.log(`  note ${tag} already exists; the regression check below decides whether that is a fault`)
      }
      // The no-op and the regression look identical in a package.json and are
      // opposite outcomes, and only the first is a no-op. A version below the
      // one the registry serves as `latest` publishes successfully, succeeds in
      // the step that checks it, and moves the tag backwards, so every install
      // that takes `latest` gets an older release than the one it already had.
      // That is the release lane's worst failure mode and the one its own
      // precondition used to be blind to.
      if (notBeingPublished) {
        // nothing to assert about a version that is not moving
      } else if (latest === UNREACHABLE) {
        problems.push(
          `the registry would not report the current latest for ${pkg.name}, so a regression cannot be ruled out`,
        )
      } else if (latest !== null) {
        const ahead = ordersAfter(pkg.version, latest)
        if (ahead === null) {
          problems.push(
            `could not order ${pkg.version} against the published latest ${latest}; a version that is not a plain release is not something to guess about`,
          )
        } else if (!ahead) {
          problems.push(
            `the registry serves ${latest} as latest, so publishing ${pkg.version} under that tag would move it backwards`,
          )
        }
      }
    }
    if (MODE === 'postpublish') {
      const remote = git(['ls-remote', '--tags', 'origin', tag])
      if (!remote) problems.push(`tag ${tag} was not found on the remote after publish`)
    }

    if (problems.length === 0) {
      console.log(`  ok   ${pkg.name}@${pkg.version} (${files.length} files)`)
    } else {
      console.error(`  FAIL ${pkg.name}@${pkg.version}`)
      for (const problem of problems) console.error(`         ${problem}`)
      failures.push(pkg.name)
    }
  } catch (cause) {
    console.error(`  FAIL ${pkg.name}: ${cause.message}`)
    if (cause.stdout) process.stderr.write(String(cause.stdout))
    if (cause.stderr) process.stderr.write(String(cause.stderr))
    failures.push(pkg.name)
  } finally {
    rmSync(temp, { recursive: true, force: true })
  }
}

console.log(`\ntarballs: ${failures.length === 0 ? 'all pass' : `${failures.length} failed`} (mode ${MODE})`)

if (failures.length > 0) process.exit(1)
