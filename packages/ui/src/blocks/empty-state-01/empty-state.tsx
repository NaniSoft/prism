import type { ReactNode } from 'react'

import { Button } from '../../components/ui/button'
import { cn } from '../../lib/utils'

/**
 * The four reasons a region has nothing in it.
 *
 * **Four, and the set is closed at four because the four want different words and
 * different actions, so a consumer who cannot say which one they have writes
 * "No data".** That is the whole failure this Block exists to prevent, and it is
 * a failure rather than a style preference because all four answer one question
 * and the reader acts on each answer differently. The question is what happened
 * to the collection this region would have drawn:
 *
 * - `first-run` - nothing has ever existed here. The reader is not blocked, they
 *   are at the beginning, and the action is to *make the first one*. A sentence
 *   that says nothing is available and an action that creates is the whole state.
 * - `no-match` - things exist and the reader's own narrowing removed all of them.
 *   The reader is not at the beginning and nothing is missing; the action is to
 *   *widen or clear the narrowing*, and offering to create something here invents
 *   work the reader does not need.
 * - `emptied-by-reader` - things existed here and this reader's own earlier action
 *   moved every one of them out of it. The reader is not at the beginning either,
 *   and nothing is missing or hidden: this is a bin the reader has just cleared.
 *   There is no action *in this region*, because a reader who has deleted nothing
 *   has nothing to restore, and restoring is a per row command and a batch action
 *   in the surrounding surface, on the caller's own nodes.
 * - `not-permitted` - things exist and this reader may not see them. The action
 *   is to *ask for access or change context*, and a create action here is a lie
 *   about what the reader can do, which is worse than no action at all.
 *
 * **Two of the four are the reader's own doing, and a narrowing and a deletion are
 * not the same doing, so they are two members rather than one.** `no-match` hides
 * rows out of a set that is still there, so clearing it brings them back;
 * `emptied-by-reader` is a record that is gone from the live set rather than hidden
 * in it, and the reader put it there. Every saved view a caller builds out of the
 * filter values it holds is already `no-match` and wants no member of its own,
 * because a view that matches nothing is a narrowing that came back empty. A trash
 * view is the one that differs in kind rather than in content: it is a different
 * collection the caller chose to fetch rather than a narrowing of this one. So the
 * two differ in exactly the fact a reader must be told honestly, which is whether
 * the records are still there behind the narrowing or gone and only the caller can
 * bring them back. One sentence for both would tell a reader who has deleted
 * everything that their own search found nothing.
 *
 * **A fifth such as `error` or `loading` is deliberately absent:** those are states
 * the surrounding surface already owns, and a region that is erroring has an
 * `Alert` and a region that is loading has a `Spinner`. A Block that drew them
 * would give a consumer two places to put the same fact.
 *
 * @see EMPTY_REASONS
 */
export const EMPTY_REASONS = ['first-run', 'no-match', 'emptied-by-reader', 'not-permitted'] as const

/**
 * One of the four reasons a region has nothing in it.
 *
 * The reason is a machine value and never reader-facing text. The words are the
 * consumer's: two products call the same state "Nothing here yet" and "Your
 * account is new", and neither sentence is Prism's to publish.
 */
export type EmptyReason = (typeof EMPTY_REASONS)[number]

/**
 * The one thing that differs between the four frames.
 *
 * **The frame is shared and the difference is an ink, and that is a decision
 * about honesty rather than about looks.** All four get the same dashed edge and
 * the same floor under them, because all four mean *there is nothing here to
 * read*. What they must not share is a claim about why, and a tint or a border
 * hue would be one: a region drawn in a warning colour tells the reader their
 * filter, their own deletions, or their permissions are a problem, and in the last
 * two cases it is not.
 *
 * So only `not-permitted` carries an ink, and it is `muted-foreground` rather
 * than a destructive tone. A permission boundary is not a failure, and painting
 * it red teaches a reader to ignore red for the things that are urgent. The
 * distinction the reader actually needs is *you cannot see this* against *this is
 * broken*, and the words carry it; the frame says only that the region is empty,
 * which is true of all four. `emptied-by-reader` carries no ink for the same
 * reason: a reader who emptied a bin did it themselves, nothing is broken, nobody
 * is blocked, and nothing is missing that the caller cannot restore.
 */
