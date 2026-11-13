import type { ReactNode } from 'react'

import { ProductMark, type ProductMarkProps } from '../../components/ui/product-mark'
import type { SwitcherProduct } from '../../components/ui/product-switcher'
import type { SearchDialogMessages } from '../../components/ui/search-dialog'
import { cn } from '../../lib/utils'
import type { Mode, PackId } from '../../theming'
import { NavbarControls } from './navbar-controls'
import { NavMenu } from './nav-menu'
import type { ThemePack } from './theme-menu'

/**
 * One destination in the bar's own navigation.
 *
 * `href` is required and `current` is opt-in. The bar marks the current page with
 * `aria-current="page"` rather than with a colour, so a reader who cannot see the
 * colour still knows where they are.
 */
export type SiteNavLink = {
  /** The text of the link. */
  label: string
  /** Where the link goes. */
  href: string
  /**
   * Marks this link as the page the reader is on. Set it on the one link whose
   * destination is the current route.
   *
   * A site that renders the bar once in a root layout cannot know its own route,
   * because a layout is handed no pathname. Such a site passes `currentPath`
   * instead and the bar resolves the mark in the browser; see that prop.
   */
  current?: boolean
  /**
   * Opens the destination in a new browsing context, which defaults the link
   * relationship to `noopener noreferrer`. Prism does not decide what counts as
   * external: a cross-origin destination is not by itself a reason to open a tab.
   */
  newTab?: boolean
  /**
   * Holds the link back to the panel below the row's threshold and out of the
   * row itself.
   *
   * The row and the panel render the one array, and a destination is usually in
   * both because a destination the panel omits is a route a narrow-viewport
   * reader cannot find. The one honest exception is a destination the row already
   * carries another way: a site whose header shows a destination as an action in
   * its controls cluster above one width and cannot afford the cluster's fifth
   * control below it holds the place with a `mobileOnly` link rather than losing
   * the destination entirely. Set it on that one link and on nothing else,
   * because a row that hid a destination the panel also hid would be exactly the
   * omission this field exists to close.
   */
  mobileOnly?: boolean
  /** Forbidden: a destination carrying children is a `SiteNavGroup`, not a link. */
  children?: never
}

/**
 * A group of destinations in the bar's own navigation, rendered as one trigger
 * that opens a menu of them.
 *
 * The group is a place in the row rather than a route: it carries no `href`, and
 * a caller whose group has an index page of its own lists that page among the
 * `children` rather than on the group, so nothing is inventing a route. That is
 * the same shape the site's own sidebar holds a folder to, and for the same
 * reason: a group is where destinations live, not one.
 *
 * **A group hides its destinations until it is opened**, on the row above the
 * panel threshold and nowhere else. The bar's narrow-viewport panel lists every
 * destination flat, so a reader below the threshold meets no group at all, and a
 * caller who cannot afford to hide a route behind a click leaves it out of a
 * group: the search index, the sitemap and the page's own links are outside the
 * bar and unaffected either way.
 */
export type SiteNavGroup = {
  /** The word on the trigger, which is the group's own name. */
  label: string
  /** The destinations behind the trigger, in the order a reader should meet them. */
  children: readonly SiteNavLink[]
  /**
   * Marks the group as holding the page the reader is on, for a caller that
   * composes the bar per page and marks each entry itself. A caller that passes
   * `currentPath` leaves this off and the bar resolves it against the group's
   * children.
   */
  current?: boolean
}

/** One entry in the bar's own navigation: a link, or a group of them. */
export type SiteNavEntry = SiteNavLink | SiteNavGroup

/** The search the bar offers, which is a URL rather than an index. */
export type SiteNavSearch = {
  /**
   * Where this site's JSON index is served from, fetched on the first search and
   * not before. A URL rather than the index itself, because the index is the
   * largest asset on a documentation site and a value passed as a prop is
   * serialized into the document of every route that renders the bar.
   */
  indexUrl: string
  /** The accessible name of the trigger, of the dialog and of its field. */
  label: string
  /** Every sentence the dialog can say, which a Component does not ship. */
  messages: SearchDialogMessages
  /** The text shown before the reader has typed anything. */
  hint?: string
}

