'use client'

import { useState, type ReactNode } from 'react'

import { AspectRatio } from '../../components/ui/aspect-ratio'
import { Lightbox } from '../../components/ui/lightbox'
import { Section, SectionHeading, type HeadingLevel } from '../../components/ui/section'
import { cn } from '../../lib/utils'

/**
 * Every string the gallery and the lightbox it opens announce.
 *
 * Required, all four, for the reason `Lightbox` states and this Block inherits
 * without softening: a hardcoded control label is a word a consumer cannot
 * localise, so a product in any language but English inherits an English control
 * in the middle of its own interface and the only fix is a fork. A required prop
 * is a question asked at build time and an optional one is a question nobody
 * asks, and this is the release where the four missing labels would otherwise have
 * been discovered. Three of them are the lightbox's own controls and the fourth is
 * the rail, and a gallery with one image still draws the zoom and the close, so
 * there is no shape in which a label is genuinely absent.
 */
export type Gallery01Labels = {
  /** The accessible name of the control that toggles fitted and actual size. */
  zoom: string
  /** The accessible name of the control that shows the previous image. */
  previous: string
  /** The accessible name of the control that shows the next image. */
  next: string
  /** The accessible name of the control that closes the enlarged image. */
  close: string
}

/** How each shape is drawn, as the ratio the surface holds it at. */
export type Gallery01Ratio = 'square' | 'landscape' | 'portrait'

/**
 * The three shapes, as numbers, because that is what `AspectRatio` takes.
 *
 * Numbers and not Tailwind's `aspect-square`, `aspect-video` keywords, for
 * `AspectRatio`'s reason and it is the important one: this package's stylesheet is
 * built by scanning this package's own source, so a utility that appears in no
 * Prism file is a utility no consumer's stylesheet contains. `aspect-square`
 * written here would be a silently missing rule, and a `3 / 4` portrait is not a
 * keyword at all. So the ratio is a number this Block reads and hands over.
 */
const RATIOS: Record<Gallery01Ratio, number> = {
  square: 1,
  landscape: 16 / 9,
  portrait: 3 / 4,
}

/** How many images a grid puts on one line. The tracks, not the image count. */
export type Gallery01Columns = 2 | 3 | 4

/**
 * The tracks a grid of images gets, from the caller's own column count.
 *
 * Spelled out per count so a grid has exactly as many tracks as it declared and
 * not one empty at the end of a row. The `sm:` step is a narrowing rather than a
 * widening, because a three-up row of images at phone width is three thumbnails a
 * reader cannot tell apart, and a gallery is a set of things they are choosing
 * between.
 */
const TRACKS: Record<Gallery01Columns, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
}

/**
 * One image in the grid: where it is, what it is, and the words that go under it.
 *
 * `src` and `alt` are required and `alt` is load bearing three times: it is the
 * image's description on the enlarged surface, the name of the button that opens
 * it, and the name of the button in the rail that moves between them. A gallery
 * that shipped an unnamed image has a dialog with no title, a rail of identical
 * buttons, and a reader who has paid a modal, a focus trap and an Escape key to
 * look at something nobody described.
 */
export type Gallery01Item = {
  /** The image's stable key within the set. */
  id: string
  /** Where the image is. A path or a URL, the caller's own either way. */
  src: string
  /**
   * The image's description, in the caller's words.
   *
   * Required, and it is the button's accessible name as well as the image's. A
   * reader who cannot see the picture reaches the enlarged one and is told what it
   * is by this string, so it is a sentence about the content rather than a
   * filename.
   */
  alt: string
  /**
   * The words under the tile, drawn outside the button.
   *
   * A node, and the slot is where the caller's own link goes, for the reason the
   * Item's JSDoc states at length: a tile cannot be both a trigger and a link. A
   * caption is also the one place a reader gets a sentence about the set rather
   * than a description of one picture, which is why it sits below the tile and
   * not inside it.
   */
  caption?: ReactNode
  /**
   * Refused.
   *
   * A tile is a button that opens the lightbox, and a link on the same tile is two
   * controls inside one hit area, so the type says the field is never rather than
   * the render dropping it quietly. Put the link in `caption`, where it is a
   * control of its own with words on it that the caller chose.
   */
  href?: never
}

