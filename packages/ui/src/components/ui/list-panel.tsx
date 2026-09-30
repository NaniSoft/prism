import { useId, type ComponentProps, type ReactNode } from 'react'

import { ScrollArea } from './scroll-area'
import { cn } from '../../lib/utils'

/**
 * The props a `ListPanelHeader` takes.
 *
 * A part rather than an Item, and it stays inside this module: DESIGN.md's
 * authoring contract says compound parts ship from their parent module and do not
 * form a second vocabulary, so `ListPanelHeader` is not a catalogue entry and gets
 * no folder of its own.
 */
export interface ListPanelHeaderProps extends Omit<ComponentProps<'div'>, 'title'> {
  /**
   * The id the panel's `aria-labelledby` points at.
   *
   * Supplied by `ListPanel`, which generates it and puts it on the title element.
   * It is not optional in the sense of being forgettable: a caller who renders a
   * `ListPanelHeader` inside their own `section` passes their own id and sets
   * `aria-labelledby` themselves, and the cost of that arrangement is the reason
   * the `title` prop on `ListPanel` is the ordinary path.
   */
  titleId: string
  /** The one line that names the panel. */
  title?: ReactNode
  /** The supporting line under the title. */
  description?: ReactNode
  /**
   * A count line, such as the caller's own "12 of 40".
   *
   * A node and not a number because the sentence around the number is the
   * consumer's: an English reader wants "12 of 40", a locale that puts the total
   * first wants it the other way round, and a panel that assembled the sentence
   * would have assembled it in one of them.
   */
  count?: ReactNode
  /** The controls at the trailing edge of the header. */
  actions?: ReactNode
  /** Layout only. */
  className?: string
}

/**
 * The props a `ListPanelBody` takes, as a union over whether the body scrolls.
 *
 * A union rather than two independent optionals, for the reason the whole module
 * keeps repeating: a scroll region is a tab stop, so a scrolling body owes it a
 * name, and a body that does not scroll is not a tab stop and owes nothing. One
 * optional prop set cannot say that, and a `label` that is required in one shape
 * and optional in another is a prop whose absence is sometimes a mistake and
 * sometimes a decision.
 */
export type ListPanelBodyProps = Omit<ComponentProps<'div'>, 'children'> & {
  /** The rows, or whatever the list actually is. */
  children?: ReactNode
  /** Layout only. */
  className?: string
} & (
  | {
      /**
       * A body that scrolls, which is a tab stop and therefore has to be named.
       *
       * The rule `ScrollArea` states, restated here because the body is the part
       * the caller touches, and a rule one step further on is a rule a caller reading
       * this module never meets. `scroll` is optional in this arm rather than
       * required, so a caller who is scrolling writes `<ListPanelBody label="...">`
       * and reads no boolean at all.
       */
      scroll?: true
      label: string
    }
  | {
      /**
       * A body that grows with its content, which is not a tab stop and needs no
       * name.
       */
      scroll?: false
      label?: string
    }
)

/** The props a `ListPanelFooter` takes. */
export interface ListPanelFooterProps extends ComponentProps<'div'> {
  /** Layout only. */
  className?: string
}

/**
 * The props a `ListPanel` takes, as a union over whether the body scrolls.
 *
 * A union rather than one optional prop set, because `label` and `maxHeight` are
 * required in one shape and meaningless in the other, and an optional prop cannot
 * say that. A caller who turns scrolling on has named a tab stop and owes it a
 * name; a caller who has turned it off has no tab stop and owes nothing.
 */
