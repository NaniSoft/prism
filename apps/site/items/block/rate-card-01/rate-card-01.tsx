import { CtaLink } from '@nanisoft/prism-ui'
import { RateCard01 } from '@nanisoft/prism-ui/blocks/rate-card-01'

/** A card with tiers, allowances and an overage rate. */
export default function RateCard01Demo() {
  return (
    <RateCard01
      headingLevel="h3"
      eyebrow="Metered"
      title="What one agent run costs"
      description="Three bands, counted in the unit below. Nothing here is a hardcoded symbol: every amount is formatted by the platform."
      unit="agent run"
      labels={{
        tier: 'Band',
        included: 'Runs included',
        overage: 'Each run past that',
      }}
      rates={[
        {
          id: 'first',
          tier: 'First 500 runs',
          amount: { amount: 0, currency: 'USD', locale: 'en-GB', maximumFractionDigits: 0 },
          included: 'The whole allowance',
        },
        {
          id: 'next',
          tier: 'Next 20,000 runs',
          amount: { amount: 0.024, currency: 'USD', locale: 'en-GB' },
          included: '20,000 runs',
          overage: { amount: 0.031, currency: 'USD', locale: 'en-GB' },
        },
        {
          id: 'rest',
          tier: 'Everything above that',
          amount: { amount: 0.019, currency: 'USD', locale: 'en-GB' },
          included: 'No allowance',
          overage: { amount: 0.019, currency: 'USD', locale: 'en-GB' },
        },
      ]}
      footnote="Counted per completed run. A run that fails before its first tool call is not counted, and one that is retried is counted once."
      actions={
        <CtaLink variant="outline" href="/pricing/full">
          Read the full tariff
        </CtaLink>
      }
    />
  )
}
