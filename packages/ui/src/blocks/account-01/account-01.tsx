import type { ReactNode } from 'react'

import { CtaLink } from '../../components/ui/cta-link'
import { FactList } from '../../components/ui/fact-list'
import { Price, type PriceProps } from '../../components/ui/price'
import {
  Section,
  SectionHeading,
  type HeadingLevel,
} from '../../components/ui/section'
import { Separator } from '../../components/ui/separator'
import { Status, type StatusTone } from '../../components/ui/status'
import { cn } from '../../lib/utils'

/**
 * Where one region or one surface of an account stands, and the tone each position
 * is drawn in.
 *
 * **Five entries against a `Record<string, StatusTone>`, and the shape is
 * `ProjectList01`'s argument with the union dropped.** The alternative would have
 * been the closed union every other Block takes, and it is wrong here for a
 * specific reason rather than a general one: an account's regions and surfaces are
 * not a fixed list, they are whatever the product has, and a product whose
 * surfaces are `capture`, `pipeline`, `inbox` and `mcp` has four positions that no
 * union of account states can be derived from. So the table is keyed on the
 * caller's own strings, a caller whose vocabulary happens to be these five words
 * gets the mapping for free, and a caller whose is not maps the rest.
 *
 * The cost is stated rather than hidden, and it is the cost `ProjectList01` names:
 * a value this table does not hold is drawn in `neutral`, which is a dot in the
 * supporting ink with the caller's words beside it, and a caller whose states
 * include a failure has to map that one or the failure looks like nothing. The
 * fallback is visible in the markup as the state value on the row, so a consumer
 * reading their own page can see which states need mapping rather than guessing,
 * and it is `neutral` rather than the alarm colour because a naming mismatch is not
 * an emergency and a table of red rows is a table nobody reads.
 */
const DEFAULT_TONE: Record<string, StatusTone> = {
  active: 'success',
  degraded: 'warning',
  suspended: 'info',
  closed: 'neutral',
}

/**
 * The tone a state is drawn in, falling back to the supporting ink.
 *
 * One function rather than an inline lookup at the call site, because a Block that
 * spelled `DEFAULT_TONE[state] ?? 'neutral'` in three places would be three chances
 * to spell it once wrong, and because the fallback is a decision with a reason and
 * a reason belongs next to the code that makes it.
 */
function toneOf(state: string): StatusTone {
  return DEFAULT_TONE[state] ?? 'neutral'
}

/**
 * One fact about an account, as a record states it: the term and the answer.
 *
 * A node of its own rather than a re-export of `Fact`, and the reason is the one
 * `UserProfile01Fact` gives: `Fact` is four fields and this record has two of them.
 * A re-export would put an `href` and a `newTab` on a type whose only drawing is a
 * definition list with no anchor in it, and a caller reading the type would
 * reasonably expect those two to do something. The cost is that a caller whose
 * fact value is a destination composes `FactList` themselves rather than passing
 * it here, and that is the honest answer because the destination is a decision
 * about their own routes rather than a fact about an account.
 */
export type Account01Fact = {
  /**
   * The caller's stable key for this fact.
   *
   * Required, because an account's facts are very often assembled from a store the
   * caller already keys, and re-deriving a key here would be a second identity for
   * one value. It is not drawn and it is not on the markup: `FactList` owns the row
   * and keys it by position, so a caller whose facts reorder between renders and who
   * needs row identity composes `FactList` directly. That is the cost and it is a
   * small one.
   */
  id: string
  /**
   * The term that names the fact.
   *
   * A short noun phrase, because a column of these is read by scanning its left
   * edge and a term that wraps to two lines costs the whole column its alignment. A
   * `string` rather than a node, for the same reason `Fact`'s own `label` is scanned
   * rather than read.
   */
  label: string
  /**
   * The answer.
   *
   * A node, and the reason is that an account's answers are not all the same kind
   * of thing: a date is a `RelativeTime`, a region is a place, a count is a figure
   * the caller has already formatted in their own locale, and a contract number is
   * something this Block must not set in a mono face on the caller's behalf because
   * it does not know what a contract number looks like in their product.
   */
  value: ReactNode
}

