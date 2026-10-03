'use client'

import { ChevronLeftIcon, ChevronRightIcon, XIcon, ZoomInIcon, ZoomOutIcon } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'

import { cn } from '../../lib/utils'
import { Dialog, DialogClose, DialogContent, DialogTitle } from './dialog'

/** One image in the rail, and the words that describe it. */
type LightboxThumbnail = {
  /** The image, at the size a thumbnail is drawn. */
  src: string
  /** The caller's description of it, and the button's accessible name. */
  alt: string
}

/** The props the Lightbox accepts. */
export interface LightboxProps {
  /** Whether the dialog is open. */
  open: boolean
  /** Called when the reader closes the dialog, by any route. */
  onOpenChange: (open: boolean) => void
  /** The image being shown, at the size it should be shown at. */
  src: string
  /**
   * The image's description, and required.
   *
   * Required because an enlarged image is the whole point of this Component and
   * an unnamed one is not enlarged, it is merely bigger: a lightbox with no
   * description is a picture a reader can see more of and still not read, and the
   * reader has paid a modal, a focus trap and an Escape key for it. It is also
   * the name the dialog falls back to when the caller passes a caption this
   * Component cannot turn into a title, so it is load bearing twice.
   */
  alt: string
  /**
   * The sentence under the image, in the caller's words.
   *
   * A string here becomes the dialog's visible name as well as its caption,
   * because one sentence naming a figure is better than the same sentence twice
   * in two places. A node is drawn under the image and the dialog is named by
   * `alt` instead, which is the cost of a node: a node may be an image, a list
   * or a piece of formatting, and a dialog's name has to be a string.
   */
  caption?: ReactNode
  /**
   * The other images, in order, and the rail of buttons that reaches them.
   *
   * The rail is drawn only when this is given and holds more than one, because a
   * rail of one is a picture of the picture you are already looking at. When it
   * is given, `src` and `alt` are expected to be the entry at the current index,
   * and moving the rail asks for a new index rather than moving the image: the
   * caller owns the data and this Component owns the words a reader hears.
   */
  thumbnails?: readonly LightboxThumbnail[]
  /**
   * Which image is showing, zero based. Omit it for an uncontrolled lightbox
   * that remembers where it was.
   *
   * A number and not a required prop, matching `Carousel`: a lightbox with one
   * image has nothing to move between, and a caller who passes `thumbnails`
   * should pass this too, which is the arrangement the type cannot enforce and
   * the documentation has to.
   */
  index?: number
  /** Called with the image the reader asked for. */
  onIndexChange?: (index: number) => void
  /**
   * The accessible name of the zoom control. Required.
   *
   * A prop and not a word, because this package ships no string a consumer
   * cannot localise, and a control is the clearest case of one: a button whose
   * label reads "Zoom" in a product whose interface says something else is a
   * control the consumer cannot fix without patching the library. The same
   * reasoning as `check-block-copy`'s account of the dialog's close button, which
   * is the finding that made this a rule rather than a preference.
   *
   * One name for a two state control, and the state is announced with
   * `aria-pressed`, so a reader hears the name and then whether the image is
   * currently at actual size. That has a consequence for the word: it should be
   * a noun for the thing being changed, such as "Image size", rather than a verb
   * for one of the two directions, because a verb is a claim about what the
   * press will do and the press does whichever of the two the state is not. A
   * caller who wants two distinct names has to own the state to get them, which
   * the two index props already let them do.
   */
  zoomLabel: string
  /** The accessible name of the control that shows the previous image. Required, for the same reason. */
  previousLabel: string
  /** The accessible name of the control that shows the next image. Required, for the same reason. */
  nextLabel: string
  /** The accessible name of the control that closes the dialog. Required, for the same reason. */
  closeLabel: string
  /** Layout only, exactly as on every Component. */
  className?: string
}

