import { Blocks, Palette, ShieldCheck, Zap } from 'lucide-react'

import { FeatureGrid01 } from '@nanisoft/prism-ui/blocks/feature-grid-01'

/** The feature grid with four neutral placeholder features. */
export default function FeatureGrid01Demo() {
  return (
    <FeatureGrid01
      headingLevel="h3"
      eyebrow="Preview"
      title="Section heading"
      description="An optional line that explains what the set below it has in common."
      features={[
        { icon: Palette, title: 'First item', body: 'A short sentence describing the first thing in the set.' },
        { icon: Blocks, title: 'Second item', body: 'A short sentence describing the second thing in the set.' },
        { icon: Zap, title: 'Third item', body: 'A short sentence describing the third thing in the set.' },
        { icon: ShieldCheck, title: 'Fourth item', body: 'A short sentence describing the fourth thing in the set.' },
      ]}
    />
  )
}
