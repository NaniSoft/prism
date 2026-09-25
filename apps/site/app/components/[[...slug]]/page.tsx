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
        'Prism-owned accessible components, styled from the Spectral Refraction token system and delivered from one package.',
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
        description="Prism-owned components, organized by the job they do. Every public API is available from '@nanisoft/prism-ui'."
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
