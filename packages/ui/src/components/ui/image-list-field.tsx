'use client'

import { ImagePlusIcon, XIcon } from 'lucide-react'
import { useEffect, useId, useRef, type ReactNode } from 'react'

import { Button } from './button'
import { cn } from '../../lib/utils'

/**
 * One image the field holds, and the three things the field knows about it.
 *
 * A reference and not a file. A `File` object is a browser fact that does not
 * survive a page reload and says nothing about where the bytes are, and a
 * design system that took one would be a Component whose value is only meaningful
 * on the machine that produced it. What a form field actually holds is a handle:
 * an id the caller's own store recognises, and a name a reader recognises. The
 * caller resolves that handle into a URL, a signed path or a thumbnail component,
 * and passes the result as `preview`, because how an image is fetched, cached and
 * cropped is the caller's transport decision and Prism ships no client.
 */
export type ImageListFieldImage = {
  /**
   * The caller's own identity for the image, and what the remove control reports.
   *
   * Required, and required as a string rather than as the file name, for the
   * reason `FileUpload` states in full: a reader who adds the same photograph
   * twice has two rows with the same name, and two remove controls that announce
   * identically are two controls nobody can tell apart.
   */
  id: string
  /**
   * The name a reader recognises the image by.
   *
   * A word and not a sentence. It is drawn truncated in the middle and it is what
   * `removeLabel` is given, so it is the one string in the row that a caller
   * should keep short enough to finish reading.
   */
  name: string
  /**
   * The caller's own picture for the row, clipped to a fixed square.
   *
   * A `ReactNode` and not a URL. A URL here would be a claim that the image lives
   * at an address the browser can fetch, which is false for a blob, a signed
   * path that expires, a data URI and anything behind an authenticated route, and
   * a Component that rendered an `<img>` would then be drawing a broken image and
   * an alt text it invented. Pass an `img` with the caller's own `alt`, or a
   * placeholder mark; both are the caller's to choose.
   */
  preview?: ReactNode
}

/**
 * The props the Image list field accepts.
 *
 * A declared interface rather than a forwarded native one, which is the opposite
 * of what most of this package does and is right here: every prop on this
 * Component is a fact about the caller's value or a sentence the caller owns, and
 * there is no native attribute left to forward once those are spent.
 */
