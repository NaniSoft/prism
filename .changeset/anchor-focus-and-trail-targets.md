---
'@nanisoft/prism-ui': patch
---

Raise `Item` and `BlogPostPage` targets, make figures keyboard-scrollable, label `DocsShell` rails

Every anchor and `[tabindex="0"]` region now inherits a 3px `var(--ring)` focus-visible outline from `@layer base` when no component utility replaces it, `BlogPostPage` trail links carry a 44px minimum height (`min-h-11`) and explicit 3px focus ring, `SiteFooter` links carry explicit 3px focus rings, `Item` links carry a 24px target floor (`flex min-h-6 items-center`) with two-line descriptions (`line-clamp-2`), all `Diagram` and `PulseGraph` horizontal scroll containers carry `tabIndex={0}`, with accessible region labels on non-decorative drawings, `DocsShell` names its two `<aside>` regions with `navLabel` and `tocLabel`, and `.site-footer-tagline` resolves to `var(--brand-ink)`.
