import type { ComponentProps, ReactNode } from 'react'

import { cn } from '../../lib/utils'
import { AspectRatio } from './aspect-ratio'

/**
 * One caption or description track, and the words a reader meets it under.
 *
 * Exported because a caller builds a list of these from their own localisation
 * data and would otherwise repeat the shape at every call site.
 */
export type VideoPlayerTrack = {
  /** The WebVTT file the browser fetches the cues from. */
  src: string
  /**
   * The language the cues in that file are written in, as a BCP 47 tag.
   *
   * Required because it is the tag the browser matches against the reader's own
   * language list to decide which track to offer first, and a track with no tag
   * is never preferred for anybody. It is not a claim a consumer makes lightly
   * either: a file labelled `en` that carries translated cues is a caption track
   * that will be served to an English reader who cannot read them.
   */
  srcLang: string
  /**
   * The name this track is listed under in the browser's own track menu.
   *
   * Required, and it is the caller's word for a reason that is sharper here than
   * anywhere else in this package: the browser renders this string verbatim, in
   * the platform's own control bar, in a font and a language Prism does not get
   * to choose. "English" and "English (UK)" and "English, audio description" are
   * three different things to a reader and only the consumer knows which one this
   * file is. Prism writing a default would put an English word into the
   * platform's own menu of a product that may not use English.
   */
  label: string
  /**
   * What the track carries, and required rather than defaulted.
   *
   * `captions` is the dialogue and everything that carries meaning with it: the
   * speaker names, the sound that is not speech, the text on the screen.
   * `descriptions` is the audio description, a second track of what the picture
   * is doing, written to be read in the gaps between the captions.
   *
   * There is no default because the two are not interchangeable and a browser
   * cannot tell them apart: it renders both in the same menu and a description
   * filed as a caption is read out over the dialogue. The three other kinds the
   * HTML specification allows are deliberately absent. `subtitles` is a
   * translation of dialogue that already exists as captions, and a file per
   * language is the correct shape for that rather than two tracks claiming the
   * same dialogue. `chapters` is a menu this Component does not read and has no
   * vocabulary for. `metadata` is not rendered by any browser at all, so offering
   * it would be a prop that quietly does nothing.
   */
  kind: 'captions' | 'descriptions'
  /**
   * Whether the browser turns this track on without being asked.
   *
   * At most one track in a list should say so, and which one is the caller's
   * because which language the reader reads is not knowable from here. A video
   * whose every track leaves this off plays with no captions on, which is the
   * default this Component exists to make a decision about rather than inherit.
   */
  default?: boolean
}

