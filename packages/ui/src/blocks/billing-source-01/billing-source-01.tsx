'use client'

import { Plus } from 'lucide-react'
import type { ReactNode } from 'react'

import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { CtaLink } from '../../components/ui/cta-link'
import { ListPanel } from '../../components/ui/list-panel'
import {
  Section,
  SectionHeading,
  type HeadingLevel,
} from '../../components/ui/section'
import { cn } from '../../lib/utils'

/**
 * One billing source a workspace has on file, and everything a reader needs to
 * tell it from the others and to act on it.
 *
 * **`name` is the caller's and not a card network's.** A source on file is a card,
 * a direct debit mandate, an invoice account or a credit note, and the way a
 * product names those is its own: one writes "Visa ending 4417" and another writes
 * "Corporate card". Prism cannot know which, so `name` is required and there is
 * no default, no fallback and no generated label anywhere in this module. A
 * billing surface that shipped Prism's own name for a source would be shipping a
 * claim about somebody else's payment method.
 *
 * `kind` is the machine value beside it and `kindLabel` the words when the two
 * differ, for the reason every Block in this package gives: a value a product
 * stores and a sentence a reader reads are two facts, and only the product knows
 * both.
 */
export type BillingSource01Source = {
  /**
   * A stable key for the row, passed back to `onSetDefault` and `onRemove`, and
   * carried on the markup as `data-source` so a test can name one row rather than
   * the first.
   */
  id: string
  /**
   * How the caller's product names this source, in the words a reader would use
   * about it.
   *
   * Required, and a `string` rather than a node for the same reason
   * `Shortlist01Item.name` is one: this value is interpolated into the accessible
   * name of the controls below, and a name Prism cannot compose is a name its
   * controls cannot announce. The type exists partly to hold that cost.
   */
  name: string
  /**
   * What kind of source it is, in the product's own machine words.
   *
   * A short noun phrase drawn in the muted ink, and a `string` rather than a node
   * because it is a column a reader scans rather than one they read. A kind that
   * wraps to two lines costs every other row its alignment.
   */
  kind: string
  /**
   * The words for the kind, when the machine value is not the sentence a reader
   * should read.
   *
   * Optional, and its absence is not a fault: `kind` is already a caller's string
   * and a product whose kind is a code has a reason to print the code.
   */
  kindLabel?: string
  /**
   * The mark that identifies the source, which is a slot and never a mark this
   * Block draws.
   *
   * **A design system does not ship payment card marks, and the reason is three
   * facts rather than one.** Prism's icon lane is Lucide, and a card network's
   * mark is a licensed asset with brand rules governing its size, its clear space,
   * its colour and its use on a third party's surface, which this repository has
   * no business restating in a JSDoc. And a set of them in a design system is a
   * set that is out of date within a year, because the networks add and retire
   * programmes and a component package cannot follow them. So the space is here,
   * it is the caller's own licensed asset, and this Block renders no brand set of
   * its own and no placeholder in its place. A source with no mark draws no frame,
   * which is the honest state for an invoice account that has no logo to show.
   */
  mark?: ReactNode
  /**
   * When this source expires, in whichever of the two forms the caller already has
   * it.
   *
   * Printed exactly as passed, which is honest and almost never what was wanted.
   * The reason is the one `SettingsMembersMember.joined` gives: a Block that
   * formatted the moment would be choosing a locale, a calendar and a granularity
   * on a reader's behalf, and would put `Intl` into every consumer's bundle for a
   * rendering Prism has no stake in. The reading is `expiresLabel`, and a caller
   * who wants "expires in March" composes their own formatter.
   */
  expiresAt?: number | string
  /**
   * The words for the expiry, given the moment and the source it belongs to.
   *
   * A function rather than a string because the honest reading of an expiry is a
   * localised sentence, and because two sources on the same page rarely expire on
   * the same day, so a single string would be either wrong or a template Prism
   * filled in. The source is in the argument for the same reason the shortlist
   * passes its item: a row with an expiry reading and no name beside it is a date
   * floating on its own.
   */
  expiresLabel?: (value: number | string, source: { id: string; name: string }) => string
  /**
   * Marks the source the charges fall to when nobody says otherwise.
   *
   * The Block draws a mark beside the caller's sentence and nothing else, and
   * exactly one source may declare it. Two is a thrown diagnostic rather than a
   * rendering detail, and the Block's JSDoc says why at length: a default a
   * reader cannot find is a fact about a reader's money that nobody in the
   * document can check, and a Block that drew a default on both of two rows would
   * be drawing a page where the question has two answers.
   */
  isDefault?: boolean
  /**
   * The words that mark the default source.
   *
   * Required whenever `isDefault` is set, and a thrown diagnostic rather than a
   * silent absence, for the reason `Status` gives for its own label and
   * `SettingsMembersMember.selfLabel` restates: a row the Block has decided is the
   * default, marked by nothing a reader can see, is a claim with no document to
   * check it against. This is the last place in a product where a silent claim is
   * the wrong one.
   */
  defaultLabel?: string
  /**
   * Where the full record for this source is kept. Its presence makes the row
   * carry a link.
   *
   * A link and not a control, because a reader looking at a card on file is
   * looking at a record and not asking for a transaction, and the destination is a
   * route in the caller's own application that only the caller knows what is
   * behind.
   */
  href?: string
  /**
   * The words on the link, and required whenever `href` is.
   *
   * A link whose only words are the source's own name tells a reader nothing
   * about what activating it does, which is the same defect `ResourceList01`
   * refuses and for the same reason.
   */
  hrefLabel?: string
  /**
   * The caller's own controls for this one source: update, replace, verify, view
   * the charges on it.
   *
   * A slot, because which controls a source has is the caller's fact, and the two
   * this Block draws are not the whole of what a product can do with a billing
   * source. Each control inside is the caller's own Component.
   */
  actions?: ReactNode
}

