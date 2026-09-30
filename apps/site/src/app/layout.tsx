import type { Metadata } from 'next'
import Link from 'next/link'

import { PrismThemeScript } from '@nanisoft/prism-ui/provider'
import { themeAttributes } from '@nanisoft/prism-ui/theming'

import { SiteBar } from '@/components/site-bar'
import { inter } from '@/lib/fonts'
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site'
import { DEFAULT_MODE, DEFAULT_PACK } from '@/lib/bar'

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
 * The document's own theme attributes, from the same constants the bar's controls
 * are given.
 *
 * `themeAttributes` expresses the two axes the way every other NaniSoft site
 * expresses them: `data-pack` for the palette and `.dark` for the mode, with
 * `default` written as the absence of the attribute rather than as its own value.
 * This site used to carry an inline script of its own, reading a `ds-theme` key it
 * wrote itself, and there were then two theme contracts across five sites and a
 * reader's dark-mode choice stopped at the boundary between them. One contract is
 * the whole of the fix, and it is the design system's own rather than a fifth one.
 */
const THEME_ATTRIBUTES = themeAttributes({ pack: DEFAULT_PACK, mode: DEFAULT_MODE })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" {...THEME_ATTRIBUTES} suppressHydrationWarning>
      <head>
        {/*
          The stored theme, applied before first paint. Without this the page
          renders in the default and then snaps to the reader's choice, which is a
          visible flash on every navigation, and the flash is worse on the pages
          that are mostly one large surface.
        */}
        <PrismThemeScript defaultPack={DEFAULT_PACK} defaultMode={DEFAULT_MODE} />
        {/*
          The structured data, as a script rather than as a component in the body.
          A crawler reads it out of the document head or the body indifferently,
          so the placement is a convention rather than a requirement; what it is not
          is optional. A JSON-LD block rendered through a component would
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
        {/*
          The bar, and the reason it is one component rather than five written here.

          The header this replaced put the wordmark, the Section row, search, a colour
          chooser and a menu panel in this file, and reached four sites that do not
          exist from here. The other four NaniSoft sites had a bar too, each of them
          its own, and between the five of them there was no way to reach a sibling
          site, no search outside this one, and no light and dark control outside
          this one either.

          `SiteNavbar` is the design system's answer to all of that, and this site
          consumes it from the package it documents, which is the arrangement the
          rest of this page is built for: every token, flag and table on these pages
          is read from the package build rather than retyped, and the bar is the same
          claim. The measurements behind its row are in the Block, and
          `e2e/header-fit.spec.ts` re-derives them at every width on every run rather
          than trusting them.

          The bar is a client boundary here and not on the four consumer sites, for
          the reason stated in `components/site-bar.tsx`: a root layout is not told
          which route it renders, so the current Section cannot be marked from the
          server.
        */}
        <SiteBar />
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
