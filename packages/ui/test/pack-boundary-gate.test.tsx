import { spawnSync, type SpawnSyncReturns } from 'node:child_process'
import { cpSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * The pack-boundary gate, driven over the real tree and over staged defects.
 *
 * Two rules, and each is proven red separately. A gate that has only ever been
 * green is not evidence of anything, and this one has two easy failure modes: the
 * usage rule reading prose, and the axis rule reading a set that has silently
 * stopped changing.
 *
 * The axis rule reads the EMITTED token CSS, which is gitignored, so a staged
 * tree has to carry a copy of it. A `git clone` would be the obvious way and is
 * the wrong one: it has no `dist/` at all, so every staged case would fail for the
 * wrong reason and prove nothing. The staged tree is built from the real
 * inputs instead, so a case fails because of the one thing it changed.
 *
 * **There is ONE staged tree for the whole file, and every case restores what it
 * touched inside a `finally`.** There were six, one per case, and building each one
 * copies about twelve hundred files: the file spent five and a half of its fifteen
 * seconds making trees, against a twenty-second per-test ceiling, which is how a
 * gate-driven suite turns into a test that only passes when the machine is idle.
 *
 * Two things were wrong with the six trees and only one of them was slowness. The
 * slowness is that six identical copies is a cost with no information in it. The
 * correctness problem is that the probe cases used to write into
 * `apps/site/src/components/__probe_boundary.tsx` in **this** repository, so a
 * sibling test file importing from the site's component tree could read a probe it
 * did not put there, and a `pnpm check` running at the same time would judge the
 * tree with a file in it that nobody committed. Tests within one file run in order,
 * so one tree with a restore per case is safe where six trees were merely
 * expensive, and the gate now runs entirely over trees this file owns.
 */
const REPO = path.resolve(import.meta.dirname, '..', '..', '..')
const PKG = path.join(REPO, 'packages', 'ui')
const GATE = path.join(REPO, 'packages', 'ui', 'scripts', 'check-pack-boundary.mjs')

function run(cwd = REPO) {
  return spawnSync(process.execPath, [GATE], { cwd, encoding: 'utf8' })
}

function cleanup(paths: string[]) {
  for (const target of paths) rmSync(target, { force: true, recursive: true })
}

/**
 * A tree the gate can run against, carrying the emitted token CSS a fresh clone
 * would not have.
 *
 * The source roots are copied too, because rule 1 reads them and a root that does
 * not resolve fails the run: a staged tree missing them would fail for the wrong
 * reason and prove nothing about the axis rule.
 */
function stageTree() {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'prism-boundary-'))
  for (const relative of [
    'packages/ui/scripts/check-pack-boundary.mjs',
    'packages/ui/src',
    'packages/tokens/dist',
    // The colour contract is read from the token source, so a staged tree
    // without it fails on the wrong thing.
    'packages/tokens/src/semantic',
    'apps/site/src',
    'apps/site/items',
  ]) {
    const from = path.join(REPO, relative)
    const to = path.join(dir, relative)
    mkdirSync(path.dirname(to), { recursive: true })
    cpSync(from, to, { recursive: true })
  }
  return dir
}

function runStaged(dir: string) {
  return spawnSync(process.execPath, [path.join(dir, 'packages', 'ui', 'scripts', 'check-pack-boundary.mjs')], {
    cwd: dir,
    encoding: 'utf8',
  })
}

/** The one staged tree, built before the first case and removed after the last. */
let staged = ''
beforeAll(() => {
  staged = stageTree()
})
afterAll(() => {
  cleanup([staged])
})

/**
 * A probe written into a root the gate reads, in the staged tree, removed after.
 *
 * It used to be written into `apps/site/src/components/` in this repository, which
 * is the one write here that was never safe: that is a tracked source tree a sibling
 * test file and a concurrent `pnpm check` both read.
 */
