import { ImageIcon } from 'lucide-react'

import { MediaBand01 } from '@nanisoft/prism-ui/blocks/media-band-01'

/**
 * The band with a placeholder in the media slot.
 *
 * The slot is the point: a marketing band's picture is the consumer's asset, and
 * the demo shows the frame the Block owns rather than a photograph this package
 * would have to license. A real caller passes an image, a video poster or a
 * composed figure, and the frame holds it at the ratio the caller chose.
 */
export default function MediaBand01Demo() {
  return (
    <MediaBand01
      headingLevel="h3"
      eyebrow="Preview"
      size="default"
      title="A photograph, a statement and one way forward"
      description="The copy is first in the document and the media is first only in the visual order the caller asks for. The frame holds a wide, square or portrait crop, and the copy never sits on the picture."
      media={
        <div className="bg-accent text-accent-foreground flex h-full w-full flex-col items-center justify-center gap-3">
          <ImageIcon className="size-8" aria-hidden />
          <span className="font-mono text-xs">media slot</span>
        </div>
      }
      caption="A placeholder in the slot. The caller supplies the image and its accessible name."
      action={{ label: 'Read the story', href: '#' }}
    />
  )
}
