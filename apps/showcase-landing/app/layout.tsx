import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import '@nanisoft/prism-ui/styles.css'
import { Ground01 } from '@nanisoft/prism-ui/blocks/ground-01'
import { PrismThemeScript } from '@nanisoft/prism-ui/provider'

import { GROUND_PACK, DEFAULT_MODE, THEME_ATTRIBUTES } from '@/lib/site'

export const metadata: Metadata = {
  title: { default: 'Meridian', template: '%s · Meridian' },
  description:
    'The landing showcase: a fictional product site composed entirely from Prism, with no CSS or JS of its own.',
}

/**
 * The application's one continuous ground, and the whole reason this layout
 * exists beyond the html shell.
 *
 * The marketing site this app stands in for meets its reader on a lit surface
 * with a medium moving through it, which is the ground the Prism landing wears
 * and the whole of which is one published Block: the `site-atmosphere` layer,
 * the wash, the field and the bar's transparency over the first screen are
 * `Ground01`'s, and this application chose where it lives and at what presence
 * and nothing else about it. The field's floor is server-rendered, so the
 * figure is complete before any script runs and still true with the motion
 * stopped.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  void GROUND_PACK
  void DEFAULT_MODE
  return (
    <html lang="en" suppressHydrationWarning {...THEME_ATTRIBUTES}>
      <head>
        <PrismThemeScript defaultPack={GROUND_PACK} defaultMode={DEFAULT_MODE} />
      </head>
      <body>
        <Ground01 />
        {children}
      </body>
    </html>
  )
}
