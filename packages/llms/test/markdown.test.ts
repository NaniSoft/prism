import { describe, expect, it } from 'vitest';
import { parseMdx, renderComponentDemos, renderPropsSection, renderTable, stripMdxMechanics } from '../src/markdown.js';

describe('parseMdx', () => {
  it('splits frontmatter from body and unquotes values', () => {
    const { data, body } = parseMdx("---\ntitle: Button\ndescription: 'antd Button, unchanged'\n---\n\nBody here.\n");
    expect(data).toEqual({ title: 'Button', description: 'antd Button, unchanged' });
    expect(body).toBe('Body here.\n');
  });

  it('passes through files without frontmatter', () => {
    expect(parseMdx('Just prose.\n')).toEqual({ data: {}, body: 'Just prose.\n' });
  });
});

describe('renderComponentDemos', () => {
  it('replaces a ComponentDemo element with the example fence', () => {
    const out = renderComponentDemos('## Basic\n\n<ComponentDemo id="basic" title="Basic usage" />', (id) =>
      id === 'basic' ? 'export default function Basic() {\n  return null;\n}\n' : undefined,
    );
    expect(out).toBe(
      '## Basic\n\n**Basic usage**\n```tsx\nexport default function Basic() {\n  return null;\n}\n```',
    );
  });

  it('leaves code fences untouched', () => {
    const body = '```tsx\n<ComponentDemo id="basic" />\n```';
    expect(renderComponentDemos(body, () => 'x')).toBe(body);
  });

  it('throws on an unknown example id', () => {
    expect(() => renderComponentDemos('<ComponentDemo id="ghost" />', () => undefined)).toThrow(
      /unknown example id 'ghost'/,
    );
  });
});

describe('stripMdxMechanics', () => {
  it('strips MDX imports and generated-stub markers but keeps fenced import lines', () => {
    const body = [
      "{/* prism:generated-stub v1 */}",
      '',
      "import { ComponentDemo } from '@nanisoft/prism-ui/blocks';",
      '',
      '```ts',
      "import { Button } from '@nanisoft/prism-ui/components';",
      '```',
      '',
      'Prose.',
    ].join('\n');
    const out = stripMdxMechanics(body);
    expect(out).not.toContain('generated-stub');
    expect(out).not.toContain('ComponentDemo } from');
    expect(out).toContain("import { Button } from '@nanisoft/prism-ui/components';");
  });
});

describe('renderPropsSection', () => {
  it('renders a table for props-bearing interfaces', () => {
    const section = renderPropsSection([
      {
        typeName: 'DisplayTitleProps',
        extendsType: 'TitleProps',
        props: [{ name: 'width', typeText: "'normal' | 'refracted'", description: 'The width axis.', required: false }],
      },
    ]);
    expect(section).toContain('## Props');
    expect(section).toContain("| `width` (optional) | 'normal' \\| 'refracted' | — | The width axis. |");
  });

  it('collapses zero-prop interfaces to the antd seam line', () => {
    expect(renderPropsSection([{ typeName: 'EmptyProps', props: [] }])).toBe(
      '## Props\n\n_No additional props beyond the antd base component._',
    );
  });
});

describe('renderTable', () => {
  it('escapes pipes in cells', () => {
    expect(renderTable(['A'], [['x | y']])).toBe(['| A |', '| --- |', '| x \\| y |'].join('\n'));
  });
});
