/**
 * The bar's own facts, as data.
 *
 * Everything the bar needs that is not the Section manifest is here: the theme a
 * reader with no stored choice gets, the family's five sites, and every sentence
 * the bar's controls can say. They are one module because they are one decision,
 * and a bar whose control names live in three files is a bar where a reader finds
 * "Search" in one place and "No matches." in another.
 *
 * **Prism's own pack is `default`, and that is not a gap in the directory.** The
 * other four sites draw this one with `peach`, and this site draws itself with no
 * pack at all. Both are the same fact seen from two sides: `prism.nanisoft.com`
 * renders its document on the neutral base pack, so Prism owns no hue of its own,
 * and a mark drawn with no pack is the one case `ProductMark` draws as the full
 * spectrum. A site that claimed a pack here would be claiming one its own stylesheet
 * does not emit.
 *
 * **The default mode is light, and it was light before this module existed.** The
 * switcher this bar replaced defaulted to light, and a bar that changed the first
 * paint of every page of the documentation while it was being reorganised would be
 * two changes wearing one commit.
 *
 * The set is ordered the way the company reads rather than the way this site reads:
 * the company site first, then the three products, then the design system they are
 * built in. Prism is last because it is not a fifth thing beside the others, and a
 * reader on this site is already at it.
 */
import type { SwitcherProduct } from '@nanisoft/prism-ui/components/product-switcher'
import type { Mode, PackId } from '@nanisoft/prism-ui/theming'

import { TOP_NAV } from './nav'

/** The pack a reader who has never chosen gets. The neutral one, and this site's own. */
export const DEFAULT_PACK: PackId = 'default'

/** The mode a reader who has never chosen gets. */
export const DEFAULT_MODE: Mode = 'light'

/** The site's own sections, as the bar's navigation. */
export const NAV = TOP_NAV

/** The family's five sites, and the set the bar's sites menu moves between. */
export const SITES: readonly SwitcherProduct[] = [
  { id: 'www', name: 'NaniSoft', pack: 'sky', href: 'https://www.nanisoft.com' },
  { id: 'nexus', name: 'Nexus', pack: 'lavender', href: 'https://nexus.nanisoft.com' },
  { id: 'atlas', name: 'Atlas', pack: 'mint', href: 'https://atlas.nanisoft.com' },
  { id: 'alphalens', name: 'AlphaLens', pack: 'blush', href: 'https://alphalens.nanisoft.com' },
  { id: 'prism', name: 'Prism', href: '/' },
]

/**
 * Every sentence the bar and the search dialog can say.
 *
 * A Block ships no copy, which is the right rule and it is why this object exists
 * rather than a default inside the package: the words a reader hears on this site
 * are this site's words. The two result labels are a pair because English inflects
 * the noun with the number, and the pair is where a site whose language does not
 * put the number first would supply its own order.
 */
export const COPY = {
  nav: 'Main',
  sites: 'The family',
  search: 'Search documentation',
  searchHint: 'Type to search the overview, the foundation, and every catalogue item.',
  searchClose: 'Close search',
  searchLoading: 'Loading the search index.',
  searchFailed: 'The search index could not be loaded.',
  searchEmpty: 'No matches.',
  searchOne: 'result.',
  searchOther: 'results.',
  theme: 'Colour theme',
  toDark: 'Switch to dark mode',
  toLight: 'Switch to light mode',
  menuOpen: 'Open menu',
  menuClose: 'Close menu',
}
