import type { ReactNode } from 'react'

import { ProductMark, type ProductMarkProps } from '../../components/ui/product-mark'
import type { SwitcherProduct } from '../../components/ui/product-switcher'
import type { SearchDialogMessages } from '../../components/ui/search-dialog'
import { cn } from '../../lib/utils'
import type { Mode, PackId } from '../../theming'
import { NavbarControls } from './navbar-controls'
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
}

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
   * The product this bar belongs to: the id, name and pack its `ProductMark` is
   * drawn from, and the mark that heads the mobile panel. The bar renders the mark
   * itself rather than a slot, because a bar whose brand lockup is a slot is a bar
   * every consumer has to reimplement.
   */
  product: Pick<ProductMarkProps, 'id' | 'name' | 'pack'>
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
  /** This site's own destinations. Omit for a bar that carries only the lockup. */
  nav?: readonly SiteNavLink[]
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
   * `false` is honoured: the bar is then part of the flow and scrolls away with the
   * page. It was accepted and ignored until this release, so a site that passed it
   * was given the sticky bar it had asked not to have, and `SiteHeader` has always
   * applied it the other way round.
   */
  sticky?: boolean
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
 * a fill is not available as a separator.
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
 * `will-change` is absent and stays absent. A `backdrop-filter` is promoted to its
 * own layer by the browser when it has something to filter, so `will-change` on the
 * bar would only keep that layer alive: nothing on this bar animates, there is no
 * frame coming for the hint to be ready for, and a hint applied at rest is a hint
 * with no release. This package ships no `will-change` anywhere, and the bar is not
 * the place to start one.
 *
 * **It is a server Component with one client island inside it.** The lockup and the
 * navigation are rendered on the server and ship no JavaScript; the controls are a
 * single boundary, because a control's state is a reader's state. A site that
 * passes no `search`, `sites`, `theme`, `mode` or `nav` renders the whole bar on the
 * server and ships none, which is the arrangement a static site wants and the reason
 * those props are optional rather than required.
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
  className,
}: SiteNavbarProps) {
  const links = nav ?? []
  const isCurrent = (link: SiteNavLink): boolean =>
    link.current ?? (currentPath !== undefined && link.href === currentPath)

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
          <ProductMark id={product.id} name={product.name} pack={product.pack} size="sm" />
        </a>

        {links.length > 0 ? (
          <nav aria-label={navLabel} className="hidden items-center lg:flex">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                aria-current={isCurrent(link) ? 'page' : undefined}
                rel={link.newTab ? 'noopener noreferrer' : undefined}
                target={link.newTab ? '_blank' : undefined}
                className={
                  isCurrent(link)
                    ? 'bg-accent text-accent-foreground focus-visible:border-ring focus-visible:ring-ring rounded-md px-2 py-1.5 text-sm font-medium transition-colors focus-visible:ring-[3px] focus-visible:outline-none'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-ring rounded-md px-2 py-1.5 text-sm font-medium transition-colors focus-visible:ring-[3px] focus-visible:outline-none'
                }
              >
                {link.label}
              </a>
            ))}
          </nav>
        ) : null}

        <NavbarControls
          product={product}
          nav={links.map((link) => ({ ...link, current: isCurrent(link) }))}
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
    </header>
  )
}

export default SiteNavbar
