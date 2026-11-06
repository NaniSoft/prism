import type { Metadata } from 'next'

import { SiteFooter } from '@nanisoft/prism-ui/blocks/site-footer'
import { PrismThemeScript } from '@nanisoft/prism-ui/provider'
import { themeAttributes } from '@nanisoft/prism-ui/theming'

import { SiteBar } from '@/components/site-bar'
import { PrismLogo } from '@/components/logo'
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site'
import { DEFAULT_MODE, DEFAULT_PACK } from '@/lib/bar'
import { SECTIONS } from '@/lib/sections'

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
/*
 * The stylesheet sits in `src/app`, beside both root layouts rather than inside
 * either group, because the site's own Tailwind build scans it and its `@source`
 * globs are relative to its own location. Moving the file into one group would put
 * the other group's scanned paths on the wrong side of the directory, and the
 * utility generator would find the demos and the chrome by accident rather than by
 * the declarations this file makes.
 */
import '../globals.css'
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

/**
 * The year on the copyright line, frozen at build.
 *
 * A static export has no request to read a clock from, and the year the site was
 * last built is the year the copy was last true, which is the only honest
 * sentence a footer can say about time. It matches the year the brand policy
 * states in prose rather than deriving a second fact no document backs.
 */
const BUILD_YEAR = new Date().getFullYear()

/**
 * The footer's link columns, projected from the Section manifest.
 *
 * The two destination columns are the manifest split by its own `prose` flag,
 * which is the same flag the header's row splits on: a reader who reaches the
 * foot of a long page finds every Section flat here, including the five the
 * header holds behind the Catalogue trigger and the sidebar holds behind its own
 * tree. The third column names the agent surface by its files, because those
 * three URLs are the surface and a label that paraphrased them would be a fourth
 * name for three things that already have one.
 *
 * No link here is a second list. A Section added to the manifest appears in this
 * footer with no edit, in the column its own `prose` flag chooses, which is the
 * same guarantee the header, the sitemap and the search index already hold.
 */
const FOOTER_COLUMNS = [
  {
    title: 'Documentation',
    links: SECTIONS.filter((section) => section.prose).map((section) => ({
      label: section.title,
      href: `/${section.segment}`,
    })),
  },
  {
    title: 'Catalogue',
    links: SECTIONS.filter((section) => !section.prose).map((section) => ({
      label: section.title,
      href: `/${section.segment}`,
    })),
  },
  {
    title: 'For agents',
    links: [
      { label: 'llms.txt', href: '/llms.txt' },
      { label: 'llms-full.txt', href: '/llms-full.txt' },
      { label: 'prism-skill.md', href: '/prism-skill.md' },
    ],
  },
]

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
          The raster icon links, beside the SVG icon link the app directory
          emits for `app/icon.svg`. The SVG is what a current browser puts in the
          tab; the `.ico` answers the `/favicon.ico` request every browser makes
          before it reads a link, and the one Safari still needs; and the touch
          icon is the PNG iOS stores. All three are the same mark, generated
          from the SVG by `scripts/gen-icons.mjs`, so there is one beam and one
          refraction in the set rather than three drawings of them.
        */}
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
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

        There is no font class on this element, and the absence is the change worth
        reading. This body used to carry `inter.variable`, a generated class from
        `next/font/local` that set `--font-sans` on the element itself, and a
        directly applied custom property outranks an inherited one, so every page
        resolved the interface face to the site's own copy of Inter and never to the
        `@font-face` rules the library ships. The site therefore never exercised the
        face it documents: a missing or corrupt shipped font rendered perfectly here
        with every gate green. The token stack now resolves from `:root`, which is
        the library's own declaration, so what a consumer installs is what this site
        renders.
      */}
      <body className="flex min-h-dvh flex-col antialiased">
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
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:border focus:border-ring focus:bg-background focus:px-3 focus:py-1.5 focus:text-sm focus:font-medium focus:text-foreground focus:shadow-md focus:ring-ring focus:ring-[3px] focus:outline-none"
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
          The foot of the page, composed from the library's own `SiteFooter`.

          This footer was hand-written in this file for years, on a stated rule:
          no link row, because every Section was in the header and the sidebar.
          The rule was retired by the redesign this file is part of, with eyes
          open rather than by neglect, for three reasons a reader can check. The
          header holds five Sections behind the Catalogue trigger, so "every
          Section is in the header row" was true of the row and not of what it
          showed. The footer of a documentation site is the one place a reader
          who has just finished a page looks for the next one, and a footer of
          two paragraphs sends them back to the top. And the Block already
          existed: four NaniSoft product sites compose this exact footer, and
          the design system's own site hand-writing its own was the one site not
          built from the system it documents.

          What survived the retirement is the provenance claim, which was never
          the problem with a link row. The two labelled facts the old footer
          carried are now the word under the mark, through the Block's `about`
          slot, and the legal line states the two facts the brand policy already
          states in prose: the holder of the copyright and the licence on the
          packages. Nothing else is claimed. The mark used to be the spectrum
          disc, and it is the drawn beam-and-refraction now: the lockup carries
          the site's own drawing, which is what the bar's lockup above draws.
        */}
        <SiteFooter
          className="mt-auto"
          /*
            The same drawing the bar's lockup carries, at the footer's own size:
            the mark is the site's data now, so the bar and the foot draw one
            sign rather than a disc above and a drawing below.
          */
          product={{
            id: 'prism',
            name: 'Prism',
            mark: <PrismLogo className="block size-full" />,
          }}
          about={
            <>
              {/*
                The two labelled facts, still headings so a reader navigating by
                outline can find and skip each one, and still captions beside
                `text-sm` body copy rather than rungs of any page's ladder. The
                Block renders them with no colour of their own, so the muted
                treatment is stated here where the words are.
              */}
              <div className="text-muted-foreground flex flex-col gap-1">
                <h2 className="text-foreground text-sm font-semibold tracking-tight">
                  What this is
                </h2>
                <p className="text-pretty text-sm">
                  Prism is NaniSoft&apos;s design system: a DTCG token pipeline, a published
                  React library you compose without writing CSS, and this documentation site.
                </p>
              </div>
              <div className="text-muted-foreground flex flex-col gap-1">
                <h2 className="text-foreground text-sm font-semibold tracking-tight">
                  How this site is built
                </h2>
                <p className="text-pretty text-sm">
                  With the system it documents. Every token, flag and API table on these pages
                  is read from the package build rather than retyped, and the catalogue is the
                  one list behind the navigation, the corpus and the agent surface.
                </p>
              </div>
            </>
          }
          columns={FOOTER_COLUMNS}
          legal={
            <p>
              © {BUILD_YEAR} NaniSoft. The Prism packages are MIT-licensed; the brand and
              the pack names are the brand policy&apos;s, not the licence&apos;s.
            </p>
          }
        />
      </body>
    </html>
  )
}
