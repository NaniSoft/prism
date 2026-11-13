import type { ReactNode } from 'react'
import { SiteFooter } from '@nanisoft/prism-ui/blocks/site-footer'
import { SiteNavbar } from '@nanisoft/prism-ui/blocks/site-navbar'
import { PrismMark } from '@nanisoft/prism-ui/components/product-marks'

import { BAR } from '@/lib/bar'
import { DEFAULT_MODE, GROUND_PACK, SITE_PRODUCT, publicPath } from '@/lib/site'

/**
 * The chrome every page renders, composed server-side from data and copy only.
 *
 * The navigation data names this application's own routes and the chrome derives
 * each one's public address, because a base path prefixes the address a reader
 * uses and not the route an application names.
 *
 * **The bar carries the colour chooser, and a product site's would not.** The
 * chooser is the one control this site's own ground argues against: a product's
 * ground is a property of the product, and Meridian's is sky. But this
 * application exists to show the system, and the pack a reader can put the page
 * into is half of what the system is, so the chooser rides the bar with
 * Meridian's own word for it and the ground stays the first paint a reader with
 * no stored choice gets.
 *
 * **Prism wears its own drawing in the surfaces set.** Meridian and its console
 * are identities this showcase invented, and a hue is an honest mark for both;
 * Prism is real and draws the beam-and-refraction in its own bar, so the set
 * shows the drawing rather than a disc standing in for a product that has one.
 */
export function SiteChrome({ children, currentPath }: { children: ReactNode; currentPath: string }) {
  const nav = BAR.nav.map((entry) => ({
    ...entry,
    href: publicPath(entry.href),
    current: entry.href === currentPath,
  }))
  const sites = BAR.sites.map((site) =>
    site.id === 'prism' ? { ...site, mark: <PrismMark className="block size-full" /> } : site,
  )
  return (
    <>
      <SiteNavbar
        product={SITE_PRODUCT}
        homeHref={publicPath('/')}
        defaultPack={GROUND_PACK}
        defaultMode={DEFAULT_MODE}
        nav={nav}
        navLabel={BAR.navLabel}
        sites={sites}
        currentSiteId={BAR.currentSiteId}
        sitesLabel={BAR.sitesLabel}
        theme={{ label: BAR.themeLabel }}
        mode={BAR.modeLabels}
        mobileLabels={{ open: 'Menu', close: 'Close menu' }}
      />
      <main data-slot="site-main">{children}</main>
      <SiteFooter
        product={SITE_PRODUCT}
        about={BAR.about}
        columns={[
          {
            title: 'Meridian',
            links: BAR.nav.map((entry) => ({ label: entry.label, href: publicPath(entry.href) })),
          },
          {
            title: 'Surfaces',
            links: [
              { label: 'The console', href: 'https://prism.nanisoft.com/showcase/admin' },
              { label: 'Built with Prism', href: 'https://prism.nanisoft.com' },
            ],
          },
        ]}
        legal={BAR.legalLine}
      />
    </>
  )
}
