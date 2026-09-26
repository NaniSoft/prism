import type { Metadata } from 'next'
import Link from 'next/link'

import { ThemeSwitcher } from '@/components/theme-switcher'
import { SearchEntry } from '@/components/search-entry'
import { MobileMenu, SiteNav } from '@/components/site-nav'

// Order matters: the site's own Tailwind build emits `.h-9` and friends for the
// chrome, and the Prism stylesheet must come after it so a variant rule such as
// `pointer-coarse:h-11` wins the tie instead of losing to a later base utility.
import './globals.css'
import '@nanisoft/prism-ui/styles.css'

export const metadata: Metadata = {
  title: 'Design System',
  description: 'Token-driven component and block catalog.',
}

/**
 * Applies the stored theme before first paint. Without this the page renders with
 * the default theme and then snaps to the user's choice, which is a visible flash
 * on every navigation.
 */
const THEME_SCRIPT = `
(function () {
  try {
    var raw = localStorage.getItem('ds-theme');
    if (!raw) return;
    var s = JSON.parse(raw);
    if (s.id && s.id !== 'default') document.documentElement.dataset.pack = s.id;
    if (s.mode === 'dark') document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-screen antialiased">
        {/*
          Skip link, first in the document on purpose.

          The header is a full tab stop on every page: wordmark, four nav links,
          theme trigger, mode toggle, menu button. It renders above the content
          on all of them, so a keyboard user pays that cost again with every
          page, and this is the one control that lets them decline it. It has to
          precede the header rather than sit inside it, or tabbing to it would
          still walk the header first.

          The reveal is the usual `sr-only` / `focus:not-sr-only` pair, with one
          addition. `not-sr-only` resets `position` to `static`, which would put
          the link back into flow and shove the whole page down by its own
          height at the moment it appeared. `focus:absolute` is emitted after
          `focus:not-sr-only` at equal specificity, so it wins, and the element
          stays out of flow in both states: nothing moves, and the focused chip
          lands over the header instead of above it. The border is restored
          explicitly on focus because `not-sr-only` resets size, margin,
          padding, overflow and clip, but not the `border-width` that `sr-only`
          had zeroed.

          `:focus` rather than `:focus-visible`, which is what the header
          controls use. This control is unreachable by pointer and exists only
          to be tabbed to, and a heuristic that can disagree with `:focus` risks
          the one state that must never fail, which is the chip appearing with
          no ring at all.

          Colour is the two pairings the contrast gate already holds at their
          thresholds rather than a new one. `foreground` on `background` carries
          the label at 4.5:1 required, worst case 13.59:1 across the six themes.
          `ring` on `background` carries the focus edge at 3:1 required, worst
          case 3.08:1 in Mint light. Both sides of the ring sit on `background`,
          which is why the fill is `bg-background` and not `bg-card`: the two
          differ in every dark theme, so `card` would put the ring's inner edge
          on a pair the gate does not check.

          The ring is drawn at full strength where the header controls use
          `ring/50`. Half alpha composites to between 1.14:1 and 2.74:1 against
          every surface in this palette and clears 3:1 nowhere, so matching them
          exactly would ship an indicator that fails the threshold it exists to
          meet. A `bg-primary` chip is worse: `--ring` and `--primary` are the
          same value in all five pastel dark themes, so the ring would be
          invisible on the one control that is only ever on screen while it
          holds focus.
        */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:border focus:border-ring focus:bg-background focus:px-3 focus:py-1.5 focus:text-sm focus:font-medium focus:text-foreground focus:shadow-lg focus:ring-ring focus:ring-[3px] focus:outline-none"
        >
          Skip to content
        </a>
        <header className="border-border/80 bg-background/80 sticky top-0 z-20 border-b backdrop-blur">
          <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-4 px-6">
            {/*
              The wordmark carries the same focus treatment as every other header
              control, for the same reason: it is a plain link, so nothing in the
              tree would give it a ring and the browser default would be the only
              indicator. See the skip link's comment above for why the ring is at
              full strength rather than `ring/50`.
            */}
            <Link
              href="/"
              className="focus-visible:border-ring focus-visible:ring-ring rounded-sm text-sm font-semibold tracking-tight focus-visible:ring-[3px] focus-visible:outline-none"
            >
              Design System
            </Link>
            <SiteNav />
            {/*
              `ml-auto` keeps the controls hard right while the nav sits beside the
              wordmark. Below `md` the nav is display:none, so the controls still land
              against the edge without the header needing a second breakpoint.
            */}
            <div className="ml-auto flex items-center gap-2">
              <SearchEntry />
              <ThemeSwitcher />
              <MobileMenu />
            </div>
          </div>
        </header>
        {/*
          The skip link's target, and the reason for the two attributes on it.

          `id` is the fragment the link above points at. It is unique: the only
          other `id` attributes in the rendered document are the `useId` values
          the two disclosure panels generate, and no page or registry block
          declares one.

          `tabIndex={-1}` is what makes the link work rather than merely scroll.
          A fragment link moves the caret only when its target is focusable, and
          `<main>` is not in the tab order, so without this the browser scrolls
          and leaves focus up in the header, which is the exact position the
          reader was trying to leave. It is set here on the server, not in an
          effect, so the attribute is in the first byte of HTML rather than
          arriving after hydration.

          The outline is left alone deliberately. Browsers disagree about whether
          following a fragment paints one, and a themed replacement here would
          mean drawing a rule around the entire page. Where a browser does paint
          it, that outline is the only signal that the caret has landed, because
          the skip link itself has just given focus up and hidden again.
        */}
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        {/*
          Provenance, not promotion.

          The usual footer furniture is unavailable here, not merely unwelcome:
          there is no LICENSE file, no `license` field in any manifest, no owner
          and no repository URL anywhere in the project, so a copyright line, a
          social row or a newsletter form would all be invention. So the footer
          answers the only question a reader has at the end of a page that this
          site never answers anywhere else — is what I just read generated from
          the token source of truth, or retyped by hand? — and nothing else.
          Neither paragraph restates the route list or the per-block install
          command, because the header and the catalog already carry them.

          Container and vertical rhythm come from `Section` in the registry, so
          the page keeps one rhythm top to bottom; the columns carry no `max-w-*`
          because `max-w-6xl` already caps them. The band is kept quieter than
          the header by a hairline `border-t` and `text-muted-foreground`, with
          no accent, no hover chrome and no motion: the header has to be found,
          this only has to mark the end.
        */}
        <footer className="border-border border-t">
          <div className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-16 sm:grid-cols-2 sm:gap-16 sm:py-24">
            <p className="text-muted-foreground text-sm text-pretty">
              Prism is NaniSoft&apos;s design system: a DTCG token pipeline, a published React
              library you compose without writing CSS, and this documentation site.
            </p>
            <p className="text-muted-foreground text-sm text-pretty">
              The site is built with the system it documents. Every token, flag and API table
              on these pages is read from the package build rather than retyped, and the
              catalogue is the one list behind the navigation, the corpus and the agent
              surface.
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}
