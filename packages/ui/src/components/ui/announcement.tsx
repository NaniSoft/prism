'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import { XIcon } from 'lucide-react'
import { useState, type ComponentProps, type ReactNode } from 'react'

import { Button } from './button'
import { cn } from '../../lib/utils'

/**
 * The surface and the five tones, and nothing else.
 *
 * **Every tone states its own fill AND its own ink, which is the Stated Ink Rule
 * and not a style preference.** An announcement is a bar of body text sitting on
 * a coloured surface, and a bar is a surface, so an ink left to be inherited is
 * not the page's foreground by accident: it is whatever happened to be behind the
 * viewport, and the failure `Cta01` measured was 1.01:1 on a filled `bg-primary`
 * band. That number is the whole argument. A tone that set only a fill would be
 * the same bar in a different colour, and no gate in this repository could see
 * it, because the token gate measures token pairs rather than what a Component
 * leaves out.
 *
 * The five are the five the semantic contract publishes, and each is a fill with a
 * matched ink rather than a colour chosen to look right: `neutral` is the muted
 * surface, `info` is the pack's own primary, and `success`, `warning` and
 * `destructive` are the three status roles. `info` using the pack's brand hue is
 * the decision worth naming, because a reader has been trained to read a saturated
 * brand bar as a brand, and an informational notice is the one message in this
 * package that is not about the brand. It is a notification rather than a
 * decoration, the pack hue is the strongest ink the contract offers on a coloured
 * surface, and the alternative, a blue that exists in no token, is a colour this
 * package would have to hold rather than inherit.
 */
const announcementVariants = cva(
  'relative flex w-full items-center gap-3 rounded-lg border px-4 py-2.5 text-sm',
  {
    variants: {
      variant: {
        neutral: 'border-border bg-muted text-foreground',
        info: 'border-transparent bg-primary text-primary-foreground',
        success: 'border-transparent bg-success text-success-foreground',
        warning: 'border-transparent bg-warning text-warning-foreground',
        destructive: 'border-transparent bg-destructive text-destructive-foreground',
      },
    },
    defaultVariants: { variant: 'neutral' },
  },
)

/** The five tones an announcement carries, and the five the contract publishes. */
export type AnnouncementTone = NonNullable<
  VariantProps<typeof announcementVariants>['variant']
>

/** The props an `Announcement` takes. */
export type AnnouncementProps = Omit<ComponentProps<'div'>, 'children'> & {
  /**
   * The message itself: the one sentence, or the short block, the reader has to
   * act on or know about.
   *
   * Required, because an announcement with no message is a coloured bar, and a
   * coloured bar across the top of a page is a thing a reader stops trusting the
   * moment it appears for no reason. It is a `ReactNode` rather than a `string`
   * so the caller can put an emphasis or a link inside it, and it is the reason
   * the native `title` attribute is removed from the pass-through rather than
   * forwarded: the two names are the same words with opposite consequences, and an
   * announcement forwarding both would say the sentence twice to a mouse reader
   * and once to a keyboard reader, in a surface whose whole job is to say one
   * thing.
   */
  message: ReactNode
  /**
   * The action the reader can take about the message, as a slot.
   *
   * A slot and not a label and a handler, and the reason is the same one
   * `Toast` gives: the action is never the only route to what it does. A bar at
   * the top of a page that a reader can dismiss, scroll past, or never see at all
   * is the wrong place for the only link to the thing it is about. So the caller
   * supplies their own real element, with their own destination, and whatever
   * that action leads to has to be reachable from the page the reader is already
   * on. A slot is also what makes the caller's word the word: this package ships
   * in at least two languages and it will not ship an action's label.
   */
  action?: ReactNode
  /**
   * The accessible name of the dismiss control.
   *
   * Required whenever the bar is dismissible, and not defaulted, for the reason
   * every accessible name in this package is a prop: an icon-only control a
   * reader reaches towards has to say what it is before they press it, and a
   * default of "Close" is a sentence four consumer products in two languages
   * cannot all be given.
   */
  dismissLabel?: string
  /**
   * Whether the bar can be dismissed at all.
   *
   * Off by default. An announcement a reader cannot dismiss is a notice, which is
   * a real thing to want; an announcement a reader can dismiss but whose
   * dismissal goes away on the next page load is a bar that lies about having
   * been read, which is why `onDismiss` exists.
   *
   * @defaultValue false
   */
  dismissible?: boolean
  /**
   * Called when the reader dismisses the bar, so the caller can take it off the
   * page for good: remove it from their state, record it against the message it
   * was about, or stop rendering it.
   *
   * The bar hides itself either way; this is the caller's half of the dismissal
   * and the part that outlives the page. See the JSDoc on the Component for why
   * Prism does not do it.
   */
  onDismiss?: () => void
  /**
   * Which of the five tones the bar carries. @defaultValue 'neutral'
   */
  tone?: AnnouncementTone
  /** Layout only, exactly as on every Component. */
  className?: string
} & (
  | {
      /** A dismissible bar, which therefore owes its dismiss control a name. */
      dismissible: true
      dismissLabel: string
    }
  | {
      /**
       * A bar that cannot be dismissed, and so owes no name to a control it does
       * not render.
       */
      dismissible?: false
      dismissLabel?: never
    }
)

