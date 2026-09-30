'use client'

import type { FormEvent, ReactNode } from 'react'
import { useId, useState } from 'react'

import { Button } from '../../components/ui/button'
import { Card, CardContent, CardFooter } from '../../components/ui/card'
import { Dropzone } from '../../components/ui/dropzone'
import { Field, FieldLabel } from '../../components/ui/field'
import { FileUpload } from '../../components/ui/file-upload'
import { LiveRegion } from '../../components/ui/live-region'
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group'
import { Section, SectionHeading, type HeadingLevel } from '../../components/ui/section'
import { Textarea } from '../../components/ui/textarea'
import { cn } from '../../lib/utils'

/**
 * One point on the caller's own scale.
 *
 * **`id` is a key and `value` is the number.** The separation is what lets a caller
 * keep their own record stable while the scale is reordered, and what lets one scale
 * be a set of words at one end and a number at the other, which is most of them. On
 * submit the Block hands over both, so a caller storing by key and a caller
 * aggregating by number are both served without either reading the other's field.
 */
export type Feedback01Point = {
  /** A stable key for the point. What the Block selects on and what it hands back. */
  id: string
  /** The words drawn beside the control, and all a screen reader announces. */
  label: string
  /** The number this point contributes, for a caller who aggregates. */
  value: number
}

/** The free-text half of a feedback panel, and its counter. */
export type Feedback01Comment = {
  /** The field's visible label, and its accessible name. */
  label: string
  /** The comment as the caller holds it, which makes the field controlled. */
  value?: string
  /** Called as the reader types. */
  onValueChange?: (value: string) => void
  /**
   * The character ceiling, enforced by the control itself.
   *
   * A number and not a sentence, because "200 characters" is a fact about a limit
   * and the sentence for it belongs to whoever set the limit. Pass the same number
   * to `counter` and the reader can see the ceiling before they reach it.
   */
  maxLength?: number
  /**
   * Whether to draw the character count beside the field.
   *
   * A count and not a limit, because a reader who has been typing for a while needs
   * to know how much room is left rather than what the rule is. It is drawn in
   * `tabular-nums` so the digits do not shuffle the field's width as they change,
   * and it is not announced, because a counter that reads itself aloud on every
   * keystroke is the fastest way to make a screen reader unusable.
   */
  counter?: boolean
}

/** The optional file the reader can hand over with their words. */
export type Feedback01Artefact = {
  /** The caller's name for what may be attached. Drawn on the drop target. */
  label: string
  /**
   * Called with the files the reader chose or dropped.
   *
   * Required, and the Block calls it as well as recording the files, because the
   * upload is the caller's: Prism never reads a byte, never sends one and never
   * knows a size limit. A consumer who wants the files at submit instead reads them
   * off `FeedbackValue.files`.
   */
  onFiles: (files: File[]) => void
  /**
   * The file types the platform's own picker offers, as an `accept` value.
   *
   * A hint to the browser and to nothing else. Files dragged onto the target arrive
   * whatever they are, so the check belongs in `onFiles`, which is the caller's.
   */
  accept?: string
}

/**
 * What a submit hands over, and the whole of what this Block collects.
 *
 * **`files` is here as well as in `onFiles` because the two answer different
 * questions.** `onFiles` fires the moment a reader picks, so an upload can start
 * while they are still typing. `files` is what the panel holds at submit, so a
 * caller who wanted to hold everything until the reader pressed the button can.
 * Neither is the transport, and both are the caller's to use or ignore.
 */
export type FeedbackValue = {
  /** The `id` of the point the reader chose, when they chose one. */
  rating?: string
  /** That point's `value`, read out of the caller's own scale. */
  ratingValue?: number
  /** The comment as typed, when the panel has a comment field. */
  comment?: string
  /** The files the reader attached, when the panel has an artefact field. */
  files?: File[]
}

/** The outcome of the caller's own request, drawn in a live region. */
export type Feedback01Status = {
  /** Which of the four the request is in. Read by the Block for two things only. */
  state: 'idle' | 'sending' | 'sent' | 'error'
  /** The words for that state, in the product's own voice. */
  message: ReactNode
}

