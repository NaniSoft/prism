import { Pricing01 } from '@nanisoft/prism-ui/blocks/pricing-01'

/** The plan comparison, with the middle plan featured. */
export default function Pricing01Demo() {
  return (
    <Pricing01
      headingLevel="h3"
      title="Section heading"
      plans={[
        { name: 'First plan', price: '$0', period: ' / month', body: 'One line on who it is for.', features: ['First included line', 'Second included line', 'Third included line'], cta: 'Choose' },
        { name: 'Second plan', price: '$24', period: ' / month', body: 'One line on who it is for.', features: ['Everything in the first plan', 'One extra line', 'Another extra line'], cta: 'Choose', featured: true },
        { name: 'Third plan', price: '$68', period: ' / month', body: 'One line on who it is for.', features: ['Everything in the second plan', 'One extra line', 'Another extra line'], cta: 'Choose' },
      ]}
    />
  )
}
