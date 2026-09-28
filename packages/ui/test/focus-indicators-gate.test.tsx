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
 * The focus-indicator gate, run as a process against staged Component source.
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
 */
const PKG = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const GATE = path.join(PKG, 'scripts', 'check-focus-indicators.mjs')
const REPO = path.join(PKG, '..', '..')
const SLIDER = path.join(PKG, 'src', 'components', 'ui', 'slider.tsx')

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

/** A component that says nothing about the keyboard, so it is not in the table. */
const saysNothing = (classes: string) =>
  component(classes, 'A panel that holds other controls and is not one itself.')

const EXCLUSION_FIXTURES = {
  'dialog.tsx': claimsFocusable('relative grid gap-4 p-6 outline-none', 'dialog-content'),
  'select.tsx': claimsFocusable('relative flex w-full outline-none select-none', 'select-item'),
  'tooltip.tsx': claimsFocusable('outline-none', 'tooltip-trigger'),
}

/** Copy the real gate beside a staged `src/components/ui` and run it from the repo root. */
function run(files: Record<string, string>) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'prism-focus-gate-'))
  staged.push(dir)

  const scripts = path.join(dir, 'packages', 'ui', 'scripts')
  const components = path.join(dir, 'packages', 'ui', 'src', 'components', 'ui')
  mkdirSync(scripts, { recursive: true })
  mkdirSync(components, { recursive: true })
  copyFileSync(GATE, path.join(scripts, 'check-focus-indicators.mjs'))
  for (const [name, source] of Object.entries(files)) {
    writeFileSync(path.join(components, name), source)
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
    expect(result.stdout).toContain('every focusable claim in the table draws its ring at full strength')
  })

  const violations = [
    ['a bare outline-none', 'block size-4 rounded-full border outline-none'],
    ['a focus-scoped outline-none', 'block size-4 rounded-full border focus:outline-none'],
    [
      'a focus-visible-scoped outline-none',
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

  it('does not judge a control whose JSDoc makes no keyboard claim', () => {
    const result = run({
      ...EXCLUSION_FIXTURES,
      'panel.tsx': saysNothing('relative grid gap-4 p-6 outline-none'),
    })

    expect(result.status).toBe(0)
    expect(result.stdout).not.toContain('panel.tsx')
    expect(result.stdout).toMatch(/4 Component source\(s\) read and classified/)
    expect(result.stdout).toMatch(/3 of them claim a focusable control/)
  })

  it('fails an empty table rather than reporting a clean run', () => {
    const result = run({ 'panel.tsx': saysNothing('relative grid gap-4 p-6 outline-none') })

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('0 of them claim a focusable control')
    expect(result.stderr).toContain('no Component in the table claims to be keyboard operable')
  })

  it('fails a declared exclusion that resolves to nothing', () => {
    // No dialog, select or tooltip fixture, so all three declared exclusions miss.
    const result = run({ 'under-test.tsx': claimsFocusable('block outline-none') })

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('the declared exclusion "a composite widget panel" resolved to no class string')
    expect(result.stderr).toContain('the declared exclusion "a composite widget option" resolved to no class string')
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
    expect(fromRoot.stdout).toMatch(/[1-9]\d* Component source\(s\) read and classified/)
    expect(fromRoot.stdout).toMatch(/[1-9]\d* of them claim a focusable control/)

    // A copy with no Component source beside it fails rather than reporting an
    // empty table as a clean run, which is the same file reading its own root.
    const detached = spawnSync(process.execPath, [path.join(scripts, 'check-focus-indicators.mjs')], {
      cwd: REPO,
      encoding: 'utf8',
    })

    expect(detached.status).toBe(1)
    expect(detached.stdout).toBe('')
    expect(detached.stderr).toContain('does not exist, so the gate read no Component source')
  })

  it('states its coverage, and prints every exclusion with the slots it resolved to', () => {
    const result = spawnSync(process.execPath, [GATE], { cwd: REPO, encoding: 'utf8' })

    expect(result.status).toBe(0)
    expect(result.stdout).toMatch(/[1-9]\d* of them claim a focusable control/)
    expect(result.stdout).toContain('. slider')
    expect(result.stdout).toContain('excluded, a composite widget panel: dialog-content')
    expect(result.stdout).toContain('excluded, a composite widget option: dropdown-menu-item')
    expect(result.stdout).toContain('select-item (src/components/ui/select.tsx:193)')
    expect(result.stdout).toContain('excluded, a slot the consumer fills: tooltip-trigger')
    expect(result.stdout).toMatch(
      /[1-9]\d* suppressing class string\(s\) judged, \d+ at full strength, 12 excluded, 0 non-compliant/,
    )
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

  it('says why the ring is at full strength, next to the class', () => {
    const thumb = source.slice(source.indexOf('<SliderPrimitive.Thumb'))
    expect(thumb).toContain('at full strength')
    expect(thumb).toContain('the contrast gate measures a')
  })
})
