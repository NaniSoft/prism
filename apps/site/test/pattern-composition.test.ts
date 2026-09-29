/**
 * The Pattern gate, over cases rather than over the live tree.
 *
 * The live run is the integration; this is the proof that each rule fires. A gate
 * whose rules have never been seen to fail is a gate nobody can trust, and this one
 * is guarding a class of error that is silent by nature: nothing about a prose page
 * is type-checked, so a Pattern naming an Item that was renamed reads perfectly and
 * builds perfectly.
 *
 * It found one on its first real run, while these Patterns were being written: a
 * document composed of `Check`, which is an icon from `lucide-react` and not an Item
 * anybody can install. That is the whole argument for the gate in one fact.
 */
import { describe, expect, it } from 'vitest'

import {
  catalogueNames,
  checkPattern,
  checkPatterns,
  readDeclaration,
  splitFrontmatter,
} from '../scripts/pattern-composition.mjs'

const catalogue = catalogueNames([
  { name: 'SettingsPage', kind: 'page' },
  { name: 'SettingsPanel01', kind: 'block' },
  { name: 'Button', kind: 'component' },
  { name: 'Card', kind: 'component' },
])

const pattern = (composes: string[], file = 'example') => ({
  file: `${file}.mdx`,
  title: 'Example',
  composes,
})

describe('the frontmatter subset', () => {
  it('splits a document into its frontmatter and its body', () => {
    const { frontmatter, body } = splitFrontmatter('---\ntitle: A thing\n---\nThe body.\n')
    expect(frontmatter).toBe('title: A thing')
    expect(body.trim()).toBe('The body.')
  })

  it('treats a document with no frontmatter as declaring nothing', () => {
    // Whether a Pattern *must* declare something is a separate question, and
    // answering it here would make one function decide two things.
    expect(splitFrontmatter('Just a body.').frontmatter).toBe('')
  })

  it('reads a block sequence, which is the form a hand-edited document reaches for', () => {
    const read = readDeclaration('title: T\ncomposes:\n  - Button\n  - Card\n')
    expect(read.title).toBe('T')
    expect(read.composes).toEqual(['Button', 'Card'])
  })

  it('reads the inline flow form too, because both are ordinary YAML', () => {
    expect(readDeclaration('composes: [Button, Card]').composes).toEqual(['Button', 'Card'])
  })

  it('keeps a quoted scalar whole, so a title with a colon survives', () => {
    expect(readDeclaration('title: "Settings: the whole surface"').title).toBe(
      'Settings: the whole surface',
    )
  })

  it('leaves a key it does not understand alone, so a future key is not misread', () => {
    // If an unknown key were read as a declaration, adding one later would silently
    // start failing the build under a rule nobody wrote.
    const read = readDeclaration('composes:\n  - Button\nstatus: draft\n')
    expect(read.composes).toEqual(['Button'])
  })
})

describe('a declared Item must exist', () => {
  it('accepts Items that are in the catalogue, of any kind', () => {
    expect(checkPattern(pattern(['Button', 'SettingsPage']), catalogue)).toEqual([])
  })

  it('reports an Item nobody can install, and names the document', () => {
    // `Check` is the real one: an icon from lucide-react, named as though it were
    // a Prism Item, found by this gate on its first live run.
    const findings = checkPattern(pattern(['Button', 'Check']), catalogue)
    expect(findings).toHaveLength(1)
    expect(findings[0]?.file).toBe('example.mdx')
    expect(findings[0]?.message).toContain('"Check"')
  })

  it('reports every missing name, not just the first', () => {
    // A gate that stops at one finding is a gate that needs running twice.
    const findings = checkPattern(pattern(['Check', 'Nonesuch', 'Button']), catalogue)
    expect(findings).toHaveLength(2)
    expect(findings.map((f) => f.message).join(' ')).toContain('Nonesuch')
  })

  it('a Pattern declaring nothing is a document with nothing to check', () => {
    const findings = checkPattern(pattern([]), catalogue)
    expect(findings).toHaveLength(1)
    expect(findings[0]?.message).toContain('declares no Items')
  })
})

describe('the Section is checked in both directions', () => {
  const manifest = { section: 'patterns', pages: ['one', 'two'] }

  it('passes when the manifest and the documents agree exactly', () => {
    expect(
      checkPatterns({
        patterns: [pattern(['Button'], 'one'), pattern(['Card'], 'two')],
        manifest,
        names: catalogue,
      }),
    ).toEqual([])
  })

  it('reports a document nothing links to', () => {
    // The file existing is not the same as the page being published.
    const findings = checkPatterns({
      patterns: [pattern(['Button'], 'one'), pattern(['Button'], 'two'), pattern(['Button'], 'three')],
      manifest,
      names: catalogue,
    })
    expect(findings).toHaveLength(1)
    expect(findings[0]?.file).toBe('patterns/three.mdx')
    expect(findings[0]?.message).toContain('not in its `meta.json`')
  })

  it('reports a manifest entry with no document behind it', () => {
    // The other direction, because a nav entry with no page is a 404 the build
    // emits happily. One finding, not two: `one` is on disk and listed, so it is
    // only `two` that is missing a document. The first version of this expected two
    // and was wrong, which is worth recording because a test that expects a
    // symmetric result from an asymmetric input is a test that has not thought
    // about the input.
    const findings = checkPatterns({
      patterns: [pattern(['Button'], 'one')],
      manifest,
      names: catalogue,
    })
    expect(findings).toHaveLength(1)
    expect(findings[0]?.message).toContain('no document beside it')
    expect(findings[0]?.message).toContain('"two"')
  })
})
