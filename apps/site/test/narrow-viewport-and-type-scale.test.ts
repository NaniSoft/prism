/**
 * Four narrow-viewport and type-scale defects, read from the site's own source.
 *
 * **WHY THIS LANE READS SOURCE AND NOT MARKUP.** `apps/site/vitest.config.ts`
 * runs in the `node` environment and collects only `.ts` specs, so there is no
 * jsdom here and no `.tsx` spec can run at all. A class list is a string in a
 * file, and that is what these four are: a frame that clips where it should
 * scroll, two grids that never reduce their track count, and sixteen font sizes
 * written as pixel values. Reading the source is the only thing available, and
 * `typeface-ownership.test.ts` and `pack-dot.test.ts` set the precedent for it.
 *
 * **WHAT A SOURCE ASSERTION DOES NOT PROVE, said once and meant.** None of this
 * demonstrates a layout. A test that finds `overflow-x-auto` on the frame has
 * proved the class is in the file and nothing about what a reader sees at 320
 * pixels: whether the table's min-content width actually exceeds the frame is a
 * question about glyph metrics, and no assertion in this lane can answer it. The
 * same is true of `text-mono` resolving to 0.625rem; that the class resolves at
 * all is the token build's job and `packages/tokens` asserts it. What these
 * assertions hold is the class string, which is the part a later edit changes.
 *
 * **WHY THE FOUR ARE IN ONE FILE.** They share a shape rather than a component:
 * each is a literal that restates something already authored, or a layout that
 * assumes a width the reader may not have. Splitting them across four files would
 * have put the same four-line preamble in four places, and a preamble that has to
 * be copied is a preamble that will be shortened in one of them.
 */

import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SRC = path.join(SITE, 'src')

/** Every file the site's own Tailwind build scans for class names, from `globals.css`. */
function sourceFiles(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...sourceFiles(full))
    else if (/\.tsx?$/.test(entry.name)) out.push(full)
  }
  return out.sort()
}

const SOURCES = sourceFiles(SRC).map((file) => ({
  file: path.relative(SITE, file).split(path.sep).join('/'),
  code: readFileSync(file, 'utf8'),
}))

/**
 * A file with its comments and its JSX text left out.
 *
 * Block comments are removed because four of these files carry a paragraph
 * explaining the class they were changed to, and a scan that read the explanation
 * as the code would pass on a fix that was never made. This is the same reasoning
 * `typeface-ownership.test.ts` records, and the same failure it records: an
 * explanation of a past defect becoming a permanent exemption from it.
 */
