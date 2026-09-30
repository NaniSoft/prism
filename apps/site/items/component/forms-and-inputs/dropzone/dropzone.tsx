'use client'

import { useState } from 'react'

import { Dropzone } from '@nanisoft/prism-ui/components/dropzone'
import { FileUpload, type FileUploadFile } from '@nanisoft/prism-ui/components/file-upload'

const LIMIT = 10 * 1024 * 1024

/**
 * A target the reader can use with a mouse, with a keyboard or by dropping onto
 * it, with the list of what came in beside it, and one target that refuses.
 */
export default function DropzoneDemo() {
  const [files, setFiles] = useState<FileUploadFile[]>([])
  const [tooLarge, setTooLarge] = useState<FileUploadFile[]>([])

  const add = (incoming: File[]) => {
    const accepted: FileUploadFile[] = []
    const refused: FileUploadFile[] = []

    for (const file of incoming) {
      const row: FileUploadFile = {
        id: `${file.name}-${file.size}`,
        name: file.name,
        size: file.size,
      }
      if (file.size > LIMIT) {
        refused.push({ ...row, error: 'Larger than 10 MB.' })
      } else {
        accepted.push({ ...row, progress: 0 })
      }
    }

    setFiles(accepted)
    setTooLarge(refused)
  }

  return (
    <div className="flex max-w-measure flex-col gap-8">
      <div className="flex flex-col gap-4">
        <Dropzone
          label="Drop a file here, or choose one"
          description="One file per upload. It is checked before anything is sent."
          hint="Accepted: PDF, PNG, CSV."
          accept=".pdf,.png,.csv"
          onFiles={add}
        />

        <FileUpload
          label="Chosen"
          files={files}
          onRemove={(id) => setFiles((current) => current.filter((file) => file.id !== id))}
          removeLabel={(name) => `Remove ${name}`}
          empty="Nothing chosen yet."
        />
      </div>

      {tooLarge.length > 0 ? (
        <FileUpload label="Refused" files={tooLarge} />
      ) : null}

      <div className="flex flex-col gap-4">
        <Dropzone
          label="Drop a file here, or choose one"
          description="Attachments are closed while the record is being signed."
          hint="Accepted: PDF."
          accept=".pdf"
          disabled
          onFiles={add}
        />
        <p className="text-muted-foreground text-sm">
          Disabled. The control keeps its place in the tab order and announces
          itself as unavailable, so a keyboard reader learns that something is
          closed rather than finding a gap where a control used to be.
        </p>
      </div>
    </div>
  )
}
