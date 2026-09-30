import { Faq01 } from '@nanisoft/prism-ui/blocks/faq-01'

const QUESTIONS = [
  {
    id: 'replay',
    question: 'Can a capture be replayed after it fails?',
    answer:
      'Yes. A failed capture is held with its reason and stays replayable for seven days, and the replay reuses the same canonical timestamp so a re-capture does not create a second row.',
  },
  {
    id: 'backfill',
    question: 'How far back can a backfill go?',
    answer:
      'Any minute the upstream venue still serves. In practice that is two years for the daily venues and five weeks for the tick venues, which is their retention rather than ours.',
  },
  {
    id: 'schema',
    question: 'What happens when a venue changes its schema?',
    answer:
      'The ingest is held rather than dropped, the diff is shown against the last good schema, and nothing downstream is written until the mapping is confirmed. See the schema diff page for a worked example.',
  },
  {
    id: 'dedupe',
    question: 'Is a retried run counted twice in the ledger?',
    answer: 'No. A run carries one identity from its first tick, so a retry settles against the same ledger entry.',
  },
]

/** The accordion, which is the default, with the contact control under the last answer. */
export default function Faq01Demo() {
  return (
    <Faq01
      headingLevel="h3"
      eyebrow="Before you ask"
      title="Questions we are asked before every capture"
      description="Four, in the order they are asked. Every answer here is a sentence somebody wrote on purpose."
      questions={QUESTIONS}
      contact={{ label: 'Ask an engineer directly', href: '/contact' }}
    />
  )
}
