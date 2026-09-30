'use client'

import { useState, type ReactNode } from 'react'

import { Button } from '../../components/ui/button'
import { Section, SectionHeading, type HeadingLevel } from '../../components/ui/section'
import { cn } from '../../lib/utils'

/**
 * The cycles a backdrop can run, named for the mechanism and not for a length.
 *
 * Seven members and six are the cycles the ambient scale authors in the token
 * package. `rise` is the seventh because the stylesheet publishes a class for it
 * beside the other six and a Block that offered six of seven would be making the
 * caller find the seventh some other way.
 *
 * The value is the caller's choice and the names are Prism's, and that is the
 * right way round. A field is which mechanism the reader is watching, which is a
 * decision about the claim the figure makes; a length is which token prices it,
 * and the stylesheet has already resolved that from `var(--ambient-*)`. Naming a
 * keyframe in a shorthand with a length attached is what this set exists to make
 * unnecessary, and a `duration` prop here would put the length back in a Block's
 * source where a token owns it.
 */
export type Backdrop01Field =
  | 'travel'
  | 'sweep'
  | 'drift'
  | 'scan'
  | 'pulse'
  | 'shimmer'
  | 'rise'

/**
 * The class each cycle is named by, which is the whole of how a Block picks one.
 *
 * Seven entries and no shorthand anywhere near them. `prism-ambient-travel` reads
 * its length from `var(--ambient-travel)` and its easing from
 * `var(--ambient-ease-linear)` in the one stylesheet a consumer downloads, so the
 * component package states a mechanism and the token package prices it. The
 * rejected shape is `animate-[prism-travel_7.2s_linear_infinite]`, which type
 * checks, renders, and reintroduces exactly the two problems the ambient scale
 * was written to solve: a duration that is a literal in a Block, and a mechanism
 * smuggled into the value tier.
 */
const AMBIENT: Record<Backdrop01Field, string> = {
  travel: 'prism-ambient-travel',
  sweep: 'prism-ambient-sweep',
  drift: 'prism-ambient-drift',
  scan: 'prism-ambient-scan',
  pulse: 'prism-ambient-pulse',
  shimmer: 'prism-ambient-shimmer',
  rise: 'prism-ambient-rise',
}

/**
 * How loud the field is behind the copy, as opacity on the layer that holds it.
 *
 * Two steps, and the names are Prism's while the choice is the caller's, for the
 * same reason the seven cycle names are: which of the two is a decision about
 * contrast between a field and the copy sitting on it, and a decision a Block can
 * make from the two things it can see. The declared union rather than a lookup
 * into the map below, so the emitted declaration the corpus reads says
 * `'subtle' | 'present'` instead of referring to a constant it cannot name.
 */
export type Backdrop01Intensity = 'subtle' | 'present'

/**
 * The opacity each of the two steps sets.
 *
 * Tailwind's multiplier rather than a token, and that is the rule DESIGN.md states
 * for the whole property: an opacity or alpha modifier takes its multiplier from
 * Tailwind because the token tier publishes no opacity step, and what this Block
 * is dimming is a figure drawn in contract colours, not a colour of its own. The
 * two steps are a factor of two apart rather than a nudge, because the whole point
 * of the prop is that a caller can see the difference. The rejected third step is
 * `loud`, and a scale that opens a third step opens a fourth on the next request,
 * and a backdrop whose intensity is a slider is decoration again.
 */
const INTENSITY: Record<Backdrop01Intensity, string> = {
  subtle: 'opacity-40',
  present: 'opacity-80',
}

/**
 * The props a Backdrop01 takes.
 *
 * Every string is a prop and the Block ships none. There is no band headline, no
 * default cycle, no default intensity sentence and no default pair of button
 * labels, and the absence of the last two is the sharpest version of the rule: a
 * backdrop that hardcoded "Pause" would put an English word on a control in every
 * consumer's product, in every language, with no prop to change it.
 */