/**
 * The props a BillingSource01 takes.
 *
 * Every string is a prop and the Block ships none: no source, no name, no kind, no
 * mark, no expiry reading, no default sentence, no link and not one of the
 * sentences a billing surface is most tempted to ship. The absence of the sources
 * themselves is the sharpest version of the rule, because a row drawn with a card
 * on it is the single easiest thing in this package to write by accident and the
 * single most likely to be somebody else's card.
 */
export type BillingSource01Props = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: string
  /**
   * The section title, and required.
   *
   * Required because a set of sources with no statement of whose they are reads as
   * a checkout form rather than as a record, and the difference between the two is
   * whether the reader is deciding or paying.
   */
  title: ReactNode
  /** One or two sentences under the title. */
  description?: ReactNode
  /**
   * The sources on file, in the order a reader should meet them.
   *
   * Order is the caller's and the Block does not sort. A caller who wants the
   * default first moves it first, because "which one is the default" is a claim
   * about what matters most on this page and it is the caller's to make.
   */
  sources: readonly BillingSource01Source[]
  /**
   * Called with a source's `id` when the reader asks to make it the default.
   *
   * A request and not a mutation, for the reason every other Block in this package
   * takes one: which source is the default is the caller's state, so a control
   * that moved the mark and put it back when the request failed would be a
   * control that lied about where a reader's money goes.
   */
  onSetDefault?: (id: string) => void
  /**
   * The accessible name of the set-as-default control, given the source it acts
   * on.
   *
   * Required whenever `onSetDefault` is set, and a function rather than a string
   * for the reason `tag-group` gives about its own remove control: a column of
   * controls all announced as "Make default" is a column a screen reader user
   * cannot act on, and a reader using voice control has to be able to say the
   * words they can see. The cost is real and is named rather than hidden: every
   * caller writes the sentence, once, in their own language.
   */
  setDefaultLabel?: (source: { id: string; name: string }) => string
  /**
   * Called with a source's `id` when the reader takes it off file.
   *
   * Offered on every row, and a request. Whether removing a source with charges
   * against it is even permitted is the caller's fact and not this Block's, and
   * the answer is a caller's `actions` slot that confirms rather than a control
   * the Block withholds: see the Block's JSDoc.
   */
  onRemove?: (id: string) => void
  /**
   * The accessible name of the remove control, given the source it removes.
   *
   * Required whenever `onRemove` is set, and a function rather than a string for
   * the argument `tag-group` makes about its own remove control: a remove control
   * that announced only "Remove" gives a screen reader one identical button per
   * source and leaves the reader guessing which one they are on. The cost of
   * that on this surface is higher than on a tag group, because the consequence
   * of pressing the wrong one is a card a reader meant to keep no longer being
   * charged to, so the name has to carry the source's own name and the caller
   * writes it in their own language.
   */
  removeLabel?: (source: { id: string; name: string }) => string
  /**
   * The words on the control that adds a source.
   *
   * Required whenever `onAdd` is set, and a `string` rather than a function
   * because it names one control rather than one per row. The Block draws no
   * default for it, which is the same refusal every other control in this package
   * takes: "Add payment method" is a sentence this package is not entitled to
   * write into a consumer's billing page. Omit it and no control is drawn, which
   * is right for a workspace whose sources are added by an administrator.
   */
  addLabel?: string
  /**
   * Called when the reader asks to add a source.
   *
   * The Block opens nothing. What "add a source" means is a route, a dialog, a
   * hosted form or a redirect to a payment provider, and a Block that chose would
   * be choosing for four products at once, which is the same reason every
   * toolbar slot in this package is a slot.
   */
  onAdd?: () => void
  /**
   * What the Block draws in place of the set when there is nothing on file.
   *
   * Required, and the reason is the sharpest one on this surface: a reader who
   * came to look at what their workspace is charged to and found nothing is
   * reading one line, and that line has to distinguish a workspace nobody has
   * added a source for from a query that failed. Only the caller knows which one
   * is on screen.
   */
  empty: ReactNode
  /**
   * Heading level for the section title. @defaultValue 'h2'
   *
   * See `HeadingLevel`.
   */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Block. Changing a Prism-owned visual property
   * from here is prohibited.
   */
  className?: string
}