/**
 * The metrics every control in this Component draws, and the coarse-pointer floor.
 *
 * `pointer-coarse:size-11` is a step rather than a band. These are ghost icon
 * controls in a centred bar inside the dialog, and the drawn size is not the point of
 * any of them, which is the condition a band exists for and the reason the switch,
 * thumb and corner-icon cases in `DESIGN.md` band instead. The bar is `gap-2`, so
 * growing each control by four pixels on each side costs eight pixels of gap per
 * neighbour and the bar is centred rather than flush, so nothing shifts off the edge.
 *
 * The close control here is a `DialogClose`, and `DialogClose` carries no size of its
 * own: `dialog.tsx` puts its coarse-pointer floor on the close control it renders
 * inside `DialogContent`, and this one is a separate `DialogClose` passed as a child,
 * so this string is the only thing sizing it. See DESIGN.md, The coarse-pointer floor.
 */
const CONTROL =
  'text-muted-foreground hover:text-foreground inline-flex size-9 items-center justify-center rounded-md outline-none transition-colors duration-fast ease-out disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-ring focus-visible:ring-[3px]' +
  ' pointer-coarse:size-11'

/** An index held inside the set, which is what keeps a rail control from falling off it. */
function clamp(value: number, total: number): number {
  if (total <= 0) return 0
  return Math.min(Math.max(value, 0), total - 1)
}

/**
 * An image at full size, in a dialog, with its own words and its own way out.
 *
 * **This Item exists because an image the reader cannot enlarge is an image the
 * reader cannot read.** That is the whole argument, and it is not a small one,
 * because an image carries text for a great many products: a chart exported as
 * a picture, a screenshot of a console, a diagram, a photograph of a receipt, a
 * logo lockup with a wordmark in it. At 320 pixels wide none of that is
 * readable, and a reader who cannot read it has been shown a thumbnail and told
 * it was the thing. Zooming in the browser is the alternative every consumer
 * reaches for, and it is a poor one for a reader who is not using a mouse, one
 * for a touch device where the gesture is not discoverable, and one that leaves
 * the page's own focus, Escape key and scroll position behind, so the reader
 * comes back to a different place than they left. A dialog is the whole of that
 * and it comes free from a component library.
 *
 * **The dialog is `Dialog`, not a re-derivation of it.** The focus trap, the
 * restore of focus to whatever opened it, the Escape key, the outside press, the
 * scroll lock and the portal are all already solved and all of them are solved
 * badly twice as often as they are solved well. An image overlay built on
 * `<div>` and a `keydown` listener gets the Escape key and no focus trap, so a
 * keyboard reader tabs behind the image into a page they cannot see; and every
 * one of those defects is invisible in review because the overlay works for the
 * person writing it. So this Component composes `Dialog` and spends its own
 * surface on the three things `Dialog` does not know about: the rail, the
 * controls and the zoom.
 *
 * **The four labels are props because Prism does not ship the words.** That is
 * `check-block-copy`'s finding about `Dialog`'s close button, and it is a
 * finding about this Component too: a hardcoded label is copy a consumer cannot
 * localise, so a product in any language but English inherits an English
 * control in the middle of its own interface, and the only fix is a fork. They
 * are required rather than optional even though a lightbox with no rail draws
 * no previous and no next control, and the reasoning is worth stating because it
 * looks like friction. A required prop is a question asked at build time; an
 * optional one is a question nobody asks, and the lightbox that grew a rail
 * later would be the release where the two missing labels are discovered. It
 * also keeps the prop set stable, so adding thumbnails is not a breaking change
 * to the type.
 *
 * **The zoom is a state, not a gesture.** It toggles between fitted and actual
 * size and the frame scrolls once the image is larger than it is, so the reader
 * pans with the scroll keys and the arrow keys the way they pan anywhere else.
 * There is no pinch, no drag to pan and no double tap, and the reason is that
 * each of those is a bespoke pointer model that has to be discovered, whereas a
 * scrollable frame is a thing every reader already knows. The transition on the
 * image is a state change the reader caused, which is the first motion law's own
 * case, and it carries no `motion-safe:` guard because it does not need one:
 * `packages/ui/src/styles.css` ends with one unlayered `prefers-reduced-motion`
 * rule that stops every transition, so a reader who has asked for less motion
 * gets the new size immediately and loses only the travel between the two.
 *
 * **The rail is a list of real buttons and the current one is named, not
 * coloured.** A rail of thumbnails is the one place a lightbox most often gets
 * this wrong: the selected thumbnail gets a border and nothing else, so a
 * screen reader user is read six identical buttons and a reader in greyscale is
 * shown a difference of one pixel. Here each button is named by its own `alt`,
 * which is a description of that image rather than of the position, and the
 * current one carries `aria-current`. The inner image is marked decorative with
 * an empty `alt`, so the button's name is the description and not a doubled
 * reading of the same pixels.
 *
 * **The current image is the caller's.** `src` and `alt` are props, so this
 * Component cannot move the image, and every control here asks for an index
 * rather than setting one. That is a real constraint on a caller who wants the
 * lightbox to own the sequence, and the reason for it is the same as everywhere
 * else in this package: the images are application data, and a Component that
 * held them would be a Component every consumer whose gallery is not this shape
 * had to reimplement. A caller that wants an uncontrolled lightbox passes
 * `index` and `onIndexChange` and keeps the state; one that wants the lightbox
 * to remember where it was omits both and gets the local one.
 *
 * It is a client Component, and only because `Dialog` is one.
 */
