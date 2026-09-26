import Link from 'next/link'

import type { NavSection } from '@/lib/nav'

/** The section sidebar for the documentation shell. */
export function SectionNav({
  sections,
  currentUrl,
}: {
  sections: NavSection[]
  currentUrl: string
}) {
  return (
    <nav aria-label="Documentation" className="flex flex-col gap-8">
      {sections.map((section) => {
        const active = currentUrl.startsWith(section.url)
        return (
          <div key={section.id} className="flex flex-col gap-2">
            <Link
              href={section.url}
              aria-current={currentUrl === section.url ? 'page' : undefined}
              className={
                active
                  ? 'text-foreground text-sm font-semibold tracking-tight'
                  : 'text-muted-foreground hover:text-foreground text-sm font-semibold tracking-tight transition-colors'
              }
            >
              {section.title}
            </Link>
            {section.items.length ? (
              <ul className="border-border flex flex-col gap-1 border-l">
                {section.items.map((item) => {
                  const isCurrent = item.url === currentUrl
                  return (
                    <li key={item.url}>
                      <Link
                        href={item.url}
                        aria-current={isCurrent ? 'page' : undefined}
                        className={
                          isCurrent
                            ? 'text-foreground border-primary -ml-px block border-l-2 py-1 pl-3 text-sm font-medium'
                            : 'text-muted-foreground hover:text-foreground border-transparent -ml-px block border-l-2 py-1 pl-3 text-sm transition-colors'
                        }
                      >
                        {item.title}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            ) : null}
          </div>
        )
      })}
    </nav>
  )
}
