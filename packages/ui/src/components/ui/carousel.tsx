'use client'

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentProps,
  type KeyboardEvent,
  type ReactNode,
} from 'react'

import { cn } from '../../lib/utils'

/** One slide, and the words a reader is given for it. */
export type CarouselSlide = {
  /** A stable key. A slide's key must not change as the reader moves. */
  id: string
  /** The slide's content. */
  children: ReactNode
  /**
   * The accessible name of this slide.
   *
   * A carousel hides its content, so this is often the only way a reader knows
   * which slide they are on before they read it. It is required for the same
   * reason a region's name is: it is the caller's word, and a slide announced only
   * by its content is a slide a reader cannot skip past by name.
   */
  label: string
}

/** The props the Carousel accepts. */
export interface CarouselProps extends Omit<ComponentProps<'div'>, 'children'> {
  /** The slides, in the order a reader meets them. */
  slides: readonly CarouselSlide[]
  /**
   * The accessible name of the carousel.
   *
   * Required rather than defaulted. A carousel is a region, and a page with two is
   * a page where a reader cannot tell which set of slides they are in. The name is
   * the caller's word.
   */
  label: string
  /**
   * The words read for a slide position, given its one-based index and the total.
   *
   * Required, and required as a function rather than a string, because a position
   * has to be a sentence and the sentence is different in every language. It is
   * also the answer to the only real defect a carousel has: one with no position
   * indicator is a guessing game, because a reader who has been moved three times
   * with nothing telling them where they are has no way to know how much is left.
   *
   * The function receives the index of the slide the control moves *to*, so the
   * words always describe where the reader will be rather than where they are.
   */
  position: (index: number, total: number) => string
  /**
   * What a reader is told when there is nothing to show.
   *
   * A carousel with no slides is a frame with controls in it that move nowhere, so
   * the case is authored rather than left to a caller to notice.
   */
  empty?: ReactNode
  /** The words read for the control that moves back. @defaultValue 'Previous slide' */
  previousLabel?: string
  /** The words read for the control that moves forward. @defaultValue 'Next slide' */
  nextLabel?: string
  /**
   * The slide to show first.
   *
   * Omit it and the first slide is shown. It is a prop because a carousel dropped
   * into the middle of a page is often a deep link's target, and a Component that
   * always opened on slide one would show the reader a different slide from the
   * one the address names.
   */
  initialIndex?: number
  /** The slide the reader is on, when the caller owns it. */
  index?: number
  /** Called with the index of the slide the reader moves to. */
  onIndexChange?: (index: number) => void
  /** Layout only. */
  className?: string
}

/**
 * A set of slides with controls that move between them.
 *
 * **A carousel hides content, so it must never be the only route to it.** That is
 * the decision worth making, and it is a constraint on the caller as much as on
 * this Component. Everything a carousel shows, a reader must be able to reach some
 * other way: a tab, a section below it, a list. A carousel used as the only
 * presentation of a set of images is a set of images a reader on a keyboard, on a
 * screen reader, or with the controls hidden by a stylesheet cannot see at all,
 * and the Component cannot detect that case. So the rule is here, in the
 * documentation, where a caller meets it, rather than assumed.
 *
 * **The controls say where the reader is, and the position is a sentence the
 * caller writes.** `position` is required and is a function of the index and the
 * total, so a reader is told "3 of 7" rather than being left to infer it. A
 * carousel with no position indicator is a guessing game: a reader moved three
 * times with nothing counting has no way to know whether there are three slides
 * left or three hundred, and the only way to find out is to keep pressing. The
 * current position is also in `aria-live="polite"` on the position, because a
 * carousel that moves silently under a reader who did not press anything is a
 * carousel a reader cannot follow.
 *
 * **One slide is the whole content, with no controls.** A carousel of one slide is
 * a picture with two buttons that do nothing, and it is the state a filtered or
 * partially-loaded set passes through. The controls are absent rather than
 * disabled, and the position says 1 of 1, because "there is one slide and you are
 * on it" is a true and useful thing to tell a reader.
 *
 * **No slide is authored rather than rendered as an empty frame.** Zero slides is
 * a state a caller reaches before their data arrives or after a filter excludes
 * everything, and a region with an empty track and two dead controls is a gap
 * rather than a state.
 *
 * **It is operable from the keyboard, and the arrow keys do what a reader
 * expects.** Left and Right move between slides when the carousel has focus, Home
 * and End jump to the first and last, and the controls are real buttons so Tab
 * reaches them and Enter and Space press them. Nothing here is a div with a
 * handler, which is the version a consumer cannot assemble for themselves because
 * every one of those keys is a chance to get one wrong.
 *
 * **The slide transition is a state change and not an entrance.** The track moves
 * with `duration-base ease-out`, which is the reader's own press being reported
 * back, and there is no fade on mount and no motion a reader did not ask for.
 *
 * It is a client Component, because a carousel holds a position and answers keys.
 */
