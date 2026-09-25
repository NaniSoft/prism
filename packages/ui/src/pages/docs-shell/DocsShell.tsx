// prism-ui DocsShell page (ticket 03 / ADR-0003): the full-page documentation
// frame. Takes Prism-owned structural view-model props — never next/* or
// fumadocs-* types; apps map their loader output into these props via
// toPrismTree().

import type { ReactNode } from 'react';

/** A flat, app-mapped navigation tree entry (the app adapts its docs loader). */
export interface DocsNavEntry {
  /** Stable id — also the DOM anchor. */
  id: string;
  title: string;
  url: string;
  children?: DocsNavEntry[];
}

export interface DocsShellProps {
  /** The article body (the app renders fumadocs MDX content into it). */
  children: ReactNode;
  /** Page title; omitted for index-style pages that own their heading. */
  title?: string;
  description?: string;
  /** Sidebar navigation tree. */
  nav?: DocsNavEntry[];
  /** Table-of-contents entries for the current page. */
  toc?: DocsNavEntry[];
  /** Prev/next neighbours at the boundary. */
  neighbours?: { previous?: { title: string; url: string }; next?: { title: string; url: string } };
  /** Slot overrides for chrome — the app's header/footer. */
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

function DocsNav({ entries, className }: { entries: DocsNavEntry[]; className: string }): ReactNode {
  return (
    <ul className={className}>
      {entries.map((entry) => (
        <li key={entry.id}>
          {/* Separators and index-less folders carry no destination: render them
              as a non-link label, never an empty `<a href="">` (WCAG 4.1.2). */}
          {entry.url ? (
            <a href={entry.url}>{entry.title}</a>
          ) : (
            <span className="prism-docs-shell__nav-label">{entry.title}</span>
          )}
          {entry.children && entry.children.length > 0 && <DocsNav entries={entry.children} className={`${className}__nested`} />}
        </li>
      ))}
    </ul>
  );
}

export function DocsShell({ children, title, description, nav, toc, neighbours, header, footer, className }: DocsShellProps) {
  return (
    <div className={['prism-docs-shell', className].filter(Boolean).join(' ')} data-prism="docs-shell">
      {header}
      <div className="prism-docs-shell__body">
        {nav && nav.length > 0 && (
          <aside className="prism-docs-shell__sidebar" aria-label="Section navigation">
            <DocsNav entries={nav} className="prism-docs-shell__nav" />
          </aside>
        )}
        <article className="prism-docs-shell__main">
          {(title || description) && (
            <header className="prism-docs-shell__header">
              {title && <h1 className="prism-docs-shell__title">{title}</h1>}
              {description && <p className="prism-docs-shell__description">{description}</p>}
            </header>
          )}
          <div className="prism-docs-shell__content">{children}</div>
          {neighbours && (neighbours.previous || neighbours.next) && (
            <nav className="prism-docs-shell__neighbours">
              {neighbours.previous && (
                <a className="prism-docs-shell__prev" href={neighbours.previous.url} rel="prev">
                  {neighbours.previous.title}
                </a>
              )}
              {neighbours.next && (
                <a className="prism-docs-shell__next" href={neighbours.next.url} rel="next">
                  {neighbours.next.title}
                </a>
              )}
            </nav>
          )}
        </article>
        {toc && toc.length > 0 && (
          <aside className="prism-docs-shell__toc" aria-label="On this page">
            <DocsNav entries={toc} className="prism-docs-shell__toc-list" />
          </aside>
        )}
      </div>
      {footer}
    </div>
  );
}
