import type { ComponentProps, ReactNode } from 'react'

import { cn } from '../../lib/utils'

/**
 * One fact: the term that names it and the value that answers it.
 *
 * `label` is required and `value` is required, because a fact with no value is a
 * heading and a fact with no term is a value with nothing to answer. A fact whose
 * value is a destination passes `href` and gets an anchor, so a reader can
 * follow it rather than read it.
 */
export type Fact = {
  /**
   * The name of the fact, the term side of the pair. It is a label rather than
   * prose: a column of these is read by scanning the left edge, so a term that
   * wraps to two lines costs the whole column its alignment.
   */
  label: ReactNode
  /** The answer. A string, or any node a consumer composes. */
  value: ReactNode
  /**
   * Makes the value a link to where the fact is kept. Omit it for a fact whose
   * value is the whole answer, such as a count or a version.
   */
  href?: string
  /**
   * Opens the destination in a new browsing context, which defaults the link
   * relationship to `noopener noreferrer`. Prism does not decide what counts as
   * external: a cross-origin destination is not by itself a reason to open a tab.
   */
  newTab?: boolean
}

/**
 * The props a FactList takes.
 *
 * The facts are the content and the content is a prop: the list ships no fact,
 * no sample row and no placeholder. An empty list renders nothing rather than an
 * empty frame, so a caller that has nothing to say does not get a bordered box
 * with a title above it.
 */
export type FactListProps = ComponentProps<'dl'> & {
  /**
   * The facts, in the order a reader should meet them. Order is the caller's
   * because it is a claim about importance, and a list that sorted itself would
   * be making that claim on the caller's behalf.
   */
  facts: readonly Fact[]
  /**
   * A heading above the list, for a set of facts that needs to say what it is.
   * Rendered as a `dt`-level caption rather than as a heading, so it does not
   * compete with the document's own outline.
   */
  label?: ReactNode
  /**
   * Layout only, exactly as on every Component. Changing a Prism-owned visual
   * property from here is prohibited.
   */
  className?: string
}

/**
 * A short list of named facts, as a definition list.
 *
 * One job: put a term beside its value in a column a reader can scan, and make
 * the pair a real description list so a screen reader announces the term before
 * the value. Every NaniSoft site states facts beside prose: what a plan costs,
 * what a feed carries, which version a document describes, when a collector went
 * live. Each one re-derived a `<dl>` and each one got the alignment and the
 * term-before-value wiring subtly wrong.
 *
 * It is a Component rather than a Block because it has no content of its own to
 * be passed, and because the fact set is data rather than a section: a Block
 * models a region of a page and this models a shape that appears inside one.
 *
 * The term column is a fixed fraction rather than a content width, so a column
 * of facts lines up down its whole length and a long term pushes the value rather
 * than resizing every other row. Values align to the top, because a value that
 * wraps and a value that does not are both common and centring one of them reads
 * as an error.
 *
 * **The value is set flush left, and the reason is the values rather than the
 * rows.** A right-aligned value is the right answer in a column of figures, where
 * the digits are the same width and the comparison a reader makes is between the
 * ends of them. This Component has no numeric mode, no `tabular-nums` and no
 * monospaced arm, so nothing here is a figure and nothing lines up on its last
 * digit: what lines up is the first letter of each answer, and right alignment
 * moves that edge to a different place on every row. A value long enough to wrap
 * is the case that shows it, because the second line starts wherever the first
 * one ended and the column reads as a mistake rather than as a decision. `text-
 * balance` stays, because it is the same reason it was there: a two-line answer
 * should break where it breaks well, not where the measure runs out.
 *
 * A fact whose value *is* a figure is not the case this loses. A caller that wants
 * a right-aligned figure column composes it: the value is a `ReactNode`, so a
 * caller can pass the span it wants, and Prism holds no opinion about a value it
 * did not lay out.
 *
 * The hairline between rows is `border-border`, so a list of facts reads as a
 * table without becoming one: no header row, because a fact has no column
 * header, and no `Table` semantics, because these are terms and their answers
 * rather than records.
 *
 * A fact with no value renders the term and nothing else, so a caller that is
 * missing an answer shows a gap rather than a blank that reads as a value.
 *
 * It is a server Component: no hook, no context and no client code.
 */
function FactList({ facts, label, className, ...props }: FactListProps) {
  if (facts.length === 0) return null

  return (
    <dl
      data-slot="fact-list"
      className={cn('flex w-full flex-col text-sm', className)}
      {...props}
    >
      {label ? (
        <dt className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
          {label}
        </dt>
      ) : null}
      {facts.map((fact, index) => (
        <div
          key={index}
          data-slot="fact-list-row"
          className="border-border flex items-start justify-between gap-6 border-b py-2 last:border-b-0"
        >
          <dt className="text-muted-foreground shrink-0 font-medium">{fact.label}</dt>
          <dd className="text-left text-balance">
            {fact.href ? (
              <a
                href={fact.href}
                rel={fact.newTab ? 'noopener noreferrer' : undefined}
                target={fact.newTab ? '_blank' : undefined}
                className="underline underline-offset-4 hover:underline"
              >
                {fact.value}
              </a>
            ) : (
              fact.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
}

export { FactList }
