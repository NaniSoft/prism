'use client'

import { Radio as RadioPrimitive } from '@base-ui/react/radio'
import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group'
import type { ComponentProps, ReactNode } from 'react'

import { cn } from '../../lib/utils'

/**
 * One payment or billing source, and every word about it.
 *
 * **Nothing on this type is a payment fact, and that is the whole of the design.**
 * There is no number, no network, no brand, no currency and no expiry rule,
 * because each of those is a fact about somebody else's payment method and this
 * package has no business asserting one. A source is a set of caller-owned words
 * and a caller-owned mark, arranged into a shape a reader can scan. The type
 * carries the shape and refuses the facts, and a consumer who wants the facts
 * already has them.
 *
 * The two fields that look like they could have been typed more strictly are the
 * two that carry the load, and both are loose on purpose. `id` is a `string`
 * because it is a caller's own key, not a Prism one, and it crosses back out
 * through `onChange` and into whatever store the caller keeps. `name` is a node
 * because a source is often a logo and a word, and because the node is the
 * element a sighted reader reads, which is the element a screen reader then names
 * the source by.
 */
export type BillingSourceItem = {
  /**
   * The caller's own key for this source.
   *
   * Required, and passed back to `onChange` and written into the hidden form
   * field when `BillingSources` is given a `name`. It is the one value on this
   * type that leaves the Component, and it is chosen to be a key rather than an
   * account number for the reason the rest of the type exists: a form that posts
   * a source's id posts an opaque handle, and a form that posts a card number
   * posts a card number.
   */
  id: string
  /**
   * How this product names the source, in the words a reader would use about it.
   *
   * Required, and a node because a source is often a mark and a word. There is no
   * default and no generated label anywhere in this module, because a billing
   * surface that shipped Prism's own name for a source would be shipping a claim
   * about somebody else's payment method: one product writes "Visa ending 4417",
   * another writes "Corporate card", and a third writes "Northwind IT". The type
   * exists partly to hold that refusal.
   */
  name: ReactNode
  /**
   * The identifying value, drawn exactly as passed.
   *
   * **This Component never masks, truncates, groups, reorders or shortens it, and
   * the absence of a `mask` prop is the decision rather than an omission.** What
   * may be shown on this surface is a compliance question with a different answer
   * in every product, in every jurisdiction and for every field: a full number
   * on an invoice a reader has already authenticated for, four digits on a shared
   * screen, a token from a provider that has no digits to show at all, an account
   * code for a mandate. A Component that masked would be picking the answer, and a
   * Component that refused to mask would be refusing a legitimate display. So the
   * value arrives already decided, as the string the caller has concluded is safe
   * to render, and this module puts it in text and nowhere else: never in a
   * `data-` attribute, never in a class name, never in a `title`, never in an
   * `aria-label` of its own.
   *
   * A `string` is drawn in the mono face and a composed node is not, following the
   * rule `Metric` states: the platform monospace annotates a machine-readable
   * reading, and a caller's grouped digits, a provider's token and a partial
   * number are all one, while a value the caller composed out of several parts is
   * a sentence with a number in it.
   */
  value: ReactNode
  /**
   * The words a screen reader reads in place of the value on screen.
   *
   * Optional, and it is the seam that lets a caller mask without a Component
   * knowing what a mask is. A value of dots and a value of four digits are both
   * unreadable when spoken, and a reader who is told "star star star star four
   * four one seven" learns nothing about which card is about to be charged. So
   * when the visible value would say nothing aloud, the caller passes the words
   * here and the visible value is hidden from assistive technology rather than
   * read twice.
   *
   * **It cannot be required when it matters, and that limit is stated rather than
   * papered over.** A rule that said "pass this whenever the value is masked"
   * would have to know what a mask is, which is the caller's compliance posture
   * and not a property of the string, so the Component has nothing to test. What
   * it can do is put the two halves together, and it does: with `valueLabel` the
   * value is not announced, and without it the value is announced as written. The
   * cost is that a caller who masks and forgets this ships a row that reads as
   * punctuation, and the fix is one prop, in a place the caller already is.
   */
  valueLabel?: string
  /**
   * What kind of source it is, in the caller's own machine words.
   *
   * Optional, and drawn in the muted ink at the `xs` step, because a kind is a
   * column a reader scans rather than one they read. A product whose kind is a
   * code has a reason to print the code and no reason to have this Component
   * translate it, so the value is printed exactly as passed.
   */
  kind?: ReactNode
  /**
   * The caller's own mark for the source, which is a slot and never a mark this
   * package draws.
   *
   * A card network's mark is a licensed asset with rules governing its size, its
   * clear space, its colour and its use on a third party's surface, and a set of
   * them shipped as a Component is a set that is out of date within a year as the
   * networks add and retire programmes. So the space is here, the frame around it
   * is a size and a clip and nothing else, and a source with no mark draws no
   * frame rather than a grey disc where a logo would be. The cost is stated: a
   * consumer with four card sources has four assets to license, where a package
   * that shipped them would have handed over four marks it was not entitled to.
   */
  mark?: ReactNode
  /**
   * Whatever else the caller wants said about this source: an expiry reading, a
   * verification state, a note about a failed charge.
   *
   * Optional, and printed exactly as passed, for the reason `BillingSource01`
   * gives at length: a Component that formatted the moment would be choosing a
   * locale, a calendar and a granularity on a reader's behalf, and would put
   * `Intl` into every consumer's bundle for a rendering Prism has no stake in.
   */
  note?: ReactNode
  /**
   * Whether this source cannot be chosen, and why the caller decided that.
   *
   * A source can be un-choosable for facts only the caller has: it failed
   * verification, it is the source an open dispute is about, a contract ended.
   * A disabled option is refused rather than drawn as enabled-and-ignored, and it
   * stays in the accessibility tree so a reader is told it exists and is not
   * available, rather than finding the row missing with nothing said.
   */
  disabled?: boolean
}

