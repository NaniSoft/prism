'use client'

import { useState, type ReactNode } from 'react'

import { CopyButton } from './copy-button'

type View = 'preview' | 'code'

/**
 * The frame around a live demo: a preview or the source, a toggle, and a copy
 * control.
 *
 * The preview arrives as `children`, rendered on the server where the demo is
 * server-safe, so toggling between the two views only mounts and unmounts the
 * already-rendered subtree. The `client` flag is what the registry measured.
 */
export function ComponentDemoFrame({
  source,
  client,
  children,
}: {
  source: string
  client: boolean
  children: ReactNode
}) {
  const [view, setView] = useState<View>('preview')

  const tab = (id: View, label: string) => (
    <button
      key={id}
      type="button"
      onClick={() => setView(id)}
      aria-pressed={view === id}
      className={
        view === id
          ? 'bg-background text-foreground rounded-md px-2.5 py-1 text-xs font-medium shadow-xs transition-colors'
          : 'text-muted-foreground hover:text-foreground rounded-md px-2.5 py-1 text-xs font-medium transition-colors'
      }
    >
      {label}
    </button>
  )

  return (
    <figure className="border-border bg-card overflow-hidden rounded-xl border">
      <div className="border-border flex items-center justify-between gap-3 border-b px-3 py-2">
        <div className="bg-muted flex items-center gap-1 rounded-lg p-0.5">
          {tab('preview', 'Preview')}
          {tab('code', 'Code')}
        </div>
        <div className="flex items-center gap-2">
          {client ? (
            <span
              className="text-muted-foreground font-mono text-[10px] uppercase"
              title="This demo hydrates on the client."
            >
              client
            </span>
          ) : null}
          {view === 'code' ? <CopyButton value={source} /> : null}
        </div>
      </div>

      {view === 'preview' ? (
        <div className="bg-background p-4 sm:p-6">{children}</div>
      ) : (
        <pre className="bg-muted/40 overflow-x-auto p-4 text-xs leading-relaxed">
          <code>{source}</code>
        </pre>
      )}
    </figure>
  )
}
