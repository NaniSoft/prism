'use client'

import { useId, type ReactNode } from 'react'

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '../../components/ui/dialog'
import { FactList, type Fact } from '../../components/ui/fact-list'
import { type HeadingLevel } from '../../components/ui/section'
import { cn } from '../../lib/utils'

/**
 * The three widths a quick view is drawn at, which is what the size prop selects.
 *
 * Named for what it selects rather than for the word variant, because in this
 * package a name ending in `Variant` is the shape that names a cva recipe and the
 * surface gate refuses it. Three steps rather than arbitrary values, so a quick view
 * is always at a width the type and layout scales authored, and so the arrangement
 * is a decision a caller makes by choosing a size rather than by writing utilities.
 */
export type QuickView01Size = 'sm' | 'md' | 'lg'

/**
 * One line of the summary, as a term and its answer.
 *
 * The same shape and the same reason as `Offering01Fact`: `label` is a string
 * because a column of terms is read by scanning the left edge and a term that wraps
 * costs every other row its alignment, and `value` is a node because the answers on
 * a quick view are not all strings.
 */
export type QuickView01Fact = {
  /** The line's stable key, so a caller can address one by name. */
  id: string
  /** What is named, in the product's own words. */
  label: string
  /** The answer. A string, or any node a caller composes. */
  value: ReactNode
}

/**
 * The width each size takes, as an authored step rather than an arbitrary value.
 *
 * Applied at the `sm` breakpoint and above, so on a phone the panel is the width the
 * viewport gives it with its own padding either way, and the three sizes only decide
 * how much of the page the panel occupies once there is room to decide it.
 *
 * **The three are overlay widths rather than steps of a size scale**, and that is the
 * whole reason the token build closes Tailwind's own container namespace. These used
 * to be spelled with three of its steps, which ship at the same values, so nothing
 * rendered differently; what they cost was that the widest step also meant something
 * on a page, and a retune of this panel would have moved the panel and left the page.
 * An overlay's width is a property of the kind of surface it is, so it is named for
 * that surface and it moves on its own or not at all. The retired names are written
 * here in prose rather than as classes because Tailwind's extractor reads this file's
 * comments, and a class recorded in a JSDoc block is a class the sheet emits.
 */
const WIDTH: Record<QuickView01Size, string> = {
  sm: 'sm:max-w-overlay-panel',
  md: 'sm:max-w-overlay-dialog',
  lg: 'sm:max-w-overlay-form',
}

/**
 * The props a QuickView01 takes.
 *
 * Every word in the panel is a prop and the Block ships none: not the name, not the
 * body, not one line of the summary, not the mark and not the words on its own close
 * control. A Block that wrote any of them would put a sentence about somebody else's
 * product into every consumer's page, inside a design system rather than inside a
 * product's copy, which is where a translation tool is least likely to look.
 */
export type QuickView01Props = {
  /**
   * Whether the panel is open, as the caller holds it.
   *
   * Required and controlled, and this Block owns no state at all. The trigger belongs
   * to the caller rather than to this Item, because a trigger is a claim about where
   * the control goes: a card's whole tile, a button beside a name, a row in a table,
   * a keypress on a focused cell. A Block that drew its own trigger would have to
   * pick one of those, and every one of the four is right somewhere.
   */
  open: boolean
  /**
   * Called when the reader dismisses the panel, by Escape, by the outside press or
   * by the close control, and with `true` when they open it again.
   *
   * The caller holds the value because the caller opened it, and a controlled panel
   * is what lets a caller's own state close the panel when the thing it describes has
   * gone: a row deleted, a filter that no longer includes it, a route that moved.
   */
  onOpenChange: (open: boolean) => void
  /** The panel's title, drawn at the heading level the caller asked for. */
  title: ReactNode
  /** The short body under the title. */
  body?: ReactNode
  /** The lines of the summary, as the caller's own facts. See `QuickView01Fact`. */
  facts?: readonly QuickView01Fact[]
  /**
   * A mark for the thing being summarised: a `ProductMark`, an icon, a monogram.
   *
   * Optional and additive. A panel that reserves room for a mark that is not there is
   * a hole, and the title is what the panel is for. It is drawn in a tinted square so
   * a coloured mark has a ground to sit on whatever the caller passes, and the caller's
   * mark is never the panel's name: the name is `title`, and the panel is named by
   * that alone.
   */
  mark?: ReactNode
  /**
   * Up to two actions, in the panel's own footer.
   *
   * "Up to two" is the honest shape of a summary rather than a cap this Block
   * enforces, and the reason is that a slot cannot be counted: `actions` may be one
   * node, an array, or a fragment, and a Block that tried to measure which would be
   * measuring React's shape rather than the caller's intent. Three actions is where a
   * summary stops being a summary and becomes a page, and a panel with three actions
   * is a page that a reader cannot link to, cannot bookmark and cannot go back from.
   * The cost is that nothing stops it, and the JSDoc says so rather than pretending a
   * prop could.
   */
  actions?: ReactNode
  /**
   * The accessible name of the panel's own close control.
   *
   * Required, and the reason is the whole of the control's existence. `Dialog` draws
   * a dismiss control in its corner whenever it is given one, and that control is the
   * one thing every reader needs a name for: an icon-only button with no name is
   * announced as "button". It is a prop rather than a default so a product whose
   * interface never uses the word this package's default would carry is a consumer
   * who cannot fix it. See `DialogContentProps.closeLabel` for the same prop on the
   * Component, whose default this Block deliberately does not inherit.
   */
  closeLabel: string
  /**
   * Heading level for the title.
   *
   * Defaults to `h2`, and the default is a claim worth stating rather than a shrug.
   * A dialog is a transient surface, but its title is still a heading in the outline
   * of the page that opened it, and a reader navigating by heading who opens a quick
   * view from a card under an `h3` section would meet an `h2` announcing a thing two
   * levels above its own section. So the level follows the document, exactly as it
   * does for a card title inside a grid, and the caller who opens the panel from
   * inside a card passes that card's level. See `HeadingLevel`.
   */
  headingLevel?: HeadingLevel
  /**
   * How wide the panel is once there is room to decide it.
   *
   * `sm` is a line of two or three facts. `md` is the default and is right for a
   * summary with a body paragraph. `lg` is for a summary carrying a specification
   * with more than four lines, where anything narrower wraps every note onto two.
   *
   * @defaultValue 'md'
   */
  size?: QuickView01Size
  /**
   * Layout only, exactly as on every Block and every Component. Changing a
   * Prism-owned visual property from here is prohibited; the panel's width is the
   * `size` prop.
   */
  className?: string
}