function withProbe(body: string, assertion: (result: SpawnSyncReturns<string>) => void) {
  const probe = path.join(staged, 'apps', 'site', 'src', 'components', '__probe_boundary.tsx')
  try {
    writeFileSync(probe, body)
    assertion(runStaged(staged))
  } finally {
    rmSync(probe, { force: true })
  }
}

/**
 * One file in the staged tree edited for one case and put back.
 *
 * The restore is in a `finally` and is the whole reason one tree can be shared: a
 * case that fails halfway must not leave the next case a tree it did not plan for.
 */
function withStagedEdit(
  relative: string,
  transform: (source: string) => string,
  assertion: (result: SpawnSyncReturns<string>) => void,
) {
  const file = path.join(staged, relative)
  const original = readFileSync(file, 'utf8')
  try {
    writeFileSync(file, transform(original))
    assertion(runStaged(staged))
  } finally {
    writeFileSync(file, original)
  }
}

/**
 * One directory in the staged tree taken away for one case and put back.
 *
 * Renamed rather than deleted and rebuilt, because the case is about a root that does
 * not resolve and `apps/site/items` is five hundred files that a rebuild would have
 * to copy again. The move lands beside the tree rather than inside it, so the tree's
 * own `apps/site` does not grow a second directory the gate would then read.
 */
function withStagedRootGone(relative: string, assertion: (result: SpawnSyncReturns<string>) => void) {
  const from = path.join(staged, relative)
  const aside = `${from}.withheld`
  renameSync(from, aside)
  try {
    assertion(runStaged(staged))
  } finally {
    renameSync(aside, from)
  }
}

