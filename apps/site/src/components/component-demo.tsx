import { demos } from '@/generated/demos'
import { buildCatalog } from '@nanisoft/prism-ui/catalog'

import { CodePanel } from './code-panel'
import { SiteShowcase } from './site-showcase'
import { highlight } from '@/lib/highlight'

/**
 * Renders the showcase for a catalogue slug: the Item's live Demo and its source.
 *
 * **The Kind comes from the Catalogue rather than from the MDX call site.** The
 * `<ComponentDemo slug="..." />` in an Item's prose names the Item and nothing else,
 * which is right: the file is documentation about one Item and should not have to
 * restate which Kind it is. The one fact the showcase needs beyond the slug is
 * whether the Item has a layout a resolution could change, and the Catalogue holds
 * it as `kind` on the same list the navigation, the corpus and the agent surface
 * read. Reading it here means a Kind added to Prism is a decision the showcase makes
 * once, rather than a prop 270 documentation files would each have to pass.
 *
 * **Highlighting happens on the server and is handed to the frame as a rendered
 * panel, so no highlighter reaches a reader's browser.** The alternative is
 * highlighting on the client, which would put a grammar engine and every rule it
 * carries in the bundle of all 236 Item pages, to save a build-time cost of a few
 * milliseconds per page. The panel arrives as finished markup in a prop, and the
 * source string it was derived from is passed beside it so the copy control still
 * hands over the file byte for byte.
 */
export async function ComponentDemo({ slug }: { slug: string }) {
  const entry = demos[slug]
  const kind = kindOf(slug)

  if (!entry || !kind) {
    return (
      <p className="text-muted-foreground border-border rounded-xl border border-dashed p-6 text-sm">
        No demo registered for <code className="font-mono">{slug}</code>.
      </p>
    )
  }

  return (
    <SiteShowcase
      slug={slug}
      name={nameOf(slug)}
      source={entry.source}
      kind={kind}
      codePanel={<CodePanel filename={`${slug}.tsx`} lines={await highlight(entry.source)} />}
    />
  )
}

/**
 * The catalogue, read once.
 *
 * `buildCatalog()` is a sort over a literal list and this module is rendered once
 * per Item page, so calling it per render would re-sort 236 entries 236 times. The
 * map is built from it once because the catalogue does not change within a build:
 * it is a checked literal, and a catalogue that could change under a running
 * server would be a second source of truth for the item list.
 */
const KINDS = new Map(
  buildCatalog().map((item) => [item.slug, { kind: item.kind, name: item.name }]),
)

/** The Kind and display name for a slug, or `undefined` for a slug not in the list. */
function kindOf(slug: string) {
  return KINDS.get(slug)?.kind
}

/** The name a reader reads on the frame's title, which is the catalogue's word. */
function nameOf(slug: string) {
  return KINDS.get(slug)?.name ?? slug
}