/**
 * A summary panel a reader opens without leaving the page, composed into a `Dialog`
 * the caller controls.
 *
 * **A quick view may not be the only place the information exists, and that is the
 * rule this Block exists to enforce.** Everything a quick view shows, a reader must
 * be able to reach some other way: the card underneath, a row in the table behind it,
 * a section further down the page. That is the same law `Carousel` states about
 * everything a carousel shows, and a quick view is a carousel's mistake with a dialog
 * instead of a slider: it hides content behind a deliberate act, it costs the reader a
 * modal and a focus trap to see, and it takes the content off the page when they
 * close it. A carousel whose images exist nowhere else is a set of images a reader on
 * a keyboard, on a screen reader, or with the controls hidden by a stylesheet cannot
 * see at all; a quick view whose specification exists nowhere else is a specification
 * a reader has to know exists before they can find it. `Carousel` puts the rule in
 * its documentation because the Component cannot detect the case, and this Block puts
 * it in its documentation for the same reason. **This Block cannot enforce it.** There
 * is no prop that would tell it the page also carries the summary, and a Block that
 * took one would take a boolean a caller could pass and forget. So the law is stated
 * here, where a caller meets it, and the caller is the only party who can keep it.
 *
 * **The storefront version of this pattern is a quick-view modal on a product tile,
 * and the translation is the noun in the panel.** What that panel shows is an item
 * for sale: its name, one paragraph, three or four attributes, the price, and an add
 * to basket button. Every part of the layout transfers unchanged, and the parts are
 * the same parts a reader of a capability page meets: a title, a standfirst, a
 * specification, a price. What does not transfer is the noun and the transaction. The
 * panel here summarises a capability the product offers, a capture source, an agent, a
 * connector, a tier, and the action at the bottom is a decision rather than a purchase,
 * so there is nothing to add to a basket and nothing to check out. What survives the
 * translation is the reason the pattern exists at all, which is that a reader wants to
 * know whether a capability is the right one before they leave the page they are on to
 * find out.
 *
 * **The overlay is `Dialog`, and the argument is the same one `Lightbox` makes about
 * `Dialog` and `Gallery01` makes about `Lightbox`.** A panel built on a `div` and a
 * `keydown` listener gets the Escape key and no focus trap, so a keyboard reader tabs
 * behind the panel into a page they cannot see, and the defect is invisible in review
 * because the panel works for the person writing it. The focus trap, the restore of
 * focus to whatever opened it, the Escape key, the outside press, the scroll lock and
 * the portal all come from `Dialog` and are all solved once. What this Block adds is
 * the three things `Dialog` does not know about: the summary's own shape, the title at
 * the caller's heading level, and the statement of the law above. The cost is the one
 * required prop, `closeLabel`, which is a real departure from the shape the rest of
 * this wave uses and is stated on that prop.
 *
 * **The title is this Block's own heading rather than `DialogTitle`, and the reason
 * is the heading level.** `DialogTitle` renders an `h2` and takes no `render` prop in
 * this package, so a Block that composed it would put an `h2` in the outline of
 * whatever page opened the panel, at whatever depth the page was composed. The title
 * is therefore drawn at `headingLevel` and the panel is named by it through
 * `aria-labelledby`, which is the attribute a dialog's accessible name comes from
 * whichever element carries it. The cost is stated rather than hidden: the naming is
 * wired here rather than by `Dialog`, so a caller who reaches past this Block for
 * `Dialog` directly gets `Dialog`'s own behaviour back, which is the right default and
 * the reason the seam is small.
 *
 * **This Block does not compose `Section`, and that is a decision rather than an
 * oversight.** Every other Block in this package opens with `Section` so it inherits
 * the container and the vertical rhythm. A modal has no container to inherit: `Section`
 * is the page column with the page's vertical padding, and putting that inside a
 * panel that is at most `max-w-overlay-dialog` produces a page layout applied to a
 * four-hundred pixel box. `DialogContent` already owns the padding and the gap, and
 * `Lightbox` and `SearchDialog` are absent from `Section` for the same reason. The
 * corollary is that this Block draws no `SectionHeading` either, and its heading is
 * its own element, aligned flush left by construction rather than by a prop.
 *
 * **The specification is `FactList`, and the panel draws no more than the caller
 * passes.** A quick view that grew its own layout for a longer summary would be a
 * Block competing with the page it summarises. The honest cost of that restraint is
 * visible: a summary carrying more than about six lines is a page, and a reader who
 * needs it should open the page.
 *
 * **The mark is drawn in a tinted square and names nothing.** A mark beside a title is
 * a wayfinding mark, and a wayfinding mark that announced itself would give the panel
 * two names. The caller's mark is drawn as passed; if it is an image the caller gives
 * it its own description, and if it is decorative the caller marks it so.
 *
 * **It is a client Component**, and the reason is the `Dialog` it composes rather than
 * anything this Block does: `Dialog` is a client module, and a server Component
 * composing a client Component would be a server Component holding a modal's focus
 * trap without the modal. It owns no state of its own, so the client cost is `useId`
 * for the title's id and nothing else, and every prop crossing into it is data except
 * `onOpenChange`, which is a handler the caller already holds in a client graph.
 */
