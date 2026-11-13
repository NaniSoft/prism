import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import '@nanisoft/prism-ui/styles.css'
import { PrismThemeScript } from '@nanisoft/prism-ui/provider'

import { GROUND_PACK, DEFAULT_MODE, THEME_ATTRIBUTES } from '@/lib/site'

export const metadata: Metadata = {
  title: { default: 'Meridian Console', template: '%s · Meridian Console' },
  description:
    'The console showcase: a fictional product admin composed entirely from Prism, with no CSS or JS of its own.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  void GROUND_PACK
  void DEFAULT_MODE
  return (
    <html lang="en" suppressHydrationWarning {...THEME_ATTRIBUTES}>
      <head>
        <PrismThemeScript defaultPack={GROUND_PACK} defaultMode={DEFAULT_MODE} />
      </head>
      <body>{children}</body>
    </html>
  )
}
