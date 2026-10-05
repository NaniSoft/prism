import Link from 'next/link'

import { CtaLink } from '@nanisoft/prism-ui/components/cta-link'
import { Section, headingSizeClass } from '@nanisoft/prism-ui/components/section'
import { SITE_URL } from '@/lib/site'

import './globals.css'
import '@nanisoft/prism-ui/styles.css'

export const metadata = {
  title: 'Page not found',
  description: 'The address may be old, or the item may not have shipped yet.',
  alternates: { canonical: '/404' },
  robots: { index: false, follow: true },
}

/**
 * The 404 body the static asset layer serves, and why it lives at the ROOT of the
 * App Router rather than inside the `(site)` group.
 *
 * **This file was in `(site)/not-found.tsx` and it was never served, and nothing in
 * the repository could have said so.** Its own comment claimed it was "emitted to
 * `out/404.html`", and after a fresh `pnpm build` `out/404.html` and
 * `out/_not-found.html` both held Next's stock body: the string "This page could not
 * be found", no site header, no navigation and no `<main>`. A reader who mistyped an
 * address on `prism.nanisoft.com` got a bare framework page while this repository
 * carried a designed 404 with a `CtaLink`, a `noindex` and a paragraph explaining why
 * the code takes the `h1`. That is the defect class this repository keeps paying for:
 * a comment describing an output the code does not produce, over a real page nobody
 * received.
 *
 * The mechanism is Next's, and it is not a subtlety. `not-found.tsx` at the root of
 * `app/` is what serves an address that matches no route; inside a route group it
 * only answers `notFound()` thrown by that group's own segments. There are two root
 * layouts here, `(site)` and `(preview)`, and no `app/layout.tsx` above them, so this
 * file is rendered by Next's own minimal root rather than by either of them.
 *
 * **And that has three costs, stated here because they are visible in the export and
 * a reader of `out/404.html` would otherwise have to find them.** One: the document
 * carries no site header, no navigation and no footer, so a broken address is a page
 * with no way off it except the two links below. That is a decision rather than an
 * accident, and the decision is that a 404 is not somewhere a reader navigates from.
 * Two: `<html>` and `<body>` carry no class, so `flex min-h-dvh flex-col antialiased`
 * from `(site)/layout.tsx` is absent and the page has no minimum-height shell. Three,
 * and the one that would have shipped broken without this comment: **the two
 * stylesheets are imported here rather than inherited.** A root layout is where a
 * route normally picks up `globals.css` and `@nanisoft/prism-ui/styles.css`, this
 * file has no layout above it, and the first build of it emitted `out/404.html` with
 * **zero stylesheet links and a bare `<body>`**: the designed body, rendered as
 * unstyled HTML. The imports at the top of this file are the fix and they are here
 * for the same reason this comment is. Next deduplicates a stylesheet imported twice,
 * so `(site)`'s copy and this one are one file in the bundle.
 *
 * A fourth cost is not fixed and is not claimed to be: the page renders in the
 * default pack and the light mode, because `data-pack` and `.dark` are written on
 * `<html>` by a root layout and by the pre-hydration theme script in `<head>`, and a
 * root `not-found.tsx` has neither. A reader who chose Mint dark sees the default
 * light palette on this one page. Correcting it needs a root `app/layout.tsx`, which
 * this repository does not have on purpose, because adding one nests every root
 * layout beneath it and changes the DOM of all three hundred and ten published
 * routes. That trade belongs to the maintainer and this comment is where it is
 * recorded.
 *
 * `wrangler.jsonc`'s `not_found_handling: "404-page"` is what returns the 404 status
 * rather than a 200, and it is what chooses this body: Cloudflare serves
 * `out/404.html` for an unmatched path. The build emits that file from this route, so
 * the status is real and the body is this one.
 *
 * **The code is the heading and the sentence is under it, and that order is the
 * page's one real decision.** A not-found page whose `h1` is "Page not found"
 * gives a screen reader and a search engine nothing distinct to index, because
 * that string is the same on every broken URL on every site. The code is the part
 * that is specific, so it takes the `h1`, and the sentence is the part a person
 * reads, so it takes the step below it. It is also the reason this page is left
 * aligned rather than centred: a code is a value, and a value read down the
 * middle of a page reads as a poster.
 *
 * **The two headings are one step apart at every width, and the step is fixed.**
 * `sm:text-3xl` on the sentence was there to grow it with the page, and the
 * extended utility-cascade gate reports it as losing: the library's own `Heading`
 * sizes emit a bare `.text-2xl` that lands after this build's, and both builds
 * share one `utilities` layer, so the sentence rendered at `text-2xl` at every
 * width whatever this file asked for. A page that claims to be the site's front
 * door cannot ship a step the cascade silently removed.
 *
 * **`noindex`, and `follow`.** Every other page on this site is indexable and
 * every other page links here, so a crawler reaching this one should read the
 * links and leave rather than file the URL as a page of the site. It is the one
 * route in the export that says so, and it says it here rather than in a Worker
 * rule, because a rule in the Worker would be a second place a reader's
 * instructions live.
 *
 * **The one action is one focusable control, and it is the call to action rather
 * than a link wearing one.** This was a `Link` wrapped around a `Button`, which
 * is a `<button>` inside an `<a>`: two tab stops for one control, invalid markup,
 * and an activation the browser has to guess at, because the press belongs to the
 * inner element and the navigation to the outer one. `Button` has no `render` or
 * `asChild` seam, so the two could not be merged into one element from the call
 * site, and the three ways out of that were each worse than the defect:
 *
 * - A `render` seam on `Button` or `CtaLink` widens a published primitive's API
 *   to serve one private page, and `cta-link.tsx` already states why this package
 *   answers "which element" with a second Component rather than a prop: a
 *   polymorphic `as` makes the rendered element a runtime value only the reader
 *   of the call site knows. The one place this package does want a `render` is
 *   `DropdownMenuItem`, and there the item is a Base UI component whose own
 *   behaviour is the reason it cannot be an anchor child.
 * - `next/link` with the button's class string copied into this file is a second
 *   copy of a recipe that lives in the component package, kept in step by hand
 *   across a package boundary this repository cannot gate. A retune of the
 *   button would move the button and leave this behind.
 * - `CtaLink` is the answer the package already gives, and it costs a plain
 *   document navigation on the way out of a 404, which is the cheapest thing on
 *   this page to give up. Every other call to action on this site already renders
 *   as a `CtaLink`, so this removes an exception rather than adding one.
 *
 * `cta-link.tsx` and `dropdown-menu.tsx` are where that choice is written down, and
 * `apps/site/test/not-found-actions.test.ts` holds the facts a reader of the page
 * can act on: no `<button>` anywhere on it, no control nested inside another, and
 * one anchor carrying both the destination and the words.
 *
 * The other destination is the catalogue, and it is a text link rather than a
 * second button, so the page offers one way forward and one way to look instead of
 * two equal asks.
 */
export default function NotFound() {
  return (
    <Section>
      <div className="flex max-w-measure flex-col items-start gap-6">
        <div className="flex flex-col gap-2">
          <h1 className={`text-muted-foreground font-mono ${headingSizeClass('h1')}`}>404</h1>
          <h2 className={`font-semibold tracking-tight ${headingSizeClass('h2')}`}>
            That page does not exist
          </h2>
          <p className="text-muted-foreground text-lg text-pretty">
            The address may be old, or the item may not have shipped yet. Everything the site
            publishes is one of the two links below.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <CtaLink href="/overview/quickstart" size="lg">
            Read the quickstart
          </CtaLink>
          <Link
            href="/components"
            className="text-foreground text-sm font-medium underline underline-offset-4"
          >
            Or browse the catalogue
          </Link>
        </div>
        <p className="text-muted-foreground font-mono text-xs">
          {SITE_URL.origin}
        </p>
      </div>
    </Section>
  )
}