/**
 * The props a Gallery01 takes.
 *
 * Every string is a prop and the Block ships none: no image, no description, no
 * caption and not one label for the four controls the enlarged image draws. A
 * gallery that hardcoded its images would install a photograph nobody licensed
 * into every consumer's page.
 */
export type Gallery01Props = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: string
  /** The section title. Omit it for a gallery composed under its own heading. */
  title?: string
  /** One or two sentences under the title. */
  description?: string
  /**
   * The images, in the order a reader should meet them.
   *
   * Order is the caller's, and it is also the order the lightbox's rail moves in,
   * because the rail is this set: the Item hands the whole list over and the
   * lightbox asks for an index rather than holding the images. A consumer whose
   * set has a different order at full size than on the page owns `index` itself and
   * this Block is the wrong Item.
   */
  items: Gallery01Item[]
  /**
   * How many images sit on one line.
   *
   * @defaultValue 3
   */
  columns?: Gallery01Columns
  /**
   * The shape every tile is held at.
   *
   * @defaultValue 'landscape'
   *
   * Landscape is the default because the commonest thing a gallery holds is a
   * screenshot or a photograph, and both have a shape wider than they are tall.
   * `portrait` is for a set of pages or of people, and `square` is for a set of
   * marks. A mixed set is a set whose images crop, because the surface is one
   * ratio for every tile and `object-cover` fills it.
   */
  ratio?: Gallery01Ratio
  /**
   * The accessible names of the four controls the enlarged image draws.
   *
   * Required, and it is the one departure from the shape the other Blocks in this
   * wave use. The alternative was to draw the enlarged image without the
   * lightbox, and that would have cost the focus trap, the restore of focus, the
   * Escape key, the outside press, the scroll lock and the portal, every one of
   * which is solved badly twice as often as it is solved well. So the surface is
   * composed and the four words are asked for, the same way `DataTable01` asks for
   * every string it renders rather than shipping twenty of them.
   */
  labels: Gallery01Labels
  /** Heading level for the section title. See `HeadingLevel`. */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Block. Changing a Prism-owned visual
   * property from here is prohibited.
   */
  className?: string
}

/**
 * A tile's accessible name, composed from the two values the caller passed.
 *
 * **The composition is the caller's two props and never a word Prism invented,
 * and that is the whole rule on this line.** When there is no caption the name is
 * the `alt` and there is nothing to compose. When there is a string caption the
 * name is the caption followed by the `alt`, because the caption is the words the
 * reader can already see and the description is the words they cannot get from the
 * thumbnail. Prism adds a separator and nothing else: no "Open", no "View", no
 * "image of". A name Prism invented is a word in this package that a consumer
 * cannot translate, and a tile named "Open image" in a product whose interface
 * says something else is a control the consumer has to patch the library to fix.
 *
 * A caption that is a node rather than a string contributes nothing to the name,
 * and the tile's name is then the `alt` alone. That is a cost and it is the right
 * one: a node may be a list, a button or a picture, and an accessible name is a
 * string, so a name assembled from a node's text is a name this Block would have
 * to compute by rendering the node somewhere it does not belong. A caller who
 * wants their own words in the name passes the caption as a string.
 *
 * The inner image is marked decorative, so the button's name is the description
 * and not a doubled reading of the same pixels. That is `Lightbox`'s own treatment
 * of its thumbnails, and the reason is the same: a reader who has navigated to a
 * tile is about to be told what the picture is, and hearing the alt twice is two
 * sentences for one image.
 */
function nameOf(item: Gallery01Item): string {
  return typeof item.caption === 'string' && item.caption.trim() !== ''
    ? `${item.caption}, ${item.alt}`
    : item.alt
}

