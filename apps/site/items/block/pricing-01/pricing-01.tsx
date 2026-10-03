import { Pricing01 } from '@nanisoft/prism-ui/blocks/pricing-01'

/**
 * The plan comparison, with the middle plan featured.
 *
 * Every plan's control names a destination, so each one renders as an anchor. A
 * plan whose control is a checkout trigger or a contact form is the `slot` arm of
 * `action`, and the block places that node in the card's foot rather than drawing a
 * button that cannot open it.
 */
export default function Pricing01Demo() {
  return (
    <Pricing01
      headingLevel="h3"
      title="Section heading"
      plans={[
        { id: 'first', name: 'First plan', price: '$0', period: ' / month', body: 'One line on who it is for.', features: ['First included line', 'Second included line', 'Third included line'], action: { label: 'Choose', href: '#first-plan' } },
        { id: 'second', name: 'Second plan', price: '$24', period: ' / month', body: 'One line on who it is for.', features: ['Everything in the first plan', 'One extra line', 'Another extra line'], action: { label: 'Choose', href: '#second-plan' }, featured: true, badge: 'Most chosen' },
        { id: 'third', name: 'Third plan', price: '$68', period: ' / month', body: 'One line on who it is for.', features: ['Everything in the second plan', 'One extra line', 'Another extra line'], action: { label: 'Choose', href: '#third-plan' } },
      ]}
    />
  )
}
