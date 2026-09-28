/**
 * The optional pre-hydration theme script.
 *
 * A Server Component that renders one blocking script. Placed in `<head>`, it
 * applies the stored pack and mode before React hydrates, so the first paint is
 * already correct. It is safe to omit; a consumer who renders the attributes on
 * `<html>` needs no client runtime at all.
 *
 * It is the only writer of `THEME_ORIGIN_ATTRIBUTE`, and it writes that
 * attribute on every path it reaches, so the origin of the active theme is
 * always readable and never merely absent.
 *
 * The string below is a second implementation of `resolveTheme`, not a copy of
 * it that has been kept in step. A function cannot be shared with a string that
 * a minifier rewrites: a renamed identifier inside the script's own `try` throws
 * there, the catch swallows it, and the theme silently stops applying on every
 * page. So the string implements the rule and
 * `scripts/check-theme-resolution.mjs` runs BOTH over one table of stored
 * values, which is the only thing that can hold them together.
 *
 * Its price is a separate ceiling, `scripts/check-boot-budget.mjs`, because this
 * string runs before paint on every page and adding it to a table of component
 * bundle sizes would corrupt the unit that table exists to measure.
 */
import {
  DEFAULT_STORAGE_KEY,
  LEGACY_MODE_STORAGE_KEYS,
  MODES,
  PACKS,
  PACK_ATTRIBUTE,
  THEME_ORIGIN_ATTRIBUTE,
  type Mode,
  type PackId,
} from '../theming'

/**
 * The first half of the storage-migration clause: read one key this line no
 * longer writes.
 *
 * Exported because `check-boot-budget.mjs` prices the clause rather than
 * guessing at it. The emitted string contains this fragment verbatim, so its
 * byte count is the clause's cost and not an estimate of it.
 */
export const THEME_MIGRATION_READ = LEGACY_MODE_STORAGE_KEYS.map(
  (key) => `try{var g=localStorage.getItem(${JSON.stringify(key)});if(M.indexOf(g)>-1){L=g;LK=${JSON.stringify(key)};}}catch(e){}`,
).join('')

/**
 * The second half: the clause retires itself.
 *
 * The recovery is the only write this string performs, and it writes the
 * recovered pair into the key this line does write and removes the key it came
 * from, in one guarded step. That is the clause's expiry by rule rather than by
 * number: it fires only while a retired key still holds a mode, it fires at
 * most once per reader because its own write is what makes the second load find
 * nothing, and it is retired for good by deleting the last entry of
 * `LEGACY_MODE_STORAGE_KEYS`. There is no date and no version constant in it,
 * and the gate reports how many keys are still live so the number is visible
 * rather than remembered.
 */
export const THEME_MIGRATION_RETIRE =
  'if(G==="legacy"){try{localStorage.setItem(K,JSON.stringify({pack:pack,mode:m}));localStorage.removeItem(LK);}catch(e){}}'

export type PrismThemeScriptProps = {
  storageKey?: string
  defaultPack?: PackId
  defaultMode?: Mode
}

export function PrismThemeScript({
  storageKey = DEFAULT_STORAGE_KEY,
  defaultPack = 'default',
  defaultMode = 'light',
}: PrismThemeScriptProps) {
  const script =
    '(function(){try{' +
    'var r=document.documentElement,' +
    `P=${JSON.stringify(PACKS)},` +
    `M=${JSON.stringify(MODES)},` +
    `K=${JSON.stringify(storageKey)},` +
    `A=${JSON.stringify(PACK_ATTRIBUTE)},` +
    `O=${JSON.stringify(THEME_ORIGIN_ATTRIBUTE)},` +
    `DP=${JSON.stringify(defaultPack)},` +
    `DM=${JSON.stringify(defaultMode)},` +
    'L=null,LK=null,S=null,T=null;' +
    'try{var t=localStorage.getItem(K);if(t){T=t;S=JSON.parse(t);}}catch(e){}' +
    THEME_MIGRATION_READ +
    'var a=r.getAttribute(A),' +
    'DPK=P.indexOf(a)>-1?a:null,' +
    'DK=r.classList.contains("dark")?"dark":null,' +
    'U=S&&typeof S=="object"&&P.indexOf(S.pack)>-1&&M.indexOf(S.mode)>-1,' +
    'pack,m,G;' +
    'if(U){pack=S.pack;m=S.mode;G="stored";}' +
    'else if(T){pack=DPK||DP;m=DK||DM;G="unparsed";}' +
    'else if(L){pack=DP;m=L;G="legacy";}' +
    'else if(DPK||DK){pack=DPK||DP;m=DK||DM;G="document";}' +
    'else{pack=DP;m=DM;G="default";}' +
    THEME_MIGRATION_RETIRE +
    'if(pack!=="default"){r.setAttribute(A,pack);}else{r.removeAttribute(A);}' +
    'r.classList.toggle("dark",m==="dark");' +
    'r.setAttribute(O,G);' +
    '}catch(e){}})();'

  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
