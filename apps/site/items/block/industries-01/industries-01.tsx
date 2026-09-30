import { Factory, FlaskConical, Leaf, Truck, Waves, Zap } from 'lucide-react'

import { Industries01 } from '@nanisoft/prism-ui/blocks/industries-01'

/** Six sectors in a three-across grid, the default form. */
export default function Industries01Demo() {
  return (
    <Industries01
      headingLevel="h3"
      eyebrow="Preview"
      title="Sectors where the paper is the bottleneck"
      description="Six of them, all visible at once. Tabs would hide five of these behind a control, so the grid is the default."
      industries={[
        {
          id: 'glass',
          name: 'Glass',
          icon: Factory,
          problem: 'A furnace that drifts is a furnace nobody notices until the shift is over.',
          href: '/industries/glass',
          hrefLabel: 'How it runs in glass',
        },
        {
          id: 'food',
          name: 'Food and drink',
          icon: Leaf,
          problem: 'A cold chain that was fine yesterday is the claim a regulator asks about today.',
          href: '/industries/food',
          hrefLabel: 'How it runs in food and drink',
        },
        {
          id: 'chemicals',
          name: 'Chemicals',
          icon: FlaskConical,
          problem: 'Two plants on the same estate, two sets of numbers, and one shift handover between them.',
        },
        {
          id: 'textiles',
          name: 'Textiles',
          icon: Waves,
          problem: 'A line that slows for four minutes an hour costs more than the four minutes.',
        },
        {
          id: 'logistics',
          name: 'Logistics',
          icon: Truck,
          problem: 'A yard is observed, so the queue outside the gate is a number rather than a story.',
        },
        {
          id: 'energy',
          name: 'Energy',
          icon: Zap,
          problem: 'A plant that is observed is a plant whose losses are argued about with numbers.',
          href: '/industries/energy',
          hrefLabel: 'How it runs in energy',
        },
      ]}
    />
  )
}
