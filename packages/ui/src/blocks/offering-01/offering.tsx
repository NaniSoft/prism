import type { ReactNode } from 'react'

import { FactList, type Fact } from '../../components/ui/fact-list'
import { Price, type PriceProps } from '../../components/ui/price'
import { Section, SectionHeading, type HeadingLevel } from '../../components/ui/section'
import { Status, type StatusTone } from '../../components/ui/status'
import { cn } from '../../lib/utils'

/**
 * The four states a capability can be in, and the set is closed.
 *
 * A capability here is a thing the product offers: a capture source, an agent, a
 * connector, a tier. What a page has to say about one of those is not a binary. A
 * connector that exists and runs is one thing. A connector a named set of customers
 * can turn on today is a second. A connector on the roadmap is a third, and it is a
 * real answer rather than an absence, because a product that ships it will have it
 * and a reader who is told nothing has to guess whether it does not exist or is
 * merely unannounced. A connector that has been withdrawn is the fourth.
 *
 * **The closure is the argument and it is the reason this Block is a separate Item
 * from `Showcase01`.** `Showcase01` shows what a product does, and it has no state
 * prop at all, which is right for it: a showcase is evidence, and evidence of
 * something unbuilt is a picture of a mock. This Block shows what a product plans
 * to do as well as what it does, and a design system that offered only available
 * and unavailable would leave a consumer with two bad options for a roadmap item.
 * They could leave the state off, and then the capability would render as built,
 * which is the one thing a product page must never do. Or they could leave it out
 * of the page, and then the roadmap would be a slide nobody can find. So the
 * honest answers are in the type, and `coming-soon` is a first-class member
 * rather than the gap between the two members everybody ships.
 *
 * The cost is real and worth naming. A closed set is a set a product eventually
 * outgrows, and the escape is the type on the other Block that takes an open
 * string: `OfferingList01` maps an unknown state to the tone that asserts nothing
 * and takes the words from the caller, because a list of forty rows cannot afford a
 * type that refuses a row. The difference between the two is the count. One
 * capability in depth can be given a closed set and a diagnostic; forty rows on a
 * catalogue page cannot, and the two answers are both correct for their own scale.
 */
export type Offering01State = 'available' | 'in-preview' | 'coming-soon' | 'unavailable'

/**
 * The tone each state is drawn in, mapped rather than passed.
 *
 * `Status` owns the five tones and refuses to pick one, for the reason its own
 * JSDoc states: a status is asked for far more often than a meter and for smaller
 * things, so a Component that coloured itself would be making a claim about the
 * caller's product with the least evidence. This Block has more to go on than a
 * status mark does, which is why it maps rather than refuses, and the mapping is
 * the judgement stated rather than hidden:
 *
 * - `available` is `success`, because a capability that runs is the good news and
 *   the dot should look like it.
 * - `in-preview` is `info`, not `warning`. A preview is the ordinary state of a
 *   capability between built and trusted, and painting it as a caution would teach
 *   readers to ignore the colour. `Compliance01` makes the same call for
 *   `in-progress` and gives the same reason.
 * - `coming-soon` is `neutral`, and this is the one worth stopping on. A roadmap
 *   item is not an alarm, and `Status` says `neutral` is the tone for a state with
 *   nothing to alarm about, which is exactly what a plan is. The alternative was
 *   `info`, which reads as though something is happening now, and `warning`, which
 *   reads as though something is wrong. A neutral dot beside a caller's own words
 *   is the honest shape: nothing is happening yet, and here is what it will be.
 * - `unavailable` is `destructive`, and it is the only member that takes an alarm
 *   tone. A withdrawn capability is the one state on this Block a reader may have
 *   to act on, because the reader may be holding a page that depends on it.
 */
const STATE_TONE: Record<Offering01State, StatusTone> = {
  available: 'success',
  'in-preview': 'info',
  'coming-soon': 'neutral',
  unavailable: 'destructive',
}

/**
 * One limit of a capability: what is measured, and what the answer is.
 *
 * `label` is a string rather than a node, for `FactList`'s reason: a column of
 * terms is read by scanning the left edge, and a term that wraps to two lines
 * costs every other row its alignment. `value` is a node because the answers on a
 * capability page are not all strings: a figure the caller formatted, a
 * `RelativeTime`, a `CodeBlock` for the identifier a support request needs.
 */
export type Offering01Fact = {
  /** The limit's stable key, so a caller can address one row by name. */
  id: string
  /** What is measured, in the product's own words. */
  label: string
  /** The answer. A string, or any node a caller composes. */
  value: ReactNode
}

