import {
  About01,
  type About01Props,
  type AboutAction,
  type AboutLinkAction,
  type AboutSlotAction,
} from '../src/blocks/about-01'
import {
  PageHeader01,
  type PageHeader01Props,
  type PageHeaderAction,
  type PageHeaderLinkAction,
  type PageHeaderSlotAction,
} from '../src/blocks/page-header-01'
import {
  Plan,
  Pricing01,
  type PricingAction,
  type PricingLinkAction,
  type PricingSlotAction,
} from '../src/blocks/pricing-01'
import {
  Showcase01,
  type Showcase01Props,
  type ShowcaseAction,
  type ShowcaseLinkAction,
  type ShowcaseSlotAction,
} from '../src/blocks/showcase-01'
import { Waitlist01, type Waitlist01Referral } from '../src/blocks/waitlist-01'

/**
 * The action arms, asserted against the compiler rather than against a render.
 *
 * **Why this file exists and why a render cannot replace it.** The defects this pair
 * of files is about were never in the renderer. Each Block rendered exactly what its
 * type asked for, every time: the type accepted an action with no destination, and
 * the honest rendering of an action with no destination in a server Component is a
 * `<button>` that cannot be pressed into anything. A test that renders an about band
 * and asserts "no inert button" cannot exist, because the value that produced the
 * inert button no longer compiles. So the negative half has to be a compile error,
 * and only the compiler can prove one.
 *
 * There is no `expectTypeOf` here, for the reason
 * `feature-grid-variant.types.ts` records: `expect-type` is not a dependency of
 * this package and this change adds no dependency, so a `@ts-expect-error` carries
 * the negative half and `tsc --noEmit` carries the positive half. The file is named
 * `.types.ts` and not `.test.tsx` on purpose: `tsconfig.json` includes every `test`
 * TypeScript file and `vitest.config.ts` collects only the `.test.tsx` ones, so this
 * is type-checked and never executed. An unused `@ts-expect-error` is a `tsc` error,
 * so both directions fail the build rather than one of them passing quietly.
 *
 * **Why all five Blocks rather than one.** The five spell the union again rather
 * than sharing it, and each JSDoc says why: a shared type would make
 * `blocks/hero-01` a dependency of `blocks/pricing-01`, so a consumer installing a
 * pricing table would be made to resolve a marketing hero to get it. Spelled five
 * times, it can be edited five times, so each of the five is asserted separately
 * here rather than inferred from the first, and
 * `scripts/check-block-controls.mjs` holds the rendering half of the same law.
 */

/* ------------------------------------------------------------------ *
 * About01
 * ------------------------------------------------------------------ */

/** A destination, the arm the Block renders itself. */
const aboutLink: AboutLinkAction = { label: 'Read the architecture', href: '/architecture' }

/** The caller's own control, the arm the Block places and does not render. */
const aboutOwn: AboutSlotAction = { slot: null }

/** A `newTab` action, which is the link arm with the safe relationship asked for. */
const aboutExternal: AboutLinkAction = { label: 'Handbook', href: 'https://nanisoft.com', newTab: true }

/** The two arms as one value, which is what `actions` takes. */
const aboutRow: AboutAction[] = [aboutLink, aboutOwn, aboutExternal]

// @ts-expect-error an action with a label and no destination used to compile and rendered a primary button that went nowhere, at the foot of the section. The caller's own control is the arm for that, and it is `slot`.
export const aboutLabelOnly: AboutAction = { label: 'Coming soon' }

// @ts-expect-error an address that is sometimes a string and sometimes undefined must not compile into a control, on either arm.
export const aboutMaybeUrl: AboutAction = { label: 'Read it', href: undefined as string | undefined }

// @ts-expect-error `slot` and `href` are two different elements rendered by two different branches, so a value carrying both would have to pick one silently.
export const aboutBothArms: AboutAction = { label: 'Read it', href: '/x', slot: null }

// @ts-expect-error the Block renders `slot` and nothing else, so a `label` beside it is a word no reader sees.
export const aboutSlotAndLabel: AboutAction = { label: 'Read it', slot: null }

// @ts-expect-error the Block cannot style a node it does not render, so a weight on this arm would be accepted and dropped.
export const aboutSlotAndVariant: AboutSlotAction = { slot: null, variant: 'default' }

// @ts-expect-error a slot on the link arm is the same collision read from the other side.
export const aboutLinkAndSlot: AboutLinkAction = { label: 'Read it', href: '/x', slot: null }

/* ------------------------------------------------------------------ *
 * PageHeader01
 * ------------------------------------------------------------------ */

/**
 * The second Block spells the union again, and its second mistake is the one this
 * Block shipped and the others did not: `PageHeaderAction` had **no** `href` member
 * at all, so there was nothing to make optional and every value produced a dead
 * button at the top of a screen.
 */
