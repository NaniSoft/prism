import { Star } from 'lucide-react'

import type { FeatureGrid01Props } from '../src/blocks/feature-grid-01'

/**
 * The icon is required only where a tile is rendered, and the type system has to
 * be able to see that exception.
 *
 * An optional `icon?: LucideIcon` cannot express it: the `icon` variant renders
 * an accent tile per feature, so an optional prop turns a safe-at-render
 * condition into an unsafe one and lets a feature with no icon through to paint
 * an empty tile. The fix is a union discriminated on `variant`, and the only
 * thing that can hold a union to that shape is a compiler, so these are type
 * assertions rather than render assertions.
 *
 * There is no `expectTypeOf` here: `expect-type` is not a dependency of this
 * package and this change adds no dependency, so a `@ts-expect-error` carries the
 * negative half and `tsc --noEmit` carries the positive half. The file is named
 * `.types.ts` and not `.test.tsx` on purpose: `tsconfig.json` includes every
 * `test` TypeScript file and `vitest.config.ts` collects only the `.test.tsx`
 * ones, so this is typechecked and never executed. An unused
 * `@ts-expect-error` is a `tsc` error, so both directions fail the build rather
 * than one of them passing quietly.
 */

/** No icon, which the `bare` variant renders no tile for. */
const bare = [{ title: 'Tokens', body: 'One source for every value.' }]

/** An icon, which every icon-bearing variant requires. */
const withIcon = [{ icon: Star, title: 'Tokens', body: 'One source for every value.' }]

/** The `bare` arm compiles with no icon, which is the exception being claimed. */
export const bareGrid: FeatureGrid01Props = { variant: 'bare', features: bare }

/** The `icon` arm compiles with an icon, and so does the omitted-variant default. */
export const iconGrid: FeatureGrid01Props = { variant: 'icon', features: withIcon }
export const defaultGrid: FeatureGrid01Props = { features: withIcon }

// @ts-expect-error the `icon` variant paints a tile per feature, so a feature with no icon leaves an empty accent tile behind.
export const iconGridWithoutIcon: FeatureGrid01Props = { variant: 'icon', features: bare }

// @ts-expect-error an omitted `variant` is the `icon` variant, so its icon is required too.
export const defaultGridWithoutIcon: FeatureGrid01Props = { features: bare }
