import type { CatalogKind } from '@nanisoft/prism-ui/catalog'

/**
 * The name a reader or an agent is shown for each Kind.
 *
 * **One table, because there were three.** `item-grid.tsx` and `item-header.tsx`
 * each carried an identical `KIND_LABEL`, and `lib/catalogue.ts` carried the same
 * three names inside its Section table. Adding a fourth Kind meant editing all
 * three, and a Kind added to two of them renders on the grid and not on the header,
 * which is the kind of drift that is invisible until someone reads the two halves
 * of one page against each other.
 *
 * The type is the mechanism rather than the discipline: a `Record<CatalogKind,
 * string>` cannot be missing a member, so a fourth Kind is a compile error in one
 * place rather than a silent absence in three.
 *
 * **`live` is labelled `Live surface` and the other three are not.** The other
 * three are nouns that are also their own label, so there was nothing to decide.
 * `live` is an adjective, and a reader handed the bare word is handed an adjective
 * to reason about. A noun phrase tells them what they are looking at. The Kind's
 * discriminator stays `live`; this is only the name printed beside it.
 */
export const KIND_LABELS: Record<CatalogKind, string> = {
  component: 'Component',
  block: 'Block',
  page: 'Page',
  live: 'Live surface',
}

/** The name for one Kind, or the bare discriminator if it is somehow absent. */
export function kindLabel(kind: CatalogKind): string {
  return KIND_LABELS[kind] ?? kind
}