function Carousel({
  slides,
  label,
  position,
  className,
  empty,
  previousLabel = 'Previous slide',
  nextLabel = 'Next slide',
  initialIndex = 0,
  index,
  onIndexChange,
  ...props
}: CarouselProps) {
  const [uncontrolled, setUncontrolled] = useState(() => clamp(initialIndex, slides.length))
  const controlled = index !== undefined
  const at = controlled ? clamp(index, slides.length) : uncontrolled
  const total = slides.length
  const set = useCallback(
    (next: number) => {
      const bounded = clamp(next, total)
      if (!controlled) setUncontrolled(bounded)
      onIndexChange?.(bounded)
    },
    [controlled, onIndexChange, total],
  )
  const labelId = useId()
  const root = useRef<HTMLDivElement>(null)
  const previous = useRef<HTMLButtonElement>(null)
  const next = useRef<HTMLButtonElement>(null)

  const atFirst = at <= 0
  const atLast = at >= total - 1

  // The reader's own arrow keys, which are the reason this is a Component rather
  // than a stack of divs with two buttons beside them.
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End']
    if (!keys.includes(event.key)) return
    if (total <= 1) return
    event.preventDefault()
    if (event.key === 'Home') set(0)
    else if (event.key === 'End') set(total - 1)
    else set(at + (event.key === 'ArrowRight' ? 1 : -1))
  }

  useEffect(() => {
    // A carousel that has lost slides must not leave the reader past the end, and
    // the failure is silent: the track is translated to an offset with no slide
    // there, so the reader is looking at blank space in a carousel that is
    // working perfectly well.
    if (at > total - 1) set(total - 1)
  }, [at, set, total])

  useEffect(() => {
    // A control that has just been disabled must not keep the reader's focus.
    //
    // A disabled button is out of the tab order but it does not give up focus, so
    // a reader who pressed "next" on the last-but-one slide is left focused on a
    // control that can no longer answer anything: not Enter, not Space, and not
    // the arrow keys this Component listens for on the way past. The reader is
    // stranded inside the carousel with no working control under their fingers and
    // no way to know why. So focus is handed to the sibling that is still live,
    // which is the same thing a browser does when focus lands on something that
    // has become inert.
    const active = document.activeElement
    if (!(active instanceof HTMLButtonElement)) return
    if (active !== previous.current && active !== next.current) return
    if (active.disabled !== true) return
    const live = active === previous.current ? next.current : previous.current
    if (live === null || live.disabled) return
    live.focus()
  })

  if (total === 0) {
    // A region with an empty track and two dead controls is a gap rather than a
    // state, so the empty case is authored.
    return (
      <div data-slot="carousel-empty" className={cn('text-muted-foreground text-sm', className)}>
        {empty ?? null}
      </div>
    )
  }

  return (
    <div
      ref={root}
      data-slot="carousel"
      // A carousel is a region, and it is named, because a page with two of them
      // is a page where a reader cannot tell which set of slides they are in.
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn('flex flex-col gap-3', className)}
      {...props}
    >
      {/*
       * The track. It is translated rather than replaced, so a reader who has the
       * carousel focused keeps their place and the transition reports the press
       * rather than announcing itself. `overflow-hidden` is what makes the
       * neighbouring slides invisible rather than visible beside the current one.
       */}
      <div
        data-slot="carousel-viewport"
        className="overflow-hidden"
        style={{
          // A track width of one slide each is what makes the translate a whole
          // slide, and a negative margin of the track's own width is what puts the
          // first slide at zero. Both are the layout rather than a value, so they
          // are the two numbers this Component is allowed to hold.
          width: `${100 / total}%`,
          marginInlineStart: `${-(100 * (total - 1)) / total}%`,
          transform: `translateX(${(at * 100) / total}%)`,
        }}
      >
        <div
          data-slot="carousel-track"
          // A state change, reported with a token. There is no fade on mount and no
          // motion a reader did not ask for, because there is no decorative or
          // entrance animation in this system.
          className="flex transition-transform duration-base ease-out"
          style={{ width: `${100 * total}%` }}
        >
          {slides.map((slide, slideAt) => {
            const current = slideAt === at
            return (
              <div
                key={slide.id}
                data-slot="carousel-slide"
                data-current={current ? 'true' : undefined}
                id={`${labelId}-slide-${slideAt}`}
                role="group"
                // Every slide is labelled, not only the current one, so a reader who
                // arrows past one knows what they passed. And the slides a reader
                // cannot see are hidden from assistive technology rather than left
                // to be found: a carousel announces the slide it is showing.
                aria-label={slide.label}
                aria-roledescription="slide"
                aria-hidden={current ? undefined : true}
                className="w-full shrink-0"
              >
                {slide.children}
              </div>
            )
          })}
        </div>
      </div>

      {/*
       * The controls. They are real buttons, so Tab reaches them and Enter and
       * Space press them, and none of that is this Component's to get wrong. They
       * are absent rather than disabled when there is one slide, because a pair of
       * controls that move nowhere is a claim that there is somewhere to go.
       */}
      {total > 1 ? (
        <div data-slot="carousel-controls" className="flex items-center justify-between gap-3">
          <button
            type="button"
            ref={previous}
            data-slot="carousel-previous"
            aria-label={previousLabel}
            disabled={atFirst}
            onClick={() => set(at - 1)}
            className={cn(
              'border-input bg-background text-foreground inline-flex size-9 items-center justify-center rounded-md border outline-none',
              'transition-colors duration-fast ease-out',
              'hover:bg-accent hover:text-accent-foreground',
              'focus-visible:ring-ring focus-visible:ring-[3px]',
              'disabled:pointer-events-none disabled:opacity-50',
            )}
          >
            <ChevronLeftIcon className="size-4" aria-hidden="true" />
          </button>

          {/*
           * The position, and the only live region in the Component. A carousel
           * that moves silently under a reader is a carousel a reader cannot
           * follow, and this is the sentence that follows it. It is polite rather
           * than assertive because the reader caused it by pressing a control and
           * does not need it interrupting whatever they were reading.
           */}
          <p
            data-slot="carousel-position"
            aria-live="polite"
            className="text-muted-foreground text-sm tabular-nums"
          >
            {position(at + 1, total)}
          </p>

          <button
            type="button"
            ref={next}
            data-slot="carousel-next"
            aria-label={nextLabel}
            disabled={atLast}
            onClick={() => set(at + 1)}
            className={cn(
              'border-input bg-background text-foreground inline-flex size-9 items-center justify-center rounded-md border outline-none',
              'transition-colors duration-fast ease-out',
              'hover:bg-accent hover:text-accent-foreground',
              'focus-visible:ring-ring focus-visible:ring-[3px]',
              'disabled:pointer-events-none disabled:opacity-50',
            )}
          >
            <ChevronRightIcon className="size-4" aria-hidden="true" />
          </button>
        </div>
      ) : (
        // One slide is the whole content, and the position still says so rather
        // than the reader being left to infer that there is nothing to move to.
        <p
          data-slot="carousel-position"
          aria-live="polite"
          className="text-muted-foreground text-sm tabular-nums"
        >
          {position(1, 1)}
        </p>
      )}
    </div>
  )
}

/** An index inside the set, so a caller cannot move the reader past either end. */
function clamp(value: number, total: number): number {
  if (!Number.isFinite(value)) return 0
  if (total === 0) return 0
  return Math.min(Math.max(Math.trunc(value), 0), total - 1)
}

export { Carousel }