/** The colour chooser the bar offers, and whether it offers one at all. */
export type SiteNavTheme = {
  /** The accessible name of the menu, and of the word on its trigger. */
  label: string
  /**
   * The packs to choose between, each with the word a reader reads for it. Omit it
   * to offer every published pack under its own capitalised name.
   *
   * A product site passes nothing at all rather than passing this, because a site's
   * ground is a property of the site and a reader who repaints it is a reader on a
   * page that is no longer the one the site describes.
   */
  packs?: readonly ThemePack[]
}

/** The light and dark control the bar offers. */
export type SiteNavMode = {
  /** The control's accessible name while the page is in dark mode. */
  lightLabel: string
  /** The control's accessible name while the page is in light mode. */
  darkLabel: string
}

/** The two names of the control that opens the navigation below the row. */
export type SiteNavMobileLabels = {
  /** The word on the trigger while the panel is closed. */
  open: string
  /** The word on the trigger while the panel is open. */
  close: string
}

/** The props a SiteNavbar takes. */
export type SiteNavbarProps = {
  /**
   * The product this bar belongs to: the id, name, pack and drawn mark its
   * `ProductMark` is drawn from, and the mark that heads the mobile panel. The
   * bar renders the mark itself rather than a slot, because a bar whose brand
   * lockup is a slot is a bar every consumer has to reimplement.
   */
  product: Pick<ProductMarkProps, 'id' | 'name' | 'pack' | 'mark'>
  /** Where the brand lockup goes. @defaultValue '/' */
  homeHref?: string
  /**
   * The pack a reader who has never chosen a pack gets. It is passed to the theme
   * runtime rather than read from the document, so a site states its own default in
   * one place and the control and the page cannot disagree about it.
   */
  defaultPack: PackId
  /**
   * The mode a reader who has never chosen gets. Required for the same reason
   * `defaultPack` is, and because a toggle with no stated starting mode is a
   * control whose icon is a guess until it is pressed once.
   */
  defaultMode: Mode
  /**
   * This site's own destinations: links, groups of links, or both in the order
   * a reader should meet them. A link renders as itself; a group renders as one
   * trigger opening its children as a menu. Omit for a bar that carries only
   * the lockup.
   */
  nav?: readonly SiteNavEntry[]
  /**
   * The accessible name of the site's navigation. Required, and required rather
   * than defaulted because it is a word a reader hears: a Block that ships no copy
   * ships no reader-facing copy either.
   */
  navLabel: string
  /**
   * The route the reader is on, for a site that renders the bar once in a root
   * layout and therefore cannot mark the current link itself.
   *
   * A site that composes the bar per page, which is the arrangement that keeps the
   * current link server rendered, sets `current` on the one link instead and leaves
   * this off. The two are alternatives rather than layers, and a site that set both
   * would have two answers to which link is current.
   */
  currentPath?: string
  /**
   * The set of sites to move between, rendered as a menu. Omit it on a site that is
   * the only one; a set of one is a menu with a single item and no reason to exist.
   */
  sites?: readonly SwitcherProduct[]
  /** The `id` of the site the reader is on, marked in the menu. */
  currentSiteId?: string
  /**
   * The accessible name of the sites menu. Required whenever `sites` is passed, for
   * the same reason `navLabel` is.
   */
  sitesLabel?: string
  /** The search the bar offers, or nothing for no search. */
  search?: SiteNavSearch
  /** The colour chooser the bar offers, or nothing for no chooser. */
  theme?: SiteNavTheme
  /** The light and dark control the bar offers, or nothing for no toggle. */
  mode?: SiteNavMode
  /**
   * The two names of the mobile trigger, which is a round icon with no visible
   * word. Required rather than defaulted, because a default would be a sentence
   * this Block ships about a product that is not the caller's, and because a bar
   * that renders an unlabelled round control below its own threshold has a
   * keyboard reader reaching for something it cannot name.
   */
  mobileLabels: SiteNavMobileLabels
  /**
   * A slot for controls the product owns, after the ones this bar composes. A slot
   * rather than a prop, because an account menu and a sign-in link are application
   * state and neither is a fact a bar can be told.
   */
  actions?: ReactNode
  /**
   * Keeps the bar at the top of the viewport as the page scrolls. On by default,
   * because the bar is how a reader leaves the page they are on, and a bar that
   * scrolls away takes that with it on exactly the long pages a reader needs it.
   *
   * `false` is honoured: the bar is then part of the flow and scrolls away with
   * the page. It was accepted and ignored until this release, so a site that passed it
   * was given the sticky bar it had asked not to have, and `SiteHeader` has always
   * applied it the other way round.
   */
  sticky?: boolean
  /**
   * Draws the reading rail: a two-pixel spectrum line on the bar's bottom
   * hairline that fills with the reader's own progress through the page.
   * @defaultValue true
   *
   * On by default, because the rail is the one motion that costs a reader
   * nothing: it is bound to the scroll position the reader already owns, it
   * runs on a transform, and a browser that cannot run it draws no rail rather
   * than an empty promise of one. A reader who asked the platform for less
   * motion gets a still spectrum hairline, the same figure without the claim.
   *
   * `false` is for the pages the rail would misread: a short page whose scroll
   * never gets going, or a composition where a second line under the bar is a
   * line too many. The rail rides only a sticky bar, so `sticky={false}` takes
   * it regardless.
   */
  scrollRail?: boolean
  /** Layout only. Changing a Prism-owned visual property from here is prohibited. */
  className?: string
}