export type Backdrop01Props = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: string
  /**
   * The section title. Omit it for a band composed under its own heading, which
   * is the usual case for something placed directly under a hero.
   */
  title?: ReactNode
  /** One or two sentences under the title. */
  description?: ReactNode
  /**
   * The band's own content, composed by the caller.
   *
   * A slot rather than a set of copy props, and the reason is that the content of
   * a band is the only thing about it that Prism cannot know: it is a headline, a
   * paragraph, two actions and a figure in some arrangement, and a Block that
   * took a prop for each would be four arrangements wearing one name. The content
   * sits over the field, which is why the band is a layout and not a template.
   */
  children: ReactNode
  /**
   * The figure the field runs on, usually a `SignalField` or a `PulseGraph`.
   *
   * Required rather than optional, and the Block draws no figure of its own,
   * because a field of invented marks is the retired line's defect rebuilt: the
   * numbers were never collected and the motion says a system is running. A node
   * is a node the caller named, a reading is a reading the caller holds, and an
   * empty figure is an empty figure. What the Block owns is the layer the figure
   * rides on, which is where a cycle can be applied without the figure having to
   * know it is being animated.
   */
  figure: ReactNode
  /**
   * The figure's accessible name, and the only thing a screen reader reads from
   * the field.
   *
   * Required, and the reason this Block is the claim half of the two is on the
   * Component's own JSDoc. See there for why the atmosphere half is not an arm
   * here.
   */
  label: string
  /**
   * Which cycle the field runs. See `Backdrop01Field`.
   *
   * Required rather than defaulted, because the cycle is a claim about the figure
   * and only the caller knows what the figure claims. A default would be this
   * Block choosing the mechanism a consumer's own claim gets made by, and a
   * backdrop whose wavefront does not match its subject is a decoration wearing a
   * caption.
   */
  field: Backdrop01Field
  /**
   * How loud the field is behind the copy. @defaultValue 'subtle'
   *
   * Opacity on the layer, and the reasoning for it not being a length is on
   * `INTENSITY` above, where the one-second floor is the reason.
   */
  intensity?: Backdrop01Intensity
  /**
   * Whether the field is stopped. @defaultValue false
   *
   * The controlled arm. Pass it with `pauseControl={false}` and put the button in
   * `children` when the state belongs to something larger than this band: a
   * dashboard that stops every figure on the page together, or a settings toggle,
   * is one state and several bands, and a state this Block owns would be a second
   * copy of it that disagrees with the first.
   *
   * With `pauseControl` set, the same prop is the value the Block starts from and
   * owns from then on, which is the usual defaultValue arrangement and is
   * documented on the prop because it is the one place a reader of a call site
   * could otherwise be surprised.
   */
  paused?: boolean
  /**
   * Whether the Block draws the pause control. @defaultValue false
   *
   * Off by default because a control on every backdrop is a control on every page
   * a consumer puts one on, and most of those pages have a figure that is worth
   * stopping and no reason to offer it. See the Component JSDoc for why the
   * control is this Block's own button rather than a slot, which is the decision
   * this prop and the two labels after it exist to record.
   */
  pauseControl?: boolean
  /**
   * The words on the control while the field runs. Required with `pauseControl`.
   *
   * A prop, not a default, for the reason every accessible name in this package
   * is a prop: the control is a sentence a reader hears, every language words
   * stopping differently, and a default here would be an English string in every
   * consumer's product that they cannot translate without forking the library.
   */
  pauseLabel?: string
  /**
   * The words on the control while the field is stopped. Required with
   * `pauseControl`.
   *
   * A second prop rather than a second half of the first, because "Pause" and
   * "Play" are not a pair in every language, and because a caller whose control
   * says "Stop the sweep" and "Sweep stopped" is describing a figure rather than
   * naming a transport control.
   */
  resumeLabel?: string
  /**
   * Heading level for the section title. @defaultValue 'h2'
   *
   * See `HeadingLevel`.
   */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Block. Changing a Prism-owned visual
   * property from here is prohibited.
   */
  className?: string
}

