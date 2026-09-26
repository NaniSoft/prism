'use client'

/**
 * The optional client runtime for programmatic theme switching.
 *
 * The provider is strictly additive: a consumer who puts `data-pack` and
 * `.dark` on `<html>` never needs it, and a consumer who wants no client
 * JavaScript omits it. It carries the pack and mode through context and writes
 * the same two markup attributes the declarative form uses. There is no
 * override, merge, token, className or style prop: the provider's only outputs
 * are the document-element attributes and context (ticket 07).
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import {
  DEFAULT_STORAGE_KEY,
  MODES,
  PACKS,
  parseStoredTheme,
  themeAttributes,
  type Mode,
  type PackId,
} from '../theming'

export type PrismTheme = {
  pack: PackId
  mode: Mode
  setPack: (pack: PackId) => void
  setMode: (mode: Mode) => void
  toggleMode: () => void
}

const PrismThemeContext = createContext<PrismTheme | null>(null)

export type PrismProviderProps = {
  /** Pack used when nothing is stored and no pack attribute is present. */
  defaultPack?: PackId
  /** Mode used in the same fallback. */
  defaultMode?: Mode
  /** localStorage key for the persisted `{ pack, mode }` object. */
  storageKey?: string
  children?: ReactNode
}

function applyDocumentAttributes(pack: PackId, mode: Mode) {
  const root = document.documentElement
  const { 'data-pack': packAttribute, className } = themeAttributes({ pack, mode })

  if (packAttribute) root.setAttribute('data-pack', packAttribute)
  else root.removeAttribute('data-pack')

  if (className) root.classList.add('dark')
  else root.classList.remove('dark')
}

function packFromDocument(fallback: PackId): PackId {
  const attribute = document.documentElement.getAttribute('data-pack')
  return attribute && (PACKS as readonly string[]).includes(attribute)
    ? (attribute as PackId)
    : fallback
}

function modeFromDocument(fallback: Mode): Mode {
  return document.documentElement.classList.contains('dark') ? 'dark' : fallback
}

export function PrismProvider({
  defaultPack = 'default',
  defaultMode = 'light',
  storageKey = DEFAULT_STORAGE_KEY,
  children,
}: PrismProviderProps) {
  const [pack, setPackState] = useState<PackId>(defaultPack)
  const [mode, setModeState] = useState<Mode>(defaultMode)
  const [resolved, setResolved] = useState(false)

  /*
   * Resolution order on mount: stored value, then the server-rendered attribute,
   * then the default. A server-rendered pack therefore survives hydration
   * instead of flashing to the default.
   */
  useEffect(() => {
    const stored = parseStoredTheme(localStorage.getItem(storageKey))
    const next = stored ?? { pack: packFromDocument(defaultPack), mode: modeFromDocument(defaultMode) }
    setPackState(next.pack)
    setModeState(next.mode)
    setResolved(true)
  }, [storageKey, defaultPack, defaultMode])

  /*
   * Persist and apply only after resolution, so the first client commit never
   * writes the defaults over a stored or server-rendered choice.
   */
  useEffect(() => {
    if (!resolved) return
    applyDocumentAttributes(pack, mode)
    try {
      localStorage.setItem(storageKey, JSON.stringify({ pack, mode }))
    } catch {
      // A blocked or full localStorage must not break theme switching. The
      // attributes are already applied, so the visible behaviour is unchanged.
    }
  }, [resolved, pack, mode, storageKey])

  const setPack = useCallback((next: PackId) => setPackState(next), [])
  const setMode = useCallback((next: Mode) => setModeState(next), [])
  const toggleMode = useCallback(
    () => setModeState((current) => (current === 'dark' ? MODES[0] : MODES[1])),
    [],
  )

  const value = useMemo<PrismTheme>(
    () => ({ pack, mode, setPack, setMode, toggleMode }),
    [pack, mode, setPack, setMode, toggleMode],
  )

  return <PrismThemeContext.Provider value={value}>{children}</PrismThemeContext.Provider>
}

/**
 * Reads and mutates the active pack and mode.
 *
 * Throws outside a `PrismProvider`. The provider is optional, so a consumer
 * that does not mount it simply does not call this hook.
 */
export function usePrismTheme(): PrismTheme {
  const value = useContext(PrismThemeContext)
  if (!value) {
    throw new Error('usePrismTheme must be used within a PrismProvider')
  }
  return value
}