/** The props a Feedback01 takes. Every string in this Block is one of them. */
export type Feedback01Props = {
  /** The short line above the title, usually what the feedback is about. */
  eyebrow?: ReactNode
  /** The heading. Required, because a panel with no heading is a form in a page. */
  title: ReactNode
  /** One supporting line under the heading, for the part the title cannot carry. */
  description?: ReactNode
  /**
   * The scale, in the order the reader should meet it.
   *
   * **Required, and the caller's data rather than five faces Prism chose.** The
   * number of points and the words at each end are the caller's product knowledge,
   * and they differ per product in ways no design system can decide. A five-point
   * scale labelled "bad" to "great" is a survey instrument, and a feedback form
   * usually is not one: it is one reader telling one team something they could not
   * have guessed. A support scale has three points with "Blocked" at one end, a
   * design review scale is arguably not ordered at all, and a rating scale has ten.
   * So Prism takes the points, the order and the words, and supplies none of the
   * three. The cost is stated rather than hidden: a caller who passes two points
   * gets two controls, because rounding up would be the Block inventing a data
   * point on the caller's behalf.
   */
  scale: Feedback01Point[]
  /**
   * The scale's own name: what the points are measuring.
   *
   * Required, because a `RadioGroup` with no name is a set of radios a reader cannot
   * identify. A screen reader announces the position within a set, and without this
   * it announces "3 of 5" and nothing about what is being rated, so a panel that
   * collected a rating of the support rather than of the interface is one nobody can
   * catch. It is drawn above the group and the group is named from that same
   * element, so what a sighted reader reads and what is announced are one thing
   * rather than two.
   */
  scaleLabel: string
  /** The chosen point's `id`, which makes the group controlled. */
  value?: string
  /** Called with the chosen point's `id` as the reader moves through the scale. */
  onValueChange?: (id: string) => void
  /** The free-text field. Omit it for a panel that collects a rating only. */
  comment?: Feedback01Comment
  /** The file the reader may attach. Omit it where nothing may be attached. */
  artefact?: Feedback01Artefact
  /**
   * Called with everything the panel collected when the reader submits.
   *
   * **Required, and the requirement is the design.** A panel that gathered a rating,
   * a comment and a screenshot and then had nowhere to put them would be a component
   * collecting product data and discarding it, and there is no destination Prism
   * could pick that would not be wrong for three of the four products that install
   * it. Making the handler required moves that question to the caller, where it is
   * answerable.
   */
  onSubmit: (value: FeedbackValue) => void
  /** The label on the one control that submits. */
  submitLabel: string
  /**
   * The caller's own way out, as a slot.
   *
   * A slot and not a label with a handler, for the reason `Announcement` gives: the
   * way out of a feedback panel is never only here. It belongs in the surrounding
   * surface too, so a reader who has decided not to leave feedback is not held by a
   * Block they cannot dismiss.
   */
  cancel?: ReactNode
  /**
   * The outcome of the caller's request, drawn in a live region and announced.
   *
   * A prop and never an internal state Prism writes, for the reason every Block in
   * this wave states it: a sentence this package wrote would be inherited by every
   * consumer, and a feedback form has more outcomes than any other form here, from a
   * queued ticket to a duplicate to a rate limit to an artefact that was too large.
   */
  status?: Feedback01Status
  /** Heading level for the section heading. See `HeadingLevel`. */
  headingLevel?: HeadingLevel
  /** Layout only. Changing a Prism-owned visual property from here is prohibited. */
  className?: string
}

/**
 * A character count as the runtime's own locale groups it, because a counter is a
 * number a reader reads and the separator between its digits is their locale's.
 */
function countOf(text: string): string {
  return text.length.toLocaleString()
}

