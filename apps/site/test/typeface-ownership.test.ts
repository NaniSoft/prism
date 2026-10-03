/**
 * Who owns the interface face, and the proof is that this site renders it.
 *
 * **The defect this is for shipped, in full green.** This site loaded its own copy
 * of Inter through `next/font/local`, applied the generated class to `<body>`, and
 * the generated class set `--font-sans` on the element itself. A directly applied
 * custom property outranks an inherited one, so every page resolved the interface
 * face to the site's own 723 KiB variable font and never to the `@font-face` rules
 * the library ships. The two `<link rel="preload" as="font">` tags were in every
 * exported document and the library's three faces were never fetched on the site
 * that documents them. A missing or corrupt shipped face rendered perfectly here,
 * and so did a shipped face that had been renamed, because the reference site was
 * the one surface in the repository that could not fail on the thing the package
 * promises.
 *
 * **Why the assertions are where they are.** The site half is read from SOURCE,
 * because the defect was in source: a loader import and a class on an element. The
 * library half is read from the EMITTED artefact, because the question there is
 * whether the head of the stack resolves, and only the artefact knows which faces
 * the build really emitted.
 *
 * **Why jsdom cannot answer any of it, stated once.** jsdom implements neither
 * `@layer` nor `var()`, so `getComputedStyle` returns an empty value for a
 * custom property and a transparent colour for a token. A test built on that
 * passes for a reason unrelated to the paint. So the cascade below is resolved from
 * the artefact with a small parser, which is the approach `pack-dot.test.ts` takes
 * and takes deliberately; that file reasserts its three primitives against known
 * answers, and this one reuses the conclusion rather than the code, because what
 * it needs is a question those three do not answer. It asks only which rule
 * declares `--font-sans` and where, so it carries a rule parser and nothing else:
 * no specificity counter, no layer ranking, no selector recogniser. A cascade that
 * is not being decided does not need the parts of the cascade that decide it.
 *
 * **The one limit, at the end rather than in a footnote.** This lane runs before
 * `pnpm build` and has no `apps/site/out`, so nothing here reads an exported
 * document. The composed document is a property of the export, and
 * `apps/site/e2e/display.spec.ts` reads `getComputedStyle` for what this file
 * cannot see. What this file can see is that nothing in the site's own source
 * stands between the library's declaration and the body, which is the defect.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const UI = path.join(SITE, '..', '..', 'packages', 'ui')
const SHEET_PATH = path.join(UI, 'dist', 'styles.css')

// ------------------------------------------------------------------ the sheet

interface Declaration {
  property: string
  value: string
}

/**
 * Parse the sheet into flat rules, KEEPING custom properties.
 *
 * Written here rather than imported from `utility-cascade.mjs` for the reason
 * `pack-dot.test.ts` records about its own copy: that parser drops `--*` on
 * purpose, because the cascade it measures is a question about utilities. This
 * question is entirely about a custom property. `@media` subtrees are walked
 * through rather than skipped, because a rule that re-declared `--font-sans`
 * inside a media query would still be one the body could reach at some width.
 */
