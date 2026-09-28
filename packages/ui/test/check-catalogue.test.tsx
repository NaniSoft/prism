import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { afterAll, describe, expect, it } from 'vitest'

/**
 * The catalogue gate, proved falsifiable.
 *
 * A check that has never been red is not evidence, so every case here is a
 * disagreement planted in a fixture tree, the real CLI is spawned over it, and
 * its real output is asserted. Nothing imports the gate's internals: a test that
 * called the comparison functions would pass against a broken `main`, which is
 * the part that has to work.
 *
 * The fixture is a package root, not a flag. `PRISM_CATALOGUE_ROOT` changes which
 * directory the gate reads and nothing else, so a test that points it at a
 * fixture runs the same comparisons, in the same order, with the same messages a
 * run over the real tree does. The one test that must not use it is the one that
 * reads the real tree, which is also the one that proves the roots come from the
 * script's own location: it runs from an unrelated working directory.
 */
const PKG = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const SCRIPT = path.join(PKG, 'scripts', 'check-catalogue.mjs')

type Kind = 'component' | 'block' | 'page'

interface Item {
  name: string
  slug: string
  kind: Kind
  /** Overrides the path a well-formed entry would declare. */
  source?: string
}

interface RegistryItem {
  name: string
  type: string
}

interface Fixture {
  /** Component file stems on disk. */
  components?: string[]
  /** Block directory names on disk, each with a `block.json` of the same name. */
  blocks?: string[]
  /** Page directory names on disk, each with a `block.json` of the same name. */
  pages?: string[]
  /** A Block whose `block.json` declares a name other than its directory. */
  blockRenames?: Record<string, string>
  /** The hand-listed roster, or raw file text to plant an unreadable array. */
  catalogue?: Item[] | string
  /** A `catalogVersion` declaration, planted verbatim. */
  catalogueVersion?: string
  /** The generated roster. */
  registry?: RegistryItem[]
  /** The manifest version, or null to write no `version` at all. */
  version?: string | null
}

const REGISTRY_TYPE: Record<Kind, string> = {
  component: 'registry:component',
  block: 'registry:block',
  page: 'registry:page',
}

const sourceFor = (item: Item) =>
  item.source ??
  (item.kind === 'component'
    ? `src/components/ui/${item.slug}.tsx`
    : `src/${item.kind}s/${item.slug}/index.tsx`)

/** A roster in the shape the real `catalog.ts` declares, with real field values. */
function catalogueText(items: Item[], version?: string): string {
  const body = items
    .map(
      (item) =>
        [
          '  {',
          `    name: '${item.name}',`,
          `    slug: '${item.slug}',`,
          `    kind: '${item.kind}',`,
          `    category: ${item.kind === 'component' ? `'Call to action'` : 'null'},`,
          `    description: 'The fixture ${item.slug}.',`,
          `    source: '${sourceFor(item)}',`,
          `    exports: ['${item.name}'],`,
          "    status: 'stable',",
          '  },',
        ].join('\n'),
    )
    .join('\n')

  return [
    'export interface CatalogItem {',
    '  name: string',
    '  slug: string',
    '}',
    '',
    ...(version ? [`export const catalogVersion = '${version}'`, ''] : []),
    'export const catalog: readonly CatalogItem[] = [',
    body,
    ']',
    '',
  ].join('\n')
}

const written: string[] = []

