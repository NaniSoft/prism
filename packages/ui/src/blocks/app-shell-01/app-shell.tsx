'use client'

import { Menu } from 'lucide-react'
import { Fragment, useState, type ReactNode } from 'react'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../components/ui/breadcrumb'
import { Button } from '../../components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '../../components/ui/dialog'
import { Separator } from '../../components/ui/separator'
import { ModeToggle } from '../site-navbar/mode-toggle'
import { ThemeMenu, type ThemePack } from '../site-navbar/theme-menu'
import { PrismProvider } from '../../provider/provider'
import type { Mode, PackId } from '../../theming'

export type AppShellCrumb = {
  label: ReactNode
  /** Renders a native anchor. Omit on the current, final step. */
  href?: string
}

/** The colour chooser the top bar offers, and whether it offers one at all. */
export type AppShellTheme = {
  /** The accessible name of the chooser, and of the word on its trigger. */
  label: string
  /**
   * The packs to choose between, each with the word a reader reads for it. Omit
   * it to offer every published pack under its own capitalised name, exactly as
   * the bar's chooser does.
   */
  packs?: readonly ThemePack[]
}

/** The light and dark control the top bar offers. */
export type AppShellMode = {
  /** The control's accessible name while the page is in dark mode. */
  lightLabel: string
  /** The control's accessible name while the page is in light mode. */
  darkLabel: string
}

export type AppShell01Props = {
  /**
   * The navigation rendered in the desktop rail and in the mobile sheet. Pass
   * nodes rather than a route table: the block never imports a router.
   */
  navigation: ReactNode
  /** The accessible name for the navigation regions and the sheet trigger. */
  navigationLabel: string
  /** The brand or product mark at the top of the rail and the sheet. */
  brand?: ReactNode
  /** The trail shown in the top bar. */
  breadcrumbs?: AppShellCrumb[]
  /**
   * The colour chooser the top bar offers, or nothing for no chooser. It is the
   * bar's own chooser composed rather than imitated, so a reader meets the same
   * control on a console's bar as on a site's, and the two cannot drift apart.
   *
   * A product's console can refuse it for the same reason a product site can:
   * the ground is the product's. The consumer that passes it is the one showing
   * the system rather than only working in it.
   */
  theme?: AppShellTheme
  /**
   * The light and dark control the top bar offers, or nothing for no toggle.
   * The two controls are separate props rather than one, because a console that
   * offers its operator the mode and not the pack is a real shape and not half
   * of one.
   */
  mode?: AppShellMode
  /**
   * The pack a reader with no stored choice gets, when the document carries no
   * pack of its own. The resolution order is the provider's: the stored choice,
   * then what the server rendered on the root element, then this. A shell on a
   * page whose layout already puts the pack in the document needs this only for
   * the reader whose store is empty and whose page rendered none.
   *
   * @defaultValue 'default'
   */
  defaultPack?: PackId
  /**
   * The mode a reader with no stored choice gets, under the same resolution
   * order as `defaultPack`.
   *
   * @defaultValue 'light'
   */
  defaultMode?: Mode
  /** Actions at the end of the top bar, e.g. an account menu. */
  actions?: ReactNode
  /** A slot above the navigation, e.g. a workspace switcher. */
  railHeader?: ReactNode
  /** A slot below the navigation, e.g. a user menu. */
  railFooter?: ReactNode
  children: ReactNode
}

/**
 * An application shell.
 *
 * It owns the frame every application screen repeats: a fixed rail from the
 * `lg` breakpoint up, a top bar with a breadcrumb trail and actions, and a
 * left-anchored Dialog sheet that carries the same navigation on narrow
 * screens. The navigation and the content are slots, so the app keeps its own
 * links, router and data. The block fetches nothing and imports no router.
 *
 * **The theme controls are the bar's own, composed rather than imitated.** A
 * console's reader chooses a pack and a mode with the same `ThemeMenu` and
 * `ModeToggle` a site's bar renders, which is the reason they are imported from
 * the navbar rather than drawn again here: two choosers that mean the same thing
 * are two controls to keep in step, and the step is held by composition. The
 * provider is mounted around the controls for the same reason the navbar mounts
 * it there: it is the only writer of the two attributes the boot script reads,
 * so it ships with the controls and stops there.
 */
export function AppShell01({
  navigation,
  navigationLabel,
  brand,
  breadcrumbs,
  theme,
  mode,
  defaultPack = 'default',
  defaultMode = 'light',
  actions,
  railHeader,
  railFooter,
  children,
}: AppShell01Props) {
  const [navOpen, setNavOpen] = useState(false)

  return (
    <div className="bg-background text-foreground flex min-h-svh w-full">
      <aside className="border-border hidden w-64 shrink-0 flex-col border-r lg:flex">
        {brand ? <div className="flex h-14 items-center px-4">{brand}</div> : null}
        <Separator />
        {railHeader ? <div className="p-4">{railHeader}</div> : null}
        <nav aria-label={navigationLabel} className="flex-1 overflow-y-auto p-4">
          {navigation}
        </nav>
        {railFooter ? (
          <>
            <Separator />
            <div className="p-4">{railFooter}</div>
          </>
        ) : null}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-border flex h-14 items-center gap-3 border-b px-4">
          <Dialog open={navOpen} onOpenChange={setNavOpen}>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label={navigationLabel}
              onClick={() => setNavOpen(true)}
            >
              <Menu className="size-5" />
            </Button>
            <DialogContent side="left" className="w-72 gap-0 p-0">
              <DialogTitle className="sr-only">{navigationLabel}</DialogTitle>
              <div className="flex h-full flex-col p-4">
                {brand ? <div className="mb-4">{brand}</div> : null}
                {railHeader ? <div className="mb-4">{railHeader}</div> : null}
                <nav aria-label={navigationLabel} className="flex-1 overflow-y-auto">
                  {navigation}
                </nav>
                {railFooter ? <div className="mt-4">{railFooter}</div> : null}
              </div>
            </DialogContent>
          </Dialog>

          {breadcrumbs?.length ? (
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((crumb, index) => {
                  const last = index === breadcrumbs.length - 1
                  return (
                    // Positional, for the same reason as the other blocks.
                    <Fragment key={index}>
                      {index > 0 ? <BreadcrumbSeparator /> : null}
                      <BreadcrumbItem>
                        {last || !crumb.href ? (
                          <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </Fragment>
                  )
                })}
              </BreadcrumbList>
            </Breadcrumb>
          ) : null}

          {/*
            The controls the shell composes, then the application's own actions.
            The chooser comes first and the mode after it, which is the reading
            order the site bar's cluster keeps: the wider choice, then the
            narrower one, then whatever the application owns.
          */}
          <PrismProvider defaultPack={defaultPack} defaultMode={defaultMode}>
            <div className="ml-auto flex items-center gap-2">
              {theme ? <ThemeMenu label={theme.label} packs={theme.packs} /> : null}
              {mode ? <ModeToggle lightLabel={mode.lightLabel} darkLabel={mode.darkLabel} /> : null}
              {actions}
            </div>
          </PrismProvider>
        </header>

        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}

export default AppShell01