/**
 * A page-level message bar, with an optional action and an optional dismiss.
 *
 * **The order is message, then action, then dismiss, and the order is a decision
 * about where the eye goes rather than about the markup.** The message comes
 * first because it is the reason the bar exists: a reader who reads nothing else
 * has still got the thing they needed to know. The action comes second because it
 * is what to do about the message, and a reader who wants to act should not have
 * to find the control. The dismiss comes last because it is the one control in
 * the bar that is about the bar rather than about the message, and a reader who
 * reaches for it has already read the message. Reversing the last two is the
 * mistake a flex row makes by accident, and it costs a reader who wanted to act:
 * they reach for what they read as the close control and dismiss the thing they
 * came to read. The cost of the order is that on a narrow screen the three parts
 * compete for one line, which is why the action is a slot the caller can keep to
 * one word.
 *
 * **Every tone states its own fill and its own ink, and the reason is a measured
 * failure rather than a preference.** This is a coloured surface with body text
 * on it, so an inherited ink is not the page's foreground by accident: it is
 * whatever was behind the viewport, and `Cta01` measured 1.01:1 on exactly that
 * arrangement. The variant table above sets both halves of every tone, and the
 * cost of that is a longer string per tone than a fill alone would need, which is
 * a fair trade for a bar that cannot become unreadable by being moved.
 *
 * **The region is a `status` and not an `alert`, and the difference is whether the
 * reader is interrupted.** An announcement is in the document rather than arriving
 * into it: it is there on first paint, a reader can find it by browsing, and it
 * is not a consequence of the thing they were doing a moment ago. `role="alert"`
 * is an assertive live region, which cuts across whatever the reader was reading
 * and reads it out immediately, and that is right for a failure the reader caused
 * and has to fix, which is an `Alert` beside the control or a `Dialog` when it
 * blocks. An announcement is a notice, and a notice that interrupts is a notice
 * the reader stops reading. The cost is real: a reader who arrives mid-page and
 * never looks up misses the bar entirely, and the fix for that is the caller's
 * placement, not a louder role.
 *
 * **A dismissed bar hides itself, and Prism does not persist that.** The state is
 * local to the mounted bar, so a reload brings the message back, which is the
 * honest behaviour for a notice about something that is still true. A stored
 * dismissal is a different thing and a deliberate act: it is a record in a
 * consumer's storage that says this reader has already been told, and that record
 * outlives the message. When it expires, when it is scoped to a message id rather
 * than a page, whether a notice about an incident is dismissible at all, and
 * whether a reader who changes a setting should be told again, are four decisions
 * about the consumer's product and its data, and Prism will not make any of them
 * from inside a bar. So `onDismiss` is the seam: the bar hides itself so the
 * reader is not looking at a thing they dismissed, and the caller is told so the
 * half that outlives the page is theirs. The cost is that a caller who wants a
 * dismissible-once notice writes the storage themselves, and a caller who writes
 * nothing gets a notice that comes back, which is the safe default.
 *
 * It is a client Component, and the state is the whole reason. Hiding the bar on
 * dismiss is one piece of state; there is no clock, no effect and no timer, so
 * the client cost is the bar and not a running loop.
 */
function Announcement({
  message,
  action,
  dismissLabel,
  dismissible = false,
  onDismiss,
  tone,
  className,
  ...props
}: AnnouncementProps) {
  const [open, setOpen] = useState(true)

  if (!open) return null

  return (
    <div
      data-slot="announcement"
      role="status"
      className={cn(announcementVariants({ variant: tone }), className)}
      {...props}
    >
      <div data-slot="announcement-message" className="min-w-0 flex-1 text-pretty">
        {message}
      </div>

      {action === undefined ? null : (
        <div data-slot="announcement-action" className="flex shrink-0 items-center">
          {action}
        </div>
      )}

      {dismissible ? (
        <Button
          type="button"
          data-slot="announcement-dismiss"
          variant="ghost"
          size="icon"
          aria-label={dismissLabel}
          onClick={() => {
            setOpen(false)
            onDismiss?.()
          }}
          /*
           * The ghost variant's two hover declarations are replaced rather than
           * kept, and this is the Stated Ink Rule applied one level in. A ghost
           * button inherits its ink, so on this bar it inherits the tone's ink,
           * and `hover:bg-accent` with `hover:text-accent-foreground` would put
           * that ink on the accent surface instead of the tone's. So the hover
           * changes the opacity and nothing else: the fill and the ink that were
           * measured together stay exactly as they were, and the reader still gets
           * the press feedback. `text-inherit` is how that is spelled, and it
           * resolves to the bar's own tone ink rather than to a second one.
           * `size-7` is below the 9 the icon variant draws, and the coarse-pointer
           * size above it is left alone, so a finger still gets 44px.
           */
          className="hover:bg-transparent hover:text-inherit opacity-70 transition-opacity duration-fast ease-out hover:opacity-100 size-7 shrink-0"
        >
          <XIcon aria-hidden="true" className="size-4" />
        </Button>
      ) : null}
    </div>
  )
}

export { Announcement }
