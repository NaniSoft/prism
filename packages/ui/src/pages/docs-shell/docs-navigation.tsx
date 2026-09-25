'use client';

import { usePrismLink } from '../../provider/index.js';
import type { DocsNavEntry } from './index.js';

export function DocsNav({ entries, className, label }: { entries: readonly DocsNavEntry[]; className: string; label: string }) {
  const Link = usePrismLink();

  return (
    <ul className={className} aria-label={label}>
      {entries.map((entry) => (
        <li key={entry.id}>
          {entry.url ? <Link href={entry.url}>{entry.title}</Link> : <span className="prism-docs-shell__nav-label">{entry.title}</span>}
          {entry.children?.length ? <DocsNav entries={entry.children} className={`${className}__nested`} label={`${entry.title} subsections`} /> : null}
        </li>
      ))}
    </ul>
  );
}

export function DocsNeighbours({ previous, next }: { previous?: { title: string; url: string }; next?: { title: string; url: string } }) {
  const Link = usePrismLink();

  return (
    <nav className="prism-docs-shell__neighbours" aria-label="Previous and next pages">
      {previous ? (
        <Link href={previous.url} rel="prev" data-direction="previous" aria-label={`Previous: ${previous.title}`}>
          {previous.title}
        </Link>
      ) : null}
      {next ? (
        <Link href={next.url} rel="next" data-direction="next" aria-label={`Next: ${next.title}`}>
          {next.title}
        </Link>
      ) : null}
    </nav>
  );
}
