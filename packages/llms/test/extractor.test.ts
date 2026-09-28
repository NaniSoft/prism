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

  it('publishes every arm of a union, not the first', () => {
    // A union published as one arm is a type-level truth rendered as a
    // documentation-level lie. This table showed `variant?: 'icon'` and no
    // `bare` arm at all, because the scan took the first balanced body and the
    // first body of this shape is the SHARED part, so both arms were dropped. A
    // consumer reading the published surface could not see the exception the
    // compiler enforces.
    const source = [
      'type CommonProps = {',
      '    /** Optional label. */',
      '    eyebrow?: string;',
      '};',
      'export type GridProps = CommonProps & ({',
      "    variant?: 'icon';",
      '    features: IconFeature[];',
      '} | {',
      "    variant: 'bare';",
      '    features: BareFeature[];',
      '});',
      'declare function Grid(props: GridProps): unknown;',
    ].join('\n')

    const [grid] = extractExports(source, ['Grid'])
    expect(grid?.props.map((prop) => [prop.name, prop.typeText])).toEqual([
      ['variant', "'icon'"],
      ['features', 'IconFeature[]'],
      ['variant', "'bare'"],
      ['features', 'BareFeature[]'],
    ])
  })

  it('stops a union scan at the declaration boundary, not at the next one', () => {
    // The scan has to end when a terminator closes nothing it opened. A scan
    // that ended on the first member semicolon would stop at `variant?: 'icon';`
    // and never reach the second arm, which is the defect the union fix removes.
    const source = [
      'export type First = {',
      '    a?: string;',
      '}',
      'export type Second = {',
      '    b?: number;',
      '}',
      'declare function First(props: First): unknown;',
      'declare function Second(props: Second): unknown;',
    ].join('\n')

    const [first, second] = extractExports(source, ['First', 'Second'])
    expect(first?.props.map((prop) => prop.name)).toEqual(['a'])
    expect(second?.props.map((prop) => prop.name)).toEqual(['b'])
  })
})
