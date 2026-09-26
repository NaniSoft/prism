import { Blocks, Palette, ShieldCheck, Zap } from 'lucide-react'

import { MarketingPage } from '@nanisoft/prism-ui/pages/marketing-page'

/**
 * The marketing page, composed with placeholder sections.
 *
 * The page owns the sequence; the demo owns the strings, the numbers and the
 * feature icons. It renders at `h3` because the documentation page already owns
 * an `h1`, which is the same reason a block demo nests its heading.
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
          { label: 'Primary action' },
          { label: 'Secondary', variant: 'outline' },
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
            name: 'First plan',
            price: '$0',
            period: ' / month',
            body: 'One line on who it is for.',
            features: ['First included line', 'Second included line', 'Third included line'],
            cta: 'Choose',
          },
          {
            name: 'Second plan',
            price: '$24',
            period: ' / month',
            body: 'One line on who it is for.',
            features: ['Everything in the first plan', 'One extra line', 'Another extra line'],
            cta: 'Choose',
            featured: true,
          },
          {
            name: 'Third plan',
            price: '$68',
            period: ' / month',
            body: 'One line on who it is for.',
            features: ['Everything in the second plan', 'One extra line', 'Another extra line'],
            cta: 'Choose',
          },
        ],
      }}
      cta={{
        title: 'A closing line, two lines at most',
        description: 'A sentence that says what happens next, then one action.',
        action: { label: 'Do the thing' },
      }}
    />
  )
}