/**
 * What one region or one surface of the account is doing, and what a reader needs to
 * know about it.
 *
 * **`state` is the caller's own string and not a closed union, and that is the one
 * place this Block refuses the pattern every other one follows.** An account's
 * regions and surfaces are not a fixed list, so a union would be a Block deciding
 * what an account may be in, which is precisely the decision a record is least
 * entitled to make. The tone comes from a table this file holds and the caller can
 * map the rest into, and the words are the caller's whatever the words are. See
 * `DEFAULT_TONE` for the whole of that argument and the cost of the fallback.
 */
export type Account01State = {
  /**
   * A stable key for the row, carried on the markup as `data-state-row` so a test
   * can name one region rather than the first.
   */
  id: string
  /**
   * What the region or surface is called, in the product's own words.
   *
   * A `string`, and it is the row's identity rather than its heading. See the
   * Block's JSDoc for why a region is not a heading on this surface, which is a
   * decision and not an omission.
   */
  name: string
  /** Where it stands, as the product's own machine value. */
  state: string
  /**
   * The words for the state, in the product's own vocabulary.
   *
   * Required whenever a row is drawn, and a thrown diagnostic rather than a silent
   * absence, for the reason `Status` states in full: the tone is a colour and the
   * words are the information, and a state with no words is a coloured dot, which is
   * invisible to a reader who cannot separate the tones and unreadable to a screen
   * reader whatever the tones are. Falling back to `state` would print a machine
   * value into a record a reader may have to show to somebody else.
   */
  stateLabel?: string
  /**
   * One line about this region or surface, in the caller's own words: what it is
   * holding, which region it is in, when it was last reconciled.
   *
   * A node, because half of the useful sentences in this position carry a link to
   * the thing they are about, and a caller who has to flatten theirs to a string
   * loses it.
   */
  detail?: ReactNode
}

/**
 * What the account owes, or what it is worth, and the note that qualifies it.
 *
 * `value` is a `PriceProps` and not a number and a symbol, for the argument
 * `RateCard01` makes at length: a symbol says the currency and nothing else, while
 * an amount also has a currency code, a precision, a period and a locale, and `Intl`
 * already knows all four.
 */
export type Account01Balance = {
  /** What the amount is, read under it. */
  label: string
  /** The amount itself, and everything about how it is written. See `value`. */
  value: PriceProps
  /**
   * The line under the figure: the period it covers, the credit note against it,
   * the date it is due.
   *
   * A node, because the useful sentence here is usually a link to the invoice it
   * came from.
   */
  note?: ReactNode
}

/**
 * What the account is on, and where the terms of that plan are.
 *
 * A `name` and an optional detail rather than a price, and the reason is that a
 * price belongs in `balance`, which is a figure: a plan is a name a reader
 * recognises and a balance is what they owe, and a Block that drew the plan's
 * price next to the plan's name would be restating a figure the caller has already
 * put somewhere else.
 */
export type Account01Plan = {
  /** The plan's own name, as the product writes it. */
  name: string
  /**
   * One line about what the plan includes or when it renews, in the caller's own
   * words.
   */
  detail?: ReactNode
  /** Where the full terms are kept. */
  href?: string
  /**
   * The words on the link, and required whenever `href` is.
   *
   * A link whose only words are the plan's own name tells a reader nothing about
   * what following it does, which is the same defect `ResourceList01` refuses and
   * for the same reason: the destination is a route in the caller's own
   * application and only the caller knows what is behind it.
   */
  hrefLabel?: string
}

/**
 * The props an Account01 takes.
 *
 * Every string is a prop and the Block ships none: no account, no name, no kind, no
 * reference, no fact, no plan, no balance, no state word and not one of the two
 * sentences an account surface is most tempted to ship. The absence of the account
 * itself is the sharpest version of the rule, because a record drawn with a name in
 * it is the single easiest thing in this package to write by accident and the
 * single most likely to be somebody else's customer.
 */
