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

export type AppShellCrumb = {
  label: ReactNode
  /** Renders a native anchor. Omit on the current, final step. */
  href?: string
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
 */
export function AppShell01({
  navigation,
  navigationLabel,
  brand,
  breadcrumbs,
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

          <div className="ml-auto flex items-center gap-2">{actions}</div>
        </header>

        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}

export default AppShell01
