import type { ReactNode } from 'react'

import { AspectRatio } from '../../components/ui/aspect-ratio'
import { CtaLink } from '../../components/ui/cta-link'
import {
  Section,
  SectionHeading,
  type HeadingLevel,
  type SectionSize,
} from '../../components/ui/section'
import { cn } from '../../lib/utils'

/**
 * The shape the media frame holds.
 *
 * Three names rather than a number, for the reason `Gallery01Ratio` gives: a
 * caller passing `ratio={1.7}` has chosen a box, and this Block's job is to
 * frame a picture rather than to reproduce an arbitrary aspect. The three are
 * the shapes a marketing band actually has: a wide editorial photograph, a
 * square crop, and a portrait crop for a phone-width stack.
 */
export type MediaBand01Ratio = 'wide' | 'square' | 'portrait'

/**
 * The three ratios, as numbers.
 *
 * `AspectRatio` takes a number rather than a keyword, and the reason is that
 * this package's stylesheet is built by scanning this package's own source. A
 * utility that appears in no Prism file is a utility no consumer's stylesheet
 * contains, so `aspect-video` written here would be a silently missing rule.
 */
const RATIOS: Record<MediaBand01Ratio, number> = {
  wide: 16 / 9,
  square: 1,
  portrait: 3 / 4,
}

/**
 * How tall the band is.
 *
 * The same three names `SectionSize` publishes, re-exported under this Block's
 * own name so a caller composing a media band does not have to reach into the
 * Section module to type a prop it already passes here.
 */
export type MediaBand01Size = SectionSize

/**
 * One action in the band that names a destination.
 *
 * `href` is required and that is the whole of the arm. A control drawn as a call
 * to action and with nowhere to go is the dead end `CtaLink`'s own JSDoc names,
 * and this Block cannot repair one: a Block ships no behaviour, so there is no
 * handler to attach and no destination to invent.
 */
export type MediaBand01Action = {
  /** The words on the control. Every string the band renders is the caller's. */
  label: string
  /** Where the action goes. Required, so a label with no destination cannot compile. */
  href: string
  /** Opens the destination in a new browsing context, with the matching `rel`. */
  newTab?: boolean
  /**
   * Which weight the action draws at.
   *
   * The four the button family publishes, and no `link` arm: a link inside a
   * band is a sentence with a destination, and the caller who wants one composes
   * `CtaLink variant="link"` into a slot rather than asking this Block for a
   * second control. This arm is the band's one ask.
   *
   * @defaultValue 'default'
   */
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
}

/**
 * The props a MediaBand01 takes.
 *
 * Every string is a prop and the Block ships none. There is no default headline,
 * no default image, no default caption and no default action. A media band that
 * hardcoded an image would install a photograph nobody licensed into every
 * consumer's page, which is the same defect `Gallery01` states for its grid.
 */
export type MediaBand01Props = {
  /** Optional label above the title. See the No-Default-Eyebrow Rule. */
  eyebrow?: string
  /** The band's one claim. Required: a band with no title is a picture. */
  title: ReactNode
  /** One or two sentences under the title. */
  description?: ReactNode
  /**
   * The media, composed by the caller.
   *
   * A slot rather than a `src`, because the honest media here is not always an
   * image: it is a photograph, a video poster, a rendered figure, or a
   * composition of the consumer's own components. The Block owns the frame, the
   * ratio and the surface, and the caller owns the node and its accessible name.
   *
   * **The node fills the frame.** The caller's image or figure should be sized
   * to its container and should set its own `object-fit`; the Block does not
   * style a node it did not render, which is the same rule every slot in this
   * package follows.
   */
  media: ReactNode
  /**
   * Which side the media sits on at the wide breakpoint.
   *
   * Below the breakpoint the copy always comes first, because the title is the
   * way into the picture and a reader on a phone should not have to scroll past
   * a photograph to learn what it is for.
   *
   * @defaultValue 'media-right'
   */
  align?: 'media-left' | 'media-right'
  /**
   * The shape the media frame holds.
   *
   * @defaultValue 'wide'
   */
  ratio?: MediaBand01Ratio
  /**
   * The surface the band is drawn on.
   *
   * `default` leaves it on the page ground, which is the quieter answer and the
   * right one for a band that is one moment among several. `muted` puts it on
   * the muted surface, for a band that is a chapter of its own. The muted arm
   * states its own ink as well as its own fill, which is the `Stated Ink Rule`
   * `Cta01` and `Bento01` both state: a surface that sets a fill and inherits
   * its ink is correct wherever the design system happened to put it and wrong
   * everywhere else.
   *
   * @defaultValue 'default'
   */
  tone?: 'default' | 'muted'
  /**
   * One line under the media.
   *
   * Functional, not decorative: it says what a reader is looking at when the
   * photograph is a placeholder or when the image is not the product itself. It
   * is never a photo credit for a placeholder, and it is never a caption for a
   * picture whose subject the title already names.
   */
  caption?: ReactNode
  /** The band's one action. Omit it for a band that is a statement and not an ask. */
  action?: MediaBand01Action
  /**
   * How tall the band is. See `MediaBand01Size`.
   *
   * @defaultValue 'tall'
   */
  size?: MediaBand01Size
  /** Heading level for the title. See `HeadingLevel`. @defaultValue 'h2' */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Block. Changing a Prism-owned visual
   * property from here is prohibited.
   */
  className?: string
}