/**
 * The bar at the top of a product site, with the controls a reader needs on every
 * page of it.
 *
 * It is `SiteHeader` plus the four controls that were missing from it, and it
 * exists because all five NaniSoft sites had the same bar and every one of them had
 * written the missing four separately: Prism's own site had search and a colour
 * chooser and no way to reach its four siblings, and each of the four had a row of
 * product marks where a menu belongs and no search, no mode control and no
 * navigation at all below the width its own row stopped fitting. Five bars, one
 * design language, and no two of them the same bar.
 *
 * Every string is a prop and the Block ships none. There is no site name, no
 * default navigation, no "Search", no list of packs and no list of sites: a bar
 * that hardcoded any of them would hand every consumer a claim about a product that
 * is not theirs, which is the defect this Block exists to remove. The one piece of
 * copy it derives is a pack's own name from its own identifier, and only when the
 * caller names none.
 *
 * **The bar is one flex row that wraps, and it fits by measurement.** The brand
 * lockup and the controls hold their ends, the navigation sits in the middle, and
 * the navigation row is hidden below `lg` where the panel takes over. The brand
 * lockup is the one element that never wraps: a wordmark broken across two lines is
 * not a wordmark, and it is also the one element that yields rather than pushing a
 * control off the right edge of the viewport, which is the harm a header-fit test
 * exists to catch.
 *
 * **The navigation is a `nav` and the sites menu is a second landmark of its own.**
 * A reader who navigates by landmark needs two regions rather than one region with
 * two lists in it, and the two sets are different places: one is where this site
 * goes and the other is where the family goes. The controls are not a region at
 * all, because they are whatever this bar composed plus whatever the consumer put
 * in `actions`, and wrapping them in a landmark would be a claim about content the
 * Block does not own.
 *
 * The bottom hairline is `border-border`, so the bar separates from the page by a
 * line rather than by a fill change, which is how every surface in this system is
 * separated: in the base pack `background` and `card` resolve to the same value, so
 * a fill is not available as a separator. On the sticky bar the same hairline
 * carries the reading rail, the spectrum line that fills with the reader's own
 * progress through the page; see `scrollRail`, and the Motion section of
 * `DESIGN.md` for the law it runs under.
 *
 * **The bar is opaque, and it used not to be.** It carried `bg-background/80` and
 * `backdrop-blur`, so the page showed through it blurred. A backdrop filter is
 * evaluated against everything painted behind the element, and this element is a
 * full-viewport-width sticky bar, so on a scrolling page the browser re-sampled and
 * re-blurred that backdrop on every frame of the scroll, on every page of every site
 * that composes this bar. It is the most expensive thing in the document for the
 * least visible return: the twenty percent of the page showing through a bar that
 * carries its own labels on top of it is not what a reader looks at.
 *
 * **The blur is not kept behind a capability check, because a capability check does
 * not pay for it.** `@supports (backdrop-filter: blur(1px))` is false only in a
 * browser that would have dropped the declaration and composited no no-op, and it is
 * true in every browser that does the expensive thing, so it changes no reader's
 * cost. It would also leave a third outcome in the world, and the worst one: a bar
 * that is a flat eighty percent veil with unblurred text passing under it.
 *
 * What replaces the pair is `bg-background`, which is what `SiteHeader` already
 * ships, and the reason this is legible rather than merely cheaper is that an opaque
 * bar makes its own contrast the token pair the contrast gate already holds:
 * `muted-foreground` on `background` in every pack and in both modes, with nothing
 * composited between the ink and the ground. A `/80` background has no such pair at
 * all, because the colour under it is a decision the reader's scroll position makes
 * and no token in this system describes it.
 *
 * `will-change` is absent and stays absent. Two things on this bar move, and
 * both are compositor transforms that the browser promotes when they animate:
 * the current link's underline, which grows once per navigation at the authored
 * duration, and the reading rail, which is driven by the scroll position
 * through the stylesheet's scroll timeline rather than by a frame budget a hint
 * could front. A hint applied at rest is a hint with no release, and neither
 * motion needs one. This package ships no `will-change` anywhere, and the bar
 * is not the place to start one.
 *
 * **It is a server Component whose client islands are the ones a reader opens.** The
 * lockup and the row's links are rendered on the server and ship no JavaScript; the
 * controls are a single boundary, because a control's state is a reader's state, and
 * a group in the navigation adds one island of its own for the same reason. A site
 * that passes no `search`, `sites`, `theme`, `mode` or `nav`, and groups none of
 * its destinations, renders the whole bar on the server and ships none, which is
 * the arrangement a static site wants and the reason those props are optional
 * rather than required.
 */