/**
 * The panel that asks a reader one question properly: a scale, a place to say more,
 * and optionally the thing they are talking about.
 *
 * **The scale is the caller's data, and that is the argument for the whole Block.** A
 * five-point scale labelled from "bad" to "great" is a survey instrument, and a
 * feedback form usually is not one: it is one reader telling one team something they
 * could not have guessed. How many points there are and what the ends are called is
 * product knowledge, and it differs per product in ways no design system can decide:
 * a support scale has three points with "Blocked" at one end, a design review scale
 * is arguably not ordered at all, and a rating scale has ten. So `scale` is required
 * and Prism supplies none of it, and the cost is named: a caller who passes two
 * points gets two controls rather than three, because rounding up would be the Block
 * inventing a data point.
 *
 * **The scale renders as a `RadioGroup` and this Block refuses to render it as five
 * buttons.** A set of mutually exclusive options is a radio group, and that is not a
 * styling preference: a screen reader announces the size of the set and the checked
 * state only when it is one, so a reader of five buttons is told he is on the third
 * of five undifferentiated controls rather than that he has chosen three out of
 * five. The keyboard model is the second half of it. Arrow keys move within the
 * group and Tab crosses it as one stop, which is the model `RadioGroup` already owns
 * and which five buttons each take a Tab stop of their own instead. Five buttons are
 * what a sentiment scale looks like on a gallery page, and they are what this Block
 * deliberately is not.
 *
 * **`scaleLabel` is required and it is drawn.** A `RadioGroup` with no name is a set
 * of radios a reader cannot identify: the reader hears a count and a position and no
 * indication of what is being rated. Prism draws the name above the group and points
 * the group's accessible name at that same element, so the two are one thing rather
 * than a sentence that appears once on the page and once in the accessibility tree.
 *
 * **The artefact is a `Dropzone` and a `FileUpload`, and there is no remove control
 * on purpose.** The list is a record of what was attached, and `FileUpload` is
 * explicit that a record a reader cannot change is the right rendering of a receipt.
 * The cost is real and is named here rather than hidden: a reader who picked the
 * wrong screenshot has to pick again, and the way out is to compose `Dropzone` and
 * `FileUpload` directly with an `onRemove` and a `removeLabel` of your own rather
 * than to reach into this Block. Prism did not add the control because doing so
 * would mean shipping a remove button whose confirmation sentence and whose
 * replacement state are both sentences about the caller's upload.
 *
 * **Nothing here validates anything.** There is no minimum comment length, no
 * required point, no file size rule and no address format. Each of those is a
 * decision about the caller's product and its data, and a Block that guessed one
 * would refuse a reader on the caller's behalf. What Prism does do is hand over the
 * number a point contributes, so a caller who wants to reject a rating below three
 * can do it in their own handler with their own sentence.
 *
 * **The submit control is disabled while the caller's state reads `sending`**, which
 * is the same one reading of that state every Block in this wave makes: a second
 * press while the first request is in flight is a duplicate report no triage queue
 * wants. The control is disabled rather than replaced so its label never changes
 * under the reader's finger, and the live region carries the busy state.
 *
 * It is a client Component, and there are three reasons rather than one: the handler
 * is a function, the attached files are state, and the counter reads state on every
 * keystroke. A server component cannot hand an event handler down to a `<form>`.
 */
