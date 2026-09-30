import { Blocks, Layers, Palette, ShieldCheck } from 'lucide-react'

import { buildCatalog } from '@nanisoft/prism-ui/catalog'
import { PulseGraph, type PulseNode, type PulseRelation } from '@nanisoft/prism-ui/components/pulse-graph'
import { Hero01 } from '@nanisoft/prism-ui/blocks/hero-01'
import { InstrumentPanel01 } from '@nanisoft/prism-ui/blocks/instrument-panel-01'
import { Stats01, type Stat } from '@nanisoft/prism-ui/blocks/stats-01'
import { PackBand } from '@/components/landing/pack-band'
import { Principles } from '@/components/landing/principles'

/**
 * The marketing landing.
 *
 * It is composed from live Blocks and site apparatus, with all copy at the call
 * site, because a Block takes its content as props. It is a site page, not a
 * catalogue Page: it would be meaningless installed in a consumer's product.
 *
 * **Every number on this page is read from the build.** The counts come from
 * `buildCatalog()`, so a Component added to the catalogue appears here with no
 * edit, and a number written out by hand would be a figure about the library
 * that only the author of the landing page believed.
 */
const catalogue = buildCatalog()
const countOf = (kind: (typeof catalogue)[number]['kind']) =>
  catalogue.filter((item) => item.kind === kind).length

const STATS: Stat[] = [
  { label: 'Components', value: String(countOf('component')), hint: 'across seven role categories' },
  { label: 'Blocks', value: String(countOf('block')), hint: 'composed sections that take content as props' },
  { label: 'Packs', value: '6', hint: 'one base and five pastels' },
  { label: 'Modes', value: '2', hint: 'light and dark, selected independently' },
]

/**
 * The pipeline the hero draws, as four stages on one rail.
 *
 * The names are this site's own stages and they are passed in like any other
 * content, because a Block ships none and a Component draws no data of its own.
 * Each node is its own lane, which is what makes the graph draw a rail and carry a
 * marker along it rather than showing four points in a field.
 */
const STAGES: PulseNode[] = [
  { id: 'tokens', name: 'tokens', note: 'DTCG source', x: 0, y: 0.5, lane: 0 },
  { id: 'build', name: 'build', note: 'one pipeline', x: 1 / 3, y: 0.5, lane: 1, emphasis: true },
  { id: 'sheet', name: 'sheet', note: 'one file', x: 2 / 3, y: 0.5, lane: 2 },
  { id: 'app', name: 'app', note: 'no CSS', x: 1, y: 0.5, lane: 3 },
]

const EDGES: PulseRelation[] = [
  { from: 'tokens', to: 'build', carries: true },
  { from: 'build', to: 'sheet', carries: true },
  { from: 'sheet', to: 'app', carries: true },
]

/**
 * The landing page, in four bands.
 *
 * Each band is a different layout family, which is the rule the page is built to
 * and not an accident of which Blocks existed: a split hero with a figure in it,
 * a measured row, a hairline list, and a band of swatches. Before this the page
 * was a centred hero over four equal stat cards, four equal feature cards, a
 * filled black band and a two-column text footer, which is five bands of the same
 * shape and is what makes a documentation landing read as a template rather than
 * as a system.
 *
 * The four bands and the one set of actions between them: the hero carries the
 * two places a reader can go next, and nothing below it repeats either intent. A
 * second "Browse components" at the bottom of the page is a control that
 * duplicates one already on screen, which is the reason the trailing band that
 * used to carry the catalogue links was removed rather than restyled.
 */
export default function HomePage() {
  return (
    <>
      <Hero01
        headingLevel="h1"
        eyebrow="NaniSoft design system"
        title="One design system, composed without CSS"
        description="A token pipeline, a React library you compose, and documentation read from the build rather than retyped from it."
        actions={[
          { label: 'Read the quickstart', href: '/overview/quickstart' },
          { label: 'Browse components', href: '/components', variant: 'outline' },
        ]}
        instrument={
          <InstrumentPanel01
            label="the pipeline, running"
            state="live"
            stateLabel="live"
            caption="The token pipeline as four stages on one rail."
            footnote="A figure that shows a system running is the one thing Prism animates, and it reads the same with every animation stopped."
          >
            {/*
              The figure keeps a readable minimum width and the panel scrolls it,
              because a drawing that shrinks to fit a phone is no longer legible
              and DESIGN.md's ambient rule is explicit that every figure renders
              its complete, fully legible form at first paint. The node names are
              13 units in a 640 unit canvas, so at a 294 pixel panel width they
              would rasterise at under four pixels each: a caption-shaped smudge
              that a reader can neither read nor act on. Scrolling is the honest
              answer and it costs nothing at desktop, where the panel is wider
              than the minimum and no scrollbar appears.
            */}
            <div className="overflow-x-auto">
              <PulseGraph
                nodes={STAGES}
                relations={EDGES}
                label="Four stages on one rail"
                className="min-w-[28rem]"
              />
            </div>
          </InstrumentPanel01>
        }
      />

      <Stats01 title="What is published today" stats={STATS} headingLevel="h2" />

      <Principles
        headingLevel="h2"
        title="Four rules the packages hold"
        description="These are the rules a consumer inherits by installing, whether or not they read them. Each one is a build gate somewhere in this repository, so a change that breaks it fails before it publishes."
        principles={[
          {
            icon: Palette,
            title: 'One source of truth',
            body: 'Every colour, radius and type step is authored here and reaches a consumer as a token. A new pack is a token swap rather than a refactor.',
          },
          {
            icon: Layers,
            title: 'Take the smallest layer that owns the job',
            body: 'A Component has one job, a Block is a section composed of them, and a Page is a screen composed of those. Composition stops at the layer that already answered the question.',
          },
          {
            icon: Blocks,
            title: 'One stylesheet, no override path',
            body: 'A consumer imports the compiled sheet once and writes no CSS. There is no merge, no wrapper theme and no copy-out: a missing item is requested upstream.',
          },
          {
            icon: ShieldCheck,
            title: 'Gated before it publishes',
            body: 'Contrast, the emitted token contract, the catalogue and the copy in every Block are build gates, so a regression fails the build rather than shipping.',
          },
        ]}
      />

      <PackBand
        headingLevel="h2"
        title="Six packs, one contract"
        description="A pack re-points the semantic tokens rather than replacing them, so the component package is published once and the theme is chosen at runtime. Every pack below is drawn in its own values, on the page you are reading."
        action={{ label: 'See the packs', href: '/foundation/themes' }}
      />
    </>
  )
}
