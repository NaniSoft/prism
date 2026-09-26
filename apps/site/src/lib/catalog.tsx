import { Blocks, Palette, ShieldCheck, Zap } from 'lucide-react'

import registry from '@nanisoft/prism-ui/registry.json'

import blockMeta from '@/generated/block-meta.json'

import { Cta01 } from '@nanisoft/prism-ui/components/ds/blocks/cta-01/cta'
import { FeatureGrid01 } from '@nanisoft/prism-ui/components/ds/blocks/feature-grid-01/feature-grid'
import { Hero01 } from '@nanisoft/prism-ui/components/ds/blocks/hero-01/hero'
import { Pricing01 } from '@nanisoft/prism-ui/components/ds/blocks/pricing-01/pricing'
import { Stats01 } from '@nanisoft/prism-ui/components/ds/blocks/stats-01/stats'
import type { HeadingLevel } from '@nanisoft/prism-ui/components/ds/blocks/section'

type Preview = { element: React.ReactElement }

/**
 * The heading level every block's preview renders at.
 *
 * Both places that show a block inside this catalog already name it in a
 * heading of their own: the `/blocks` card puts the block title in an `h2`, and
 * the `/blocks/[slug]` page puts "Preview" in an `h2`. So the block rendered
 * inside either of them passes `h3`, and its heading nests under the heading
 * that introduces it instead of sitting beside it as a second level-2 entry.
 * `/blocks` goes from ten `h2`s to five, one per card, which is the number a
 * reader navigating by heading is actually looking for.
 *
 * The blocks' own default stays `h2`, and nothing else about a preview changes:
 * the same component, the same props, the same classes, the same pixels, one
 * different tag name. This is a fact about where the preview is placed, so it
 * lives here rather than being baked into any block.
 */
const PREVIEW_HEADING_LEVEL: HeadingLevel = 'h3'

/**
 * Joins registry.json metadata with a live component for each block.
 *
 * The preview map is the one hand-maintained list in the catalog. Metadata comes
 * from the registry so it can never disagree with what `shadcn add` installs; the
 * map only supplies something to render. Once the catalog grows past a dozen
 * blocks this should be generated alongside the registry.
 *
 * Each entry is a pre-rendered element rather than a component plus a loose props
 * bag. Blocks take content as props precisely so this file, not the component,
 * decides what a preview says, and binding the props here keeps each block's own
 * prop type checked at the one place that supplies them. The placeholder content
 * is deliberately neutral and obviously illustrative: a preview should show a
 * block's shape, not sell the library a second time, and it must never read as
 * real data a consumer would ship.
 *
 * Every entry passes `PREVIEW_HEADING_LEVEL` rather than hardcoding a level, so
 * "how deep does a preview's heading sit" is answered in exactly one place.
 *
 * Safe to build at module scope because these blocks are stateless functions with
 * no hooks, and the catalog is rendered on the server.
 */
