import { ImageResponse } from 'next/og'

import { SITE_NAME } from '@/lib/site'

/**
 * The share card.
 *
 * **It is a static export artefact, so it is generated once at build rather than
 * per request.** Without one, every link to this site on a platform that renders
 * a card shows a blank rectangle, which is the largest single thing a
 * documentation site can lose in a search result and in a chat client, and it is
 * invisible until someone shares a link.
 *
 * **The card says what the site is in one line and then lists what it holds.**
 * A card carrying the site's slogan tells a reader nothing they can act on, and a
 * card carrying a screenshot of a page tells them something they cannot read at
 * the size a card is rendered. Four names are the four things a reader could be
 * looking for, and they are the Section names the header already uses, so the
 * card and the site agree about what the site contains.
 *
 * **The colours are literals here, and this file is the one place that is
 * correct.** `DESIGN.md` forbids a raw hex outside the token foundation tier
 * because a component's colour must follow a pack at runtime. An image is painted
 * once, at build, into a bitmap: there is no cascade, no `data-pack` and no
 * reader whose theme could change it, so a token read here would resolve to the
 * base pack's values and produce a card that shows the neutral pack while the
 * rest of the design system is built to show that the palette is switchable. The
 * card is therefore the base pack's own values written out: `background` is its
 * `background`, `foreground` is its `foreground`, and the two brand chips are
 * two of the five pastels' `primary`, because a card for a pastel design system
 * that shows only grey is a card that has hidden the one fact about it a reader
 * cannot get from the text.
 *
 * The size is the one Open Graph accepts for a large card, and the content is
 * laid out at those pixel dimensions rather than at rems, because the canvas is a
 * fixed surface and not a document.
 */
export const alt = `${SITE_NAME}, the NaniSoft design system`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/**
 * Generated once, at build.
 *
 * Under `output: 'export'` a metadata route has to be told it is static, and
 * without this the build fails with a message about `dynamic` rather than about
 * the card, which is the wrong thing to send a reader of the build log. It is
 * also true rather than a formality: the image is painted from constants and has
 * no request to be dynamic with.
 */
export const dynamic = 'force-static'

const INK = '#171717'
const PAPER = '#ffffff'
const MUTED = '#525252'
const HAIRLINE = '#e5e5e5'
const BLUSH = '#ec88a0'
const LAVENDER = '#bc97e7'
const MINT = '#73bf88'
const SKY = '#6cb2eb'
const PEACH = '#e4965e'

const SECTIONS = ['Overview', 'Foundation', 'Content', 'Patterns', 'Components', 'Blocks', 'Pages']

/**
 * The card's own sentence, which is not `SITE_DESCRIPTION`.
 *
 * That string is written for a search result and for a tab, where three lines of
 * small text is the space available and being complete is the job. A card is a
 * third of that space at twice the size, so a reader sees four words of it before
 * the card is finished being read. The claim is the same and the sentence is
 * shorter, and it is written here rather than truncated from the other one,
 * because a truncated sentence ends mid-clause and reads as a mistake.
 */
const CARD_LINE = 'A token pipeline, a React library, and the documentation for both.'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: PAPER,
          color: INK,
          padding: '72px 80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', fontSize: 26, letterSpacing: 2, color: MUTED }}>
            NANISOFT DESIGN SYSTEM
          </div>
          <div style={{ display: 'flex', fontSize: 76, fontWeight: 600, letterSpacing: -2, lineHeight: 1.05 }}>
            {SITE_NAME}
          </div>
          <div style={{ display: 'flex', fontSize: 34, color: MUTED, lineHeight: 1.35 }}>
            {CARD_LINE}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: `2px solid ${HAIRLINE}`,
            paddingTop: 32,
          }}
        >
          <div style={{ display: 'flex', gap: 16 }}>
            {SECTIONS.map((section) => (
              <div key={section} style={{ display: 'flex', fontSize: 23, color: MUTED }}>
                {section}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[BLUSH, LAVENDER, MINT, SKY, PEACH].map((colour) => (
              <div
                key={colour}
                style={{ display: 'flex', width: 32, height: 32, borderRadius: 16, background: colour }}
              />
            ))}
          </div>
        </div>
      </div>
    ),
    size,
  )
}
