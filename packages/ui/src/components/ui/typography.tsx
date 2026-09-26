import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps, ElementType } from 'react'

import { cn } from '../../lib/utils'

/** The six heading elements `Heading` can render. */
export type HeadingElement = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

const headingVariants = cva('font-semibold tracking-tight text-balance', {
  variants: {
    size: {
      '4xl': 'text-3xl sm:text-4xl',
      '3xl': 'text-3xl',
      '2xl': 'text-2xl',
      xl: 'text-xl',
      lg: 'text-lg',
    },
  },
  defaultVariants: { size: '2xl' },
})

/**
 * A heading at one step of the type scale.
 *
 * `as` chooses the element and therefore the document outline; `size` chooses
 * the visual step. The two are separate on purpose: a section that needs an
 * `h2` attuned to a compact card can keep the outline while taking `size="lg"`.
 */
function Heading({
  className,
  size,
  as: Tag = 'h2',
  ...props
}: ComponentProps<'h2'> &
  VariantProps<typeof headingVariants> & { as?: HeadingElement }) {
  const Element = Tag as ElementType
  return (
    <Element
      data-slot="heading"
      className={cn(headingVariants({ size }), className)}
      {...props}
    />
  )
}

const textVariants = cva('text-pretty', {
  variants: {
    size: {
      sm: 'text-sm leading-relaxed',
      base: 'text-base leading-relaxed',
      lg: 'text-lg leading-relaxed',
    },
    tone: {
      default: 'text-foreground',
      muted: 'text-muted-foreground',
    },
  },
  defaultVariants: { size: 'base', tone: 'default' },
})

/**
 * A run of body text at one step of the type scale.
 *
 * `as` defaults to `p`; pass `span` for an inline run. `tone="muted"` is the
 * supporting copy that sits beside a heading.
 */
function Text({
  className,
  size,
  tone,
  as: Tag = 'p',
  ...props
}: ComponentProps<'p'> &
  VariantProps<typeof textVariants> & { as?: 'p' | 'span' }) {
  const Element = Tag as ElementType
  return (
    <Element
      data-slot="text"
      className={cn(textVariants({ size, tone }), className)}
      {...props}
    />
  )
}

export { Heading, Text }
