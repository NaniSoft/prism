import { Button } from '@nanisoft/prism-ui/components/button';
import { Text } from '@nanisoft/prism-ui/components/typography';

export default function ButtonDemo() {
  return (
    <div role="group" aria-label="Synthetic catalog release actions" style={{ display: 'grid', gap: 12 }}>
      <Text variant="tertiary">Synthetic catalog release actions</Text>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button variant="primary">Create release</Button>
        <Button variant="secondary">Review queue</Button>
        <Button variant="ghost">Cancel</Button>
        <Button variant="destructive">Discard draft</Button>
        <Button variant="link" href="#release-guide">Read release guide</Button>
      </div>
    </div>
  );
}