/** The props a `BillingSource` takes, for the single-source display. */
export type BillingSourceProps = Omit<ComponentProps<'div'>, 'children'> & {
  /**
   * The source to draw. One entry of the caller's set, and the same shape
   * `BillingSources` takes, so moving between the display and the chooser is a
   * change of arrangement rather than a change of data.
   */
  source: BillingSourceItem
  /** Layout only, exactly as on every Component. */
  className?: string
}

/**
 * The props a `BillingSources` takes, for the chooser.
 *
 * The element's own props are forwarded, and three of them are handled here
 * rather than inherited. `children` is removed because the chooser draws its rows
 * from `sources` and a caller who passed any would be reaching past the set.
 * `onChange` is removed because the group reports the selected source's id and
 * the element's own `onChange` is a form event this Component does not forward to
 * anything. `defaultValue` is declared rather than removed, which is the same move
 * `radio-group` makes, and the reason is below it.
 */
export interface BillingSourcesProps
  extends Omit<ComponentProps<'div'>, 'onChange' | 'children'> {
  /**
   * There is no uncontrolled form, so the element's own `defaultValue` is not
   * offered either.
   *
   * The underlying group declares it as a narrower type than the element does, so
   * inheriting the element's version is a shape mismatch rather than a missing
   * feature, and a chooser that rendered a source the reader never chose because a
   * form said so is a chooser that has pointed their money at it. Pass `value`.
   */
  defaultValue?: never
  /**
   * The sources a reader may choose between, in the order a reader should meet
   * them. Order is the caller's and nothing is sorted here, because which source
   * is about to be charged is the caller's claim and not this package's.
   */
  sources: readonly BillingSourceItem[]
  /**
   * The `id` of the source the charges fall to right now.
   *
   * Required, because a chooser that does not know where it is renders a
   * question with no answer, and this is a question about a reader's money. An id
   * that is not in `sources` marks nothing, which is a real state and not a throw:
   * a store that names a source the product has since withdrawn is a caller's
   * data problem, and taking the page down over it is worse than drawing a chooser
   * with nothing selected.
   */
  value: string
  /**
   * Called with a source's `id` when the reader selects it.
   *
   * Required, and a request rather than a mutation, for the reason every other
   * control in this package takes one: which source is active is the caller's
   * state, and a control that moved the marking and put it back when the request
   * failed would be a control that lied about where a reader's money goes. Prism
   * does not apply the choice, does not call a payment provider and does not know
   * what applying it involves.
   */
  onChange: (id: string) => void
  /**
   * The chooser's own accessible name.
   *
   * Required, and not defaulted, because it names a decision about money and the
   * sentence is the consumer's: "Payment method", "Charge to", "Billing source".
   * A default would be a word in a language the consumer did not choose, sitting
   * above the control that spends their money.
   */
  label: string
  /**
   * The form field name the selected source's `id` is submitted under.
   *
   * Optional, and the privacy argument for it is the reason it is worth naming.
   * The hidden field carries the caller's `id` and nothing else, so a form that
   * posts a chosen source posts an opaque handle and not the value the reader can
   * see beside it. A caller who would rather not post anything omits this.
   */
  name?: string
  /**
   * What to draw when there are no sources.
   *
   * Optional, and with none of them the chooser renders nothing, which is the same
   * choice `TagGroup` makes. An empty bordered box with a name on it and nothing
   * inside it reads as a rendering failure rather than as an absence, and a
   * billing surface with no sources is a state a product has words for.
   */
  empty?: ReactNode
  /** Layout only, exactly as on every Component. */
  className?: string
}

