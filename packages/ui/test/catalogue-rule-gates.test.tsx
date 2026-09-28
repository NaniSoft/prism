import { spawnSync } from 'node:child_process'
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'

/**
 * The four catalogue-rule gates, each run as a process over staged source.
 *
 * A gate that has never been red is not evidence, so every rule here is proved by
 * feeding the gate a fixture that breaks it, and every gate is proved to pass over
 * a clean fixture first: a rule that failed everything would be indistinguishable
 * from a rule that worked.
 *
 * The shipped script is copied rather than reimplemented, so what runs is the file
 * that runs in CI, and it is invoked with the working directory set to this
 * repository's root rather than to the fixture, which is also how it proves it
 * resolves its roots from its own location.
 */
const PKG = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const REPO = path.join(PKG, '..', '..')

const staged: string[] = []

afterEach(() => {
  for (const dir of staged.splice(0)) rmSync(dir, { recursive: true, force: true })
})

/**
 * Stage a tree beside a copy of one gate and run the copy.
 *
 * `files` are paths relative to the package root the gate will resolve from its
 * own location, so a fixture that omits a configured root is how the "a root that
 * resolves to nothing fails the run" case is staged.
 */
function run(gate: string, files: Record<string, string>, cwd = REPO) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'prism-rule-gate-'))
  staged.push(dir)

  const pkg = path.join(dir, 'packages', 'ui')
  const scripts = path.join(pkg, 'scripts')
  mkdirSync(scripts, { recursive: true })
  copyFileSync(path.join(PKG, 'scripts', gate), path.join(scripts, gate))

  for (const [name, source] of Object.entries(files)) {
    const file = path.join(pkg, ...name.split('/'))
    mkdirSync(path.dirname(file), { recursive: true })
    writeFileSync(file, source, 'utf8')
  }

  return spawnSync(process.execPath, [path.join(scripts, gate)], { cwd, encoding: 'utf8' })
}

/** A Component that carries the documentation comment a rule requires. */
const documented = (name: string) =>
  [
    "import { cn } from '../../lib/utils'",
    '',
    '/**',
    ` * The ${name}, documented on the declaration itself.`,
    ' */',
    `function ${name}({ className }: { className?: string }) {`,
    "  return <div className={cn('p-4', className)} />",
    '}',
    '',
    `export { ${name} }`,
    '',
  ].join('\n')

/** The same Component with a declaration between its comment and its export. */
const detached = (name: string) =>
  [
    "import { cn } from '../../lib/utils'",
    '',
    '/**',
    ` * The ${name}, documented on the wrong declaration.`,
    ' */',
    "const UNRELATED = 'p-4'",
    '',
    `function ${name}({ className }: { className?: string }) {`,
    "  return <div className={cn('p-4', className)} />",
    '}',
    '',
    `export { ${name} }`,
    '',
  ].join('\n')

/* -------------------------------------------------------------------------- */
/* check-item-docs                                                            */
/* -------------------------------------------------------------------------- */

