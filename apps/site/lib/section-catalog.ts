// Section catalog (ticket 12 §1): the components/blocks/pages indexes are
// grouped by prism-ui's category table — the Prism group first, then antd's
// six canonical categories — single-sourced from the same `buildCatalog()` the
// generator and prism-llms read. URLs follow the flat taxonomy
// (`/<layer>/<item-id>`), which the loaders mirror by construction.

import { buildCatalog, type CatalogLayer, type PrismCategory } from '@nanisoft/prism-ui/wrapped-registry';
import { passThroughs } from '@nanisoft/prism-ui/generated/pass-throughs';

export interface CatalogItem {
  title: string;
  url: string;
}

export interface CatalogGroup {
  group: string;
  items: CatalogItem[];
}

const GROUP_LABELS: Readonly<Record<PrismCategory, string>> = {
  prism: 'Prism components',
  general: 'General',
  layout: 'Layout',
  navigation: 'Navigation',
  'data-entry': 'Data Entry',
  'data-display': 'Data Display',
  feedback: 'Feedback',
};

const GROUP_ORDER: readonly PrismCategory[] = [
  'prism',
  'general',
  'layout',
  'navigation',
  'data-entry',
  'data-display',
  'feedback',
];

/** The full catalog for a layer, grouped in canonical order, empty groups dropped. */
export function catalogGroups(layer: CatalogLayer): CatalogGroup[] {
  const entries = buildCatalog(passThroughs).filter((entry) => entry.layer === layer);
  return GROUP_ORDER.map((category) => ({
    group: GROUP_LABELS[category],
    items: entries
      .filter((entry) => entry.category === category)
      .map((entry) => ({ title: entry.name, url: `/${layer}/${entry.id}` })),
  })).filter((group) => group.items.length > 0);
}
