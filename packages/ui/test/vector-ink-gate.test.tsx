import { spawnSync, type SpawnSyncReturns } from 'node:child_process'
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * The vector-ink gate, driven over the real tree and over staged defects.
 *
 * A gate that has only ever been green is not evidence of anything, and this one
 * has four rules that fail in four different ways, so each is proven red
 * separately over the real source rather than over a fixture the rule cannot
 * reach. The staged tree exists for the two failures that cannot be produced by
 * editing a Component: a Component that is not on disk, and a token contract
 * that reads as empty. Both are cases where a gate that reads nothing would
 * otherwise print a clean result, which is the exact failure the gate's own
 * header claims to replace.
 *
 * The staged tree carries the emitted token CSS, which is build output and is
 * not in a fresh clone. A `git clone` would be the obvious way to build one and
 * is the wrong one: it has no `dist/`, so every staged case would fail for the
 * wrong reason and prove nothing.
 */
const REPO = path.resolve(import.meta.dirname, '..', '..', '..')
const GATE = path.join(REPO, 'packages', 'ui', 'scripts', 'check-vector-ink.mjs')
const COMPONENTS = path.join(REPO, 'packages', 'ui', 'src', 'components', 'ui')

function run(cwd = REPO): SpawnSyncReturns<string> {
  return spawnSync(process.execPath, [GATE], { cwd, encoding: 'utf8' })
}

function cleanup(targets: string[]) {
  for (const target of targets) rmSync(target, { force: true, recursive: true })
}

/**
 * A Component with a defect written into it, removed afterwards whatever happens.
 *
 * The write is a `Set-Content`-free read/replace/write in one process so the
 * file's line endings and its trailing byte survive the round trip: a finding
 * that reports a line number is only worth anything if the line numbers on the
 * green run and the red run are the same file.
 */
function withDefect(file: string, from: string, to: string, assertion: (result: SpawnSyncReturns<string>) => void) {
  const full = path.join(COMPONENTS, file)
  const original = readFileSync(full, 'utf8')
  if (!original.includes(from)) {
    throw new Error(`check-vector-ink-gate: ${file} does not contain the text this test replaces`)
  }
  try {
    writeFileSync(full, original.replace(from, to), 'utf8')
    assertion(run())
  } finally {
    writeFileSync(full, original, 'utf8')
  }
}

/** A tree the gate can run against, carrying the emitted token CSS. */
function stageTree() {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'prism-vector-ink-'))
  for (const relative of [
    'packages/ui/scripts/check-vector-ink.mjs',
    'packages/ui/src/components/ui/diagram.tsx',
    'packages/ui/src/components/ui/product-mark.tsx',
    'packages/tokens/dist/light.css',
    'packages/tokens/dist/dark.css',
  ]) {
    const to = path.join(dir, relative)
    mkdirSync(path.dirname(to), { recursive: true })
    cpSync(path.join(REPO, relative), to, { recursive: true })
  }
  return dir
}

function runStaged(dir: string) {
  return spawnSync(
    process.execPath,
    [path.join(dir, 'packages', 'ui', 'scripts', 'check-vector-ink.mjs')],
    { cwd: dir, encoding: 'utf8' },
  )
}

