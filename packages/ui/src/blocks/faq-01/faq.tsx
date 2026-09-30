import type { ReactNode } from 'react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../components/ui/accordion'
import { CtaLink } from '../../components/ui/cta-link'
import { Section, SectionHeading, type HeadingLevel } from '../../components/ui/section'
import { cn } from '../../lib/utils'

/**
 * One question and the answer to it, and both are the caller's.
 *
 * `question` is a string because a question is one sentence and a question mark
 * ends it, and a node here would let a caller compose a heading out of an emphasis
 * and a link, which is a different Item. `answer` is a node because an answer is
 * rarely one sentence: three of the four products that would install this put a
 * link or a code sample inside it.
 */
export type Faq01Question = {
  /** Stable identity, and the accordion item's value. */
  id: string
  /** The question, as the caller writes it. */
  question: string
  /** The answer, as the caller composes it. */
  answer: ReactNode
}

/**
 * The props a Faq01 takes.
 *
 * Every string is a prop and the Block ships none: no question, no answer and no
 * contact label. The contact label in particular is a sentence, and it is the
 * sentence that says what a reader gets by asking, which is the sentence a
 * marketing page most often gets wrong and never on purpose.
 */
export type Faq01Props = {
  /** Optional label above the section title. See the No-Default-Eyebrow Rule. */
  eyebrow?: ReactNode
  /**
   * The section title.
   *
   * Required, unlike most Blocks in this package, and the reason is short: a
   * question list with no heading is a set of questions floating on a page, and a
   * reader who arrived from a search has nothing to orient against. A page that
   * already owns a heading for these questions composes `Accordion` directly
   * instead, and that is the honest answer rather than making this Block render
   * nothing useful under no title.
   */
  title: ReactNode
  /** One or two sentences under the title. */
  description?: ReactNode
  /**
   * The questions, in the order a reader should meet them.
   *
   * Order is the caller's and it is not a small thing: a list of questions is a
   * set of objections, and the order is the answer to which objection the reader
   * has by the third row.
   */
  questions: readonly Faq01Question[]
  /**
   * Which form the list takes.
   *
   * `accordion` is the default because most of a FAQ is a set of questions a
   * reader has not thought of yet, and a collapsed answer is a question they have
   * not decided to spend anything on. `list` is for the reader who has already
   * scanned the page and wants to compare two answers at once, and no single
   * rendering serves both.
   *
   * @defaultValue 'accordion'
   */
  format?: 'accordion' | 'list'
  /**
   * The way out for a reader whose question is not on this page.
   *
   * A label and a destination rather than a node, because the honest contact
   * control is always a link to a place a human reads, and a node here would let a
   * consumer ship a control that goes nowhere. The label is a prop because it is a
   * sentence: "Still stuck, talk to us" and "Ask an engineer" are two products'
   * voices, and a button is the worst place for Prism to have one.
   */
  contact?: { label: string; href: string }
  /** Heading level for the section title. See `HeadingLevel`. */
  headingLevel?: HeadingLevel
  /** Layout classes for the list. Layout only; every visual property is Prism's. */
  className?: string
}

/**
 * A question and answer list, with the section heading and an optional way to ask
 * a question that is not on the page.
 *
 * **The accordion is the default, and the list form exists for the reader the
 * accordion cannot serve.** A reader who has just arrived at this section has not
 * decided what they want to know, so a collapsed answer is a question they have not
 * chosen to spend anything on, and asking four questions costs four taps. A reader
 * who has scanned the page and wants to weigh two answers against each other wants
 * them all open at once, and a design system that only ships the accordion makes
 * that reader open four panels by hand to get there. Both are real readers, the
 * two forms cost about a page of CSS between them, and picking one would have meant
 * the other reader was worse served by a decision made once in a design system
 * rather than once in a page.
 *
 * **The keyboard model is `Accordion`'s and this Block does not re-derive it.** The
 * trigger is a real button, the panel is linked to it by the library, Enter or
 * Space opens the focused item, and the header announces its expanded state. The
 * cost of composing rather than deriving is that this Block cannot add a behaviour
 * to the accordion without forking the Component, and the benefit is that the
 * behaviour a keyboard reader meets here is the one they meet in a settings panel,
 * which is the entire reason this package has a Component layer.
 *
 * **The list form is a definition list, and that is `NoteGrid01`'s decision
 * borrowed rather than a new one.** A question is a term and its answer is that
 * term's explanation, and a `dl` is what tells a screen reader so: it announces
 * "the question, the answer" per pair rather than reading eight questions and then
 * eight paragraphs and leaving a reader to pair them up. The alternative was a
 * `ul` of `li`s with a bold line and a paragraph in each, which is the same
 * document with the structure taken out of it.
 *
 * **The contact control is a real `CtaLink`, under the last answer, and its label
 * is a prop.** It is a link rather than a button because it goes somewhere, and a
 * button that navigates nothing is announced as a command that does nothing. It
 * sits under the list rather than beside the heading because a reader who has read
 * eight answers and found none of them is in a different frame of mind from one
 * who has read nothing, and the sentence they need is the one that acknowledges
 * it.
 *
 * It is a server Component: no hook, no state and no client code of its own. The
 * `accordion` form composes `Accordion`, which ships its own client directive
 * because it owns the open set, so a consumer pays for the accordion and not for
 * this Block, and a consumer who uses `format="list"` pays for neither.
 */
export function Faq01({
  eyebrow,
  title,
  description,
  questions,
  format = 'accordion',
  contact,
  headingLevel = 'h2',
  className,
}: Faq01Props) {
  return (
    <Section>
      <SectionHeading
        as={headingLevel}
        align="left"
        eyebrow={eyebrow}
        title={title}
        description={description}
        className="mb-10"
      />

      <div
        data-slot="faq"
        data-format={format}
        className={cn('flex max-w-measure flex-col', className)}
      >
        {format === 'accordion' ? (
          <Accordion className="border-t">
            {questions.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <dl data-slot="faq-list" className="border-t">
            {questions.map((item) => (
              <div key={item.id} data-slot="faq-item" className="border-border border-b py-5">
                <dt className="text-sm font-medium text-balance">{item.question}</dt>
                <dd className="text-muted-foreground mt-2 text-pretty text-sm">{item.answer}</dd>
              </div>
            ))}
          </dl>
        )}

        {contact ? (
          <div data-slot="faq-contact" className="mt-8">
            <CtaLink variant="outline" href={contact.href}>
              {contact.label}
            </CtaLink>
          </div>
        ) : null}
      </div>
    </Section>
  )
}

export default Faq01
