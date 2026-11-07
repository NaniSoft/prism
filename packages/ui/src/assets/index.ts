/**
 * The asset contract as code: variants, budgets and the minimum-resolution
 * rule that every controlled media component resolves through.
 *
 * The manifest beside this file is the machine-readable registry, emitted to
 * `dist/assets/manifest.json`. This module is its TypeScript half: the types a
 * consumer types a manifest entry with, the closed variant set that mirrors the
 * eleven presentation variants, the byte budgets that gate a candidate asset,
 * and the one arithmetic rule the resolution gate enforces.
 *
 * A consumer never authors a manifest entry and never calls the validator on its
 * own copy of the file. The keys are a closed vocabulary for the same reason a
 * category is: a new category is a token drawn upstream, not a string a consumer
 * types where a category should have been.
 */

export const ASSET_CATEGORIES = ['font', 'image', 'icon', 'logo', 'illustration', 'video'] as const
export type AssetCategory = (typeof ASSET_CATEGORIES)[number]

export const ASSET_VARIANTS = [
  'hero',
  'wide-hero',
  'banner',
  'card',
  'landscape-thumb',
  'square-thumb',
  'avatar',
  'product',
  'logo',
  'illustration',
  'icon',
] as const
export type AssetPresentation = (typeof ASSET_VARIANTS)[number]

export const ASSET_FORMATS = ['woff2', 'png', 'svg', 'ico', 'svg-component', 'webp', 'avif', 'mp4', 'webm'] as const
export type AssetFormat = (typeof ASSET_FORMATS)[number]

export const ASSET_ROLES = ['ui-icon', 'brand-logo', 'decoration', 'complex-diagram', 'content', 'font'] as const
export type AssetRole = (typeof ASSET_ROLES)[number]

/**
 * File-size budgets in KiB, matching `asset-manifest.json`.
 *
 * A budget is a ceiling on the shipped bytes, not a target: an asset under its
 * budget is not under-optimised, and a complex illustration past its budget
 * ships with a written exception on its entry. Quality never bends to meet a
 * number without being said out loud.
 */
export const ASSET_BUDGETS_KIB: Readonly<Record<string, number>> = {
  icon: 10,
  illustration: 50,
  logo: 50,
  card: 200,
  banner: 300,
  hero: 500,
  thumbnail: 100,
  font: 150,
}

/** The `sizes` expression that pairs with a `srcSet` per presentation. */
export const VARIANT_SIZES: Readonly<Record<AssetPresentation, string>> = {
  hero: '(min-width: 1024px) 1152px, 100vw',
  'wide-hero': '(min-width: 1024px) 1152px, 100vw',
  banner: '(min-width: 1024px) 1152px, 100vw',
  card: '(min-width: 768px) 800px, 100vw',
  'landscape-thumb': '(min-width: 768px) 400px, 100vw',
  'square-thumb': '(min-width: 768px) 400px, 100vw',
  avatar: '64px',
  product: '(min-width: 768px) 800px, 100vw',
  logo: '320px',
  illustration: '(min-width: 768px) 800px, 100vw',
  icon: '48px',
}

/** The ratio each variant presents, matching the `--aspect-*` tokens. */
export const VARIANT_RATIOS: Readonly<Record<AssetPresentation, string | null>> = {
  hero: '16 / 9',
  'wide-hero': '21 / 9',
  banner: '3 / 1',
  card: '4 / 3',
  'landscape-thumb': '16 / 9',
  'square-thumb': '1 / 1',
  avatar: '1 / 1',
  product: '1 / 1',
  logo: null,
  illustration: null,
  icon: '1 / 1',
}

/** Recommended minimum source size per raster variant (Mission §5.3). */
export const SOURCE_TARGETS_PX: Readonly<
  Record<AssetPresentation, { widthPx: number; heightPx: number } | null>
> = {
  hero: { widthPx: 1920, heightPx: 1080 },
  'wide-hero': { widthPx: 2560, heightPx: 1080 },
  banner: { widthPx: 1440, heightPx: 480 },
  card: { widthPx: 800, heightPx: 600 },
  'landscape-thumb': { widthPx: 400, heightPx: 225 },
  'square-thumb': { widthPx: 400, heightPx: 400 },
  avatar: { widthPx: 256, heightPx: 256 },
  product: { widthPx: 800, heightPx: 800 },
  logo: null,
  illustration: null,
  icon: null,
}

export interface AssetEntry {
  id: string
  path: string
  category: AssetCategory
  format: AssetFormat
  intrinsicWidth?: number | null
  intrinsicHeight?: number | null
  aspectRatio?: string | null
  fileSizeBytes?: number | null
  allowedVariants: readonly AssetPresentation[]
  minSource?: { widthPx: number; heightPx: number } | null
  maxRenderedWidthPx?: number | null
  maxRenderedHeightPx?: number | null
  devicePixelRatio?: number | null
  themeAware: boolean
  themeRestrictions?: readonly string[]
  budgetKiB: number
  role: AssetRole
  license?: string
  alt?: string | null
  exception?: string | null
}

export interface AssetManifest {
  version: 1
  budgetsKiB: Readonly<Record<string, number>>
  variants: Readonly<Record<AssetPresentation, { aspectRatio: string | null; objectFit: 'cover' | 'contain'; maxRendered: { widthPx: number; heightPx: number } }>>
  assets: readonly AssetEntry[]
}

/**
 * The minimum source resolution for a rendered size, device pixel ratio and
 * intended use: a 400px-wide surface on a 2x display needs an 800px source.
 *
 * Both axes are covered, because a sharp width over a soft height is a failure
 * the reader sees as an image that went out of focus at the edges. Vector formats
 * carry no raster source and return `null`.
 */
export function minimumSourcePx(
  renderedWidthPx: number | null | undefined,
  renderedHeightPx: number | null | undefined,
  devicePixelRatio: number | null | undefined,
): { widthPx: number; heightPx: number } | null {
  if (renderedWidthPx == null || renderedHeightPx == null || devicePixelRatio == null) return null
  return { widthPx: renderedWidthPx * devicePixelRatio, heightPx: renderedHeightPx * devicePixelRatio }
}

/**
 * Whether a candidate size satisfies its variant, with the reason named.
 *
 * Used by controlled media components at render time for externally hosted or
 * user-uploaded images, where no manifest entry exists and runtime validation
 * stands in for the build gate. Returns a human reason on the first failure
 * rather than a boolean, because a boolean a caller has to re-interpret is a
 * string and nobody policed it.
 */
export function validateRasterSize(
  intrinsicWidth: number | null | undefined,
  intrinsicHeight: number | null | undefined,
  variant: AssetPresentation,
): string | null {
  const target = SOURCE_TARGETS_PX[variant]
  if (target === null) return null
  if (intrinsicWidth == null || intrinsicHeight == null) return 'intrinsic dimensions are unknown'
  if (intrinsicWidth < target.widthPx || intrinsicHeight < target.heightPx) {
    return `source ${intrinsicWidth}x${intrinsicHeight}px is under the ${variant} target ${target.widthPx}x${target.heightPx}px`
  }
  return null
}
