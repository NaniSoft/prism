import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { demos } from '@/generated/demos'

export const dynamic = 'force-static'

/**
 * One preview document per Item, and nothing else on the page.
 *
 * **The `robots` directive is here rather than in the layout**, and it is the only
 * metadata this document has. The layout states its own `title` for the route, and
 * a document that exports both a static `metadata` object and a `generateMetadata`
 * function is a build error rather than a merge, so the two are one export and the
 * one that knows the slug is the one kept. `noindex` and `nofollow` are the whole
 * of it: the document carries no prose, no navigation and no heading of its own, it
 * is the render target of a frame on a page already published at its own address,
 * and a crawler that files it has indexed an empty page plus a second URL for a
 * document that already has one.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params

  return {
    /*
     * The slug in the title, so a reader with eleven frames open can tell which is
     * which from the tab strip rather than from the frame's own contents.
     */
    title: `${slug} preview`,
    robots: { index: false, follow: false },
  }
}

/** One address per Item with a Demo, which is every Item in the catalogue. */
export function generateStaticParams() {
  return Object.keys(demos).map((slug) => ({ slug }))
}

export default async function PreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const entry = demos[slug]

  /*
   * No Demo at this address is a 404 rather than an empty document, and the
   * registry is what answers it rather than the catalogue. The catalogue has an
   * entry for every Item and the registry has one for every Item whose
   * documentation sits beside its Demo, so a gap between the two would otherwise
   * render a frame with nothing in it and no explanation.
   */
  if (!entry) notFound()

  const Demo = entry.component

  /*
   * The ground is a token and not a colour, and it is on `<body>` rather than on
   * this element, because the ground is the whole document.
   *
   * A Block composes its own sections and fills whatever box it is given, so what
   * is behind it has to be the page ground a reader is used to seeing it on, in
   * whichever pack and mode the toolbar beside the frame chose. Both are written
   * onto the document element before the first paint, so a Mint-dark preview
   * paints Mint-dark on its very first frame rather than flashing the default pair
   * and correcting itself.
   *
   * **There is no `min-h-dvh` here, and its absence is what makes the `auto`
   * frame useful.** A viewport-height floor made every short Component a
   * 900-pixel band of empty ground with a row of buttons in the middle of it, and
   * the frame reads that empty band as the Component's own proportions. The
   * document is instead exactly as tall as the Demo, and the frame measures it.
   */
  return (
    <main data-preview-surface>
      <Demo />
    </main>
  )
}