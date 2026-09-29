import type { Metadata } from 'next'
import Link from 'next/link'

import { ThemeSwitcher } from '@/components/theme-switcher'
import { SearchEntry } from '@/components/search-entry'
import { MobileMenu, SiteNav } from '@/components/site-nav'
import { inter } from '@/lib/fonts'
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site'

// Order matters, and the reason is a library utility this site's own build also
// emits, which is the collision the import order cannot fix on its own.
//
// This site's Tailwind build emits `.h-9` for its own chrome and demos, and the
// Prism stylesheet must come after it so a variant rule such as
// `pointer-coarse:h-11` wins the tie instead of losing to a later base utility:
// the library generates that class name at runtime from its own source, so this
// build never sees it in a scan and never orders it against its `.h-9`.
//
// The same ordering is what made the library's copy of `.hidden` land after this
// site's `.lg\:flex`, `.lg\:block` and `.sm\:inline`, and the library's `.p-4` and
// `.gap-6` land after this site's `.sm\:p-6` and `.sm\:gap-16`. A media query adds
// no specificity, so those ties went to whichever stylesheet was second and five
// variants stopped applying. `globals.css` moves exactly those five into a
// cascade layer above the library's, which is a rank rather than a position, so the
// two requirements no longer contradict each other.
import './globals.css'
import '@nanisoft/prism-ui/styles.css'

