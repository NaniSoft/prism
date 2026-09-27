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
import { flattenNav, projectNav } from '@/lib/nav'
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

  // The tree is the navigation's one source, read here because this is the one
  // module that can: the routing tree is compiled by the bundler plugin, so it
  // does not exist outside it. The projection refuses to return a partial
  // navigation, which is what turns a page the ordering forgot into a failed
  // render rather than a green build with a page missing from the sidebar.
  const sections = projectNav(source.getPageTree())
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
    /** The file opens with its own heading, so the frame adds none. */
    selfTitled?: boolean
    body?: ProseBody
    toc?: TOCItemType[]
  }
  const Body = data.body

  return (
    <DocsShell sections={sections} currentUrl={page.url} flat={flat} toc={data.toc}>
      {/*
        A page that declares its title in frontmatter has no heading of its own,
        so the frame prints one. A generated page is a published package's own
        `CHANGELOG.md`, byte for byte, and that file begins with the package's
        name: the heading is already in the body, and printing a second one
        above it is the same heading twice. Nothing is dropped from the file
        either way, which is the property the Section is for.
      */}
      {data.selfTitled ? null : (
        <header className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">{data.title}</h1>
          {data.description ? (
            <p className="text-muted-foreground max-w-2xl text-lg text-pretty">{data.description}</p>
          ) : null}
        </header>
      )}

      {Body ? (
        <div className="prose">
          <Body components={components} />
        </div>
      ) : null}
    </DocsShell>
  )
}