function parseRules(css: string): { selector: string; layer: string | null; declarations: Declaration[] }[] {
  const rules: { selector: string; layer: string | null; declarations: Declaration[] }[] = []

  const matchingBrace = (source: string, open: number): number => {
    let depth = 0
    for (let i = open; i < source.length; i += 1) {
      if (source[i] === '{') depth += 1
      else if (source[i] === '}') {
        depth -= 1
        if (depth === 0) return i
      }
    }
    return -1
  }

  const walk = (source: string, layer: string | null): void => {
    let prelude = ''
    let i = 0
    while (i < source.length) {
      const char = source[i]
      if (char === '{') {
        const head = prelude.trim()
        prelude = ''
        const end = matchingBrace(source, i)
        if (end === -1) return
        const inner = source.slice(i + 1, end)
        if (head.startsWith('@layer')) walk(inner, head.slice('@layer'.length).trim())
        else if (head.startsWith('@')) walk(inner, layer)
        else {
          const declarations: Declaration[] = []
          for (const part of inner.split(';')) {
            const colon = part.indexOf(':')
            if (colon === -1) continue
            declarations.push({
              property: part.slice(0, colon).trim(),
              value: part.slice(colon + 1).trim(),
            })
          }
          if (declarations.length > 0) rules.push({ selector: head, layer, declarations })
        }
        i = end + 1
        continue
      }
      if (char === ';' || char === '}') {
        prelude = ''
        i += 1
        continue
      }
      prelude += char
      i += 1
    }
  }

  walk(css.replace(/\/\*[\s\S]*?\*\//g, ''), null)
  return rules
}

const SHEET = readFileSync(SHEET_PATH, 'utf8')
const RULES = parseRules(SHEET)

/** The family list of a custom property in the emitted sheet, in order. */
const stackOf = (property: string): string[] => {
  const declaration = RULES.flatMap((rule) => rule.declarations).find(
    (entry) => entry.property === property,
  )
  if (!declaration) return []
  return declaration.value
    .split(',')
    .map((part) => part.trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean)
}

/** Every `@font-face` the emitted sheet declares, with the family it declares for. */
const FACES = [...SHEET.matchAll(/@font-face\s*\{([^{}]*)\}/g)].map((match) => ({
  family: /font-family:\s*['"]?([^;'"}]+)/.exec(match[1])?.[1]?.trim() ?? '',
  style: /font-style:\s*([\w-]+)/.exec(match[1])?.[1]?.trim() ?? 'normal',
  weight: /font-weight:\s*(\d+)/.exec(match[1])?.[1]?.trim() ?? '',
  src: /url\(['"]?([^'")]+)/.exec(match[1])?.[1] ?? null,
  local: /src:\s*local\(['"]?([^'")]+)/.exec(match[1])?.[1]?.trim() ?? null,
}))

// ---------------------------------------------------------------- the site's

/**
 * Every source file the site's own build scans for class names.
 *
 * `globals.css` declares the `@source` globs and they cover `src/app`,
 * `src/components`, `src/lib` and the content tree, so those are the roots a
 * generated font class could have been applied in. Read from the file rather than
 * listed, so a font loader added somewhere new is a finding rather than an absence.
 */
const SOURCE_ROOTS = ['src/app', 'src/components', 'src/lib', 'src/generated', 'items']

function sourceFiles(root: string): string[] {
  const start = path.join(SITE, root)
  if (!existsSync(start)) return []
  const out: string[] = []
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (/\.(ts|tsx|css)$/.test(entry.name)) out.push(full)
    }
  }
  walk(start)
  return out.sort()
}

const SITE_SOURCES = SOURCE_ROOTS.flatMap(sourceFiles)

/**
 * A source file with its block comments removed.
 *
 * Needed, and for a reason that is itself the point of the assertions below: the
 * explanation of why the site no longer loads a face is written in comments that
 * NAME the removed mechanism, in the two layouts, at length. A scan that reads
 * comments as code fails on its own documentation. Removing them is what lets the
 * assertion be about what the site does rather than about what it says it used to
 * do, and it is also what keeps an explanation of a past defect from becoming a
 * permanent exemption from it.
 *
 * Only block comments are removed. A line comment is left in place on purpose: a
 * naive `//` strip would cut a URL in half and hide a loader named inside a string,
 * and a scan that errs toward firing is the right way round for a gate.
 */
const codeOf = (file: string): string => readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')

// ----------------------------------------------------------------- the tests

describe('the site loads no face of its own', () => {
  it('imports no font loader, so there is nothing to shadow the library face with', () => {
    const loaders = SITE_SOURCES.filter((file) =>
      /next\/font|@fontsource|@expo-google-fonts|fonts\.googleapis|use-font/i.test(codeOf(file)),
    )
    expect(loaders).toEqual([])
  })

  it('overrides no font token from application code', () => {
    // `--font-sans` declared anywhere in the site's own code is the defect,
    // whether it is a generated class, an inline style or a hand-written rule. A
    // declaration on the body or on `:root` wins over the inherited token, which
    // is the whole mechanism that let this site stop rendering the shipped face.
    const offenders = SITE_SOURCES.filter((file) => codeOf(file).includes('--font-sans'))
    expect(offenders).toEqual([])
  })

  it('carries no font binary of its own', () => {
    // The bytes are the visible half of the defect and the class was the invisible
    // one, so both are asserted. A site that shipped a face would be right about
    // the bytes and still wrong about the cascade.
    const found: string[] = []
    const walk = (dir: string) => {
      if (!existsSync(dir)) return
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) walk(full)
        else if (/\.(woff2?|ttf|otf)$/i.test(entry.name)) {
          found.push(`${path.relative(SITE, full).split(path.sep).join('/')} ${statSync(full).size} B`)
        }
      }
    }
    walk(path.join(SITE, 'src'))
    walk(path.join(SITE, 'public'))
    expect(found).toEqual([])
  })

  it('applies no font class to either body', () => {
    for (const layout of ['src/app/(site)/layout.tsx', 'src/app/(preview)/layout.tsx']) {
      const source = codeOf(path.join(SITE, layout))
      const bodies = [...source.matchAll(/<body[^>]*>/g)].map((match) => match[0])
      expect([layout, bodies.length]).toEqual([layout, 1])
      // Read out of the rendered markup rather than the class list, so the
      // assertion cannot be satisfied by a class that was added and then
      // overridden. `font` is the shape of the defect: a generated
      // `inter_..._variable` class, or `font-sans` written by hand.
      expect([layout, bodies[0]]).toEqual([layout, expect.not.stringContaining('font')])
    }
  })
})

describe('the library face is reachable rather than shadowed', () => {
  it('declares the interface face token exactly once in the whole sheet', () => {
    // Twice would be two answers, and the cascade would pick one of them by
    // position rather than by authority. The one declaration Tailwind emits for
    // an `@theme static` group lands on `:root, :host` inside `@layer theme`,
    // which is its own first layer: nothing in this sheet outranks it, and the
    // pack blocks below are unlayered but declare no font token, so the head of
    // the stack cannot be moved by a pack or a mode.
    const declarations = RULES.flatMap((rule) =>
      rule.declarations.filter((entry) => entry.property === '--font-sans'),
    )
    expect(declarations).toHaveLength(1)
    const owners = RULES.filter((rule) =>
      rule.declarations.some((entry) => entry.property === '--font-sans'),
    )
    expect([owners[0].selector, owners[0].layer]).toEqual([':root, :host', 'theme'])
  })

  it('names the shipped face first and the metric-adjusted fallback second', () => {
    expect(stackOf('--font-sans').slice(0, 2)).toEqual(['Inter', 'Inter Fallback'])
  })

  it('backs every family before the platform stack with a face this build emitted', () => {
    const stack = stackOf('--font-sans')
    const platform = stack.findIndex((family) => family === 'ui-sans-serif')
    expect(platform).toBeGreaterThan(0)
    const declared = new Set(FACES.map((face) => face.family))
    // The two families Prism owns are the two the library publishes. A name ahead
    // of the platform stack that nothing declares is the head of a stack
    // resolving to nothing, which is the defect `check-typeface.mjs` also holds.
    expect(stack.slice(0, platform).filter((family) => !declared.has(family))).toEqual([])
  })

  it('resolves every file-backed face to a binary beside the emitted stylesheet', () => {
    // A consumer imports `dist/styles.css` from its own root, so the sources are
    // relative to the sheet and a file that did not arrive means a page that
    // renders in the fallback with no error anywhere.
    const fileBacked = FACES.filter((face) => face.src !== null)
    expect(fileBacked.length).toBeGreaterThanOrEqual(3)
    for (const face of fileBacked) {
      const onDisk = path.join(path.dirname(SHEET_PATH), face.src!)
      expect([face.src, existsSync(onDisk)]).toEqual([face.src, true])
    }
  })

  it('ships a licence beside the binaries, which is the redistribution obligation', () => {
    const fontDir = path.join(path.dirname(SHEET_PATH), 'fonts')
    const shipped = readdirSync(fontDir)
    expect(shipped.filter((file) => /\.woff2?$/.test(file))).toHaveLength(FACES.filter((f) => f.src).length)
    expect(shipped.some((file) => /(?:OFL|LICENSE|LICENCE)/i.test(file))).toBe(true)
  })
})