export function QuickView01({
  open,
  onOpenChange,
  title,
  body,
  facts,
  mark,
  actions,
  closeLabel,
  headingLevel = 'h2',
  size = 'md',
  className,
}: QuickView01Props) {
  /*
   * The id the panel is named by. `Dialog` computes its own `aria-labelledby` from
   * whichever `DialogTitle` is mounted, and there is none here because the title is
   * this Block's own heading at the caller's level, so the name is wired through this
   * id instead. See the JSDoc above for why the heading is not `DialogTitle`.
   */
  const generated = useId()
  const titleId = `${generated}-title`

  const Title = headingLevel

  /*
   * The caller's lines, in the shape `FactList` draws. The mapping is one line and it
   * is the reason this Block takes its own `QuickView01Fact` rather than importing
   * `Fact`: a line in a summary is keyed, because a caller assembling a panel's
   * contents outside JSX has to name each row to type the array, and `Fact` has no key.
   */
  const summary: Fact[] = (facts ?? []).map((fact) => ({
    label: fact.label,
    value: fact.value,
  }))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-slot="quick-view-01"
        data-size={size}
        // The panel's accessible name is the title element below, at the level the
        // caller asked for rather than at the `h2` `DialogTitle` would have used.
        aria-labelledby={titleId}
        closeLabel={closeLabel}
        className={cn(WIDTH[size], className)}
      >
        <DialogHeader
          data-slot="quick-view-01-header"
          className={mark === undefined ? undefined : 'flex-row items-start gap-3'}
        >
          {mark === undefined ? null : (
            <span
              data-slot="quick-view-01-mark"
              className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-md"
            >
              {mark}
            </span>
          )}

          <Title id={titleId} className="text-lg leading-none font-semibold tracking-tight">
            {title}
          </Title>
        </DialogHeader>

        {body === undefined ? null : (
          <div
            data-slot="quick-view-01-body"
            className="text-muted-foreground text-pretty text-sm"
          >
            {body}
          </div>
        )}

        {/*
          The summary, and nothing else. `FactList` renders nothing at all for an
          empty list, so a panel with no summary does not get an empty frame between
          its body and its actions, and it is a real `<dl>` so a screen reader
          announces each line's term before its answer.
        */}
        <FactList facts={summary} />

        {actions === undefined ? null : (
          <DialogFooter data-slot="quick-view-01-actions">{actions}</DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default QuickView01
