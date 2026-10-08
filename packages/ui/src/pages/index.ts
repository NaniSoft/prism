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


/*
 * The document and research workspace. A Page authored beside `DocsShell`, so
 * neither of that Page's two rules is relaxed: a section stays a label and not a
 * control, and a group with no index stays a label and not a route. It composes
 * settled Items and mints no document, version, comment or source type. */
export { DocumentPage } from './document-page'
export type {
  DocumentPageProps,
  DocumentPageDocument,
  DocumentPageRegion,
} from './document-page'


/*
 * the ten screens the 2026-09 expansion added.
 * Derived by the maintainer rather than authored: each entry is read out of the Item own
 * index module, so an Item and its barrel line cannot come apart. */
export { AboutPage } from './about-page'
export { CareersPage } from './careers-page'
export { ChangelogPage } from './changelog-page'
export { ContactPage } from './contact-page'
export { ErrorPage } from './error-page'
export { LegalPage } from './legal-page'
export { OnboardingPage } from './onboarding-page'
export { PricingPage } from './pricing-page'
export { SearchPage } from './search-page'
export { StatusPage } from './status-page'