export interface ImageListFieldProps {
  /**
   * The images, in the order the reader added them.
   *
   * Required, and order is the caller's because it is a claim about importance.
   * The list is an `ol`, so the position is in the accessibility tree and a
   * reader who removes the third of six hears the five that remain renumbered
   * rather than having to count them again.
   */
  images: ImageListFieldImage[]
  /**
   * The most images this field will hold.
   *
   * Required, and a number rather than a boolean, because "at most one" and "at
   * most twelve" are the same shape of rule and only one of them is a decision
   * about a product. A caller that does not have a cap does not use this
   * Component: a list with no ceiling is a `FileUpload` with a receipt's worth of
   * rows, and the Component that already draws that is one call away.
   */
  cap: number
  /**
   * The visible label of the add affordance, in the product's own words.
   *
   * Required and never defaulted. "Add photograph", "Add another floor plan" and
   * "Subir imagen" are three products' answers, and the affordance is the one
   * place on the field where a reader decides whether the rule is one they accept.
   */
  addLabel: ReactNode
  /**
   * Called when the reader asks for another image.
   *
   * Required, and it is a callback rather than a composed `Dropzone` on purpose.
   * This Component cannot know what an image is on the caller's side: it may be a
   * browser `File` on its way to an upload, a URL already in the caller's store,
   * or a picked frame from a camera roll the browser has no input for. Enforcing
   * the cap means owning the affordance, and owning the affordance means Prism
   * draws the control while the caller keeps the picker: compose `Dropzone` in
   * your own layout, or a `Button` over a hidden `input`, and open it here. The
   * alternative, Prism rendering a `Dropzone` and being handed `File` objects,
   * would make a field about images a field about uploads, and every caller whose
   * images are already stored would have to fake a `File` to use it.
   */
  onAdd: () => void
  /**
   * Called with an image's `id` when the reader takes it off the list.
   *
   * Required rather than optional, unlike `FileUpload`'s. A `FileUpload` is
   * sometimes a receipt, and offering to remove an attachment from a receipt is a
   * promise the product cannot keep. A field is not a receipt: the images on it
   * are the ones the reader is still choosing between, so a field where a chosen
   * image cannot be unchosen is a form with a mistake in it and no way back.
   */
  onRemove: (id: string) => void
  /**
   * The accessible name of one row's remove control, given that row's image name.
   *
   * Required, and a function because the name has to name the image and the
   * image's name is the caller's string rather than this package's sentence. A
   * nameless remove control is announced as "button", and a screen reader user
   * holding a list of six is left to work out which row it belongs to.
   */
  removeLabel: (name: string) => string
  /**
   * What stands in for the list while it is empty.
   *
   * Required, and it is a label rather than a placeholder row. A row with no
   * image in it is a row a reader tries to remove, and a row whose preview is
   * still loading is a row that looks like a broken image. The absence is either
   * the caller's own sentence or, here, nothing at all: a caller who would rather
   * the field showed nothing until the first image passes an empty string and
   * gets nothing drawn, because the check is on the value's length and not on
   * this prop being present.
   */
  empty: ReactNode
  /**
   * What the reader is told when the cap is reached.
   *
   * Optional, and it exists because the affordance going unavailable is a
   * question the reader will ask. A dimmed add button answers "can I not" and not
   * "why not", and a form whose only feedback is a dimmed control is the dead end
   * the disabled-state rule exists to prevent. Written with the limit and the way
   * past it: "Six is the most a listing takes. Remove one to swap it." The
   * affordance points at it with `aria-describedby` while it is shown, so the
   * reason is announced with the control rather than sitting beside it as a line
   * a reader has to find.
   */
  capLabel?: ReactNode
  /**
   * The list's own name, drawn above it and used as its accessible name.
   *
   * Optional rather than required, and the omission is deliberate rather than an
   * oversight: this is the one place in the package where a region is allowed to
   * arrive anonymous, and `ListPanel` says why at length. A list called "Images"
   * is a claim that is wrong in every consumer's product, and a screen reader
   * user hearing a generic name learns less than hearing none, because a name is
   * a promise that something follows it. Omit it and the list is honestly absent
   * from the landmark list; pass one when the field sits among several.
   */
  label?: ReactNode
  /** Layout only. Changing a Prism-owned visual property from here is prohibited. */
  className?: string
}

/**
 * The remove control, drawn once and used by every row.
 *
 * The same treatment `FileUpload` gives its own remove control, for the same
 * reason and with the same two decisions: the ink is the muted one because every
 * row is the same surface and a control that changed colour with its row's state
 * would be a second thing to read, and the target takes the 44px coarse-pointer
 * floor so a list of photographs on a phone is a list of rows a thumb can hit.
 * Duplicated as a constant rather than imported, because `FileUpload` does not
 * export it and the alternative is for this Component to redraw the whole list
 * to get at one class string.
 */
const REMOVE_CONTROL =
  'text-muted-foreground hover:text-foreground inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-sm outline-none transition-colors duration-fast ease-out pointer-coarse:size-11 focus-visible:ring-ring focus-visible:ring-[3px]'

/**
 * A row's own `data-slot`, read back through one root ref.
 *
 * The Component does not hold a ref per row. A ref array indexed by position has
 * to be reconciled with the value on every commit, and the value is the caller's,
 * so the reconciliation is a second source of truth about how many rows there
 * are. One ref on the root and a query for the Component's own slots is the same
 * answer with no bookkeeping, and the cost is stated rather than hidden: it reads
 * markup rather than state, so it can only reach what this Component drew, which
 * is exactly the set that has to move.
 */
const REMOVE_SLOT = '[data-slot="image-list-field-remove"]'
const ADD_SLOT = '[data-slot="image-list-field-add"]'

