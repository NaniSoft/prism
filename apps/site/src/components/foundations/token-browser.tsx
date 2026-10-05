import foundationTokens from '@nanisoft/prism-tokens/dist/tokens.foundation.json'
import lightTokens from '@nanisoft/prism-tokens/dist/tokens.light.json'
import darkTokens from '@nanisoft/prism-tokens/dist/tokens.dark.json'

/**
 * The full token browser.
 *
 * It lists every emitted custom property: the semantic contract once, with its
 * light and dark values, and every foundation group. This is a token inventory
 * rather than a colour page, which is why it is its own foundation.
 *
 * **One heading here is a section and the rest are captions, and the difference is
 * what each one names.** This renders inside an MDX body, which the page wraps in
 * `.prose`, and that article is where the prose heading treatments live. "Semantic
 * contract" is a division of the article, so it names no step and the article
 * decides: a utility sits in a later cascade layer than the article's own
 * component-layer rule, so a literal on that heading would win over the article and
 * put a second ladder inside it. It used to carry `text-lg`, and it came out at 18
 * pixels, below the `h3` the article sets above it.
 *
 * **The 184 group names are captions, and a caption is a heading at the caption
 * step.** Each one names the table under it and nothing else, which is a table's
 * name whatever the table holds, and this page holds 184 of them: a reader listing
 * the headings here is looking for `spacing` or `color` and not for
 * `color.lavender-neutral.950`, so they do not belong in the outline beside the one
 * division of the article that does. They are `h3` at `text-sm` in the mono face,
 * which is the caption `ApiTable` already renders for a compound export's part names
 * on every Item page, at the same 14 pixels and the same 500 as the column heads of
 * the table underneath. The face is the mono one because a token key is machine
 * notation, which is what this repository sets in mono, and because it is what tells
 * 184 keys apart from the one heading on the page that is a sentence. Dropping the
 * literal instead, which is what this file did for a while, is what put all 185 at
 * the article's `h2` step and left the navigation rail's own section titles at 14
 * pixels on the page whose whole job is being navigated.
 *
 * **Naming the caption step is also what makes the two tellable apart.** A heading
 * whose size is inherited names nothing, so a scan for literals cannot see it, while
 * a heading at a step at or above the ladder's floor is a rung by arithmetic. Five
 * theme names on `/foundation/themes` sat at 16 pixels and 500 for want of either,
 * and two scans looking for literals passed them. A caption that says `text-sm` is
 * visible to that scan and is below the floor by definition.
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
        <h2 className="font-semibold tracking-tight">Semantic contract</h2>
        <p className="text-muted-foreground text-sm">
          {semantics.length} custom properties. The names are shadcn&apos;s variable
          contract and are stable across versions.
        </p>
        {/*
          `overflow-x-auto`, not `overflow-hidden`, and the sibling reader in
          `token-table.tsx` is the reason to copy rather than to invent.

          A semantic name and a foundation key are both longer than a phone is
          wide, and a table cannot shrink below its min-content width, so the
          frame has to be a scroll container rather than a clipping one: `hidden`
          cut the tail off with no way to reach it, and a reader on a phone could
          not read half the inventory. The rounded clip the frame wanted is not
          lost by the change, because `border-radius` clips overflow whatever the
          overflow is, and `overflow-x: auto` computes `overflow-y` to `auto`
          rather than to `hidden`, so nothing is clipped vertically that was not
          clipped before. The frame has no height of its own, so that second axis
          never has anything to scroll.
        */}
        <div className="border-border overflow-x-auto rounded-xl border">
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
          <h3 className="font-mono text-sm font-medium tracking-tight">{group}</h3>
          <div className="border-border overflow-x-auto rounded-xl border">
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
