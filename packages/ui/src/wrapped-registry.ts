// Hand-maintained registry + catalog (ADR-0003).
//
// Two consumers read this file (ticket 12 + ticket 16): the site's stub-MDX /
// meta.json generation and prism-llms' catalog. It carries, for every prism-ui
// item: its antdBase (pass-through → the antd name; wrapped/prism-original →
// absent — a wrapper's base rides on its registry entry's antdName), the
// category table (antd's six doc categories + the Prism group), and the closed
// four-justification list that gates wrappers.

export type WrappedJustification = 'brand-behavior' | 'api-narrowing' | 'invariant' | 'upstream-gap';

export interface WrappedComponent {
  /** The antd surface this component wraps (e.g. 'Typography.Title'). */
  antdName: string;
  /** The prism-ui export name (e.g. 'DisplayTitle'). */
  exportName: string;
  /** Props removed from antd's API — non-empty only under api-narrowing. */
  removedProps?: string[];
  justification: WrappedJustification;
}

/** Expected v1 wrapper count is single digits (ADR-0003); the count is tracked. */
export const wrappedComponents = [
  {
    antdName: 'Typography.Title',
    exportName: 'DisplayTitle',
    removedProps: [],
    justification: 'brand-behavior',
  },
] as const satisfies readonly WrappedComponent[];

export const wrappedCount = wrappedComponents.length;

/** antd's six documentation categories (the @ant-design/cli knowledge base grouping). */
export const antdCategories = ['general', 'layout', 'navigation', 'data-entry', 'data-display', 'feedback'] as const;

/** Prism-original items (blocks, pages, wrapped components) — the docs' Prism group. */
export type PrismCategory = (typeof antdCategories)[number] | 'prism';

/**
 * Category per prism-ui item, keyed by export name. Pass-through components
 * inherit antd's own category; blocks and pages are the Prism group.
 */
export const componentCategories: Readonly<Record<string, PrismCategory>> = {
  // General
  Button: 'general',
  FloatButton: 'general',
  Typography: 'general',
  DisplayTitle: 'general',
  // Layout
  Col: 'layout',
  Divider: 'layout',
  Flex: 'layout',
  Grid: 'layout',
  Layout: 'layout',
  Masonry: 'layout',
  Row: 'layout',
  Space: 'layout',
  Splitter: 'layout',
  // Navigation
  Affix: 'navigation',
  Anchor: 'navigation',
  BackTop: 'navigation',
  Breadcrumb: 'navigation',
  Dropdown: 'navigation',
  Menu: 'navigation',
  Pagination: 'navigation',
  Steps: 'navigation',
  Tabs: 'navigation',
  // Data Entry
  AutoComplete: 'data-entry',
  Cascader: 'data-entry',
  Checkbox: 'data-entry',
  ColorPicker: 'data-entry',
  DatePicker: 'data-entry',
  Form: 'data-entry',
  Input: 'data-entry',
  InputNumber: 'data-entry',
  Mentions: 'data-entry',
  Radio: 'data-entry',
  Rate: 'data-entry',
  Select: 'data-entry',
  Slider: 'data-entry',
  Switch: 'data-entry',
  TimePicker: 'data-entry',
  Transfer: 'data-entry',
  TreeSelect: 'data-entry',
  Upload: 'data-entry',
  // Data Display
  Avatar: 'data-display',
  Badge: 'data-display',
  BorderBeam: 'data-display',
  Calendar: 'data-display',
  Card: 'data-display',
  Carousel: 'data-display',
  Collapse: 'data-display',
  Descriptions: 'data-display',
  Empty: 'data-display',
  Image: 'data-display',
  List: 'data-display',
  Listy: 'data-display',
  Popover: 'data-display',
  QRCode: 'data-display',
  Segmented: 'data-display',
  Statistic: 'data-display',
  Table: 'data-display',
  Tag: 'data-display',
  Timeline: 'data-display',
  Tooltip: 'data-display',
  Tour: 'data-display',
  Tree: 'data-display',
  // Feedback
  Alert: 'feedback',
  Drawer: 'feedback',
  Modal: 'feedback',
  Popconfirm: 'feedback',
  Progress: 'feedback',
  Result: 'feedback',
  Skeleton: 'feedback',
  Spin: 'feedback',
  Watermark: 'feedback',
  // Prism group — blocks and pages
  ComponentDemo: 'prism',
  PageHeader: 'prism',
  SiteHeader: 'prism',
  SiteFooter: 'prism',
  DocsShell: 'prism',
  BlogLayout: 'prism',
};

export type CatalogLayer = 'components' | 'blocks' | 'pages';

/** A generated pass-through item, as emitted by scripts/generateAntdExports.mjs. */
export interface PassThroughItem {
  /** The antd export name — also the prism-ui export name (pass-throughs keep it). */
  name: string;
  /** kebab-case id used in the ./components/* subpath. */
  id: string;
}

export interface CatalogEntry {
  /** Export name from prism-ui. */
  name: string;
  /** kebab-case id used in the layer subpath. */
  id: string;
  layer: CatalogLayer;
  /** The antd name for pass-throughs; absent for wrapped and prism-original items (a wrapper's base is its registry entry's antdName). */
  antdBase?: string;
  category: PrismCategory;
  /** Present iff the item is a hand-written wrapper. */
  wrapped?: WrappedComponent;
}

const BLOCKS = [
  { name: 'ComponentDemo', id: 'component-demo' },
  { name: 'PageHeader', id: 'page-header' },
  { name: 'SiteHeader', id: 'site-header' },
  { name: 'SiteFooter', id: 'site-footer' },
] as const;

const PAGES = [
  { name: 'DocsShell', id: 'docs-shell' },
  { name: 'BlogLayout', id: 'blog-layout' },
] as const;

/**
 * Build the full prism-ui catalog: generated pass-throughs + wrapped
 * components + blocks + pages, each with its antdBase and category. The
 * category lookups throw on a missing entry so an uncategorized component
 * fails the build (the docs coverage gate).
 */
export function buildCatalog(passThroughs: readonly PassThroughItem[]): CatalogEntry[] {
  const entries: CatalogEntry[] = [];

  for (const item of passThroughs) {
    const category = componentCategories[item.name];
    if (!category) throw new Error(`wrapped-registry: pass-through "${item.name}" has no category entry`);
    entries.push({ name: item.name, id: item.id, layer: 'components', antdBase: item.name, category });
  }

  for (const wrapper of wrappedComponents) {
    const category = componentCategories[wrapper.exportName];
    if (!category) throw new Error(`wrapped-registry: wrapper "${wrapper.exportName}" has no category entry`);
    // Pass-throughs keep antd's name; wrappers are prism-ui's own — antdBase
    // stays absent, the base lives on wrapped.antdName.
    entries.push({ name: wrapper.exportName, id: kebab(wrapper.exportName), layer: 'components', category, wrapped: wrapper });
  }

  for (const block of BLOCKS) {
    const category = componentCategories[block.name];
    if (!category) throw new Error(`wrapped-registry: block "${block.name}" has no category entry`);
    entries.push({ ...block, layer: 'blocks', category });
  }
  for (const page of PAGES) {
    const category = componentCategories[page.name];
    if (!category) throw new Error(`wrapped-registry: page "${page.name}" has no category entry`);
    entries.push({ ...page, layer: 'pages', category });
  }

  return entries;
}

function kebab(name: string): string {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}