const PREVIEWS: Record<string, Preview> = {
  'hero-01': {
    element: (
      <Hero01
        headingLevel={PREVIEW_HEADING_LEVEL}
        eyebrow="Preview"
        title="A headline that fits on two lines"
        description="One or two sentences of supporting copy, so you can judge the measure and the spacing around it."
        actions={[{ label: 'Primary action' }, { label: 'Secondary', variant: 'outline' }]}
      />
    ),
  },
  'feature-grid-01': {
    element: (
      <FeatureGrid01
        headingLevel={PREVIEW_HEADING_LEVEL}
        title="Section heading"
        description="An optional line that explains what the set below it has in common."
        features={[
          { icon: Palette, title: 'First item', body: 'A short sentence describing the first thing in the set.' },
          { icon: Blocks, title: 'Second item', body: 'A short sentence describing the second thing in the set.' },
          { icon: Zap, title: 'Third item', body: 'A short sentence describing the third thing in the set.' },
          { icon: ShieldCheck, title: 'Fourth item', body: 'A short sentence describing the fourth thing in the set.' },
        ]}
      />
    ),
  },
  'pricing-01': {
    element: (
      <Pricing01
        headingLevel={PREVIEW_HEADING_LEVEL}
        title="Section heading"
        plans={[
          { name: 'First plan', price: '$0', period: ' / month', body: 'One line on who it is for.', features: ['First included line', 'Second included line', 'Third included line'], cta: 'Choose' },
          { name: 'Second plan', price: '$24', period: ' / month', body: 'One line on who it is for.', features: ['Everything in the first plan', 'One extra line', 'Another extra line'], cta: 'Choose', featured: true },
          { name: 'Third plan', price: '$68', period: ' / month', body: 'One line on who it is for.', features: ['Everything in the second plan', 'One extra line', 'Another extra line'], cta: 'Choose' },
        ]}
      />
    ),
  },
  'cta-01': {
    element: (
      <Cta01
        headingLevel={PREVIEW_HEADING_LEVEL}
        title="A closing line, two lines at most"
        description="A sentence that says what happens next, then one action."
        action={{ label: 'Do the thing' }}
      />
    ),
  },
  'stats-01': {
    element: (
      <Stats01
        headingLevel={PREVIEW_HEADING_LEVEL}
        title="Section heading"
        stats={[
          { label: 'First metric', value: '1,284', delta: 12, hint: 'vs last month' },
          { label: 'Second metric', value: '47.2%', delta: -3, hint: 'vs last month' },
          { label: 'Third metric', value: '2.4d', delta: 0, hint: 'vs last quarter' },
          { label: 'Fourth metric', value: '138' },
        ]}
      />
    ),
  },
}

export type CatalogBlock = {
  name: string
  title: string
  description: string
  categories: string[]
  dependencies: string[]
  registryDependencies: string[]
  files: { target: string; type: string }[]
  preview?: React.ReactElement
  /**
   * What the install actually costs, measured from source by
   * `scripts/analyze-blocks.mjs`. `client: false` is the load-bearing fact: the
   * block renders on the server and adds nothing to the client bundle.
   *
   * `verified` is what stops that fact from becoming a claim the analyzer never
   * earned. It is `false` when the walk could not resolve a specifier, could not
   * read a file, or hit its depth cap, so `client: false` means "we looked and
   * found nothing" rather than "we could not look". The catalog refuses to state
   * the server-rendering claim unless every block is both server and verified.
   */
  cost: {
    client: boolean
    /** Repo-relative file that forced `client: true`, so the boolean is auditable. */
    clientSource: { file: string; signal: string; specifier: string | null } | null
    verified: boolean
    code: number
    fileCount: number
  }
}

export const blocks: CatalogBlock[] = registry.items
  .filter((item) => item.type === 'registry:block')
  .map((item) => {
    const meta = blockMeta.blocks[item.name as keyof typeof blockMeta.blocks]
    return {
      name: item.name,
      title: item.title ?? item.name,
      description: item.description ?? '',
      categories: item.categories ?? [],
      dependencies: item.dependencies ?? [],
      registryDependencies: item.registryDependencies ?? [],
      files: (item.files ?? []).map((f) => ({ target: f.target ?? f.path, type: f.type })),
      preview: PREVIEWS[item.name]?.element,
      cost: {
        client: meta?.client ?? false,
        clientSource: meta?.clientSource ?? null,
        // A block with no generated meta has not been measured at all, so it is
        // unverified by default rather than quietly counted as server-safe.
        verified: meta?.verified ?? false,
        code: meta?.code ?? 0,
        fileCount: meta?.files.length ?? 0,
      },
    }
  })
  .sort((a, b) => a.name.localeCompare(b.name))

export const categories = [...new Set(blocks.flatMap((b) => b.categories))].sort()

/**
 * Catalog-wide totals, so `/blocks` can state the server-rendering claim once.
 *
 * `allServer` is already the strict form: it is `true` only when no block is a
 * client block *and* every block's dependency walk finished clean. An unresolvable
 * specifier therefore cannot leave the claim standing.
 */
export const catalogSummary = blockMeta.summary

export function getBlock(name: string) {
  return blocks.find((b) => b.name === name)
}

export const installCommand = (name: string) => `npx shadcn@latest add @nanisoft/${name}`
