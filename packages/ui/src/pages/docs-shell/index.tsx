import type { ReactNode } from 'react';

import { cx } from '../../internal/cx.js';

export interface DocsNavEntry {
  id: string;
  title: string;
  url: string;
  children?: DocsNavEntry[];
}

export interface DocsShellProps {
  children: ReactNode;
  title?: string;
  description?: ReactNode;
  nav?: DocsNavEntry[];
  toc?: DocsNavEntry[];
  neighbours?: { previous?: { title: string; url: string }; next?: { title: string; url: string } };
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

function DocsNav({ entries, className, label }: { entries: DocsNavEntry[]; className: string; label: string }) {
  return (
    <ul className={className} aria-label={label}>
      {entries.map((entry) => (
        <li key={entry.id}>
          {entry.url ? <a href={entry.url}>{entry.title}</a> : <span className="prism-docs-shell__nav-label">{entry.title}</span>}
          {entry.children?.length ? <DocsNav entries={entry.children} className={`${className}__nested`} label={`${entry.title} subsections`} /> : null}
        </li>
      ))}
    </ul>
  );
}

export function DocsShell({ children, title, description, nav, toc, neighbours, header, footer, className }: DocsShellProps) {
  return (
    <div className={cx('prism-docs-shell', className)} data-prism="docs-shell">
      {header}
      <div className="prism-docs-shell__body">
        {nav?.length ? (
          <aside className="prism-docs-shell__sidebar" aria-label="Section navigation">
            <DetailsNav entries={nav} />
          </aside>
        ) : null}
        <article className="prism-docs-shell__main">
          {title || description ? <header className="prism-docs-shell__header">{title ? <h1>{title}</h1> : null}{description ? <p>{description}</p> : null}</header> : null}
          <div className="prism-docs-shell__content">{children}</div>
          {neighbours?.previous || neighbours?.next ? <nav className="prism-docs-shell__neighbours">{neighbours.previous ? <a href={neighbours.previous.url} rel="prev">{neighbours.previous.title}</a> : <span />}{neighbours.next ? <a href={neighbours.next.url} rel="next">{neighbours.next.title}</a> : null}</nav> : null}
        </article>
        {toc?.length ? <aside className="prism-docs-shell__toc" aria-label="On this page"><div className="prism-docs-shell__toc-title">On this page</div><DocsNav entries={toc} className="prism-docs-shell__toc-list" label="On this page" /></aside> : null}
      </div>
      {footer}
    </div>
  );
}

function DetailsNav({ entries }: { entries: DocsNavEntry[] }) {
  return (
    <details className="prism-docs-shell__mobile-nav" open>
      <summary>Section navigation</summary>
      <DocsNav entries={entries} className="prism-docs-shell__nav" label="Section navigation" />
    </details>
  );
}
