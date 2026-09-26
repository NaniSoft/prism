import { describe, expect, it } from 'vitest'

import {
  assembleDoc,
  demoTitle,
  fence,
  parseMdx,
  parsePropLine,
  renderCompositionSection,
  renderPropLine,
  renderPropsSection,
  stripMdxMechanics,
  stripSection,
} from '../src/markdown.js'

describe('parseMdx', () => {
  it('splits frontmatter from the body and unquotes values', () => {
    const { data, body } = parseMdx("---\ntitle: Button\ndescription: 'The action control.'\n---\n\nBody.\n")
    expect(data).toEqual({ title: 'Button', description: 'The action control.' })
    expect(body).toBe('Body.\n')
  })

  it('passes through a file with no frontmatter', () => {
    expect(parseMdx('Just prose.\n')).toEqual({ data: {}, body: 'Just prose.\n' })
  })
})

describe('stripMdxMechanics', () => {
  it('strips MDX imports and comment markers but keeps a fenced import line', () => {
    const body = [
      '{/* marker */}',
      '',
      "import { ComponentDemo } from '@nanisoft/prism-ui/blocks'",
      '',
      '```ts',
      "import { Button } from '@nanisoft/prism-ui/components/button'",
      '```',
      '',
      'Prose.',
    ].join('\n')
    const out = stripMdxMechanics(body)
    expect(out).not.toContain('marker')
    expect(out).not.toContain('ComponentDemo } from')
    expect(out).toContain("import { Button } from '@nanisoft/prism-ui/components/button'")
  })
})

describe('stripSection', () => {
  it('drops the named H2 section and keeps the rest', () => {
    const body = ['## Overview', '', 'Overview text.', '', '## Usage', '', 'Usage text.', '', '## Guidelines', '', 'Guidance.'].join('\n')
    const out = stripSection(body, 'Usage')
    expect(out).toContain('## Overview')
    expect(out).toContain('## Guidelines')
    expect(out).not.toContain('Usage text.')
  })
})

describe('the props definition list', () => {
  it('renders the exact fixed line shape', () => {
    const line = renderPropLine({
      name: 'variant',
      typeText: 'ButtonVariant',
      required: false,
      defaultValue: 'primary',
      description: 'the visual emphasis of the control',
    })
    expect(line).toBe(
      '**`variant`** `ButtonVariant` \u00b7 optional \u00b7 default: `primary` \u2014 the visual emphasis of the control',
    )
  })

  it('round-trips a rendered line back into its four fields', () => {
    const line = renderPropLine({
      name: 'rows',
      typeText: 'number',
      required: true,
    })
    expect(parsePropLine(line)).toEqual({ name: 'rows', typeText: 'number', required: true })
  })

  it('uses an em dash for an absent default and round-trips it', () => {
    const line = renderPropLine({ name: 'title', typeText: 'string', required: true })
    expect(line).toBe('**`title`** `string` \u00b7 required \u00b7 default: \u2014')
    expect(parsePropLine(line)).toEqual({ name: 'title', typeText: 'string', required: true })
  })

  it('emits the literal ## Props heading and the seam line when no props exist', () => {
    const section = renderPropsSection([], '_No additional props beyond the internal Base UI `Select` primitive._')
    expect(section).toBe('## Props\n\n_No additional props beyond the internal Base UI `Select` primitive._')
  })

  it('de-duplicates prop names across compound parts', () => {
    const section = renderPropsSection(
      [
        { typeName: 'A', props: [{ name: 'value', typeText: 'string', required: false }] },
        { typeName: 'B', props: [{ name: 'value', typeText: 'string', required: false }, { name: 'open', typeText: 'boolean', required: false }] },
      ],
      'seam',
    )
    expect(section.split('\n').filter((line) => line.startsWith('**`'))).toHaveLength(2)
  })
})

describe('composition and assembly', () => {
  it('renders the composition definition list', () => {
    const section = renderCompositionSection([
      { key: 'exports', value: 'Hero01', description: 'the public runtime names this Block promises' },
    ])
    expect(section).toBe(
      '## Composition\n\n**`exports`** `Hero01` \u2014 the public runtime names this Block promises',
    )
  })

  it('reads a demo title from the JSDoc before the default export', () => {
    const source = "import { Button } from '@nanisoft/prism-ui/components/button'\n\n/** Buttons at each size. */\nexport default function Demo() {}"
    expect(demoTitle(source, 'fallback')).toBe('Buttons at each size.')
    expect(demoTitle('export default function Demo() {}', 'fallback')).toBe('fallback')
  })

  it('assembles sections with a stable blank-line separator and one trailing newline', () => {
    const doc = assembleDoc(['# Button', 'The action control.', fence('const x = 1', 'tsx'), '## Props\n\nbody'])
    expect(doc.endsWith('\n')).toBe(true)
    expect(doc).not.toContain('\n\n\n')
  })
})
