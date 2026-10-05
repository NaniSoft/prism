import type { CatalogKind, ComponentCategory } from '@nanisoft/prism-ui/catalog'
import { headingSizeClass } from '@nanisoft/prism-ui/components/section'

import { kindLabel } from '@/lib/kinds'

/**
 * The item page header: the name, the catalogue description as the lede, and the
 * labels that say what kind of item this is.
 *
 * **The name is the heading and the labels sit under it, not beside it.** They
 * were inline with the `h1`, which put a ten-pixel mono label on the same line as
 * a thirty-pixel heading and made the heading's own measure depend on how long
 * the category's name happened to be. Two lines, the name and then the facts
 * about the item, is the order a reader takes them in anyway: what is this, then
 * what kind of thing is it.
 *
 * **The labels are `Badge` with a mono override, and the override is the reason
 * this is not simply `<Badge>`.** `DESIGN.md` puts category tags in the mono face
 * with the machine-readable values, and `Badge` authors `text-xs font-medium` in
 * the sans. `Badge` takes `className`, and the Component contract restricts that
 * to layout, so the two cannot be reconciled inside the package without a variant
 * every consumer would then be able to set. The labels are therefore site markup,
 * in the same semantic utilities the package emits, which is what the site is for.
 *
 * `deprecated` is the one filled label, and it is `destructive`. A status written
 * into a title stays in the title as words, so a label saying an item is
 * deprecated is a claim about the catalogue rather than about a reader's product,
 * and `DESIGN.md` reserves exactly that for `destructive`.
 *
 * The hairline under the header is new and is the reason the header reads as the
 * top of a document rather than as three floating lines: the API table and the
 * demo below it are the same kind of thing, and a rule is what says so without a
 * heading for each.
 */
export function ItemHeader({
  name,
  description,
  kind,
  category,
  status,
}: {
  name: string
  description: string
  kind: CatalogKind
  category: ComponentCategory | null
  status: 'stable' | 'deprecated'
}) {
  const label = 'rounded px-1.5 py-0.5 font-mono text-mono uppercase'

  return (
    <header className="border-border flex flex-col gap-3 border-b pb-8">
      <h1 className={`font-semibold tracking-tight text-balance ${headingSizeClass('h1')}`}>
        {name}
      </h1>
      <div className="flex flex-wrap items-center gap-2">
        <span className={`bg-muted text-muted-foreground ${label}`}>{kindLabel(kind)}</span>
        {category ? (
          <span className={`bg-muted text-muted-foreground ${label}`}>{category}</span>
        ) : null}
        {status === 'deprecated' ? (
          <span className={`bg-destructive text-destructive-foreground ${label}`}>deprecated</span>
        ) : null}
      </div>
      <p className="text-muted-foreground max-w-measure text-lg text-pretty">{description}</p>
    </header>
  )
}
