/**
 * The shared walker's unit lane.
 *
 * Plain `node:test`, because these modules are the repository's gate scripts and
 * nothing in the workspace installs a runner for the root `scripts/` tree. Run:
 *
 *   node --test "scripts/__tests__/*.test.mjs"
 *
 * The behavioural half of this work, a real gate run from a directory that is
 * not the repository, is in `gates.test.mjs`.
 */
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import test from 'node:test'

import {
  assertFilesRead,
  assertRootsResolve,
  coverageOf,
  relativePosix,
  resolveRoot,
  unresolvedRoots,
  walkRoot,
  walkRoots,
} from '../lib/walk.mjs'

const REPO = path.resolve(import.meta.dirname, '..', '..')

const tempTree = () => mkdtempSync(path.join(os.tmpdir(), 'prism-walk-'))

test('a root that does not exist is reported rather than absorbed', () => {
  const result = walkRoot(path.join(tempTree(), 'no-such-root'))

  assert.equal(result.exists, false)
  assert.deepEqual(result.files, [])
  assert.equal(result.error, 'ENOENT')
})

test('a root resolves against the base the caller passes, not the working directory', () => {
  const before = process.cwd()
  const elsewhere = tempTree()
  try {
    process.chdir(elsewhere)
    const results = walkRoots(REPO, ['README.md', 'docs'], { extensions: /\.mdx?$/ })

    assert.equal(unresolvedRoots(results).length, 0)
    assert.ok(
      results.every((result) => result.files.length > 0),
      'the roots resolve identically from an unrelated working directory',
    )
    assert.equal(resolveRoot(REPO, 'docs'), path.join(REPO, 'docs'))
  } finally {
    process.chdir(before)
  }
})

test('a root may be a file as well as a directory', () => {
  const result = walkRoot(path.join(REPO, 'README.md'), { extensions: /\.mdx?$/ })

  assert.equal(result.exists, true)
  assert.deepEqual(result.files, [path.join(REPO, 'README.md')])
})

test('the extension filter decides what a root yields', () => {
  const dir = tempTree()
  writeFileSync(path.join(dir, 'kept.ts'), 'export const a = 1\n')
  writeFileSync(path.join(dir, 'skipped.png'), 'not source\n')
  mkdirSync(path.join(dir, 'nested'))
  writeFileSync(path.join(dir, 'nested', 'also-kept.tsx'), 'export const b = 2\n')

  const result = walkRoot(dir, { extensions: /\.(ts|tsx)$/ })

  assert.equal(result.exists, true)
  assert.equal(result.files.length, 2)
  assert.ok(result.files.every((file) => path.isAbsolute(file)))
  assert.ok(result.files.every((file) => /\.(ts|tsx)$/.test(file)))

  const byName = walkRoot(dir, { extensions: ['.tsx'] })
  assert.equal(byName.files.length, 1)
})

test('an unresolved root names both of the causes a reader cannot tell apart', () => {
  const results = [
    { relative: 'README.md', files: ['/tmp/x'], exists: true },
    { relative: 'docs', files: [], exists: false, error: 'ENOENT' },
    { relative: 'apps/site/src', files: [], exists: false, error: 'ENOENT' },
  ]

  assert.throws(
    () => assertRootsResolve(results, { scriptName: 'check-dashes' }),
    (failure) => {
      const message = failure.message
      assert.match(message, /2 of 3 configured roots do not resolve/)
      assert.match(message, /"docs", "apps\/site\/src"/)
      assert.match(message, /wrong working directory/)
      assert.match(message, /does not exist in the repository at all/)
      return true
    },
  )
})

test('a single unresolved root is named in the singular', () => {
  const results = [{ relative: 'docs', files: [], exists: false, error: 'ENOENT' }]

  assert.throws(
    () => assertRootsResolve(results, { scriptName: 'check-elevation-layout' }),
    /1 of 1 configured root does not resolve: "docs"/,
  )
})

test('a run that read no file fails, and a root that is empty does not', () => {
  const empty = [{ relative: 'empty', files: [], exists: true }]
  assert.throws(() => assertFilesRead(empty, { scriptName: 'check-dashes' }), /read 0 files/)
  assert.throws(
    () => assertFilesRead(empty, { scriptName: 'check-dashes', extensions: /\.ts$/ }),
    /read 0 files/,
  )

  const oneFile = [{ relative: 'one', files: ['/tmp/x.ts'], exists: true }]
  assert.doesNotThrow(() => assertFilesRead(oneFile, { scriptName: 'check-dashes' }))
})

test('coverage reports what the run achieved', () => {
  const results = [
    { relative: 'a', files: ['/tmp/a.ts', '/tmp/b.ts'], exists: true },
    { relative: 'b', files: [], exists: true },
    { relative: 'c', files: ['/tmp/c.ts'], exists: false, error: 'ENOENT' },
  ]

  assert.deepEqual(coverageOf(results), { files: 3, roots: 3, unresolved: 1 })
})

test('a path is reported repo-relative and forward-slashed on every OS', () => {
  const nested = path.join('a', 'b', 'c.ts')

  assert.equal(relativePosix(REPO, path.join(REPO, nested)), 'a/b/c.ts')
})