const codeOf = (entry: (typeof SOURCES)[number]): string =>
  entry.code.replace(/\/\*[\s\S]*?\*\//g, '')

/** Every `className` string literal in a file, one entry per literal. */
const classNamesIn = (entry: (typeof SOURCES)[number]): string[] => {
  const out: string[] = []
  const code = codeOf(entry)
  const attribute = /\bclassName\s*=\s*/g
  let match: RegExpExecArray | null
  while ((match = attribute.exec(code)) !== null) {
    const start = match.index + match[0].length
    if (code[start] === '{') {
      const close = code.indexOf('}', start)
      if (close === -1) continue
      for (const literal of code.slice(start + 1, close).matchAll(/`([^`]*)`|"([^"]*)"|'([^']*)'/g)) {
        out.push(literal[1] ?? literal[2] ?? literal[3] ?? '')
      }
      continue
    }
    const quote = code[start]
    if (quote !== '"' && quote !== "'") continue
    const close = code.indexOf(quote, start + 1)
    if (close === -1) continue
    out.push(code.slice(start + 1, close))
  }
  return out
}

const byPath = (relative: string) => {
  const entry = SOURCES.find((candidate) => candidate.file === relative)
  if (!entry) throw new Error(`${relative} is not under src/`)
  return entry
}

// --------------------------------------------------------------- the two frames

describe('the token browser frames', () => {
  const frames = classNamesIn(byPath('src/components/foundations/token-browser.tsx')).filter((list) =>
    list.includes('rounded-xl') && list.includes('border'),
  )

  it('offers a scrollbar on every frame rather than clipping the tail', () => {
    // `overflow-hidden` was the shape here, and it is the wrong one for the same
    // reason `Table`'s wrapper is `overflow-x-auto`: a table cannot shrink below
    // its min-content width, so a frame that clips shows a reader the first part
    // of a token name and no way to reach the rest. The rounded clip the frame
    // wanted is not lost, because `border-radius` clips overflow whatever the
    // overflow is.
    expect(frames).toHaveLength(2)
    for (const frame of frames) {
      expect([frame, frame.split(' ').includes('overflow-x-auto')]).toEqual([
        frame,
        true,
      ])
      expect([frame, frame.split(' ').includes('overflow-hidden')]).toEqual([frame, false])
    }
  })

  it('matches the sibling reader rather than answering this question twice', () => {
    const sibling = classNamesIn(byPath('src/components/foundations/token-table.tsx')).find((list) =>
      list.includes('rounded-xl') && list.includes('border'),
    )
    expect(sibling).toBeDefined()
    for (const frame of frames) {
      expect([frame, frame.split(' ').includes('overflow-x-auto')]).toEqual([frame, true])
    }
  })
})

// ------------------------------------------------------------------- the grids

/**
 * The two grids that hold their track count on a phone.
 *
 * A `grid-cols-N` with no responsive variant is the shape a layout takes when
 * nobody asked what a track is wide at the narrowest width the reader has. Both
 * of these were audited against the rest of the tree, and the count is recorded
 * because it is what decided that these two were exceptions rather than a habit:
 * of the `grid-cols-N` class names written across `packages/ui/src`,
 * `apps/site/src` and `apps/site/items`, 130 carry a breakpoint prefix and 10 do
 * not, and of those ten six are variant maps or already start at one column.
 */
describe('the two grids that never reduced', () => {
  const swatches = classNamesIn(byPath('src/app/(site)/foundation/themes/page.tsx')).find((list) =>
    /^grid grid-cols-\d+ gap-2\b/.test(list),
  )

  const ramp = classNamesIn(byPath('src/components/foundations/color-tokens.tsx')).find((list) =>
    /^grid grid-cols-\d+ gap-1\b/.test(list),
  )

  it('steps the swatch grid with the grid that made the card it lives in', () => {
    // The card is one column wide below `sm`, two from `sm` and three from `lg`,
    // so the box this grid divides is widest where the page is narrowest. One and
    // two tracks at those widths, three from `lg` where the card is three-up and
    // the value truncates the way `truncate` on that line was written to handle.
    expect(swatches?.split(' ')).toEqual([
      'grid',
      'grid-cols-1',
      'gap-2',
      'sm:grid-cols-2',
      'lg:grid-cols-3',
    ])
  })

  it('steps the ramp grid at sm, where eleven tracks are wider than they are tall', () => {
    // The cell is `h-10`, so a track under about 40 pixels draws a sliver. Six
    // tracks at 320 pixels leave about 43, which is the height of the swatch, and
    // the eleven or twelve steps read as two rows.
    expect(ramp?.split(' ')).toEqual(['grid', 'grid-cols-6', 'gap-1', 'sm:grid-cols-11'])
  })
})

// ---------------------------------------------------------------- the type scale

/**
 * Sixteen font sizes written as pixel values, and the authored steps they name.
 *
 * The scale below is read out of the emitted artefact rather than written here,
 * because the point of the assertion is that the replacement names a token the
 * token build actually emits. A hand-copied table of step names would agree with
 * itself whatever the build did.
 *
 * **A pixel size is also the one length form that does not track a reader.** Every
 * step on the scale is a rem, so a reader who raises their browser's default font
 * size gets a page whose body text grows with it; a pixel value stays at 10 while
 * everything around it moves. That is a finding about the call sites and not about
 * the scale, and it is the reason none of them was kept.
 */
describe('font sizes in the site', () => {
  const theme = readFileSync(
    path.join(SITE, '..', '..', 'packages', 'tokens', 'dist', 'theme.css'),
    'utf8',
  )

  /** The rem value the emitted theme gives one `--text-*` step. */
  const stepOf = (name: string): string =>
    new RegExp(`--text-${name}:\\s*([^;]+);`).exec(theme)?.[1]?.trim() ?? ''

  it('reads the scale the replacements name, out of the emitted theme', () => {
    // The two values the sixteen call sites were moved onto, and the gap between
    // them that made the 11px literals impossible to place: there is no step
    // between `mono` and `xs`, so 0.6875rem was on no step at all.
    expect(stepOf('mono')).toBe('0.625rem')
    expect(stepOf('xs')).toBe('0.75rem')
    expect(stepOf('sm')).toBe('0.875rem')
    expect(Number.parseFloat(stepOf('mono')) * 16).toBe(10)
  })

  const offenders = SOURCES.flatMap((entry) =>
    codeOf(entry)
      .split(/\s+/)
      .filter((token) => /^text-\[\d+px\]$/.test(token))
      .map((token) => [entry.file, token] as const),
  )

  it('names an authored step everywhere, with no pixel font size left', () => {
    expect(offenders).toEqual([])
  })

  it('takes the mono step in the nine files whose text is machine data', () => {
    // `mono` is the scale's own step for token values, install commands, category
    // tags and machine annotations, which is every one of these: a custom property
    // name, a pack radius, a resolution, a step number, a count and a status.
    // `item-header.tsx` holds its label in a module constant rather than in a
    // `className`, which is why this asserts on the file rather than on a literal.
    const machine = [
      'src/app/(site)/foundation/themes/page.tsx',
      'src/components/category-nav.tsx',
      'src/components/foundations/color-tokens.tsx',
      'src/components/item-grid.tsx',
      'src/components/item-header.tsx',
      'src/components/landing/pack-band.tsx',
      'src/components/pager.tsx',
      'src/components/showcase-toolbar.tsx',
      'src/components/table-of-contents.tsx',
    ]
    const missing = machine.filter((file) => !codeOf(byPath(file)).includes('text-mono'))
    expect(missing).toEqual([])
  })

  it('takes a reading step for the two sentences, which are not machine data', () => {
    // A pack description under a pack name, and a token description under a token
    // name. Both are prose in the product's own words, so both moved up to `xs`,
    // the smallest reading step, rather than down to `mono`.
    expect(classNamesIn(byPath('src/components/showcase-toolbar.tsx'))).toContain(
      'text-muted-foreground text-pretty text-xs leading-snug',
    )
    expect(classNamesIn(byPath('src/components/foundations/color-tokens.tsx'))).toContain(
      'text-muted-foreground text-xs leading-snug',
    )
  })
})

// ------------------------------------------------------------- the site article

/**
 * The site's own article prose, which styles Markdown tables rather than composing
 * `Prose`.
 *
 * `apps/site/src/app/(site)/[...slug]/page.tsx` renders a content page's body
 * inside `<div className="prose">` and `globals.css` styles it, so the library
 * Component is not in this path and a rule the Component gains does not reach it.
 * That makes the two a second instance of the same defect rather than one
 * instance seen twice, and it is why both were fixed.
 */
describe('the site article stylesheet', () => {
  const globals = readFileSync(path.join(SRC, 'app', 'globals.css'), 'utf8')
  const tableRule = /\n\s*\.prose\s*>?\s*table\s*\{([^}]*)\}/.exec(globals)

  it('gives a direct-child article table the same scroll container a code fence has', () => {
    expect(tableRule).not.toBeNull()
    const body = tableRule![1]
    expect(body).toMatch(/display:\s*block/)
    expect(body).toMatch(/overflow-x:\s*auto/)
    // A descendant selector would reach a `Table` rendered inside a Demo figure
    // further down this stylesheet, and `Table` brings its own scroll container.
    expect(tableRule![0]).toContain('.prose > table')
    expect(/\n\s*\.prose\s+table\s*\{/.test(globals)).toBe(false)
  })

  it('keeps the code fence rule it is standing next to', () => {
    const preRule = /\n\s*\.prose\s+pre\s*\{([^}]*)\}/.exec(globals)
    expect(preRule?.[1]).toMatch(/overflow-x:\s*auto/)
  })
})
