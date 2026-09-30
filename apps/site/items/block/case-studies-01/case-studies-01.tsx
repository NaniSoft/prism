import { CaseStudies01 } from '@nanisoft/prism-ui/blocks/case-studies-01'

/** Three studies in a two-across grid, one with a link and one without. */
export default function CaseStudies01Demo() {
  return (
    <CaseStudies01
      headingLevel="h3"
      eyebrow="Preview"
      title="What it does for a plant that still runs on paper"
      description="Three of them. The results are the same two labels in each, so a reader is comparing answers rather than vocabularies."
      studies={[
        {
          id: 'glassworks',
          customer: 'A glassworks in the west',
          sector: 'Glass',
          summary: 'Two lines, a paper log and a supplier who wanted the same reading every morning before the shift meeting.',
          results: [
            { label: 'Time to a decision', value: '18 min' },
            { label: 'Unplanned stops', value: 'Down 31%' },
          ],
          href: '/work/glassworks',
          hrefLabel: 'Read the glassworks study',
        },
        {
          id: 'canning',
          customer: 'A cannery on the east coast',
          sector: 'Food and drink',
          summary: 'A cold chain that was fine until it was not, and a compliance report written from three spreadsheets.',
          results: [
            { label: 'Time to a decision', value: '41 min' },
            { label: 'Sites observed', value: '6' },
          ],
          href: '/work/cannery',
          hrefLabel: 'Read the cannery study',
        },
        {
          id: 'textile',
          customer: 'A textile mill',
          sector: 'Textiles',
          summary: 'A shift handover that lost a day of context every week, and nobody could say which of the two lines was at fault.',
          results: [
            { label: 'Time to a decision', value: '12 min' },
            { label: 'Coverage', value: 'Whole estate' },
          ],
        },
      ]}
    />
  )
}
