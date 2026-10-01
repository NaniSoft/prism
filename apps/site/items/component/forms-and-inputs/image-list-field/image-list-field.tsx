'use client'

import { FileImageIcon } from 'lucide-react'
import { useRef, useState, type ChangeEvent } from 'react'

import { ImageListField, type ImageListFieldImage } from '@nanisoft/prism-ui/components/image-list-field'

const CAP = 3

/**
 * A capped list of image references, and a second one already at its cap.
 *
 * The picker is a hidden `input` this Demo owns, which is the seam
 * `ImageListField` opens with `onAdd`. A product that wants a drop target as well
 * as a button composes a `Dropzone` beside the field and calls the same `onAdd`;
 * Prism does not draw one, because what an image is on a caller's side is a fact
 * this package cannot know.
 *
 * The previews are the point of the first instance. They are the Demo's own marks,
 * one a glyph and one a plain fill, because `preview` is a slot: an image field
 * that drew its own thumbnail would be drawing a transport, and every stored image
 * behind an authenticated route would arrive as a broken picture.
 */
export default function ImageListFieldDemo() {
  const picker = useRef<HTMLInputElement>(null)
  const [images, setImages] = useState<ImageListFieldImage[]>([])
  const [capped, setCapped] = useState<ImageListFieldImage[]>([
    { id: 'a', name: 'north-elevation.png', preview: <FileImageIcon className="text-muted-foreground size-6" /> },
    {
      id: 'b',
      name: 'north-elevation-detail.png',
      preview: <div className="bg-accent size-full" />,
    },
  ])

  const take = (event: ChangeEvent<HTMLInputElement>) => {
    const chosen = Array.from(event.target.files ?? [])
    event.target.value = ''
    if (chosen.length === 0) return
    setImages((current) => [
      ...current,
      ...chosen
        .filter((file) => current.every((image) => image.id !== `${file.name}-${file.size}`))
        .map((file) => ({
          id: `${file.name}-${file.size}`,
          name: file.name,
          preview: <FileImageIcon className="text-muted-foreground size-6" />,
        })),
    ])
  }

  const remove = (id: string) => setImages((current) => current.filter((image) => image.id !== id))

  return (
    <div className="flex max-w-measure flex-col gap-8">
      <input
        ref={picker}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        tabIndex={-1}
        onChange={take}
      />

      <ImageListField
        label="Photographs"
        images={images}
        cap={CAP}
        addLabel="Add photograph"
        onAdd={() => picker.current?.click()}
        onRemove={remove}
        removeLabel={(name) => `Remove ${name}`}
        empty="No photographs yet. A listing shows up to three."
        capLabel="Three is the most a listing takes. Remove one to swap it."
        className="max-w-sm"
      />

      <ImageListField
        label="Already at the cap"
        images={capped}
        cap={2}
        addLabel="Add photograph"
        onAdd={() => undefined}
        onRemove={(id) => setCapped((current) => current.filter((image) => image.id !== id))}
        removeLabel={(name) => `Remove ${name}`}
        empty="No photographs yet."
        capLabel="Two is the most this variant takes."
        className="max-w-sm"
      />

      <p className="text-muted-foreground text-sm">
        Remove the first photograph of the second list and watch where the focus
        goes: it moves to the row that took its place rather than back to the top
        of the page, and when the last row goes it lands on the add control, which
        is then the only thing in the field a reader can press.
      </p>
    </div>
  )
}
