import { spawnSync } from 'node:child_process'
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'

/**
 * The focus-indicator gate, run as a process against staged source.
 *
 * A gate that has never been red is not evidence, so every rule here is proved
 * by feeding the gate a fixture that breaks it. The shipped script is copied
 * rather than reimplemented, so what runs is the file that runs in CI, and it
 * is invoked with the working directory set to this repository's root rather
 * than to the fixture, which is also how it proves it reads its source root
 * from its own location.
 *
 * Every fixture tree carries three components whose suppressing class string is
 * a declared exclusion, one per exclusion rule, so a fixture run has no stale
 * exclusion findings and the only variable is the file under test. The control
 * is that tree on its own, which passes: a rule that failed everything would be
 * indistinguishable from a rule that worked.
 *
 * **The scope is five roots, so a fixture tree has to carry five.** Every tree the
 * gate is widened to has to exist and hold a source file or the run fails before it
 * reads anything, which is the assertion that a root cannot be renamed out of the
 * gate by being deleted. `run` therefore seeds a quiet source file in each of the
 * four roots the fixtures are not written into, and a fixture for one of them
 * replaces its filler.
 */
const PKG = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const GATE = path.join(PKG, 'scripts', 'check-focus-indicators.mjs')
const REPO = path.join(PKG, '..', '..')
const SLIDER = path.join(PKG, 'src', 'components', 'ui', 'slider.tsx')

/** Where each root's fixture source is staged, relative to the staged `src`. */
const ROOT_DIRS: Record<string, string[]> = {
  components: ['components', 'ui'],
  blocks: ['blocks', 'fixture'],
  pages: ['pages', 'fixture'],
  live: ['live', 'fixture'],
  provider: ['provider'],
}

const staged: string[] = []

/** A component whose JSDoc makes or withholds a keyboard claim, with the classes given. */
function component(classes: string, claim: string, slot = 'under-test') {
  return [
    "'use client'",
    '',
    "import { cn } from '../../lib/utils'",
    '',
    '/**',
    ' * A control under test.',
    ' *',
    ...claim.split('\n').map((line) => ` * ${line}`),
    ' */',
    'function UnderTest({ className, ...props }: ComponentProps<\'button\'>) {',
    '  return (',
    '    <button',
    `      data-slot="${slot}"`,
    '      className={cn(',
    `        '${classes}',`,
    '        className,',
    '      )}',
    '      {...props}',
    '    />',
    '  )',
    '}',
    '',
    'export { UnderTest }',
    '',
  ].join('\n')
}

/** A control the JSDoc says is reachable by Tab and moved by the arrow keys. */
const claimsFocusable = (classes: string, slot?: string) =>
  component(
    classes,
    'It is reachable by Tab and moved by the arrow keys, so it owns a focus\nindicator and has to draw one.',
    slot,
  )

/** A component that says nothing about the keyboard. */
const saysNothing = (classes: string) =>
  component(classes, 'A panel that holds other controls and is not one itself.')

/** A source file with nothing in it worth reading, used to fill the other four roots. */
const quiet = ["'use client'", '', 'export const Nothing = null', ''].join('\n')

const EXCLUSION_FIXTURES = {
  'dialog.tsx': claimsFocusable('relative grid gap-4 p-6 outline-none', 'dialog-content'),
  'select.tsx': claimsFocusable('relative flex w-full outline-none select-none', 'select-item'),
  'tooltip.tsx': claimsFocusable('outline-none', 'tooltip-trigger'),
}

/**
 * Copy the real gate beside a staged `src` and run it from the repo root.
 *
 * Every root the gate reads is seeded with one source file, named `fixture.tsx` in
 * each so the path a finding quotes is the path the fixture was written at. A key in
 * `files` whose name is a root replaces that root's file, which is how the four trees
 * the Components do not live in are given a fixture of their own; every other key is
 * written into `components/ui`, which is where the fixtures above are shaped to sit.
 */