/**
 * The refusals, checked before anything is drawn so a caller's mistake is one
 * diagnostic in a console rather than a page where a reader's money has two answers.
 *
 * Nine, and the last one is the one this Block exists partly to catch. Two sources
 * marked as the default is not a rendering detail, because the mark is the only
 * thing on the page saying where the charges go, and two of them is a page where
 * the reader's most consequential question has two answers and neither of them is
 * checkable against the document. The rest are the house pair rules and the
 * control-naming rules: a state with no words, a link with no words, a control with
 * no name, and a name with no control.
 */
function assertSources(props: {
  sources: readonly BillingSource01Source[]
  onSetDefault?: (id: string) => void
  setDefaultLabel?: (source: { id: string; name: string }) => string
  onRemove?: (id: string) => void
  removeLabel?: (source: { id: string; name: string }) => string
  addLabel?: string
  onAdd?: () => void
}): void {
  const { sources, onSetDefault, setDefaultLabel, onRemove, removeLabel, addLabel, onAdd } = props

  if (onSetDefault !== undefined && setDefaultLabel === undefined) {
    throw new Error(
      'BillingSource01: onSetDefault was passed with no setDefaultLabel, so every control would be announced by ' +
        'the same word and a reader would be told which source to make the default by nothing. Pass the function ' +
        'that names the source.',
    )
  }

  if (setDefaultLabel !== undefined && onSetDefault === undefined) {
    throw new Error(
      'BillingSource01: setDefaultLabel was passed with no onSetDefault, so the sentences would be composed ' +
        'and then discarded, which is a caller who believes they have named the controls on a surface that has ' +
        'none.',
    )
  }

  if (onRemove !== undefined && removeLabel === undefined) {
    throw new Error(
      'BillingSource01: onRemove was passed with no removeLabel, so every control would be announced by the same ' +
        'word and a reader would be guessing which source they were on, which on this surface is a card they ' +
        'meant to keep. Pass the function that names the source.',
    )
  }

  if (removeLabel !== undefined && onRemove === undefined) {
    throw new Error(
      'BillingSource01: removeLabel was passed with no onRemove, so the sentences would be composed and then ' +
        'discarded, which is a caller who believes they have named the controls on a surface that has none.',
    )
  }

  if (onAdd !== undefined && addLabel === undefined) {
    throw new Error(
      'BillingSource01: onAdd was passed with no addLabel, so the control would carry no words of its own, and ' +
        'the sentence naming it belongs to the product rather than to this package. Pass the words, or drop the ' +
        'handler.',
    )
  }

  if (addLabel !== undefined && onAdd === undefined) {
    throw new Error(
      'BillingSource01: addLabel was passed with no onAdd, so the control would be drawn and would do nothing, ' +
        'which is a promise this Block does not keep. Pass the handler, or drop the words.',
    )
  }

  const defaults = sources.filter((source) => source.isDefault === true)
  if (defaults.length > 1) {
    throw new Error(
      `BillingSource01: ${defaults.length} sources are marked as the default, including ` +
        `${JSON.stringify(defaults[0]?.name)} and ${JSON.stringify(defaults[1]?.name)}, so the page says the ` +
        'charges fall to more than one place. That is a finding about the caller data rather than a rendering ' +
        'detail: the mark is the only thing on this page saying where the money goes, and two of them is a ' +
        "question a reader cannot answer. Mark one, and the Block's refusal to draw it twice is the reason it " +
        'reaches a developer.',
    )
  }

  for (const source of sources) {
    if (source.isDefault === true && (source.defaultLabel === undefined || source.defaultLabel.trim() === '')) {
      throw new Error(
        `BillingSource01: the source ${JSON.stringify(source.name)} is marked as the default and passed no ` +
          'defaultLabel, so the row the Block has decided is the one charges fall to would be marked by nothing ' +
          'a reader can see. Pass the words that say so.',
      )
    }
    if ((source.href === undefined) !== (source.hrefLabel === undefined)) {
      throw new Error(
        `BillingSource01: the source ${JSON.stringify(source.name)} declares one of href and hrefLabel without ` +
          'the other, so the row would carry a link with no words on it, or a name with no link beside it. Pass ' +
          'both, or neither.',
      )
    }
  }
}

