import Link from 'next/link'
import { ArrowRight, Blocks, Palette, ShieldCheck, Zap } from 'lucide-react'

import { Hero01 } from '@nanisoft/prism-ui/blocks/hero-01'
import { Stats01 } from '@nanisoft/prism-ui/blocks/stats-01'
import { FeatureGrid01 } from '@nanisoft/prism-ui/blocks/feature-grid-01'
import { Cta01 } from '@nanisoft/prism-ui/blocks/cta-01'

import { blocks } from '@/lib/catalog'

/**
 * The homepage is the consumer of the blocks, not their author.
 *
 * Content lives here at the call site rather than inside the components, which is
 * the whole point of the blocks taking props: `/blocks` can render the same
 * components with neutral placeholder data, and an app that installs one gets a
 * primitive rather than this page's copy.
 */

const STATS = [
  { label: 'Blocks', value: String(blocks.length) },
  { label: 'Themes', value: '6' },
  { label: 'Contrast pairs gated', value: '28' },
  { label: 'Install command', value: 'shadcn add' },
]

const FEATURES = [
  {
    icon: Palette,
    title: 'Token-driven',
    body: 'Every color, radius and font resolves through a design token, so a new theme is a token swap rather than a refactor.',
  },
  {
    icon: Blocks,
    title: 'Composable blocks',
    body: 'Sections are assembled from primitives that share one vertical rhythm, so pages stay consistent as the catalog grows.',
  },
  {
    icon: Zap,
    title: 'Own the source',
    body: 'Blocks install as plain files in your repo. No runtime package, no wrapper layer, nothing to upgrade around.',
  },
  {
    icon: ShieldCheck,
    title: 'Gated on quality',
    body: 'Contrast ratios and registry integrity are checked in CI, so a palette change cannot quietly break accessibility.',
  },
]

export default function HomePage() {
  return (
    <>
      {/*
        The homepage is the one page where this block *is* the page heading, so it
        opts into `h1`. Everywhere else (catalog previews, `/blocks/[slug]`) the
        block renders at its own `h2` default and the page supplies the `h1`.
      */}
      <Hero01
        headingLevel="h1"
        title="Ship your interface faster"
        description="A production-ready component and block catalog. Every piece is themeable through design tokens and installs as source you own."
        actions={[
          { label: 'Get started' },
          { label: 'Browse blocks', variant: 'outline' },
        ]}
      />
      <Stats01 title="This month" eyebrow="By the numbers" stats={STATS} />
      <FeatureGrid01
        eyebrow="Why this catalog"
        title="Built to be taken apart"
        description="A small set of well-made pieces, each one legible and easy to reshape."
        features={FEATURES}
      />
      <Cta01
        title="Start with one block, keep the tokens"
        description="Install a single block, restyle it with your own tokens, and nothing about the catalog holds you back."
        action={{ label: 'Browse the catalog' }}
      />

      <section className="border-t">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-16">
          <h2 className="text-2xl font-semibold tracking-tight">
            {blocks.length} blocks in the registry
          </h2>
          <p className="text-muted-foreground max-w-xl text-sm">
            Every block on this page is live from the registry, rendered against whichever
            theme you pick in the header.
          </p>
          <Link
            href="/blocks"
            className="text-foreground inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline"
          >
            Browse the catalog
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </section>
    </>
  )
}