/**
 * A grid of images that opens one at full size, with a caption per tile and a
 * count on the set.
 *
 * **The enlarged surface is `Lightbox`, and the argument for composing it rather
 * than drawing a dialog is the same argument `Lightbox` makes about `Dialog`.**
 * An image overlay built on a `div` and a `keydown` listener gets the Escape key
 * and no focus trap, so a keyboard reader tabs behind the image into a page they
 * cannot see, and the defect is invisible in review because the overlay works for
 * the person writing it. The focus trap, the restore of focus to whatever opened
 * it, the Escape key, the outside press, the scroll lock and the portal all come
 * from `Dialog` and are all solved once. So this Block composes `Lightbox` and
 * spends its own surface on the three things `Lightbox` does not know about: the
 * set, the tile and the count. The cost is the four required labels, which is a
 * real departure from the shape the rest of this wave uses and is stated in the
 * props.
 *
 * **The tile is a real `<button>`, and a tile is not a link.** Each tile is one
 * focusable control that opens the enlarged image, and the whole set is reachable
 * by Tab in the order the caller passed it. The alternative, a tile that is an
 * anchor to a full-size file, loses the zoom, the focus trap, the Escape key and
 * the rail, and it makes the destination a thing the browser can navigate away
 * from, which is a worse outcome for a reader who came to look rather than to
 * leave. The count on the tile says how many there are rather than inviting a
 * gesture, which is the arrangement that needs no discovery.
 *
 * **`href` on a tile is refused, and the type says `never`.** A tile that is both
 * a lightbox trigger and a link is two controls in one hit area: a reader
 * navigating by Tab meets one thing, activates it, and cannot tell whether they
 * enlarged the picture or followed a link out of the page, and a reader using a
 * switch control or a voice command has one target with two behaviours. The
 * refusal is in the type rather than only in a diagnostic, so a caller finds out
 * where they are looking rather than in a console. **The alternative is named and
 * it is the one to use: the caller's own link in the caption under the tile.** The
 * caption is drawn outside the button, so a link in it is a control of its own with
 * its own accessible name, its own focus position after the tile rather than
 * inside it, and the words the caller chose on it. A gallery of case studies is
 * nine tiles with nine captions and nine links, and it is better for it than nine
 * tiles that were also nine links.
 *
 * **The tile's accessible name is composed from the two values the caller passed
 * and never from a word Prism chose.** With no caption it is the `alt`. With a
 * string caption it is the caption and then the `alt`, because the caption is what
 * the reader can already see and the description is what they cannot get from a
 * thumbnail. Prism adds a separator and nothing else. See `nameOf` for why, and
 * for what happens when the caption is a node rather than a string.
 *
 * **The count is drawn whenever there is more than one image, and there is no prop
 * for it.** A count of one names nothing and a count of zero is not on the page,
 * so the only state in which a count says anything is the state in which it is
 * drawn. It is a number, so it is in the mono face and it is `aria-hidden`: it is
 * machine notation about the set rather than part of any tile's name, and a reader
 * who needs the position of the image they are looking at gets it from the rail,
 * which names every image by its own description. If a consumer needs a count they
 * can hide, the honest answer is that the number is not information and the set's
 * own title is where its size belongs.
 *
 * **`ratio` is a number handed to `AspectRatio`, not a Tailwind keyword.** Prism's
 * stylesheet is built by scanning this package's own source, so `aspect-square`
 * written here would be a utility that appears in no Prism file and is therefore a
 * utility no consumer's stylesheet contains, and a portrait ratio is not a keyword
 * at all. So the three shapes are numbers this Block holds and passes.
 *
 * **The images belong to the caller, so this is the one Block in this wave that
 * needs `'use client'`.** It owns the open index and nothing else, which is the
 * smallest possible reason: the state is one number, and the data is not fetched
 * or held, so the client JavaScript a consumer pays for here is the dialog stack
 * `Lightbox` already brings and no more.
 */
