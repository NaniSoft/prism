import { describe, expect, it } from 'vitest';
import { scanPrismImports, validateDemoSource } from '../src/demo-graph.js';

describe('validateDemoSource', () => {
  it('accepts a self-contained demo', () => {
    const source = [
      "import { useState } from 'react';",
      "import { Button, Stack } from '@nanisoft/prism-ui/components';",
      '',
      'export default function Basic() {',
      "  const [on, setOn] = useState(false);",
      '  return <Button onClick={() => setOn(!on)}>{on ? "On" : "Off"}</Button>;',
      '}',
    ].join('\n');
    expect(validateDemoSource(source)).toEqual([]);
  });

  it('rejects relative and non-allowlisted imports and missing default exports', () => {
    const violations = validateDemoSource([
      "import { helper } from './helper';",
      "import { ComponentDemo } from '@nanisoft/prism-ui/blocks';",
      'export function No() {',
      '  return null;',
      '}',
    ].join('\n'));
    expect(violations.map((v) => v.reason)).toEqual([
      "relative import './helper' — demos must be self-contained",
      'no default export — each demo default-exports its example component',
    ]);
  });
});

describe('scanPrismImports', () => {
  it('returns catalog names — aliases resolve to the original, type-only specifiers skip', () => {
    const source = [
      "import { PageHeader, type DocsNavEntry } from '@nanisoft/prism-ui/pages';",
      "import { Button as Btn } from '@nanisoft/prism-ui/components';",
      "import { useState } from 'react';",
    ].join('\n');
    expect(scanPrismImports(source)).toEqual(['Button', 'PageHeader']);
  });
});
