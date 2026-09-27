import { Cta01 } from '@nanisoft/prism-ui/blocks/cta-01'

/** The closing band, with one action. */
export default function Cta01Demo() {
  return (
    <Cta01
      headingLevel="h3"
      title="A closing line, two lines at most"
      description="A sentence that says what happens next, then one action."
      action={{ label: 'Do the thing' }}
    />
  )
}
