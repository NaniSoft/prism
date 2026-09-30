import { Button } from '@nanisoft/prism-ui/components/button'
import { Summary01, type SummaryLine } from '@nanisoft/prism-ui/blocks/summary-01'

/**
 * A summary with all three states on it, which is the fixture that shows why
 * `optional` is a state and not an absence.
 *
 * The four words next to the three states are the four products' vocabularies
 * rather than one, which is the whole argument for `stateLabel`: the same three
 * positions, described the way each of the sites that would install this Block
 * already describes them.
 */
const LINES: SummaryLine[] = [
  {
    id: 'collectors',
    label: 'Market collectors',
    detail: 'One per exchange feed you connect, each reading one session.',
    value: '4 included',
    state: 'included',
    stateLabel: 'In the Scale plan',
  },
  {
    id: 'lakehouse',
    label: 'Lakehouse storage',
    detail: 'Normalised events, retained for thirteen months.',
    value: 'GBP 180.00 per month',
    state: 'included',
    stateLabel: 'In the Scale plan',
  },
  {
    id: 'runners',
    label: 'Agent runners',
    detail: 'Concurrent runners against your connected tool set.',
    value: 'GBP 60.00 each per month',
    state: 'optional',
    stateLabel: 'Billed only if you add one',
    href: '/pricing/runners',
    hrefLabel: 'How runners are priced',
  },
  {
    id: 'sso',
    label: 'Single sign-on',
    detail: 'SAML and OIDC against your own identity provider.',
    value: 'Not available on this plan',
    state: 'excluded',
    stateLabel: 'Held on the Enterprise plan',
  },
]

/**
 * The same shape with a subtotal above the total, so the footer row that has no
 * label of its own is visible rather than described. Prism has no word for a
 * subtotal and would be inventing a claim about the order the figures add up in,
 * so the row above the total is deliberately unlabelled.
 */
const WITH_SUBTOTAL: SummaryLine[] = [
  {
    id: 'base',
    label: 'Scale plan, monthly',
    value: 'GBP 180.00',
    state: 'included',
    stateLabel: 'In the Scale plan',
  },
  {
    id: 'runner',
    label: 'One agent runner',
    value: 'GBP 60.00',
    state: 'optional',
    stateLabel: 'Billed only if you add one',
  },
]

/**
 * A summary with nothing in it, which is a real state rather than a gap: a plan
 * that lists no capabilities is a plan somebody has not written yet, and only the
 * product knows which of the two it is.
 */
const EMPTY: SummaryLine[] = []

export default function Summary01Demo() {
  return (
    <div className="flex flex-col gap-10">
      <Summary01
        headingLevel="h3"
        eyebrow="Nexus"
        title="What the Scale plan includes"
        description="Four lines, three states, and a total the caller states rather than one this Block added up."
        columns={[
          { id: 'line', header: 'Capability' },
          { id: 'state', header: 'Where it stands' },
          { id: 'amount', header: 'What it costs' },
          { id: 'href', header: 'More' },
        ]}
        lines={LINES}
        totalLabel="Due on the first of the month"
        total={{ amount: 180, currency: 'GBP', locale: 'en-GB', maximumFractionDigits: 2 }}
        footnote="Counted per completed run. A run that fails before its first tool call is not counted, and one that is retried is counted once."
        actions={<Button>Start the trial</Button>}
        empty="This plan lists nothing yet."
      />

      <Summary01
        headingLevel="h3"
        eyebrow="Nexus"
        title="A quote with an optional line"
        description="The subtotal row above the total is deliberately unlabelled. Prism has no word for it."
        columns={[
          { id: 'line', header: 'Line' },
          { id: 'state', header: 'State' },
          { id: 'amount', header: 'Amount' },
        ]}
        lines={WITH_SUBTOTAL}
        subtotal={{ amount: 180, currency: 'GBP', locale: 'en-GB', maximumFractionDigits: 2 }}
        totalLabel="Due today"
        total={{ amount: 240, currency: 'GBP', locale: 'en-GB', maximumFractionDigits: 2 }}
        actions={<Button>Accept this quote</Button>}
        empty="Nothing quoted yet."
      />

      <Summary01
        headingLevel="h3"
        eyebrow="Nexus"
        title="A plan with nothing in it"
        columns={[
          { id: 'line', header: 'Capability' },
          { id: 'amount', header: 'What it costs' },
        ]}
        lines={EMPTY}
        totalLabel="Due today"
        total={{ amount: 0, currency: 'GBP', locale: 'en-GB', maximumFractionDigits: 2 }}
        empty="Nothing is listed on this plan yet. Ask us what it will carry before you sign for it."
      />
    </div>
  )
}
