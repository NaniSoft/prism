---
Status: accepted
---

# Cross-site chrome: the shared site shell as prism-ui blocks

NaniSoft's five web properties (www.nanisoft.com plus the nexus / atlas / alphalens product subdomains — prism.nanisoft.com already live) wear one shared shell shipped from `@nanisoft/prism-ui`: a **SiteHeader** (with product switcher and theme-mode toggle), a **SiteFooter** (with a registry-driven product grid), a **five-entry product registry** both render from, and the **flash-free theme-mode mechanics** (provider + boot-script string + build-time bake helper). Chrome is npm-delivered and never copied into apps, per the standing taxonomy law.

Decided 2026-09-20 on the nanisoft-web wayfinder map, ticket 02 (grilling); implementation is that map's ticket 03. The full question-by-question rationale lives in the ticket; this ADR is the binding summary.

## The inventory (binding)

Exactly four pieces are chrome; everything else on a page is app-local (heroes, landing sections, page bodies, DocsShell/BlogLayout wiring — the chrome slots into DocsShell's existing `header`/`footer` props):

1. **`blocks/site-header/`** — `<SiteHeader site nav cta? sticky>`. Site identity is a registry id passed as a **plain prop** (not context); nav entries are `{ label, url }` routed through `usePrismLink`; optional right-pinned CTA; sticky by default with a hairline border. Built in and not prop-configurable: the product switcher (registry-driven, pack-colour dots, current site marked), the theme-mode toggle, and the mobile drawer collapse. One header everywhere on a site — landing and docs pages alike; no variant prop.
2. **`blocks/site-footer/`** — `<SiteFooter site columns social? legal?>`. The product grid is built in and registry-driven (www → Nexus → Atlas → AlphaLens → Prism, each with name, tagline, pack dot, current site marked) — it is the platform story rendered, and sites can neither opt out nor reorder it. Link columns are site-declared; social links take app-supplied icons from the antd icons re-export; `legal?: ReactNode` overrides the default "© NaniSoft" line (the published legal-entity string is deliberately still open; the override is the reservation).
3. **`src/products/`** — the registry: a closed five-entry list of `{ id, kind: 'company' | 'product', name, tagline, url, pack }`. `www` rides in it as the company root (every product site's switcher needs the way back). "Future Products" is **excluded** — it is a www landing node, not a site. Subdomain URLs are hardcoded constants.
4. **State + mechanics** — mode is the one *stateful* thing in the chrome, so it takes the one context: `PrismThemeModeProvider` / `usePrismThemeMode` (persisted to a shared exported storage key, swapping the `prism-<pack>-<mode>` html class — the same class the boot script set pre-paint, so toggle and boot cannot disagree). `prismThemeBootScript({ pack, defaultMode })` returns the inline boot-script string for the app's root layout; a build-time bake helper produces each site's two pre-baked variable rulesets from `createPrismTheme()`. The line from the identity decision: **static data travels as props; runtime state travels as context.**

## Considered options

- **Pack-switching chrome** (like the prism site's pack × mode gallery switcher): declined — each site *is* one pack (the pack map is locked); www's five-pack layering is a design-layer composition, not a runtime switch. The chrome flips mode only.
- **A new `/chrome` layer beside `/components|blocks|pages`**: declined — SiteHeader/SiteFooter are exactly what "blocks" means in ADR-0003, and a new layer would ripple through the closed taxonomy, `buildCatalog()`, codegen, and prism-llms for zero gain. The blocks placement makes those pipelines cover the chrome for free.
- **Site identity via context**: declined — identity is static and known at build time; props keep every chrome block renderable in isolation.
- **Caret dependency ranges** for the consuming site repos: declined — with carets, sites rebuilt a week apart silently wear different chrome; the chrome is the one thing that must never drift. The four site repos pin `@nanisoft/prism-ui` and `@nanisoft/prism-tokens` **exactly and in lockstep**, and upgrades happen only via a coordinated four-repo sweep (the runbook itself is written down by nanisoft-web ticket 15's consistency contract).
- **Retrofitting prism.nanisoft.com onto the chrome in the same release**: declined — its bespoke header hosts the pack × mode switcher the chrome deliberately lacks, so adoption would amputate a feature or force a special case. Ticket 03 is library-only; whether the prism site adopts later stays fog on the nanisoft-web map until the four sites have proven the chrome in production.

## Consequences

- prism-ui grows `blocks/site-header`, `blocks/site-footer`, `src/products`, `PrismThemeModeProvider` (in `src/provider/`), and a `src/theming/` module (boot-script string + bake helper); one minor changeset. Catalog, stub docs, and prism-llms pick the new blocks up automatically.
- The four new site repos depend on published prism-ui for their entire shell; a chrome fix is one release + one sweep, never five patches.
- The flash-free recipe (rulesets + boot script + storage key) is now library-owned; the prism site's own app-local implementation remains as-is until any adoption decision.
- prism.nanisoft.com is untouched by ticket 03.