export type ListPanelProps = Omit<ComponentProps<'section'>, 'children' | 'title'> & {
  /**
   * The one line that names the panel, and the accessible name of the region.
   *
   * A `ReactNode` and not a `string`, because the panel's visible title is
   * content: an emphasis inside it, a count styled as part of it, a node with a
   * link in it. The accessible name is derived from this element by
   * `aria-labelledby` rather than set as a string, so the two can never say
   * different things.
   */
  title?: ReactNode
  /** The supporting line under the title, in the muted ink. */
  description?: ReactNode
  /**
   * A count line, such as the caller's own "12 of 40".
   *
   * Rendered under the description rather than beside the title because a count
   * is read after the name and before the description, and putting it on the
   * title's line would make the title itself wrap for a number.
   */
  count?: ReactNode
  /**
   * The header's toolbar slot: the controls that act on the whole list rather
   * than on one row.
   *
   * A slot and not a set of named controls, because which controls a list has is
   * the consumer's fact. A panel that drew a search box and a sort would be a
   * panel that assumed the list it holds is searchable and sortable.
   */
  actions?: ReactNode
  /**
   * The footer's slot: the actions that belong to the whole list, such as load
   * more, or the line saying how much of the set is shown.
   *
   * Distinct from `actions` because a header acts on the list and a footer ends
   * it, and because the footer is the only part that stays put while the body
   * scrolls. Merging them would put a control that has to stay reachable in a
   * band that scrolls away.
   */
  footer?: ReactNode
  /** The list itself: the caller's own `ul`, `ol`, table or set of rows. */
  children?: ReactNode
  /** Layout only, exactly as on every Component. */
  className?: string
} & (
  | {
      /**
       * Whether the body scrolls inside the panel's `maxHeight`.
       *
       * On by default, and the default is the decision: the panel exists because
       * the list is long, and a panel that grows to the length of its list is a
       * frame around a page.
       */
      scroll?: true
      /**
       * The height the panel stops at, in pixels, once the list is longer than
       * that.
       *
       * A number and not a Tailwind class because the bound is data rather than
       * layout: the same panel is a short one in a sidebar and a tall one on a
       * full page, and a caller who could only say `max-h-80` would be picking
       * one of those for the other.
       */
      maxHeight?: number
      /**
       * The panel's accessible name, and the scroll region's.
       *
       * A `string` and not a `ReactNode`, because this one is written into
       * `aria-label` and an accessible name is a string. A node here would
       * render as nothing a reader hears.
       */
      label: string
    }
  | {
      /** Turn scrolling off for a panel whose list is known to be short. */
      scroll: false
      /** A bound with no scrolling is a bound that hides rows, so it is refused. */
      maxHeight?: never
      /**
       * The panel's accessible name, used only when there is no `title` to take
       * it from.
       */
      label?: string
    }
)