/**
 * An editorial band: one media frame beside one statement, with one action.
 *
 * **This is the marketing surface the catalogue did not have.** `Bento01` holds
 * a media node in a cell, but a cell is one item of a set and a set is the wrong
 * shape for the one photograph a page stops on. `Gallery01` holds a set of
 * images and opens one at full size, which is the right shape for a portfolio
 * and the wrong one for a statement. `MediaBand01` is the one picture, the one
 * sentence and the one way forward, at the page's own width.
 *
 * **The copy is first in the document, and the media is first only in the
 * visual order the caller asked for.** A reader on a phone meets the title
 * before the picture, and a reader at `lg` meets the arrangement the caller
 * chose. That is one tree, not two, so the heading is in the outline once and a
 * resized window does not swap one copy of the band for another.
 *
 * **The frame never carries the copy.** The title and the description sit on
 * the page ground or on the muted surface, never on top of an arbitrary
 * photograph. Text over a picture whose contrast nobody measured is the one
 * accessibility failure this Block could ship by doing the conventional thing,
 * and the conventional thing is not worth it: a band that puts its copy in a
 * solid column beside the image is both more legible and more editorial.
 *
 * **There is no animation.** The media does not zoom on hover, the frame does
 * not slide in, and the band does not reveal on scroll. Motion in this system
 * is feedback or a figure showing a system running, and an editorial photograph
 * is neither. A caller who wants a figure that runs composes one into `media`,
 * where the ambient law and its reduced-motion stop already apply.
 *
 * It is a server Component: no hook, no state, no client code. A band costs a
 * consumer no JavaScript, and the action is a native anchor.
 */
export function MediaBand01({
  eyebrow,
  title,
  description,
  media,
  align = 'media-right',
  ratio = 'wide',
  tone = 'default',
  caption,
  action,
  size = 'tall',
  headingLevel = 'h2',
  className,
}: MediaBand01Props) {
  const mediaFirst = align === 'media-left'

  return (
    <Section
      size={size}
      className={cn(tone === 'muted' && 'bg-muted text-foreground', className)}
    >
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div
          data-slot="media-band-01-copy"
          className={cn(
            'flex min-w-0 flex-col items-start gap-6',
            mediaFirst ? 'lg:order-2' : 'lg:order-1',
          )}
        >
          <SectionHeading
            as={headingLevel}
            align="left"
            eyebrow={eyebrow}
            title={title}
            description={description}
          />

          {action ? (
            <CtaLink
              href={action.href}
              newTab={action.newTab}
              variant={action.variant ?? 'default'}
            >
              {action.label}
            </CtaLink>
          ) : null}
        </div>

        <div
          data-slot="media-band-01-media"
          className={cn('flex min-w-0 flex-col gap-3', mediaFirst ? 'lg:order-1' : 'lg:order-2')}
        >
          <div className="bg-muted overflow-hidden rounded-xl border">
            <AspectRatio ratio={RATIOS[ratio]}>{media}</AspectRatio>
          </div>
          {caption ? (
            <p className="text-muted-foreground text-pretty text-xs">{caption}</p>
          ) : null}
        </div>
      </div>
    </Section>
  )
}

export default MediaBand01