function run(files: Record<string, string>) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'prism-focus-gate-'))
  staged.push(dir)

  const scripts = path.join(dir, 'packages', 'ui', 'scripts')
  mkdirSync(scripts, { recursive: true })
  copyFileSync(GATE, path.join(scripts, 'check-focus-indicators.mjs'))

  for (const [root, segments] of Object.entries(ROOT_DIRS)) {
    const target = path.join(dir, 'packages', 'ui', 'src', ...segments)
    mkdirSync(target, { recursive: true })
    writeFileSync(path.join(target, 'fixture.tsx'), files[root] ?? quiet)
  }
  for (const [name, source] of Object.entries(files)) {
    if (name in ROOT_DIRS) continue
    writeFileSync(path.join(dir, 'packages', 'ui', 'src', 'components', 'ui', name), source)
  }

  return spawnSync(process.execPath, [path.join(scripts, 'check-focus-indicators.mjs')], {
    cwd: REPO,
    encoding: 'utf8',
  })
}

afterEach(() => {
  for (const dir of staged.splice(0)) rmSync(dir, { recursive: true, force: true })
})

describe('the focus-indicator gate', () => {
  it('passes a control that suppresses the outline and rings at full strength', () => {
    const result = run(EXCLUSION_FIXTURES)

    expect(result.stderr).toBe('')
    expect(result.status).toBe(0)
    expect(result.stdout).toContain('0 non-compliant')
    expect(result.stdout).toContain(
      'every suppressing class string in the scope draws its ring at full strength',
    )
  })

  const violations = [
    ['a bare outline-none', 'block size-4 rounded-full border outline-none'],
    ['a focus-scoped outline-none', 'block size-4 rounded-full border focus:outline-none'],
    [
      'a focus-scoped outline-none',
      'block size-4 rounded-full border focus-visible:outline-none',
    ],
    ['a ring-0', 'block size-4 rounded-full border outline-none ring-0'],
    ['a focus:ring-0', 'block size-4 rounded-full border outline-none focus:ring-0'],
    [
      'a focus-visible:ring-0',
      'block size-4 rounded-full border outline-none focus-visible:ring-0',
    ],
    [
      'the shipped defect: a ring width at half alpha, which is what the Slider had',
      'block size-4 rounded-full border ring-ring/50 outline-none hover:ring-4 focus-visible:ring-4',
    ],
  ] as const

  for (const [shape, classes] of violations) {
    it(`fails a control that suppresses the focus style with ${shape}`, () => {
      const result = run({
        ...EXCLUSION_FIXTURES,
        'under-test.tsx': claimsFocusable(classes),
      })

      expect(result.status).toBe(1)
      expect(result.stderr).toMatch(/error .*under-test\.tsx:\d+ under-test: suppresses /)
      expect(result.stderr).toContain('declares no full-strength focus-visible ring')
      expect(result.stderr).toContain('1 finding(s)')
    })
  }

  const compliant = [
    'block size-4 rounded-full border ring-ring outline-none focus-visible:ring-4',
    'block size-4 rounded-full border ring-ring outline-none hover:ring-4 focus-visible:ring-4',
    'block size-4 rounded-full border ring-ring outline-none focus-visible:ring-[3px]',
    'block size-4 rounded-full border outline-none focus-visible:ring-ring focus-visible:ring-[3px]',
  ]

  for (const classes of compliant) {
    it(`passes a control that rings at full strength: ${classes}`, () => {
      const result = run({ ...EXCLUSION_FIXTURES, 'under-test.tsx': claimsFocusable(classes) })

      expect(result.stderr).toBe('')
      expect(result.status).toBe(0)
    })
  }

  it('judges a control whose JSDoc makes no keyboard claim, because the claim is not what is being read', () => {
    const result = run({
      ...EXCLUSION_FIXTURES,
      'panel.tsx': saysNothing('relative grid gap-4 p-6 outline-none'),
    })

    // The claim used to decide what was read, which meant a Block whose JSDoc never
    // said the word "keyboard" had its class strings opened and thrown away. The
    // table is printed now because a claim is a fact worth seeing, not because a
    // missing one is a licence to skip the file.
    expect(result.status).toBe(1)
    expect(result.stderr).toMatch(/error .*panel\.tsx:\d+ under-test: suppresses /)
    // A run with findings reports on stderr, so the coverage it prints is there too.
    expect(result.stderr).toMatch(/9 source file\(s\) read and classified across 5 roots/)
    expect(result.stderr).toMatch(/3 of them claim a focusable control/)
  })

  it('judges every root the scope was widened to', () => {
    const offending = claimsFocusable('block size-4 rounded-full border outline-none')
    const result = run({
      ...EXCLUSION_FIXTURES,
      blocks: offending,
      pages: offending,
      live: offending,
      provider: offending,
    })

    // One file per root, and the gate recurses into the two-level trees. Reading
    // `components/ui` alone found none of these, which is the whole argument for
    // widening: a Block is where a shipped screen composes its own controls.
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('src/blocks/fixture/fixture.tsx:')
    expect(result.stderr).toContain('src/pages/fixture/fixture.tsx:')
    expect(result.stderr).toContain('src/live/fixture/fixture.tsx:')
    expect(result.stderr).toContain('src/provider/fixture.tsx:')
    expect(result.stderr).toContain('4 finding(s)')
  })

  it('fails a root that holds no source rather than reading the rest and calling it clean', () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), 'prism-focus-gate-'))
    staged.push(dir)
    const scripts = path.join(dir, 'packages', 'ui', 'scripts')
    const components = path.join(dir, 'packages', 'ui', 'src', 'components', 'ui')
    mkdirSync(scripts, { recursive: true })
    mkdirSync(components, { recursive: true })
    copyFileSync(GATE, path.join(scripts, 'check-focus-indicators.mjs'))
    writeFileSync(path.join(components, 'dialog.tsx'), EXCLUSION_FIXTURES['dialog.tsx'])

    const result = spawnSync(process.execPath, [path.join(scripts, 'check-focus-indicators.mjs')], {
      cwd: REPO,
      encoding: 'utf8',
    })

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('is not a directory, so the gate read no blocks source')
  })

  it('does not excuse a control whose slot merely ends in -item', () => {
    // The exclusion used to be a suffix, which is a statement about spelling rather
    // than about menus. Over the Blocks it swallowed radio-group-item,
    // toggle-group-item, accordion-item, breadcrumb-item, tree-item and about thirty
    // more, every one of which is an ordinary focusable control.
    const result = run({
      ...EXCLUSION_FIXTURES,
      'under-test.tsx': claimsFocusable('block size-4 rounded-full border outline-none', 'radio-item'),
    })

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('radio-item: suppresses outline-none')
  })

  it('still excuses the menu and listbox options the exclusion names', () => {
    const result = run({
      ...EXCLUSION_FIXTURES,
      'under-test.tsx': claimsFocusable('block outline-none', 'dropdown-menu-item'),
    })

    expect(result.status).toBe(0)
    expect(result.stdout).toContain('excluded, a menu or listbox option:')
  })

  it('reads the class string past a comment that carries an apostrophe', () => {
    // A `cn()` call with the reasoning for its classes between two arguments, which
    // is how this repository writes one. The apostrophe in `Base UI's` used to be
    // read as an opening quote, which hid every class after the comment from the
    // scanner: the three findings that appeared the first time a comment went inside
    // a `cn()` call were all on controls that declare a full-strength ring two lines
    // below the one the scanner read.
    const source = [
      "'use client'",
      '',
      "import { cn } from '../../lib/utils'",
      '',
      '/**',
      ' * A control under test.',
      ' *',
      ' * It is reachable by Tab and moved by the arrow keys, so it owns a focus',
      ' * indicator and has to draw one.',
      ' */',
      'function UnderTest({ className, ...props }: ComponentProps<\'button\'>) {',
      '  return (',
      '    <button',
      '      data-slot="under-test"',
      '      className={cn(',
      "        'block size-4 rounded-full border outline-none',",
      '        // The ring is at full strength because the contrast gate measures the',
      "        // token and not the alpha, and Base UI's own thumb is the same case.",
      "        'focus-visible:ring-ring focus-visible:ring-[3px]',",
      '        className,',
      '      )}',
      '      {...props}',
      '    />',
      '  )',
      '}',
      '',
      'export { UnderTest }',
      '',
    ].join('\n')

    const result = run({ ...EXCLUSION_FIXTURES, 'under-test.tsx': source })

    expect(result.status).toBe(0)
    expect(result.stderr).toBe('')
  })

  it('does not read a named constant past its own value', () => {
    // The control names `SURFACE`, which is a one-word string. Reading the
    // initialiser wrongly took everything from it to the end of the file with it,
    // which is how a menu item came to read as carrying a ring that belonged to a
    // component further down the same module.
    const source = [
      "'use client'",
      '',
      "import { cn } from '../../lib/utils'",
      '',
      '/**',
      ' * A control under test.',
      ' *',
      ' * It is reachable by Tab and moved by the arrow keys, so it owns a focus',
      ' * indicator and has to draw one.',
      ' */',
      'function UnderTest({ className, ...props }: ComponentProps<\'button\'>) {',
      '  return (',
      '    <button',
      '      data-slot="under-test"',
      '      className={cn(',
      "        'block size-4 rounded-full border outline-none',",
      '        SURFACE,',
      '        className,',
      '      )}',
      '      {...props}',
      '    />',
      '  )',
      '}',
      '',
      "const SURFACE = 'bg-card'",
      '',
      'const RING = \'focus-visible:ring-ring focus-visible:ring-[3px]\'',
      '',
      'export { UnderTest }',
      '',
    ].join('\n')

    const result = run({ ...EXCLUSION_FIXTURES, 'under-test.tsx': source })

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('under-test: suppresses outline-none')
  })

  it('fails an empty table rather than reporting a clean run', () => {
    const result = run({ 'panel.tsx': saysNothing('relative grid gap-4 p-6 outline-none') })

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('0 of them claim a focusable control')
    expect(result.stderr).toContain(
      'no source in the table claims to be keyboard operable, so the claim derivation has read',
    )
  })

  it('fails a declared exclusion that resolves to nothing', () => {
    // No dialog, select or tooltip fixture, so all three declared exclusions miss.
    const result = run({ 'under-test.tsx': claimsFocusable('block outline-none') })

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('the declared exclusion "a composite widget panel" resolved to no class string')
    expect(result.stderr).toContain('the declared exclusion "a menu or listbox option" resolved to no class string')
    expect(result.stderr).toContain('the declared exclusion "a slot the consumer fills" resolved to no class string')
  })

  it('reads its source root from its own location, not the working directory', () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), 'prism-focus-gate-'))
    staged.push(dir)
    const scripts = path.join(dir, 'packages', 'ui', 'scripts')
    mkdirSync(scripts, { recursive: true })
    copyFileSync(GATE, path.join(scripts, 'check-focus-indicators.mjs'))

    // The same run from two working directories is the same run.
    const fromPackage = spawnSync(process.execPath, [GATE], { cwd: PKG, encoding: 'utf8' })
    const fromRoot = spawnSync(process.execPath, [GATE], { cwd: REPO, encoding: 'utf8' })

    expect(fromPackage.stdout).toBe(fromRoot.stdout)
    expect(fromRoot.stdout).toMatch(/[1-9]\d* source file\(s\) read and classified across 5 roots/)
    expect(fromRoot.stdout).toMatch(/[1-9]\d* of them claim a focusable control/)

    // A copy with no source beside it fails rather than reporting an empty table as a
    // clean run, which is the same file reading its own root.
    const detached = spawnSync(process.execPath, [path.join(scripts, 'check-focus-indicators.mjs')], {
      cwd: REPO,
      encoding: 'utf8',
    })

    expect(detached.status).toBe(1)
    expect(detached.stdout).toBe('')
    expect(detached.stderr).toContain('is not a directory, so the gate read no components source')
  })

  it('states its coverage, and prints every exclusion with the slots it resolved to', () => {
    const result = spawnSync(process.execPath, [GATE], { cwd: REPO, encoding: 'utf8' })

    expect(result.status).toBe(0)
    expect(result.stdout).toMatch(/[1-9]\d* of them claim a focusable control/)
    // The module is named by its path under `src`, so a maintainer can open it. It was
    // the bare basename when the scope was one directory and two Items shared a name.
    expect(result.stdout).toContain('. components/ui/slider')
    expect(result.stdout).toContain('excluded, a composite widget panel: dialog-content')
    // The bucket, not a particular first member. Every additional menu in the
    // package adds slots to this bucket, so pinning which one happens to sort
    // first is a test that fails when a correct Component is added and passes when
    // the gate is broken. `dropdown-menu-item` is asserted as a member because it is
    // the one that proves the bucket resolves to real slots rather than printing
    // its own reason back.
    expect(result.stdout).toContain('excluded, a menu or listbox option:')
    expect(result.stdout).toMatch(/excluded, a menu or listbox option: [^\n]*dropdown-menu-item/)
    expect(result.stdout).toMatch(/excluded, a menu or listbox option: [^\n]*select-item /)
    expect(result.stdout).toContain('excluded, a slot the consumer fills: tooltip-trigger')

    // The excluded count is a fact about the shipped tree and it only ever grows as
    // menus and panels are added, so it is bounded from below rather than pinned.
    const summary = /suppressing class string\(s\) judged, \d+ at full strength, (\d+) excluded/.exec(
      result.stdout,
    )
    expect(summary).not.toBeNull()
    expect(Number(summary?.[1])).toBeGreaterThanOrEqual(12)
  })
})

