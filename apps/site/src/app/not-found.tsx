import Link from 'next/link'

import { Button } from '@nanisoft/prism-ui/components/button'
import { Section } from '@nanisoft/prism-ui/components/section'
import { SITE_URL } from '@/lib/site'

export const metadata = {
  title: 'Page not found',
  description: 'The address may be old, or the item may not have shipped yet.',
  alternates: { canonical: '/404' },
  robots: { index: false, follow: true },
}

/**
 * The 404 body, emitted to `out/404.html`.
 *
 * The static asset layer is what makes the status real under export: a build-time
 * `notFound()` still emits a file, so Cloudflare's `not_found_handling:
 * "404-page"` is what returns a 404 for an unmatched path. This page is the body
 * it serves.
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
 * extended utility-cascade gate reports it as losing: the library's own
 * `Heading` sizes emit a bare `.text-2xl` that lands after this build's, and both
 * builds share one `utilities` layer, so the sentence rendered at `text-2xl` at
 * every width whatever this file asked for. A page that claims to be the site's
 * front door cannot ship a step the cascade silently removed.
 *
 * **`noindex`, and `follow`.** Every other page on this site is indexable and
 * every other page links here, so a crawler reaching this one should read the
 * links and leave rather than file the URL as a page of the site. It is the one
 * route in the export that says so, and it says it here rather than in a Worker
 * rule, because a rule in the Worker would be a second place a reader's
 * instructions live.
 *
 * The one action is the quickstart. The other destination is the catalogue, and
 * it is a text link rather than a second button, so the page offers one way
 * forward and one way to look instead of two equal asks.
 */
export default function NotFound() {
  return (
    <Section>
      <div className="flex max-w-measure flex-col items-start gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-muted-foreground font-mono text-3xl sm:text-4xl">404</h1>
          <h2 className="text-2xl font-semibold tracking-tight">That page does not exist</h2>
          <p className="text-muted-foreground text-lg text-pretty">
            The address may be old, or the item may not have shipped yet. Everything the site
            publishes is one of the two links below.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/overview/quickstart">
            <Button size="lg">Read the quickstart</Button>
          </Link>
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
