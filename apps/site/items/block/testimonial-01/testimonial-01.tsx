import { Testimonial01 } from '@nanisoft/prism-ui/blocks/testimonial-01'

/** Two quotes, one with a company and one with only a role. */
const QUOTES = [
  {
    id: 'capture',
    quote:
      'We replaced a nightly job and four spreadsheets with one scheduled capture. The part that sold the team was the replay: when a venue goes down, we re-run the minute rather than argue about whether we have it.',
    name: 'Ines Ravel',
    role: 'Head of Market Data',
    company: 'Ardent Clearing',
    companyUrl: 'https://example.com/ardent-clearing',
    avatar: { name: 'IR' },
  },
  {
    id: 'estate',
    quote:
      'The estate view is the first thing our operators open. It answers the only question that matters at eight in the morning, which is what changed while nobody was watching.',
    name: 'Tomas Beck',
    role: 'Staff engineer',
    avatar: { name: 'TB' },
  },
]

/** The pair form, which is two columns and one column on a narrow screen. */
export default function Testimonial01Demo() {
  return (
    <Testimonial01
      headingLevel="h3"
      eyebrow="In use"
      title="Two operators, two different reasons"
      description="Neither quote is a headline. The second speaker has a role and no company, which is why the two are separate fields."
      quotes={QUOTES}
      format="pair"
    />
  )
}
