import { useId, type ComponentProps, type ReactNode } from 'react'

import { cn } from '../../lib/utils'

/** The props a `FilterPanelHeader` takes. */
export interface FilterPanelHeaderProps extends Omit<ComponentProps<'div'>, 'title'> {
  /**
   * The id the panel's `aria-labelledby` points at.
   *
   * Supplied by `FilterPanel`, which generates it and puts it on the title
   * element. A caller rendering a header inside their own `section` passes their
   * own and sets `aria-labelledby` themselves, which is the arrangement the
   * `title` prop exists to make unnecessary.
   */
  titleId: string
  /** The one line that names the panel. */
  title?: ReactNode
  /**
   * The caller's own account of what is currently applied.
   *
   * A node because the sentence is the consumer's: "3 filters" is true in one
   * language and false in another, and so is "Showing archived runs". A panel
   * that assembled the sentence would have assembled it in English, into a
   * product that may not be in English.
   */
  summary?: ReactNode
  /** Layout only. */
  className?: string
}

/** The props a `FilterPanelFooter` takes. */
export interface FilterPanelFooterProps extends ComponentProps<'div'> {
  /**
   * The apply and clear controls, as a slot.
   *
   * A slot and not a pair of props for two buttons, because the two are the
   * consumer's decisions together: which one is primary, whether clear comes
   * first, whether clear is even offered, and what each one says in the
   * consumer's own words. A panel that drew them would be drawing all four.
   */
  children?: ReactNode
  /** Layout only. */
  className?: string
}

/** The props a `FilterPanel` takes. */
export interface FilterPanelProps extends Omit<ComponentProps<'section'>, 'children' | 'title'> {
  /**
   * The one line that names the panel, and the accessible name of the region.
   *
   * A `ReactNode` rather than a string, because the panel's visible title is
   * content. The accessible name is derived from this element by
   * `aria-labelledby` rather than set separately, so the name a reader hears and
   * the name a sighted reader reads are the same text by construction.
   */
  title?: ReactNode
  /**
   * The caller's account of what is applied, shown in the header beside the
   * title.
   *
   * In the header rather than the footer because it is a statement, not an
   * instruction. A reader who has scrolled to the bottom of a tall filter column
   * is looking for the button, and the statement about the state they are in has
   * to be where they already were, at the top, or it is a thing they have to go
   * looking for.
   */
  summary?: ReactNode
  /**
   * The footer's slot, where apply and clear go.
   *
   * Rendered only when the caller passes it, because a footer band with nothing
   * in it is a gap the reader looks through and a panel with no apply control is
   * a panel whose filters apply themselves, which is the one thing this Component
   * refuses to decide.
   */
  actions?: ReactNode
  /**
   * The panel's accessible name, used only when there is no `title` to take it
   * from.
   *
   * A `string` because this one is written into `aria-label`. With neither a
   * title nor a name the region renders anonymous, which is the honest state
   * rather than a name this package invented.
   */
  label?: string
  /** The filter controls, in the order a reader should meet them. */
  children?: ReactNode
  /** Layout only, exactly as on every Component. */
  className?: string
}

/**
 * A titled panel holding filter controls, with a summary above and a footer below.
 *
 * **The panel does not own apply and clear, and that is the whole reason it is a
 * Component rather than a form.** The obvious version of this is a panel that
 * applies on every change, and it is wrong for a reason that has nothing to do
 * with performance: applying on change makes a decision about the consumer's data
 * layer. It means a filter cannot be set before the next one is, that a request
 * goes out per keystroke and per toggle, that the list behind the panel is
 * rewritten while the reader is still choosing, and that a consumer with a large
 * result set has to add debouncing to a Component they installed. The alternative
 * is a panel that applies on a button, and that one has to know when the draft is
 * complete: which filters are dependent on which others, whether a half-chosen
 * range is valid, whether a pending change is a change. That is the consumer's
 * fact about their own data, and it is not knowable from inside a layout panel.
 * So the panel draws the frame, the summary slot and the footer slot, and the
 * consumer supplies the two controls and owns every decision behind them. The
 * cost is real and worth naming: a caller who wants the panel to own apply has to
 * write four lines around it, and a caller who forgets gets filters that do
 * nothing at all, which is a state the panel could have prevented by owning them
 * and chose not to.
 *
 * **It is the same decision `list-panel` makes about its region, made once.**
 * Both are a `section` named by its own title through `aria-labelledby`, both
 * generate the title's id, and both fall back to `aria-label` only when the caller
 * passes one and render anonymous otherwise. Two panels that named themselves
 * differently would mean a reader meeting a named region in one place and an
 * anonymous one in the next, from the same library, and the inconsistency would
 * read as one of the two being wrong. So the rule is stated once here and
 * `list-panel` states the same rule for its own frame: a `div` is not a landmark,
 * a landmark a screen reader cannot name is a landmark they walk past twice, and
 * a region Prism named for the caller is a claim about somebody else's product.
 *
 * **The summary is the caller's, and it is a slot rather than a count.** A panel
 * that said "3 filters active" would be true in one language and false in another,
 * and it would be wrong in this one the moment a filter has a range in it rather
 * than a value. What is active is a fact about the consumer's state, and the
 * sentence that states it is theirs.
 *
 * **The controls are the caller's own elements and the panel adds no wrapper per
 * control.** A panel that wrapped each filter in its own row would assume the
 * filters are single-line, which is false of a date range, a multi-select and
 * anything with a hint under it. The panel is a column; the column's contents are
 * the caller's, composed out of `Field`, `Checkbox`, `Switch` and `NativeSelect`,
 * which is where the spacing and the naming of an individual control live.
 *
 * It is a server Component. It holds no state, reads no context and attaches no
 * handler, so a filter column costs no JavaScript from this; the draft state, the
 * apply handler and the clear handler are all the consumer's, which is the same
 * argument as the rest of this Component's design and the reason the panel can be
 * a plain `section` at all.
 */
