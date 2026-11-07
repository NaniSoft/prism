'use client'

import { useState, type ComponentProps } from 'react'
import { cn } from '../../lib/utils'
import { VARIANT_SIZES, type AssetPresentation } from '../../assets'

/**
 * The class each presentation renders at, spelled out per name so Tailwind emits
 * exactly the ratios the token source authors.
 */
const VARIANT_CLASS: Record<AssetPresentation, string> = {
  hero: 'aspect-hero',
  'wide-hero': 'aspect-wide-hero',
  banner: 'aspect-banner',
  card: 'aspect-card',
  'landscape-thumb': 'aspect-landscape-thumb',
  'square-thumb': 'aspect-square-thumb',
  avatar: 'aspect-avatar',
  product: 'aspect-product',
  logo: '',
  illustration: '',
  icon: 'aspect-icon',
}

const FIT_CLASS: Record<AssetPresentation, string> = {
  hero: 'object-cover',
  'wide-hero': 'object-cover',
  banner: 'object-cover',
  card: 'object-cover',
  'landscape-thumb': 'object-cover',
  'square-thumb': 'object-cover',
  avatar: 'object-cover',
  product: 'object-contain',
  logo: 'object-contain',
  illustration: 'object-contain',
  icon: 'object-contain',
}

/** The props the DSImage accepts. */
export interface DSImageProps extends ComponentProps<'img'> {
  /** The image the reader sees. A path or URL supplied by the caller. */
  src: string
  /**
   * The image's description, and required.
   *
   * Required for the reason `ImageZoom` requires it: an image with no
   * description is a picture a reader sees and does not read. Empty string
   * marks the image decorative when the adjacent name already identifies it.
   */
  alt: string
  /**
   * The presentation to present it at. @defaultValue 'card'
   *
   * The value names a governed ratio, fit and maximum rendered size. There is
   * deliberately no prop for a raw ratio or a raw object-fit: a caller that can
   * name a ratio Prism has not authored has reproduced a decision the tokens
   * own, and the gate for it is the absence of the prop.
   */
  variant?: AssetPresentation
  /** Responsive candidates the browser chooses from. */
  srcSet?: string
  /** The sizes expression that pairs with `srcSet`. */
  sizes?: string
  /** Intrinsic width for layout and the resolution check. */
  width?: number
  /** Intrinsic height for layout and the resolution check. */
  height?: number
  /** Shown when `src` fails to load, while the fallback loads. */
  fallbackSrc?: string
  /** Layout only, exactly as on every Component. */
  className?: string
}

/**
 * An image presented at one governed size, with its own fallback and loading.
 *
 * It is a client Component, because the one thing only client code can do is
 * notice that the image failed and hand over to the fallback. A server
 * Component can render a ratio, a fit and a lazy hint; it cannot tell a broken
 * request from a loaded one, and a broken image painted at the governed ratio
 * still reads as a defect. The cost is a small useState plus an `onError`, and
 * that is the whole price.
 *
 * **The frame is the token, not a class a caller typed.** The stylesheet scans
 * Prism's own source and nothing else, because Tailwind is this package's
 * internal build dependency, so `aspect-[16/9]` a consumer types is a silently
 * missing rule. The nine literal ratio classes in the record above are what the
 * build emits, so a presentation reaches the browser as a rule that exists.
 *
 * **No width or height prop is a presentation, and that is the point.** A caller
 * who can set a pixel height has also chosen the size a governance layer exists
 * to hold. `width` and `height` here are the *source* dimensions the browser
 * uses to reserve the frame and the reader uses to check the 2x minimum, not a
 * rendered size. They flow to the element as attributes and to the DOM as
 * `data-source-width` / `data-source-height`, so a substituted or undersized
 * source is visible in the markup.
 *
 * **It holds no state about the page.** The magnification belongs to `ImageZoom`,
 * the dialog to `Lightbox`, and the deck to `Carousel`. This Component holds
 * only whether a source errored, which is a decision about this visit and this
 * picture.
 *
 * It is a client Component, because it holds loading state and answers an error.
 */
function DSImage({
  src,
  alt,
  variant = 'card',
  srcSet,
  sizes,
  width,
  height,
  fallbackSrc,
  loading = 'lazy',
  className,
  ...props
}: DSImageProps) {
  const [errored, setErrored] = useState(false)
  const shown = errored && fallbackSrc ? fallbackSrc : src
  return (
    <span
      data-slot="ds-image"
      data-variant={variant}
      className={cn('relative block w-full overflow-hidden', VARIANT_CLASS[variant], className)}
    >
      <img
        data-slot="ds-image-element"
        src={shown}
        alt={alt}
        width={width}
        height={height}
        srcSet={errored ? undefined : srcSet}
        sizes={sizes ?? (srcSet ? VARIANT_SIZES[variant] : undefined)}
        loading={loading}
        decoding="async"
        data-source-width={width ?? ''}
        data-source-height={height ?? ''}
        onError={() => {
          if (fallbackSrc && !errored) setErrored(true)
        }}
        className={cn('absolute inset-0 size-full bg-muted', FIT_CLASS[variant])}
        {...props}
      />
    </span>
  )
}

export { DSImage }
