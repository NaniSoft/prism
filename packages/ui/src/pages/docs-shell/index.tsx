import type { ReactNode } from 'react';

import { PageHeader } from '../../blocks/page-header/index.js';
import { cx } from '../../internal/cx.js';
import { DocsNav, DocsNeighbours } from './docs-navigation.js';

export interface DocsNavEntry {
  id: string;
  title: string;
  url: string;
  children?: readonly DocsNavEntry[];
}

export interface DocsShellProps {
  children: ReactNode;
  title?: string;
  description?: ReactNode;
  nav?: readonly DocsNavEntry[];
  toc?: readonly DocsNavEntry[];
  neighbours?: { previous?: { title: string; url: string }; next?: { title: string; url: string } };
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function DocsShell({ children, title, description, nav, toc, neighbours, header, footer, className }: DocsShellProps) {
  return (
    <div className={cx('prism-docs-shell', className)} data-prism="docs-shell">
      {header}
      <div className="prism-docs-shell__body">
        {nav?.length ? (
          <aside className="prism-docs-shell__sidebar" aria-label="Section navigation">
            <nav className="prism-docs-shell__desktop-nav" aria-label="Documentation sections">
              <DocsNav entries={nav} className="prism-docs-shell__nav" label="Documentation sections" />
            </nav>
            <DetailsNav entries={nav} />
          </aside>
        ) : null}
        <article className="prism-docs-shell__main" aria-label={title ? `${title} documentation` : undefined}>
          {title ? <PageHeader title={title} description={description} level={1} /> : description ? <header className="prism-docs-shell__header"><p>{description}</p></header> : null}
          <div className="prism-docs-shell__content">{children}</div>
          {neighbours?.previous || neighbours?.next ? <DocsNeighbours previous={neighbours.previous} next={neighbours.next} /> : null}
        </article>
        {toc?.length ? (
          <aside className="prism-docs-shell__toc" aria-label="On this page">
            <div className="prism-docs-shell__toc-title">On this page</div>
            <nav aria-label="On this page"><DocsNav entries={toc} className="prism-docs-shell__toc-list" label="On this page links" /></nav>
          </aside>
        ) : null}
      </div>
      {footer}
    </div>
  );
}

function DetailsNav({ entries }: { entries: readonly DocsNavEntry[] }) {
  return (
    <details className="prism-docs-shell__mobile-nav">
      <summary>Section navigation</summary>
      <DocsNav entries={entries} className="prism-docs-shell__nav" label="Section navigation" />
    </details>
  );
}