export function Feedback01({
  eyebrow,
  title,
  description,
  scale,
  scaleLabel,
  value,
  onValueChange,
  comment,
  artefact,
  onSubmit,
  submitLabel,
  cancel,
  status,
  headingLevel = 'h2',
  className,
}: Feedback01Props) {
  const generated = useId()
  const scaleLabelId = `${generated}-scale-label`
  const commentId = `${generated}-comment`
  const sending = status?.state === 'sending'
  const [files, setFiles] = useState<File[]>([])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const chosen = scale.find((point) => point.id === value)
    const next: FeedbackValue = {}
    if (chosen !== undefined) {
      next.rating = chosen.id
      next.ratingValue = chosen.value
    }
    if (comment !== undefined) next.comment = comment.value ?? ''
    if (artefact !== undefined) next.files = files
    onSubmit(next)
  }

  return (
    <Section data-slot="feedback-01" className={cn(className)}>
      <div data-slot="feedback-01-body" className="flex flex-col gap-8">
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          description={description}
          align="left"
          as={headingLevel}
        />

        <Card data-slot="feedback-01-panel">
          <form
            data-slot="feedback-01-form"
            onSubmit={handleSubmit}
            className="flex w-full flex-col gap-6"
          >
            <CardContent data-slot="feedback-01-fields" className="flex flex-col gap-6">
              <Field data-slot="feedback-01-scale" className="gap-2">
                {/*
                 * A `span` and not a `FieldLabel`, because no single control takes
                 * this name: the group of radios does, and a label element with no
                 * `htmlFor` is a label for nothing. It carries the classes
                 * `FieldLabel` uses so the two halves of the panel read as one set
                 * of field names, and the group's accessible name points at it, so
                 * the sighted reader and the screen reader read the same words.
                 */}
                <span
                  id={scaleLabelId}
                  data-slot="feedback-01-scale-label"
                  className="text-foreground text-sm leading-none font-medium"
                >
                  {scaleLabel}
                </span>

                {/*
                 * The group, wrapped rather than given a grid whose column count is
                 * `scale.length`, because a caller passing three points and a caller
                 * passing seven both have to lay out without this Block inventing
                 * column arithmetic, and a wrapping row is the one arrangement that
                 * is right for both.
                 */}
                <RadioGroup
                  aria-labelledby={scaleLabelId}
                  value={value}
                  onValueChange={onValueChange}
                  className="flex w-full flex-wrap gap-2"
                >
                  {scale.map((point) => (
                    <FieldLabel
                      key={point.id}
                      htmlFor={`${generated}-${point.id}`}
                      className="border-input hover:border-primary focus-within:border-ring inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2"
                    >
                      <RadioGroupItem value={point.id} id={`${generated}-${point.id}`} />
                      {point.label}
                    </FieldLabel>
                  ))}
                </RadioGroup>
              </Field>

              {comment === undefined ? null : (
                <Field data-slot="feedback-01-comment">
                  <FieldLabel htmlFor={commentId}>{comment.label}</FieldLabel>
                  {/*
                   * The counter sits under the control rather than inside it, and it
                   * is not a live region: a count that reads itself aloud on every
                   * keystroke is the fastest way to make a screen reader unusable.
                   * `tabular-nums` is the other half of that decision, because a
                   * counter whose width changes as the digits change moves the
                   * ceiling the reader is trying not to reach.
                   */}
                  <Textarea
                    id={commentId}
                    rows={4}
                    value={comment.value}
                    maxLength={comment.maxLength}
                    onChange={
                      comment.onValueChange
                        ? (event) => comment.onValueChange?.(event.target.value)
                        : undefined
                    }
                  />
                  {comment.counter === true ? (
                    <span
                      data-slot="feedback-01-counter"
                      className="text-muted-foreground self-end text-xs tabular-nums"
                    >
                      {comment.maxLength === undefined
                        ? countOf(comment.value ?? '')
                        : `${countOf(comment.value ?? '')} / ${countOf(String(comment.maxLength))}`}
                    </span>
                  ) : null}
                </Field>
              )}

              {artefact === undefined ? null : (
                <Field data-slot="feedback-01-artefact" className="gap-3">
                  <Dropzone
                    label={artefact.label}
                    onFiles={(chosen) => {
                      setFiles(chosen)
                      artefact.onFiles(chosen)
                    }}
                    {...(artefact.accept === undefined ? null : { accept: artefact.accept })}
                  />
                  {/*
                   * A record of what was attached, with no remove control on purpose.
                   * `FileUpload` draws one only when it is given both `onRemove` and
                   * a `removeLabel`, and both of those are sentences about the
                   * caller's upload rather than facts about a file, so Prism does not
                   * compose them here. Omit `empty` and it renders nothing at all
                   * until there is something to record, which is the same absence
                   * `FactList` draws rather than a bordered box with nothing in it.
                   */}
                  <FileUpload
                    files={files.map((file, index) => ({
                      id: `${file.name}-${file.size}-${index}`,
                      name: file.name,
                      size: file.size,
                    }))}
                  />
                </Field>
              )}
            </CardContent>

            <CardFooter
              data-slot="feedback-01-actions"
              className="flex-col items-stretch gap-3 sm:flex-row sm:items-center"
            >
              <Button data-slot="feedback-01-submit" type="submit" disabled={sending}>
                {submitLabel}
              </Button>
              {cancel === undefined ? null : cancel}

              {/*
               * The outcome, and it renders nothing while there is no message.
               * `sent` is not special-cased anywhere in this file: there is no
               * internal success sentence here or anywhere else in this package,
               * because the four words a caller wants to say about a received report
               * are the caller's.
               */}
              <LiveRegion
                politeness={status?.state === 'error' ? 'assertive' : 'polite'}
                busy={sending}
                className="ml-auto text-sm"
              >
                {status?.message}
              </LiveRegion>
            </CardFooter>
          </form>
        </Card>
      </div>
    </Section>
  )
}

export default Feedback01