/**
 * One availability reading: a name, a value, and the caveat beside it.
 *
 * Availability is not the same fact as the state. The state says whether the
 * capability can be turned on at all; this says what turning it on depends on, or
 * how far the rollout has got, or which regions it covers. They change on different
 * clocks and they answer different questions, which is why they are two props and
 * not one.
 */
export type Offering01Availability = {
  /** What the reading is about. The caller's words, because the fact is theirs. */
  label: string
  /** The reading itself. */
  value: ReactNode
  /** The caveat that qualifies the reading, for the sentence that is not the number. */
  note?: ReactNode
}

/**
 * The props an Offering01 takes.
 *
 * Every string, every figure, every state word and every availability reading is a
 * prop and the Block ships none. There is no capability in this package, no default
 * state, no sample specification and not one word of a rollout note: the set of
 * things a product offers is the product's own fact, and a Block that shipped one
 * would be publishing somebody else's roadmap.
 */
export type Offering01Props = {
  /** Optional label above the capability's name. It has no default. */
  eyebrow?: string
  /**
   * The capability's own name, set at the section's heading step.
   *
   * A string and not a node, for `Showcase01`'s reason: this is the one heading in
   * this system that names a single proper noun rather than making a claim in
   * prose, so there is no emphasised word inside it to set in a caller's mark. A
   * caller whose name is a phrase and needs a claim beside it writes the claim in
   * `standfirst`.
   */
  name: string
  /**
   * The standfirst: the sentence under the name that says what the capability is
   * for.
   *
   * Optional rather than required, because a name that is self-describing needs no
   * gloss, and a gloss that repeats the name is worse than no gloss. It is a node
   * because the same four NaniSoft sites set part of this line in their own mark.
   */
  standfirst?: ReactNode
  /** The prose under the standfirst, for the argument the name cannot carry. */
  body?: ReactNode
  /** The capability's limits, as the caller's own facts. See `Offering01Fact`. */
  facts?: readonly Offering01Fact[]
  /**
   * What the capability costs.
   *
   * `PriceProps` rather than an amount and a currency, so the figure goes through
   * the platform's own formatter with the locale, the precision and the period the
   * caller chose. The cost of composing rather than owning is stated in `Price`'s
   * own note: a server Component constructs a formatter per request rather than one
   * at build, and a page that prints a thousand prices constructs a thousand of
   * them. A consumer with prices on a hot path caches the formatter, which is a
   * better place for that knowledge than a design system.
   */
  price?: PriceProps
  /** The line under the price: the billing period, the caveat, the commitment. */
  priceNote?: ReactNode
  /** What state the capability is in. See `Offering01State`. */
  state?: Offering01State
  /**
   * The words for the state, in the product's own vocabulary.
   *
   * Required whenever `state` is given, and the run throws without one. The reason
   * is `Status`'s reason and it is not softened here: a status with no words is a
   * coloured dot, invisible to a reader who cannot separate the tones and unreadable
   * to a screen reader whatever the tones are. It is a function and not a string
   * because one function covers all four states, which is what `FieldMap01` and
   * `Project01` do, and because the words for a state are frequently a sentence
   * rather than a word: "available to twelve named sites" and "generally available"
   * are both one state and neither is a term anybody can map onto a label.
   */
  stateLabel?: (state: string) => string
  /** What turning the capability on depends on. See `Offering01Availability`. */
  availability?: Offering01Availability
  /** The actions that belong to this capability rather than to the page. */
  actions?: ReactNode
  /** The panel beside the copy: the evidence, the figure, or the caveat list. */
  aside?: ReactNode
  /**
   * Whether the aside sits beside the copy or under it.
   *
   * A layout prop rather than a `className`, for `Showcase01`'s reason: swapping
   * the panel from one side to the other is a composition decision a page makes
   * repeatedly, and re-deriving it from utility classes at each call site is how a
   * page ends up with two panels on opposite sides and no reason why. The copy is
   * first in the markup on both arrangements, so a reader who never reaches the
   * panel has still read everything the section claims.
   *
   * @defaultValue 'split'
   */
  layout?: 'stacked' | 'split'
  /**
   * Heading level for the capability's name.
   *
   * Defaults to `h2` because a Block is composed, not a page. See `HeadingLevel`.
   */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Block. Changing a Prism-owned visual property
   * from here is prohibited.
   */
  className?: string
}

