import type { ReactNode } from 'react';

import { Badge } from '../../components/badge/index.js';
import { Heading, Text } from '../../components/typography/index.js';
import { cx } from '../../internal/cx.js';

export interface BlogFrontmatter {
  title: string;
  description?: string;
  date?: string;
  tags?: readonly string[];
  draft?: boolean;
}

export interface BlogLayoutProps {
  children: ReactNode;
  frontmatter?: BlogFrontmatter;
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function BlogLayout({ children, frontmatter, header, footer, className }: BlogLayoutProps) {
  return (
    <div className={cx('prism-blog-layout', className)} data-prism="blog-layout">
      {header}
      <article className="prism-blog-layout__post">
        {frontmatter ? <header className="prism-blog-layout__meta"><Heading level={1} size="lg">{frontmatter.title}</Heading>{frontmatter.description ? <Text className="prism-blog-layout__description">{frontmatter.description}</Text> : null}<div className="prism-blog-layout__meta-info">{frontmatter.date ? <time dateTime={frontmatter.date}>{frontmatter.date}</time> : null}{frontmatter.draft ? <Badge variant="warning">Draft</Badge> : null}{frontmatter.tags?.map((tag) => <Badge key={tag}>{tag}</Badge>)}</div></header> : null}
        <div className="prism-blog-layout__content">{children}</div>
      </article>
      {footer}
    </div>
  );
}