export function SiteNavbar({
  product,
  homeHref = '/',
  defaultPack,
  defaultMode,
  nav,
  navLabel,
  currentPath,
  sites,
  currentSiteId,
  sitesLabel,
  search,
  theme,
  mode,
  mobileLabels,
  actions,
  sticky = true,
  scrollRail = true,
  className,
}: SiteNavbarProps) {
  const entries = nav ?? []

  /*
   * The row's half of the one array: every entry the panel does not reserve.
   * A group cannot be `mobileOnly`, so the narrowing is on `href`, the one key
   * a link carries and a group does not.
   */
  const rowEntries = entries.filter((entry) => !('href' in entry && entry.mobileOnly))

  /*
   * The current mark reads the route as a place rather than as a string, so a
   * reader on a page inside a destination is still on it: `/components/button`
   * marks Components on the row, which is the question a reader asking "where
   * am I" is asking. The boundary is the slash, so a Section whose segment is a
   * prefix of another's (`/content` beside a hypothetical `/content-x`) never
   * claims the other's pages.
   */
  const under = (href: string): boolean =>
    currentPath !== undefined && (currentPath === href || currentPath.startsWith(`${href}/`))

  const leafCurrent = (link: SiteNavLink): boolean => link.current ?? under(link.href)

  /**
   * A group is current when the reader is on it or inside any of its children.
   * A group is told apart from a link by `href`, which a link must carry and a
   * group must not, so the narrowing is on the one key the two never share.
   */
  const entryCurrent = (entry: SiteNavEntry): boolean =>
    entry.current ??
    ('href' in entry
      ? under(entry.href)
      : entry.children.some((child) => leafCurrent(child)))

  return (
    <header
      data-slot="site-navbar"
      className={cn(
        'border-border bg-background w-full border-b',
        sticky && 'sticky top-0 z-20',
        className,
      )}
    >
      {/*
        `max-w-page` rather than a literal, because the container width is an
        authored token and every Section on the page resolves against the same one.
        A bar on a wider measure than the body reads as a bar belonging to something
        else.
      */}
      <div className="mx-auto flex h-14 w-full max-w-page items-center gap-2 px-6">
        <a
          href={homeHref}
          className="focus-visible:border-ring focus-visible:ring-ring shrink-0 rounded-sm focus-visible:ring-[3px] focus-visible:outline-none"
        >
          <ProductMark
            id={product.id}
            name={product.name}
            pack={product.pack}
            mark={product.mark}
            size="sm"
          />
        </a>

        {/*
          The row renders the entries the panel reserves none of: a `mobileOnly`
          link is a destination the row's own cluster carries another way (an
          action CTA above a width the cluster fits at), so drawing it here as
          well would be the one destination shown twice while the row is wide
          enough to show it once. The panel below receives every entry.
        */}
        {rowEntries.length > 0 ? (
          <nav aria-label={navLabel} className="hidden items-center lg:flex">
            {rowEntries.map((entry) =>
              /*
               * A group is the one control in the row, because it is the one
               * entry that is a place rather than a destination, and its menu is
               * a client island for the same reason the controls cluster is:
               * whether it is open is a reader's state. The links around it stay
               * server-rendered anchors, so a bar whose row is all links still
               * ships a navigation with no JavaScript in it.
               */
              'href' in entry ? (
                <a
                  key={entry.href}
                  href={entry.href}
                  aria-current={entryCurrent(entry) ? 'page' : undefined}
                  rel={entry.newTab ? 'noopener noreferrer' : undefined}
                  target={entry.newTab ? '_blank' : undefined}
                  className={
                    /*
                     * The current mark is an underline rather than a filled pill,
                     * and the reason is the reading rail at the foot of the bar:
                     * the bar now carries one spectrum line that answers the
                     * scroll, and a block of accent fill sitting above it would
                     * have been two indicator systems on one edge. The underline
                     * is shape rather than colour, so a reader who cannot
                     * distinguish the hues still finds the page they are on, and
                     * `aria-current` still says it to a reader who sees nothing
                     * at all.
                     */
                    entryCurrent(entry)
                      ? 'text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-ring relative rounded-md px-2 py-1.5 text-sm font-medium transition-colors after:absolute after:inset-x-2 after:bottom-0.5 after:h-0.5 after:origin-left after:rounded-full after:bg-gradient-to-r after:from-chart-1 after:via-chart-3 after:to-chart-5 after:scale-x-100 after:transition-transform after:duration-base after:ease-out focus-visible:ring-[3px] focus-visible:outline-none'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-ring rounded-md px-2 py-1.5 text-sm font-medium transition-colors focus-visible:ring-[3px] focus-visible:outline-none'
                  }
                >
                  {entry.label}
                </a>
              ) : (
                <NavMenu
                  key={entry.label}
                  label={entry.label}
                  current={entryCurrent(entry)}
                  links={entry.children.map((child) => ({ ...child, current: leafCurrent(child) }))}
                />
              ),
            )}
          </nav>
        ) : null}

        <NavbarControls
          product={product}
          nav={entries.map((entry) =>
            'href' in entry
              ? { ...entry, current: entryCurrent(entry) }
              : {
                  label: entry.label,
                  children: entry.children.map((child) => ({ ...child, current: leafCurrent(child) })),
                },
          )}
          navLabel={navLabel}
          sites={sites}
          currentSiteId={currentSiteId}
          sitesLabel={sitesLabel}
          search={search}
          theme={theme}
          mode={mode}
          mobileLabels={mobileLabels}
          defaultPack={defaultPack}
          defaultMode={defaultMode}
          actions={actions}
        />
      </div>
      {/*
        The reading rail, drawn on the bottom hairline and filled by the page's
        own scroll. It is the travel figure at the scale of a page: one marker,
        one rail, the reader's hand providing the motion, which is why it rides
        the stylesheet's scroll timeline rather than any script. The whole
        figure, look and movement together, lives behind the capability check in
        the stylesheet, so a browser that cannot run the timeline draws no rail
        at all; it is `aria-hidden`, because a reading position a reader can see
        in the scrollbar already is not information this bar needs to announce;
        and it rides only the sticky bar, because a rail that scrolls away with
        the page is a rail nobody can read.
      */}
      {sticky && scrollRail ? (
        <span data-slot="site-navbar-rail" aria-hidden className="prism-scroll-rail" />
      ) : null}
    </header>
  )
}

export default SiteNavbar
