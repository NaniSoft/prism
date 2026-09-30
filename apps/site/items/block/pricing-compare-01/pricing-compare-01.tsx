import { Badge } from '@nanisoft/prism-ui'
import { PricingCompare01 } from '@nanisoft/prism-ui/blocks/pricing-compare-01'

/** The plans. Every one of them is passed in, price and period included. */
const PLANS = [
  {
    id: 'capture',
    name: 'Capture',
    price: { amount: 18000, currency: 'USD', locale: 'en-GB', period: 'a month' },
    note: 'One workspace seat included',
    action: { label: 'Start on Capture', href: '/signup?plan=capture' },
  },
  {
    id: 'observe',
    name: 'Observe',
    price: { amount: 62000, currency: 'USD', locale: 'en-GB', period: 'a month' },
    note: 'Five seats, and the audit ledger',
    action: { label: 'Start on Observe', href: '/signup?plan=observe' },
  },
  {
    id: 'estate',
    name: 'Estate',
    price: { amount: 148000, currency: 'USD', locale: 'en-GB', period: 'a month' },
    note: 'Unlimited seats, priced per tracked node',
    action: { label: 'Talk to us about Estate', href: '/contact' },
  },
]

/** The features, in the groups a reader decides in. Each answer is a prop. */
const GROUPS = [
  {
    title: 'Capture',
    features: [
      { id: 'market', label: 'Market minutes captured', values: [true, true, true] },
      { id: 'sources', label: 'Sources per workspace', values: ['Two', 'Ten', 'Unlimited'] },
      { id: 'retention', label: 'Raw retention', values: ['90 days', 'Two years', 'Seven years'] },
    ],
  },
  {
    title: 'Observation',
    features: [
      { id: 'ledger', label: 'Audit ledger', values: [false, true, true], note: 'Every read, kept for a year' },
      { id: 'sso', label: 'Single sign-on', values: [false, 'SAML', 'SAML and SCIM'] },
      { id: 'agents', label: 'Concurrent agent runs', values: [1, 8, 32] },
      { id: 'exports', label: 'Exports', values: [false, false, true] },
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
      { id: 'named', label: 'A named engineer', values: [false, true, true] },
    ],
  },
]

/** The matrix, with the middle plan pointed at and one caller-written badge. */
export default function PricingCompare01Demo() {
  return (
    <PricingCompare01
      headingLevel="h3"
      eyebrow="Plans"
      title="What each plan carries"
      description="Every cell is the caller's own word, and the two yes and no answers announce the words below rather than a shape."
      plans={PLANS.map((plan) =>
        plan.id === 'observe'
          ? { ...plan, note: <Badge variant="secondary">Most chosen</Badge> }
          : plan,
      )}
      groups={GROUPS}
      labels={{ included: 'Included in this plan', excluded: 'Not included in this plan' }}
      highlight="observe"
    />
  )
}
