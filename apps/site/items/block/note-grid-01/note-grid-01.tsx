import { NoteGrid01 } from '@nanisoft/prism-ui/blocks/note-grid-01'

/** Three points, each a title and a sentence, on a hairline and no tile. */
export default function NoteGrid01Demo() {
  return (
    <NoteGrid01
      headingLevel="h3"
      eyebrow="Preview"
      title="What the feed guarantees"
      description="Three properties, and the test that holds each one."
      notes={[
        { title: 'One canonical timestamp', body: 'Every row carries the same clock, set once at capture.' },
        { title: 'One symbol form', body: 'The same instrument is spelled the same way in every table.' },
        { title: 'A pinned column list', body: 'Held by a test rather than by a convention nobody reads.' },
      ]}
    />
  )
}
