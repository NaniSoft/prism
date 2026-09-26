import { describe, expect, it } from 'vitest'

import { extractExports, extractProps } from '../src/extractor.js'

describe('extractProps', () => {
  it('extracts an exported props interface in source order', () => {
    const source = [
      'export interface DisplayTitleProps {',
      '    /** The width axis. */',
      "    width?: 'normal' | 'refracted';",
      '}',
    ].join('\n')

    expect(extractProps(source)).toEqual([
      {
        typeName: 'DisplayTitleProps',
        props: [
          {
            name: 'width',
            typeText: "'normal' | 'refracted'",
            description: 'The width axis.',
            required: false,
          },
        ],
      },
    ])
  })

  it('keeps a multi-line object type intact via bracket depth', () => {
    const source = [
      'export interface ShellProps {',
      '    /** The neighbours. */',
      '    neighbours?: {',
      '        previous?: { title: string; url: string };',
      '        next?: { title: string; url: string };',
      '    };',
      '    title?: string;',
      '}',
    ].join('\n')

    const [iface] = extractProps(source)
    expect(iface?.props.map((prop) => prop.name)).toEqual(['neighbours', 'title'])
    expect(iface?.props[0]?.typeText).toBe(
      '{ previous?: { title: string; url: string }; next?: { title: string; url: string }; }',
    )
  })

  it('reads @defaultValue tags', () => {
    const source = [
      'export interface DemoProps {',
      '    /** Rows shown. @defaultValue 4 */',
      '    rows?: number;',
      '}',
    ].join('\n')

    expect(extractProps(source)[0]?.props[0]?.defaultValue).toBe('4')
    expect(extractProps(source)[0]?.props[0]?.description).toBe('Rows shown.')
  })

  it('maps an export to its named props type, native base and recipe rows', () => {
    const source = [
      'declare const buttonVariants: (props?: ({',
      "    variant?: 'default' | 'outline' | null | undefined;",
      "    size?: 'default' | 'sm' | null | undefined;",
      '} & import("class-variance-authority/types").ClassProp) | undefined) => string;',
      "declare function Button({ className, variant, size, ...props }: ComponentProps<'button'> & VariantProps<typeof buttonVariants>): unknown;",
    ].join('\n')

    const [button] = extractExports(source, ['Button'])
    expect(button?.extendsType).toBe("React.ComponentProps<'button'>")
    expect(button?.props.map((prop) => prop.name)).toEqual(['variant', 'size'])
  })

  it('resolves a named props type through a function parameter', () => {
    const source = [
      'export interface Hero01Props {',
      '    /** Optional label. */',
      '    eyebrow?: string;',
      '    title: string;',
      '}',
      "declare function Hero01(props: Hero01Props): unknown;",
    ].join('\n')

    const [hero] = extractExports(source, ['Hero01'])
    expect(hero?.extendsType).toBeUndefined()
    expect(hero?.props.map((prop) => [prop.name, prop.required])).toEqual([
      ['eyebrow', false],
      ['title', true],
    ])
  })

  it('records ComponentProps as an inherited base for a native-backed export', () => {
    const source = "declare function Card({ className, ...props }: ComponentProps<'div'>): unknown;"
    const [card] = extractExports(source, ['Card'])
    expect(card?.props).toEqual([])
    expect(card?.extendsType).toBe("React.ComponentProps<'div'>")
  })
})
