import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { PreviewThemeScript, previewAttributes } from './preview-theme'

import '../globals.css'
import '@nanisoft/prism-ui/styles.css'

/**
 * The preview document's own head, and why the site does not supply it.
 *
 * **This is a second root layout, which is the arrangement the preview needs and
 * the only one that works.** A root layout is the outermost element of every route
 * beneath it, so the site's own would put the documentation's navigation, its skip
 * link and its footer inside a 390-wide phone preview, and the frame would be
 * showing the documentation at phone width rather than the Block at phone width. A
 * route group with its own root layout is the documented way to give one subtree a
 * different document; the site group keeps the site's own and nothing about it
 * changes.
 *
 * **The stylesheet is imported here and in the site group, in that order, and the
 * order is the one `site/layout.tsx` states the reason for.** The site's own
 * Tailwind build emits its utilities first and the library's second, so a variant
 * the library generates at runtime, `pointer-coarse:h-11` on a Button, outranks a
 * base class from the site rather than losing to it. A preview whose Buttons came
 * out 36px tall on a touch device would be reporting a defect the component does not
 * have.
 *
 * **The theme script is this document's and not the site's boot script, because a
 * preview is not a page of the site.** `PrismThemeScript` resolves from
 * `localStorage`, which is exactly wrong here: the pack a reader chose for one Item
 * must not travel to the next Item, must not be written to storage by a document
 * that is not the site, and must not be able to disagree with the toolbar beside
 * the frame. The preview's theme comes from the address and from nowhere else, and
 * `preview-theme.tsx` states why that is a second rule rather than a second copy of
 * the first.
 */
export const metadata: Metadata = {
  title: 'Preview',
  /*
   * `noindex`, and `nofollow`, because the document carries no prose, no navigation
   * and no heading of its own. This is stated here rather than in the Worker
   * because the Worker holds one rule, about the mirrored Markdown, and a per-route
   * rule added there would be a second place that has to know this route exists.
   */
  robots: { index: false, follow: false },
}

export default function PreviewLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" {...previewAttributes()} suppressHydrationWarning>
      <head>
        {/*
          The preview's own theme, applied before the first paint and after the
          stylesheet, so the document is themed and styled in the frame a reader
          first sees. This is why it is not the site's boot script: that one honours
          a stored decision for the site, and this document is not the site.
        */}
        <PreviewThemeScript />
      </head>
      {/*
        The body carries the ground the Demo draws on and nothing else. A preview
        drawn in a fallback face is a preview of a different system than the one the
        reader is reading about, and every measurement a Block makes, a measure and
        a line height, is face-dependent.

        The face itself comes from the stylesheet this document already imports,
        which is the library's: `--font-sans` is declared once, by the token
        package, and the `@font-face` rules that back it are the ones the
        component package ships. This document used to declare a second copy
        through `next/font/local` and set the property on `<body>` itself, so each
        previewed Item downloaded its own copy of a 723 KiB variable face and its
        italic in its own document, and a shipped face that was broken could not
        show here.

        The ground is on the body rather than on the Demo's wrapper because the
        ground is the whole document: a Block that fills its container and one that
        does not must both sit on the pack's own page colour, and a wrapper would
        leave the area past a short Demo showing the browser's default white
        instead of the pack.
      */}
      <body className="bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  )
}