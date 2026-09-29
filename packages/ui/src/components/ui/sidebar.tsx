'use client'

import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import {
  createContext,
  useContext,
  useId,
  useMemo,
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react'

import { cn } from '../../lib/utils'

/** What the rail's parts need to know and nothing else: its state, its id, and the way to change it. */
type SidebarState = {
  /** Whether the rail is collapsed to its icons. */
  collapsed: boolean
  /** The id of the rail, so the toggle can name the element it controls. */
  id: string
  /** Moves to the other state. The toggle reads this rather than computing it. */
  toggle: () => void
}

/**
 * The default, for a part rendered outside a rail.
 *
 * Expanded, because a part outside a rail has no rail to be collapsed against,
 * and a rail that starts collapsed because nobody said otherwise is a rail whose
 * content a reader cannot see. The empty id means a toggle outside a rail points
 * at nothing, which is honest: there is nothing there to point at.
 */
const SIDEBAR_STATE: SidebarState = {
  collapsed: false,
  id: '',
  toggle: () => undefined,
}

const SidebarStateContext = createContext<SidebarState>(SIDEBAR_STATE)

/** The rail's state, from the rail above it. */
function useSidebarState(): SidebarState {
  return useContext(SidebarStateContext)
}

/** The props the Sidebar accepts. */
export interface SidebarProps extends Omit<ComponentProps<'div'>, 'children'> {
  /**
   * The controlled collapsed state.
   *
   * Pass it with `onCollapsedChange` when the rail's state has to survive a
   * reload, which is the common case: a product that forgets the rail on every
   * page load teaches a reader that collapsing it was a mistake.
   */
  collapsed?: boolean
  /** Whether the rail starts collapsed, for a rail nobody controls. @defaultValue false */
  defaultCollapsed?: boolean
  /** Called with the state the rail is moving to, for a rail nobody controls. */
  onCollapsedChange?: (collapsed: boolean) => void
  /**
   * The rail's id, for a consumer that has to name it.
   *
   * A prop and not a generated one where it matters, for the reason
   * `Collapsible`'s is: a rail a consumer cannot name from their own stylesheet
   * or their own test is a rail they have to reach into the DOM to find. Omit it
   * and one is generated, which is what the toggle points `aria-controls` at.
   */
  id?: string
  /** The rail's header, its navigation, its footer, and any control of its own. */
  children?: ReactNode
}

/** The props the SidebarHeader accepts. */
export interface SidebarHeaderProps extends ComponentProps<'div'> {}

/** The props the SidebarNav accepts. */
export interface SidebarNavProps extends Omit<ComponentProps<'nav'>, 'children'> {
  /**
   * The accessible name of the navigation landmark.
   *
   * Required rather than defaulted, and it sits on the navigation rather than on
   * the rail because a rail can hold more than one set of links: a product rail
   * with a workspace switcher above the navigation and an account menu below it
   * has two things a reader would otherwise hear as one list. The name is the
   * caller's word, because a shared library cannot know whether the answer is
   * "Sections", "Main" or "Navigation".
   */
  label: string
  /** The items, in the order a reader should meet them. */
  children?: ReactNode
}

/**
 * The props the SidebarItem accepts.
 *
 * Deliberately not a pass-through of an element's props. An item is a link when
 * it has an `href` and a button when it does not, and one interface that claimed
 * to be both would let a consumer pass `target` to an element that is not a link
 * and type-check it. The item takes the props below and nothing else; a consumer
 * who needs a `data-*` attribute or a click handler on the element itself has an
 * element of their own and does not need this one.
 */
export interface SidebarItemProps {
  /**
   * The name of the item: the words beside the icon, and the item's accessible
   * name in every state.
   *
   * Required, and it is the whole answer to the collapsed rail. A rail collapses
   * to icons, and an icon is not a name: a screen reader announces "link" once
   * for each of them, and a sighted reader who cannot tell the marks apart has
   * nothing to go on. So the words are always in the document, shown beside the
   * icon while the rail is open and moved to `sr-only` while it is closed, and
   * the name a reader hears is the same string in both states.
   */
  label: string
  /**
   * Where the item goes.
   *
   * Omit it for an item that acts rather than navigates, and the item renders a
   * button. A navigation rail in a real product holds both kinds: a "Billing"
   * link and a "New project" that opens something. A Component that only drew
   * anchors would leave the second kind to be hand-built, which is the gap this
   * rail exists to close.
   */
  href?: string
  /**
   * What the item does when it is activated.
   *
   * Required for an item with no `href`, because an item that acts rather than
   * navigates renders a real button and a button that does nothing is a control
   * a reader can find and press with no result, which is the same defect as a
   * list that renders an empty item. On an item that has an `href` it runs
   * alongside the navigation.
   */
  onClick?: () => void
  /**
   * The mark at the leading edge. It is never the name.
   *
   * Pass a `ProductMark`, a `lucide-react` icon, or a node of your own. Whatever
   * is passed is drawn in the item's own ink, so it takes the item's state
   * rather than keeping a colour of its own.
   */
  icon?: ReactNode
  /**
   * Whether this is the page the reader is on. @defaultValue false
   *
   * Marking the current item is the one thing a rail cannot leave to inference,
   * and it is not a colour. The item is given `aria-current="page"`, which is
   * what a reader is told and what a browser's find-in-page uses to find the
   * current page, and it is given a rail down its leading edge, which is a shape
   * a reader who cannot separate two surfaces can still see. Colour is the third
   * signal and never the only one.
   */
  current?: boolean
  /**
   * A trailing slot: a count, a status, a badge.
   *
   * It is `aria-hidden` and it is not drawn while the rail is collapsed. Both
   * decisions are the same one: the item's accessible name is its `label` and
   * nothing else, which is what makes the name in a collapsed rail the same name
   * as the name in an open one. A 4rem rail has room for one mark and a badge
   * beside it is a badge at four pixels, and a count a reader has to have is the
   * count on the page the item leads to. A caller whose count is part of the
   * item's meaning puts it in the `label`.
   */
  children?: ReactNode
  /**
   * Opens the destination in a new browsing context, which defaults the link
   * relationship to `noopener noreferrer`. Prism does not decide what counts as
   * external: a cross-origin destination is not by itself a reason for a new tab.
   */
  newTab?: boolean
  /** Layout only. */
  className?: string
}

/** The props the SidebarToggle accepts. */
export interface SidebarToggleProps extends Omit<ComponentProps<'button'>, 'children'> {
  /**
   * The words for the control while the rail is open.
   *
   * Required, and it names the action rather than the control: a button a reader
   * is told is called "Collapse sidebar" is a button that collapses the sidebar.
   * The state is on `aria-expanded` as well, so a reader who meets the control
   * without its words still learns whether the rail is open.
   */
  collapseLabel: string
  /** The words for the same control while the rail is collapsed. */
  expandLabel: string
}

/** The props the SidebarFooter accepts. */
export interface SidebarFooterProps extends ComponentProps<'div'> {}

/**
 * The fill and the ink an item takes, from the state it is in.
 *
 * Both halves are here because a fill and an inheritance are the same control on
 * the page ground and a different one here. A `bg-sidebar-primary` with the rail's
 * inherited ink would be `sidebar-primary` behind `sidebar-foreground`, which is
 * neutral 900 behind neutral 900 in light mode. The token gate measures the pair
 * it was given and cannot see which ink a class string failed to state.
 */
const ITEM_FILL: Record<'current' | 'rest', string> = {
  current: 'bg-sidebar-primary text-sidebar-primary-foreground',
  // No fill at all rather than a transparent one: the rail's own surface is the
  // surface here, and a `bg-transparent` would be a second statement of it.
  rest: '',
}

/**
 * A navigation rail with its own ink, its own focus ring, and a collapsed state.
 *
 * **It exists because the sidebar tokens were the one family in the contract
 * with no consumer.** `sidebar` through `sidebar-ring` were published, gated in
 * both modes and in every pack, and nothing in the package used them: the one
 * rail the package had drew its surface from `border` and left its focus ring to
 * `ring`, which is a different token on a different step. Those two are not
 * interchangeable and the contract says why. `ring` is pinned to a step that
 * clears 3:1 against the page ground, and the sidebar ground is one step off the
 * page ground in either mode, so on Mint in light mode the page ring measures
 * 2.86:1 against the rail while `sidebar-ring` measures 4.11:1. A rail that
 * inherited the page ring was a focus indicator a reader could not see in one
 * pack out of six, and it looked correct in the other five.
 *
 * **The collapsed state is the same rail at a smaller width, not a second
 * Component.** An icon-only rail that dropped the hover surface, the focus ring
 * or the current marking would be a worse version of the thing rather than a
 * smaller one, and the reader who paid for the density paid for a rail that is
 * harder to use. So the hover surface, the ring, the current rail and the
 * accessible name are all present in both states, and only the words and the
 * padding change. The name in particular: the words move to `sr-only` rather than
 * leaving the document, so a collapsed rail is still six links a reader can hear
 * and still six links a browser's find-in-page can find.
 *
 * **The ring is `sidebar-ring`, and this Component does not suppress the
 * browser's own outline.** Every other focusable Component here suppresses it and
 * draws `ring-ring` in its place. This one does not, for two reasons that point
 * the same way. The ring it draws is a different role, and
 * `check-focus-indicators.mjs` recognises exactly one ring role in the pattern it
 * reads a full-strength ring from, so a Component that claimed to replace the
 * outline here would be claiming a replacement the repository cannot currently
 * verify. A wide navigation item is also the one place in this package where a
 * second indicator costs nothing, and WCAG 2.4.11 asks that the focused control
 * be identifiable rather than that exactly one thing identify it.
 *
 * **It is a client Component**, because the collapsed state is a state, and a
 * state with no owner in this Component means every consumer writes the same
 * `useState` and the same context around it. The toggle is a part rather than a
 * built-in control, so a product puts it in the rail's header or its footer
 * without the Component deciding where a rail's controls belong.
 */
function Sidebar({
  collapsed: controlled,
  defaultCollapsed = false,
  onCollapsedChange,
  id,
  children,
  className,
  ...props
}: SidebarProps) {
  const [internal, setInternal] = useState(defaultCollapsed)
  const generated = useId()
  // The controlled prop is the whole truth when there is one. A rail that wrote
  // only its own state would show a state its parent had already overridden, and
  // a rail whose parent later stops controlling it would jump to a state nobody
  // chose.
  const collapsed = controlled ?? internal
  const railId = id ?? generated

  const state = useMemo<SidebarState>(
    () => ({
      collapsed,
      id: railId,
      toggle: () => {
        const following = !collapsed
        setInternal(following)
        onCollapsedChange?.(following)
      },
    }),
    [collapsed, railId, onCollapsedChange],
  )

  return (
    <SidebarStateContext.Provider value={state}>
      <div
        data-slot="sidebar"
        id={railId}
        // The state is on the rail as well as on the toggle, so a consumer's
        // stylesheet and a consumer's test can both target it without reaching
        // for the control that changed it.
        data-collapsed={collapsed}
        className={cn(
          'bg-sidebar text-sidebar-foreground border-sidebar-border flex shrink-0 flex-col self-stretch border-r',
          // The width is the state feedback, and it is the only motion on the
          // rail: a rail that collapsed and looked identical teaches a reader
          // that the control did nothing.
          'transition-[width] duration-base ease-out',
          collapsed ? 'w-16' : 'w-64',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </SidebarStateContext.Provider>
  )
}

/**
 * The space at the top of the rail, for a brand or a workspace switcher.
 *
 * A slot and nothing more, because what sits in it is the product's: a mark, a
 * switcher, a search field. The padding follows the rail's state, so a collapsed
 * rail's mark is centred rather than hanging off the left edge of a 4rem column.
 */
function SidebarHeader({ className, ...props }: SidebarHeaderProps) {
  const { collapsed } = useSidebarState()
  return (
    <div
      data-slot="sidebar-header"
      className={cn(collapsed ? 'p-2' : 'p-3', className)}
      {...props}
    />
  )
}

/** The navigation, as a named landmark, and the part of the rail that scrolls. */
function SidebarNav({ label, className, children, ...props }: SidebarNavProps) {
  const { collapsed } = useSidebarState()
  return (
    <nav
      data-slot="sidebar-nav"
      aria-label={label}
      className={cn(
        'flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto',
        collapsed ? 'px-2' : 'px-3',
        className,
      )}
      {...props}
    >
      {children}
    </nav>
  )
}

/**
 * The space at the foot of the rail, for an account menu or a version.
 *
 * A slot above a rail's own border, and the border is the sidebar's, so the
 * divider reads as part of the rail rather than as a rule drawn on the page.
 */
function SidebarFooter({ className, ...props }: SidebarFooterProps) {
  const { collapsed } = useSidebarState()
  return (
    <div
      data-slot="sidebar-footer"
      className={cn('border-sidebar-border border-t', collapsed ? 'p-2' : 'p-3', className)}
      {...props}
    />
  )
}

/**
 * One item: an icon, its name, and the marking of the page the reader is on.
 *
 * An item is a link when it has an `href` and a button when it does not, because
 * a rail holds both and a reader meets them the same way either way. The two
 * renderings take the same class string, so an item that is a link on one route
 * and a button on another does not change its hover surface, its ring or its
 * current marking.
 */
function SidebarItem({
  label,
  href,
  onClick,
  icon,
  current = false,
  children,
  newTab,
  className,
}: SidebarItemProps) {
  const { collapsed } = useSidebarState()

  const classes = cn(
    'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground relative flex h-9 items-center rounded-md text-sm',
    'transition-colors duration-fast ease-out',
    // The sidebar's own ring, on the sidebar's own ground. See the rail's own
    // note: this is the one focusable surface in the package where the page ring
    // measures below 3:1 in a real pack.
    'focus-visible:ring-sidebar-ring focus-visible:ring-[3px]',
    collapsed ? 'justify-center px-0' : 'gap-2 px-3',
    ITEM_FILL[current ? 'current' : 'rest'],
    // Weight as the second channel for "current", so the marking survives a
    // reader who cannot see the rail down the item's leading edge.
    current && 'font-medium',
    className,
  )

  const content = (
    <>
      {current ? (
        <span
          data-slot="sidebar-item-mark"
          aria-hidden="true"
          className="bg-sidebar-primary absolute inset-y-1.5 left-0 w-0.5 rounded-full"
        />
      ) : null}
      {icon === undefined ? null : (
        <span
          data-slot="sidebar-item-icon"
          className="flex size-4 shrink-0 items-center justify-center [&_svg]:size-4"
        >
          {icon}
        </span>
      )}
      {/*
       * The words are in the document in both states. Expanded they are the text
       * beside the icon; collapsed they are `sr-only`, which keeps them in the
       * accessibility tree and in find-in-page while taking them out of sight. A
       * collapsed rail that unmounted its labels would be a rail whose six links a
       * reader hears as six unlabelled links.
       */}
      <span
        data-slot="sidebar-item-label"
        className={cn(collapsed ? 'sr-only' : 'min-w-0 truncate')}
      >
        {label}
      </span>
      {children === undefined || collapsed ? null : (
        <span
          data-slot="sidebar-item-trailing"
          // Not announced, so the item's accessible name is its `label` and
          // nothing else, which is what makes the name in a collapsed rail the
          // same name as the name in an open one. The count a reader must have
          // is the count on the page this item leads to.
          aria-hidden="true"
          className="ml-auto shrink-0 text-xs tabular-nums"
        >
          {children}
        </span>
      )}
    </>
  )

  // An anchor with no `href` is not a link: it has no role and it is not
  // focusable, so an item that acts rather than navigates has to be a real
  // button or it is an element a keyboard cannot reach.
  if (href === undefined) {
    return (
      <button
        type="button"
        data-slot="sidebar-item"
        data-current={current ? 'true' : undefined}
        aria-current={current ? 'page' : undefined}
        onClick={onClick}
        className={classes}
      >
        {content}
      </button>
    )
  }

  return (
    <a
      data-slot="sidebar-item"
      data-current={current ? 'true' : undefined}
      aria-current={current ? 'page' : undefined}
      href={href}
      target={newTab ? '_blank' : undefined}
      rel={newTab ? 'noopener noreferrer' : undefined}
      onClick={onClick}
      className={classes}
    >
      {content}
    </a>
  )
}

/**
 * The control that collapses and expands the rail.
 *
 * A part rather than something the rail draws, because where a rail's controls
 * belong is the product's decision: a rail whose toggle is in its header fights
 * a workspace switcher for the same row. It points at the rail by id, so the
 * region it controls is the element the rail actually rendered rather than a name
 * that has drifted from it.
 */
function SidebarToggle({
  collapseLabel,
  expandLabel,
  className,
  ...props
}: SidebarToggleProps) {
  const { collapsed, id, toggle } = useSidebarState()
  return (
    <button
      type="button"
      data-slot="sidebar-toggle"
      data-collapsed={collapsed}
      aria-expanded={!collapsed}
      aria-controls={id}
      aria-label={collapsed ? expandLabel : collapseLabel}
      onClick={toggle}
      className={cn(
        'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-sidebar-ring focus-visible:ring-[3px] flex size-8 shrink-0 items-center justify-center rounded-md',
        'transition-colors duration-fast ease-out',
        collapsed && 'mx-auto',
        className,
      )}
      {...props}
    >
      {collapsed ? (
        <PanelLeftOpen className="size-4" aria-hidden="true" />
      ) : (
        <PanelLeftClose className="size-4" aria-hidden="true" />
      )}
    </button>
  )
}

export { Sidebar, SidebarHeader, SidebarNav, SidebarItem, SidebarFooter, SidebarToggle }
