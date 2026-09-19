// RSS (ticket 12 §5): summary + link, never full content — demos don't survive
// feed readers. `force-static` bakes the feed into out/rss.xml at build time.

import { Feed } from 'feed';

import { blogSource } from '@/lib/source';

export const dynamic = 'force-static';
export const revalidate = false;

const BASE_URL = 'https://prism.nanisoft.com';

export function GET(): Response {
  const posts = blogSource
    .getPages()
    .filter((post) => !post.data.draft)
    .sort((a, b) => (a.data.date < b.data.date ? 1 : -1));

  const feed = new Feed({
    title: 'Prism — one design language, many expressions',
    description:
      "NaniSoft's Ant Design–based design system: tokens, components, blocks, and pages, with docs and an LLM/agent surface.",
    id: `${BASE_URL}/blog`,
    link: `${BASE_URL}/blog`,
    language: 'en',
    copyright: `© ${new Date().getFullYear()} NaniSoft · MIT`,
    updated: posts[0] ? new Date(posts[0].data.date) : new Date(0),
    feedLinks: { rss: `${BASE_URL}/rss.xml` },
  });

  for (const post of posts) {
    feed.addItem({
      title: post.data.title ?? post.url,
      id: `${BASE_URL}${post.url}`,
      link: `${BASE_URL}${post.url}`,
      description: post.data.description,
      date: new Date(post.data.date),
    });
  }

  return new Response(feed.rss2(), {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