export type Account01Props = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: string
  /**
   * The account's own name, and required.
   *
   * It is the section heading rather than a line inside the body, which is the
   * decision the rest of this Block follows from and the reason is the same one
   * `UserProfile01` and `Project01` give: a page whose only subject is one record is
   * a page a reader reaches by following a link and navigates away from by heading,
   * so a name in a `span` is a name they cannot come back to.
   */
  name: string
  /**
   * What kind of account it is, in the product's own words: a customer, a
   * subscriber, a partner, a trial.
   *
   * Required, and drawn as the supporting line under the name rather than as a
   * fact, because the kind is the answer to the question a reader arrives with and
   * everything in `facts` is the answer to a question they did not know to ask. A
   * `string` and not a node because a kind is a short noun phrase in a product's own
   * vocabulary and there is nothing in it to emphasise.
   */
  kind: string
  /**
   * The words for the kind, when the machine value is not the sentence a reader
   * should read.
   *
   * Optional, and its absence is not a fault: `kind` is already a caller's string.
   * It exists for the other direction, where a record holds a stable value and the
   * reader needs a name beside it.
   */
  kindLabel?: string
  /**
   * The system's own identifier for the account, such as a customer number or a
   * contract reference.
   *
   * Drawn in the mono face for the reason `SectionHeading` gives for its own `index`
   * prop: an identifier is machine notation rather than a word, and the mono stack is
   * what this repository annotates machine-readable values with. On this surface the
   * reason is a stronger one still, because a contract reference is the one string
   * on the page a reader may read aloud to somebody on the other end of a phone. A
   * hand-written phrase is not an identifier and belongs in `facts` where the caller
   * can set its own reading.
   */
  reference?: string
  /**
   * The facts about the account, in the order a reader should meet them.
   *
   * Composed through `FactList` and not drawn as a definition list here, for the
   * reason `UserProfile01` states at length, and the empty case is the sharpest
   * version of it: an account is very often a name, a kind and a balance, and
   * `FactList` renders nothing at all for an empty list rather than a bordered box
   * with a title above it. The cost is that `FactList` keys its own rows by
   * position, so a caller whose facts reorder between renders and who needs row
   * identity composes the Component directly.
   */
  facts?: readonly Account01Fact[]
  /**
   * What the account owes, or what it is worth.
   *
   * Omit it for an account nobody has billed yet, which is a real state rather than
   * a thin one, and in which case no figure and no label about a figure are drawn.
   */
  balance?: Account01Balance
  /** What the account is on. Omit it for an account with no plan. */
  plan?: Account01Plan
  /**
   * The caller's own recent-activity surface, drawn under a rule: an event feed, a
   * timeline, a list of the last five charges.
   *
   * **A slot and never a set of items, and the reason is that activity is a
   * workflow.** Which events exist, how many of them are shown, whether they can be
   * filtered and whether the list is live are four decisions about the caller's own
   * application, and a Block that drew a feed would have to own all four for it to
   * work. So the space is here, a rule is drawn above it, and the caller's own
   * Component goes in it.
   */
  activity?: ReactNode
  /**
   * The caller's own controls for this account: change plan, close it, open it
   * somewhere, escalate it to a support case.
   *
   * **A slot and never a set of named controls, and the reason is the one the whole
   * JSDoc is about.** An account record is read by people who did not create it: a
   * support engineer, an administrator, somebody in finance reconciling a line, and
   * an auditor reading a record months later. A Block that shipped a change plan
   * button and a close button here would be shipping a write path into a read
   * surface, and the controls a given reader is entitled to press is the single most
   * product-specific fact about the page, because it is a fact about that reader's
   * role. See the Block's JSDoc for the whole of that argument.
   */
  controls?: ReactNode
  /**
   * The regions and surfaces this account spans, in the order a reader should meet
   * them.
   *
   * A list of named rows rather than a table, because the reader's job here is
   * scanning for the one region that is degraded rather than comparing a figure
   * across two of them, and a two-column table of one thing per row is a list that
   * paid for column semantics it does not use. See the Block's JSDoc for why a
   * region's name is a `span` and not a heading.
   */
  states?: readonly Account01State[]
  /**
   * Heading level for the section title. @defaultValue 'h2'
   *
   * See `HeadingLevel`.
   */
  headingLevel?: HeadingLevel
  /**
   * Whether the facts and controls sit in an aside beside the body or above it.
   *
   * @defaultValue 'stacked'
   *
   * `stacked` is the default because an account record is read top to bottom and
   * the facts above the fold are the three a reader checks first. `split` puts the
   * balance, the plan, the facts and the controls in a narrow column at the leading
   * edge and gives the activity and the regions the width, which is right on a wide
   * screen where a reader is comparing this account against another one in the same
   * session, and wrong on a phone where the main column would be at half the reading
   * measure.
   *
   * The facts and the controls are in one place in both arrangements, so a caller
   * who switches `layout` does not move a single control: what changes is the
   * column they sit in and nothing else. There is no third arrangement that changes
   * Prism's drawing rather than this Block's spacing, because `className` is layout
   * only.
   */
  layout?: 'stacked' | 'split'
  /**
   * Layout only, exactly as on every Block. Changing a Prism-owned visual property
   * from here is prohibited.
   */
  className?: string
}

