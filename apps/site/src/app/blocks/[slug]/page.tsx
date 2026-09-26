import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import { blocks, getBlock, installCommand } from '@/lib/catalog'
import { CopyButton } from '@/components/copy-button'

export function generateStaticParams() {
  return blocks.map((block) => ({ slug: block.name }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const block = getBlock(slug)
  return { title: block?.title ?? 'Block' }
}

function InstallCommand({ command }: { command: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
      <code className="font-mono text-xs break-all">{command}</code>
      <CopyButton value={command} />
    </div>
  )
}

/**
 * A fact, not a feature card.
 *
 * Four labelled values in a row rather than four bordered tiles: these are
 * measurements of one thing, so they read as a single specification. The
 * client-boundary cell is the reason this strip exists, so it is stated in words
 * rather than as a bare `false`.
 *
 * The strip is a real `dl`. The label is the term, the value is the
 * description, and the note is a second description of that same term rather
 * than a term of its own: "Comments excluded" qualifies the line count, it does
 * not name a fifth thing being measured. One term with two descriptions is
 * exactly the grouping the `div` inside a `dl` exists for, and it hands the
 * relationship to the accessibility tree instead of leaving the reader to infer
 * it from vertical alignment. That `div` is load-bearing twice over: a bare
 * `dt`/`dd` pair would be two grid items rather than one cell, and the 2x2 /
 * 1x4 row would collapse.
 */
function Fact({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="flex flex-col gap-1 px-4 py-3">
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="text-sm font-semibold tracking-tight">{value}</dd>
      {note ? <dd className="text-muted-foreground text-xs">{note}</dd> : null}
    </div>
  )
}

export default async function BlockPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const block = getBlock(slug)
  if (!block) notFound()

  const own = block.files.filter((f) => f.type !== 'registry:lib')
  const shared = block.files.filter((f) => f.type === 'registry:lib')
  const depCount = block.registryDependencies.length + block.dependencies.length

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-16">
      <Link
        href="/blocks"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
      >
        <ArrowLeft className="size-3.5" />
        All blocks
      </Link>

      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{block.title}</h1>
          {block.categories.map((category) => (
            <span
              key={category}
              className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 font-mono text-[10px] uppercase"
            >
              {category}
            </span>
          ))}
        </div>
        <p className="text-muted-foreground max-w-2xl text-sm">{block.description}</p>
      </header>

      {/*
        Cost before install command.

        A shared library earns its keep by being predictable, and "how much is this
        going to cost me" is the question a block page is uniquely placed to answer
        because the answer is measured from the source rather than asserted. It
        also belongs above the install command: someone deciding whether to run
        that command wants the cost first and the syntax second.
      */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold tracking-tight">What it costs</h2>
        <dl className="divide-border grid grid-cols-2 divide-y rounded-lg border sm:grid-cols-4 sm:divide-y-0">
          <Fact
            label="Rendering"
            value={
              block.cost.client
                ? 'Client component'
                : block.cost.verified
                  ? 'Server component'
                  : 'Unverified'
            }
            note={
              block.cost.client
                ? block.cost.clientSource
                  ? `Ships JavaScript, via ${block.cost.clientSource.file}`
                  : 'Ships JavaScript and hydrates'
                : block.cost.verified
                  ? 'Adds no client JavaScript'
                  : 'A dependency would not resolve, so the analyzer could not confirm either way'
            }
          />
          <Fact label="Code" value={`${block.cost.code} lines`} note="Comments excluded" />
          <Fact label="Files" value={String(block.cost.fileCount)} note={`${shared.length} shared`} />
          <Fact
            label="Dependencies"
            value={String(depCount)}
            note={depCount ? 'Resolved on install' : 'None'}
          />
        </dl>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold tracking-tight">Install</h2>
        <InstallCommand command={installCommand(block.name)} />
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <span className="text-muted-foreground text-xs">Writes</span>
            <ul className="flex flex-col gap-1">
              {own.map((file) => (
                <li key={file.target} className="text-muted-foreground font-mono text-xs">
                  {file.target}
                </li>
              ))}
            </ul>
          </div>
          {shared.length ? (
            <div className="flex flex-col gap-1.5">
              <span className="text-muted-foreground text-xs">
                Also pulls in, shared across the catalog
              </span>
              <ul className="flex flex-col gap-1">
                {shared.map((file) => (
                  <li key={file.target} className="text-muted-foreground font-mono text-xs">
                    {file.target}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold tracking-tight">Preview</h2>
        <div className="border-border bg-card overflow-hidden rounded-xl border">
          {block.preview ?? (
            <p className="text-muted-foreground p-8 text-sm">No preview registered.</p>
          )}
        </div>
        <p className="text-muted-foreground text-xs">
          Rendered live from the registry against whichever theme is selected in the header.
        </p>
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold tracking-tight">Dependencies</h2>
          {block.registryDependencies.length || block.dependencies.length ? (
            <ul className="flex flex-col gap-1.5">
              {block.registryDependencies.map((dep) => (
                <li key={dep} className="text-muted-foreground text-sm">
                  <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-xs">{dep}</code>{' '}
                  shadcn component
                </li>
              ))}
              {block.dependencies.map((dep) => (
                <li key={dep} className="text-muted-foreground text-sm">
                  <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-xs">{dep}</code>{' '}
                  npm package
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">None.</p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold tracking-tight">Install name</h2>
          <p className="text-muted-foreground text-sm">
            Added to <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-xs">components.json</code>{' '}
            as <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-xs">@nanisoft/{block.name}</code>,
            so it can be re-applied after a token change.
          </p>
        </div>
      </section>
    </div>
  )
}
