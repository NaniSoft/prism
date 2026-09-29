import { StackGrid01 } from '@nanisoft/prism-ui/blocks/stack-grid-01'

/** Two groups: the parts it stands on, and the two it built itself. */
export default function StackGrid01Demo() {
  return (
    <StackGrid01
      headingLevel="h3"
      eyebrow="Preview"
      title="How it is built"
      description="Most of it is composition. Two things are not."
      ownLabel="built in-house"
      caption="Everything else in the factory is composition."
      parts={[
        { name: 'Postgres', role: 'Storage' },
        { name: 'NATS', role: 'Queue' },
        { name: 'The catalogue', realName: 'Postgres, Iceberg', role: 'Table metadata' },
        { name: 'OpenCode', role: 'The agent' },
      ]}
      own={[
        { name: 'The orchestrator', blurb: 'Decides what runs next, and what waits.' },
        { name: 'The merge pipeline', blurb: 'Three review rounds, then auto-merge.' },
      ]}
    />
  )
}