/**
 * An ordered list of images with a cap, a per-item remove, and an add affordance
 * that stops offering a seventh before the reader has chosen one.
 *
 * **It is not a `FileUpload`, and the difference is the cap.** `FileUpload` is the
 * receipt half of an upload: it renders whatever array it is handed, with no
 * ceiling and no way in, because a receipt names what was sent and a limit on
 * what may be sent belongs to the control that sends. This is the other half. It
 * has a ceiling, and the ceiling is a rule about the caller's product, so the
 * Component that can enforce it is the one that owns the affordance. A caller who
 * wants a capped list today writes a button, a length test and a disabled branch,
 * and the branch is the interesting one, because a cap enforced anywhere else
 * produces one of two lies: a value holding six images rendered as four, or six
 * rows where the fifth and sixth are drawn in a way that says they are not
 * welcome. Neither is a fact about the reader's field. The one thing that is a
 * fact is the affordance, and this is the Component that draws it.
 *
 * **The cap is enforced at the affordance and nowhere else, and that placement is
 * the design.** The moment the cap is reached, the add control is still there, in
 * the tab order, and marked `aria-disabled`; it is not removed and it is not
 * natively disabled, because a control that vanishes leaves a keyboard reader
 * with a gap and no announcement, and a natively disabled one is gone from the tab
 * order for the same reason. `Dropzone` states the whole argument and this
 * Component inherits it. The reader learns the cap before they spend a pick, and
 * the value is never silently truncated.
 *
 * **Removing a middle row moves focus, and that is the part no prop can express.**
 * The naive `onRemove` hands the reader back to the document: the button they
 * pressed is unmounted with the row, focus falls to `body`, and the next Tab
 * starts from the top of the page, so a reader removing the third of six
 * photographs is returned to the top of a form to find the two they still meant
 * to change. The correct destination is a neighbour, and which neighbour is a
 * fact about the index the caller does not know this Component holds: the row
 * that moved up into the removed row's place, or the one above it when the
 * removed row was last. Prism knows the index because it drew the row, so Prism
 * moves the focus. When the last image goes, the focus lands on the add control,
 * because that is the only operable thing left in the field and dropping a reader
 * on nothing is the same defect one level up.
 *
 * **The row is a reference and the list is an `ol`, so position is in the
 * accessibility tree.** The Component does not draw an ordinal and does not
 * renumber anything by hand: an `ol` reports "3 of 6" for free, and the
 * renumbering the reader needs after a removal is the list doing its job rather
 * than a number this Component recomputed and could get wrong. The remove control
 * is named by the caller's own sentence so the two do not have to agree.
 *
 * **It draws its own row and does not compose `FileUpload`, and the reason is the
 * number of bytes.** `FileUpload`'s row is a name, a size in bytes, an optional
 * transfer meter and an optional per-file error, and a field of references has
 * none of those: a stored image has no size until the caller fetches it, and
 * drawing a byte count for an image that has not been downloaded is a
 * measurement of nothing. The two would also disagree about focus, because
 * `FileUpload` owns its own remove control and there is no way to tell it where
 * the reader's focus should land afterwards without reaching into its markup. The
 * composition Prism does make is outward: `onAdd` is the seam where a `Dropzone`
 * or a hidden `input` is composed, and `Button` draws the affordance rather than
 * this Component re-deriving a control's metrics.
 *
 * **It is a client Component**, because the focus handoff and the cap's arrival
 * both happen after the reader acts, and neither can be known at a server render.
 * What that costs is the price of every client field: a form with images on it
 * carries a hydration boundary, and a caller whose form is otherwise static pays
 * for this one. The value is still the caller's, so a server Component may render
 * the whole field once with the list already in place; what it may not do is offer
 * a capped, removable list whose focus behaves, because that part is a client
 * fact.
 *
 * **Two upstream spellings are this one job, and the catalogue holds one of
 * them.** An image list and a gallery upload differ in whether the frame around
 * the images is decorative, and in nothing else: both are an ordered list of
 * image references, both cap, both remove. Publishing both would put two Items in
 * the list whose only difference is a wrapper one of them drew, and a list
 * nobody can search is what the naming law exists to prevent. A caller who wants
 * a gallery frames the list themselves, which is layout and therefore already
 * theirs.
 */
