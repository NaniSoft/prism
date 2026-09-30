'use client'

import type { Mode, PackId } from '../../theming'
import type { SearchDialogMessages } from '../../components/ui/search-dialog'
import { ModeToggle } from './mode-toggle'
import { SearchEntry } from './search-entry'
import { SitesMenu } from './sites-menu'
import { ThemeMenu, type ThemePack } from './theme-menu'
import type { SwitcherProduct } from '../../components/ui/product-switcher'
import type { MobileNavLink } from './mobile-nav'
import { MobileNav } from './mobile-nav'
import { PrismProvider } from '../../provider/provider'

/** What the control cluster was told to render. Every field is optional. */
export type NavbarControlsProps = {
  /** The product whose mark heads the mobile panel. */
  product: { id: string; name: string; pack?: PackId | null }
  /** The site's own destinations, for the panel below the row's threshold. */
  nav: readonly MobileNavLink[]
  /** The accessible name of the panel and of its trigger. */
  navLabel: string
  /** The set of sites, or nothing for a site that is the only one. */
  sites?: readonly SwitcherProduct[]
  /** The `id` of the site the reader is on. */
  currentSiteId?: string
  /** The accessible name of the sites menu. */
  sitesLabel?: string
  /** Where the search index is served from, or nothing for no search. */
  search?: {
    indexUrl: string
    label: string
    hint?: string
    messages: SearchDialogMessages
  }
  /** The packs the chooser offers, or nothing for no chooser. */
  theme?: { label: string; packs?: readonly ThemePack[] }
  /** The two names of the light and dark control, or nothing for no toggle. */
  mode?: { lightLabel: string; darkLabel: string }
  /** The two names of the mobile trigger. */
  mobileLabels: { open: string; close: string }
  /** The pack a reader with no stored choice gets. */
  defaultPack: PackId
  /** The mode a reader with no stored choice gets. */
  defaultMode: Mode
  /** A slot for controls the consumer owns, after the ones above. */
  actions?: React.ReactNode
}

/**
 * The bar's controls, and the only client boundary in the navbar.
 *
 * Everything interactive in a site header is application state: what a reader has
 * chosen, what is open, what a search found. None of it is a fact the bar can be
 * told, so none of it can live in a server Component, and the boundary is drawn
 * here rather than around the whole bar so that the brand lockup and the
 * navigation stay server rendered. That is the arrangement that lets a site keep
 * the rest of its page free of client JavaScript, which is the property three of
 * the five NaniSoft sites are built around.
 *
 * **The provider is mounted here and not in the site's root layout, and that is
 * deliberate.** A provider in the layout would wrap every page and every provider
 * is context, so a page that never renders a control would still ship it. Mounted
 * around five buttons, it ships with the buttons and stops there. It is also the
 * only writer of the two attributes the boot script reads, so a choice made here
 * is a choice the next page load resolves to the same theme.
 *
 * **The order is fixed and it is a reading order, not a preference.** Search first
 * because it is the only control that answers a question the reader arrived with;
 * then the two menus, which are choices about where to be rather than about what to
 * do; then the mode, which is the choice that persists across every site in the
 * family; then the mobile trigger, which is last because it is the only one that
 * appears at the narrow end of the range and appears alone there.
 */
export function NavbarControls(props: NavbarControlsProps) {
  const {
    product,
    nav,
    navLabel,
    sites,
    currentSiteId,
    sitesLabel,
    search,
    theme,
    mode,
    mobileLabels,
    defaultPack,
    defaultMode,
    actions,
  } = props

  const hasThemeControls = Boolean(theme) || Boolean(mode)
  if (!search && !sites && !hasThemeControls && !actions && nav.length === 0) return null

  return (
    <PrismProvider defaultPack={defaultPack} defaultMode={defaultMode}>
      <div className="ms-auto flex items-center gap-2">
        {search ? (
          <SearchEntry
            indexUrl={search.indexUrl}
            label={search.label}
            hint={search.hint}
            messages={search.messages}
          />
        ) : null}

        {sites && sites.length > 0 && sitesLabel ? (
          <SitesMenu sites={sites} currentId={currentSiteId} label={sitesLabel} />
        ) : null}

        {theme ? <ThemeMenu label={theme.label} packs={theme.packs} /> : null}

        {mode ? <ModeToggle lightLabel={mode.lightLabel} darkLabel={mode.darkLabel} /> : null}

        {actions}

        {nav.length > 0 ? (
          <MobileNav
            product={product}
            links={nav}
            label={navLabel}
            openLabel={mobileLabels.open}
            closeLabel={mobileLabels.close}
          />
        ) : null}
      </div>
    </PrismProvider>
  )
}