const headerLink: PageHeaderLinkAction = { label: 'New deployment', href: '/deployments/new' }
const headerOwn: PageHeaderSlotAction = { slot: null }
export const headerRow: PageHeaderAction[] = [headerLink, headerOwn]

// @ts-expect-error a page header's first action used to take a label alone and rendered a Button that went nowhere. That was the top of a screen, so this is the same mistake in the worst place in the package.
export const headerLabelOnly: PageHeaderAction = { label: 'New deployment' }

// @ts-expect-error `size` is as forbidden on the slot arm as `variant`, for the same reason: the Block cannot style a node it does not render.
export const headerSlotAndSize: PageHeaderSlotAction = { slot: null, size: 'lg' }

// @ts-expect-error the row is the only place a caller control goes. `actionsSlot` is gone, and a sibling slot could never say which position it filled.
export const headerSiblingSlot: PageHeader01Props = { title: 'Overview', actionsSlot: null }

/* ------------------------------------------------------------------ *
 * Pricing01
 * ------------------------------------------------------------------ */

/** The third Block, and the one where the string was the defect rather than an arm. */
const pricingLink: PricingLinkAction = { label: 'Choose Team', href: '/signup?plan=team' }
const pricingOwn: PricingSlotAction = { slot: null }
export const pricingAction: PricingAction = pricingLink
export const pricingOtherAction: PricingAction = pricingOwn

// @ts-expect-error a plan used to take `cta: string` and rendered it as a Button, so the card a reader was deciding on carried a focusable control that activated to nothing. A label alone is that mistake again.
export const pricingLabelOnly: PricingAction = { label: 'Choose Team' }

/**
 * The positive half: a plan still renders with either arm.
 *
 * `Plan` is asserted as a type rather than only as a value, because a consumer with a
 * data model for its plans has to be able to name the record, and this file's own
 * existence before this change is the evidence that `pricing-01/index.tsx` did not
 * export it. `id` is here for the same reason: it is the card's key, and a plan
 * without one is a duplicate key waiting for the first consumer who ships two plans
 * that share a name.
 */
export const plan: Plan = {
  id: 'team',
  name: 'Team',
  price: '$24',
  features: ['Unlimited projects'],
  action: pricingLink,
}

/* ------------------------------------------------------------------ *
 * Showcase01
 * ------------------------------------------------------------------ */

export const showcaseLink: ShowcaseLinkAction = { label: 'Read a run', href: '/runs/812' }
export const showcaseOwn: ShowcaseSlotAction = { slot: null }
export const showcaseRow: ShowcaseAction[] = [showcaseLink, showcaseOwn]

// @ts-expect-error and again in the fourth, because a union written four times can drift four times.
export const showcaseLabelOnly: ShowcaseAction = { label: 'Configure it' }

/* ------------------------------------------------------------------ *
 * Waitlist01
 * ------------------------------------------------------------------ */

/**
 * The fifth, and the only one that is not a union: `Waitlist01Referral` declared the
 * accessible name and the state of a copy control and the Block rendered a `Button`
 * with no handler. The control is now a `ReactNode`, so the two props that named it
 * are gone rather than optional.
 */
export const referral: Waitlist01Referral = {
  value: 'NEXUS-4KD2-1190',
  label: 'Your referral code',
  copyControl: null,
}

/*
 * The last two are the fifth Block and they are not a union, so the assertion is a
 * different shape: a `ReactNode` replaced two members, and the way to prove a member
 * is gone is an excess-property check against the partial. The directive sits on the
 * offending line rather than on the declaration because that is where TypeScript
 * reports an excess property inside a `satisfies`, and an unused `@ts-expect-error` is
 * itself an error, so the two must agree.
 */
export const referralCopyLabel = {
  value: 'NEXUS-4KD2-1190',
  label: 'Your referral code',
  // @ts-expect-error the accessible name of a control Prism no longer renders. It was the string it put on a Button that copied nothing.
  copyLabel: 'Copy code',
} satisfies Partial<Waitlist01Referral>

export const referralCopied = {
  value: 'NEXUS-4KD2-1190',
  label: 'Your referral code',
  // @ts-expect-error and so is the state it drew on that same control.
  copied: true,
} satisfies Partial<Waitlist01Referral>

/* ------------------------------------------------------------------ *
 * The positive half, and the exports
 * ------------------------------------------------------------------ */

export const aboutBand: About01Props = {
  title: 'What this is',
  statement: 'One sentence.',
  principles: [],
  actions: aboutRow,
}
export const header: PageHeader01Props = { title: 'Overview', actions: headerRow }
export const showcase: Showcase01Props = { name: 'Market capture', facts: [], actions: showcaseRow }

/** Every export is used, so nothing here is dropped by an unused-symbol rule. */
export const allFive = [About01, PageHeader01, Pricing01, Showcase01, Waitlist01]
