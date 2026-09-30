import { CtaLink } from '@nanisoft/prism-ui'
import { Offering01, type Offering01State } from '@nanisoft/prism-ui/blocks/offering-01'

/**
 * The four state words, in the product's vocabulary rather than the Block's.
 *
 * One object rather than four separate labels, because the prop is a function over
 * the state and the point of the Demo is to show that the caller holds all four
 * words rather than the Block picking one and the caller replacing the other three.
 */
const STATE_WORDS: Record<Offering01State, string> = {
  available: 'In general availability',
  'in-preview': 'Preview, open to twelve named sites',
  'coming-soon': 'Planned and not built yet',
  unavailable: 'Withdrawn in this release',
}

/**
 * The words for the state, given the state.
 *
 * A function rather than a map read at the call site, because the prop is a function
 * and the Demo should not read as though a plain string would do. The fallback is the
 * machine value, which is the honest answer for a state this Demo has never heard of
 * and the wrong answer for one it has, which is exactly why the object is here.
 */
function stateLabel(state: string): string {
  return STATE_WORDS[state as Offering01State] ?? state
}

/**
 * The panel beside the copy, and the second thing the Block never composes.
 *
 * It is the caller's own nodes in a slot, and it is written as the capability's
 * limits rather than as a figure, because the half of a capability page a reader
 * cannot check is the half that says what it will not do. Every word here is this
 * Demo's, which is the whole translation: a storefront's product page says what the
 * item is made of, and this one says what it refuses.
 */
function WillNotDo() {
  return (
    <div className="border-border bg-muted/40 rounded-xl border p-5">
      <p className="text-sm font-semibold">What this connector will not do</p>
      <ul className="text-muted-foreground mt-3 flex flex-col gap-2 text-sm">
        <li>It will not write to a control system. Read access only, and the token it asks for is read only.</li>
        <li>It will not span two sites. One connector is one site and one historian.</li>
        <li>It will not reconcile tag names on its own. It proposes a spelling and a person confirms it.</li>
      </ul>
    </div>
  )
}

/**
 * Two capabilities in full, one of them built and one of them not.
 *
 * The pair is the Demo. A single rendering would show that a capability has a state
 * mark; two show the thing the Block exists for, which is that a capability which
 * has not been built is drawn as a capability which has not been built, with its own
 * words beside it and a neutral tone rather than an alarm or a piece of marketing.
 * The first is the `split` arrangement with the panel beside the copy, and the
 * second is `stacked` with the panel underneath, so both layouts are reachable by
 * changing one prop.
 */
export default function Offering01Demo() {
  return (
    <>
      <Offering01
        headingLevel="h3"
        eyebrow="Connector"
        name="Historian tag normalisation"
        standfirst="Reads the tag hierarchy a control system already writes and gives every reading one spelling."
        state="available"
        stateLabel={stateLabel}
        body={
          <>
            <p>
              A plant names the same tank four ways across four years of historian
              configuration. Nothing is wrong with any of them, and nothing downstream
              can compare two readings of the same asset while that is true.
            </p>
            <p>
              The connector walks the hierarchy the control system already publishes,
              proposes one spelling per node, and records the decision with the run
              that made it. Nothing is rewritten in place, so the site keeps the names
              its own engineers recognise.
            </p>
          </>
        }
        facts={[
          { id: 'sources', label: 'Sources per site', value: 'One historian' },
          { id: 'depth', label: 'Tag depth supported', value: '8 levels' },
          { id: 'refresh', label: 'Refresh interval', value: 'Every 15 minutes' },
          { id: 'access', label: 'Access required', value: 'Read only' },
        ]}
        price={{ amount: 180, currency: 'GBP', locale: 'en-GB', period: 'per site, per month' }}
        priceNote="Billed monthly, and the connector is removed rather than suspended when a plan ends."
        availability={{
          label: 'Rollout',
          value: 'Generally available',
          note: 'Two named customers are still on the pilot build and are moved over on request.',
        }}
        actions={
          <>
            <CtaLink href="/connectors/historian-tags">Read the connector note</CtaLink>
            <CtaLink href="/contact" variant="outline">
              Ask an engineer
            </CtaLink>
          </>
        }
        aside={<WillNotDo />}
        layout="split"
      />

      <Offering01
        headingLevel="h3"
        eyebrow="Capture source"
        name="Order book reconstruction"
        standfirst="Reconstructs the visible depth of a venue's book from the trades the exchange publishes."
        state="coming-soon"
        stateLabel={stateLabel}
        body={
          <p>
            We have run this against four venues&apos; public trade feeds for a year and
            the numbers do not yet agree with what a broker tells us on the phone. The
            connector ships when they do, and this page says so rather than leaving
            the capability off.
          </p>
        }
        facts={[
          { id: 'venues', label: 'Venues measured', value: '4' },
          { id: 'agreement', label: 'Agreement with broker mid', value: 'Not yet demonstrated' },
        ]}
        availability={{
          label: 'Availability',
          value: 'A named design partner list, not yet open',
          note: 'Write to us if the reconstruction is the thing standing between you and a pilot.',
        }}
        actions={
          <CtaLink href="/contact" variant="outline">
            Ask to be a design partner
          </CtaLink>
        }
        aside={
          <div className="border-border rounded-xl border border-dashed p-5">
            <p className="text-muted-foreground text-pretty text-sm">
              There is no screenshot here and that is deliberate. A figure of a
              reconstruction we cannot yet stand behind is the one thing this Block
              exists to stop a product page from showing.
            </p>
          </div>
        }
        layout="stacked"
      />
    </>
  )
}
