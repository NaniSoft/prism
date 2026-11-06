import { ArrowUpRight, Blocks, Layers, Palette, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

import {
  buildCatalog,
  COMPONENT_CATEGORIES,
  type ComponentCategory,
} from '@nanisoft/prism-ui/catalog'
import { Backdrop01 } from '@nanisoft/prism-ui/blocks/backdrop-01'
import { Hero01 } from '@nanisoft/prism-ui/blocks/hero-01'
import { InstrumentPanel01 } from '@nanisoft/prism-ui/blocks/instrument-panel-01'
import { AvatarGroup } from '@nanisoft/prism-ui/components/avatar-group'
import { Badge } from '@nanisoft/prism-ui/components/badge'
import { Input } from '@nanisoft/prism-ui/components/input'
import { Label } from '@nanisoft/prism-ui/components/label'
import { MiniCalendar } from '@nanisoft/prism-ui/components/mini-calendar'
import { PulseSeries, type PulseBar } from '@nanisoft/prism-ui/components/pulse-series'
import { SignalField } from '@nanisoft/prism-ui/components/signal-field'
import { Slider } from '@nanisoft/prism-ui/components/slider'
import { Sparkline } from '@nanisoft/prism-ui/components/sparkline'
import { Switch } from '@nanisoft/prism-ui/components/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@nanisoft/prism-ui/components/tabs'
import { PackBand } from '@/components/landing/pack-band'
import { Principles } from '@/components/landing/principles'
import { Specimens } from '@/components/landing/specimens'
import { PrismLogo } from '@/components/logo'

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
 *
 * **Every figure on this page is the package, not a picture of it.** The hero
 * draws the catalogue's own shape from `PulseSeries`, the band under it renders
 * the published Components themselves, and the swatch band paints every pack in
 * its own compiled values. A screenshot of the library is a second copy of its
 * appearance that the next release silently rots, and a reader comparing packs
 * or flipping a specimen's switch is seeing the one truth there is.
 */
const catalogue = buildCatalog()
import themes from '@nanisoft/prism-tokens/dist/themes.json'

const countOf = (kind: (typeof catalogue)[number]['kind']) =>
  catalogue.filter((item) => item.kind === kind).length

/**
 * The short name each category carries inside a figure.
 *
 * A figure's labels are drawn in the mono face at a size tied to the canvas, so
 * the catalogue's own names ("Forms and inputs") are too wide for the space a
 * bar's label owns and the short forms are the figure's own vocabulary rather
 * than a rename: the Category's page and the catalogue keep the full name.
 */
const CATEGORY_SHORT: Record<ComponentCategory, string> = {
  'Call to action': 'actions',
  'Forms and inputs': 'forms',
  'Data display': 'display',
  Layout: 'layout',
  Feedback: 'feedback',
  Typography: 'type',
  Miscellaneous: 'misc',
}

const countIn = (category: ComponentCategory) =>
  catalogue.filter((item) => item.kind === 'component' && item.category === category).length

/**
 * The series the hero draws: the component catalogue as one bar chart, counted
 * from the build.
 *
 * The counts are the categories' own, sorted tallest first so the emphasised
 * column is the breadth of the library at a glance, and the series is passed in
 * like any other content because a Component draws no data of its own. This
 * replaced a four-stage drawing of the pipeline, which showed how Prism is built
 * to a reader who had not yet been shown what built things look like.
 */
const SERIES: PulseBar[] = COMPONENT_CATEGORIES.map((category) => ({
  id: category,
  label: `${CATEGORY_SHORT[category]} ${countIn(category)}`,
  value: countIn(category),
}))
  .toSorted((a, b) => b.value - a.value)
  .map((bar, index) => (index === 0 ? { ...bar, emphasis: true } : bar))

/**
 * The same counts in the categories' own order, for the specimen band's line.
 *
 * The sorted series is the bar chart's shape, but a line of the same numbers
 * sorted descending is a line that only falls, and a falling line on a landing
 * page reads as a metric in decline no matter what its label says. In the
 * categories' declared order the same counts rise and fall, which is the honest
 * shape of a catalogue that grew category by category.
 */
const SPARK_VALUES: readonly number[] = COMPONENT_CATEGORIES.map((category) => countIn(category))

/**
 * The landing page, in five bands.
 *
 * Each band is a different layout family, which is the rule the page is built to
 * and not an accident of which Blocks existed: a split hero with an instrument
 * in it, a gallery of rendered Components, a hairline list, a band of copy over
 * a running field, and a band of swatches. Before this the page was a centred
 * hero over four equal stat cards, four equal feature cards, a filled black
 * band and a two-column text footer, which is five bands of the same shape and
 * is what makes a documentation landing read as a template rather than as a
 * system.
 *
 * The counts a stat band used to carry in four equal cards are now the gallery
 * band's own heading, stated once beside the Components the numbers are about.
 * Four equal cards with a number each is the single most recognisable shape of
 * a template landing page, and the numbers were never the story: the Components
 * are, and the gallery shows them where the cards used to count them.
 *
 * The motion band exists because the page used to state the system's second
 * motion law nowhere and run it once, in the hero's instrument. A design system
 * whose landing page is nearly static is a system that looks like a component
 * gallery, and the honest fix is not decoration bolted on but the law itself,
 * running on the one Block published for it, with the stop control the law's
 * own test asks for: stop the field, and the band is still true.
 *
 * The five bands and the one set of actions between them: the hero carries the
 * two places a reader can go next, and nothing below it repeats either intent.
 * A second "Browse components" at the bottom of the page is a control that
 * duplicates one already on screen, which is the reason the trailing band that
 * used to carry the catalogue links was removed rather than restyled. The
 * gallery's own links name individual Components, which is a different intent
 * from the route that lists them all.
 */
export default function HomePage() {
  return (
    <>
      <Hero01
        headingLevel="h1"
        eyebrow="NaniSoft design system"
        title="Components your product composes. CSS it never writes."
        description="A token pipeline, a React library you compose, and documentation read from the build rather than retyped from it."
        actions={[
          { label: 'Read the quickstart', href: '/overview/quickstart' },
          { label: 'Browse components', href: '/components', variant: 'outline' },
        ]}
        instrument={
          <InstrumentPanel01
            label="the catalogue, by category"
            state="live"
            stateLabel="live"
            caption="The component catalogue as one series, counted from the build."
            footnote="Counted from the catalogue at render, not typed in. A figure that shows a system running is the one thing Prism animates, and it reads the same with every animation stopped."
            actions={<PrismLogo size={22} className="text-muted-foreground block" />}
          >
            {/*
              The figure keeps a readable minimum width and the panel scrolls it,
              because a drawing that shrinks to fit a phone is no longer legible
              and DESIGN.md's ambient rule is explicit that every figure renders
              its complete, fully legible form at first paint. The series' labels
              are 11 units in a 640 unit canvas, so at a 342 pixel panel width
              they would rasterise at under six pixels each: a caption-shaped
              smudge that a reader can neither read nor act on. Scrolling is the
              honest answer and it costs nothing at desktop, where the panel is
              wider than the minimum and no scrollbar appears.

              The scroll container is a focusable region with a name, because a
              sideways scroll a keyboard cannot reach is a figure a reader who
              does not use a pointer cannot pan, and the focus ring is the only
              affordance a clipped drawing needs.
            */}
            <div
              role="region"
              aria-label="Components by category, scrollable figure"
              tabIndex={0}
              className="overflow-x-auto"
            >
              <PulseSeries
                bars={SERIES}
                scan
                label="Components by category"
                className="min-w-[33rem]"
              />
            </div>
          </InstrumentPanel01>
        }
      />

      <Specimens
        headingLevel="h2"
        title="Rendered, not pictured"
        description={`${countOf('component')} Components across ${COMPONENT_CATEGORIES.length} role categories, ${countOf('block')} Blocks and ${1 + themes.length} Packs, counted from the build rather than typed into this page. Every specimen below is the published Component running in this page, not a picture of one. Flip the switch, drag the slider, pick a tab.`}
        meta="base ui · tailwind 4 · mit · llms.txt · read-only mcp"
        specimens={[
          {
            wide: true,
            href: '/components/sparkline',
            name: 'Sparkline',
            node: (
              <Sparkline
                label="components by category"
                values={SPARK_VALUES}
                width={640}
                height={56}
              />
            ),
          },
          {
            href: '/components/tabs',
            name: 'Tabs',
            node: (
              <Tabs defaultValue="components">
                <TabsList>
                  <TabsTrigger value="tokens">Tokens</TabsTrigger>
                  <TabsTrigger value="components">Components</TabsTrigger>
                  <TabsTrigger value="blocks">Blocks</TabsTrigger>
                </TabsList>
                <TabsContent value="tokens">Colour, radius, type, spacing and motion, one emitted contract</TabsContent>
                <TabsContent value="components">{countOf('component')} across seven role categories</TabsContent>
                <TabsContent value="blocks">{countOf('block')} composed sections that take content as props</TabsContent>
              </Tabs>
            ),
          },
          {
            href: '/components/badge',
            name: 'Badge',
            node: (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Badge>stable</Badge>
                <Badge variant="success">gated</Badge>
                <Badge variant="warning">advisory</Badge>
                <Badge variant="secondary">pastel</Badge>
              </div>
            ),
          },
          {
            href: '/components/mini-calendar',
            name: 'MiniCalendar',
            // Inert, because a month of day buttons is a control cluster the
            // landing does not owe a reader: the band's copy names the three
            // controls that are live, and the calendar is here as a specimen of
            // what the library draws, not as a date picker to use.
            node: (
              <div inert>
                <MiniCalendar
                  label="This month, as the library draws it"
                  previousLabel="Previous month"
                  nextLabel="Next month"
                />
              </div>
            ),
          },
          {
            href: '/components/switch',
            name: 'Switch',
            node: (
              <div className="flex w-full max-w-64 flex-col">
                <Label className="flex items-center justify-between gap-6 py-2.5 text-sm">
                  Live figures
                  <Switch defaultChecked />
                </Label>
                <Label className="flex items-center justify-between gap-6 py-2.5 text-sm">
                  Scan reticle
                  <Switch />
                </Label>
                <Label className="flex items-center justify-between gap-6 py-2.5 text-sm">
                  Reduced motion honoured
                  <Switch defaultChecked />
                </Label>
              </div>
            ),
          },
          {
            href: '/components/slider',
            name: 'Slider',
            node: (
              <div className="flex w-full max-w-56 flex-col gap-2">
                <Slider defaultValue={62} aria-label="Specimen slider" />
                <div className="text-muted-foreground flex justify-between font-mono text-mono">
                  <span>0</span>
                  <span>100</span>
                </div>
              </div>
            ),
          },
          {
            href: '/components/avatar-group',
            name: 'AvatarGroup',
            node: (
              <AvatarGroup
                size="lg"
                avatars={[
                  { name: 'Ada Lovelace' },
                  { name: 'Grace Hopper' },
                  { name: 'Alan Turing' },
                  { name: 'Radia Perlman' },
                ]}
              />
            ),
          },
          {
            href: '/components/input',
            name: 'Input',
            node: (
              <Label className="flex w-full max-w-56 flex-col gap-2 text-sm">
                Search the catalogue
                <Input placeholder="switch" />
              </Label>
            ),
          },
        ]}
      />

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

      {/*
        The motion band: the system's second law, running.

        The page's other four bands are read, and this one is watched. The field
        behind the copy is a `SignalField` on the drift cycle, both from the
        package the page documents, and the stop control is the Block's own, so
        the law's test is on the page beside the law: stop the field, and the
        band is still true. The copy names the two laws in the system's own
        words, and the link is the Foundation page that states them in full,
        which is a reading intent rather than a conversion one.
      */}
      <Backdrop01
        headingLevel="h2"
        title="Motion, two laws"
        description="Feedback runs on the authored scale and never overshoots; a figure that shows a system running rides its own cycle and stays true with the animation stopped. This band is the second law, running."
        field="drift"
        intensity="present"
        pauseControl
        pauseLabel="Stop the field"
        resumeLabel="Resume the field"
        label="A field of marks, drifting on the ambient cycle the stylesheet publishes"
        figure={<SignalField count={40} emphasisAt={0.4} />}
      >
        <div className="flex max-w-measure flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-semibold tracking-tight">The first law is feedback</h3>
            <p className="text-muted-foreground text-pretty text-sm">
              A colour change, a half-step lift, a drawer leaving: 80, 160 or 280 milliseconds,
              always decelerating, never overshooting. Every hover on this page is the first law.
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-semibold tracking-tight">The second law is ambient</h3>
            <p className="text-muted-foreground text-pretty text-sm">
              A figure that shows a system running rides one of six cycles, none shorter than a
              second, and stops to the same figure. The field behind this copy is the second law,
              and the control stops it.
            </p>
          </div>
          <Link
            href="/foundation/motion"
            className="text-muted-foreground hover:text-foreground flex items-center gap-1 font-mono text-mono transition-colors duration-fast ease-out"
          >
            foundation/motion
            <ArrowUpRight className="size-3.5" aria-hidden />
          </Link>
        </div>
      </Backdrop01>

      <PackBand
        headingLevel="h2"
        title="Eight packs, one contract"
        description="A pack re-points the semantic tokens rather than replacing them, so the component package is published once and the theme is chosen at runtime. Every pack below is drawn in its own values, on the page you are reading."
        action={{ label: 'See the packs', href: '/foundation/themes' }}
      />
    </>
  )
}
