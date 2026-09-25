'use client';

import { useState } from 'react';
import { Switch } from '@nanisoft/prism-ui/components/switch';

export default function SwitchDemo() {
  const [enabled, setEnabled] = useState(true);
  return <Switch label="Publish updates" description="Makes the latest corpus available through MCP." checked={enabled} onCheckedChange={setEnabled} />;
}
