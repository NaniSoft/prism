'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Check, ChevronDown, Moon, Sun } from 'lucide-react'

import themes from '@nanisoft/prism-tokens/dist/themes.json'
import { themeTokens, themeTokensDark } from '@nanisoft/prism-tokens/dist/themes/index.js'

type Mode = 'light' | 'dark'

const STORAGE_KEY = 'ds-theme'

const OPTIONS = [{ id: 'default', name: 'Default' }, ...themes]

/**
 * Writes the active theme onto <html>. The same keys are read by the inline script
 * in the root layout, so the first paint already has the right colors.
 */
export function applyTheme(id: string, mode: Mode) {
  const root = document.documentElement
  if (id === 'default') {
    delete root.dataset.theme
  } else {
    root.dataset.theme = id
  }
  root.classList.toggle('dark', mode === 'dark')
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ id, mode }))
}

type TokenMap = Record<string, { value: string }>

const THEME_TOKENS = themeTokens as Record<string, TokenMap>
const THEME_TOKENS_DARK = themeTokensDark as Record<string, TokenMap>

/**
 * The colour a theme's swatch shows.
 *
 * Every `[data-theme]` selector the token build emits is root-scoped, either
 * `:root[data-theme="<id>"]` or `.dark[data-theme="<id>"]`, so putting the
 * attribute on a `<span>` matches nothing and the swatch silently inherits the
 * *active* theme's `--primary`. All six options then render the same dot, which
 * is the one thing a colour swatch must never do.
 *
 * So the swatch takes the literal compiled value, the same way the swatches on
 * `/themes` do. The literal is read per mode, because an inline style has no
 * cascade to fall back on: publishing only the light values left the five pastel
 * dots holding their light colours in dark mode, so the dots disagreed with the
 * theme they named while the one swatch that did track the mode was `default`,
 * the only row with no literal on it.
 *
 * The default theme has no entry in `themeTokens`, because the token build only
 * emits the five pastel themes; it resolves through the normal cascade, so
 * `undefined` is the correct answer there and `bg-primary` is what paints it.
 */
function swatchFor(themeId: string, mode: Mode): string | undefined {
  if (themeId === 'default') return undefined
  const tokens = mode === 'dark' ? THEME_TOKENS_DARK : THEME_TOKENS
  return tokens[themeId]?.primary?.value
}

/**
 * Theme and mode controls.
 *
 * The six colour options live in a disclosure rather than as a permanent row of
 * pills: side by side they need roughly 380px, which does not fit beside the
 * navigation at any breakpoint down to `lg`. Collapsing to a single trigger keeps
 * the header to one row at every width and leaves the full list one tap away.
 *
 * The active option is derived from `id` directly instead of being gated on a
 * `mounted` flag. Gating it meant the first client render matched the server's,
 * but it also shipped `aria-pressed="false"` on every option — including the one
 * in use — until the effect ran. Reading `id` is still hydration-safe, because
 * `id` is `'default'` for both the server render and the first client render, and
 * the effect only afterwards lifts the stored value into state.
 */
