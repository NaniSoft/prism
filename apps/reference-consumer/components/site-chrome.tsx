import type { ReactNode } from 'react'
import { SiteFooter } from '@nanisoft/prism-ui/blocks/site-footer'
import { SiteNavbar } from '@nanisoft/prism-ui/blocks/site-navbar'

import { BAR } from '@/lib/bar'
import { DEFAULT_MODE, GROUND_PACK, SITE_PRODUCT } from '@/lib/site'

/**
 * The chrome every page renders, composed server-side from data and copy only.
 */
export function SiteChrome({ children, currentPath }: { children: ReactNode; currentPath: string }) {
  const nav = BAR.nav.map((entry) => ({ ...entry, current: entry.href === currentPath }))
  return (
    <>
      <SiteNavbar
        product={SITE_PRODUCT}
        homeHref="/"
        defaultPack={GROUND_PACK}
        defaultMode={DEFAULT_MODE}
        nav={nav}
        navLabel={BAR.navLabel}
        sites={BAR.sites}
        currentSiteId={BAR.currentSiteId}
        sitesLabel={BAR.sitesLabel}
        mode={BAR.modeLabels}
        mobileLabels={{ open: 'Menu', close: 'Close menu' }}
      />
      <main data-slot="site-main">{children}</main>
      <SiteFooter
        product={SITE_PRODUCT}
        about={BAR.about}
        columns={[
          { title: 'Reference', links: [{ label: 'Home', href: '/' }, { label: 'Dashboard', href: '/dashboard' }, { label: 'Assets', href: '/assets' }] },
          { title: 'Concepts', links: [{ label: 'Tokens', href: '/' }, { label: 'Quality gates', href: '/' }] },
        ]}
        legal={BAR.legalLine}
      />
    </>
  )
}


