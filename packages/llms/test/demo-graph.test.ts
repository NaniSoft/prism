import { describe, expect, it } from 'vitest'

import { scanPrismImports, scanPrismImportsWithSource, validateDemoSource } from '../src/demo-graph.js'

describe('validateDemoSource', () => {
  it('accepts a self-contained demo with react, prism-ui and lucide-react', () => {
    const source = [
      "'use client'",
      "import { useState } from 'react'",
      "import { Zap } from 'lucide-react'",
      "import { Button } from '@nanisoft/prism-ui/components/button'",
      '',
      'export default function Demo() {',
      '  return <Button />',
      '}',
    ].join('\n')
    expect(validateDemoSource(source)).toEqual([])
  })

  it('rejects a relative import, a foreign import and a missing default export', () => {
    const violations = validateDemoSource(
      ["import { helper } from './helper'", "import { clsx } from 'clsx'", 'export function No() {}'].join('\n'),
    )
    expect(violations.map((violation) => violation.reason)).toEqual([
      "relative import './helper': demos must be self-contained",
      "import from 'clsx': demos import only from '@nanisoft/prism-ui/*', 'react' and 'lucide-react'",
      'no default export: each demo default-exports its example',
    ])
  })
})

describe('scanPrismImports', () => {
  it('returns prism-ui names, dropping type-only specifiers', () => {
    const source = [
      "import { useState } from 'react'",
      "import { Card, type CardProps } from '@nanisoft/prism-ui/components/card'",
      "import { Button as Btn } from '@nanisoft/prism-ui/components/button'",
    ].join('\n')
    expect(scanPrismImports(source)).toEqual(['Button', 'Card'])
  })

  it('keeps the module specifier alongside the names', () => {
    const source = "import { Hero01 } from '@nanisoft/prism-ui/blocks/hero-01'"
    expect(scanPrismImportsWithSource(source)).toEqual([
      { specifier: '@nanisoft/prism-ui/blocks/hero-01', names: ['Hero01'] },
    ])
  })
})
