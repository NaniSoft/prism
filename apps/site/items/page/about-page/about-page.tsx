import { AboutPage } from '@nanisoft/prism-ui/pages/about-page'

/**
 * The about screen, in the order the page composes it.
 *
 * Every band is given its real content so the sequence can be judged as a
 * sequence, and the people and the engagements are left in so the middle of the
 * page can be seen carrying two grids of titled things rather than a stack of
 * identical sections. It renders at `h3` because the documentation page already
 * owns an `h1`, which is the same reason a block demo nests its heading.
 */
export default function AboutPageDemo() {
  return (
    <AboutPage
      headingLevel="h3"
      eyebrow="About"
      title="We run the thing we sell"
      description="A short paragraph under the heading, so the measure and the spacing around it can be judged against the statement beside it."
      statement="A large sentence saying what this is, in the present tense, for the reader."
      principles={[
        {
          id: 'runs',
          title: 'It runs without being watched',
          body: 'A principle is a short name and one sentence saying what holding to it means in practice.',
        },
        {
          id: 'evidence',
          title: 'The evidence is the output',
          body: 'A second principle, so the grid can be judged with more than one tile in it.',
        },
        {
          id: 'boring',
          title: 'Boring where it can be',
          body: 'A third principle, because a grid of one reads as a sentence with a border around it.',
        },
      ]}
      milestones={[
        {
          id: 'first',
          at: '2023',
          title: 'First milestone',
          body: "One sentence about what changed, in the reader's terms rather than the company's.",
        },
        {
          id: 'second',
          at: '2025',
          title: 'Second milestone',
          body: 'A second row, so the rail can be judged as a rail rather than as one dot.',
        },
      ]}
      people={[
        { id: 'one', name: 'A Person', role: 'What they do', bio: 'A sentence or two at the reading measure.' },
        { id: 'two', name: 'Another Person', role: 'What they do' },
        { id: 'three', name: 'A Third Person', role: 'What they do' },
      ]}
      services={[
        {
          id: 'first',
          title: 'First engagement',
          body: 'A sentence or two about what the work is.',
          deliverables: ['First deliverable', 'Second deliverable'],
          outcome: 'One line on what it is for.',
        },
        {
          id: 'second',
          title: 'Second engagement',
          body: 'A sentence or two about what the work is.',
        },
        {
          id: 'third',
          title: 'Third engagement',
          body: 'A sentence or two about what the work is.',
        },
      ]}
      contact={{
        title: 'A closing line, two lines at most',
        description: 'A sentence that says what happens next, then one link.',
        cta: { label: 'Get in touch', href: '/contact' },
      }}
    />
  )
}
