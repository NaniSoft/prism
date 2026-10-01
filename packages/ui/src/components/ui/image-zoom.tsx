'use client'

import { ScanIcon, ZoomInIcon, ZoomOutIcon } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type ComponentProps, type ReactNode } from 'react'

import { cn } from '../../lib/utils'

/**
 * The magnification the Component holds at its smallest, and the value it returns
 * to, as a multiple of the image's fitted size.
 */
const FIT = 1

/** The largest magnification offered when the caller names none. */
const CEILING = 4

/** How much one press moves the magnification when the caller names no step. */
const STRIDE = 0.5

/** The props the ImageZoom accepts. */
export interface ImageZoomProps extends Omit<ComponentProps<'div'>, 'children'> {
  /** The image to magnify, at the resolution it should be magnified into. */
  src: string
  /**
   * The image's description, and required.
   *
   * Required for the reason it is required on `Lightbox`: an image with no
   * description is a picture a reader can see more of and still not read, and
   * this Component's whole purpose is that they see more of it. It is also the
   * only thing that tells a screen reader what the thing they are magnifying is,
   * because magnification changes no semantics at all: the element is still an
   * `img` with this `alt` before, during and after.
   */
  alt: string
  /**
   * The accessible name of the group, and required.
   *
   * A page with two magnified images is a page where a reader cannot tell which
   * set of controls they are in, and the controls are three buttons that all
   * look alike. The name is the caller's word, and `role="group"` is the
   * deliberate choice over a landmark: a group is announced where it is met and
   * never appears in a landmark list, so a page with six figures does not put six
   * new entries in a reader's list of regions to walk.
   */
  label: string
  /**
   * The words for the current magnification, and required.
   *
   * A function rather than a string, for the reason `Carousel`'s `position` is
   * one: a magnification is a number and the sentence around it is different in
   * every language, so the sentence is the caller's. It receives a percentage, not
   * a multiplier, because a percentage is the form a reader reads and a
   * multiplier is the form this Component stores.
   */
  scale: (percent: number) => string
  /**
   * The smallest magnification, as a multiple of the fitted size. @defaultValue 1
   *
   * A number and not a keyword, because the useful answers are a designer's: the
   * fitted size, twice the fitted size, and a figure from the caller's own brief.
   */
  minScale?: number
  /** The largest. @defaultValue 4 */
  maxScale?: number
  /** How much one press moves it. @defaultValue 0.5 */
  step?: number
  /**
   * The accessible name of the control that magnifies, and required.
   *
   * Required rather than defaulted on the reasoning `Lightbox` states: a
   * hardcoded accessible name is a sentence a consumer cannot localise, and the
   * only fix is a fork of this package. The three names are the caller's because
   * they are three sentences in the caller's own words, and because "Zoom" is
   * not the word a German product says for it.
   */
  zoomInLabel: string
  /** The accessible name of the control that reduces the magnification. */
  zoomOutLabel: string
  /** The accessible name of the control that returns the image to its fitted size. */
  resetLabel: string
  /**
   * The caller's own controls, drawn after this Component's three.
   *
   * A slot and not a second set of props, because everything a reader might want
   * beside a magnifier is the consumer's decision: a download, a "show the whole
   * page" that hands off to `Lightbox`, a reset for the surrounding form. Prism
   * draws the three controls it can get right, and this is where the rest go. The
   * cost is that a caller who wants their own magnification controls cannot
   * suppress these three, and the answer is that a magnifier whose only route to
   * magnification is in someone else's markup is not a magnifier.
   */
  controls?: ReactNode
  /**
   * Called with the magnification after every press.
   *
   * A notification rather than a controlled prop, and the reason is the same as
   * `Lightbox`'s reset: the magnification is a decision about this visit. A
   * reader who magnified a diagram, went away and came back should find it as
   * they left it, not as they found it, so it is held here and not lifted. What
   * the caller usually wants the number for is layout, and a notification is
   * enough for that.
   */
  onScaleChange?: (scale: number) => void
  /** Layout only, exactly as on every Component. */
  className?: string
}

/** The magnification every control in this Component draws. */
const CONTROL =
  'text-muted-foreground hover:text-foreground border-input bg-background inline-flex size-9 items-center justify-center rounded-md border outline-none transition-colors duration-fast ease-out disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-ring focus-visible:ring-[3px]'

/** A magnification inside the caller's bounds, so no press can leave the range. */
function bound(value: number, low: number, high: number): number {
  if (!Number.isFinite(value)) return low
  if (high < low) return low
  return Math.min(Math.max(value, low), high)
}

