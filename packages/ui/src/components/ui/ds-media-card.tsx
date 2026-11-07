import type { ComponentProps, ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card'
import { DSImage } from './ds-image'
import type { AssetPresentation } from '../../assets'

/** The props a DSMediaCard takes. */
export type DSMediaCardProps = Omit<ComponentProps<'div'>, 'title'> & {
  /** The medium the card carries, drawn at the card presentation. */
  image: { src: string; alt: string; srcSet?: string; sizes?: string; width?: number; height?: number; fallbackSrc?: string }
  /** The name of the thing the medium shows, in the caller's words. */
  title: ReactNode
  /** One or two sentences under the title, in the caller's words. */
  description?: ReactNode
  /** The presentation the medium is held at. @defaultValue 'card' */
  variant?: AssetPresentation
  /** The actions that belong to the card rather than to the page. */
  footer?: ReactNode
  /** Layout only, exactly as on every Component. */
  className?: string
}

/**
 * A card whose medium is presented at one governed size.
 *
 * **The medium is `DSImage` at the `card` presentation unless the caller names
 * another.** A picture card whose image a caller sizes with a class is a card
 * whose picture a consumer re-rendered at a size nobody published: the ratio
 * the card holds is the decision this Component exists to make once. The title
 * and the description are slots, because a card that shipped its own words
 * would install a claim about somebody else's product, and a card that took
 * none would be a frame with no name.
 *
 * **Distinct from `Card`, and the difference is the medium.** `Card` is the
 * bordered surface a small group of related content sits on; this is that
 * surface with the one governed picture a card of this kind cannot be without.
 * A card with no medium is a `Card` with its own parts, and a card that wants a
 * different medium wants `DSImage` composed into its own `Card` rather than a
 * second card here.
 *
 * It is a server Component. It holds no state; the state the medium needs
 * lives inside `DSImage`.
 */
function DSMediaCard({ image, title, description, variant = 'card', footer, className, ...props }: DSMediaCardProps) {
  return (
    <Card data-slot="ds-media-card" className={className} {...props}>
      <DSImage
        src={image.src}
        alt={image.alt}
        variant={variant}
        srcSet={image.srcSet}
        sizes={image.sizes}
        width={image.width}
        height={image.height}
        fallbackSrc={image.fallbackSrc}
      />
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description === undefined ? null : <CardDescription>{description}</CardDescription>}
      </CardHeader>
      {footer === undefined ? null : (
        <CardContent>
          <CardFooter className="px-0 pt-0">{footer}</CardFooter>
        </CardContent>
      )}
    </Card>
  )
}

export { DSMediaCard }
