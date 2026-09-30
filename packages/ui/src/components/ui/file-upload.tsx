import { XIcon } from 'lucide-react'
import { useId, type ReactNode } from 'react'

import { FieldError } from './field'
import { Progress } from './progress'
import { cn } from '../../lib/utils'

/** One file the reader has chosen, and everything the list knows about it. */
export type FileUploadFile = {
  /**
   * The caller's own identity for the file, and what the remove control reports.
   *
   * Required, and required as a string rather than as the name: a reader who adds
   * the same file twice has two rows with the same name, and a remove control
   * named by the file would announce two identical buttons.
   */
  id: string
  /** The file's name as the platform reported it. A word, so it is not truncated. */
  name: string
  /**
   * The file's size, in bytes.
   *
   * A number and not a formatted string, and the difference is the whole
   * interface. A caller that hands over "1.2 MB" has done the division, picked a
   * unit, decided the rounding and written a separator, and has to do all four
   * again in every locale the product ships in, and again in every language. The
   * number is a fact about the file and the sentence is Prism's to write.
   */
  size: number
  /**
   * How far this file has got, out of a hundred.
   *
   * Omit it and the row shows no meter, which is right for a file that has
   * finished and for a file that was never going to be uploaded. A value of zero
   * is drawn as an empty meter rather than as nothing, because a transfer that
   * has not started and a transfer that does not exist are different facts.
   */
  progress?: number
  /**
   * What went wrong with this file, drawn under it in the destructive token and
   * announced as it appears.
   *
   * A node, and a sentence about the caller's own limits: "Larger than 10 MB",
   * "That file type is not accepted here". Prism does not decide what may be
   * uploaded and does not write the sentence when it goes wrong.
   */
  error?: ReactNode
}

/** The props the File upload accepts. */
export interface FileUploadProps {
  /**
   * The files, in the order they were chosen.
   *
   * Required, and order is the caller's because it is a claim about importance.
   * A reader who chose three files expects to see three rows in the order they
   * arrived, not sorted by size.
   */
  files: FileUploadFile[]
  /**
   * Called with a file's `id` when the reader removes it.
   *
   * Omit it and the list is read-only, which is a legitimate state: a receipt
   * names the files that were sent, and offering to take one off a receipt is a
   * promise the caller cannot keep. A caller whose files are still uploading
   * should omit it too, because this Component cannot see the transfer and will
   * not try to stop one.
   */
  onRemove?: (id: string) => void
  /**
   * The accessible name of one row's remove control, given that row's file name.
   *
   * Required whenever `onRemove` is given, and a function because the name has to
   * name the file and the file's name is the caller's string, not this package's
   * sentence. The Component throws without it rather than drawing a button it
   * cannot name, because a nameless button is announced as "button" and the
   * reader is left to work out which of the rows it belongs to.
   */
  removeLabel?: (name: string) => string
  /**
   * The list's own name, drawn above it and used as its accessible name.
   *
   * A node and not a string, so the element a sighted reader reads is the one a
   * screen reader names the list by. Without it the list is announced as an
   * unlabelled list and the reader is told nothing about what the files are.
   */
  label?: ReactNode
  /**
   * What to draw when no file has been chosen.
   *
   * An empty list with no `empty` renders nothing at all, which is the choice
   * `FactList` makes and the reason is the same: a bordered box with a heading
   * above it and nothing in it reads as a rendering failure rather than as an
   * absence. Never a placeholder row. A row with no file in it is a row a reader
   * tries to remove, and a row whose progress meter is at zero is a transfer that
   * is happening.
   */
  empty?: ReactNode
  /**
   * Renders a size in bytes as the sentence a reader sees.
   *
   * The default divides by 1024, steps up to kilobytes and then to megabytes,
   * and asks `Intl` for the number and its unit in the runtime's own locale, so
   * the grouping separators and the unit spelling are the reader's. A caller that
   * needs a fixed locale, a different base or a fourth rung passes a function
   * that closes over the locale it wants.
   */
  formatSize?: (bytes: number) => string
  /** Layout only. */
  className?: string
}

const KILOBYTE = 1024
const MEGABYTE = KILOBYTE * 1024

/**
 * The default size sentence, in the runtime's locale.
 *
 * `Intl` is asked for the unit rather than for the abbreviation, because a unit
 * has a localized spelling and an abbreviation does not: "kB" in one language is
 * "Ko" in another and "KB" in a third, and hard-coding any of them ships one
 * locale's abbreviation into every consumer's file list. The byte rung is first
 * so that a four hundred byte file reads as four hundred bytes rather than as
 * 0.4 of something, which is a number that looks like a measurement and is not
 * one.
 */
const defaultFormatSize = (bytes: number): string => {
  const format = (unit: 'byte' | 'kilobyte' | 'megabyte', divisor: number) =>
    new Intl.NumberFormat(undefined, {
      style: 'unit',
      unit,
      maximumFractionDigits: divisor === 1 ? 0 : 1,
    }).format(bytes / divisor)

  if (bytes < KILOBYTE) return format('byte', 1)
  if (bytes < MEGABYTE) return format('kilobyte', KILOBYTE)
  return format('megabyte', MEGABYTE)
}

