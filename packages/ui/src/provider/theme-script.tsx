/**
 * The optional pre-hydration theme script.
 *
 * A Server Component that renders one blocking script. Placed in `<head>`, it
 * applies the stored pack and mode before React hydrates, so the first paint is
 * already correct. Precedence matches `PrismProvider`: stored value, then the
 * server-rendered attribute, then the defaults. It is safe to omit; a consumer
 * who renders the attributes on `<html>` needs no client runtime at all.
 */
import { DEFAULT_STORAGE_KEY, MODES, PACKS, type Mode, type PackId } from '../theming'

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
    'var root=document.documentElement;' +
    `var packs=${JSON.stringify(PACKS)};` +
    `var modes=${JSON.stringify(MODES)};` +
    'var stored=null;' +
    `try{stored=JSON.parse(localStorage.getItem(${JSON.stringify(storageKey)})||"null");}catch(ignored){}` +
    'var pack=stored&&packs.indexOf(stored.pack)>-1?stored.pack:(root.getAttribute("data-pack")||' +
    `${JSON.stringify(defaultPack)});` +
    'var mode=stored&&modes.indexOf(stored.mode)>-1?stored.mode:(root.classList.contains("dark")?"dark":' +
    `${JSON.stringify(defaultMode)});` +
    `if(packs.indexOf(pack)<0){pack=${JSON.stringify(defaultPack)};}` +
    'if(pack&&pack!=="default"){root.setAttribute("data-pack",pack);}else{root.removeAttribute("data-pack");}' +
    'root.classList.toggle("dark",mode==="dark");' +
    '}catch(ignored){}})();'

  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