const REASON_INK: Partial<Record<EmptyReason, string>> = {
  'not-permitted': 'text-muted-foreground',
}

/**
 * The props an EmptyState01 takes.
 *
 * Every string is a prop and the Block ships none: no headline, no sentence, no
 * action label and no reason word. A Block that rendered "No data" would put a
 * sentence about a product that is not its own into four consumer sites, and the
 * corpus publishes it as the design system's own voice.
 */
export type EmptyState01Props = {
  /**
   * Which of the four situations this is. Required rather than defaulted,
   * because the default would be the one that hides the bug: a Block that
   * defaulted to `first-run` would render a create action beside a permission
   * boundary, and a Block that defaulted to `no-match` would tell every reader
   * their own filter removed something on their first visit. Making the caller
   * name the reason is what stops either from happening quietly, and it is what
   * separates the two the reader emptied themselves: passing `no-match` beside a
   * bin the reader just cleared says their search found nothing in it, which is
   * false, because nothing there was there to be filtered.
   */
  reason: EmptyReason
  /**
   * The headline: what is not here, in the reader's own words. Required, because
   * the Block's only job is to carry a sentence and a reason together, and a
   * region with a frame and no words is a box a reader has to interpret.
   */
  title: string
  /**
   * The sentence under the headline, for the part the headline cannot fit: what
   * to do about it, or what the reader should know before they act. Omit it when
   * the headline is the whole message.
   */
  body?: string
  /**
   * The label of the one action, in the product's own words.
   *
   * Optional, and its absence is a legitimate state rather than a gap: a region
   * a reader cannot act on - a permission boundary, a bin the reader has just
   * emptied, an archived-only view, a feature that is switched off for their plan
   * - has no next step *in this region*, and inventing one is how an empty state
   * ends up offering a reader a button that cannot help them. `reason` does not
   * require it either, because the same rule applies across the four: the action
   * exists when the reader has something to do here. For `emptied-by-reader` the
   * next step is elsewhere by construction, since the records to restore are the
   * caller's own nodes and their restore command belongs to the index around this
   * region.
   */
  actionLabel?: string
  /**
   * The handler for `actionLabel`. Required whenever `actionLabel` is passed, and
   * the Block throws without it rather than rendering a button that does nothing:
   * a disabled-looking control with no `disabled` is a control that lies.
   */
  onAction?: () => void
  /**
   * The mark above the words, as a slot.
   *
   * A slot and not an icon the Block picks, because the mark that means "nothing
   * here yet" and the mark that means "you cannot see this" are different marks,
   * and a Block that chose one would give four products an icon that is wrong for
   * one of the four reasons. It is `aria-hidden` wherever a consumer puts it: the
   * reason is carried by the words, and an icon a screen reader reads is a second
   * announcement of the same sentence.
   */
  icon?: ReactNode
  /**
   * Layout only, exactly as on every Component and Block. Changing a Prism-owned
   * visual property from here is prohibited.
   */
  className?: string
}