export function ThemeSwitcher() {
  const [id, setId] = useState('default')
  const [mode, setMode] = useState<Mode>('light')
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const panelId = useId()

  /**
   * Closes the disclosure, handing focus back to the trigger when it was inside
   * the panel.
   *
   * The panel is conditionally rendered, so unmounting it while it holds focus
   * drops the caret to `<body>` and sends a keyboard user back to the top of the
   * document. The containment check runs before `setOpen`, while the panel is
   * still mounted and `document.activeElement` still points into it; moving focus
   * to the trigger first is safe because the trigger sits outside the subtree
   * React is about to remove. Closing by clicking elsewhere does not qualify —
   * focus was never in the panel, and claiming it would steal it from wherever
   * the user actually put it.
   */
  const close = useCallback(() => {
    const panel = panelRef.current
    if (panel?.contains(document.activeElement)) {
      triggerRef.current?.focus()
    }
    setOpen(false)
  }, [])

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { id: string; mode: Mode }
        // The setState-in-effect rule is off for this read on purpose. This is a
        // mount-once read of a persisted user preference, and the alternative the
        // rule assumes — read it during render — is the hydration mismatch this
        // component's own comment describes having already tried and rejected: the
        // server has no localStorage, so the first client render would disagree
        // with the server HTML. The blocking inline script in the root layout is
        // what makes the *page* correct before hydration; this effect is what makes
        // React's own state agree with it afterwards. The cost is one extra render
        // on mount for a reader who has chosen a theme, which is the cheap way.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setId(parsed.id)
        setMode(parsed.mode)
        applyTheme(parsed.id, parsed.mode)
      } catch {
        // Corrupt value — fall back to defaults.
      }
    }
  }, [])

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    const onPointerDown = (event: PointerEvent) => {
      const root = rootRef.current
      if (root && !root.contains(event.target as Node)) close()
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open, close])

  const active = OPTIONS.find((theme) => theme.id === id) ?? OPTIONS[0]

  return (
    <div ref={rootRef} className="relative flex items-center gap-2">
      <button
        type="button"
        ref={triggerRef}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`Colour theme: ${active.name}`}
        className="border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-ring flex h-11 items-center gap-2 rounded-full border pr-2.5 pl-3 text-sm font-medium transition-colors focus-visible:ring-[3px] focus-visible:outline-none"
      >
        <span
          aria-hidden
          style={swatchFor(active.id, mode) ? { background: swatchFor(active.id, mode) } : undefined}
          className="border-border/60 bg-primary size-3.5 rounded-full border"
        />
        <span className="hidden sm:inline">{active.name}</span>
        <ChevronDown
          aria-hidden
          className={
            open
              ? 'motion-safe:transition-transform size-3.5 rotate-180'
              : 'motion-safe:transition-transform size-3.5'
          }
        />
      </button>

      {open ? (
        /*
         * `top-full` is load-bearing, not decoration.
         *
         * Without an explicit `top` or `bottom`, an absolutely positioned box is
         * placed at its static position, and the static position of an abspos
         * child of a *flex* container is the flex alignment, not the flow
         * position. This wrapper is `flex items-center`, so the panel is centred
         * on a 44px line: a 274px panel lands its top at 44/2 - 274/2 = -115px,
         * which put `Default` and `Blush` above the top of the viewport where
         * they could not be clicked or read, and `mt-2` could not recover it
         * because the static position was already negative. `top-full` anchors
         * the panel to the wrapper's bottom edge instead, which is what a
         * disclosure under a trigger is supposed to do.
         */
        <div
          ref={panelRef}
          id={panelId}
          role="group"
          aria-label="Colour theme"
          className="border-border bg-popover absolute top-full right-0 z-30 mt-2 w-56 origin-top-right overflow-hidden rounded-xl border p-1 shadow-lg"
        >
          {OPTIONS.map((theme) => {
            const selected = theme.id === id
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => {
                  setId(theme.id)
                  applyTheme(theme.id, mode)
                  close()
                }}
                aria-pressed={selected}
                className={
                  selected
                    ? 'bg-accent text-accent-foreground flex min-h-11 w-full items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium transition-colors'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground flex min-h-11 w-full items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium transition-colors'
                }
              >
                <span
                  aria-hidden
                  style={swatchFor(theme.id, mode) ? { background: swatchFor(theme.id, mode) } : undefined}
                  className="border-border/60 bg-primary size-3.5 shrink-0 rounded-full border"
                />
                <span className="flex-1 text-left">{theme.name}</span>
                {selected ? <Check aria-hidden className="size-3.5 shrink-0" /> : null}
              </button>
            )
          })}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => {
          const next = mode === 'light' ? 'dark' : 'light'
          setMode(next)
          applyTheme(id, next)
        }}
        aria-label={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        aria-pressed={mode === 'dark'}
        className="border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-ring flex size-11 shrink-0 items-center justify-center rounded-full border transition-colors focus-visible:ring-[3px] focus-visible:outline-none"
      >
        {mode === 'light' ? <Moon aria-hidden className="size-4" /> : <Sun aria-hidden className="size-4" />}
      </button>
    </div>
  )
}
