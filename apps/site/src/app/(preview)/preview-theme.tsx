import { themeAttributes, MODES, PACKS } from '@nanisoft/prism-ui/theming'

/**
 * The script a preview document runs before its first paint.
 *
 * **It is a string rather than a component, and the reason is the same one
 * `PrismThemeScript` gives.** The theme has to be on `<html>` before the browser
 * paints, which is before React hydrates and before this page's Server Component
 * tree exists, and the only thing that runs in that window is a blocking script in
 * `<head>`. A function cannot be shared with a string the way `resolveTheme`
 * cannot: the build minifies, a renamed identifier inside the `try` throws, the
 * `catch` swallows it, and the preview silently renders in the page's own theme
 * with no error anywhere. So the rule below is written once here and read by one
 * call site.
 *
 * **It is deliberately not the site's boot script.** `PrismThemeScript` resolves
 * from `localStorage`, which is exactly wrong for this document: the pack and mode
 * a reader chose for one Item's preview must not travel to the next Item they
 * open, must not be written to storage by a document that is not the site, and
 * must not be able to put the preview into a different theme than the toolbar
 * beside it says. The preview's theme comes from the address and from nowhere
 * else, which is why `readParams` is the module both halves read.
 */
const SCRIPT = [
  '(function(){try{',
  'var r=document.documentElement;',
  `var P=${JSON.stringify(PACKS)};`,
  `var M=${JSON.stringify(MODES)};`,
  'var q=new URLSearchParams(location.search);',
  'var p=q.get("pack");',
  'var m=q.get("mode");',
  /*
   * Each statement ends on its own rather than in one `var` chain, because a
   * comma here continues the declaration and `var P.indexOf(p)` is a syntax
   * error. The failure is silent in the worst way: the script is wrapped in a
   * `try` whose `catch` swallows the throw, so the exception never reaches the
   * console and the document renders in the default pair with nothing to say so.
   */
  'if(P.indexOf(p)<0){p=null;}',
  'if(M.indexOf(m)<0){m=null;}',
  'if(p===null||p==="default"){r.removeAttribute("data-pack");}else{r.setAttribute("data-pack",p);}',
  'if(m==="dark"){r.classList.add("dark");}else{r.classList.remove("dark");}',
  '}catch(e){}})();',
].join('')

/**
 * The attributes the preview route renders on `<html>`.
 *
 * **The query, not the store, because a Server Component cannot read one.** Under
 * `output: 'export'` the whole site is rendered at build time, so `searchParams` is
 * not available here and the browser's address does not exist yet. The server
 * therefore renders the same pair a reader with no query would get: this site's own
 * defaults. The script above corrects it before the first paint, which is the same
 * division of labour the site itself uses and for the same reason: the server
 * renders a correct baseline, the script honours a decision the server could not
 * see, and a reader with scripting off still sees a complete, correctly themed
 * preview.
 *
 * `suppressHydrationWarning` is not needed on this document and is not set: React
 * hydrates the tree below `<html>`, and the attribute the script writes is the same
 * one the server wrote whenever there is no query to honour.
 */
export function previewAttributes() {
  return themeAttributes({ pack: 'default', mode: 'light' })
}

/**
 * The blocking `<script>` element, placed in the preview document's `<head>`.
 *
 * Returned as an element rather than rendered inline so the caller controls where
 * it lands, and the caller is a `<head>` that has to import the stylesheet first
 * and the script second: the script's whole job is to be early, and a script that
 * renders before the stylesheet link would repaint a frame without its own CSS.
 */
export function PreviewThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />
}