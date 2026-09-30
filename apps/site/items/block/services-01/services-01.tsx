import { Cog, Radar, Route } from 'lucide-react'

import { Services01 } from '@nanisoft/prism-ui/blocks/services-01'

/** Three engagements with the ordinals on, and the last with nothing to promise. */
export default function Services01Demo() {
  return (
    <Services01
      headingLevel="h3"
      eyebrow="Preview"
      title="Three things, in the order they happen"
      description="The ordinals come from the position, so reordering the array reorders the numbers."
      variant="numbered"
      services={[
        {
          id: 'observe',
          title: 'Instrument the estate',
          icon: Radar,
          body: 'One line per site, reading what the site already reports, and nothing invented on the way.',
          deliverables: [
            'A run per site, on a schedule',
            'A reading a person can trace back to a sensor',
          ],
          outcome: 'The estate is observed rather than visited.',
          href: '/work/observe',
          hrefLabel: 'See the observation work',
        },
        {
          id: 'decide',
          title: 'Decide what changed',
          icon: Cog,
          body: 'A run compares the reading against the last one and against the plan, and says which of the two moved.',
          deliverables: ['One finding per change, with its evidence'],
          outcome: 'A finding arrives with a reason attached.',
        },
        {
          id: 'act',
          title: 'Hand it to an agent',
          icon: Route,
          body: 'The finding goes to an agent that can act on it, and a person is woken only when the decision is not the agent’s to make.',
          deliverables: [],
          outcome: 'The work gets done rather than filed.',
          href: '/work/act',
          hrefLabel: 'See the agent work',
        },
      ]}
    />
  )
}
