import Link from 'next/link';
import type { ReactElement } from 'react';
import { PageHeader } from '@nanisoft/prism-ui/blocks/page-header';
import { PrismIcon } from '@nanisoft/prism-ui/components/icon';

import type { CatalogGroup } from '@/lib/section-catalog';

export interface SectionIndexProps {
  title: string;
  description: string;
  groups: CatalogGroup[];
  emptyMessage: string;
}

export function SectionIndex({ title, description, groups, emptyMessage }: SectionIndexProps): ReactElement {
  const total = groups.reduce((count, group) => count + group.items.length, 0);
  return (
    <div className="site-catalog">
      <PageHeader title={title} description={description} level={1} />
      {total === 0 ? <p className="site-empty">{emptyMessage}</p> : groups.map((group, index) => {
        const headingId = `catalog-group-${index}`;
        return (
          <section key={group.group} className="site-catalog__section" aria-labelledby={headingId}>
            <h2 id={headingId} className="site-catalog__group">{group.group}</h2>
            <div className="site-catalog__list">
              {group.items.map((item) => (
                <Link key={item.url} href={item.url} className="site-catalog__item">
                  <span><strong>{item.title}</strong>{item.description ? <small>{item.description}</small> : null}</span>
                  <PrismIcon name="arrow-right" size={15} />
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
