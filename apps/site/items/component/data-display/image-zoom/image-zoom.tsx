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
import { ImageZoom } from '@nanisoft/prism-ui/components/image-zoom'
import { Lightbox } from '@nanisoft/prism-ui/components/lightbox'

/**
 * A plate of small text, so the Demo shows the reason this Item exists.
 *
 * The words are unreadable at the width the frame draws them and readable the
 * moment the reader magnifies, which is the whole claim. A data URI keeps the
 * Demo self contained: a Demo is the documentation site's own content, so a
 * remote image would put a third party in the middle of it. The fills are the
 * image's own pixels rather than a Component's ink, which is the one place a
 * value in this repository is not also a token.
 */
function plate(title: string, rows: readonly string[]) {
  const body = rows
    .map(
      (row, index) =>
        `<text x="56" y="${196 + index * 44}" font-family="ui-monospace, monospace" font-size="30" fill="#1e293b">${row}</text>`,
    )
    .join('')
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1160 460" width="1160" height="460">` +
    `<rect width="1160" height="460" fill="#f8fafc"/>` +
    `<rect width="1160" height="132" fill="#e2e8f0"/>` +
    `<text x="56" y="82" font-family="ui-sans-serif, system-ui, sans-serif" font-size="38" font-weight="600" fill="#0f172a">${title}</text>` +
    body +
    `</svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

const ALT =
  'A collector reading from four sources, with the webhook source marked as retrying'

const PLATE = plate('Collector topology, west region', [
  'collector       1 instance       reading',
  '  events-api .. 4.2k msg/min    ok',
  '  billing-hooks  820 msg/min     ok',
  '  audit-log .... 1.1k msg/min    ok',
  '  webhooks .....   96 msg/min    retrying',
])

/**
 * The magnifier where the page already is, and the two ends of its one slot.
 *
 * The first figure is the default arrangement: the required names, the default
 * range, and nothing else beside the three controls. The `controls` slot holds
 * the handoff the Component's own documentation names, a button that opens a
 * `Lightbox` on the same plate, because a reader who wants the whole page and a
 * reader who wants this figure larger are two different requests.
 *
 * The second figure is a narrow range with a sentence-form `scale` and an
 * `onScaleChange`, and the line under it is the point: the number arrives as a
 * notification and nothing in the Demo controls the figure. The magnification is
 * held where the reader left it and is never lifted, so that line is a readout
 * rather than an input, and a reload of the page puts the image back at its
 * fitted size because the reader never decided to change that.
 */
export default function ImageZoomDemo() {
  const [open, setOpen] = useState(false)
  const [percent, setPercent] = useState(100)

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle as="h3">A diagram the page already shows</CardTitle>
          <CardDescription>
            The text in this plate is genuinely unreadable at the width the frame
            draws it, which is the case this Item exists for. Magnifying it does not
            move the page, does not trap focus, and does not take the Escape key, so
            the paragraph above and the paragraph below are still where the reader
            left them.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <ImageZoom
            src={PLATE}
            alt={ALT}
            label="Collector topology, west region"
            scale={(value) => `${value} percent`}
            zoomInLabel="Magnify the diagram"
            zoomOutLabel="Reduce the diagram"
            resetLabel="Fit the diagram to its frame"
            controls={
              <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
                Show the whole page
              </Button>
            }
          />

          <Lightbox
            open={open}
            onOpenChange={setOpen}
            src={PLATE}
            alt={ALT}
            caption="The same plate in a dialog, which is the other half of the decision."
            zoomLabel="Image size"
            previousLabel="Show the previous image"
            nextLabel="Show the next image"
            closeLabel="Close the image"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle as="h3">A narrow range, and a number that is only told</CardTitle>
          <CardDescription>
            Four quarter steps to twice the fitted size, a sentence rather than a bare
            number in the live region, and a fit control that appears only once the
            reader has magnified. Count the controls before and after a press: there
            are two at the fitted size and three above it.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <ImageZoom
            src={PLATE}
            alt={ALT}
            label="The same plate at a narrow range"
            scale={(value) => (value === 100 ? 'Fitted to the frame' : `${value} percent`)}
            minScale={1}
            maxScale={2}
            step={0.25}
            zoomInLabel="Magnify the plate"
            zoomOutLabel="Reduce the plate"
            resetLabel="Fit the plate to its frame"
            onScaleChange={(value) => setPercent(Math.round(value * 100))}
          />

          <p className="text-muted-foreground text-sm">
            The last magnification was {percent} percent. That line reads the
            notification and controls nothing: the figure above still holds its own
            magnification, so a reader who leaves the page and comes back finds the
            image as they left it rather than as they found it.
          </p>
        </CardContent>
      </Card>

      <p className="text-muted-foreground text-sm">
        Try it with the keyboard. Tab reaches the controls in order, Enter and Space
        press them, and the arrow keys, Home and End pan the frame once the image is
        larger than it is. Magnify to the ceiling and focus moves to the control that
        still works, because a disabled button leaves the tab order without giving
        up focus and a reader stranded on one has nothing under their fingers.
      </p>
    </div>
  )
}
