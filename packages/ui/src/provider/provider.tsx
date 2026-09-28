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
 *
 * It resolves through `resolveTheme`, the one rule the boot script also
 * implements, and it never writes `THEME_ORIGIN_ATTRIBUTE`: the script is that
 * attribute's only writer, and two writers would turn a record of the origin
 * into a race.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

import {
  DEFAULT_STORAGE_KEY,
  PACK_ATTRIBUTE,
  readLegacyMode,
  resolveTheme,
  themeAttributes,
  type Mode,
  type PackId,
  type ThemeResolution,
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

  if (packAttribute) root.setAttribute(PACK_ATTRIBUTE, packAttribute)
  else root.removeAttribute(PACK_ATTRIBUTE)

  if (className) root.classList.add('dark')
  else root.classList.remove('dark')
}

/** One guarded read. A blocked or full store must not break the page. */
function read(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

/** One guarded write. The attributes are already applied when this fails. */
function persist(key: string, pack: PackId, mode: Mode) {
  try {
    localStorage.setItem(key, JSON.stringify({ pack, mode }))
  } catch {
    // A blocked or full localStorage must not break theme switching. The
    // attributes are already applied, so the visible behaviour is unchanged.
  }
}

function retire(key: string) {
  try {
    localStorage.removeItem(key)
  } catch {
    // Nothing to do: a key that cannot be removed is read again next load,
    // recovers the same decision, and writes the same pair.
  }
}

export function PrismProvider({
  defaultPack = 'default',
  defaultMode = 'light',
  storageKey = DEFAULT_STORAGE_KEY,
  children,
}: PrismProviderProps) {
  /*
   * The resolution, and whether a decision has been made. Two pieces of state
   * for two different questions, which is why the old `resolved` flag was not
   * enough on its own:
   *
   *   - `theme` is null until the store has been read. It gates APPLY, because
   *     applying the default over a server-rendered pack before resolution is
   *     the flash the resolution order exists to prevent. It carries the
   *     origin, so the recovery below can read it without a second lookup.
   *   - `decided` is a ref, not state, because it must be readable by the write
   *     effect without causing a render, and settable synchronously by a caller
   *     whose state update has not been committed yet. It gates WRITE.
   *
   * A ref also cannot be re-rendered into an extra effect pass, which is what
   * would have made the write fire once for the flag and once for the value.
   */
  const [theme, setTheme] = useState<ThemeResolution | null>(null)
  const decided = useRef(false)

  /*
   * Resolution on mount, through the one shared rule: the stored value, then a
   * key this line no longer writes, then what the server rendered, then the
   * defaults. A server-rendered pack therefore survives hydration.
   */
  useEffect(() => {
    const recovered = readLegacyMode(read)
    const next = resolveTheme({
      stored: read(storageKey),
      legacy: recovered?.mode ?? null,
      documentPack: document.documentElement.getAttribute(PACK_ATTRIBUTE),
      documentDark: document.documentElement.classList.contains('dark'),
      defaultPack,
      defaultMode,
    })

    if (next.origin === 'legacy' && recovered) {
      /*
       * The recovery write. A decision taken from a key this line no longer
       * writes is put in the key it does write, and the old key is retired in
       * the same breath, which is what makes the clause self-disabling: the
       * next load finds nothing to recover, so a reader is migrated once and
       * the population the clause can still reach only ever shrinks.
       */
      persist(storageKey, next.pack, next.mode)
      retire(recovered.key)
    }

    // A caller that decided in a layout effect before this ran keeps its value.
    if (!decided.current) setTheme(next)
  }, [storageKey, defaultPack, defaultMode])

  /*
   * Apply always, once there is a resolution; persist only on a decision.
   *
   * The first resolution from the document or the defaults writes nothing, so a
   * visitor who never touched the toggle ends the load with an empty store and
   * a site that changes its default reaches everyone who has not chosen.
   */
  useEffect(() => {
    if (!theme) return
    applyDocumentAttributes(theme.pack, theme.mode)
    if (decided.current) persist(storageKey, theme.pack, theme.mode)
  }, [theme, storageKey])

  const setPack = useCallback(
    (next: PackId) => {
      decided.current = true
      setTheme((current) => ({
        pack: next,
        mode: current?.mode ?? defaultMode,
        origin: 'stored',
      }))
    },
    [defaultMode],
  )

  const setMode = useCallback(
    (next: Mode) => {
      decided.current = true
      setTheme((current) => ({
        pack: current?.pack ?? defaultPack,
        mode: next,
        origin: 'stored',
      }))
    },
    [defaultPack],
  )

  /*
   * The pair is a closed union of two members, so the other one is the other
   * member. Spelling it out costs nothing and does not hide the coupling behind
   * an index into a list this file does not otherwise need.
   *
   * The three setters all fall back to the consumer's own default rather than
   * to the neutral one, so a decision taken before the store has been read
   * pairs the chosen axis with the site's default and not with a guess.
   */
  const toggleMode = useCallback(() => {
    decided.current = true
    setTheme((current) => ({
      pack: current?.pack ?? defaultPack,
      mode: current?.mode === 'dark' ? 'light' : 'dark',
      origin: 'stored',
    }))
  }, [defaultPack])

  const value = useMemo<PrismTheme>(
    () => ({
      pack: theme?.pack ?? defaultPack,
      mode: theme?.mode ?? defaultMode,
      setPack,
      setMode,
      toggleMode,
    }),
    [theme, defaultPack, defaultMode, setPack, setMode, toggleMode],
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
