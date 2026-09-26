import type { Metadata } from 'next'

import foundationTokens from '@nanisoft/prism-tokens/dist/tokens.foundation.json'
import lightTokens from '@nanisoft/prism-tokens/dist/tokens.light.json'
import darkTokens from '@nanisoft/prism-tokens/dist/tokens.dark.json'
import themeManifest from '@nanisoft/prism-tokens/dist/themes.json'

export const metadata: Metadata = { title: 'Tokens' }

type Entry = { value: string; description?: string }
type TokenMap = Record<string, Entry>
type RampList = [string, [string, string][]][]
type ThemeEntry = { id: string }

const SEMANTIC = lightTokens as TokenMap
const DARK = darkTokens as TokenMap
const FOUNDATION = foundationTokens as TokenMap

/** Token keys are flat (`background`, `chart-1`); render as `background`. */
const label = (key: string) => key

/**
 * The foundation build merges two source files into `tokens.foundation.json`:
 * `color.tokens.json` holds the shared primitives, `pastel.tokens.json` holds a
 * `{theme}-neutral` and `{theme}-brand` pair per theme. Both land in one flat key
 * list, so the ramps arrive interleaved with nothing marking where one family
 * ends. Keying off the theme manifest — the same ids `build.mjs` expands from —
 * keeps the split correct when a theme is added, and a hyphen heuristic would
 * silently misfile any future primitive whose name happens to contain one.
 */
const THEME_IDS = new Set((themeManifest as ThemeEntry[]).map((theme) => theme.id))

/** True for `blush-neutral` and friends; false for `red` and friends. */
const isThemeRamp = (name: string) => THEME_IDS.has(name.split('-')[0])

function Swatch({ value }: { value: string }) {
  return (
    <span
      aria-hidden
      className="border-border/60 size-8 shrink-0 rounded-md border"
      style={{ background: value }}
    />
  )
}

/** A miniature surface, rendered once per mode, using only semantic utilities. */
function ModePreview({ mode }: { mode: 'light' | 'dark' }) {
  return (
    <div className={mode === 'dark' ? 'dark' : undefined}>
      <div className="bg-background text-foreground flex h-full flex-col gap-4 rounded-xl border p-5">
        <div className="flex items-center gap-2">
          <span className="bg-primary text-primary-foreground rounded-md px-2 py-1 text-xs font-medium">
            Primary
          </span>
          <span className="bg-secondary text-secondary-foreground rounded-md px-2 py-1 text-xs font-medium">
            Secondary
          </span>
          <span className="bg-destructive text-destructive-foreground rounded-md px-2 py-1 text-xs font-medium">
            Destructive
          </span>
        </div>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <span
              key={n}
              className="h-8 flex-1 rounded-md"
              style={{ background: `var(--chart-${n})` }}
            />
          ))}
        </div>
        <div className="border-border text-muted-foreground mt-auto rounded-lg border p-3 text-xs">
          Muted surface with border token
        </div>
      </div>
    </div>
  )
}

function Ramp({ name, steps }: { name: string; steps: [string, string][] }) {
  return (
    <div className="flex flex-col gap-2">
      <h4 className="font-mono text-xs font-medium tracking-wide uppercase">{name}</h4>
      <div className="grid grid-cols-11 gap-1">
        {steps.map(([step, value]) => (
          <div key={step} className="flex flex-col items-center gap-1.5">
            <div
              className="border-border/60 h-10 w-full rounded border"
              style={{ background: value }}
            />
            <span className="text-muted-foreground font-mono text-[10px]">{step}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Groups ramps under a named family heading.
 *
 * A bare run of sixteen sibling headings gave a screen-reader user sixteen
 * entries with no handle on them other than the section title far above. The
 * family label sits one step below the section `h2` (`text-lg`) and one step
 * above the ramp names (`font-mono text-xs`), which is the same sub-section
 * register the block detail page already uses for its `h2`s.
 */
function RampFamily({ title, ramps }: { title: string; ramps: RampList }) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
      <div className="flex flex-col gap-6">
        {ramps.map(([name, steps]) => (
          <Ramp key={name} name={name} steps={steps} />
        ))}
      </div>
    </div>
  )
}

export default function TokensPage() {
  const semanticEntries = Object.entries(SEMANTIC)
  const colorKeys = semanticEntries.filter(([k]) => k !== 'radius')

  const rampMap: Record<string, [string, string][]> = Object.entries(FOUNDATION)
    .filter(([key]) => key.startsWith('color.'))
    .reduce<Record<string, [string, string][]>>((acc, [key, entry]) => {
      const [, ramp, step] = key.split('.')
      ;(acc[ramp] ??= []).push([step, entry.value])
      return acc
    }, {})

  const ramps: RampList = Object.entries(rampMap)
  const baseRamps = ramps.filter(([name]) => !isThemeRamp(name))
  const themeRamps = ramps.filter(([name]) => isThemeRamp(name))

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-16">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Design tokens</h1>
        <p className="text-muted-foreground max-w-2xl text-sm">
          Authored in DTCG 2025.10 and compiled to CSS custom properties. The light and dark
          panels below are the same markup; only the token values differ.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold tracking-tight">One component, two themes</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <span className="text-muted-foreground text-xs font-medium">Light</span>
            <ModePreview mode="light" />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-muted-foreground text-xs font-medium">Dark</span>
            <ModePreview mode="dark" />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold tracking-tight">Semantic tokens</h2>
        <p className="text-muted-foreground text-sm">
          Named to match shadcn&apos;s variable contract, so every existing block and theme
          works unmodified.
        </p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {colorKeys.map(([key, entry]) => (
            <div
              key={key}
              className="border-border/70 bg-card flex items-start gap-3 rounded-lg border p-3"
            >
              <Swatch value={entry.value} />
              <div className="flex min-w-0 flex-col gap-1">
                <span className="font-mono text-xs font-medium break-all">{label(key)}</span>
                <span className="text-muted-foreground font-mono text-[11px] break-all">
                  {entry.value} → {DARK[key]?.value}
                </span>
                {entry.description ? (
                  <span className="text-muted-foreground text-[11px] leading-snug">
                    {entry.description}
                  </span>
                ) : null}
              </div>
            </div>
          ))}
          {SEMANTIC.radius ? (
            <div className="border-border/70 bg-card flex items-start gap-3 rounded-lg border p-3">
              <span
                aria-hidden
                className="border-border/60 bg-primary size-8 shrink-0 rounded-md border"
                style={{ borderRadius: SEMANTIC.radius.value }}
              />
              <div className="flex min-w-0 flex-col gap-1">
                <span className="font-mono text-xs font-medium">radius</span>
                <span className="text-muted-foreground font-mono text-[11px]">
                  {SEMANTIC.radius.value}, drives the sm…4xl scale
                </span>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-lg font-semibold tracking-tight">Foundation ramps</h2>
        <p className="text-muted-foreground text-sm">
          Raw primitives. Semantic tokens alias into these, which is what makes a new
          theme a matter of re-pointing references rather than re-picking colors.
        </p>
        <div className="flex flex-col gap-8">
          <RampFamily title="Base ramps" ramps={baseRamps} />
          <RampFamily title="Theme ramps" ramps={themeRamps} />
        </div>
      </section>
    </div>
  )
}
