import { ProcessRail01 } from '@nanisoft/prism-ui/blocks/process-rail-01'

/** Four steps on one line, with the label on the last one. */
export default function ProcessRail01Demo() {
  return (
    <ProcessRail01
      headingLevel="h3"
      eyebrow="Preview"
      title="The data path"
      description="One line about the whole path, above the rail rather than inside it."
      finalLabel="serving"
      steps={[
        { name: 'Collect', description: 'The whole surface, every minute.' },
        { name: 'Conform', description: 'One timestamp, one symbol form.' },
        { name: 'Verify', description: 'The column list held by test.' },
        { name: 'Serve', description: 'One queryable view.' },
      ]}
    />
  )
}
