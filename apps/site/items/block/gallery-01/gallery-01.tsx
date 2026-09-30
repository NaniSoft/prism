'use client'

import { Gallery01, type Gallery01Item } from '@nanisoft/prism-ui/blocks/gallery-01'

/**
 * A plate with real text on it, so the Demo shows the reason this Item exists.
 *
 * The words are unreadable at the size a tile is drawn and readable at full size.
 * A data URI keeps the Demo self contained: a Demo is the documentation site's own
 * content and a remote image would put a third party in the middle of it, so the
 * plate is drawn here as an SVG and encoded in place. The fills are the image's own
 * pixels rather than a component's ink, which is the one place a value in this
 * repository is not also a token.
 */
function plate(title: string, rows: string[]) {
  const body = rows
    .map(
      (row, index) =>
        `<text x="48" y="${196 + index * 46}" font-family="ui-monospace, monospace" font-size="28" fill="#1e293b">${row}</text>`,
    )
    .join('')
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 540" width="900" height="540">` +
    `<rect width="900" height="540" fill="#f8fafc"/>` +
    `<rect width="900" height="132" fill="#e2e8f0"/>` +
    `<text x="48" y="86" font-family="ui-sans-serif, system-ui, sans-serif" font-size="36" font-weight="600" fill="#0f172a">${title}</text>` +
    body +
    `</svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

const ITEMS: Gallery01Item[] = [
  {
    id: 'glassworks-week-14',
    src: plate('Glassworks, week 14', [
      'mould 3 ....... 41 shots   ok',
      'mould 7 ....... 38 shots   ok',
      'anneal ........ drift 4C   WARN',
      'reject ......... 2.1%       ok',
      'shift lead ..... 06:40 handover',
    ]),
    alt: 'A weekly plate for the glassworks: four moulds, an annealing drift warning, a reject rate and a handover time',
    caption: 'A string caption, so these words are in the tile accessible name as well as under it.',
  },
  {
    id: 'cannery-day-3',
    src: plate('Cannery, day 3', [
      'chill 1 ........ 3.1C        ok',
      'chill 2 ........ 4.8C        ok',
      'chill 3 ........ 7.2C        FAIL',
      'hold ........... 01:14       ok',
      'dispatch ....... 2 pallets',
    ]),
    alt: 'A daily plate for the cannery: three chillers, one failing, a hold and two dispatched pallets',
    caption: 'A second string caption, and no link on the tile.',
  },
  {
    id: 'textile-handover',
    src: plate('Textile, handover', [
      'line 1 ......... 2.4m/min    ok',
      'line 2 ......... stalled 6m  WARN',
      'line 3 ......... 2.1m/min    ok',
      'spindle 4 ...... vibration   WARN',
      'weft ........... 78 count',
    ]),
    alt: 'A handover plate for the textile mill: three lines, one stalled, a spindle warning and a weft count',
  },
]

/** The four control names, which are the caller's on every gallery in this system. */
const LABELS = {
  zoom: 'Image size',
  previous: 'Show the previous figure',
  next: 'Show the next figure',
  close: 'Close the figure',
}

/** Three plates, three captions of two states, and a set large enough for a count. */
export default function Gallery01Demo() {
  return (
    <Gallery01
      headingLevel="h3"
      eyebrow="Preview"
      title="What the floor looks like"
      description="Three plates. The text on them is genuinely unreadable at the size a tile is drawn, which is the case the enlarged image exists for. The third tile has no caption, so its name is the alt alone."
      columns={3}
      ratio="landscape"
      items={ITEMS}
      labels={LABELS}
    />
  )
}
