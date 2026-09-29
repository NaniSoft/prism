import { ProcessFlow01 } from '@nanisoft/prism-ui/blocks/process-flow-01'

/** Six stages across two lines, with the label on the last one. */
export default function ProcessFlow01Demo() {
  return (
    <ProcessFlow01
      headingLevel="h3"
      eyebrow="Preview"
      title="The build pipeline"
      description="Six stages, from an intake to a merge. The ordinal carries the order across the break."
      finalLabel="merged"
      stages={[
        { name: 'Intake', description: 'The request arrives and is recorded.' },
        { name: 'Plan', description: 'The work is broken into steps.' },
        { name: 'Build', description: 'The steps are executed.' },
        { name: 'Verify', description: 'The result is checked against the plan.' },
        { name: 'Review', description: 'A person signs off on it.' },
        { name: 'Merge', description: 'The change lands on the main line.' },
      ]}
    />
  )
}
