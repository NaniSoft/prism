import { ComponentDemo } from '@nanisoft/prism-ui/blocks/component-demo';
import { Badge } from '@nanisoft/prism-ui/components/badge';
import { Text } from '@nanisoft/prism-ui/components/typography';

const EXAMPLE_SOURCE = [
  "import { ComponentDemo } from '@nanisoft/prism-ui/blocks/component-demo';",
  "import { Badge } from '@nanisoft/prism-ui/components/badge';",
  '',
  'export default function ReleasePreview() {',
  '  return (',
  '    <ComponentDemo code="const example = true;">',
  '      <Badge variant="info">Synthetic release</Badge>',
  '    </ComponentDemo>',
  '  );',
  '}',
].join('\n');

export default function ComponentDemoBlockDemo() {
  return (
    <ComponentDemo code={EXAMPLE_SOURCE} language="tsx" style={{ width: 'min(100%, 560px)' }}>
      <div role="group" aria-label="Synthetic NaniSoft release example" style={{ display: 'grid', width: 'min(100%, 420px)', gap: 8 }}>
        <Badge variant="info">Synthetic NaniSoft preview</Badge>
        <Text variant="secondary">The rendered body and its source stay together while the application owns the content.</Text>
      </div>
    </ComponentDemo>
  );
}