export const metadata: Metadata = {
  /*
   * The origin every relative URL in the metadata below resolves against.
   *
   * `metadataBase` is what turns `openGraph.url`, `alternates.canonical` and the
   * sitemap's absolute entries into absolute URLs, and a relative one is the
   * difference between a share card that renders and one that does not. It is
   * named from the Worker's custom domain rather than derived from a request,
   * because the site is a static export: there is no request at build time to
   * read a host from, and a build that guessed would publish one deployment's
   * hostname into every other deployment's pages.
   */
  metadataBase: SITE_URL,
  /*
   * A title template rather than a bare default, because every page after the
   * landing one carries its own title and a reader's tab, a search result and a
   * share card all need to say which site they are on. The landing page keeps
   * the default because it is the page the name belongs to.
   */
  title: {
    default: `${SITE_NAME}, the NaniSoft design system`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  /*
   * Index everything and follow nothing undecided. The one surface that is not
   * indexed is the mirrored Markdown, and it says so itself: each mirror is
   * served with its own directive by the Worker rather than by a rule here,
   * because whether a mirror is indexed is a property of the mirror.
   */
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: SITE_NAME,
    title: `${SITE_NAME}, the NaniSoft design system`,
    description: SITE_DESCRIPTION,
    locale: 'en',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME}, the NaniSoft design system`,
    description: SITE_DESCRIPTION,
  },
}

/**
 * The organisation and the site, as one JSON-LD document.
 *
 * Two nodes and no more. `WebSite` is what a search engine reads to know the
 * canonical name and the root of the site, and `Organization` is what it reads
 * to know who publishes it. Nothing here claims a rating, a price, a review
 * count or a date: the documentation is the evidence for what this system does,
 * and a structured-data field asserting something the site does not state would
 * be a claim the page cannot support. The URL and the name are the two facts the
 * site states everywhere else, so they are the two that are here.
 *
 * It is rendered from the same constants the metadata above uses, so the card,
 * the tab and the structured data cannot name three different sites.
 */
const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL.href}#organization`,
      name: 'NaniSoft',
      url: 'https://nanisoft.com',
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL.href}#website`,
      name: SITE_NAME,
      alternateName: 'NaniSoft design system',
      description: SITE_DESCRIPTION,
      url: SITE_URL.href,
      publisher: { '@id': `${SITE_URL.href}#organization` },
      inLanguage: 'en',
    },
  ],
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
        {/*
          The structured data, as a script rather than as a component in the body.
          A crawler reads it out of the document head or the body indifferently,
          so the placement is a convention rather than a requirement; what it is
          not is optional. A JSON-LD block rendered through a component would
          arrive with hydration rather than with the bytes, and a crawler that
          does not execute scripts would read a page with no structured data on
          it and no error to explain why.
        */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
        />
      </head>
      {/*
        The body is a flex column with `min-h-dvh` rather than `min-h-screen`,
        for the footer's `mt-auto` to mean anything: a footer pushed to the bottom
        of a short page instead of sitting directly under a short article. `dvh`
        rather than `svh` because this is a minimum, not a fixed height, so the
        mobile address bar shrinking the viewport moves the footer up rather than
        hiding it, which is the symptom `h-screen` causes.

        `flex-col` rather than `flex`, and `main` takes no flex role of its own: a
        stretched `main` with no content is the one case where a footer would ride
        up into the header, and the skip link's target is a block that fills what
        is left by default.
      */}
      <body
        className={`${inter.variable} flex min-h-dvh flex-col antialiased`}
      >
        {/*
          Skip link, first in the document on purpose.

          The header is a full tab stop on every page: wordmark, the row of
          Sections, search, theme trigger, menu button. It renders above the content
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
          {/*
            One line at every width, and the row is the reason the numbers in
            `e2e/README.md` are re-measured rather than inherited.

            The row carries the wordmark, every Section in the manifest and three
            controls, and the manifest grew from seven Sections to nine when
            Patterns and Live joined it. At the spacing this row used before, nine
            Section labels need about 1130 pixels of viewport, so the wordmark,
            which is the only elastic element in the row, folded to two lines
            across the whole of the `lg` band rather than across the 61 pixels at
            the bottom of it that `e2e/README.md` records.

            Two changes close most of that without moving a label or dropping a
            Section: the row's own gap goes from `gap-4` to `gap-2`, and each
            Section link's padding goes from `px-3` to `px-2` with the gap between
            them at zero. Neither is a token change and neither is visible as a
            token change. The rest of it is `SearchEntry`, which was 55 pixels of
            the word "Search" and is now an icon with an accessible name, and the
            reasoning for that trade is in that file. The measurements are in
            `site-nav.tsx` and in `e2e/README.md`, and `e2e/header-fit.spec.ts`
            re-derives the claim at every width on every run rather than trusting
            them.

            `max-w-page` rather than a literal, because the container width is an
            authored token and `Section` already resolves against it.
          */}
          <div className="mx-auto flex h-14 w-full max-w-page items-center gap-2 px-6">
            {/*
              The wordmark carries the same focus treatment as every other header
              control, for the same reason: it is a plain link, so nothing in the
              tree would give it a ring and the browser default would be the only
              indicator. See the skip link's comment above for why the ring is at
              full strength rather than `ring/50`.

              It is deliberately not `whitespace-nowrap`. The wordmark is the one
              elastic element in the row, and it yields its second line instead of
              pushing the mode toggle off the right edge of the viewport, which is
              the harm `e2e/header-fit.spec.ts` exists to catch.
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
              wordmark. Below `lg` the nav is display:none and the mobile menu
              carries the Sections instead, so the controls still land against the
              edge without the header needing a second breakpoint of its own. `lg`
              is the same threshold the row and the documentation sidebar switch
              at, and the reasoning for it, with the measurement behind it, is in
              `SiteNav`.
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
          site never answers anywhere else, which is whether what they just read
          is generated from the token source of truth or retyped by hand, and
          nothing else.

          **No link row, deliberately.** Every Section is in the header row and in
          the sidebar, and every published package is linked from the Changelogs
          index, which is the page that owns that list and the one a reader looking
          for it will reach. A footer repeating any of them puts the same
          destination twice on one screen, which is the duplication the header's
          own comment about the landing page exists to avoid. What is left is two
          labelled facts, so each paragraph is a small heading over its sentence:
          an unlabelled pair of paragraphs of similar length reads as filler, and
          these two are not the same claim.

          The band is kept quieter than the header by a hairline `border-t` and
          `text-muted-foreground`, with no accent and no motion: the header has to
          be found, this only has to mark the end. `mt-auto` is what makes it the
          end of a short page rather than the end of a tall one, and the body is a
          flex column for that one reason.
        */}
        <footer className="border-border mt-auto border-t">
          <div className="text-muted-foreground mx-auto grid w-full max-w-page gap-8 px-6 py-12 sm:grid-cols-2 sm:gap-16">
            <div className="flex flex-col gap-2">
              <h2 className="text-foreground text-sm font-semibold tracking-tight">
                What this is
              </h2>
              <p className="text-pretty text-sm">
                Prism is NaniSoft&apos;s design system: a DTCG token pipeline, a published React
                library you compose without writing CSS, and this documentation site.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-foreground text-sm font-semibold tracking-tight">
                How this site is built
              </h2>
              <p className="text-pretty text-sm">
                With the system it documents. Every token, flag and API table on these pages is
                read from the package build rather than retyped, and the catalogue is the one
                list behind the navigation, the corpus and the agent surface.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
