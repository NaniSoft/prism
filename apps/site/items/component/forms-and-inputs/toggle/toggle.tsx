'use client'

import { useState } from 'react'

import { Toggle } from '@nanisoft/prism-ui/components/toggle'
import { Button } from '@nanisoft/prism-ui/components/button'
import { Field, FieldDescription, FieldLabel } from '@nanisoft/prism-ui/components/field'

/**
 * Two shapes of Toggle, and the thing that separates them from a Switch.
 *
 * The first row is a formatting toolbar: glyphs only, and the pressed states mean
 * something about the text the reader is composing rather than about the
 * application. The second is a setting the reader collects and commits, which is
 * the case where a Switch would be wrong: flipping a switch there would rewrite the
 * document the moment a word was pressed.
 *
 * The save button is disabled until something changes, and that is the point. A
 * pending change the reader cannot commit is a change they may believe they have
 * already made.
 */
const GLYPHS = [
  { key: 'bold', label: 'Bold', mark: 'B' },
  { key: 'italic', label: 'Italic', mark: 'I' },
  { key: 'underline', label: 'Underline', mark: 'U' },
] as const

type Glyph = (typeof GLYPHS)[number]['key']

const same = (a: readonly string[], b: readonly string[]) =>
  a.length === b.length && a.every((item) => b.includes(item))

/** The formatting toolbar and the pending setting, with a save that commits them. */
export default function ToggleDemo() {
  const [marks, setMarks] = useState<Glyph[]>(['bold'])
  const [wrap, setWrap] = useState(false)
  const [applied, setApplied] = useState({ marks: ['bold'] as Glyph[], wrap: false })

  const pending = !same(marks, applied.marks) || wrap !== applied.wrap

  return (
    <div className="flex max-w-measure-wide flex-col gap-8">
      <section className="flex flex-col gap-3">
        <p className="text-muted-foreground text-sm">
          Formatting, which the reader composes and the document has not changed yet.
        </p>
        <div
          role="group"
          aria-label="Text formatting"
          className="border-border inline-flex w-fit items-center gap-1 rounded-md border p-1"
        >
          {GLYPHS.map((glyph) => (
            <Toggle
              key={glyph.key}
              aria-label={glyph.label}
              pressed={marks.includes(glyph.key)}
              onPressedChange={() =>
                setMarks((current) =>
                  current.includes(glyph.key)
                    ? current.filter((key) => key !== glyph.key)
                    : [...current, glyph.key],
                )
              }
              className="font-semibold"
            >
              <span className={glyph.key === 'italic' ? 'italic' : ''}>{glyph.mark}</span>
            </Toggle>
          ))}
        </div>
      </section>

      <section className="flex max-w-measure-narrow flex-col gap-3">
        <Field>
          <FieldLabel htmlFor="toggle-wrap">
            <Toggle id="toggle-wrap" pressed={wrap} onPressedChange={setWrap} size="sm">
              Wrap long lines
            </Toggle>
          </FieldLabel>
          <FieldDescription>
            Nothing on the page changes until the reader saves. This is the case where a
            Switch would be wrong.
          </FieldDescription>
        </Field>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            disabled={!pending}
            onClick={() => setApplied({ marks, wrap })}
          >
            Save
          </Button>
          <span className="text-muted-foreground text-sm tabular-nums">
            {applied.wrap ? 'wrapped, ' : ''}
            {applied.marks.join(', ') || 'plain'}
          </span>
        </div>
      </section>
    </div>
  )
}
