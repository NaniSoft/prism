import { Button } from '@nanisoft/prism-ui/components/button'
import { CtaLink } from '@nanisoft/prism-ui/components/cta-link'
import { RelativeTime } from '@nanisoft/prism-ui/components/relative-time'

import { Account01, type Account01State } from '@nanisoft/prism-ui/blocks/account-01'

/**
 * The regions and surfaces one account spans.
 *
 * Every state on show at once, because the point of the Demo is the tone fallback:
 * `degraded` and `active` are the two words the table holds, and the two English
 * words the table does not hold are drawn in the supporting ink with the Demo's own
 * words beside them rather than in the alarm colour. The value is on the row as
 * `data-state`, so a reader of this page can see which ones need mapping.
 */
const REGIONS: Account01State[] = [
  {
    id: 'capture',
    name: 'Capture estate, Frankfurt',
    state: 'degraded',
    stateLabel: 'Running, with two batches rejected overnight',
    detail: '1.2 million rows held, last reconciled at 04:11.',
  },
  {
    id: 'pipeline',
    name: 'Pipeline',
    state: 'active',
    stateLabel: 'Running, every collector reporting',
  },
  {
    id: 'inbox',
    name: 'Review inbox',
    state: 'backlog',
    stateLabel: 'Eleven items waiting on a person',
    detail: 'A state this table does not hold, so it is drawn in the supporting ink.',
  },
  {
    id: 'scim',
    name: 'Directory sync',
    state: 'paused',
    stateLabel: 'Paused by an administrator on the 12th',
  },
]

/** The three facts a record reader checks first. */
const FACTS = [
  {
    id: 'since',
    label: 'Customer since',
    value: <RelativeTime date="2024-03-11T00:00:00Z" />,
  },
  { id: 'region', label: 'Billing region', value: 'United Kingdom' },
  { id: 'owner', label: 'Account owner', value: 'Bo Lindqvist' },
  { id: 'terms', label: 'Payment terms', value: '30 days from invoice' },
]

/** An account record, and the same record in the split arrangement. */
export default function Account01Demo() {
  return (
    <div className="flex flex-col gap-12">
      <Account01
        headingLevel="h3"
        eyebrow="Nexus"
        name="Northgate Estates"
        kind="customer"
        kindLabel="Paying customer on annual terms"
        reference="NX-CUS-004471"
        facts={FACTS}
        balance={{
          label: 'Owes on the current invoice',
          value: { amount: 1204.6, currency: 'GBP', locale: 'en-GB' },
          note: (
            <>
              Invoice{' '}
              <CtaLink href="/billing/invoices/2026-0417" variant="ghost" size="sm">
                2026-0417
              </CtaLink>
              , issued on the 1st, due on the 31st.
            </>
          ),
        }}
        plan={{
          name: 'Pipeline, annual',
          detail: 'Renews on the 11th of March. Four agents included, metered runs after that.',
          href: '/plans/pipeline',
          hrefLabel: 'Read what the plan includes',
        }}
        states={REGIONS}
        controls={
          <>
            <Button type="button" variant="outline" size="sm">
              Open the account
            </Button>
            <Button type="button" variant="ghost" size="sm">
              Raise a support case
            </Button>
          </>
        }
      />

      <Account01
        headingLevel="h3"
        eyebrow="Nexus"
        name="Northgate Estates"
        kind="customer"
        kindLabel="Paying customer on annual terms, invoiced in sterling on 30 day terms"
        reference="NX-CUS-004471"
        layout="split"
        facts={FACTS}
        balance={{
          label: 'Owes on the current invoice',
          value: { amount: 1204.6, currency: 'GBP', locale: 'en-GB' },
        }}
        plan={{ name: 'Pipeline, annual' }}
        states={REGIONS.slice(0, 2)}
        activity={
          <ul className="border-border flex flex-col border-t text-sm">
            <li className="border-border border-b py-2">The October invoice was issued on the 1st.</li>
            <li className="border-border border-b py-2">Two capture batches were rejected overnight and requeued.</li>
            <li className="border-border border-b py-2 last:border-b-0">
              The agent triage agent was paused by an administrator.
            </li>
          </ul>
        }
      />

      <Account01
        headingLevel="h3"
        eyebrow="Nexus"
        name="Halberd Logistics"
        kind="trial"
        kindLabel="Trial, no plan on file, and nothing owed yet"
        reference="NX-CUS-009120"
      />

      {/*
        The last two Demos have no `description` prop, and the absence is the shape:
        the section heading's supporting line is `kindLabel`, because a record's
        second line is what kind of account it is and not a sentence about the
        component that drew it.
      */}
    </div>
  )
}
