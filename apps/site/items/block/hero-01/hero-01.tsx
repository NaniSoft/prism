import { Hero01 } from '@nanisoft/prism-ui/blocks/hero-01'

/** The centered hero, with a heading level that nests under the page. */
export default function Hero01Demo() {
  return (
    <Hero01
      headingLevel="h3"
      eyebrow="Preview"
      title="A headline that fits on two lines"
      description="One or two sentences of supporting copy, so you can judge the measure and the spacing around it."
      actions={[{ label: 'Primary action' }, { label: 'Secondary', variant: 'outline' }]}
    />
  )
}
