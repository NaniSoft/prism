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
      description="We are a small team building collectors, columnar stores and calm operator surfaces for systems that cannot afford downtime."
      closedLabel="No longer open"
      roles={[
        {
          id: 'first',
          title: 'Systems Engineer, Collectors',
          team: 'Platform',
          location: 'Remote (UK / Europe)',
          pattern: 'Full time',
          summary: 'Own the read-only ingestion daemons and the backpressure protocol across customer estates.',
          postedAt: '14 August 2026',
          href: '/careers/first-role',
          hrefLabel: 'Read the posting',
        },
        {
          id: 'second',
          title: 'Design Engineer, Operator Surfaces',
          team: 'Design',
          location: 'Remote (UK / Europe)',
          pattern: 'Full time',
          summary: 'Shape the morning review console, the run stream and the diff inspection tools.',
          postedAt: '2 September 2026',
          href: '/careers/second-role',
          hrefLabel: 'Read the posting',
        },
        {
          id: 'third',
          title: 'Storage Engineer, Columnar Ledger',
          team: 'Platform',
          location: 'Remote (UK / Europe)',
          closed: true,
        },
      ]}
      openings={[
        { label: 'All roles', href: '/pages/careers-page' },
        { label: 'Platform', href: '/pages/careers-page?team=platform' },
        { label: 'Design', href: '/pages/careers-page?team=design' },
      ]}
      openingsLabel="Narrow the roles by team"
      empty="There are no open roles this week. The teams below are still hiring for the next quarter."
      values={[
        {
          id: 'runs',
          title: 'It runs unattended',
          body: 'We do not ship features that require an engineer on call to babysit a queue.',
        },
        {
          id: 'evidence',
          title: 'The evidence is the product',
          body: 'We write our findings in public documents and let the measurements decide the architecture.',
        },
        {
          id: 'boring',
          title: 'Boring where it can be',
          body: 'We spend our novelty budget on the problem domain, never on reinventing standard protocols.',
        },
      ]}
      teams={[
        {
          id: 'platform',
          name: 'Platform',
          detail: 'Collectors, columnar storage, query execution and deterministic replay.',
          roles: 2,
          rolesLabel: (count) => `${count} open roles`,
        },
        {
          id: 'design',
          name: 'Design',
          detail: 'Token pipeline, accessible component primitives and the operator console.',
          roles: 1,
          rolesLabel: (count) => `${count} open role`,
        },
        {
          id: 'research',
          name: 'Research',
          detail: 'Anomaly scoring, trace compression and index-scale market capture.',
        },
      ]}
      benefits={[
        {
          id: 'first',
          title: 'Quiet calendar',
          body: 'Two protected four-hour blocks every day with no standing meetings and no synchronous chat requirement.',
        },
        {
          id: 'second',
          title: 'Hardware and lab budget',
          body: 'The workstation, displays and test cluster capacity you need to reproduce customer workloads locally.',
        },
        {
          id: 'third',
          title: 'Six weeks of paid leave',
          body: 'Thirty days of annual leave plus national holidays, with a mandatory two-week continuous break each year.',
        },
      ]}
      contact={{
        title: 'Nothing here today? Send something anyway',
        description: 'Tell us what you have built and which part of the estate you want to work on.',
        href: '/careers/speculative',
        hrefLabel: 'Write to us',
      }}
    />
  )
}