/**
 * An image the reader magnifies where it already sits, with a frame that scrolls
 * once it is larger than its box.
 *
 * **It is the `Lightbox` with the dialog taken out, and that subtraction is the
 * whole Component.** A `Lightbox` opens a portal, traps focus, locks page scroll,
 * swallows the Escape key and hands the reader a different place in the document
 * to come back from. All five of those are the right price for an image the page
 * has not shown the reader at all, where the enlargement is the only way to see
 * it. They are the wrong price for an image the reader is already looking at:
 * paying a focus trap to make a picture on the page bigger costs the reader their
 * scroll position, their place in the document and their focus context, and a
 * reader who has magnified an inline diagram and then closed the dialog lands
 * somewhere they have to find again. So there is no portal, no overlay, no trap,
 * no Escape key and no dismiss here. The page does not move and nothing is taken
 * away from it. **Use a `Lightbox` when the enlargement is the only route to the
 * image; use this when the image is already on the page and only its size is in
 * the way.**
 *
 * **Prism draws the three controls and asks for their names, rather than taking
 * the controls as a slot.** A slot would move the one guarantee that makes a
 * magnifier usable to the caller: that the controls exist, that they are real
 * buttons in the tab order, that they are disabled at the ends of the range, and
 * that a reader whose control has just been disabled is moved to one that still
 * works. That last one is not obvious and `Carousel` had to write a `useEffect`
 * to get it right, because a disabled button leaves the tab order without giving
 * up focus: a reader who presses zoom in at the ceiling is left focused on a
 * control that can no longer answer Enter, Space or anything else, stranded
 * inside the magnifier with no working control under their fingers. This
 * Component does that move itself. The cost is that a caller who wants their own
 * magnification controls cannot have them here, and the answer is that this is
 * the wrong Component for a caller who wants that.
 *
 * **The scale transition is a transform under `motion-safe:`, with a token
 * duration, and it is the only motion on the surface.** Magnifying a picture is
 * spatial movement of a whole surface, which is the case DESIGN.md says to guard
 * rather than shorten, so a reader who has asked for reduced motion gets the new
 * size immediately and loses nothing but the travel between the two. The
 * transition is on `transform` and on nothing else: an animated `width` or
 * `height` is a layout animation on the main thread, which is the defect the
 * compositor rule in the ambient layer exists to prevent, and a magnified diagram
 * is large enough for that to be visible.
 *
 * **The scale reaches its final value before the pixels do, and that is the
 * price of using a transform.** A transform does not change layout, so the
 * frame's scroll extent is already at its full size on the first frame of the
 * transition and the scrollbar arrives while the image is still travelling. The
 * alternative is to animate the image's own size, which is a main-thread layout
 * animation on the largest element on the page, and a scrollbar that moves a
 * fraction early is a cheaper defect than a stuttering diagram.
 *
* **Panning is a scroll, not a gesture.** Once the image is larger than its frame
 * the frame scrolls, and the reader pans with the keys they already use: the
 * arrow keys, the space bar, the Home and End keys, and a trackpad or a finger.
 * There is no drag to pan, no pinch and no double tap, for the reason
 * `Lightbox` gives: each of those is a bespoke pointer model a reader has to
 * discover, and a scrollable frame is a thing every reader already knows. The
 * frame is a block rather than a centred flex row, because a centred child
 * larger than its scroll container has a left edge that cannot be scrolled back
 * to in more than one browser, and a magnified image is routinely larger than
 * its frame.
 *
 * **The scale is announced, politely, in the caller's words.** The sentence is in
   * an `aria-live="polite"` region beside the controls, so a reader who has just
   * pressed a button is told where they are without the announcement interrupting
   * whatever they were reading. It is polite rather than assertive for the same
   * reason `Carousel`'s position is: the reader caused the change by pressing a
   * control and does not need to be interrupted by it.
 *
 * It is a client Component, because it holds a magnification and answers presses.
 */
