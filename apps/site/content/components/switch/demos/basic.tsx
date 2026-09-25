'use client';

import { useState } from 'react';
import { Switch } from '@nanisoft/prism-ui/components/switch';
import { Text } from '@nanisoft/prism-ui/components/typography';

export default function SwitchDemo() {
  const [enabled, setEnabled] = useState(true);

  return (
    <div role="group" aria-label="Synthetic release publishing setting" style={{ display: 'grid', gap: 10 }}>
      <Text variant="tertiary">Synthetic release publishing setting</Text>
      <Switch
        label="Publish release notes"
        description="Makes the synthetic release note available in this documentation preview."
        checked={enabled}
        onCheckedChange={setEnabled}
      />
    </div>
  );
}
