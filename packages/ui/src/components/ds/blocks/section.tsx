import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

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

export function SectionHeading({
  eyebrow,
  title,
  as: Heading = 'h2',
  description,
  align = 'center',
  className,
}: {
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  align?: 'center' | 'left'
  /**
   * Heading level. Defaults to `h2` because blocks compose under a page heading.
   * A page that renders a block as its primary heading passes `as="h1"` — a
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
