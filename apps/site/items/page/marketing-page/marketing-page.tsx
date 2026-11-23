import { Blocks, Palette, ShieldCheck, Zap } from 'lucide-react'

import { MarketingPage } from '@nanisoft/prism-ui/pages/marketing-page'

/**
 * The marketing page, composed with placeholder sections.
 *
 * The page owns the sequence; the demo owns the strings, the numbers and the
 * feature icons. It renders at `h3` because the documentation page already owns
 * an `h1`, which is the same reason a block demo nests its heading.
 *
 * **Both hero actions name a destination, and they did not.** They were two
 * `{ label }` values, which `HeroAction` accepted and rendered as two inert
 * buttons, so this Demo shipped the exact defect the action arms were changed to
 * end: a page whose primary call to action was focusable, announced as a button,
 * and activated to nothing. The destinations are real routes rather than a
 * fragment, because a fragment with no element behind it is the same claim of a
 * destination that a button with no handler is.
 */
export default function MarketingPageDemo() {
  return (
    <MarketingPage
      headingLevel="h3"
      hero={{
        eyebrow: 'Nexus Estate',
        title: 'Observe the estate without waking the team',
        description:
          'Read-only collectors, deterministic replays and one append-only ledger across every service you run.',
        actions: [
          { label: 'Read the quickstart', href: '/overview/quickstart' },
          { label: 'Explore the hero block', href: '/blocks/hero-01', variant: 'outline' },
        ],
      }}
      features={{
        eyebrow: 'Capabilities',
        title: 'Four guarantees in every collector run',
        description: 'Every collector writes to the same columnar format and verifies its own schema before flushing.',
        features: [
          {
            icon: Palette,
            title: 'Zero-touch ingestion',
            body: 'Collectors attach to existing read replicas and message queues without application changes.',
          },
          {
            icon: Blocks,
            title: 'Columnar session blocks',
            body: 'Each session lands in an immutable partition ready for instant backtesting and replay.',
          },
          {
            icon: Zap,
            title: 'Isolated connection pools',
            body: 'Live capture and historical queries never compete for the same database handles.',
          },
          {
            icon: ShieldCheck,
            title: 'Signed audit trail',
            body: 'Every schema change and permission grant is recorded with the actor and the diff.',
          },
        ],
      }}
      stats={{
        eyebrow: 'Estate telemetry',
        title: 'Measured across production workspaces',
        stats: [
          { key: 'first', label: 'Active collectors', value: '1,284', delta: 12, deltaFormat: '12 more than last month', hint: 'vs last month' },
          { key: 'second', label: 'Replay cache hit rate', value: '94.2%', delta: 3, deltaFormat: '3 points higher', hint: 'vs last month' },
          { key: 'third', label: 'Median flush latency', value: '18ms', delta: 0, hint: 'vs last quarter' },
          { key: 'fourth', label: 'Estates observed', value: '138' },
        ],
      }}
      pricing={{
        title: 'Plans priced by estate, not by seat',
        plans: [
          {
            id: 'first',
            name: 'Starter',
            price: '$0',
            period: ' / month',
            body: 'One workspace and one scheduled collector.',
            features: ['One read-only collector', 'Seven-day replay retention', 'Community support'],
            action: { label: 'Start free', href: '#plans' },
          },
          {
            id: 'second',
            name: 'Team',
            price: '$240',
            period: ' / month',
            body: 'Four maintainers, every collector and a shared schedule.',
            features: ['Everything in Starter', 'Unlimited windowed collectors', 'Ninety-day columnar retention'],
            action: { label: 'Start on Team', href: '#plans' },
            featured: true,
          },
          {
            id: 'third',
            name: 'Enterprise',
            price: '$680',
            period: ' / month',
            body: 'The full pipeline inside your own cloud estate.',
            features: ['Everything in Team', 'Self-hosted storage buckets', 'Four-hour response SLA'],
            action: { label: 'Talk to us', href: '#plans' },
          },
        ],
      }}
      cta={{
        title: 'Connect your first collector in ten minutes',
        description: 'Generate a read-only key, point it at a staging replica, and watch the first session land.',
        // `Cta01`'s own member name, unchanged: it is the closing band's `action`
        // that is a link, and it was always a link. Only `Pricing01`'s plan record
        // renamed, because only that one rendered a Button.
        action: { label: 'Inspect the button surface', href: '/components/button' },
      }}
    />
  )
}
