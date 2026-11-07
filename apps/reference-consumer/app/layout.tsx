import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import '@nanisoft/prism-ui/styles.css'
import { PrismThemeScript } from '@nanisoft/prism-ui/provider'

import { GROUND_PACK, DEFAULT_MODE, THEME_ATTRIBUTES } from '@/lib/site'

export const metadata: Metadata = {
  title: { default: 'Reference consumer', template: '%s · Reference consumer' },
  description: 'The zero-CSS reference consumer: one stylesheet, approved components, packs and modes.',
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
