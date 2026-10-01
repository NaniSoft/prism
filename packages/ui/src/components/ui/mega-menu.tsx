'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuPortal,
  NavigationMenuPopup,
  NavigationMenuPositioner,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from './navigation-menu'
import { cn } from '../../lib/utils'

/**
 * One column of a mega-menu panel, and the links in it.
 *
 * A column and not a link, because a column is a claim about how the caller's
 * information is grouped and Prism cannot make it: four columns of two links and two
 * columns of five links are two products' answers to the same panel, and a Component
 * that decided the number would be deciding the caller's information architecture.
 */
export type MegaMenuColumn = {
  /**
   * The column's name.
   *
   * Required, and required rather than optional because an unlabelled column of
   * links is a list a reader scans twice: once to work out what it is and once to
   * find the link. `null` is not offered for the same reason a page heading cannot
   * be omitted: the grouping is the thing that makes the panel readable.
   */
  label: React.ReactNode
  /** The links, in the order a reader should meet them. */
  links: readonly MegaMenuLink[]
}

/** One destination in a mega-menu column. */
export type MegaMenuLink = {
  /** Where the link goes. */
  href: string
  /** The words on the link. */
  label: React.ReactNode
  /** One line under the link saying where it goes. */
  description?: React.ReactNode
  /** Whether this is the page the reader is on. */
  active?: boolean
  /**
   * Whether taking the link closes the panel.
   *
   * Optional and false by default rather than true, and the reason is which link a
   * reader is most likely to press. A panel of destinations is read, compared and
   * scanned, and a reader who has found the one they want and clicked it expects to
   * be somewhere new; closing on every click means a reader who clicks to find out
   * where something is loses the panel they were comparing in. A caller whose links
   * are commands rather than addresses sets it on each one.
   */
  closeOnClick?: boolean
}

/**
 * The tabbed panels inside one disclosure, and the tabs that choose between them.
 *
 * A tab axis rather than a column per tab because the two are different claims. A
 * column per tab says "here are six things you may want", all six of which are
 * peers. A tab axis says "here are four *views of one subject*, and at any moment
 * exactly one is the view you are looking at", which is the structure a documentation
 * index, a pricing comparison and an API reference all have, and which a reader
 * navigating by Tab has to be told about.
 */
export type MegaMenuPanel = {
  /** The panel's stable key. */
  value: string
  /** The tab's visible name. */
  label: React.ReactNode
  /** The columns this panel holds. */
  columns: readonly MegaMenuColumn[]
}

/**
 * One disclosure in the bar, and the panels it opens.
 *
 * `panels` is required and may hold one entry, and a single panel is a real shape:
 * it is a disclosure whose content is one column of links and no axis to choose on.
 * A Component that required two would make that caller invent a second tab they do
 * not have, and a reader who tabs onto a one-tab axis has learned nothing.
 */
export type MegaMenuGroup = {
  /** The group's stable key, and what the disclosure's open state refers to. */
  value: string
  /** The words on the trigger. */
  label: React.ReactNode
  /** The panels the trigger opens. */
  panels: readonly MegaMenuPanel[]
}

/**
 * The props a MegaMenu accepts.
 *
 * Declared rather than extended from `NavigationMenu`'s, and the reason is that
 * every prop here is about the *inside* of the panel, which `NavigationMenu` has no
 * opinion about at all: it knows about triggers and links and nothing between them.
 * The open state is forwarded rather than re-declared, so a caller reading this
 * Component's signature can see the whole contract in one place.
 */
export interface MegaMenuProps {
  /**
   * The accessible name of this region of links.
   *
   * Required, and required for the reason `NavigationMenu` requires it: the root
   * renders a `<nav>`, and a `<nav>` with no name is a landmark announced only as
   * "navigation". A site header's primary links and a footer link list are both
   * `<nav>`, and a reader moving between them is told nothing about which is which.
   */
  label: string
  /**
   * The disclosures, in the order a reader meets them.
   *
   * Required, and the order is a reading order rather than a sort: a header's
   * disclosures are ordered by how often they are used, which is the caller's fact
   * and not something a sort here could know.
   */
  groups: readonly MegaMenuGroup[]
  /**
   * The open group, or `null` for none open.
   *
   * Controlled and required, for the reason it is on `NavigationMenu`: the caller's
   * page, its address and its analytics all need to know what is open, and a
   * Component holding its own copy would be a second source of truth about a state
   * that a reader can see on the page.
   */
  value: string | null
  /** Called when the open group changes. */
  onValueChange: (value: string | null) => void
  /**
   * The accessible name of each panel's tab axis, given the group's value.
   *
   * Required and a function of the group, because the inner axis is a *second*
   * navigation region and it needs a name of its own: a reader who has tabbed out
   * of the header's tab list and into a panel's tab list has to be told which of the
   * two they are in, and the only word this package could invent would be a word
   * that is wrong in every consumer's product.
   */
  panelLabel: (group: string) => string
  /**
   * The inner tab shown for one group, given the group's value.
   *
   * Required and a function of the group rather than a single value, because the
   * inner axis belongs to the group that holds it: two groups' panels are two
   * different lists of tabs, and one shared value would give a reader who has the
   * second tab of one open whichever tab happened to be last in the other. So the
   * caller holds one value per group and this Component asks for the group it needs
   * rather than keeping a record the caller cannot see and cannot put in an address.
   *
   * The cost is a caller who opens two groups and has set the same value in both has
   * a reader who lands on the same tab index in each, which is right when the panels
   * are parallel and wrong when they are not. Telling the two apart is the caller's
   * knowledge about their own content rather than a fact this package holds.
   */
  panel: (group: string) => string
  /**
   * Called when the reader moves to another inner tab, given the group and the tab.
   *
   * Required, and the group comes first because the caller is holding a value per
   * group and a callback that reported only the tab would leave them to guess which
   * of their values to write.
   */
  onPanelChange: (group: string, value: string) => void
  /**
   * How long the pointer must rest on a trigger before the group opens, in
   * milliseconds.
   *
   * Optional and defaulted the way `NavigationMenu` defaults it, because the panel is
   * a set of addresses rather than a preview: the reader is about to take one of
   * these links and a long rest followed by a wait is a rest they conclude did
   * nothing. The value is forwarded rather than re-decided so a caller who needs a
   * different one has one place to set it.
   */
  delay?: number
  /** Layout only. Changing a Prism-owned visual property from here is prohibited. */
  className?: string
}

