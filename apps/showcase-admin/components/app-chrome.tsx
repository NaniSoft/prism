import type { ReactNode } from 'react'
import { AppShell01 } from '@nanisoft/prism-ui/blocks/app-shell-01'
import { AuroraWash } from '@nanisoft/prism-ui/components/aurora-wash'
import { Avatar, AvatarFallback } from '@nanisoft/prism-ui/components/avatar'
import { CtaLink } from '@nanisoft/prism-ui/components/cta-link'
import { ProductMark } from '@nanisoft/prism-ui/components/product-mark'

import { BAR } from '@/lib/bar'
import { DEFAULT_MODE, GROUND_PACK, publicPath } from '@/lib/site'

/**
 * The shell every console route renders, composed server-side from data and copy
 * only. The rail navigation is plain anchors, because the shell takes nodes
 * rather than a route table and this application owns its own routes.
 *
 * **The bar carries the colour chooser and the mode toggle, and a product's
 * console might not.** This showcase exists to show the system, and the pack a
 * reader can put the working surface into is half of what that means, so the
 * shell is handed the two controls with Meridian's own words for them. The
 * application still owns no script for it: the controls are the shell's own
 * composition, and this file passes two labels.
 */
export function AppChrome({
  children,
  currentPath,
  trail,
}: {
  children: ReactNode
  currentPath: string
  trail: string
}) {
  const navigation = (
    <ul className="flex flex-col gap-1 text-sm">
      {BAR.nav.map((entry) => (
        <li key={entry.href}>
          <a
            href={publicPath(entry.href)}
            className={
              entry.href === currentPath
                ? 'bg-accent text-accent-foreground block rounded-md px-3 py-2 font-medium'
                : 'text-muted-foreground hover:text-foreground block rounded-md px-3 py-2'
            }
            aria-current={entry.href === currentPath ? 'page' : undefined}
          >
            {entry.label}
          </a>
        </li>
      ))}
    </ul>
  )

  return (
    <AppShell01
      navigationLabel={BAR.navLabel}
      brand={<ProductMark id="meridian" name="Meridian" pack={GROUND_PACK} />}
      breadcrumbs={[{ label: 'Console', href: publicPath('/') }, { label: trail }]}
      theme={{ label: BAR.themeLabel }}
      mode={BAR.modeLabels}
      defaultPack={GROUND_PACK}
      defaultMode={DEFAULT_MODE}
      actions={
        <Avatar className="size-8" aria-label={BAR.operator.name}>
          <AvatarFallback>{BAR.operator.initials}</AvatarFallback>
        </Avatar>
      }
      navigation={navigation}
      railFooter={
        <div className="flex flex-col items-start gap-1 px-3 pb-4 text-sm">
          <CtaLink href={BAR.shopFront.href} size="sm" variant="ghost">
            {BAR.shopFront.label}
          </CtaLink>
          <CtaLink href={BAR.prism.href} size="sm" variant="ghost">
            {BAR.prism.label}
          </CtaLink>
        </div>
      }
    >
      {/*
        The console's ground: the same aurora wash the marketing side wears,
        drawn quieter and only under the working surface. A page-level fixed
        field would sit above the shell's own ground, and a moving medium behind
        an instrument panel is a distraction rather than a setting, so the wash
        is absolute in an isolated wrapper behind the content column and the
        rail keeps a still ground. The wash's own `subtle` intensity steps every
        plane one rung down the veil ladder, which is the package's decision
        rather than this app's: no wrapper opacity, no class of this app's own.
      */}
      <div className="relative isolate">
        <AuroraWash intensity="subtle" className="-z-10" />
        {children}
      </div>
    </AppShell01>
  )
}
