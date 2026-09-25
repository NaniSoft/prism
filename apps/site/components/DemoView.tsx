'use client';

// The ComponentDemo wire (ticket 12 §2): live preview via prism-ui's
// data-in block, plus the slim action bar — a Code toggle for the collapsible
// source panel and Copy for the verbatim demos/<slug>.tsx text. The three
// consumers of the demo file (preview, copy string, get_item_source) read the
// same source; this component is the site's one reader of the registry.

import { useState, type ReactNode } from 'react';
import { ComponentDemo } from '@nanisoft/prism-ui/blocks';
import { Button } from '@nanisoft/prism-ui/components/button';
import { CodeOutlined, CopyOutlined } from '@nanisoft/prism-ui/icons';

export interface DemoViewProps {
  /** Verbatim demo source (the copy string). */
  code: string;
  /** The live-rendered example. */
  children: ReactNode;
}

export function DemoView({ code, children }: DemoViewProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard unavailable (permissions/insecure context) — stay quiet.
    }
  }

  return (
    <div className={open ? 'site-demo site-demo--open' : 'site-demo'}>
      <ComponentDemo code={code}>{children}</ComponentDemo>
      <div className="site-demo-bar">
        <Button size="small" type="text" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
          <CodeOutlined aria-hidden />
          {open ? 'Hide code' : 'Code'}
        </Button>
        <Button size="small" type="text" onClick={() => void copy()}>
          <CopyOutlined aria-hidden />
          {copied ? 'Copied' : 'Copy'}
        </Button>
        {/* Announce the copy for screen readers — the label swap alone is silent. */}
        <span className="prism-visually-hidden" role="status" aria-live="polite">
          {copied ? 'Copied to clipboard' : ''}
        </span>
      </div>
    </div>
  );
}