function makeRoot(fixture: Fixture): string {
  const root = mkdtempSync(path.join(os.tmpdir(), 'catalogue-gate-'))
  written.push(root)

  const write = (relative: string, text: string) => {
    const file = path.join(root, relative.split('/').join(path.sep))
    mkdirSync(path.dirname(file), { recursive: true })
    writeFileSync(file, text, 'utf8')
  }

  const components = fixture.components ?? []
  const blocks = fixture.blocks ?? []
  const pages = fixture.pages ?? []
  for (const stem of components) {
    write(`src/components/ui/${stem}.tsx`, `export const ${stem} = () => null\n`)
    // A Component's own test file is not a Component, so the fixture plants one
    // to hold the rule the generator applies.
    write(`src/components/ui/${stem}.test.tsx`, '// fixture\n')
  }
  for (const [root_, dirs] of [
    ['blocks', blocks],
    ['pages', pages],
  ] as const) {
    for (const dir of dirs) {
      const declared = fixture.blockRenames?.[dir] ?? dir
      write(
        `src/${root_}/${dir}/block.json`,
        `${JSON.stringify({ name: declared, title: dir, description: 'A fixture.' }, null, 2)}\n`,
      )
      write(`src/${root_}/${dir}/index.tsx`, 'export const fixture = () => null\n')
    }
  }

  const items = fixture.catalogue === undefined ? [] : fixture.catalogue
  write(
    'src/catalog.ts',
    typeof items === 'string' ? items : catalogueText(items, fixture.catalogueVersion),
  )

  write(
    'registry.json',
    `${JSON.stringify(
      {
        $schema: 'https://ui.shadcn.com/schema/registry.json',
        name: 'nanisoft',
        items: (fixture.registry ?? []).map((item) => ({
          name: item.name,
          title: item.name,
          description: 'A fixture item.',
          type: item.type,
          files: [{ path: `src/${item.name}.tsx`, type: item.type, target: `components/${item.name}.tsx` }],
        })),
      },
      null,
      2,
    )}\n`,
  )

  const version = fixture.version === undefined ? '0.5.1' : fixture.version
  write(
    'package.json',
    `${JSON.stringify(
      { name: '@nanisoft/prism-ui', type: 'module', ...(version ? { version } : {}) },
      null,
      2,
    )}\n`,
  )

  return root
}

interface Run {
  code: number | null
  output: string
  errors: string[]
}

/**
 * One gate line, joined with the indented continuation lines under it.
 *
 * A finding names its item in a sentence that wraps, so a line-by-line split
 * would assert against half a message. The gate prints findings first and the
 * coverage claims last, each on its own unindented line, so an indented line
 * belongs to the finding above it.
 */
function gateLines(output: string, prefix: string): string[] {
  const lines: string[] = []
  for (const line of output.split(/\r?\n/)) {
    if (line.startsWith(prefix)) lines.push(line.slice(prefix.length).trim())
    else if (lines.length > 0 && /^\s+\S/.test(line)) {
      lines[lines.length - 1] += ` ${line.trim()}`
    }
  }
  return lines
}

