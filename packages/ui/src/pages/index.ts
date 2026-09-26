/**
 * Every Prism Page.
 *
 * A Page is a shipped, installable screen model composed of Blocks and
 * Components that receives application-owned navigation, content and data
 * (ticket 07). The v1 roster ships four Pages. Each is also importable on its
 * own subpath, `@nanisoft/prism-ui/pages/<slug>`.
 */
export { MarketingPage } from './marketing-page'
export type { MarketingPageProps } from './marketing-page'
export { DashboardPage } from './dashboard-page'
export type { DashboardPageProps } from './dashboard-page'
export { SettingsPage } from './settings-page'
export type { SettingsPageProps, SettingsPageTab } from './settings-page'
export { AuthPage } from './auth-page'
export type { AuthPageProps, AuthPageAside } from './auth-page'