/**
 * A band with a live field running behind it, and a control that stops the field.
 *
 * **The test that decides whether motion belongs here at all, in the terms this
 * repository uses. Stop the animation. Look at the band. Is the figure still
 * true, and is every mark of it still readable?** If both answers are yes then
 * the movement was emphasis and it belongs on a band, because emphasis is a thing
 * a reader can lose and get back. If stopping it leaves an empty rectangle, then
 * the thing this was built from was never a figure at all. It was a video with
 * extra steps, it is the Component it was built with that is wrong, and no
 * amount of restraint on the Block will turn it back into a drawing. So the
 * question is asked of the figure and not of the band, which is why `figure` is a
 * required slot: a backdrop is a frame for somebody else's drawing, and the only
 * claim this Item makes is that the drawing survives being still.
 *
 * **Which of the two figures this Block is, and why it refuses to decide for the
 * caller.** The motion law sorts figures into two, and the two are different
 * things rather than one thing with a flag. A figure that carries a claim has to
 * name itself to a screen reader, because the claim is the whole of what it is
 * for, and `PulseGraph` and `PulseSeries` both require a label for that reason. A
 * figure that is atmosphere names nothing, because a field of dots is not
 * information and a screen reader being made to read one is a cost with no reader
 * attached, and `SignalField` is `aria-hidden` by default for exactly that
 * reason. This Block is the **claim** half: `label` is required and the field
 * layer publishes it, so a caller who has a claim to make has a name for it here
 * and never has to reach past the band. What it will not do is grow a
 * `decorative` arm for the other half, and the reason is specific rather than
 * cautious: the figure is the caller's and the caller's figure has already
 * answered the question. `SignalField` arrives `aria-hidden` and `PulseGraph`
 * arrives named, so a `decorative` prop here would be a second answer to a
 * question two Components have already answered, and the disagreement between
 * them would be invisible in the rendered result and audible in a screen reader.
 * The atmosphere half is not missing from this system. It is `SignalField` with
 * nothing passed, which is the cheapest way to draw it and needs no flag here.
 *
 * **Intensity is opacity on a wrapper, and that is the whole of the decision.**
 * It is not a new token and not a new keyframe, and it is not a length. A length
 * would be the failure the ambient scale was built to close: a cycle measured in
 * hundreds of milliseconds is a flicker, the emitted-contract test fails every
 * `ambient` member below 1000ms and says so in the failure, and an intensity that
 * scaled the cycle would let a caller reach that floor by asking for a brighter
 * backdrop. A demonstration that reads as a flicker is the one outcome the floor
 * exists to prevent, so the second axis is the only one left that cannot produce
 * it. What the prop actually decides is how present the field is behind the copy,
 * which is a question about contrast between two things on one surface and
 * nothing to do with time.
 *
 * **The pause control is a real button, and its two labels are props.** That is
 * the decision, and the reason to state it is the alternative:
 * `prism-ambient-paused` is a published utility in the one stylesheet, and it is
 * published rather than left to each consumer because the alternative is four
 * products each writing their own stop mechanism and at least one of them getting
 * it wrong in the specific way of restarting the cycle when the figure scrolls
 * back into view. So the stop mechanism is one class, in one place, and the thing
 * that puts it on is this control. The two labels are the caller's because they
 * are the sentences a reader hears, and because a band whose button says "Pause"
 * in a product whose language has no word for pausing is a control the consumer
 * cannot fix without forking the library. The Block throws without them rather
 * than shipping an English button, for the same reason `InstrumentPanel01` throws
 * on a state with no words beside it.
 *
 * **It is a client Component, and the rejected alternative is the interesting
 * part.** The pause is state, so the module carries `'use client'`, and the
 * first answer considered was to keep this a server Component and take the
 * control as a `ReactNode` slot. That would have been wrong for a specific
 * reason rather than a stylistic one, and the props are where the reason shows.
 * `pauseControl` is a boolean and `pauseLabel` and `resumeLabel` are two
 * strings, so a slot is not merely rejected, it is inexpressible: those three
 * props describe a control this Block draws, and a Block that handed the button
 * back would be asking the caller for a different set of props and getting a
 * second decision about whether the stop mechanism exists at all. A slot hands
 * the stop mechanism back to the consumer, which is exactly what publishing
 * `prism-ambient-paused` was meant to stop, and it would have put two more
 * invented sentences in front of every call site, so forty call sites would be
 * forty chances to write "Pause animation" in English. A slot is the right
 * shape for a control the consumer owns, such as a range selector or a
 * fullscreen toggle, and the wrong shape for the one control whose entire
 * behaviour is this Block's own published class. The cost of the client
 * boundary is real and worth naming: the module is measured by
 * `check-client-budget`, and a consumer who does not want the button can leave
 * `pauseControl` off and never instantiate the state. The caller's `children`
 * and `figure` cross the boundary as slots, so a server-rendered figure stays
 * server-rendered and this band costs a consumer the module and not the
 * drawing.
 *
 * **Nothing here is hidden and nothing waits for a script.** No rule in the
 * ambient layer sets a resting `opacity: 0` and no figure this Block wraps waits
 * for an intersection, a timer or a frame, so the band is complete and legible at
 * first paint, to a reader with scripting off, in a print stylesheet, and to a
 * crawler. The `prefers-reduced-motion` block in the stylesheet is one
 * `animation: none`, and because every element's resting state is its full form,
 * that reader gets the same band with the field still drawn. The pause control is
 * the manual equivalent of the same thing, which is why it is a first-class state
 * rather than a prop that hides a wrapper: hiding the wrapper would take the
 * figure with it, and pausing keeps it.
 *
 * **What the cycle suits is the caller's figure, and this Block will not hide
 * that.** `drift` and `pulse` are the two whose resting form is the figure's own
 * full form, so they are safe on any drawing. `travel`, `sweep`, `scan` and
 * `shimmer` carry something *across* a field, which is what the stylesheet says
 * they are for, and a caller who puts one on a figure narrower than the band is
 * asking for a marker to leave. The band clips, so nothing escapes the frame, and
 * a caller who pauses and finds the field thin has learned which cycle their
 * figure wanted. That is the falsifiable test above doing its job, and it is a
 * better outcome than the alternative this Block refused: choosing the cycle for
 * the caller, which is a claim about their figure that a component cannot check.
 *
 * It is a client Component in its entirety, and the only thing in it that needs a
 * client is the pause. The frame, the field layer, the wash and the section
 * around them are server-renderable markup, and the two slots a caller fills
 * cross the boundary rather than dragging their own trees into it.
 */
