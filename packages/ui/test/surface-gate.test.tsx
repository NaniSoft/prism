import { spawnSync } from 'node:child_process'
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'

/**
 * The surface gate, run as a process against a staged `dist` and `exports` map.
 *
 * The gate's job is the seam a consumer sees, so its tests are written against a
 * tree a test can make wrong: a wildcard subpath that resolves to nothing, a new
 * file under the internal directory, and a declared internal file that stopped
 * being emitted. Each of those passed before the reverse direction existed, and
 * a passing run of a gate that read nothing is the failure this suite exists to
 * prevent. The shipped script is copied rather than reimplemented, so what runs
 * is the file the package runs.
 */
const PKG = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const GATE = path.join(PKG, 'scripts', 'check-surface.mjs')
const REPO = path.join(PKG, '..', '..')

const DECLARATIONS: Record<string, string> = {
  'dist/index.d.ts': 'export declare function Button(): void\n',
  'dist/components/ui/button.d.ts': 'export declare function Button(): void\n',
  'dist/lib/utils.d.ts': 'export declare function cn(...classes: string[]): string\n',
  // The gate's INTERNAL list names every internal declaration, and it is checked in
  // both directions, so a fixture that emits only one of the three is reporting a
  // boundary that is stale. That is the rule working, and the fixture follows it.
  'dist/lib/rank.d.ts': 'export declare function locate(text: string, query: string): { rank: number }\n',
  'dist/lib/figure.d.ts':
    'export declare function occupiedBox(at: { x: number; y: number }, mark: number): { l: number }\n',
}

const manifest = (exports: Record<string, unknown>) =>
  `${JSON.stringify({ name: 'fixture', version: '0.0.0', type: 'module', exports }, null, 2)}\n`

const BASE_EXPORTS = {
  '.': { types: './dist/index.d.ts', default: './dist/index.js' },
  './components/*': { types: './dist/components/ui/*.d.ts', default: './dist/components/ui/*.js' },
}

const staged: string[] = []

/** Stage a package with the given `exports` map and declarations, and run the gate. */
function run(exports: Record<string, unknown>, declarations: Record<string, string>) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'prism-surface-gate-'))
  staged.push(dir)

  mkdirSync(path.join(dir, 'scripts'), { recursive: true })
  copyFileSync(GATE, path.join(dir, 'scripts', 'check-surface.mjs'))
  writeFileSync(path.join(dir, 'package.json'), manifest(exports))
  for (const [name, source] of Object.entries(declarations)) {
    mkdirSync(path.join(dir, path.dirname(name)), { recursive: true })
    writeFileSync(path.join(dir, name), source)
  }

  return spawnSync(process.execPath, [path.join(dir, 'scripts', 'check-surface.mjs')], {
    cwd: REPO,
    encoding: 'utf8',
  })
}

afterEach(() => {
  for (const dir of staged.splice(0)) rmSync(dir, { recursive: true, force: true })
})

