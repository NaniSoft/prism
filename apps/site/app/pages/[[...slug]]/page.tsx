import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactElement } from 'react';
import { findNeighbour } from 'fumadocs-core/page-tree';

import { DocArticle } from '@/components/DocArticle';
import { SectionIndex } from '@/components/SectionIndex';
import { catalogGroups } from '@/lib/section-catalog';
import { pagesSource } from '@/lib/source';

// Optional catch-all: `/pages` renders the flat catalog, `/pages/<item>` the
// page doc.

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

export function generateStaticParams(): Array<{ slug?: string[] }> {
  // The root entry (`/<section>`) is required under `output: export` for an
  // optional catch-all — and it keeps the section buildable while empty.
  return [{ slug: undefined }, ...pagesSource.generateParams()];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!slug) {
    return {
      title: 'Pages',
      description: 'Full-page compositions — docs shells, blog layouts — that apps compose, never copy.',
    };
  }
  const page = pagesSource.getPage(slug);
  if (!page) return {};
  return { title: page.data.title, description: page.data.description };
}

export default async function PagesPage({ params }: PageProps): Promise<ReactElement> {
  const { slug } = await params;

  if (!slug) {
    return (
      <SectionIndex
        title="Pages"
        description="Full-page compositions. Apps map their loader output into Prism-owned structural props — the site itself is the reference consumer."
        groups={catalogGroups('pages')}
        emptyMessage="No pages yet."
      />
    );
  }

  const page = pagesSource.getPage(slug);
  if (!page) notFound();

  const tree = pagesSource.getPageTree();
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
