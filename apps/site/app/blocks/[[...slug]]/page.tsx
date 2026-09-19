import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactElement } from 'react';
import { findNeighbour } from 'fumadocs-core/page-tree';

import { DocArticle } from '@/components/DocArticle';
import { SectionIndex } from '@/components/SectionIndex';
import { catalogGroups } from '@/lib/section-catalog';
import { blocksSource } from '@/lib/source';

// Optional catch-all: `/blocks` renders the flat catalog, `/blocks/<item>` the
// block doc.

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

export function generateStaticParams(): Array<{ slug?: string[] }> {
  // The root entry (`/<section>`) is required under `output: export` for an
  // optional catch-all — and it keeps the section buildable while empty.
  return [{ slug: undefined }, ...blocksSource.generateParams()];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!slug) {
    return {
      title: 'Blocks',
      description:
        'Pre-composed components — assembled once in prism-ui, delivered from npm, never copied into apps.',
    };
  }
  const page = blocksSource.getPage(slug);
  if (!page) return {};
  return { title: page.data.title, description: page.data.description };
}

export default async function BlocksPage({ params }: PageProps): Promise<ReactElement> {
  const { slug } = await params;

  if (!slug) {
    return (
      <SectionIndex
        title="Blocks"
        description="Pre-composed components — a demo plate, a page header — assembled once and shipped in the package."
        groups={catalogGroups('blocks')}
        emptyMessage="No blocks yet."
      />
    );
  }

  const page = blocksSource.getPage(slug);
  if (!page) notFound();

  const tree = blocksSource.getPageTree();
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