/**
 * The billing sources a workspace has on file: a name, a kind, a mark slot, an
 * expiry reading, a default mark, a link, and a set of per-source controls, inside
 * a bounded panel with an add control at its trailing edge.
 *
 * **The storefront version of this pattern is saved payment methods, and the shape
 * is familiar.** A shop shows a reader the cards they have on file, each with a
 * brand mark, a masked number, an expiry, a default tick and a remove control.
 * What changes here is whose money it is and what the controls do. A workspace's
 * billing sources are a record a reader checks, and the two controls this Block
 * draws are not "buy with this" and "edit this": they are "charge to this one" and
 * "stop charging to this one", which is why the caller writes the name of each
 * control rather than this Block supplying one. A reader who has used both will
 * recognise the rows, and the difference is that nothing here can be spent.
 *
 * **`mark` is a slot and this Block ships no card marks at all, and the refusal is
 * the point of the field.** Prism's icon lane is Lucide, and a card network's mark
 * is a licensed asset with brand rules governing its size, its clear space, its
 * colour and its use on a third party's surface. Restating those rules in a design
 * system's JSDoc is exactly the thing this repository has no business doing, and a
 * set of them shipped as a component would be a set that is out of date within a
 * year, because the networks add and retire programmes and a component package
 * cannot follow them. So the mark is the caller's own licensed asset, the frame
 * around it is a size and a clip and nothing else, and a source with no mark draws
 * no frame rather than a grey disc, which is the honest state for an invoice
 * account that has no logo to show. The cost is stated rather than hidden: a
 * consumer assembling four sources has four assets to license, where a design
 * system that shipped them would have handed over four marks it was not entitled
 * to.
 *
 * **Two sources marked as the default throws, and that is a finding rather than a
 * rendering detail.** The mark beside the caller's sentence is the only thing on
 * the page saying where the charges fall, so a second one is a page where the
 * reader's most consequential question has two answers and neither is checkable
 * against anything in the document. A Block that resolved the disagreement by
 * drawing the first row and ignoring the second would be making a claim about a
 * reader's money on the strength of an array's order, and a Block that drew both
 * would be handing the reader a page that looks deliberate and says nothing. So
 * the run fails with a message naming both sources, and the caller goes and looks
 * at the data. The cost is stated rather than hidden: a consumer whose store
 * genuinely holds two default rows has a bug, and this is where it is found rather
 * than on an invoice three weeks later.
 *
 * **Both control names are functions, and the reason is the one `tag-group` gives
 * about its own remove control.** A remove control announced only as "Remove"
 * gives a screen reader one identical button per source and leaves the reader
 * guessing which one they are on. On a tag group that is an annoyance. On a
 * billing page it is worse, because the consequence of pressing the wrong one is a
 * card a reader meant to keep no longer being charged to, and a reader who cannot
 * tell the buttons apart is a reader who will press the wrong one deliberately
 * rather than by accident. So the name has to carry the source's own name, the
 * source's name is a `string` rather than a node precisely so Prism can hand it to
 * a function rather than trying to interpolate a node into a sentence, and the
 * sentence is the caller's because it is a sentence in their language. The move
 * control on a shortlist argues the same thing for the same reason.
 *
 * **The remove control is offered on every row, including the default, and the
 * confirmation is the caller's.** Every instinct on a billing page is to withhold
 * the dangerous control from the row the charges are actually falling to, and the
 * instinct is wrong for a reason that has nothing to do with the interface: a
 * reader who wants to stop charging to the source in use is a reader who will find
 * another way. They will add a new source and change the default, or they will ask
 * an administrator, and withholding the control does not remove the wish, it
 * removes the honest route to it. So the control is drawn on every row and the
 * default is marked, so the consequence is legible rather than surprising. What the
 * Block does not do is confirm, because a bare click that takes a card off file is
 * not a confirmation, and a dialog on three sources and a toast on a fourth are
 * two products' facts. The `actions` slot is where that belongs.
 *
 * **The set is a `ListPanel` and the panel is named by the Block's own heading.**
 * A workspace has a handful of sources and the handful is bounded, so the list
 * needs a place to end and a boundary that says "these and no others". The panel
 * carries no title of its own, because the section heading above it already names
 * the set and a second name in a second element is a second thing that can
 * disagree with the first; `ListPanel` draws an unnamed region honestly rather than
 * inventing one, which is what its own JSDoc says it is for. The cost is that the
 * region is anonymous in the landmark list, and the answer is that a reader walking
 * past a panel of four rows has nothing to navigate to inside it anyway.
 *
 * **The source's name is a `span` and not a heading, and that is the one
 * arrangement this Block shares with a members list rather than with an address
 * book.** A shortlist puts a heading on each item because a reader who has built a
 * list and then navigates by heading wants to land on one of the things they were
 * considering. A source on file is a record rather than a candidate: the reader
 * arrives with two questions, which one is the default and which expires soon,
 * and both are answered by scanning two columns. There is no subsection of this
 * panel a reader would want to jump to, so a heading per source would be entries
 * in the outline that lead nowhere, and the cost of that is a document whose
 * outline says there is more structure here than there is. The name is still the
 * first thing read and it is still the value interpolated into the two control
 * names, so the identity of the row is not in doubt anywhere a reader needs it.
 *
 * **The expiry prints exactly as passed and the words are the caller's.** A Block
 * that formatted the moment would be choosing a locale, a calendar and a
 * granularity on a reader's behalf, and would put `Intl` into every consumer's
 * bundle for a rendering Prism has no stake in. The cost is named rather than
 * hidden: a caller who passes epoch milliseconds and no formatter gets a raw
 * timestamp beside a card a reader recognises, which is honest and almost never
 * what was wanted, and the fix is a formatter in the caller, which is where the
 * knowledge lives anyway.
 *
 * It is a client Component, and the directive is unconditional. The rule this
 * follows is the one `AddressBook01` states in full: a surface that attaches a
 * handler is a client Component, and the directive is on the module rather than in
 * a leaf so that a consumer composing a server page gets the boundary in one place
 * they can see. The cost is that with all three handlers omitted the whole module
 * is still in the client graph, where a static record would have shipped no
 * JavaScript at all; the price was judged worth paying for one boundary rather
 * than three arrangements of the same surface.
 */
