import { Fragment, type ReactNode } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { CtaLink } from '../../components/ui/cta-link'
import { Metric } from '../../components/ui/metric'
import { Prose } from '../../components/ui/prose'
import { Section, SectionHeading, childLevel, type HeadingLevel } from '../../components/ui/section'
import { cn } from '../../lib/utils'

/**
 * One principle the product holds itself to: a short name and a sentence under
 * it that says what holding to it means in practice.
 *
 * `id` is required and is a key rather than a label. A principles grid is
 * reordered by a consumer as often as it is read, and a key made of the words
 * means a rename in the copy is a rename in the key, which is a way to lose a
 * caller's saved filter or state over an edit to a sentence.
 *
 * `title` is a `string` and not a `ReactNode` because a principles grid is
 * scanned down its left edge, and a title that wraps to two lines costs every
 * other tile its alignment. `body` is a node, because the sentence under it is
 * the part a consumer wants to mark up, link or replace with a formatted figure.
 */
export type AboutPrinciple = {
  id: string
  title: string
  body: ReactNode
}

/**
 * One figure in the about band's figures row, composed onto `Metric`.
 *
 * The shape is `Metric`'s own with the two members that are a decision about the
 * caller's domain removed, and both removals are worth naming. `unit` is gone
 * because a row of figures each carrying its own unit is a row where no two
 * lines up, and `Metric` already sets a unit at the label step for the caller who
 * wants it. `deltaFormat` is gone for the reason in the `About01` JSDoc: a Block
 * that formatted a delta would be choosing a unit it has no way of knowing, and
 * the number is the honest thing to print until the caller says otherwise.
 */
export type AboutFigure = {
  label: string
  value: ReactNode
  /** The change against the previous reading. See `MetricDelta`. */
  delta?: number
  hint?: ReactNode
}

/**
 * One action in the about band's action row that names a destination.
 *
 * One of the two arms of `AboutAction`, and named rather than left as an inline
 * member of the union so a caller assembling a row from its own data can say which
 * arm it is building. `href` is required and that is the whole of the arm: a
 * control drawn as a call to action and with nowhere to go is the dead end
 * `CtaLink`'s own JSDoc names, and this Block cannot repair it, because a Block
 * ships no behaviour and so there is no handler to attach and no destination to
 * invent.
 */
export type AboutLinkAction = {
  /** The words on the control. Every string an about band renders is the caller's. */
  label: string
  /**
   * Where the action goes. Required rather than optional, so that "a link whose
   * address is sometimes undefined" is a compile error rather than a control that
   * navigates on the renders where the address happens to be there.
   */
  href: string
  /** Opens the destination in a new browsing context, with the matching `rel`. */
  newTab?: boolean
  /**
   * Which weight this action draws at, when the caller does not say.
   *
   * Defaults to `default` for the first action in the row and `outline` for the
   * rest, which is a decision about the row's shape rather than about the element.
   * A slot carries its own weight, so it does not take one from here.
   */
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  /**
   * Forbidden, so that an action cannot be both a destination and a caller's own
   * control. The two are rendered by different code on different elements, and a
   * value carrying both would have to pick one silently.
   */
  slot?: never
}

/**
 * One action in the about band's action row that is the caller's own control.
 *
 * **This is the arm that replaced a rendered button, and the reason it is a slot
 * rather than an `onClick` is that a Block cannot receive one.** This is a server
 * Component, so a handler is not a prop it can be given, and the arm it replaced
 * rendered a bare `<button>`: focusable, announced as a button, and activating to
 * nothing, at the foot of the section where the about band's own closing ask
 * lives. The defect was in the **type**, not in the render. A `label` with no
 * destination was a legal value, so the honest form of the escape hatch had to be a
 * node the caller renders itself, which the Block can place but cannot make inert.
 *
 * What belongs here is anything Prism cannot make work: a router's own `Link`, a
 * control that opens a dialog, a menu trigger. What does not belong here is a plain
 * anchor; that is the other arm, and it is one property away rather than one
 * component away.
 */
