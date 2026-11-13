'use client'

import { useState } from 'react'

import { ArrowRight } from 'lucide-react'

import themes from '@nanisoft/prism-tokens/dist/themes.json'
import { InstrumentPanel01 } from '@nanisoft/prism-ui/blocks/instrument-panel-01'
import { Badge } from '@nanisoft/prism-ui/components/badge'
import { CtaLink } from '@nanisoft/prism-ui/components/cta-link'
import { Sparkline } from '@nanisoft/prism-ui/components/sparkline'

/**
 * The landing hero's instrument: a small page, composed, wearing the pack you choose.
 *
 * This replaced the specimen board, which drew a mock of the hero inside the hero.
 * A mock of the page a reader is already reading is a picture of it, and a picture
 * is the one figure this page refuses: it is a second copy of the library's
 * appearance that the next release silently rots, and the board carried a `Button`
 * with no handler and no destination, which is the dead control `HeroAction`'s own
 * JSDoc names. The figure here cannot rot and cannot dead-end, because it is not a
 * picture of the system. It is the system: the page in the frame is composed from
 * published Components, the dots re-point it through the real pack boundary, and
 * the last line names the attribute that did it, live.
 *
 * **Every control acts.** A dot sets the pack, the link goes to the pack reader,
 * and nothing in the figure is drawn to look interactive and then activate to
 * nothing. The counts come from the build as props, so the figure and the sentence
 * beside it cannot disagree, and the swatch on each dot is the pack's own compiled
 * `primary` under a scoped `data-pack` boundary, the same arrangement the pack band
 * below ships: no colour on this page is written by hand. The selected dot wears
 * its ring in its own pack too, because the ring is read through the same boundary,
 * and the bar names the pack and its radius in words, which is the cue a reader
 * who cannot see the hue is given.
 *
 * **The frame stays in the page's pack and the boundary owns the theme.** The
 * `data-pack` boundary sits on the element with `rounded-none`, and the shape and
 * the border of the frame belong to the page around it, which is the arrangement
 * `DESIGN.md` states for a pack boundary: a boundary on the rounded element itself
 * would re-point `--radius` beneath it and the frame would change shape with the
 * pack a reader is comparing.
 *
 * It is a client Component because the chosen pack is state. The rest of the page
 * stays server-rendered, and a reader with scripting off still meets the figure
 * complete in its first pack, dots and all, unable only to flip it.
 */
export function ComposedPage({ values, count }: { values: readonly number[]; count: number }) {
  const [pack, setPack] = useState<(typeof themes)[number]['id']>('sky')
  const current = themes.find((theme) => theme.id === pack) ?? themes[0]

  return (
    <InstrumentPanel01
      label="a page, composed"
      actions={
        <span className="font-mono text-mono">
          {current.id} · r {current.radius}
        </span>
      }
      caption="A small page composed from published Prism components, re-pointed through the pack boundary as you choose a pack."
      footnote={
        <span className="block max-w-measure">
          Nothing here wrote CSS: every element in the frame is the published package, and the dot
          you press sets the attribute in the last line.
        </span>
      }
    >
      <div className="flex flex-col gap-3">
        {/*
          The control room, and it stays in the page's own pack on purpose: the
          dots are the levers a reader pulls, and levers belong to the room rather
          than to the machine. Each dot is the pack's own compiled primary under a
          boundary scoped to the dot itself, so no swatch on this page is a colour
          written by hand. The selected dot wears its ring in its own hue, because
          the ring is read through the same boundary, and the bar names the pack
          in words, which is the cue a reader who cannot see the hue is given. The
          floor is paid on the box: 28 pixels at every pointer and 44 on a coarse
          one, the same step `Button` takes.
        */}
        <div role="group" aria-label="Pack" className="flex flex-wrap items-center gap-2">
          {themes.map((theme) => (
            <button
              key={theme.id}
              type="button"
              aria-pressed={pack === theme.id}
              aria-label={`${theme.name} pack`}
              onClick={() => setPack(theme.id)}
              className="border-border focus-visible:ring-ring pointer-coarse:size-11 relative flex size-7 items-center justify-center rounded-full border transition duration-fast ease-out hover:border-primary/50 focus-visible:ring-[3px]"
            >
              <span
                data-pack={theme.id}
                className={`bg-primary block size-3.5 rounded-full transition-shadow duration-fast ease-out ${
                  pack === theme.id ? 'ring-ring ring-offset-card ring-2 ring-offset-2' : ''
                }`}
              />
            </button>
          ))}
        </div>

        {/*
          The page. The outer element owns the border, the clip, the shape and the
          resting shadow in the page's own pack, and the boundary inside it owns
          the theme, which is the pack-boundary rule the pack band below also
          ships. The re-ink rides the fast feedback scale, because a flip is an
          answer to a press rather than a cycle: 80 milliseconds of colour, and
          nothing else moves.
        */}
        <div className="border-border shadow-xs overflow-hidden rounded-lg border">
          <div
            data-pack={pack}
            className="bg-background flex flex-col gap-4 rounded-none p-4 transition-colors duration-fast ease-out"
          >
            <Badge>{current.name}</Badge>

            <div className="flex flex-col gap-1">
              <span className="text-3xl font-semibold tracking-tight tabular-nums">{count}</span>
              <span className="text-muted-foreground text-sm">
                components in the catalogue, counted from the build
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground font-mono text-mono" aria-hidden>
                by category
              </span>
              <Sparkline
                label="Components by category, counted from the build"
                values={values}
                width={420}
                height={48}
              />
            </div>

            <div>
              <CtaLink href="/foundation/themes" size="sm" className="group">
                {`See the ${current.name} pack`}
                <ArrowRight
                  className="transition-transform size-4 group-hover:translate-x-0.5"
                  aria-hidden
                />
              </CtaLink>
            </div>
          </div>
        </div>

        {/*
          The two lines that put the page there, and the second one is live: the
          attribute a dot sets is the attribute on the page, spelled out in the
          code the reader can copy, with the value's own compiled primary beside
          it as a chip. The hue is the chip rather than the ink because `primary`
          is a surface token, not a text token: in the pastel packs it compiles to
          a light tint that fails 4.5:1 as text, which is the same reason `Button`
          sets its link words in the foreground. The first line is the
          whole adoption, one import, and it stays quiet so the attribute is the
          brightest thing in the block, because it is the one the reader sets.
        */}
        <div className="border-border bg-muted overflow-x-auto rounded-lg border px-3 py-2">
          <code className="text-muted-foreground block whitespace-nowrap font-mono text-mono">
            {`import '@nanisoft/prism-ui/styles.css'`}
          </code>
          <code className="block whitespace-nowrap font-mono text-mono">
            {'<html data-pack="'}
            <span
              data-pack={pack}
              aria-hidden
              className="bg-primary mx-0.5 inline-block size-2 translate-y-px rounded-full"
            />
            {`${pack}`}
            {'">'}
          </code>
        </div>
      </div>
    </InstrumentPanel01>
  )
}