describe('the shipped Slider thumb', () => {
  const source = readFileSync(SLIDER, 'utf8')

  it('declares the ring at full strength rather than at shadcn stock half alpha', () => {
    const literals = [...source.matchAll(/'([^'\n]*)'/g)].map((match) => match[1])
    expect(literals.some((value) => value.includes('shadow-xs ring-ring block size-4'))).toBe(true)
    expect(literals.some((value) => /ring-ring\/\d/.test(value))).toBe(false)
  })

  it('keeps the outline suppressed, because the ring is what replaces it', () => {
    expect(source).toContain('rounded-full border outline-none')
  })

  it('keeps the hover and focus-visible ring widths it had', () => {
    expect(source).toContain('hover:ring-4 focus-visible:ring-4')
  })

  it('takes the coarse-pointer floor as a band rather than as a size, so the drawn thumb is the box the value is read from', () => {
    const thumb = source.slice(source.indexOf('<SliderPrimitive.Thumb'))
    expect(thumb).toContain('pointer-coarse:before:h-11')
    expect(thumb).toContain('pointer-coarse:before:w-11')
    // A `size-11` here would put a 44px ball on a six pixel rail and, because the
    // value is computed from the control's own box against a press offset read from
    // the thumb's own box, would leave the drawing and the arithmetic disagreeing.
    expect(thumb).not.toMatch(/pointer-coarse:(?:size|h|w|min-w)-/)
  })

  it('says why the ring is at full strength, next to the class', () => {
    const thumb = source.slice(source.indexOf('<SliderPrimitive.Thumb'))
    expect(thumb).toContain('at full strength')
    expect(thumb).toContain('the contrast gate measures a')
  })
})