describe('the vector-ink gate', () => {
  it('passes on the real tree, and says what it read', () => {
    const result = run()
    expect(result.status, result.stdout + result.stderr).toBe(0)
    // The coverage line is the falsifiable part: a reader must be able to see
    // that the contract was read rather than that a scan found nothing.
    expect(result.stdout).toMatch(/0 finding\(s\) across 2 of 2 Component\(s\) read/)
    expect(result.stdout).toMatch(/contract read from 2 emitted mode file\(s\): \d+ custom/)
    // The one gradient in the shipped surface, listed with its stop count.
    expect(result.stdout).toMatch(/gradient at .*product-mark\.tsx:\d+ read, 6 contract stop\(s\)/)
    // The honest limit, printed on the passing run rather than left in a comment.
    expect(result.stdout).toMatch(/Neither reads a cascade/)
    // The scanned set is declared, so a reader can see the rule's scope.
    expect(result.stdout).toMatch(
      /scanned set is declared, not discovered: .*diagram\.tsx, .*product-mark\.tsx/,
    )
  })

  it('fails a literal colour, which is the defect the canvas had', () => {
    // The whole reason the gate exists: a resolved value painted by hand. It does
    // not move when a scoped pack boundary lands above it, and every other gate
    // passes, because the value it would have caught is a legal token value
    // applied to the wrong pack.
    withDefect(
      'diagram.tsx',
      'strokeWidth={1}',
      'stroke="#8b7cf6" strokeWidth={1}',
      (result) => {
        expect(result.status, 'a hex stroke is a resolved colour').toBe(1)
        expect(result.stderr).toMatch(/\[literal-colour\]/)
        expect(result.stderr).toMatch(/#8b7cf6/)
        expect(result.stderr).toMatch(/diagram\.tsx:\d+/)
      },
    )
  })

  it('is not fooled by a comment documenting the colour it forbids', () => {
    // A text scan reads prose, and both files document the very tokens and shapes
    // they may not use. A JSDoc block that says `stroke="var(--foreground)"` in
    // order to explain why a resolved value is wrong is a description, not a
    // defect, and the gate masks comments without moving a line so a finding
    // still points at a line a reader can edit.
    withDefect(
      'diagram.tsx',
      'const NODE_RADIUS = 5',
      [
        '/**',
        ' * A comment that names a colour the component may not use, so the gate reads prose if it',
        ' * does not mask: #ff0000, var(--not-a-token), and the word "red".',
        ' */',
        'const NODE_RADIUS = 5',
      ].join('\n'),
      (result) => {
        expect(result.status, result.stdout + result.stderr).toBe(0)
        expect(result.stderr).toBe('')
      },
    )
  })

  it('fails a gradient stop that is not a published name', () => {
    // The spectrum is the one gradient in the shipped surface, and it is allowed
    // precisely because every stop is a contract reference. One stop that is a
    // ramp step is the same class of defect as a literal, wearing a gradient.
    withDefect(
      'product-mark.tsx',
      'var(--chart-3)',
      'var(--lavender-400)',
      (result) => {
        expect(result.status, 'a ramp step inside a gradient resolves a colour').toBe(1)
        expect(result.stderr).toMatch(/\[unresolved-gradient\]/)
        expect(result.stderr).toMatch(/--lavender-400/)
        expect(result.stderr).toMatch(/\[unpublished-property\]/)
      },
    )
  })

  it('fails a paint utility whose colour names no contract role', () => {
    // The rule the other three cannot reach: a Tailwind class is a name and not a
    // value, so nothing in the text says what `bg-violet-500` resolves to.
    withDefect('product-mark.tsx', "'bg-primary'", "'bg-violet-500'", (result) => {
      expect(result.status).toBe(1)
      expect(result.stderr).toMatch(/\[unnamed-paint\]/)
      expect(result.stderr).toMatch(/bg-violet-500/)
      expect(result.stderr).toMatch(/EXCLUSIONS/)
    })
  })

  it('fails an ink that resolves through currentColor rather than through a token', () => {
    // `currentColor` is the second way an edge goes invisible, and it is a legal
    // Tailwind utility, so only a rule about it catches it.
    withDefect('diagram.tsx', 'fill-card stroke-border', 'fill-card stroke-current', (result) => {
      expect(result.status).toBe(1)
      expect(result.stderr).toMatch(/\[unnamed-paint\]/)
      expect(result.stderr).toMatch(/stroke-current/)
    })
  })

  it('accepts the two declared exclusions, and says what each is for', () => {
    const result = run()
    expect(result.stdout).toMatch(/excluded, no paint: fill-none \(.*diagram\.tsx\)/)
    expect(result.stdout).toMatch(/excluded, a type-scale step on a name: text-xs/)
    expect(result.stdout).toMatch(/because an SVG path with no paint/)
    expect(result.stdout).toMatch(/because a step of the authored type scale/)
  })

  it('fails an exclusion that resolves to nothing', () => {
    // An exclusion that fires on nothing is indistinguishable from a rule that
    // found nothing to say, so a declared entry with no live class is a finding
    // rather than a line that quietly stops appearing. All three type-scale steps
    // go at once, because leaving one behind would keep the exclusion live and
    // the case would pass for the wrong reason.
    const dir = stageTree()
    try {
      const file = path.join(dir, 'packages', 'ui', 'src', 'components', 'ui', 'product-mark.tsx')
      const source = readFileSync(file, 'utf8')
      const staged = source.replace(/'text-xs'|'text-sm'|'text-base'/g, "'text-lg'")
      expect(staged, 'the staged defect did not take').not.toBe(source)
      writeFileSync(file, staged, 'utf8')

      const red = runStaged(dir)
      expect(red.status).toBe(1)
      // The step that is not in the exclusion any more is a finding in its own
      // right, and the exclusion that no longer has a class is a second.
      expect(red.stderr).toMatch(/\[unnamed-paint\]/)
      expect(red.stderr).toMatch(/text-lg/)
      expect(red.stderr).toMatch(/a type-scale step on a name/)
      expect(red.stderr).toMatch(/resolved to no class string/)
    } finally {
      cleanup([dir])
    }
  })

  it('fails a Component that is not on disk, rather than reading less and passing', () => {
    // Coverage is asserted rather than assumed. The gate resolves its roots from
    // its OWN location, so running the real script from another directory
    // correctly reads the real tree and passes; the failure this guards is a
    // Component that was renamed with SCANNED left behind, which is a rule that
    // stopped reading the thing it was written for.
    const dir = stageTree()
    try {
      rmSync(path.join(dir, 'packages', 'ui', 'src', 'components', 'ui', 'product-mark.tsx'), {
        force: true,
      })

      const red = runStaged(dir)
      expect(red.status).toBe(1)
      expect(red.stderr).toMatch(/do not resolve/)
      expect(red.stderr).toMatch(/product-mark\.tsx/)
      expect(red.stderr).toMatch(/wrong working directory/)
      expect(red.stderr).toMatch(/SCANNED in this gate was not updated/)
    } finally {
      cleanup([dir])
    }
  })

  it('fails a token contract that reads as empty, rather than passing every var()', () => {
    // Without the emitted CSS there is no set of published names, so every
    // judgement below would be a guess, and a guess is how a gate becomes
    // unfailable. Both modes go, because the contract is their union: emptying
    // one leaves the other and the run would pass for the wrong reason.
    const dir = stageTree()
    try {
      for (const mode of ['light', 'dark']) {
        writeFileSync(
          path.join(dir, 'packages', 'tokens', 'dist', `${mode}.css`),
          ':root {\n}\n',
          'utf8',
        )
      }
      const red = runStaged(dir)
      expect(red.status).toBe(1)
      expect(red.stderr).toMatch(/declares no custom property/)
      expect(red.stderr).toMatch(/a pass having read nothing/)
    } finally {
      cleanup([dir])
    }
  })

  it('fails a token build that has not run, naming what to run', () => {
    const dir = stageTree()
    try {
      rmSync(path.join(dir, 'packages', 'tokens', 'dist', 'dark.css'), { force: true })

      const red = runStaged(dir)
      expect(red.status).toBe(1)
      expect(red.stderr).toMatch(/emitted token contract is missing/)
      expect(red.stderr).toMatch(/prism-tokens build/)
    } finally {
      cleanup([dir])
    }
  })

  it('reads the same tree whatever directory it is run from', () => {
    // The companion to the case above, and the reason the staged tree was
    // necessary: this gate must not be able to pass having quietly read less.
    const fromRoot = run(REPO)
    const fromElsewhere = run(os.tmpdir())
    expect(fromElsewhere.status, fromElsewhere.stdout + fromElsewhere.stderr).toBe(0)
    expect(fromElsewhere.stdout).toBe(fromRoot.stdout)
  })
})