function FilterPanel({
  title,
  summary,
  actions,
  label,
  children,
  className,
  ...props
}: FilterPanelProps) {
  const titleId = useId()
  const named = title !== undefined
  const hasHeader = named || summary !== undefined
  const hasFooter = actions !== undefined && actions !== null && actions !== false

  return (
    <section
      data-slot="filter-panel"
      aria-labelledby={named ? titleId : undefined}
      aria-label={named ? undefined : label}
      className={cn(
        'bg-card text-card-foreground flex flex-col overflow-hidden rounded-lg border',
        className,
      )}
      {...props}
    >
      {hasHeader ? (
        <FilterPanelHeader titleId={titleId} title={title} summary={summary} />
      ) : null}

      {/*
       * A plain flow column, with no gap of its own between the controls. The gap
       * is the caller's, because the spacing between two filters is a decision
       * about the two of them and a panel that inserted its own would have to
       * guess it: two checkbox rows want less space between them than a label and
       * its hint do, and a caller who cannot tighten one without reaching into
       * this Component's markup has nowhere to put the judgement.
       */}
      <div data-slot="filter-panel-body" className="flex min-w-0 flex-1 flex-col p-4">
        {children}
      </div>

      {hasFooter ? <FilterPanelFooter>{actions}</FilterPanelFooter> : null}
    </section>
  )
}

/**
 * The head of a filter panel: its title, and the caller's account of what is
 * applied.
 *
 * Rendered by `FilterPanel` when either slot is present, and not at all when
 * neither is, so a panel whose caller has not given it a title does not get a
 * bordered band with nothing in it. The title element is a `span` carrying the
 * id the panel points `aria-labelledby` at, rather than a heading: a filter
 * column in a sidebar is not the heading of the region it sits in, and a heading
 * here would put an entry in the page outline for a control cluster. A caller who
 * wants a heading passes an element as `title` and keeps the name.
 */
function FilterPanelHeader({
  titleId,
  title,
  summary,
  className,
  ...props
}: FilterPanelHeaderProps) {
  return (
    <div
      data-slot="filter-panel-header"
      className={cn('flex flex-col gap-1 border-b px-4 py-3', className)}
      {...props}
    >
      {title === undefined ? null : (
        <span id={titleId} data-slot="filter-panel-title" className="text-sm font-medium">
          {title}
        </span>
      )}
      {summary === undefined ? null : (
        <span data-slot="filter-panel-summary" className="text-muted-foreground text-xs">
          {summary}
        </span>
      )}
    </div>
  )
}

/**
 * The foot of a filter panel, where the apply and clear controls sit.
 *
 * On the muted surface and above a rule, for the reason a `ListPanel`'s footer is:
 * it is the one band that does not scroll with the controls above it, and a
 * reader who has set five filters has to be able to reach the control that commits
 * them without scrolling back to a row they have already set. A caller who wants
 * the pair in the other order, or a third control beside them, passes one slot and
 * composes what it needs.
 */
function FilterPanelFooter({ className, ...props }: FilterPanelFooterProps) {
  return (
    <div
      data-slot="filter-panel-footer"
      className={cn('bg-muted/50 flex items-center gap-3 border-t px-4 py-3', className)}
      {...props}
    />
  )
}

export { FilterPanel, FilterPanelHeader, FilterPanelFooter }
