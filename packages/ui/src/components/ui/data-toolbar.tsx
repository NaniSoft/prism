import type { ComponentProps, ReactNode } from 'react'

import { cn } from '../../lib/utils'

/** The props a `DataToolbarGroup` takes. */
export interface DataToolbarGroupProps extends ComponentProps<'div'> {
  /**
   * The controls in one group.
   *
   * A slot and not a named control, because which controls a row has is the
   * consumer's fact. A toolbar that drew a search box and a sort would be a
   * toolbar that assumed the list below it is searchable and sortable.
   */
  children?: ReactNode
  /** Layout only. */
  className?: string
}

/** The props a `DataToolbar` takes. */
export interface DataToolbarProps extends Omit<ComponentProps<'div'>, 'children'> {
  /**
   * The row's accessible name, when the row is given a `role`.
   *
   * A `string` and not a `ReactNode`, because this one is written into
   * `aria-label` and an accessible name is a string. A node here would render as
   * nothing a reader hears. Pass no name for a row that is an unnamed `div`,
   * which is the default and the ordinary case.
   */
  label?: string
  /**
   * The search slot, at the leading end.
   *
   * Leading because it is the control a reader reaches for first, and because a
   * search box at the trailing end of a row of small controls is a control the
   * reader has to find before they can use it. The field itself is the caller's,
   * so a caller who wants a search dialog trigger rather than a field passes
   * their own control and the row does not change.
   */
  search?: ReactNode
  /**
   * The filter slot, after the search.
   *
   * A single slot rather than a set of named filter controls, because which
   * facets a set has is the consumer's data. A caller with three filters and a
   * caller with one both pass one node.
   */
  filters?: ReactNode
  /**
   * The view switcher slot, after the filters.
   *
   * Last of the three because it is the control a reader changes least often: it
   * says how the same rows are drawn, not which rows are shown, so putting it
   * beside the filters would let a reader change the question before they have
   * asked it.
   */
  view?: ReactNode
  /**
   * The trailing slot: the count, and whatever else belongs at the far end.
   *
   * Trailing and pushed to the end of the row, so the count and the row's
   * secondary controls line up on the right and the reading order stays search,
   * then what narrows the set, then how it is drawn, then what the reader has.
   */
  actions?: ReactNode
  /**
   * Any further groups, in the order the caller wants them.
   *
   * Between the named slots and the trailing one, and composed out of
   * `DataToolbarGroup` so a group is a group by construction rather than by a
   * `gap` the caller remembered to add.
   */
  children?: ReactNode
  /** Layout only, exactly as on every Component. */
  className?: string
}

/**
 * The row above a table or a list: search, filters, a view switcher, and a count.
 *
 * **The default is a plain `div` and not a `role="toolbar"`, and that is the one
 * decision worth making carefully.** A toolbar role changes every reader's
 * interaction model for the row. It tells assistive technology that the whole row
 * is one control, that the arrow keys move between the things inside it, and that
 * Tab should step over the row rather than into it. That is exactly right for a
 * set of controls a reader is expected to sweep through with the arrow keys, and
 * it is exactly wrong for a row that is mostly a search box: a reader who Tabs
 * onto the row and presses an arrow key expects to land in the search field, and a
 * role that skips it has made the row's primary control the one control the row
 * cannot reach by the key the role taught them. So the role is a prop and the
 * default is nothing, and a caller who knows their row is a set of peer controls
 * passes `role="toolbar"` and takes the model with the responsibility.
 *
 * **No arrow-key handling here, and deliberately.** Prism owns that keyboard model
 * in exactly two Components, `button-group.tsx` and `toggle-group.tsx`, both of
 * which already implement it over their own children: a roving tab stop and the
 * arrows walking the pressed set. A third implementation in a layout row would be
 * a third place for the same rule, and three places disagree within a release.
 * A caller who wants the arrows puts the controls in one of those two and passes
 * the group into this row's `children` or into a named slot.
 *
 * **The row wraps rather than scrolls, and a toolbar that scrolls sideways hides
 * its own controls.** A `flex-wrap` row reflows onto a second line on a narrow
 * screen, so the filter that a reader did not see is still on the page and still
 * reachable. The alternative, one line with a horizontal scroller, puts a control
 * the reader needs behind a gesture they have to discover, and the scrollbar that
 * offers the gesture is the operating system's rather than the design system's,
 * which is the one control this package took over precisely because it cannot be
 * restyled into anything the design system recognises. A row that runs out of
 * room has to reflow; there is no third option that keeps every control on screen
 * and reachable.
 *
 * **The ends are held by search and by the trailing slot, and the middle is the
 * caller's.** Search leads because it answers the question a reader arrived with;
 * the trailing slot ends the row because a count reads as a conclusion and a
 * conclusion is the last thing on a line. Everything between them is narrow, is
 * the same height, and is a control about the shape of the set rather than about
 * one row of it, so it groups tightly and the two ends stay apart.
 *
 * It is a server Component. It holds no state, reads no context and attaches no
 * handler: the row is a frame, and every control in it is a control the caller
 * brought. A table with a filter row above it costs no JavaScript from this.
 */
function DataToolbar({
  label,
  search,
  filters,
  view,
  actions,
  children,
  className,
  ...props
}: DataToolbarProps) {
  return (
    <div
      data-slot="data-toolbar"
      aria-label={label}
      className={cn('flex flex-wrap items-center gap-2', className)}
      {...props}
    >
      {search === undefined ? null : <DataToolbarGroup>{search}</DataToolbarGroup>}

      {filters === undefined ? null : <DataToolbarGroup>{filters}</DataToolbarGroup>}

      {view === undefined ? null : <DataToolbarGroup>{view}</DataToolbarGroup>}

      {children}

      {/*
       * `ms-auto` rather than a spacer element. The row is `flex-wrap`, and a
       * margin that eats the free space is the one thing that still works when
       * the row has wrapped: a spacer `div` between two groups becomes a group
       * of its own on the second line and the trailing controls stop being
       * trailing.
       */}
      {actions === undefined ? null : (
        <DataToolbarGroup className="ms-auto">{actions}</DataToolbarGroup>
      )}
    </div>
  )
}

/**
 * One group of controls inside a `DataToolbar`, or a group of the caller's own.
 *
 * A `div` with no role, and that is the whole point. A group is a spacing
 * relationship and nothing else: it says these controls are one idea, and it
 * gives them a single gap between them that is tighter than the gap between
 * ideas. A `group` role on it would name a set of controls a reader could
 * navigate, which is a claim about a keyboard model this row deliberately does
 * not have. A caller who wants a named, navigable set of controls passes
 * `role="toolbar"` on the row, or composes `button-group.tsx` or
 * `toggle-group.tsx`, which is where the arrow keys live.
 */
function DataToolbarGroup({ className, ...props }: DataToolbarGroupProps) {
  return (
    <div
      data-slot="data-toolbar-group"
      className={cn('flex min-w-0 items-center gap-2', className)}
      {...props}
    />
  )
}

export { DataToolbar, DataToolbarGroup }
