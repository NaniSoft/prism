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
      description="Nexus was started by three engineers who spent a decade watching software teams turn every incident into a ticket queue and every deployment into an all-hands review."
      statement="An estate that observes its own runs, isolates what drifted, and hands the operator a verified diff rather than an alert."
      principles={[
        {
          id: 'runs',
          title: 'It runs without being watched',
          body: 'A collector that needs a dashboard open to stay healthy is a manual job wearing a cron schedule.',
        },
        {
          id: 'evidence',
          title: 'The evidence is the output',
          body: 'Every finding names the span, the commit and the threshold it crossed before it asks anyone to act.',
        },
        {
          id: 'boring',
          title: 'Boring where it can be',
          body: 'Plain files, deterministic replays and one append-only ledger that survives the tool that wrote it.',
        },
      ]}
      milestones={[
        {
          id: 'first',
          at: '2024',
          title: 'First unattended collector',
          body: 'Captured full-chain market and service telemetry across four estates for ninety days without a manual restart.',
        },
        {
          id: 'second',
          at: '2026',
          title: 'The read-only agent surface',
          body: 'Opened the same verified ledger to automated reviewers and human operators under one contract.',
        },
      ]}
      people={[
        {
          id: 'one',
          name: 'Margret Haldorsdottir',
          role: 'Founding engineer, collectors',
          bio: 'Built the minute-by-minute capture loop and the deterministic replay format.',
          avatar: { name: 'MH' },
        },
        {
          id: 'two',
          name: 'Tunde Oyelaran',
          role: 'Runtime and storage',
          bio: 'Keeps the columnar partitions fast enough to query while a run is still writing.',
          avatar: { name: 'TO' },
        },
        {
          id: 'three',
          name: 'Priya Raman',
          role: 'Operator console',
          bio: 'Designs the morning review surfaces and the diff ledger.',
          avatar: { name: 'PR' },
        },
      ]}
      services={[
        {
          id: 'first',
          title: 'Estate instrumentation',
          body: 'We wire read-only collectors across your queues, databases and worker nodes in a two-week sprint.',
          deliverables: ['Collector topology map', 'Retention and partition schedule'],
          outcome: 'Every service emits structured runs before you change a line of application code.',
        },
        {
          id: 'second',
          title: 'Replay and audit verification',
          body: 'We pair your incident history against the ledger so every past failure can be re-run deterministically.',
          deliverables: ['Seeded regression corpus', 'Signed audit trail export'],
          outcome: 'Postmortems test the fix against the exact bytes that caused the outage.',
        },
        {
          id: 'third',
          title: 'Dedicated operator handoff',
          body: 'We train the on-call rotation to run the morning review from one screen and retire redundant alert rules.',
          deliverables: ['Morning review playbook', 'Alert-noise reduction report'],
          outcome: 'Pager volume drops to the faults that actually require a human hand.',
        },
      ]}
      contact={{
        title: 'Walk through an estate with us',
        description: 'Bring one service that keeps waking your team up and we will map its collector path.',
        cta: { label: 'Get in touch', href: '/contact' },
      }}
    />
  )
}