export function Gallery01({
  eyebrow,
  title,
  description,
  items,
  columns = 3,
  ratio = 'landscape',
  labels,
  headingLevel = 'h2',
  className,
}: Gallery01Props) {
  // One number, and it is the only state this Block owns: which image is open, or
  // `null` for the state in which none is. The images themselves are props, so a
  // consumer that closes the dialog and re-renders with a different set has not
  // lost anything this Block was holding.
  const [openAt, setOpenAt] = useState<number | null>(null)

  for (const item of items) {
    if (item.href !== undefined) {
      throw new Error(
        `Gallery01: the item "${item.id}" passed an href, so its tile would be a lightbox trigger and a link in ` +
          'one hit area, which is two controls where a reader expects one and a Tab stop whose behaviour they ' +
          'cannot predict. Put the link in the caption under the tile instead, where the words on it are yours.',
      )
    }
  }

  if (items.length === 0) return null

  const at = openAt ?? 0
  const current = items[at] ?? items[0]
  // A count of one names nothing, so the only state in which the count says
  // anything is the state in which it is drawn.
  const counted = items.length > 1

  return (
    <Section>
      {title ? (
        <SectionHeading
          as={headingLevel}
          align="left"
          eyebrow={eyebrow}
          title={title}
          description={description}
          className="mb-12"
        />
      ) : null}

      <ul
        data-slot="gallery"
        data-ratio={ratio}
        className={cn('grid gap-4', TRACKS[columns], className)}
      >
        {items.map((item, index) => (
          <li key={item.id} data-slot="gallery-tile" className="flex flex-col gap-2">
            <button
              type="button"
              data-slot="gallery-trigger"
              data-index={index}
              // Composed from the caller's two values and nothing else. See
              // `nameOf`: a name Prism invented is a word in this package a
              // consumer cannot translate.
              aria-label={nameOf(item)}
              onClick={() => setOpenAt(index)}
              // The ring is `ring-ring` at full strength and 3px, for the reason
              // `button.tsx` states: half alpha composites to between 1.14:1 and
              // 2.74:1 against every surface in all six themes and clears 3:1 in
              // none of them, which fails WCAG 1.4.11 on the one indicator a
              // keyboard user has. A tile is the item most likely to be reached by
              // keyboard, because it is one of many and they are all the same.
              className="ring-ring focus-visible:ring-[3px] hover:border-primary relative block w-full overflow-hidden rounded-lg border outline-none transition-colors duration-fast ease-out"
            >
              <AspectRatio ratio={RATIOS[ratio]}>
                {/*
                  Decorative, because the button is named by `aria-label` above and
                  a second reading of the same pixels is two sentences for one
                  image. It is `Lightbox`'s own treatment of its thumbnails.
                */}
                <img
                  data-slot="gallery-image"
                  src={item.src}
                  alt=""
                  className="absolute inset-0 size-full object-cover"
                />
              </AspectRatio>

              {counted ? (
                <span
                  data-slot="gallery-count"
                  aria-hidden="true"
                  className="bg-background/90 text-foreground absolute right-2 bottom-2 rounded-md px-1.5 py-0.5 font-mono text-xs"
                >
                  {items.length}
                </span>
              ) : null}
            </button>

            {/*
              The caption is outside the button, and that is what makes the
              caller's own link in it a control of its own with its own name and
              its own focus position after the tile. See the Item's JSDoc for why
              the tile refuses an `href`.
            */}
            {item.caption ? (
              <div data-slot="gallery-caption" className="text-muted-foreground text-pretty text-sm">
                {item.caption}
              </div>
            ) : null}
          </li>
        ))}
      </ul>

      <Lightbox
        open={openAt !== null}
        onOpenChange={(open) => {
          if (!open) setOpenAt(null)
        }}
        src={current.src}
        alt={current.alt}
        caption={current.caption}
        // The rail is this set, in this order, named by each image's own
        // description. The lightbox asks for an index rather than holding the
        // images, so a consumer whose set is ordered differently at full size owns
        // the index itself and this is the wrong Item for them.
        thumbnails={items.map((item) => ({ src: item.src, alt: item.alt }))}
        index={at}
        onIndexChange={setOpenAt}
        zoomLabel={labels.zoom}
        previousLabel={labels.previous}
        nextLabel={labels.next}
        closeLabel={labels.close}
      />
    </Section>
  )
}

export default Gallery01
