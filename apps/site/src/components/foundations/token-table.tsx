import foundationTokens from '@nanisoft/prism-tokens/dist/tokens.foundation.json'

/**
 * A live reader for one token family.
 *
 * Every value comes from the emitted JSON, and every preview is painted with the
 * emitted `var(--...)`, so a token change shows here as soon as the token
 * package is rebuilt. No value is hardcoded in this file.
 */

type FoundationEntry = { value: string; description?: string }
const FOUNDATION = foundationTokens as Record<string, FoundationEntry>

type PreviewKind = 'radius' | 'shadow' | 'spacing' | 'font' | 'size' | 'leading' | 'tracking' | 'weight' | 'motion'

type Row = {
  key: string
  variable: string
  value: string
  preview: PreviewKind
}

const RADIUS_SCALE: [string, string][] = [
  ['sm', '0.6'],
  ['md', '0.8'],
  ['lg', '1'],
  ['xl', '1.4'],
  ['2xl', '1.8'],
  ['3xl', '2.2'],
  ['4xl', '2.6'],
]

function variableName(key: string): string {
  return `--${key.replace(/\./g, '-')}`
}

function foundationRows(prefix: string, preview: PreviewKind): Row[] {
  return Object.entries(FOUNDATION)
    .filter(([key]) => key.startsWith(`${prefix}.`))
    .map(([key, entry]) => ({
      key,
      variable: variableName(key),
      value: entry.value,
      preview,
    }))
}

function typographyRows(): Row[] {
  return [
    ...foundationRows('font-weight', 'weight'),
    ...foundationRows('font', 'font'),
    ...foundationRows('text', 'size'),
    ...foundationRows('leading', 'leading'),
    ...foundationRows('tracking', 'tracking'),
  ]
}

function rowsFor(group: string): Row[] {
  switch (group) {
    case 'radius':
      return RADIUS_SCALE.map(([name, multiplier]) => ({
        key: `radius.${name}`,
        variable: `--radius-${name}`,
        value: multiplier === '1' ? 'var(--radius)' : `calc(var(--radius) * ${multiplier})`,
        preview: 'radius',
      }))
    case 'shadow':
      return foundationRows('shadow', 'shadow')
    case 'spacing':
      return foundationRows('spacing', 'spacing')
    case 'typography':
      return typographyRows()
    case 'motion':
      return [
        ...foundationRows('duration', 'motion'),
        ...foundationRows('ease', 'motion'),
      ]
    default:
      return []
  }
}

function Preview({ row }: { row: Row }) {
  switch (row.preview) {
    case 'radius':
      return (
        <span
          className="border-primary bg-primary/20 inline-block size-8 border"
          style={{ borderRadius: `var(${row.variable})` }}
        />
      )
    case 'shadow':
      return (
        <span
          className="bg-background inline-block size-8 rounded-md border"
          style={{ boxShadow: `var(${row.variable})` }}
        />
      )
    case 'spacing':
      return (
        <span
          className="bg-primary/40 inline-block h-4 rounded-sm"
          style={{ width: `var(${row.variable})` }}
        />
      )
    case 'font':
      return (
        <span className="text-sm" style={{ fontFamily: `var(${row.variable})` }}>
          Aa
        </span>
      )
    case 'size':
      return (
        <span className="whitespace-nowrap" style={{ fontSize: `var(${row.variable})` }}>
          Aa
        </span>
      )
    case 'leading':
      return (
        <span className="block max-w-32 text-sm" style={{ lineHeight: `var(${row.variable})` }}>
          Two lines of text to show the leading.
        </span>
      )
    case 'tracking':
      return (
        <span className="text-sm" style={{ letterSpacing: `var(${row.variable})` }}>
          TRACKING
        </span>
      )
    case 'weight':
      return (
        <span className="text-sm" style={{ fontWeight: `var(${row.variable})` }}>
          Weight
        </span>
      )
    case 'motion':
      return (
        <span
          className="bg-primary/40 hover:translate-x-2 motion-safe:transition-transform inline-block size-5 rounded-sm"
          style={{
            transitionDuration: row.key.startsWith('duration')
              ? `var(${row.variable})`
              : 'var(--duration-base)',
            transitionTimingFunction: row.key.startsWith('ease')
              ? `var(${row.variable})`
              : 'var(--ease-out)',
          }}
        />
      )
    default:
      return null
  }
}

export function TokenTable({ group }: { group: string }) {
  const rows = rowsFor(group)

  return (
    <div className="border-border overflow-x-auto rounded-xl border">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-muted/40">
          <tr>
            <th scope="col" className="px-3 py-2 font-medium">Token</th>
            <th scope="col" className="px-3 py-2 font-medium">Variable</th>
            <th scope="col" className="px-3 py-2 font-medium">Value</th>
            <th scope="col" className="px-3 py-2 font-medium">Preview</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className="border-border border-t align-middle">
              <td className="px-3 py-2 font-mono text-xs">{row.key}</td>
              <td className="px-3 py-2 font-mono text-xs">{row.variable}</td>
              <td className="text-muted-foreground px-3 py-2 font-mono text-xs break-all">
                {row.value}
              </td>
              <td className="px-3 py-2">
                <Preview row={row} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
