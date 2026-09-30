import { CaseStudy01 } from '@nanisoft/prism-ui/blocks/case-study-01'

/**
 * One invented customer, one invented quotation and four invented figures.
 *
 * **Nothing here is real, and every one of those is a claim this repository
 * cannot make.** A case study demo is the most dangerous thing a documentation
 * site can render by accident: the arrangement under a heading says "this
 * happened to a customer", and a real customer name under a real figure would be
 * a representation about a third party made without their agreement and published
 * to everyone who reads this page. So the customer, the sector, the quotation and
 * every number are invented, and the figures are shaped rather than meaningful: a
 * percentage, a count and a duration, so the reader can see that `Metric` prints
 * a bare number rather than attaching a unit to it.
 *
 * The quotation is written to be obviously fictional and the person is given a
 * role and a surname rather than a full name, because the point of the demo is the
 * `figure` and its `quoteLabel`, not the attribution.
 */
export default function CaseStudy01Demo() {
  return (
    <CaseStudy01
      headingLevel="h3"
      eyebrow="Case study"
      layout="stacked"
      customer="Northbank Clearing"
      sector="Clearing"
      summary="Nightly reconciliation moved from three spreadsheets and a person to a run that reports its own failures."
      problem={
        <>
          <h3>The problem</h3>
          <p>
            Three teams reconciled the night book by hand, in the order their own
            spreadsheets happened to be in, and nobody could say at nine in the
            morning which of them had finished.
          </p>
        </>
      }
      approach={
        <>
          <h3>What was done</h3>
          <p>
            The reconciliations became reads over one captured estate, each one a
            step with a stated tolerance, and a run that did not finish reported
            itself rather than finishing quietly.
          </p>
        </>
      }
      results={[
        {
          label: 'Reconciliation time',
          value: '4 min',
          delta: -0.86,
          hint: 'Median over 30 nights',
        },
        { label: 'Unmatched lines', value: '11' },
        { label: 'Days to a full estate', value: '9' },
      ]}
      quote={{
        quote: 'We found out on a Monday that it had stopped. That was the whole change.',
        name: 'A. Mensah',
        role: 'Operations',
      }}
      quoteLabel="In their words"
    />
  )
}