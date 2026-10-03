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
        eyebrow: 'Preview',
        title: 'A headline that fits on two lines',
        description:
          'One or two sentences of supporting copy, so the measure and the spacing around it can be judged.',
        actions: [
          { label: 'Primary action', href: '/overview/quickstart' },
          { label: 'Secondary', href: '/blocks/hero-01', variant: 'outline' },
        ],
      }}
      features={{
        eyebrow: 'Preview',
        title: 'Section heading',
        description: 'An optional line that explains what the set below it has in common.',
        features: [
          {
            icon: Palette,
            title: 'First item',
            body: 'A short sentence describing the first thing in the set.',
          },
          {
            icon: Blocks,
            title: 'Second item',
            body: 'A short sentence describing the second thing in the set.',
          },
          {
            icon: Zap,
            title: 'Third item',
            body: 'A short sentence describing the third thing in the set.',
          },
          {
            icon: ShieldCheck,
            title: 'Fourth item',
            body: 'A short sentence describing the fourth thing in the set.',
          },
        ],
      }}
      stats={{
        eyebrow: 'Preview',
        title: 'Section heading',
        stats: [
          { label: 'First metric', value: '1,284', delta: 12, hint: 'vs last month' },
          { label: 'Second metric', value: '47.2%', delta: -3, hint: 'vs last month' },
          { label: 'Third metric', value: '2.4d', delta: 0, hint: 'vs last quarter' },
          { label: 'Fourth metric', value: '138' },
        ],
      }}
      pricing={{
        title: 'Section heading',
        plans: [
          {
            id: 'first',
            name: 'First plan',
            price: '$0',
            period: ' / month',
            body: 'One line on who it is for.',
            features: ['First included line', 'Second included line', 'Third included line'],
            action: { label: 'Choose', href: '#plans' },
          },
          {
            id: 'second',
            name: 'Second plan',
            price: '$24',
            period: ' / month',
            body: 'One line on who it is for.',
            features: ['Everything in the first plan', 'One extra line', 'Another extra line'],
            action: { label: 'Choose', href: '#plans' },
            featured: true,
          },
          {
            id: 'third',
            name: 'Third plan',
            price: '$68',
            period: ' / month',
            body: 'One line on who it is for.',
            features: ['Everything in the second plan', 'One extra line', 'Another extra line'],
            action: { label: 'Choose', href: '#plans' },
          },
        ],
      }}
      cta={{
        title: 'A closing line, two lines at most',
        description: 'A sentence that says what happens next, then one action.',
        // `Cta01`'s own member name, unchanged: it is the closing band's `action`
        // that is a link, and it was always a link. Only `Pricing01`'s plan record
        // renamed, because only that one rendered a Button.
        action: { label: 'Do the thing', href: '/components/button' },
      }}
    />
  )
}
