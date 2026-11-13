import { ChartColumn, Package, ShoppingCart, Sunrise, Truck, Undo2 } from 'lucide-react'

import { SiteChrome } from '@/components/site-chrome'
import { Cta01 } from '@nanisoft/prism-ui/blocks/cta-01'
import { FeatureGrid01 } from '@nanisoft/prism-ui/blocks/feature-grid-01'
import { Hero01 } from '@nanisoft/prism-ui/blocks/hero-01'
import { LogoStrip01 } from '@nanisoft/prism-ui/blocks/logo-strip-01'
import { Stats01 } from '@nanisoft/prism-ui/blocks/stats-01'
import { Testimonial01 } from '@nanisoft/prism-ui/blocks/testimonial-01'

import { publicPath } from '@/lib/site'
import { ORDERS_SERIES, STORES } from '@/lib/store'

/**
 * The landing: six bands, every one of them a published Block, every string and
 * figure a prop. The page is what a consumer's marketing route looks like when
 * the consumer writes no CSS and no JavaScript.
 */
export default function HomePage() {
  return (
    <SiteChrome currentPath="/">
      <Hero01
        eyebrow="Meridian"
        title="Every order, every shelf, one morning."
        description="Meridian watches the counter, the stockroom and the couriers in one place, so the person who runs the shop runs it from one screen."
        actions={[
          { label: 'See the plans', href: publicPath('/pricing') },
          {
            label: 'Open the console',
            href: 'https://prism.nanisoft.com/showcase/admin',
            variant: 'outline',
          },
        ]}
      />

      <LogoStrip01 label="Shops that run on Meridian" items={STORES} />

      <FeatureGrid01
        headingLevel="h2"
        eyebrow="What it does"
        title="Six answers to the six questions a shop day asks"
        description="Each one is a whole surface in the console, and each one is a Block this site composes rather than a style it owns."
        features={[
          {
            icon: ShoppingCart,
            title: 'One counter',
            body: 'Orders from the shop, the marketplaces and the till itself, settling into one ledger.',
          },
          {
            icon: Package,
            title: 'The shelf, honestly',
            body: 'Stock that knows what is sold, what is held and what is on its way before a customer asks.',
          },
          {
            icon: Truck,
            title: 'Couriers, compared',
            body: 'Every courier with its rate and its record beside the label, so the reliable hand is one click.',
          },
          {
            icon: Sunrise,
            title: 'Mornings, shorter',
            body: 'The overnight numbers, checked and explained, on one page before the kettle boils.',
          },
          {
            icon: Undo2,
            title: 'Returns without dread',
            body: 'A return finds its order, its reason and its refund path on its own.',
          },
          {
            icon: ChartColumn,
            title: 'Numbers with sources',
            body: 'Every figure names the orders it is made of, and opens them.',
          },
        ]}
      />

      <Stats01
        headingLevel="h2"
        eyebrow="The shape of a year"
        title="What the shops see"
        stats={[
          { key: 'stores', label: 'Shops on Meridian', value: '1,900' },
          {
            key: 'orders',
            label: 'Orders a year',
            value: '4.2M',
            series: ORDERS_SERIES,
            seriesLabel: 'Orders by month',
          },
          {
            key: 'close',
            label: 'Minutes to close the morning',
            value: '9',
            delta: -2,
            deltaFormat: '2 minutes faster',
            hint: 'Against the same month last year',
          },
          {
            key: 'retention',
            label: 'Shops still open after a year',
            value: '96%',
            delta: 1,
          },
        ]}
      />

      <Testimonial01
        headingLevel="h2"
        eyebrow="In use"
        title="Two shops, two mornings"
        description="Meridian is fictional, and so are the shops. The sentences are what the surface is for."
        format="pair"
        quotes={[
          {
            id: 'bloom',
            quote:
              'The morning page is the whole product as far as I am concerned. I used to close the till, then reconcile three marketplaces by hand. Now I read one page and the exceptions are already sorted.',
            name: 'Farah Osman',
            role: 'Owner',
            company: 'Bloom and Barrel',
            avatar: { name: 'FO' },
          },
          {
            id: 'longshed',
            quote:
              'Courier comparison saved us more than the subscription costs. Same labels, same pickup, and the choice is made on delivery record rather than on habit.',
            name: 'Dmitri Sala',
            role: 'Shop manager',
            avatar: { name: 'DS' },
          },
        ]}
      />

      <Cta01
        title="Run the shop from one screen."
        description="Every surface in this site and in the console is composed from one stylesheet and no consumer JavaScript, which is the point of the showcase."
        action={{ label: 'See the plans', href: publicPath('/pricing') }}
        secondaryAction={{ label: 'Talk to us', href: publicPath('/contact') }}
        note="Meridian is a fictional product composed from Prism, the NaniSoft design system."
      />
    </SiteChrome>
  )
}