/** The props the VideoPlayer accepts. */
export interface VideoPlayerProps extends Omit<ComponentProps<'div'>, 'children'> {
  /** The file the browser plays. Progressive, and the caller's to choose. */
  src: string
  /**
   * The captions, and required.
   *
   * Required rather than optional, and an empty array is an answer rather than an
   * omission: it says the video carries no dialogue and nothing that needs
   * transcribing, which is true of a screen recording of a cursor and not true of
   * a recorded stand-up. Making it required means the question is asked at build
   * time, and an optional prop is a question nobody asks. It is the one prop here
   * whose absence would be a WCAG 1.2.2 failure for most of the videos a B2B
   * product ships, and a Component that made it optional would be making that
   * decision quietly on the consumer's behalf.
   */
  captions: readonly VideoPlayerTrack[]
  /**
   * The name a screen reader reads for the element itself, and required.
   *
   * A `<video>` has no name of its own. Its poster is announced as an image, its
   * caption track labels are only reachable by opening the browser's own track
   * menu, and a video that is not playing announces almost nothing at all. So the
   * name is the caller's and it is required, because the alternative is Prism
   * inventing one and publishing it as part of this Component's interface.
   */
  label: string
  /**
   * The image shown before the video plays, and the caller's.
   *
   * A poster is a claim about the content, so this Component does not compose
   * one: a gradient with a play triangle on it tells a reader that the video
   * starts immediately and is about to start, which is a claim about a consumer's
   * file that nobody can check from here. A caller who wants a poster draws it, and
   * a caller who wants the browser's own first frame gets it by passing none.
   */
  poster?: string
  /**
   * The ratio the frame holds, as width over height. @defaultValue 16 / 9
   *
   * Passed to `AspectRatio`, so an undrawable ratio falls back the same way it
   * does everywhere else in this package, and a caller who wants the frame to be
   * exactly as tall as the video can pass the file's own dimensions once at
   * upload time.
   */
  ratio?: number
  /**
   * Whether the browser's own control bar is drawn. @defaultValue true
   *
   * On by default and the reason is worth the whole paragraph. The platform's
   * controls are the only control surface Prism can be confident is operable by
   * keyboard, announced correctly by a screen reader, and already translated into
   * the reader's language by the reader's own platform. Every custom control bar
   * this package could draw instead would be a re-derivation of that, and the
   * honest accounting of a video player written from scratch is that its controls
   * are the part that ships the bugs.
   */
  showControls?: boolean
  /**
   * The tokens in the browser's own `controlsList`, in the caller's words.
   *
   * Passed straight through, because the tokens are the platform's and this
   * Component has no opinion on which of them a product should withhold. A string
   * rather than an array of booleans because the attribute is a space-separated
   * list by specification, and the browser ignores the ones it does not know, so
   * passing tokens for a browser that does not implement them is harmless.
   */
  controlsList?: string
  /** How much the browser fetches before the reader presses play. @defaultValue 'metadata' */
  preload?: 'none' | 'metadata' | 'auto'
  /**
   * Whether the video plays inside its frame rather than taking the screen.
   *
   * @defaultValue true
   *
   * A default rather than an omission, because the platform default on a phone is
   * to take the whole screen, and a reader who taps a diagram in a document and
   * is thrown into a full-screen player has lost the document. A caller whose
   * video really is better full screen turns this off.
   */
  playsInline?: boolean
  /**
   * The caller's own controls, drawn under the frame.
   *
   * A slot and not a set of props, because every control that goes here is one
   * Prism refuses to own: a play button is the media engine's, a chapter list is
   * the caller's data, a speed menu is a preference Prism does not hold. What the
   * slot buys is a place to draw them beside a frame that is already the right
   * shape. The cost is the one this Component's central decision already names:
   * nothing here works until the caller wires it to the element, because Prism
   * never touches the media element and exposes no handle to it.
   */
  controls?: ReactNode
  /**
   * The words of the video, in the caller's own markup.
   *
   * A slot rather than a prop of type string because a transcript is not a string:
   * it is headings, timestamps, speaker names and paragraphs, and a Component that
   * took a flat string would force all of that into one block with no structure a
   * reader can navigate. It is where an audio description belongs in text form,
   * which is the only form of a description a reader can skim, search, translate
   * or read with a screen reader that will not read the description track aloud.
   */
  transcript?: ReactNode
  /** Layout only, exactly as on every Component. */
  className?: string
}