describe('the item documentation gate', () => {
  // The clean fixture carries one file for every declared exclusion as well as one
  // Item per kind, because a declared exclusion that resolves to nothing is itself
  // a finding: a fixture that omitted them would fail the gate for a reason that
  // has nothing to do with the rule under test.
  const CLEAN = {
    'src/components/ui/widget.tsx': documented('Widget'),
    'src/components/ui/widget.test.tsx': 'export {}\n',
    'src/blocks/thing-01/thing.tsx': documented('Thing01'),
    'src/blocks/thing-01/index.tsx': "export { Thing01, default } from './thing'\n",
    'src/pages/thing-page/thing-page.tsx': documented('ThingPage'),
    'src/pages/thing-page/index.tsx': "export { ThingPage, default } from './thing-page'\n",
  }

  it('passes a Component, a Block and a Page that each carry an attached comment', () => {
    const result = run('check-item-docs.mjs', CLEAN)

    expect(result.stderr).toBe('')
    expect(result.status).toBe(0)
    expect(result.stdout).toContain('0 finding(s)')
    expect(result.stdout).toMatch(/\d+ Item declaration\(s\)/)
  })

  it('fails an Item whose documentation comment is not attached to the declaration', () => {
    const result = run('check-item-docs.mjs', {
      ...CLEAN,
      'src/components/ui/widget.tsx': detached('Widget'),
    })

    expect(result.status).toBe(1)
    expect(result.stderr).toMatch(/error .*widget\.tsx:\d+ +\[no-attached-doc\] +Widget/)
    expect(result.stdout).toContain('1 finding(s)')
  })

  it('fails a Component that carries no documentation comment at all', () => {
    const result = run('check-item-docs.mjs', {
      ...CLEAN,
      'src/components/ui/widget.tsx': documented('Widget').replace(
        /\/\*\*[\s\S]*?\*\/\n/,
        '',
      ),
    })

    expect(result.status).toBe(1)
    expect(result.stderr).toMatch(/\[no-attached-doc\] +Widget/)
  })

  it('prints every exclusion with its reason on every run', () => {
    const result = run('check-item-docs.mjs', CLEAN)

    expect(result.status).toBe(0)
    expect(result.stdout).toContain('excluded, a co-located test: 1 file(s)')
    expect(result.stdout).toContain('excluded, a re-export module: 2 file(s)')
    expect(result.stdout).toContain('because a test file beside a Component')
  })

  it('fails a root that resolves to nothing rather than reporting a clean tree', () => {
    const result = run('check-item-docs.mjs', {
      'src/components/ui/widget.tsx': documented('Widget'),
    })

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('configured roots do not resolve')
    expect(result.stderr).toContain('"src/blocks"')
  })

  it('fails a run that resolved every root and read no file', () => {
    // Every root resolves and every file in them is covered by a declared
    // exclusion, so the run reads nothing and a clean report would be a lie.
    const result = run('check-item-docs.mjs', {
      'src/components/ui/widget.test.tsx': 'export {}\n',
      'src/blocks/thing-01/index.tsx': "export { Thing01 } from './thing'\n",
      'src/pages/thing-page/meta.json': '{}\n',
    })

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('read 0 files')
  })

  it('reads its roots from its own location, not from the working directory', () => {
    const fromPackage = run('check-item-docs.mjs', CLEAN, PKG)
    const fromRoot = run('check-item-docs.mjs', CLEAN, REPO)

    expect(fromPackage.stdout).toBe(fromRoot.stdout)
    expect(fromRoot.stdout).toMatch(/[1-9]\d* Item declaration\(s\)/)
  })
})

/* -------------------------------------------------------------------------- */
/* check-block-copy                                                           */
/* -------------------------------------------------------------------------- */

/**
 * A Block whose every word came from a prop, and which carries one file's worth of
 * each of the five declared exclusions: the client directive, a class string and a
 * `data-*` value, a JSDoc block, a template literal and a module specifier. A
 * fixture that omitted them would fail the gate's stale-exclusion rule for a
 * reason that has nothing to do with the rule under test.
 */
const cleanBlock = [
  "'use client'",
  '',
  "import { Section } from '../../components/ui/section'",
  '',
  '/**',
  ' * A Block whose every word came from a prop.',
  ' */',
  'export type Thing01Props = { title: string }',
  '',
  'export function Thing01({ title }: Thing01Props) {',
  '  if (title === \'\') throw new Error(\'Thing01: title is required\')',
  '  const id = `thing-${title}`',
  '  return (',
  '    <Section data-slot="thing-01" className="py-16 sm:py-24">',
  '      <h2 className="text-3xl font-semibold">{title}</h2>',
  '      <span className="sr-only">{id}</span>',
  '    </Section>',
  '  )',
  '}',
  '',
].join('\n')

