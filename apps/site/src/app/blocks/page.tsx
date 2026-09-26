import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { blocks, catalogSummary, categories } from '@/lib/catalog'

export const metadata: Metadata = { title: 'Blocks' }

/**
 * Browse, not decide.
 *
 * Each card answers "what is it and what does it cost"; the install command and
 * the full manifest live on the block's own page. Splitting the two jobs is why
 * the cards can stay scannable, and why the copy button does not appear five
 * times on one screen.
 */
export default async function BlocksPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  const active = category && categories.includes(category) ? category : null
  const visible = active ? blocks.filter((b) => b.categories.includes(active)) : blocks

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-16">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Blocks</h1>
        <p className="text-muted-foreground max-w-2xl text-sm">
          Every block installs as source you own, with its dependencies resolved by the
          shadcn CLI. Previews below render live against the active theme.
        </p>
        {/*
          Stated once, from measurement rather than assertion. `allServer` is
          computed by the analyzer, so this line disappears the day someone adds a
          block that needs a client boundary instead of quietly becoming a lie.

          It is also withheld when the analyzer could not finish. `allServer`
          requires every block to be both server and verified, so a dependency
          that moved and stopped resolving takes the claim down rather than
          leaving it asserted on the strength of a walk that never completed.
          Saying "we could not check" is the honest middle; the other two options
          are a false claim and no claim at all.
        */}
        {catalogSummary.allServer ? (
          <p className="text-muted-foreground max-w-2xl text-sm">
            All {catalogSummary.count} blocks are Server Components, so installing one adds
            nothing to your client bundle.
          </p>
        ) : catalogSummary.unverifiedBlocks > 0 ? (
          <p className="text-muted-foreground max-w-2xl text-sm">
            {catalogSummary.clientBlocks} of {catalogSummary.count} blocks cross a client boundary.
            {' '}
            {catalogSummary.unverifiedBlocks} could not be verified: a dependency they import
            would not resolve, so this page will not call them server-only until it can check.
          </p>
        ) : (
          <p className="text-muted-foreground max-w-2xl text-sm">
            {catalogSummary.clientBlocks} of {catalogSummary.count} blocks cross a client
            boundary and ship JavaScript.
          </p>
        )}
      </header>

      {/*
        Categories as links, not a client-side filter. Two categories do not
        justify shipping a filter widget, and link-based state costs no JavaScript,
        survives a reload, and can be pasted to a colleague.
      */}
      {categories.length > 1 ? (
        <nav aria-label="Filter by category" className="flex flex-wrap items-center gap-2">
          <Link
            href="/blocks"
            aria-current={active ? undefined : 'page'}
            className={
              active
                ? 'text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-full border px-3 py-1.5 text-sm transition-colors'
                : 'bg-accent text-accent-foreground rounded-full border px-3 py-1.5 text-sm transition-colors'
            }
          >
            All
          </Link>
          {categories.map((category) => (
            <Link
              key={category}
              href={`/blocks?category=${category}`}
              aria-current={active === category ? 'page' : undefined}
              className={
                active === category
                  ? 'bg-accent text-accent-foreground rounded-full border px-3 py-1.5 text-sm capitalize transition-colors'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-full border px-3 py-1.5 text-sm capitalize transition-colors'
              }
            >
              {category}
            </Link>
          ))}
        </nav>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        {visible.map((block) => (
          <article
            key={block.name}
            className="border-border bg-card flex flex-col overflow-hidden rounded-xl border"
          >
            <div className="flex flex-col gap-2 p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-medium tracking-tight">{block.title}</h2>
                <span className="text-muted-foreground shrink-0 font-mono text-[10px] uppercase">
                  {block.categories.join(' ')}
                </span>
              </div>
              <p className="text-muted-foreground text-sm">{block.description}</p>
              {/*
                The cost, stated compactly. This is the fact a buyer of a block
                library cannot get anywhere else, so it sits above the preview
                rather than below the fold of a detail page.
              */}
              <p className="text-muted-foreground text-xs">
                {/* An unverified block says so rather than defaulting to "server". */}
                {block.cost.client
                  ? 'Client component'
                  : block.cost.verified
                    ? 'Server component'
                    : 'Rendering unverified'}
                ,{' '}
                {block.cost.code} lines, {block.cost.fileCount} files
              </p>
            </div>

            <div className="bg-muted/30 pointer-events-none flex-1 overflow-hidden">
              {block.preview ? (
                <div className="origin-top scale-[0.7] sm:scale-[0.8]">{block.preview}</div>
              ) : (
                <p className="text-muted-foreground p-8 text-sm">No preview registered.</p>
              )}
            </div>

            <div className="border-t p-5">
              <Link
                href={`/blocks/${block.name}`}
                className="text-foreground inline-flex items-center gap-1 text-sm font-medium underline-offset-4 hover:underline"
              >
                Details
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </article>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No blocks in this category yet.
        </p>
      ) : null}
    </div>
  )
}
