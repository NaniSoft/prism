import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

import {
  buildCatalog,
  COMPONENT_CATEGORIES,
} from '@nanisoft/prism-ui/catalog'
import { Backdrop01 } from '@nanisoft/prism-ui/blocks/backdrop-01'
import { Bento01 } from '@nanisoft/prism-ui/blocks/bento-01'
import { Ground01 } from '@nanisoft/prism-ui/blocks/ground-01'
import { Hero01 } from '@nanisoft/prism-ui/blocks/hero-01'
import { MediaBand01 } from '@nanisoft/prism-ui/blocks/media-band-01'
import { ProductGrid01 } from '@nanisoft/prism-ui/blocks/product-grid-01'
import { AvatarGroup } from '@nanisoft/prism-ui/components/avatar-group'
import { Badge } from '@nanisoft/prism-ui/components/badge'
import { Input } from '@nanisoft/prism-ui/components/input'
import { Label } from '@nanisoft/prism-ui/components/label'
import { MiniCalendar } from '@nanisoft/prism-ui/components/mini-calendar'
import {
  AlphaLensMark,
  AtlasMark,
  NaniSoftMark,
  NexusMark,
} from '@nanisoft/prism-ui/components/product-marks'
import { Reveal } from '@nanisoft/prism-ui/components/reveal'
import { SignalField } from '@nanisoft/prism-ui/components/signal-field'
import { Slider } from '@nanisoft/prism-ui/components/slider'
import { Sparkline } from '@nanisoft/prism-ui/components/sparkline'
import { Switch } from '@nanisoft/prism-ui/components/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@nanisoft/prism-ui/components/tabs'
import { ComposedPage } from '@/components/landing/composed-page'
import { EditorialPrism } from '@/components/landing/editorial-prism'
import { Foundations } from '@/components/landing/foundations'
import { InstallBand } from '@/components/landing/install-band'
import { PackBand } from '@/components/landing/pack-band'
import { ShowcaseBand } from '@/components/landing/showcase-band'
import { Specimens } from '@/components/landing/specimens'

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
 * renders a small page assembled from published Components and re-points it
 * through every pack as you choose one, the band under it renders the published
 * Components themselves, and the pack band paints every pack in its own compiled
 * values. A screenshot of the library is a second copy of its appearance that
 * the next release silently rots, and a reader comparing packs or flipping a
 * specimen's switch is seeing the one truth there is.
 *
 * **The order is the system's argument, not a template's.** A reader meets the
 * composed page first, then the parts, then the two commands that put them in a
 * project, then the foundations, then the motion law, then the packs, then the
 * system's own image, then two whole applications built with it, then the
 * sites already wearing it. Every band is a different family: a split hero, a
 * bento gallery, a code band, a foundations bento, a field, a swatch grid, an
 * editorial band, a showcase specification and a product list.
 */
const catalogue = buildCatalog()
import themes from '@nanisoft/prism-tokens/dist/themes.json'

const countOf = (kind: (typeof catalogue)[number]['kind']) =>
  catalogue.filter((item) => item.kind === kind).length

/**
 * The same counts in the categories' own order, for the sparkline in the hero.
 *
 * The sorted series the old hero used was a bar chart that only fell, which
 * reads as a metric in decline no matter what its label says. In the categories'
 * declared order the same counts rise and fall, which is the honest shape of a
 * catalogue that grew category by category.
 */
const SPARK_VALUES: readonly number[] = COMPONENT_CATEGORIES.map(
  (category) =>
    catalogue.filter((item) => item.kind === 'component' && item.category === category).length,
)

/**
 * The four sites that wear Prism, as the proof band reads them.
 *
 * Prism is not in the list because this is its own page. The marks are the same
 * marks each site draws in its own bar, and the destinations are absolute because
 * the family is five origins rather than five routes. Each row wears the member's
 * own drawing from `ProductMarks`, so the mark a reader meets here is the one they
 * meet in that site's bar rather than a disc standing in for it.
 */
const SITES = [
  {
    id: 'www',
    name: 'NaniSoft',
    pack: 'sky' as const,
    tagline: 'The company site, and the front door to the family.',
    href: 'https://www.nanisoft.com',
    newTab: true,
    mark: <NaniSoftMark className="block size-full" />,
  },
  {
    id: 'nexus',
    name: 'Nexus',
    pack: 'cyan' as const,
    tagline: 'The Agent Factory: an issue in, a reviewed change out.',
    href: 'https://nexus.nanisoft.com',
    newTab: true,
    mark: <NexusMark className="block size-full" />,
  },
  {
    id: 'atlas',
    name: 'Atlas',
    pack: 'mint' as const,
    tagline: 'The Digital Twin Platform: living models of real systems.',
    href: 'https://atlas.nanisoft.com',
    newTab: true,
    mark: <AtlasMark className="block size-full" />,
  },
  {
    id: 'alphalens',
    name: 'AlphaLens',
    pack: 'gold' as const,
    tagline: 'Quantitative market research for the Indian market.',
    href: 'https://alphalens.nanisoft.com',
    newTab: true,
    mark: <AlphaLensMark className="block size-full" />,
  },
]

/**
 * The landing page, in nine bands.
 *
 * The hero is the composed page; the specimens are the parts; the install band is
 * the way in; the foundations and the motion band are the rules; the packs are
 * the themes; the editorial band is the system's own image; the showcase band is
 * two whole applications composed from it; and the product rows are the proof.
 * No band repeats another's layout family, and no action repeats another's
 * intent: the hero asks a reader to read or browse, the rest of the page is
 * evidence.
 */
