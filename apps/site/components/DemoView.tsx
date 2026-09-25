'use client';

import { useId, useState, type ReactNode } from 'react';
import { ComponentDemo } from '@nanisoft/prism-ui/blocks/component-demo';
import { Button } from '@nanisoft/prism-ui/components/button';
import { PrismIcon } from '@nanisoft/prism-ui/components/icon';

export interface DemoViewProps {
  code: string;
  children: ReactNode;
}

export function DemoView({ code, children }: DemoViewProps) {
  const statusId = useId();
  const [open, setOpen] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'unavailable'>('idle');

  async function copy() {
    try {
      if (!navigator.clipboard) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(code);
      setCopyState('copied');
      window.setTimeout(() => setCopyState((state) => (state === 'copied' ? 'idle' : state)), 1600);
    } catch {
      setOpen(true);
      setCopyState('unavailable');
    }
  }

  const copyLabel = copyState === 'copied' ? 'Copied' : copyState === 'unavailable' ? 'Select code' : 'Copy';

  return (
    <div className={open ? 'site-demo site-demo--open' : 'site-demo'}>
      <ComponentDemo code={code}>{children}</ComponentDemo>
      <div className="site-demo-bar">
        <Button size="sm" variant="ghost" iconStart={<PrismIcon name="command" />} aria-expanded={open} onClick={() => setOpen((value) => !value)}>{open ? 'Hide code' : 'Code'}</Button>
        <Button size="sm" variant="ghost" iconStart={<PrismIcon name={copyState === 'copied' ? 'circle-check' : 'copy'} />} onClick={() => void copy()} aria-describedby={statusId}>{copyLabel}</Button>
        <span id={statusId} className="prism-visually-hidden" role="status" aria-live="polite">{copyState === 'copied' ? 'Copied to clipboard' : copyState === 'unavailable' ? 'Clipboard unavailable. Select the code panel and copy it manually.' : ''}</span>
        {copyState === 'unavailable' ? <span className="site-demo-copy-help">Select the code panel to copy it.</span> : null}
      </div>
    </div>
  );
}
