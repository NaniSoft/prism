// prism-ui ComponentDemo block — docs format v1 (ticket 12).
// A dumb data-in block: `code` is the raw demo source, `children` the live
// preview. No fs, no fumadocs — the raw-reading wire is app-level, so the same
// file serves the site build, prism-llms, and copy/paste consumers.

import type { CSSProperties, ReactNode } from 'react';

export interface ComponentDemoProps {
  /** The example's source code, verbatim from its demos/<slug>.tsx file. */
  code: string;
  /** The live-rendered example. */
  children: ReactNode;
  /** Which language `code` is (default 'tsx'). */
  language?: string;
  className?: string;
  style?: CSSProperties;
}

export function ComponentDemo({ code, children, language = 'tsx', className, style }: ComponentDemoProps) {
  return (
    <figure className={['prism-component-demo', className].filter(Boolean).join(' ')} style={style} data-prism="component-demo">
      <div className="prism-component-demo__body">{children}</div>
      <pre className="prism-component-demo__code" data-language={language}>
        <code>{code}</code>
      </pre>
    </figure>
  );
}
