import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

/**
 * Container primitive. Every block composes its own section from this so vertical
 * rhythm stays consistent across the catalog instead of being re-invented per block.
 */
export function Section({
  className,
  children,
  ...props
}: React.ComponentProps<'section'>) {
  return (
    <section
      className={cn('py-16 sm:py-24', className)}
      {...props}
    >
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-8">
        {children}
      </div>
    </section>
  )
}

/**
 * The six heading levels a block can be composed at.
 *
 * Every block takes a `headingLevel` prop typed with this and forwards it to the
 * one heading it renders, so the surrounding document decides where the block
 * sits in the outline rather than the block deciding for itself. `h2` is the
 * default because a block is composed, not a page.
 *
 * A block rendered where the document *already* owns a heading for the same
 * content passes one level deeper. A catalog card already names the block in its
 * own `h2`, so the copy of the block embedded inside that card passes `h3`: the
 * embedded heading then reads as a child of the card that introduces it instead
 * of as a second, competing sibling. This is a fact about where the block was
 * placed, not about the block, which is why it is a prop and not a default.
 */
export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

/**
 * The heading a section opens with: an optional eyebrow, the title, an optional
 * supporting line, and the level of the one heading it renders.
 *
 * `align` is the block's own decision about where the heading sits in the
 * container. `center` is right for a band that is only a heading, and `left` is
 * right for a section with content under it, where a centred title above a
 * left-aligned list reads as two unrelated pieces.
 */
export function SectionHeading({
  index,
  eyebrow,
  title,
  as: Heading = 'h2',
  description,
  align = 'center',
  className,
}: {
  /**
   * A short ordinal for the section: "01", "02", "7". It is rendered in the mono
   * face above the title, because a section's position in a sequence is machine
   * notation rather than a word, and the mono stack is what this repository
   * annotates machine-readable values with.
   *
   * It is a separate prop from `eyebrow` and not a default value of it, because
   * the two say different things: an eyebrow is a word a reader reads, and an
   * index is a number that is only meaningful beside the section it counts. All
   * four NaniSoft sites render one of these above every section heading, and
   * three of them render it beside a label rather than above a title, which is
   * the same fact in a different arrangement.
   */
  index?: string
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  align?: 'center' | 'left'
  /**
   * Heading level. Defaults to `h2` because blocks compose under a page heading.
   * A page that renders a block as its primary heading passes `as="h1"`; a
   * document with no `h1` gives screen-reader and search engines no top-level
   * entry point.
   */
  as?: HeadingLevel
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        align === 'center' ? 'items-center text-center' : 'items-start text-left',
        className,
      )}
    >
      {index ? (
        <span className="text-muted-foreground font-mono text-xs font-normal tracking-normal">
          {index}
        </span>
      ) : null}
      {eyebrow ? (
        <span className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
          {eyebrow}
        </span>
      ) : null}
      <Heading className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        {title}
      </Heading>
      {description ? (
        <p className="text-muted-foreground max-w-2xl text-lg text-pretty">
          {description}
        </p>
      ) : null}
    </div>
  )
}
