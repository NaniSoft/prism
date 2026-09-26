'use client'

import { Avatar as AvatarPrimitive } from '@base-ui/react/avatar'
import type { ComponentProps } from 'react'

import { cn } from '../../lib/utils'

/** The props the Avatar forwards to its Base UI root. */
export interface AvatarProps extends ComponentProps<'span'> {}

/**
 * The props the AvatarImage forwards to Base UI.
 *
 * Declared here rather than re-exported from Base UI so no upstream type
 * crosses the package seam (ticket 07 section 6).
 */
export interface AvatarImageProps extends ComponentProps<'img'> {
  /** Called when the image loading status changes. */
  onLoadingStatusChange?: (status: 'idle' | 'loading' | 'loaded' | 'error') => void
  /** Whether the image stays mounted and loads in place. @defaultValue false */
  keepMounted?: boolean
}

/**
 * The props the AvatarFallback forwards to Base UI.
 *
 * Declared here rather than re-exported from Base UI so no upstream type
 * crosses the package seam (ticket 07 section 6).
 */
export interface AvatarFallbackProps extends ComponentProps<'span'> {
  /** How long to wait before showing the fallback, in milliseconds. @defaultValue 0 */
  delay?: number
}

/**
 * A person or entity's image, with initials as the fallback.
 *
 * Always render an `AvatarFallback`: it covers the moment before the image
 * loads and the case where it never does, so the control is never an empty
 * circle. Give `AvatarImage` a meaningful `alt`, or leave it empty when the
 * adjacent name already identifies the person. Size the root with
 * `className`; the image and fallback fill it.
 */
function Avatar({ className, ...props }: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        'relative flex size-10 shrink-0 overflow-hidden rounded-full',
        className,
      )}
      {...props}
    />
  )
}

/** The Avatar's image. Renders an `<img>` and reports its loading status. */
function AvatarImage({ className, ...props }: AvatarImageProps) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn('aspect-square size-full object-cover', className)}
      {...props}
    />
  )
}

/**
 * What the Avatar shows when the image is missing or still loading.
 *
 * Typically initials, but any short node works. It is only rendered while the
 * image is unavailable, so it is not read twice by a screen reader.
 */
function AvatarFallback({ className, ...props }: AvatarFallbackProps) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        'bg-muted text-muted-foreground flex size-full items-center justify-center rounded-full text-xs font-medium',
        className,
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }
