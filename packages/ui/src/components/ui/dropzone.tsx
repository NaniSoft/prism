'use client'

import { UploadIcon, type LucideIcon } from 'lucide-react'
import {
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type ReactNode,
} from 'react'

import { cn } from '../../lib/utils'

/** The props the Dropzone accepts. */
export interface DropzoneProps {
  /**
   * Called with the files the reader chose or dropped.
   *
   * Required, and it takes the files rather than a count or a promise: what
   * happens to them next is the caller's, and this Component never uploads,
   * reads or stores a byte. The list is a fresh array, so a caller may keep it,
   * sort it or clear it without going back to the input.
   */
  onFiles: (files: File[]) => void
  /**
   * The file types the platform's own picker offers, as the HTML `accept`
   * attribute's value.
   *
   * A hint, and only to the picker: the browser applies it to the dialog it
   * opens and to nothing else, so files dragged onto this target arrive whatever
   * they are. A caller that needs a type check does it in `onFiles`, where the
   * caller's own rules are, rather than here.
   */
  accept?: string
  /**
   * Whether the reader may hand over more than one file at a time.
   *
   * Defaults to true, because a target that silently keeps the first of four
   * dropped files is a worse surprise than one that hands over all four and lets
   * the caller take one. @defaultValue true
   */
  multiple?: boolean
  /**
   * Whether the target refuses files.
   *
   * Drawn rather than set: the control keeps its focus ring and its place in the
   * tab order, and announces itself as unavailable. See the note on the
   * Component below for why.
   */
  disabled?: boolean
  /**
   * The instruction the reader sees on the target.
   *
   * Required, and required as this Component's own visible text rather than as a
   * default it falls back to. The words are a claim about the reader's task in
   * the reader's language, and a target that says "Drop files here" in a product
   * whose interface is in another language is a sentence this package wrote on
   * somebody's behalf.
   */
  label: ReactNode
  /**
   * A second line under the instruction, for the part of the sentence the label
   * has no room for.
   *
   * What the reader may do is a `label`; what happens to the file afterwards is
   * a `description`, and putting both in one string is how a target ends up
   * reading as a paragraph in the middle of a form.
   */
  description?: ReactNode
  /**
   * The mark above the instruction.
   *
   * Defaults to an upward arrow into a tray, which is a drawing of a gesture and
   * not a word, so the one picture this Component does ship says nothing in any
   * language. Pass any Lucide icon to replace it.
   */
  icon?: LucideIcon
  /**
   * The accepted types line, under everything else.
   *
   * A node, because the useful half of it is the caller's: "PDF or PNG, up to
   * 10 MB" is a claim about the caller's product and its limits, and
   * "3 files maximum" is a claim about a rule only the caller has. Prism draws the
   * line and reads no file type of its own.
   */
  hint?: ReactNode
  /** Layout only. */
  className?: string
}

/** `dataTransfer.types` has spelled this one in both cases over the years. */
const CARRIES_FILES = 'files'

/**
 * Whether a drag has files on it at all.
 *
 * Without this the target lights up for a dragged link, a dragged image out of
 * another application and a dragged run of selected text, and each of those is a
 * promise the drop will not keep. The comparison is case-folded because the HTML
 * specification and the engines that shipped against it disagreed on the casing
 * for years, and a target that ignores a real file drag over a difference of
 * case is the worse of the two failures.
 */
const carriesFiles = (event: DragEvent<HTMLButtonElement>): boolean =>
  Array.from(event.dataTransfer.types).some((type) => type.toLowerCase() === CARRIES_FILES)

