import type { ComponentProps } from 'react'
import { cn } from '../../lib/utils'

/** The heights a logo may be drawn at, as authored spacing. */
export type DSLogoSize = 'sm' | 'md' | 'lg'

const HEIGHT_CLASS: Record<DSLogoSize, string> = {
  sm: 'h-6',
  md: 'h-8',
  lg: 'h-12',
}

/** The props the DSLogo accepts. */
export interface DSLogoProps extends Omit<ComponentProps<'img'>, 'height'> {
  /** The logo file. A path or URL supplied by the caller. */
  src: string
  /**
   * The logo's description, and required.
   *
   * A logo carries the name a reader pays to decode; an unnamed logo is a shape
   * with a colour. Decorative logos are the one exception and an empty string
   * says so, because then the words beside it already name it.
   */
  alt: string
  /** The drawn height. @defaultValue 'md' */
  size?: DSLogoSize
  /** Layout only, exactly as on every Component. */
  className?: string
}

/**
 * A brand logo presented at a governed height, contained rather than cropped.
 *
 * **Intrinsic, because a logo's size is information the asset contains.** There
 * is no ratio token for it and no height prop a caller can set beyond the three
 * governed heights: a logo cropped to a ratio is a wordmark with its ends in
 * the margins. `object-contain` fills the height and keeps the width the file
 * carries, so a lockup keeps its proportions at every drawn size.
 *
 * **Separate from `DSIcon`, and that is the point.** A UI icon is `currentColor`
 * and answers to the ink around it; a brand logo is a fixed colour with a
 * written exemption on its manifest entry, because it renders in chrome, on a
 * favicon and in a document viewer where the token cascade does not run. One
 * Component for both jobs would have to guess which contract each caller meant.
 *
 * It is a server Component. It holds no state and reads nothing.
 */
function DSLogo({ src, alt, size = 'md', className, ...props }: DSLogoProps) {
  return (
    <img
      data-slot="ds-logo"
      data-logo-size={size}
      src={src}
      alt={alt}
      className={cn(HEIGHT_CLASS[size], 'w-auto max-w-full object-contain', className)}
      {...props}
    />
  )
}

export { DSLogo }