/**
 * A Component that exercises the three exclusions the Component layer added.
 *
 * A type argument, because a Component narrows a type it forwards rather than
 * writing its own; a prop default, because every accessible name a control owns
 * is a default a caller may override; and a vector coordinate, because a drawing
 * is written in numbers that happen to carry a space. The fixture has to carry
 * all three or the gate reports them as exclusions that resolve to nothing, which
 * is the gate's own rule and is the reason this comment exists.
 */
const cleanComponent = [
  "import type { ComponentProps } from 'react'",
  '',
  '/**',
  ' * A control that owns a default name and a caller may replace it.',
  ' */',
  "export function Thing({ label = 'Thing' }: Omit<ComponentProps<'div'>, 'onValueChange'>) {",
  "  if (label === 'ArrowDown') return null",
  "  return <div aria-label={label} data-slot='thing'><line x1='4 4' /></div>",
  '}',
  '',
].join('\n')

describe('the no-copy gate', () => {
  // Every configured root has to exist in a staged fixture, or the gate's own
  // root-resolution assertion fires before it can report anything. The Component
  // root is a third one as of the gate reading the Component layer, and a fixture
  // that omitted it would fail for a reason that has nothing to do with the rule
  // under test, which is the stale-exclusion hazard the fixture comments already
  // describe for the exclusions.
  const CLEAN = {
    'src/components/ui/thing.tsx': cleanComponent,
    'src/blocks/thing-01/index.tsx': cleanBlock,
    'src/pages/thing-page/index.tsx': cleanBlock,
  }

  it('passes a Block and a Page that render only what a caller passed', () => {
    const result = run('check-block-copy.mjs', CLEAN)

    expect(result.stderr).toBe('')
    expect(result.status).toBe(0)
    expect(result.stdout).toContain('0 finding(s)')
    expect(result.stdout).toMatch(/[1-9]\d* string literal\(s\) classified/)
  })

  it('fails a hardcoded sentence, which is the defect the rule exists for', () => {
    const result = run('check-block-copy.mjs', {
      ...CLEAN,
      'src/blocks/thing-01/index.tsx': cleanBlock.replace(
        '      <h2 className="text-3xl font-semibold">{title}</h2>',
        '      <span>Most chosen</span>\n      <h2 className="text-3xl font-semibold">{title}</h2>',
      ),
    })

    expect(result.status).toBe(1)
    expect(result.stderr).toMatch(/\[hardcoded-copy\] +"Most chosen"/)
  })

  it('fails a hardcoded accessible name, because a screen reader reads one', () => {
    const result = run('check-block-copy.mjs', {
      ...CLEAN,
      'src/blocks/thing-01/index.tsx': cleanBlock.replace(
        '<Section data-slot="thing-01" className="py-16 sm:py-24">',
        '<Section data-slot="thing-01" aria-label="Ways out" className="py-16 sm:py-24">',
      ),
    })

    expect(result.status).toBe(1)
    expect(result.stderr).toMatch(/\[hardcoded-copy\] +"Ways out"/)
  })

  it('does not judge a utility class string, a module path or a lowercase token', () => {
    const result = run('check-block-copy.mjs', {
      ...CLEAN,
      'src/blocks/thing-01/index.tsx': [
        "'use client'",
        "import { ArrowRight } from 'lucide-react'",
        '',
        '/**',
        ' * A Block that uses no class string shape a word regex would catch.',
        ' */',
        'export function Thing01({ title }: { title: string }) {',
        '  const id = `thing-${title}`',
        '  return <div className="flex gap-4" data-slot="thing-01" role="note">{id}</div>',
        '}',
        '',
      ].join('\n'),
    })

    expect(result.status).toBe(0)
  })

  it('prints every exclusion with its reason on every run', () => {
    const result = run('check-block-copy.mjs', CLEAN)

    expect(result.stdout).toContain('excluded, the client directive:')
    expect(result.stdout).toContain('excluded, a markup attribute:')
    expect(result.stdout).toContain('excluded, a documentation fragment:')
    expect(result.stdout).toContain('excluded, a template literal:')
    expect(result.stdout).toContain('excluded, a module specifier:')
    expect(result.stdout).toContain('because a module marker the React server-component runtime reads')
  })

  it('fails a declared exclusion that resolves to nothing', () => {
    // The fixture drops the client directive and the template literal, so the
    // declared exclusions that cover them have nothing to resolve and are
    // reported. The Component file is staged so the gate gets past its own
    // root-resolution assertion, which fires first and would otherwise be the
    // only thing this test could observe.
    const result = run('check-block-copy.mjs', {
      'src/components/ui/thing.tsx': cleanComponent,
      'src/blocks/thing-01/index.tsx': cleanBlock
        .replace("'use client'\n\n", '')
        .replace("  if (title === '') throw new Error('Thing01: title is required')\n", '')
        .replace('  const id = `thing-${title}`\n', '  const id = title\n')
        .replace('      <span className="sr-only">{id}</span>\n', ''),
      'src/pages/thing-page/index.tsx': cleanBlock
        .replace("'use client'\n\n", '')
        .replace("  if (title === '') throw new Error('Thing01: title is required')\n", '')
        .replace('  const id = `thing-${title}`\n', '  const id = title\n')
        .replace('      <span className="sr-only">{id}</span>\n', ''),
    })

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('the declared exclusion "the client directive" resolved to nothing')
    expect(result.stderr).toContain('the declared exclusion "a template literal" resolved to nothing')
    expect(result.stderr).toContain(
      'the declared exclusion "a thrown diagnostic" resolved to nothing',
    )
  })

  it('fails a word-shaped literal that is not a key name, so the key exclusion is a set and not a position', () => {
    // The key-name exclusion is a set from the DOM rather than a rule about the
    // position, so a sentence in the position a key name occupies is still a
    // finding. Without this the exclusion would be a hole shaped exactly like a
    // keyboard model, which is where a copy string would be easiest to hide.
    const result = run('check-block-copy.mjs', {
      'src/components/ui/thing.tsx': [
        "import type { ComponentProps } from 'react'",
        '',
        '/**',
        ' * A control with a keyboard model and a sentence where a key name belongs.',
        ' */',
        "export function Thing({ label = 'Thing' }: Omit<ComponentProps<'div'>, 'onValueChange'>) {",
        "  if (label === 'Press enter to continue') return null",
        "  if (label === 'Go back') return null",
        "  if (label === 'ArrowDown') return null",
        "  return <div aria-label={label} data-slot='thing'><line x1='4 4' /></div>",
        '}',
        '',
      ].join('\n'),
      'src/blocks/thing-01/index.tsx': cleanBlock,
      'src/pages/thing-page/index.tsx': cleanBlock,
    })

    expect(result.status).toBe(1)
    // The two sentences are findings, and the key name beside them is not, which
    // is the whole claim: the exclusion is a set and not a shape of position.
    expect(result.stderr).toMatch(/\[hardcoded-copy\] +"Press enter to continue"/)
    expect(result.stderr).toMatch(/\[hardcoded-copy\] +"Go back"/)
    expect(result.stderr).not.toMatch(/\[hardcoded-copy\] +"ArrowDown"/)
  })

  it('fails a root that resolves to nothing rather than reporting a clean tree', () => {
    const result = run('check-block-copy.mjs', {
      'src/components/ui/thing.tsx': cleanComponent,
      'src/blocks/thing-01/index.tsx': cleanBlock,
    })

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('"src/pages"')
  })
})

/* -------------------------------------------------------------------------- */
/* check-item-category                                                        */
/* -------------------------------------------------------------------------- */

const catalogue = (entries: readonly string[]) =>
  ['export const catalog = [', ...entries, ']', ''].join('\n')

const entry = (name: string, kind: string, category: string) =>
  `  { name: '${name}', slug: '${name.toLowerCase()}', kind: '${kind}', category: ${category}, },`

describe('the closed Category gate', () => {
  const CLEAN = {
    'src/catalog.ts': catalogue([
      entry('Widget', 'component', "'Layout'"),
      entry('Thing01', 'block', 'null'),
      entry('ThingPage', 'page', 'null'),
    ]),
    'src/components/ui/widget.tsx': documented('Widget'),
    'src/components/ui/widget.test.tsx': 'export {}\n',
    'src/blocks/thing-01/thing.tsx': documented('Thing01'),
    'src/blocks/thing-01/index.tsx': "export { Thing01 } from './thing'\n",
    'src/pages/thing-page/thing-page.tsx': documented('ThingPage'),
    'src/pages/thing-page/index.tsx': "export { ThingPage } from './thing-page'\n",
  }

  it('passes a Component under one of the seven and a Block and a Page under none', () => {
    const result = run('check-item-category.mjs', CLEAN)

    expect(result.stderr).toBe('')
    expect(result.status).toBe(0)
    expect(result.stdout).toContain('0 finding(s)')
    expect(result.stdout).toContain('Layout: 1 Component(s)')
    expect(result.stdout).toContain('Miscellaneous: 0 Component(s)')
  })

  it('fails a Block filed under a Category, which is a role it does not have', () => {
    const result = run('check-item-category.mjs', {
      ...CLEAN,
      'src/catalog.ts': CLEAN['src/catalog.ts']!.replace(
        entry('Thing01', 'block', 'null'),
        entry('Thing01', 'block', "'Layout'"),
      ),
    })

    expect(result.status).toBe(1)
    expect(result.stderr).toMatch(/\[categorised-block\] +"Thing01"/)
  })

  it('fails a Page filed under a Category', () => {
    const result = run('check-item-category.mjs', {
      ...CLEAN,
      'src/catalog.ts': CLEAN['src/catalog.ts']!.replace(
        entry('ThingPage', 'page', 'null'),
        entry('ThingPage', 'page', "'Data display'"),
      ),
    })

    expect(result.status).toBe(1)
    expect(result.stderr).toMatch(/\[categorised-page\] +"ThingPage"/)
  })

  it('fails a Component under an eighth Category, which is a decision made by typing', () => {
    const result = run('check-item-category.mjs', {
      ...CLEAN,
      'src/catalog.ts': CLEAN['src/catalog.ts']!.replace(
        entry('Widget', 'component', "'Layout'"),
        entry('Widget', 'component', "'Branding'"),
      ),
    })

    expect(result.status).toBe(1)
    expect(result.stderr).toMatch(/\[unknown-category\] +"Widget".*"Branding"/)
  })

  it('fails a Component with no Category at all', () => {
    const result = run('check-item-category.mjs', {
      ...CLEAN,
      'src/catalog.ts': CLEAN['src/catalog.ts']!.replace(
        entry('Widget', 'component', "'Layout'"),
        entry('Widget', 'component', 'null'),
      ),
    })

    expect(result.status).toBe(1)
    expect(result.stderr).toMatch(/\[uncategorised-component\] +"Widget"/)
  })

  it('fails a roster it could not read, rather than reporting an empty one', () => {
    const result = run('check-item-category.mjs', {
      ...CLEAN,
      'src/catalog.ts': 'export const catalog = []\n',
    })

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('the `catalog` array is empty')
  })

  it('fails a root that resolves to nothing rather than reporting a clean tree', () => {
    const result = run('check-item-category.mjs', {
      'src/catalog.ts': CLEAN['src/catalog.ts']!,
      'src/components/ui/widget.tsx': documented('Widget'),
    })

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('"src/blocks"')
  })
})

