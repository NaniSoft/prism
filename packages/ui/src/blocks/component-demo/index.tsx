import type { CSSProperties, ReactNode } from 'react';

import { cx } from '../../internal/cx.js';

export interface ComponentDemoProps {
  code: string;
  children: ReactNode;
  language?: string;
  className?: string;
  style?: CSSProperties;
}

export function ComponentDemo({ code, children, language = 'tsx', className, style }: ComponentDemoProps) {
  return (
    <figure className={cx('prism-component-demo', className)} style={style} data-prism="component-demo">
      <div className="prism-component-demo__body">{children}</div>
      <pre className="prism-component-demo__code" data-language={language}><code>{code}</code></pre>
    </figure>
  );
}
