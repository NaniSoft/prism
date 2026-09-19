// Section index page (ticket 12 §1): the section's catalog as grouped cards —
// Prism group first, then antd's canonical categories (lib/section-catalog).
// Empty sections render an honest empty state instead of breaking the build.

import Link from 'next/link';
import type { ReactElement } from 'react';

import { PageHeader } from '@/components/prism-client';
import type { CatalogGroup } from '@/lib/section-catalog';

export interface SectionIndexProps {
  title: string;
  description: string;
  groups: CatalogGroup[];
  /** Shown when the section has no pages yet. */
  emptyMessage: string;
}

export function SectionIndex({ title, description, groups, emptyMessage }: SectionIndexProps): ReactElement {
  const total = groups.reduce((count, group) => count + group.items.length, 0);

  return (
    <div className="site-catalog">
      <PageHeader title={title} subtitle={description} />
      {total === 0 ? (
        <p className="site-empty">{emptyMessage}</p>
      ) : (
        groups.map((group) => (
          <section key={group.group}>
            <h2 className="site-catalog__group">{group.group}</h2>
            <div className="site-catalog__grid">
              {group.items.map((item) => (
                <Link key={item.url} href={item.url} className="site-catalog__item">
                  <strong>{item.title}</strong>
                </Link>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