describe('the surface gate', () => {
  it('passes a surface whose wildcard targets all resolve', () => {
    const result = run(BASE_EXPORTS, DECLARATIONS)

    expect(result.stderr).toBe('')
    expect(result.status).toBe(0)
    // The counts follow the fixture, and the fixture now emits every internal
    // declaration because the gate names all three in its boundary.
    expect(result.stdout).toContain('5 emitted declaration(s), 2 public, 3 internal')
    expect(result.stdout).toContain(
      'exports["./components/*"] -> ./dist/components/ui/*.js matched 1 declaration(s)',
    )
    expect(result.stdout).toContain('internal boundary asserted in both directions:')
    expect(result.stdout).toContain('dist/lib/rank.d.ts')
  })

  it('fails a wildcard target that resolves to nothing, naming the target', () => {
    const result = run(
      {
        ...BASE_EXPORTS,
        './blocks/*': { types: './dist/blocks/*/index.d.ts', default: './dist/blocks/*/index.js' },
      },
      DECLARATIONS,
    )

    expect(result.status).toBe(1)
    expect(result.stderr).toContain(
      'exports["./blocks/*"] -> ./dist/blocks/*/index.js matches 0 emitted declaration(s)',
    )
    expect(result.stderr).toContain('read nothing through this entry')
  })

  it('fails a new file under the internal directory, naming the file', () => {
    const result = run(BASE_EXPORTS, {
      ...DECLARATIONS,
      'dist/lib/merge.d.ts': 'export declare function merge(): string\n',
    })

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('dist/lib/merge.d.ts: is internal (under dist/lib) but is not declared')
    expect(result.stderr).toContain('Declare it with a reason')
  })

  it('fails a declared internal file that is no longer emitted, naming the file', () => {
    const { 'dist/lib/utils.d.ts': _dropped, ...withoutUtils } = DECLARATIONS
    const result = run(BASE_EXPORTS, withoutUtils)

    expect(result.status).toBe(1)
    expect(result.stderr).toContain(
      'dist/lib/utils.d.ts: is declared internal in INTERNAL but no declaration is emitted for it',
    )
  })

  it('still fails an upstream type on an internal declaration, so item 1 stays bidirectional', () => {
    const result = run(BASE_EXPORTS, {
      ...DECLARATIONS,
      'dist/lib/utils.d.ts': "import type { Slot } from '@base-ui/react/utils'\nexport declare const x: Slot\n",
    })

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('dist/lib/utils.d.ts: references a @base-ui module or type')
  })

  it('still fails a variant recipe on a public entry', () => {
    const result = run(BASE_EXPORTS, {
      ...DECLARATIONS,
      'dist/index.d.ts': 'export declare const buttonVariants: Record<string, string>\n',
    })

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('dist/index.d.ts: exports the internal variant recipe "buttonVariants"')
  })

  it('still fails an upstream props re-export on a public entry', () => {
    const result = run(BASE_EXPORTS, {
      ...DECLARATIONS,
      'dist/index.d.ts': "export type { ButtonProps } from '@base-ui/react/button'\n",
    })

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('dist/index.d.ts: re-exports the upstream props object (ButtonProps)')
  })

  it('fails a non-wildcard entry with no emitted declaration, naming the entry', () => {
    const result = run(
      { ...BASE_EXPORTS, './theming': { types: './dist/theming/index.d.ts', default: './dist/theming/index.js' } },
      DECLARATIONS,
    )

    expect(result.status).toBe(1)
    expect(result.stderr).toContain(
      'exports["./theming"] -> ./dist/theming/index.js has no emitted declaration at ./dist/theming/index.d.ts',
    )
  })

  it('fails a build that emitted no declaration at all', () => {
    const result = run(BASE_EXPORTS, {})

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('dist has no emitted declarations; run the build before this gate')
  })

  it('reads a declaration under dist/lib that a published entry reaches, and calls it public', () => {
    // The boundary is the `exports` map and not the directory. A consumer cannot
    // type a column without the column specification, so the specification
    // declaration lives beside the internal helpers in `src/lib` and is published;
    // treating the directory as the boundary would have called it internal and made
    // rules 2 and 3 skip the one file on that subpath a consumer reads.
    const result = run(
      { ...BASE_EXPORTS, './spec': { types: './dist/lib/spec.d.ts', default: './dist/lib/spec.js' } },
      { ...DECLARATIONS, 'dist/lib/spec.d.ts': 'export type FieldSpec = { key: string }\n' },
    )

    expect(result.status).toBe(0)
    expect(result.stderr).toBe('')
    expect(result.stdout).toContain('6 emitted declaration(s), 3 public, 3 internal')
    expect(result.stdout).toContain(
      'published under dist/lib, so the exports map and not the directory decides the boundary: dist/lib/spec.d.ts',
    )
  })

  it('fails a declared internal file a published entry now reaches, naming the contradiction', () => {
    const result = run(
      { ...BASE_EXPORTS, './rank': { types: './dist/lib/rank.d.ts', default: './dist/lib/rank.js' } },
      DECLARATIONS,
    )

    expect(result.status).toBe(1)
    expect(result.stderr).toContain(
      'dist/lib/rank.d.ts: is declared internal in INTERNAL and a published entry reaches it',
    )
    expect(result.stderr).toContain('the boundary says')
  })

  it('still fails a variant recipe on a declaration under dist/lib that a published entry reaches', () => {
    // The same case one layer down: if the boundary were still the directory, this
    // subpath would be skipped by rules 2 and 3 and the recipe would ship.
    const result = run(
      { ...BASE_EXPORTS, './spec': { types: './dist/lib/spec.d.ts', default: './dist/lib/spec.js' } },
      { ...DECLARATIONS, 'dist/lib/spec.d.ts': 'export declare const fieldVariants: Record<string, string>\n' },
    )

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('dist/lib/spec.d.ts: exports the internal variant recipe "fieldVariants"')
  })

  it('states its coverage on the real package', () => {
    const result = spawnSync(process.execPath, [GATE], { cwd: REPO, encoding: 'utf8' })

    expect(result.stderr).toBe('')
    expect(result.status).toBe(0)
    // The internal count and the list beside it are a stated boundary that grows as
    // the package gains internal helpers, so both are asserted as present and as
    // naming the three that are deliberately internal, rather than pinned to a total.
    // A previous version asserted 1 internal and named only utils, which failed
    // the moment a second internal declaration was added on purpose.
    expect(result.stdout).toMatch(/\d+ emitted declaration\(s\), \d+ public, \d+ internal/)
    expect(result.stdout).toContain('internal boundary asserted in both directions:')
    expect(result.stdout).toContain('dist/lib/utils.d.ts')
    expect(result.stdout).toContain('dist/lib/rank.d.ts')
    expect(result.stdout).toContain('dist/lib/figure.d.ts')
    // The specification module is published out of the same directory, and this is
    // the line that says so rather than leaving a reader to infer it from a count.
    expect(result.stdout).toContain('dist/lib/spec.d.ts')
    expect(result.stdout).toMatch(
      /exports\["\.\/components\/\*"\] -> \.\/dist\/components\/ui\/\*\.js matched [1-9]\d* declaration\(s\)/,
    )
  })
})