describe('the pack-boundary gate', () => {
  it('passes on the real tree, and says which axes it read', () => {
    const result = run()
    expect(result.status, result.stdout + result.stderr).toBe(0)
    // The coverage line is the falsifiable part: a reader can see that rule 2 read
    // every pack and found the axis it claims to check.
    expect(result.stdout).toMatch(/per-pack axes this run read, from 5 pack\(s\): colour plus --radius/)
    expect(result.stdout).toMatch(/pack-relative, so a boundary moves them: \S+/)
    // The honest limit, printed on the passing run rather than left in a comment.
    expect(result.stdout).toMatch(/not a cascade resolution/)
    // The corrected reason for the shape restriction, on every run.
    expect(result.stdout).toMatch(/a <rect> is NOT exempt/)
  })

  it('is not fooled by a comment that documents the selector', () => {
    // This is the gate's first real failure. It reported a live finding on a
    // JSDoc block documenting the very selector it searches for, because a text
    // scan reads prose and a prose mention of `data-pack` is a description, not a
    // boundary. Masking keeps the line count intact, so a finding still points at
    // a line a reader can edit.
    //
    // The fixture is `theme-menu.tsx`, which is a stronger one than the file it
    // replaced. That file mentioned `data-pack` only in prose and painted its
    // swatches from a literal, so the comment was the only thing in it the gate
    // could have been fooled by. This one mentions the selector in prose AND
    // carries real `data-pack` boundaries in markup, on the one shape the law
    // exempts, so a run over it has to find nothing at all: the prose is not a
    // boundary and the markup is a legal one.
    const menu = readFileSync(
      path.join(PKG, 'src', 'blocks', 'site-navbar', 'theme-menu.tsx'),
      'utf8',
    )
    expect(menu).toMatch(/data-pack/)
    expect(menu).toMatch(/a pack boundary rather than a literal colour/)
    // Every boundary in it lands on a fully rounded swatch, so the radius axis the
    // pack repoints is a no-op and the gate has nothing to report.
    for (const [, classes] of menu.matchAll(/data-pack=\{[^}]+\}[\s\S]{0,160}?className="([^"]*)"/g)) {
      expect(classes, 'a pack boundary on a shape the pack can move').toContain('rounded-full')
    }
    expect(menu, 'the fixture carries no boundary at all, so it proves nothing').toMatch(
      /data-pack=\{active\.id\}/,
    )

    // The same attribute as markup, on an element whose radius the pack moves.
    withProbe(
      [
        'export function Probe() {',
        '  return <div data-pack="blush" className="rounded-lg border" />',
        '}',
      ].join('\n'),
      (result) => {
        expect(result.status, 'markup is scanned even when a comment nearby is not').toBe(1)
        expect(result.stderr).toMatch(/__probe_boundary\.tsx/)
        expect(result.stderr).toMatch(/rounded-lg/)
      },
    )
  })

  it('fails a boundary whose radius utility is a pack-relative scale step', () => {
    // `rounded-xl` is `calc(var(--radius) * 1.4)`, so a boundary above it moves
    // it. The gate's first version treated "carries a radius utility" as the safe
    // case and passed this, which is the defect the ticket is about: five cards
    // in a row, five corner radii. The classification is read from the emitted
    // binding rather than from the class name for exactly this reason.
    withProbe('export function Probe() {\n  return <div data-pack="sky" className="rounded-xl" />\n}', (result) => {
      expect(result.status, 'rounded-xl is computed from --radius, so it moves').toBe(1)
      expect(result.stderr).toMatch(/rounded-xl/)
      expect(result.stderr).toMatch(/radius the pack moves/)
    })
  })

  it('accepts the three placements the law names', () => {
    // Fully-rounded: `rounded-full` is not computed from --radius, so the pack
    // cannot move it. This is the case the law puts first.
    withProbe('export function Probe() {\n  return <div data-pack="sky" className="rounded-full" />\n}', (result) => {
      expect(result.status, result.stdout + result.stderr).toBe(0)
    })

    // No radius utility: the element's radius is not a function of the token, so
    // there is nothing for the boundary to change. This is the case the ticket's
    // wording is easy to misread as unsafe, and the gate is where that is
    // settled: the unsafe case is a radius that MOVES, not a radius that exists.
    withProbe('export function Probe() {\n  return <div data-pack="sky" className="border p-4" />\n}', (result) => {
      expect(result.status, result.stdout + result.stderr).toBe(0)
    })

    // No radius concept: a shape with no corner to move.
    withProbe(
      'export function Probe() {\n  return <g data-pack="sky"><path d="M0 0" /></g>\n}',
      (result) => {
        expect(result.status, result.stdout + result.stderr).toBe(0)
      },
    )
  })

  it('pins the shape a boundary cannot move, in either of the two ways', () => {
    // `rounded-none` and an inline `--radius` both state a number the token
    // cannot recompute, so a boundary above them changes nothing about the shape.
    // This is the mechanism the finding message offers, so it is asserted here
    // rather than only described in an error string nobody runs.
    withProbe('export function Probe() {\n  return <div data-pack="sky" className="rounded-none" />\n}', (result) => {
      expect(result.status, result.stdout + result.stderr).toBe(0)
    })

    withProbe(
      'export function Probe() {\n  return <div data-pack="sky" className="rounded-[3px]" />\n}',
      (result) => {
        expect(result.status, result.stdout + result.stderr).toBe(0)
      },
    )
  })

  it('keeps a rect off the exempt list, and says the corrected reason', () => {
    // The previously stated reason for the shape restriction was wrong. A rect's
    // corner attribute is a CSS property and does follow a boundary; what blocks
    // it is that no utility exists for it. So `rect` is NOT on the exempt list,
    // and a rect carrying a pack-relative radius is a finding like anything else
    // rather than a shape the gate waves through.
    withProbe('export function Probe() {\n  return <rect data-pack="sky" className="rounded-lg" />\n}', (result) => {
      expect(result.status, 'a rect is not exempt').toBe(1)
      expect(result.stderr).toMatch(/<rect>/)
    })

    // The reason is printed on every run, so the correction is visible to
    // whoever reads the gate rather than living in a comment.
    expect(run().stdout).toMatch(/a <rect> is NOT exempt/)
    expect(run().stdout).toMatch(/does follow a boundary; what blocks\s+it is that no utility exists for it/)
  })

  it('fails a second per-pack axis the gate does not know', () => {
    // The whole point of the axis rule. An axis nobody named is a second thing a
    // scoped boundary silently moves, and DESIGN.md names only the axes the gate
    // has read.
    withStagedEdit(
      'packages/tokens/dist/themes/sky/light.css',
      (source) => source.replace('--radius:', '--elevation-step: 3px;\n  --radius:'),
      (result) => {
        expect(result.status, result.stdout + result.stderr).toBe(1)
        expect(result.stderr).toMatch(/--elevation-step/)
        expect(result.stderr).toMatch(/second thing a scoped boundary silently moves/)
      },
    )
  })

  it('fails a pack that gains or loses a property against the base pack', () => {
    withStagedEdit(
      'packages/tokens/dist/themes/sky/light.css',
      (source) => `${source}\n  --pack-extra: 1;\n`,
      (result) => {
        expect(result.status, result.stdout + result.stderr).toBe(1)
        expect(result.stderr).toMatch(/emits \d+ properties against the base pack's/)
      },
    )
  })

  it('fails when a pack declares a radius it does not emit', () => {
    // The boundary law promises the declared radius moves. If the manifest and
    // the emitted block disagree, the law describes a number nothing ships.
    withStagedEdit(
      'packages/tokens/dist/themes.json',
      (source) => {
        const themes = JSON.parse(source) as { radius: string }[]
        themes[0].radius = '9rem'
        return JSON.stringify(themes, null, 2)
      },
      (result) => {
        expect(result.status, result.stdout + result.stderr).toBe(1)
        expect(result.stderr).toMatch(/declares radius 9rem/)
      },
    )
  })

  it('fails when it is pointed at a tree with no pack blocks at all', () => {
    // A gate that read nothing must fail rather than report a clean boundary law.
    for (const pack of ['blush', 'lavender', 'mint', 'peach', 'sky']) {
      rmSync(path.join(staged, 'packages', 'tokens', 'dist', 'themes', pack), { recursive: true, force: true })
    }
    try {
      const red = runStaged(staged)
      expect(red.status, red.stdout + red.stderr).toBe(1)
      expect(red.stderr).toMatch(/no emitted light block/)
    } finally {
      for (const pack of ['blush', 'lavender', 'mint', 'peach', 'sky']) {
        cpSync(
          path.join(REPO, 'packages', 'tokens', 'dist', 'themes', pack),
          path.join(staged, 'packages', 'tokens', 'dist', 'themes', pack),
          { recursive: true },
        )
      }
    }
  })

  it('fails when the emitted theme declares no radius binding at all', () => {
    // The other way to read nothing. Without the bindings there is no way to tell
    // a pack-relative utility from a fixed one, so every usage judgement would
    // be a guess, and a guess is how rule 1 becomes unfailable.
    withStagedEdit(
      'packages/tokens/dist/theme.css',
      () => '@theme inline {}\n',
      (result) => {
        expect(result.status, result.stdout + result.stderr).toBe(1)
        expect(result.stderr).toMatch(/declares no --radius-\* binding/)
      },
    )
  })

  it('fails when a root it reads does not exist', () => {
    // Coverage is asserted rather than assumed. Note the staged tree is what
    // makes this testable: the gate resolves its roots from its OWN location, so
    // running the real script from another directory correctly reads the real
    // tree and passes. The failure mode this guards is a configured root that
    // does not exist, which only a tree without that root can show.
    withStagedRootGone('apps/site/items', (result) => {
      expect(result.status, result.stdout + result.stderr).toBe(1)
      expect(result.stderr).toMatch(/do not resolve/)
      expect(result.stderr).toMatch(/wrong working directory/)
      expect(result.stderr).toMatch(/does not exist in the repository at all/)
    })
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