/**
 * The refusals, checked before anything is drawn so a caller's mistake is one
 * diagnostic in a console rather than a record with an unreadable mark on it.
 *
 * Three, and each one is a claim a reader would have no way to check. A state
 * with no words, because a coloured dot is invisible to a reader who cannot separate
 * the tones and unreadable to a screen reader whatever the tones are. A link with
 * no words, or a name with no link beside it. And a missing `stateLabel` on a
 * default, which would print a machine value into a record a reader may have to
 * show to somebody else.
 */
function assertAccount(props: {
  plan?: Account01Plan
  states: readonly Account01State[]
}): void {
  const { plan, states } = props

  if (plan !== undefined && (plan.href === undefined) !== (plan.hrefLabel === undefined)) {
    throw new Error(
      `Account01: the plan ${JSON.stringify(plan.name)} declares one of href and hrefLabel without the other, ` +
        'so the reader would be shown a link with no words on it, or a name with no link beside it. Pass both, or ' +
        'neither.',
    )
  }

  for (const row of states) {
    if (row.stateLabel === undefined || row.stateLabel.trim() === '') {
      throw new Error(
        `Account01: the region ${JSON.stringify(row.name)} declares a state and no words for it, so the mark ` +
          'beside it would be a coloured dot with no sentence, in a record a reader may have to show to somebody ' +
          'else. Pass stateLabel in the vocabulary this product uses, which is not this Block choice.',
      )
    }
  }
}

