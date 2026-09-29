import type { ComponentProps, ReactNode } from 'react'

import { cn } from '../../lib/utils'

/**
 * One row: what a reader is being shown, and what they can do about it.
 *
 * The anatomy is fixed by this type rather than assembled from slots, because the
 * order is the row. Media leads, the text block holds a primary and a secondary
 * line, the value sits after it and the actions sit last. A row whose parts can
 * be rearranged is four parts and a decision, and every list that hand-rolled its
 * own row made that decision slightly differently; that is the drift this
 * Component exists to end.
 *
 * `href` is what makes the row reachable, and it is a first-class field rather
 * than a property of the trailing slot, because a row whose only way to be
 * followed is a kebab menu in the corner is a row that hides its own content from
 * a reader who is not looking for a menu.
 */
export type ItemEntry = {
  /**
   * A stable key for the row.
   *
   * Required, because the common list this row lives in reorders, filters and
   * replaces itself, and a row keyed by index has a reader's focus and a screen
   * reader's announcement land on a different row when one is inserted above it.
   */
  id: string
  /** The primary line: the name of the thing this row is about. */
  title: ReactNode
  /**
   * The secondary line under it, in the muted ink.
   *
   * Omit it rather than passing an empty string. A row with no secondary line is
   * one line tall; a row with an empty second line is one line tall with the
   * reader looking for the thing that is not there.
   */
  description?: ReactNode
  /** A short value that belongs to the row but is not part of its name. */
  meta?: ReactNode
  /** Where the row goes. Omit it for a row that is read rather than followed. */
  href?: string
  /**
   * A thumbnail, an avatar, a status mark. Whatever it is, it is clipped to a
   * fixed square so a row's height is the same whichever media a caller passes.
   */
  media?: ReactNode
  /**
   * The controls at the trailing edge.
   *
   * These are *in addition to* whatever `href` reaches, never instead of it. A
   * row whose only destination is an action is a row whose content is only
   * reachable by a reader who guesses that the controls are the content, and a
   * caller who has no destination should omit this rather than reach for it.
   */
  actions?: ReactNode
  /**
   * Marks the row as the current one.
   *
   * Marked with `aria-current` as well as with the surface, because a selected
   * row that is only a different colour is invisible to a reader who cannot
   * separate the two inks, and this is the same rule the Timeline's states and the
   * ProductSwitcher's member follow.
   */
  selected?: boolean
}

/** The props the Item accepts. */
export interface ItemProps extends Omit<ComponentProps<'div'>, 'children' | 'title'> {
  /** The row's own content. See `ItemEntry` for what a row is made of. */
  entry: ItemEntry
  /** Layout only. */
  className?: string
}

/**
 * A row in a list or a set: media, a text block, a value and trailing controls.
 *
 * **It is the row, and the list is the caller's.** That is the one decision worth
 * making here, and it is a decision against making this a data-driven list. An
 * Item renders one row and nothing about what encloses it, because the same row
 * appears in a `<ul>`, in a definition list, in a card grid and in a table cell,
 * and a Component that owned the list would have to own all four. A caller writes
 * the list element its content actually is and puts rows in it; what they stop
 * writing is the row.
 *
 * So a caller writes `<li><Item key={id} entry={row} /></li>` and gets a real list
 * item, the count and the position in the accessibility tree, and a row whose
 * geometry cannot drift from the row below it. The wrapper is one element, and
 * the row is the part that was being re-derived in every list in this package.
 *
 * **The trailing controls are never the only route to the row.** `href` is a
 * field on the row rather than something the actions have to carry, so the
 * primary line is a real anchor a reader can tab to, see where it goes before
 * taking it, and open in a new context. A row of forty with its only destination
 * behind a kebab menu is a list a screen reader user cannot read, because the
 * menu's contents are not in the document until the menu is open.
 *
 * **The title is not stretched over the whole row.** The obvious treatment for a
 * clickable row is an anchor with `position: absolute; inset: 0` and the actions
 * raised above it, which makes the entire row a hit target. It is refused for the
 * focus indicator: the ring belongs to the anchor, and an anchor stretched over a
 * row is a box that has sized itself to the text inside it, so the ring a keyboard
 * reader sees is a ring around the words rather than around the thing they are
 * about. Prism's rings are per element at full strength, and a ring that does not
 * bound the thing it names is not an indicator.
 *
 * **The selected row is marked, not only tinted.** `aria-current` carries the
 * state and the surface repeats it for a reader who reads by eye, which is the
 * same order the whole package keeps meaning in: the attribute is the fact and
 * the colour is the reminder.
 *
 * It is a server Component. It holds no state, runs no effect and attaches no
 * handler, so a list of two hundred rows costs no JavaScript at all.
 */
function Item({ entry, className, ...props }: ItemProps) {
  const { id, title, description, meta, href, media, actions, selected } = entry
  const hasActions = actions !== undefined && actions !== null && actions !== false

  return (
    <div
      data-slot="item"
      data-item={id}
      data-selected={selected ? 'true' : undefined}
      aria-current={selected ? 'true' : undefined}
      className={cn(
        'flex items-center gap-3 px-3 py-2',
        // The row is only interactive when there is something to interact with, so
        // the hover surface is conditional. A hover tint on a row that does
        // nothing is a promise the row does not keep, and a reader learns to
        // ignore the tint on every row in the list.
        href === undefined ? '' : 'hover:bg-muted',
        selected ? 'bg-muted' : '',
        className,
      )}
      {...props}
    >
      {media === undefined || media === null || media === false ? null : (
        /*
         * Media is left in the accessibility tree. An avatar and a thumbnail both
         * carry information a row's text does not, and hiding the slot would make
         * the caller's `alt` unreachable; a caller whose media really is
         * decoration passes an `aria-hidden` image and decides that for itself,
         * which is the only party that knows.
         */
        <div
          data-slot="item-media"
          className="bg-muted flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md [&_img]:size-full [&_img]:object-cover"
        >
          {media}
        </div>
      )}

      <div data-slot="item-content" className="flex min-w-0 flex-1 flex-col gap-0.5">
        {/*
         * The primary line, and the row's destination when it has one. It is a
         * native anchor rather than a handler on the row, so a reader can see the
         * address before following it, open it in a new context, and copy it.
         */}
        <span data-slot="item-title" className="min-w-0 truncate text-sm font-medium">
          {href === undefined ? (
            title
          ) : (
            <a
              data-slot="item-link"
              href={href}
              className={cn(
                'hover:underline focus-visible:ring-ring rounded-sm outline-none focus-visible:ring-[3px]',
              )}
            >
              {title}
            </a>
          )}
        </span>

        {description === undefined || description === null || description === false ? null : (
          <span
            data-slot="item-description"
            className="text-muted-foreground min-w-0 truncate text-sm"
          >
            {description}
          </span>
        )}
      </div>

      {meta === undefined || meta === null || meta === false ? null : (
        <span data-slot="item-meta" className="text-muted-foreground shrink-0 text-sm tabular-nums">
          {meta}
        </span>
      )}

      {/*
       * The trailing controls, and never the row's only way out. The caller
       * composes them, so this is a plain container with no role: the controls
       * inside are the controls, and a group role here would be a group with no
       * name and one more landmark a reader has to walk past.
       */}
      {hasActions ? (
        <div data-slot="item-actions" className="flex shrink-0 items-center gap-1">
          {actions}
        </div>
      ) : null}
    </div>
  )
}

export { Item }
