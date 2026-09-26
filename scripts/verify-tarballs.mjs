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
 *   --mode=prepublish  additionally assert no tag exists for the version, so
 *                      publishing will create one.
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
    if (MODE === 'prepublish' && git(['tag', '--list', tag])) {
      problems.push(`tag ${tag} already exists; publishing would be a no-op`)
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
