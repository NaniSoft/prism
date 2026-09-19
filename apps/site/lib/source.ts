// Content sources (ticket 12 §1: four doc loaders + a blog loader — per-section
// loaders, the research-proven shape).
//
// The fumadocs-mdx Macro API is compile-time: `defineDocs`/`defineCollections`
// may only appear at top level in this module with literal `dir`s, and the
// module must not re-export the macro. Frontmatter = fumadocs defaults only —
// no authored `kind` (the section loader is the kind) and no authored
// `antdBase` (the generator derives it); `description` is required in practice
// (prism-llms' drift gate asserts it).

import { defineCollections, defineDocs } from 'fumadocs-mdx/macro';
import { loader } from 'fumadocs-core/source';
import { pageSchema } from 'fumadocs-core/source/schema';
import { z } from 'zod';

/** Guides + theming prose (`content/docs/<slug>.mdx`). */
export const docs = defineDocs({
  dir: 'content/docs',
});

/** Thin generated stubs + curated docs for pass-through and wrapped components. */
export const components = defineCollections({
  type: 'doc',
  dir: 'content/components',
  schema: pageSchema,
});

/** Pre-composed components. */
export const blocks = defineCollections({
  type: 'doc',
  dir: 'content/blocks',
  schema: pageSchema,
});

/** Full-page compositions. */
export const pages = defineCollections({
  type: 'doc',
  dir: 'content/pages',
  schema: pageSchema,
});

/** Folder-per-post blog (ticket 12 §5): required ISO date, display-only tags, drafts excluded. */
export const blog = defineCollections({
  type: 'doc',
  dir: 'content/blog',
  schema: pageSchema.extend({
    date: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const docsSource = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
});

export const componentsSource = loader({
  baseUrl: '/components',
  source: components.toFumadocsSource(),
});

export const blocksSource = loader({
  baseUrl: '/blocks',
  source: blocks.toFumadocsSource(),
});

export const pagesSource = loader({
  baseUrl: '/pages',
  source: pages.toFumadocsSource(),
});

export const blogSource = loader({
  baseUrl: '/blog',
  source: blog.toFumadocsSource(),
});