export type AboutSlotAction = {
  /**
   * The caller's own control, placed in the row where this action sits.
   *
   * The whole control, including its own label, its own weight and any icon. The
   * Block draws no frame around it and adds no class to it, because a class it adds
   * is a style the caller cannot see and cannot remove, and this package has no
   * override path.
   */
  slot: ReactNode
  /**
   * Forbidden on this arm, and for a reason rather than by tidiness: the Block
   * renders `slot` and nothing else, so a `label` beside it would be a word no
   * reader ever sees and a caller would reasonably believe had been rendered.
   */
  label?: never
  /** Forbidden: an anchor belongs on the other arm, where Prism renders it. */
  href?: never
  /** Forbidden with `href`, for the same reason. */
  newTab?: never
  /**
   * Forbidden, because the Block cannot style a node it does not render. A weight
   * accepted here and dropped would be the one prop in this Block that a reader of
   * the type could believe was in effect when it is not.
   */
  variant?: never
}

/**
 * One action in the about band's action row, as a union of the two things an action
 * in this position can honestly be.
 *
 * **A caller should not be able to reach a dead control by accident, and the union
 * is what stops it.** A single shape with an optional `href` made both of these
 * mistakes silent, and each was a legal value that rendered a control which
 * activated to nothing:
 *
 * - `{ label: 'Talk to an engineer' }`, which was the likely mistake because an
 *   about band's closing ask is almost always a link, and it looked correct on the
 *   page.
 * - `{ label: 'Talk to an engineer', href: maybeUrl }`, which navigated on the
 *   renders where the address happened to be there and rendered a button on the
 *   others, a runtime branch the type said nothing about.
 *
 * The first arm therefore **requires** `href`, and the second carries the caller's
 * own control rather than a `Button` this Block cannot wire to anything. There is no
 * third arm and no optional key, so both of those values are compile errors now.
 * `about-action.types.ts` holds that as an assertion, because a render cannot prove
 * a value does not compile.
 *
 * It is declared here rather than imported from `hero-01`, following
 * `ProcessFlow01`'s note on the same point: an about band and a hero are different
 * sections making different claims, and a consumer composing one has no reason to
 * take the other's type. `scripts/check-block-controls.mjs` is what holds the shape
 * itself, so a seventh spelling that got the arms wrong would fail the gate rather
 * than than reading a JSDoc in another Block.
 */
export type AboutAction = AboutLinkAction | AboutSlotAction

/**
 * The props an About01 takes.
 *
 * Every string, every figure and every principle is a prop, and the Block ships
 * none of them. An about band that hardcoded its statement would hand every
 * consumer a paragraph about somebody else's product, which is the same defect
 * `FeatureGrid01` shipped and the same one the corpus would publish as the
 * Block's own voice.
 */
export type About01Props = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: string
  /**
   * The section title. Required, because an about band is the one section whose
   * subject the reader needs named before they read the claim: a statement with
   * no title above it is a quotation, and a quotation is not what this is.
   */
  title: ReactNode
  /**
   * The one big sentence: what this is, in the present tense, for the reader.
   *
   * Required, and this is the Block. A band with a title, a paragraph and a set
   * of principles but no statement is `Hero01` without its actions, and a hero is
   * a claim about a product that a reader has not yet decided anything about. The
   * statement is the sentence a reader can repeat to somebody else, so the Block
   * that exists to hold it does not treat it as optional.
   */
  statement: ReactNode
  /**
   * The supporting paragraph, held to the reading measure by `Prose`.
   *
   * A node rather than a string, because this is the one place on a marketing
   * page where a consumer wants authored prose with a link in it, a mark, or a
   * second paragraph, and a `string` would force each of them to drop the markup
   * or reach for a second component.
   */
  body?: ReactNode
  /**
   * The principles, in the order a reader should meet them. Order is the
   * caller's because it is a claim about which one matters first.
   */
  principles: AboutPrinciple[]
  /**
   * The figures row, when the band has figures to show. Omit it for a band whose
   * claim is a sentence and nothing else.
   */
  figures?: AboutFigure[]
  /**
   * The band's own calls to action, at the foot of the section. See `AboutAction`
   * and its two arms: every action Prism renders here is a link, and an action that
   * cannot be one is a slot.
   */
  actions?: AboutAction[]
  /**
   * Where the statement and the supporting paragraph sit inside their column.
   *
   * `statement-left` is the default because a paragraph that has a grid of
   * principles under it reads as the introduction to that grid when it is set
   * flush left, and reads as a poster when it is centred. `statement-centre` is
   * here for the band that is a statement and almost nothing else, where the
   * principles are supporting evidence rather than the subject.
   *
   * It never moves the section heading. The heading is `SectionHeading`'s to
   * place, and this band has a grid under it, so the heading is left aligned
   * whichever way the statement is set. That is the rule `FeatureGrid01`'s own
   * JSDoc states and `test/section-heading-align.test.tsx` holds.
   */
  layout?: 'statement-left' | 'statement-centre'
  /** Heading level for the section title. See `HeadingLevel`. */
  headingLevel?: HeadingLevel
  /**
   * Layout only, exactly as on every Block. Changing a Prism-owned visual
   * property from here is prohibited.
   */
  className?: string
}

