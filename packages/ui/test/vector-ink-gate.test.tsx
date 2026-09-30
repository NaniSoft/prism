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

/**
 * The drawing Components the staged tree has to carry.
 *
 * Read from the gate's own `SCANNED` rather than listed again, because a second
 * list is a second fact to keep in step and this test would then fail for the
 * wrong reason every time a drawing Component was added: it would report a
 * count the gate never claimed, or it would stage a Component the gate no
 * longer reads and pass on a smaller scan than the real one. The gate resolves
 * its roots from its own location, so a tree carrying exactly this set is a
 * tree the gate can judge completely.
 */
function scannedComponents(): string[] {
  const source = readFileSync(
    path.join(REPO, 'packages', 'ui', 'scripts', 'check-vector-ink.mjs'),
    'utf8',
  )
  const block = source.match(/const SCANNED = \[([\s\S]*?)\]/)
  if (block === null) throw new Error('check-vector-ink.mjs declares no SCANNED list to read')
  return [...block[1]!.matchAll(/'([^']+)'/g)].map((match) => match[1]!)
}

/** A tree the gate can run against, carrying the emitted token CSS. */
function stageTree() {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'prism-vector-ink-'))
  for (const relative of [
    'packages/ui/scripts/check-vector-ink.mjs',
    ...scannedComponents().map((name) => `packages/ui/src/components/ui/${name}`),
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
    // that the contract was read rather than that a scan found nothing. The
    // count is read back from the gate's own list rather than written here, so
    // adding a drawing Component widens the scan and this assertion keeps
    // meaning "the scan covered everything the gate declared" instead of slowly
    // becoming a smaller claim than the run it is checking.
    const scanned = scannedComponents().length
    expect(result.stdout).toMatch(
      new RegExp(`0 finding\\(s\\) across ${scanned} of ${scanned} Component\\(s\\) read`),
    )
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

  it('accepts the four declared exclusions, and says what each is for', () => {
    const result = run()
    // Each assertion names the exclusion and one class it resolved to, and none of
    // them asserts WHICH class came first. That was the previous version's one
    // mistake, and adding `chart.tsx` to SCANNED found it: the gate reports its
    // exclusions in the order it read the files, `chart` sorts before
    // `product-mark`, and a test pinned to `text-xs` immediately after the colon
    // was asserting the shape of an array rather than the rule. A gate that
    // printed its exclusions in alphabetical order would have failed it.
    expect(result.stdout).toMatch(/excluded, no paint: fill-none \(.*diagram\.tsx\)/)
    expect(result.stdout).toMatch(/excluded, a type-scale step on a name: text-(?:xs|sm|base)/)
    // Two more arrived with the 2026-09 roster. Both are the same shape of false
    // positive as the type scale: a prefix the rule reads as a paint and a word
    // that is not a colour. `chart.tsx` centres a donut's value and right-aligns a
    // numeric table cell; `pack-swatch.tsx` separates a swatch's two halves with
    // an edge rather than a colour. Both are closed sets matched by shape, so
    // `text-red-500` and `border-red-500` are still findings, and the assertions
    // below are what keep the widening from becoming a loophole.
    expect(result.stdout).toMatch(/excluded, a text alignment: text-(?:center|right)/)
    expect(result.stdout).toMatch(/excluded, a border edge or width: border-e/)
    expect(result.stdout).toMatch(/because an SVG path with no paint/)
    expect(result.stdout).toMatch(/because a step of the authored type scale/)
    expect(result.stdout).toMatch(/because an alignment, set on a label inside a figure/)
    expect(result.stdout).toMatch(/because which edges a border is on, or how wide it is/)
  })

  it('and the two new exclusions are closed sets rather than prefixes', () => {
    // The widening is only safe because both entries name their members. A
    // prefix exemption would have taken `text-red-500` and `border-red-500` with
    // it, which is the defect every exclusion in this gate is written to avoid.
    withDefect('chart.tsx', 'text-center', 'text-red-500', (result) => {
      expect(result.status).toBe(1)
      expect(result.stderr).toMatch(/\[unnamed-paint\]/)
      expect(result.stderr).toMatch(/text-red-500/)
    })
    withDefect('pack-swatch.tsx', 'border-e', 'border-red-500', (result) => {
      expect(result.status).toBe(1)
      expect(result.stderr).toMatch(/\[unnamed-paint\]/)
      expect(result.stderr).toMatch(/border-red-500/)
    })
  })

  it('fails an exclusion that resolves to nothing', () => {
    // An exclusion that fires on nothing is indistinguishable from a rule that
    // found nothing to say, so a declared entry with no live class is a finding
    // rather than a line that quietly stops appearing.
    //
    // **The defect goes into EVERY scanned Component that sets a type-scale step,
    // and the previous version put it in one file.** `product-mark.tsx` was the
    // only drawing with a `text-xs` when this was written. `chart.tsx` joined the
    // scanned set with the 2026-09 roster and also sets one, so replacing the
    // steps in `product-mark.tsx` alone left the exclusion live and the case
    // stopped testing what it says it tests. The loop below is the fix and it is
    // also the reason a second drawing Component has to be added here: a gate
    // rule's proof is a fixture, and a fixture that assumed one file was a
    // fixture that was wrong about the tree.
    const dir = stageTree()
    try {
      // The bare token, with no quote either side, because that is what the gate
      // classifies: it splits a class string on whitespace and looks at each
      // token. Two earlier versions of this fixture matched `'text-xs'` with
      // quotes and the first of them passed for the wrong reason: `chart.tsx`
      // writes its steps inside a multi-class string such as `"h-full text-xs"`,
      // where no quote touches the token, so a quoted pattern removed
      // `product-mark.tsx`'s steps and left `chart.tsx`'s and the exclusion stayed
      // live. A fixture that matches one file's formatting rather than the shape
      // the rule reads is a fixture that will keep passing for the wrong reason.
      const STEP = /text-(?:xs|sm|base)/g
      let changed = 0
      for (const name of scannedComponents()) {
        const file = path.join(dir, 'packages', 'ui', 'src', 'components', 'ui', name)
        const source = readFileSync(file, 'utf8')
        if (!/text-(?:xs|sm|base)/.test(source)) continue
        writeFileSync(file, source.replace(STEP, 'text-lg'), 'utf8')
        changed += 1
      }
      expect(changed, 'no scanned Component set a type-scale step, so the case cannot fire').toBeGreaterThan(0)

      const red = runStaged(dir)
      expect(red.status).toBe(1)
      // The step that is not in the exclusion any more is a finding in its own
      // right, and the exclusion that no longer has a class is a second.
      expect(red.stderr).toMatch(/\[unnamed-paint\]/)
      expect(red.stderr).toMatch(/text-lg/)
      expect(red.stderr).toMatch(/the declared exclusion "a type-scale step on a name" resolved to no class string/)
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
