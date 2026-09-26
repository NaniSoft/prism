import api from '@/generated/api.json'

type Row = {
  name: string
  type: string
  required: boolean
  default: string
  description: string
}

type ExportEntry = { name: string; rows: Row[]; inherited: string[] }

const TABLE = api as Record<string, { exports: ExportEntry[] }>

/**
 * The generated API reference.
 *
 * Rows come from `src/generated/api.json`, which `scripts/generate-api.mjs`
 * extracts from the emitted `.d.ts`. A component whose props are all inherited
 * (for example `React.ComponentProps<'div'>`) reports that inheritance rather
 * than inventing rows, and a reported default is the declaration's own, never a
 * demo's value.
 */
export function ApiTable({ slug }: { slug: string }) {
  const entry = TABLE[slug]
  if (!entry || entry.exports.length === 0) {
    return <p className="text-muted-foreground text-sm">No API reference is generated yet.</p>
  }

  const compound = entry.exports.length > 1

  return (
    <div className="flex flex-col gap-8">
      {entry.exports.map((part) => (
        <div key={part.name} className="flex flex-col gap-3">
          {compound ? (
            <h3 className="font-mono text-sm font-medium tracking-tight">{part.name}</h3>
          ) : null}

          {part.rows.length ? (
            <div className="border-border overflow-x-auto rounded-lg border">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-muted/40">
                  <tr>
                    <th scope="col" className="px-3 py-2 font-medium">Prop</th>
                    <th scope="col" className="px-3 py-2 font-medium">Type</th>
                    <th scope="col" className="px-3 py-2 font-medium">Default</th>
                    <th scope="col" className="px-3 py-2 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {part.rows.map((row) => (
                    <tr key={row.name} className="border-border border-t align-top">
                      <td className="px-3 py-2 font-mono text-xs whitespace-nowrap">
                        {row.name}
                        {row.required ? null : (
                          <span className="text-muted-foreground">?</span>
                        )}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs">{row.type}</td>
                      <td className="text-muted-foreground px-3 py-2 font-mono text-xs">
                        {row.default}
                      </td>
                      <td className="text-muted-foreground px-3 py-2">
                        {row.description || <span className="font-sans">-</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {part.inherited.length ? (
            <p className="text-muted-foreground text-sm">
              Inherits{' '}
              {part.inherited.map((type, index) => (
                <span key={type}>
                  {index > 0 ? ', ' : ''}
                  <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-xs">{type}</code>
                </span>
              ))}
              .
            </p>
          ) : null}

          {part.rows.length === 0 && part.inherited.length === 0 ? (
            <p className="text-muted-foreground text-sm">No documented props.</p>
          ) : null}
        </div>
      ))}
    </div>
  )
}
