import { describe, expect, it } from 'vitest';
import { extractProps } from '../src/extractor.js';

describe('extractProps', () => {
  it('extracts props with TSDoc and optionality from a wrapper declaration', () => {
    const source = [
      "import type { TitleProps } from 'antd/es/typography/Title.js';",
      'export interface DisplayTitleProps extends TitleProps {',
      "    /** 'refracted' applies the display width axis (wdth 125). Default. */",
      "    width?: 'normal' | 'refracted';",
      '}',
      'export declare function DisplayTitle(props: DisplayTitleProps): unknown;',
    ].join('\n');

    expect(extractProps(source)).toEqual([
      {
        typeName: 'DisplayTitleProps',
        extendsType: 'TitleProps',
        props: [
          {
            name: 'width',
            typeText: "'normal' | 'refracted'",
            description: "'refracted' applies the display width axis (wdth 125). Default.",
            required: false,
            defaultValue: undefined,
          },
        ],
      },
    ]);
  });

  it('keeps multi-line object-literal types intact via bracket depth', () => {
    const source = [
      'export interface DocsShellProps {',
      '    /** Prev/next neighbours at the boundary. */',
      '    neighbours?: {',
      '        previous?: { title: string; url: string };',
      '        next?: { title: string; url: string };',
      '    };',
      '    title?: string;',
      '}',
    ].join('\n');

    const [iface] = extractProps(source);
    expect(iface?.props.map((prop) => prop.name)).toEqual(['neighbours', 'title']);
    expect(iface?.props[0]?.typeText).toBe(
      '{ previous?: { title: string; url: string }; next?: { title: string; url: string }; }',
    );
    expect(iface?.props[1]?.description).toBeUndefined();
  });

  it('reads @defaultValue tags', () => {
    const source = ['export interface DemoProps {', '    /** Rows shown. */', '    /** @defaultValue 4 */', '    rows?: number;', '}'].join('\n');

    expect(extractProps(source)[0]?.props[0]?.defaultValue).toBe('4');
    expect(extractProps(source)[0]?.props[0]?.description).toBe('Rows shown.');
  });

  it('returns nothing for a pass-through re-export (the Extends seam)', () => {
    expect(extractProps("export { Button, type ButtonProps } from 'antd';\n")).toEqual([]);
  });

  it('ignores supporting types that are not props interfaces', () => {
    const source = [
      'export interface BlogFrontmatter {',
      '    title: string;',
      '}',
      'export interface BlogLayoutProps {',
      '    frontmatter?: BlogFrontmatter;',
      '}',
    ].join('\n');

    expect(extractProps(source).map((iface) => iface.typeName)).toEqual(['BlogLayoutProps']);
  });
});
