import type { ComponentProps } from 'react'

import { cn } from '../../lib/utils'

/**
 * A bordered surface for a small group of related content.
 *
 * Compose it from `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`
 * and `CardFooter`. Those parts ship from this module rather than as separate
 * subpaths.
 */
function Card({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card"
      className={cn(
        'bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm',
        className,
      )}
      {...props}
    />
  )
}

/**
 * The head of a card: the row above the card's content.
 *
 * A part rather than an Item, and it stays inside this module: `CardHeader` is not
 * a second catalogue entry, and DESIGN.md's authoring contract says compound parts
 * ship from their parent module and do not form a second vocabulary.
 */
function CardHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        '@container/card-header grid auto-rows-min items-start gap-1.5 px-6',
        className,
      )}
      {...props}
    />
  )
}

/**
 * The card's title: the one line that names the group of related content.
 *
 * Renders a `div` rather than a heading, because a card's title is not always the
 * heading of the region it sits in: four cards in a grid are four titles under one
 * section heading, and four `h3`s under one `h2` is right while four `h2`s is
 * four sections. Pass Prism's `Heading` inside it when the card is the only thing
 * in its region and the outline should say so.
 */
function CardTitle({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={cn('font-semibold leading-none', className)}
      {...props}
    />
  )
}

/**
 * The supporting line under a card's title: one sentence about what the card
 * holds.
 */
function CardDescription({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
}

/** The card's body: the content the title and description introduce. */
function CardContent({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="card-content" className={cn('px-6', className)} {...props} />
}

/**
 * The foot of a card: the actions that belong to the card rather than to the
 * page.
 */
function CardFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn('flex items-center px-6', className)}
      {...props}
    />
  )
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
