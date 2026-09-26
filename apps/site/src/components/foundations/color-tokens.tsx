import foundationTokens from '@nanisoft/prism-tokens/dist/tokens.foundation.json'
import lightTokens from '@nanisoft/prism-tokens/dist/tokens.light.json'
import darkTokens from '@nanisoft/prism-tokens/dist/tokens.dark.json'
import themeManifest from '@nanisoft/prism-tokens/dist/themes.json'

/**
 * The Colors reader.
 *
 * The semantic roles are the shadcn variable contract, shown as a light/dark
 * pair so the same role can be compared across modes. The foundation ramps are
 * the raw values those roles alias into. Every value is read from the emitted
 * JSON.
 */

type Entry = { value: string; description?: string }
type ThemeEntry = { id: string }

const LIGHT = lightTokens as Record<string, Entry>
const DARK = darkTokens as Record<string, Entry>
const FOUNDATION = foundationTokens as Record<string, Entry>
const THEME_IDS = new Set((themeManifest as ThemeEntry[]).map((theme) => theme.id))

function isThemeRamp(name: string): boolean {
  return THEME_IDS.has(name.split('-')[0] ?? '')
}

function Swatch({ value }: { value: string }) {
  return (
    <span
      aria-hidden
      className="border-border/60 size-8 shrink-0 rounded-md border"
      style={{ background: value }}
    />
  )
}

export function ColorTokens() {
  const semantic = Object.entries(LIGHT).filter(([key]) => key !== 'radius')

  const ramps: Record<string, [string, string][]> = {}
  for (const [key, entry] of Object.entries(FOUNDATION)) {
    if (!key.startsWith('color.')) continue
    const [, ramp, step] = key.split('.')
    if (!ramp || !step) continue
    ;(ramps[ramp] ??= []).push([step, entry.value])
  }
  const rampNames = Object.keys(ramps).sort()
  const baseRamps = rampNames.filter((name) => !isThemeRamp(name))
  const themeRamps = rampNames.filter((name) => isThemeRamp(name))

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold tracking-tight">Semantic roles</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {semantic.map(([key, entry]) => (
            <div key={key} className="border-border bg-card flex items-start gap-3 rounded-lg border p-3">
              <Swatch value={entry.value} />
              <div className="flex min-w-0 flex-col gap-1">
                <span className="font-mono text-xs font-medium break-all">{key}</span>
                <span className="text-muted-foreground font-mono text-[11px] break-all">
                  {entry.value} / {DARK[key]?.value ?? entry.value}
                </span>
                {entry.description ? (
                  <span className="text-muted-foreground text-[11px] leading-snug">
                    {entry.description}
                  </span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-lg font-semibold tracking-tight">Foundation ramps</h2>
        <p className="text-muted-foreground text-sm">
          Raw primitives. A semantic role aliases into one of these, which is what
          makes a change of pack a matter of re-pointing references.
        </p>

        {[
          ['Base ramps', baseRamps],
          ['Theme ramps', themeRamps],
        ].map(([title, names]) => (
          <div key={title as string} className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold tracking-tight">{title as string}</h3>
            <div className="flex flex-col gap-5">
              {(names as string[]).map((name) => (
                <div key={name} className="flex flex-col gap-2">
                  <span className="font-mono text-xs font-medium tracking-wide uppercase">
                    {name}
                  </span>
                  <div className="grid grid-cols-11 gap-1">
                    {(ramps[name] ?? []).map(([step, value]) => (
                      <div key={step} className="flex flex-col items-center gap-1.5">
                        <span
                          className="border-border/60 h-10 w-full rounded border"
                          style={{ background: value }}
                        />
                        <span className="text-muted-foreground font-mono text-[10px]">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