function ImageListField({
  images,
  cap,
  addLabel,
  onAdd,
  onRemove,
  removeLabel,
  empty,
  capLabel,
  label,
  className,
}: ImageListFieldProps) {
  const generated = useId()
  const labelId = `${generated}-label`
  const capId = `${generated}-cap`
  const rootRef = useRef<HTMLDivElement>(null)
  // The index whose remove control should take focus after the caller's value
  // settles, or `'add'` for the add control when the list empties. Armed before
  // the callback runs and read after the next commit, because the row that is
  // gone cannot be focused and the row that replaced it does not exist yet.
  const pending = useRef<number | 'add' | null>(null)

  const capped = images.length >= cap
  // The four absent values rather than a truthiness test, for the reason
  // `LiveRegion` states: an empty string, a null from a state that has not
  // resolved and a false from a condition are three routes to "nothing to say",
  // and a list of three is a list the fourth route would miss. Zero is not on it
  // because React renders `0`.
  const showEmpty =
    images.length === 0 && empty !== '' && empty !== null && empty !== undefined && empty !== false

  useEffect(() => {
    const target = pending.current
    if (target === null) return
    pending.current = null

    const root = rootRef.current
    if (root === null) return

    if (target === 'add') {
      root.querySelector<HTMLElement>(ADD_SLOT)?.focus()
      return
    }

    const buttons = root.querySelectorAll<HTMLElement>(REMOVE_SLOT)
    // The row that moved up into the removed row's place, or the one above it when
    // the removed row was the last. `Math.min` against the new count is the whole
    // rule, and the list being empty afterwards is the case that has no row left
    // to land on.
    const button = buttons.item(Math.min(target, buttons.length - 1))
    if (button === null) root.querySelector<HTMLElement>(ADD_SLOT)?.focus()
    else button.focus()
  })

  const removeAt = (index: number) => {
    const image = images[index]
    if (image === undefined) return
    pending.current = index
    onRemove(image.id)
  }

  return (
    <div
      ref={rootRef}
      data-slot="image-list-field"
      className={cn('flex w-full flex-col gap-2', className)}
    >
      {label === undefined ? null : (
        <span
          id={labelId}
          data-slot="image-list-field-label"
          className="text-muted-foreground text-xs font-medium tracking-wide uppercase"
        >
          {label}
        </span>
      )}

      {showEmpty ? (
        <p data-slot="image-list-field-empty" className="text-muted-foreground text-sm">
          {empty}
        </p>
      ) : (
        <ol
          data-slot="image-list-field-list"
          aria-labelledby={label === undefined ? undefined : labelId}
          className="flex w-full flex-col gap-2"
        >
          {images.map((image, index) => (
            <li
              key={image.id}
              data-slot="image-list-field-item"
              className="border-border bg-card flex items-center gap-3 rounded-md border px-3 py-2"
            >
              {image.preview === undefined || image.preview === null || image.preview === false ? null : (
                /*
                 * The caller's picture, clipped rather than sized. A preview that
                 * keeps its own aspect ratio changes the height of the row it sits
                 * in, and a list of rows whose heights depend on the pictures in
                 * them is a list a reader cannot scan. The caller's own `alt`
                 * stays reachable: the box is not `aria-hidden`, because an image
                 * carries information the row's name does not, and a caller whose
                 * preview really is decoration passes one that says so.
                 */
                <div
                  data-slot="image-list-field-preview"
                  className="bg-muted flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md"
                >
                  {image.preview}
                </div>
              )}

              <span
                data-slot="image-list-field-name"
                className="min-w-0 flex-1 truncate text-sm font-medium"
              >
                {image.name}
              </span>

              <button
                type="button"
                data-slot="image-list-field-remove"
                aria-label={removeLabel(image.name)}
                onClick={() => removeAt(index)}
                className={REMOVE_CONTROL}
              >
                <XIcon className="size-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ol>
      )}

      {/*
       * The affordance, and the only place the cap is enforced. The wrapper
       * carries the unavailable surface rather than the control, because `Button`
       * styles the native `disabled` attribute and this Component does not set it:
       * the control keeps its place in the tab order, keeps its ring, and
       * announces itself as unavailable, which is the whole of the `Dropzone`
       * argument. `pointer-events` is left alone, so the click lands and is
       * refused by the handler rather than swallowed by a wrapper the caller never
       * asked for.
       */}
      <div data-slot="image-list-field-actions" className="flex items-center gap-2">
        <span
          data-slot="image-list-field-add-control"
          className={cn('inline-flex', capped && 'opacity-50')}
        >
          <Button
            data-slot="image-list-field-add"
            type="button"
            variant="outline"
            size="sm"
            aria-disabled={capped || undefined}
            aria-describedby={capped && capLabel !== undefined ? capId : undefined}
            onClick={capped ? () => undefined : onAdd}
          >
            <ImagePlusIcon aria-hidden="true" />
            {addLabel}
          </Button>
        </span>

        {capped && capLabel !== undefined ? (
          <span id={capId} data-slot="image-list-field-cap" className="text-muted-foreground text-xs">
            {capLabel}
          </span>
        ) : null}
      </div>
    </div>
  )
}

export { ImageListField }