/**
 * A titled panel whose body is a scrolling list, with slots above and below it.
 *
 * **This is the third thing, and the reason it exists is that the other two were
 * already taken.** `item.tsx` is a row: media, a name, a description, a value
 * and trailing controls, with no opinion at all about what encloses it. And
 * `fact-list.tsx` is a definition list: a term beside its answer, scanned down a
 * column, short enough that the whole set is meant to be read. Neither is a
 * container, and a long list needs one. So this is the third thing: a titled,
 * bounded, scrollable region that gives a long list a place to end. The three
 * compose, and none of them can be derived from another: rows without a panel is
 * a page that never ends, and a panel without rows is a frame.
 *
 * **A `ListPanel` is not a table, and the difference is the reader's job rather
 * than the markup's.** A panel holds a list: each row is one thing, read top to
 * bottom, and the reader is scanning for the one they want. The moment the reader
 * needs to compare a value in one row against the same value in another, the
 * content is records with columns, the answer is `table.tsx`, and putting rows in
 * a panel instead is a table a reader has to read cell by cell because the
 * semantics are not there. The reverse is equally wrong: a two-column table of
 * one thing per row, where the second column is a status nobody compares against
 * anything, is a list that paid for column semantics it does not use.
 *
 * **The region is a real `<section>` and it is named by its own title.** Not a
 * `div`, because a panel of forty rows is a landmark a screen reader user walks
 * past on the way to something else, and a landmark they cannot name is a
 * landmark they walk past twice. The name comes from `aria-labelledby` pointing
 * at the title element rather than from a string prop, so the name a reader hears
 * and the name a sighted reader reads are the same text by construction and
 * cannot drift.
 *
 * **With no title there is no invented one.** The panel renders a `section` with
 * no name and says nothing, and `label` is the only way to name it. This is the
 * one place in this package where a region is allowed to arrive anonymous, and it
 * is the right answer rather than a gap: a panel named "Panel" is a claim that
 * is wrong in every consumer's product, and a screen reader user hearing "Panel"
 * learns less than hearing nothing, because a name is a promise that something
 * follows it. An anonymous region is honestly absent from the landmark list and
 * the reader moves on. A caller who wants a name passes one.
 *
 * **The scroll is `ScrollArea` and not `overflow: auto`, and that is the whole
 * reason the body is not written inline.** The browser's scrollbar is the one
 * control on a page that belongs to no design system: it is a rectangle the
 * operating system drew, in a colour chosen for the OS's own background rather
 * than for the card the content is on, and it is the only control that is resized
 * by dragging and appears on a timer. Composing this panel around `overflow-auto`
 * would give the reader a Prism surface beside an operating system scrollbar on
 * every panel in every consumer. The scrolling itself is still the browser's, so
 * the arrow keys, Page Up, Page Down, Home, End, the scroll position and
 * scroll-into-view all keep working, and only the bar's appearance is taken over.
 *
 * **The bound is on the panel and the body absorbs it.** `maxHeight` is set on
 * the `section`, which is a flex column, and the body is the flex item that
 * shrinks, so a list shorter than the bound grows the panel to fit and a list
 * longer than it scrolls inside what is left after the header and the footer. The
 * alternative, a `max-height` on the scroll region alone, leaves the region's own
 * height content-driven and clips the rows without giving the reader anything to
 * scroll.
 *
 * **The title's id is generated, and `useId` is why this module needs no
 * `'use client'`.** Pointing `aria-labelledby` at an element the Component drew
 * itself needs an id, and the Component may not invent one by counting: two panels
 * on a page would both reach for the same first id. `useId` is the one hook React
 * runs during a server render as well as a client one, so the panel is an ordinary
 * server Component with the `'use client'` line and the client runtime left off.
 * What that costs is stated rather than implied: a panel whose body scrolls is in
 * the client graph anyway, through `ScrollArea`, and a panel with `scroll={false}`
 * and no caller state of its own ships no JavaScript from this file.
 *
 * The four exported parts are the panel's own pieces, and they are exported
 * rather than kept private for the reason `Card`'s parts are: a caller who wants
 * the header's geometry inside a `Card` they built, or a footer on a section of
 * their own, should not have to re-derive `border-b px-4 py-3` to get it. The
 * `title`, `description`, `count`, `actions` and `footer` props are the shorthand
 * for the ordinary case, and the two are the same markup.
 */
function ListPanel({
  title,
  description,
  count,
  actions,
  footer,
  children,
  scroll,
  maxHeight,
  label,
  className,
  style,
  ...props
}: ListPanelProps) {
  const titleId = useId()
  const named = title !== undefined
  const hasHeader = named || description !== undefined || count !== undefined || actions !== undefined
  const hasFooter = footer !== undefined && footer !== null && footer !== false

  return (
    <section
      data-slot="list-panel"
      aria-labelledby={named ? titleId : undefined}
      aria-label={named ? undefined : label}
      style={maxHeight === undefined ? style : { maxHeight, ...style }}
      className={cn(
        'bg-card text-card-foreground flex min-h-0 flex-col overflow-hidden rounded-lg border',
        className,
      )}
      {...props}
    >
      {hasHeader ? (
        <ListPanelHeader
          titleId={titleId}
          title={title}
          description={description}
          count={count}
          actions={actions}
        />
      ) : null}

      {/*
       * The two bodies are two calls rather than one call with a boolean, because
       * the two shapes of the union are the two shapes of this part. Passing
       * `scroll` straight through would lose the narrowing the union buys: a
       * `boolean` cannot tell the reader of this file which of the two
       * arrangements is in force, and the `label` a scrolling body requires would
       * become the `label` a still one may omit. The comparison is against `false`
       * rather than a truthiness test so that the default is stated in the one
       * place that decides it: a panel with no `scroll` scrolls, which is the
       * documented default and is not visible anywhere else in the function.
       */}
      {scroll === false ? (
        <ListPanelBody label={label}>{children}</ListPanelBody>
      ) : (
        <ListPanelBody scroll label={label}>
          {children}
        </ListPanelBody>
      )}

      {hasFooter ? <ListPanelFooter>{footer}</ListPanelFooter> : null}
    </section>
  )
}

