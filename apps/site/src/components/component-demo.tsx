import { demos } from '@/generated/demos'

import { ComponentDemoFrame } from './component-demo-frame'

/**
 * Renders the live demo registered for a catalogue slug.
 *
 * The registry is generated from `src/demos/*.tsx`, so one file is the source
 * for the preview, the copy control and the corpus. The demo is rendered here,
 * on the server, and handed to the client frame as already-rendered children.
 */
export function ComponentDemo({ slug }: { slug: string }) {
  const entry = demos[slug]
  if (!entry) {
    return (
      <p className="text-muted-foreground border-border rounded-xl border border-dashed p-6 text-sm">
        No demo registered for <code className="font-mono">{slug}</code>.
      </p>
    )
  }
  const Demo = entry.component
  return (
    <ComponentDemoFrame source={entry.source} client={entry.client}>
      <Demo />
    </ComponentDemoFrame>
  )
}