function Lightbox({
  open,
  onOpenChange,
  src,
  alt,
  caption,
  thumbnails,
  index,
  onIndexChange,
  zoomLabel,
  previousLabel,
  nextLabel,
  closeLabel,
  className,
}: LightboxProps) {
  const total = thumbnails?.length ?? 0
  const [uncontrolled, setUncontrolled] = useState(0)
  const at = clamp(index ?? uncontrolled, total)
  const [zoomed, setZoomed] = useState(false)

  // Zoom is a decision about this visit. Reopening on the zoomed image would
  // mean a reader who closed a picture halfway through came back to a crop they
  // had forgotten they had made, and the reset is the smaller surprise.
  useEffect(() => {
    if (!open) setZoomed(false)
  }, [open])

  const move = (next: number) => {
    const at1 = clamp(next, total)
    if (index === undefined) setUncontrolled(at1)
    onIndexChange?.(at1)
  }

  // A string caption is the dialog's name as well as its caption: one sentence
  // naming a figure beats the same sentence twice. A node cannot be a name,
  // because a name is a string and a node may be a list or a picture, so the
  // dialog falls back to the image's own description.
  const named = typeof caption === 'string' && caption.trim() !== '' ? caption : alt
  const titleVisible = named === caption

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/*
       * The built-in close control is switched off and the one at the end of the
       * control bar takes its place, so that every control in the dialog sits in
       * one row where a reader moving by Tab meets them in a predictable order
       * rather than finding the dismiss at the top right and the rest at the
       * bottom. The label is still required and still passed, because the
       * dismissal is this Component's own control and its name is the caller's.
       */}
      <DialogContent
        data-slot="lightbox"
        showCloseButton={false}
        className={cn('max-w-overlay-media', className)}
      >
        <DialogTitle
          data-slot="lightbox-title"
          className={titleVisible ? 'text-muted-foreground text-sm font-normal' : 'sr-only'}
        >
          {named}
        </DialogTitle>

        {/*
         * The frame, and the one place the zoom is legible: fitted, the image is
         * held inside the frame at its own proportions; zoomed, its natural size
         * is what decides the frame's scroll range, so the reader reaches every
         * pixel of it with the keys they already use. It is a block rather than a
         * centred flex row on purpose, because a centred child larger than its
         * scroll container has a left edge a reader cannot scroll back to in more
         * than one browser, and an image at actual size is routinely larger than
         * its frame.
         *
         * The constraint is on the image and not on the frame, and that is also
         * deliberate. A percentage height resolves against the containing block,
         * and this frame's height is decided by the image inside it, so
         * `max-h-3/4` on the frame would resolve against an auto height and
         * measure to nothing. The value is a share of the viewport rather than a
         * spacing token because no spacing token names a share of the viewport,
         * and the author of a lightbox who does not care how tall a picture is
         * gets a dialog taller than their screen.
         */}
        <div data-slot="lightbox-frame" data-zoomed={zoomed || undefined} className="overflow-auto">
          <img
            data-slot="lightbox-image"
            src={src}
            alt={alt}
            className={cn(
              'mx-auto block transition-transform duration-base ease-out',
              zoomed ? 'max-w-none' : 'max-h-[70vh] max-w-full object-contain',
            )}
          />
        </div>

        {caption !== undefined && !titleVisible ? (
          <div data-slot="lightbox-caption" className="text-muted-foreground text-sm">
            {caption}
          </div>
        ) : null}

        {total > 1 ? (
          <ul
            data-slot="lightbox-rail"
            className="flex flex-wrap items-center justify-center gap-2"
          >
            {thumbnails?.map((entry, at1) => (
              <li key={entry.src} data-slot="lightbox-rail-item">
                <button
                  type="button"
                  data-slot="lightbox-thumbnail"
                  data-current={at1 === at || undefined}
                  aria-label={entry.alt}
                  aria-current={at1 === at ? 'true' : undefined}
                  onClick={() => move(at1)}
                  className={cn(
                    'block overflow-hidden rounded-md border-2 outline-none transition-colors duration-fast ease-out',
                    at1 === at ? 'border-primary' : 'border-transparent hover:border-border',
                    'focus-visible:ring-ring focus-visible:ring-[3px]',
                  )}
                >
                  {/*
                   * The inner image is marked decorative, so the button's name is
                   * the description of the picture rather than a doubled reading
                   * of the same pixels, and a broken thumbnail is announced as the
                   * button rather than as an image inside a button.
                   */}
                  <img data-slot="lightbox-thumbnail-image" src={entry.src} alt="" className="h-12 w-16 object-cover" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        <div data-slot="lightbox-controls" className="flex items-center justify-center gap-2">
          {total > 1 ? (
            <button
              type="button"
              data-slot="lightbox-previous"
              aria-label={previousLabel}
              disabled={at === 0}
              onClick={() => move(at - 1)}
              className={CONTROL}
            >
              <ChevronLeftIcon className="size-4" aria-hidden="true" />
            </button>
          ) : null}

          {/*
           * The zoom is always drawn, and it is a toggle rather than a stepper.
           * A stepper would need a word for each direction, so a caller would
           * have to localise four labels to get one action out of the component,
           * and a reader pressing it twice would zoom past the natural size into
           * a blur. Two states and one label is the whole vocabulary a fitted and
           * an actual size need.
           */}
          <button
            type="button"
            data-slot="lightbox-zoom"
            aria-label={zoomLabel}
            aria-pressed={zoomed}
            onClick={() => setZoomed((value) => !value)}
            className={CONTROL}
          >
            {zoomed ? (
              <ZoomOutIcon className="size-4" aria-hidden="true" />
            ) : (
              <ZoomInIcon className="size-4" aria-hidden="true" />
            )}
          </button>

          {total > 1 ? (
            <button
              type="button"
              data-slot="lightbox-next"
              aria-label={nextLabel}
              disabled={at === total - 1}
              onClick={() => move(at + 1)}
              className={CONTROL}
            >
              <ChevronRightIcon className="size-4" aria-hidden="true" />
            </button>
          ) : null}

          <DialogClose data-slot="lightbox-close" aria-label={closeLabel} className={CONTROL}>
            <XIcon className="size-4" aria-hidden="true" />
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { Lightbox }
