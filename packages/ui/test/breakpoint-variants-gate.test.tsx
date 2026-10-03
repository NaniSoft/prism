import { spawnSync, type SpawnSyncReturns } from 'node:child_process'
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

/**
 * The breakpoint-variant gate, run as a process over the real tree and over
 * staged defects.
 *
 * A gate that has never been red is not evidence, so every rule is proved here
 * by feeding it a fixture that breaks it, and each fixture is a class string
 * rather than a whole component, because the unit of the rule is a class. The
 * shipped script is copied rather than reimplemented, so what runs is the file
 * that runs in `pnpm check`, and it is invoked with the working directory set to
 * this repository's root rather than to the fixture, which is also how it proves
 * it reads its roots and the token source from its own location.
 *
 * A staged tree rather than a probe written into the real one, for the reason
 * `pack-boundary-gate.test.tsx` gives: a probe in the real tree is a file other
 * suites read, so a case can fail for a reason that has nothing to do with the
 * rule under test. Each staged tree carries the gate, the authored token source
 * and the token build beside it, because the run fails on a missing root rather
 * than reading what is not there.
 */
const REPO = path.resolve(import.meta.dirname, '..', '..', '..')
const PKG = path.join(REPO, 'packages', 'ui')
const GATE = 'check-breakpoint-variants.mjs'
const DOCS_SHELL = path.join(PKG, 'src', 'pages', 'docs-shell', 'docs-shell.tsx')

/** Copied beside every staged gate, because both are the gate's authority. */
const AUTHORITY = [
  'packages/tokens/src/foundation/layout.tokens.json',
  'packages/tokens/build/build.mjs',
]

/**
 * One clean file in each root, so a case fails because of the one class string
 * it changed. It also carries a `lg:` variant, so the run's assertion that at
 * least one responsive variant was read cannot fire for the wrong reason.
 */
const BASELINE: Record<string, string> = {
  'packages/ui/src/components/ui/probe.tsx': [
    "export function Probe({ className }: { className?: string }) {",
    "  return <div className={`flex flex-col lg:gap-10 ${className ?? ''}`} />",
    '}',
    '',
  ].join('\n'),
  'apps/site/src/probe.tsx': [
    'export const SITE = [',
    "  'mx-auto w-full max-w-6xl px-6 py-10 lg:px-8',",
    ']',
    '',
  ].join('\n'),
}

const staged: string[] = []

afterEach(() => {
  for (const dir of staged.splice(0)) rmSync(dir, { force: true, recursive: true })
})

/** A staged tree holding `files`, and the run against it. */
function stage(files: Record<string, string>): SpawnSyncReturns<string> {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'prism-breakpoints-'))
  staged.push(dir)

  const write = (relative: string, source: string) => {
    const to = path.join(dir, relative)
    mkdirSync(path.dirname(to), { recursive: true })
    writeFileSync(to, source)
  }

  write(`packages/ui/scripts/${GATE}`, readFileSync(path.join(PKG, 'scripts', GATE), 'utf8'))
  for (const relative of AUTHORITY) {
    write(relative, readFileSync(path.join(REPO, relative), 'utf8'))
  }
  for (const [relative, source] of Object.entries({ ...BASELINE, ...files })) {
    write(relative, source)
  }

  return spawnSync(process.execPath, [path.join(dir, 'packages', 'ui', 'scripts', GATE)], {
    cwd: REPO,
    encoding: 'utf8',
  })
}

/** A component whose class string is the only thing that varies. */
function component(classes: string) {
  return [
    "import { cn } from '../../lib/utils'",
    '',
    'export function UnderTest({ className }: { className?: string }) {',
    `  return <div className={cn('flex flex-col', '${classes}', className)} />`,
    '}',
    '',
  ].join('\n')
}

const underTest = (classes: string) => ({
  'packages/ui/src/components/ui/under-test.tsx': component(classes),
})