function run(root: string, { real = false, cwd }: { real?: boolean; cwd?: string } = {}): Run {
  const env = { ...process.env }
  delete env.PRISM_CATALOGUE_ROOT
  if (!real) env.PRISM_CATALOGUE_ROOT = root

  const result = spawnSync(process.execPath, [SCRIPT], {
    cwd: cwd ?? root,
    env,
    encoding: 'utf8',
  })
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`
  return { code: result.status, output, errors: gateLines(output, 'error ') }
}

/** A tree where the three sets agree, so every test starts from a passing run. */
const agreed: Fixture = {
  components: ['button', 'radio-group'],
  blocks: ['hero-01'],
  pages: ['auth-page'],
  catalogue: [
    { name: 'Button', slug: 'button', kind: 'component' },
    { name: 'RadioGroup', slug: 'radio-group', kind: 'component' },
    { name: 'Hero01', slug: 'hero-01', kind: 'block' },
    { name: 'AuthPage', slug: 'auth-page', kind: 'page' },
  ],
  registry: [
    { name: 'button', type: 'registry:component' },
    { name: 'radio-group', type: 'registry:component' },
    { name: 'hero-01', type: 'registry:block' },
    { name: 'auth-page', type: 'registry:page' },
  ],
}

afterAll(() => {
  for (const root of written) rmSync(root, { recursive: true, force: true })
})

describe('the three sets, compared in both directions', () => {
  it('passes a tree where the disk, the catalogue and the registry agree', () => {
    const result = run(makeRoot(agreed))
    expect(result.code).toBe(0)
    expect(result.errors).toEqual([])
    expect(result.output).toContain('4 module(s) on disk, 4 catalogue item(s), 4 registry item(s)')
  })

  it('detects a module on disk with no catalogue entry, naming the module', () => {
    const result = run(makeRoot({ ...agreed, components: [...agreed.components!, 'stray'] }))
    expect(result.code).toBe(1)
    expect(
      result.errors.some(
        (line) =>
          line.includes('a module on disk with no catalogue entry') &&
          line.includes('src/components/ui/stray.tsx'),
      ),
      result.output,
    ).toBe(true)
  })

  it('detects a catalogue entry with no module, naming the entry', () => {
    const result = run(
      makeRoot({
        ...agreed,
        catalogue: [
          ...agreed.catalogue! as Item[],
          { name: 'Ghost01', slug: 'ghost-01', kind: 'block' },
        ],
      }),
    )
    expect(result.code).toBe(1)
    expect(
      result.errors.some(
        (line) =>
          line.includes('a catalogue entry with no module on disk') &&
          line.includes('"Ghost01"') &&
          line.includes('src/blocks/ghost-01/index.tsx'),
      ),
      result.output,
    ).toBe(true)
  })

  it('detects a registry item with no catalogue entry, naming the item', () => {
    const result = run(
      makeRoot({
        ...agreed,
        registry: [...agreed.registry!, { name: 'legacy-01', type: 'registry:block' }],
      }),
    )
    expect(result.code).toBe(1)
    expect(
      result.errors.some(
        (line) =>
          line.includes('a registry item with no catalogue entry') &&
          line.includes('"legacy-01"') &&
          line.includes('registry:block'),
      ),
      result.output,
    ).toBe(true)
  })

  it('detects a catalogue entry with no registry item, which validate-registry cannot see', () => {
    // The catalogue and the disk agree and the registry is the odd one out, so
    // this isolates the B to C direction from the A to B direction above.
    const result = run(
      makeRoot({
        ...agreed,
        components: [...agreed.components!, 'badge'],
        catalogue: [
          ...agreed.catalogue! as Item[],
          { name: 'Badge', slug: 'badge', kind: 'component' },
        ],
      }),
    )
    expect(result.code).toBe(1)
    expect(
      result.errors.some(
        (line) =>
          line.includes('a catalogue entry with no registry item') && line.includes('"Badge"'),
      ),
      result.output,
    ).toBe(true)
  })

  it('detects a module the disk-reading generator never emitted, which is its own gap', () => {
    // `sync-registry.mjs` reads the disk, so it can never disagree with the disk
    // about what is on it. What it can leave behind is a stale generated file
    // after a module lands and nobody re-ran it, and that is this direction.
    const result = run(makeRoot({ ...agreed, components: [...agreed.components!, 'badge'] }))
    expect(result.code).toBe(1)
    expect(
      result.errors.some(
        (line) =>
          line.includes('a module on disk with no registry item') &&
          line.includes('src/components/ui/badge.tsx'),
      ),
      result.output,
    ).toBe(true)
  })

  it('detects a registry item with no module on disk, naming the item', () => {
    const result = run(
      makeRoot({
        ...agreed,
        registry: [
          ...agreed.registry!,
          { name: 'phantom', type: 'registry:component' },
          { name: 'hollow-01', type: 'registry:block' },
        ],
      }),
    )
    expect(result.code).toBe(1)
    for (const name of ['"phantom"', '"hollow-01"']) {
      expect(
        result.errors.some(
          (line) => line.includes('a registry item with no module on disk') && line.includes(name),
        ),
        `${name} in ${result.output}`,
      ).toBe(true)
    }
  })

  it('names a kind disagreement rather than reporting it as one item missing', () => {
    const result = run(
      makeRoot({
        ...agreed,
        catalogue: (agreed.catalogue as Item[]).map((item) =>
          item.slug === 'hero-01' ? { ...item, kind: 'page' as Kind } : item,
        ),
      }),
    )
    expect(result.code).toBe(1)
    expect(
      result.errors.some(
        (line) => line.includes('"hero-01"') && line.includes('is a page in the catalogue'),
      ),
      result.output,
    ).toBe(true)
  })
})

describe('a roster that cannot be read', () => {
  it('fails on an empty catalogue rather than passing it', () => {
    const result = run(makeRoot({ ...agreed, catalogue: [] }))
    expect(result.code).toBe(1)
    expect(result.output).toContain('the `catalog` array is empty')
    expect(result.output).not.toContain('comparisons passed\n0 findings')
  })

  it('fails on a catalogue that declares no array at all', () => {
    const result = run(
      makeRoot({
        ...agreed,
        catalogue: ['export const catalogBySlug: ReadonlyMap<string, string> = new Map()', ''].join(
          '\n',
        ),
      }),
    )
    expect(result.code).toBe(1)
    expect(result.output).toContain('declares no `export const catalog` array')
  })

  it('fails on a member shape the parser does not read, naming the shape', () => {
    const result = run(
      makeRoot({
        ...agreed,
        catalogue: [
          'export const catalog: readonly unknown[] = [',
          '  {',
          "    name: 'Button',",
          "    slug: 'button',",
          '    ...shared,',
          "    kind: 'component',",
          "    source: 'src/components/ui/button.tsx',",
          '  },',
          ']',
          '',
        ].join('\n'),
      }),
    )
    expect(result.code).toBe(1)
    expect(result.output).toContain('a spread or computed member')
  })

  it('fails on an entry that declares no slug, so the roster is not silently shorter', () => {
    const result = run(
      makeRoot({
        ...agreed,
        catalogue: [
          'export const catalog: readonly unknown[] = [',
          '  {',
          "    name: 'Button',",
          '  },',
          ']',
          '',
        ].join('\n'),
      }),
    )
    expect(result.code).toBe(1)
    expect(result.output).toContain('has no "slug"')
  })

  it('fails on a registry with no items, which is not a roster of nothing', () => {
    const result = run(makeRoot({ ...agreed, registry: [] }))
    expect(result.code).toBe(1)
    expect(result.output).toContain('"items" is not a non-empty array')
  })

  it('fails on a root that resolves to nothing, naming both causes', () => {
    // One root gone, not all of them: the message names the root that failed, so
    // a run over a tree that is almost right still says which part is not.
    const root = makeRoot(agreed)
    rmSync(path.join(root, 'src', 'pages'), { recursive: true, force: true })
    const result = run(root)
    expect(result.code).toBe(1)
    expect(result.output).toContain('1 of 6 configured root does not resolve: "src/pages"')
    expect(result.output).toContain('Two causes, and this run cannot tell them apart')
    expect(result.output).toContain('wrong package root')
    expect(result.output).toContain('does not exist in the repository at all')
  })
})

describe('the naming rules that make one key out of three conventions', () => {
  it('reports a slug that is not the key its own source path carries', () => {
    // The source stays the real path on disk, so the slug and the source are two
    // different claims about one module and the gate has to say which is which.
    const result = run(
      makeRoot({
        ...agreed,
        catalogue: (agreed.catalogue as Item[]).map((item) =>
          item.slug === 'hero-01'
            ? { ...item, slug: 'hero01', source: 'src/blocks/hero-01/index.tsx' }
            : item,
        ),
      }),
    )
    expect(result.code).toBe(1)
    expect(
      result.errors.some(
        (line) =>
          line.includes('declares the slug "hero01"') && line.includes('names "hero-01" on disk'),
      ),
      result.output,
    ).toBe(true)
  })

  it('reports a display name and a slug that are no longer one item under one rule', () => {
    const result = run(
      makeRoot({
        ...agreed,
        catalogue: (agreed.catalogue as Item[]).map((item) =>
          item.slug === 'radio-group' ? { ...item, name: 'Radio Group' } : item,
        ),
      }),
    )
    expect(result.code).toBe(1)
    expect(
      result.errors.some(
        (line) =>
          line.includes('"Radio Group"') && line.includes('not the kebab-case of the name'),
      ),
      result.output,
    ).toBe(true)
  })

  it("reports a Block whose block.json name is not its directory, once and by name", () => {
    const result = run(
      makeRoot({
        ...agreed,
        // The generator emits this Block under the `name` in its block.json, so
        // the directory and the emitted name are two names for one module.
        blockRenames: { 'hero-01': 'hero' },
        registry: [
          ...(agreed.registry as RegistryItem[]).filter((item) => item.name !== 'hero-01'),
          { name: 'hero', type: 'registry:block' },
        ],
        catalogue: (agreed.catalogue as Item[]).map((item) =>
          item.slug === 'hero-01' ? { ...item, name: 'Hero', slug: 'hero' } : item,
        ),
      }),
    )
    expect(result.code).toBe(1)
    expect(
      result.errors.some(
        (line) =>
          line.includes('src/blocks/hero-01/block.json') && line.includes('"hero-01"'),
      ),
      result.output,
    ).toBe(true)
  })

  it('reports a canonical key two catalogue entries claim, which would hide one of them', () => {
    const result = run(
      makeRoot({
        ...agreed,
        catalogue: [
          ...(agreed.catalogue as Item[]),
          { name: 'Btn', slug: 'button', kind: 'component' },
        ],
      }),
    )
    expect(result.code).toBe(1)
    expect(
      result.errors.some(
        (line) => line.includes('"button" is claimed by two catalogue entries'),
      ),
      result.output,
    ).toBe(true)
  })
})

describe('the version and the roster as two claims', () => {
  it('prints them as two lines, so one failing does not read as the other', () => {
    const result = run(makeRoot(agreed))
    expect(result.code).toBe(0)
    expect(result.output).toMatch(/^catalogue: version @nanisoft\/prism-ui 0\.5\.1$/m)
    expect(result.output).toMatch(/^catalogue: roster 4 module\(s\) on disk, /m)
  })

  it('fails a version that is not a version, and names the manifest rather than the roster', () => {
    const result = run(makeRoot({ ...agreed, version: 'draft' }))
    expect(result.code).toBe(1)
    expect(
      result.errors.some(
        (line) => line.includes('package.json') && line.includes('"version"'),
      ),
      result.output,
    ).toBe(true)
    // Every failure is the version claim, and the roster claim still prints, so
    // a version bump and a roster error cannot be read as one another.
    for (const line of result.errors) expect(line, line).toMatch(/version/)
    expect(result.output).toMatch(/^catalogue: version @nanisoft\/prism-ui draft$/m)
    expect(result.output).toMatch(/^catalogue: roster 4 module\(s\) on disk, /m)
    expect(result.output).toContain('16/16 comparisons passed')
  })

  it('holds a declared catalogue version to the version the package publishes', () => {
    const matching = run(makeRoot({ ...agreed, catalogueVersion: '0.5.1' }))
    expect(matching.code).toBe(0)
    expect(matching.output).not.toContain('declares no catalogue version')

    const drifting = run(makeRoot({ ...agreed, catalogueVersion: '0.4.0' }))
    expect(drifting.code).toBe(1)
    expect(
      drifting.errors.some(
        (line) => line.includes('the catalogue version "0.4.0"') && line.includes('0.5.1'),
      ),
      drifting.output,
    ).toBe(true)
  })

  it('says so in its own output when the catalogue declares no version', () => {
    const result = run(makeRoot(agreed))
    expect(result.output).toContain('warn  src/catalog.ts: declares no catalogue version')
  })
})

describe('a finding names its item, never only a count', () => {
  const broken: Fixture = { ...agreed, components: [...agreed.components!, 'stray'] }

  it('names the offending module in every direction it fires', () => {
    const result = run(makeRoot(broken))
    expect(result.code).toBe(1)
    expect(result.errors.length).toBeGreaterThan(0)
    for (const line of result.errors) {
      expect(line, line).toMatch(/(src\/(components|blocks|pages)\/|"[A-Za-z])|(src\/catalog\.ts)|(package\.json)/)
    }
  })

  it('never states a finding as a difference between two numbers', () => {
    const result = run(makeRoot(broken))
    for (const line of result.errors) {
      expect(line, line).not.toMatch(/\b(count|length|number of items|expected \d|disagree by)\b/i)
    }
  })

  it('counts are supplementary: the three set sizes appear under the findings', () => {
    const result = run(makeRoot(broken))
    expect(result.output).toMatch(/^catalogue: roster 5 module\(s\) on disk, 4 catalogue item\(s\), /m)
    expect(result.output).toMatch(/\d+\/\d+ comparisons passed/)
  })
})

describe('roots resolve from the script, not from the working directory', () => {
  it('passes on the real tree, read from an unrelated working directory', () => {
    // No override: the roots have to come from the script's own location or this
    // run reads nothing and passes for the wrong reason.
    const result = run(PKG, { real: true, cwd: os.tmpdir() })
    expect(result.code, result.output).toBe(0)
    expect(result.errors).toEqual([])
    // The three sets must AGREE. The assertion is deliberately not a literal
    // count: pinning the number would make every new catalogue item fail this
    // test, and the response to that is to edit the test, which is exactly how a
    // count in a test stops meaning anything. The gate reports the number; this
    // asserts the property the gate exists to protect.
    const roster = /^catalogue: roster (\d+) module\(s\) on disk, (\d+) catalogue item\(s\), (\d+) registry item\(s\)$/m.exec(
      result.output,
    )
    expect(roster, result.output).not.toBeNull()
    const [, onDisk, catalogue, registry] = roster as RegExpExecArray
    expect(catalogue).toBe(onDisk)
    expect(registry).toBe(onDisk)
    expect(Number(onDisk)).toBeGreaterThan(0)
    expect(result.output).toMatch(/16\/16 comparisons passed/)
    expect(result.output).toMatch(/^catalogue: version @nanisoft\/prism-ui /m)
    expect(result.output).toMatch(/^catalogue: coverage 6 root\(s\) resolved, 0 unresolved; /m)
  })

  it('states the root it read when the override is in effect', () => {
    const root = makeRoot(agreed)
    const result = run(root)
    expect(result.output).toContain(`package root overridden to ${root}`)
  })
})