function ImageZoom({
  src,
  alt,
  label,
  scale,
  minScale = FIT,
  maxScale = CEILING,
  step = STRIDE,
  zoomInLabel,
  zoomOutLabel,
  resetLabel,
  controls,
  onScaleChange,
  className,
  ...props
}: ImageZoomProps) {
  const [at, setAt] = useState(FIT)

  /*
   * The caller's range, made into a range that can hold. A magnification that is
   * not a positive number is a division that has not happened yet, and a ceiling
   * that is not above the floor is two numbers that cannot both be true. In
   * either case the fitted size and the default ceiling are drawn instead rather
   * than a range that magnifies the wrong way or refuses to move, and the value
   * actually in force is reported on the frame as `data-scale`, so a substituted
   * bound is legible in the markup rather than only in the screenshot. That is
   * `AspectRatio`'s rule about a value that cannot be drawn, applied to a range.
   */
  const low = Number.isFinite(minScale) && minScale > 0 ? minScale : FIT
  const high = Number.isFinite(maxScale) && maxScale > low ? maxScale : Math.max(CEILING, low)
  const stride = Number.isFinite(step) && step !== 0 ? Math.abs(step) : STRIDE

  const zoomIn = useRef<HTMLButtonElement>(null)
  const zoomOut = useRef<HTMLButtonElement>(null)

  const set = useCallback(
    (next: number) => {
      const value = bound(next, low, high)
      setAt(value)
      onScaleChange?.(value)
    },
    [high, low, onScaleChange],
  )

  const magnified = at > FIT
  const atFloor = at <= low
  const atCeiling = at >= high

  /*
   * A control that has just been disabled must not keep the reader's focus. A
   * disabled button is out of the tab order and does not give up focus, so a
   * reader who magnifies to the ceiling is left focused on a control that can no
   * longer answer anything. Focus is handed to the sibling that is still live,
   * which is what a browser does when focus lands on something that has become
   * inert, and only when the stranded control is one of this Component's two.
   */
  useEffect(() => {
    const active = document.activeElement
    if (!(active instanceof HTMLButtonElement)) return
    if (active !== zoomIn.current && active !== zoomOut.current) return
    if (active.disabled !== true) return
    const live = active === zoomIn.current ? zoomOut.current : zoomIn.current
    if (live === null || live.disabled) return
    live.focus()
  })

  return (
    <div
      data-slot="image-zoom"
      role="group"
      aria-label={label}
      className={cn('flex flex-col gap-2', className)}
      {...props}
    >
      {/*
       * The frame. The image inside is laid out at its fitted size and magnified
       * by a transform from the top left, so the top left corner of the picture
       * stays where the reader last saw it and the scroll range reaches the whole
       * of it. `overflow-auto` is what turns a magnified image into a region that
       * can be panned, and `overscroll-contain` stops a reader who has reached the
       * edge of the picture from dragging the page behind it on the way.
       */}
      <div
        data-slot="image-zoom-frame"
        data-scale={at}
        data-zoomed={magnified || undefined}
        className="overflow-auto overscroll-contain"
      >
        <img
          data-slot="image-zoom-image"
          src={src}
          alt={alt}
          // A transform is the one value on this element that is not a utility
          // class, and the reason is that the magnification is a number the
          // caller passed rather than one of a closed set Prism authored. A
          // utility would be a closed list of factors, and a magnifier whose
          // ceiling is whichever factor the caller happened to be closest to is a
          // magnifier that rounds the reader's request.
          style={{ transform: `scale(${at})` }}
          className="block h-auto w-full origin-top-left motion-safe:transition-transform motion-safe:duration-base motion-safe:ease-out"
        />
      </div>

      <div data-slot="image-zoom-controls" className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          ref={zoomOut}
          data-slot="image-zoom-out"
          aria-label={zoomOutLabel}
          disabled={atFloor}
          onClick={() => set(at - stride)}
          className={CONTROL}
        >
          <ZoomOutIcon className="size-4" aria-hidden="true" />
        </button>

        {/*
         * The fit control, and the only one of the three that is not a stepper.
         * It is drawn whenever the image is magnified, because a reader who has
         * moved away from the fitted size needs one press back to it and two
         * presses would be a reader counting. It is absent rather than disabled
         * at the floor for the same reason `Carousel` omits controls that move
         * nowhere: a button that does nothing is a claim that there is somewhere
         * to go.
         */}
        {magnified ? (
          <button
            type="button"
            data-slot="image-zoom-reset"
            aria-label={resetLabel}
            onClick={() => set(low)}
            className={CONTROL}
          >
            <ScanIcon className="size-4" aria-hidden="true" />
          </button>
        ) : null}

        <button
          type="button"
          ref={zoomIn}
          data-slot="image-zoom-in"
          aria-label={zoomInLabel}
          disabled={atCeiling}
          onClick={() => set(at + stride)}
          className={CONTROL}
        >
          <ZoomInIcon className="size-4" aria-hidden="true" />
        </button>

        {/*
         * The live region, and the only one in the Component. A magnification that
         * changed silently under a reader who pressed a button is one they cannot
         * follow, and the number matters more than the picture does: a reader who
         * cannot see whether they are at 150 or 400 percent cannot tell whether
         * the detail they are looking for is off the frame or not there.
         */}
        <p
          data-slot="image-zoom-scale"
          aria-live="polite"
          className="text-muted-foreground text-sm tabular-nums"
        >
          {scale(Math.round(at * 100))}
        </p>

        {controls}
      </div>
    </div>
  )
}

export { ImageZoom }