/**
 * The mark frame, drawn once for both arrangements.
 *
 * A size and a clip and nothing else, so a network's mark and a caller's
 * monogram are the same height whichever they pass, and a source with no mark
 * draws no frame rather than a grey disc where a logo would be. The clip is on
 * the frame and not on the mark, so a caller who passes an SVG wider than the
 * frame gets it cropped rather than shrunk and a caller who passes a mark with its
 * own clear space keeps it.
 */
const MARK_FRAME = 'bg-muted flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md [&_img]:size-full [&_img]:object-cover'

/**
 * The words about the source, and the split of the two axes of the row.
 *
 * The name is the first thing read and the detail line is the second, so the
 * detail wraps onto as many lines as the value needs and the name does not move
 * out from under it. The value sits at the `xs` step beside the kind because the
 * two are read as one sentence by a reader scanning a column: which card, and
 * what kind of thing it is.
 */
const SOURCE_BODY = 'flex min-w-0 flex-1 flex-col gap-0.5'
const SOURCE_NAME = 'text-sm font-medium'
const SOURCE_DETAIL = 'text-muted-foreground flex flex-wrap items-baseline gap-x-2 text-xs'

/**
 * The row, with no border, no fill and no chrome of its own.
 *
 * A source is a row, and the thing that encloses it is the caller's, for the
 * reason `Item` makes about lists: the same row appears inside a settings panel,
 * inside a receipt, inside a checkout summary and inside a table cell, and a
 * Component that owned the enclosure would have to own all four. It draws no
 * heading, so there is nothing here for `SectionHeading` to be right about; a
 * caller who needs the row named wraps it in a `Field` and a `FieldLabel`, or
 * puts the pair in a `ListPanel` whose region they name themselves.
 *
 * It is drawn in a server render. Nothing here is decided at hydration time: no
 * hook, no state, no effect, and a source's identity is its own `id` rather than
 * anything this Component remembers.
 */
function BillingSource({ source, className, ...props }: BillingSourceProps) {
  return (
    <div data-slot="billing-source" className={cn('flex items-start gap-3', className)} {...props}>
      {source.mark === undefined || source.mark === null || source.mark === false ? null : (
        <span data-slot="billing-source-mark" className={MARK_FRAME}>
          {source.mark}
        </span>
      )}
      <SourceBody source={source} />
    </div>
  )
}

/**
 * A set of sources a reader chooses between, and the one the charges fall to.
 *
 * **It is a radio group, and the reason is the same one `PackSwitcher` gives: a
 * single source is always the one in use and choosing either of any two leaves the
 * same state as choosing the other.** The whole row is the radio rather than a
 * small circle at one end, which is the decision worth defending: a control the
 * size of a card and a name the length of one is a control a reader aims at
 * without reading, a reader using voice control can name, and a finger can hit
 * without landing on a fourteen-pixel target beside a sentence it does not want.
 * The cost is that the row is a large hit area, so a reader who wants to select
 * the text inside it cannot, and a caller with a value worth copying puts the copy
 * control in a slot of their own rather than expecting the row to be transparent
 * to a selection.
 *
 * **The selection is a `data-` surface change beside `aria-checked`, and never
 * instead of it.** The same order the package keeps everywhere: the attribute is
 * the fact and the border and the fill are the reminder, so a reader who cannot
 * separate the two and a reader using a screen reader are told the same thing.
 *
 * **A disabled source stays in the list.** It is drawn, announced and refused,
 * because a source a reader cannot choose is still a source they have on file and
 * a row that silently vanished is a row they will think has been removed.
 *
 * **The keyboard model is the one a radio group already owns: one Tab stop for
 * the whole set, and the arrow keys moving between the rows inside it.** That is
 * inherited rather than implemented, and inheriting it is the reason this is a
 * radio group and not a row of buttons. It is stated here because the cost of
 * inheriting is invisible: a caller who wants a different model cannot have one
 * without building their own control, and a set of four sources is not a case
 * where that is worth doing. Every row is a real radio with a real `aria-checked`,
 * and the indicator is drawn at full strength on the row rather than on a circle
 * inside it, so the ring bounds the thing it names.
 *
 * **It is a client Component, and the directive is unconditional.** The rule is
 * the one `BillingSource01` states in full: a surface that attaches a handler is
 * a client Component, and the directive sits on the module rather than in a leaf
 * so that a consumer composing a server page gets the boundary in one place they
 * can see. The cost is named rather than hidden, and on this surface it is
 * sharper than usual: a single source on a receipt is a pure display, and this
 * module puts even that in the client graph where a server render would have
 * shipped no JavaScript at all. The price was judged worth paying for one
 * boundary rather than two arrangements of the same surface, and a consumer for
 * whom the receipt is the only use should hold the row in their own markup until
 * the section around it is ready to compose this.
 *
 * It imports no Block and composes no section. A Block is a pre-composed region
 * and a Component that imported one would be reaching upwards, so the section
 * that holds these rows is `billing-source-01` and the relationship is a
 * vocabulary rather than a dependency: the two agree on the fields because the
 * fields are the ones a source has, and either can be used without the other.
 */