/**
 * The remove control, drawn once and used by every row.
 *
 * The ink is the muted one and it is not themed per row, because every row is
 * the same surface and a control that changed colour with the file's state would
 * be a second thing to read. The target takes the 44px floor on a coarse pointer
 * and the row grows to hold it, so a list of files on a phone is a list of rows
 * a thumb can hit.
 */
const REMOVE_CONTROL =
  'text-muted-foreground hover:text-foreground inline-flex size-5 shrink-0 items-center justify-center rounded-sm outline-none transition-colors duration-fast ease-out pointer-coarse:size-11 focus-visible:ring-ring focus-visible:ring-[3px]'

/**
 * The list of files a reader has chosen, one row each.
 *
 * **A size is a number of bytes and never a formatted string.** That is the
 * decision the whole interface rests on. A caller that formats the size itself
 * has to reimplement the division, the unit ladder, the rounding at each rung and
 * the grouping separator, and has to do it again for every locale the product
 * ships in, and again the first time somebody asks for gigabytes. Prism owns one
 * ladder and asks `Intl` for the sentence, so a locale change is a locale change
 * and not an audit. The cost is that a caller who genuinely wants a different
 * ladder writes a function, which is the right place for that decision.
 *
 * **The meter is `Progress` and the failure is `FieldError`, and they were not
 * chosen together.** A bar that reports a position is a bar: `Progress` already
 * exposes the value, the minimum and the maximum through ARIA, already draws at
 * the authored heights and already animates the fill on the base duration, and a
 * second meter written here would be a second answer to how far along a task is.
 * The failure is the opposite case and deliberately is not an `Alert`. An Alert
 * is a callout with its own border, its own padding and its own role, and one
 * inside a bordered row is a card inside a card: it changes the height of the row
 * that failed, it moves the remove control, and it announces a page-level problem
 * for a problem with one file. `FieldError` is one line of destructive text with
 * `role="alert"`, which is what a per-file failure is. The trade is that a reader
 * gets no recovery beside the error, and the remedy for that is on the Dropzone
 * beside the field, where the caller's own limits are stated.
 *
 * **The name is a word and the size is a number, and they are laid out that way
 * on purpose.** The name takes what it needs and the size keeps its own width at
 * the far edge, so a column of files reads as a column of names with a column of
 * weights rather than as a ragged paragraph. The name truncates in the middle
 * rather than at the end because a file extension is the part a reader recognises
 * last, and a name cut before its extension is a name that could be anything.
 *
 * **An empty list renders `empty` or nothing, and never a placeholder row.** A
 * row with no file in it is a row a reader will try to remove, and a row whose
 * meter sits at zero is a transfer that is under way. The absence is either the
 * caller's own sentence or no rows at all, which is what `FactList` does and for
 * the same reason.
 *
 * It carries no directive. It holds no state: which files exist, how far each has
 * got and which one is being removed are the caller's, and the meter it draws is
 * a client Component that takes a number. A caller rendering a receipt from a
 * server component gets a static list of what was sent, which is the right
 * rendering of a receipt.
 */
function FileUpload({
  files,
  onRemove,
  removeLabel,
  label,
  empty,
  formatSize = defaultFormatSize,
  className,
}: FileUploadProps) {
  const generated = useId()
  const labelId = `${generated}-label`

  if (onRemove !== undefined && removeLabel === undefined) {
    throw new Error(
      'FileUpload: a removable list needs removeLabel, because the accessible name of a remove control has ' +
        'to name the file it removes and this Component cannot write that sentence. Pass a function of ' +
        'the file name, or drop onRemove for a list the reader cannot change.',
    )
  }

  if (files.length === 0 && empty === undefined) return null

  return (
    <div data-slot="file-upload" className={cn('flex w-full flex-col gap-1', className)}>
      {label === undefined ? null : (
        <span
          id={labelId}
          data-slot="file-upload-label"
          className="text-muted-foreground text-xs font-medium tracking-wide uppercase"
        >
          {label}
        </span>
      )}

      {files.length === 0 ? (
        <p data-slot="file-upload-empty" className="text-muted-foreground text-sm">
          {empty}
        </p>
      ) : (
        <ul
          data-slot="file-upload-list"
          aria-labelledby={label === undefined ? undefined : labelId}
          className="flex w-full flex-col"
        >
          {files.map((file) => (
            <li
              key={file.id}
              data-slot="file-upload-file"
              data-incomplete={
                (file.error !== undefined ||
                  (file.progress !== undefined && file.progress < 100)) ||
                undefined
              }
              className="border-border flex items-start gap-3 border-b py-2 last:border-b-0"
            >
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-3">
                  <span data-slot="file-upload-name" className="min-w-0 truncate text-sm font-medium">
                    {file.name}
                  </span>
                  <span
                    data-slot="file-upload-size"
                    className="text-muted-foreground shrink-0 text-xs tabular-nums"
                  >
                    {formatSize(file.size)}
                  </span>
                </div>

                {file.progress === undefined ? null : (
                  <Progress value={file.progress} max={100} />
                )}

                {file.error === undefined ? null : <FieldError>{file.error}</FieldError>}
              </div>

              {onRemove === undefined ? null : (
                <button
                  type="button"
                  data-slot="file-upload-remove"
                  aria-label={removeLabel?.(file.name)}
                  onClick={() => onRemove(file.id)}
                  className={REMOVE_CONTROL}
                >
                  <XIcon className="size-4" aria-hidden="true" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export { FileUpload }
