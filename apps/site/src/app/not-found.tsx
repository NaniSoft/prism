import Link from 'next/link'

import { Button } from '@nanisoft/prism-ui/components/button'
import { Section, SectionHeading } from '@nanisoft/prism-ui/components/section'

export const metadata = { title: 'Page not found' }

/**
 * The 404 body, emitted to `out/404.html`.
 *
 * The static asset layer is what makes the status real under export: a build-time
 * `notFound()` still emits a file, so Cloudflare's `not_found_handling:
 * "404-page"` is what returns a 404 for an unmatched path. This page is the body
 * it serves.
 */
export default function NotFound() {
  return (
    <Section>
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
        <SectionHeading
          as="h1"
          eyebrow="404"
          title="That page does not exist"
          description="The address may be old, or the item may not have shipped yet. The catalogue and the guides are one link away."
        />
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/components">
            <Button>Browse components</Button>
          </Link>
          <Link href="/docs/quickstart">
            <Button variant="outline">Read the quickstart</Button>
          </Link>
        </div>
      </div>
    </Section>
  )
}
