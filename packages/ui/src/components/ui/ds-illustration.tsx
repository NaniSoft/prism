import type { ComponentProps } from 'react'
import { cn } from '../../lib/utils'

/** The props the DSIllustration accepts. */
export interface DSIllustrationProps extends Omit<ComponentProps<'img'>, 'src' | 'alt'> {
  /** The illustration file. A path or URL supplied by the caller. */
  src: string
  /**
   * The illustration's description, and required.
   *
   * Required for the same reason `DSImage` requires it: an illustration is a
   * claim about what the product does, and an unnamed one is decoration a
   * reader paid to decode. Empty string marks it decorative.
   */
  alt: string
  /** How the browser fetches it. @defaultValue 'lazy' */
  loading?: 'eager' | 'lazy'
  /** Layout only, exactly as on every Component. */
  className?: string
}

/**
 * An illustration presented at its own proportions, contained rather than cropped.
 *
 * **Asset-defined, because an illustration's ratio is information the asset
 * contains.** There is no token for it and no crop that preserves it: cropping
 * an illustration to 16 / 9 cuts the drawing at its own edges. `object-contain`
 * keeps the whole figure inside the column and lets the height follow the
 * width the file carries.
 *
 * **Distinct from `DSImage`, and the difference is a rule rather than a
 * filename.** A `DSImage` at a presentation owns a ratio, a maximum rendered
 * size and a 2x minimum; an illustration owns none of them, because a drawing
 * is judged as a drawing and a photograph is judged as a photograph. One
 * Component for both would be a Component whose contract changed by the kind
 * of file a caller passed.
 *
 * It is a server Component. It holds no state and reads nothing.
 */
function DSIllustration({ src, alt, loading = 'lazy', className, ...props }: DSIllustrationProps) {
  return (
    <img
      data-slot="ds-illustration"
      src={src}
      alt={alt}
      loading={loading}
      decoding="async"
      className={cn('h-auto w-full max-w-full object-contain', className)}
      {...props}
    />
  )
}

export { DSIllustration }