describe('the breakpoint-variant gate', () => {
  it('passes on the real tree, and states the screens it compared against', () => {
    const result = spawnSync(process.execPath, [path.join(PKG, 'scripts', GATE)], {
      cwd: REPO,
      encoding: 'utf8',
    })

    expect(result.stderr).toBe('')
    expect(result.status).toBe(0)
    expect(result.stdout).toMatch(/0 finding\(s\) in \d+ file\(s\) read from 2 root\(s\)/)
    expect(result.stdout).toMatch(/[1-9]\d* responsive variant\(s\) judged/)
    // Both halves of the authority are named on the line, so a reader can tell
    // which set of screens the run held the classes to without reading the file.
    expect(result.stdout).toContain('layout.tokens.json: lg, md, sm')
    expect(result.stdout).toContain("closed with `initial` by packages/tokens/build/build.mjs: 2xl, xl")
    expect(result.stdout).toContain('every responsive variant read names a screen the token package emits')
  })

  it('fails the exact class the shipped DocsShell frame carried', () => {
    const result = stage(
      underTest('lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] xl:grid-cols-[15rem_minmax(0,1fr)_13rem]'),
    )

    expect(result.status).toBe(1)
    expect(result.stderr).toMatch(
      /error packages\/ui\/src\/components\/ui\/under-test\.tsx:\d+ {2}`xl:grid-cols-\[15rem_minmax\(0,1fr\)_13rem\]` names the screen `xl`/,
    )
    expect(result.stderr).toContain('the token build closes `xl` with `--breakpoint-xl: initial`')
    expect(result.stderr).toContain('Screens this repository emits: lg, md, sm')
    expect(result.stdout).toMatch(/1 finding\(s\)/)
  })

  const closed = [
    ['a 2xl class', '2xl:grid-cols-3'],
    ['a max-xl ranged class', 'max-xl:gap-4'],
    ['a min-2xl ranged class', 'min-2xl:flex-row'],
  ] as const

  for (const [shape, classes] of closed) {
    it(`fails ${shape}`, () => {
      const result = stage(underTest(classes))

      expect(result.status).toBe(1)
      expect(result.stderr).toContain('the token build closes')
      expect(result.stderr).toContain('compiles no media query for it and the utility is dead at every width')
    })
  }

  it('fails a screen neither the token source nor the token build mentions', () => {
    const result = stage(underTest('3xl:grid-cols-4'))

    expect(result.status).toBe(1)
    // The two failures a class can have are told apart in the message: one is a
    // screen this repository closed on purpose, the other is a screen nobody
    // authored, which is a name invented at the call site.
    expect(result.stderr).toContain('names the screen `3xl`')
    expect(result.stderr).toContain('no threshold for it was ever authored')
    expect(result.stderr).not.toContain('the token build closes `3xl`')
  })

  const emitted = [
    'lg:grid-cols-3',
    'sm:px-6 md:py-10 lg:px-8',
    'min-lg:flex-row max-md:flex-col',
    'hover:underline focus-visible:ring-4 dark:bg-muted',
    'group-hover:underline peer-checked:text-foreground',
    'odd:border-t even:border-b first:ps-3 ltr:text-start rtl:text-end',
    'data-[state=open]:bg-accent supports-[display:grid]:grid',
    'grid-cols-[15rem_minmax(0,1fr)_13rem] max-w-measure min-h-dvh',
  ] as const

  for (const classes of emitted) {
    it(`passes the classes the token package emits: ${classes}`, () => {
      const result = stage(underTest(classes))

      expect(result.stderr).toBe('')
      expect(result.status).toBe(0)
    })
  }

  it('passes a variant map whose key happens to be named xl', () => {
    // The shape `Heading` and `Price` both ship. The key is a step on a type
    // scale, and a scan that read source lines rather than class strings would
    // report it as a dead breakpoint.
    const result = stage({
      'packages/ui/src/components/ui/under-test.tsx': [
        "import { cva } from 'class-variance-authority'",
        '',
        "const variants = cva('font-semibold', {",
        '  variants: {',
        '    size: {',
        "      '4xl': 'text-3xl sm:text-4xl',",
        "      xl: 'text-xl',",
        "      lg: 'text-lg',",
        '    },',
        '  },',
        '})',
        '',
        'export { variants }',
        '',
      ].join('\n'),
    })

    expect(result.stderr).toBe('')
    expect(result.status).toBe(0)
  })

  it('passes a screen named in a comment, which is a record rather than a class', () => {
    const result = stage({
      'packages/ui/src/components/ui/under-test.tsx': [
        '/**',
        ' * A control under test.',
        ' *',
        " * The frame once read `xl:grid-cols-[15rem_minmax(0,1fr)_13rem]`, and an",
        ' * `xl:` utility cannot resolve to a value this repository never authored,',
        ' * so the class is quoted here rather than written.',
        ' */',
        'export function UnderTest() {',
        "  return <div className='flex lg:flex-row' />",
        '}',
        '',
      ].join('\n'),
    })

    expect(result.stderr).toBe('')
    expect(result.status).toBe(0)
  })

  it('fails a run that judged no variant rather than reporting a clean run', () => {
    const result = stage({
      'packages/ui/src/components/ui/probe.tsx': 'export const NOTHING = "flex items-center gap-2"\n',
      'apps/site/src/probe.tsx': 'export const ALSO_NOTHING = "w-full max-w-6xl"\n',
    })

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('no responsive variant was read in')
    expect(result.stderr).toContain('A tree that carries no `sm:` is a tree this rule cannot see')
  })

  it('fails loudly when a configured root does not resolve', () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), 'prism-breakpoints-'))
    staged.push(dir)
    const write = (relative: string, source: string) => {
      const to = path.join(dir, relative)
      mkdirSync(path.dirname(to), { recursive: true })
      writeFileSync(to, source)
    }
    write(`packages/ui/scripts/${GATE}`, readFileSync(path.join(PKG, 'scripts', GATE), 'utf8'))
    for (const relative of AUTHORITY) {
      write(relative, readFileSync(path.join(REPO, relative), 'utf8'))
    }
    write('packages/ui/src/probe.tsx', BASELINE['packages/ui/src/components/ui/probe.tsx'])
    // `apps/site/src` is never created, so one of the two configured roots is
    // missing and the run has to say so rather than report the half it did read.
    const result = spawnSync(process.execPath, [path.join(dir, 'packages', 'ui', 'scripts', GATE)], {
      cwd: REPO,
      encoding: 'utf8',
    })

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('1 of 2 configured root does not resolve: "apps/site/src"')
    expect(result.stderr).toContain('the gate was run from the wrong working directory')
    expect(result.stdout).not.toContain('every responsive variant read names a screen')
  })

  it('reads its roots from its own location, not the working directory', () => {
    const fromPackage = spawnSync(process.execPath, [path.join(PKG, 'scripts', GATE)], {
      cwd: PKG,
      encoding: 'utf8',
    })
    const fromRoot = spawnSync(process.execPath, [path.join(PKG, 'scripts', GATE)], {
      cwd: REPO,
      encoding: 'utf8',
    })

    expect(fromPackage.status).toBe(0)
    // The property this test is for: the two runs agree, so the caller's working
    // directory cannot change what was read.
    expect(fromPackage.stdout).toBe(fromRoot.stdout)
  })
})

describe('the shipped DocsShell frame', () => {
  const source = readFileSync(DOCS_SHELL, 'utf8')

  it('sizes the contents rail with a track the emitted theme compiles', () => {
    expect(source).toContain("contents ? 'lg:grid lg:grid-cols-[15rem_minmax(0,1fr)_13rem]'")
    expect(source).toContain(": 'lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]'")
    // The class that was there, so a reintroduction is visible in a diff rather
    // than in a rendered page nobody measures.
    expect(source).not.toContain('xl:grid-cols-')
  })

  it('places the contents rail in the third track, not an implicit one', () => {
    expect(source).toContain('lg:col-start-3 lg:row-start-1 lg:block')
  })

  it('says why the third track is at the same width as the two-column frame', () => {
    // The comment is wrapped prose behind line comments, so the markers come off
    // and the text is collapsed before the sentences are asserted: a test that
    // pinned a wrap point would fail on a rewrap and pass on a reworded claim.
    const at = source.indexOf('docs-shell-frame')
    const frame = source
      .slice(at, at + 1400)
      .replace(/^\s*\/\/ ?/gm, '')
      .replace(/\s+/g, ' ')
    expect(frame).toContain('the emitted theme closes `xl` with `initial`')
    expect(frame).toContain('check-breakpoint-variants.mjs')
  })

  it('states the three columns in the JSDoc the declaration build preserves', () => {
    const doc = source.slice(0, source.indexOf('export function DocsShell')).replace(/\s+/g, ' ')
    expect(doc).toContain('The frame is three columns from `lg`')
    expect(doc).toContain('The rail is 15rem, the document takes the rest, and the contents rail')
  })
})
