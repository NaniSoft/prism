import {
  Hero01,
  type Hero01Props,
  type HeroAction,
  type HeroLinkAction,
  type HeroSlotAction,
} from '../src/blocks/hero-01'
import {
  Hero02,
  type Hero02Action,
  type Hero02Props,
  type Hero02SlotAction,
} from '../src/blocks/hero-02'
import {
  Hero03,
  type Hero03Action,
  type Hero03LinkAction,
  type Hero03Props,
  type Hero03SlotAction,
} from '../src/blocks/hero-03'

/**
 * The action arms, asserted against the compiler rather than against a render.
 *
 * **Why this file exists and why a render cannot replace it.** The defect this
 * pair of files is about was never in the renderer. The Block rendered exactly
 * what its type asked for, every time: the type accepted an action with no
 * destination, and the honest rendering of an action with no destination in a
 * server Component is a `<button>` that cannot be pressed into anything. A test
 * that renders a hero and asserts "no inert button" cannot exist, because the
 * value that produced the inert button no longer compiles. So the negative half
 * has to be a compile error, and only the compiler can prove one.
 *
 * There is no `expectTypeOf` here, for the reason
 * `feature-grid-variant.types.ts` records: `expect-type` is not a dependency of
 * this package and this change adds no dependency, so a `@ts-expect-error` carries
 * the negative half and `tsc --noEmit` carries the positive half. The file is named
 * `.types.ts` and not `.test.tsx` on purpose: `tsconfig.json` includes every
 * `test` TypeScript file and `vitest.config.ts` collects only the `.test.tsx` ones,
 * so this is type-checked and never executed. An unused `@ts-expect-error` is a
 * `tsc` error, so both directions fail the build rather than one of them passing
 * quietly.
 *
 * **Why all three heroes rather than one.** The three Blocks spell their union
 * again rather than sharing it, and each JSDoc says why: a shared type would make
 * `blocks/hero-01` a dependency of `blocks/hero-02`. Spelled three times, it can
 * be edited three times, so each of the three is asserted separately here rather
 * than inferred from the first.
 */

/** A destination, the arm the Block renders itself. */
const link: HeroLinkAction = { label: 'Start free', href: '/start' }

/** The caller's own control, the arm the Block places and does not render. */
const own: HeroSlotAction = { slot: null }

/** A `newTab` action, which is the link arm with the safe relationship asked for. */
const external: HeroLinkAction = { label: 'Handbook', href: 'https://nanisoft.com', newTab: true }

/** The two arms as one value, which is what `actions` takes. */
const row: HeroAction[] = [link, own, external]

// @ts-expect-error an action with a label and no destination used to compile and rendered a primary button that went nowhere. The caller's own control is the arm for that, and it is `slot`.
export const labelOnly: HeroAction = { label: 'Coming soon' }

// @ts-expect-error an address that is sometimes a string and sometimes undefined must not compile into a control, on either arm.
export const maybeUrl: HeroAction = { label: 'Start free', href: undefined as string | undefined }

// @ts-expect-error `slot` and `href` are two different elements rendered by two different branches, so a value carrying both would have to pick one silently.
export const bothArms: HeroAction = { label: 'Start free', href: '/start', slot: null }

// @ts-expect-error the Block renders `slot` and nothing else, so a `label` beside it is a word no reader sees.
export const slotAndLabel: HeroAction = { label: 'Start free', slot: null }

// @ts-expect-error the Block cannot style a node it does not render, so a weight on this arm would be accepted and dropped.
export const slotAndVariant: HeroSlotAction = { slot: null, variant: 'default' }

// @ts-expect-error a slot on the link arm is the same collision read from the other side.
export const linkAndSlot: HeroLinkAction = { label: 'Start free', href: '/start', slot: null }

/** Hero02's two arms, spelled the same way and asserted independently. */
const hero02Link: Hero02Action = { label: 'Follow the build', href: '/build' }
const hero02Own: Hero02SlotAction = { slot: null }
export const hero02Row: Hero02Action[] = [hero02Link, hero02Own]

// @ts-expect-error the second Block spells the union again, so the same mistake is a compile error there too.
export const hero02LabelOnly: Hero02Action = { label: 'Coming soon' }

/** Hero03's two arms, with the link arm narrowing to its own name. */
export const hero03Link: Hero03LinkAction = { label: 'Read a run', href: '/runs' }

// @ts-expect-error and again in the third, because a union written three times can drift three times.
export const hero03LabelOnly: Hero03Action = { label: 'Coming soon' }

const hero03Points = [{ title: 'One point', body: 'A sentence about it.' }]
const hero03Proof = [{ label: 'One figure', value: '1' }]

/**
 * The positive half: a hero still renders with a row of either arm, which is what
 * makes the negative half above a statement about a mistake rather than about a
 * Block that accepts nothing.
 */
export const centered: Hero01Props = { title: 'Ship it', actions: row }
export const split: Hero02Props = { title: 'Ship it', figure: null, figureLabel: 'The queue', actions: hero02Row }
export const editorial: Hero03Props = {
  title: 'Ship it',
  points: hero03Points,
  proof: hero03Proof,
  actions: [hero03Link],
}

/** Every export is used, so nothing here is dropped by an unused-symbol rule. */
export const allThree = [Hero01, Hero02, Hero03]