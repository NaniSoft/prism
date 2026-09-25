import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactElement } from 'react';
import { findNeighbour } from 'fumadocs-core/page-tree';

import { DocArticle } from '@/components/DocArticle';
import { SectionIndex } from '@/components/SectionIndex';
import type { CatalogGroup } from '@/lib/section-catalog';
import { docsSource } from '@/lib/source';

// Optional catch-all: `/docs` renders the section index, `/docs/<slug>` the
// guide. The optional root keeps the static export satisfiable even while the
// guides collection is empty (Next requires every dynamic route to emit at
// least one page under `output: export`).

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

export function generateStaticParams(): Array<{ slug?: string[] }> {
  // The root entry (`/docs`) is required under `output: export` for an
  // optional catch-all — and it keeps the section buildable while empty.
  return [{ slug: undefined }, ...docsSource.generateParams()];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!slug) {
    return { title: 'Docs', description: 'Guides and theming prose for the Prism design system.' };
  }
  const page = docsSource.getPage(slug);
  if (!page) return {};
  return { title: page.data.title, description: page.data.description };
}

/** Guides are flat prose — one ungrouped list, alphabetical. */
function docGroups(): CatalogGroup[] {
  const guides = docsSource
    .getPages()
    .map((page) => ({
      title: page.data.title ?? page.url,
      url: page.url,
      description: page.data.description,
    }))
    .sort((a, b) => {
      if (a.url === '/docs/quickstart') return -1;
      if (b.url === '/docs/quickstart') return 1;
      return a.title.localeCompare(b.title);
    });
  return guides.length > 0 ? [{ group: 'Guides', items: guides }] : [];
}

export default async function DocsPage({ params }: PageProps): Promise<ReactElement> {
  const { slug } = await params;

  if (!slug) {
    return (
      <SectionIndex
        title="Docs"
        description="Start with the install-and-import quickstart, then take the owned-source tour: components → blocks → pages. Agents begin at llms.txt or the Prism MCP."
        groups={docGroups()}
        emptyMessage="No guides yet. The agent surface (llms.txt and the prism MCP) is live today; prose arrives with the first guide."
      />
    );
  }

  const page = docsSource.getPage(slug);
  if (!page) notFound();

  const tree = docsSource.getPageTree();
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