/**
 * The state a region shows when it has nothing in it: a framed mark, a headline,
 * a sentence and at most one action.
 *
 * **The design decision is the `reason` prop, and it is the reason this is a Block
 * rather than a Component.** An empty state looks like one thing, which is why it
 * has been written by hand in every product that has one, and it is actually four
 * things that need different words and different actions. A component with a
 * `title` and a `body` and an `action` cannot express the difference, so every
 * consumer re-decides it in their own words and at least one of them gets it
 * wrong: a permission boundary that offers "Create your first project", a
 * first-run state that says "No results found", or a bin the reader has just
 * emptied that says their filter matched nothing. Naming the reason forces the
 * decision into the open and gives the Block something to enforce.
 *
 * **A Block and not a Component because it is a composition of five decisions
 * rather than one control.** A mark, a headline, a sentence, an action and a
 * region-sized frame: each of those has been re-decided by hand in every product
 * that has an empty state, and `DESIGN.md` records the resolution of the retired
 * `empty` Component as exactly this shape. It ships no copy, takes no data and
 * fetches nothing.
 *
 * **The region keeps its size.** The frame is a `min-h-*` and a dashed border
 * rather than a fixed height, and it is drawn with `size-*` on the mark, because
 * an empty state is what a region looks like *before* its content arrives. A
 * region that is one line tall while it is empty and forty lines tall once it is
 * full moves everything below it twice, and the reader's eye has to find the
 * thing twice. This is the same layout shift the `Spinner` records as its own
 * honest cost, and the reason a `first-run` frame wants a floor under it.
 *
 * **The action is one, and it is not required.** An empty state offering three
 * actions is a form, and a form in a region that has nothing in it is a form with
 * nothing to submit. One action is the next step; the rest belong in the
 * surrounding surface, where the reader can see them without this region
 * competing. `emptied-by-reader` is the case where there is provably no next step
 * in the region at all, because the records a reader could restore are not in it.
 *
 * **All four are statements about a collection, and that is what keeps the fourth
 * one here rather than beside `NothingChosen01`.** Each answers what happened to
 * the set this region would have drawn, so the frame the four share stays true of
 * all four: there is nothing here to read. A bin the reader emptied has no
 * readable neighbour to make that frame a lie beside it, because everything it
 * would have drawn is gone. `NothingChosen01` is the opposite claim in a region
 * whose records are all still there, which is why it is a Block of its own and
 * not a fifth reason here; `DESIGN.md` holds that argument in full.
 *
 * It is a server Component. It holds no state and imports no client code, so a
 * consumer that passes a client action inside it pays for the action and not for
 * the frame.
 */
export function EmptyState01({
  reason,
  title,
  body,
  actionLabel,
  onAction,
  icon,
  className,
}: EmptyState01Props) {
  if (actionLabel !== undefined && onAction === undefined) {
    throw new Error(
      `EmptyState01: an actionLabel of '${actionLabel}' was passed with no onAction, so the button ` +
        'would read as available and do nothing. Pass the handler, or drop the label and leave the ' +
        'region without a next step.',
    )
  }

  return (
    <div
      data-slot="empty-state"
      data-reason={reason}
      className={cn(
        // Centred and given a floor under it, because this is the whole of the
        // region rather than a note beside content. `min-h-64` is roughly six
        // lines, which is what a full page of rows costs; a shorter empty state
        // makes the region jump when its content arrives.
        'border-border bg-card flex min-h-64 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-8 text-center',
        REASON_INK[reason],
        className,
      )}
    >
      {/*
        The mark, hidden from assistive technology. `flex-none` so a large icon
        cannot be squeezed by the min-height floor, and `aria-hidden` because the
        reason is in the words and an icon a screen reader reads is the same
        sentence twice.
      */}
      {icon === undefined ? null : (
        <div data-slot="empty-state-icon" aria-hidden className="text-muted-foreground flex-none">
          {icon}
        </div>
      )}

      {/*
        A `<p>` and not a heading, and this is the Block's most consequential
        choice. An empty state is not a section of the document: it is the absence
        of one, and it is replaced by content that will be a sibling of whatever
        introduced it. A heading here puts an entry in the outline that vanishes
        the moment data arrives, and a reader navigating by heading selects
        "No invoices" and lands on a page where the entry no longer exists.
      */}
      <p data-slot="empty-state-title" className="text-base font-semibold text-balance">
        {title}
      </p>

      {body === undefined ? null : (
        <p
          data-slot="empty-state-body"
          className="text-muted-foreground max-w-measure-narrow text-pretty text-sm"
        >
          {body}
        </p>
      )}

      {actionLabel === undefined ? null : (
        <Button
          data-slot="empty-state-action"
          type="button"
          className="mt-2"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

export default EmptyState01
