import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import type { TOCItemType } from 'fumadocs-core/toc'
import { notFound } from 'next/navigation'

import { ApiTable } from '@/components/api-table'
import { CatalogueIndex } from '@/components/catalogue-index'
import { DocsShell } from '@/components/docs-shell'
import { ItemHeader } from '@/components/item-header'
import { getMDXComponents } from '@/components/mdx'
import type { CataloguePageData } from '@/lib/catalogue'
import { buildNav, flattenNav } from '@/lib/nav'
import { proseSource, source } from '@/lib/source'

export function generateStaticParams() {
  return source.generateParams()
}

export const dynamicParams = false

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>
}): Promise<Metadata> {
  const { slug } = await params
  const page = source.getPage(slug)
  return page ? { title: (page.data.title as string | undefined) ?? undefined } : {}
}

type ProseBody = (props: { components?: Record<string, unknown> }) => ReactNode

export default async function Page({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params
  const page = source.getPage(slug)

  // The canonical fumadocs check, before returning and never inside a Suspense
  // boundary, so an unknown slug is a real not-found rather than a soft 404.
  if (!page) notFound()

  const sections = buildNav()
  const flat = flattenNav(sections)
  const components = getMDXComponents()

  if (page.type === 'catalogue') {
    const data = page.data as CataloguePageData

    if (data.sectionIndex) {
      return (
        <CatalogueIndex
          kind={data.kind}
          sections={sections}
          flat={flat}
          currentUrl={page.url}
        />
      )
    }

    const prosePage = proseSource.getPage([data.kind, data.slug])
    const prose = prosePage?.data as
      | { body?: ProseBody; toc?: TOCItemType[] }
      | undefined
    const Body = prose?.body

    return (
      <DocsShell sections={sections} currentUrl={page.url} flat={flat} toc={prose?.toc}>
        <ItemHeader
          name={data.name}
          description={data.description ?? ''}
          kind={data.kind}
          category={data.category}
          status={data.status}
        />

        {Body ? (
          <div className="prose">
            <Body components={components} />
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            No prose has been authored for this item yet.
          </p>
        )}

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold tracking-tight">API reference</h2>
          <ApiTable slug={data.slug} />
        </section>
      </DocsShell>
    )
  }

  const data = page.data as unknown as {
    title?: string
    description?: string
    body?: ProseBody
    toc?: TOCItemType[]
  }
  const Body = data.body

  return (
    <DocsShell sections={sections} currentUrl={page.url} flat={flat} toc={data.toc}>
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">{data.title}</h1>
        {data.description ? (
          <p className="text-muted-foreground max-w-2xl text-lg text-pretty">{data.description}</p>
        ) : null}
      </header>

      {Body ? (
        <div className="prose">
          <Body components={components} />
        </div>
      ) : null}
    </DocsShell>
  )
}
