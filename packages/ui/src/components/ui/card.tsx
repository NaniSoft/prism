import type { ComponentProps, ElementType } from 'react'

import type { HeadingElement } from './typography'

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
 * Renders a `div` by default, because a card's title is not always the heading of
 * the region it sits in: four cards in a grid are four titles under one section
 * heading, and four `h3`s under one `h2` is right while four `h2`s is four
 * sections. So the element is a decision the caller makes with `as`, and a Block
 * that draws a set of titled cards passes `childLevel(headingLevel)` rather than a
 * literal, so the titles follow the section when the block is composed one level
 * deeper than it was written for.
 *
 * An earlier version of this note told a caller to pass Prism's `Heading` inside
 * instead, and that was wrong. `Heading` is a step of the *type* scale and its
 * floor is `lg`; a card title sits at body size, so the only way to use it was to
 * override the size back down, which asks a type-scale component to have no opinion
 * about type. The element and the visual step are separate questions and this is the
 * one that answers the element.
 */
function CardTitle({
  className,
  as: Tag = 'div',
  ...props
}: ComponentProps<'h2'> & { as?: HeadingElement | 'div' }) {
  // The same cast `Heading` makes, and for the same reason: the element is chosen
  // at runtime, so the union of the six headings and a `div` is not one prop type.
  // The props are typed from `h2` rather than `div` because every prop a caller
  // passes to a card title is valid on a heading, and typing from `h2` would stop a
  // caller passing one that only a `div` takes.
  const Element = Tag as ElementType
  return (
    <Element
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
