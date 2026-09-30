import { MilestoneTimeline01, type Milestone } from '@nanisoft/prism-ui/blocks/milestone-timeline-01'

/**
 * Four milestones carrying all three states, plus the bare tick.
 *
 * The tick is the row this Demo exists to show. A milestone with no `state` is
 * neither reached nor pending as far as the Block knows, and it draws a hairline
 * on the rail rather than one of the three marks, because both available guesses
 * would be a claim the caller did not make. The fifth milestone then shows the
 * `upcoming` end of the sequence, which is what makes the tick legible by
 * comparison rather than by documentation.
 */
const MILESTONES: Milestone[] = [
  {
    id: 'first-line',
    at: '2023',
    title: 'One site, one line',
    body: 'A single collection site, a single run, and a claim narrow enough to be wrong about.',
    state: 'complete',
  },
  {
    id: 'capture',
    at: '2024',
    title: 'The market is captured',
    body: 'The same line across the estate, continuously rather than on request, and the reconstruction problem stopped being a problem.',
    state: 'complete',
    progress: 100,
  },
  {
    id: 'naming',
    at: '2025',
    title: 'The estate gets a vocabulary',
    body: 'Eleven sites, four equipment types, and one set of words for what a healthy one looks like.',
    progress: 70,
  },
  {
    id: 'agents',
    at: '2026',
    title: 'Agents take the findings',
    body: 'A finding arrives, an agent takes it, and a person is woken only for the decision that is not the agent’s to make.',
    state: 'current',
    progress: 40,
    href: '/estate/agents',
    hrefLabel: 'Read what an agent is allowed to do',
  },
  {
    id: 'estate',
    at: 'Not dated',
    title: 'The whole estate under one graph',
    body: 'One plant running well says nothing about the eleven that are not, so coverage became the first claim.',
    state: 'upcoming',
  },
]

/** The sequence, and the same sequence with the link and the fills dropped. */
export default function MilestoneTimeline01Demo() {
  return (
    <>
      <MilestoneTimeline01
        headingLevel="h3"
        eyebrow="Preview"
        title="What the estate has reached"
        description="The third row carries no state at all, so it draws a tick. The fifth carries the state it has."
        nowLabel="Where the estate is today"
        progressLabel={(value) =>
          `${value} per cent of the eleven sites brought under observation`
        }
        milestones={MILESTONES}
      />
      <MilestoneTimeline01
        headingLevel="h3"
        eyebrow="Preview"
        title="A sequence with no fills and no links"
        description="Dated milestones, in the caller’s own locale and words. Nothing here is a moment and a bar at once."
        nowLabel="The current step"
        progressLabel={(value) => `${value} per cent through the migration`}
        milestones={MILESTONES.map((milestone) => ({
          id: milestone.id,
          at: milestone.at,
          title: milestone.title,
          body: milestone.body,
          state: milestone.state,
        }))}
      />
    </>
  )
}