/**
 * A video surface with the caller's source, poster, caption tracks and controls.
 *
 * **It owns no player engine, and that is the decision rather than a limitation
 * this Component could not afford.** There is no media library in this package and
 * no embed SDK, and the reason is that a player engine is not a Component. A
 * player is a decode pipeline, a buffering policy, an adaptive-bitrate ladder, a
 * DRM boundary and a set of vendor fallbacks, and every one of those is a
 * product's decision about its own content and its own reach. Shipping one would
 * put a JavaScript runtime in the bundle of every consumer who wanted a framed
 * `<video>`, and it would put it there whether or not that consumer ever played
 * anything, which is the cost the client-JavaScript budget in `DESIGN.md` exists
 * to refuse. So this Component is a styled `<video>` element with a frame, a
 * caption track list and two slots, and the engine is the one every browser
 * already has.
 *
 * **A styled element with two slots, rather than a slot-only container, and the
 * reason is who owns the semantics.** A container with a `children` slot would be
 * smaller and would ship nothing at all: no track list, no poster, no ratio, no
 * `controls` decision, no `playsInline` default. Every one of those would then be
 * assembled by the consumer, and every one of them is a place where a video
 * silently becomes inaccessible: a `<track>` with no `label` is a track a screen
 * reader announces as an unnamed entry, a `<video>` with no `playsInline` throws
 * a phone reader out of the document, and a `<video controls>` is the one control
 * surface in this Component's story that is already correct. A Component that
 * owned none of that would be a Component whose entire job was to be an element
 * with a border, which is a class and not a Component. What it owns is the part
 * that must not be optional: the required caption list, the required name, the
 * frame's ratio, the default control surface and the poster as the caller's
 * image.
 *
 * **The honest cost is that Prism cannot help with a custom control bar.** The
 * `controls` slot is where a caller's own controls go and it is a plain box: this
 * Component holds no reference to the media element, exposes no imperative handle,
 * and offers no state, so a caller who wants a play button of their own has to
 * reach for the element themselves with a `ref`, a `useRef` and the platform's own
 * `play()`, `pause()`, `currentTime` and `volume` properties. That is the deal,
 * and it is a deal with a real bill: every control a caller builds is a control
 * they must make keyboard operable, announce, localise, test and keep in step with
 * the media element's own state, and Prism will not catch them when they get it
 * wrong. A Component that handed out a handle and a state machine would be able to
 * catch some of that, and would also be the engine this Component refuses to be.
 * The answer for a consumer who wants both is that the platform's controls are on
 * by default for exactly this reason, and that a custom bar is a request upstream
 * rather than something to assemble from a `ref` beside this Component.
 *
 * **Autoplay is refused rather than left out by accident.** There is no `autoPlay`
 * prop, no `loop` and no `muted`. A video that starts on its own with sound is an
 * accessibility failure and one no consumer should have to opt out of, and a video
 * that starts silently is a claim about the content that only the consumer's file
 * can support. A caller who has an autoplaying loop wants a plain `<video>` in a
 * `className` of their own, not a design system asserting that sound is optional.
 *
 * **Nothing here is animated.** The frame is a box with a border, the poster is
 * the browser's own cross-fade to the first frame, and the control bar is the
 * platform's. There is no fade on mount, no play-button pulse and no loading
 * shimmer, because DESIGN.md's first motion law is that motion is state feedback
 * and a video surface has no state of its own to report.
 *
 * It is a server Component, and that is a consequence rather than an accident: it
 * holds no state, reads no context, attaches no handler and takes no function
 * prop, so a page with a dozen videos costs no JavaScript from this package at
 * all. Everything that needs a runtime is the consumer's, which is the same
 * argument `FilterPanel` makes and the reason this could be a plain `div` at all.
 */
function VideoPlayer({
  src,
  captions,
  label,
  poster,
  ratio,
  showControls = true,
  controlsList,
  preload = 'metadata',
  playsInline = true,
  controls,
  transcript,
  className,
  ...props
}: VideoPlayerProps) {
  return (
    <div data-slot="video-player" className={cn('flex flex-col gap-3', className)} {...props}>
      {/*
       * The frame is `AspectRatio` rather than a box drawn here, so the ratio has
       * one implementation in this package and a caller who passes a ratio that
       * cannot be drawn gets the same substitution, the same fallback and the same
       * `data-ratio` on the element as everywhere else.
       */}
      <AspectRatio ratio={ratio} className="bg-muted/40 rounded-xl border">
        <video
          data-slot="video-player-video"
          className="size-full object-contain"
          src={src}
          poster={poster}
          controls={showControls}
          controlsList={controlsList}
          preload={preload}
          playsInline={playsInline}
          aria-label={label}
        >
          {/*
           * The tracks are children of the element and not siblings of it, which
           * is the specification and not a style choice: a `<track>` outside a
           * `<video>` is inert, so a caption list assembled one element up is a
           * caption list the browser never reads and the reader never hears. Each
           * one is keyed on its source rather than its index because a caller
           * swapping the current track must not remount the others and restart
           * their cues.
           */}
          {captions.map((track) => (
            <track
              key={track.src}
              data-slot="video-player-track"
              kind={track.kind}
              src={track.src}
              srcLang={track.srcLang}
              label={track.label}
              default={track.default}
            />
          ))}
        </video>
      </AspectRatio>

      {/*
       * The caller's controls, in a column rather than a row. A row would have to
       * guess how wide each control is and would put a chapter list and a play
       * button on one line, and the box here is a place to draw rather than an
       * arrangement to impose.
       */}
      {controls === undefined ? null : (
        <div data-slot="video-player-controls" className="flex flex-col gap-2">
          {controls}
        </div>
      )}

      {transcript === undefined ? null : (
        <div data-slot="video-player-transcript" className="text-muted-foreground text-sm">
          {transcript}
        </div>
      )}
    </div>
  )
}

export { VideoPlayer }