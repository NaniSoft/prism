'use client'

import { Avatar, AvatarFallback, AvatarImage, type AvatarProps } from './avatar'
import { cn } from '../../lib/utils'
import { validateRasterSize } from '../../assets'

/** The sizes a governed avatar may be drawn at, matching the avatar tokens. */
export type DSAvatarSize = 'sm' | 'md' | 'lg'

const SIZE_CLASS: Record<DSAvatarSize, string> = {
  sm: 'size-8',
  md: 'size-10',
  lg: 'size-16',
}

const INK_CLASS: Record<DSAvatarSize, string> = {
  sm: 'text-xs',
  md: 'text-xs',
  lg: 'text-sm',
}

/** The props the DSAvatar accepts. */
export type DSAvatarProps = Omit<AvatarProps, 'className'> & {
  /**
   * The person's image. Omit it, or pass a URL that fails, for the initials.
   */
  src?: string
  /**
   * The person's name, and required.
   *
   * Required because it is what the initials are derived from, what the image's
   * alternative text says, and what a caller who has no photograph still has: a
   * disc with no name behind it is a shape, and a shape is not a person.
   */
  name: string
  /** The drawn size. @defaultValue 'md' */
  size?: DSAvatarSize
  /**
   * The source image's dimensions, when the caller knows them.
   *
   * Passed through to the element and reported on the DOM, so a source that is
   * under the avatar target of 256px is legible as a `data-resolution-warning`
   * rather than silent. A missing pair is not a failure: most avatar sources
   * come from an identity provider that does not state them, and the fallback
   * initials cover the reader while the image loads.
   */
  width?: number
  /** See `width`. */
  height?: number
  /** Layout only, exactly as on every Component. */
  className?: string
}

/**
 * The governed person image: one size, initials when there is no picture.
 *
 * **A size from three, not a `className` a caller typed.** `Avatar` is sized
 * through `className`, which is the law every Component in this package carries:
 * a utility this package's stylesheet does not contain is a rule that never
 * reaches the browser. Three authored sizes bound the disc to the avatar tokens
 * (32, 40, 64px) and the initials to their step, so a disc and its letters stay
 * in step by construction.
 *
 * **The source is held to the avatar target, in the open.** An avatar is at least
 * 256px at source, because below that a 64px disc on a 2x display paints pixels
 * it does not have. When the caller states the source size and it falls short,
 * the reason is written on the element as `data-resolution-warning` rather than
 * thrown: most portrait sources arrive without stated dimensions, and an
 * avatar is a recommendation, not a rejection threshold.
 *
 * It is a client Component, because `Avatar` is one: the image loading status is
 * client work, and this Component composes it.
 */
function DSAvatar({ src, name, size = 'md', width, height, className, ...props }: DSAvatarProps) {
  const warning = validateRasterSize(width ?? null, height ?? null, 'avatar')
  const words = name.trim().split(/\s+/).filter(Boolean)
  const initials = words.length === 0 ? '' : words.length === 1 ? words[0].slice(0, 2).toUpperCase() : `${words[0].charAt(0)}${words[words.length - 1].charAt(0)}`.toUpperCase()
  return (
    <Avatar
      data-slot="ds-avatar"
      data-avatar-size={size}
      data-resolution-warning={warning ?? undefined}
      className={cn(SIZE_CLASS[size], className)}
      {...props}
    >
      {src === undefined ? null : <AvatarImage src={src} alt={name} />}
      <AvatarFallback className={cn(INK_CLASS[size])}>{initials}</AvatarFallback>
    </Avatar>
  )
}

export { DSAvatar }