/**
 * An account in full: a name, a kind, a reference, a set of facts, a balance or a
 * plan reading, a recent-activity slot, the regions and surfaces it spans, and a
 * slot for the caller's own controls.
 *
 * **The storefront version of this pattern is a customer record, and the shape is
 * familiar.** A shop shows somebody their customer record: who the account is,
 * what is on it, what it owes, what happened on it recently, and the controls the
 * account's owner is entitled to press. What changes here is whose account it is
 * and who reads it. A NaniSoft account is a workspace rather than a person, and the
 * reader is very often not the person who created it. Everything below is arranged
 * on that one fact.
 *
 * **An account record is NOT a settings page, and the difference is a write path.**
 * An account is a fact about who owes what and what they may do. A settings page is
 * a set of controls that change one. They are read in opposite directions, they are
 * built by different teams, and conflating them is how a read surface turns into a
 * screen where a mistake is a data change. So this Block ships no control of its
 * own: no change plan, no close, no update card, no edit reference. `controls` and
 * `activity` are slots, and each control inside them is the caller's own Component
 * with its own permission check, its own confirmation and its own sentence. A
 * Block that drew a "Close account" button would be shipping a write path into a
 * read surface, and the harm of that is not a styling error: a record is read by
 * people who did not create it, so a control on it is a control a reader may press
 * about somebody else's money, and the person who finds the bug is neither the
 * person who wrote the code nor the person who pressed the button. The cost is
 * stated rather than hidden: a consumer who wants one screen with the record above
 * and the settings below composes `Account01` inside their own `Section` and puts
 * `SettingsPanel01` under it, and the outline then has a heading for each, which is
 * the honest arrangement for two different jobs.
 *
 * **The reference is set in the mono face, for the reason `SectionHeading` states
 * for its own `index` prop.** That prop's documentation says a section's position
 * in a sequence is machine notation rather than a word, and the mono stack is what
 * this repository annotates machine-readable values with. A contract reference is
 * the same kind of value by a stronger margin: it is copied, quoted, searched for
 * and read aloud to somebody on the other end of a phone. A reference set in the
 * interface face reads as a phrase somebody chose, and the difference is the
 * difference between an identifier and a name. A hand-written phrase is not an
 * identifier and belongs in `facts`, where the caller sets its own reading.
 *
 * **The facts compose `FactList` rather than being drawn as a definition list
 * here, and the empty case is the sharpest version of the reason.** An account is
 * very often a name, a kind and a balance, and `FactList` renders nothing at all for
 * an empty list rather than a bordered box with a title above it, which is the
 * Component's own stated rule and the reason a hand-rolled version here would be a
 * second answer to a question this package has already answered. It draws the real
 * `<dl>` with the term before its answer, which is what a specification is and what
 * a pair of columns is not. The cost is that `FactList` keys its own rows by
 * position, so a caller whose facts reorder between renders and who needs row
 * identity composes the Component directly rather than passing them here.
 *
 * **The balance and the plan are a figure and a name, and neither was redrawn.**
 * `Price` owns the arrangement a monetary amount is read in, including the decision
 * that no amount renders a placeholder, and it is the only thing in this package
 * that is entitled to format a currency. A plan gets no price here, and the reason
 * is that a plan's price is a figure and the balance is where figures go: drawing
 * it twice would be two numbers on one page that could disagree after a currency
 * change, which is the exact defect a single source of truth exists to prevent.
 *
 * **A region's name is a `span` and not a heading, and that is a decision rather
 * than an omission.** The Block is shaped like `Project01` and the difference is
 * what is inside it. A project's stages are a sequence a reader navigates, so they
 * are headings; an account's regions are a set the reader scans for the one that is
 * degraded, with no question a heading would answer and nothing inside a region to
 * jump to. A heading per region would be entries in the outline that lead nowhere,
 * and the cost of that is a document whose outline claims more structure than the
 * page has. The name is still the row's identity, and the state is still the
 * caller's own words beside the tone.
 *
 * **A state's tone comes from a table this file holds, and the words are the
 * caller's.** That is the one place this Block refuses the closed union every
 * other one takes, and the reason is specific rather than general: an account's
 * regions and surfaces are not a fixed list, they are whatever the product has, so a
 * union would be this Block deciding what an account may be in. The five words in
 * the table are here to make the common case free, a caller with `capture`,
 * `pipeline` and `inbox` maps the rest, and a value the table does not hold is drawn
 * in the supporting ink with the caller's own words beside it rather than in the
 * alarm colour, because a naming mismatch is not an emergency. The cost is named
 * because it is real: a caller whose vocabulary includes a failure state has to map
 * that one or the failure reads as nothing, and the value is on the row as
 * `data-state` so they can see which ones need mapping.
 *
 * **There is no motion in this Block, and the absence is a decision.** The first
 * law of motion covers feedback, which is a response to something the reader did,
 * and an account record has nothing the reader pressed. The second covers a cycle,
 * which demonstrates a mechanism, and the test that decides which law a motion falls
 * under is falsifiable: stop the animation, is the figure still true? There is no
 * figure here at all, so the question does not arise, and a Block that answered it
 * by animating the balance in would be decoration wearing the costume of a
 * demonstration.
 *
 * It is a server Component: no hook, no state, no effect and no client code of its
 * own. `activity` and `controls` are the caller's nodes, so a consumer who passes a
 * client feed pays for the feed and not for the record, and a consumer who passes
 * nothing ships no JavaScript at all.
 */
