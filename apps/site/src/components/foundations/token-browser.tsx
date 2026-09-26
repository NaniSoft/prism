import foundationTokens from '@nanisoft/prism-tokens/dist/tokens.foundation.json'
import lightTokens from '@nanisoft/prism-tokens/dist/tokens.light.json'
import darkTokens from '@nanisoft/prism-tokens/dist/tokens.dark.json'

/**
 * The full token browser.
 *
 * It lists every emitted custom property: the semantic contract once, with its
 * light and dark values, and every foundation group. This is a token inventory
 * rather than a colour page, which is why it is its own foundation.
 */

type Entry = { value: string; description?: string }

const LIGHT = lightTokens as Record<string, Entry>
const DARK = darkTokens as Record<string, Entry>
const FOUNDATION = foundationTokens as Record<string, Entry>

const GROUP_ORDER = [
  'radius',
  'font',
  'font-weight',
  'text',
  'leading',
  'tracking',
  'spacing',
  'duration',
  'ease',
  'shadow',
  'breakpoint',
  'container',
  'color',
]

function groupOf(key: string): string {
  if (key.includes('-') && FOUNDATION[key]) return key
  for (const group of GROUP_ORDER) {
    if (key.startsWith(`${group}.`)) return group
    if (key === group) return group
  }
  return key.split('.')[0] ?? 'other'
}

export function TokenBrowser() {
  const semantics = Object.entries(LIGHT)

  const groups = new Map<string, [string, string][]>()
  for (const [key, entry] of Object.entries(FOUNDATION)) {
    const group = groupOf(key)
    const list = groups.get(group) ?? []
    list.push([key, entry.value])
    groups.set(group, list)
  }

  const groupNames = [...groups.keys()].sort(
    (a, b) => GROUP_ORDER.indexOf(a) - GROUP_ORDER.indexOf(b),
  )

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold tracking-tight">Semantic contract</h2>
        <p className="text-muted-foreground text-sm">
          {semantics.length} custom properties. The names are shadcn&apos;s variable
          contract and are stable across versions.
        </p>
        <div className="border-border overflow-hidden rounded-xl border">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th scope="col" className="px-3 py-2 font-medium">Variable</th>
                <th scope="col" className="px-3 py-2 font-medium">Light</th>
                <th scope="col" className="px-3 py-2 font-medium">Dark</th>
              </tr>
            </thead>
            <tbody>
              {semantics.map(([key, entry]) => (
                <tr key={key} className="border-border border-t">
                  <td className="px-3 py-2 font-mono text-xs">{`--${key}`}</td>
                  <td className="text-muted-foreground px-3 py-2 font-mono text-xs break-all">
                    {entry.value}
                  </td>
                  <td className="text-muted-foreground px-3 py-2 font-mono text-xs break-all">
                    {DARK[key]?.value ?? entry.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {groupNames.map((group) => (
        <section key={group} className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold tracking-tight">{group}</h2>
          <div className="border-border overflow-hidden rounded-xl border">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th scope="col" className="px-3 py-2 font-medium">Token</th>
                  <th scope="col" className="px-3 py-2 font-medium">Value</th>
                </tr>
              </thead>
              <tbody>
                {(groups.get(group) ?? []).map(([key, value]) => (
                  <tr key={key} className="border-border border-t">
                    <td className="px-3 py-2 font-mono text-xs">{key}</td>
                    <td className="text-muted-foreground px-3 py-2 font-mono text-xs break-all">
                      {value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  )
}
