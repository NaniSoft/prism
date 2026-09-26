import type { Metadata } from 'next'

import themes from '@nanisoft/prism-tokens/dist/themes.json'
import { themeTokens } from '@nanisoft/prism-tokens/dist/themes/index.js'

export const metadata: Metadata = { title: 'Themes' }

type Entry = { value: string; description?: string }
type TokenMap = Record<string, Entry>

const SWATCHES: [string, string][] = [
  ['background', 'Surface'],
  ['foreground', 'Text'],
  ['card', 'Card'],
  ['primary', 'Primary'],
  ['accent', 'Accent'],
  ['muted', 'Muted'],
  ['destructive', 'Destructive'],
  ['success', 'Success'],
  ['warning', 'Warning'],
]

/** Paints a chip from one theme's own compiled values, not from the active theme. */
function tokenStyle(tokens: TokenMap, bg: string, fg: string) {
  return { background: tokens[bg]?.value, color: tokens[fg]?.value }
}

/**
 * Each card uses its own compiled token values.
 *
 * The `data-theme` wrapper only re-points *utility classes*; an inline
 * `style={{ background }}` is a literal, so a swatch has to be handed the value that
 * theme actually compiles to or every card renders the same palette.
 */
export default function ThemesPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-16">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Themes</h1>
        <p className="text-muted-foreground max-w-2xl text-sm">
          Five pastel themes, generated from OKLCH so every ramp is perceptually even and
          the set reads as one family. Each theme is a tinted neutral plus a pastel brand
          ramp, re-pointed onto the shared semantic contract at build time.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {themes.map((theme) => {
          const tokens = (themeTokens as Record<string, TokenMap>)[theme.id] ?? {}
          return (
          <section
            key={theme.id}
            data-theme={theme.id}
            className="bg-card flex flex-col gap-4 rounded-xl border p-5"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="font-medium tracking-tight">{theme.name}</h2>
                <span className="text-muted-foreground font-mono text-[10px]">
                  r {theme.radius}
                </span>
              </div>
              <p className="text-muted-foreground text-xs">{theme.description}</p>
            </div>

            {/*
              Each theme's real button styling, taken from that theme's compiled
              values rather than from a utility class.

              The `data-theme` attribute above cannot do this job: every
              `[data-theme]` selector the token build emits is root-scoped, so it
              only ever matches the attribute on `<html>`. A `bg-primary` chip in
              this card resolves against the *active* theme, so all five cards
              would show identical chips. These use the literal values the swatch
              grid below already uses.
            */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                style={tokenStyle(tokens, 'primary', 'primary-foreground')}
                className="rounded-md px-3 py-1.5 text-xs font-medium"
              >
                Primary
              </span>
              <span
                style={tokenStyle(tokens, 'secondary', 'secondary-foreground')}
                className="rounded-md px-3 py-1.5 text-xs font-medium"
              >
                Secondary
              </span>
              <span
                style={{
                  background: tokens.background?.value,
                  color: tokens.foreground?.value,
                  borderColor: tokens.border?.value,
                }}
                className="rounded-md border px-3 py-1.5 text-xs font-medium"
              >
                Outline
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {SWATCHES.map(([key, label]) => {
                const value = tokens[key]?.value
                return (
                  <div key={key} className="flex flex-col gap-1">
                    <div
                      className="border-border/60 h-9 w-full rounded-md border"
                      style={{ background: value }}
                    />
                    <span className="text-muted-foreground truncate font-mono text-[10px]">
                      {value}
                    </span>
                    <span className="text-muted-foreground text-[10px]">{label}</span>
                  </div>
                )
              })}
            </div>

            <code className="text-muted-foreground bg-muted rounded px-2 py-1 font-mono text-[10px]">
              [data-theme=&quot;{theme.id}&quot;]
            </code>
          </section>
          )
        })}
      </div>
    </div>
  )
}
