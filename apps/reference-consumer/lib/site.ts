import { PACKS, themeAttributes, type Mode, type PackId } from '@nanisoft/prism-ui/theming'
import type { SwitcherProduct } from '@nanisoft/prism-ui/components/product-switcher'

import site from './site.json'

const PACK_IDS: readonly string[] = PACKS

function pack(value: string): PackId {
  if (!PACK_IDS.includes(value)) {
    throw new Error(`site.json: "${value}" is not a published pack`)
  }
  return value as PackId
}

export const GROUND_PACK: PackId = pack(site.ground)
export const DEFAULT_MODE = site.defaultMode as Mode
export const THEME_ATTRIBUTES = themeAttributes({ pack: GROUND_PACK, mode: DEFAULT_MODE })

export const SITE_PRODUCT = {
  id: site.siteId,
  name: site.siteName,
  pack: GROUND_PACK,
} as const

export const PRODUCTS: readonly SwitcherProduct[] = site.products.map((product) => ({
  id: product.id,
  name: product.name,
  pack: product.pack ? pack(product.pack) : undefined,
  href: product.href,
}))