/* -------------------------------------------------------------------------- */
/* check-block-imports                                                        */
/* -------------------------------------------------------------------------- */

const blockWith = (imports: string, body = '') =>
  [imports, '', 'export function Thing01() {', `  return (${body || '<div />'})`, '}', '', ''].join(
    '\n',
  )

describe('the no-fetch gate', () => {
  const CLEAN = {
    'src/blocks/thing-01/index.tsx': blockWith(
      "import { useRouter } from 'react'\nimport { Section } from '../../components/ui/section'",
    ),
    'src/pages/thing-page/index.tsx': blockWith(
      "import { Section } from '../../components/ui/section'",
    ),
  }

  it('passes a Block and a Page that import nothing they may not', () => {
    const result = run('check-block-imports.mjs', CLEAN)

    expect(result.stderr).toBe('')
    expect(result.status).toBe(0)
    expect(result.stdout).toContain('0 finding(s)')
    expect(result.stdout).toContain('denied, a client router: 0 hit(s)')
  })

  it('fails a Block that imports a client router', () => {
    const result = run('check-block-imports.mjs', {
      ...CLEAN,
      'src/blocks/thing-01/index.tsx': blockWith("import { useRouter } from 'next/navigation'"),
    })

    expect(result.status).toBe(1)
    expect(result.stderr).toMatch(/\[denied-module\] +"next\/navigation" is a client router/)
  })

  it('fails a Page that imports a data client', () => {
    const result = run('check-block-imports.mjs', {
      ...CLEAN,
      'src/pages/thing-page/index.tsx': blockWith("import useSWR from 'swr'"),
    })

    expect(result.status).toBe(1)
    expect(result.stderr).toMatch(/\[denied-module\] +"swr" is a data client/)
  })

  it('fails a Block that imports a server runtime', () => {
    const result = run('check-block-imports.mjs', {
      ...CLEAN,
      'src/blocks/thing-01/index.tsx': blockWith("import { readFile } from 'node:fs/promises'"),
    })

    expect(result.status).toBe(1)
    expect(result.stderr).toMatch(/\[denied-module\] +"node:fs\/promises" is a server runtime/)
  })

  it('fails a Block that calls fetch, which an import rule alone would miss', () => {
    const result = run('check-block-imports.mjs', {
      ...CLEAN,
      'src/blocks/thing-01/index.tsx': [
        'export function Thing01() {',
        "  return <div>{fetch('/api/rows').then(() => null)}</div>",
        '}',
        '',
      ].join('\n'),
    })

    expect(result.status).toBe(1)
    expect(result.stderr).toMatch(/\[network-call\] +fetch\(/)
  })

  it("allows 'use client', because interactivity is a Block's business", () => {
    const result = run('check-block-imports.mjs', {
      ...CLEAN,
      'src/blocks/thing-01/index.tsx': [
        "'use client'",
        "import { useState } from 'react'",
        '',
        'export function Thing01() {',
        '  const [open, setOpen] = useState(false)',
        '  return <div onClick={() => setOpen(!open)} />',
        '}',
        '',
      ].join('\n'),
    })

    expect(result.status).toBe(0)
  })

  it('prints the whole rule table on every run, with the hits each rule found', () => {
    const result = run('check-block-imports.mjs', CLEAN)

    expect(result.stdout).toContain('denied, a client router: 0 hit(s)')
    expect(result.stdout).toContain('denied, a data client: 0 hit(s)')
    expect(result.stdout).toContain('denied, a server runtime: 0 hit(s)')
    expect(result.stdout).toContain('because a Block ships no application data')
    expect(result.stdout).toContain('test/catalogue-rule-gates.test.tsx')
  })

  it('fails a root that resolves to nothing rather than reporting a clean tree', () => {
    const result = run('check-block-imports.mjs', { 'src/blocks/thing-01/index.tsx': cleanBlock })

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('"src/pages"')
  })
})
