import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactElement } from 'react';
import { findNeighbour } from 'fumadocs-core/page-tree';

import { DocArticle } from '@/components/DocArticle';
import { SectionIndex } from '@/components/SectionIndex';
import { catalogGroups } from '@/lib/section-catalog';
import { componentsSource } from '@/lib/source';

// Optional catch-all: `/components` renders the grouped catalog,
// `/components/<item>` the component doc.

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

export function generateStaticParams(): Array<{ slug?: string[] }> {
  // The root entry (`/<section>`) is required under `output: export` for an
  // optional catch-all — and it keeps the section buildable while empty.
  return [{ slug: undefined }, ...componentsSource.generateParams()];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!slug) {
    return {
      title: 'Components',
      description:
        'The antd surface, themed by Prism tokens, typed, and re-exported — plus Prism-wrapped additions.',
    };
  }
  const page = componentsSource.getPage(slug);
  if (!page) return {};
  return { title: page.data.title, description: page.data.description };
}

export default async function ComponentsPage({ params }: PageProps): Promise<ReactElement> {
  const { slug } = await params;

  if (!slug) {
    return (
      <SectionIndex
        title="Components"
        description="Prism components first, then antd's six canonical categories. Pass-through items are re-exported unchanged — import from '@nanisoft/prism-ui', never from antd."
        groups={catalogGroups('components')}
        emptyMessage="No component pages yet."
      />
    );
  }

  const page = componentsSource.getPage(slug);
  if (!page) notFound();

  const tree = componentsSource.getPageTree();
  const neighbour = findNeighbour(tree, page.url);

  return (
    <DocArticle
      page={page}
      tree={tree}
      itemKey={page.url.replace(/^\//, '')}
      neighbours={{
        previous: neighbour.previous && { title: String(neighbour.previous.name), url: neighbour.previous.url },
        next: neighbour.next && { title: String(neighbour.next.name), url: neighbour.next.url },
      }}
    />
  );
}
