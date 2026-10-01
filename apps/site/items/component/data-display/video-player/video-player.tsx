'use client'

import { useRef, useState } from 'react'

import { Button } from '@nanisoft/prism-ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@nanisoft/prism-ui/components/card'
import { VideoPlayer, type VideoPlayerTrack } from '@nanisoft/prism-ui/components/video-player'

/**
 * A poster, drawn here because a poster is a claim about the content.
 *
 * A data URI keeps the Demo self contained, the way a remote image would not: a
 * Demo is the documentation site's own content. The fills are the picture's own
 * pixels rather than a Component's ink, which is the one place a value in this
 * repository is not also a token.
 */
function poster() {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720">` +
    `<rect width="1280" height="720" fill="#0f172a"/>` +
    `<rect x="96" y="228" width="1088" height="264" rx="12" fill="#1e293b"/>` +
    `<text x="144" y="324" font-family="ui-sans-serif, system-ui, sans-serif" font-size="40" font-weight="600" fill="#e2e8f0">Collector walkthrough</text>` +
    `<text x="144" y="392" font-family="ui-monospace, monospace" font-size="30" fill="#94a3b8">4:12 &#183; captions and transcript</text>` +
    `<path d="M596 300 L596 420 L700 360 Z" fill="#e2e8f0"/>` +
    `</svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

/**
 * **Neither the video nor the caption files below is in this repository, and all
 * three will 404.**
 *
 * A VideoPlayer plays the consumer's own media, and a design system has no
 * business shipping one. The paths are here so the Demo can render the real
 * export and the real track list rather than a mock of them, and the frame will
 * hold its ratio and draw its controls whether or not anything arrives inside.
 * Nothing autoplays, nothing is fetched from a third party, and there is no
 * analytics of any kind in this file.
 */
const SRC = '/media/collector-walkthrough.mp4'
const POSTER = poster()

const CAPTIONS: readonly VideoPlayerTrack[] = [
  {
    src: '/captions/collector-walkthrough.en.vtt',
    srcLang: 'en',
    label: 'English',
    kind: 'captions',
    default: true,
  },
  {
    src: '/captions/collector-walkthrough.en-described.vtt',
    srcLang: 'en',
    label: 'English, audio description',
    kind: 'descriptions',
  },
]

const TIMESTAMPS: readonly (readonly [string, string])[] = [
  ['00:00', 'The collector reads from four sources and writes to one pipeline.'],
  ['00:48', 'Each source has its own rate limit, and the collector keeps its own.'],
  ['01:32', 'A source that stops answering is retried on its own schedule.'],
  ['02:15', 'The webhook source is the one retrying here, at ninety-six a minute.'],
]

/**
 * The default arrangement, and the bill for a control bar of your own.
 *
 * The first player is the whole of what this Component is: a frame at a ratio, a
 * video with the platform's own control bar, a required caption list and the
 * caller's transcript. No JavaScript of its own, and the Component's own
 * documentation says why.
 *
 * The second withholds the platform bar and draws three controls instead, which is
 * the honest cost the Component names. Prism holds no reference to the media
 * element and exposes no handle, so the Demo owns a ref on its own wrapper, finds
 * the element inside it, and drives it with the platform's own `play()`, `pause()`
 * and `currentTime`. Every one of those three buttons is now the Demo's to make
 * keyboard operable, announce, localise, test and keep in step with the element's
 * own state, and nothing here will catch it when it gets one of them wrong. That
 * is why the platform's bar is on by default.
 */
export default function VideoPlayerDemo() {
  const frame = useRef<HTMLDivElement>(null)
  const [last, setLast] = useState('nothing yet')

  const run = (command: string, act: (element: HTMLVideoElement) => void) => {
    const element = frame.current?.querySelector('video')
    if (element === undefined || element === null) return
    setLast(command)
    act(element)
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle as="h3">The platform controls, two tracks, a transcript</CardTitle>
          <CardDescription>
            The control bar below the picture is the browser&apos;s own, in the
            browser&apos;s own language, operable by the keys the reader already
            uses. The caption list is required, so it is here: one captions track
            turned on by default and one audio description track that the reader
            turns on. The file is not in this repository, so the frame holds its
            ratio and draws its controls either way.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <VideoPlayer
            src={SRC}
            captions={CAPTIONS}
            label="A walkthrough of the collector, four minutes"
            poster={POSTER}
            controlsList="nodownload noplaybackrate"
            transcript={
              <div className="flex flex-col gap-2">
                <span className="text-foreground font-medium">Transcript</span>
                <dl className="flex flex-col gap-1">
                  {TIMESTAMPS.map(([at, line]) => (
                    <div key={at} className="flex gap-3">
                      <dt className="text-muted-foreground w-16 shrink-0 font-mono text-xs">{at}</dt>
                      <dd>{line}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle as="h3">The platform bar withheld, and three controls of our own</CardTitle>
          <CardDescription>
            The same file at the ratio its own dimensions give it, with{' '}
            <code className="font-mono">showControls</code> off and the caller&apos;s
            own controls below. Nothing here works until the caller wires it to the
            element, and the wiring is three lines of the platform API that Prism
            neither holds a reference for nor offers a handle to.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div ref={frame}>
            <VideoPlayer
              src={SRC}
              captions={CAPTIONS}
              label="A walkthrough of the collector at its own four by three ratio"
              ratio={4 / 3}
              showControls={false}
              controls={
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      run('play', (element) => {
                        void element.play().catch(() => undefined)
                      })
                    }
                  >
                    Play
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => run('pause', (element) => element.pause())}
                  >
                    Pause
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      run('back to the start', (element) => {
                        element.currentTime = 0
                      })
                    }
                  >
                    Back to the start
                  </Button>
                  <span className="text-muted-foreground text-sm">
                    The last command was {last}.
                  </span>
                </div>
              }
            />
          </div>

          <p className="text-muted-foreground text-sm">
            The frame is drawn by <code className="font-mono">AspectRatio</code>{' '}
            rather than by a box authored here, so an undrawable ratio falls back
            the same way it does everywhere else in this package and the value in
            force is reported on the element. The transcript in the player above is
            markup rather than a string, because a transcript is headings,
            timestamps and paragraphs and a reader has to be able to navigate it.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
