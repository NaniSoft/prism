'use client'

import { useState } from 'react'

import {
  FileUpload,
  type FileUploadFile,
} from '@nanisoft/prism-ui/components/file-upload'

const STARTED: FileUploadFile[] = [
  { id: 'a-1', name: 'q3-close-draft.pdf', size: 412_672, progress: 38 },
  { id: 'a-2', name: 'ledger-export.csv', size: 1_572_864, progress: 100 },
  { id: 'a-3', name: 'signed-deed.pdf', size: 2_411_724, error: 'Larger than 2 MB. Send a link instead.' },
  { id: 'a-4', name: 'cover.png', size: 84_233 },
]

/**
 * A list with a transfer running, a transfer finished, a file refused and a
 * file that was never going anywhere, beside a list that has nothing in it.
 */
export default function FileUploadDemo() {
  const [files, setFiles] = useState<FileUploadFile[]>(STARTED)

  return (
    <div className="flex max-w-measure flex-col gap-8">
      <div className="flex flex-col gap-3">
        <FileUpload
          label="Attachments"
          files={files}
          onRemove={(id) => setFiles((current) => current.filter((file) => file.id !== id))}
          removeLabel={(name) => `Remove ${name}`}
        />
        <p className="text-muted-foreground text-sm">
          Sizes are bytes in and a sentence out, so the unit, the rounding and the
          grouping separators come from the locale of the reader rather than from the
          formatting of the caller. The refusal is one line of text beside the row it
          belongs to, not a card inside the row.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-muted-foreground text-sm">
          The same list with nothing in it. A read-only list of files that have
          been sent is a receipt, and a receipt offers to take nothing off it.
        </p>
        <FileUpload label="Sent with this message" files={[]} empty="Nothing attached." />
      </div>
    </div>
  )
}
