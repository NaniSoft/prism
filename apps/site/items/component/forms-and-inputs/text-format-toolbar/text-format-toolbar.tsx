'use client'

import { BoldIcon, ItalicIcon, RotateCcwIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Field, FieldLabel } from '@nanisoft/prism-ui/components/field'
import { Textarea } from '@nanisoft/prism-ui/components/textarea'
import { TextFormatToolbar } from '@nanisoft/prism-ui/components/text-format-toolbar'

/**
 * A source editor with a formatting row over it, and every decision the Component
 * leaves to its caller made here where a reader can see it.
 *
 * The editor is a plain `Textarea` and the formatting is fence markers, which is
 * the honest way to show the contract: Prism never reads the selection, so the
 * Demo reads it, decides which commands can run, applies the change and puts the
 * range back. That last part is the one worth copying. A command that changes the
 * value destroys the selection the browser was holding, so the range is stashed and
 * restored in an effect after the value commits, which is why the Component hands
 * focus back only after `onApply` has returned.
 *
 * A product whose editor is a `contenteditable` or a third-party rich text engine
 * reads that engine's own model instead, and the props do not change.
 */
export default function TextFormatToolbarDemo() {
  const editor = useRef<HTMLTextAreaElement>(null)
  const [value, setValue] = useState('Two stops were called in on the northbound run.')
  const [start, setStart] = useState(0)
  const [end, setEnd] = useState(0)
  // The range to put back once the value has committed. A ref rather than state
  // because it is not something to render, only something to act on.
  const restore = useRef<{ start: number; end: number } | null>(null)

  const selected = end > start
  const wrapped = (fence: string) =>
    value.slice(Math.max(0, start - fence.length), start) === fence &&
    value.slice(end, end + fence.length) === fence

  useEffect(() => {
    const range = restore.current
    if (range === null) return
    restore.current = null
    const node = editor.current
    if (node === null) return
    node.setSelectionRange(range.start, range.end)
  }, [value])

  const sync = () => {
    const node = editor.current
    if (node === null) return
    setStart(node.selectionStart)
    setEnd(node.selectionEnd)
  }

  const toggle = (fence: string) => {
    if (!selected) return
    if (wrapped(fence)) {
      setValue(value.slice(0, start - fence.length) + value.slice(start, end) + value.slice(end + fence.length))
      restore.current = { start: start - fence.length, end: end - fence.length }
      return
    }
    setValue(
      value.slice(0, start) + fence + value.slice(start, end) + fence + value.slice(end),
    )
    restore.current = { start: start + fence.length, end: end + fence.length }
  }

  return (
    <div className="flex max-w-measure flex-col gap-4">
      <TextFormatToolbar
        label="Text formatting"
        getEditor={() => editor.current}
        commands={[
          {
            id: 'bold',
            label: 'Bold',
            icon: <BoldIcon aria-hidden="true" />,
            isEnabled: selected,
            pressed: selected && wrapped('**'),
            onApply: () => toggle('**'),
          },
          {
            id: 'italic',
            label: 'Italic',
            icon: <ItalicIcon aria-hidden="true" />,
            isEnabled: selected,
            pressed: selected && wrapped('_'),
            onApply: () => toggle('_'),
          },
          {
            id: 'clear',
            label: 'Clear the editor',
            icon: <RotateCcwIcon aria-hidden="true" />,
            isEnabled: value.length > 0,
            onApply: () => setValue(''),
          },
        ]}
      />

      <Field>
        <FieldLabel htmlFor="text-format-toolbar-editor">Run note</FieldLabel>
        <Textarea
          id="text-format-toolbar-editor"
          ref={editor}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onSelect={sync}
          onKeyUp={sync}
          onClick={sync}
          className="min-h-32"
        />
      </Field>

      <p className="text-muted-foreground text-sm">
        Select some text and bold and italic become live. Arrowing across the row
        walks the commands and Tab steps over the whole row, because a `toolbar`
        role promises one stop. A command that is not live keeps its place and says
        so rather than disappearing. Nothing here reads the selection for you: the
        `isEnabled` and `pressed` values on each command are answers from this
        Demo, and the only thing Prism does with focus is decline to take it on a
        mouse press and hand it back after a command has run.
      </p>
    </div>
  )
}
