'use client'

import { useState } from 'react'

import { Button } from '@nanisoft/prism-ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@nanisoft/prism-ui/components/card'
import { Lightbox } from '@nanisoft/prism-ui/components/lightbox'

/**
 * A plate with text on it, so the demo shows the reason this Item exists.
 *
 * The words are unreadable at the size a thumbnail is drawn and readable at full
 * size, which is the whole claim. A data URI keeps the Demo self contained: a
 * Demo is the documentation site's own content and a remote image would put a
 * third party in the middle of it, so a plate is drawn here as an SVG and
 * encoded in place. The fills are the image's own pixels rather than a
 * component's ink, which is the one place a value in this repository is not
 * also a token.
 */
function plate(title: string, rows: string[]) {
  const body = rows
    .map(
      (row, index) =>
        `<text x="48" y="${168 + index * 40}" font-family="ui-monospace, monospace" font-size="26" fill="#1e293b">${row}</text>`,
    )
    .join('')
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 460" width="900" height="460">` +
    `<rect width="900" height="460" fill="#f8fafc"/>` +
    `<rect width="900" height="104" fill="#e2e8f0"/>` +
    `<text x="48" y="66" font-family="ui-sans-serif, system-ui, sans-serif" font-size="34" font-weight="600" fill="#0f172a">${title}</text>` +
    body +
    `</svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

const PAGES = [
  {
    title: 'Pipeline run 4471',
    rows: [
      'intake ......... ok        0.42s',
      'queue .......... ok        1.87s',
      'isolate ........ ok       11.03s',
      'verify ......... ok        2.19s',
      'sign ........... ok        0.31s',
    ],
  },
  {
    title: 'Pipeline run 4472',
    rows: [
      'intake ......... ok        0.38s',
      'queue .......... ok        1.94s',
      'isolate ........ FAILED   30.01s',
      'verify ......... skipped        -',
      'sign ........... skipped        -',
    ],
  },
  {
    title: 'Pipeline run 4473',
    rows: [
      'intake ......... ok        0.44s',
      'queue .......... ok        1.71s',
      'isolate ........ ok       10.88s',
      'verify ......... ok        2.04s',
      'sign ........... ok        0.29s',
    ],
  },
]

const SHOTS = PAGES.map((page) => ({
  src: plate(page.title, page.rows),
  alt: `The console for ${page.title}, showing five stages and how long each took`,
}))

export default function LightboxDemo() {
  const [at, setAt] = useState(1)
  const [rail, setRail] = useState(false)
  const [single, setSingle] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle as="h3">Three screenshots, one of them failed</CardTitle>
          <CardDescription>
            Thumbnails on the page, and a dialog that shows one of them large
            enough to read. The text in these plates is genuinely unreadable at
            thumbnail size, which is the case this Item exists for.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-wrap gap-3">
            {SHOTS.map((shot, index) => (
              <li key={shot.src} className="w-40">
                <button
                  type="button"
                  onClick={() => {
                    setAt(index)
                    setRail(true)
                  }}
                  className="block w-full overflow-hidden rounded-md border outline-none transition-opacity duration-fast ease-out hover:opacity-80 focus-visible:ring-ring focus-visible:ring-[3px]"
                >
                  <img src={shot.src} alt={shot.alt} className="w-full" />
                </button>
              </li>
            ))}
          </ul>

          <Lightbox
            open={rail}
            onOpenChange={setRail}
            src={SHOTS[at]?.src ?? ''}
            alt={SHOTS[at]?.alt ?? ''}
            caption={`Run ${at + 1} of ${SHOTS.length}. The second run is the one the alert fired for.`}
            thumbnails={SHOTS}
            index={at}
            onIndexChange={setAt}
            zoomLabel="Image size"
            previousLabel="Show the previous run"
            nextLabel="Show the next run"
            closeLabel="Close the image"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle as="h3">One image, no rail</CardTitle>
          <CardDescription>
            With no <code className="font-mono">thumbnails</code> there is no rail
            and no previous or next control, so two of the four labels go unused.
            They are still required, because a required prop is a question asked at
            build time and the release that adds a rail should not be the release
            that discovers two missing names.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => setSingle(true)}>
            Open a single image
          </Button>

          <Lightbox
            open={single}
            onOpenChange={setSingle}
            src={SHOTS[0]?.src ?? ''}
            alt={SHOTS[0]?.alt ?? ''}
            zoomLabel="Image size"
            previousLabel="Show the previous image"
            nextLabel="Show the next image"
            closeLabel="Close the image"
          />
        </CardContent>
      </Card>

      <p className="text-muted-foreground text-sm">
        Try it with the keyboard. Tab reaches the controls in order, Enter and
        Space press them, Escape closes, and focus returns to the thumbnail you
        opened from. The dialog is the one already in this package rather than an
        overlay built here, which is the only reason that list is complete.
      </p>
    </div>
  )
}