/**
 * One column's links, and the column's own frame.
 *
 * `min-w-0` on the list so a long link wraps rather than widening the panel, and the
 * panel's width is the panel's business: a mega-menu that sizes itself to its widest
 * column is a panel whose width changes as the reader moves between tabs, which is
 * the layout shift `NavigationMenu`'s viewport exists to absorb and this column list
 * helps by not asking for more than it needs.
 */
const COLUMN = 'flex min-w-0 flex-1 flex-col gap-3'

/**
 * A multi-column disclosure whose panel is a second navigation axis, with its own
 * focus order inside the header's.
 *
 * **`NavigationMenu` is a disclosure of links. This is a disclosure whose contents
 * are themselves a set of views, and the difference is a focus order rather than a
 * drawing.** `NavigationMenu` opens a panel and the panel is links: Tab moves from
 * the trigger into a flat list and out of it, and there is nothing inside to
 * navigate. Here the panel opens onto a *tab axis*, so a reader who has tabbed off
 * the trigger is on a second list with its own roving tab stop, and from there into
 * the links of whichever panel is showing. That is three levels of navigation inside
 * one disclosure, and it is why this Component exists rather than a caller
 * composing `NavigationMenu` and dropping a `Tabs` into its content: a hand-placed
 * `Tabs` inside a `NavigationMenuContent` works until the reader tabs, at which
 * point two arrow-key models are live in one panel and the reader cannot tell which
 * one their key press is about.
 *
 * **The composition is deliberate and it is the argument.** `NavigationMenu`
 * supplies the disclosure: the trigger, the open state, the portal, the viewport
 * that absorbs the width change between panels, the Escape that closes and returns
 * focus, and the outside press. `Tabs` supplies the inner axis: the roving tab
 * stop, the arrow keys, `aria-selected` on the trigger and the panel relationship.
 * Neither is reimplemented here, for the reason every composition in this package is
 * one: two implementations of a focus model disagree within a release and a consumer
 * cannot tell which they installed. What this Component owns is the third thing, and
 * it is the third thing that is the Component: **the panel's focus order**, which is
 * the ordering of the two axes relative to each other and to the trigger.
 *
 * **The inner panel's value is the caller's, one per group, and that is what keeps
 * the two axes from colliding.** A reader who has the second tab of the Developers
 * panel open expects it to still be open when they come back to it, and a Component
 * with one shared `panel` value would give them whichever tab happened to be last.
 * So `panel` is a function of the group and the caller's map of group to tab value is
 * the truth. What this Component adds is the part the caller cannot: it asks for the
 * group it needs at the moment the panel is drawn, and it never resets a value the
 * reader chose. The cost is stated on the prop, and it is the same cost the whole
 * composition has: a caller who has set the same value in two groups has a reader who
 * lands on the same index in each.
 *
 * **The inner axis is named, and the name is per group.** The outer list is a
 * `<nav>` named by `label`, and the inner axis is a second navigation region that a
 * reader has to be told about separately: "Pricing, tab list" is a different
 * sentence from "Primary, tab list", and a reader who has tabbed off the header's
 * triggers and onto a panel's tabs has to know which one their arrow keys are about.
 * `panelLabel` is a function of the group for the same reason: "Pricing" and "Docs"
 * have different panels and a single word would be wrong for one of them.
 *
 * **A group with one panel draws one panel and no axis, and that is the honest
 * drawing.** One panel is a disclosure whose content is a set of links, which is what
 * `NavigationMenu` already is, and a one-tab axis is a tab stop that goes nowhere.
 * So the tab list is drawn only when there is more than one panel to choose between,
 * and a group with one panel renders its columns directly. The cost is that the
 * panel's markup differs between the two shapes, and a caller styling across both
 * has to account for a missing tab list, which is a selector rather than a
 * behaviour.
 *
 * **`NavigationMenuLink` is composed for every destination and it is the only
 * interactive leaf inside the panel.** That is `NavigationMenu`'s rule and it is
 * load-bearing: a link carries an address, so the browser can open it in a new tab,
 * copy it, and a crawler can follow it. A mega-menu whose panel holds buttons is a
 * header whose links cannot be shared, and the second navigation axis makes it more
 * tempting rather than less, because a tab axis looks like a set of controls. So
 * every leaf here is a native anchor and there is no command part to reach for by
 * mistake.
 *
 * **`active` is a required prop on every link rather than a derived one, and this is
 * the Component that most needs it.** A mega-menu is the widest panel a header draws
 * and the one a reader is most likely to be inside already: they are looking for
 * where they are. The marking is `aria-current="page"` on the anchor, so it is the
 * attribute and not a fill, which is the order the whole package keeps meaning in.
 *
 * **It is a client Component**, because the disclosure opens after the reader acts,
 * because the inner axis moves after the reader acts, and because every one of its
 * value props is a function the caller hands it, which is a client-to-client boundary
 * wherever it is written. What that costs is the price of every client control: a
 * server Component may render the bar's triggers once with every panel closed, and
 * what it may not do is open one.
 */