/**
 * The band that says what this is and who it is for: a large statement, a
 * paragraph under it at the reading measure, a grid of principles, and an
 * optional row of figures.
 *
 * **The present tense is the whole of what separates this from a story, and it is
 * worth being exact about why.** An about band is about the product and the
 * reader: it says what the thing does now and who it is for now, and a reader who
 * disagrees with it can act on it today. A story is past tense and is about a
 * sequence: it says what happened and in what order, and a reader who disagrees
 * with it learns something and changes nothing. `Story01` is the Block for the
 * second. A Block that blurs the two produces a page whose middle section is
 * decorative, because the one thing a reader looks for in the middle of a
 * marketing page is what the product does, and a paragraph about last year is
 * not an answer to that. So the statement is present tense, the principles are
 * present tense, and there is no date anywhere in this Block.
 *
 * **It is also not a benefits grid, and the difference is who the claim is
 * about.** A benefits grid says what the reader will get, one row per benefit,
 * and every row is a promise made by whoever wrote it. This band says what the
 * product is and how it is built, and the principles are commitments the product
 * makes to itself that a reader can hold it to later. That is why the principle
 * body is `ReactNode` and why the figures row is optional: a band whose only
 * content would be benefits belongs in a benefits grid, and a band that borrows
 * the form to smuggle them in has changed what it is.
 *
 * **The principles grid is `FeatureGrid01`'s answer, composed rather than
 * re-decided.** The heading is aligned left and the principles are cards, and
 * both are that Block's decisions, not this one's: `SectionHeading` states the
 * rule, `FeatureGrid01`'s JSDoc says the same rule is the reason it changed, and
 * `test/section-heading-align.test.tsx` holds the list of Blocks that answered it.
 * This Block has a grid under its heading, so the answer is left. Writing a
 * second answer here would be the exact failure that JSDoc describes, where a
 * Block that is the only one of its kind answering a shared question is a
 * composition a consumer cannot correct without restyling a catalogue item, which
 * the no-override-path rule does not allow. Composing is cheaper than agreeing
 * twice, and it is the reason the heading is a `SectionHeading` call with one
 * alignment rather than a choice made here.
 *
 * **The NaniSoft framing is in this JSDoc and in the Demo, and nowhere in the
 * Block.** A pipeline that runs, a market that is captured, an estate that is
 * observed, and agents that do the work rather than a team that watches them are
 * the four claims these pages make, and a Block that shipped any of them as a
 * string would install them into every consumer's product. So the statement is a
 * prop and the principle bodies are props, and the words that make a pipeline run
 * rather than merely exist are written where they belong, in the caller.
 *
 * **The figures row is `Metric`, and the delta prints as the number the caller
 * passed.** `Metric` takes a `deltaFormat` and this Block does not expose one,
 * because a formatter is a claim about a unit and the Block has no unit: a delta
 * of `12` is twelve percent, twelve incidents or twelve hours, and choosing would
 * be guessing about a caller's domain. So the number is printed as given, which is
 * honest and, for a fraction, usually not what was wanted. A caller who needs the
 * unit on the figure puts the formatted reading in `value`, which is a node and
 * takes a composed one, and composes `Metric` directly when the delta itself
 * needs the unit. The rejected alternative is a `deltaFormat` prop on this Block
 * defaulting to a percent sign, which would have been a claim about every
 * consumer's data on the Block's behalf.
 *
 * **The body is `Prose`, so the measure is a token rather than a guess.** The
 * supporting paragraph of an about band is the one long-form run of copy on a
 * marketing page, and the alternative was a `max-w-*` utility written here, which
 * would have been a second source of truth for the measure and a number that goes
 * stale when the token changes.
 *
 * It is a server Component: no hook, no state and no client code.
 */