export function BillingSource01({
  eyebrow,
  title,
  description,
  sources,
  onSetDefault,
  setDefaultLabel,
  onRemove,
  removeLabel,
  addLabel,
  onAdd,
  empty,
  headingLevel = 'h2',
  className,
}: BillingSource01Props) {
  assertSources({
    sources,
    onSetDefault,
    setDefaultLabel,
    onRemove,
    removeLabel,
    addLabel,
    onAdd,
  })

  return (
    <Section data-slot="billing-source-01" className={cn(className)}>
      <SectionHeading
        as={headingLevel}
        align="left"
        eyebrow={eyebrow}
        title={title}
        description={description}
        className="mb-10"
      />

      {sources.length === 0 ? (
        <p
          data-slot="billing-source-01-empty"
          className="text-muted-foreground max-w-measure-narrow text-pretty text-sm"
        >
          {empty}
        </p>
      ) : (
        <ListPanel
          data-slot="billing-source-01-panel"
          scroll={false}
          actions={
            addLabel === undefined || onAdd === undefined ? undefined : (
              <Button data-slot="billing-source-01-add" type="button" size="sm" onClick={onAdd}>
                <Plus aria-hidden="true" />
                {addLabel}
              </Button>
            )
          }
        >
          <ul data-slot="billing-source-01-list" className="flex flex-col">
            {sources.map((source) => (
              <li
                key={source.id}
                data-slot="billing-source-01-source"
                data-source={source.id}
                data-default={source.isDefault === true ? 'true' : undefined}
                className="border-border flex flex-wrap items-center gap-x-4 gap-y-2 border-b px-4 py-3 last:border-b-0"
              >
                {source.mark === undefined ? null : (
                  /*
                    The caller's own licensed asset in a fixed frame. The frame is a
                    size and a clip and nothing else, so a network's mark and a
                    caller's monogram are the same height whichever they pass, and a
                    source with no mark draws no frame rather than a grey disc where
                    a logo would be.
                  */
                  <span
                    data-slot="billing-source-01-mark"
                    className="bg-muted flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md [&_img]:size-full [&_img]:object-cover"
                  >
                    {source.mark}
                  </span>
                )}

                <div data-slot="billing-source-01-body" className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-sm font-medium">{source.name}</span>
                  <span className="text-muted-foreground flex flex-wrap items-baseline gap-x-2 text-xs">
                    <span>{source.kindLabel ?? source.kind}</span>
                    {source.expiresAt === undefined ? null : (
                      <span data-slot="billing-source-01-expires" className="tabular-nums">
                        {source.expiresLabel === undefined
                          ? source.expiresAt
                          : source.expiresLabel(source.expiresAt, {
                              id: source.id,
                              name: source.name,
                            })}
                      </span>
                    )}
                  </span>
                </div>

                {source.isDefault === true && source.defaultLabel !== undefined ? (
                  /*
                    The default mark, which is a `Badge` and not a `Status` because a
                    default is not a state: nothing is wrong, nothing is pending, and
                    a tinted dot beside it would be drawing a judgement about the
                    source that the caller has not made. The caller's own words are
                    inside the mark, which is the same split `Status` holds with the
                    sentence beside the dot, arranged the other way round because a
                    mark that already says what it is does not need a sentence next
                    to it.
                  */
                  <Badge data-slot="billing-source-01-default" variant="outline">
                    {source.defaultLabel}
                  </Badge>
                ) : null}

                {source.href === undefined || source.hrefLabel === undefined ? null : (
                  <CtaLink
                    data-slot="billing-source-01-link"
                    href={source.href}
                    variant="ghost"
                    size="sm"
                    className="shrink-0"
                  >
                    {source.hrefLabel}
                  </CtaLink>
                )}

                {source.actions === undefined ? null : (
                  <span data-slot="billing-source-01-source-actions" className="shrink-0">
                    {source.actions}
                  </span>
                )}

                <div data-slot="billing-source-01-controls" className="flex shrink-0 items-center gap-1">
                  {/*
                    The set-as-default control, withheld on the row the caller has
                    already marked as the default. That is the one place this Block
                    withholds a control it was given, and the reason is the narrow one
                    `Item` states about a hover tint: a control that offers to set
                    something to the value it already holds is a control that promises
                    a change and does not make one, and a reader who presses it and
                    watches nothing happen has been told by this page that the mark
                    is decorative. Everything else is offered, including remove on the
                    default, for the reason the Block's JSDoc gives at length.
                  */}
                  {onSetDefault !== undefined &&
                  setDefaultLabel !== undefined &&
                  source.isDefault !== true ? (
                    <Button
                      data-slot="billing-source-01-set-default"
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onSetDefault(source.id)}
                    >
                      {setDefaultLabel({ id: source.id, name: source.name })}
                    </Button>
                  ) : null}

                  {onRemove !== undefined && removeLabel !== undefined ? (
                    <Button
                      data-slot="billing-source-01-remove"
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemove(source.id)}
                    >
                      {removeLabel({ id: source.id, name: source.name })}
                    </Button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </ListPanel>
      )}
    </Section>
  )
}

export default BillingSource01
