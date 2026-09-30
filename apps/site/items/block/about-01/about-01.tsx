import { About01 } from '@nanisoft/prism-ui/blocks/about-01'

/** The statement band with four principles and two figures. */
export default function About01Demo() {
  return (
    <About01
      headingLevel="h3"
      eyebrow="Preview"
      title="What this is"
      statement="A pipeline that watches an industrial estate, decides what changed, and sends an agent to deal with it."
      body="The market is captured as it happens rather than reconstructed afterwards, and every finding arrives with the person or the run that will act on it. Nothing waits for a person to look at a chart."
      figures={[
        { label: 'Sites observed', value: '1,240' },
        {
          label: 'Median time to a decision',
          value: '18 min',
          delta: -0.24,
          hint: 'Against the same period a year earlier',
        },
      ]}
      principles={[
        {
          id: 'mechanism',
          title: 'Show the mechanism',
          body: 'A figure a reader stops on has to be the one that would still be true with the motion stopped.',
        },
        {
          id: 'agents',
          title: 'Agents do the work',
          body: 'A finding nobody acts on is a dashboard, and a dashboard is not a system that runs.',
        },
        {
          id: 'estate',
          title: 'The whole estate',
          body: 'One plant running well says nothing about the eleven that are not, so coverage is the first claim.',
        },
        {
          id: 'provenance',
          title: 'Every number has a source',
          body: 'A reading a reader cannot trace is a reading they have to take on trust, and then they take none of them.',
        },
      ]}
      actions={[
        { label: 'Read the architecture', href: '/architecture' },
        { label: 'Talk to an engineer', href: '/contact' },
      ]}
    />
  )
}
