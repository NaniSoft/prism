import Link from 'next/link'
import { ArrowRight, Blocks, Layers, Palette, ShieldCheck } from 'lucide-react'

import { buildCatalog } from '@nanisoft/prism-ui/catalog'
import { Hero01 } from '@nanisoft/prism-ui/blocks/hero-01'
import { Stats01 } from '@nanisoft/prism-ui/blocks/stats-01'
import { FeatureGrid01 } from '@nanisoft/prism-ui/blocks/feature-grid-01'
import { Cta01 } from '@nanisoft/prism-ui/blocks/cta-01'

/**
 * The marketing landing.
 *
 * It is composed from live Blocks, with all copy at the call site, because a
 * Block takes its content as props. It is a site page, not a catalogue Page: it
 * would be meaningless installed in a consumer's product.
 */
const catalogue = buildCatalog()
const components = catalogue.filter((item) => item.kind === 'component').length
const blocks = catalogue.filter((item) => item.kind === 'block').length

const STATS = [
  { label: 'Components', value: String(components) },
  { label: 'Blocks', value: String(blocks) },
  { label: 'Packs', value: '6' },
  { label: 'Modes', value: '2' },
]

const FEATURES = [
  {
    icon: Palette,
    title: 'Token-driven',
    body: 'Every colour, radius and type size resolves through a design token, so a new pack is a token swap rather than a refactor.',
  },
  {
    icon: Layers,
    title: 'Three layers',
    body: 'Components, Blocks and Pages answer three questions. Take the smallest layer that owns the job and compose upward only when repetition earns it.',
  },
  {
    icon: Blocks,
    title: 'One stylesheet',
    body: 'A consumer imports one compiled stylesheet and writes no CSS. Tailwind and Base UI stay internal to the package.',
  },
  {
    icon: ShieldCheck,
    title: 'Gated on quality',
    body: 'Contrast, the emitted token contract and the catalogue integrity are build gates, so a change that breaks accessibility fails before it ships.',
  },
]

export default function HomePage() {
  return (
    <>
      <Hero01
        headingLevel="h1"
        eyebrow="NaniSoft design system"
        title="One design system, composed without CSS"
        description="Prism is a token pipeline, a React library you compose, and documentation that reads the build. Choose a pack and a mode, and ship."
        actions={[
          { label: 'Read the quickstart' },
          { label: 'Browse components', variant: 'outline' },
        ]}
      />
      <Stats01 title="The catalogue today" eyebrow="By the numbers" stats={STATS} />
      <FeatureGrid01
        eyebrow="Why Prism"
        title="Built to be composed"
        description="A small set of well-made pieces, each one legible and easy to reshape."
        features={FEATURES}
      />
      <Cta01
        title="Start with one component, keep the tokens"
        description="Install the package, import one stylesheet, and choose a pack. Nothing about Prism holds your product back."
        action={{ label: 'Browse the catalogue' }}
      />

      <section className="border-t">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-16">
          <h2 className="text-2xl font-semibold tracking-tight">
            {components + blocks} documented items
          </h2>
          <p className="text-muted-foreground max-w-xl text-sm">
            Every item on this page is rendered live from the published package, against
            whichever pack you choose in the header. Each has a guide, a live demo and a
            generated API table.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/components"
              className="text-foreground inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline"
            >
              Browse components
              <ArrowRight className="size-3.5" />
            </Link>
            <Link
              href="/docs/quickstart"
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline"
            >
              Read the quickstart
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