/**
 * The row above a panel's list: the title, its supporting lines, and a toolbar
 * slot at the trailing edge.
 *
 * Rendered by `ListPanel` when any of its four slots is present, and not rendered
 * at all when none is, because a bordered band with nothing in it is a gap the
 * reader looks through. The title element is a `span` carrying the id the panel
 * points `aria-labelledby` at, rather than a heading: a panel's title is not
 * always the heading of the region it sits in, four panels in a grid are four
 * titles under one section heading, and four `h3`s under one `h2` is right while
 * four `h2`s is four sections. A caller who wants a heading there passes an
 * element as `title` and keeps the name.
 */
function ListPanelHeader({
  titleId,
  title,
  description,
  count,
  actions,
  className,
  ...props
}: ListPanelHeaderProps) {
  return (
    <div
      data-slot="list-panel-header"
      className={cn('flex items-start justify-between gap-4 border-b px-4 py-3', className)}
      {...props}
    >
      <div className="flex min-w-0 flex-col gap-0.5">
        {title === undefined ? null : (
          <span id={titleId} data-slot="list-panel-title" className="text-sm font-medium">
            {title}
          </span>
        )}
        {description === undefined ? null : (
          <span
            data-slot="list-panel-description"
            className="text-muted-foreground text-sm"
          >
            {description}
          </span>
        )}
        {count === undefined ? null : (
          <span
            data-slot="list-panel-count"
            className="text-muted-foreground text-xs tabular-nums"
          >
            {count}
          </span>
        )}
      </div>

      {/*
       * A plain container with no role, for the reason `Item`'s trailing slot is
       * one: the controls inside are the controls, and a group here would be a
       * group with no name and one more thing a reader has to walk past.
       */}
      {actions === undefined ? null : (
        <div data-slot="list-panel-actions" className="flex shrink-0 items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  )
}

/**
 * A panel's body: the list, and the scroll region it scrolls in.
 *
 * **The scroll region is `ScrollArea` and the rows are the caller's own element.**
 * The panel draws the frame and the scrollbar; the caller writes the `ul`, the
 * `ol` or the table inside it, because the shape of the list is a fact about the
 * data and a list of records in a `ul` is a different thing from the same records
 * in a table. That is the same decision `Item` makes about the row, applied one
 * level up, and it is why this Component takes `children` and no `items`.
 *
 * The vertical scrollbar only. A panel scrolls because it is tall, and a panel
 * whose content is also wider than the panel is a caller who has put a table in
 * the wrong place: `table.tsx` already owns a horizontal region for exactly that,
 * and two nested scrollers is a reader with two axes to guess about.
 */
function ListPanelBody({
  scroll,
  label,
  className,
  children,
  ...props
}: ListPanelBodyProps) {
  return (
    <div
      data-slot="list-panel-body"
      className={cn(
        'min-w-0 flex-1',
        // The two states differ in more than a wrapper. A bounded body clips and
        // hands the overflow to the scroll region; an unbounded one is allowed to
        // grow, because the caller has said the list is short.
        scroll === true ? 'min-h-0 overflow-hidden' : '',
        className,
      )}
      {...props}
    >
      {scroll === true ? (
        <ScrollArea label={label} orientation="vertical" className="h-full">
          {children}
        </ScrollArea>
      ) : (
        children
      )}
    </div>
  )
}

/**
 * The band under a panel's list, where the actions that belong to the whole list
 * sit and where a count that is not the caller's headline number belongs.
 *
 * On the muted surface and above a rule rather than on the card, because it is the
 * one band in the panel that does not scroll: a control the reader has to reach
 * after scrolling to the end of a long list cannot be in the list. A footer that
 * scrolls away with the rows is a footer that only exists for a reader who never
 * needed it.
 */
function ListPanelFooter({ className, ...props }: ListPanelFooterProps) {
  return (
    <div
      data-slot="list-panel-footer"
      className={cn('bg-muted/50 flex items-center gap-3 border-t px-4 py-3 text-sm', className)}
      {...props}
    />
  )
}

export { ListPanel, ListPanelHeader, ListPanelBody, ListPanelFooter }
