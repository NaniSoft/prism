/**
 * Every Prism Page.
 *
 * A Page is a shipped, installable screen model composed of Blocks and
 * Components that receives application-owned navigation, content and data
 * (ticket 07). Each is also importable on its own subpath,
 * `@nanisoft/prism-ui/pages/<slug>`.
 *
 * `DocsShell` and `DocsNavEntry` keep the names the three consumer sites already
 * import, so the name follows those import lines rather than this file's shape.
 * A published name cannot be cheaply changed and there is no redirect lane for
 * item routes.
 */
export { MarketingPage } from './marketing-page'
export type { MarketingPageProps } from './marketing-page'
export { DashboardPage } from './dashboard-page'
export type { DashboardPageProps } from './dashboard-page'
export { SettingsPage } from './settings-page'
export type { SettingsPageProps, SettingsPageTab } from './settings-page'
export { AuthPage } from './auth-page'
export type { AuthPageProps, AuthPageAside } from './auth-page'
export { NotFoundPage } from './not-found-page'
export type { NotFoundPageProps, NotFoundLink } from './not-found-page'
export { BlogPostPage } from './blog-post-page'
export type { BlogPostPageProps, BlogPostTag, BlogPostNeighbour, BlogPostTrailLabels } from './blog-post-page'
export { DocsShell } from './docs-shell'
export type {
  DocsShellProps,
  DocsNavEntry,
  DocsNavPage,
  DocsNavGroup,
  DocsNavDivider,
  DocsPagerLabels,
} from './docs-shell'