/**
 * One capability in full, with the state that says whether it can be turned on.
 *
 * **The storefront version of this pattern is a single-product page, and the
 * translation is the whole of the difference.** What that page publishes is an item
 * for sale: a name, a paragraph about it, a table of specifications, a price, a
 * stock reading, and a button that adds it to a basket. Every part of the layout
 * and every part of the accessibility work transfers without a change, because a
 * specification is a description list whichever thing it describes and a stock
 * reading is a status whichever thing is being stocked. What does not transfer is
 * the noun. The thing on the page here is a capability the product offers: a
 * capture source, an agent, a connector, a tier. It is not for sale, it is not in a
 * basket, and the action at the bottom of the page is a decision rather than a
 * transaction. So the slot shapes are the storefront's and the subject is not, and
 * the reading of the state mark is the part that had to be re-thought rather than
 * renamed: on a shop, "out of stock" is the only thing a reader has to be told,
 * and on a product page a capability that is planned, or in preview, or withdrawn
 * is a different fact each with different consequences for the person reading.
 *
 * **A capability that is not built yet is a first-class state here, and that is
 * what this Block exists to say.** The reason it is a separate Item from
 * `Showcase01` is exactly this: a showcase shows what a product does, and this one
 * shows what a product plans to do as well. A design system that offered only
 * available and unavailable would leave a consumer with two bad options for a
 * roadmap item, and both of them are wrong. Drop the state and the capability
 * renders exactly as a built one does, which is the one thing a product page must
 * never do, because a reader who believes a connector exists will plan an estate
 * around it. Leave the capability off the page and the roadmap becomes a slide
 * nobody can find and nobody can link to. So `coming-soon` is in the type, it is
 * drawn in the neutral tone rather than the information tone, and the words beside
 * it are required, because "Planned" and "Shipping in the March release" are two
 * different promises and only the product knows which one it made.
 *
 * **The four states are a closed set and the words are not, and the difference is
 * worth stating because it looks like an inconsistency.** The state chooses the
 * tone from four, so this Block can colour a capability without asking. The
 * `stateLabel` function is the caller's, so the reader reads the product's own
 * vocabulary rather than this package's. `Status` makes the same split at the
 * Component layer and refuses to pick a tone at all; here the Block picks it
 * because a single capability in depth is a fact about one thing and can afford a
 * type that says which four answers exist. The Block that cannot afford it is
 * `OfferingList01`, which takes the state as an open string and maps it by
 * guessing, because a catalogue of forty rows must not refuse to render a row whose
 * state this package has not heard of. Two answers, each right at its own scale,
 * and the difference between them is the count of rows.
 *
 * **The specification is `FactList` and the panel is an `aside`, and neither is
 * re-derived here.** `FactList` is a real `<dl>` with the term before its answer,
 * which is what a specification is and what a table of key and value cells is not:
 * a screen reader announces the term before the answer in one and reads two columns
 * of equal weight in the other. Re-deriving it would put a second answer to "how
 * does a specification read" in one package, and the second answer is always the
 * one that disagrees. The `aside` is complementary content and says so to assistive
 * technology without a `role`, which is the reason it is the element rather than a
 * second column.
 *
 * **The price composes `Price` and the Block adds no currency, no period and no
 * precision.** The size is `lg` and it is the Block's choice rather than the
 * caller's, because a single capability in depth is the one place on a marketing
 * site where the price is a headline figure beside the name and nothing else on
 * the page competes with it. The caller who wants it quieter composes `Price` in
 * the `actions` slot or beside the Block instead, which is the answer
 * `Showcase01`'s own note gives about prices.
 *
 * **The heading is aligned left.** `SectionHeading` states the rule and this
 * section has a body, a specification, a price and a panel under the name, so there
 * is content and the answer is left.
 *
 * It composes `Section` and `SectionHeading`, so it inherits the container and the
 * vertical rhythm rather than re-deriving either, and it adds no container width
 * and no section padding of its own.
 *
 * It is a server Component: no hook, no state, no client code and no motion. It
 * takes a function prop, which a server parent can pass and a client parent cannot
 * hand down without its own boundary; `FieldMap01` and `Project01` take function
 * props the same way, and a consumer who needs this Block inside a client tree
 * wraps it in their own client module rather than patching this one.
 */
