// prism-ui BlogLayout page (ticket 03 / ADR-0003): folder-per-post display
// (ticket 12) — date/tags/draft frontmatter arrives as Prism-owned structural
// data; display-only tags, no tag pages in v1.

import type { ReactNode } from 'react';

export interface BlogFrontmatter {
  title: string;
  description?: string;
  /** ISO date; rendered with <time>. */
  date?: string;
  /** Display-only tags. */
  tags?: string[];
  /** Drafts render only when the app explicitly allows them. */
  draft?: boolean;
}

export interface BlogLayoutProps {
  /** The post body, or the post list on index pages — the app decides. */
  children: ReactNode;
  frontmatter?: BlogFrontmatter;
  /** Slot overrides for chrome. */
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function BlogLayout({ children, frontmatter, header, footer, className }: BlogLayoutProps) {
  return (
    <div className={['prism-blog-layout', className].filter(Boolean).join(' ')} data-prism="blog-layout">
      {header}
      <article className="prism-blog-layout__post">
        {frontmatter && (
          <header className="prism-blog-layout__meta">
            <h1 className="prism-blog-layout__title">{frontmatter.title}</h1>
            {frontmatter.description && <p className="prism-blog-layout__description">{frontmatter.description}</p>}
            {(frontmatter.date || (frontmatter.tags?.length ?? 0) > 0 || frontmatter.draft) && (
              <div className="prism-blog-layout__meta-info">
                {frontmatter.date && <time dateTime={frontmatter.date}>{frontmatter.date}</time>}
                {frontmatter.draft && <span className="prism-blog-layout__draft">Draft</span>}
                {(frontmatter.tags?.length ?? 0) > 0 && (
                  <ul className="prism-blog-layout__tags">
                    {frontmatter.tags?.map((tag) => (
                      <li key={tag}>{tag}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </header>
        )}
        <div className="prism-blog-layout__content">{children}</div>
      </article>
      {footer}
    </div>
  );
}
