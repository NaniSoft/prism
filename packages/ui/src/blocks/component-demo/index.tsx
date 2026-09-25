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
      <figcaption className="prism-visually-hidden">Rendered example and verbatim source</figcaption>
      <div className="prism-component-demo__body" role="group" aria-label="Rendered example">{children}</div>
      <pre className="prism-component-demo__code" data-language={language} tabIndex={0} aria-label={`${language} example source`}><code>{code}</code></pre>
    </figure>
  );
}