export function About01({
  eyebrow,
  title,
  statement,
  body,
  principles,
  figures,
  actions = [],
  layout = 'statement-left',
  headingLevel = 'h2',
  className,
}: About01Props) {
  // A principle title is a heading one step below the section that introduces the
  // set, derived rather than written, so a Block embedded one level deeper carries
  // its titles with it instead of announcing a set of siblings of the section.
  const Title = childLevel(headingLevel)
  const centred = layout === 'statement-centre'

  return (
    <Section>
      <SectionHeading
        as={headingLevel}
        align="left"
        eyebrow={eyebrow}
        title={title}
        className="mb-10"
      />

      <div
        data-slot="about-01-lead"
        className={cn(
          'grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-14',
          className,
        )}
      >
        <div
          data-slot="about-01-statement"
          className={cn(
            'flex flex-col gap-6',
            // The alignment moves the statement and the paragraph with it, and
            // nothing else. The grid of principles and the figures column keep
            // their own edges either way, so a centred statement sits above a set
            // of flush-left cards rather than inside a centred band.
            centred && 'lg:items-center lg:text-center',
          )}
        >
          {/*
            The statement is a paragraph and not a second heading, and that is a
            decision about the outline rather than about the type. The section has
            one heading, the title. A statement rendered as an `h3` would be the
            first thing a reader navigating by heading meets under the title, and
            it is a sentence rather than a topic, so the outline would gain an
            entry that is not one.
          */}
          <p
            data-slot="about-01-statement-line"
            className="text-2xl font-medium tracking-tight text-balance sm:text-3xl"
          >
            {statement}
          </p>

          {body ? <Prose size="lg">{body}</Prose> : null}
        </div>

        {figures && figures.length > 0 ? (
          <div
            data-slot="about-01-figures"
            className="border-border flex flex-col gap-8 border-t pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10"
          >
            {figures.map((figure) => (
              <Metric
                key={figure.label}
                label={figure.label}
                value={figure.value}
                delta={figure.delta}
                hint={figure.hint}
              />
            ))}
          </div>
        ) : null}
      </div>

      <ul
        data-slot="about-01-principles"
        className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {principles.map((principle) => (
          <li key={principle.id} data-slot="about-01-principle" className="h-full">
            <Card className="h-full gap-3 py-6">
              <CardHeader>
                <CardTitle>
                  <Title>{principle.title}</Title>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-pretty text-sm">{principle.body}</p>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>

      {actions.length > 0 ? (
        <div
          data-slot="about-01-actions"
          className="mt-10 flex flex-wrap items-center gap-3"
        >
          {actions.map((action, index) => {
            // A slot is the caller's own control, placed where it asked to be and
            // otherwise untouched. Keyed positionally for the reason the other keyed
            // lists in this package state: two actions may share a label, and a row
            // keyed on a localised label remounts when the reader changes language.
            if ('slot' in action) {
              return <Fragment key={index}>{action.slot}</Fragment>
            }

            // The variant follows the position, so a caller who means two secondary
            // actions passes them and the row still reads as a row. It stays a visual
            // default rather than following the element, which is a different question
            // from the one `Hero01` separates it from.
            const variant = action.variant ?? (index === 0 ? 'default' : 'outline')

            return (
              <CtaLink
                key={index}
                href={action.href}
                newTab={action.newTab}
                variant={variant}
              >
                {action.label}
              </CtaLink>
            )
          })}
        </div>
      ) : null}
    </Section>
  )
}

export default About01