/**
 * A target the reader drops files onto, which is also a button that opens the
 * platform's file picker.
 *
 * **It is a `<button>`, and not a `<div>` with handlers on it.** A div is not
 * reachable by keyboard, cannot be pressed with Enter or Space, and has no
 * accessible name until one is invented for it out of `aria-label` and no
 * border to draw a focus ring on. The result is a control that looks usable,
 * works with a mouse, and is invisible to the reader the gate on focus
 * indicators exists for. That gate is not a formality here: it is the gate that
 * says an element which claims to be operable has to draw its own indicator, and
 * a claim of operability that is not real is exactly what it is looking for. A
 * dropzone built on a div also cannot be a form control, so it cannot take a
 * name, cannot be submitted and cannot be reached by a reader who never moves a
 * mouse at all.
 *
 * **The visible label is the caller's, and there is no default.** A drop target
 * that says "Drop files here" in a consumer's product is a claim in a language
 * the consumer did not choose, in the one place on the page where a reader is
 * about to act, and it is the sentence a translation tool is least likely to
 * catch because it is inside a design system rather than inside a product's copy.
 * The mark is the one thing this Component draws, and it is a drawing of a
 * gesture, so it says nothing in any language.
 *
 * **Disabled means `aria-disabled`, and the control stays in the tab order.** A
 * removed focus target is a keyboard reader's dead end: the reader tabs onto it,
 * presses Enter or Space, and nothing at all happens, with no announcement to say
 * why. They cannot tell the control is unavailable, they cannot find out what
 * would make it available, and there is nothing on the page pointing at the
 * thing that does. So the control keeps its ring and its place in the order, is
 * marked `aria-disabled` so it announces itself as unavailable, is dimmed so the
 * state is visible as well as spoken, and refuses both the click and the drop
 * without ever being removed. The cost is one tab stop that does nothing, which
 * is the same price every disabled control in every system pays and the reason
 * disabled controls are written rather than omitted.
 *
 * **A drop is refused by not calling `preventDefault` on the dragover, and not
 * by swallowing the drop afterwards.** The platform offers a drop only where a
 * dragover handler prevents the default, so a disabled target that skipped that
 * one call would still show the platform's own no-drop cursor over itself while
 * quietly discarding the files. A target that refuses has to refuse in the place
 * the cursor is decided.
 *
 * **The drag state is counted, not toggled.** A drag enters and leaves every
 * child it crosses, so a boolean that follows the events flickers as the pointer
 * moves over the mark and the instruction. A depth counter is four lines and it
 * is the difference between a target that lights up once and one that strobes.
 *
 * **The input is cleared after every pick.** Browsers do not fire a change event
 * for a file that is already selected, so a reader who picks the same file twice
 * in a row would get one call to `onFiles` and no way to ask again. Setting the
 * value back to empty after reading it is what makes the second pick an event.
 *
 * **The only motion is the drag-over colour.** It is a state feedback, it is the
 * one moment the target has something new to say, and under reduced motion it
 * arrives instantly rather than never, because the reduced-motion rule at the foot
 * of `packages/ui/src/styles.css` stops every transition rather than sparing the
 * ones that are not movement. A dropzone that faded, grew or drew an arrow
 * travelling into itself would be performing, and a target that performs is a
 * target a reader waits to finish before they know whether their file was
 * accepted.
 *
 * It needs the client directive for the drag state, for the click that opens the
 * picker and for the ref that reaches the input. None of the three can be known
 * at a server render.
 */
function Dropzone({
  onFiles,
  accept,
  multiple = true,
  disabled = false,
  label,
  description,
  icon: Mark = UploadIcon,
  hint,
  className,
}: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  // The number of drag events currently inside the target. A leave event fires
  // for every child the pointer leaves as well as for the target itself, so the
  // depth rather than a boolean is what says whether the pointer is still over it.
  const depth = useRef(0)
  const [over, setOver] = useState(false)

  const take = (list: FileList | null) => {
    if (list === null) return
    const files = Array.from(list)
    if (files.length === 0) return
    onFiles(multiple ? files : files.slice(0, 1))
  }

  const onPick = (event: ChangeEvent<HTMLInputElement>) => {
    take(event.target.files)
    event.target.value = ''
  }

  const onActivate = () => {
    if (disabled) return
    inputRef.current?.click()
  }

  const onDragEnter = (event: DragEvent<HTMLButtonElement>) => {
    if (disabled || !carriesFiles(event)) return
    event.preventDefault()
    depth.current += 1
    setOver(true)
  }

  const onDragOver = (event: DragEvent<HTMLButtonElement>) => {
    // The one handler that decides whether a drop is offered at all. Leaving the
    // default unprevented here is what makes a disabled target refuse the drop
    // rather than accept it and throw it away.
    if (disabled || !carriesFiles(event)) return
    event.preventDefault()
    setOver(true)
  }

  const onDragLeave = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault()
    depth.current = Math.max(0, depth.current - 1)
    if (depth.current === 0) setOver(false)
  }

  const onDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault()
    depth.current = 0
    setOver(false)
    if (disabled) return
    take(event.dataTransfer.files)
  }

  return (
    <div data-slot="dropzone" className={cn('relative flex w-full flex-col', className)}>
      {/*
        * Sibling of the button rather than a child of it. A file input is a
        * control, and a control inside a button is a control inside a control:
        * the click that reaches the picker is the click that presses the button,
        * the button is announced with the input's contents, and pressing Enter
        * in the picker can activate the target behind it.
        */}
      <input
        ref={inputRef}
        type="file"
        data-slot="dropzone-input"
        className="sr-only"
        tabIndex={-1}
        multiple={multiple}
        {...(accept === undefined ? null : { accept })}
        onChange={onPick}
      />

      <button
        type="button"
        data-slot="dropzone-target"
        data-dragging={over || undefined}
        aria-disabled={disabled || undefined}
        onClick={onActivate}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={cn(
          'border-input bg-background text-foreground flex w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed px-6 py-8 text-center outline-none',
          'transition-colors duration-fast',
          'focus-visible:border-ring focus-visible:ring-ring focus-visible:ring-[3px]',
          'aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
          over && 'border-primary bg-accent text-accent-foreground',
        )}
      >
        <Mark className="text-muted-foreground size-6" aria-hidden="true" />
        <span data-slot="dropzone-label" className="text-sm font-medium">
          {label}
        </span>
        {description === undefined ? null : (
          <span data-slot="dropzone-description" className="text-muted-foreground text-sm">
            {description}
          </span>
        )}
        {hint === undefined ? null : (
          <span data-slot="dropzone-hint" className="text-muted-foreground text-xs">
            {hint}
          </span>
        )}
      </button>
    </div>
  )
}

export { Dropzone }
