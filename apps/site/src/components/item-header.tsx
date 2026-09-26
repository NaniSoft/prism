import type { CatalogKind, ComponentCategory } from '@nanisoft/prism-ui/catalog'

const KIND_LABEL: Record<CatalogKind, string> = {
  component: 'Component',
  block: 'Block',
  page: 'Page',
}

/**
 * The item page header: the name, the catalogue description as the lede, and
 * the badges that say what kind of item this is.
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
  return (
    <header className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">{name}</h1>
        <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 font-mono text-[10px] uppercase">
          {KIND_LABEL[kind]}
        </span>
        {category ? (
          <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 font-mono text-[10px] uppercase">
            {category}
          </span>
        ) : null}
        {status === 'deprecated' ? (
          <span className="bg-destructive text-destructive-foreground rounded px-1.5 py-0.5 font-mono text-[10px] uppercase">
            deprecated
          </span>
        ) : null}
      </div>
      <p className="text-muted-foreground max-w-2xl text-lg text-pretty">{description}</p>
    </header>
  )
}
