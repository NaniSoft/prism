import type { Metadata } from 'next'

import themes from '@nanisoft/prism-tokens/dist/themes.json'
import { themeTokens } from '@nanisoft/prism-tokens/dist/themes/index.js'

import { DocsShell } from '@/components/docs-shell'
import { flattenNav, projectNav } from '@/lib/nav'
import { source } from '@/lib/source'

export const metadata: Metadata = { title: 'Themes' }

/**
 * The address this page is served at, which is also the one the redirect table
 * sends `/themes` to.
 *
 * Stated here rather than read from the Section manifest, because the manifest's
 * copy is what the navigation links and this file's path is what the router
 * serves. Two places, one fact, compared by the site's gate rather than by
 * convention: it asserts that this route is served by a specific page rather than
 * by the catch-all, and `test/routes.test.ts` asserts that the redirect lands
 * here.
 */
const ROUTE = '/foundation/themes'

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
 * The pack reader, as a page of the Foundation Section.
 *
 * **It is a specific route, and that is what keeps it out of the content tree.**
 * A live reader has no content file: it is a component that reads the emitted
 * token output at build time, so there is nothing for the corpus to walk, nothing
 * for a `meta.json` to order and no document behind it in the routing tree. A
 * static segment takes precedence over the `[...slug]` catch-all, so the page is
 * served here and the catch-all never sees the route. The Section manifest's
 * `LIVE_ROUTES` is what puts it in the navigation, and the site's gate asserts
 * that this file is the route it links, that a content file is never filed at the
 * same address, and that the Section's index links it.
 *
 * **It renders in the same frame as every other page of the Section.** It used to
 * be the only route outside the documentation shell, which is the same thing as
 * being the only page a reader could not walk away from: no sidebar, no prev and
 * next, and no place showing which part of Foundation they were in. Projecting
 * the tree here costs no client JavaScript, because the shell, the sidebar and
 * the pager are server components.
 *
 * **Every Pack, in both Modes, from the token output.** The cards come from the
 * emitted `themes.json` and the values from the emitted token maps, so a pack
 * change is a token rebuild rather than an edit here. Each card carries its own
 * `data-pack`, which re-points the custom properties for its subtree, so the
 * utility classes on a card resolve to that Pack in whichever Mode the site is
 * in, and the swatch values beside them are that Pack's own compiled values
 * rather than the active Pack's.
 */
export default function ThemesPage() {
  const sections = projectNav(source.getPageTree())

  return (
    <DocsShell sections={sections} currentUrl={ROUTE} flat={flattenNav(sections)}>
      <div className="flex flex-col gap-10">
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
                data-pack={theme.id}
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

                  The `data-pack` attribute above scopes the card and its subtree, so
                  the utility classes resolve to this pack. These chips keep the
                  literal values the swatch grid below already uses, so the card reads
                  from one source even where no class is involved.
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
                  [data-pack=&quot;{theme.id}&quot;]
                </code>
              </section>
            )
          })}
        </div>
      </div>
    </DocsShell>
  )
}
