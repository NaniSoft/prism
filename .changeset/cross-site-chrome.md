---
'@nanisoft/prism-ui': minor
---

Cross-site chrome (ADR-0006): the shared site shell as npm-delivered blocks. `SiteHeader` (product switcher, theme-mode toggle, mobile drawer built in; identity via the `site` registry prop), `SiteFooter` (registry-driven product grid — the platform story rendered — plus site-declared columns, social links, and a `legal` override), the five-entry `prismProducts` registry with pack-dot colours, `PrismThemeModeProvider`/`usePrismThemeMode` (mode is the chrome's one context), and the flash-free mode mechanics: `prismThemeBootScript()`, the shared `PRISM_THEME_MODE_STORAGE_KEY`, and the build-time bake helpers on the new `./theming` subpath.