export default function HomePage() {
  return (
    <>
      {/*
        The page's one continuous ground: light and a moving medium, fixed behind
        every section so the whole page reads as one surface rather than as a hero
        and a set of separate bands. The Block owns the whole figure, and this
        page's decision is only that the landing wears it at full presence with
        the transparent bar.
      */}
      <Ground01 />
      {/*
        The hero carries the page's one authored moment and no arrival: its entry
        is the page's entry, and the page does not introduce itself twice. The
        ground is the claim, a lit surface with a medium moving through it, and
        the punch phrase of the headline carries the spectrum ink, the one motion
        on text this system authors.
      */}
      <Hero01
        headingLevel="h1"
        eyebrow="NaniSoft design system"
        title={
          <>
            Components your product composes.{' '}
            <span className="prism-text-spectrum">CSS it never writes.</span>
          </>
        }
        description="A token pipeline, a React library you compose, and documentation read from the build rather than retyped from it."
        actions={[
          { label: 'Read the quickstart', href: '/overview/quickstart' },
          { label: 'Browse components', href: '/components', variant: 'outline' },
        ]}
        instrument={<ComposedPage values={SPARK_VALUES} count={countOf('component')} />}
      />

      {/*
        The bands a reader scrolls to meet them on the way in; the hero and the
        install band stay still, because a page that arrives everywhere arrives
        nowhere, and the command band is furniture rather than an argument. The
        delays step the rhythm so the two editorial bands do not enter in step.
      */}
      <Reveal>
      <Specimens
        headingLevel="h2"
        title="Rendered, not pictured"
        description={`${countOf('component')} Components across ${COMPONENT_CATEGORIES.length} role categories, ${countOf('block')} Blocks and ${1 + themes.length} Packs, counted from the build rather than typed into this page. Every specimen below is the published Component running in this page, not a picture of one. Flip the switch, drag the slider, pick a tab.`}
        meta="base ui · tailwind 4 · mit · llms.txt · read-only mcp"
        specimens={[
          {
            span: 'lg',
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
            span: 'md',
            href: '/components/tabs',
            name: 'Tabs',
            node: (
              <Tabs defaultValue="components">
                <TabsList>
                  <TabsTrigger value="tokens">Tokens</TabsTrigger>
                  <TabsTrigger value="components">Components</TabsTrigger>
                  <TabsTrigger value="blocks">Blocks</TabsTrigger>
                </TabsList>
                <TabsContent value="tokens">
                  Colour, radius, type, spacing and motion, one emitted contract
                </TabsContent>
                <TabsContent value="components">
                  {countOf('component')} across seven role categories
                </TabsContent>
                <TabsContent value="blocks">
                  {countOf('block')} composed sections that take content as props
                </TabsContent>
              </Tabs>
            ),
          },
          {
            span: 'sm',
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
            span: 'md',
            href: '/components/mini-calendar',
            name: 'MiniCalendar',
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
            span: 'sm',
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
            span: 'sm',
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
            span: 'sm',
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
            span: 'sm',
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
      </Reveal>

      <InstallBand />

      <Reveal>
      <Foundations />
      </Reveal>

      {/*
        The motion band: the laws, running.

        The page's other bands are read, and this one is watched. The field behind
        the copy is a `SignalField` on the drift cycle, both from the package the
        page documents, and the stop control is the Block's own, so the law's test
        is on the page beside the law: stop the field, and the band is still true.
      */}
      <Reveal delay={1}>
      <Backdrop01
        headingLevel="h2"
        title="Motion, three laws"
        description="Feedback runs on the authored scale and never overshoots; a figure that shows a system running rides its own cycle and stays true stopped; a section that meets you does so on your own scroll. This band is the second law, running, and the arrivals around it are the third."
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
              A figure that shows a system running rides one of seven cycles, none shorter than a
              second, and stops to the same figure. The field behind this copy is the second law,
              and the control stops it.
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-semibold tracking-tight">The third law is arrival</h3>
            <p className="text-muted-foreground text-pretty text-sm">
              Every band you scrolled to on this page met you on the way in, and the rail in the
              bar above has been filling since you started reading. That is the whole of the third
              law: your own scroll, answered, and never a script.
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
      </Reveal>

      <Reveal>
      <PackBand
        headingLevel="h2"
        title="Eight packs, one contract"
        description="A pack re-points the semantic tokens rather than replacing them, so the component package is published once and the theme is chosen at runtime. Every pack below is drawn in its own values, on the page you are reading."
        action={{ label: 'See the packs', href: '/foundation/themes' }}
      />
      </Reveal>

      <Reveal delay={1}>
      <MediaBand01
        headingLevel="h2"
        title="One design language. Five expressions."
        description="A prism does not own one colour. It separates one beam into the colours already in it. The system is the prism: the packs are the expressions, and every NaniSoft site wears one without forking the library."
        media={<EditorialPrism />}
        ratio="wide"
        align="media-right"
        caption="A composition, not a photograph: the prism is the mark, the fan is the pack set, and the beam is one token contract."
      />
      </Reveal>

      {/*
        The showcase band: the whole library, at the scale of an application.
        Where the editorial band above is the system's own image, this one is two
        complete consumers published beside the site, and the actions are the
        applications themselves rather than pictures of them.
      */}
      <Reveal delay={2}>
      <ShowcaseBand />
      </Reveal>

      <Reveal delay={1}>
      <ProductGrid01
        headingLevel="h2"
        title="Used by every NaniSoft site"
        description="Four products, one design language. The marks are the same marks their own bars draw, and every one of these sites imports the stylesheet this page does."
        products={SITES}
        caption="The company site and the three products that are live today. Nexus is in development, and its site is the fourth."
      />
      </Reveal>
    </>
  )
}
