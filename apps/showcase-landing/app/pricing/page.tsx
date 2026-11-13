import { SiteChrome } from '@/components/site-chrome'
import { Faq01 } from '@nanisoft/prism-ui/blocks/faq-01'
import { PageHeader01 } from '@nanisoft/prism-ui/blocks/page-header-01'
import { Pricing01 } from '@nanisoft/prism-ui/blocks/pricing-01'
import { PricingCompare01 } from '@nanisoft/prism-ui/blocks/pricing-compare-01'
import { Section } from '@nanisoft/prism-ui/components/section'

import { FAQ } from '@/lib/pricing'
import { publicPath } from '@/lib/site'

/**
 * The plans: one page, three Blocks, no handler anywhere. The compare matrix and
 * the FAQ are the same data-shaped Blocks a consumer composes on its own pricing
 * route.
 */
export default function PricingRoute() {
  return (
    <SiteChrome currentPath="/pricing">
      <Section>
        <PageHeader01
          headingLevel="h1"
          breadcrumbs={[{ label: 'Home', href: publicPath('/') }]}
          title="Plans"
          description="Three plans, priced per shop, every figure on this page fictional."
        />
        <Pricing01
          headingLevel="h2"
          plans={[
            {
              id: 'counter',
              name: 'Counter',
              price: '$19',
              period: ' / month',
              body: 'One shop, one counter, one marketplace.',
              features: [
                'One location',
                '500 orders a month',
                'The morning page',
                'Email support',
              ],
              action: { label: 'Start with Counter', href: publicPath('/contact') },
            },
            {
              id: 'shopfront',
              name: 'Shopfront',
              price: '$59',
              period: ' / month',
              body: 'The shop, the shelf and the couriers.',
              features: [
                'Everything in Counter',
                'Unlimited orders',
                'Stock across two locations',
                'Courier comparison',
                'Returns with refund paths',
              ],
              action: { label: 'Start with Shopfront', href: publicPath('/contact') },
              featured: true,
              badge: 'Most chosen',
            },
            {
              id: 'fleet',
              name: 'Fleet',
              price: '$149',
              period: ' / month',
              body: 'Every location, one morning.',
              features: [
                'Everything in Shopfront',
                'Up to ten locations',
                'Buying and transfer between shops',
                'A named support engineer',
              ],
              action: { label: 'Talk to us about Fleet', href: publicPath('/contact') },
            },
          ]}
        />
        <PricingCompare01
          headingLevel="h2"
          eyebrow="Compared"
          title="What each plan carries"
          description="Every cell is the caller's own word, which here means this page's own data module."
          highlight="shopfront"
          plans={[
            {
              id: 'counter',
              name: 'Counter',
              price: { amount: 1900, currency: 'USD', locale: 'en-US', period: 'a month' },
              note: 'One location included',
              action: { label: 'Start with Counter', href: publicPath('/contact') },
            },
            {
              id: 'shopfront',
              name: 'Shopfront',
              price: { amount: 5900, currency: 'USD', locale: 'en-US', period: 'a month' },
              note: 'Two locations, courier comparison',
              action: { label: 'Start with Shopfront', href: publicPath('/contact') },
            },
            {
              id: 'fleet',
              name: 'Fleet',
              price: { amount: 14900, currency: 'USD', locale: 'en-US', period: 'a month' },
              note: 'Ten locations, a named engineer',
              action: { label: 'Talk to us about Fleet', href: publicPath('/contact') },
            },
          ]}
          groups={[
            {
              title: 'Selling',
              features: [
                { id: 'orders', label: 'Orders a month', values: ['500', 'Unlimited', 'Unlimited'] },
                { id: 'channels', label: 'Marketplace channels', values: ['One', 'Three', 'Ten'] },
                { id: 'till', label: 'The till itself', values: [true, true, true] },
              ],
            },
            {
              title: 'The shelf',
              features: [
                { id: 'locations', label: 'Locations', values: ['One', 'Two', 'Ten'] },
                { id: 'transfers', label: 'Buying and transfer', values: [false, false, true] },
                { id: 'counts', label: 'Stocktakes', values: ['Monthly', 'Weekly', 'Any time'] },
              ],
            },
            {
              title: 'Support',
              features: [
                {
                  id: 'response',
                  label: 'First response',
                  values: ['Two business days', 'One business day', 'Four hours'],
                },
                { id: 'engineer', label: 'A named engineer', values: [false, false, true] },
              ],
            },
          ]}
          labels={{ included: 'Included in this plan', excluded: 'Not included in this plan' }}
        />
        <Faq01
          headingLevel="h2"
          eyebrow="Before you choose"
          title="Questions every shop asks"
          questions={FAQ}
          contact={{ label: 'Ask a person directly', href: publicPath('/contact') }}
        />
      </Section>
    </SiteChrome>
  )
}
