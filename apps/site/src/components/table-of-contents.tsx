import type { TOCItemType } from 'fumadocs-core/toc'

/**
 * The in-page table of contents.
 *
 * It shows `##` headings only, which is why the Guidelines subsections are
 * authored as `###`: the outline stays three entries deep at most, and a reader
 * gets the page's shape rather than every subrule.
 */
export function TableOfContents({ toc }: { toc: TOCItemType[] }) {
  const items = toc.filter((item) => item.depth === 2)
  if (items.length === 0) return null

  return (
    <nav aria-label="On this page" className="flex flex-col gap-2">
      <span className="text-muted-foreground text-[10px] font-medium uppercase">On this page</span>
      <ul className="flex flex-col gap-1.5">
        {items.map((item) => (
          <li key={item.url}>
            <a
              href={item.url}
              className="text-muted-foreground hover:text-foreground block text-sm transition-colors"
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
