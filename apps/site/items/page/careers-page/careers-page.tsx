import { CareersPage } from '@nanisoft/prism-ui/pages/careers-page'

/**
 * The careers screen, with one role closed and a narrowing row above the list.
 *
 * The closed row is in the fixture on purpose: a dimmed row with words on it is a
 * state a reader has to be able to recognise, and it cannot be judged in a preview
 * that only draws open roles. It renders at `h3` because the documentation page
 * already owns an `h1`.
 */
export default function CareersPageDemo() {
  return (
    <CareersPage
      headingLevel="h3"
      eyebrow="Careers"
      title="Come and build the thing that runs itself"
      description="One or two sentences under the heading, saying what the work is and who it is for."
      closedLabel="No longer open"
      roles={[
        {
          id: 'first',
          title: 'First role',
          team: 'Platform',
          location: 'Remote',
          pattern: 'Full time',
          summary: 'A sentence or two about the work, for a page that has room for it.',
          postedAt: '2026-08-14',
          href: '/careers/first-role',
          hrefLabel: 'Read the posting',
        },
        {
          id: 'second',
          title: 'Second role',
          team: 'Design',
          location: 'Remote',
          summary: 'A second row, so the list can be scanned rather than admired.',
          href: '/careers/second-role',
          hrefLabel: 'Read the posting',
        },
        {
          id: 'third',
          title: 'Third role',
          team: 'Platform',
          location: 'Remote',
          closed: true,
        },
      ]}
      openings={[
        { label: 'All roles', href: '/pages/careers-page' },
        { label: 'Platform', href: '/pages/careers-page?team=platform' },
        { label: 'Design', href: '/pages/careers-page?team=design' },
      ]}
      openingsLabel="Narrow the roles by team"
      empty="There are no open roles this week. The teams below are still hiring for the next one."
      values={[
        { id: 'runs', title: 'It runs unattended', body: 'A sentence saying what holding to this one means here.' },
        { id: 'evidence', title: 'The evidence is the product', body: 'A second value, so the grid can be judged.' },
        { id: 'boring', title: 'Boring where it can be', body: 'A third value, because a grid of one is a sentence.' },
      ]}
      teams={[
        { id: 'platform', name: 'Platform', detail: 'What the team works on.', roles: 2, rolesLabel: (count) => `${count} open roles` },
        { id: 'design', name: 'Design', detail: 'What the team works on.', roles: 1, rolesLabel: (count) => `${count} open role` },
        { id: 'research', name: 'Research', detail: 'A team with no count to publish.' },
      ]}
      benefits={[
        { id: 'first', title: 'First benefit', body: 'What the reader gets, and under what conditions.' },
        { id: 'second', title: 'Second benefit', body: 'A second tile, so the grid can be judged.' },
        { id: 'third', title: 'Third benefit', body: 'A third tile, because a grid of one is a sentence.' },
      ]}
      contact={{
        title: 'Nothing here today? Send something anyway',
        description: 'A sentence that says what happens to what is sent, then one link.',
        href: '/careers/speculative',
        hrefLabel: 'Write to us',
      }}
    />
  )
}
