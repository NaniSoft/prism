import type { AspectRatioProps } from './aspect-ratio'
import { VideoPlayer, type VideoPlayerProps } from './video-player'
import type { AssetPresentation } from '../../assets'

const RATIO_OF: Partial<Record<AssetPresentation, number>> = {
  hero: 16 / 9,
  'wide-hero': 21 / 9,
  banner: 3,
  card: 4 / 3,
  'landscape-thumb': 16 / 9,
  'square-thumb': 1,
  avatar: 1,
  product: 1,
  icon: 1,
}

/** The props the DSVideo accepts. */
export type DSVideoProps = Omit<VideoPlayerProps, 'ratio'> & {
  /**
   * The presentation the frame holds. @defaultValue 'hero'
   *
   * A ratio token, not a number: a caller that can state a number Prism has not
   * authored has chosen a frame nobody published. `logo` and `illustration`
   * carry no ratio, so a video has no presentation under those names; the type
   * carries only the nine that do.
   */
  variant?: Exclude<AssetPresentation, 'logo' | 'illustration'>
}

/**
 * A video presented at one governed size, with the platform's own controls.
 *
 * **The low-level surface stays `VideoPlayer`, and this is the governed one.**
 * `VideoPlayer` owns the media element itself: the caption track list, the
 * required name, the poster as the caller's image, and the browser's own control
 * bar that needs no locomotion to be keyboard operable. `DSVideo` is the
 * consumer's answer to "play this at the hero ratio": it takes a presentation
 * and reads its ratio from `VARIANT_RATIOS` once, so every video the page holds
 * is held at a ratio the token source authors, and the number lives in one
 * record rather than in a prop a caller typed.
 *
 * **No autoplay, no loop, no muted.** A video that starts with sound is an
 * accessibility failure, and one that starts silently is a claim only the
 * caller's file can support. A caller with an autoplaying loop draws a plain
 * video in a `className` of their own.
 *
 * It is a server Component. It holds no state, reads no context, and costs no
 * JavaScript: the controls are the browser's.
 */
function DSVideo({ variant = 'hero', ...props }: DSVideoProps) {
  return (
    <VideoPlayer
      {...props}
      ratio={RATIO_OF[variant] as AspectRatioProps['ratio']}
    />
  )
}

export { DSVideo }