export function Offering01({
  eyebrow,
  name,
  standfirst,
  body,
  facts,
  price,
  priceNote,
  state,
  stateLabel,
  availability,
  actions,
  aside,
  layout = 'split',
  headingLevel = 'h2',
  className,
}: Offering01Props) {
  if (state !== undefined && stateLabel === undefined) {
    throw new Error(
      'Offering01: the capability declares a state and no stateLabel, so the state would be a coloured dot ' +
        'with nothing to read beside it, which is invisible to a reader who cannot separate the tones and ' +
        'unreadable to a screen reader whatever the tones are. Pass the words your product uses for that ' +
        'state; this Block will not choose between preview and private preview, and it will not print the ' +
        'machine value into a product page.',
    )
  }

  /*
   * The caller's facts, in the shape `FactList` draws. The mapping is one line and
   * it is the reason this Block takes its own `Offering01Fact` rather than
   * importing `Fact`: a fact in a list of capabilities is keyed, because a caller
   * assembling forty of them outside JSX has to name each row to type the array,
   * and `Fact` has no key. `FactList` needs no key of its own because a
   * definition list is not a keyed collection.
   */
  const specification: Fact[] = (facts ?? []).map((fact) => ({
    label: fact.label,
    value: fact.value,
  }))

  return (
    <Section data-slot="offering-01" className={className}>
      <div
        data-slot="offering-01-body"
        data-layout={layout}
        className={cn(
          'grid items-start gap-10',
          // One column when there is no panel, and one column when the caller asked
          // for the panel underneath, so the two arrangements differ by the track
          // rather than by the order in the markup. The copy stays first in the DOM
          // either way, which is what makes the reading order the same on both.
          aside === undefined ? null : layout === 'split' ? 'lg:grid-cols-2 lg:gap-16' : 'lg:gap-12',
        )}
      >
        <div data-slot="offering-01-copy" className="flex min-w-0 flex-col gap-8">
          <SectionHeading
            as={headingLevel}
            align="left"
            eyebrow={eyebrow}
            title={name}
            description={standfirst}
          />

          {/*
            The state, immediately under the name rather than beside it, because the
            state is the answer to the question the name raises and a reader who has
            to hunt for it will assume the good case. The tone comes from the closed
            set above; the words are the caller's and the run has already refused to
            render without them.
          */}
          {state === undefined || stateLabel === undefined ? null : (
            <div data-slot="offering-01-state">
              <Status tone={STATE_TONE[state]} label={stateLabel(state)} />
            </div>
          )}

          {body === undefined ? null : (
            <div
              data-slot="offering-01-prose"
              className="text-muted-foreground flex max-w-measure flex-col gap-4 text-pretty"
            >
              {body}
            </div>
          )}

          {/*
            The specification, after the prose and before the price, which is the
            order a reader of a product page works in: what it is, what it does, what
            it will not do, what it costs. `FactList` renders nothing at all for an
            empty list, so a capability with no limits does not get an empty frame
            between its argument and its price.
          */}
          <FactList facts={specification} />

          {price === undefined ? null : (
            <div data-slot="offering-01-price" className="flex flex-col gap-2">
              <Price {...price} size="lg" />
              {priceNote === undefined ? null : (
                <p className="text-muted-foreground text-pretty text-sm">{priceNote}</p>
              )}
            </div>
          )}

          {availability === undefined ? null : (
            <div
              data-slot="offering-01-availability"
              className="border-border bg-muted/40 flex flex-col gap-1 rounded-lg border px-4 py-3"
            >
              <span
                data-slot="offering-01-availability-label"
                className="text-muted-foreground text-xs font-medium tracking-wide uppercase"
              >
                {availability.label}
              </span>
              <span data-slot="offering-01-availability-value" className="text-sm font-medium">
                {availability.value}
              </span>
              {availability.note === undefined ? null : (
                <span
                  data-slot="offering-01-availability-note"
                  className="text-muted-foreground text-pretty text-xs"
                >
                  {availability.note}
                </span>
              )}
            </div>
          )}

          {actions === undefined ? null : (
            <div data-slot="offering-01-actions" className="flex flex-col gap-3 sm:flex-row">
              {actions}
            </div>
          )}
        </div>

        {/*
          The panel. An `aside`, so assistive technology is told it is
          complementary rather than a second copy of the content, and drawn after the
          copy in the markup on both arrangements so the reading order never depends
          on which side it landed.
        */}
        {aside === undefined ? null : (
          <aside data-slot="offering-01-aside" className="min-w-0">
            {aside}
          </aside>
        )}
      </div>
    </Section>
  )
}

export default Offering01
