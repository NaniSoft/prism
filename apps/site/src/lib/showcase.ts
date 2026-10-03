import type { CatalogKind } from '@nanisoft/prism-ui/catalog'
import type { Mode, PackId } from '@nanisoft/prism-ui/theming'

import themes from '@nanisoft/prism-tokens/dist/themes.json'

import { PREVIEW_WIDTHS, type PreviewWidth } from './preview'

/**
 * What the showcase's toolbar knows before it renders.
 *
 * It is one module because it is one decision: a preview may be re-themed, and the
 * set of packs a reader may pick from, the set of Kinds that get a resolution
 * control and the words each control says are all facts about the same surface. A
 * toolbar that learned them from four files would be four files to keep in step,
 * and the failure is a control that offers an option the preview cannot honour.
 */

/** One pack as the chooser offers it. */
export type ShowcasePack = {
  /** The pack id, carried on the preview document as `data-pack`. */
  id: PackId
  /** The name a reader reads. */
  name: string
  /** One line saying what the pack is, for the row under the name. */
  description: string
}

/**
 * The six packs a reader may hold a preview in, the neutral base first.
 *
 * **The base pack is in the list because a chooser without it is a trap.** It is
 * Prism's own pack, the one this site renders in, and the one every other pack is
 * compared against; a control that offered five pastel options and no way back to
 * the ground they were measured against would leave a reader permanently unable to
 * see the thing they started from. The five pastels come from the token package's
 * own descriptor, so a new pack is a token change and a rebuild rather than an
 * edit here.
 *
 * The base pack's name is the one word in this module rather than a token
 * descriptor, because `themes.json` does not describe it: it is the absence of
 * `data-pack`, not a sixth theme. `bar.ts` already states the same fact from the
 * other side, and the word `Base` is the site's to choose.
 */
export const SHOWCASE_PACKS: readonly ShowcasePack[] = [
  {
    id: 'default',
    name: 'Base',
    description: 'The neutral pack Prism itself ships in. No hue of its own.',
  },
  ...themes.map((theme) => ({
    id: theme.id as PackId,
    name: theme.name,
    description: theme.description,
  })),
]

/**
 * The Kinds whose preview takes a resolution control, and why the other does not.
 *
 * A Block, a Page and a live surface are compositions with a layout: they have
 * columns that stack, navigation that collapses and padding that changes, so "how
 * does this look on a phone" is a question about the Item rather than about the
 * documentation. A Component is a control, and a control does not reflow, so the
 * question has no answer to give and a control offering one would be noise.
 *
 * Read from the catalogue's four Kinds rather than listed as strings, so a Kind
 * added to Prism is a decision to take here rather than a silent absence.
 */
const RESOLUTION_KINDS: ReadonlySet<CatalogKind> = new Set<CatalogKind>([
  'block',
  'page',
  'live',
])

/** Whether an Item of this Kind is shown at a chosen screen width. */
export function takesResolution(kind: CatalogKind): boolean {
  return RESOLUTION_KINDS.has(kind)
}

/**
 * How tall a preview frame is, per width, in CSS pixels.
 *
 * **The device widths are real device heights.** A 390-wide frame is 844 tall
 * because that is the viewport a phone gives a page, and a reader checking a
 * Block's mobile layout is checking what fits above the fold on the device they
 * own. `auto` has no height of its own: it is the preview's own content, measured
 * after it loads, because a fluid layout has no aspect ratio to honour and
 * inventing one would be a second thing claiming to be the truth.
 */
export const SHOWCASE_HEIGHTS: Record<PreviewWidth, number | null> = {
  auto: null,
  '390': 844,
  '834': 1112,
  '1280': 800,
}

/**
 * The height an `auto` frame stops growing at, in CSS pixels.
 *
 * **A Page preview is a long document, and the frame stops rather than becoming
 * one.** Measured without a ceiling, a Page held at the documentation column's
 * width is several thousand pixels of iframe in the middle of an article, which
 * pushes the prose and the API table off the screen and makes the page unusable
 * for the Item that was not being read. Past this the preview scrolls inside
 * itself, which is what a viewport does and is the honest behaviour for a
 * document too long to show at once.
 */
export const AUTO_HEIGHT_CEILING = 1600

/** The smallest a measured frame may be, so a one-line Component is not a sliver. */
export const AUTO_HEIGHT_FLOOR = 160

/** The two modes, light first, because the site's first paint is light. */
export const SHOWCASE_MODES: readonly Mode[] = ['light', 'dark']

/** The widths, re-exported so the toolbar imports one module for its own options. */
export { PREVIEW_WIDTHS }
export type { PreviewWidth }

/**
 * The words each width control member carries.
 *
 * A number rather than a device name, because the number is the fact the reader
 * is choosing: "what happens at 390" is answerable and "what happens on mobile" is
 * a guess about which phone. `Auto` is the exception and is the one word here,
 * because that state is the frame's own width and has no number to print.
 */
export const WIDTH_LABELS: Record<PreviewWidth, string> = {
  auto: 'Auto',
  '390': '390',
  '834': '834',
  '1280': '1280',
}