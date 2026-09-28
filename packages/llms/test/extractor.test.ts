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

  it('stops at the declaration and not at whatever the caller appended after it', () => {
    // The corpus builder concatenates a module's declaration with the emitted
    // JavaScript of the same module, so the composition section can name what the
    // item is composed of. The scan used to walk each body TWICE, once to read it
    // and again with a depth counter of its own, and the two counts disagreed:
    // the re-walk counted every `{` the balanced read had already consumed, so
    // `depth` never came back to 0 at the closing brace and the scan never found
    // its terminator. It ran on into the JavaScript, and every object literal in
    // the implementation was published as another arm of the props type. A
    // documentation Page came to take the class strings of its own links.
    //
    // The shape below is the one that fails: a body whose braces are NOT
    // neutral once re-walked, which is every body, because the opening brace is
    // counted by the balanced read and again by the walk.
    const declaration = [
      'export type DocsProps = {',
      '    /** The words of the heading. */',
      '    heading: string;',
      '    status: string;',
      '};',
      'declare function Docs(props: DocsProps): unknown;',
    ].join('\n')
    const emittedJs = [
      'export function Pager({ previous, next }) {',
      '  return { href: previous.href, className: "pager" };',
      '}',
    ].join('\n')

    const [docs] = extractExports(`${declaration}\n${emittedJs}`, ['Docs'])
    expect(docs?.props.map((prop) => [prop.name, prop.typeText])).toEqual([
      ['heading', 'string'],
      ['status', 'string'],
    ])
  })

  it('reads a body once, so a JSDoc comment cannot unbalance the scan', () => {
    // `readBalancedBody` skips comments, so a quoted brace in a JSDoc leaves the
    // body balanced. A second walk whose counter did not skip comments would
    // count the quoted brace and never terminate, so this is the same defect
    // reached by a different route and the fix is the same one.
    const source = [
      'export type Quoted = {',
      '    /**',
      '     * Renders a brace: `{` on the way in and `}` on the way out.',
      '     */',
      '    branch: string;',
      '};',
      'declare function Quoted(props: Quoted): unknown;',
      'export function Implementation() {',
      '  return { leaked: true };',
      '}',
    ].join('\n')

    const [quoted] = extractExports(source, ['Quoted'])
    expect(quoted?.props.map((prop) => prop.name)).toEqual(['branch'])
  })

  it('publishes a union whole however many arms it has', () => {
    // Three arms, so a reader that published the first and stopped would pass on
    // a two-arm fixture and fail here. The Page's navigation union has three.
    const source = [
      'export type NavEntry = {',
      "    type: 'page';",
      '    href: string;',
      '} | {',
      "    type: 'group';",
      '    items: readonly NavEntry[];',
      '} | {',
      "    type: 'divider';",
      '    title: string;',
      '};',
      'export type NavProps = {',
      '    nav: readonly NavEntry[];',
      '};',
      'declare function Nav(props: NavEntry): unknown;',
    ].join('\n')

    const [nav] = extractExports(source, ['Nav'])
    expect(nav?.props.map((prop) => [prop.name, prop.typeText])).toEqual([
      ['type', "'page'"],
      ['href', 'string'],
      ['type', "'group'"],
      ['items', 'readonly NavEntry[]'],
      ['type', "'divider'"],
      ['title', 'string'],
    ])
  })
})
