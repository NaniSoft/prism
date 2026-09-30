import { Hero03 } from '@nanisoft/prism-ui/blocks/hero-03'

/**
 * The three things, and the three figures.
 *
 * Every number on this page is the preview's own. A Block ships no figures, and
 * the hero is the position on a page where a design system's invented number does
 * the most damage, so the demo holds them rather than the Block.
 */
const POINTS = [
  {
    title: 'Capture',
    body: 'A finding enters the pipeline and is written down once, in the caller\'s own words.',
  },
  {
    title: 'Observe',
    body: 'The estate is walked on a cycle and the differences between two walks are kept.',
  },
  {
    title: 'Prove',
    body: 'Every claim a page makes is traceable back to the run that made it.',
  },
]

const PROOF = [
  { label: 'Runs completed this week', value: '4,182', delta: 6 },
  { label: 'Median time to a merged pull request', value: '9m 40s', hint: 'Last 30 days' },
  { label: 'Findings carried into a release', value: '96%', delta: -2 },
]

/** One Block, its three points and its row of figures. */
export default function Hero03Demo() {
  return (
    <Hero03
      headingLevel="h3"
      eyebrow="Preview"
      title="Three figures and a sentence, which is the third claim in the family."
      description="The list sits beside the headline and the figures sit under a rule that spans the container, because they are evidence for the claim above them rather than a section of their own."
      points={POINTS}
      proof={PROOF}
      actions={[
        { label: 'Primary action', href: '#hero-03' },
        { label: 'Secondary', href: '#hero-03', variant: 'outline' },
      ]}
    />
  )
}