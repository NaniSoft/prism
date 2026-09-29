/**
 * A relative specifier in the emitted tree resolves to the file that holds its types.
 *
 * **The regression this exists for.** `@nanisoft/prism-ui` used to emit `./hero` with
 * no extension, because `tsc` writes a specifier exactly as the source wrote it, and
 * that is resolvable by a bundler and by nothing else. The build now resolves every
 * relative specifier to a file extension, so the emitted tree carries `./hero.js`.
 *
 * Two resolvers read that tree, and each assumed the extensionless shape. Both
 * silently stopped finding anything, and every Item whose declaration lives in a
 * sibling file published "No additional props are declared for this item". That is
 * 21 Blocks and one Page out of 102 Items, and nothing failed: the corpus is a
 * document, and a document that says a component takes no props reads as a fact
 * rather than as a gap.
 *
 * Only `DocsShell` had a test asserting its props, and it caught the regression. The
 * other 21 had none, which is why this asserts the property directly rather than one
 * Item's props: the failure is a shape, not a name.
 */
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  declarationBase,
  declarationCandidates,
  readDeclarations,
  relativeSpecifiers,
} from '../scripts/declaration-resolution.mjs'

/** Resolved through `path` rather than written out, so the test is not POSIX-only. */
const PKG = path.resolve('/pkg')
const at = (...parts: string[]) => path.join(PKG, ...parts)

describe('a specifier carries its runtime extension or it does not, and both resolve', () => {
  it('strips a runtime extension, because that is what a declaration means by one', () => {
    // In a declaration, `./hero.js` names the module emitted from `hero.tsx`, and
    // its types live in `hero.d.ts`. Treating the `.js` as part of the stem is how
    // both resolvers came to find nothing.
    expect(declarationBase(PKG, './hero.js')).toBe(at('hero'))
    expect(declarationBase(PKG, './hero')).toBe(at('hero'))
  })

  it('handles the other runtime extensions a published package may carry', () => {
    expect(declarationBase(PKG, './hero.mjs')).toBe(at('hero'))
    expect(declarationBase(PKG, './hero.cjs')).toBe(at('hero'))
  })

  it('tries the declaration shapes, in the order that finds a sibling first', () => {
    // A Block's `index.tsx` re-exports from `./hero`, so the declaration is in the
    // sibling rather than in the index. A directory import resolves through its own
    // `index.d.ts`.
    expect(declarationCandidates(PKG, './hero.js')).toEqual([
      at('hero.d.ts'),
      at('hero.d.mts'),
      at('hero', 'index.d.ts'),
    ])
    expect(declarationCandidates(PKG, './nested/hero')).toContain(
      at('nested', 'hero', 'index.d.ts'),
    )
  })

  it('leaves an extension it does not know alone rather than guessing', () => {
    expect(declarationBase(PKG, './hero.json')).toBe(at('hero.json'))
  })
})

describe('reading a declaration follows its relative re-exports', () => {
  it('finds them whether or not the specifier carries an extension', async () => {
    // The two shapes, side by side, because the point is that a resolver written
    // against one keeps working against the other rather than to whichever one
    // happens to be emitted today.
    const files: Record<string, string> = {
      [at('index.d.ts')]: "export { Hero01 } from './hero.js';\n",
      [at('hero.d.ts')]: 'export interface Hero01Props { title: string; }\n',
    }
    const read = async (candidate: string) => files[candidate]

    const withExtension = await readDeclarations(at('index.d.ts'), read)
    // And the same tree, authored the way it used to be, with no extension anywhere.
    const legacy: Record<string, string> = {
      [at('index.d.ts')]: "export { Hero01 } from './hero';\n",
      [at('hero.d.ts')]: 'export interface Hero01Props { title: string; }\n',
    }
    const withoutExtension = await readDeclarations(at('index.d.ts'), async (c) => legacy[c])

    expect(withExtension).toContain('Hero01Props')
    expect(withoutExtension).toContain('Hero01Props')
  })

  it('resolves nothing extra when the only specifier is bare, and does not throw', async () => {
    const text = "export { Thing } from 'react';\n"
    expect(relativeSpecifiers(text)).toEqual([])
    // A file that is not there at all yields its own text rather than an exception,
    // because a resolver that throws stops the corpus instead of emptying it, and an
    // empty corpus is the harder failure to see.
    const only = await readDeclarations(at('missing.d.ts'), async () => undefined)
    expect(only).toBe('')
  })
})
