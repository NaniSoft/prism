import { Awards01 } from '@nanisoft/prism-ui/blocks/awards-01'

/**
 * Three recognitions, one of them undated in shape rather than in fact.
 *
 * **The bodies here are invented and the years are plausible, and that is the
 * point.** A demo of an awards list is a demo of a public record, and a record
 * naming a real awarding body for a work that does not exist is the same defect
 * the `LogoCloud01` demo was written to avoid: every reader of the documentation
 * site, including a competitor, would take it as published fact.
 *
 * The first row is linked and carries a category, so the anchor arm and the
 * badge are both visible. The second is unlinked and uncategorised, which is what
 * most rows in a real list look like. The third exists so the cards arrangement
 * can be reached by editing one prop, which is the point of the demo being one
 * component rather than two.
 */
export default function Awards01Demo() {
  return (
    <Awards01
      headingLevel="h3"
      title="Recognition"
      description="The year is required, and it is drawn in the mono face beside the body that gave it."
      awards={[
        {
          id: 'ardent-2025',
          body: 'Settlement Reconciliation Platform',
          organisation: 'Ardent Clearing Awards',
          year: '2025',
          category: 'Infrastructure',
          href: 'https://awards.example/ardent-2025',
        },
        {
          id: 'pelham-2024',
          body: 'Observer Toolkit For Long Running Pipelines',
          organisation: 'Pelham Registry',
          year: '2024',
        },
        {
          id: 'quarry-2023',
          body: 'Market Reading, Reviewed By Two Analysts',
          organisation: 'Quarry Lane Review Board',
          year: '2023',
          category: 'Practice',
        },
      ]}
    />
  )
}