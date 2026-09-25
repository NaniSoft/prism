import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { SiteFooter, SiteHeader } from '@/components/SiteHeader';
import { SiteThemeProvider } from '@/components/SiteThemeProvider';
import { DEFAULT_MODE, DEFAULT_PACK, THEME_BOOTSTRAP_SCRIPT, themeClass } from '@/lib/theme';

import '@nanisoft/prism-ui/styles.css';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Prism — one design language, many expressions',
    template: '%s · Prism',
  },
  description:
    "NaniSoft's Prism-owned design system: accessible components, production blocks, complete pages, live docs, and an agent-ready corpus.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={themeClass(DEFAULT_PACK, DEFAULT_MODE)} suppressHydrationWarning>
      <head>
        {/* Runs during parsing so the stored pack and mode paint on the first frame. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }} />
      </head>
      <body>
        <SiteThemeProvider>
          <SiteHeader />
          <main className="site-main">{children}</main>
          <SiteFooter />
        </SiteThemeProvider>
      </body>
    </html>
  );
}
