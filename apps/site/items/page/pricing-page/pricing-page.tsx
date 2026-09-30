import { Faq01 } from '@nanisoft/prism-ui/blocks/faq-01'
import { Offer01 } from '@nanisoft/prism-ui/blocks/offer-01'
import { PricingCompare01 } from '@nanisoft/prism-ui/blocks/pricing-compare-01'
import { CtaLink } from '@nanisoft/prism-ui/components/cta-link'

import { PricingPage } from '@nanisoft/prism-ui/pages/pricing-page'

/**
 * The pricing screen, in the order the page composes it.
 *
 * Every region is on show at once because the point of the Demo is the order: the
 * heading and the change note above the plans, the plans, the comparison band
 * whose matrix the caller composes, and then the two bands the page does not own.
 *
 * The matrix is given no `title`, which is the arrangement the page asks for: the
 * band, its heading and its link belong to the page, and the table belongs to the
 * caller. It renders at `h3` because the documentation page already owns an `h1`,
 * and the matrix takes the level one below the band heading it sits under.
 */
export default function PricingPageDemo() {
  return (
    <PricingPage
      headingLevel="h3"
      eyebrow="Plans"
      title="What it costs"
      description="One sentence saying what every plan has in common, so a reader can tell whether the row below is worth reading."
      changeNote={{
        title: 'The metered run price moved on 1 September.',
        description: 'Runs are now billed per thousand rather than per hour. Nothing else changed.',
        href: '/changelog/2026-09-01',
        hrefLabel: 'Read the full note',
      }}
      plans={[
        {
          id: 'starter',
          name: 'Starter',
          summary: 'One workspace and one collector.',
          price: { amount: 0, currency: 'GBP', locale: 'en-GB', period: 'for the first workspace' },
          action: { label: 'Create a workspace', href: '/signup' },
        },
        {
          id: 'team',
          name: 'Team',
          summary: 'Four maintainers, every collector, and a shared schedule.',
          featured: true,
          featuredLabel: 'What most teams choose',
          price: { amount: 480, currency: 'GBP', locale: 'en-GB', compareAt: 600, period: 'a month' },
          note: 'Billed monthly. Annual billing takes two months off.',
          action: { label: 'Start on Team', href: '/signup?plan=team' },
        },
        {
          id: 'self-hosted',
          name: 'Self-hosted',
          summary: 'The same pipeline, in your own estate.',
          price: { amount: 2400, currency: 'GBP', locale: 'en-GB', period: 'a year' },
          note: 'One estate per contract, and a signed support agreement.',
          action: { label: 'Talk to us', href: '/contact' },
        },
      ]}
      comparison={{
        title: 'Every feature, plan by plan',
        description: 'The summary above answers whether a plan is worth reading. This answers whether it is right.',
      }}
      compareLink={{ label: 'See the full specification', href: '/plans/specification' }}
      matrix={
        <PricingCompare01
          headingLevel="h4"
          plans={[
            {
              id: 'starter',
              name: 'Starter',
              price: { amount: 0, currency: 'GBP', locale: 'en-GB' },
            },
            {
              id: 'team',
              name: 'Team',
              price: { amount: 480, currency: 'GBP', locale: 'en-GB', period: 'a month' },
            },
          ]}
          groups={[
            {
              title: 'Collectors',
              features: [
                { id: 'scheduled', label: 'Scheduled collectors', values: [true, true] },
                { id: 'windowed', label: 'Windowed collectors', values: [false, true] },
                { id: 'custom', label: 'Collectors you write yourself', values: ['One', 'Any number'] },
              ],
            },
            {
              title: 'Support',
              features: [
                { id: 'response', label: 'First response', values: ['Two working days', 'Four hours'] },
                { id: 'named', label: 'A named maintainer', values: [false, true] },
              ],
            },
          ]}
          labels={{ included: 'Included', excluded: 'Not included' }}
          highlight="team"
        />
      }
      bands={[
        <Faq01
          key="faq"
          headingLevel="h4"
          title="Before you choose"
          questions={[
            {
              id: 'trial',
              question: 'Is there a trial that needs no card?',
              answer: 'A starter workspace costs nothing and takes a card never, so the trial is the free plan.',
            },
            {
              id: 'change',
              question: 'What happens when a run is too long?',
              answer: 'Nothing is cancelled. The run keeps its place and the schedule moves on.',
            },
          ]}
          contact={{ label: 'Ask us instead', href: '/contact' }}
        />,
        <Offer01
          key="offer"
          headingLevel="h4"
          eyebrow="Until 30 November"
          title="Two months off an annual plan"
          description="Pay for a year up front and the second month of it is not charged."
          code="NEXUS-YEAR2"
          codeLabel="Discount code"
          actions={
            <CtaLink href="/signup?offer=NEXUS-YEAR2">Take the annual plan</CtaLink>
          }
          terms="Applies to Team and Self-hosted, to a first annual payment only, and not to an existing subscription."
        />,
      ]}
    />
  )
}