export function Backdrop01({
  eyebrow,
  title,
  description,
  children,
  figure,
  label,
  field,
  intensity = 'subtle',
  paused = false,
  pauseControl = false,
  pauseLabel,
  resumeLabel,
  headingLevel = 'h2',
  className,
}: Backdrop01Props) {
  if (pauseControl && (!pauseLabel || !resumeLabel)) {
    throw new Error(
      'Backdrop01: pauseControl is set and the two labels were not both passed, so the control would ' +
        'ship a sentence this Block did not receive. Pass the words your readers use while the field runs ' +
        'and while it is stopped, or leave pauseControl off and put your own control in children.',
    )
  }

  // The Block's own stop, seeded from the caller's `paused` and owned from then on
  // when `pauseControl` is set. With the control off, `paused` is exactly the
  // caller's value and this state is never read, so a consumer that owns the
  // state somewhere larger pays for a hook and nothing else.
  const [stopped, setStopped] = useState(paused)
  const isPaused = pauseControl ? stopped : paused

  return (
    <Section>
      {title ? (
        <SectionHeading
          as={headingLevel}
          align="left"
          eyebrow={eyebrow}
          title={title}
          description={description}
          className="mb-10"
        />
      ) : null}

      <div
        data-slot="backdrop-01"
        data-field={field}
        data-intensity={intensity}
        data-paused={isPaused || undefined}
        className={cn(
          'bg-card text-card-foreground relative isolate overflow-hidden rounded-xl border shadow-sm',
          className,
        )}
      >
        {/*
          The field, behind everything. The wash sits between it and the content
          so a claim-carrying figure can sit under a paragraph without the
          paragraph having to be short enough to miss it. Both layers are
          `aria-hidden` by being empty of text and the plot below is the named
          figure, so neither layer adds a word to the document.
        */}
        <div
          data-slot="backdrop-field"
          className={cn(
            'pointer-events-none absolute inset-0 -z-20 overflow-hidden',
            AMBIENT[field],
            INTENSITY[intensity],
            isPaused && 'prism-ambient-paused',
          )}
        >
          <figure data-slot="backdrop-plot" aria-label={label} className="size-full">
            {figure}
          </figure>
        </div>

        <div
          data-slot="backdrop-wash"
          aria-hidden="true"
          className="bg-background/40 pointer-events-none absolute inset-0 -z-10"
        />

        <div data-slot="backdrop-content" className="relative flex flex-col gap-6 p-6 sm:p-10">
          {children}

          {pauseControl ? (
            <div data-slot="backdrop-controls" className="flex items-center gap-2">
              {/*
                A real button rather than a marker, a `div` with a click handler,
                or a slot. Two reasons, and the second is the one that is usually
                forgotten: the label swaps rather than being paired with
                `aria-pressed`, because the control is a transport control and
                naming the action the button takes right now is what a reader
                needs from it, and pairing a changing label with a pressed state
                announces the same fact twice and the two can disagree.
              */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setStopped((was) => !was)}
              >
                {isPaused ? resumeLabel : pauseLabel}
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </Section>
  )
}

export default Backdrop01