function MegaMenu({
  label,
  groups,
  value,
  onValueChange,
  panelLabel,
  panel,
  onPanelChange,
  delay,
  className,
}: MegaMenuProps) {
  return (
    <NavigationMenu
      label={label}
      value={value}
      onValueChange={onValueChange}
      delay={delay}
      className={cn('w-full', className)}
    >
      <NavigationMenuList>
        {groups.map((group) => (
          <NavigationMenuItem key={group.value} value={group.value}>
            <NavigationMenuTrigger>{group.label}</NavigationMenuTrigger>

            <NavigationMenuPortal>
              <NavigationMenuPositioner>
                <NavigationMenuPopup>
                  {/*
                   * The viewport, and it is the reason the panel does not jump as
                   * the reader moves between tabs. Two panels of different column
                   * counts are different widths, and without a viewport the panel
                   * resizes under the reader's cursor every time they press an arrow
                   * key. `NavigationMenu` owns that and this Component does not
                   * reimplement it.
                   */}
                  <NavigationMenuViewport className="p-4">
                    <Tabs
                      value={panel(group.value)}
                      onValueChange={(next) => onPanelChange(group.value, next)}
                    >
                      {/*
                       * The tab list, drawn only when there is a choice to make. One
                       * panel is a disclosure whose content is a set of links, which
                       * is what `NavigationMenu` already is, and a one-tab axis is a
                       * tab stop that goes nowhere. The name is per group because the
                       * inner axis is a second navigation region and "Primary, tab
                       * list" is a different sentence from "Pricing, tab list".
                       */}
                      {group.panels.length <= 1 ? null : (
                        <TabsList aria-label={panelLabel(group.value)}>
                          {group.panels.map((panel) => (
                            <TabsTrigger key={panel.value} value={panel.value}>
                              {panel.label}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                      )}

                      {group.panels.map((panel) => (
                        <TabsContent key={panel.value} value={panel.value}>
                          {/*
                           * The columns, and the number of them is the caller's
                           * fact. Four columns of two links and two columns of five
                           * are two products' information architectures and nothing
                           * here knows which one a reader is in.
                           */}
                          <div
                            data-slot="mega-menu-columns"
                            className="flex flex-col gap-6 sm:flex-row sm:gap-8"
                          >
                            {panel.columns.map((column) => (
                              <div
                                key={String(column.label)}
                                data-slot="mega-menu-column"
                                className={COLUMN}
                              >
                                {/*
                                 * The column's name, as a heading and not as a bold
                                 * run of text, because a column of links under a bold
                                 * run is a list a screen reader announces as one
                                 * undifferentiated group of nine links, while a
                                 * heading inside it tells the reader they are looking
                                 * at a different set from the one beside it.
                                 */}
                                <p
                                  data-slot="mega-menu-column-label"
                                  className="text-muted-foreground text-xs font-medium tracking-wide uppercase"
                                >
                                  {column.label}
                                </p>

                                <ul className="flex list-none flex-col gap-1">
                                  {column.links.map((link) => (
                                    <li key={link.href}>
                                      <NavigationMenuLink
                                        href={link.href}
                                        active={link.active}
                                        closeOnClick={link.closeOnClick}
                                      >
                                        <span
                                          data-slot="mega-menu-link"
                                          className="flex flex-col gap-0.5"
                                        >
                                          <span className="text-sm font-medium">{link.label}</span>
                                          {link.description === undefined ? null : (
                                            <span className="text-muted-foreground text-xs">
                                              {link.description}
                                            </span>
                                          )}
                                        </span>
                                      </NavigationMenuLink>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </NavigationMenuViewport>
                </NavigationMenuPopup>
              </NavigationMenuPositioner>
            </NavigationMenuPortal>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  )
}

export { MegaMenu }
