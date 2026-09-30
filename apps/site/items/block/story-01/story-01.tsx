import { Factory } from 'lucide-react'

import { Story01 } from '@nanisoft/prism-ui/blocks/story-01'

/** Four milestones on the vertical rail, the default form. */
export default function Story01Demo() {
  return (
    <Story01
      headingLevel="h3"
      eyebrow="Preview"
      title="How we got here"
      description="Four milestones in the order they happened. The dates are the caller's own, written for its own locale."
      milestones={[
        {
          id: 'first-run',
          at: '2023',
          title: 'The first pipeline',
          body: 'One site, one line and a run that finished before anybody had asked whether it was useful. The claim we set out to test was narrow on purpose.',
        },
        {
          id: 'capture',
          at: '2024',
          title: 'The market is captured',
          body: 'The same line across the whole estate, continuously rather than on request, and the reconstruction problem stopped being a problem.',
          media: <Factory className="text-muted-foreground size-10" aria-hidden />,
          mediaLabel: 'Sites under observation, by month',
        },
        {
          id: 'agents',
          at: '2025',
          title: 'Agents do the work',
          body: 'Findings stopped arriving as tickets. A run arrives, an agent takes it, and a person is woken only when the decision is not the agent’s to make.',
        },
        {
          id: 'estate',
          at: '2026',
          title: 'The estate is observed',
          body: 'One plant running well says nothing about the eleven that are not, so coverage became the first claim and the graph became the argument.',
        },
      ]}
    />
  )
}
