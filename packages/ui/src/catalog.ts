// One checked catalog feeds package exports, docs stubs, site navigation, the
// LLM corpus, and MCP. There are no generated pass-throughs.

export type CatalogLayer = 'components' | 'blocks' | 'pages';
export type CatalogCategory = 'actions' | 'forms' | 'navigation' | 'overlays' | 'data-display' | 'feedback' | 'foundations' | 'layout' | 'composition';
export type CatalogPrimitive = 'base-ui' | 'native';

export interface CatalogEntry {
  readonly name: string;
  readonly id: string;
  readonly layer: CatalogLayer;
  readonly category: CatalogCategory;
  readonly description: string;
  readonly primitive: CatalogPrimitive;
  readonly status: 'stable';
}

const component = (
  name: string,
  category: CatalogCategory,
  description: string,
  primitive: CatalogPrimitive = 'base-ui',
): CatalogEntry => ({
  name,
  id: name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase(),
  layer: 'components',
  category,
  description,
  primitive,
  status: 'stable',
});

const components: readonly CatalogEntry[] = [
  component('Accordion', 'navigation', 'A keyboard-navigable stack of expandable sections.'),
  component('Alert', 'feedback', 'A compact status message with an accessible live region.'),
  component('Avatar', 'data-display', 'A profile image with a deterministic initials fallback.'),
  component('Badge', 'data-display', 'A small, non-interactive status or metadata label.'),
  component('Breadcrumb', 'navigation', 'A hierarchical path showing where the current page sits.'),
  component('Button', 'actions', 'The primary action control for commands, links, and loading states.'),
  component('Card', 'data-display', 'A hairline-elevated surface for one related body of content.'),
  component('Checkbox', 'forms', 'An accessible binary control with label and description slots.', 'base-ui'),
  component('Dialog', 'overlays', 'A focus-trapped modal task surface with portal and focus return.'),
  component('Drawer', 'overlays', 'A gesture-aware edge or bottom surface for focused mobile work.'),
  component('Empty', 'feedback', 'A purposeful no-results state with a clear next action.'),
  component('Field', 'forms', 'Accessible label, description, validity, and error coordination.'),
  component('Icon', 'foundations', 'Prism-owned SVG icons drawn on one consistent 24px stroke grid.', 'native'),
  component('Input', 'forms', 'A text input integrated with Prism fields and validation.'),
  component('Kbd', 'foundations', 'A keyboard-key annotation.', 'native'),
  component('Pagination', 'navigation', 'A compact, labelled pager for bounded collections.', 'native'),
  component('Popover', 'overlays', 'An anchored surface for related controls or contextual detail.'),
  component('Progress', 'feedback', 'A determinate or indeterminate progress indicator with accessible value text.'),
  component('RadioGroup', 'forms', 'A labelled group for one choice from a small visible set.'),
  component('Select', 'forms', 'A type-safe popup select for predefined values.'),
  component('Separator', 'layout', 'A semantic or decorative rule between content regions.', 'native'),
  component('Skeleton', 'feedback', 'A loading placeholder that preserves the expected content shape.', 'native'),
  component('Slider', 'forms', 'A keyboard-operable numeric slider with a visible value option.'),
  component('Switch', 'forms', 'An immediate on/off setting control.'),
  component('Table', 'data-display', 'A scroll-safe semantic table with typed columns and empty state.', 'native'),
  component('Tabs', 'navigation', 'Keyboard-navigated panels for peer views of the same context.'),
  component('Textarea', 'forms', 'A multi-line native text control with Prism sizing and field integration.', 'native'),
  component('Tooltip', 'overlays', 'A short accessible label or supplementary hint for a focused control.'),
  component('Typography', 'foundations', 'Prism text, heading, and refracted display primitives.', 'native'),
] as const;

const blocks: readonly CatalogEntry[] = [
  { name: 'ApplicationShell', id: 'application-shell', layer: 'blocks', category: 'composition', description: 'Sidebar, top bar, and content frame for an application surface.', primitive: 'native', status: 'stable' },
  { name: 'AuthForm', id: 'auth-form', layer: 'blocks', category: 'composition', description: 'A focused sign-in or registration form with provider-ready actions.', primitive: 'native', status: 'stable' },
  { name: 'ComponentDemo', id: 'component-demo', layer: 'blocks', category: 'composition', description: 'A live example paired with its verbatim source.', primitive: 'native', status: 'stable' },
  { name: 'DataTable', id: 'data-table', layer: 'blocks', category: 'composition', description: 'A typed table shell with toolbar, bulk actions, and pagination.', primitive: 'native', status: 'stable' },
  { name: 'PageHeader', id: 'page-header', layer: 'blocks', category: 'composition', description: 'A page title, context, breadcrumb, and action region.', primitive: 'native', status: 'stable' },
  { name: 'SettingsPanel', id: 'settings-panel', layer: 'blocks', category: 'composition', description: 'A sectioned settings form with sticky save state.', primitive: 'native', status: 'stable' },
  { name: 'SiteFooter', id: 'site-footer', layer: 'blocks', category: 'composition', description: 'Prism product navigation, consumer links, and legal line.', primitive: 'native', status: 'stable' },
  { name: 'SiteHeader', id: 'site-header', layer: 'blocks', category: 'composition', description: 'A responsive product header with theme controls and mobile navigation.', primitive: 'base-ui', status: 'stable' },
  { name: 'StatCard', id: 'stat-card', layer: 'blocks', category: 'composition', description: 'A labelled business signal with context and directional change.', primitive: 'native', status: 'stable' },
] as const;

const pages: readonly CatalogEntry[] = [
  { name: 'AuthPage', id: 'auth-page', layer: 'pages', category: 'composition', description: 'A complete authentication page composed from AuthForm and page chrome.', primitive: 'native', status: 'stable' },
  { name: 'BlogLayout', id: 'blog-layout', layer: 'pages', category: 'composition', description: 'A readable article page with metadata and related navigation.', primitive: 'native', status: 'stable' },
  { name: 'DashboardPage', id: 'dashboard-page', layer: 'pages', category: 'composition', description: 'An application dashboard frame with navigation, metrics, and recent work.', primitive: 'native', status: 'stable' },
  { name: 'DocsShell', id: 'docs-shell', layer: 'pages', category: 'composition', description: 'A documentation frame with section navigation, article, and table of contents.', primitive: 'native', status: 'stable' },
  { name: 'SettingsPage', id: 'settings-page', layer: 'pages', category: 'composition', description: 'A complete settings page with section navigation and form actions.', primitive: 'native', status: 'stable' },
] as const;

const catalog: readonly CatalogEntry[] = Object.freeze([...components, ...blocks, ...pages]);

export const componentCategories = Object.freeze([
  'actions', 'forms', 'navigation', 'overlays', 'data-display', 'feedback', 'foundations', 'layout',
] as const);

export function buildCatalog(): readonly CatalogEntry[] {
  return catalog;
}

export function catalogEntry(name: string): CatalogEntry | undefined {
  return catalog.find((entry) => entry.name === name);
}
