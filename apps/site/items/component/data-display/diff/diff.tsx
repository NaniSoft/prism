'use client'

import { useState } from 'react'

import { Diff, type DiffLine } from '@nanisoft/prism-ui/components/diff'

/**
 * Two changes worth comparing, and the difference between them is the point of the
 * Component.
 *
 * The first rewrite changes three characters of a long line, so its bar is a
 * sliver. The second replaces most of a short line, so its bar is nearly the
 * gutter. A conventional diff marks both identically and the eye goes to neither;
 * here the reader's eye goes to the rewrite, which is the change that was worth a
 * reviewer's attention.
 */
const SMALL: DiffLine[] = [
  { kind: 'context', oldNumber: 41, newNumber: 41, content: 'export async function syncWorkspace(client: Client) {' },
  { kind: 'context', oldNumber: 42, newNumber: 42, content: '  const queue = new WorkQueue({' },
  { kind: 'context', oldNumber: 43, newNumber: 43, content: '    concurrency: DEFAULT_CONCURRENCY,' },
  { kind: 'removed', oldNumber: 44, content: '    timeout: 30_000,', changed: [[12, 18]] },
  { kind: 'added', newNumber: 44, content: '    timeout: 5_000,', changed: [[12, 14]] },
  { kind: 'context', oldNumber: 45, newNumber: 45, content: '  })' },
]

const LARGE: DiffLine[] = [
  { kind: 'context', oldNumber: 12, newNumber: 12, content: '  const result = await run(input)' },
  { kind: 'removed', oldNumber: 13, content: '  return result.data', changed: [[9, 20]] },
  {
    kind: 'added',
    newNumber: 13,
    content: '  if (!result.ok) throw new RunFailed(result.reason)',
    changed: [[2, 49]],
  },
  { kind: 'context', oldNumber: 14, newNumber: 14, content: '}' },
]

const LABELS = { added: 'Added', removed: 'Removed', context: 'Unchanged' }

/** Both changes, so the two densities can be read against each other. */
export default function DiffDemo() {
  const [large, setLarge] = useState(false)

  return (
    <div className="flex max-w-page flex-col gap-6">
      <Diff
        lines={SMALL}
        label="Changes to syncWorkspace"
        labels={LABELS}
        file="src/sync.ts"
        summary="1 addition, 1 deletion"
      />
      <Diff
        lines={large ? LARGE : SMALL}
        label="Changes to run"
        labels={LABELS}
        file="src/run.ts"
        summary={large ? '1 addition, 1 deletion' : undefined}
      />
      <button
        type="button"
        onClick={() => setLarge((value) => !value)}
        className="text-muted-foreground hover:text-foreground self-start text-sm underline underline-offset-4"
      >
        {large ? 'Show a three-character change' : 'Show a rewritten line'}
      </button>
    </div>
  )
}