function BillingSources({
  sources,
  value,
  onChange,
  label,
  name,
  empty,
  className,
  ...props
}: BillingSourcesProps) {
  if (sources.length === 0) {
    if (empty === undefined) return null
    return (
      <p data-slot="billing-sources-empty" className="text-muted-foreground text-sm">
        {empty}
      </p>
    )
  }

  return (
    <RadioGroupPrimitive<string>
      data-slot="billing-sources"
      aria-label={label}
      value={value}
      name={name}
      onValueChange={onChange}
      className={cn('flex flex-col gap-2', className)}
      {...props}
    >
      {sources.map((source) => (
        <RadioPrimitive.Root
          key={source.id}
          value={source.id}
          disabled={source.disabled}
          data-slot="billing-sources-option"
          data-source={source.id}
          className={cn(
            // The selected row states both halves of its surface, which is the
            // Stated Ink Rule: an ink inherited from whatever is behind the row is
            // not the page's foreground, and the token gate measures token pairs
            // rather than what a Component leaves out.
            'border-border bg-background text-foreground hover:bg-muted',
            'data-[checked]:border-primary data-[checked]:bg-muted',
            'flex w-full items-start gap-3 rounded-lg border p-3 text-left',
            'transition-colors duration-fast ease-out',
            'outline-none focus-visible:ring-ring focus-visible:ring-[3px]',
            'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
          )}
        >
          {source.mark === undefined || source.mark === null || source.mark === false ? null : (
            /*
             * The mark, left in the accessibility tree rather than hidden, because
             * a caller's licensed asset carries information the row's words do not
             * and hiding the slot would make the caller's own `alt` unreachable. A
             * caller whose mark really is decoration passes an `aria-hidden` image
             * and decides that for itself, which is the only party that knows.
             */
            <span data-slot="billing-sources-mark" className={MARK_FRAME}>
              {source.mark}
            </span>
          )}
          <SourceBody source={source} />
        </RadioPrimitive.Root>
      ))}
    </RadioGroupPrimitive>
  )
}

/**
 * The two halves of a source's identity, drawn once for the display and the row.
 *
 * Compound parts of one Item stay inside the parent module and do not form a
 * second vocabulary, so this is a module-local function rather than a third
 * export. The value and the spoken value are the one place it does something
 * rather than arranging: when the caller has said what the value should sound
 * like, the drawn one is hidden from assistive technology rather than read a
 * second time, and when they have not, the drawn one is announced exactly as
 * written. Which of the two is right is the caller's compliance posture, and the
 * honest limit is that this function cannot tell them apart.
 */
function SourceBody({ source }: { source: BillingSourceItem }) {
  const spoken = source.valueLabel

  return (
    <span data-slot="billing-source-body" className={SOURCE_BODY}>
      <span data-slot="billing-source-name" className={SOURCE_NAME}>
        {source.name}
      </span>
      <span data-slot="billing-source-detail" className={SOURCE_DETAIL}>
        <span
          data-slot="billing-source-value"
          aria-hidden={spoken === undefined ? undefined : true}
          className={cn('tabular-nums', typeof source.value === 'string' && 'font-mono')}
        >
          {source.value}
        </span>
        {spoken === undefined ? null : (
          <span data-slot="billing-source-value-label" className="sr-only">
            {spoken}
          </span>
        )}
        {source.kind === undefined || source.kind === null || source.kind === false ? null : (
          <span data-slot="billing-source-kind">{source.kind}</span>
        )}
        {source.note === undefined || source.note === null || source.note === false ? null : (
          <span data-slot="billing-source-note">{source.note}</span>
        )}
      </span>
    </span>
  )
}

export { BillingSource, BillingSources }