export function Account01({
  eyebrow,
  name,
  kind,
  kindLabel,
  reference,
  facts,
  balance,
  plan,
  activity,
  controls,
  states,
  headingLevel = 'h2',
  layout = 'stacked',
  className,
}: Account01Props) {
  assertAccount({ plan, states: states ?? [] })

  /*
    The facts and the controls are built once and placed in one column in both
    arrangements, so a caller who switches `layout` does not move a single control.
    What changes between the two is the column they sit in and nothing else, which
    is the arrangement `Project01` takes and the reason its JSDoc says a third
    layout would be changing Prism's drawing rather than this Block's spacing.
  */
  const aside = (
    <div data-slot="account-01-aside" className="flex min-w-0 flex-col gap-8">
      {balance === undefined ? null : (
        <div data-slot="account-01-balance" className="flex flex-col gap-1">
          <Price data-slot="account-01-balance-amount" {...balance.value} size="xl" />
          <span className="text-muted-foreground text-sm font-medium">{balance.label}</span>
          {balance.note === undefined ? null : (
            <span data-slot="account-01-balance-note" className="text-muted-foreground text-pretty text-xs">
              {balance.note}
            </span>
          )}
        </div>
      )}

      {plan === undefined ? null : (
        <div data-slot="account-01-plan" className="flex flex-col gap-1">
          <span data-slot="account-01-plan-name" className="text-sm font-semibold">
            {plan.name}
          </span>
          {plan.detail === undefined ? null : (
            <span data-slot="account-01-plan-detail" className="text-muted-foreground text-pretty text-sm">
              {plan.detail}
            </span>
          )}
          {plan.href === undefined || plan.hrefLabel === undefined ? null : (
            <CtaLink
              data-slot="account-01-plan-link"
              href={plan.href}
              variant="ghost"
              size="sm"
              className="self-start"
            >
              {plan.hrefLabel}
            </CtaLink>
          )}
        </div>
      )}

      {facts === undefined ? null : (
        /*
          The facts, composed and not derived. `FactList` renders nothing at all for
          an empty list, which is the case this Block leans on hardest: an account
          with a name, a kind and a balance gets three things and no box where a
          fourth fact would have been. The mapping exists only because this Block's
          fact has an `id` for the caller's data and `Fact` has no use for one.
        */
        <FactList
          data-slot="account-01-facts"
          facts={facts.map((fact) => ({ label: fact.label, value: fact.value }))}
        />
      )}

      {/*
        The caller's own controls, in a plain row with no role. A group role here
        would be a group with no name and one more thing a reader has to walk past,
        and the controls inside are the controls.
      */}
      {controls === undefined ? null : (
        <div data-slot="account-01-controls" className="flex flex-wrap items-center gap-2">
          {controls}
        </div>
      )}
    </div>
  )

  const body = (
    <div data-slot="account-01-body" className="flex min-w-0 flex-col gap-8">
      {states === undefined || states.length === 0 ? null : (
        <ul data-slot="account-01-states" className="border-border flex flex-col border-t">
          {states.map((row) => (
            <li
              key={row.id}
              data-slot="account-01-state"
              data-state-row={row.id}
              data-state={row.state}
              className="border-border flex flex-wrap items-center gap-x-4 gap-y-1 border-b px-1 py-3 last:border-b-0"
            >
              <span className="min-w-0 flex-1 text-sm font-medium">{row.name}</span>

              {/*
                The mark, and the words beside it. The condition cannot be false
                here because the diagnostic above has already refused a row with no
                words, so spelling it out means the types read the same rule the
                runtime does rather than a non-null assertion standing in for it.
              */}
              {row.stateLabel === undefined ? null : (
                <Status size="sm" tone={toneOf(row.state)} label={row.stateLabel} className="shrink-0" />
              )}

              {row.detail === undefined ? null : (
                <span data-slot="account-01-state-detail" className="text-muted-foreground w-full text-xs">
                  {row.detail}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      {activity === undefined ? null : (
        /*
          The caller's own recent-activity surface, under a rule rather than inside a
          panel. The rule is decorative and says so by default, which is right: it
          separates two blocks of the caller's own content and does not express a
          separation a keyboard reader needs to know about. There is no heading above
          it, because the heading would be a sentence Prism wrote about somebody
          else's activity, and the caller's own Component brings its own.
        */
        <div data-slot="account-01-activity" className="flex flex-col gap-4">
          <Separator data-slot="account-01-rule" />
          {activity}
        </div>
      )}
    </div>
  )

  return (
    <Section data-slot="account-01" className={cn(className)}>
      <SectionHeading
        as={headingLevel}
        align="left"
        eyebrow={eyebrow}
        title={name}
        description={kindLabel ?? kind}
      />

      {reference === undefined ? null : (
        /*
          The reference, in the mono face, above the two columns. It is the first
          thing after the heading and the last thing before the facts, because it is
          the one value a reader is looking for when they arrive at a record they
          did not create, and it is the value they will read aloud.
        */
        <p data-slot="account-01-reference" className="text-muted-foreground mt-4 font-mono text-xs">
          {reference}
        </p>
      )}

      <div
        data-slot="account-01-columns"
        data-layout={layout}
        className={cn(
          'mt-8 flex flex-col gap-10',
          // The two arrangements differ in the display and in the track widths, and
          // in nothing else: `flex` and `grid` are the same property, so which one
          // wins is a question about the order of the generated stylesheet rather
          // than about the order of the class names here, and the children are in
          // the same order in both so that switching `layout` moves no control.
          layout === 'split' ? 'lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-14' : null,
        )}
      >
        {aside}
        {body}
      </div>
    </Section>
  )
}

export default Account01
